'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
const {Pool}=require('pg');
const BASE='http://127.0.0.1:8899';
const ROOT=path.resolve(__dirname,'..');
const db=new Pool({host:'127.0.0.1',port:5432,user:'postgres',
 password:'ci_only_password',database:'pit_v5_d1b_test'});
const errors=[],urls=[];
async function open(browser,token,inviteId){
 const context=await browser.newContext({viewport:{width:1260,height:890}});
 if(token)await context.addInitScript(({token,inviteId})=>{
  window.__PIT_V5_D1B_STAGING={
   enabled:true,
   endpoint:'http://127.0.0.1:8899/api/duel-match-v2-lab',
   inviteId,
   tokenProvider:()=>token
  };
 },{token,inviteId});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin===BASE)return route.continue();
  if(url.hostname==='cdn.jsdelivr.net'&&url.pathname.startsWith('/npm/three@0.186.1/')){
   const rel=url.pathname.substring('/npm/three@0.186.1/'.length);
   const file=path.resolve(ROOT,'node_modules/three',rel);
   if(file.startsWith(path.resolve(ROOT,'node_modules/three')+path.sep)){
    try{return route.fulfill({
     body:await fs.readFile(file),contentType:'text/javascript; charset=utf-8',
     headers:{'Access-Control-Allow-Origin':'*','Cross-Origin-Resource-Policy':'cross-origin'}
    })}catch{}
   }
  }
  return route.abort(); // GLB remote denied; verify gracefully falling back.
 });
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 page.on('request',r=>urls.push(r.url()));
 await page.goto(BASE+'/v5/duel-replay-d1b.html'+(token?'':'?demo=1'),
  {waitUntil:'domcontentloaded',timeout:40000});
 await page.waitForFunction(()=>window.PIT_V5_D1B_VIEW?.snapshot.ready,
  null,{timeout:24000}).catch(async()=>{
   throw Error('D1b spectator did not load. Browser errors: '+errors.join(' | ')+
    '; notice: '+await page.locator('#safetyNotice').textContent()+
    '; module requests: '+urls.filter(u=>u.includes('three@')).slice(-4).join(','));
  });
 return {page,context};
}
const snap=page=>page.evaluate(()=>window.PIT_V5_D1B_VIEW.snapshot);
(async()=>{
 const browser=await chromium.launch({headless:true,
  args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const contexts=[];
 try{
  const fixture=await(await fetch(BASE+'/__fixture')).json();
  assert(/^[0-9a-f-]{36}$/i.test(fixture.inviteId));
  const one=await open(browser,'a'.repeat(64),fixture.inviteId);contexts.push(one.context);
  const two=await open(browser,'b'.repeat(64),fixture.inviteId);contexts.push(two.context);
  const A=one.page,B=two.page;
  const a=await snap(A),b=await snap(B);
  assert(a.replaySha256&&a.replaySha256===b.replaySha256,
   'Both clients must load exact same immutable server checksum');
  assert.equal(a.frameCount,b.frameCount);
  assert(a.frameCount>20&&a.eventCount>5);
  assert.equal(a.demo,false);
  await A.waitForTimeout(700);
  const nowA=await snap(A),nowB=await snap(B);
  assert(Math.abs(nowA.playback-nowB.playback)<2.0,
   'Both spectator clocks must remain aligned after server-time correction');
  await A.locator('#followLeft').click();
  assert.equal((await snap(A)).mode,'left');
  await B.locator('#followRight').click();
  assert.equal((await snap(B)).mode,'right');
  await A.locator('#director').click();
  assert.equal((await snap(A)).mode,'director');
  assert.equal((await snap(B)).mode,'right','Camera preferences are local, result shared');
  await A.locator('#enableAudio').click();
  assert.match(await A.locator('#enableAudio').textContent(),/Som espacial ativo|Som indisponível/);
  await A.reload({waitUntil:'domcontentloaded'});
  await A.waitForFunction(()=>window.PIT_V5_D1B_VIEW?.snapshot.ready,{timeout:60000});
  assert.equal((await snap(A)).replaySha256,b.replaySha256,
   'Reconnection never re-simulates the winner');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM pit_duel_matches')).rows[0].n,1);
  // Expire the REAL server clock in disposable PostgreSQL, and reload both.
  await db.query(
   "UPDATE pit_duel_matches SET started_at=NOW()-INTERVAL '180 seconds', "+
   "ends_at=NOW()-INTERVAL '2 seconds' WHERE invite_id=$1",[fixture.inviteId]);
  await A.locator('#reconnect').click();
  await B.locator('#reconnect').click();
  // A duel may legitimately finish in under 30 simulated seconds.
  // Assert the *server-recorded* end of replay instead of an arbitrary time.
  await A.waitForFunction(()=>{
   const s=window.PIT_V5_D1B_VIEW?.snapshot;
   return s?.ready&&s.replayDuration>0&&s.playback>=s.replayDuration-.1;
  },null,{timeout:20000});
  await B.waitForFunction(()=>{
   const s=window.PIT_V5_D1B_VIEW?.snapshot;
   return s?.ready&&s.replayDuration>0&&s.playback>=s.replayDuration-.1;
  },null,{timeout:20000});
  assert.equal(await A.locator('#victory').isVisible(),true);
  assert.equal(await B.locator('#victory').isVisible(),true);
  const winA=await A.locator('#winnerName').textContent();
  const winB=await B.locator('#winnerName').textContent();
  assert.equal(winA,winB,'Server-chosen champion must match on both browsers');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM pit_duel_slots')).rows[0].n,0,
   'Finished duel releases both participant slots');

  // Public standalone preview without any network token, not a live match.
  const showcase=await open(browser,null,null);contexts.push(showcase.context);
  assert.equal((await snap(showcase.page)).demo,true);
  assert.equal((await snap(showcase.page)).apiCalls,0);
  assert((await snap(showcase.page)).frameCount>20);
  await showcase.page.locator('#followLeft').click();
  assert.equal((await snap(showcase.page)).mode,'left');
  await showcase.page.locator('#reconnect').click();
  assert.equal((await snap(showcase.page)).apiCalls,0);
  assert(!urls.some(u=>u.includes('a'.repeat(64))||u.includes('b'.repeat(64))),
   'No student tokens in URLs');
  assert(!urls.some(u=>u.includes('vercel.app')||u.includes('neon.tech')),
   'No production API reached in CI');
  assert.deepEqual(errors,[],'Browser page errors');
  console.log('PASS D1b browser: 2 synchronized spectators, independent camera modes, WebGL fallback, reconnect, server winner and slot release; public demo offline.');
 }finally{
  for(const c of contexts)await c.close().catch(()=>{});
  await browser.close();
  await db.end();
 }
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

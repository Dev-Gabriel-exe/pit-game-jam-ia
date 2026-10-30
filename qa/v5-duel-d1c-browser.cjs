'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
const {Pool}=require('pg');
const BASE='http://127.0.0.1:8899',ROOT=path.resolve(__dirname,'..');
const db=new Pool({host:'127.0.0.1',port:5432,user:'postgres',
 password:'ci_only_password',database:'pit_v5_d1c_test'});
const errors=[],requestUrls=[];
async function browserPage(browser,{token=null,teacher=false}={}){
 const context=await browser.newContext({viewport:{width:1240,height:880}});
 if(teacher)await context.addInitScript(()=>{
  window.__PIT_V5_D1C_TEACHER_STAGING={
   enabled:true,
   teacherEndpoint:'http://127.0.0.1:8899/api/duel-teacher-v2-lab',
   keyProvider:()=>'f'.repeat(64)
  };
 });
 else if(token)await context.addInitScript(key=>{
  window.__PIT_V5_D1C_STAGING={
   enabled:true,
   duelEndpoint:'http://127.0.0.1:8899/api/duel-v2-lab',
   matchEndpoint:'http://127.0.0.1:8899/api/duel-match-v2-lab',
   tokenProvider:()=>key
  };
 },token);
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin===BASE)return route.continue();
  if(url.hostname==='cdn.jsdelivr.net'&&url.pathname.startsWith('/npm/three@0.186.1/')){
   const rel=url.pathname.slice('/npm/three@0.186.1/'.length);
   const root=path.resolve(ROOT,'node_modules/three');
   const target=path.resolve(root,rel);
   if(target.startsWith(root+path.sep))try{
    return route.fulfill({body:await fs.readFile(target),
     contentType:'text/javascript; charset=utf-8',
     headers:{'Access-Control-Allow-Origin':'*','Cross-Origin-Resource-Policy':'cross-origin'}});
   }catch{}
  }
  return route.abort();
 });
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 page.on('request',r=>requestUrls.push(r.url()));
 await page.goto(BASE+'/v5/'+(teacher?'duel-teacher-d1c.html':'duel-lobby-d1c.html'),
  {waitUntil:'domcontentloaded'});
 if(teacher)await page.waitForFunction(()=>window.PIT_V5_D1C_TEACHER?.snapshot.ready,{timeout:25000});
 else if(token)await page.waitForFunction(()=>window.PIT_V5_D1C_LOBBY?.snapshot.connected,{timeout:25000});
 else await page.waitForFunction(()=>!!window.PIT_V5_D1C_LOBBY,{timeout:25000});
 return {page,context};
}
const lobbySnap=page=>page.evaluate(()=>window.PIT_V5_D1C_LOBBY.snapshot);
const frameSnap=page=>page.evaluate(()=>document.querySelector('#arenaFrame')
 ?.contentWindow?.PIT_V5_D1B_VIEW?.snapshot||null);
(async()=>{
 const browser=await chromium.launch({headless:true,
  args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader',
   '--enable-unsafe-swiftshader']});
 const contexts=[];
 try{
  // A viewer without an injected fixture MUST NOT talk to any API.
  const anonymous=await browserPage(browser);contexts.push(anonymous.context);
  assert.equal((await lobbySnap(anonymous.page)).connected,false);
  assert.equal(await anonymous.page.locator('#availableToggle').isDisabled(),true);
  assert.equal(await anonymous.page.locator('a[href="./duel-lab-d1a.html"]').count(),1);
  await anonymous.context.close();contexts.pop();
  const teacher=await browserPage(browser,{teacher:true});contexts.push(teacher.context);
  assert.equal(await teacher.page.locator('#teacherStatus').textContent(),'PAUSADOS');
  const A=(await browserPage(browser,{token:'a'.repeat(64)}));contexts.push(A.context);
  const B=(await browserPage(browser,{token:'b'.repeat(64)}));contexts.push(B.context);
  const C=(await browserPage(browser,{token:'c'.repeat(64)}));contexts.push(C.context);
  assert.equal((await lobbySnap(A.page)).teacherEnabled,false);
  assert.equal((await lobbySnap(C.page)).eligibility,'working');
  assert.equal(await C.page.locator('#availableToggle').isDisabled(),true);
  // Professor enables duels; students must finish current mission and opt in.
  await teacher.page.locator('#enableDuels').click();
  await teacher.page.waitForFunction(()=>window.PIT_V5_D1C_TEACHER.snapshot.enabled);
  await A.page.locator('#refresh').click();
  await B.page.locator('#refresh').click();
  await A.page.waitForFunction(()=>window.PIT_V5_D1C_LOBBY.snapshot.teacherEnabled);
  await B.page.waitForFunction(()=>window.PIT_V5_D1C_LOBBY.snapshot.teacherEnabled);
  await A.page.locator('#availableToggle').check();
  await B.page.locator('#availableToggle').check();
  await A.page.waitForFunction(()=>window.PIT_V5_D1C_LOBBY.snapshot.optedIn);
  await B.page.waitForFunction(()=>window.PIT_V5_D1C_LOBBY.snapshot.optedIn);
  await A.page.locator('#refresh').click();
  await A.page.waitForFunction(()=>window.PIT_V5_D1C_LOBBY.snapshot.peers===1);
  assert.equal(await A.page.locator('.peer').count(),1);
  // Decline notifies the challenger and frees both participants.
  await A.page.locator('.peer button[data-action=invite]').click();
  await B.page.locator('#refresh').click();
  await B.page.waitForFunction(()=>!!document.querySelector('button[data-action=decline]'));
  await B.page.locator('button[data-action=decline]').click();
  await A.page.locator('#refresh').click();
  await A.page.waitForFunction(()=>window.PIT_V5_D1C_LOBBY.snapshot.lastStatus==='declined');
  assert.match(await A.page.locator('#feedback').textContent(),/recusado/i);
  // Retry and accept; BOTH screens should autonomously enter the SAME battle.
  await A.page.locator('.peer button[data-action=invite]').click();
  await B.page.locator('#refresh').click();
  await B.page.waitForFunction(()=>!!document.querySelector('button[data-action=accept]'));
  await B.page.locator('button[data-action=accept]').click();
  await A.page.locator('#refresh').click();
  await A.page.waitForFunction(()=>window.PIT_V5_D1C_LOBBY.snapshot.view==='battle',{timeout:25000});
  await B.page.waitForFunction(()=>window.PIT_V5_D1C_LOBBY.snapshot.view==='battle',{timeout:25000});
  await A.page.waitForFunction(()=>document.querySelector('#arenaFrame')
   ?.contentWindow?.PIT_V5_D1B_VIEW?.snapshot.ready,{timeout:65000});
  await B.page.waitForFunction(()=>document.querySelector('#arenaFrame')
   ?.contentWindow?.PIT_V5_D1B_VIEW?.snapshot.ready,{timeout:65000});
  const first=await frameSnap(A.page),second=await frameSnap(B.page);
  assert.equal(first.demo,false);
  assert.equal(first.replaySha256,second.replaySha256);
  assert(first.frameCount>20&&first.eventCount>4);
  assert.equal(first.sceneReady,true,'First spectator must have working WebGL canvas');
  assert.equal(second.sceneReady,true,'Second spectator must have working WebGL canvas');
  assert.equal(await A.page.locator('#arenaPanel').isVisible(),true);
  assert.equal(await A.page.locator('#lobbyLayout').isVisible(),false);
  assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM pit_duel_matches')).rows[0].n,1);
  // Teacher can pause new matches without retroactively erasing the ongoing one.
  await teacher.page.locator('#pauseDuels').click();
  await teacher.page.waitForFunction(()=>!window.PIT_V5_D1C_TEACHER.snapshot.enabled);
  await B.page.frameLocator('#arenaFrame').locator('#reconnect').click();
  await B.page.waitForFunction(()=>document.querySelector('#arenaFrame')
   ?.contentWindow?.PIT_V5_D1B_VIEW?.snapshot.ready,{timeout:25000});
  assert.equal((await frameSnap(B.page)).replaySha256,first.replaySha256);
  // Force elapsed match only in disposable test DB; slots must be released.
  await db.query(
   "UPDATE pit_duel_matches SET started_at=NOW()-INTERVAL '180 seconds', "+
   "ends_at=NOW()-INTERVAL '2 seconds' WHERE room_code='PITGAME26'");
  await A.page.frameLocator('#arenaFrame').locator('#reconnect').click();
  await B.page.frameLocator('#arenaFrame').locator('#reconnect').click();
  const ended=()=>{const s=document.querySelector('#arenaFrame')
   ?.contentWindow?.PIT_V5_D1B_VIEW?.snapshot;
   return !!s?.ready&&s.replayDuration>0&&s.playback>=s.replayDuration-.1;};
  await A.page.waitForFunction(ended,{timeout:25000});
  await B.page.waitForFunction(ended,{timeout:25000});
  const winA=await A.page.frameLocator('#arenaFrame').locator('#winnerName').textContent();
  const winB=await B.page.frameLocator('#arenaFrame').locator('#winnerName').textContent();
  assert.equal(winA,winB);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM pit_duel_slots')).rows[0].n,0);
  await A.page.locator('#backToLobby').click();
  await A.page.waitForFunction(()=>window.PIT_V5_D1C_LOBBY.snapshot.view==='lobby');
  assert.equal(await A.page.locator('#lobbyLayout').isVisible(),true);
  assert.equal(await A.page.locator('#arenaPanel').isVisible(),false);
  assert.equal((await lobbySnap(A.page)).activeInvite,null);
  assert.deepEqual(errors,[],'Unexpected browser error');
  assert(!requestUrls.some(u=>u.includes('a'.repeat(64))||
   u.includes('b'.repeat(64))||u.includes('f'.repeat(64))),'No tokens in URL');
  assert(!requestUrls.some(u=>/neon\.tech|vercel\.app/.test(u)),'No production endpoints');
  console.log('PASS D1c Chromium: teacher enabled/pause, 3 fictional students, decline notification, accepted auto-open shared 3D battle, same server replay/winner, reconnect, return to lobby, no real API.');
 }finally{
  for(const ctx of contexts)await ctx.close().catch(()=>{});
  await browser.close();await db.end();
 }
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

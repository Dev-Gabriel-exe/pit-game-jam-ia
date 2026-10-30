'use strict';
/*
 * H1d staging verification: real HTTP requests → V2 API → disposable PostgreSQL.
 * Two independent browsers share the SAME fictional student; third is isolated.
 */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {Pool}=require('pg');
const BASE='http://127.0.0.1:8899';
const STUDENT_A='11111111-1111-4111-8111-111111111111';
const STUDENT_B='22222222-2222-4222-8222-222222222222';
const pool=new Pool({host:'127.0.0.1',port:5432,user:'postgres',
 password:'ci_only_password',database:'pit_v5_h1d_test'});
const errors=[],requests=[];
async function tab(browser,token){
 const context=await browser.newContext({viewport:{width:1160,height:850}});
 await context.addInitScript((fixtureToken)=>{
  window.__PIT_V5_H1D_STAGING={
   enabled:true,endpoint:'http://127.0.0.1:8899/api/hero-v2-lab',
   tokenProvider:()=>fixtureToken
  };
 },token);
 await context.route('**/*',route=>{
  const u=new URL(route.request().url());
  if(u.origin===BASE)return route.continue();
  return route.abort(); // Fonts and any external resources are blocked.
 });
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>requests.push(r.url()));
 await page.goto(BASE+'/v5/hero-lab-h1d.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.PIT_V5_H1D_LAB?.snapshot.ready,{timeout:30000});
 return {page,context};
}
const snapshot=page=>page.evaluate(()=>window.PIT_V5_H1D_LAB.snapshot);
async function distribute(page,points,talents){
 for(let i=0;i<points;i++)
  await page.locator('button[data-action=plus][data-id=FOR]').click();
 const selected=(await snapshot(page)).draft.talents.length;
 for(let i=selected;i<selected+talents;i++)
  await page.locator('button[data-action=talent]').nth(i).click();
}
async function awaitRevision(page,number){
 await page.waitForFunction(rev=>window.PIT_V5_H1D_LAB?.snapshot.revision===rev,
  number,{timeout:20000});
}
async function approveTo(n){
 for(const sid of [STUDENT_A,STUDENT_B]){
  for(let stage=4;stage<=n;stage++){
   await pool.query('INSERT INTO pit_student_stages(student_id,stage,status) '+
    "VALUES($1,$2,'approved') ON CONFLICT(student_id,stage) DO UPDATE SET status='approved'",
    [sid,stage]);
  }
 }
 await pool.query('UPDATE pit_classroom_state SET current_stage=$1 WHERE room_code=$2',
  [n,'PITGAME26']);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const contexts=[];
 try{
  const first=await tab(browser,'a'.repeat(64));contexts.push(first.context);
  const second=await tab(browser,'a'.repeat(64));contexts.push(second.context);
  const other=await tab(browser,'b'.repeat(64));contexts.push(other.context);
  const A=first.page,B=second.page,C=other.page;
  assert.equal((await snapshot(A)).revision,0);
  assert.equal((await snapshot(B)).revision,0);
  assert.equal((await snapshot(C)).revision,0);
  assert.equal(await A.locator('#classGrid button').count(),4);
  assert.equal(await A.locator('#talents button').count(),30);
  await A.locator('button[data-action=class][data-id=guardian]').click();
  await distribute(A,6,3);
  await A.locator('#saveBuild').click();
  await awaitRevision(A,1);
  assert.equal((await snapshot(A)).klass,'guardian');
  assert.equal((await snapshot(A)).approvedMissions,3);
  assert.equal((await snapshot(B)).revision,0,'Other browser remains stale until refreshing');

  await distribute(B,6,3);
  const originalB=await snapshot(B);
  await B.locator('#saveBuild').click();
  await B.waitForFunction(()=>window.PIT_V5_H1D_LAB.snapshot.stale,{timeout:15000});
  assert.equal((await snapshot(B)).revision,0);
  assert.deepEqual((await snapshot(B)).draft,originalB.draft,
   'Conflict must never silently throw away unsaved changes');
  assert.match(await B.locator('#feedback').textContent(),/outra aba|outro navegador/i);
  await B.locator('#discardDraft').click();
  await awaitRevision(B,1);
  assert.equal((await snapshot(B)).klass,'guardian','Stale browser gets server version');
  assert.equal((await snapshot(B)).stale,false);

  await C.locator('button[data-action=class][data-id=hunter]').click();
  await distribute(C,6,3);
  await C.locator('#saveBuild').click();
  await awaitRevision(C,1);
  assert.equal((await snapshot(C)).klass,'hunter');
  assert.equal((await snapshot(A)).klass,'guardian');

  await approveTo(5);
  await A.locator('#reloadProfile').click();
  await A.waitForFunction(()=>window.PIT_V5_H1D_LAB.snapshot.approvedMissions===5);
  assert.equal((await snapshot(A)).draft.talents.length,3,'Server unlocks budget; talents not auto-assigned');
  await distribute(A,4,2);
  await A.locator('#saveBuild').click();
  await awaitRevision(A,2);
  await A.locator('#freezeM5').click();
  await awaitRevision(A,3);
  assert.equal((await snapshot(A)).arena.m5Entered,true);
  assert.equal((await snapshot(A)).arena.m5Snapshot.talents.length,5);
  assert.equal(await A.locator('button[data-action=minus][data-id=FOR]').isDisabled(),true,
   'M5 baseline cannot be lowered');
  assert.equal(await A.locator('button[data-action=talent]').nth(0).isDisabled(),true,
   'M5 talents cannot be removed');

  await B.locator('#reloadProfile').click();
  await B.waitForFunction(()=>window.PIT_V5_H1D_LAB.snapshot.arena.m5Entered,{timeout:20000});
  assert.equal((await snapshot(B)).revision,3,'Second browser receives authoritative M5 freeze');

  await approveTo(10);
  await A.locator('#reloadProfile').click();
  await A.waitForFunction(()=>window.PIT_V5_H1D_LAB.snapshot.approvedMissions===10);
  await distribute(A,10,5);
  await A.locator('#saveBuild').click();
  await awaitRevision(A,4);
  await A.locator('#lockM10').click();
  await awaitRevision(A,5);
  assert.equal((await snapshot(A)).arena.m10Locked,true);
  assert.equal(await A.locator('#saveBuild').isDisabled(),true);
  assert.equal(await A.locator('button[data-action=plus][data-id=FOR]').isDisabled(),true);

  await B.locator('#reloadProfile').click();
  await B.waitForFunction(()=>window.PIT_V5_H1D_LAB.snapshot.arena.m10Locked,{timeout:20000});
  assert.equal((await snapshot(B)).revision,5);
  assert.equal(await B.locator('#saveBuild').isDisabled(),true);

  const db=await pool.query(
   'SELECT student_id,klass,revision,m5_snapshot,m10_snapshot FROM pit_hero_builds_v2 ORDER BY student_id'
  );
  assert.equal(db.rowCount,2,'Both fictional students retain separate heroes');
  const storedA=db.rows.find(r=>r.student_id===STUDENT_A);
  const storedB=db.rows.find(r=>r.student_id===STUDENT_B);
  assert.equal(storedA.klass,'guardian');assert.equal(storedA.revision,5);
  assert.equal(storedA.m5_snapshot.talents.length,5);
  assert.equal(storedA.m10_snapshot.talents.length,10);
  assert.equal(storedB.klass,'hunter');assert.equal(storedB.revision,1);
  assert.equal(storedB.m5_snapshot,null);assert.equal(storedB.m10_snapshot,null);

  await A.reload();
  await A.waitForFunction(()=>window.PIT_V5_H1D_LAB.snapshot.ready);
  assert.equal((await snapshot(A)).revision,5,'DB persists across browser reloads');
  assert.equal(await A.locator('#talents button').count(),30);
  assert(!requests.some(u=>u.includes('vercel.app')||u.includes('/api/classroom')),
   'Staging never contacts actual classroom endpoints');
  for(const url of requests)assert(!url.includes('a'.repeat(64))&&!url.includes('b'.repeat(64)),
   'Tokens must never appear in URLs');
  assert.deepEqual(errors,[],'Browser uncaught errors');
  console.log('PASS H1d: two browser CAS conflict, preserved drafts, third student isolated, real PostgreSQL, M5/M10 locks, reload; no production API.');
 }finally{
  for(const c of contexts)await c.close().catch(()=>{});
  await browser.close();
  await pool.end();
 }
})().catch(e=>{console.error(e);process.exitCode=1});

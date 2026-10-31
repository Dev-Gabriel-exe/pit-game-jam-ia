'use strict';
// All participants are fictional and this Playwright job never touches real accounts.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1420,height:920}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/teacher-arena-lab.html',{waitUntil:'load'});
  await page.waitForFunction(()=>window.PIT_V5_TEACHER_ARENA_LAB_VIEW?.eligible===30);
  assert.equal(await page.locator('#release').isDisabled(),true);
  assert.equal(await page.locator('#start').isDisabled(),true);
  assert.equal(await page.locator('#eligibleCount').innerText(),'30');
  await page.locator('#count').selectOption('4');
  assert.equal(await page.locator('#totalCount').innerText(),'4');
  // An offline member cannot enter, even if the teacher enables the arena.
  await page.locator('input[data-field="online"]').first().uncheck();
  assert.equal(await page.locator('#eligibleCount').innerText(),'3');
  assert.equal(await page.locator('#excludedCount').innerText(),'1');
  await page.locator('#teacherEnabled').check();
  await page.locator('#release').click();
  assert.equal(await page.evaluate(()=>window.PIT_V5_TEACHER_ARENA_LAB_VIEW.released),3);
  assert.equal(await page.locator('#count').isDisabled(),true,'mission locked after release');
  assert.equal(await page.locator('#start').isDisabled(),true,'cannot start before GLBs load');
  const webgl=await page.evaluate(()=>!!document.createElement('canvas').getContext('webgl2'));
  if(!webgl){
   console.log('SKIP WebGL2 hardware; fictional policy and release checks completed');
   return;
  }
  await page.locator('#prepare').click();
  await page.locator('#arenaStage canvas').waitFor({timeout:90000});
  await page.waitForFunction(()=>document.getElementById('arenaStage')?.dataset.v5ModelsExpected==='3'&&
   document.getElementById('arenaStage')?.dataset.v5CombatEngine==='phase2-m5',null,{timeout:60000});
  await page.waitForFunction(()=>document.getElementById('arenaStage')?.dataset.v5ModelsLoaded==='3',null,{timeout:100000});
  await page.locator('#start').waitFor({state:'visible'});
  await page.waitForFunction(()=>!document.getElementById('start').disabled,null,{timeout:10000});
  assert.equal(await page.evaluate(()=>window.PIT_V5_TEACHER_ARENA_LAB_VIEW.status),'released');
  await page.locator('#start').click();
  assert.equal(await page.evaluate(()=>window.PIT_V5_TEACHER_ARENA_LAB_VIEW.status),'running');
  await page.locator('#abort').click();
  assert.equal(await page.evaluate(()=>window.PIT_V5_TEACHER_ARENA_LAB_VIEW.status),'aborted');
  assert.equal(await page.locator('#arenaStage canvas').count(),0,'aborted match releases GL resources');
  assert.equal(await page.locator('#start').isDisabled(),true);
  await page.locator('#reset').click();
  assert.equal(await page.locator('#release').isDisabled(),true,'teacher must release again');

  // M10 final is independently locked, and requires the same explicit release.
  await page.locator('#mission').selectOption('10');
  await page.locator('#count').selectOption('4');
  assert.equal(await page.locator('#eligibleCount').innerText(),'4');
  await page.locator('#teacherEnabled').check();
  await page.locator('#release').click();
  assert.equal(await page.evaluate(()=>window.PIT_V5_TEACHER_ARENA_LAB_VIEW.released),4);
  await page.locator('#prepare').click();
  await page.locator('#arenaStage canvas').waitFor({timeout:90000});
  await page.waitForFunction(()=>{
   const el=document.getElementById('arenaStage');
   return el?.dataset.v5CombatEngine==='phase2-m10'&&
    el?.dataset.v5ApprovedTalentSlots==='10'&&el?.dataset.v5ModelsExpected==='4';
  },null,{timeout:60000});
  await page.waitForFunction(()=>document.getElementById('arenaStage')?.dataset.v5ModelsLoaded==='4',null,{timeout:100000});
  await page.waitForFunction(()=>!document.getElementById('start').disabled,null,{timeout:10000});
  assert.equal(await page.locator('#start').isEnabled(),true);
  await page.locator('#abort').click();
  assert.equal(await page.locator('#arenaStage canvas').count(),0);
  assert.deepEqual(errors,[],'unhandled JS errors');
  console.log('PASS browser: 30-person preflight, 3 eligible M5 / 1 excluded, explicit teacher start, 4 KayKit M10 GLBs, abort cleanup and reset');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

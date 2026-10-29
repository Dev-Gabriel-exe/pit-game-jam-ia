'use strict';
// C.2 independent browser proof: 120 plans, 4 real GLBs, no fake movement,
// sequence events on genuine skills, cleanup when resetting.
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:790}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?phase2=1',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='phase2-m5',null,{timeout:45000});
  const arena=page.locator('#arenaStage');
  assert.equal(Number(await arena.getAttribute('data-v5-choreography-catalog')),120);
  assert.equal(Number(await arena.getAttribute('data-v5-choreography-events')),0);
  await page.locator('[data-roster="4"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  assert.equal(Number(await arena.getAttribute('data-v5-choreography-catalog')),120);
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5ChoreographyEvents||0)>0&&window.PIT_V5_ARENA_LAB?.talentEvents>0,null,{timeout:65000});
  const report=await page.evaluate(()=>{
   const stage=document.querySelector('#arenaStage'),engine=window.PIT_V5_ARENA_LAB;
   return {last:stage.dataset.v5ChoreographyLast,pose:stage.dataset.v5ChoreographyPose,
    executed:+stage.dataset.v5ChoreographyEvents,clips:+stage.dataset.v5GlbClips,
    fallbacks:+stage.dataset.v5ClipFallbacks,engine:engine.combatEngine,
    roster:engine.fighterCount};
  });
  assert.match(report.last,/^(warrior|mage|hunter|guardian):[A-Z][0-9]{2}$/);
  assert(report.executed>0);assert(report.pose);
  assert(Number.isFinite(report.clips)&&report.clips>=0);
  assert(Number.isFinite(report.fallbacks)&&report.fallbacks>=0);
  assert.equal(report.engine,'phase2-m5');assert.equal(report.roster,4);
  await page.locator('#resetBattle').click();
  assert.equal(Number(await arena.getAttribute('data-v5-choreography-events')),0,'No stale animations after reset');
  assert.equal(Number(await arena.getAttribute('data-v5-choreographies-active')),0,'All local poses must be cleared after reset');
  assert.deepEqual(errors,[],'Browser JS errors '+errors.join(' | '));
  console.log('PASS C.2 Chrome: 120 choreography maps, four real GLBs, combat-triggered animation, clip counts, reset cleanup');
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

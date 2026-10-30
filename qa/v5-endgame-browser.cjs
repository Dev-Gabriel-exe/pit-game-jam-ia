'use strict';
// S24 incident regression: FULL 30-GLB battle, exact visible seed, final-two
// transition and real UI completion. Runs in headless Chromium/WebGL.
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:709,height:920},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:8899/v5/arena-lab.html?phase2=1&count=30'+
    '&nav=steer&counterplay=1&balance=hp2&sprites=1&seed=4175863657';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  const lab=()=>page.evaluate(()=>({
   seed:window.PIT_V5_ARENA_LAB?.seed,
   finished:window.PIT_V5_ARENA_LAB?.finished,
   winner:window.PIT_V5_ARENA_LAB?.winner?.klass,
   clock:document.querySelector('#combatClock')?.textContent,
   spectators:Number(document.querySelector('#arenaStage')?.dataset.v5Spectators),
   activeMixers:Number(document.querySelector('#arenaStage')?.dataset.v5ActiveMixerUpdates),
   totalIdleMixers:Number(document.querySelector('#arenaStage')?.dataset.v5IdleSpectatorMixers),
   fps:Number(document.querySelector('#arenaStage')?.dataset.v5FrameRate),
   drawCalls:Number(document.querySelector('#arenaStage')?.dataset.v5DrawCalls)
  }));
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='phase2-m5',null,{timeout:60000});
  assert.equal((await lab()).seed,4175863657);
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:150000});
  for(let i=0;i<4;i++)await page.locator('#speedBattle').click();
  assert.match(await page.locator('#speedBattle').textContent(),/×3/);
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5Spectators)>=28,
   null,{timeout:210000});
  // The reported 28 eliminated characters must still be physically in the
  // stands but must NOT animate 28 individual skeleton mixers every frame.
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5IdleSpectatorMixers)>=28,
   null,{timeout:15000});
  const at28=await lab();
  assert(at28.activeMixers<=2,'Only living heroes should animate during final duel: '+JSON.stringify(at28));
  assert(at28.totalIdleMixers>=28,'All eliminated GLB spectators remain in stands');
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.finished,null,{timeout:90000});
  const end=await lab();
  assert.equal(end.winner,'guardian','Exact screenshot seed must finish with guardian');
  assert.equal(end.spectators,29);
  assert(end.activeMixers<=1);
  assert.match(await page.locator('#result').textContent(),/Vencedor/);
  assert.equal((await page.locator('#arenaStatus').textContent()).trim(),'CONFRONTO FINALIZADO');
  assert.deepEqual(errors,[],'Browser errors: '+errors.join(' | '));
  // Verify the UI really recovers after victory, not only the engine.
  await page.locator('#resetBattle').click();
  assert.equal(Number(await page.locator('#arenaStage').getAttribute('data-v5-spectators')),0);
  console.log('PASS E.7 full S24-seed endgame 30 GLBs: '+JSON.stringify({at28,end}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

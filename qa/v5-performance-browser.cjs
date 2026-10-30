'use strict';
// G.1: real browser resource samples, 4/30 full KayKit GLBs and WebGL loss.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader',
  '--enable-unsafe-swiftshader'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1365,height:850}});
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  const base='http://127.0.0.1:8899/v5/arena-lab.html?phase2=1'+
   '&nav=steer&counterplay=1&balance=hp2&sprites=1&seed=4175863657&perf=1';
  await page.goto(base+'&count=4',{waitUntil:'domcontentloaded',timeout:45000});
  const stage=page.locator('#arenaStage');
  assert(await page.locator('#performancePanel').isVisible());
  assert.equal(await stage.getAttribute('data-v5-quality-mode'),'auto','Do not force low quality');
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:110000});
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5PerfSamples)>=2,
   null,{timeout:25000});
  const sample4=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.performanceReport?.sample);
  assert(sample4.fps>0&&sample4.drawCalls>0&&sample4.triangles>1000);
  assert(sample4.geometries>0&&sample4.textures>0);
  assert.equal(sample4.modelsExpected,4);
  assert.equal(sample4.modelsLoaded,4);
  assert.equal(await stage.getAttribute('data-v5-graphics-context'),'ready');
  assert.match(await page.locator('#perfModels').textContent(),/4 \/ 4/);
  await page.locator('[data-roster="30"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:140000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.performanceReport?.sample?.modelsLoaded===30,
   null,{timeout:30000});
  const sample30=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.performanceReport?.sample);
  assert.equal(sample30.modelsLoaded,30);
  assert.equal(sample30.modelsExpected,30);
  assert.equal(await stage.getAttribute('data-v5-quality-mode'),'auto');
  assert(sample30.drawCalls>200,'Gothic citadel and fighters must render');
  assert(sample30.geometries>100&&sample30.textures>0);
  assert(Number(await stage.getAttribute('data-v5-static-merged-meshes'))>600);
  // Three resets of the SAME 30-KayKit scene must not accumulate unlimited
  // graphics assets. GLS estimates are best-effort, so allow headroom.
  const observations=[sample30];
  for(let i=0;i<2;i++){
   await page.locator('#resetBattle').click();
   await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,
    null,{timeout:140000});
   await page.waitForTimeout(1300);
   observations.push(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.performanceReport?.sample));
  }
  // WebGL texture uploads are lazy: 30 GLBs can report "loaded" before
  // their first GPU draw. Compare post-warmup resets, not the cold GPU count.
  const last=observations.at(-1),warmed=observations[1];
  assert(last.geometries<=warmed.geometries+50,
   'Possible geometry leak after GPU warm-up: '+JSON.stringify(observations));
  assert(last.textures<=warmed.textures+40,
   'Possible texture leak after GPU warm-up: '+JSON.stringify(observations));
  // Test explicit browser GPU loss during a real running battle.
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>document.querySelector('#arenaStatus')?.dataset.status==='running',null,{timeout:10000});
  const capability=await page.evaluate(()=>{
   const canvas=document.querySelector('#arenaStage canvas');
   const gl=canvas.getContext('webgl2');
   const ext=gl.getExtension('WEBGL_lose_context');
   if(!ext)return false;
   window.__g1LostExtension=ext;ext.loseContext();return true;
  });
  if(capability){
   await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5GraphicsContext==='lost',
    null,{timeout:15000});
   assert.match(await page.locator('#arenaStatus').textContent(),/GPU REINICIANDO/);
   assert.equal(await page.locator('#pauseBattle').isDisabled(),true);
   assert.equal(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.graphicsContext),'lost');
   await page.evaluate(()=>window.__g1LostExtension.restoreContext());
   await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5GraphicsContext==='restored-paused',
    null,{timeout:35000});
   assert.match(await page.locator('#arenaStatus').textContent(),/GPU RESTAURADA/);
   assert.equal(await page.locator('#pauseBattle').isDisabled(),false);
   await page.locator('#pauseBattle').click();
   assert.match(await page.locator('#arenaStatus').textContent(),/BATALHA EM ANDAMENTO/);
   assert.equal(await stage.getAttribute('data-v5-graphics-context'),'ready','GPU status must clear after explicit resume');
   assert.equal(await stage.getAttribute('data-v5-graphics-losses'),'1');
  }else{
   console.log('G1 GPU context loss extension unsupported in this Chromium environment; lifecycle test requires PC hardware');
  }
  assert.deepEqual(errors,[],'Fatal JS errors: '+errors.join(' | '));
  const metrics=await page.evaluate(()=>({
   report:window.PIT_V5_ARENA_LAB.performanceReport,
   gpu:window.PIT_V5_ARENA_LAB.graphicsContext
  }));
  console.log('PASS G.1 WebGL 4/30 and reset: '+JSON.stringify({
   four:{fps:sample4.fps,calls:sample4.drawCalls,memory:[sample4.geometries,sample4.textures]},
   thirty:observations.map(v=>({fps:v.fps,calls:v.drawCalls,mem:[v.geometries,v.textures]})),
   contextTested:capability,graphicsContext:metrics.gpu
  }));
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});

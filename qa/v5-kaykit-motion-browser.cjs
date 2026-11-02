'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:8899/v5/arena-lab.html';
  for(const m of [5,10]){
   const url=base+(m===5?'?phase2=1':'?m10preview=1')+'&count=4&sprites=1&nav=steer';
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:110000});
   await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5KaykitMotionReady)>=4,null,{timeout:110000});
   const stage=page.locator('#arenaStage');
   const bound=Number(await stage.getAttribute('data-v5-kaykit-motion-bound'));
   assert(bound>=30,'Real bone-binding missing: '+bound);
   assert.equal(await stage.getAttribute('data-v5-kaykit-motion-status'),'ready');
   await page.locator('#startBattle').click();
   await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5KaykitMotionPlays)>=2,null,{timeout:95000});
   const metrics=await stage.evaluate(el=>({
    rigReady:+el.dataset.v5KaykitMotionReady||0,clipsBound:+el.dataset.v5KaykitMotionBound||0,
    realMotionPlays:+el.dataset.v5KaykitMotionPlays||0,talents:+el.dataset.v5TalentFxEvents||0,
    models:+el.dataset.v5ModelsLoaded||0,failed:+el.dataset.v5ModelsFailed||0,
    vfxActive:+el.dataset.v5TalentFxActive||0
   }));
   assert.equal(metrics.rigReady,4);
   assert.equal(metrics.models,4);
   assert.equal(metrics.failed,0);
   assert(metrics.realMotionPlays>=2,'Actual KayKit 1.1 clips never played');
   assert(metrics.vfxActive<=18,'VFX budget');
   await page.locator('#resetBattle').click();
   assert.equal(Number(await stage.getAttribute('data-v5-kaykit-motion-plays')),0);
   console.log('PASS M'+m+' real KayKit actions / four rigs: '+JSON.stringify(metrics));
  }
  await page.goto(base+'?phase2=1&count=4&kaykitmotion=0',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:110000});
  assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-kaykit-motion-status'),'off');
  assert.equal(Number(await page.locator('#arenaStage').getAttribute('data-v5-kaykit-motion-bound')),0);
  assert.deepEqual(errors,[],'Browser errors');
  console.log('PASS original KayKit embedded animation fallback');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

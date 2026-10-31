'use strict';
// WebGL cinematic VFX smoke with genuine Phase2 talent events and 4 real KayKit GLBs.
// No simulated hit or damage injected, no live student XP or login.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl',
  '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1340,height:810}});
  page.on('pageerror',error=>errors.push(error.message));
  async function check(mission){
   const path=mission===10?
    '/v5/arena-lab.html?m10preview=1&count=4&nav=steer&sprites=1':
    '/v5/arena-lab.html?phase2=1&count=4&nav=steer&sprites=1';
   await page.goto('http://127.0.0.1:8899'+path,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(expected=>
    window.PIT_V5_ARENA_LAB?.combatEngine==='phase2-m'+expected,
    mission,{timeout:70000});
   const stage=page.locator('#arenaStage');
   assert.equal(await stage.getAttribute('data-v5-sprite-mode'),'on');
   assert.equal(Number(await stage.getAttribute('data-v5-sprite-frames')),8);
   assert.equal(Number(await stage.getAttribute('data-v5-sprite-textures')),104);
   assert.equal(Number(await stage.getAttribute('data-v5-talent-motion-events')),0);
   assert.equal(Number(await stage.getAttribute('data-v5-talent-projectiles')),0);
   assert.equal(Number(await stage.getAttribute('data-v5-sprite-echo-active')),0);
   assert.equal(await page.evaluate(()=>typeof window.PIT_V5_TALENT_MOTION?.sample),'function');
   await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,
    null,{timeout:105000});
   await page.locator('#startBattle').click();
   await page.waitForFunction(()=>Number(document.getElementById('arenaStage')?.dataset.v5TalentMotionEvents||0)>=2,
    null,{timeout:80000});
   const sample=await stage.evaluate(el=>({
    talents:+(el.dataset.v5TalentFxEvents||0),
    motion:+(el.dataset.v5TalentMotionEvents||0),
    projectile:+(el.dataset.v5TalentProjectiles||0),
    active:+(el.dataset.v5TalentFxActive||0),
    echoes:+(el.dataset.v5SpriteEchoActive||0),
    clips:+(el.dataset.v5ChoreographyEvents||0),
    models:+(el.dataset.v5ModelsLoaded||0),
    dropped:+(el.dataset.v5TalentFxDropped||0),
    failed:+(el.dataset.v5ModelsFailed||0)
   }));
   assert(sample.motion>=2&&sample.talents>=2&&sample.clips>0);
   assert(sample.active<=18,'9/18 ability budget must remain bounded');
   assert(sample.echoes<=sample.active,'aura echoes cannot outlive or outnumber the active talent FX');
   assert.equal(sample.models,4);assert.equal(sample.failed,0);
   assert(sample.projectile>=0);
   await page.locator('#resetBattle').click();
   assert.equal(Number(await stage.getAttribute('data-v5-talent-motion-events')),0);
   assert.equal(Number(await stage.getAttribute('data-v5-talent-projectiles')),0);
   assert.equal(Number(await stage.getAttribute('data-v5-sprite-echo-active')),0);
   assert.equal(Number(await stage.getAttribute('data-v5-talent-fx-active')),0);
   console.log('PASS cinematic browser M'+mission+': 4 KayKit GLBs, genuine casts, 8-frame atlases, real VFX choreography, capped echoes, clean reset: '+JSON.stringify(sample));
  }
  await check(5);
  await check(10);
  assert.deepEqual(errors,[],'Browser errors: '+errors.join(' | '));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

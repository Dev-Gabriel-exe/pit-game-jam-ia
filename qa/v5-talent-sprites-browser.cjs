'use strict';
// Real WebGL browser regression: animated V5 E.6 sprites, no simulated talents.
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?phase2=1&count=4&nav=steer&counterplay=1&balance=hp2&sprites=1',
   {waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='phase2-m5',null,{timeout:60000});
  const stage=page.locator('#arenaStage');
  assert.equal(await stage.getAttribute('data-v5-sprite-mode'),'on');
  const textures=Number(await stage.getAttribute('data-v5-sprite-textures'));
  const frames=Number(await stage.getAttribute('data-v5-sprite-frames'));
  assert(textures===13*frames);
  assert([2,3,6].includes(frames));
  assert.equal(Number(await stage.getAttribute('data-v5-sprite-visual-events')),0,'No fake visual effects before action');
  // Examine actual raster alpha, not only event counters: frames must contain
  // painted pixels and distinct animation phases.
  const pixels=await page.evaluate(async()=>{
   const THREE=await import('three');
   const sprites=window.PIT_V5_TALENT_SPRITES.makeAtlas(THREE,{quality:'low'});
   const result=[];
   for(const style of ['arc','barrier','fire','frost','heal','arrow','rune','impact']){
    const e=sprites.spawn({style});
    const sums=e.frames.map(t=>{
     const canvas=t.image,data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
     let alpha=0,weighted=0;for(let i=3;i<data.length;i+=4){alpha+=data[i];weighted+=(i+1)*data[i];}
     return [alpha,weighted];
    });
    result.push({style,alpha:sums[0][0],variation:new Set(sums.map(x=>x.join(':'))).size});
    e.mesh.material.dispose();
   }
   sprites.dispose();return result;
  });
  assert(pixels.every(p=>p.alpha>2000&&p.variation>=2),
   'All sprite families must have visible drawn pixels and distinct animation frames: '+JSON.stringify(pixels));
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5SpriteVisualEvents||0)>=2,
   null,{timeout:65000});
  const active=await stage.evaluate(el=>({
   events:Number(el.dataset.v5SpriteVisualEvents),
   talents:Number(el.dataset.v5TalentFxEvents),
   count:Number(el.dataset.v5SpriteVisualActive),
   last:el.dataset.v5SpriteStyleLast,
   budget:Number(el.dataset.v5TalentFxActive),
   failed:Number(el.dataset.v5ModelsFailed)
  }));
  assert(active.events>=2&&active.talents>0);
  assert(active.count<=36,'No more than 18 ability effects and 18 hit impact sprites');
  assert(active.budget<=18,'Ability FX budget respected');
  assert.equal(active.failed,0);
  // Chrome DevTools screenshot bypasses Playwright's external-font wait. Canvas
  // and WebGL are already rendered; Google Fonts may be unreachable on CI.
  const cdp=await page.context().newCDPSession(page);
  const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});
  require('node:fs').writeFileSync('qa/v5-arena-lab-sprites-e6.png',Buffer.from(shot.data,'base64'));
  await cdp.detach();
  await page.locator('#resetBattle').click();
  assert.equal(Number(await stage.getAttribute('data-v5-sprite-visual-active')),0,'Reset must clean all sprites');
  assert.equal(Number(await stage.getAttribute('data-v5-sprite-visual-events')),0,'Reset must clear telemetry');
  assert.equal(Number(await stage.getAttribute('data-v5-talent-fx-active')),0);
  // 30-hero stress smoke: respect budget and keep sprite identities legible.
  await page.locator('[data-roster="30"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.fighterCount===30&&
   window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:140000});
  assert.equal(Number(await stage.getAttribute('data-v5-models-failed')),0);
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5SpriteVisualEvents||0)>=3,
   null,{timeout:90000});
  const crowd=await stage.evaluate(el=>({
   active:Number(el.dataset.v5SpriteVisualActive),
   talentActive:Number(el.dataset.v5TalentFxActive),
   displayed:Number(el.dataset.v5SpriteVisualEvents)
  }));
  assert(crowd.displayed>=3,'Real talents must produce sprites among 30 combatants');
  assert(crowd.active<=36,'30-person stress must maintain 18+18 visual cap');
  assert(crowd.talentActive<=18,'30-person ability budget exceeded');
  await page.locator('#resetBattle').click();
  assert.equal(Number(await stage.getAttribute('data-v5-sprite-visual-active')),0,
   'Reset after 30 actors must free every sprite');
  await page.locator('[data-mission="10"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='legacy',null,{timeout:45000});
  assert.equal(Number(await stage.getAttribute('data-v5-sprite-visual-events')),0,'M10 never triggers M5 sprites');
  assert.deepEqual(errors,[],'Browser errors: '+errors.join(' | '));
  await page.close();
  console.log('PASS E.6 browser: real-ability animated sprites, capped rendering, clean reset, 4 GLBs, M10 isolation');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
'use strict';
// F.2: full 30-person seeded tournament, active automatic director, real winner.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?phase2=1&count=30'+
   '&nav=steer&counterplay=1&balance=hp2&sprites=1&seed=4175863657',
   {waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:150000});
  const stage=page.locator('#arenaStage');
  await page.locator('#actionCamera').click();
  for(let i=0;i<4;i++)await page.locator('#speedBattle').click();
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.finished,null,{timeout:210000});
  await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5CameraShot==='victory'
   &&Number(document.querySelector('#arenaStage')?.dataset.v5CameraVisibleSubjects)===1,
   null,{timeout:25000});
  const scene=await stage.evaluate(el=>({
   mode:el.dataset.v5CameraDirector,
   shot:el.dataset.v5CameraShot,
   distance:Number(el.dataset.v5CameraFramingDistance),
   obstructions:Number(el.dataset.v5CameraObstructions),
   subjects:Number(el.dataset.v5CameraVisibleSubjects),
   cuts:Number(el.dataset.v5CameraCuts),
   spectators:Number(el.dataset.v5Spectators),
   drawCalls:Number(el.dataset.v5DrawCalls)
  }));
  const winner=await page.evaluate(()=>window.PIT_V5_ARENA_LAB?.winner);
  assert.equal(winner?.klass,'guardian','Winner must be unchanged by the camera');
  assert.equal(scene.mode,'on');
  assert.equal(scene.shot,'victory');
  assert.equal(scene.spectators,29);
  assert.equal(scene.subjects,1);
  assert(scene.cuts>=2,'At least overview, duels and final should appear');
  assert(scene.distance>=19);
  assert(scene.obstructions===0,'Victory framing should not hide the champion behind a pillar');
  assert.match(await page.locator('#directorStatus').textContent(),/vencedor/);
  assert.match(await page.locator('#result').textContent(),/Vencedor/);
  const cdp=await page.context().newCDPSession(page);
  const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});
  require('node:fs').writeFileSync('qa/v5-camera-f2-victory-30.png',Buffer.from(shot.data,'base64'));
  await cdp.detach();
  // Manual override still works after victory; no student-state integration.
  await page.locator('#overviewCamera').click();
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'off');
  assert.deepEqual(errors,[],'JS errors: '+errors.join(' | '));
  console.log('PASS F.2 cinematic victory at 30 real GLBs: '+JSON.stringify({scene,winner:winner?.klass}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

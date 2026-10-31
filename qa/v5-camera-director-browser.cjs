'use strict';
// F.1 isolated WebGL proof: camera sees actual 4/30 fighters, manual has priority.
// The lab is preview-only; no connection to real students/XP.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:8899/v5/arena-lab.html?phase2=1&count=4'+
   '&nav=steer&counterplay=1&balance=hp2&sprites=1&seed=4175863657';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:105000});
  const stage=page.locator('#arenaStage'),auto=page.locator('#actionCamera');
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'off');
  await auto.click();
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'on');
  assert.equal(await auto.getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#directorStatus').textContent(),/Automática/);
  const startingSeed=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.seed);
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5CameraCuts)>=1,
   null,{timeout:85000});
  const shot=await stage.getAttribute('data-v5-camera-shot');
  assert(['duel','highlight','climax','overview','victory'].includes(shot));
  assert.equal(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.seed),startingSeed);
  // F.2: the live THREE camera must be guided by a real obstacle-aware plan.
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5CameraFramingDistance)>0,
   null,{timeout:30000});
  const comp=await stage.evaluate(el=>({
   distance:Number(el.dataset.v5CameraFramingDistance),
   blocked:Number(el.dataset.v5CameraObstructions),
   subjects:Number(el.dataset.v5CameraVisibleSubjects)
  }));
  assert(comp.distance>=19&&Number.isFinite(comp.distance));
  assert(comp.blocked>=0&&comp.blocked<=4);
  assert(comp.subjects>=1&&comp.subjects<=4);
  // A portrait viewport should remain within the same automatic director.
  await page.setViewportSize({width:450,height:800});
  await page.waitForTimeout(700);
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'on');
  const compact=Number(await stage.getAttribute('data-v5-camera-framing-distance'));
  assert(Number.isFinite(compact)&&compact>=19,'Portrait camera framing must be finite');
  await page.setViewportSize({width:1280,height:800});
  // An explicit manual preset immediately turns off automation.
  await page.locator('#overviewCamera').click();
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'off');
  assert.equal(await auto.getAttribute('aria-pressed'),'false');
  assert.match(await page.locator('#directorStatus').textContent(),/manual/);
  await auto.click();
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'on');
  // Dragging the actual canvas overrides the director without stopping battle.
  const canvas=page.locator('#arenaStage canvas').first();
  // F.3 added controls below the stage. Clicking the auto button scrolls the
  // document down; a synthetic drag with an offscreen rect does not fire events.
  await canvas.scrollIntoViewIfNeeded();
  const box=await canvas.boundingBox();
  const viewport=page.viewportSize();
  assert(box&&box.y<viewport.height&&box.y+box.height>0,
   'Camera canvas must be visible before sending genuine pointer input');
  await page.mouse.move(box.x+box.width*.48,box.y+box.height*.48);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*.55,box.y+box.height*.55,{steps:3});
  await page.mouse.up();
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'off');
  await auto.click();
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'on');
  // Follow is an explicit student selection; even a cinematic director cannot
  // steal that camera until the professor reactivates it.
  await page.locator('[data-focus]').first().click();
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'off');
  await page.locator('#resetBattle').click();
  await page.locator('[data-roster="30"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,
   null,{timeout:145000});
  await auto.click();await page.locator('#startBattle').click();
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5CameraCuts)>=1,
   null,{timeout:105000});
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'on');
  assert.equal(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.fighterCount),30);
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5CameraFramingDistance)>0,
   null,{timeout:30000});
  assert(Number(await stage.getAttribute('data-v5-camera-visible-subjects'))>=1);
  // Capture the actual WebGL composition without hanging on external fonts.
  const cdp=await page.context().newCDPSession(page);
  const proof=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});
  require('node:fs').writeFileSync('qa/v5-camera-director-f2-30.png',Buffer.from(proof.data,'base64'));
  await cdp.detach();
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m5');
  assert.deepEqual(errors,[],'Uncaught browser errors: '+errors.join(' | '));
  console.log('PASS F.2 browser: 4/30 GLBs, real obstacle-aware framing, portrait resize, manual priority, no combat changes');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

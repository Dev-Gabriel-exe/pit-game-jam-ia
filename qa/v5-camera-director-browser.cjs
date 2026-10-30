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
  // An explicit manual preset immediately turns off automation.
  await page.locator('#overviewCamera').click();
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'off');
  assert.equal(await auto.getAttribute('aria-pressed'),'false');
  assert.match(await page.locator('#directorStatus').textContent(),/manual/);
  await auto.click();
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'on');
  // Dragging the actual canvas overrides the director without stopping battle.
  const canvas=page.locator('#arenaStage canvas').first();
  const box=await canvas.boundingBox();
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
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m5');
  assert.deepEqual(errors,[],'Uncaught browser errors: '+errors.join(' | '));
  console.log('PASS F.1 browser: real 4/30 GLBs, automatic shot, orbit & manual priority, no gameplay changes');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

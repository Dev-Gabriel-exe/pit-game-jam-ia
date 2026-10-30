'use strict';
// H.3 opt-in M10 real WebGL: four and thirty rigged KayKit heroes and ten talents.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1360,height:840}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:8899/v5/arena-lab.html?m10preview=1&count=4&phase2=1'+
   '&nav=steer&counterplay=1&balance=hp2&sprites=1&seed=4175863657';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:55000});
  const stage=page.locator('#arenaStage');
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,
   null,{timeout:160000});
  assert.equal(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.m10Visual),true);
  assert.equal(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.mission),10);
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m10');
  assert.equal(await stage.getAttribute('data-v5-approved-talent-slots'),'10');
  assert.equal(await page.locator('[data-mission="10"]').getAttribute('aria-pressed'),'true');
  let selected=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents);
  assert.equal(selected.length,4);
  assert(selected.every(x=>x.ids.length===10));
  assert.match(await page.locator('#engineModeInfo').textContent(),/PRÉVIA 3D EXPERIMENTAL/);
  await page.waitForFunction(()=>document.querySelector('#startBattle')?.disabled===false,
   null,{timeout:15000});
  assert.equal(await page.locator('#startBattle').isDisabled(),false);
  await page.locator('#actionCamera').click();
  for(let i=0;i<4;i++)await page.locator('#speedBattle').click();
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.talentEvents>1,
   null,{timeout:110000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.finished,
   null,{timeout:180000});
  assert(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.winner?.id));
  assert.equal(Number(await stage.getAttribute('data-v5-spectators')),3);
  assert.match(await page.locator('#result').textContent(),/Vencedor/);
  // Expand to the actual 30-character real KayKit coliseum without leaving
  // the experimental M10-only engine, retaining same seed.
  await page.locator('[data-roster="30"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,
   null,{timeout:170000});
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m10');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),10);
  selected=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents);
  assert.equal(selected.length,30);
  assert(selected.every(x=>x.ids.length===10));
  assert.equal(await page.locator('[data-fighter]').count(),30);
  await page.waitForFunction(()=>document.querySelector('#startBattle')?.disabled===false,
   null,{timeout:15000});
  assert.equal(await page.locator('#startBattle').isDisabled(),false);
  await page.locator('#actionCamera').click();
  for(let i=0;i<4;i++)await page.locator('#speedBattle').click();
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.talentEvents>=10,
   null,{timeout:150000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.finished,
   null,{timeout:245000});
  assert(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.winner?.id));
  assert.equal(Number(await stage.getAttribute('data-v5-spectators')),29);
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m10');
  assert.match(await page.locator('#result').textContent(),/Vencedor/);
  await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5CameraShot==='victory',
   null,{timeout:12000});
  const proof=await page.context().newCDPSession(page);
  const image=await proof.send('Page.captureScreenshot',{format:'png',fromSurface:true});
  fs.writeFileSync('qa/v5-m10-visual-30.png',Buffer.from(image.data,'base64'));
  await proof.detach();
  // Back to M5: no 10-talent build accepted and no final-fighter state bleed.
  await page.locator('[data-mission="5"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,
   null,{timeout:145000});
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m5');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),5);
  selected=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents);
  assert(selected.every(x=>x.ids.length===5));
  assert.deepEqual(errors,[],'No uncaught browser errors: '+errors.join(' | '));
  console.log('PASS M10 visual WebGL: 4/30 KayKit GLBs, 10 talents each, events, victory and spectator 29, M5 reverted to 5 talents.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

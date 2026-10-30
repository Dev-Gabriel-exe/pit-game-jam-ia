'use strict';
// G.3: fail selected KayKit network downloads on first request, then restore.
// Verify that only missing GLBs are retried with no phantom winner or XP.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader',
  '--enable-unsafe-swiftshader'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  let mageRequests=0,knightRequests=0;
  await page.route('**/Mage.glb',async route=>{
   mageRequests++;
   if(mageRequests===1)await route.abort('failed');else await route.continue();
  });
  await page.route('**/Knight.glb',async route=>{
   knightRequests++;
   if(knightRequests===1)await route.abort('failed');else await route.continue();
  });
  const url='http://127.0.0.1:8899/v5/arena-lab.html?phase2=1&count=4'+
   '&nav=steer&counterplay=1&balance=hp2&sprites=1&seed=4175863657';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.fighterCount===4,null,{timeout:40000});
  const stage=page.locator('#arenaStage');
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5ModelsFailed)===2,
   null,{timeout:100000});
  await page.waitForFunction(()=>document.querySelector('#retryModels')?.hidden===false,
   null,{timeout:10000});
  assert.equal(await page.locator('#startBattle').isDisabled(),true);
  assert.equal(await stage.getAttribute('data-v5-models-loaded'),'2');
  assert.match(await page.locator('#modelReport').textContent(),/Falha em 2 modelo/);
  assert.equal(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.finished),false);
  const seed=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.seed);
  const builds=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents);
  await page.locator('#retryModels').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4&&
   window.PIT_V5_ARENA_LAB?.modelState.failed===0,null,{timeout:125000});
  await page.waitForFunction(()=>!document.querySelector('#startBattle')?.disabled,null,{timeout:12000});
  assert.equal(Number(await stage.getAttribute('data-v5-model-retries')),1);
  assert.equal(await page.locator('#retryModels').isVisible(),false);
  assert.equal(mageRequests,2,'Mage: one failed network request plus one retry');
  assert.equal(knightRequests,2,'Knight: one failed network request plus one retry');
  assert.equal(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.seed),seed);
  assert.deepEqual(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents),builds);
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.talentEvents>0,null,{timeout:65000});
  await page.locator('#resetBattle').click();
  await page.locator('[data-roster="30"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:145000});
  assert.equal(await page.locator('#retryModels').isVisible(),false);
  assert.equal(Number(await stage.getAttribute('data-v5-models-failed')),0);
  assert.equal(await page.locator('#startBattle').isDisabled(),false);
  assert.equal(await page.locator('[data-fighter]').count(),30);
  assert.deepEqual(errors,[],'Uncaught JS errors: '+errors.join(' | '));
  console.log('PASS G.3: two GLB failures blocked battle, only missing models retried, unchanged seed/build, 30 restored.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

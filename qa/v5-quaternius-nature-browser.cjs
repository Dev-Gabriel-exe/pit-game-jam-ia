'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768}});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?phase2=1&count=4',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>['loaded','partial','failed'].includes(document.querySelector('#arenaStage')?.dataset.v5Nature),null,{timeout:100000});
  const d=await page.locator('#arenaStage').evaluate(el=>({...el.dataset}));
  assert.equal(d.v5Nature,'loaded','Could not load all Quaternius nature models: '+JSON.stringify(d));
  assert.equal(Number(d.v5NatureParts),46,'Expected 12 trees + 10 trees + 24 shrubs');
  assert.deepEqual(d.v5NatureMeshes.split(',').sort(),['bush.glb','tree1.glb','tree3.glb']);
  assert.equal(await page.locator('#arenaStage canvas').count(),1);
  assert.deepEqual(errors,[]);
  await page.locator('[data-mission="10"]').click();
  await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5Nature==='loaded' && window.PIT_V5_ARENA_LAB?.mission===10,null,{timeout:100000});
  const d10=await page.locator('#arenaStage').evaluate(el=>({...el.dataset}));
  assert.equal(Number(d10.v5NatureParts),46);
  assert.equal(await page.locator('#arenaStage canvas').count(),1);
  assert.deepEqual(errors,[]);
  console.log('PASS Quaternius actual GLBs instanced in M5 and M10 without client JS errors');
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

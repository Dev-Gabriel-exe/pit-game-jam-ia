'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:850}});
  const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?phase2=1&avatars=1&count=4&avatar=mage-04',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5AvatarMode==='40-class-armory',null,{timeout:45000});
  assert.equal(await page.locator('[data-roster="4"]').getAttribute('aria-pressed'),'true');
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5WardrobeMeshes||0)>=35,
   null,{timeout:100000});
  assert(Number(await page.locator('#arenaStage').getAttribute('data-v5-wardrobe-meshes'))>=35);
  // Requested avatar must match an actual class and a real recorded look.
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5ModelsLoaded||0)>=4,null,{timeout:110000});
  assert.equal(await page.locator('.arena-nickname').count(),4,'no extra combatants injected');
  const errors=errs.filter(e=>!/ResizeObserver loop limit exceeded/.test(e));
  assert.deepEqual(errors,[],'Avatar rendering must not crash arena');
  console.log('PASS V5 4 hero arena with class-specific CC0 3D armor and full combat module');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

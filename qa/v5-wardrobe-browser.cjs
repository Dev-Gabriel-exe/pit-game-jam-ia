'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:820}});
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto('http://127.0.0.1:8899/v5/personagens-lab.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.PIT_V5_AVATAR_LAB?.glReady&&window.PIT_V5_WARDROBE&&window.PIT_V5_AVATAR_LAB.catalogSize===40,{timeout:30000});
  const result=await page.evaluate(()=>window.PIT_V5_AVATAR_LAB.validateAllGear());
  assert.equal(result.count,40);
  assert.equal(result.unique,40);
  assert(result.summary.every(a=>a.meshCount>=35),'Every avatar must be full 3D with body-specific armor/weapon geometry');
  const sourceModels=new Set(result.summary.map(a=>a.source));
  assert.equal(sourceModels.size,4,'four authentic Quaternius clothing bases');
  assert.equal(await page.locator('.avatar-card').count(),10);
  await page.locator('[data-avatar-id="warrior-07"]').click();
  assert.equal(await page.locator('#avatarName').textContent(),'Ragnar do Eclipse');
  await page.waitForFunction(()=>document.querySelector('#avatarStage')?.dataset.avatarId==='warrior-07',{timeout:90000});
  assert(Number(await page.locator('#avatarStage').getAttribute('data-mesh-count'))>=35);
  await page.locator('#studentSelect').selectOption('aluno-02');
  await page.locator('[data-avatar-id="mage-04"]').click();
  await page.waitForFunction(()=>document.querySelector('#avatarStage')?.dataset.avatarId==='mage-04',{timeout:90000});
  assert((await page.locator('#avatarStage').getAttribute('data-outfit')).endsWith('.gltf'));
  assert.equal(await page.locator('#claimAvatar').isEnabled(),true);
  assert.deepEqual(errors,[],'Unexpected browser JS errors '+errors.join(' | '));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert(overflow<15,'390px character viewer must not overflow screen');
  console.log('PASS 40 3D assemblies, 4 CC0 medieval bases, class variants and mobile 390px WebGL viewer');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:850}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/personagens-lab.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.PIT_V5_AVATAR_LAB?.catalogSize===40,{timeout:16000});
  assert.equal(await page.locator('.avatar-card').count(),10,'ten visible class choices');
  assert.equal(await page.locator('.class-button').count(),4);
  assert.equal(await page.locator('.class-button:disabled').count(),3);
  assert.equal(await page.locator('#studentSelect option').count(),30);
  assert.equal(await page.locator('#availableCount').textContent(),'10 / 10 disponíveis');
  await page.locator('.avatar-card[data-avatar-id="warrior-02"]').click();
  await page.locator('#claimAvatar').click();
  assert.equal(await page.locator('.avatar-card[data-avatar-id="warrior-02"] .state').textContent(),'✓ SEU PERSONAGEM');
  await page.selectOption('#studentSelect','aluno-05');
  await page.waitForFunction(()=>document.querySelector('[data-avatar-id="warrior-02"]')?.disabled===true,{timeout:5000});
  assert.equal(await page.locator('.avatar-card[data-avatar-id="warrior-02"]').isDisabled(),true,'exclusivity in same demo room');
  await page.selectOption('#studentSelect','aluno-02');
  assert.equal(await page.locator('.avatar-card[data-avatar-id="warrior-02"]').count(),0,'student 02 must see mage class');
  assert.equal(await page.locator('.class-button:not(:disabled)').getAttribute('data-class'),'mage');
  await page.locator('.avatar-card[data-avatar-id="mage-01"]').click();
  await page.locator('#claimAvatar').click();
  assert.equal(await page.locator('.avatar-card[data-avatar-id="mage-01"] .state').textContent(),'✓ SEU PERSONAGEM');
  await page.selectOption('#studentSelect','aluno-01');
  assert.equal(await page.locator('.avatar-card[data-avatar-id="warrior-02"]').isDisabled(),false,'own hero remains selectable');
  await page.locator('#releaseAvatar').click();
  assert.equal(await page.locator('#availableCount').textContent(),'10 / 10 disponíveis');
  assert.deepEqual(errors,[],'no JS errors: '+errors.join(' | '));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<15,'mobile horizontal overflow '+overflow);
  console.log('PASS V5 40 character demo: assignments, exclusive claims, release, responsive 390px');
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

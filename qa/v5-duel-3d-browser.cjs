'use strict';
// Browser smoke for a genuine WebGL canvas and two official KayKit GLB rigs.
// No accounts, shared state, user XP or production writes.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:880}});
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto('http://127.0.0.1:8899/v5/duel-window-lab.html',{waitUntil:'load'});
  const webgl=await page.evaluate(()=>!!document.createElement('canvas').getContext('webgl2'));
  if(!webgl){console.log('SKIP: Chromium CI lacks WebGL2; G.2 PC hardware still required');return}
  await page.locator('#invite').click();
  await page.locator('#accept').click();
  await page.locator('#open').click();
  await page.locator('#visualize').click();
  await page.locator('#duelStage canvas').waitFor({timeout:90000});
  await page.waitForFunction(()=>{
   const node=document.getElementById('duelStage');
   return node?.dataset.v5CombatEngine==='phase2-m5'&&node?.dataset.v5ModelsExpected==='2';
  },null,{timeout:60000});
  // Unlike a painted emoji mock, both KayKit GLBs must actually finish loading
  // before the simulation is allowed to advance.
  await page.waitForFunction(()=>document.getElementById('duelStage')?.dataset.v5ModelsLoaded==='2',null,{timeout:80000});
  assert.match(await page.locator('#hudAName').innerText(),/trial-aluna-a/);
  assert.match(await page.locator('#hudBName').innerText(),/trial-aluno-b/);
  assert.equal(await page.locator('#duelStage').getAttribute('data-v5-camera-director'),'on');
  await page.locator('#close').click();
  assert.equal(await page.locator('#duelStage canvas').count(),0,'closing must dispose WebGL canvas');
  assert.equal(await page.locator('#arena').isHidden(),true);
  assert.deepEqual(errors,[],'no unhandled browser errors');
  console.log('PASS: accepted 1x1 creates authentic KayKit GLBs + Three.js canvas; modal close disposes stage');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});

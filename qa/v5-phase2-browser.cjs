'use strict';
// Validate the real B.1 engine is mounted and executes talents in the 3D lab.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?phase2=1',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='phase2-m5',null,{timeout:60000});
  assert.equal(await page.locator('#phase2Mode').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-fighter]').count(),30);
  assert.equal(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.phase2),true);
  const budgets=await page.evaluate(()=>{
   const x=window.PIT_V5_PHASE2;
   return ['warrior','mage','hunter','guardian'].map(c=>{
    const b=x.exampleBuild(c,c,5);
    return {classId:c,talents:b.talents.length,points:Object.values(b.attributes).reduce((a,n)=>a+n,0)};
   });
  });
  assert(budgets.every(b=>b.talents===5&&b.points===10));
  await page.locator('[data-roster="4"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.fighterCount===4&&window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.talentEvents>0,null,{timeout:65000});
  assert(await page.locator('#battleLog').textContent());
  await page.locator('[data-mission="10"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='legacy',null,{timeout:45000});
  assert.equal(await page.locator('#phase2Mode').getAttribute('aria-pressed'),'false');
  assert.deepEqual(errors,[],'Page errors: '+errors.join(' | '));
  console.log('PASS Phase2 B.1 browser: real five-talent M5 builds, 3D skills and M10 legacy isolation');
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

'use strict';
// C.3: Verify real 30-hero 3D build identity, independently of name and M10 UI.
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?phase2=1',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='phase2-m5',null,{timeout:45000});
  const stage=page.locator('#arenaStage');
  assert.equal(+await stage.getAttribute('data-v5-build-visuals'),30,'Every combatant should have a path insignia');
  assert(+await stage.getAttribute('data-v5-build-identities')>=20,'30 builds should be visibly diverse');
  assert.equal(await page.locator('.arena-nickname[data-build-path]').count(),30);
  const collection=await page.locator('.arena-nickname[data-build-path]').evaluateAll(nodes=>nodes.map(n=>({
   klass:n.dataset.klass,path:n.dataset.buildPath,signature:n.dataset.buildSignature,
   accent:n.style.getPropertyValue('--v5-build-accent'),title:n.title
  })));
  assert(collection.every(u=>u.path?.length===3&&u.signature&&/^#[0-9a-f]{6}$/i.test(u.accent)&&u.title));
  for(const klass of ['warrior','mage','hunter','guardian']){
   const each=collection.filter(x=>x.klass===klass);
   assert(each.length>=7,'Must have seven '+klass+' for 30 players');
   assert(new Set(each.map(x=>x.signature)).size>=6,klass+' identity depends on the actual build');
   assert(new Set(each.map(x=>x.accent)).size>=3,klass+' needs multiple accents');
  }
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded>=4,null,{timeout:100000});
  await page.locator('[data-roster="4"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.fighterCount===4&&window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  assert.equal(+await stage.getAttribute('data-v5-build-visuals'),4);
  assert.equal(+await stage.getAttribute('data-v5-build-identities'),4);
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.talentEvents>0,null,{timeout:65000});
  assert.equal(+await stage.getAttribute('data-v5-build-visuals'),4,'Combat cannot delete identity');
  await page.locator('#resetBattle').click();
  assert.equal(+await stage.getAttribute('data-v5-build-visuals'),4,'Reset reconstructs four identities');
  await page.locator('[data-mission="10"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='legacy',null,{timeout:45000});
  assert.equal(+await stage.getAttribute('data-v5-build-visuals'),0,'No M5 cosmetics pretend M10 is implemented');
  assert.equal(await page.locator('.arena-nickname[data-build-path]').count(),0);
  assert.deepEqual(errors,[],'Unexpected JS errors: '+errors.join(' | '));
  console.log('PASS C.3 browser: distinct 30 build-bound insignia, actual GLB stage, 4-hero reset, isolated legacy M10');
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

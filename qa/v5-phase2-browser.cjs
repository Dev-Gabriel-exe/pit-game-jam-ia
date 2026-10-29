'use strict';
// Validate the real B.6 engine, 120 catalog skills and user-selectable M5 samples.
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
  assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-engagement-mode'),'spaced');
  assert.equal(await page.locator('#damagePace').getAttribute('data-scale'),'0.5');
  const comparisonSeed=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.seed);
  for(const pace of ['1','0.75','0.6','0.5']){
   await page.locator('#damagePace').click();
   assert.equal(await page.locator('#damagePace').getAttribute('data-scale'),pace);
   assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-damage-scale'),pace);
  }
  assert.equal(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.seed),comparisonSeed,'Damage toggle must replay the same seed');
  const budgets=await page.evaluate(()=>{
   const x=window.PIT_V5_PHASE2;
   return ['warrior','mage','hunter','guardian'].map(c=>{
    const b=x.exampleBuild(c,c,5);
    return {classId:c,talents:b.talents.length,points:Object.values(b.attributes).reduce((a,n)=>a+n,0)};
   });
  });
  assert(budgets.every(b=>b.talents===5&&b.points===10));
  assert.equal(await page.evaluate(()=>Object.values(window.PIT_V5_PHASE2.TALENTS).flat().length),120);
  assert.equal((await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents)).length,30);
  await page.locator('[data-roster="4"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.fighterCount===4&&window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  const original=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents.map(x=>x.ids[0]));
  assert.deepEqual(original,['B01','E01','P01','G01']);
  await page.locator('#phase2Builds').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.selectedTalents?.[0]?.ids?.[0]==='B06'&&window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  const newSkills=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents.map(x=>x.ids[0]));
  assert.deepEqual(newSkills,['B06','E06','P06','G06']);
  assert.match(await page.locator('#phase2Builds').textContent(),/Alternativos I/);
  for(let n=0;n<2;n++)await page.locator('#phase2Builds').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.selectedTalents?.[0]?.ids?.[0]==='D01'&&window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  const nextPaths=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents.map(x=>x.ids[0]));
  assert.deepEqual(nextPaths,['D01','R01','E01','L01']);
  for(let n=0;n<2;n++)await page.locator('#phase2Builds').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.selectedTalents?.[0]?.ids?.[0]==='D06'&&window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  const b4=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents.map(x=>x.ids));
  assert.deepEqual(b4.map(x=>x[0]),['D06','R06','E06','L06']);
  assert(b4.every(x=>x.length===5));
  assert.match(await page.locator('#phase2Builds').textContent(),/Caminhos III/);
  for(let n=0;n<2;n++)await page.locator('#phase2Builds').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.selectedTalents?.[0]?.ids?.[0]==='T01'&&window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  const b5=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents.map(x=>x.ids));
  assert.deepEqual(b5.map(x=>x[0]),['T01','A01','S01','J01']);
  assert(b5.every(x=>x.length===5));
  assert.match(await page.locator('#phase2Builds').textContent(),/Caminhos IV/);
  for(let n=0;n<2;n++)await page.locator('#phase2Builds').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.selectedTalents?.[0]?.ids?.[0]==='T06'&&window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  const b6=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents.map(x=>x.ids));
  assert.deepEqual(b6.map(x=>x[0]),['T06','A06','S06','J06']);
  assert(b6.every(x=>x.length===5));
  assert.match(await page.locator('#phase2Builds').textContent(),/Caminhos V/);
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.talentEvents>0,null,{timeout:65000});
  assert(await page.locator('#battleLog').textContent());
  await page.locator('[data-mission="10"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='legacy',null,{timeout:45000});
  assert.equal(await page.locator('#phase2Mode').getAttribute('aria-pressed'),'false');
  // Experimental Fase E: URL opt-in must reach the actual battle engine.
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?phase2=1&count=4&nav=steer&counterplay=1',
   {waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5RangedCommitment==='recovery',
   null,{timeout:60000});
  assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-navigation-mode'),'steer');
  assert.match(await page.locator('#matchInfo').textContent(),/MIRA COM RECUPERAÇÃO/);
  await page.locator('[data-mission="10"]').click();
  await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5RangedCommitment==='legacy',
   null,{timeout:45000});
  assert.deepEqual(errors,[],'Page errors: '+errors.join(' | '));
  console.log('PASS Phase2 B.6 browser: 120 real M5 talents, sample build switching, GLB attacks, M10 legacy isolation');
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

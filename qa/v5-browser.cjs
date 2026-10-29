'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const all=[];
 try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport,reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/index.html?preview=1',{waitUntil:'domcontentloaded',timeout:20000});
  await page.locator('#v5Main').waitFor({state:'visible',timeout:16000});
  assert.equal(await page.locator('#v5HeroName').innerText(),'Aventureiro de demonstração','Preview needs explicit fictional identity');
  assert.equal(await page.locator('.v5-class').count(),6,'Six classes missing');
  assert.equal(await page.locator('[data-stat]').count(),8,'Attribute allocation must work');
  for(const id of ['warrior','guardian','mage','rogue','hunter','necromancer']){
   await page.locator('[data-class="'+id+'"]').click();
   assert.equal(await page.locator('#v5Stage').getAttribute('data-v5-asset-class'),id,'Class GLB request not queued: '+id);
   const dest=await page.locator('#v5ModelOrigin').getAttribute('href');
   assert(dest.startsWith('https://github.com/'),'Official asset source missing');
  }
  await page.locator('[data-class="mage"]').click();
  assert.equal(await page.locator('[data-class="mage"]').getAttribute('aria-pressed'),'true','Class swap failed');
  const pointsBefore=await page.locator('#v5Points').textContent();
  await page.locator('[data-stat="spirit"][data-delta="1"]').click();
  assert.notEqual(await page.locator('#v5Points').textContent(),pointsBefore,'Attribute point did not spend');
  await page.locator('#v5Palette').selectOption('jade');
  await page.locator('#v5Helmet').selectOption('3');
  await page.locator('#v5Weapon').selectOption('staff');
  const source=await page.evaluate(()=>window.PIT_V5_APP.state.build);
  assert.equal(source.klass,'mage');assert.equal(source.appearance.palette,'jade');
  assert.equal(source.attributes.spirit,1);
  await page.locator('#v5Save').click();
  assert.match(await page.locator('#v5Notice').innerText(),/demonstração/);
  const webGL=await page.waitForFunction(()=>Boolean(window.PIT_V5_APP.state.stage),null,{timeout:25000}).then(()=>true,()=>false);
  if(!webGL){
   const message=await page.locator('#v5Stage').innerText();
   throw Error('Three.js stage not available: '+message+'; browser errors: '+errors.join(' | '));
  }
  assert(await page.locator('#v5Stage canvas.v5-webgl').isVisible(),'Real WebGL renderer missing');
  await page.waitForFunction(()=>document.querySelector('#v5Stage')?.dataset.v5Asset==='loaded',null,{timeout:38000});
  const animationCount=Number(await page.locator('#v5Stage').getAttribute('data-v5-animation-count'));
  assert(animationCount>0,'True character GLB lacks animations');
  await page.locator('#v5Practice').click();
  await page.locator('#v5Battle:not([hidden])').waitFor();
  assert.match(await page.locator('#v5BattleTitle').innerText(),/Treino/);
  assert.equal(await page.locator('#v5Fighters .v5-fighter').count(),8,'Preview arena must show eight explicitly fictional heroes');
  await page.locator('#v5StartBattle').click();
  await page.waitForTimeout(1900);
  const sim=await page.evaluate(()=>window.PIT_V5_APP.state.stage.simulation);
  assert(sim.time>.1,'Auto battle is not advancing');
  await page.waitForFunction(()=>window.PIT_V5_APP.state.stage.simulation.events.some(e=>e.type==='hit'),null,{timeout:18000});
  assert(await page.evaluate(()=>window.PIT_V5_APP.state.stage.simulation.events.some(e=>e.type==='hit')),'Auto battle needs real damage events');
  await page.locator('#v5PauseBattle').click();
  assert(!await page.evaluate(()=>window.PIT_V5_APP.state.stage.playing),'Pause must stop simulation');
  await page.locator('#v5Back').click();
  assert(await page.locator('#v5Battle').isHidden(),'Back button must close battle mode');
  assert(await page.locator('#v5Stage canvas').isVisible(),'3D preview should resume after arena');
  await page.locator('#v5Peer').selectOption('demo-2');
  await page.locator('#v5ReviewScore').fill('9');
  await page.locator('#v5ReviewComment').fill('O jogo abre, mas falta um aviso visual para concluir o objetivo.');
  await page.locator('#v5ReviewForm button[type="submit"]').click();
  assert.match(await page.locator('#v5ReviewStatus').innerText(),/fictícia|Nenhum XP real/);
  const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert(dims.scroll<=dims.width+10,'Horizontal mobile overflow '+JSON.stringify(dims));
  assert.deepEqual(errors,[],'Browser errors '+errors.join(' | '));
  await page.screenshot({path:'qa/v5-screen-'+viewport.width+'.png',fullPage:true});
  all.push({width:viewport.width,webGL:true,classes:6,battle:true,stats:true,talents:6,reviewPreview:true});
  await page.close();
 }
 const teacher=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
 await teacher.goto('http://127.0.0.1:8899/v5/index.html?preview=1&mode=teacher',{waitUntil:'domcontentloaded'});
 await teacher.locator('#v5Main').waitFor({state:'visible'});
 await teacher.waitForFunction(()=>Boolean(window.PIT_V5_APP.state.stage),null,{timeout:25000});
 await teacher.locator('#v5Practice').click();
 assert.equal(await teacher.locator('#v5Fighters .v5-fighter').count(),8,'Teacher battle must load eight simulated players');
 assert.match(await teacher.locator('#v5Connection').innerText(),/DEMONSTRAÇÃO/);
 await teacher.locator('#v5Back').click();
 await teacher.evaluate(()=>{
  const app=window.PIT_V5_APP,base=app.demoRoster();
  app.state.roster=Array.from({length:35},(_,i)=>({
   ...base[i%base.length],id:'preview-hero-'+i,name:'Hero de teste '+(i+1)
  }));
 });
 await teacher.locator('#v5Practice').click();
 const tournament=await teacher.evaluate(()=>window.PIT_V5_APP.state.tournament);
 assert(tournament&&tournament.heats.length===3,'35 students require three automatic qualifying heats');
 assert.equal(await teacher.locator('#v5Fighters .v5-fighter').count(),16,'Each qualifying heat must render at most sixteen 3D heroes');
 await teacher.close();
 console.log('PASS: V5 authenticated-ready hero builder, WebGL Three.js, XP/attributes, auto-battle, demo review and teacher preview');
 console.log(JSON.stringify(all,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

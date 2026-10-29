'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const R=require('../v5/rules.js');
assert(R.xpFor(3)===300);
assert(R.xpFor(11)===1000);
assert(R.budget(1000).talents===5);
assert(Object.values(R.normalize({attrs:{forca:100,vitalidade:100}},0).attrs).reduce((a,b)=>a+b,0)===4);
for(let i=0;i<10;i++){
 const w=R.begin([{
  id:'a',name:'Arcanista',xp:1000,build:R.normalize({classId:'arcanist',attrs:{arcano:8}},1000)},
  {id:'b',name:'Guardião',xp:1000,build:R.normalize({classId:'guardian',attrs:{vitalidade:8}},1000)}
 ],i+42);
 for(let j=0;j<15000&&!w.over;j++)R.step(w,.05);
 assert(w.over&&w.winner,'Auto combat must end with winner');
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const outcomes=[];
 try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('#attrRemaining').filter({hasText:'4'}).waitFor({timeout:15000});
  assert.equal(await page.locator('[data-class]').count(),4);
  assert.equal(await page.locator('.attribute').count(),4);
  assert.equal(await page.locator('.talent').count(),6);
  await page.locator('[data-class="arcanist"]').click();
  assert.equal(await page.locator('[data-class="arcanist"]').getAttribute('aria-pressed'),'true');
  await page.locator('#attributes button[aria-label="Aumentar Força"]').click();
  assert.match(await page.locator('#attrRemaining').innerText(),/3 ponto/);
  await page.locator('#demoLevel').click();
  assert.match(await page.locator('#xpText').innerText(),/200/);
  const skill=page.locator('.talent').first();
  await skill.locator('button[aria-label^="Melhorar"]').click();
  assert.match(await page.locator('#talentRemaining').innerText(),/0 talento/);
  const name=await page.locator('#heroName').inputValue();
  assert(name.length>0);
  await page.locator('#startDuel').click();
  await page.locator('#battleStatus').filter({hasText:'BATALHA EM ANDAMENTO'}).waitFor();
  assert.equal(await page.locator('.scoreboard .score').count(),2);
  await page.locator('#startDemo').click();
  assert.equal(await page.locator('.scoreboard .score').count(),12);
  assert(!await page.locator('#startClass').isEnabled(),'teacher roster should be protected and not preloaded');
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert(width.scroll<=width.viewport+8,'Mobile horizontal overflow: '+JSON.stringify(width));
  await page.screenshot({path:'qa/v5-arena-'+viewport.width+'.png',fullPage:true});
  assert.deepEqual(errors,[],'browser console exception: '+errors.join(' | '));
  outcomes.push({viewport,classes:4,talents:6,arenaParticipants:12,overflow:width.scroll-width.viewport,
    webglFallback:await page.locator('#canvasFallback').isVisible()});
  await page.close();
 }
  console.log('PASS: V5 XP/attributes/talents, deterministic arena, controls and mobile UI');
  console.log(JSON.stringify(outcomes,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
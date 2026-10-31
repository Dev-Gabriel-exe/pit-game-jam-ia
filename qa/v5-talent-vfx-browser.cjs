'use strict';
// C.1 browser: genuine engine actions only, GLB loaded, VFX budget and full cleanup on reset.
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:760}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?phase2=1',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='phase2-m5',null,{timeout:45000});
  assert.equal(Number(await page.locator('#arenaStage').getAttribute('data-v5-talent-fx-catalog')),120);
  assert.equal(Number(await page.locator('#arenaStage').getAttribute('data-v5-talent-fx-events')),0,'No fake talent VFX before real combat');
  await page.locator('[data-roster="4"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:100000});
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5TalentFxEvents||0)>0&&window.PIT_V5_ARENA_LAB?.talentEvents>0,null,{timeout:65000});
  const a=await page.locator('#arenaStage').evaluate(el=>({
   cue:el.dataset.v5TalentCueLast,count:Number(el.dataset.v5TalentFxEvents),type:el.dataset.v5TalentCueStyle,
   active:Number(el.dataset.v5TalentFxActive),drops:Number(el.dataset.v5TalentFxDropped)
  }));
  assert.match(a.cue,/^(warrior|mage|hunter|guardian):[A-Z][0-9]{2}$/);
  assert(a.count>0);assert(a.active<=18);assert(a.drops>=0);
  assert(a.type,'Combat should use a talent-specific geometric motif');
  assert.equal(await page.locator('#talentTelemetry').getAttribute('data-active'),'true','HUD should identify a genuine activated talent');
  assert.match(await page.locator('#talentCount').textContent(),/[1-9][0-9]* talentos? ativados?/);
  assert(!/Aguardando/.test(await page.locator('#talentLast').textContent()),'A genuine talent name must appear');
  await page.locator('#resetBattle').click();
  assert.equal(await page.locator('#talentTelemetry').getAttribute('data-active'),'false','Reset clears skill HUD');
  assert.equal(await page.locator('#talentCount').textContent(),'0 talentos ativados');
  assert.equal(Number(await page.locator('#arenaStage').getAttribute('data-v5-talent-fx-events')),0,'Reset clears event count');
  assert.equal(Number(await page.locator('#arenaStage').getAttribute('data-v5-talent-fx-active')),0,'Reset disposes old meshes');
  assert.deepEqual(errors,[],'Page errors: '+errors.join(' | '));
  console.log('PASS C.1 browser: 120 registered cues, actual GLBs and M5 engine, 18-VFX budget, clean reset');
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

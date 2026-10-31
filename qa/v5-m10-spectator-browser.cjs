'use strict';
// H.3/M10: one fictional 30-KayKit WebGL simulation, living pupil ->
// shared spectator camera after real KO -> teacher -> victory -> reset.
// Browser software renderer is NOT the G.2 school-PC acceptance test.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const R=require('../v5/m10-visual-roster.js');

(async()=>{
 const seed=4175863657;
 const players=R.createRoster(P,H.createPolicy(P.TALENTS),{count:30,variant:0});
 const config={
  seed,limit:145,arenaScale:5,damageScale:.5,mageDamageBonus:1.1,
  stormDelay:40,stormRateFactor:.55,engagementMode:'spaced',
  navigationMode:'steer',rangedCommitment:'recovery',
  balancePreset:'e-hp2',arenaMission:10
 };
 const expected=P.battle(players,config).run(3000);
 assert(expected.finished&&expected.winner?.id,'Headless M10 must finish with winner');
 const firstKO=expected.events.find(e=>
  (e.type==='knockout'||e.type==='storm')&&
  players.some(p=>p.id===e.target)&&e.target!==expected.winner.id);
 const watched=firstKO?.target||players.find(p=>p.id!==expected.winner.id).id;
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'
 ]});
 try{
  const page=await browser.newPage({
   viewport:{width:1280,height:800},reducedMotion:'reduce'
  });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:8899/v5/arena-lab.html?m10preview=1&count=30'+
   '&phase2=1&nav=steer&counterplay=1&balance=hp2&seed='+seed;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:55000});
  const stage=page.locator('#arenaStage');
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,
   null,{timeout:175000});
  assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m10');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),10);
  assert.equal(await page.locator('#studentViewControls').isVisible(),true);
  assert.equal(await page.locator('#studentViewHero option').count(),30);
  assert.equal(await page.locator('[data-fighter]').count(),30);
  const announcement=page.locator('#battleAnnouncement');
  assert.equal(await announcement.getAttribute('role'),'status');
  assert.equal(await announcement.getAttribute('aria-live'),'polite');
  assert.equal(await announcement.getAttribute('aria-atomic'),'true');
  assert.equal(await page.locator('#battleLog').getAttribute('aria-live'),'off',
   'Rapid combat log must not flood screen readers');
  assert.equal(await announcement.evaluate(el=>getComputedStyle(el).position),'absolute',
   'Announcements must not obstruct the 3D scene');
  assert((await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents))
   .every(x=>x.ids.length===10),'Every M10 hero must have 10 talents');
  await page.locator('#studentViewHero').selectOption(watched);
  await page.locator('#studentViewButton').click();
  const begin=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.cameraViewer);
  assert.equal(begin.viewer.mode,'following');
  assert.equal(begin.viewer.studentId,watched);
  assert.equal(await stage.getAttribute('data-v5-camera-audience'),'student');
  for(let i=0;i<4;i++)await page.locator('#speedBattle').click();
  await page.locator('#startBattle').click();
  assert.match(await announcement.textContent(),/Confronto iniciado na missão 10/);
  await page.locator('#pauseBattle').click();
  assert.match(await page.locator('#arenaStatus').textContent(),/PAUSAD/);
  assert.match(await page.locator('#pauseBattle').textContent(),/Continuar/);
  assert.match(await announcement.textContent(),/Confronto pausado/);
  await page.locator('#pauseBattle').click();
  assert.match(await page.locator('#arenaStatus').textContent(),/BATALHA EM ANDAMENTO/);
  assert.match(await announcement.textContent(),/Confronto retomado/);
  await page.waitForFunction(()=>
   document.querySelector('#arenaStage')?.dataset.v5StudentCamera==='spectating',
   null,{timeout:245000});
  const dead=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.cameraViewer);
  assert.equal(dead.viewer.mode,'spectating');
  assert.equal(dead.viewer.studentId,watched);
  assert.equal(dead.viewer.feedId,begin.viewer.feedId);
  assert.equal(dead.feed.feedId,begin.viewer.feedId,'The first global feed is created when the student becomes spectator');
  assert(dead.feed.revision>0,'One global camera must advance after elimination');
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'on');
  assert.notEqual(await stage.getAttribute('data-v5-follow-target'),watched);
  assert.match(await page.locator('#studentViewStatus').textContent(),/eliminado.*MESMO diretor/);
  assert(Number(await stage.getAttribute('data-v5-spectators'))>=1);
  // Playwright screenshot waits for an animated WebGL surface to settle and
  // can time out despite the real KO/camera assertions already succeeding.
  // Capture the current compositor frame directly, as in M10 legibility QA.
  const cdp=await page.context().newCDPSession(page);
  try{
   const frame=await cdp.send('Page.captureScreenshot',{
    format:'png',fromSurface:true,captureBeyondViewport:false
   });
   fs.writeFileSync('qa/v5-m10-spectator-30.png',Buffer.from(frame.data,'base64'));
  }finally{await cdp.detach();}
  await page.locator('#teacherViewButton').click();
  const teacher=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.cameraViewer);
  assert.equal(teacher.viewer.mode,'teacher');
  assert.equal(teacher.feed.feedId,dead.feed.feedId);
  assert(teacher.feed.revision>=dead.feed.revision);
  assert.equal(await stage.getAttribute('data-v5-camera-audience'),'teacher');
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.finished,
   null,{timeout:245000});
  assert.equal((await page.evaluate(()=>window.PIT_V5_ARENA_LAB.winner))?.id,
   expected.winner.id,'WebGL camera must not change deterministic M10 winner');
  assert.equal(Number(await stage.getAttribute('data-v5-spectators')),29);
  assert.match(await page.locator('#result').textContent(),/Vencedor/);
  assert.match(await announcement.textContent(),/Missão 10 finalizada.*Vencedor/);
  await page.locator('#resetBattle').click();
  assert.match(await announcement.textContent(),/Missão 10.*Partida .*reiniciada/);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'resetBattle',
   'Reset should not steal keyboard focus');
  assert.equal(Number(await stage.getAttribute('data-v5-spectators')),0);
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m10');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),10);
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,
   null,{timeout:175000});
  await page.locator('[data-mission="5"]').click();
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m5');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),5);
  assert.match(await announcement.textContent(),/Missão 5.*preparada|Missão 5.*reiniciada/);
  assert.deepEqual(errors,[],'Uncaught Chromium errors: '+errors.join(' | '));
  console.log('PASS M10 spectator 30 KayKit: living -> shared camera on KO, teacher same feed, pause/resume, deterministic winner, reset and M5 regression. '+JSON.stringify({
   watched,expectedWinner:expected.winner.id,firstKO:!!firstKO,
   softwareRenderer:true,physicalPCsValidated:false
  }));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
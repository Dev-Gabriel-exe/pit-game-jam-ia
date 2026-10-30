'use strict';
// F.3: one real WebGL stage with one motor, no fake elimination or XP writes.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox',
  '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:8899/v5/arena-lab.html?phase2=1&nav=steer&counterplay=1&balance=hp2&sprites=1&seed=4175863657';
  await page.goto(base+'&count=4',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:120000});
  const stage=page.locator('#arenaStage');
  assert.equal(await stage.getAttribute('data-v5-camera-audience'),'teacher');
  assert.equal(await page.locator('#studentViewControls').isVisible(),true);
  assert.equal(await page.locator('#studentViewHero option').count(),4);
  await page.locator('#studentViewHero').selectOption('phase2-0-warrior');
  await page.locator('#studentViewButton').click();
  assert.equal(await stage.getAttribute('data-v5-student-camera'),'following');
  assert.equal(await stage.getAttribute('data-v5-camera-audience'),'student');
  assert.equal(await stage.getAttribute('data-v5-follow-target'),'phase2-0-warrior');
  assert.match(await page.locator('#studentViewStatus').textContent(),/vivo/);
  const begin=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.cameraViewer);
  assert.equal(begin.viewer.mode,'following');
  assert.equal(begin.viewer.studentId,'phase2-0-warrior');
  for(let i=0;i<4;i++)await page.locator('#speedBattle').click();
  await page.locator('#startBattle').click();
  // At 13.25 engine seconds this real warrior is eliminated for this seed.
  await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5StudentCamera==='spectating',
   null,{timeout:125000});
  const death=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.cameraViewer);
  assert.equal(death.viewer.mode,'spectating');
  assert.equal(death.viewer.studentId,begin.viewer.studentId);
  assert.equal(death.feed.feedId,begin.viewer.feedId,'All spectators share one director');
  assert(death.feed.revision>0,'Global feed advances while the living student follows own hero');
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'on');
  assert.notEqual(await stage.getAttribute('data-v5-follow-target'),'phase2-0-warrior',
   'Dead pupil must leave third-person view');
  assert.match(await page.locator('#studentViewStatus').textContent(),/eliminado.*MESMO diretor/);
  assert.equal(await page.locator('[data-fighter].defeated').count()>=1,true);
  const sharedBefore=Number(await stage.getAttribute('data-v5-shared-feed-revision'));
  await page.locator('#teacherViewButton').click();
  const teacher=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.cameraViewer);
  assert.equal(teacher.viewer.mode,'teacher');
  assert.equal(teacher.feed.feedId,death.feed.feedId);
  assert(teacher.feed.revision>=death.feed.revision,'Teacher uses the existing director, never restarts');
  assert.equal(await stage.getAttribute('data-v5-camera-audience'),'teacher');
  assert.equal(await stage.getAttribute('data-v5-camera-director'),'on');
  assert(Number(await stage.getAttribute('data-v5-shared-feed-revision'))>=sharedBefore);
  // Selected dead hero cannot regain a third-person combat camera.
  await page.locator('#studentViewButton').click();
  assert.equal(await stage.getAttribute('data-v5-student-camera'),'spectating');
  // Switch to the 30-fighter battle with the same four class models.
  await page.locator('[data-roster="30"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:150000});
  assert.equal(await page.locator('#studentViewHero option').count(),30);
  await page.locator('#studentViewHero').selectOption('phase2-17-mage');
  await page.locator('#studentViewButton').click();
  assert.equal(await stage.getAttribute('data-v5-student-camera'),'following');
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5StudentCamera==='spectating',
   null,{timeout:125000});
  const student30=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.cameraViewer);
  assert.equal(student30.viewer.mode,'spectating');
  assert(student30.feed.revision>0);
  assert.equal(student30.viewer.feedId,student30.feed.feedId);
  const cdp=await page.context().newCDPSession(page);
  const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});
  require('node:fs').writeFileSync('qa/v5-camera-f3-student-spectator-30.png',Buffer.from(shot.data,'base64'));
  await cdp.detach();
  await page.locator('[data-mission="10"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.combatEngine==='legacy',null,{timeout:45000});
  assert.equal(await page.locator('#studentViewControls').isVisible(),false);
  assert.equal(await stage.getAttribute('data-v5-camera-audience'),'teacher');
  assert.equal(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.tryStudentCamera('arena-lab-0-warrior')),false,
   'F.3 trial student roles cannot affect legacy M10');
  assert.deepEqual(errors,[],'Browser pageerrors: '+errors.join(' | '));
  console.log('PASS F.3 browser: 4/30 real GLBs, live hero -> shared director on actual KO, teacher reuse and M10 isolated');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
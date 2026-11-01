'use strict';
// H.3/M10: authentic WebGL/SwiftShader observation of three equipped rare talents.
// Cumulative cue telemetry is NOT proof of pixels visible at the sampled camera frame.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const fixture=JSON.parse(fs.readFileSync('qa/v5-m10-rare-equipped-seed.json','utf8'));
const targets=['guardian:J08','hunter:P09','mage:A07'];
const prefix='qa/v5-m10-rare-equipped';
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'
 ]});
 const report={schema:'m10-rare-equipped-webgl-v1',synthetic:true,variant:9,
  seed:fixture.seed,engineProcCounts:fixture.procs,
  renderer:'SwiftShader',physicalPCsValidated:false,humanVisualApproval:false,
  limitation:'Screenshots are sampled after cumulative cue detection; they do not prove the short-lived effect is within camera view.',
  cameraShots:[],rare:{}};
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?m10preview=1&m10variant=9&count=30&phase2=1&nav=steer&counterplay=1&balance=hp2&sprites=1&seed='+fixture.seed,
   {waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:180000});
  const stage=page.locator('#arenaStage');
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m10');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),10);
  assert.match(await page.locator('#phase2Builds').innerText(),/Caminhos V/);
  const builds=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents);
  assert.equal(builds.length,30);
  const equipped=new Set(builds.flatMap(b=>b.ids.map(id=>b.klass+':'+id)));
  for(const b of builds)assert.equal(b.ids.length,10);
  for(const key of targets){
   assert(equipped.has(key),'Rare talent absent from WebGL roster: '+key);
   report.rare[key]={equipped:true,engineProcs:fixture.procs[key],
    firstObservation:null,rendered:false,dropped:false};
  }
  await page.locator('#actionCamera').click();
  for(let i=0;i<4;i++)await page.locator('#speedBattle').click();
  await page.locator('#startBattle').click();
  await page.locator('#expandStage').click();
  const cameraShots=new Set();
  const started=Date.now();
  while(Date.now()-started<300000){
   const sample=await page.evaluate(()=>{
    const d=document.querySelector('#arenaStage').dataset;
    return {finished:window.PIT_V5_ARENA_LAB.finished,
     shot:d.v5CameraShot||'unknown',talentEvents:window.PIT_V5_ARENA_LAB.talentEvents,
     rendered:JSON.parse(d.v5TalentFxRenderedKeys||'[]'),
     dropped:JSON.parse(d.v5TalentFxDroppedKeys||'[]'),
     sprites:Number(d.v5SpriteVisualEvents||0),
     fx:Number(d.v5TalentFxEvents||0),
     spectators:Number(d.v5Spectators||0)};
   });
   cameraShots.add(sample.shot);
   report.lastSample={shot:sample.shot,talentEvents:sample.talentEvents,
    sprites:sample.sprites,fx:sample.fx,spectators:sample.spectators};
   for(const key of targets){
    const row=report.rare[key];
    row.rendered ||=sample.rendered.includes(key);
    row.dropped ||=sample.dropped.includes(key);
    if(!row.firstObservation&&(row.rendered||row.dropped)){
     const filename=prefix+'-'+key.replace(':','-')+'.png';
     row.firstObservation={elapsedWallMs:Date.now()-started,cameraShot:sample.shot,
      classification:row.rendered?'rendered-cue-recorded':'visual-budget-dropped',
      screenshot:filename};
     await page.screenshot({path:filename,timeout:45000});
    }
   }
   if(sample.finished)break;
   await page.waitForTimeout(650);
  }
  assert(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.finished),
   'M10 WebGL battle did not finish in 300 seconds');
  assert.equal(Number(await stage.getAttribute('data-v5-spectators')),29);
  report.cameraShots=[...cameraShots].sort();
  report.result={finished:true,spectators:29,
   winnerClass:await page.evaluate(()=>window.PIT_V5_ARENA_LAB.winner?.klass)};
  report.cuesObserved=targets.filter(k=>report.rare[k].rendered||report.rare[k].dropped).length;
  assert(report.lastSample.sprites>0&&report.lastSample.fx>0,
   'M10 WebGL produced no real talent sprite cues');
  assert(report.cuesObserved>0,'None of the three equipped rare talents produced a recorded visual cue');
  // A real proc is expected to render or be counted as dropped; missing
  // telemetry is a diagnostic failure, not a fabricated success.
  for(const key of targets){
   if(fixture.procs[key]>0)
    assert(report.rare[key].rendered||report.rare[key].dropped,
     'Real rare proc has neither rendered nor dropped cue: '+key);
  }
  await page.screenshot({path:prefix+'-final.png',timeout:45000});
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.body.classList.contains('arena-immersive'));
  await page.locator('[data-mission="5"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:180000});
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m5');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),5);
  assert.equal(await stage.getAttribute('data-v5-talent-fx-rendered-keys'),'[]');
  assert((await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents)).every(b=>b.ids.length===5));
  assert.deepEqual(errors,[],'Browser errors: '+errors.join(' | '));
  report.m5Regression='5 talent slots restored, visual provenance reset';
  fs.writeFileSync(prefix+'.json',JSON.stringify(report,null,2)+'\n');
  console.log('PASS M10 equipped rare WebGL audit: '+JSON.stringify({
   seed:report.seed,engineProcCounts:report.engineProcCounts,
   rare:report.rare,cameraShots:report.cameraShots,
   spectators:29,m5:'restored',G2:'not tested'}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
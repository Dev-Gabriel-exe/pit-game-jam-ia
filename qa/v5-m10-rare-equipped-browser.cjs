'use strict';
// H.3/M10: authentic WebGL/SwiftShader observation of three equipped rare talents.
// Cumulative cue telemetry is NOT proof of pixels visible at the sampled camera frame.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const fixture=JSON.parse(fs.readFileSync(process.env.M10_RARE_FIXTURE||'qa/v5-m10-rare-equipped-seed.json','utf8'));
const targets=['guardian:J08','hunter:P09','mage:A07'];
const prefix=process.env.M10_RARE_PREFIX||'qa/v5-m10-rare-equipped';
// Diagnostic only: emulate a constrained device without modifying classroom hardware.
const lowQuality=process.env.M10_RARE_LOW==='1';
const frameProbe=process.env.M10_FX_PROBE==='1';
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'
 ]});
 const report={schema:'m10-rare-equipped-webgl-v1',synthetic:true,variant:9,
  seed:fixture.seed,engineProcCounts:fixture.procs,
  renderer:'SwiftShader',qualityMode:lowQuality?'low':'auto',
  emulatedDeviceMemoryGb:lowQuality?2:null,physicalPCsValidated:false,humanVisualApproval:false,
  projectionAudit:frameProbe?'frustum-centre-per-rendered-frame':'disabled',
  limitation:'Screenshots are sampled after cumulative cue detection; they do not prove the short-lived effect is within camera view.',
  cameraShots:[],rare:{}};
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768},
   reducedMotion:lowQuality?'no-preference':'reduce'});
  if(lowQuality)await page.addInitScript(()=>{
   Object.defineProperty(navigator,'deviceMemory',{configurable:true,value:2});
  });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?m10preview=1&m10variant=9&count=30&phase2=1&nav=steer&counterplay=1&balance=hp2&sprites=1&seed='+fixture.seed+(frameProbe?'&m10fxprobe=1':''),
   {waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:180000});
  const stage=page.locator('#arenaStage');
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m10');
  assert.equal(await stage.getAttribute('data-v5-quality-mode'),lowQuality?'low':'auto',
   'Renderer must honor the expected quality preset');
  if(frameProbe)assert.equal(await stage.getAttribute('data-v5-fx-probe-enabled'),'true');
  if(lowQuality){
   assert.equal(Number(await stage.getAttribute('data-v5-sprite-frames')),3,
    'Low-quality sprite atlas must use three frames, not the normal six');
   assert(Number(await stage.getAttribute('data-v5-sprite-textures'))>0,
    'Low-quality mode must still draw genuine talent sprites');
  }
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
     liveInFrame:JSON.parse(d.v5FxProbeActiveKeys||'[]'),
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
    if(frameProbe&&sample.liveInFrame.includes(key)&&!row.liveInFrameCapture){
     const filename=prefix+'-live-'+key.replace(':','-')+'.png';
     row.liveInFrameCapture={elapsedWallMs:Date.now()-started,cameraShot:sample.shot,
      screenshot:filename,proof:'mesh centre was inside camera frustum at sampling time; pixels/occlusion unverified'};
     await page.screenshot({path:filename,timeout:45000});
    }
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
    assert(report.rare[key].rendered,
     'Real rare proc did not obtain the bounded M10 subtle visual lane: '+key);
  }
  if(frameProbe){
   const projection=await page.evaluate(()=>{
    const d=document.querySelector('#arenaStage').dataset;
    return {projected:JSON.parse(d.v5FxProbeVisibleFrames||'{}'),
     offscreen:JSON.parse(d.v5FxProbeOffscreenFrames||'{}'),
     lifecycle:JSON.parse(d.v5FxProbeLifecycle||'{}')};
   });
   const total=Object.values(projection.projected).reduce((a,b)=>a+b,0);
   const offscreen=Object.values(projection.offscreen).reduce((a,b)=>a+b,0);
   assert(total+offscreen>0,'Projection probe did not sample any live cue mesh');
   assert(total>0,'No cue mesh centre entered the camera frustum in this battle');
   for(const [key,n] of Object.entries({...projection.projected,...projection.offscreen})){
    assert(equipped.has(key),'Projected cue must belong to an equipped talent: '+key);
    assert(Number.isInteger(n)&&n>0,'Projection counts must be positive frame samples');
   }
   report.projection={...projection,projectedFrameSamples:total,offscreenFrameSamples:offscreen,
    rareTargets:Object.fromEntries(targets.map(k=>[k,{
     projected:projection.projected[k]||0,offscreen:projection.offscreen[k]||0}])),
    limitation:'Frustum centre samples after WebGL render, not pixel contrast, occlusion, or human projector legibility.'};
   for(const key of targets){
    const life=projection.lifecycle[key];
    assert(life&&life.created>0,'Rare proc did not create a tracked cue: '+key);
    assert(life.renderedOnce<=life.created,'Rendered count exceeds created: '+key);
    assert(life.renderedOnce>0,'M10 rare proc was evicted before its first WebGL frame: '+key);
    const removed=life.evictedBeforeFrame+life.evictedAfterFrame+
     life.expiredBeforeFrame+life.expiredAfterFrame;
    assert(removed<=life.created,'More removals than created cues: '+key);
    report.rare[key].lifecycle={...life,removed,pendingOrLive:life.created-removed,
     neverReachedFirstFrame:life.evictedBeforeFrame+life.expiredBeforeFrame};
    const projected=projection.projected[key]||0,offscreen=projection.offscreen[key]||0;
    assert(projected+offscreen>0,'M10 rare proc had no camera-projection frame: '+key);
    report.rare[key].projection={projectedFrameSamples:projected,offscreenFrameSamples:offscreen,
     liveScreenshotCaptured:!!report.rare[key].liveInFrameCapture};
    // Distinguish a real in-frustum screenshot from historical event counters.
    if(report.rare[key].liveInFrameCapture)
     assert(projected>0,'Live in-frustum capture has no corresponding projected frames: '+key);
   }
   console.log('M10 FX lifecycle diagnostic '+JSON.stringify(Object.fromEntries(targets.map(k=>[k,report.rare[k].lifecycle]))));
   console.log('M10 LIVE frustum distribution '+JSON.stringify({
    targets:report.projection.rareTargets,liveCaptures:targets.filter(k=>!!report.rare[k].liveInFrameCapture),
    projectedFrameSamples:total,offscreenFrameSamples:offscreen}));
  }
  await page.screenshot({path:prefix+'-final.png',timeout:45000});
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.body.classList.contains('arena-immersive'));
  await page.locator('[data-mission="5"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:180000});
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m5');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),5);
  assert.equal(await stage.getAttribute('data-v5-talent-fx-rendered-keys'),'[]');
  if(frameProbe){
   assert.equal(await stage.getAttribute('data-v5-fx-probe-visible-frames'),'{}');
   assert.equal(await stage.getAttribute('data-v5-fx-probe-offscreen-frames'),'{}');
   assert.equal(await stage.getAttribute('data-v5-fx-probe-lifecycle'),'{}');
  }
  assert((await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents)).every(b=>b.ids.length===5));
  assert.deepEqual(errors,[],'Browser errors: '+errors.join(' | '));
  report.m5Regression='5 talent slots restored, visual provenance reset';
  report.qualityGate=lowQuality?
   'Synthetic 2GB deviceMemory, low quality, three sprite frames, 30 GLBs, genuine cues and M5 rollback':
   'Default quality path preserved';
  fs.writeFileSync(prefix+'.json',JSON.stringify(report,null,2)+'\n');
  console.log('PASS M10 equipped rare WebGL audit: '+JSON.stringify({
   seed:report.seed,engineProcCounts:report.engineProcCounts,
   rare:report.rare,cameraShots:report.cameraShots,
   spectators:29,m5:'restored',G2:'not tested'}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
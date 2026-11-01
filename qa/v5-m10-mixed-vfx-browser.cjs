'use strict';
// H.3/M10 — visual timeline audit with mixed fictional builds and opt-in talent sprites.
// Browser/WebGL (SwiftShader) is NOT hardware G.2 or human projector homologation.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const P=require('../v5/phase2-combat.js');
const typeByKey=new Map(Object.entries(P.TALENTS).flatMap(([klass,talents])=>
 talents.map(t=>[klass+':'+t.id,t.type])));
const PREFIX='qa/v5-m10-mixed-vfx';
const SEED=4175863657;
function overlap(a,b,gap=1){
 return a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
}
function within(a,b,gap=3){
 return a.left>=b.left-gap&&a.right<=b.right+gap&&a.top>=b.top-gap&&a.bottom<=b.bottom+gap;
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'
 ]});
 const report={schema:'m10-mixed-vfx-timeline-v1',synthetic:true,seed:SEED,
  renderer:'SwiftShader',physicalPCsValidated:false,humanVisualApproval:false,samples:[]};
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?m10preview=1&count=30&phase2=1&nav=steer&counterplay=1&balance=hp2&sprites=1&seed='+SEED,
   {waitUntil:'domcontentloaded',timeout:55000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:180000});
  const stage=page.locator('#arenaStage');
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m10');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),10);
  assert.equal(Number(await stage.getAttribute('data-v5-talent-fx-catalog')),120);
  assert.equal(await stage.getAttribute('data-v5-sprite-mode'),'on');
  assert(Number(await stage.getAttribute('data-v5-sprite-textures'))>0);
  assert.equal(await page.locator('[data-fighter]').count(),30);
  const builds=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents);
  const byClass={};
  const equipped=new Set(builds.flatMap(b=>b.ids.map(id=>b.klass+':'+id)));
  let previousRendered=new Set(),previousDropped=new Set();
  for(const b of builds){
   assert.equal(b.ids.length,10);
   assert.equal(new Set(b.ids).size,10);
   (byClass[b.klass]??=[]).push(b.ids.join(','));
  }
  assert.deepEqual(Object.keys(byClass).sort(),['guardian','hunter','mage','warrior']);
  for(const [klass,variants] of Object.entries(byClass))
   assert(new Set(variants).size>=2,'M10 needs mixed builds within '+klass);
  report.roster={fighters:30,classes:Object.fromEntries(Object.entries(byClass).map(([k,v])=>[k,{
   participants:v.length,uniqueBuilds:new Set(v).size}])),talentsPerFighter:10,pointsPerFighter:20};
  await page.locator('#actionCamera').click();
  for(let i=0;i<4;i++)await page.locator('#speedBattle').click();
  await page.locator('#startBattle').click();
  await page.locator('#expandStage').click();
  const cdp=await page.context().newCDPSession(page);
  async function sample(label,threshold){
   await page.waitForFunction(n=>window.PIT_V5_ARENA_LAB?.talentEvents>=n,threshold,{timeout:210000});
   assert.equal(await page.locator('#pauseBattle').isDisabled(),false,
    'Battle finished before timeline sample '+label);
   await page.locator('#pauseBattle').click();
   await page.waitForFunction(()=>document.querySelector('#arenaStatus')?.textContent.includes('PAUSAD'),null,{timeout:10000});
   await page.waitForFunction(()=>{
    const el=document.querySelector('#arenaStage');
    return el?.dataset.v5NickLayoutWidth===String(el.clientWidth);
   },null,{timeout:45000});
   const data=await page.evaluate(()=>{
    const stage=document.querySelector('#arenaStage');
    const box=el=>{const r=el.getBoundingClientRect();return {
     left:r.left,right:r.right,top:r.top,bottom:r.bottom};};
    const visible=el=>getComputedStyle(el).display!=='none'&&el.getClientRects().length>0;
    return {
     events:window.PIT_V5_ARENA_LAB.talentEvents,
     talentFx:+stage.dataset.v5TalentFxEvents,
     talentFxDropped:+stage.dataset.v5TalentFxDropped,
     renderedKeys:JSON.parse(stage.dataset.v5TalentFxRenderedKeys||'[]'),
     droppedKeys:JSON.parse(stage.dataset.v5TalentFxDroppedKeys||'[]'),
     spriteFx:+stage.dataset.v5SpriteVisualEvents,
     spriteDropped:+stage.dataset.v5SpriteVisualDropped,
     cueTypes:Object.fromEntries(['ativo','passivo','reativo'].map(kind=>{
      const suffix=kind[0].toUpperCase()+kind.slice(1);
      return [kind,{rendered:Number(stage.dataset['v5TalentFxRendered'+suffix]),
       dropped:Number(stage.dataset['v5TalentFxDropped'+suffix])}];
     })),
     cue:stage.dataset.v5TalentCueLast,style:stage.dataset.v5TalentCueStyle,
     camera:stage.dataset.v5CameraShot,alive:+document.querySelector('#aliveCount').textContent.match(/\d+/)?.[0],
     stage:box(stage),
     names:[...document.querySelectorAll('.arena-nickname')].filter(visible).map(el=>({id:el.dataset.fighterId,...box(el)})),
     hud:[...document.querySelectorAll('#battleSpotlight,#talentTelemetry,.battle-legend,.stage-flair')]
      .filter(visible).map(el=>({id:el.id||el.className,...box(el)}))
    };
   });
   assert(data.events>=threshold);
   assert(data.talentFx>0&&data.spriteFx>0,'Real M10 talent effects and sprites must execute');
   for(const [kind,keys,previous,total] of [
    ['rendered',data.renderedKeys,previousRendered,data.talentFx],
    ['dropped',data.droppedKeys,previousDropped,data.talentFxDropped]]){
    assert.deepEqual(keys,[...new Set(keys)].sort(),kind+' keys must be canonical and sorted');
    assert(keys.length<=total,kind+' unique cues cannot exceed event count');
    for(const key of keys){
     assert(equipped.has(key),'Visual cue not selected in any fictional M10 build: '+key);
     assert(typeByKey.has(key),'Visual cue absent from 120-talent catalog: '+key);
    }
    for(const key of previous)assert(keys.includes(key),kind+' cue provenance lost between samples: '+key);
   }
   previousRendered=new Set(data.renderedKeys);
   previousDropped=new Set(data.droppedKeys);
   assert.match(data.cue,/^(warrior|mage|hunter|guardian):[A-Z][0-9]{2}$/);
   assert(data.style,'M10 talent must select a visual motif');
   assert(Number.isFinite(data.spriteDropped)&&data.spriteDropped>=0);
   assert.equal(Object.values(data.cueTypes).reduce((n,t)=>n+t.rendered,0),data.talentFx,
    'Rendered cue-type totals must equal genuine visual events');
   assert.equal(Object.values(data.cueTypes).reduce((n,t)=>n+t.dropped,0),
    Number(await stage.getAttribute('data-v5-talent-fx-dropped')),
    'Dropped cue-type totals must match the visual budget counter');
   for(let i=0;i<data.names.length;i++){
    const nick=data.names[i];
    assert(within(nick,data.stage),'Nickname outside stage at '+label+': '+nick.id);
    for(const hud of data.hud)assert(!overlap(nick,hud),
     'Nickname covers '+hud.id+' at '+label+': '+nick.id);
    for(let j=0;j<i;j++)assert(!overlap(nick,data.names[j]),
     'Overlapping nicknames at '+label+': '+nick.id+'/'+data.names[j].id);
   }
   const shot=await cdp.send('Page.captureScreenshot',{
    format:'png',fromSurface:true,captureBeyondViewport:false});
   const screenshot=PREFIX+'-'+label+'.png';
   fs.writeFileSync(screenshot,Buffer.from(shot.data,'base64'));
   report.samples.push({label,threshold,...data,screenshot});
   fs.writeFileSync(PREFIX+'.json',JSON.stringify(report,null,2)+'\n');
   await page.locator('#pauseBattle').click();
  }
  await sample('early',5);
  await sample('middle',15);
  await sample('late',30);
  assert(report.samples.some(s=>s.names.length>0),'At least one cinematic shot must show a readable name');
  for(let i=1;i<report.samples.length;i++){
   assert(report.samples[i].talentFx>=report.samples[i-1].talentFx);
   assert(report.samples[i].spriteFx>=report.samples[i-1].spriteFx);
  }
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.finished,null,{timeout:240000});
  assert(await page.evaluate(()=>window.PIT_V5_ARENA_LAB.winner?.id));
  assert.equal(Number(await stage.getAttribute('data-v5-spectators')),29);
  const finalTypes=await page.evaluate(()=>{
   const d=document.querySelector('#arenaStage').dataset;
   return Object.fromEntries(['ativo','passivo','reativo'].map(kind=>{
    const suffix=kind[0].toUpperCase()+kind.slice(1);
    return [kind,{rendered:Number(d['v5TalentFxRendered'+suffix]),
     dropped:Number(d['v5TalentFxDropped'+suffix])}];
   }));
  });
  report.finalCueTypes=finalTypes;
  const finalKeys=await page.evaluate(()=>({
   rendered:JSON.parse(document.querySelector('#arenaStage').dataset.v5TalentFxRenderedKeys||'[]'),
   dropped:JSON.parse(document.querySelector('#arenaStage').dataset.v5TalentFxDroppedKeys||'[]')
  }));
  for(const key of previousRendered)assert(finalKeys.rendered.includes(key),'Rendered key disappeared');
  for(const kind of ['ativo','passivo','reativo'])
   assert(finalKeys.rendered.some(key=>typeByKey.get(key)===kind),
    'No actual WebGL cue rendered for talent type '+kind);
  // Rare effects: distinguish selected, actually rendered, budget-dropped,
  // and never selected. A drawn cue can still be outside the camera frame.
  const rareTargets=['guardian:J08','hunter:P09','mage:A07'];
  report.rareVisual=Object.fromEntries(rareTargets.map(key=>{
   const selected=equipped.has(key);
   const rendered=finalKeys.rendered.includes(key);
   const dropped=finalKeys.dropped.includes(key);
   const snapshotLabels=report.samples.filter(sample=>
    sample.renderedKeys.includes(key)).map(sample=>sample.label);
   assert(!rendered||selected,'Unselected rare cue rendered: '+key);
   assert(!dropped||selected,'Unselected rare cue dropped: '+key);
   return [key,{selected,rendered,dropped,snapshotLabels,
    interpretation:!selected?'not-equipped-in-this-roster':
     rendered?'rendered-cue-not-camera-visibility-proof':
     dropped?'dropped-by-visual-budget':'selected-but-no-rendered-cue-observed'}];
  }));
  report.finalVisualKeys={rendered:finalKeys.rendered,dropped:finalKeys.dropped,
   byType:Object.fromEntries(['ativo','passivo','reativo'].map(kind=>
    [kind,finalKeys.rendered.filter(key=>typeByKey.get(key)===kind).length]))};
  assert(finalTypes.ativo.rendered>0,'No active talent visual was rendered');
  assert(finalTypes.passivo.rendered>0,'No passive proc visual was rendered');
  assert(finalTypes.reativo.rendered>0,'No reactive proc visual was rendered');
  report.result={finished:true,spectators:29,winnerClass:await page.evaluate(()=>window.PIT_V5_ARENA_LAB.winner?.klass)};
  // Exit the accessible immersive dialog before interacting with the background mission selector.
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.body.classList.contains('arena-immersive'));
  await page.locator('[data-mission="5"]').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:160000});
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m5');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),5);
  assert.equal(await stage.getAttribute('data-v5-talent-fx-rendered-keys'),'[]',
   'M10 rendered cue provenance must reset before M5');
  assert.equal(await stage.getAttribute('data-v5-talent-fx-dropped-keys'),'[]',
   'M10 dropped cue provenance must reset before M5');
  assert((await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents)).every(b=>b.ids.length===5));
  report.m5Regression='5 talents, legacy M5 engine restored';
  assert.deepEqual(errors,[],'Uncaught browser errors: '+errors.join(' | '));
  fs.writeFileSync(PREFIX+'.json',JSON.stringify(report,null,2)+'\n');
  await cdp.detach();
  console.log('M10 rare visual cue provenance: '+JSON.stringify(report.rareVisual));
  console.log('PASS M10 mixed-build VFX timeline: 30 GLBs, 3 snapshots, genuine active/passive/reactive sprite cues, 29 spectators and M5 rollback.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

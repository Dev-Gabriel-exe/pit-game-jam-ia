'use strict';
// H.3/M10: rare canonical talent PROC audit in fictional 30-player battles.
// A proc and a valid cue descriptor do NOT prove an on-screen sprite is visible.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const R=require('../v5/m10-visual-roster.js');
const V=require('../v5/talent-vfx.js');
const S=require('../v5/talent-sprites.js');
const C=require('../v5/talent-choreography.js');
const TARGETS=Object.freeze({
 'guardian:J08':'passivo',
 'hunter:P09':'reativo',
 'mage:A07':'passivo'
});
const policy=H.createPolicy(P.TALENTS);
const manifest=V.manifest(P.TALENTS);
const report={schema:'m10-rare-proc-audit-v1',synthetic:true,
 physicalPCsValidated:false,humanVisualApproval:false,
 warning:'Engine proc and valid VFX metadata are not proof of rendered pixels, camera visibility or projector readability.',
 battles:0,variants:11,seedsPerVariant:2,targets:{}};
for(const [key,type] of Object.entries(TARGETS)){
 const [klass,id]=key.split(':');
 const talent=P.TALENTS[klass].find(t=>t.id===id);
 assert(talent&&talent.type===type,'Rare target must remain canonical: '+key);
 const cue=manifest[klass].find(t=>t.id===id);
 assert(cue&&cue.type===type&&cue.key===key);
 const sprite=S.spec(cue.style,{subtle:true});
 const choreography=C.plan(cue);
 assert(sprite&&sprite.frames>0&&choreography&&choreography.duration>0,
  'Missing visual descriptor for '+key);
 report.targets[key]={type,style:cue.style,signature:cue.signature,
  selectedBattles:0,procEvents:0,chargeEvents:0,procBattles:0,
  firstProc:null};
}
const opts={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
for(let variant=0;variant<11;variant++){
 const roster=R.createRoster(P,policy,{count:30,variant});
 const owners=new Map(roster.map(x=>[x.id,x]));
 assert.equal(owners.size,30);
 for(const hero of roster){
  assert.equal(hero.build.talents.length,10);
  assert.equal(Object.values(hero.build.attributes).reduce((sum,n)=>sum+n,0),20);
 }
 for(const baseSeed of [4175863657,20261101]){
  const seed=baseSeed+variant;
  const result=P.battle(roster,{...opts,seed}).run(3000);
  assert(result.finished&&result.winner?.id&&result.standings.length===30,
   'M10 rare-proc trial must finish');
  report.battles++;
  const selected=new Set(roster.flatMap(hero=>hero.build.talents.map(id=>hero.build.klass+':'+id)));
  const observedThisBattle=new Set();
  for(const key of Object.keys(TARGETS))
   if(selected.has(key))report.targets[key].selectedBattles++;
  for(const e of result.events){
   if(!['proc','charge'].includes(e.type)||!e.talent)continue;
   const owner=owners.get(e.hero);
   assert(owner,'Event owner absent from fictional roster');
   const key=owner.build.klass+':'+e.talent;
   if(!Object.hasOwn(TARGETS,key))continue;
   assert(owner.build.talents.includes(e.talent),'Rare proc is not equipped: '+key);
   assert(selected.has(key),'Rare proc is not selected: '+key);
   const row=report.targets[key];
   if(e.type==='charge'){row.chargeEvents++;continue;}
   row.procEvents++;
   observedThisBattle.add(key);
   if(!row.firstProc)row.firstProc={variant,seed,seq:e.seq,owner:owner.id,
    eventType:e.type,kind:e.kind||null};
  }
  for(const key of observedThisBattle)report.targets[key].procBattles++;
 }
}
assert.equal(report.battles,22);
for(const [key,row] of Object.entries(report.targets)){
 assert(row.selectedBattles>0,'Rare talent not selected by any M10 roster: '+key);
 assert(row.procEvents>0,'Rare talent selected but no actual proc in 22 M10 trials: '+key);
 assert(row.procBattles<=row.selectedBattles);
 assert(row.firstProc&&Number.isInteger(row.firstProc.seq));
}
// Preserve original M5: neither selection budget nor battle result changes.
const m5=[
 {id:'trial-rare-m5-warrior',approvedMissions:5,build:P.exampleBuild('warrior','M5 Warrior',5,4)},
 {id:'trial-rare-m5-mage',approvedMissions:5,build:P.exampleBuild('mage','M5 Mage',5,7)}
];
for(const hero of m5){
 assert.equal(hero.build.talents.length,5);
 assert.equal(Object.values(hero.build.attributes).reduce((sum,n)=>sum+n,0),10);
}
const before=P.battle(m5,{seed:4175863657,arenaScale:5,damageScale:.5}).run(3000);
const after=P.battle(m5,{seed:4175863657,arenaScale:5,damageScale:.5,arenaMission:5}).run(3000);
assert.deepEqual(after,before,'M5 must remain byte-identical');
report.m5Regression='byte-identical; five talents and ten attribute points';
fs.writeFileSync('qa/v5-m10-rare-procs-report.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS M10 rare PROC provenance (synthetic only): '+JSON.stringify({
 battles:report.battles,targets:Object.fromEntries(Object.entries(report.targets)
  .map(([key,row])=>[key,{selectedBattles:row.selectedBattles,
   procEvents:row.procEvents,procBattles:row.procBattles,style:row.style}])),
 m5:'identical',G2:'not tested',visual:'not yet verified'}));

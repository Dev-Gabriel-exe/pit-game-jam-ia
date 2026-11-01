'use strict';
// H.3/M10 — isolated reproduction of hunter:P09 (Tiro de Interrupção).
// Fictional 2-player lab only. No authentication, persistence, XP or production changes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const approvals=Array.from({length:10},(_,i)=>i+1);
function entry(klass,id,extras=[],excluded=[]){
 const m5=P.exampleBuild(klass,id,5,0);
 const m10=P.exampleBuild(klass,id,10,0,{experimentalFinal:true});
 const talents=[...m5.talents];
 for(const t of extras)if(!talents.includes(t))talents.push(t);
 for(const t of P.TALENTS[klass].map(x=>x.id))
  if(talents.length<10&&!talents.includes(t)&&!excluded.includes(t))talents.push(t);
 assert.equal(talents.length,10);
 const adapted=policy.m10ArenaAdapter({rosterKey:id,klass,
  completedMissions:approvals,build:{attributes:m10.attributes,talents},
  m5Entered:true,m5Frozen:{attributes:m5.attributes,talents:m5.talents},
  m10Locked:true});
 assert.equal(adapted.build.talents.length,10);
 assert.equal(Object.values(adapted.build.attributes).reduce((a,b)=>a+b,0),20);
 return {...adapted,id};
}
const mage=entry('mage','trial-p09-mage',['A10','R10','E10']);
const hunter=entry('hunter','trial-p09-hunter',['P09','P01','E10']);
const hunterControl=entry('hunter','trial-p09-hunter',['P01','E10'],['P09']);
assert(mage.build.talents.includes('A10'));
assert(hunter.build.talents.includes('P09'));
assert(!hunterControl.build.talents.includes('P09'));
const opts={arenaMission:10,arenaScale:5,damageScale:.4,stormDelay:50,
 stormRateFactor:.55,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2',
 experimentalSpawnPositions:{
  'trial-p09-mage':{x:18,z:8,face:0},
  'trial-p09-hunter':{x:22,z:8,face:Math.PI}
 }};
const seeds=[20261101,20261031,3719,4175863657];
const trials=[];
for(const seed of seeds){
 const options={...opts,seed};
 const result=P.battle([mage,hunter],options).run();
 assert(result.finished&&result.winner&&result.events.some(e=>e.type==='end'));
 const preparations=result.events.filter(e=>e.type==='prepare'&&e.hero===mage.id&&e.ability==='Supernova Silenciosa');
 const procs=result.events.filter(e=>e.type==='proc'&&e.hero===hunter.id&&e.talent==='P09');
 const launches=result.events.filter(e=>e.type==='launch'&&e.hero===hunter.id&&e.talent==='P09');
 const interruptions=result.events.filter(e=>e.type==='interrupt'&&e.hero===hunter.id&&e.talent==='P09');
 assert(preparations.length>0,'Mage never prepared telegraphed A10');
 assert(procs.length>0,'Hunter P09 never reacted to nearby telegraphed A10');
 assert.equal(launches.length,procs.length,'Each P09 proc must launch one interruption projectile');
 for(const proc of procs){
  assert.equal(proc.target,mage.id,'P09 must target the actual caster');
  assert(preparations.some(p=>p.seq<proc.seq),'P09 proc preceded telegraphed cast');
 }
 for(let i=1;i<procs.length;i++)
  assert(procs[i].time-procs[i-1].time>=20.9,'P09 ignored its 21s cooldown');
 for(const interruption of interruptions){
  assert.equal(interruption.target,mage.id);
  assert(procs.some(p=>p.seq<interruption.seq),'Interrupt without P09 activation');
 }
 const replay=P.battle([mage,hunter],options).run();
 assert.deepEqual(replay,result,'Focused P09 replay must be deterministic');
 const control=P.battle([mage,hunterControl],options).run();
 assert(!control.events.some(e=>e.talent==='P09'&&['proc','launch','interrupt'].includes(e.type)),
  'Unselected P09 must never fire');
 trials.push({seed,duration:result.time,preparations:preparations.length,
  procs:procs.length,launches:launches.length,interruptions:interruptions.length,
  controlProcs:0,winnerClass:result.winner.klass});
}
const m5=[
 {id:'trial-p09-m5-mage',build:P.exampleBuild('mage','trial-p09-m5-mage',5,0),approvedMissions:5},
 {id:'trial-p09-m5-hunter',build:P.exampleBuild('hunter','trial-p09-m5-hunter',5,0),approvedMissions:5}
];
const m5opts={seed:20261101,arenaScale:5};
assert.deepEqual(P.battle(m5,m5opts).run(),
 P.battle(m5,{...m5opts,arenaMission:5}).run(),
 'M5 must remain identical when arenaMission:5 is explicit');
const report={schema:'m10-p09-focused-v1',synthetic:true,
 physicalPCsValidated:false,humanVisualApproval:false,talent:'hunter:P09',
 trigger:'nearby telegraphed AoE caster (A10), 8-unit range, 21s cooldown',
 trials,m5Regression:'identical',limitations:[
  'Engine events are not proof of on-screen legibility',
  'J08 remains an unverified focused case',
  'G.2 physical PCs and H.1/H.2 real-user integration remain blocked'
 ]};
fs.writeFileSync('qa/v5-m10-p09-focused-report.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS M10 focused P09 + M5 regression: '+JSON.stringify(trials));

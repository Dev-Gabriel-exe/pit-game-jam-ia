'use strict';
// H.3/M10 — isolated causal reproduction of mage:A07 (Foco Celeste).
// Fictional builds only; no login, persistence, XP, class rebalance or UI mutation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const P = require('../v5/phase2-combat.js');
const H = require('../v5/progression-contract-h0.js');
const policy = H.createPolicy(P.TALENTS);
const approvals = Array.from({length:10},(_,i)=>i+1);
function entry(klass,id,extras) {
  const m5 = P.exampleBuild(klass,id,5,0);
  const m10 = P.exampleBuild(klass,id,10,0,{experimentalFinal:true});
  const talents = [...m5.talents];
  for(const t of extras)if(!talents.includes(t))talents.push(t);
  for(const t of P.TALENTS[klass].map(x=>x.id))
    if(talents.length<10&&!talents.includes(t))talents.push(t);
  assert.equal(talents.length,10);
  const adapted = policy.m10ArenaAdapter({
    rosterKey:id,klass,completedMissions:approvals,
    build:{attributes:m10.attributes,talents},
    m5Entered:true,m5Frozen:{attributes:m5.attributes,talents:m5.talents},
    m10Locked:true
  });
  return {...adapted,id};
}
const mage = entry('mage','trial-a07-mage',['A07','A01','A08','E10','R10']);
const guardian = entry('guardian','trial-a07-guardian',['G10','J08','J01','J10','L10']);
assert(mage.build.talents.includes('A07'));
assert.equal(mage.build.talents.length,10);
assert.equal(Object.values(mage.build.attributes).reduce((a,b)=>a+b,0),20);
const entries=[mage,guardian];
const options={
  arenaMission:10,arenaScale:5,damageScale:.4,stormDelay:50,
  stormRateFactor:.55,engagementMode:'spaced',navigationMode:'steer',
  rangedCommitment:'recovery',balancePreset:'e-hp2',
  experimentalSpawnPositions:{
    'trial-a07-mage':{x:18,z:8,face:0},
    'trial-a07-guardian':{x:36,z:8,face:Math.PI}
  }
};
const seeds=[20261101,20261031,3719,4175863657];
const trials=[];
for(const seed of seeds){
  const opts={...options,seed};
  const result=P.battle(entries,opts).run();
  assert(result.finished&&result.winner&&result.events.some(e=>e.type==='end'));
  const a07=result.events.filter(e=>e.hero===mage.id&&e.talent==='A07');
  const charges=a07.filter(e=>e.type==='charge');
  const procs=a07.filter(e=>e.type==='proc');
  assert(a07.every(e=>['charge','proc'].includes(e.type)),
    'Unexpected A07 event type');
  for(const proc of procs){
    const charge=charges.find(c=>c.seq<proc.seq);
    assert(charge,'A07 proc without prior readiness charge');
    assert(proc.time>=charge.time,'A07 proc preceded readiness');
  }
  assert(charges.every(e=>e.time>=3.99),'A07 charged before four seconds');
  trials.push({seed,winnerClass:result.winner.klass,
    duration:result.time,charges:charges.length,procs:procs.length,
    firstCharge:charges[0]?.time??null,firstProc:procs[0]?.time??null});
}
assert(trials.some(t=>t.charges>0),'A07 never reached its four-second readiness condition');
assert(trials.some(t=>t.procs>0),'A07 charged but never fired in the focused M10 fixture');
// Verify the original M5 route is unchanged, without experimental M10 flags.
const m5=[
  {id:'trial-a07-m5-mage',build:P.exampleBuild('mage','trial-a07-m5-mage',5,0),approvedMissions:5},
  {id:'trial-a07-m5-guardian',build:P.exampleBuild('guardian','trial-a07-m5-guardian',5,0),approvedMissions:5}
];
const m5opts={seed:20261101,arenaScale:5};
assert.deepEqual(P.battle(m5,m5opts).run(),
  P.battle(m5,{...m5opts,arenaMission:5}).run(),
  'M5 changed when explicit arenaMission:5 was provided');
const report={schema:'m10-a07-focused-v1',synthetic:true,
  physicalPCsValidated:false,humanVisualApproval:false,
  talent:'mage:A07',trigger:'4s without HP damage, then a spell',
  trials,m5Regression:'identical',limitations:[
    'Engine event activation is not proof of visual legibility',
    'P09 and J08 remain separate unverified focused cases',
    'G.2 on physical PCs and H.1/H.2 real-user integration remain blocked'
  ]};
fs.writeFileSync('qa/v5-m10-a07-focused-report.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS M10 focused A07 + M5 regression: '+JSON.stringify(trials));

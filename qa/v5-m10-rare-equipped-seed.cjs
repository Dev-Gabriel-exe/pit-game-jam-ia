'use strict';
// H.3/M10 synthetic fixture: find a reproducible seed with rare genuine procs.
// No network, account, XP, approvals, classroom, or persisted student data.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const R=require('../v5/m10-visual-roster.js');
const variant=9;
const keys=['guardian:J08','hunter:P09','mage:A07'];
const roster=R.createRoster(P,H.createPolicy(P.TALENTS),{count:30,variant});
assert.equal(roster.length,30);
const owners=new Map(roster.map(h=>[h.id,h]));
const equipped=new Set(roster.flatMap(h=>h.build.talents.map(t=>h.build.klass+':'+t)));
for(const key of keys)assert(equipped.has(key),'Variant 9 must equip '+key);
for(const h of roster){
 assert.equal(h.build.talents.length,10);
 assert.equal(Object.values(h.build.attributes).reduce((a,b)=>a+b,0),20);
}
const options={arenaMission:10,arenaScale:5,limit:145,damageScale:.5,
 mageDamageBonus:1.10,stormDelay:40,stormRateFactor:.55,
 engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
let best=null,checked=0;
for(let i=0;i<80;i++){
 const seed=(i%2?4175863657+Math.floor(i/2):20261101+Math.floor(i/2)*17)>>>0;
 const battle=P.battle(roster,{...options,seed}).run(3000);
 assert(battle.finished&&battle.winner?.id&&battle.standings.length===30,
  'M10 seed must finish with all 30 standings');
 const procs=Object.fromEntries(keys.map(k=>[k,0]));
 for(const ev of battle.events){
  if(ev.type!=='proc'||!ev.talent)continue;
  const owner=owners.get(ev.hero);
  assert(owner,'Proc from unknown fictional participant');
  const key=owner.build.klass+':'+ev.talent;
  if(Object.hasOwn(procs,key)){
   assert(owner.build.talents.includes(ev.talent),'Unequipped rare proc');
   procs[key]++;
  }
 }
 const score=Object.values(procs).filter(n=>n>0).length;
 checked++;
 if(!best||score>best.score||score===best.score&&Object.values(procs).reduce((a,b)=>a+b,0)>Object.values(best.procs).reduce((a,b)=>a+b,0))
  best={seed,score,procs,winnerClass:battle.winner.klass};
 if(score===3)break;
}
assert(best&&best.score>0,'No rare talent proc in 80 synthetic seeds');
const m5=[
 {id:'trial-m5-rare-a',approvedMissions:5,build:P.exampleBuild('warrior','a',5,0)},
 {id:'trial-m5-rare-b',approvedMissions:5,build:P.exampleBuild('mage','b',5,1)}
];
assert.deepEqual(P.battle(m5,{seed:20261101,arenaScale:5}).run(),
 P.battle(m5,{seed:20261101,arenaScale:5,arenaMission:5}).run(),
 'Original M5 must remain identical');
const report={schema:'m10-rare-equipped-seed-v1',synthetic:true,variant,
 seed:best.seed,procs:best.procs,distinctRareProcs:best.score,
 checkedSeeds:checked,allThreeProcced:best.score===3,
 m5Regression:'identical',physicalPCsValidated:false,humanVisualApproval:false,
 limitation:'Engine proc does not prove WebGL sprite rendering or camera visibility.'};
fs.writeFileSync('qa/v5-m10-rare-equipped-seed.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS synthetic M10 rare-equipped seed search: '+JSON.stringify(report));
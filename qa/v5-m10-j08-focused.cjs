'use strict';
// H.3/M10 — focused causal J08: two real shield absorptions, then a special hit.
// Fictional laboratory only; no authentication, persistence, XP or real students.
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
const guardian=entry('guardian','trial-j08-guardian',['J08','G10','J01','J03','J04']);
const guardianControl=entry('guardian','trial-j08-guardian',
 ['G10','J01','J03','J04'],['J08']);
const hunter=entry('hunter','trial-j08-hunter',['P01','P03','P06','E10']);
assert(guardian.build.talents.includes('J08'));
assert(!guardianControl.build.talents.includes('J08'));
assert(guardian.build.talents.includes('G01'));
assert(guardian.build.talents.some(t=>['J01','J03','J04'].includes(t)));
const opts={arenaMission:10,arenaScale:5,damageScale:.3,stormDelay:70,
 stormRateFactor:.35,limit:130,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2',
 experimentalSpawnPositions:{
  'trial-j08-guardian':{x:18,z:8,face:0},
  'trial-j08-hunter':{x:21,z:8,face:Math.PI}
 }};
const seeds=[20261101,20261031,3719,4175863657];
const trials=[];
for(const seed of seeds){
 const options={...opts,seed};
 const result=P.battle([guardian,hunter],options).run();
 assert(result.finished&&result.winner&&result.events.some(e=>e.type==='end'));
 assert.deepEqual(P.battle([guardian,hunter],options).run(),result,
  'J08 replay must be deterministic');
 const charges=result.events.filter(e=>e.type==='charge'&&
  e.hero===guardian.id&&e.talent==='J08');
 const procs=result.events.filter(e=>e.type==='proc'&&
  e.hero===guardian.id&&e.talent==='J08');
 const shields=result.events.filter(e=>e.type==='shield'&&e.hero===guardian.id);
 const absorbed=result.events.filter(e=>e.type==='hit'&&
  e.target===guardian.id&&e.absorbed>0);
 assert(shields.length>0,'Guardian never created a real shield');
 assert(charges.length>0,'J08 never charged from shield absorption');
 assert(procs.length>0,'J08 never enhanced a subsequent special attack');
 for(const charge of charges){
  const latestShield=shields.filter(s=>s.seq<charge.seq).at(-1);
  assert(latestShield,'J08 charged before any shield was created');
  // applyHit emits charge *inside* absorption handling; the triggering hit
  // is emitted immediately afterwards (seq+1) at the same logical time.
  const triggeringHit=absorbed.find(h=>h.seq===charge.seq+1&&
   h.time===charge.time);
  assert(triggeringHit,'J08 charge did not follow a real shield-absorbed hit');
  const sinceShield=absorbed.filter(h=>h.seq>latestShield.seq&&
   h.seq<=triggeringHit.seq&&h.time<=charge.time);
  assert(sinceShield.length>=2,
   'J08 must require at least two distinct absorbed hits after shielding');
 }
 for(const proc of procs){
  const prior=charges.filter(c=>c.seq<proc.seq).at(-1);
  assert(prior,'J08 activated without a preceding charge');
  assert(!procs.some(p=>p.seq>prior.seq&&p.seq<proc.seq),
   'A single J08 charge was consumed more than once');
  assert.equal(proc.target,hunter.id,'J08 must target the real opponent');
  const special=result.events.find(e=>e.type==='hit'&&
   e.hero===guardian.id&&e.target===hunter.id&&e.skill&&
   e.seq>proc.seq&&e.seq<=proc.seq+2);
  assert(special,'J08 proc was not consumed by a real special hit');
  const cast=result.events.find(e=>e.type==='talent'&&
   e.hero===guardian.id&&e.time===proc.time&&
   e.seq<proc.seq&&e.seq>=proc.seq-2);
  assert(cast,'J08 proc did not follow a special ability cast');
 }
 for(let i=1;i<procs.length;i++)
  assert(procs[i].time-procs[i-1].time>=13.9,
   'J08 reactivated before its 14-second cooldown');
 const control=P.battle([guardianControl,hunter],options).run();
 assert(control.finished&&control.winner);
 assert(!control.events.some(e=>e.talent==='J08'),
  'J08 emitted an event when the talent was not selected');
 trials.push({seed,duration:result.time,winnerClass:result.winner.klass,
  shields:shields.length,absorbedHits:absorbed.length,
  charges:charges.length,procs:procs.length,
  firstCharge:charges[0].time,firstProc:procs[0].time,
  controlJ08Events:0});
}
const m5=[
 {id:'trial-j08-m5-guardian',build:P.exampleBuild('guardian','trial-j08-m5-guardian',5,0),approvedMissions:5},
 {id:'trial-j08-m5-hunter',build:P.exampleBuild('hunter','trial-j08-m5-hunter',5,0),approvedMissions:5}
];
const m5opts={seed:20261101,arenaScale:5};
assert.deepEqual(P.battle(m5,m5opts).run(),
 P.battle(m5,{...m5opts,arenaMission:5}).run(),
 'M5 must be byte-identical with explicit arenaMission:5');
const report={schema:'m10-j08-focused-v1',synthetic:true,
 physicalPCsValidated:false,humanVisualApproval:false,talent:'guardian:J08',
 trigger:'two shield-absorbed hits, then a special attack; 14s cooldown',
 trials,m5Regression:'identical',limitations:[
  'Engine activation does not prove visual legibility',
  'Four deterministic seeds do not establish global class balance',
  'G.2 physical PCs and H.1/H.2 real-user integration remain blocked'
 ]};
fs.writeFileSync('qa/v5-m10-j08-focused-report.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS M10 focused J08 + negative control + M5 regression: '+JSON.stringify(trials));

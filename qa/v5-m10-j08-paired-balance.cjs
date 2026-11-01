'use strict';
// H.3 M10 — J08 paired causal sensitivity in 4/30 fictional KayKit battles.
// This suppresses the WHOLE J08 effect only in the opt-in M10 laboratory.
// It does not propose or apply a live balance adjustment.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const SEEDS=[20261101,4175863657,20261030];
const SCENARIOS=[
 {name:'four-balanced',allocation:[1,1,1,1]},
 {name:'thirty-balanced',allocation:[8,8,7,7]},
 {name:'thirty-half-guardian',allocation:[5,5,5,15]}
];
const BUILDS={
 defensive:['J08','G01','G10','J01','J03','J04','G05'],
 mixed:['J08','G01','G10','J01','L01','J03','L08']
};
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2',limit:120};
function interleave(allocation){
 const left=[...allocation],out=[];
 while(left.some(x=>x>0))for(let i=0;i<4;i++)if(left[i]>0){
  out.push(CLASSES[i]);left[i]--;
 }
 return out;
}
function rotate(xs,shift){return xs.map((_,i)=>xs[(i+shift)%xs.length]);}
function entry(klass,slot,variant,kind,scenario){
 const id='trial-j08-balance-'+scenario+'-'+kind+'-'+slot;
 const m5=P.exampleBuild(klass,id,5,variant);
 const m10=P.exampleBuild(klass,id,10,variant,{experimentalFinal:true});
 let talents=m10.talents;
 if(klass==='guardian'){
  talents=[...m5.talents];
  for(const talent of BUILDS[kind])if(!talents.includes(talent)&&talents.length<10)
   talents.push(talent);
  for(const talent of P.TALENTS.guardian.map(x=>x.id))
   if(talents.length<10&&!talents.includes(talent))talents.push(talent);
  assert(talents.includes('J08'),'Every Guardian must carry J08');
  assert(talents.includes('G01')||talents.includes('G10'),
   'Guardian needs a shield source for the J08 condition');
 }
 assert.equal(talents.length,10);
 assert.equal(new Set(talents).size,10);
 const frozen={attributes:m5.attributes,talents:m5.talents};
 const adapted=policy.m10ArenaAdapter({rosterKey:id,klass,
  completedMissions:APPROVALS,
  build:{attributes:m10.attributes,talents},
  m5Entered:true,m5Frozen:frozen,m10Locked:true});
 assert.equal(Object.values(adapted.build.attributes).reduce((a,b)=>a+b,0),20);
 assert.deepEqual(adapted.build.talents.slice(0,5),m5.talents);
 return {...adapted,id};
}
function snapshot(game){return game.fighters.map(f=>({
 id:f.id,klass:f.build.klass,build:f.build,stats:f.stats,hp:f.hp,
 basic:f.basic,x:f.x,z:f.z,face:f.face
}));}
function metrics(result,guardians){
 const ev=result.events;
 const own=e=>guardians.has(e.hero);
 const hits=ev.filter(e=>e.type==='hit'&&guardians.has(e.target));
 return {
  winnerId:result.winner.id,
  winnerClass:result.winner.klass,
  duration:result.time,
  j08Charge:ev.filter(e=>e.type==='charge'&&e.talent==='J08'&&own(e)).length,
  j08Proc:ev.filter(e=>e.type==='proc'&&e.talent==='J08'&&own(e)).length,
  shieldAbsorbed:+hits.reduce((s,e)=>s+(e.absorbed||0),0).toFixed(2),
  guardianDamage:+result.standings.filter(f=>guardians.has(f.id))
   .reduce((s,f)=>s+f.damage,0).toFixed(2),
  timeLimit:ev.some(e=>e.type==='end'&&e.reason==='time-limit')
 };
}
const report={schema:'v5-m10-j08-paired-balance-v1',synthetic:true,
 scope:'one isolated J08 whole-effect ablation, M10 10 talents/20 points',
 options:OPTIONS,scenarios:[],limitations:[
  'Whole-J08 suppression is not an isolated damage multiplier or a live nerf.',
  'Builds, seeds and initial positions match within each pair, but later RNG and targets may diverge.',
  'Rotations and two Guardian archetypes reuse seeds; observations are correlated, not independent confidence samples.',
  'Results cannot establish class balance for all 120 talents or human legibility.',
  'G.2 physical PCs, H.1/H.2 real students, XP, main and deploy remain blocked.'
 ]};
let pairs=0,games=0,replays=0,charges=0,procs=0,changes=0;
for(let si=0;si<SCENARIOS.length;si++)for(const kind of Object.keys(BUILDS)){
 const scenario=SCENARIOS[si],classes=interleave(scenario.allocation);
 const group={scenario:scenario.name,buildKind:kind,
  allocation:scenario.allocation,pairs:0,guardianWins:{baseline:0,withoutJ08:0},
  changedWinners:0,charges:0,procs:0,shieldAbsorbed:{baseline:0,withoutJ08:0},
  duration:{baseline:0,withoutJ08:0},timeLimits:{baseline:0,withoutJ08:0}};
 for(let k=0;k<SEEDS.length;k++)for(const shift of [0,Math.floor(classes.length/2)]){
  const rotated=rotate(classes,shift);
  const entries=rotated.map((klass,i)=>entry(klass,i,
   (i*7+k*3+si*5)%11,kind,si));
  const guardians=new Set(entries.filter(e=>e.build.klass==='guardian').map(e=>e.id));
  const seed=(SEEDS[k]+si*104729+shift*65537+classes.length*7919)>>>0;
  const options={...OPTIONS,seed,experimentalCritSeed:(seed^0xdecafbad)>>>0};
  const baseGame=P.battle(entries,options),initial=snapshot(baseGame);
  const baseline=baseGame.run();
  const trialGame=P.battle(entries,{...options,experimentalGuardianTalentAblation:'J08'});
  assert.deepEqual(snapshot(trialGame),initial,
   'J08 ablation must preserve positions, attributes, builds, HP and RNG initialization');
  const without=trialGame.run();
  assert(baseline.finished&&without.finished&&baseline.winner&&without.winner);
  assert.equal(baseline.events.filter(e=>e.type==='end').length,1);
  assert.equal(without.events.filter(e=>e.type==='end').length,1);
  assert(!without.events.some(e=>e.talent==='J08'&&guardians.has(e.hero)),
   'J08 must not emit charge/proc while suppressed');
  const a=metrics(baseline,guardians),b=metrics(without,guardians);
  charges+=a.j08Charge;procs+=a.j08Proc;
  group.charges+=a.j08Charge;group.procs+=a.j08Proc;
  group.pairs++;pairs++;games+=2;
  for(const [arm,m] of [['baseline',a],['withoutJ08',b]]){
   group.guardianWins[arm]+=Number(m.winnerClass==='guardian');
   group.shieldAbsorbed[arm]+=m.shieldAbsorbed;
   group.duration[arm]+=m.duration;
   group.timeLimits[arm]+=Number(m.timeLimit);
  }
  if(a.winnerId!==b.winnerId){changes++;group.changedWinners++;}
  if(k===0&&shift===0){
   assert.deepEqual(P.battle(entries,options).run(),baseline);
   assert.deepEqual(P.battle(entries,{...options,
    experimentalGuardianTalentAblation:'J08'}).run(),without);
   assert.deepEqual(P.battle(entries,{...options,
    experimentalGuardianTalentAblation:null}).run(),baseline);
   replays+=3;
  }
 }
 report.scenarios.push(group);
}
assert.equal(pairs,36);assert.equal(games,72);assert.equal(replays,18);
assert(charges>0&&procs>0,'J08 must genuinely trigger in at least one M10 baseline');
const m5=['guardian','hunter'].map((klass,i)=>({
 id:'trial-j08-m5-'+i,approvedMissions:5,
 build:P.exampleBuild(klass,'trial-j08-m5-'+i,5,i)
}));
const m5opts={seed:20261101,arenaScale:5,damageScale:.5};
assert.deepEqual(P.battle(m5,m5opts).run(),
 P.battle(m5,{...m5opts,arenaMission:5}).run());
assert.throws(()=>P.battle(m5,{...m5opts,
 experimentalGuardianTalentAblation:'J08'}),/Ablação individual/);
const final=[entry('guardian',0,0,'defensive',0),entry('hunter',1,0,'defensive',0)];
assert.throws(()=>P.battle(final,{...OPTIONS,
 experimentalGuardianTalentAblation:'J07'}),/Ablação individual/);
assert.throws(()=>P.battle(final,{...OPTIONS,
 experimentalGuardianTalentAblation:'J08',
 experimentalGuardianAblation:'shields'}),/mutuamente exclusivos/);
report.totals={games,pairs,replays,charges,procs,changedWinners:changes,
 m5Unchanged:true,realStudentsUsed:false};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.scenarios))
 .digest('hex').slice(0,20);
if(process.env.M10_J08_BALANCE_REPORT_FILE){
 const file=path.resolve(process.env.M10_J08_BALANCE_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 J08 BALANCE REPORT '+JSON.stringify(report));
console.log('PASS M10 J08 paired balance: '+games+' games, '+pairs+
 ' pairs, '+replays+' deterministic checks; M5 unchanged.');

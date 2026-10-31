'use strict';
/* H.3 M10 controlled intervention: actor update order vs independent per-hero
 * critical RNG. No changes to normal M5/M10 paths, stats, XP or students.
 * M10_CAUSAL_ORDER_REPORT_FILE=/tmp/order.json node qa/v5-m10-order-rng-causal.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const SEEDS=[20261030,4175863657,123456789,8675309];
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
const SCENARIOS=[
 {name:'4-balanced',allocation:[1,1,1,1],seeds:4,rotations:[1,2,3]},
 {name:'30-balanced',allocation:[8,8,7,7],seeds:3,rotations:[1,7,15]},
 {name:'30-guardian-half',allocation:[5,5,5,15],seeds:3,rotations:[1,7,15]}
];
function interleave(allocation){
 const remain=[...allocation],out=[];
 while(remain.some(n=>n>0))for(let k=0;k<4;k++)if(remain[k]>0){out.push(CLASSES[k]);remain[k]--}
 return out;
}
function entryFor(klass,index,seedIndex,scenarioIndex){
 const name='trial-order-'+scenarioIndex+'-'+index;
 const variant=(index*7+seedIndex*3+scenarioIndex*5)%11;
 const m5=P.exampleBuild(klass,name,5,variant);
 const m10=P.exampleBuild(klass,name,10,variant,{experimentalFinal:true});
 const e=policy.m10ArenaAdapter({rosterKey:name,klass,
  completedMissions:Array.from({length:10},(_,i)=>i+1),
  build:{attributes:m10.attributes,talents:m10.talents},
  m5Entered:true,m5Frozen:{attributes:m5.attributes,talents:m5.talents},
  m10Locked:true});
 assert.equal(e.build.talents.length,10);
 assert.equal(Object.values(e.build.attributes).reduce((a,b)=>a+b,0),20);
 return Object.freeze({...e,id:name});
}
function rotate(a,n){return a.map((_,i)=>a[(i+n)%a.length]);}
function hash(x){return crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,20);}
function count(o,key){o[key]=(o[key]||0)+1;}
function initial(b){
 return b.fighters.map(f=>({id:f.id,klass:f.build.klass,
  x:f.x,z:f.z,face:f.face,basic:f.basic,hp:f.hp,stats:f.stats,build:f.build}));
}
const report={schema:'v5-m10-order-crit-rng-v1',date:'2026-10-30',
 kind:'synthetic-causal-diagnostic',options:OPTIONS,scenarios:[],
 arms:{
  orderOnly:'same entry array, spawn and initial draws, per-hero critical RNG; rotate only actor update loop',
  critRngOnly:'same entry array, actor update order and spawn; change only per-hero critical RNG seed'
 },limitations:[
  'Only the main actor update loop is permuted; projectile, zone and collision loops keep original fighter array order.',
  'Per-hero RNG isolates critical-hit draws; future combat RNG types are not covered.',
  'After intervention, target choices and number of critical rolls may diverge naturally; no claim of identical downstream draws.',
  'Results from synthetic builds and a few seeds do not establish general class fairness or explain Guardian defense.',
  'No 3D M10, physical PC G.2, authentication, student data, XP, V3, main or deploy.'
 ]};
let total=0,exactReplays=0,orderChanges=0,critChanges=0;
for(let si=0;si<SCENARIOS.length;si++){
 const scenario=SCENARIOS[si],n=scenario.allocation.reduce((a,b)=>a+b,0);
 const classes=interleave(scenario.allocation);
 const out={name:scenario.name,allocation:scenario.allocation,blocks:scenario.seeds,
  baselineGames:0,orderOnlyGames:0,critRngOnlyGames:0,
  baselineWins:{},orderOnlyWins:{},critRngOnlyWins:{},
  orderWinnerChanges:0,critRngWinnerChanges:0,replays:[]};
 for(let seedIndex=0;seedIndex<scenario.seeds;seedIndex++){
  const seed=(SEEDS[seedIndex]+n*7919+si*104729)>>>0;
  const entries=classes.map((klass,i)=>entryFor(klass,i,seedIndex,si));
  const ids=entries.map(e=>e.id),critSeed=(seed^0xdecafbad)>>>0;
  const opts={...OPTIONS,seed,experimentalCritSeed:critSeed};
  const baselineGame=P.battle(entries,opts);
  const start=initial(baselineGame);
  const baseline=baselineGame.run();
  assert(baseline.finished&&baseline.winner);
  assert.equal(baseline.events.filter(e=>e.type==='end').length,1);
  assert.deepEqual(P.battle(entries,{...opts,experimentalTurnOrder:ids}).run(),baseline,
   'identity turn order must reproduce exact event log');
  if(seedIndex===0){
   assert.throws(()=>P.battle(entries,{...opts,experimentalTurnOrder:ids.slice(1)}),/IDs únicos/);
   assert.throws(()=>P.battle(entries,{...opts,experimentalTurnOrder:[...ids.slice(1),ids[1]]}),/IDs únicos/);
   assert.throws(()=>P.battle(entries,{...opts,experimentalTurnOrder:[...ids.slice(1),'trial-nonexistent']}),/inexistente/);
   assert.throws(()=>P.battle(entries,{...opts,experimentalCritSeed:-1}),/Seed experimental/);
   assert.throws(()=>P.battle(entries,{...opts,experimentalCritSeed:2**32}),/Seed experimental/);
   assert.throws(()=>P.battle(entries,{...opts,experimentalCritSeed:NaN}),/Seed experimental/);
  }
  count(out.baselineWins,baseline.winner.klass);out.baselineGames++;total++;
  for(const shift of scenario.rotations){
   const order=rotate(ids,shift);
   const turnGame=P.battle(entries,{...opts,experimentalTurnOrder:order});
   assert.deepEqual(initial(turnGame),start,'turn order must not change initial fighters/RNG');
   const turn=turnGame.run();
   assert(turn.finished&&turn.winner);
   count(out.orderOnlyWins,turn.winner.klass);out.orderOnlyGames++;total++;
   if(turn.winner.id!==baseline.winner.id){out.orderWinnerChanges++;orderChanges++;}
   const newCritSeed=(critSeed^Math.imul(shift,0x9e3779b9))>>>0;
   const rngGame=P.battle(entries,{...opts,experimentalCritSeed:newCritSeed});
   assert.deepEqual(initial(rngGame),start,'crit RNG seed must not change initial fighters/spawn');
   const crit=rngGame.run();
   assert(crit.finished&&crit.winner);
   count(out.critRngOnlyWins,crit.winner.klass);out.critRngOnlyGames++;total++;
   if(crit.winner.id!==baseline.winner.id){out.critRngWinnerChanges++;critChanges++;}
   if(seedIndex===0&&shift===scenario.rotations[0]){
    assert.deepEqual(P.battle(entries,{...opts,experimentalTurnOrder:order}).run(),turn);
    assert.deepEqual(P.battle(entries,{...opts,experimentalCritSeed:newCritSeed}).run(),crit);
    exactReplays+=2;out.replays.push({seed,shift,turnHash:hash(turn),critHash:hash(crit)});
   }
  }
 }
 assert.equal(out.baselineGames,scenario.seeds);
 assert.equal(out.orderOnlyGames,scenario.seeds*scenario.rotations.length);
 assert.equal(out.critRngOnlyGames,scenario.seeds*scenario.rotations.length);
 for(const [wins,games] of [[out.baselineWins,out.baselineGames],
  [out.orderOnlyWins,out.orderOnlyGames],[out.critRngOnlyWins,out.critRngOnlyGames]])
  assert.equal(Object.values(wins).reduce((a,b)=>a+b,0),games);
 report.scenarios.push(out);
}
// M5 untouched: same byte-for-byte outcome and both diagnostics forbidden.
const m5Entries=['warrior','guardian'].map((klass,i)=>({
 id:'trial-m5-'+i,build:P.exampleBuild(klass,'trial-m5-'+i,5,i),approvedMissions:5
}));
const m5Opts={seed:4175863657,arenaScale:5,damageScale:.5};
const m5=P.battle(m5Entries,m5Opts).run();
assert.deepEqual(P.battle(m5Entries,{...m5Opts,arenaMission:5}).run(),m5);
assert.throws(()=>P.battle(m5Entries,{...m5Opts,experimentalTurnOrder:m5Entries.map(e=>e.id)}),/somente na M10/);
assert.throws(()=>P.battle(m5Entries,{...m5Opts,experimentalCritSeed:1234}),/somente na M10/);
assert.equal(total,70);
assert.equal(exactReplays,6);
report.totals={games:total,blocks:10,orderComparisons:30,critRngComparisons:30,
 orderWinnerChanges:orderChanges,critRngWinnerChanges:critChanges,exactReplays,
 unchangedM5:true};
if(process.env.M10_CAUSAL_ORDER_REPORT_FILE){
 const file=path.resolve(process.env.M10_CAUSAL_ORDER_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 ORDER/CRIT CAUSAL REPORT '+JSON.stringify(report));
console.log('PASS M10 independent actor-order vs per-hero critical RNG: '+total+
 ' games, '+exactReplays+' exact replays, initial states identical, M5 unchanged.');

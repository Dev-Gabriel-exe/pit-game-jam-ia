'use strict';
/* H.3: causal M10 spawn-geometry experiment.
 * Geometry arm: fixed entry/update order + initial RNG, permute only positions.
 * Order/RNG arm: fixed positions per identity, permute entry/update order;
 * RNG assignment changes with index and is NOT separately isolated.
 * M5, XP, real identities, class stats and talent logic remain untouched.
 * M10_SPAWN_REPORT_FILE=/tmp/m10-spawn.json node qa/v5-m10-spawn-causal.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
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
 while(remain.some(n=>n>0))for(let k=0;k<4;k++)if(remain[k]>0){out.push(CLASSES[k]);remain[k]--;}
 return out;
}
function entryFor(klass,index,seedIndex,scenarioIndex){
 const name='trial-causal-'+scenarioIndex+'-'+index;
 const variant=(index*7+seedIndex*3+scenarioIndex*5)%11;
 const m5=P.exampleBuild(klass,name,5,variant);
 const m10=P.exampleBuild(klass,name,10,variant,{experimentalFinal:true});
 const c={rosterKey:name,klass,completedMissions:APPROVALS,
  build:{attributes:m10.attributes,talents:m10.talents},
  m5Entered:true,m5Frozen:{attributes:m5.attributes,talents:m5.talents},m10Locked:true};
 const e=policy.m10ArenaAdapter(c);
 assert.equal(e.build.talents.length,10);
 assert.equal(Object.values(e.build.attributes).reduce((a,b)=>a+b,0),20);
 return Object.freeze({...e,id:name});
}
function rotate(list,n){return list.map((_,i)=>list[(i+n)%list.length]);}
function digest(o){return crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0,20);}
function countClass(wins,klass){wins[klass]=(wins[klass]||0)+1;}
function positions(instance){return Object.fromEntries(instance.fighters.map(f=>[f.id,{x:f.x,z:f.z,face:f.face}]));}
function byId(instance){return new Map(instance.fighters.map(f=>[f.id,f]));}
function assertInitialSameExceptPosition(a,b,expectSameBasic){
 const first=byId(a),second=byId(b);let basicChanged=0;
 for(const [id,f] of first){
  const g=second.get(id);assert(g,'missing fighter '+id);
  assert.deepEqual(g.build,f.build);
  assert.deepEqual(g.stats,f.stats);
  assert.equal(g.hp,f.hp);
  if(g.basic!==f.basic)basicChanged++;
  if(expectSameBasic)assert.equal(g.basic,f.basic,'RNG must remain per identity when order is fixed');
 }
 return basicChanged;
}
const report={schema:'v5-m10-spawn-geometry-v1',date:'2026-10-30',
 kind:'synthetic-causal-diagnostic',engine:P.VERSION,options:OPTIONS,
 arms:{
  geometryOnly:'fixed entries, update order, per-index RNG initialization; rotate only world spawn coordinates/face',
  orderAndRng:'fixed world coordinates per identity; rotate entry/update order and per-index RNG assignment (not independently separable)'
 },scenarios:[],limitations:[
  'Geometry-only fixes initial random draws but combat RNG draws may diverge later as a consequence of different encounters.',
  'Order/RNG arm is a combined intervention; does not identify update-order and random-number effects separately.',
  'Small synthetic sample; cannot prove universal fairness or determine Guardian passive talent as the cause.',
  'No real PCs, GLB rendering, student accounts, XP, classroom data, V3 integration or main merge.'
 ]};
let total=0,replays=0;
for(let si=0;si<SCENARIOS.length;si++){
 const scenario=SCENARIOS[si],n=scenario.allocation.reduce((a,b)=>a+b,0);
 const classes=interleave(scenario.allocation);
 const out={name:scenario.name,allocation:scenario.allocation,blocks:scenario.seeds,
  baselineGames:0,geometryGames:0,orderRngGames:0,
  baselineWins:{},geometryWins:{},orderRngWins:{},
  geometryWinnerChanges:0,orderRngWinnerChanges:0,changedInitialBasic:0,
  geometryWinnerChangesByShift:{},orderRngWinnerChangesByShift:{},replays:[]};
 for(let seedIndex=0;seedIndex<scenario.seeds;seedIndex++){
  const seed=(SEEDS[seedIndex]+n*7919+si*104729)>>>0;
  const entries=classes.map((klass,i)=>entryFor(klass,i,seedIndex,si));
  const opts={...OPTIONS,seed};
  const baseGame=P.battle(entries,opts);
  const basePositions=positions(baseGame);
  const baseline=baseGame.run();
  // Keep an unrun baseline for comparing initial stats/RNG after the battle
  // has mutated the actual baseline fighters.
  const baseFresh=P.battle(entries,opts),baseFighters=byId(baseFresh);
  assert(baseline.finished&&baseline.winner);
  assert.equal(baseline.events.filter(e=>e.type==='end').length,1);
  const identical=P.battle(entries,{...opts,experimentalSpawnPositions:basePositions});
  assertInitialSameExceptPosition(baseFresh,identical,true);
  assert.deepEqual(positions(identical),basePositions,'override with original positions must be exact');
  assert.deepEqual(identical.run(),baseline,'override must not change baseline M10 outcome or events');
  countClass(out.baselineWins,baseline.winner.klass);out.baselineGames++;total++;
  if(seedIndex===0){
   assert.throws(()=>P.battle(entries,{...opts,experimentalSpawnPositions:{}}),/uma posição/);
   const incomplete={...basePositions};delete incomplete[entries[0].id];
   assert.throws(()=>P.battle(entries,{...opts,experimentalSpawnPositions:incomplete}),/uma posição/);
   const nan={...basePositions,[entries[0].id]:{x:NaN,z:0,face:0}};
   assert.throws(()=>P.battle(entries,{...opts,experimentalSpawnPositions:nan}),/Coordenada/);
   const outOfBounds={...basePositions,[entries[0].id]:{x:1000,z:0,face:0}};
   assert.throws(()=>P.battle(entries,{...opts,experimentalSpawnPositions:outOfBounds}),/Coordenada/);
  }
  for(const shift of scenario.rotations){
   // Controlled geometry arm: identity and order fixed; only locations rotated.
   const moved=Object.fromEntries(entries.map((e,i)=>[e.id,basePositions[entries[(i+shift)%n].id]]));
   const geometry=P.battle(entries,{...opts,experimentalSpawnPositions:moved});
   assertInitialSameExceptPosition(baseFresh,geometry,true);
   const geomFighters=byId(geometry);
   for(const e of entries){
    const f=geomFighters.get(e.id),expected=moved[e.id];
    assert.equal(f.x,expected.x);assert.equal(f.z,expected.z);assert.equal(f.face,expected.face);
   }
   assert(entries.some(e=>moved[e.id].x!==basePositions[e.id].x),'geometry permutation must move a fighter');
   const geom=geometry.run();
   assert(geom.finished&&geom.winner);
   countClass(out.geometryWins,geom.winner.klass);out.geometryGames++;total++;
   if(geom.winner.id!==baseline.winner.id){
    out.geometryWinnerChanges++;
    out.geometryWinnerChangesByShift[shift]=(out.geometryWinnerChangesByShift[shift]||0)+1;
   }
   // Controlled fixed-geometry arm: exact same coordinates per ID; only
   // update order + per-index RNG assignment change together.
   const reordered=rotate(entries,shift);
   const order=P.battle(reordered,{...opts,experimentalSpawnPositions:basePositions});
   const changed=assertInitialSameExceptPosition(baseFresh,order,false);
   assert(changed>0,'rotating entry order must reassign at least one initial RNG draw');
   out.changedInitialBasic+=changed;
   const orderFighters=byId(order);
   for(const e of entries){
    const f=orderFighters.get(e.id),expected=basePositions[e.id],base=baseFighters.get(e.id);
    assert.equal(f.x,expected.x);assert.equal(f.z,expected.z);assert.equal(f.face,base.face);
   }
   const ord=order.run();
   assert(ord.finished&&ord.winner);
   countClass(out.orderRngWins,ord.winner.klass);out.orderRngGames++;total++;
   if(ord.winner.id!==baseline.winner.id){
    out.orderRngWinnerChanges++;
    out.orderRngWinnerChangesByShift[shift]=(out.orderRngWinnerChangesByShift[shift]||0)+1;
   }
   if(seedIndex===0&&shift===scenario.rotations[0]){
    assert.deepEqual(P.battle(entries,{...opts,experimentalSpawnPositions:moved}).run(),geom);
    assert.deepEqual(P.battle(reordered,{...opts,experimentalSpawnPositions:basePositions}).run(),ord);
    replays+=2;out.replays.push({seed,shift,geometryHash:digest(geom),orderRngHash:digest(ord)});
   }
  }
 }
 assert.equal(out.baselineGames,scenario.seeds);
 assert.equal(out.geometryGames,scenario.seeds*scenario.rotations.length);
 assert.equal(out.orderRngGames,scenario.seeds*scenario.rotations.length);
 assert.equal(Object.values(out.geometryWins).reduce((a,b)=>a+b,0),out.geometryGames);
 assert.equal(Object.values(out.orderRngWins).reduce((a,b)=>a+b,0),out.orderRngGames);
 report.scenarios.push(out);
}
// The original M5 remains byte-for-byte unchanged, with no experimental option.
const m5Entries=['warrior','guardian'].map((klass,i)=>({
 id:'trial-m5-'+i,build:P.exampleBuild(klass,'trial-m5-'+i,5,i),approvedMissions:5
}));
const m5Opts={seed:4175863657,arenaScale:5,damageScale:.5};
const m5=P.battle(m5Entries,m5Opts).run();
assert.deepEqual(P.battle(m5Entries,{...m5Opts,arenaMission:5,experimentalSpawnPositions:null}).run(),m5);
assert.throws(()=>P.battle(m5Entries,{...m5Opts,experimentalSpawnPositions:{a:{x:0,z:0,face:0}}}),/somente na M10/);
assert.equal(total,70);
report.totals={games:total,blocks:10,geometryComparisons:30,orderRngComparisons:30,
 exactReplays:replays,unchangedM5:true};
if(process.env.M10_SPAWN_REPORT_FILE){
 const file=path.resolve(process.env.M10_SPAWN_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 SPAWN CAUSAL REPORT '+JSON.stringify(report));
console.log('PASS M10 geometry-only vs fixed-geometry order/RNG: '+total+
 ' games, '+replays+' exact replays, baseline override identity, M5 unchanged.');

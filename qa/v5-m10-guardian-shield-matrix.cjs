'use strict';
/* H.3/M10: paired synthetic Guardian shield-amount sensitivity, NOT a gameplay nerf.
 * Same 10 talents / 20 points / 4 KayKit class IDs, no student accounts or DB.
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
const SEEDS=[20261030,4175863657];
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
const BUILDS={
 defensive:['G01','G02','G03','G05','G07','G09','G10','L01','L03','J09'],
 mixed:['G01','G10','G05','J09','J01','J02','J03','L01','L08','G03']
};
const SCENARIOS=[
 {name:'4-balanced',allocation:[1,1,1,1]},
 {name:'30-balanced',allocation:[8,8,7,7]},
 {name:'30-guardian-half',allocation:[5,5,5,15]}
];
const ARMS={
 baseline:null,
 g01_75:{G01:.75,G10:1},
 g10_75:{G01:1,G10:.75},
 both_75:{G01:.75,G10:.75},
 both_0:{G01:0,G10:0}
};
const round=n=>+n.toFixed(3);
function interleave(allocation){
 const left=[...allocation],out=[];
 while(left.some(n=>n>0))for(let i=0;i<4;i++)if(left[i]>0){out.push(CLASSES[i]);left[i]--;}
 return out;
}
function rotate(arr,n){return arr.map((_,i)=>arr[(i+n)%arr.length]);}
function entry(klass,i,variant,kind,scenario){
 const id='trial-s'+scenario+'-'+kind[0]+'-'+i;
 const m5=P.exampleBuild(klass,id,5,variant);
 const m10=P.exampleBuild(klass,id,10,variant,{experimentalFinal:true});
 const talents=klass==='guardian'?[...BUILDS[kind]]:[...m10.talents];
 const frozen={attributes:{...m5.attributes},
  talents:klass==='guardian'?talents.slice(0,5):[...m5.talents]};
 const adapted=policy.m10ArenaAdapter({rosterKey:id,klass,completedMissions:APPROVALS,
  build:{attributes:{...m10.attributes},talents},m5Entered:true,m5Frozen:frozen,m10Locked:true});
 assert.equal(adapted.build.talents.length,10);
 assert.equal(Object.values(adapted.build.attributes).reduce((a,b)=>a+b,0),20);
 return {...adapted,id};
}
function initial(game){
 return game.fighters.map(f=>({id:f.id,klass:f.build.klass,x:f.x,z:f.z,
  hp:f.hp,stats:f.stats,build:f.build}));
}
function metrics(game,result){
 const guardians=new Set(game.fighters.filter(f=>f.build.klass==='guardian').map(f=>f.id));
 const own=e=>guardians.has(e.hero);
 const sum=(list,key)=>round(list.reduce((v,e)=>v+(e[key]||0),0));
 const shields=result.events.filter(e=>e.type==='shield'&&own(e));
 const incoming=result.events.filter(e=>e.type==='hit'&&guardians.has(e.target));
 const casts=Object.fromEntries(['G01','G10'].map(id=>[id,result.events.filter(e=>e.type==='talent'&&own(e)&&e.talent===id).length]));
 return {guardianWin:Number(result.winner.klass==='guardian'),duration:round(result.time),
  shieldNominal:sum(shields,'amount'),shieldAbsorbed:sum(incoming,'absorbed'),
  incomingHpDamage:sum(incoming,'amount'),g01Casts:casts.G01,g10Casts:casts.G10};
}
function add(dst,src){for(const [k,v]of Object.entries(src))dst[k]=(dst[k]||0)+v;}
const report={schema:'v5-m10-guardian-shield-scale-matrix-v1',
 experiment:'M10-only shield amount G01/G10; cooldown, cast logic and solar buff code unchanged',
 options:OPTIONS,arms:ARMS,scenarios:[],limitations:[
 'Synthetic controlled samples only; no statistical proof of fair classes or live balance change.',
 'Later casts, targeting and RNG may diverge after a shield difference, so aggregate nominal shields need not be monotonic.',
 'Absorbed shield on incoming hits cannot be attributed exclusively to G01/G10.',
 'Chromium WebGL and physical-PC G.2 are separate; no student/teacher integration, XP or main changes.'
 ]};
let games=0,comparisons=0,replays=0;
const totals=Object.fromEntries(Object.keys(ARMS).map(k=>[k,{}]));
const changed=Object.fromEntries(Object.keys(ARMS).filter(k=>k!=='baseline').map(k=>[k,0]));
for(let si=0;si<SCENARIOS.length;si++)for(const kind of Object.keys(BUILDS)){
 const scenario=SCENARIOS[si],base=interleave(scenario.allocation);
 const group={scenario:scenario.name,kind,blocks:0,arms:{},changedWinners:{}};
 for(let ix=0;ix<SEEDS.length;ix++)for(const shift of [0,Math.floor(base.length/2)]){
  const classes=rotate(base,shift);
  const entries=classes.map((klass,i)=>entry(klass,i,(i*7+ix*3+si*5)%11,kind,si));
  const seed=(SEEDS[ix]+classes.length*7919+si*104729+shift*65537)>>>0;
  const opts={...OPTIONS,seed,experimentalCritSeed:(seed^0xdecafbad)>>>0};
  const game=P.battle(entries,opts),start=initial(game),baseline=game.run();
  assert(baseline.finished&&baseline.winner&&baseline.events.filter(e=>e.type==='end').length===1);
  const neutral=P.battle(entries,{...opts,experimentalGuardianShieldScale:{G01:1,G10:1}}).run();
  assert.deepEqual(neutral,baseline,'Neutral shield scale must preserve exact M10 replay');
  const m=metrics(game,baseline);add(group.arms.baseline??={},m);add(totals.baseline,m);
  games++;group.blocks++;
  if(ix===0&&shift===0){assert.deepEqual(P.battle(entries,opts).run(),baseline);replays++;}
  for(const [name,scale]of Object.entries(ARMS)){
   if(name==='baseline')continue;
   const trial=P.battle(entries,{...opts,experimentalGuardianShieldScale:scale});
   assert.deepEqual(initial(trial),start,'Shield scaling must not alter initial stats/builds/spawns');
   const result=trial.run();
   assert(result.finished&&result.winner&&result.events.filter(e=>e.type==='end').length===1);
   const tm=metrics(trial,result);add(group.arms[name]??={},tm);add(totals[name],tm);
   if(result.winner.id!==baseline.winner.id){
    changed[name]++;group.changedWinners[name]=(group.changedWinners[name]||0)+1;
   }
   games++;comparisons++;
  }
 }
 report.scenarios.push(group);
}
assert.equal(games,120);assert.equal(comparisons,96);assert.equal(replays,6);
assert(totals.baseline.g01Casts>0&&totals.baseline.g10Casts>0,'Both Guardian talents must cast in baseline');
assert(totals.both_0.shieldNominal!==totals.baseline.shieldNominal,
 'Scaling G01/G10 to zero must measurably alter emitted shield totals');
const m5=['warrior','guardian'].map((klass,i)=>({
 id:'trial-m5-'+i,build:P.exampleBuild(klass,'trial-m5-'+i,5,i),approvedMissions:5
}));
const m5Options={seed:4175863657,arenaScale:5,damageScale:.5};
assert.deepEqual(P.battle(m5,m5Options).run(),P.battle(m5,{...m5Options,arenaMission:5}).run());
assert.throws(()=>P.battle(m5,{...m5Options,experimentalGuardianShieldScale:{G01:.75}}),/M10/);
report.totals={games,pairedComparisons:comparisons,exactReplays:replays,blocks:24,
 guardianWins: Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,v.guardianWin])),
 winnerChanges:changed,shieldNominal: Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,round(v.shieldNominal)])),
 shieldAbsorbed:Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,round(v.shieldAbsorbed)])),
 casts:Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,{G01:v.g01Casts,G10:v.g10Casts}])),
 m5Unchanged:true};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.totals)).digest('hex').slice(0,20);
if(process.env.M10_GUARDIAN_SHIELD_REPORT_FILE){
 const file=path.resolve(process.env.M10_GUARDIAN_SHIELD_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 GUARDIAN SHIELD MATRIX TOTALS '+JSON.stringify(report.totals));
console.log('PASS M10 Guardian shield sensitivity: '+games+' games, '+comparisons+' paired, '+replays+' exact replays, M5 unchanged.');

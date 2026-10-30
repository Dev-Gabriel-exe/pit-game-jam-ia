'use strict';
/* PIT V5 H.3 — paired one-at-a-time Guardian talent ablation.
 * Synthetic-only M10: full-talent suppression is NOT a balance change.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const IDS=['G01','G10','G05','J09'];
const ARMS=['baseline',...IDS];
const SEEDS=[20261030,4175863657];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
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
function interleave(allocation){
 const left=[...allocation],classes=[];
 while(left.some(x=>x>0))for(let i=0;i<4;i++)if(left[i]>0){classes.push(CLASSES[i]);left[i]--;}
 return classes;
}
function rotate(a,shift){return a.map((_,i)=>a[(i+shift)%a.length]);}
function entry(klass,slot,variant,kind,scenario){
 const name='trial-individual-'+scenario+'-'+kind+'-'+slot;
 const m5=P.exampleBuild(klass,name,5,variant);
 const m10=P.exampleBuild(klass,name,10,variant,{experimentalFinal:true});
 const talents=klass==='guardian'?BUILDS[kind]:m10.talents;
 const frozen={attributes:m5.attributes,talents:klass==='guardian'?talents.slice(0,5):m5.talents};
 const approved=policy.m10ArenaAdapter({rosterKey:name,klass,completedMissions:APPROVALS,
  build:{attributes:m10.attributes,talents},m5Entered:true,m5Frozen:frozen,m10Locked:true});
 assert.equal(approved.build.talents.length,10);
 assert.equal(Object.values(approved.build.attributes).reduce((a,b)=>a+b,0),20);
 return {...approved,id:name};
}
function initial(game){return game.fighters.map(f=>({
 id:f.id,klass:f.build.klass,x:f.x,z:f.z,face:f.face,basic:f.basic,
 hp:f.hp,stats:f.stats,build:f.build
}));}
const round=n=>+n.toFixed(3);
function metrics(game,result){
 const guardians=new Set(game.fighters.filter(f=>f.build.klass==='guardian').map(f=>f.id));
 const own=e=>guardians.has(e.hero);
 const events=result.events;
 const sum=(a,key)=>round(a.reduce((v,e)=>v+(e[key]||0),0));
 const hits=events.filter(e=>e.type==='hit'&&guardians.has(e.target));
 const ownGuardians=game.fighters.filter(f=>guardians.has(f.id));
 return {
  guardianWin:result.winner.klass==='guardian'?1:0,
  guardianCount:guardians.size,
  shieldNominal:sum(events.filter(e=>e.type==='shield'&&own(e)),'amount'),
  shieldAbsorbed:sum(hits,'absorbed'),
  healing:sum(events.filter(e=>e.type==='heal'&&own(e)),'amount'),
  incomingHpDamage:sum(hits,'amount'),
  damageDealt:round(ownGuardians.reduce((v,f)=>v+f.damage,0)),
  meanSurvival:round(ownGuardians.reduce((v,f)=>v+(f.eliminatedAt??result.time),0)/guardians.size),
  talentEvents:events.filter(e=>e.type==='talent'&&own(e)).length,
  activationByTalent:Object.fromEntries(IDS.map(id=>[id,events.filter(e=>own(e)&&
   ['talent','proc','charge'].includes(e.type)&&e.talent===id).length]))
 };
}
function add(dst,src){for(const [k,v] of Object.entries(src)){
 if(k==='activationByTalent'){dst[k]??={};for(const [id,n]of Object.entries(v))dst[k][id]=(dst[k][id]||0)+n;}
 else dst[k]=(dst[k]||0)+v;
}}
const report={schema:'v5-m10-guardian-individual-ablation-v1',date:'2026-10-30',
 kind:'paired-single-whole-talent-suppression',options:OPTIONS,
 talents:IDS,builds:BUILDS,scenarios:[],limitations:[
 'Whole-talent suppression, not shield-only ablation: action priority, offense and later RNG consumption may change.',
 'ShieldNominal is emitted shield amount before cap; shieldAbsorbed is observed absorption, not attribution to a specific skill.',
 'The same initial builds, positions, seed, stats and independent critical RNG are used in each pair, but subsequent combat diverges.',
 'Small synthetic samples with deliberately chosen defensive/mixed Guardian builds; no fairness conclusion or live nerf.',
 'WebGL M10 CI is separate; no physical-PC G.2, student accounts, XP, V3 sync, deployment or main writes.'
 ]};
let games=0,pairs=0,replays=0,changed=Object.fromEntries(IDS.map(x=>[x,0]));
const baselineTriggers=Object.fromEntries(IDS.map(x=>[x,0]));
for(let si=0;si<SCENARIOS.length;si++)for(const kind of Object.keys(BUILDS)){
 const scenario=SCENARIOS[si],base=interleave(scenario.allocation);
 const out={scenario:scenario.name,buildKind:kind,allocation:scenario.allocation,
  blocks:0,arms:{},changedWinner:{},observedTriggers:{}};
 for(let seedIndex=0;seedIndex<SEEDS.length;seedIndex++)for(const shift of [0,Math.floor(base.length/2)]){
  const classes=rotate(base,shift);
  const entries=classes.map((klass,i)=>entry(klass,i,(i*7+seedIndex*3+si*5)%11,kind,si));
  const seed=(SEEDS[seedIndex]+classes.length*7919+si*104729+shift*65537)>>>0;
  const opts={...OPTIONS,seed,experimentalCritSeed:(seed^0xdecafbad)>>>0};
  const game=P.battle(entries,opts),snap=initial(game),baseline=game.run();
  assert(baseline.finished&&baseline.winner);
  assert.deepEqual(P.battle(entries,{...opts,experimentalGuardianTalentAblation:null}).run(),baseline,
   'Null individual diagnostic must preserve original M10 result exactly');
  const baselineMetrics=metrics(game,baseline);
  add(out.arms.baseline??={},baselineMetrics);
  for(const id of IDS)baselineTriggers[id]+=baselineMetrics.activationByTalent[id];
  games++;out.blocks++;
  if(seedIndex===0&&shift===0){assert.deepEqual(P.battle(entries,opts).run(),baseline);replays++;}
  for(const id of IDS){
   const trial=P.battle(entries,{...opts,experimentalGuardianTalentAblation:id});
   assert.deepEqual(initial(trial),snap,'Ablation cannot change initial builds/stats/positions');
   const result=trial.run();
   assert(result.finished&&result.winner);
   assert.equal(result.events.filter(e=>e.type==='end').length,1);
   assert(!result.events.some(e=>e.hero&&
    entries.some(p=>p.id===e.hero&&p.build.klass==='guardian')&&
    ['talent','proc','charge'].includes(e.type)&&e.talent===id),
    'Suppressed Guardian talent '+id+' must never activate or proc');
   add(out.arms[id]??={},metrics(trial,result));
   if(result.winner.id!==baseline.winner.id){
    changed[id]++;out.changedWinner[id]=(out.changedWinner[id]||0)+1;
   }
   games++;pairs++;
   if(seedIndex===0&&shift===0&&id==='J09'){
    assert.deepEqual(P.battle(entries,{...opts,experimentalGuardianTalentAblation:id}).run(),result);
    replays++;
   }
  }
 }
 for(const arm of ARMS)for(const [key,value]of Object.entries(out.arms[arm]))
  if(typeof value==='number')out.arms[arm][key]=round(value);
 report.scenarios.push(out);
}
assert.equal(games,120);
assert.equal(pairs,96);
assert.equal(replays,12);
assert(IDS.every(id=>baselineTriggers[id]>0),
 'All four talents must actually activate in baseline; missing coverage '+JSON.stringify(baselineTriggers));
const m5=['warrior','guardian'].map((klass,i)=>({
 id:'trial-m5-'+i,build:P.exampleBuild(klass,'trial-m5-'+i,5,i),approvedMissions:5
}));
const m5opts={seed:4175863657,arenaScale:5,damageScale:.5};
const m5Baseline=P.battle(m5,m5opts).run();
assert.deepEqual(P.battle(m5,{...m5opts,arenaMission:5}).run(),m5Baseline);
for(const bad of [...IDS,'G03','L07','unknown',[],{},0,'']){
 assert.throws(()=>P.battle(m5,{...m5opts,experimentalGuardianTalentAblation:bad}),/Ablação individual/);
}
const final=[entry('guardian',0,0,'defensive',0),entry('warrior',1,0,'defensive',0)];
for(const bad of ['G03','L07','unknown',[],{},0,'']){
 assert.throws(()=>P.battle(final,{...OPTIONS,experimentalGuardianTalentAblation:bad}),/Ablação individual/);
}
assert.throws(()=>P.battle(final,{...OPTIONS,experimentalGuardianAblation:'shields',
 experimentalGuardianTalentAblation:'G01'}),/mutuamente exclusivos/);
report.totals={games,pairedComparisons:pairs,exactReplays:replays,blocks:24,
 changedWinnerVsBaseline:changed,baselineTalentActivations:baselineTriggers,
 unchangedM5:true};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.totals)).digest('hex').slice(0,20);
if(process.env.M10_GUARDIAN_INDIVIDUAL_REPORT_FILE){
 const file=path.resolve(process.env.M10_GUARDIAN_INDIVIDUAL_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 GUARDIAN INDIVIDUAL REPORT '+JSON.stringify(report));
console.log('PASS M10 Guardian individual talent ablation: '+games+' synthetic games, '+
 pairs+' paired comparisons, '+replays+' exact replays, unchanged M5.');

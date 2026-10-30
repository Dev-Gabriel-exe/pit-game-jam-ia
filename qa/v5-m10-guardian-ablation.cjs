'use strict';
/* M10 H.3 controlled Guardian defensive talent ablation.
 * Synthetic-only, not an approved balance patch or live player simulation.
 * M10_GUARDIAN_REPORT_FILE=/tmp/guardian.json node qa/v5-m10-guardian-ablation.cjs
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
const SEEDS=[20261030,4175863657,123456789];
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
const ARMS=['baseline','shields','healing','reactions','mitigation','all'];
const GROUPS={
 shields:['G01','G05','G10','J09','L05','L07'],
 healing:['G09','L01','L03','L06','L09'],
 reactions:['G02','G03','G07','J06'],
 mitigation:['G04','G06','G08','L10']
};
const GUARDIAN_BUILDS=[
 ['G01','G02','G03','G05','G07','G09','G10','L01','L03','J09'],
 ['G01','G03','G04','G05','G06','G09','L01','L06','J06','J09'],
 ['G01','G02','G05','G07','G10','L03','L05','L07','L09','J09'],
 ['G01','G02','G03','G04','G08','G09','L01','L10','J06','J09']
];
const SCENARIOS=[
 {name:'4-balanced',allocation:[1,1,1,1]},
 {name:'30-balanced',allocation:[8,8,7,7]},
 {name:'30-guardian-half',allocation:[5,5,5,15]}
];
function interleave(allocation){
 const rest=[...allocation],classes=[];
 while(rest.some(n=>n>0))for(let i=0;i<4;i++)if(rest[i]>0){
  classes.push(CLASSES[i]);rest[i]--;
 }
 return classes;
}
function rotate(a,shift){return a.map((_,i)=>a[(i+shift)%a.length]);}
function entry(klass,slot,guardianIndex,variant,scenarioIndex){
 const name='trial-ablation-'+scenarioIndex+'-'+slot;
 const m5=P.exampleBuild(klass,name,5,variant);
 const m10=P.exampleBuild(klass,name,10,variant,{experimentalFinal:true});
 const talents=klass==='guardian'?GUARDIAN_BUILDS[guardianIndex%GUARDIAN_BUILDS.length]:m10.talents;
 const frozen={attributes:m5.attributes,talents:klass==='guardian'?talents.slice(0,5):m5.talents};
 const final=policy.m10ArenaAdapter({rosterKey:name,klass,completedMissions:APPROVALS,
  build:{attributes:m10.attributes,talents},m5Entered:true,m5Frozen:frozen,m10Locked:true});
 assert.equal(final.build.talents.length,10);
 assert.equal(Object.values(final.build.attributes).reduce((a,b)=>a+b,0),20);
 return {...final,id:name};
}
function initial(game){return game.fighters.map(f=>({id:f.id,klass:f.build.klass,
 x:f.x,z:f.z,face:f.face,basic:f.basic,hp:f.hp,stats:f.stats,build:f.build}));}
function round(n){return +n.toFixed(3);}
function metrics(game,result){
 const guardians=new Set(game.fighters.filter(f=>f.build.klass==='guardian').map(f=>f.id));
 const guardianWins=result.winner?.klass==='guardian'?1:0;
 const own=event=>guardians.has(event.hero);
 const guardianHits=result.events.filter(e=>e.type==='hit'&&guardians.has(e.target));
 const sum=(list,key)=>list.reduce((n,e)=>n+(e[key]||0),0);
 const guardiansAtEnd=game.fighters.filter(f=>guardians.has(f.id));
 return {guardianWins,guardianCount:guardians.size,
  shieldNominal:round(sum(result.events.filter(e=>e.type==='shield'&&own(e)),'amount')),
  healEffective:round(sum(result.events.filter(e=>e.type==='heal'&&own(e)),'amount')),
  absorbed:round(sum(guardianHits,'absorbed')),
  incomingHpDamage:round(sum(guardianHits,'amount')),
  guardianDamage:round(guardiansAtEnd.reduce((n,f)=>n+f.damage,0)),
  meanSurvival:round(guardiansAtEnd.reduce((n,f)=>n+(f.eliminatedAt??result.time),0)/guardians.size),
  guardianTalentEvents:result.events.filter(e=>e.type==='talent'&&own(e)).length,
  guardianProcEvents:result.events.filter(e=>e.type==='proc'&&own(e)).length,
  time:result.time};
}
function add(dst,metric){for(const [k,v] of Object.entries(metric))dst[k]=(dst[k]||0)+v;}
const report={schema:'v5-m10-guardian-ablation-v1',date:'2026-10-30',
 kind:'synthetic-paired-whole-talent-ablation',options:OPTIONS,
 groups:GROUPS,scenarios:[],limitations:[
 'Suppresses the complete effect of selected Guardian talents; some skills combine offense and defense. Group effects are not additive.',
 'Baseline vs ablation keeps selected talents, attributes, hero IDs, initial positions and per-hero crit seeds identical within each block, but later combat diverges naturally.',
 'Only a few synthetic builds and seeds; not a statistical fairness claim and not an authorized nerf.',
 'The 4-player roster has one Guardian build; some ablation groups can be absent there. The 30-player rosters cover all four groups.',
 'No 3D M10, real-PC G.2, student identity, XP, live synchronization, V3 integration, production or main changes.'
 ]};
let games=0,paired=0,replays=0,changed=Object.fromEntries(ARMS.slice(1).map(a=>[a,0]));
let coverage=Object.fromEntries(Object.keys(GROUPS).map(k=>[k,0]));
for(let si=0;si<SCENARIOS.length;si++){
 const scenario=SCENARIOS[si],baseClasses=interleave(scenario.allocation);
 const out={name:scenario.name,allocation:scenario.allocation,blocks:0,arms:{},
  changedWinnerVsBaseline:{},baselineGuardianWins:0};
 for(let seedIndex=0;seedIndex<SEEDS.length;seedIndex++){
  for(const shift of [0,Math.floor(baseClasses.length/2)]){
   const classes=rotate(baseClasses,shift),guardianCount={value:0};
   const entries=classes.map((klass,slot)=>{
    const variant=(slot*7+seedIndex*3+si*5)%11;
    const idx=klass==='guardian'?guardianCount.value++:0;
    return entry(klass,slot,idx,variant,si);
   });
   const seed=(SEEDS[seedIndex]+classes.length*7919+si*104729+shift*65537)>>>0;
   const opts={...OPTIONS,seed,experimentalCritSeed:(seed^0xdecafbad)>>>0};
   const baselineGame=P.battle(entries,opts),snapshot=initial(baselineGame);
   const baseline=baselineGame.run();
   assert(baseline.finished&&baseline.winner);
   assert.deepEqual(P.battle(entries,{...opts,experimentalGuardianAblation:null}).run(),baseline,
    'null ablation must be exactly the original engine');
   const baselineMetrics=metrics(baselineGame,baseline);
   add(out.arms.baseline??={},baselineMetrics);
   out.baselineGuardianWins+=baselineMetrics.guardianWins;
   games++;out.blocks++;
   if(seedIndex===0&&shift===0){
    assert.deepEqual(P.battle(entries,opts).run(),baseline);
    replays++;
   }
   for(const arm of ARMS.slice(1)){
    const disabled=arm==='all'?new Set(Object.values(GROUPS).flat()):new Set(GROUPS[arm]);
    const game=P.battle(entries,{...opts,experimentalGuardianAblation:arm});
    assert.deepEqual(initial(game),snapshot,'ablation cannot modify initial stats, build or positions');
    const result=game.run();
    assert(result.finished&&result.winner);
    assert.equal(result.events.filter(e=>e.type==='end').length,1);
    assert(!result.events.some(e=>e.hero&&
      entries.some(x=>x.id===e.hero&&x.klass==='guardian')&&
      ['talent','proc','charge'].includes(e.type)&&disabled.has(e.talent)),
      'suppressed Guardian talent must never activate or proc');
    add(out.arms[arm]??={},metrics(game,result));
    if(result.winner.id!==baseline.winner.id){
     changed[arm]++;out.changedWinnerVsBaseline[arm]=(out.changedWinnerVsBaseline[arm]||0)+1;
    }
    games++;paired++;
    if(seedIndex===0&&shift===0&&arm==='all'){
     assert.deepEqual(P.battle(entries,{...opts,experimentalGuardianAblation:arm}).run(),result);
     replays++;
    }
   }
   if(classes.length===30){
    for(const [group,ids] of Object.entries(GROUPS))
     coverage[group]+=entries.filter(e=>e.klass==='guardian'&&e.build.talents.some(t=>ids.includes(t))).length;
   }
  }
 }
 for(const arm of ARMS)for(const [key,value] of Object.entries(out.arms[arm]))
  out.arms[arm][key]=key==='guardianCount'?value:round(value);
 out.scenarioPairs=out.blocks*5;
 report.scenarios.push(out);
}
assert.equal(games,SCENARIOS.length*SEEDS.length*2*ARMS.length);
assert.equal(games,108);assert.equal(paired,90);assert.equal(replays,6);
assert(Object.values(coverage).every(n=>n>0),'all four Guardian defensive groups must be represented in 30-player builds');
const m5Entries=['warrior','guardian'].map((klass,i)=>({
 id:'trial-m5-'+i,build:P.exampleBuild(klass,'trial-m5-'+i,5,i),approvedMissions:5
}));
const m5Options={seed:4175863657,arenaScale:5,damageScale:.5};
const m5=P.battle(m5Entries,m5Options).run();
assert.deepEqual(P.battle(m5Entries,{...m5Options,arenaMission:5}).run(),m5);
for(const value of ['shields','all','unknown',[],{}]){
 assert.throws(()=>P.battle(m5Entries,{...m5Options,experimentalGuardianAblation:value}),/Ablação experimental/);
}
const valid=entry('guardian',0,0,0,0);
const m10=[valid,entry('warrior',1,0,0,0)];
for(const value of ['unknown',[],{},'',0]){
 assert.throws(()=>P.battle(m10,{...OPTIONS,experimentalGuardianAblation:value}),/Ablação experimental/);
}
report.totals={games,pairedComparisons:paired,exactReplays:replays,blocks:18,
 changedWinnerVsBaseline:changed,groupExposureIn30:coverage,unchangedM5:true};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.totals)).digest('hex').slice(0,20);
if(process.env.M10_GUARDIAN_REPORT_FILE){
 const file=path.resolve(process.env.M10_GUARDIAN_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 GUARDIAN ABLATION REPORT '+JSON.stringify(report));
console.log('PASS M10 Guardian defensive ablation: '+games+' games, '+paired+
 ' paired comparisons, '+replays+' exact replays, unchanged M5, no real writes.');

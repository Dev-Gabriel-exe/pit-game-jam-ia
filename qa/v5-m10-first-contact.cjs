'use strict';
/* H.3/M10 — diagnostic of initial proximity and first selected target.
 * Observation only: no combat, talent, balance, XP or real student mutation.
 * Sixteen seed clusters; rotations and builds within a seed are correlated.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
const SHIFTS=[1,15],VARIANTS=[0,5,9],SEEDS=16;
const classes=Array.from({length:30},(_,i)=>CLASSES[i%4]).slice(0,28).concat(['warrior','mage']);
// 8 warrior, 8 mage, 7 hunter, 7 guardian; balanced M10 roster.
assert.deepEqual(CLASSES.map(c=>classes.filter(x=>x===c).length),[8,8,7,7]);
assert.equal(CLASSES.reduce((n,c)=>n+P.TALENTS[c].length,0),120);
function entries(variant){
 return classes.map((klass,i)=>{
  const id='trial-proximity-'+i,old=P.exampleBuild(klass,id,5,variant);
  const fin=P.exampleBuild(klass,id,10,variant,{experimentalFinal:true});
  assert.deepEqual(fin.talents.slice(0,5),old.talents);
  assert.equal(fin.talents.length,10);
  assert.equal(Object.values(fin.attributes).reduce((a,b)=>a+b,0),20);
  for(const a of P.ATTR)assert(fin.attributes[a]>=old.attributes[a]);
  const entry=policy.m10ArenaAdapter({rosterKey:id,klass,completedMissions:APPROVALS,
   build:{attributes:fin.attributes,talents:fin.talents},m5Entered:true,
   m5Frozen:{attributes:old.attributes,talents:old.talents},m10Locked:true});
  return {...entry,id};
 });
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function positions(game){
 return Object.fromEntries(game.fighters.map(f=>[f.id,{x:f.x,z:f.z,face:f.face}]));
}
function nearest(game){
 return Object.fromEntries(game.fighters.map(f=>{
  let rival=null,best=Infinity;
  for(const other of game.fighters){
   if(other===f)continue;
   const d=distance(f,other);
   if(d<best){best=d;rival=other;}
  }
  return [f.id,{target:rival.id,distance:best,klass:f.build.klass}];
 }));
}
function early(game){
 const initial=nearest(game);
 game.update(.05);
 const targets=Object.fromEntries(game.fighters.map(f=>[f.id,f.lastTarget]));
 assert(Object.values(targets).every(id=>typeof id==='string'));
 return {initial,targets,result:game.run()};
}
const mean=a=>a.reduce((s,n)=>s+n,0)/a.length;
const round=n=>Number(n.toFixed(4));
const report={schema:'pit-v5-m10-first-contact-v1',scope:'isolated synthetic M10',
 seedClusters:SEEDS,correlatedBuildVariants:VARIANTS,correlatedSpawnShifts:SHIFTS,
 scenarios:[],limitations:[
 'First selected target is observed after the first 0.05s tick, not a trace of every later target.',
 'Nearest neighbor is Euclidean at spawn; it does not model obstacles, line of sight or aggro reservations.',
 'A shifted spawn also changes local distances, sightlines and subsequent encounter-dependent RNG; associations are not causal mediation.',
 'Variants and rotations reuse each seed and cannot be counted as independent samples.',
 'No M5, canonical combat tuning, PC G.2, real H.1/H.2, XP, student or main changes.'
 ]};
let games=0,comparisons=0,replays=0;
for(const variant of VARIANTS){
 const roster=entries(variant),ids=roster.map(e=>e.id);
 const summary={variant,seeds:[],comparisons:0,nearestChanged:0,firstTargetChanged:0,
  winnerChanged:0,firstTargetAndWinnerChanged:0,nearestMatchesFirstTarget:0,
  firstTargetChecks:0,guardianNearestDistances:[],otherNearestDistances:[]};
 for(let k=0;k<SEEDS;k++){
  const seed=(Math.imul(k+1,2246822519)^Math.imul(12,3266489917)^0xa511e9b3)>>>0;
  const opts={...OPTIONS,seed,experimentalCritSeed:(seed^0x5f3759df)>>>0};
  const baselineGame=P.battle(roster,opts),start=positions(baselineGame);
  const baseline=early(baselineGame);games++;
  assert(baseline.result.finished&&baseline.result.winner);
  if(k===0){
   const replay=early(P.battle(roster,opts));
   assert.deepEqual(replay,baseline);replays++;
  }
  const seedRow={seed,shifts:[]};
  for(const shift of SHIFTS){
   const swapped=Object.fromEntries(ids.map((id,i)=>[id,start[ids[(i+shift)%ids.length]]]));
   const trialGame=P.battle(roster,{...opts,experimentalSpawnPositions:swapped});
   for(const f of trialGame.fighters){
    assert.deepEqual({x:f.x,z:f.z,face:f.face},swapped[f.id]);
    const original=baselineGame.fighters.find(x=>x.id===f.id);
    assert.deepEqual(f.build,original.build);
    assert.deepEqual(f.stats,original.stats);
    assert.equal(f.hp,original.hp);
   }
   const trial=early(trialGame);games++;
   assert(trial.result.finished&&trial.result.winner);
   if(k===0&&shift===SHIFTS[0]){
    assert.deepEqual(early(P.battle(roster,{...opts,experimentalSpawnPositions:swapped})),trial);
    replays++;
   }
   let nearestChanged=0,firstTargetChanged=0,matching=0;
   for(const id of ids){
    nearestChanged+=Number(baseline.initial[id].target!==trial.initial[id].target);
    firstTargetChanged+=Number(baseline.targets[id]!==trial.targets[id]);
    matching+=Number(trial.initial[id].target===trial.targets[id]);
    const d=trial.initial[id].distance;
    assert(Number.isFinite(d)&&d>0);
    (trial.initial[id].klass==='guardian'?summary.guardianNearestDistances:
     summary.otherNearestDistances).push(d);
   }
   const winnerChanged=Number(baseline.result.winner.id!==trial.result.winner.id);
   summary.comparisons++;comparisons++;
   summary.nearestChanged+=nearestChanged;
   summary.firstTargetChanged+=firstTargetChanged;
   summary.winnerChanged+=winnerChanged;
   summary.firstTargetAndWinnerChanged+=Number(firstTargetChanged>0&&winnerChanged);
   summary.nearestMatchesFirstTarget+=matching;summary.firstTargetChecks+=ids.length;
   seedRow.shifts.push({shift,nearestChanged,firstTargetChanged,
    winnerChanged:Boolean(winnerChanged),baselineWinnerClass:baseline.result.winner.klass,
    shiftedWinnerClass:trial.result.winner.klass});
  }
  summary.seeds.push(seedRow);
 }
 summary.guardianNearestMean=round(mean(summary.guardianNearestDistances));
 summary.otherNearestMean=round(mean(summary.otherNearestDistances));
 delete summary.guardianNearestDistances;delete summary.otherNearestDistances;
 report.scenarios.push(summary);
}
const m5=['warrior','guardian'].map((klass,i)=>({id:'trial-proximity-m5-'+i,
 approvedMissions:5,build:P.exampleBuild(klass,'trial-proximity-m5-'+i,5,0)}));
assert.deepEqual(P.battle(m5,{seed:4175863657}).run(),
 P.battle(m5,{seed:4175863657,arenaMission:5}).run());
assert.throws(()=>P.battle(m5,{experimentalSpawnPositions:{}}),/M10/);
assert.equal(games,144);assert.equal(comparisons,96);assert.equal(replays,6);
report.totals={games,comparisons,replays,m5Unchanged:true,seedClusters:SEEDS};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.scenarios)).digest('hex').slice(0,20);
if(process.env.M10_FIRST_CONTACT_REPORT_FILE){
 const target=path.resolve(process.env.M10_FIRST_CONTACT_REPORT_FILE);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 FIRST CONTACT '+JSON.stringify(report.scenarios.map(s=>({
 variant:s.variant,comparisons:s.comparisons,
 nearestChanged:s.nearestChanged,firstTargetChanged:s.firstTargetChanged,
 winnerChanged:s.winnerChanged,guardianNearestMean:s.guardianNearestMean,
 otherNearestMean:s.otherNearestMean
}))));
console.log('PASS M10 first contact: '+games+' battles, '+comparisons+
 ' paired spawn rotations, '+replays+' exact replays; M5 unchanged; hash '+report.hash);

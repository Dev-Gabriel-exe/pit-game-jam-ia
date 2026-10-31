'use strict';
/* H.3/M10: stratified paired trial of static-pillar-aware target selection.
 * Does NOT change M5, default M10, projectile collision, XP or students.
 * Static ray/circle is a proxy, not full visibility of spells or moving units.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const OPT={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,rangedCommitment:'recovery',navigationMode:'steer',
 balancePreset:'e-hp2',limit:105};
const sha=o=>crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0,20);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function blocked(a,b,obstacles){
 const dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz;
 if(l2<1e-8)return false;
 return obstacles.some(o=>{
  const t=clamp(((o.x-a.x)*dx+(o.z-a.z)*dz)/l2,0,1);
  return (a.x+dx*t-o.x)**2+(a.z+dz*t-o.z)**2<(o.r+.2)**2;
 });
}
function entry(klass,id,variant=0){
 const m5=P.exampleBuild(klass,id,5,variant);
 const m10=P.exampleBuild(klass,id,10,variant,{experimentalFinal:true});
 assert.deepEqual(m10.talents.slice(0,5),m5.talents);
 assert.equal(m10.talents.length,10);
 assert.equal(Object.values(m10.attributes).reduce((a,b)=>a+b,0),20);
 return {...policy.m10ArenaAdapter({rosterKey:id,klass,completedMissions:APPROVALS,
  build:{attributes:m10.attributes,talents:m10.talents},
  m5Entered:true,m5Frozen:{attributes:m5.attributes,talents:m5.talents},
  m10Locked:true}),id};
}
function roster(count,variant){
 return Array.from({length:count},(_,i)=>entry(CLASSES[i%4],
  'trial-m10-los-combat-'+count+'-'+i,variant));
}
function firstTick(entries,options){
 const g=P.battle(entries,options);
 const initial=Object.fromEntries(g.fighters.map(f=>[f.id,{x:f.x,z:f.z,hp:f.hp}]));
 const obstacles=g.obstacles.map(o=>({...o}));
 g.update(.05);
 return {initial,obstacles,targets:Object.fromEntries(g.fighters.map(f=>[f.id,f.lastTarget]))};
}
const report={schema:'pit-v5-m10-los-combat-trial-v2',
 scope:'M10 synthetic only; optional targeting, default unchanged',
 limitations:[
  'Static pillar ray uses projectile radius r+.2; no moving-unit interception or spell LOS.',
  'Opt-in modifies target choice and therefore combat; not a production balance change.',
  'Seeds are paired between arms, not independent across modes or roster variants.',
  'Samples are stratified by build, roster size and aggro; paired seeds are reused across builds and modes.',
  'Sample sizes are exploratory; changes in wins do not establish fair class balance.',
  'G.2 physical PC test pending; H.1/H.2 real integration blocked.'
 ],fixtures:{},groups:[],totals:{pairedBattles:0,fullBattles:0,changedFirstTargets:0,
 blockedBaselineFirstTargets:0,blockedTrialFirstTargets:0,changedWinners:0,
 changedWithClearInitial:0,changedWithBlockedInitial:0,boundAtSpawnViolations:0,
 exactReplays:0,m5Unchanged:false,defaultM10Unchanged:false,buildVariants:[0,3,5],seedsPerStratum:8}};
assert.throws(()=>P.battle(roster(4,0),{...OPT,arenaMission:5,experimentalVisibilityAwareTargets:true}));
assert.throws(()=>P.battle(roster(4,0),{...OPT,experimentalVisibilityAwareTargets:'true'}));
{
 const trio=[entry('warrior','trial-los-a'),entry('hunter','trial-los-b'),entry('mage','trial-los-c')];
 const positions={
  'trial-los-a':{x:-4,z:0,face:0},
  'trial-los-b':{x:4,z:0,face:0},
  'trial-los-c':{x:-1,z:10,face:0}
 };
 const opts={arenaMission:10,arenaScale:1,seed:713,engagementMode:'free',
  experimentalSpawnPositions:positions};
 const before=firstTick(trio,opts),after=firstTick(trio,{...opts,experimentalVisibilityAwareTargets:true});
 assert.equal(before.targets['trial-los-a'],'trial-los-b');
 assert.equal(after.targets['trial-los-a'],'trial-los-c');
 assert(blocked(before.initial['trial-los-a'],before.initial['trial-los-b'],before.obstacles));
 assert(!blocked(after.initial['trial-los-a'],after.initial['trial-los-c'],after.obstacles));
 assert.deepEqual(after.initial,before.initial);
 report.fixtures.blockedTargetRedirect=true;
}
{
 const entries=roster(4,0),opts={...OPT,seed:1002,engagementMode:'spaced'};
 assert.deepEqual(P.battle(entries,opts).run(),P.battle(entries,{...opts,experimentalVisibilityAwareTargets:false}).run());
 report.totals.defaultM10Unchanged=true;
 const m5=['warrior','guardian'].map((klass,i)=>({
  id:'trial-los-m5-'+i,approvedMissions:5,
  build:P.exampleBuild(klass,'trial-los-m5-'+i,5,0)}));
 assert.deepEqual(P.battle(m5,{seed:42}).run(),P.battle(m5,{seed:42,arenaMission:5}).run());
 report.totals.m5Unchanged=true;
}
for(const variant of [0,3,5])for(const count of [4,30])for(const mode of ['free','spaced']){
 const group={variant,count,mode,seeds:8,pairedBattles:0,changedFirstTargets:0,
 blockedBaselineFirstTargets:0,blockedTrialFirstTargets:0,changedWinners:0,
 changedWithClearInitial:0,changedWithBlockedInitial:0,boundAtSpawnViolations:0,
 baselineWins:{},trialWins:{},meanBaselineSeconds:0,meanTrialSeconds:0,
 baselineTalentEvents:0,trialTalentEvents:0,baselinePillarBlocks:0,trialPillarBlocks:0,
  byClass:Object.fromEntries(CLASSES.map(c=>[c,{actors:0,changedTargets:0,blockedBaseline:0,blockedTrial:0}]))};
 let baselineSeconds=0,trialSeconds=0;
 const entries=roster(count,variant);
 for(let k=0;k<8;k++){
  const seed=(Math.imul(k+1,2246822519)^Math.imul(count,3266489917)^0x75e1932b)>>>0;
  const options={...OPT,seed,engagementMode:mode};
  const original=firstTick(entries,options);
  const trial=firstTick(entries,{...options,experimentalVisibilityAwareTargets:true});
  assert.deepEqual(original.initial,trial.initial);
  assert.deepEqual(original.obstacles,trial.obstacles);
  for(const e of entries){
   const id=e.id,klass=e.build.klass,chosen=original.targets[id],next=trial.targets[id];
   const classStats=group.byClass[klass];classStats.actors++;
   const oldBlocked=blocked(original.initial[id],original.initial[chosen],original.obstacles);
   const newBlocked=blocked(trial.initial[id],trial.initial[next],trial.obstacles);
   group.blockedBaselineFirstTargets+=Number(oldBlocked);
   group.blockedTrialFirstTargets+=Number(newBlocked);
   classStats.blockedBaseline+=Number(oldBlocked);
   classStats.blockedTrial+=Number(newBlocked);
   classStats.changedTargets+=Number(chosen!==next);
   if(chosen!==next){
    group.changedFirstTargets++;
    // Snapshot coordinates are captured BEFORE the tick; previous fighters
    // can move before this actor selects a target. Classify disagreements
    // rather than asserting a false time-of-selection invariant.
    group.changedWithClearInitial+=Number(!oldBlocked);
    group.changedWithBlockedInitial+=Number(newBlocked);
    const d0=distance(original.initial[id],original.initial[chosen]);
    group.boundAtSpawnViolations+=Number(distance(trial.initial[id],trial.initial[next])>
      d0+Math.min(8,d0*.5)+1e-8);
   }
  }
  const base=P.battle(entries,options).run();
  const candidate=P.battle(entries,{...options,experimentalVisibilityAwareTargets:true}).run();
  assert(base.finished&&candidate.finished);
  assert(base.winner&&candidate.winner);
  group.pairedBattles++;report.totals.fullBattles+=2;
  baselineSeconds+=base.time;trialSeconds+=candidate.time;
  group.changedWinners+=Number(base.winner.id!==candidate.winner.id);
  for(const [key,r] of [['baseline',base],['trial',candidate]]){
   const klass=entries.find(e=>e.id===r.winner.id).build.klass;
   const wins=key==='baseline'?group.baselineWins:group.trialWins;
   wins[klass]=(wins[klass]||0)+1;
   group[key+'TalentEvents']+=r.events.filter(e=>e.type==='talent').length;
   group[key+'PillarBlocks']+=r.events.filter(e=>e.type==='blocked'&&e.kind==='pillar').length;
  }
  if(k===0){
   assert.equal(sha(P.battle(entries,options).run()),sha(base));
   assert.equal(sha(P.battle(entries,{...options,experimentalVisibilityAwareTargets:true}).run()),sha(candidate));
   report.totals.exactReplays+=2;
  }
 }
 group.meanBaselineSeconds=+(baselineSeconds/group.pairedBattles).toFixed(3);
 group.meanTrialSeconds=+(trialSeconds/group.pairedBattles).toFixed(3);
 for(const key of ['pairedBattles','changedFirstTargets','blockedBaselineFirstTargets',
  'blockedTrialFirstTargets','changedWinners','changedWithClearInitial',
  'changedWithBlockedInitial','boundAtSpawnViolations'])report.totals[key]+=group[key];
 report.groups.push(group);
}
assert.equal(report.groups.length,12);
assert.equal(report.totals.pairedBattles,96);
assert.equal(report.totals.fullBattles,192);
assert.equal(report.totals.exactReplays,24);
for(const group of report.groups){
 assert.equal(group.pairedBattles,8);
 assert.equal(Object.values(group.byClass).reduce((sum,c)=>sum+c.actors,0),group.count*8);
 assert.equal(Object.values(group.byClass).reduce((sum,c)=>sum+c.changedTargets,0),group.changedFirstTargets);
 assert.equal(Object.values(group.byClass).reduce((sum,c)=>sum+c.blockedBaseline,0),group.blockedBaselineFirstTargets);
 assert.equal(Object.values(group.byClass).reduce((sum,c)=>sum+c.blockedTrial,0),group.blockedTrialFirstTargets);
 assert.equal(Object.values(group.baselineWins).reduce((sum,n)=>sum+n,0),8);
 assert.equal(Object.values(group.trialWins).reduce((sum,n)=>sum+n,0),8);
}
assert(report.totals.changedFirstTargets>0,'trial should actually change some first targets');
// Selection-time guarantees are tested by the fixed three-hero fixture.
// Aggregate pre-tick positions are observational, not selection-time proofs.
report.hash=sha(report.groups);
if(process.env.M10_LOS_COMBAT_REPORT_FILE){
 const out=path.resolve(process.env.M10_LOS_COMBAT_REPORT_FILE);
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 LOS COMBAT TRIAL '+JSON.stringify(report.groups));
console.log('PASS M10 opt-in LOS combat trial '+JSON.stringify(report.totals)+' hash '+report.hash);

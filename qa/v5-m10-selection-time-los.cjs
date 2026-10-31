'use strict';
/* H.3/M10: exact selection-time LOS trace, synthetic, read-only.
 * The opt-in trace captures coordinates inside the target decision loop.
 * It never changes target scoring, projectiles, combat events or winner.
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
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function blocked(a,b,obstacles){
 const dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz;
 if(l2<1e-8)return false;
 return obstacles.some(o=>{
  const t=clamp(((o.x-a.x)*dx+(o.z-a.z)*dz)/l2,0,1);
  return (a.x+dx*t-o.x)**2+(a.z+dz*t-o.z)**2<(o.r+.2)**2;
 });
}
function roster(count,variant){
 return Array.from({length:count},(_,i)=>{
  const klass=CLASSES[i%4],id='trial-m10-selection-trace-'+count+'-'+i;
  const m5=P.exampleBuild(klass,id,5,variant);
  const m10=P.exampleBuild(klass,id,10,variant,{experimentalFinal:true});
  assert.equal(m5.talents.length,5);
  assert.equal(Object.values(m5.attributes).reduce((a,b)=>a+b,0),10);
  assert.deepEqual(m10.talents.slice(0,5),m5.talents);
  assert.equal(m10.talents.length,10);
  assert.equal(Object.values(m10.attributes).reduce((a,b)=>a+b,0),20);
  return {...policy.m10ArenaAdapter({rosterKey:id,klass,completedMissions:APPROVALS,
   build:{attributes:m10.attributes,talents:m10.talents},m5Entered:true,
   m5Frozen:{attributes:m5.attributes,talents:m5.talents},m10Locked:true}),id};
 });
}
assert.throws(()=>P.battle(roster(4,0),{...OPT,arenaMission:5,experimentalTargetTrace:true}));
assert.throws(()=>P.battle(roster(4,0),{...OPT,experimentalTargetTrace:'true'}));
const report={schema:'pit-v5-m10-selection-time-los-v1',
 scope:'M10 synthetic, opt-in trace; no live data or gameplay change',
 limitations:[
  'Exact positions at selection time, but only static pillar segments (r + 0.2).',
  'Does not prove projectile hit, spell visibility, moving-unit interception or class fairness.',
  'Paired seeds reused across builds, aggro modes and opt-in arms; not independent observations.',
  'G.2 physical PCs pending; H.1/H.2 real student integration blocked.'
 ],groups:[],totals:{pairs:0,tracedTicks:0,actors:0,changedTargets:0,
 blockedBefore:0,blockedAfter:0,preTickDisagreements:0,retargetWithoutBlock:0,
 retargetToBlock:0,rangeViolations:0,traceParity:true,fullReplayParity:0}};
for(const variant of [0,3,5])for(const count of [4,30])for(const mode of ['free','spaced']){
 const group={variant,count,mode,pairs:0,actors:0,changedTargets:0,
  blockedBefore:0,blockedAfter:0,preTickDisagreements:0,
  byClass:Object.fromEntries(CLASSES.map(klass=>[klass,{actors:0,changed:0,blockedBefore:0,blockedAfter:0}]))};
 const entries=roster(count,variant);
 for(let k=0;k<4;k++){
  const seed=(Math.imul(k+1,2246822519)^Math.imul(count,3266489917)^0x75283af1)>>>0;
  const opts={...OPT,seed,engagementMode:mode};
  const arms=[];
  for(const experimentalVisibilityAwareTargets of [false,true]){
   const config={...opts,experimentalVisibilityAwareTargets};
   const plain=P.battle(entries,config);
   const traced=P.battle(entries,{...config,experimentalTargetTrace:true});
   const initial=Object.fromEntries(traced.fighters.map(f=>[f.id,{x:f.x,z:f.z}]));
   const before=traced.targetSelectionTrace;
   assert.equal(before.length,0);
   plain.update(.05);traced.update(.05);
   assert.deepEqual(traced.events,plain.events,'trace cannot change combat events');
   assert.deepEqual(traced.fighters,plain.fighters,'trace cannot change fighters');
   const trace=traced.targetSelectionTrace;
   assert.equal(trace.length,count);
   assert.notEqual(trace,traced.targetSelectionTrace,'trace getter must return a copy');
   trace.pop();
   assert.equal(traced.targetSelectionTrace.length,count);
   for(const t of traced.targetSelectionTrace){
    assert(Object.isFrozen(t)&&Object.isFrozen(t.from)&&Object.isFrozen(t.before)&&Object.isFrozen(t.after));
    assert.equal(t.time,.05);
    assert.equal(t.after.id,traced.fighters.find(f=>f.id===t.actor).lastTarget);
    assert.equal(t.before.blocked,blocked(t.from,t.before,traced.obstacles));
    assert.equal(t.after.blocked,blocked(t.from,t.after,traced.obstacles));
    assert(Math.abs(t.before.distance-Math.hypot(t.from.x-t.before.x,t.from.z-t.before.z))<1e-8);
    assert(Math.abs(t.after.distance-Math.hypot(t.from.x-t.after.x,t.from.z-t.after.z))<1e-8);
    assert(t.aggroBefore>=0&&t.aggroAfter>=0);
    const changed=t.before.id!==t.after.id;
    if(changed){
     group.changedTargets++;group.byClass[t.klass].changed++;
     report.totals.retargetWithoutBlock+=Number(!t.before.blocked);
     report.totals.retargetToBlock+=Number(t.after.blocked);
     report.totals.rangeViolations+=Number(t.after.distance>
      t.before.distance+Math.min(8,t.before.distance*.5)+1e-8);
    }
    const pre=initial[t.actor],preTarget=initial[t.before.id];
    group.preTickDisagreements+=Number(blocked(pre,preTarget,traced.obstacles)!==t.before.blocked);
    group.blockedBefore+=Number(t.before.blocked);
    group.blockedAfter+=Number(t.after.blocked);
    group.actors++;
    group.byClass[t.klass].actors++;
    group.byClass[t.klass].blockedBefore+=Number(t.before.blocked);
    group.byClass[t.klass].blockedAfter+=Number(t.after.blocked);
   }
   arms.push({traced,plain});
   report.totals.tracedTicks++;
  }
  // Both traced arms must start from the same physical initial conditions.
  assert.deepEqual(arms[0].traced.obstacles,arms[1].traced.obstacles);
  group.pairs++;report.totals.pairs++;
 }
 assert.equal(group.actors,group.pairs*count*2);
 for(const key of ['actors','changedTargets','blockedBefore','blockedAfter','preTickDisagreements'])
  report.totals[key]+=group[key];
 report.groups.push(group);
}
assert.equal(report.totals.pairs,48);
assert.equal(report.totals.tracedTicks,96);
assert.equal(report.totals.actors,1632);
assert.equal(report.totals.retargetWithoutBlock,0,'retargeting requires an obstructed original at selection time');
assert.equal(report.totals.retargetToBlock,0,'retargeting must choose a clear static segment');
assert.equal(report.totals.rangeViolations,0,'retargeting must respect the distance bound');
assert(report.totals.changedTargets>0,'fixtures must exercise retargeting');
for(const count of [4,30]){
 const entries=roster(count,3);
 for(const seed of [781,1459]){
  const opts={...OPT,seed,engagementMode:'spaced',experimentalVisibilityAwareTargets:true};
  const baseline=P.battle(entries,opts).run();
  const traced=P.battle(entries,{...opts,experimentalTargetTrace:true}).run();
  assert.deepEqual(traced,baseline,'diagnostic trace cannot change full battle results');
  report.totals.fullReplayParity++;
 }
}
const m5=['warrior','guardian'].map((klass,i)=>({
 id:'trial-selection-m5-'+i,approvedMissions:5,
 build:P.exampleBuild(klass,'trial-selection-m5-'+i,5,0)}));
assert.deepEqual(P.battle(m5,{seed:42}).run(),P.battle(m5,{seed:42,arenaMission:5}).run());
report.totals.m5Unchanged=true;
report.hash=sha(report.groups);
if(process.env.M10_TARGET_TRACE_REPORT_FILE){
 const out=path.resolve(process.env.M10_TARGET_TRACE_REPORT_FILE);
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 TARGET TRACE '+JSON.stringify(report.groups));
console.log('PASS M10 selection-time LOS trace '+JSON.stringify(report.totals)+' hash '+report.hash);

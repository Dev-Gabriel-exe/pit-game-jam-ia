'use strict';
/* H.3 / M10: counterfactual first-contact visibility diagnostic.
 * Read-only simulation: DOES NOT modify the engine, targeting, damage or winners.
 * Circle intersections are geometric proxies, NOT proven projectile LOS.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const SEEDS=8, APPROVALS=Array.from({length:10},(_,i)=>i+1);
const OPT={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,rangedCommitment:'recovery',balancePreset:'e-hp2'};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
function blocked(a,b,obstacles){
 const dx=b.x-a.x,dz=b.z-a.z,denom=dx*dx+dz*dz;
 return obstacles.some(o=>{
  const t=denom>1e-8?clamp(((o.x-a.x)*dx+(o.z-a.z)*dz)/denom,0,1):0;
  return (a.x+t*dx-o.x)**2+(a.z+t*dz-o.z)**2<o.r**2;
 });
}
function candidate(origin,chosen,rivals,positions,obstacles){
 const d=distance(origin,positions[chosen]);
 if(!blocked(origin,positions[chosen],obstacles))return {id:chosen,reason:'already-clear',delta:0};
 // Bounded displacement: never cross the map merely to escape a column.
 const maxExtra=Math.min(8,d*.5);
 const alternatives=rivals.filter(id=>!blocked(origin,positions[id],obstacles))
  .map(id=>({id,distance:distance(origin,positions[id])}))
  .filter(x=>x.distance<=d+maxExtra+1e-8)
  .sort((a,b)=>a.distance-b.distance||a.id.localeCompare(b.id));
 if(!alternatives.length)return {id:chosen,reason:'no-nearby-clear',delta:0};
 return {id:alternatives[0].id,reason:'nearby-clear',delta:alternatives[0].distance-d};
}
// Focused policy fixtures (including bounded fallback and deterministic tie-break).
{
 const origin={x:0,z:0},obs=[{x:2,z:0,r:1}],positions={
  blocked:{x:4,z:0},near:{x:3,z:3},far:{x:15,z:0},tied:{x:3,z:-3}};
 assert.equal(blocked(origin,positions.blocked,obs),true);
 assert.equal(blocked(origin,positions.near,obs),false);
 assert.equal(candidate(origin,'blocked',['near','tied','far'],positions,obs).id,'near');
 assert.equal(candidate(origin,'blocked',['far'],positions,obs).reason,'no-nearby-clear');
 assert.equal(candidate(origin,'near',['blocked','far'],positions,obs).reason,'already-clear');
}
function roster(count){
 const classes=count===4?CLASSES:
  Array.from({length:30},(_,i)=>CLASSES[i%4]).slice(0,28).concat(['warrior','mage']);
 return classes.map((klass,i)=>{
  const id='trial-los-policy-'+count+'-'+i;
  const m5=P.exampleBuild(klass,id,5,0);
  const m10=P.exampleBuild(klass,id,10,0,{experimentalFinal:true});
  assert.deepEqual(m10.talents.slice(0,5),m5.talents);
  assert.equal(m10.talents.length,10);
  assert.equal(Object.values(m10.attributes).reduce((a,b)=>a+b,0),20);
  return {...policy.m10ArenaAdapter({rosterKey:id,klass,completedMissions:APPROVALS,
   build:{attributes:m10.attributes,talents:m10.talents},m5Entered:true,
   m5Frozen:{attributes:m5.attributes,talents:m5.talents},m10Locked:true}),id};
 });
}
function firstTick(entries,opts){
 const game=P.battle(entries,opts);
 const positions=Object.fromEntries(game.fighters.map(f=>[f.id,{x:f.x,z:f.z}]));
 const obstacles=game.obstacles.map(o=>({...o}));
 const hp=game.fighters.map(f=>f.hp);
 game.update(.05);
 const targets=Object.fromEntries(game.fighters.map(f=>[f.id,f.lastTarget]));
 return {positions,obstacles,hp,targets};
}
const report={schema:'pit-v5-m10-los-counterfactual-v1',scope:'synthetic first tick, read-only',
 limitations:['Circle intersections are only geometric proxies, not a projectile LOS implementation.',
 'Candidate targets are NOT fed into the combat engine; no claim about winner or fairness.',
 'Aggro reservations are not recomputed after hypothetical retargeting.',
 'Seeds shared across aggro, geometry and navigation variants are paired, not independent.',
 'G.2 physical PCs and H.1/H.2 real-student integration remain blocked.'],
 groups:[],totals:{ticks:0,actors:0,blockedBaseline:0,retargeted:0,
 blockedCandidate:0,unavoidable:0,exactReplays:0,navPairs:0}};
for(const count of [4,30]){
 const entries=roster(count),ids=entries.map(x=>x.id);
 for(const mode of ['free','spaced'])for(const geometry of ['original','shifted']){
  const group={count,mode,geometry,actors:0,blockedBaseline:0,
   retargeted:0,blockedCandidate:0,unavoidable:0,meanExtraDistance:0};
  let sumExtra=0;
  for(let k=0;k<SEEDS;k++){
   const seed=(Math.imul(k+1,2246822519)^Math.imul(count,3266489917)^0x31f5a11b)>>>0;
   const base=P.battle(entries,{...OPT,seed});
   const positions=Object.fromEntries(base.fighters.map(f=>[f.id,{x:f.x,z:f.z,face:f.face}]));
   const shifted=geometry==='shifted'?Object.fromEntries(ids.map((id,i)=>[id,positions[ids[(i+1)%ids.length]]])):null;
   const options={...OPT,seed,engagementMode:mode,...(shifted?{experimentalSpawnPositions:shifted}:{})};
   const direct=firstTick(entries,{...options,navigationMode:'direct'});
   const steer=firstTick(entries,{...options,navigationMode:'steer'});
   assert.deepEqual(steer.positions,direct.positions);
   assert.deepEqual(steer.obstacles,direct.obstacles);
   assert.deepEqual(steer.hp,direct.hp);
   assert.deepEqual(steer.targets,direct.targets,'navigation must not change first-tick targets');
   report.totals.navPairs++;
   if(k===0){
    assert.deepEqual(firstTick(entries,{...options,navigationMode:'direct'}),direct);
    report.totals.exactReplays++;
   }
   report.totals.ticks+=2;
   for(const id of ids){
    const origin=direct.positions[id],chosen=direct.targets[id];
    const rivals=ids.filter(x=>x!==id);
    assert(rivals.includes(chosen));
    const oldBlocked=blocked(origin,direct.positions[chosen],direct.obstacles);
    const next=candidate(origin,chosen,rivals,direct.positions,direct.obstacles);
    const newBlocked=blocked(origin,direct.positions[next.id],direct.obstacles);
    assert(!newBlocked||oldBlocked,'hypothetical selector must not create obstruction');
    if(next.reason==='nearby-clear'){
     assert(oldBlocked&&!newBlocked);
     assert(next.delta<=Math.min(8,distance(origin,direct.positions[chosen])*.5)+1e-8);
     sumExtra+=next.delta;
    }
    group.actors++;
    group.blockedBaseline+=Number(oldBlocked);
    group.retargeted+=Number(next.reason==='nearby-clear');
    group.blockedCandidate+=Number(newBlocked);
    group.unavoidable+=Number(next.reason==='no-nearby-clear');
   }
  }
  group.meanExtraDistance=group.retargeted?+(sumExtra/group.retargeted).toFixed(4):0;
  for(const key of ['actors','blockedBaseline','retargeted','blockedCandidate','unavoidable'])
   report.totals[key]+=group[key];
  assert.equal(group.blockedBaseline,group.retargeted+group.unavoidable);
  report.groups.push(group);
 }
}
assert.equal(report.totals.ticks,128);
assert.equal(report.totals.navPairs,64);
assert.equal(report.totals.exactReplays,8);
assert.equal(report.totals.actors,1088);
assert(report.totals.blockedBaseline>0,'sample must include blocked baseline target');
assert(report.totals.retargeted>0,'sample must exercise nearby visible alternative');
assert(report.totals.blockedCandidate<=report.totals.blockedBaseline);
const m5=['warrior','guardian'].map((klass,i)=>({
 id:'trial-los-policy-m5-'+i,approvedMissions:5,
 build:P.exampleBuild(klass,'trial-los-policy-m5-'+i,5,0)}));
assert.deepEqual(P.battle(m5,{seed:4175863657}).run(),
 P.battle(m5,{seed:4175863657,arenaMission:5}).run());
report.totals.m5Unchanged=true;
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.groups)).digest('hex').slice(0,20);
if(process.env.M10_LOS_REPORT_FILE){
 const target=path.resolve(process.env.M10_LOS_REPORT_FILE);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 LOS CANDIDATE '+JSON.stringify(report.groups));
console.log('PASS M10 read-only LOS candidate: '+JSON.stringify(report.totals)+' hash '+report.hash);

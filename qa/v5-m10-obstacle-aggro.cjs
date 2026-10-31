'use strict';
/* H.3/M10 — first-tick obstacle/aggro diagnostic, isolated synthetic rosters.
 * No gameplay tuning: obstacle intersections are geometric observations, not
 * proof that projectile line-of-sight or target selection uses these colliders.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const SEEDS=8,APPROVALS=Array.from({length:10},(_,i)=>i+1);
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,rangedCommitment:'recovery',balancePreset:'e-hp2'};
const source=fs.readFileSync(path.resolve(__dirname,'../v5/phase2-combat.js'),'utf8');
const a=source.indexOf('const enemies=alive().filter'),b=source.indexOf('const dx=target.x-f.x',a);
assert(a>=0&&b>a,'target selection block must remain identifiable');
const selector=source.slice(a,b);
assert.match(selector,/const score=distance\+crowdPenalty-continuity-reciprocal/);
assert.doesNotMatch(selector,/obstacles|firstBlockingObstacle|lineOfSight|steeringDirection/,
 'target selection currently has no obstacle/LOS term; revise diagnostic if changed');
function roster(count){
 const classes=count===4?CLASSES:
  Array.from({length:30},(_,i)=>CLASSES[i%4]).slice(0,28).concat(['warrior','mage']);
 return classes.map((klass,i)=>{
  const id='trial-los-'+count+'-'+i;
  const old=P.exampleBuild(klass,id,5,0);
  const fin=P.exampleBuild(klass,id,10,0,{experimentalFinal:true});
  assert.deepEqual(fin.talents.slice(0,5),old.talents);
  assert.equal(fin.talents.length,10);
  assert.equal(Object.values(fin.attributes).reduce((s,v)=>s+v,0),20);
  return {...policy.m10ArenaAdapter({rosterKey:id,klass,completedMissions:APPROVALS,
   build:{attributes:fin.attributes,talents:fin.talents},m5Entered:true,
   m5Frozen:{attributes:old.attributes,talents:old.talents},m10Locked:true}),id};
 });
}
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function intersects(a,b,obstacles,clearance=0){
 const dx=b.x-a.x,dz=b.z-a.z,denom=dx*dx+dz*dz;
 return obstacles.some(o=>{
  const t=denom>1e-8?clamp(((o.x-a.x)*dx+(o.z-a.z)*dz)/denom,0,1):0;
  const x=a.x+t*dx-o.x,z=a.z+t*dz-o.z;
  return x*x+z*z<(o.r+clearance)**2;
 });
}
function firstTick(roster,opts){
 const game=P.battle(roster,opts);
 const initial=Object.fromEntries(game.fighters.map(f=>[f.id,{x:f.x,z:f.z,face:f.face,klass:f.build.klass}]));
 const obstacles=game.obstacles.map(o=>({...o}));
 assert.equal(obstacles.length,5);
 const baselineHP=game.fighters.map(f=>f.hp);
 const tick=game.update(.05);
 const targets=Object.fromEntries(game.fighters.map(f=>[f.id,f.lastTarget]));
 assert(Object.values(targets).every(t=>typeof t==='string'));
 const ids=game.fighters.map(f=>f.id);
 const first=ids[0],nearest=ids.filter(id=>id!==first)
  .sort((x,y)=>distance(initial[first],initial[x])-distance(initial[first],initial[y]))[0];
 assert.equal(targets[first],nearest,'first actor has no aggro reservations or previous targets');
 return {initial,obstacles,targets,ids,first,initialHP:baselineHP,
  events:tick.events.map(e=>({type:e.type,hero:e.hero,target:e.target||null}))};
}
const report={schema:'pit-v5-m10-first-tick-obstacle-aggro-v1',
 scope:'isolated synthetic M10; first 0.05s only',
 independentSeedsPerRoster:SEEDS,rosterSizes:[4,30],
 limitations:[
  'Circle intersections are geometric occlusion proxies, not actual projectile visibility checks.',
  'The current target selector scores distance, aggro load and reciprocal/continuity; obstacles are used for steering, not direct target selection.',
  'Navigation may indirectly change subsequent target choices after fighters move; first actor comparison isolates selection before movement.',
  'Repeated geometry, navigation and aggro variants share seeds; they are paired, not independent trials.',
  'No inference about win rates or balance, no physical G.2 or student integration.'
 ],groups:[],totals:{ticks:0,pairedNavigationChecks:0,exactReplays:0}};
for(const count of [4,30]){
 const entries=roster(count),ids=entries.map(x=>x.id);
 for(const engagementMode of ['free','spaced']){
  for(const geometry of ['original','shifted']){
   const group={count,engagementMode,geometry,ticks:0,actors:0,
    nearestOccluded:0,selectedOccluded:0,selectedCorridorBlocked:0,
    selectedNotNearest:0,selectedNotNearestVisible:0,
    occludedWithVisibleAlternative:0,noVisibleAlternative:0,
    firstActorNavMismatch:0,anyTargetNavMismatch:0,firstActorChecks:0};
   for(let k=0;k<SEEDS;k++){
    const seed=(Math.imul(k+1,2246822519)^Math.imul(count,3266489917)^0x31f5a11b)>>>0;
    const base=P.battle(entries,{...OPTIONS,seed});
    const positions=Object.fromEntries(base.fighters.map(f=>[f.id,{x:f.x,z:f.z,face:f.face}]));
    const spawn=geometry==='shifted'?
     Object.fromEntries(ids.map((id,i)=>[id,positions[ids[(i+1)%ids.length]]])):null;
    const common={...OPTIONS,seed,engagementMode,
     ...(spawn?{experimentalSpawnPositions:spawn}:{})};
    const direct=firstTick(entries,{...common,navigationMode:'direct'});
    const steer=firstTick(entries,{...common,navigationMode:'steer'});
    assert.deepEqual(steer.initial,direct.initial);
    assert.deepEqual(steer.obstacles,direct.obstacles);
    assert.deepEqual(steer.initialHP,direct.initialHP);
    assert.equal(steer.targets[ids[0]],direct.targets[ids[0]],
     'navigation cannot change first actor target before movement');
    group.firstActorChecks++;report.totals.pairedNavigationChecks++;
    group.anyTargetNavMismatch+=Number(ids.some(id=>steer.targets[id]!==direct.targets[id]));
    if(k===0){
     assert.deepEqual(firstTick(entries,{...common,navigationMode:'direct'}),direct);
     report.totals.exactReplays++;
    }
    for(const id of ids){
     const origin=direct.initial[id],rivals=ids.filter(other=>other!==id);
     const ordered=rivals.slice().sort((x,y)=>distance(origin,direct.initial[x])-distance(origin,direct.initial[y]));
     const nearest=ordered[0],visible=ordered.filter(x=>!intersects(origin,direct.initial[x],direct.obstacles));
     const chosen=direct.targets[id];
     assert(rivals.includes(chosen));
     const blocked=intersects(origin,direct.initial[chosen],direct.obstacles);
     group.nearestOccluded+=Number(intersects(origin,direct.initial[nearest],direct.obstacles));
     group.selectedOccluded+=Number(blocked);
     group.selectedCorridorBlocked+=Number(intersects(origin,direct.initial[chosen],direct.obstacles,.74));
     group.selectedNotNearest+=Number(chosen!==nearest);
     group.selectedNotNearestVisible+=Number(visible.length>0&&chosen!==visible[0]);
     group.occludedWithVisibleAlternative+=Number(blocked&&visible.length>0);
     group.noVisibleAlternative+=Number(visible.length===0);
     group.actors++;
    }
    group.ticks+=2;report.totals.ticks+=2;
   }
   report.groups.push(group);
  }
 }
}
assert.equal(report.totals.ticks,128);
assert.equal(report.totals.pairedNavigationChecks,64);
assert.equal(report.totals.exactReplays,8);
assert.equal(report.groups.reduce((s,g)=>s+g.actors,0),1088);
const m5=['warrior','guardian'].map((klass,i)=>({id:'trial-los-m5-'+i,
 approvedMissions:5,build:P.exampleBuild(klass,'trial-los-m5-'+i,5,0)}));
assert.deepEqual(P.battle(m5,{seed:4175863657}).run(),
 P.battle(m5,{seed:4175863657,arenaMission:5}).run());
assert.throws(()=>P.battle(m5,{experimentalSpawnPositions:{}}),/M10/);
report.totals.m5Unchanged=true;
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.groups)).digest('hex').slice(0,20);
if(process.env.M10_OBSTACLE_REPORT_FILE){
 const target=path.resolve(process.env.M10_OBSTACLE_REPORT_FILE);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 OBSTACLE AGGRO '+JSON.stringify(report.groups.map(g=>({
 count:g.count,aggro:g.engagementMode,geometry:g.geometry,
 selectedOccluded:g.selectedOccluded,selectedNotNearest:g.selectedNotNearest,
 blockedWithAlternative:g.occludedWithVisibleAlternative,
 navChangedAny:g.anyTargetNavMismatch}))));
console.log('PASS M10 first-tick obstacle/aggro: '+report.totals.ticks+
 ' first ticks, '+report.totals.pairedNavigationChecks+
 ' paired navigation checks, '+report.totals.exactReplays+
 ' replays; M5 unchanged; hash '+report.hash);

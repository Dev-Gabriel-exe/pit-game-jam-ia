'use strict';
// Phase E: genuine M5 AI pillar-navigation regression, never player progression.
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const CLASSES=['warrior','mage','hunter','guardian'];
function make(className,mode,seed){
 const pair=[className,'guardian'].map((klass,i)=>{
  const b=P.exampleBuild(klass,'actor-'+i,5,0);
  b.talents=[]; // motion-only; no class-specific mobility or spell side effects
  return {id:i?'target':'pursuer',name:i?'target':'pursuer',build:b,approvedMissions:5};
 });
 const sim=P.battle(pair,{seed,arenaScale:1,limit:21,stormDelay:50,
  stormRateFactor:.4,engagementMode:'free',navigationMode:mode});
 const [p,t]=sim.fighters;
 Object.assign(p,{x:-11,z:0,vx:0,vz:0,basic:999,gcd:999,offenseDelay:999});
 Object.assign(t,{x:11,z:0,vx:0,vz:0,basic:999,gcd:999,offenseDelay:999});
 t.stats.speed=0;
 let penetration=0,closest=Infinity;
 for(let step=0;step<410&&!sim.finished;step++){
  sim.update(.05);
  closest=Math.min(closest,Math.hypot(p.x-t.x,p.z-t.z));
  for(const actor of sim.fighters)for(const obstacle of sim.obstacles){
   penetration=Math.max(penetration,obstacle.r+.56-Math.hypot(actor.x-obstacle.x,actor.z-obstacle.z));
  }
 }
 return {p,t,penetration,closest,result:sim.result()};
}
for(const [i,klass] of CLASSES.entries()){
 const seed=74110+i*37;
 const direct=make(klass,'direct',seed),legacy=make(klass,undefined,seed);
 assert.deepEqual(direct.result,legacy.result,'Explicit direct option must reproduce old default');
 const route=make(klass,'steer',seed),again=make(klass,'steer',seed);
 assert.deepEqual(route.result,again.result,'Steering must replay deterministically');
 assert(route.p.navTurns>0,klass+': no blocked corridor detected');
 assert(route.p.x>0,klass+': could not bypass central column x='+route.p.x);
 assert(route.closest<12.6,klass+': no sufficient pursuit improvement '+route.closest);
 assert(route.penetration<.09,klass+': collider penetration='+route.penetration);
 console.log('E NAV '+klass+' '+JSON.stringify({
  directClosest:+direct.closest.toFixed(2),
  steeredClosest:+route.closest.toFixed(2),
  x:+route.p.x.toFixed(2),navTurns:route.p.navTurns,
  maxPenetration:+route.penetration.toFixed(4)
 }));
}
console.log('PASS phase E M5 opt-in collision-aware pursuit; default unchanged, four classes seeded, no physics clipping.');

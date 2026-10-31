'use strict';
// Pathfinding regression for V5 A.2; actual battle core, no mocked victories.
const assert=require('node:assert/strict');
const CORE=require('../v5/hero-core.js');
for(const [i,klass] of ['warrior','mage','hunter','guardian'].entries()){
 const heroes=[klass,'guardian'].map((c,j)=>{const id=j?'stationary':'pursuer';return {...CORE.canonical(CORE.seedBuild(id,c),id,500),id,name:id}});
 const sim=CORE.battle(heroes,{seed:7101+i*31,arenaScale:1,limit:17});
 const [f,target]=sim.fighters;
 Object.assign(f,{x:-11,z:0,vx:0,vz:0,basic:999,special:999,rushCooldown:999});
 Object.assign(target,{x:11,z:0,vx:0,vz:0,basic:999,special:999,rushCooldown:999});
 target.stats.speed=0;
 let penetration=0;
 for(let tick=0;tick<250&&!sim.finished;tick++){
  sim.update(.05);
  for(const unit of sim.fighters)for(const obstacle of sim.obstacles){
   penetration=Math.max(penetration,obstacle.r+.56-Math.hypot(unit.x-obstacle.x,unit.z-obstacle.z));
  }
 }
 const remaining=Math.hypot(f.x-target.x,f.z-target.z);
 assert(f.navTurns>0,klass+' never detected a blocked corridor');
 assert(f.x>0,klass+' did not get past the central pillar: x='+f.x);
 assert(remaining<13.2,klass+' stayed too far from target: '+remaining);
 assert(penetration<.08,klass+' crossed a stone obstacle: '+penetration);
 console.log('NAVIGATION '+klass+' '+JSON.stringify({remaining:+remaining.toFixed(2),x:+f.x.toFixed(2),navTurns:f.navTurns,penetration}));
}
console.log('PASS obstacle bypass, blocked pursuit and collider clearance for four classes.');

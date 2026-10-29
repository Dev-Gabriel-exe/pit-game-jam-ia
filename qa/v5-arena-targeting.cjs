'use strict';
// A.3 — target acquisition, focus stability and defensive positioning.
const assert=require('node:assert/strict');
const CORE=require('../v5/hero-core.js');
const roster=(classes)=>classes.map((klass,i)=>{const id=['player','near','visible','attacker'][i];return {...CORE.canonical(CORE.seedBuild(id,klass),id,500),id,name:id}});
function setup(classes){
 const sim=CORE.battle(roster(classes),{seed:6281,limit:10});
 for(const f of sim.fighters){
  f.basic=999;f.special=999;f.rushCooldown=999;f.stats.speed=0;
 }
 return sim;
}
// A nearer covered target must not win over an almost equally near visible one.
{
 const sim=setup(['hunter','warrior','mage']);
 const [f,covered,visible]=sim.fighters;
 Object.assign(f,{x:-6,z:0});
 Object.assign(covered,{x:4,z:0});
 Object.assign(visible,{x:0,z:9});
 sim.update(.05);
 assert.equal(f.targetId,'visible','Hunter should prefer a clear shooting lane over a closer covered foe');
 assert(sim.events.some(e=>e.type==='target'&&e.hero==='player'&&e.target==='visible'));
}
// A valid focus does not flip every frame when opponents exchange order.
{
 const sim=setup(['warrior','guardian','hunter']);
 const [f,a,b]=sim.fighters;
 Object.assign(f,{x:0,z:11});
 Object.assign(a,{x:4,z:11});
 Object.assign(b,{x:4.5,z:11});
 sim.update(.05);
 assert.equal(f.targetId,'near');
 b.x=3.8;
 sim.update(.05);
 assert.equal(f.targetId,'near','Focus must be maintained through a brief distance crossover');
 assert.equal(sim.events.filter(e=>e.type==='target'&&e.hero==='player').length,1);
 a.alive=false;
 sim.update(.05);
 assert.equal(f.targetId,'visible','Dead target must be released immediately');
}
// A recent aggressor can become the next target if they are close enough.
{
 const sim=setup(['guardian','warrior','hunter','mage']);
 const [f,near,,attacker]=sim.fighters;
 Object.assign(f,{x:0,z:11});
 Object.assign(near,{x:3,z:11});
 Object.assign(attacker,{x:3.6,z:11});
 sim.fighters[2].alive=false;
 f.lastAttacker='attacker';f.underFire=1.4;
 sim.update(.05);
 assert.equal(f.targetId,'attacker','Guardian should respond to its nearby aggressor');
}
// When threatened and under 42% HP, ranged heroes back away to create space
// rather than receiving any artificial increase to armor or damage.
{
 const sim=setup(['hunter','warrior']);
 const [f,t]=sim.fighters;
 Object.assign(f,{x:0,z:11,hp:f.stats.hp*.30,underFire:1.4,lastAttacker:'near'});
 Object.assign(t,{x:6,z:11});
 f.stats.speed=4.2;
 sim.update(.05);
 assert(f.vx<-.01,'Injured Hunter should actively retreat after being attacked');
}
console.log('PASS V5 A.3 focus persistence, LOS target, responsive threat and defensive repositioning.');

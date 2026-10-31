'use strict';
// Exact incident from S24 screenshot. Engine must progress after minute 00:59.
// This proves a finite deterministic combat result; WebGL lifecycle is tested separately.
const assert=require('node:assert/strict');
const E=require('../v5/phase2-combat.js');
const classes=['warrior','mage','hunter','guardian'];
function actors(){
 return Array.from({length:30},(_,i)=>{
  const klass=classes[i%4];
  const label=klass+' '+String(i+1).padStart(2,'0');
  return {id:'phase2-'+i+'-'+klass,name:label,
   build:E.exampleBuild(klass,label,5,Math.floor(i/4)%11),approvedMissions:5};
 });
}
function replay(){
 const battle=E.battle(actors(),{
  seed:4175863657,limit:145,arenaScale:5,damageScale:.5,mageDamageBonus:1.1,
  stormDelay:40,stormRateFactor:.55,engagementMode:'spaced',
  navigationMode:'steer',rangedCommitment:'recovery',balancePreset:'e-hp2'
 });
 while(battle.time<59&&!battle.finished)battle.update(.05);
 const liveAt59=battle.fighters.filter(x=>x.alive);
 assert.equal(liveAt59.length,2,'Incident screenshot has 2 combatants at 00:59');
 assert(liveAt59.every(x=>x.build.klass==='guardian'));
 while(!battle.finished&&battle.time<145)battle.update(.05);
 assert(battle.finished,'Simulation must not hang at two remaining heroes');
 const result=battle.result();
 assert.equal(result.winner.klass,'guardian');
 assert(result.time<70,'Reported duel ends shortly after minute 1 in combat engine');
 assert.equal(result.events.filter(x=>x.type==='knockout'||x.type==='storm').length,29);
 assert(result.events.some(x=>x.type==='end'&&x.reason==='last-hero'));
 return {time:result.time,winner:result.winner,events:result.events.length};
}
const first=replay(),second=replay();
assert.deepEqual(second,first,'Reported seed must be deterministic');
console.log('PASS E.7 screenshot seed: 2 guardians at 00:59; winner at '+first.time+
 's; render/DOM path, not the combat engine, needs the endgame fix.');

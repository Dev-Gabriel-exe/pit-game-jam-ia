'use strict';
// V5 E: candidate fairness is tested with combat results, not forced outcomes.
// No XP / student progression / external state.
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const CLASSES=['warrior','mage','hunter','guardian'];
const OPTIONS=Object.freeze({
 arenaScale:5,limit:145,damageScale:.5,mageDamageBonus:1.1,
 stormDelay:40,stormRateFactor:.55,engagementMode:'spaced',
 navigationMode:'steer',rangedCommitment:'recovery'
});
function roster(n,i){
 return Array.from({length:n},(_,j)=>{
  const klass=CLASSES[(j+i)%4];
  return {id:'h'+j,approvedMissions:5,build:P.exampleBuild(klass,klass+' '+j,5,(i+j*3+7)%11)};
 });
}
function game(entries,seed,preset){
 return P.battle(entries,{...OPTIONS,seed,balancePreset:preset});
}
{
 const models=roster(4,0);
 const baseline=game(models,8123003,'baseline');
 const absent=P.battle(models,{...OPTIONS,seed:8123003});
 assert.deepEqual(baseline.result(),absent.result(),'Legacy default must be unchanged');
 const tuned=game(models,8123003,'e-hp2');
 for(const k of CLASSES){
  const a=baseline.fighters.find(x=>x.build.klass===k),b=tuned.fighters.find(x=>x.build.klass===k);
  assert(a&&b);
  assert.equal(b.stats.hp-a.stats.hp,k==='warrior'?17:k==='guardian'?10:0,k+' HP delta');
  assert(Math.abs((b.stats.range-a.stats.range)-(k==='hunter'?-1.2:0))<1e-9,k+' range delta');
  assert.equal(b.stats.attack,a.stats.attack,k+' damage unchanged');
  assert.equal(b.stats.defense,a.stats.defense,k+' DEF unchanged');
  assert.equal(b.stats.speed,a.stats.speed,k+' speed unchanged (chase factor is contextual)');
  assert.deepEqual(b.build,a.build,k+' talents, attributes and model identity untouched');
 }
}
function verify(n,N){
 const wins=Object.fromEntries(CLASSES.map(k=>[k,0]));
 let seconds=0,abilities=0,timeouts=0;
 for(let i=0;i<N;i++){
  const seed=8123003+i*2089,models=roster(n,i);
  const battle=game(models,seed,'e-hp2');
  const result=battle.run(3000),name=result.winner?.klass;
  assert(CLASSES.includes(name),'Unknown winner');
  assert(result.finished,'No result');
  wins[name]++;
  seconds+=result.time;abilities+=result.events.filter(e=>e.type==='talent').length;
  timeouts+=result.events.some(e=>e.type==='end'&&e.reason==='time-limit')?1:0;
  assert(result.standings.length===n,'Fighters lost or duplicated');
  for(const hero of battle.fighters){
   assert(Number.isFinite(hero.hp)&&Number.isFinite(hero.x)&&Number.isFinite(hero.z));
   assert(hero.hp>=0&&hero.hp<=hero.stats.hp+1e-6,'Life cannot exceed maximum');
  }
  if(i===0){
   const replay=game(models,seed,'e-hp2').run(3000);
   assert.deepEqual(result,replay,'Seed must replay exactly, including winner, damage and casts');
  }
 }
 // Broad guardrail, not statistical proof of equal win probability.
 for(const k of CLASSES){
  assert(wins[k]>=Math.floor(N*.10),k+': class disappeared from '+n+'-hero tournament');
  assert(wins[k]<=Math.ceil(N*.40),k+': potential domination in '+n+'-hero tournament');
 }
 assert(timeouts<=Math.ceil(N*.10),'Too many matches ended by clock');
 assert(abilities/N>=(n===30?80:5),'Abilities must actually be used');
 console.log('E HP FAIRNESS '+JSON.stringify({players:n,games:N,wins,
  meanSeconds:+(seconds/N).toFixed(2),meanTalents:+(abilities/N).toFixed(1),timeouts}));
}
verify(4,120);
verify(30,120);
console.log('PASS V5 HP2: independent class health, no boosted damage, baseline preserved, 4/30 replay + seeded fairness sanity.');

'use strict';
// V5 Arena physics/replay gate. Tests the actual deterministic combat core,
// not CSS or cosmetic probabilities. All characters are fictional bots.
const assert=require('node:assert/strict');
const CORE=require('../v5/hero-core.js');
const classes=['warrior','mage','hunter','guardian'];
const presets={
 warrior:{power:6,agility:2,spirit:0,vitality:2},
 mage:{power:0,agility:2,spirit:7,vitality:1},
 hunter:{power:2,agility:7,spirit:0,vitality:1},
 guardian:{power:1,agility:0,spirit:1,vitality:8}
};
function roster(mission,count=30){
 const factor=mission===10?2:1,xp=mission*100;
 return Array.from({length:count},(_,i)=>{
  const klass=classes[i%4],name=klass+' '+i,b=CORE.seedBuild(name,klass),p={...presets[klass]};
  if(count>4){
   const idx=Math.floor(i/4);
   if(idx%3===1){
    if(p.vitality>=2){p.vitality-=2;p.agility+=2}
    else if(p.spirit>=2){p.spirit-=2;p.vitality+=2}
    else{p.power=Math.max(0,p.power-2);p.vitality+=2}
   }else if(idx%3===2){
    if(p.power>=2){p.power-=2;p.vitality+=2}
    else if(p.agility>=2){p.agility-=2;p.spirit+=2}
    else{p.vitality=Math.max(0,p.vitality-2);p.power+=2}
   }
  }
  for(const [k,v]of Object.entries(p))b.attributes[k]=v*factor;
  return {...CORE.canonical(b,name,xp),id:'qa-'+i,name};
 });
}
const input=roster(5,30);
const deterministicSeed=2442;
const sim1=CORE.battle(input,{seed:deterministicSeed,arenaScale:4.4,limit:95}).run(2500);
const sim2=CORE.battle(input,{seed:deterministicSeed,arenaScale:4.4,limit:95}).run(2500);
assert.equal(sim1.finished,true,'Simulation must finish');
assert.deepEqual(sim1.standings,sim2.standings,'Same seed must yield exact deterministic standings');
assert.deepEqual(sim1.events,sim2.events,'Same seed must yield identical combat events');
assert(sim1.events.some(e=>e.type==='hit'),'Combat needs actual hits');
assert(sim1.events.some(e=>e.type==='knockout'||e.type==='storm'),'Combat needs elimination');
assert(sim1.events.some(e=>e.type==='special'),'Combat needs class-special events');
for(const event of sim1.events)assert(Number.isFinite(event.time),'Event time must be finite');
for(const f of CORE.battle(input,{seed:2321,arenaScale:4.4,limit:95}).fighters){
 assert(Number.isFinite(f.x)&&Number.isFinite(f.z)&&Number.isFinite(f.vx),'Initial physics state must be valid');
}
const allWinners=new Set(),classesWinning=new Set(),hist=new Map(),byClass=new Map();
for(const mission of [5,10]){
 for(let seed=1;seed<=36;seed++){
  const sim=CORE.battle(roster(mission,30),{seed:seed*314159+mission*100,arenaScale:4.4,limit:95});
  const res=sim.run(2500);
  assert(res.finished&&res.winner,'Fight M'+mission+' seed '+seed+' must end');
  assert.equal(res.standings.length,30);
  allWinners.add(res.winner.id);
  classesWinning.add(res.winner.klass);
  hist.set(res.winner.id,(hist.get(res.winner.id)||0)+1);
  byClass.set(res.winner.klass,(byClass.get(res.winner.klass)||0)+1);
  assert(res.events.some(e=>e.type==='hit'), 'No hits in M'+mission+' seed '+seed);
  // 3D spectators are driven only by real engine events.
  assert(res.events.some(e=>e.type==='knockout'||e.type==='storm'),'No eliminations in M'+mission);
 }
}
const summary=Object.fromEntries([...byClass].sort((a,b)=>a[0].localeCompare(b[0])));
console.log('V5 FAIRNESS AUDIT 72 fights, 30 unique fictitious heroes: '+JSON.stringify(summary));
console.log('Unique winner IDs: '+allWinners.size+'; winning classes: '+classesWinning.size);
assert(allWinners.size>=5,'Same bot dominates seeds; winner diversity too low');
assert(classesWinning.size>=2,'Exactly one class wins every seed');
const maxWins=Math.max(...hist.values());
assert(maxWins<48,'Single bot won two thirds of matches: unbalanced default roster');
console.log('PASS seeded replay, 30-player hit/elimination events, variable winners, multiple winning classes.');
console.log('NOTE: Passing this anti-repetition gate is NOT certification that the planned 120 talents are balanced.');

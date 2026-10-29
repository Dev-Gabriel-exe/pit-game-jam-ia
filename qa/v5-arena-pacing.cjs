'use strict';
// D/E-boundary laboratory test. Every pacing preset is opt-in; existing
// callers MUST retain 100% damage when the new battle options are omitted.
const assert=require('node:assert/strict');
const CORE=require('../v5/hero-core.js');
const PHASE2=require('../v5/phase2-combat.js');
function getFirstHit(engine,entries,options){
 const sim=engine.battle(entries,{seed:864201,arenaScale:2.2,limit:80,...options});
 for(let i=0;i<1800&&!sim.finished;i++){
  const step=sim.update(.05);
  const first=step.events.find(e=>e.type==='hit'&&e.amount>0);
  if(first)return {first,sim};
 }
 throw Error('No measurable combat damage within 80 seconds of the deterministic duel');
}
const rosters=[
 {name:'Phase2 M5',engine:PHASE2,
  list:['mage','hunter'].map((klass,i)=>({id:'duel-'+i,name:klass,build:PHASE2.exampleBuild(klass,klass,5,0),approvedMissions:5}))},
 {name:'Legacy M10',engine:CORE,
  list:['mage','hunter'].map((klass,i)=>({id:'duel-'+i,name:klass,build:CORE.seedBuild(klass,klass)}))}
];
for(const {name,engine,list} of rosters){
 const original=getFirstHit(engine,list,{damageScale:1,mageDamageBonus:1});
 const unmodified=getFirstHit(engine,list,{});
 assert.equal(unmodified.first.hero,original.first.hero,name+' should preserve old hero order by default');
 assert.equal(unmodified.first.amount,original.first.amount,name+' default should preserve old damage');
 const long=getFirstHit(engine,list,{damageScale:.75,mageDamageBonus:1.10});
 assert.equal(long.first.hero,original.first.hero,name+' paced first hit must have the same attacker');
 assert.equal(long.first.target,original.first.target,name+' paced first hit must have the same victim');
 const hero=list.find(e=>e.id===original.first.hero);
 const expected=.75*(hero.build.klass==='mage'?1.10:1);
 const ratio=long.first.amount/original.first.amount;
 assert(Math.abs(ratio-expected)<.055,name+' first hit must obey 75% pacing + only mage 10% compensation: '+ratio+' vs '+expected);
 const epic=getFirstHit(engine,list,{damageScale:.60,mageDamageBonus:1.10});
 assert.equal(epic.first.hero,original.first.hero);
 const epicRatio=epic.first.amount/original.first.amount;
 assert(Math.abs(epicRatio-.60*(hero.build.klass==='mage'?1.10:1))<.055,name+' 60% pace is not applied: '+epicRatio);
 console.log('PASS pacing '+name+': '+original.first.hero+' 100% '+original.first.amount+
  ' -> long '+long.first.amount+' ('+(ratio*100).toFixed(1)+'%), epic '+epic.first.amount+
  ' ('+(epicRatio*100).toFixed(1)+'%)');
}
// Both engines retain deterministic attack and winner outcomes when replayed
// with identical reduced-damage presets and unchanged seeds.
for(const {name,engine,list} of rosters){
 const opt={seed:71107,arenaScale:2.2,limit:50,damageScale:.75,mageDamageBonus:1.10};
 const a=engine.battle(list,opt),b=engine.battle(list,opt);
 for(let t=0;t<1000;t++){
  const x=a.update(.05),y=b.update(.05);
  assert.equal(x.finished,y.finished,name+' finished drift');
  assert.deepEqual(a.fighters.map(f=>[f.hp,f.alive,f.kills]),b.fighters.map(f=>[f.hp,f.alive,f.kills]),name+' deterministic replay drift');
  if(x.finished)break;
 }
}
console.log('PASS pacing: legacy + Phase2 keep default damage unchanged and deterministic 75% / 60% reductions');

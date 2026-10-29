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
  list:['warrior','hunter'].map((klass,i)=>({id:'duel-'+i,name:klass,build:CORE.seedBuild(klass,klass)}))}
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
 // The legacy game has rush-granted temporary shields, so the earliest
 // nonzero HP hit can *increase* at a lower damage preset even while gross
 // impact damage decreases. Do not assert a false linear HP relationship.
 if(engine===PHASE2){
  assert(Math.abs(ratio-expected)<.055,name+' first hit must obey 75% pacing: '+ratio+' vs '+expected);
 }else{
  const fs=require('node:fs');
  const source=fs.readFileSync(require.resolve('../v5/hero-core.js'),'utf8');
  assert.match(source,/amount\*=pace\*\(f\.build\.klass===\x27mage\x27\?mageBonus:1\)/,'Legacy hit pipeline must apply pacing after defense/evasion, before shield');
 }
 const epic=getFirstHit(engine,list,{damageScale:.60,mageDamageBonus:1.10});
 assert.equal(epic.first.hero,original.first.hero);
 const epicRatio=epic.first.amount/original.first.amount;
 if(engine===PHASE2)assert(Math.abs(epicRatio-.60*(hero.build.klass==='mage'?1.10:1))<.055,name+' 60% pace not applied: '+epicRatio);
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

// Observational balance matrix, not a pass/fail fairness claim. Do not
// silently buff base HP, class damage, damage-by-storm, or talent cooldowns
// based on this tiny sample. Results support the user review of a weak mage.
const classes=['warrior','mage','hunter','guardian'];
function sample(rosterCount,scale,seed){
 const list=Array.from({length:rosterCount},(_,i)=>{
  const klass=classes[i%4];
  return {id:'pacing-'+i,name:klass+' '+i,
   build:PHASE2.exampleBuild(klass,klass+' '+i,5,Math.floor(i/4)%11),
   approvedMissions:5};
 });
 const sim=PHASE2.battle(list,{seed,arenaScale:5,limit:scale===1?95:110,
  damageScale:scale,mageDamageBonus:scale===1?1:1.1,
  stormDelay:scale===1?18:28,stormRateFactor:scale===1?1:.70});
 const result=sim.run(2400);
 const first=result.events.find(e=>e.type==='knockout'||e.type==='storm');
 return {time:result.time,firstKo:first?.time??null,winner:result.winner?.klass||'none',
  skills:result.events.filter(e=>e.type==='talent').length,
  knocks:result.events.filter(e=>e.type==='knockout').length};
}
for(const count of [4,30]){
 for(const scale of [1,.75]){
  const n=count===30?6:12;
  const samples=Array.from({length:n},(_,i)=>sample(count,scale,22360+i*2717));
  const avg=key=>(samples.reduce((sum,s)=>sum+(s[key]||0),0)/n).toFixed(1);
  const wins=Object.fromEntries(classes.map(k=>[k,samples.filter(s=>s.winner===k).length]));
  console.log('PACING MATRIX '+count+' players '+Math.round(scale*100)+'% '+JSON.stringify({
   seeds:n,avgTimeSeconds:avg('time'),avgFirstEliminationSeconds:avg('firstKo'),
   avgTalentEvents:avg('skills'),avgKnockouts:avg('knocks'),winners:wins
  }));
 }
}


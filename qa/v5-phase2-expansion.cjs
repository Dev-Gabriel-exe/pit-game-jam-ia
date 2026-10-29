'use strict';
// B.2 additional approved talents, plus zero-surprise M5 budget and runtime probes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const P=require('../v5/phase2-combat.js');
const classes=['warrior','mage','hunter','guardian'];
const expected={};
for(const klass of classes){
 const approved=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../v5/talents-'+klass+'-plan.json'),'utf8')).talents;
 assert.equal(P.TALENTS[klass].length,10,'Expected first ten approved talents per class');
 expected[klass]=approved.slice(5,10).map(t=>t.id);
 assert.deepEqual(P.TALENTS[klass].slice(5).map(t=>t.id),expected[klass]);
 const fresh=P.exampleBuild(klass,'B2-'+klass,5,1);
 assert.deepEqual(fresh.talents,expected[klass],'B2 variant must equip new skills, not 10 skills');
 assert.equal(Object.values(fresh.attributes).reduce((a,v)=>a+v,0),10);
 assert.deepEqual(P.exampleBuild(klass,'B2-'+klass,5,0).talents,P.TALENTS[klass].slice(0,5).map(t=>t.id));
 const mixed=P.exampleBuild(klass,'Mix-'+klass,5,2);
 assert.equal(mixed.talents.length,5);
 assert(mixed.talents.some(id=>expected[klass].includes(id)));
 assert.throws(()=>P.canonical({...fresh,talents:[...fresh.talents,'BAD']},5),/Excesso/);
}
const pick=(klass,id,ids,attr)=>({
 id,build:P.canonical({klass,name:id,talents:ids,attributes:attr||P.exampleBuild(klass,id).attributes},5),approvedMissions:5
});
const make=(klass,ids,enemyClass='guardian',enemyIds=[],distance=2,seed=982)=>{
 const sim=P.battle([pick(klass,'player',ids),pick(enemyClass,'enemy',enemyIds)],{seed,arenaScale:1,limit:55});
 const [f,e]=sim.fighters;
 Object.assign(f,{x:10,z:11,vx:0,vz:0,basic:999});
 Object.assign(e,{x:10+distance,z:11,vx:0,vz:0,basic:999});
 f.stats.speed=0;e.stats.speed=0;
 return {sim,f,e};
};
const advance=(s,steps=200)=>{for(let i=0;i<steps&&!s.finished;i++)s.update(.05)};
const events=(s,id,type='proc')=>s.events.filter(e=>e.type===type&&e.talent===id);
const cast=(s,id)=>s.events.some(e=>e.type==='talent'&&e.talent===id&&e.hero==='player');
for(const [klass,ids,foe,dist] of [
 ['warrior',['B07','B09'],'guardian',2],
 ['mage',['E06','E10'],'guardian',6],
 ['hunter',['P06','P10'],'guardian',6],
 ['guardian',['G06','G09','G10'],'warrior',4]
]){
 const {sim,e,f}=make(klass,ids,foe,[],dist);
 e.stats.hp=2000;e.hp=2000;e.stats.defense=2;
 f.hp=f.stats.hp*.65;
 advance(sim,700);
 for(const id of ids)assert(cast(sim,id),klass+' never cast '+id);
 console.log('B2 ACTIVES '+klass+': '+ids.join(', '));
}
// B06 heal is based on effective inflicted damage, never exceeds 4% HP/5s.
{
 const {sim,f,e}=make('warrior',['B06'],'guardian',[],2);
 f.hp=f.stats.hp*.6;e.stats.hp=300;e.hp=300;e.stats.defense=0;f.basic=0;
 advance(sim,75);
 assert(events(sim,'B06').length>0,'B06 needs actual self-healing event');
 assert(f.hp<=f.stats.hp,'B06 overheal');
}
// B08 and B10 are once-per-duel survival reactions.
{
 const {sim,f,e}=make('warrior',['B08','B10'],'guardian',[],2);
 f.hp=f.stats.hp*.3;e.basic=0;e.stats.attack=7;
 advance(sim,100);
 assert.equal(events(sim,'B08').length,1,'B08 must trigger once below 45%');
 assert.equal(events(sim,'B10').length,1,'B10 must trigger once below 25%');
}
// E07 charges after two offensive acts; E09 triggers only once under 40%.
{
 const {sim,f,e}=make('mage',['E01','E06','E07','E09'],'guardian',[],6);
 e.stats.hp=3000;e.hp=3000;e.stats.defense=1;
 f.hp=f.stats.hp*.32;e.basic=0;e.stats.attack=2;
 advance(sim,650);
 assert(events(sim,'E07','charge').length>0,'E07 did not charge after two offense casts');
 assert(events(sim,'E09','charge').length===1,'E09 should charge once under 40% after hit');
 assert(events(sim,'E07').length>0,'E07 did not boost a later spell');
}
// E08 cancels half of an incoming slow and retreats around free ground.
{
 const {sim,f,e}=make('mage',['E08'],'warrior',['B03'],2);
 e.basic=999;advance(sim,130);
 assert(events(sim,'E08').length>0,'E08 should respond to incoming slow');
}
// P07 speeds up next basic after three successful arrow hits.
{
 const {sim,f,e}=make('hunter',['P07'],'guardian',[],6);
 f.basic=0;e.hp=1000;e.stats.hp=1000;e.stats.defense=0;
 advance(sim,340);
 assert(events(sim,'P07','charge').length>0,'P07 should charge on 3 arrow contacts');
 assert(events(sim,'P07').length>0,'P07 should modify an actual basic attack');
}
// P08 reacts to incoming distant arrow; P09 to long telegraphed spell.
{
 const {sim,f,e}=make('hunter',['P08'],'mage',['E01'],7);
 e.basic=0;advance(sim,200);
 assert(events(sim,'P08').length>0,'P08 should react to an incoming long-range spell');
}
{
 const {sim,f,e}=make('hunter',['P09'],'mage',['E10'],7);
 advance(sim,100);
 assert(events(sim,'P09').length>0,'P09 should interrupt an enemy 0.7s telegraph');
 assert(sim.events.some(e=>e.type==='interrupt'&&e.talent==='P09'),'P09 projectile should delay a pending attack');
}
// Guardian G07 deflects real melee; G08 procs after three completed basic strikes.
{
 const {sim,f,e}=make('guardian',['G07','G08'],'warrior',[],2);
 f.basic=0;e.basic=0;e.hp=2000;e.stats.hp=2000;e.stats.defense=3;
 advance(sim,170);
 assert(events(sim,'G07').length>0,'G07 should counter melee');
 assert(events(sim,'G08').length>0,'G08 should activate after three basics');
}
{
 const {sim,f,e}=make('guardian',['G09','G10'],'warrior',[],2);
 f.hp=f.stats.hp*.6;advance(sim,100);
 assert(cast(sim,'G09')&&cast(sim,'G10'),'Guardian must use active heal and Solar Bastion');
 assert(sim.events.some(e=>e.type==='heal'&&e.talent==='G09'),'G09 must restore real HP');
}
const used=new Set(),wins=new Set(),times={};
for(let seed=1;seed<=24;seed++){
 const fighters=Array.from({length:30},(_,i)=>{
  const klass=classes[(i+seed)%4];
  return {id:'bot-'+i,build:P.exampleBuild(klass,klass+' '+i,5,(Math.floor(i/4)+seed)%3),approvedMissions:5};
 });
 const sim=P.battle(fighters,{seed:seed*3141,arenaScale:4.4,limit:95});
 const result=sim.run(2200);
 assert(result.finished&&result.winner,'No winner seed '+seed);
 for(const e of result.events)if(e.talent)used.add(e.talent);
 wins.add(result.winner.klass);times[result.events.at(-1)?.reason||'unknown']=(times[result.events.at(-1)?.reason||'unknown']||0)+1;
 assert(result.standings.length===30);
 assert(sim.fighters.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.x)&&Number.isFinite(f.z)));
}
assert(wins.size>=2,'New talents eliminate class variety');
console.log('B2 24x30 TRIAL '+JSON.stringify({observed:[...used].sort(),winners:[...wins],finish:times}));
console.log('PASS Phase B.2: ten original catalog entries per class, five talent picks M5, 20 additional functional skills + 24 30-bot simulations. No final arena / 120 animation claim.');

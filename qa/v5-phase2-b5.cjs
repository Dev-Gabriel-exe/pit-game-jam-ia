'use strict';
/* B.5 — source-fidelity, ability effects and real seeded 30-hero fights. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=require('../v5/phase2-combat.js'),classes=['warrior','mage','hunter','guardian'];
const talents={warrior:['T01','T02','T03','T04','T05'],mage:['A01','A02','A03','A04','A05'],hunter:['S01','S02','S03','S04','S05'],guardian:['J01','J02','J03','J04','J05']};
assert.equal(Object.values(P.TALENTS).flat().length,100);
for(const klass of classes){
 const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'../v5/talents-'+klass+'-plan.json'),'utf8')).talents;
 assert.equal(P.TALENTS[klass].length,25);
 assert.deepEqual(P.TALENTS[klass].map(t=>t.id),expected.slice(0,25).map(t=>t.id));
 for(const [i,t] of P.TALENTS[klass].entries()){
  const plan=expected[i];
  for(const key of ['id','name','type','primary','secondary'])assert.equal(t[key],plan[key],klass+' '+key);
  assert.equal(t.animationId,plan.animation.id);
 }
 const build=P.exampleBuild(klass,klass,5,7);
 assert.deepEqual(build.talents,talents[klass]);
 assert.equal(Object.values(build.attributes).reduce((a,v)=>a+v,0),10);
 assert.deepEqual(P.canonical(build,5).talents,talents[klass]);
 const mixed=P.exampleBuild(klass,klass,5,8);
 assert.equal(mixed.talents.length,5);
 assert.equal(new Set(mixed.talents).size,5);
 assert.throws(()=>P.canonical({...build,talents:[...build.talents,expected[0].id]},5),/Excesso/);
}
function hero(klass,id,ids){
 const build=P.exampleBuild(klass,id,5);build.talents=ids;
 return {id,build:P.canonical(build,5),approvedMissions:5};
}
function duel(klass,ids,enemy='guardian',eids=[],meters=2,seed=1003){
 const sim=P.battle([hero(klass,'hero',ids),hero(enemy,'dummy',eids)],{seed,limit:70});
 const [f,e]=sim.fighters;
 Object.assign(f,{x:12,z:12,vx:0,vz:0});
 Object.assign(e,{x:12+meters,z:12,vx:0,vz:0});
 f.stats.speed=0;e.stats.speed=0;
 e.stats.hp=6000;e.hp=6000;e.stats.defense=0;
 return {sim,f,e};
}
function go(sim,steps=700){for(let i=0;i<steps&&!sim.finished;i++)sim.update(.05)}
const effect=(s,id,type)=>s.events.some(e=>e.talent===id&&(!type||e.type===type));
{
 const {sim,f}=duel('warrior',talents.warrior,'warrior',['B01'],2);
 f.stats.hp=1400;f.hp=1400;
 go(sim,600);
 for(const t of ['T01','T04','T05'])assert(effect(sim,t,'talent'),t+' should cast');
 assert(effect(sim,'T03','proc'),'T03 shield impact should reflect within melee range');
 assert(effect(sim,'T02','charge')&&effect(sim,'T02','proc'),'T02 should charge after 5s quiet and reduce next incoming hit');
 assert(sim.events.some(e=>e.talent==='T05'&&e.type==='debuff'),'T05 must weaken damage');
}
{
 const {sim,f}=duel('mage',['A01','A02','A04','A05'],'guardian',[],6);
 f.stats.hp=1500;f.hp=1500;
 go(sim,800);
 for(const t of ['A01','A02','A04'])assert(effect(sim,t,'talent'),t+' must cast');
 assert(effect(sim,'A02','teleport'),'A02 must teleport to collision-free location');
 assert(effect(sim,'A04','zone'),'A04 must create 2m gravity zone');
 assert(effect(sim,'A05','proc')&&effect(sim,'A05','talent-impact'),'A05 must apply delayed echo to genuine active target');
}
{
 const {sim,f,e}=duel('mage',['A03'],'guardian',[],9);
 f.x=-7;f.z=4;e.x=2;e.z=4; // Stay within the storm ring during the 4m movement trial.
 f.stats.speed=5;e.basic=999;e.offenseDelay=999;
 go(sim,250);
 assert(effect(sim,'A03','charge'),'A03 should charge after 4m travel');
 // Actual incoming melee consumes it.
 f.stats.speed=0;f.vx=0;f.vz=0;
 e.x=f.x+1.4;e.z=f.z;e.offenseDelay=0;e.basic=0;
 go(sim,250);
 assert(effect(sim,'A03','proc'),'A03 should reduce next incoming impact');
}
{
 const {sim,f,e}=duel('hunter',['S01','S03','S05'],'guardian',[],5);
 f.stats.hp=1500;f.hp=1500;e.basic=999;
 go(sim,600);
 for(const t of ['S01','S03','S05'])assert(effect(sim,t,'talent'),t+' must cast');
 assert(effect(sim,'S05','debuff'),'S05 weak shot should debuff after a physical projectile hit');
 assert(sim.events.some(x=>x.type==='hit'&&x.skill==='S03'),'S03 must actually hit');
}
{
 const {sim,f,e}=duel('hunter',['S02'],'guardian',[],3);
 f.hp=f.stats.hp*.6;e.basic=999;e.offenseDelay=999;
 go(sim,230);
 assert(effect(sim,'S02','proc')&&effect(sim,'S02','heal'),'S02 should trigger when safe 5s and restore HP');
}
{
 const {sim,f,e}=duel('hunter',['S04'],'mage',['A01','E01'],4);
 f.stats.hp=1700;f.hp=1700;e.stats.attack=7;
 go(sim,700);
 assert(effect(sim,'S04','charge'),'S04 should arm from first incoming active spell');
 assert(effect(sim,'S04','proc'),'S04 should protect from next special within 4 sec');
}
{
 const {sim,f}=duel('guardian',talents.guardian,'guardian',[],2);
 f.stats.hp=1700;f.hp=1700;
 go(sim,1000);
 for(const t of ['J01','J04'])assert(effect(sim,t,'talent'),t+' must cast');
 assert(effect(sim,'J02','charge')&&effect(sim,'J02','proc'),'J02 needs 2 basic hits followed by empowered basic');
 assert(effect(sim,'J04','mark')&&effect(sim,'J04','proc'),'J04 must apply and consume next-basic mark');
 assert(effect(sim,'J05','proc'),'J05 should boost only healthy basic attacks');
}
{
 const {sim,f,e}=duel('guardian',['J03'],'guardian',[],5);
 f.stats.speed=0;e.basic=999;e.offenseDelay=999;
 go(sim,280);
 assert(effect(sim,'J03','talent'),'J03 must advance to attack');
 assert(sim.events.some(x=>x.type==='hit'&&x.skill==='J03'),'J03 must hit after actual collision-free dash');
}
const winners=new Set(),types=new Set(),observed=new Set();
for(let seed=1;seed<=18;seed++){
 const roster=Array.from({length:30},(_,i)=>{
  const klass=classes[(i+seed)%4];
  return hero(klass,'bot-'+i,P.exampleBuild(klass,klass+' '+i,5,(i+seed)%9).talents);
 });
 const sim=P.battle(roster,{seed:818+seed*331,limit:95,arenaScale:4.4});
 const r=sim.run(2000);
 assert(r.finished&&r.winner,'30 heroes need champion seed '+seed);
 winners.add(r.winner.klass);
 for(const ev of r.events){types.add(ev.type);if(ev.talent)observed.add(ev.hero+':'+ev.talent)}
 assert(sim.fighters.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.x)&&Number.isFinite(f.z)&&f.shield<=f.stats.hp*.3+1e-8));
}
assert(winners.size>=2,'Unbalanced B.5 winner cohort');
assert([...observed].some(t=>t.endsWith(':T01'))&&[...observed].some(t=>t.endsWith(':A01'))&&
 [...observed].some(t=>t.endsWith(':S01'))&&[...observed].some(t=>t.endsWith(':J01')),
 'All four B.5 trees should be represented in 30-hero battles');
console.log('PASS B.5 100 catalog-faithful combat talents, M5 budget, target/mechanics tests, 18x30 deterministic FFA simulations; winners='+[...winners].join(','));

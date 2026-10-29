'use strict';
// B.4: catalog fidelity, distinct skill mechanics, original M5 rules and 30-hero stability.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const P=require('../v5/phase2-combat.js');
const classes=['warrior','mage','hunter','guardian'];
const fresh={
 warrior:['D06','D07','D08','D09','D10'],
 mage:['R06','R07','R08','R09','R10'],
 hunter:['E06','E07','E08','E09','E10'],
 guardian:['L06','L07','L08','L09','L10']
};
assert.equal(Object.values(P.TALENTS).flat().length,80);
for(const klass of classes){
 const planned=JSON.parse(fs.readFileSync(path.join(__dirname,'../v5/talents-'+klass+'-plan.json'),'utf8')).talents;
 assert.equal(P.TALENTS[klass].length,20);
 assert.deepEqual(P.TALENTS[klass].slice(15,20).map(t=>t.id),fresh[klass]);
 for(let i=15;i<20;i++){
  const a=P.TALENTS[klass][i],b=planned[i];
  for(const k of ['id','name','type','primary','secondary'])assert.equal(a[k],b[k],klass+':'+k);
  assert.equal(a.animationId,b.animation.id);
 }
 const sample=P.exampleBuild(klass,'B4',5,5);
 assert.deepEqual(sample.talents,fresh[klass]);
 assert.equal(Object.values(sample.attributes).reduce((a,b)=>a+b,0),10);
 assert.deepEqual(P.canonical(sample,5).talents,fresh[klass]);
 assert.throws(()=>P.canonical({...sample,talents:[...fresh[klass],planned[0].id]},5),/Excesso/);
 const mixed=P.exampleBuild(klass,'Mix',5,6);
 assert.equal(mixed.talents.length,5);
 assert.equal(new Set(mixed.talents).size,5);
}
function slot(klass,id,chosen){
 const b=P.exampleBuild(klass,id,5);
 b.talents=chosen;
 return {id,approvedMissions:5,build:P.canonical(b,5)};
}
function duel(k,chosen,other,otherSkills=[],distance=2){
 const sim=P.battle([slot(k,'hero',chosen),slot(other,'enemy',otherSkills)],{seed:1977,limit:55});
 const [f,e]=sim.fighters;
 Object.assign(f,{x:12,z:12,vx:0,vz:0,basic:0});
 Object.assign(e,{x:12+distance,z:12,vx:0,vz:0,basic:0});
 f.stats.speed=0;e.stats.speed=0;
 e.stats.hp=6000;e.hp=6000;e.stats.defense=0;
 return {sim,f,e};
}
function go(sim,n=600){for(let i=0;i<n&&!sim.finished;i++)sim.update(.05)}
const seen=(sim,id,kind)=>sim.events.some(e=>e.talent===id&&(!kind||e.type===kind));
{
 const {sim,f}=duel('warrior',['D06','D07','D08','D09','D10'],'warrior',['B09']);
 f.stats.hp=1400;f.hp=1400;
 go(sim,450);
 assert(seen(sim,'D06','proc'),'D06 should mitigate after a real incoming hit');
 assert(seen(sim,'D07','talent'),'D07 must cast a debuff strike');
 assert(seen(sim,'D09','proc'),'D09 needs a genuinely heavy incoming melee skill');
 assert(seen(sim,'D10','talent'),'D10 triple skill not cast');
 assert(sim.events.filter(x=>x.type==='hit'&&x.skill==='D10').length>=3,'D10 must deliver three interruptible hits');
}
{
 const {sim,f,e}=duel('mage',['R06','R07','R08','R09','R10'],'guardian');
 f.stats.hp=950;f.hp=950;e.stats.attack=4;
 go(sim,420);
 assert(seen(sim,'R10','talent')&&seen(sim,'R10','talent-impact'),'R10 needs a marked impact');
 assert(seen(sim,'R08','talent'),'R08 must fire a real projectile');
 assert(seen(sim,'R07','proc'),'R07 must activate when the rune shield is made');
 assert(seen(sim,'R06','proc'),'R06 should reflect a shielded impact within 7 m');
}
{
 const {sim,f,e}=duel('mage',['R09'],'warrior',[],2);
 f.hp=f.stats.hp*.32;e.stats.attack=6;
 go(sim,180);
 assert(seen(sim,'R09','proc'),'R09 must create a once-per-duel emergency barrier');
 assert(sim.events.filter(x=>x.talent==='R09'&&x.type==='proc').length===1);
}
{
 const {sim,f,e}=duel('hunter',['E06','E07','E08','E09','E10'],'warrior');
 f.hp=f.stats.hp*.49;e.stats.attack=5;
 go(sim,600);
 assert(seen(sim,'E10','talent')&&seen(sim,'E10','trap'),'E10 must place and detonate a mine');
 assert(seen(sim,'E09','charge'),'E09 must charge on the first triggered trap');
 assert(seen(sim,'E06','proc'),'E06 must react to actual melee damage');
 assert(seen(sim,'E08','proc'),'E08 should arm once at low HP');
}
{
 const {sim,f,e}=duel('guardian',['L06','L07','L08','L09','L10'],'mage',['E01','E02']);
 f.hp=f.stats.hp*.37;e.stats.attack=8;
 go(sim,440);
 assert(seen(sim,'L10','talent')&&seen(sim,'L10','zone'),'L10 sanctuary must exist in the combat world');
 assert(seen(sim,'L08','talent')&&seen(sim,'L08','talent-impact'),'L08 must strike after preparation');
 assert(seen(sim,'L09','proc'),'L09 should shorten a real burn and start healing');
 assert(seen(sim,'L06','proc'),'L06 should heal after reaching low HP');
}
{
 const {sim,e}=duel('guardian',['L07'],'warrior');
 e.basic=1000;e.offenseDelay=1000;
 go(sim,150);
 assert(seen(sim,'L07','charge'),'L07 needs four seconds without being hit');
}
{
 const a=duel('warrior',['D08'],'guardian',[],10);
 const b=duel('warrior',[],'guardian',[],10);
 a.f.stats.speed=4;b.f.stats.speed=4;
 a.e.basic=1000;b.e.basic=1000;
 go(a.sim,24);go(b.sim,24);
 const dxA=Math.hypot(a.f.x-12,a.f.z-12),dxB=Math.hypot(b.f.x-12,b.f.z-12);
 assert(dxA>dxB,'D08 movement passive should increase travel, not attack rate');
}
for(let seed=1;seed<=12;seed++){
 const lineup=Array.from({length:30},(_,i)=>{
  const klass=classes[(i+seed)%4];
  return slot(klass,'bot-'+i,P.exampleBuild(klass,klass+' '+i,5,(Math.floor(i/4)+seed)%7).talents);
 });
 const sim=P.battle(lineup,{seed:seed*409+63,limit:95,arenaScale:4.2});
 const result=sim.run(2000);
 assert(result.finished&&result.winner,'No victor for B4 seed '+seed);
 assert(sim.fighters.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.x)&&Number.isFinite(f.z)&&
  Number.isFinite(f.shield)&&f.shield<=f.stats.hp*.3+1e-6),'Invalid combat state on B4 seed '+seed);
}
console.log('PASS V5 B.4: 80 planned catalog matches, 20 additional executable rules, M5 mixed builds, timed/defensive skills and 12 30-bot simulations.');

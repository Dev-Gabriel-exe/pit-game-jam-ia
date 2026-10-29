'use strict';
// B.6: 120 talent catalog fidelity, individual triggers and seeded 30-person matches.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=require('../v5/phase2-combat.js');
const classes=['warrior','mage','hunter','guardian'];
const final={warrior:['T06','T07','T08','T09','T10'],mage:['A06','A07','A08','A09','A10'],hunter:['S06','S07','S08','S09','S10'],guardian:['J06','J07','J08','J09','J10']};
assert.equal(Object.values(P.TALENTS).flat().length,120);
for(const klass of classes){
 const plan=JSON.parse(fs.readFileSync(path.join(__dirname,'../v5/talents-'+klass+'-plan.json'),'utf8')).talents;
 assert.equal(plan.length,30);assert.equal(P.TALENTS[klass].length,30);
 for(let i=0;i<30;i++){
  const a=P.TALENTS[klass][i],b=plan[i];
  for(const key of ['id','name','type','primary','secondary'])assert.equal(a[key],b[key],klass+' '+key+' '+i);
  assert.equal(a.animationId,b.animation.id);
 }
 const sample=P.exampleBuild(klass,'B6 '+klass,5,9);
 assert.deepEqual(sample.talents,final[klass]);
 assert.equal(Object.values(sample.attributes).reduce((a,v)=>a+v,0),10);
 assert.deepEqual(P.canonical(sample,5).talents,final[klass]);
 assert.equal(new Set(P.exampleBuild(klass,'mixed',5,10).talents).size,5);
 assert.throws(()=>P.canonical({...sample,talents:[...sample.talents,plan[0].id]},5),/Excesso/);
}
function hero(klass,id,ids){
 const b=P.exampleBuild(klass,id,5);
 b.talents=ids;
 return {id,approvedMissions:5,build:P.canonical(b,5)};
}
function duel(k,skills,other='guardian',otherSkills=[],distance=2){
 const sim=P.battle([hero(k,'hero',skills),hero(other,'enemy',otherSkills)],{seed:1479,limit:75});
 const [f,e]=sim.fighters;
 Object.assign(f,{x:12,z:12,vx:0,vz:0});Object.assign(e,{x:12+distance,z:12,vx:0,vz:0});
 f.stats.speed=0;e.stats.speed=0;
 e.stats.hp=6000;e.hp=6000;e.stats.defense=0;
 return {sim,f,e};
}
function run(sim,n=700){for(let i=0;i<n&&!sim.finished;i++)sim.update(.05)}
const has=(sim,id,type)=>sim.events.some(e=>e.talent===id&&(!type||e.type===type));
const count=(sim,id,type)=>sim.events.filter(e=>e.talent===id&&(!type||e.type===type)).length;
{
 const {sim,f}=duel('warrior',final.warrior,'mage',['E03'],2);
 f.stats.hp=1600;f.hp=1200;
 run(sim,1000);
 for(const x of ['T08','T10'])assert(has(sim,x,'talent'),x+' must be cast');
 for(const x of ['T06','T07','T09'])assert(has(sim,x,'proc'),x+' must trigger from real actions');
 assert(has(sim,'T09','heal'),'T09 must regenerate actual missing HP');
 assert(has(sim,'T06','proc'),'T06 must shorten real slowing spells');
}
{
 const {sim,f,e}=duel('mage',['A06','A08','A09','A10'],'warrior',['B01'],2);
 f.stats.hp=900;f.hp=900;e.stats.attack=11;
 run(sim,1100);
 for(const x of ['A08','A10'])assert(has(sim,x,'talent')&&has(sim,x,'talent-impact'),x+' must cast and impact');
}
{
 const {sim,f,e}=duel('mage',['A06','A09'],'warrior',['B01'],2);
 f.hp=f.stats.hp*.36;e.stats.attack=25;
 run(sim,350);
 assert(has(sim,'A06','proc'),'A06 must mitigate 20%+ incoming hit');
 assert(has(sim,'A09','proc')&&count(sim,'A09','proc')===1,'A09 must retreat once when low');
}
{
 const {sim,f,e}=duel('mage',['A07','A08'],'guardian',[],5);
 e.basic=999;e.offenseDelay=999;f.stats.hp=1200;f.hp=1200;
 run(sim,700);
 assert(has(sim,'A07','charge')&&has(sim,'A07','proc'),'A07 must charge safely and boost the next offensive cast');
}
{
 const {sim,f,e}=duel('hunter',['S06','S07','S09'],'warrior',['B01'],2);
 f.hp=f.stats.hp*.34;e.stats.attack=25;
 run(sim,420);
 assert(has(sim,'S06','proc')&&count(sim,'S06','proc')===1,'S06 emergency barrier once per match');
 assert(has(sim,'S07','proc'),'S07 low HP movement boost');
 assert(has(sim,'S09','proc'),'S09 defense against heavy damage');
}
{
 const {sim,f,e}=duel('hunter',['S08','S10'],'guardian',[],1.5);
 f.stats.hp=1600;f.hp=1600;e.basic=999;e.offenseDelay=999;
 run(sim,1000);
 for(const x of ['S08','S10'])assert(has(sim,x,'talent'),x+' must cast');
 assert(has(sim,'S08','launch'),'S08 must launch an actual projectile');
 assert(has(sim,'S10','trap'),'S10 marks must inflict actual trap damage');
}
{
 const {sim,f,e}=duel('guardian',['J06','J07','J10'],'warrior',['B01'],2);
 f.stats.hp=1100;f.hp=1100;e.stats.attack=11;
 run(sim,950);
 assert(has(sim,'J06','proc'),'J06 responds to real incoming skill within 3m');
 for(const x of ['J07','J10'])assert(has(sim,x,'talent'),x+' must cast');
 assert(has(sim,'J07','debuff'),'J07 cone must slow');
 assert(has(sim,'J10','talent-impact'),'J10 requires a real telegraphed impact');
}
{
 const {sim,f,e}=duel('guardian',['J08','G01','J01'],'warrior',['B01'],2);
 f.stats.hp=1400;f.hp=1400;e.stats.attack=12;
 run(sim,1100);
 assert(has(sim,'J08','charge')&&has(sim,'J08','proc'),'J08 needs two blocked hits before buffing a special');
}
{
 const {sim,f,e}=duel('guardian',['J09'],'warrior',['B01'],2);
 f.hp=f.stats.hp*.34;e.stats.attack=12;
 run(sim,450);
 assert(has(sim,'J09','proc')&&count(sim,'J09','proc')===1,'J09 one-time final protection');
}
const winners=new Set(),used=new Set();
for(let seed=1;seed<=18;seed++){
 const roster=Array.from({length:30},(_,i)=>{
  const k=classes[(i+seed)%4];
  return hero(k,'bot-'+i,P.exampleBuild(k,k+' '+i,5,(i+seed)%11).talents);
 });
 const sim=P.battle(roster,{seed:1000+seed*331,limit:95,arenaScale:4.4}),r=sim.run(2100);
 assert(r.finished&&r.winner,'No champion '+seed);
 winners.add(r.winner.klass);
 for(const ev of r.events)if(ev.talent)used.add(ev.hero+':'+ev.talent);
 assert(sim.fighters.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.x)&&Number.isFinite(f.z)&&
  Number.isFinite(f.shield)&&f.shield<=f.stats.hp*.3+1e-8));
}
assert(winners.size>=2,'Winner diversity regression');
for(const id of ['T10','A10','S10','J10'])assert([...used].some(x=>x.endsWith(':'+id)),id+' missing from 30-hero melee');
console.log('PASS V5 B.6: 120 catalog-faithful skills, 20 final ability effects, 18 30-hero battles, M5 point budget and class diversity');

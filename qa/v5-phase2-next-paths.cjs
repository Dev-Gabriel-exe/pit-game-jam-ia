'use strict';
// Phase B.3: 20 effects spanning second trees, not renamed B.2 placeholders.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const P=require('../v5/phase2-combat.js');
const classes=['warrior','mage','hunter','guardian'];
const additions={warrior:['D01','D02','D03','D04','D05'],mage:['R01','R02','R03','R04','R05'],hunter:['E01','E02','E03','E04','E05'],guardian:['L01','L02','L03','L04','L05']};
assert.equal(Object.values(P.TALENTS).flat().length,60);
for(const klass of classes){
 const planned=JSON.parse(fs.readFileSync(path.join(__dirname,'../v5/talents-'+klass+'-plan.json'),'utf8')).talents;
 const skills=P.TALENTS[klass];
 assert.equal(skills.length,15);
 assert.deepEqual(skills.slice(10).map(t=>t.id),additions[klass]);
 for(let i=10;i<15;i++){
  const t=skills[i],source=planned[i];
  for(const key of ['id','name','type','primary','secondary'])assert.equal(t[key],source[key],klass+' '+key);
  assert.equal(t.animationId,source.animation.id);
 }
 const b=P.exampleBuild(klass,'B3 '+klass,5,3);
 assert.deepEqual(b.talents,additions[klass]);
 assert.equal(b.talents.length,5);
 assert.equal(Object.values(b.attributes).reduce((a,v)=>a+v,0),10);
 assert.deepEqual(P.canonical(b,5).talents,b.talents);
 assert.throws(()=>P.canonical({...b,talents:[...b.talents,skills[0].id]},5),/Excesso/);
}
function build(klass,id,ids){return{id,approvedMissions:5,build:P.canonical({...P.exampleBuild(klass,id,5),talents:ids},5)}}
function staged(main,chosen,enemy='guardian',enemySkills=[],distance=2,seed=103){
 const sim=P.battle([build(main,'hero',chosen),build(enemy,'target',enemySkills)],{seed,limit:65});
 const [f,e]=sim.fighters;
 Object.assign(f,{x:12,z:12, vx:0,vz:0,basic:0});
 Object.assign(e,{x:12+distance,z:12,vx:0,vz:0,basic:0});
 f.stats.speed=0;e.stats.speed=0;
 e.stats.hp=5000;e.hp=5000;e.stats.defense=0;
 return {sim,f,e};
}
function advance(sim,n=1000){for(let i=0;i<n&&!sim.finished;i++)sim.update(.05)}
const seen=(sim,id)=>sim.events.filter(e=>e.talent===id);
const kinds=(sim,id)=>[...new Set(seen(sim,id).map(e=>e.type))];
for(const [k,enemy,dist] of [['warrior','guardian',2],['mage','warrior',2],['hunter','guardian',5],['guardian','warrior',2]]){
 const {sim,f,e}=staged(k,additions[k],enemy,['B01'],dist,972);
 if(k==='guardian'){f.stats.hp=1400;f.hp=800;e.stats.attack=8;}
 if(k==='hunter'){f.hp=f.stats.hp*.8;}
 advance(sim,1200);
 const observed=additions[k].map(id=>({id,events:kinds(sim,id)}));
 console.log('B3 DUEL '+k+' '+JSON.stringify(observed));
 if(k==='warrior'){
  for(const id of ['D01','D03','D05'])assert(sim.events.some(x=>x.type==='talent'&&x.talent===id),id+' not cast');
  for(const id of ['D02','D04'])assert(seen(sim,id).some(x=>x.type==='proc'||x.type==='charge'),id+' did not react');
  assert(seen(sim,'D01').filter(x=>x.type==='hit').length>=2,'D01 must strike twice');
 }
 if(k==='mage'){
  for(const id of ['R01','R03','R05'])assert(sim.events.some(x=>x.type==='talent'&&x.talent===id),id+' not cast');
  assert(seen(sim,'R02').some(x=>x.type==='charge'),'R02 needs two *different* offensive spells on same enemy');
 }
 if(k==='hunter'){
  for(const id of ['E01','E02','E04','E05'])assert(sim.events.some(x=>x.type==='talent'&&x.talent===id),id+' not cast');
  assert(seen(sim,'E01').some(x=>x.type==='trap'),'E01 must trigger physical trap zone');
  assert(seen(sim,'E03').some(x=>x.type==='proc'),'E03 poison requires real trap damage');
  assert(seen(sim,'E03').some(x=>x.type==='hit'),'E03 must inflict real poison damage');
  assert(seen(sim,'E04').some(x=>x.type==='zone-effect'),'E04 must slow enemies in zone');
 }
 if(k==='guardian'){
  for(const id of ['L01','L04','L05'])assert(sim.events.some(x=>x.type==='talent'&&x.talent===id),id+' not cast');
  assert(seen(sim,'L01').some(x=>x.type==='heal'),'L01 must heal over three seconds');
  assert(seen(sim,'L02').some(x=>x.type==='proc'),'L02 must increase actual basic attack');
  assert(seen(sim,'L03').some(x=>x.type==='proc'),'L03 must heal from shield absorption');
 }
}
// The reactive Rune Mind must actually reduce the *next* skill hit, not basics.
{
 const {sim}=staged('mage',['R04'],'warrior',['B01'],2,902);
 advance(sim,700);
 assert(seen(sim,'R04').some(x=>x.type==='charge'),'R04 must arm on incoming talent');
 assert(seen(sim,'R04').some(x=>x.type==='proc'),'R04 must mitigate a later incoming talent');
}
// 30-hero combat with second-tree users, no NaNs and at least two class victors.
const observed=new Set(),winners=new Set(),combatKinds=new Set();
for(let seed=1;seed<=25;seed++){
 const roster=Array.from({length:30},(_,i)=>{
  const klass=classes[(i+seed)%4];
  return {id:'bot-'+i,approvedMissions:5,build:P.exampleBuild(klass,klass+' '+i,5,(Math.floor(i/4)+seed)%5)};
 });
 const sim=P.battle(roster,{seed:1000+seed*443,limit:95,arenaScale:4.4});
 const result=sim.run(2200);
 assert(result.finished&&result.winner,'No winner on seed '+seed);
 assert.equal(sim.fighters.length,30);
 winners.add(result.winner.klass);
 for(const event of result.events){if(event.talent)observed.add(event.hero+':'+event.talent);combatKinds.add(event.type)}
 assert(sim.fighters.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.x)&&Number.isFinite(f.z)&&f.shield<=f.stats.hp*.3+1e-8));
}
assert(winners.size>=2,'B.3 broken winner class diversity');
assert([...observed].some(x=>x.endsWith(':E01')),'Hunter trap never cast in FFA');
assert([...observed].some(x=>x.endsWith(':L01')),'Guardian heal never cast in FFA');
assert(combatKinds.has('zone')&&combatKinds.has('trap'),'Zone traps missing from arena');
console.log('PASS V5 B.3: 60 catalog-faithful talents, reactive/passive and active execution, 25 seeded 30-hero melees, four real second trees; server/final locks remain pending. Victors '+JSON.stringify([...winners]));

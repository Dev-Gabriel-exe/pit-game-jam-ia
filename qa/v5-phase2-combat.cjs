'use strict';
/* Phase B.1 baseline regression plus expanded B.4 catalog. */
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const fs=require('node:fs');
const path=require('node:path');
const classes=['warrior','mage','hunter','guardian'];
assert.deepEqual(P.ATTR,['FOR','DES','INT','VIT','DEF']);
assert.equal(Object.values(P.TALENTS).flat().length,80);
for(const klass of classes){
 const approved=JSON.parse(fs.readFileSync(path.join(__dirname,'../v5/talents-'+klass+'-plan.json'),'utf8')).talents.slice(0,20);
 assert.deepEqual(P.TALENTS[klass].map(t=>t.id),approved.map(t=>t.id),'IDs do not follow approved source for '+klass);
 for(const [i,t]of P.TALENTS[klass].entries()){
  assert.equal(t.name,approved[i].name);
  assert.equal(t.type,approved[i].type);
  assert.equal(t.primary,approved[i].primary);
  assert.equal(t.secondary,approved[i].secondary);
  assert.equal(t.animationId,approved[i].animation.id);
 }
}
const actor=(klass,id)=>({id,build:P.exampleBuild(klass,id,5),approvedMissions:5});
for(const klass of classes){
 const b=P.exampleBuild(klass,'QA',5);
 assert.equal(b.talents.length,5);
 assert.equal(Object.values(b.attributes).reduce((a,n)=>a+n,0),10);
 assert.equal(b.approvedMissions,5);
}
function reject(modify,fragment){
 const b=P.exampleBuild('warrior','Reject',5);
 modify(b);
 assert.throws(()=>P.canonical(b,5),new RegExp(fragment));
}
reject(b=>b.attributes.FOR=13,'Inválido|inválido');
reject(b=>b.attributes.INT=3,'orçamento');
reject(b=>b.talents.push('B01'),'Excesso|duplicado');
reject(b=>b.talents[0]='P01','não implementado');
reject(b=>b.attributes.spirit=2,'desconhecido');
assert.throws(()=>P.canonical(P.exampleBuild('mage','QA',5),10),'no máximo');
const first=[actor('warrior','w'),actor('mage','m'),actor('hunter','h'),actor('guardian','g')];
const s1=P.battle(first,{seed:4471,limit:70,arenaScale:2});
const s2=P.battle(first,{seed:4471,limit:70,arenaScale:2});
const r1=s1.run(1700),r2=s2.run(1700);
assert.deepEqual(r1,r2,'Same seed/builds must generate identical replay');
assert(r1.finished&&r1.winner);
assert(r1.events.some(e=>e.type==='talent'),'Real talents never cast');
assert(r1.events.some(e=>e.type==='hit'&&e.skill),'Talents must deal actual damage');
assert(s1.fighters.every(f=>f.shield<=f.stats.hp*.30+1e-8),'Shield stack exceeded cap');
function stagedDuel(klass,enemyClass,{dx=4,disableTarget=false,seed=900}={}){
 const sim=P.battle([actor(klass,'player'),actor(enemyClass,'enemy')],{seed,limit:58});
 const [a,b]=sim.fighters;
 Object.assign(a,{x:10,z:11,vx:0,vz:0,basic:999});
 Object.assign(b,{x:10+dx,z:11,vx:0,vz:0,basic:disableTarget?999:0});
 a.stats.speed=0;b.stats.speed=0;
 return sim;
}
// Offensive actives must be executed, with distinguishable IDs and damage.
for(const [klass,other,dx,mandatory] of [
 ['warrior','guardian',2,['B01','B03','B05']],
 ['mage','guardian',6,['E01','E03','E04']],
 ['hunter','guardian',6,['P01','P03','P05']],
 ['guardian','warrior',2,['G01','G04']]
]){
 const sim=stagedDuel(klass,other,{dx,disableTarget:true,seed:412});
 // An immortal dummy exposes the entire cooldown cycle without random KO.
 const t=sim.fighters[1];t.stats.hp=6000;t.hp=6000;t.stats.defense=0;
 for(let i=0;i<900&&!sim.finished;i++)sim.update(.05);
 const used=new Set(sim.events.filter(e=>e.type==='talent'&&e.hero==='player').map(e=>e.talent));
 for(const talent of mandatory)assert(used.has(talent),klass+' did not cast '+talent+' '+JSON.stringify([...used]));
 console.log('PHASE2 SKILL CASTS '+klass+' '+JSON.stringify([...used]));
}
// Four cross-class reactivity and passives are exercised on real combat events.
{
 const sim=stagedDuel('mage','warrior',{dx:2,disableTarget:false});
 sim.fighters[0].hp=70;
 for(let i=0;i<300;i++)sim.update(.05);
 assert(sim.events.some(e=>e.type==='proc'&&e.talent==='E05'),'Volcanic Skin must react to close impact');
}
{
 const sim=stagedDuel('guardian','warrior',{dx:2});
 const guardian=sim.fighters[0],attacker=sim.fighters[1];
 guardian.hp=guardian.stats.hp*.45;
 attacker.stats.attack=45;
 for(let i=0;i<330;i++)sim.update(.05);
 assert(sim.events.some(e=>e.type==='proc'&&e.talent==='G03'),'Aegis must retaliate after shield absorption');
 assert(sim.events.some(e=>e.type==='proc'&&e.talent==='G05'),'Resilient steel must respond to 15% HP loss');
}
{
 const sim=stagedDuel('hunter','warrior',{dx:6,disableTarget:true});
 const f=sim.fighters[0];f.stats.speed=0;f.basic=999;
 for(let i=0;i<100;i++)sim.update(.05);
 assert(sim.events.some(e=>e.type==='charge'&&e.talent==='P02'),'Stationary aim must charge after 3s');
}
{
 const sim=stagedDuel('warrior','guardian',{dx:2,disableTarget:true});
 const f=sim.fighters[0];f.stats.attack=4;
 f.basic=0;
 for(let i=0;i<440;i++)sim.update(.05);
 assert(sim.events.some(e=>e.type==='charge'&&e.talent==='B02'),'Two hits must charge Warm Blood');
}
const eventKinds=new Set(),allTalentIds=new Set(),winClasses=new Set();
for(let seed=1;seed<=12;seed++){
 const roster=Array.from({length:30},(_,i)=>actor(classes[(i+seed)%4],'bot-'+i));
 const sim=P.battle(roster,{seed:seed*147,limit:95,arenaScale:4.4});
 const result=sim.run(2000);
 assert(result.finished&&result.winner,'No champion: '+seed);
 assert.equal(result.standings.length,30);
 winClasses.add(result.winner.klass);
 for(const e of result.events){eventKinds.add(e.type);if(e.talent)allTalentIds.add(e.talent)}
 assert(result.events.some(e=>e.type==='hit'));
 assert(result.events.some(e=>e.type==='knockout'||e.type==='storm'));
 assert(sim.fighters.every(f=>Number.isFinite(f.x)&&Number.isFinite(f.z)&&Number.isFinite(f.hp)));
}
assert(winClasses.size>=2,'No winner diversity in experimental cohort');
assert.equal(allTalentIds.size,20,'All 20 talents must trigger naturally in 30-hero simulations: '+JSON.stringify([...allTalentIds]));
console.log('PHASE2 12x30 BOT AUDIT '+JSON.stringify({talentsObserved:[...allTalentIds].sort(),eventKinds:[...eventKinds].sort(),winnerClasses:[...winClasses]}));
console.log('PASS V5 B.1 regression with B.4 80-talent catalog: original 20 effects, M5 point budget, deterministic 30-bot battles. No server lock or exclusive animations claimed.');

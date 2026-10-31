'use strict';
// Fase E: opt-in, reproducible real ranged-movement counterplay; no fixed wins.
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const CLASSES=['warrior','mage','hunter','guardian'];
const SETTINGS={arenaScale:5,limit:145,damageScale:.5,mageDamageBonus:1.1,
 stormDelay:40,stormRateFactor:.55,engagementMode:'spaced'};
function entry(klass,i,variant){
 const build=P.exampleBuild(klass,klass+' '+i,5,variant);
 return {id:'c'+i,name:klass+' '+i,build,approvedMissions:5};
}
function battle(classes,seed,nav,mode,offset){
 const roster=classes.map((c,i)=>entry(c,i,(i*3+offset)%11));
 const sim=P.battle(roster,{...SETTINGS,seed,navigationMode:nav,rangedCommitment:mode});
 let firstClose=null,closest=Infinity;
 for(let i=0;i<3000&&!sim.finished;i++){
  sim.update(.05);
  const alive=sim.fighters.filter(f=>f.alive);
  const frontliners=alive.filter(f=>f.stats.range<=3);
  for(const a of frontliners)for(const b of alive)if(b!==a&&b.stats.range>3){
   const d=Math.hypot(a.x-b.x,a.z-b.z);
   closest=Math.min(d,closest);
   if(d<=a.stats.range&&firstClose===null)firstClose=sim.time;
  }
 }
 const result=sim.result();
 assert(result.finished&&result.winner,'A sample must finish with a declared winner');
 assert(sim.fighters.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.x)&&Number.isFinite(f.z)));
 const exposures=result.events.filter(e=>e.type==='aim-recovery');
 return {
  result,
  winner:result.winner.klass,
  recovery:exposures.length,
  firstClose:firstClose===null?null:+firstClose.toFixed(2),
  closest:Number.isFinite(closest)?+closest.toFixed(2):null,
  skills:result.events.filter(e=>e.type==='talent').length,
  end:+result.time.toFixed(2)
 };
}
function summarize(label,seedClasses,n,nav){
 const options=[];
 for(let i=0;i<n;i++){
  const classes=seedClasses(i),seed=66011+i*2029,offset=i%11;
  const base=battle(classes,seed,nav,'none',offset);
  if(i===0){
   const old=battle(classes,seed,nav,undefined,offset);
   assert.deepEqual(base.result,old.result,'Explicit none must reproduce default without extra events');
  }
  const pace=battle(classes,seed,nav,'recovery',offset);
  if(i===0){
   const replay=battle(classes,seed,nav,'recovery',offset);
   assert.deepEqual(pace.result,replay.result,'Opt-in recovery must replay exactly');
  }
  assert.equal(base.recovery,0,'Baseline must never emit new recovery events');
  assert(pace.recovery>=0);
  const countRanged=classes.filter(c=>c==='hunter'||c==='mage').length;
  if(countRanged>0)assert(pace.recovery>0,'At least one ranged attack must commit');
  assert(!pace.result.events.some(e=>e.type==='aim-recovery'&&
    !(classes[Number(e.hero.slice(1))]==='mage'||classes[Number(e.hero.slice(1))]==='hunter')),
    'Frontliners may not receive a ranged movement penalty');
  options.push({base,pace});
 }
 function summary(key){
  const a={win:{},avgSeconds:0,avgSkills:0,avgRecovery:0,
   meanFirstClose:0,contacts:0,noContact:0,meanClosest:0};
  for(const item of options){
   const g=item[key];a.win[g.winner]=(a.win[g.winner]||0)+1;
   a.avgSeconds+=g.end/n;a.avgSkills+=g.skills/n;a.avgRecovery+=g.recovery/n;
   if(g.firstClose===null)a.noContact++;
   else {a.contacts++;a.meanFirstClose+=g.firstClose}
   if(g.closest!==null)a.meanClosest+=g.closest/n;
  }
  if(a.contacts)a.meanFirstClose/=a.contacts;
  for(const k of ['avgSeconds','avgSkills','avgRecovery','meanFirstClose','meanClosest'])a[k]=+a[k].toFixed(2);
  return a;
 }
 const result={n,nav,baseline:summary('base'),counterplay:summary('pace')};
 console.log('E RANGE '+label+' '+JSON.stringify(result));
 return result;
}
for(const nav of ['direct','steer']){
 for(const duo of [['guardian','hunter'],['guardian','mage'],['warrior','hunter'],['warrior','mage']]){
  summarize(duo.join(' x '),i=>i%2?[...duo].reverse():duo,12,nav);
 }
 for(const n of [4,30]){
  summarize(n+' heroes',i=>Array.from({length:n},(_,j)=>CLASSES[(i+j)%4]),n===4?16:12,nav);
 }
}
console.log('PASS phase E opt-in ranged commitment: baseline parity, real firing events, replay, four/30 contestants; no forced winners.');

'use strict';
// Fase E - diagnóstico reprodutível. NÃO altera classes nem resultados.
// Rode: node qa/v5-tank-survivability.cjs
const assert = require('node:assert/strict');
const Engine = require('../v5/phase2-combat.js');
const CLASSES = ['warrior','mage','hunter','guardian'];
const OPTIONS = Object.freeze({
  arenaScale:5,limit:145,damageScale:.5,mageDamageBonus:1.1,
  stormDelay:40,stormRateFactor:.55,engagementMode:'spaced'
});
function entry(klass,i,variant=0){
  return {id:'e'+i,name:klass+' '+i,
    approvedMissions:5,
    build:Engine.exampleBuild(klass,klass+' '+i,5,variant)};
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function measure(classes,seed,variants,checkReplay=false,navigationMode='direct'){
  const roster=classes.map((klass,i)=>entry(klass,i,variants[i]||0));
  const sim=Engine.battle(roster,{...OPTIONS,seed,navigationMode});
  const firstThreat=Object.fromEntries(sim.fighters.map(f=>[f.id,null]));
  const firstActualHit=Object.fromEntries(sim.fighters.map(f=>[f.id,null]));
  const firstClose=Object.fromEntries(sim.fighters.filter(f=>f.stats.range<=3)
    .map(f=>[f.id,null]));
  const bySource=Object.fromEntries(sim.fighters.map(f=>[f.id,{
    damage:0,absorbed:0,melee:0,ranged:0,special:0,blocked:0,talents:0
  }]));
  let eventsRead=0;
  for(let step=0;step<3000&&!sim.finished;step++){
    const now=sim.update(.05);
    for(const f of sim.fighters){
      if(!f.alive||f.stats.range>3||firstClose[f.id]!==null)continue;
      if(sim.fighters.some(x=>x!==f&&x.alive&&distance(x,f)<=f.stats.range)){
        firstClose[f.id]=+sim.time.toFixed(2);
      }
    }
    for(const e of now.events){
      if(!e.hero)continue;
      if(e.type==='hit'){
        const actor=bySource[e.hero];if(!actor)continue;
        actor.damage+=e.amount||0;
        actor.absorbed+=e.absorbed||0;
        if(e.kind==='melee')actor.melee++;
        else if(e.kind==='ranged'||e.kind==='basic')actor.ranged++;
        else actor.special++;
        if(firstThreat[e.target]===null)firstThreat[e.target]=e.time;
        if((e.amount||0)>0&&firstActualHit[e.target]===null)firstActualHit[e.target]=e.time;
      }else if(e.type==='blocked'&&bySource[e.hero])bySource[e.hero].blocked++;
      else if(e.type==='talent'&&bySource[e.hero])bySource[e.hero].talents++;
    }
    eventsRead+=now.events.length;
  }
  const result=sim.result();
  assert(result.finished,'A batalha deve terminar');
  assert(result.winner&&CLASSES.includes(result.winner.klass),'Vencedor inválido');
  assert(Number.isFinite(result.time)&&result.time>0&&result.time<=OPTIONS.limit+.1,'Tempo inválido');
  assert(result.events.length>=eventsRead,'A contagem de eventos deve ser consistente');
  for(const f of sim.fighters){
    assert(Number.isFinite(f.hp)&&Number.isFinite(f.x)&&Number.isFinite(f.z),'Geometria ou HP NaN');
  }
  if(checkReplay){
    const again=Engine.battle(roster,{...OPTIONS,seed,navigationMode}).run(3000);
    assert.deepEqual(result,again,'Seed e builds iguais devem preservar resultado completo');
  }
  const winner=result.winner.klass;
  const firstKnockout=result.events.find(e=>e.type==='knockout'||e.type==='storm');
  const timeFirstKO=firstKnockout?.time??null;
  const close=Object.entries(firstClose).map(([id,at])=>({
    klass:sim.fighters.find(f=>f.id===id).build.klass,time:at
  }));
  return {winner,time:result.time,timeFirstKO,close,firstThreat,firstActualHit,bySource,
    knockoutByClass:sim.fighters.filter(f=>!f.alive).map(f=>f.build.klass)};
}
function aggregate(matrix){
  const out={games:matrix.length,win:{},time:0,firstKO:0,meleeCloseByClass:{},damageByClass:{},
    shieldByClass:{},meleeHitsByClass:{},rangedHitsByClass:{},skillsByClass:{},noContactByClass:{}};
  const add=(key,klass,n)=>out[key][klass]=(out[key][klass]||0)+n;
  for(const game of matrix){
    out.win[game.winner]=(out.win[game.winner]||0)+1;
    out.time+=game.time;
    out.firstKO+=game.timeFirstKO??game.time;
    for(const item of game.close){
      if(item.time===null)add('noContactByClass',item.klass,1);
      else add('meleeCloseByClass',item.klass,item.time);
    }
    for(const [id,data] of Object.entries(game.bySource)){
      // A lista de classes acompanha a ordem do roster da batalha.
      const index=Number(id.slice(1));
      const actualClass=game.classes[index];
      add('damageByClass',actualClass,data.damage);
      add('shieldByClass',actualClass,data.absorbed);
      add('meleeHitsByClass',actualClass,data.melee);
      add('rangedHitsByClass',actualClass,data.ranged);
      add('skillsByClass',actualClass,data.talents);
    }
  }
  out.avgSeconds=+(out.time/out.games).toFixed(1);
  out.avgFirstKO=+(out.firstKO/out.games).toFixed(1);
  delete out.time;delete out.firstKO;
  for(const key of ['damageByClass','shieldByClass','meleeHitsByClass','rangedHitsByClass','skillsByClass','meleeCloseByClass']){
    for(const [klass,v] of Object.entries(out[key])){
      out[key][klass]=+(v/(key==='meleeCloseByClass'?Math.max(1,
        matrix.reduce((n,g)=>n+g.close.filter(f=>f.klass===klass&&f.time!==null).length,0)):out.games)).toFixed(2);
    }
  }
  return out;
}
function scenario(label,builders){
  const games=builders.map(({classes,seed,variants,navigationMode},i)=>{
    const g=measure(classes,seed,variants,i===0,navigationMode);
    g.classes=classes;return g;
  });
  console.log('E TANK BENCHMARK '+label+' '+JSON.stringify(aggregate(games)));
  return games;
}
const duelPairs=[['warrior','hunter'],['guardian','hunter'],['warrior','mage'],['guardian','mage']];
for(const [melee,ranged] of duelPairs){
  const builders=[];
  for(let i=0;i<12;i++){
    builders.push({classes:i%2?[ranged,melee]:[melee,ranged],
      variants:i%3?[i%11,(i+3)%11]:[0,0],seed:73001+2297*i});
  }
  scenario(melee+' x '+ranged,builders);
}
for(const n of [4,30]){
  const builders=[];
  for(let i=0;i<(n===30?16:20);i++){
    const classes=Array.from({length:n},(_,j)=>CLASSES[(j+i)%4]);
    builders.push({classes,variants:classes.map((_,j)=>(j+i*2)%11),seed:51117+i*1601});
  }
  scenario(n+' heroes / builds e spawns rotacionados',builders);
}
// Same-roster observation for obstacle steering; not an automatic balance gate.
for(const [melee,ranged] of [['warrior','hunter'],['guardian','hunter'],['guardian','mage']]){
 const builders=[];
 for(let i=0;i<12;i++)builders.push({classes:i%2?[ranged,melee]:[melee,ranged],
  variants:i%3?[i%11,(i+3)%11]:[0,0],seed:73001+2297*i,navigationMode:'steer'});
 scenario('STEER '+melee+' x '+ranged,builders);
}
for(const n of [4,30]){
 const builders=[];
 for(let i=0;i<12;i++){
  const classes=Array.from({length:n},(_,j)=>CLASSES[(j+i)%4]);
  builders.push({classes,variants:classes.map((_,j)=>(j+i*2)%11),seed:51117+i*1601,
   navigationMode:'steer'});
 }
 scenario('STEER '+n+' heroes',builders);
}
console.log('PASS Fase E tank diagnostics: determinismo, limites, 4/30 e confrontos pareados. Estatística diagnóstica, NÃO aprovação de fairness.');

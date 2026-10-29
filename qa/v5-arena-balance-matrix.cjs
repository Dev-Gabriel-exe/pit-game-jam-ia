'use strict';
/* Arena V5 balance matrix: compare 30-player FFA (incl. rotated positions,
   varied attribute/talent builds) and small 4-player matches, M5 and M10.
   Tests legacy engine, not Phase 2's planned 120 talents. No random winner fixing.
*/
const assert=require('node:assert/strict');
const CORE=require('../v5/hero-core.js');
const CLASSES=['warrior','mage','hunter','guardian'];
const PROFILES={
 warrior:[[7,1,0,2],[3,3,0,4],[1,5,0,4]],
 mage:[[0,0,8,2],[0,1,6,3],[0,3,4,3]],
 hunter:[[6,3,0,1],[3,5,0,2],[1,5,0,4]],
 guardian:[[4,1,0,5],[1,2,0,7],[0,5,0,5]]
};
const PICKS={
 warrior:[{fury:2,stamina:3},{fury:1,guardbreak:1,leech:1,stamina:2},{stamina:3,fury:2}],
 mage:[{rune:2,ward:3},{rune:1,nova:1,ward:3},{ward:3,focus:1,rune:1}],
 hunter:[{precision:2,dash:3},{precision:2,multishot:2,dash:1},{dash:2,trap:1,precision:2}],
 guardian:[{bulwark:2,heal:3},{bulwark:2,taunt:1,thorn:1,heal:1},{heal:2,aegis:1,bulwark:2}]
};
function makeRoster(mission,count,rotation,scenario){
 const xp=mission*100, factor=mission===10?2:1, budget=CORE.budgets(xp);
 return Array.from({length:count},(_,i)=>{
  const klass=CLASSES[(i+rotation)%4],b=CORE.seedBuild(klass+'_'+i,klass);
  const index=scenario==='varied'?Math.floor(i/4+rotation)%3:scenario==='offmeta'?((i*5+rotation)%3):0;
  const v=PROFILES[klass][index];
  for(let k=0;k<4;k++)b.attributes[['power','agility','spirit','vitality'][k]]=v[k]*factor;
  if(scenario!=='baseline'){
   const talents=PICKS[klass][index],keys=Object.keys(talents);
   let left=budget.talents;
   for(const k of keys){
    const n=Math.min(left,talents[k]);
    if(n>0)b.talents[k]=n;
    left-=n;
   }
   // Honor legacy prerequisites even in M5 with only 2 points.
   let source=CORE.TALENTS[klass];
   for(const talent of source){
    if(b.talents[talent.id]&&talent.requires.some(req=>!b.talents[req])){
     b.talents[talent.id]=0;
    }
   }
  }
  const result=CORE.canonical(b,b.name,xp);
  return {...result,id:'arena-test-'+i,name:b.name};
 });
}
const modes=[
 {name:'offensive-archetypes',count:30,scenario:'baseline',seeds:32},
 {name:'rotated-mixed-builds',count:30,scenario:'varied',seeds:48},
 {name:'adverse-builds',count:30,scenario:'offmeta',seeds:32},
 {name:'four-player',count:4,scenario:'varied',seeds:48}
];
const violations=[];
for(const mode of modes){
 for(const mission of [5,10]){
  const wins=Object.fromEntries(CLASSES.map(x=>[x,0])),kills=Object.fromEntries(CLASSES.map(x=>[x,0])),damage=Object.fromEntries(CLASSES.map(x=>[x,0]));
  const winnerIds=new Set(),finishReasons={};
  for(let i=0;i<mode.seeds;i++){
   const seed=(mission*991+mode.count*713+i*19357)>>>0;
   const lineup=makeRoster(mission,mode.count,i%4,mode.scenario);
   const sim=CORE.battle(lineup,{seed,arenaScale:4.4,limit:95}); // matches the actual V5 lab's 4/30-player map
   const result=sim.run(2500);
   assert(result.finished&&result.winner,'no winner '+mode.name+'/'+mission+'/'+i);
   wins[result.winner.klass]++;winnerIds.add(result.winner.id);
   const finish=result.events.filter(e=>e.type==='end').at(-1)?.reason||'unknown';
   finishReasons[finish]=(finishReasons[finish]||0)+1;
   for(const f of result.standings){kills[f.klass]+=f.kills;damage[f.klass]+=f.damage}
   // Positive defensive/attack effect is never faked in UI: all from core.
   assert(result.events.some(e=>e.type==='hit'),'No hits in '+mode.name);
   assert(result.events.some(e=>e.type==='knockout'||e.type==='storm'),'No elimination in '+mode.name);
  }
  const ordered=Object.fromEntries(CLASSES.map(c=>[c,wins[c]]));
  const totalDamage=Object.fromEntries(CLASSES.map(c=>[c,Math.round(damage[c])]));
  console.log('BALANCE MATRIX '+mode.name+' M'+mission+' '+JSON.stringify({wins:ordered,uniqueWinners:winnerIds.size,kills,damage:totalDamage,finishReasons}));
  assert(winnerIds.size>=Math.min(3,mode.seeds),'Winners always same ID: '+mode.name+'/'+mission);
  // This workshop has ~30 students. The 30-player game is the release gate:
  // no class can take >60% of wins under varied builds. Four-player mode
  // is a spectator preview with a different metagame: report its deficiencies
  // explicitly, do not silently calibrate the main game for only 4 fighters.
  if(mode.count===30&&Math.max(...Object.values(wins))>Math.ceil(mode.seeds*.60))
   violations.push('One class dominates '+mode.name+' M'+mission+': '+JSON.stringify(wins));
  if(mode.count===30&&Object.values(wins).filter(v=>v>0).length<3)
   violations.push('Too few viable classes '+mode.name+' M'+mission+': '+JSON.stringify(wins));
  if(mode.count===4&&Math.max(...Object.values(wins))>Math.ceil(mode.seeds*.60))
   console.warn('KNOWN 4-HERO BALANCE WARNING '+mode.name+' M'+mission+' '+JSON.stringify(wins));
 }
}
assert.deepEqual(violations,[],'Balance matrix violations: '+violations.join(' | '));
console.log('PASS V5 balance matrix across spawn order, attribute builds, legacy talent choices and both milestones');

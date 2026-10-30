'use strict';
/* H.3 / M10: balanced, paired entry-order/spawn-slot crossover.
 * Same 30 or 4 fictional fighters, immutable builds and seed within a
 * crossover block. Cyclically rotate entries through EVERY slot exactly once.
 * IMPORTANT: engine binds spawn position AND update/RNG order to array index.
 * This is a SLOT/ORDER test, NOT a pure geometric-spawn causal experiment.
 * No gameplay tuning, browser, accounts, XP or production integration.
 *
 * node qa/v5-m10-paired-spawn.cjs
 * M10_PAIRED_REPORT_FILE=/tmp/paired.json node qa/v5-m10-paired-spawn.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const SEEDS=[20261030,4175863657,123456789,8675309,10007,65537,987654321,31415926];
const CONFIG={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
const round=(n,d=3)=>Number(n.toFixed(d));
const counts=(names)=>Object.fromEntries(names.map(k=>[k,0]));
const scenarios=[
 {name:'quatro-equilibrado',count:4,allocation:[1,1,1,1],seedCount:8},
 {name:'trinta-equilibrado',count:30,allocation:[8,8,7,7],seedCount:4},
 {name:'trinta-guardiao-50pct',count:30,allocation:[5,5,5,15],seedCount:4}
];
function interleave(allocation){
 const remaining=allocation.slice(),out=[];
 while(remaining.some(x=>x>0)){
  for(let k=0;k<CLASSES.length;k++){
   if(remaining[k]>0){out.push(CLASSES[k]);remaining[k]--;}
  }
 }
 assert.equal(out.length,allocation.reduce((a,b)=>a+b,0));
 return out;
}
function entryFor(klass,heroIndex,seedIndex,scenarioIndex){
 const name='trial-paired-'+scenarioIndex+'-'+heroIndex;
 const variant=(heroIndex*7+seedIndex*3+scenarioIndex*5)%11;
 const m5=P.exampleBuild(klass,name,5,variant);
 const m10=P.exampleBuild(klass,name,10,variant,{experimentalFinal:true});
 const candidate={rosterKey:name,klass,completedMissions:APPROVALS,
  build:{attributes:m10.attributes,talents:m10.talents},
  m5Entered:true,m5Frozen:{attributes:m5.attributes,talents:m5.talents},
  m10Locked:true};
 const checked=policy.m10ArenaAdapter(candidate);
 assert.equal(checked.build.talents.length,10);
 assert.equal(Object.values(checked.build.attributes).reduce((a,b)=>a+b,0),20);
 return Object.freeze({...checked,id:name});
}
function rotate(list,by){return list.map((_,i)=>list[(i+by)%list.length]);}
function sha(result){return crypto.createHash('sha256').update(JSON.stringify(result)).digest('hex').slice(0,20);}
const report={schema:'v5-m10-paired-slot-order-v1',kind:'synthetic-crossover-diagnostic',
 date:'2026-10-30',engineVersion:P.VERSION,config:CONFIG,
 design:'Within each block, all fixed identities/builds visit all slots once. Same seed; only entry order changes.',
 scenarios:[],replays:[],alerts:[],limitations:[
  'The engine couples geometric spawn, turn/update order and per-index RNG draws; a slot effect cannot be attributed to geometry alone.',
  'This is a deterministic synthetic experiment, not a statistical proof of fairness or class balance.',
  'No M10 3D rendering, GPU, network, auth, real students, school PC performance or V3 integration.',
  'Changing the entry order can change the random-number stream consumed by each identity; seed is fixed, not per-hero RNG.'
 ]};
let games=0,allEvents=0,talentEvents=0,timeLimits=0;
for(let scenarioIndex=0;scenarioIndex<scenarios.length;scenarioIndex++){
 const sc=scenarios[scenarioIndex],baseClasses=interleave(sc.allocation);
 const out={name:sc.name,count:sc.count,allocation:sc.allocation,
  blocks:sc.seedCount,rotationsPerBlock:sc.count,games:0,
  appearances:counts(CLASSES),wins:counts(CLASSES),
  expectedWins:counts(CLASSES),winsBySlot:Array(sc.count).fill(0),
  exposureBySlot:Object.fromEntries(CLASSES.map(k=>[k,Array(sc.count).fill(0)])),
  winsByIdentity:{},meanTime:0,timeLimitGames:0,firstRotationWinners:[]};
 for(let si=0;si<sc.seedCount;si++){
  const seed=(SEEDS[si]+sc.count*7919+scenarioIndex*104729)>>>0;
  const entries=baseClasses.map((klass,i)=>entryFor(klass,i,si,scenarioIndex));
  const idToClass=new Map(entries.map(e=>[e.id,e.build.klass]));
  const expectedIdentitySlots=new Map(entries.map(e=>[e.id,new Set()]));
  const opts={...CONFIG,seed};
  for(let rotation=0;rotation<sc.count;rotation++){
   const arranged=rotate(entries,rotation);
   for(let slot=0;slot<sc.count;slot++){
    const e=arranged[slot];
    assert(!expectedIdentitySlots.get(e.id).has(slot),'identity repeated a slot');
    expectedIdentitySlots.get(e.id).add(slot);
    out.exposureBySlot[e.build.klass][slot]++;
   }
   const battle=P.battle(arranged,opts).run();
   assert(battle.finished&&battle.winner,'M10 must finish');
   assert.equal(battle.standings.length,sc.count);
   assert.equal(battle.events.filter(e=>e.type==='end').length,1);
   assert(battle.time>0&&battle.time<=95.05);
   const winner=battle.winner,slot=arranged.findIndex(e=>e.id===winner.id);
   assert(slot>=0,'winner must be an arranged fighter');
   assert.equal(winner.klass,idToClass.get(winner.id));
   out.wins[winner.klass]++;out.winsBySlot[slot]++;
   out.winsByIdentity[winner.id]=(out.winsByIdentity[winner.id]||0)+1;
   out.meanTime+=battle.time;out.games++;games++;
   allEvents+=battle.events.length;
   talentEvents+=battle.events.filter(e=>e.type==='talent').length;
   if(battle.events.find(e=>e.type==='end').reason==='time-limit'){
    out.timeLimitGames++;timeLimits++;
   }
   if(rotation===0)out.firstRotationWinners.push({seed,winnerClass:winner.klass,slot});
   if(si===0&&(rotation===0||rotation===sc.count-1)){
    const replay=P.battle(arranged,opts).run();
    assert.deepEqual(replay,battle,'replay must match every event and outcome');
    report.replays.push({scenario:sc.name,seed,rotation,sha256:sha(battle)});
   }
  }
  for(const slots of expectedIdentitySlots.values())
   assert.equal(slots.size,sc.count,'every identity must visit every slot exactly once');
 }
 assert.equal(out.games,sc.count*sc.seedCount);
 for(let k=0;k<CLASSES.length;k++){
  out.appearances[k]=sc.allocation[CLASSES.indexOf(k)]*out.games;
  out.expectedWins[k]=round(out.games*sc.allocation[CLASSES.indexOf(k)]/sc.count);
  // Full rotations guarantee exact exposure balance at EACH slot.
  for(let slot=0;slot<sc.count;slot++)
   assert.equal(out.exposureBySlot[k][slot],sc.allocation[CLASSES.indexOf(k)]*sc.seedCount);
 }
 assert.equal(out.winsBySlot.reduce((a,b)=>a+b,0),out.games);
 assert.equal(Object.values(out.wins).reduce((a,b)=>a+b,0),out.games);
 out.meanTime=round(out.meanTime/out.games,1);
 out.winVsExposure=Object.fromEntries(CLASSES.map(k=>[k,round(out.wins[k]/out.expectedWins[k])]));
 out.slotWinsHalf=round(out.winsBySlot.slice(0,Math.floor(sc.count/2)).reduce((a,b)=>a+b,0)/out.games);
 out.topIdentityWinCount=Math.max(...Object.values(out.winsByIdentity));
 if(out.winVsExposure.guardian>=1.5)
  report.alerts.push(sc.name+': guardian win/exposure='+out.winVsExposure.guardian+'; inspect class effects after balanced slot exposure');
 if(sc.count===4&&(out.winsBySlot[1]+out.winsBySlot[2])/out.games>.7)
  report.alerts.push(sc.name+': slots 1+2 win >70% even with full rotations; slot/order bias remains plausible');
 if(sc.count===30&&out.topIdentityWinCount>out.games*.2)
  report.alerts.push(sc.name+': a single fixed build/identity wins >20%; inspect build dependence');
 report.scenarios.push(out);
}
assert.equal(games,8*4+4*30+4*30);
assert.equal(report.scenarios.reduce((a,b)=>a+b.games,0),games);
report.totals={games,allEvents,talentEvents,timeLimitGames:timeLimits,
 fullCrossoverBlocks:8+4+4,exactReplays:report.replays.length};
if(process.env.M10_PAIRED_REPORT_FILE){
 const output=path.resolve(process.env.M10_PAIRED_REPORT_FILE);
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 PAIRED REPORT '+JSON.stringify(report));
console.log('PASS M10 paired slot/order crossover: '+games+' M10 games, every fixed build visited every slot per seed, '+report.replays.length+' bit-identical replays, no engine or M5 changes.');

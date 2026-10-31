'use strict';
/* H.3 / M10: reproducible balance observations, NOT a balance certification.
 * No student data, network, auth, XP writes, browser or production integration.
 * Run: node qa/v5-m10-balance-matrix.cjs
 * Optional: M10_REPORT_FILE=/tmp/m10-balance.json node qa/v5-m10-balance-matrix.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const LABEL={warrior:'Guerreiro',mage:'Arcanista',hunter:'Caçador',guardian:'Guardião'};
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const SEEDS=[20261030,4175863657,123456789,8675309,10007,65537,987654321,31415926];
const SCENARIOS=[
 {name:'equilibrado',weights:[1,1,1,1]},
 {name:'guerreiro-dominante',weights:[3,1,1,1]},
 {name:'arcanista-dominante',weights:[1,3,1,1]},
 {name:'cacador-dominante',weights:[1,1,3,1]},
 {name:'guardiao-dominante',weights:[1,1,1,3]}
];
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
const round=(x,d=3)=>+x.toFixed(d);
function roster(count,weights,rotation){
 const pool=[];
 if(count===4){
  // For skewed 4-player battles, all four classes cannot be represented
  // simultaneously while also being skewed. Report actual exposure instead.
  const heavy=weights.indexOf(3);
  const allocation=heavy<0?[1,1,1,1]:CLASSES.map((_,i)=>i===heavy?2:i===(heavy+1)%4?0:1);
  for(let i=0;i<4;i++)for(let j=0;j<allocation[i];j++)pool.push(CLASSES[i]);
 }else{
  const allocation=weights[0]===1&&weights.every(w=>w===1)?[8,8,7,7]:
   weights.map(w=>w===3?15:5);
  assert.equal(allocation.reduce((a,b)=>a+b,0),30);
  for(let i=0;i<4;i++)for(let j=0;j<allocation[i];j++)pool.push(CLASSES[i]);
 }
 // Deterministic interleaving and rotation avoids putting all of one class
 // next to each other in spawn order; no result is altered or selected.
 const ordered=[];
 while(pool.length){for(let k=0;k<CLASSES.length;k++){
  const idx=pool.indexOf(CLASSES[(k+rotation)%4]);
  if(idx!==-1)ordered.push(pool.splice(idx,1)[0]);
 }}
 return ordered;
}
function buildEntry(klass,slot,seedIndex,scenarioIndex){
 const variant=(slot*7+seedIndex*3+scenarioIndex*5)%11;
 const name='trial-'+klass+'-'+slot;
 const m5=P.exampleBuild(klass,name,5,variant);
 const m10=P.exampleBuild(klass,name,10,variant,{experimentalFinal:true});
 const c={rosterKey:name,klass,completedMissions:APPROVALS,
  build:{attributes:m10.attributes,talents:m10.talents},
  m5Entered:true,m5Frozen:{attributes:m5.attributes,talents:m5.talents},
  m10Locked:true};
 const entry=policy.m10ArenaAdapter(c);
 assert.equal(entry.approvedMissions,10);
 assert.equal(entry.build.talents.length,10);
 assert.equal(Object.values(entry.build.attributes).reduce((a,b)=>a+b,0),20);
 assert.deepEqual(entry.build.talents.slice(0,5),m5.talents);
 return {entry:{...entry,id:name},variant};
}
function tally(){
 return Object.fromEntries(CLASSES.map(c=>[c,{appearances:0,wins:0,
  expectedWins:0,damage:0,finalHp:0,kills:0,talentEvents:0,selected:new Set(),
  activated:new Set(),variants:new Set()}]));
}
const totals=tally(),byScenario={},bySize={},slotWins={4:{},30:{}};
let battleCount=0,timeSum=0,timeLimitCount=0,allEvents=0,allTalentEvents=0;
let minTime=Infinity,maxTime=0;
const replayHashes=[];
function runScenario(scenario,scenarioIndex,count,seed,seedIndex){
 const ordered=roster(count,scenario.weights,(seedIndex+scenarioIndex)%4);
 const entries=ordered.map((klass,i)=>{
  const {entry,variant}=buildEntry(klass,i,seedIndex,scenarioIndex);
  totals[klass].variants.add(variant);
  return entry;
 });
 const opts={...OPTIONS,seed};
 const battle=P.battle(entries,opts).run();
 assert.equal(battle.finished,true,'M10 precisa encerrar: '+scenario.name+'/'+count+'/'+seed);
 assert(battle.winner&&entries.some(e=>e.id===battle.winner.id));
 assert.equal(battle.standings.length,count);
 assert.equal(battle.events.filter(e=>e.type==='end').length,1);
 assert(battle.events.some(e=>e.type==='talent'),'nenhum talento foi acionado');
 assert(battle.time>0&&battle.time<=95.05);
 const winner=entries.find(e=>e.id===battle.winner.id);
 const slot=entries.indexOf(winner);
 const end=battle.events.findLast(e=>e.type==='end');
 const key=scenario.name;
 const group=byScenario[key]??={games:0,counts:{4:0,30:0},wins:Object.fromEntries(CLASSES.map(c=>[c,0])),
  timeLimit:0,meanTime:0};
 const size=bySize[count]??={games:0,wins:Object.fromEntries(CLASSES.map(c=>[c,0])),
  appearances:Object.fromEntries(CLASSES.map(c=>[c,0])),
  expectedWins:Object.fromEntries(CLASSES.map(c=>[c,0])),
  meanTime:0,timeLimit:0};
 group.games++;group.counts[count]++;group.wins[winner.build.klass]++;
 size.games++;size.wins[winner.build.klass]++;
 group.meanTime+=battle.time;size.meanTime+=battle.time;
 if(end.reason==='time-limit'){timeLimitCount++;group.timeLimit++;size.timeLimit++;}
 slotWins[count][slot]=(slotWins[count][slot]||0)+1;
 const fighterClass=Object.fromEntries(entries.map(e=>[e.id,e.build.klass]));
 const byId=new Map(entries.map(e=>[e.id,e]));
 const talentEvents=battle.events.filter(e=>e.type==='talent');
 for(const event of talentEvents){
  if(!event.hero||!fighterClass[event.hero])continue;
  const stat=totals[fighterClass[event.hero]];
  stat.talentEvents++;
  if(event.talent)stat.activated.add(event.talent);
 }
 for(const fighter of battle.standings){
  const klass=fighter.klass,stat=totals[klass];
  assert.equal(klass,fighterClass[fighter.id]);
  assert(Number.isFinite(fighter.hp)&&Number.isFinite(fighter.damage)&&Number.isFinite(fighter.kills));
  assert(fighter.damage>=0&&fighter.kills>=0);
  stat.appearances++;stat.damage+=fighter.damage;
  stat.finalHp+=fighter.hp;stat.kills+=fighter.kills;
  for(const id of byId.get(fighter.id).build.talents)stat.selected.add(id);
 }
 totals[winner.build.klass].wins++;
 for(const klass of CLASSES){
  const n=ordered.filter(x=>x===klass).length;
  totals[klass].expectedWins+=n/count;
  size.appearances[klass]+=n;
  size.expectedWins[klass]+=n/count;
 }
 battleCount++;timeSum+=battle.time;minTime=Math.min(minTime,battle.time);
 maxTime=Math.max(maxTime,battle.time);allEvents+=battle.events.length;
 allTalentEvents+=talentEvents.length;
 // Repeat representative fixed cases in full: winner, positions, damage,
 // events and random effects must remain identical with same seed/entries.
 if(seedIndex===0&&scenarioIndex===0){
  const replay=P.battle(entries,opts).run();
  assert.deepEqual(replay,battle,'M10 replay must be bit-identical');
  replayHashes.push({count,seed,sha256:crypto.createHash('sha256')
   .update(JSON.stringify(battle)).digest('hex').slice(0,20)});
 }
}
for(let si=0;si<SCENARIOS.length;si++){
 const scenario=SCENARIOS[si];
 for(const count of [4,30]){
  for(let i=0;i<SEEDS.length;i++){
   const seed=(SEEDS[i]+count*7919+si*104729)>>>0;
   runScenario(scenario,si,count,seed,i);
  }
 }
}
assert.equal(battleCount,SCENARIOS.length*2*SEEDS.length);
assert.equal(Object.values(totals).reduce((sum,x)=>sum+x.wins,0),battleCount);
const summary=Object.fromEntries(CLASSES.map(klass=>{
 const s=totals[klass],expected=s.expectedWins;
 return [klass,{label:LABEL[klass],appearances:s.appearances,wins:s.wins,
  expectedWins:round(expected),winVsExposure:round(s.wins/expected),
  damagePerAppearance:round(s.damage/s.appearances,1),
  finalHpPerAppearance:round(s.finalHp/s.appearances,1),
  killsPerAppearance:round(s.kills/s.appearances,2),
  talentEvents:s.talentEvents,selectedTalentCount:s.selected.size,
  activatedTalentCount:s.activated.size,variantsTested:s.variants.size}];
}));
const alerts=[];
for(const [klass,s] of Object.entries(summary)){
 if(s.expectedWins>=5&&(s.winVsExposure>2||s.winVsExposure<.3))
  alerts.push(klass+': wins/expected='+s.winVsExposure+' (possible imbalance, not proof)');
 if(s.variantsTested!==11)alerts.push(klass+': incomplete build-variant coverage');
}
if(timeLimitCount/battleCount>.25)
 alerts.push('time-limit >25% of trials; review endgame readability and storm');
for(const s of Object.values(byScenario))s.meanTime=round(s.meanTime/s.games,1);
for(const [count,s] of Object.entries(bySize)){
 s.meanTime=round(s.meanTime/s.games,1);
 s.winVsExposure=Object.fromEntries(CLASSES.map(c=>[c,
  round(s.wins[c]/s.expectedWins[c])]));
 s.expectedWins=Object.fromEntries(CLASSES.map(c=>[c,round(s.expectedWins[c])]));
 for(const c of CLASSES){
  if(s.expectedWins[c]>=5&&(s.winVsExposure[c]>2||s.winVsExposure[c]<.3))
   alerts.push('M10 '+count+' fighters / '+LABEL[c]+': wins='+s.wins[c]+
    ' vs expected='+s.expectedWins[c]+' (exposure-adjusted ratio='+
    s.winVsExposure[c]+'; inspect before tuning)');
 }
}
if((slotWins[4][1]||0)+(slotWins[4][2]||0)>battleCount/2*.7)
 alerts.push('M10 4 fighters: slots 1+2 win >70%; possible spawn/class confounding, investigate controlled permutations');
const report={schema:'v5-m10-balance-matrix-v1',kind:'isolated-laboratory-observations',
 date:'2026-10-30',engineVersion:P.VERSION,configuration:OPTIONS,
 seeds:SEEDS.length,scenarios:SCENARIOS.map(x=>x.name),
 games:battleCount,totalFighters:Object.values(totals).reduce((n,x)=>n+x.appearances,0),
 meanTime:round(timeSum/battleCount,1),minTime:round(minTime,1),
 maxTime:round(maxTime,1),timeLimitGames:timeLimitCount,
 totalEvents:allEvents,totalTalentEvents:allTalentEvents,
 classes:summary,byScenario,bySize,slotWins,replayHashes,alerts,
 limitations:['Small synthetic sample; no statistical certification or tuning.',
  'Some talents are passive/reactive and cannot be certified by talent events alone.',
  'No WebGL, GLB animation, camera, school-PC FPS, auth or real students tested.',
  'Results are deterministic for fixed seeds; class exposure is unequal in skewed rosters.']};
if(process.env.M10_REPORT_FILE){
 const output=path.resolve(process.env.M10_REPORT_FILE);
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 MATRIX REPORT '+JSON.stringify(report));
console.log('PASS M10 balance diagnostics: '+battleCount+' completed battles, 4/30 players, 5 compositions, 8 seeds, all 11 variants/class, 2 exact replays; no gameplay changes.');

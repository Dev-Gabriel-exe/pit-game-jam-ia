'use strict';
// H.3/M10: paired, synthetic Guardian-scarce survival/position diagnostic.
// This is observation only. No combat rules, XP, students or M5 are changed.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const ALLOCATION=[10,10,8,2];
const SEEDS=[901013,811027,671231,990197,412351,772001];
const ARCHETYPES={
 defensive:['G01','G10','J08','G05','J01','J03','G04'],
 mixed:['G01','G10','J08','L01','J01','J03','L08']
};
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2',limit:120};
function interleave(allocation){
 const left=[...allocation],out=[];
 while(left.some(n=>n>0))for(let i=0;i<left.length;i++)if(left[i]>0){
  out.push(CLASSES[i]);left[i]--;
 }
 return out;
}
function rotate(xs,shift){return xs.map((_,i)=>xs[(i+shift)%xs.length]);}
function entry(klass,slot,variant,kind,seedIndex){
 const id='trial-m10-survival-'+kind+'-'+seedIndex+'-'+slot;
 const m5=P.exampleBuild(klass,id,5,variant);
 const m10=P.exampleBuild(klass,id,10,variant,{experimentalFinal:true});
 let talents=m10.talents;
 if(klass==='guardian'){
  talents=[...m5.talents];
  for(const t of ARCHETYPES[kind])if(!talents.includes(t)&&talents.length<10)talents.push(t);
  for(const t of P.TALENTS.guardian.map(x=>x.id))
   if(!talents.includes(t)&&talents.length<10)talents.push(t);
  assert(talents.includes('G01')&&talents.includes('G10'));
 }
 const adapted=policy.m10ArenaAdapter({rosterKey:id,klass,
  completedMissions:APPROVALS,
  build:{attributes:m10.attributes,talents},m5Entered:true,
  m5Frozen:{attributes:m5.attributes,talents:m5.talents},m10Locked:true});
 assert.equal(adapted.build.talents.length,10);
 assert.equal(Object.values(adapted.build.attributes).reduce((s,n)=>s+n,0),20);
 assert.deepEqual(adapted.build.talents.slice(0,5),m5.talents);
 return {...adapted,id};
}
function positions(game){
 return Object.fromEntries(game.fighters.map(f=>[f.id,{x:f.x,z:f.z,face:f.face}]));
}
function swappedPositions(game){
 const p=positions(game),guard=game.fighters.filter(f=>f.build.klass==='guardian');
 const hunters=game.fighters.filter(f=>f.build.klass==='hunter');
 assert.equal(guard.length,2);
 const swaps=[],used=new Set();
 for(const g of guard){
  const h=hunters.filter(f=>!used.has(f.id))
   .sort((a,b)=>Math.hypot(b.x-g.x,b.z-g.z)-Math.hypot(a.x-g.x,a.z-g.z))[0];
  used.add(h.id);
  const old=p[g.id];p[g.id]=p[h.id];p[h.id]=old;
  swaps.push({guardian:g.id,hunter:h.id});
 }
 return {positions:p,swaps};
}
function invariant(game){
 return game.fighters.map(f=>({id:f.id,klass:f.build.klass,build:f.build,
  stats:f.stats,hp:f.hp,basic:f.basic,shield:f.shield}));
}
function observe(game){
 const fighters=game.fighters;
 const initial=Object.fromEntries(fighters.map(f=>[f.id,{
  klass:f.build.klass,initialHp:f.stats.hp,initialRadius:Math.hypot(f.x,f.z),
  firstCombat:null,combatHpHit:0,shieldAbsorbed:0,healed:0,
  stormOutsideTicks:0,stormOutsideSeconds:0,stormDeath:false,
  hpAt35:null,hpAt65:null,aliveAt35:null,aliveAt65:null
 }]));
 const seen=new Set();
 let ticks=0;
 while(!game.finished&&ticks<3000){
  const step=game.update(.05);
  ticks++;
  for(const e of step.events){
   if(e.type==='hit'){
    const t=initial[e.target];
    if(t){t.combatHpHit+=e.amount||0;t.shieldAbsorbed+=e.absorbed||0;
     if(t.firstCombat===null)t.firstCombat=e.time;}
    if(initial[e.hero]&&initial[e.hero].firstCombat===null)
     initial[e.hero].firstCombat=e.time;
   }else if(e.type==='heal'&&initial[e.hero]){
    initial[e.hero].healed+=e.amount||0;
   }else if(e.type==='storm'&&initial[e.target]){
    initial[e.target].stormDeath=true;
   }
  }
  // Geometry-based storm exposure proxy. NOT measured storm HP damage.
  for(const f of fighters)if(f.alive&&Math.hypot(f.x,f.z)>step.radius+1e-9){
   initial[f.id].stormOutsideTicks++;
   initial[f.id].stormOutsideSeconds+=.05;
  }
  for(const mark of [35,65])if(!seen.has(mark)&&game.time+1e-7>=mark){
   seen.add(mark);
   for(const f of fighters){
    initial[f.id]['hpAt'+mark]=+f.hp.toFixed(2);
    initial[f.id]['aliveAt'+mark]=f.alive;
   }
  }
 }
 const result=game.result();
 assert(result.finished&&result.winner,'All trials must end with a winner');
 assert.equal(result.events.filter(e=>e.type==='end').length,1);
 const records=fighters.map(f=>{
  const t=initial[f.id];
  const survived=f.eliminatedAt===null?result.time:f.eliminatedAt;
  assert(Number.isFinite(survived)&&survived>=0);
  return {...t,id:f.id,survivalSeconds:+survived.toFixed(2),
   finalHp:+f.hp.toFixed(2),eliminated:f.eliminatedAt!==null,
   stormOutsideSeconds:+t.stormOutsideSeconds.toFixed(2),
   combatHpHit:+t.combatHpHit.toFixed(2),
   shieldAbsorbed:+t.shieldAbsorbed.toFixed(2),
   healed:+t.healed.toFixed(2)};
 });
 const guardians=records.filter(r=>r.klass==='guardian');
 const total=(key)=>+guardians.reduce((s,r)=>s+r[key],0).toFixed(2);
 return {winner:result.winner.klass,winnerId:result.winner.id,
  duration:result.time,timeLimit:result.events.some(e=>e.type==='end'&&e.reason==='time-limit'),
  guardians:{initialHp:total('initialHp'),survivalSeconds:total('survivalSeconds'),
   combatHpHit:total('combatHpHit'),shieldAbsorbed:total('shieldAbsorbed'),
   healed:total('healed'),stormOutsideSeconds:total('stormOutsideSeconds'),
   stormDeaths:guardians.filter(r=>r.stormDeath).length,
   alive35:guardians.filter(r=>r.aliveAt35).length,
   alive65:guardians.filter(r=>r.aliveAt65).length,
   firstCombatSeconds:guardians.map(r=>r.firstCombat),
   individual:guardians.map(r=>({id:r.id,initialHp:r.initialHp,
    initialRadius:+r.initialRadius.toFixed(2),survivalSeconds:r.survivalSeconds,
    shieldAbsorbed:r.shieldAbsorbed,combatHpHit:r.combatHpHit,
    healed:r.healed,stormOutsideSeconds:r.stormOutsideSeconds,
    stormDeath:r.stormDeath,firstCombat:r.firstCombat}))},
  allStormDeaths:records.filter(r=>r.stormDeath).length};
}
const report={schema:'v5-m10-guardian-scarce-survival-v1',synthetic:true,
 scope:'M10 two Guardians among 30; paired Guardian/Hunter spawn swaps',
 options:OPTIONS,allocation:ALLOCATION,seedCount:SEEDS.length,
 scenarios:[],limitations:[
  'Spawn swaps alter subsequent targeting and RNG consumption; paired outcomes are not a single-variable causal estimate.',
  'Storm exposure is sampled outside-ring time of survivors, NOT actual storm HP damage.',
  'Combat HP hits are emitted rounded impacts, not exact capped HP loss on lethal hits.',
  'Repeated archetypes and deterministic seeds are not representative of real student builds.',
  'G.2 physical PCs, real students, H.1/H.2, main and production remain blocked.'
 ]};
let pairs=0,games=0,replays=0,changed=0;
for(const [kindIndex,kind] of Object.keys(ARCHETYPES).entries()){
 const group={archetype:kind,pairs:0,guardianWins:{baseline:0,swapped:0},
  changedWinnerIds:0,totals:{baseline:{},swapped:{}},pairDeltas:[]};
 for(let k=0;k<SEEDS.length;k++)for(const shift of [0,15]){
  const classes=rotate(interleave(ALLOCATION),shift);
  const entries=classes.map((klass,i)=>entry(klass,i,
   (i*9+k*5+kindIndex*3)%11,kind,k));
  const seed=(SEEDS[k]+shift*65537+kindIndex*104729)>>>0;
  const opts={...OPTIONS,seed,experimentalCritSeed:(seed^0xdecafbad)>>>0};
  const first=P.battle(entries,opts),initial=invariant(first);
  const {positions:spawn,swaps}=swappedPositions(first);
  const alternate=P.battle(entries,{...opts,experimentalSpawnPositions:spawn});
  assert.deepEqual(invariant(alternate),initial,
   'Spawn swap must not alter initial HP, builds, attributes, talents or RNG');
  const originalPositions=positions(first);
  assert(swaps.every(({guardian,hunter})=>
   JSON.stringify(spawn[guardian])===JSON.stringify(originalPositions[hunter])&&
   JSON.stringify(spawn[hunter])===JSON.stringify(originalPositions[guardian])));
  const baseline=observe(first),swapped=observe(alternate);
  assert.equal(baseline.guardians.initialHp,swapped.guardians.initialHp);
  for(const [name,m] of [['baseline',baseline],['swapped',swapped]]){
   group.guardianWins[name]+=Number(m.winner==='guardian');
   for(const field of ['initialHp','survivalSeconds','combatHpHit',
    'shieldAbsorbed','healed','stormOutsideSeconds','stormDeaths','alive35','alive65']){
    group.totals[name][field]=(group.totals[name][field]||0)+m.guardians[field];
   }
  }
  if(baseline.winnerId!==swapped.winnerId){changed++;group.changedWinnerIds++;}
  group.pairDeltas.push({seed,shift,guardianWins:[
   baseline.winner==='guardian',swapped.winner==='guardian'],
   survivalDelta:+(swapped.guardians.survivalSeconds-baseline.guardians.survivalSeconds).toFixed(2),
   shieldAbsorbedDelta:+(swapped.guardians.shieldAbsorbed-baseline.guardians.shieldAbsorbed).toFixed(2),
   stormOutsideDelta:+(swapped.guardians.stormOutsideSeconds-baseline.guardians.stormOutsideSeconds).toFixed(2),
   baseline,swapped});
  if(k===0){
   assert.deepEqual(P.battle(entries,opts).run(),P.battle(entries,opts).run());
   assert.deepEqual(P.battle(entries,{...opts,experimentalSpawnPositions:spawn}).run(),
    P.battle(entries,{...opts,experimentalSpawnPositions:spawn}).run());
   replays+=2;
  }
  pairs++;games+=2;group.pairs++;
 }
 report.scenarios.push(group);
}
assert.equal(pairs,24);assert.equal(games,48);assert.equal(replays,8);
const m5=['guardian','hunter'].map((klass,i)=>({
 id:'trial-survival-m5-'+i,approvedMissions:5,
 build:P.exampleBuild(klass,'trial-survival-m5-'+i,5,i)
}));
const m5opts={seed:20261101,arenaScale:5,damageScale:.5};
assert.deepEqual(P.battle(m5,m5opts).run(),
 P.battle(m5,{...m5opts,arenaMission:5}).run());
report.totals={pairs,games,replays,changedWinnerIds:changed,
 m5Unchanged:true,realStudentsUsed:false};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.scenarios))
 .digest('hex').slice(0,20);
if(process.env.M10_GUARDIAN_SURVIVAL_REPORT_FILE){
 const file=path.resolve(process.env.M10_GUARDIAN_SURVIVAL_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 GUARDIAN SURVIVAL SUMMARY '+JSON.stringify({
 totals:report.totals,scenarios:report.scenarios.map(s=>({
 archetype:s.archetype,pairs:s.pairs,guardianWins:s.guardianWins,
 changedWinnerIds:s.changedWinnerIds,totals:s.totals})),hash:report.hash}));
console.log('PASS M10 scarce-Guardian survival: '+games+' games, '+pairs+
 ' paired spawns, '+replays+' replays; M5 unchanged.');

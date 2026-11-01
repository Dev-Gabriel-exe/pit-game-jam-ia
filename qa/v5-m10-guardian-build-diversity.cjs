'use strict';
// H.3/M10: diversity stress test with synthetic builds only. No game rule changes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const ATTR=['FOR','DES','INT','VIT','DEF'];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const ALLOCATION=[10,10,8,2];
const SEEDS=[918731,2701123,6204811,1109269];
const ARCHETYPES={
 defensive:{variant:0,extra:['G10','J08','J01','J03','G04','G05']},
 mixed:{variant:2,extra:['J08','L01','J01','J03','L08','G05']},
 offensive:{variant:5,extra:['J01','J02','J03','J04','J05']}
};
const PROFILES=['balanced','fortify','offense'];
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
function extendAttributes(base,klass,profile){
 const attributes={...base};
 let add={};
 if(profile==='balanced')add={FOR:2,DES:2,INT:2,VIT:2,DEF:2};
 if(profile==='fortify')add={VIT:5,DEF:5};
 if(profile==='offense'){
  add=klass==='mage'?{INT:5,DES:5}:klass==='hunter'?{DES:5,FOR:5}:{FOR:5,DES:5};
 }
 for(const [key,n]of Object.entries(add))attributes[key]+=n;
 assert.equal(ATTR.reduce((s,k)=>s+attributes[k],0),20);
 return attributes;
}
function entry(klass,slot,kind,profile,seedIndex){
 const id='trial-m10-div-'+kind+'-'+profile+'-'+seedIndex+'-'+slot;
 const variant=klass==='guardian'?ARCHETYPES[kind].variant:
  (slot*7+seedIndex*3+Object.keys(ARCHETYPES).indexOf(kind)*5)%11;
 const m5=P.exampleBuild(klass,id,5,variant);
 const m10=P.exampleBuild(klass,id,10,variant,{experimentalFinal:true});
 let talents=m10.talents;
 if(klass==='guardian'){
  talents=[...m5.talents];
  for(const talent of ARCHETYPES[kind].extra)
   if(talents.length<10&&!talents.includes(talent))talents.push(talent);
  for(const talent of P.TALENTS.guardian.map(t=>t.id))
   if(talents.length<10&&!talents.includes(talent))talents.push(talent);
  assert.equal(talents.length,10);
  assert.equal(talents.includes('G01'),kind!=='offensive');
  assert.equal(talents.includes('G10'),kind!=='offensive');
 }
 const attributes=extendAttributes(m5.attributes,klass,profile);
 const adapted=policy.m10ArenaAdapter({rosterKey:id,klass,
  completedMissions:APPROVALS,
  build:{attributes,talents},m5Entered:true,
  m5Frozen:{attributes:m5.attributes,talents:m5.talents},m10Locked:true});
 assert.deepEqual(adapted.build.talents.slice(0,5),m5.talents);
 assert.equal(new Set(adapted.build.talents).size,10);
 assert.equal(ATTR.reduce((s,k)=>s+adapted.build.attributes[k],0),20);
 return {...adapted,id};
}
function observe(game){
 const initial=Object.fromEntries(game.fighters.map(f=>[f.id,{
  klass:f.build.klass,shield:0,damage:0,healed:0,
  alive35:null,survival:null,knockouts:0
 }]));
 let marked=false,ticks=0;
 while(!game.finished&&ticks<3000){
  const step=game.update(.05);ticks++;
  for(const e of step.events){
   if(e.type==='hit'){
    if(initial[e.target])initial[e.target].shield+=e.absorbed||0;
    if(initial[e.hero])initial[e.hero].damage+=e.amount||0;
   }else if(e.type==='heal'&&initial[e.hero]){
    initial[e.hero].healed+=e.amount||0;
   }else if(e.type==='knockout'&&initial[e.hero]){
    initial[e.hero].knockouts++;
   }
  }
  if(!marked&&game.time+1e-7>=35){
   marked=true;
   for(const f of game.fighters)initial[f.id].alive35=f.alive;
  }
 }
 const result=game.result();
 assert(result.finished&&result.winner,'All synthetic battles must finish with winner');
 assert.equal(result.events.filter(e=>e.type==='end').length,1);
 for(const f of game.fighters){
  const record=initial[f.id];
  record.survival=f.eliminatedAt===null?result.time:f.eliminatedAt;
  assert.equal(record.knockouts,result.standings.find(s=>s.id===f.id).kills);
 }
 const guardians=Object.values(initial).filter(f=>f.klass==='guardian');
 assert.equal(guardians.length,2);
 return {winner:result.winner.klass,winnerId:result.winner.id,
  time:result.time,observed35:guardians.filter(g=>g.alive35!==null).length,
  alive35:guardians.filter(g=>g.alive35===true).length,
  shield:+guardians.reduce((s,g)=>s+g.shield,0).toFixed(2),
  damage:+guardians.reduce((s,g)=>s+g.damage,0).toFixed(2),
  healed:+guardians.reduce((s,g)=>s+g.healed,0).toFixed(2),
  knockouts:guardians.reduce((s,g)=>s+g.knockouts,0),
  survival:+guardians.reduce((s,g)=>s+g.survival,0).toFixed(2),
  timeLimit:result.events.some(e=>e.type==='end'&&e.reason==='time-limit')};
}
const report={schema:'v5-m10-guardian-build-diversity-v1',synthetic:true,
 scope:'M10: 2 Guardians among 30; 3 talent archetypes x 3 legal attribute extensions x 4 seeds x 2 rotations',
 options:OPTIONS,allocation:ALLOCATION,scenarios:[],
 limitations:[
  'All identities, approvals and builds are synthetic; no students or persisted progression.',
  'The offensive archetype deliberately excludes G01/G10; archetypes are not randomized samples of student choices.',
  'Alive at 35 seconds excludes matches ending before that mark; no early finish is counted as a death.',
  'Survival of winners is right-censored at the end of each match.',
  'Shield, healing and hit values are event aggregates, not exact effective HP changes.',
  'Repeated class compositions and correlated variants cannot establish universal balance or causal attribution.',
  'G.2 physical hardware and H.1/H.2 real integration remain blocked.'
 ]};
let games=0,replays=0;
const seen=new Set();
for(const [ki,kind]of Object.keys(ARCHETYPES).entries())
 for(const [pi,profile]of PROFILES.entries()){
  const group={archetype:kind,profile,games:0,guardianWins:0,
   alive35:0,observed35:0,shield:0,damage:0,healed:0,
   knockouts:0,survival:0,time:0,timeLimits:0,
   winnerClasses:Object.fromEntries(CLASSES.map(k=>[k,0]))};
  for(let si=0;si<SEEDS.length;si++)for(const shift of [0,15]){
   const classes=rotate(interleave(ALLOCATION),shift);
   const entries=classes.map((klass,i)=>entry(klass,i,kind,profile,si));
   const seed=(SEEDS[si]+ki*104729+pi*65537+shift*7919)>>>0;
   const opts={...OPTIONS,seed,experimentalCritSeed:(seed^0xdecafbad)>>>0};
   for(const e of entries){
    assert.equal(e.approvedMissions,10);
    assert.equal(e.build.talents.length,10);
    assert.equal(ATTR.reduce((s,k)=>s+e.build.attributes[k],0),20);
    seen.add(e.build.klass+':'+e.build.talents.join(',')+':'+ATTR.map(k=>e.build.attributes[k]).join(','));
   }
   const outcome=observe(P.battle(entries,opts));
   group.games++;games++;group.guardianWins+=Number(outcome.winner==='guardian');
   group.winnerClasses[outcome.winner]++;
   for(const field of ['alive35','observed35','shield','damage','healed','knockouts','survival','time'])
    group[field]+=outcome[field];
   group.timeLimits+=Number(outcome.timeLimit);
   if(si===0&&shift===0){
    const replay=observe(P.battle(entries,opts));
    assert.deepEqual(replay,outcome,'M10 must replay deterministically');
    replays++;
   }
  }
  assert.equal(group.games,8);
  assert(group.observed35<=16&&group.alive35<=group.observed35);
  for(const field of ['shield','damage','healed','survival','time'])
   group[field]=+group[field].toFixed(2);
  group.alive35Rate=group.observed35?
   +(100*group.alive35/group.observed35).toFixed(2):null;
  group.meanGuardianSurvival=+(group.survival/16).toFixed(2);
  report.scenarios.push(group);
 }
assert.equal(games,72);
assert.equal(replays,9);
assert(seen.size>30,'Need more than 30 distinct legal class/build combinations');
const m5=['guardian','hunter'].map((klass,i)=>({
 id:'trial-div-m5-'+i,approvedMissions:5,
 build:P.exampleBuild(klass,'trial-div-m5-'+i,5,i)}));
const m5opts={seed:20261101,arenaScale:5,damageScale:.5};
assert.deepEqual(P.battle(m5,m5opts).run(),
 P.battle(m5,{...m5opts,arenaMission:5}).run(),'M5 regression');
report.totals={games,replays,distinctBuilds:seen.size,
 guardianWins:report.scenarios.reduce((s,g)=>s+g.guardianWins,0),
 observed35:report.scenarios.reduce((s,g)=>s+g.observed35,0),
 alive35:report.scenarios.reduce((s,g)=>s+g.alive35,0),
 m5Unchanged:true,realStudentsUsed:false};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.scenarios))
 .digest('hex').slice(0,20);
if(process.env.M10_GUARDIAN_DIVERSITY_REPORT_FILE){
 const file=path.resolve(process.env.M10_GUARDIAN_DIVERSITY_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 GUARDIAN BUILD DIVERSITY REPORT '+JSON.stringify(report));
console.log('PASS M10 guardian build diversity: '+games+' games, '+replays+
 ' replays, '+seen.size+' distinct builds; M5 unchanged.');

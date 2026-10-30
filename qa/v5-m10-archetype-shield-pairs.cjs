'use strict';
/* H.3 — controlled M10 offensive/defensive/random build archetypes.
 * Synthetic only: no changes to class stats, M5, XP, students or persistence.
 * Pair each roster with neutral canonical shield vs 75% G01/G10 shield,
 * preserving all identities, attributes, talents, spawn, seed and turn order.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const SEEDS=[1729,7919,104729,65537]; // independent of previous G01/G10 matrix
const SCENARIOS=[
 {name:'4-balanced',counts:[1,1,1,1]},
 {name:'30-balanced',counts:[8,8,7,7]},
 {name:'30-guardian-half',counts:[5,5,5,15]}
];
const ARCHETYPES=['offensive','defensive','random'];
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
const MAIN={warrior:'FOR',mage:'INT',hunter:'DES',guardian:'FOR'};
const SECOND={warrior:'DES',mage:'DES',hunter:'FOR',guardian:'DES'};
const rand=seed=>{let s=seed>>>0;return ()=>{
 s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;
}};
function roster(counts){
 const left=[...counts],out=[];
 while(left.some(n=>n))for(let i=0;i<4;i++)if(left[i]-- >0)out.push(CLASSES[i]);
 return out;
}
function rotate(list,shift){return list.map((_,i)=>list[(i+shift)%list.length]);}
function makeBuild(klass,id,archetype,seed){
 const m5=P.exampleBuild(klass,id,5,0);
 const attributes={...m5.attributes},random=rand(seed^0x9e3779b9);
 const add=(key,n)=>{attributes[key]+=n;};
 if(archetype==='offensive'){add(MAIN[klass],7);add(SECOND[klass],3);}
 else if(archetype==='defensive'){add('DEF',6);add('VIT',4);}
 else for(let i=0;i<10;i++)add(P.ATTR[Math.floor(random()*P.ATTR.length)],1);
 const old=new Set(m5.talents);
 const remaining=P.TALENTS[klass].filter(t=>!old.has(t.id));
 const first=klass==='guardian'?['G10']:[];
 const pool=remaining.filter(t=>!first.includes(t.id));
 const rated=pool.map((t,i)=>{
  let score=0;
  if(archetype==='offensive')
   score=(t.type==='ativo'?5:0)+(t.primary===MAIN[klass]?5:0)+
    (t.secondary===MAIN[klass]?2:0)+(t.primary===SECOND[klass]?1:0);
  if(archetype==='defensive')
   score=(t.type==='passivo'||t.type==='reativo'?4:0)+
    (['DEF','VIT'].includes(t.primary)?6:0)+
    (['DEF','VIT'].includes(t.secondary)?2:0);
  if(archetype==='random')score=random();
  return {id:t.id,score,index:i};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);
 const talents=[...m5.talents,...first,...rated.slice(0,5-first.length).map(t=>t.id)];
 assert.equal(talents.length,10);assert.equal(new Set(talents).size,10);
 assert.equal(Object.values(attributes).reduce((a,b)=>a+b,0),20);
 for(const a of P.ATTR)assert(attributes[a]>=m5.attributes[a]);
 const candidate={rosterKey:id,klass,completedMissions:APPROVALS,
  build:{attributes,talents},m5Entered:true,
  m5Frozen:{attributes:{...m5.attributes},talents:[...m5.talents]},
  m10Locked:true};
 const adapted=policy.m10ArenaAdapter(candidate);
 assert.equal(adapted.build.talents.length,10);
 return {...adapted,id};
}
function start(game){return game.fighters.map(f=>({
 id:f.id,klass:f.build.klass,x:f.x,z:f.z,hp:f.hp,stats:f.stats,build:f.build
}));}
function metrics(game,result){
 const guardians=new Set(game.fighters.filter(f=>f.build.klass==='guardian').map(f=>f.id));
 const shield=result.events.filter(e=>e.type==='shield'&&guardians.has(e.hero));
 const hits=result.events.filter(e=>e.type==='hit'&&guardians.has(e.target));
 const casts=Object.fromEntries(['G01','G10'].map(id=>[id,
  result.events.filter(e=>e.type==='talent'&&e.talent===id&&guardians.has(e.hero)).length]));
 const sum=(events,key)=>events.reduce((s,e)=>s+(Number(e[key])||0),0);
 return {guardianWin:Number(result.winner.klass==='guardian'),
  winnerClass:result.winner.klass,winnerId:result.winner.id,
  duration:result.time,shieldNominal:sum(shield,'amount'),
  shieldAbsorbed:sum(hits,'absorbed'),g01Casts:casts.G01,g10Casts:casts.G10,
  timeLimit:Number(result.events.findLast(e=>e.type==='end')?.reason==='time-limit')};
}
function tally(){
 return {games:0,guardianWins:0,expectedGuardianWins:0,changedWinners:0,
  shieldNominal:0,shieldAbsorbed:0,g01Casts:0,g10Casts:0,
  timeLimits:0,durationSum:0,wins:Object.fromEntries(CLASSES.map(c=>[c,0]))};
}
function add(t,m,expected,changed){
 t.games++;t.guardianWins+=m.guardianWin;t.expectedGuardianWins+=expected;
 t.changedWinners+=Number(changed);t.shieldNominal+=m.shieldNominal;
 t.shieldAbsorbed+=m.shieldAbsorbed;t.g01Casts+=m.g01Casts;
 t.g10Casts+=m.g10Casts;t.timeLimits+=m.timeLimit;t.durationSum+=m.duration;
 t.wins[m.winnerClass]++;
}
const report={schema:'pit-v5-m10-archetype-shield-pairs-v1',
 scope:'H.3 M10 synthetic; 4 KayKit classes; 10 talents / 20 attributes; M5 frozen',
 seeds:SEEDS,archetypes:ARCHETYPES,scenarios:SCENARIOS.map(s=>s.name),
 options:OPTIONS,groups:[],limitations:[
  'Archetypes share the first five M5 talents; only ten extra attribute points and five extra talents differ.',
  'Guardian G10 is intentionally forced into the five M10 additions so both shield talents are exposed.',
  'Comparison of 75% vs 100% shield is paired within an archetype, not a causal comparison between archetypes.',
  'Different fights consume RNG differently after a shield changes; same seed does not ensure identical later decisions.',
  'Expected wins use roster fraction as descriptive reference, not a statistical fairness test.',
  'No live gameplay nerf, physical PC G.2, production, real classroom, XP or main changes.'
 ]};
let games=0,paired=0,replays=0,neutral=0;
for(const archetype of ARCHETYPES)for(const scenario of SCENARIOS){
 const classes=roster(scenario.counts),base=tally(),scaled=tally(),pairs=[];
 for(let si=0;si<SEEDS.length;si++)for(const shift of [0,Math.floor(classes.length/2)]){
  const order=rotate(classes,shift);
  const entries=order.map((klass,i)=>makeBuild(klass,
   'trial-m10-'+scenario.name+'-'+si+'-'+shift+'-'+i,
   archetype,(SEEDS[si]^Math.imul(i+1,104729)^Math.imul(shift+1,7919))>>>0));
  const seed=(SEEDS[si]+classes.length*8191+shift*97)>>>0;
  const opts={...OPTIONS,seed,experimentalCritSeed:(seed^0x5f3759df)>>>0};
  const canonical=P.battle(entries,opts),begin=start(canonical),a=canonical.run();
  assert(a.finished&&a.winner&&a.events.filter(e=>e.type==='end').length===1);
  if(si===0&&shift===0){
   assert.deepEqual(P.battle(entries,opts).run(),a,'Baseline replay changed');
   assert.deepEqual(P.battle(entries,{...opts,
    experimentalGuardianShieldScale:{G01:1,G10:1}}).run(),a,
    'Neutral 100% shield must be identical');
   replays++;neutral++;
  }
  const experimental=P.battle(entries,{...opts,
   experimentalGuardianShieldScale:{G01:.75,G10:.75}});
  assert.deepEqual(start(experimental),begin,'Shield scale changed initial roster/spawn');
  const b=experimental.run();
  assert(b.finished&&b.winner&&b.events.filter(e=>e.type==='end').length===1);
  const ma=metrics(canonical,a),mb=metrics(experimental,b);
  const changed=ma.winnerId!==mb.winnerId;
  const expected=scenario.counts[3]/classes.length;
  add(base,ma,expected,false);add(scaled,mb,expected,changed);
  pairs.push({seed,shift,baseline:ma.winnerClass,scaled:mb.winnerClass,
   changed,guardianShieldAbsorbedBase:+ma.shieldAbsorbed.toFixed(2),
   guardianShieldAbsorbed75:+mb.shieldAbsorbed.toFixed(2)});
  games+=2;paired++;
 }
 assert.equal(base.games,8);assert.equal(scaled.games,8);
 report.groups.push({archetype,scenario:scenario.name,players:classes.length,
  baseline:base,shields75:scaled,pairs});
}
assert.equal(games,144);assert.equal(paired,72);
assert.equal(replays,9);assert.equal(neutral,9);
for(const group of report.groups){
 assert(group.baseline.g01Casts>0&&group.baseline.g10Casts>0,
  'Both shield talents must activate: '+group.archetype+'/'+group.scenario);
}
const m5=['warrior','guardian'].map((klass,i)=>({
 id:'trial-m5-unchanged-'+i,approvedMissions:5,
 build:P.exampleBuild(klass,'trial-m5-unchanged-'+i,5,0)
}));
const m5opts={seed:4175863657,arenaScale:5,damageScale:.5};
assert.deepEqual(P.battle(m5,m5opts).run(),
 P.battle(m5,{...m5opts,arenaMission:5}).run());
assert.throws(()=>P.battle(m5,{...m5opts,experimentalGuardianShieldScale:{G01:.75}}),/M10/);
report.totals={games,paired,replays,neutralChecks:neutral,m5Unchanged:true};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.groups)).digest('hex').slice(0,20);
if(process.env.M10_ARCHETYPE_REPORT_FILE){
 const file=path.resolve(process.env.M10_ARCHETYPE_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 ARCHETYPE SHIELD SUMMARY '+JSON.stringify(report.groups.map(g=>({
 archetype:g.archetype,scenario:g.scenario,guardianWinsBaseline:g.baseline.guardianWins,
 guardianWins75:g.shields75.guardianWins,expectedGuardianWins:g.baseline.expectedGuardianWins,
 changedWinners:g.shields75.changedWinners,
 shieldAbsorbedBaseline:+g.baseline.shieldAbsorbed.toFixed(2),
 shieldAbsorbed75:+g.shields75.shieldAbsorbed.toFixed(2)}))));
console.log('PASS M10 archetype sensitivity: '+games+' games, '+paired+
 ' pairs, '+replays+' exact replays, '+neutral+' neutral checks, M5 unchanged.');

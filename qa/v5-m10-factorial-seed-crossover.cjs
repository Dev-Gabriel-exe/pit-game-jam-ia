'use strict';
/* H.3 M10: factorial crossover with independent seeds. Experimental only.
 * Entry order, builds, initial RNG and identities are held fixed; intervene
 * separately on spawn geometry and the actor-processing loop.
 * NO student data, live progression, balance patch, M5 changes or main merge.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const ARCHETYPES=['offensive','defensive','random'];
const MAIN={warrior:'FOR',mage:'INT',hunter:'DES',guardian:'FOR'};
const SECOND={warrior:'DES',mage:'DES',hunter:'FOR',guardian:'DES'};
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
const SCENARIOS=[
 {name:'4-balanced',counts:[1,1,1,1],seeds:4,shifts:[1]},
 {name:'30-balanced',counts:[8,8,7,7],seeds:8,shifts:[1,15]},
 {name:'30-guardian-half',counts:[5,5,5,15],seeds:8,shifts:[1,15]}
];
const ARMS=['baseline','geometry','order','combined'];
function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function classesFor(counts){
 const left=[...counts],out=[];
 while(left.some(n=>n>0))for(let i=0;i<4;i++)if(left[i]>0){out.push(CLASSES[i]);left[i]--;}
 return out;
}
function rotate(arr,n){return arr.map((_,i)=>arr[(i+n)%arr.length]);}
function build(klass,id,kind,index){
 const m5=P.exampleBuild(klass,id,5,0),attributes={...m5.attributes};
 const random=rng((0x6d2b79f5^Math.imul(index+1,2654435761))>>>0);
 if(kind==='offensive'){attributes[MAIN[klass]]+=7;attributes[SECOND[klass]]+=3;}
 else if(kind==='defensive'){attributes.DEF+=6;attributes.VIT+=4;}
 else for(let i=0;i<10;i++)attributes[P.ATTR[Math.floor(random()*P.ATTR.length)]]++;
 const old=new Set(m5.talents),pool=P.TALENTS[klass].filter(t=>!old.has(t.id));
 const rated=pool.map((t,i)=>{
  let score=0;
  if(kind==='offensive')score=(t.type==='ativo'?5:0)+(t.primary===MAIN[klass]?5:0)+
   (t.secondary===MAIN[klass]?2:0)+(t.primary===SECOND[klass]?1:0);
  if(kind==='defensive')score=(t.type==='passivo'||t.type==='reativo'?4:0)+
   (['DEF','VIT'].includes(t.primary)?6:0)+(['DEF','VIT'].includes(t.secondary)?2:0);
  if(kind==='random')score=random();
  return {id:t.id,score,i};
 }).sort((a,b)=>b.score-a.score||a.i-b.i);
 const talents=[...m5.talents,...rated.slice(0,5).map(t=>t.id)];
 assert.equal(talents.length,10);assert.equal(new Set(talents).size,10);
 assert.equal(Object.values(attributes).reduce((a,b)=>a+b,0),20);
 for(const key of P.ATTR)assert(attributes[key]>=m5.attributes[key]);
 const adapted=policy.m10ArenaAdapter({rosterKey:id,klass,
  completedMissions:APPROVALS,build:{attributes,talents},m5Entered:true,
  m5Frozen:{attributes:{...m5.attributes},talents:[...m5.talents]},m10Locked:true});
 return {...adapted,id};
}
function initial(game){
 return game.fighters.map(f=>({id:f.id,klass:f.build.klass,stats:f.stats,
  hp:f.hp,basic:f.basic,build:f.build,x:f.x,z:f.z,face:f.face}));
}
function withoutGeometry(snapshot){
 return snapshot.map(({x,z,face,...rest})=>rest);
}
function positions(game){
 return Object.fromEntries(game.fighters.map(f=>[f.id,{x:f.x,z:f.z,face:f.face}]));
}
function digest(x){return crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,20);}
const report={schema:'pit-v5-m10-factorial-seed-crossover-v1',
 scope:'synthetic M10, four KayKit classes, frozen M5, 10 talents and 20 attributes',
 options:OPTIONS,scenarios:[],limitations:[
  'Eight independent seeds per 30-person composition; two shifts and three archetypes reuse each seed and are correlated, not independent observations.',
  'Actor-order intervention only permutes the main actor loop; projectile and collision arrays remain in original order.',
  'Per-hero critical RNG is fixed within a seed, but encounter-dependent draws and target choices may diverge after intervention.',
  'The 2x2 factorial reports conditional sensitivity and interaction, not proof of an exclusive causal explanation for Guardian wins.',
  'Fixed deterministic archetypes do not sample the complete talent/build space; no balance nerf is justified.',
  'No physical PC G.2, real H.1/H.2, XP, students, classes, production or main modifications.'
 ]};
let games=0,observedCells=0,comparisons=0,replays=0,geometryChecks=0,neutralChecks=0;
for(let si=0;si<SCENARIOS.length;si++){
 const sc=SCENARIOS[si],classes=classesFor(sc.counts),n=classes.length;
 const entriesByKind=Object.fromEntries(ARCHETYPES.map(kind=>[kind,
  classes.map((klass,i)=>build(klass,'trial-factor-'+si+'-'+i,kind,i))]));
 const group={name:sc.name,players:n,guardianShare:sc.counts[3]/n,
  independentSeeds:sc.seeds,shifts:sc.shifts,archetypes:{}};
 for(const kind of ARCHETYPES){
  const entries=entriesByKind[kind],ids=entries.map(e=>e.id);
  const summary={games:Object.fromEntries(ARMS.map(a=>[a,0])),
   guardianWins:Object.fromEntries(ARMS.map(a=>[a,0])),
   winnerChangedVsBaseline:Object.fromEntries(ARMS.slice(1).map(a=>[a,0])),
   perSeed:[]};
  for(let k=0;k<sc.seeds;k++){
   // Distinct seed across all blocks; independent of the prior full-slot matrix.
   const seed=(Math.imul(k+1,2246822519)^Math.imul(si+11,3266489917)^0xa511e9b3)>>>0;
   const opts={...OPTIONS,seed,experimentalCritSeed:(seed^0x5f3759df)>>>0};
   const fresh=P.battle(entries,opts),start=initial(fresh),basePos=positions(fresh);
   const seedRow={seed,shifts:[],guardianWins:Object.fromEntries(ARMS.map(a=>[a,0]))};
   const baseline=fresh.run();games++;
   assert(baseline.finished&&baseline.winner);
   assert.equal(baseline.events.filter(e=>e.type==='end').length,1);
   if(k===0){
    assert.deepEqual(P.battle(entries,{...opts,experimentalTurnOrder:ids,
     experimentalSpawnPositions:basePos}).run(),baseline);
    neutralChecks++;
    assert.deepEqual(P.battle(entries,opts).run(),baseline);
    replays++;
   }
   for(const shift of sc.shifts){
    const rotatedIds=rotate(ids,shift);
    const rotatedPositions=Object.fromEntries(ids.map((id,i)=>[id,basePos[ids[(i+shift)%n]]]));
    assert(ids.some(id=>rotatedPositions[id].x!==basePos[id].x));
    const results={baseline};
    const configs={
     geometry:{experimentalSpawnPositions:rotatedPositions},
     order:{experimentalTurnOrder:rotatedIds},
     combined:{experimentalSpawnPositions:rotatedPositions,experimentalTurnOrder:rotatedIds}
    };
    for(const arm of ARMS.slice(1)){
     const trial=P.battle(entries,{...opts,...configs[arm]});
     const current=initial(trial);
     assert.deepEqual(withoutGeometry(current),withoutGeometry(start),
      arm+' changed build, HP, stats or initial RNG');
     const expected=arm==='order'?basePos:rotatedPositions;
     for(const f of current)assert.deepEqual({x:f.x,z:f.z,face:f.face},expected[f.id]);
     geometryChecks++;
     results[arm]=trial.run();
     assert(results[arm].finished&&results[arm].winner);
     assert.equal(results[arm].events.filter(e=>e.type==='end').length,1);
    }
    const row={shift,winners:{},winnerClasses:{},changedVsBaseline:{}};
    for(const arm of ARMS){
     const result=results[arm];
     row.winners[arm]=result.winner.id;
     row.winnerClasses[arm]=result.winner.klass;
     summary.games[arm]++;observedCells++;
     if(arm!=='baseline')games++;
     const won=Number(result.winner.klass==='guardian');
     summary.guardianWins[arm]+=won;seedRow.guardianWins[arm]+=won;
     if(arm!=='baseline'){
      const changed=Number(result.winner.id!==baseline.winner.id);
      summary.winnerChangedVsBaseline[arm]+=changed;
      row.changedVsBaseline[arm]=Boolean(changed);
      comparisons++;
     }
    }
    if(k===0&&shift===sc.shifts[0]){
     assert.deepEqual(P.battle(entries,{...opts,...configs.combined}).run(),results.combined);
     replays++;
    }
    seedRow.shifts.push(row);
   }
   summary.perSeed.push(seedRow);
  }
  for(const arm of ARMS)assert.equal(summary.games[arm],sc.seeds*sc.shifts.length);
  group.archetypes[kind]=summary;
 }
 report.scenarios.push(group);
}
const m5=['warrior','guardian'].map((klass,i)=>({
 id:'trial-factor-m5-'+i,approvedMissions:5,
 build:P.exampleBuild(klass,'trial-factor-m5-'+i,5,0)
}));
const m5opts={seed:4175863657,arenaScale:5,damageScale:.5};
assert.deepEqual(P.battle(m5,m5opts).run(),P.battle(m5,{...m5opts,arenaMission:5}).run());
assert.throws(()=>P.battle(m5,{...m5opts,experimentalTurnOrder:m5.map(e=>e.id)}),/M10/);
assert.throws(()=>P.battle(m5,{...m5opts,experimentalSpawnPositions:{}}),/M10/);
assert.equal(games,384);assert.equal(observedCells,432);assert.equal(comparisons,324);
assert.equal(replays,18);assert.equal(neutralChecks,9);assert.equal(geometryChecks,324);
report.totals={games,observedCells,comparisons,replays,neutralChecks,geometryChecks,m5Unchanged:true,
 independentSeedsPer30Composition:8};
report.hash=digest(report.scenarios);
if(process.env.M10_FACTORIAL_REPORT_FILE){
 const target=path.resolve(process.env.M10_FACTORIAL_REPORT_FILE);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 FACTORIAL SUMMARY '+JSON.stringify(report.scenarios.map(s=>({
 scenario:s.name,seeds:s.independentSeeds,shifts:s.shifts,
 archetypes:Object.fromEntries(ARCHETYPES.map(a=>[a,{
  guardianWins:s.archetypes[a].guardianWins,
  changed:s.archetypes[a].winnerChangedVsBaseline
 }]))
}))));
console.log('PASS M10 factorial crossover: '+games+' games, '+comparisons+
 ' paired comparisons, '+observedCells+' arm observations (reused baseline), '+
 replays+' exact replays, M5 unchanged; hash '+report.hash);

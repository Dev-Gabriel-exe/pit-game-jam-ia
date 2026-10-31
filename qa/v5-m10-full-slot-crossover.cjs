'use strict';
/* H.3/M10: complete cyclic slot crossover of offensive, defensive and
 * pseudo-random builds. Synthetic only; NO balance patch, real students or XP.
 * A slot combines spawn geometry and update index: NOT an isolated causal effect.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const ARCHETYPES=['offensive','defensive','random'];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const MAIN={warrior:'FOR',mage:'INT',hunter:'DES',guardian:'FOR'};
const SECOND={warrior:'DES',mage:'DES',hunter:'FOR',guardian:'DES'};
const SCENARIOS=[
 {name:'4-balanced',counts:[1,1,1,1],seeds:[1009,4001,65537]},
 {name:'30-balanced',counts:[8,8,7,7],seeds:[786433,15485863]},
 {name:'30-guardian-half',counts:[5,5,5,15],seeds:[32452843,49979687]}
];
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
function rand(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function roster(counts){
 const remaining=[...counts],out=[];
 while(remaining.some(n=>n>0))for(let i=0;i<4;i++)if(remaining[i]-->0)out.push(CLASSES[i]);
 return out;
}
function rotate(arr,n){return arr.map((_,i)=>arr[(i+n)%arr.length]);}
function makeBuild(klass,id,archetype,index){
 const m5=P.exampleBuild(klass,id,5,0),attributes={...m5.attributes};
 const rng=rand((0x6d2b79f5^Math.imul(index+1,2654435761))>>>0);
 if(archetype==='offensive'){attributes[MAIN[klass]]+=7;attributes[SECOND[klass]]+=3;}
 else if(archetype==='defensive'){attributes.DEF+=6;attributes.VIT+=4;}
 else for(let j=0;j<10;j++)attributes[P.ATTR[Math.floor(rng()*P.ATTR.length)]]++;
 const old=new Set(m5.talents),pool=P.TALENTS[klass].filter(t=>!old.has(t.id));
 const rated=pool.map((t,i)=>{
  let score=0;
  if(archetype==='offensive')score=(t.type==='ativo'?5:0)+(t.primary===MAIN[klass]?5:0)+
   (t.secondary===MAIN[klass]?2:0)+(t.primary===SECOND[klass]?1:0);
  if(archetype==='defensive')score=(t.type==='passivo'||t.type==='reativo'?4:0)+
   (['DEF','VIT'].includes(t.primary)?6:0)+(['DEF','VIT'].includes(t.secondary)?2:0);
  if(archetype==='random')score=rng();
  return {id:t.id,score,i};
 }).sort((a,b)=>b.score-a.score||a.i-b.i);
 const talents=[...m5.talents,...rated.slice(0,5).map(t=>t.id)];
 assert.equal(talents.length,10);assert.equal(new Set(talents).size,10);
 assert.equal(Object.values(attributes).reduce((s,v)=>s+v,0),20);
 for(const key of P.ATTR)assert(attributes[key]>=m5.attributes[key]);
 const adapted=policy.m10ArenaAdapter({rosterKey:id,klass,
  completedMissions:APPROVALS,build:{attributes,talents},m5Entered:true,
  m5Frozen:{attributes:{...m5.attributes},talents:[...m5.talents]},m10Locked:true});
 assert.equal(adapted.build.talents.length,10);
 return {...adapted,id};
}
function wilson(success,n){
 const z=1.96,p=success/n,d=1+z*z/n;
 const mid=(p+z*z/(2*n))/d,rad=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;
 return [+(100*(mid-rad)).toFixed(1),+(100*(mid+rad)).toFixed(1)];
}
const report={schema:'pit-v5-m10-full-slot-archetype-crossover-v1',
 scope:'Synthetic M10 only, same identities, frozen M5 choices, 10 talents / 20 points',
 options:OPTIONS,groups:[],limitations:[
  'Rotating roster order changes spawn position, update index and non-critical RNG consumption together; not isolated causality.',
  'The same seed and identity/build are reused within each full rotation block; rotations are dependent, so Wilson intervals are descriptive ONLY.',
  'Only 2 independent seeds per 30-person composition; intervals must not be used to approve balance or nerf any class.',
  'Pseudo-random builds are deterministic, not a representative sample of all 120 talent combinations.',
  'G01/G10 are NOT forced into Guardian builds; their selection and activation are reported.',
  'No physical PC G.2, authenticated H.1/H.2, XP, users, grades, production or main changes.'
 ]};
let games=0,replays=0,pairedArchetypes=0,slotChecks=0;
for(let sc=0;sc<SCENARIOS.length;sc++){
 const scenario=SCENARIOS[sc],classes=roster(scenario.counts),n=classes.length;
 assert.equal(n,scenario.counts.reduce((a,b)=>a+b,0));
 const identities=classes.map((klass,i)=>({klass,id:'trial-cross-'+sc+'-'+i}));
 const builds=Object.fromEntries(ARCHETYPES.map(a=>[a,
  identities.map((person,i)=>makeBuild(person.klass,person.id,a,i))]));
 const summary=Object.fromEntries(ARCHETYPES.map(a=>[a,{
  games:0,wins:Object.fromEntries(CLASSES.map(k=>[k,0])),
  guardianWins:0,winnerSlots:Array(n).fill(0),durationSum:0,
  selectedG01:builds[a].filter(e=>e.build.klass==='guardian'&&e.build.talents.includes('G01')).length,
  selectedG10:builds[a].filter(e=>e.build.klass==='guardian'&&e.build.talents.includes('G10')).length,
  castsG01:0,castsG10:0,changedVsOffensive:0,seedGuardianWins:[]}
 ]));
 const exposure=Object.fromEntries(identities.map(p=>[p.id,Array(n).fill(0)]));
 for(const seed of scenario.seeds){
  const seedWins=Object.fromEntries(ARCHETYPES.map(a=>[a,0]));
  for(let shift=0;shift<n;shift++){
   const options={...OPTIONS,seed,experimentalCritSeed:(seed^0x5f3759df)>>>0};
   let slotSnapshot=null,offensiveWinner=null;
   for(const archetype of ARCHETYPES){
    const entries=rotate(builds[archetype],shift);
    const game=P.battle(entries,options);
    const slots=game.fighters.map(f=>({id:f.id,x:f.x,z:f.z}));
    if(!slotSnapshot)slotSnapshot=slots;
    else {assert.deepEqual(slots,slotSnapshot,'Archetype changed slot geometry');slotChecks++;}
    const result=game.run();
    assert(result.finished&&result.winner,'M10 battle must finish with a winner');
    assert.equal(result.events.filter(e=>e.type==='end').length,1);
    if(seed===scenario.seeds[0]&&shift===0){
     assert.deepEqual(P.battle(entries,options).run(),result,'Exact M10 replay mismatch');
     replays++;
    }
    const s=summary[archetype],winnerSlot=entries.findIndex(e=>e.id===result.winner.id);
    assert(winnerSlot>=0);
    s.games++;s.wins[result.winner.klass]++;s.winnerSlots[winnerSlot]++;
    s.guardianWins+=Number(result.winner.klass==='guardian');
    seedWins[archetype]+=Number(result.winner.klass==='guardian');
    s.durationSum+=result.time;
    s.castsG01+=result.events.filter(e=>e.type==='talent'&&e.talent==='G01').length;
    s.castsG10+=result.events.filter(e=>e.type==='talent'&&e.talent==='G10').length;
    if(archetype==='offensive')offensiveWinner=result.winner.id;
    else {s.changedVsOffensive+=Number(offensiveWinner!==result.winner.id);pairedArchetypes++;}
    games++;
   }
   for(let slot=0;slot<n;slot++)exposure[slotSnapshot[slot].id][slot]++;
  }
  for(const archetype of ARCHETYPES)summary[archetype].seedGuardianWins.push(seedWins[archetype]);
 }
 for(const person of identities)assert(exposure[person.id].every(v=>v===scenario.seeds.length),
  'Every identity must visit every slot once per seed');
 const group={scenario:scenario.name,players:n,seeds:scenario.seeds,
  rotationsPerSeed:n,exposurePerIdentityPerSlot:scenario.seeds.length,
  expectedGuardianShare:+(scenario.counts[3]/n).toFixed(4),archetypes:{}};
 for(const archetype of ARCHETYPES){
  const s=summary[archetype];
  assert.equal(s.games,n*scenario.seeds.length);
  group.archetypes[archetype]={...s,
   guardianWinPercent:+(100*s.guardianWins/s.games).toFixed(1),
   wilson95DescriptivePercent:wilson(s.guardianWins,s.games),
   meanDuration:+(s.durationSum/s.games).toFixed(2)};
 }
 report.groups.push(group);
}
assert.equal(games,396);assert.equal(replays,9);
assert.equal(pairedArchetypes,264);assert.equal(slotChecks,264);
const m5=['warrior','guardian'].map((klass,i)=>({
 id:'trial-cross-m5-'+i,approvedMissions:5,
 build:P.exampleBuild(klass,'trial-cross-m5-'+i,5,0)
}));
const m5Options={seed:4175863657,arenaScale:5,damageScale:.5};
assert.deepEqual(P.battle(m5,m5Options).run(),P.battle(m5,{...m5Options,arenaMission:5}).run());
report.totals={games,replays,pairedArchetypes,slotChecks,m5Unchanged:true};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.groups)).digest('hex').slice(0,20);
if(process.env.M10_CROSSOVER_REPORT_FILE){
 const target=path.resolve(process.env.M10_CROSSOVER_REPORT_FILE);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 FULL SLOT CROSSOVER '+JSON.stringify(report.groups.map(g=>({
 scenario:g.scenario,rotations:g.rotationsPerSeed,seeds:g.seeds.length,
 archetypes:Object.fromEntries(ARCHETYPES.map(a=>[a,{
 guardianWins:g.archetypes[a].guardianWins,
 total:g.archetypes[a].games,
 winPercent:g.archetypes[a].guardianWinPercent,
 changedVsOffensive:g.archetypes[a].changedVsOffensive,
 selectedG01:g.archetypes[a].selectedG01,selectedG10:g.archetypes[a].selectedG10
 }]))
}))));
console.log('PASS M10 full-slot crossover: '+games+' games, '+pairedArchetypes+
 ' paired archetype comparisons, '+replays+' exact replays, M5 unchanged.');

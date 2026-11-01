'use strict';
// H.3/M10: isolate ONLY the G10 shield amount, retaining G10 equipped, cast logic, solar effect, M5 and attributes.
// Synthetic-only diagnostic. No student data, progression writes or balance patches.
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
const SEEDS=[918731,2701123,6204811,1109269,7311981,1503127];
const ARMS={baseline:1,half:.5,zero:0};
const PROFILES={
 balanced:{FOR:2,DES:2,INT:2,VIT:2,DEF:2},
 fortify:{VIT:5,DEF:5}
};
const SCENARIOS=[
 {name:'4-balanced',allocation:[1,1,1,1]},
 {name:'30-two-guardians',allocation:[10,10,8,2]}
];
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2',limit:120};
function interleave(allocation){
 const left=allocation.slice(),out=[];
 while(left.some(n=>n>0))for(let i=0;i<left.length;i++)if(left[i]>0){
  out.push(CLASSES[i]);left[i]--;
 }
 return out;
}
function rotate(a,shift){return a.map((_,i)=>a[(i+shift)%a.length]);}
function sumAttrs(a){return ATTR.reduce((s,k)=>s+a[k],0);}
function makeEntry(klass,slot,profile,arm,scenarioIndex,seedIndex){
 const id='trial-m10-fixed-'+scenarioIndex+'-'+profile+'-'+seedIndex+'-'+slot;
 const variant=klass==='guardian'?0:(slot*7+seedIndex*3)%11;
 const m5=P.exampleBuild(klass,id,5,variant);
 const attrs={...m5.attributes};
 for(const [k,n]of Object.entries(PROFILES[profile]))attrs[k]+=n;
 assert.equal(sumAttrs(m5.attributes),10);
 assert.equal(sumAttrs(attrs),20);
 let talents;
 if(klass==='guardian'){
  assert.deepEqual(m5.talents,['G01','G02','G03','G04','G05']);
  talents=[...m5.talents,'G06','G07','G08','G09','G10'];
  assert.deepEqual(talents.slice(5,9),['G06','G07','G08','G09']);
  assert.equal(talents[9],'G10');
 }else{
  const m10=P.exampleBuild(klass,id,10,variant,{experimentalFinal:true});
  talents=m10.talents;
 }
 assert.deepEqual(talents.slice(0,5),m5.talents);
 assert.equal(talents.length,10);
 assert.equal(new Set(talents).size,10);
 const final=policy.m10ArenaAdapter({rosterKey:id,klass,
  completedMissions:APPROVALS,build:{attributes:attrs,talents},
  m5Entered:true,m5Frozen:{attributes:m5.attributes,talents:m5.talents},
  m10Locked:true});
 assert.equal(final.finalTrial,true);
 assert.equal(final.approvedMissions,10);
 assert.equal(sumAttrs(final.build.attributes),20);
 return {...final,id};
}
function rosterInvariant(entries){
 return entries.map(e=>({id:e.id,klass:e.build.klass,
  attributes:e.build.attributes,m5:e.build.talents.slice(0,5),
  otherTalents:e.build.klass==='guardian'?null:e.build.talents}));
}
function initial(game){
 return game.fighters.map(f=>({id:f.id,klass:f.build.klass,
  x:f.x,z:f.z,face:f.face,basic:f.basic,hp:f.hp,stats:f.stats}));
}
function observe(game){
 const guardianIds=new Set(game.fighters.filter(f=>f.build.klass==='guardian').map(f=>f.id));
 let observed35=false,alive35=0,ticks=0;
 while(!game.finished&&ticks<3000){
  game.update(.05);ticks++;
  if(!observed35&&game.time+1e-7>=35){
   observed35=true;
   alive35=game.fighters.filter(f=>guardianIds.has(f.id)&&f.alive).length;
  }
 }
 const result=game.result();
 assert(result.finished&&result.winner,'All M10 trials must finish');
 assert.equal(result.events.filter(e=>e.type==='end').length,1);
 const events=result.events;
 const sum=(type,key,filter)=>events.filter(e=>e.type===type&&filter(e))
  .reduce((n,e)=>n+(e[key]||0),0);
 const guardians=game.fighters.filter(f=>guardianIds.has(f.id));
 const knockoutCount=events.filter(e=>e.type==='knockout'&&guardianIds.has(e.hero)).length;
 assert.equal(knockoutCount,guardians.reduce((s,f)=>s+f.kills,0));
 return {winnerId:result.winner.id,winnerClass:result.winner.klass,
  duration:result.time,observed35,alive35,
  shieldAbsorbed:+sum('hit','absorbed',e=>guardianIds.has(e.target)).toFixed(2),
  shieldGranted:+sum('shield','amount',e=>guardianIds.has(e.hero)).toFixed(2),
  healed:+sum('heal','amount',e=>guardianIds.has(e.hero)).toFixed(2),
  outgoingHit:+sum('hit','amount',e=>guardianIds.has(e.hero)).toFixed(2),
  knockouts:knockoutCount,
  survival:+guardians.reduce((s,f)=>s+(f.eliminatedAt??result.time),0).toFixed(2),
  guardianTalents:events.filter(e=>e.type==='talent'&&guardianIds.has(e.hero)).length,
  g10Casts:events.filter(e=>e.type==='talent'&&e.talent==='G10'&&guardianIds.has(e.hero)).length};
}
const report={schema:'v5-m10-guardian-g10-shield-only-paired-v1',
 synthetic:true,options:OPTIONS,arms:ARMS,profiles:PROFILES,
 scenarios:[],limitations:[
  'All ten equipped Guardian talents, including G10, are identical in all arms; only the opt-in G10 shield coefficient changes.',
  'The G10 solar buff and ability cast code are untouched; shield amount may still alter later decisions, targets and RNG.',
  'All five M5 Guardian talents (including G01) and all 20 attribute points are identical within each pair.',
  'Shield coefficient 0 is a diagnostic counterfactual, not a balance recommendation or playable preset.',
  'M10 is opt-in laboratory only; no inference about real student builds or fairness.',
  'Hit and shield event totals are not capped effective HP loss; survival is censored for winners.',
  'G.2 physical PCs, H.1/H.2 real integration, approval and production remain blocked.'
 ]};
let games=0,blocks=0,replays=0,paired=0;
const armNames=Object.keys(ARMS);
for(let si=0;si<SCENARIOS.length;si++){
 const scenario=SCENARIOS[si],group={name:scenario.name,allocation:scenario.allocation,
  blocks:0,arms:Object.fromEntries(armNames.map(a=>[a,{games:0,guardianWins:0,
   observedGuardians35:0,alive35:0,shieldAbsorbed:0,shieldGranted:0,
   healed:0,outgoingHit:0,knockouts:0,survival:0,guardianTalents:0,g10Casts:0}])),
  changedWinnerVsBaseline:Object.fromEntries(armNames.filter(a=>a!=='baseline').map(a=>[a,0])),
  changedGuardianWinVsBaseline:Object.fromEntries(armNames.filter(a=>a!=='baseline').map(a=>[a,0]))};
 for(const profile of Object.keys(PROFILES)){
  for(let ki=0;ki<SEEDS.length;ki++)for(const shift of [0,Math.floor(scenario.allocation.reduce((a,b)=>a+b,0)/2)]){
   const classes=rotate(interleave(scenario.allocation),shift);
   const seed=(SEEDS[ki]+si*104729+shift*65537+
    (profile==='fortify'?7919:0))>>>0;
   const opts={...OPTIONS,seed,experimentalCritSeed:(seed^0xdecafbad)>>>0};
   let referenceRoster=null,referenceInitial=null,referenceGuardianTalents=null,baseline=null;
   for(const arm of armNames){
    const entries=classes.map((klass,slot)=>makeEntry(klass,slot,profile,arm,si,ki));
    const invariant=rosterInvariant(entries);
    const armOpts=arm==='baseline'?opts:{...opts,experimentalGuardianShieldScale:{G10:ARMS[arm]}};
    const game=P.battle(entries,armOpts);
    const guardianTalents=entries.filter(e=>e.build.klass==='guardian').map(e=>e.build.talents);
    if(referenceRoster===null){
     referenceRoster=invariant;referenceInitial=initial(game);
     referenceGuardianTalents=guardianTalents;
    }else{
     assert.deepEqual(invariant,referenceRoster,'Only one M10 Guardian talent may differ');
     assert.deepEqual(initial(game),referenceInitial,'All initial positions and stats must match');
     assert.equal(guardianTalents.length,referenceGuardianTalents.length);
     for(let gi=0;gi<guardianTalents.length;gi++){
      const a=referenceGuardianTalents[gi],b=guardianTalents[gi];
      assert.deepEqual(a,b,'All ten Guardian talents must remain equipped and identical');
     }
    }
    const outcome=observe(game);
    const stats=group.arms[arm];
    stats.games++;stats.guardianWins+=Number(outcome.winnerClass==='guardian');
    stats.observedGuardians35+=outcome.observed35?
     scenario.allocation[3]:0;
    for(const key of ['alive35','shieldAbsorbed','shieldGranted','healed',
     'outgoingHit','knockouts','survival','guardianTalents','g10Casts'])stats[key]+=outcome[key];
    if(arm==='baseline'){
     baseline=outcome;
     if(ki===0&&shift===0&&profile==='balanced')
      assert.deepEqual(observe(P.battle(entries,{...opts,experimentalGuardianShieldScale:{G10:1}})),outcome,
       'Explicit G10 coefficient 1 must be identical to unmodified M10');
    }
    else{
     paired++;
     group.changedWinnerVsBaseline[arm]+=Number(outcome.winnerId!==baseline.winnerId);
     group.changedGuardianWinVsBaseline[arm]+=Number(
      (outcome.winnerClass==='guardian')!==(baseline.winnerClass==='guardian'));
    }
    if(ki===0&&shift===0&&profile==='balanced'){
     assert.deepEqual(observe(P.battle(entries,armOpts)),outcome,'Replay must be exact');
     replays++;
    }
    games++;
   }
   blocks++;group.blocks++;
  }
 }
 for(const arm of armNames){
  const stats=group.arms[arm];
  for(const key of ['shieldAbsorbed','shieldGranted','healed','outgoingHit','survival'])
   stats[key]=+stats[key].toFixed(2);
  assert.equal(stats.games,24);
  assert(stats.g10Casts>0,'G10 must actually cast in every tested arm');
 }
 report.scenarios.push(group);
}
assert.equal(blocks,48);assert.equal(games,144);assert.equal(paired,96);assert.equal(replays,6);
const m5=['guardian','hunter'].map((klass,i)=>({
 id:'trial-fixed-m5-'+i,approvedMissions:5,
 build:P.exampleBuild(klass,'trial-fixed-m5-'+i,5,i)}));
const m5opts={seed:20261101,arenaScale:5,damageScale:.5};
assert.throws(()=>P.battle(m5,{...m5opts,experimentalGuardianShieldScale:{G10:0}}),/M10/,
 'M5 must reject G10 shield diagnostic options');
assert.deepEqual(P.battle(m5,m5opts).run(),
 P.battle(m5,{...m5opts,arenaMission:5}).run(),'M5 remains unchanged');
report.totals={games,blocks,pairedComparisons:paired,exactReplays:replays,
 unchangedM5:true,realStudentsUsed:false};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.scenarios))
 .digest('hex').slice(0,20);
if(process.env.M10_G10_SHIELD_ONLY_REPORT_FILE){
 const file=path.resolve(process.env.M10_G10_SHIELD_ONLY_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 G10 SHIELD ONLY REPORT '+JSON.stringify(report));
console.log('PASS M10 G10 shield-only coefficient pairs: '+games+' games, '+paired+
 ' comparisons, '+replays+' exact replays; M5 unchanged.');

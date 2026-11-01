'use strict';
// H.3 M10: isolated paired sensitivity of G01/G10 shield AMOUNTS.
// Synthetic lab only. Never changes the default engine or M5.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const CLASSES=['warrior','mage','hunter','guardian'];
const APPROVALS=Array.from({length:10},(_,i)=>i+1);
const SEEDS=[20261101,4175863657,20261030];
const SCENARIOS=[
 {name:'four-balanced',allocation:[1,1,1,1]},
 {name:'thirty-balanced',allocation:[8,8,7,7]},
 {name:'thirty-half-guardian',allocation:[5,5,5,15]}
];
const ARCHETYPES={
 defensive:['G01','G10','J08','G05','J01','J03','G04'],
 mixed:['G01','G10','J08','L01','J01','J03','L08']
};
const OPTIONS={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2',limit:120};
const ARMS=[
 {name:'baseline',scale:null},
 {name:'g01-80',scale:{G01:.8,G10:1}},
 {name:'g10-80',scale:{G01:1,G10:.8}},
 {name:'both-80',scale:{G01:.8,G10:.8}}
];
function interleave(allocation){
 const left=[...allocation],out=[];
 while(left.some(x=>x>0))for(let i=0;i<4;i++)if(left[i]>0){
  out.push(CLASSES[i]);left[i]--;
 }
 return out;
}
function rotate(xs,shift){return xs.map((_,i)=>xs[(i+shift)%xs.length]);}
function entry(klass,slot,variant,kind,scenario){
 const id='trial-shield-paired-'+scenario+'-'+kind+'-'+slot;
 const m5=P.exampleBuild(klass,id,5,variant);
 const m10=P.exampleBuild(klass,id,10,variant,{experimentalFinal:true});
 let talents=m10.talents;
 if(klass==='guardian'){
  talents=[...m5.talents];
  for(const talent of ARCHETYPES[kind])if(!talents.includes(talent)&&talents.length<10)
   talents.push(talent);
  for(const talent of P.TALENTS.guardian.map(x=>x.id))
   if(talents.length<10&&!talents.includes(talent))talents.push(talent);
  assert(talents.includes('G01')&&talents.includes('G10'),
   'Every Guardian must carry both shield skills');
 }
 assert.equal(talents.length,10);
 assert.equal(new Set(talents).size,10);
 const adapted=policy.m10ArenaAdapter({rosterKey:id,klass,
  completedMissions:APPROVALS,
  build:{attributes:m10.attributes,talents},
  m5Entered:true,
  m5Frozen:{attributes:m5.attributes,talents:m5.talents},
  m10Locked:true});
 assert.equal(Object.values(adapted.build.attributes).reduce((a,b)=>a+b,0),20);
 assert.deepEqual(adapted.build.talents.slice(0,5),m5.talents);
 return {...adapted,id};
}
function snapshot(game){return game.fighters.map(f=>({
 id:f.id,klass:f.build.klass,build:f.build,stats:f.stats,hp:f.hp,
 basic:f.basic,x:f.x,z:f.z,face:f.face
}));}
function metrics(result,guardians){
 const events=result.events;
 const absorbed=events.filter(e=>e.type==='hit'&&guardians.has(e.target))
  .reduce((s,e)=>s+(e.absorbed||0),0);
 const casts=id=>events.filter(e=>e.type==='talent'&&e.talent===id&&guardians.has(e.hero)).length;
 return {
  winnerId:result.winner.id,winnerClass:result.winner.klass,
  duration:result.time,
  g01Casts:casts('G01'),g10Casts:casts('G10'),
  guardianShieldAbsorbed:+absorbed.toFixed(2),
  guardianDamage:+result.standings.filter(f=>guardians.has(f.id))
   .reduce((s,f)=>s+f.damage,0).toFixed(2),
  timeLimit:events.some(e=>e.type==='end'&&e.reason==='time-limit')
 };
}
const report={schema:'v5-m10-g01-g10-paired-shield-v1',synthetic:true,
 scope:'M10 10 talents/20 attributes; G01/G10 amount scaling only',
 options:OPTIONS,arms:ARMS,scenarios:[],limitations:[
  'Only shield amounts change: G10 solar buff, casts, cooldowns and AI are not directly changed.',
  'Later casts, targeting, RNG consumption and outcomes can diverge after the first changed shield.',
  'Seeds, builds and rotations are reused: observations are correlated, not population-level estimates.',
  'An 80% diagnostic arm is not a balance recommendation or production nerf.',
  'G.2 physical PCs and H.1/H.2 real student integration remain blocked.'
 ]};
let blocks=0,games=0,replays=0,baselineG01=0,baselineG10=0;
let changed={g01:0,g10:0,both:0},absorbedChanged={g01:0,g10:0,both:0};
for(let si=0;si<SCENARIOS.length;si++)for(const kind of Object.keys(ARCHETYPES)){
 const scenario=SCENARIOS[si],classes=interleave(scenario.allocation);
 const group={scenario:scenario.name,archetype:kind,allocation:scenario.allocation,
  blocks:0,guardianWins:Object.fromEntries(ARMS.map(a=>[a.name,0])),
  changedWinners:Object.fromEntries(ARMS.slice(1).map(a=>[a.name,0])),
  guardianShieldAbsorbed:Object.fromEntries(ARMS.map(a=>[a.name,0])),
  g01Casts:0,g10Casts:0,timeLimits:Object.fromEntries(ARMS.map(a=>[a.name,0]))};
 for(let k=0;k<SEEDS.length;k++)for(const shift of [0,Math.floor(classes.length/2)]){
  const rotated=rotate(classes,shift);
  const entries=rotated.map((klass,i)=>entry(klass,i,(i*7+k*3+si*5)%11,kind,si));
  const guardians=new Set(entries.filter(e=>e.build.klass==='guardian').map(e=>e.id));
  const seed=(SEEDS[k]+si*104729+shift*65537+classes.length*7919)>>>0;
  const options={...OPTIONS,seed,experimentalCritSeed:(seed^0xdecafbad)>>>0};
  const first=P.battle(entries,options),initial=snapshot(first);
  const baseline=first.run(),results={baseline};
  assert(baseline.finished&&baseline.winner);
  for(const arm of ARMS.slice(1)){
   const game=P.battle(entries,{...options,experimentalGuardianShieldScale:arm.scale});
   assert.deepEqual(snapshot(game),initial,
    'Shield scaling must preserve initial builds, attributes, positions and RNG state');
   const result=game.run();
   assert(result.finished&&result.winner);
   results[arm.name]=result;
  }
  const base=metrics(baseline,guardians);
  baselineG01+=base.g01Casts;baselineG10+=base.g10Casts;
  group.g01Casts+=base.g01Casts;group.g10Casts+=base.g10Casts;
  for(const arm of ARMS){
   const r=results[arm.name],m=metrics(r,guardians);
   assert.equal(r.events.filter(e=>e.type==='end').length,1);
   group.guardianWins[arm.name]+=Number(m.winnerClass==='guardian');
   group.guardianShieldAbsorbed[arm.name]+=m.guardianShieldAbsorbed;
   group.timeLimits[arm.name]+=Number(m.timeLimit);
   if(arm.name!=='baseline'){
    const suffix=arm.name==='g01-80'?'g01':arm.name==='g10-80'?'g10':'both';
    if(m.winnerId!==base.winnerId){changed[suffix]++;group.changedWinners[arm.name]++;}
    if(m.guardianShieldAbsorbed!==base.guardianShieldAbsorbed)absorbedChanged[suffix]++;
   }
  }
  if(k===0&&shift===0){
   assert.deepEqual(P.battle(entries,{...options,
    experimentalGuardianShieldScale:{G01:1,G10:1}}).run(),baseline,
    'Neutral scale must be byte-identical to baseline');
   for(const arm of ARMS){
    const opts=arm.scale?{...options,experimentalGuardianShieldScale:arm.scale}:options;
    assert.deepEqual(P.battle(entries,opts).run(),results[arm.name],
     'Each arm must replay deterministically');
    replays++;
   }
  }
  blocks++;games+=ARMS.length;group.blocks++;
 }
 report.scenarios.push(group);
}
assert.equal(blocks,36);assert.equal(games,144);assert.equal(replays,24);
assert(baselineG01>0&&baselineG10>0,
 'Both G01 and G10 must actually cast in the tested baseline fixtures');
const m5=['guardian','hunter'].map((klass,i)=>({
 id:'trial-shield-m5-'+i,approvedMissions:5,
 build:P.exampleBuild(klass,'trial-shield-m5-'+i,5,i)
}));
const m5opts={seed:20261101,arenaScale:5,damageScale:.5};
assert.deepEqual(P.battle(m5,m5opts).run(),
 P.battle(m5,{...m5opts,arenaMission:5}).run());
assert.throws(()=>P.battle(m5,{...m5opts,
 experimentalGuardianShieldScale:{G01:.8}}),/Escala experimental/);
const final=[entry('guardian',0,0,'defensive',0),entry('hunter',1,0,'defensive',0)];
for(const bad of [-1,1.1,NaN,Infinity,'0.8'])
 assert.throws(()=>P.battle(final,{...OPTIONS,
  experimentalGuardianShieldScale:{G01:bad}}),/Escala experimental/);
assert.throws(()=>P.battle(final,{...OPTIONS,
 experimentalGuardianShieldScale:{G01:.8},experimentalGuardianTalentAblation:'G01'}),
 /mutuamente exclusiv/);
report.totals={blocks,games,replays,baselineG01,baselineG10,changed,
 absorbedChanged,m5Unchanged:true,realStudentsUsed:false};
report.hash=crypto.createHash('sha256').update(JSON.stringify(report.scenarios))
 .digest('hex').slice(0,20);
if(process.env.M10_SHIELD_PAIRED_REPORT_FILE){
 const file=path.resolve(process.env.M10_SHIELD_PAIRED_REPORT_FILE);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('M10 G01/G10 PAIRED SHIELD REPORT '+JSON.stringify(report));
console.log('PASS M10 paired shield amounts: '+games+' games, '+blocks+
 ' blocks, '+replays+' deterministic replays; M5 unchanged.');

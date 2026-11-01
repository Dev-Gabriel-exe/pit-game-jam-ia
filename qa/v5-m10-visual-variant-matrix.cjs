'use strict';
// H.3/M10: 11 synthetic 30-KayKit roster variants. Coverage of selections
// is not proof that all 120 talents activate in a match or are balanced.
// No accounts, classroom state, XP, approvals, persistence or network.
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const R=require('../v5/m10-visual-roster.js');
const policy=H.createPolicy(P.TALENTS);
const classes=Object.keys(P.CLASSES).sort();
assert.deepEqual(classes,['guardian','hunter','mage','warrior']);
const catalog=new Set(classes.flatMap(k=>P.TALENTS[k].map(t=>k+':'+t.id)));
assert.equal(catalog.size,120,'The canonical 4-class catalog must contain 120 class-qualified talents');
const seen=new Set();
const config={arenaMission:10,seed:4175863657,limit:145,arenaScale:5,
 damageScale:.5,mageDamageBonus:1.1,stormDelay:40,stormRateFactor:.55,
 engagementMode:'spaced',navigationMode:'steer',rangedCommitment:'recovery',
 balancePreset:'e-hp2'};
const variantsToReplay=new Set([0,5,10]);
let verifiedBuilds=0,replays=0;
for(let variant=0;variant<=10;variant++){
 const roster=R.createRoster(P,policy,{count:30,variant});
 assert.equal(roster.length,30);
 assert.equal(new Set(roster.map(x=>x.id)).size,30);
 const classCounts=Object.fromEntries(classes.map(k=>[k,0]));
 for(let i=0;i<roster.length;i++){
  const player=roster[i],build=player.build,klass=build.klass;
  classCounts[klass]++;
  assert.equal(player.finalTrial,true);
  assert.equal(player.approvedMissions,10);
  assert.equal(build.approvedMissions,10);
  assert.equal(build.talents.length,10);
  assert.equal(new Set(build.talents).size,10);
  assert.equal(Object.values(build.attributes).reduce((sum,n)=>sum+n,0),20);
  const choice=(Math.floor(i/4)+variant)%11;
  const frozen=P.exampleBuild(klass,player.name,5,choice);
  assert.deepEqual(build.talents.slice(0,5),frozen.talents,
   'M10 must preserve all five M5 talent choices');
  for(const attr of P.ATTR)assert(build.attributes[attr]>=frozen.attributes[attr],
   'M10 cannot withdraw frozen M5 attribute points');
  for(const talent of build.talents){
   const key=klass+':'+talent;
   assert(catalog.has(key),'A roster selected an off-class or unknown talent');
   seen.add(key);
  }
  verifiedBuilds++;
 }
 assert.deepEqual(classCounts,{guardian:7,hunter:7,mage:8,warrior:8});
 assert.throws(()=>P.battle(roster,{...config,arenaMission:5}),
  /M5 não aceita build final M10/,'M5 must reject all final M10 rosters');
 if(variantsToReplay.has(variant)){
  const opts={...config,seed:config.seed+variant};
  const first=P.battle(roster,opts).run(3000);
  const second=P.battle(roster,opts).run(3000);
  assert.deepEqual(second,first,'M10 must replay exactly with variant '+variant);
  assert(first.finished&&first.winner,'Each 30-player M10 battle must finish');
  assert.equal(first.standings.length,30);
  assert(first.events.some(e=>e.type==='talent'),'Talents must fire in M10');
  replays++;
  console.log('M10 variant '+variant+': winner='+first.winner.klass+
   ', t='+first.time+'s, events='+first.events.length);
 }
}
assert.deepEqual([...seen].sort(),[...catalog].sort(),
 'Across all eleven synthetic variants every canonical class talent must be selectable');
const m5=[
 {id:'trial-m5-warrior',approvedMissions:5,build:P.exampleBuild('warrior','M5 Warrior',5,4)},
 {id:'trial-m5-mage',approvedMissions:5,build:P.exampleBuild('mage','M5 Mage',5,7)}
];
const m5Config={seed:4175863657,arenaScale:5,damageScale:.5};
const before=P.battle(m5,m5Config).run(3000);
const after=P.battle(m5,{...m5Config,arenaMission:5}).run(3000);
assert.deepEqual(after,before,'Legacy M5 result must remain byte-identical');
console.log('PASS M10 11 variants, '+verifiedBuilds+' fictitious builds, 120/120 canonical talents selectable, '+
 replays+' deterministic 30-KayKit replay pairs; frozen M5 and legacy result preserved. G.2 NOT tested.');

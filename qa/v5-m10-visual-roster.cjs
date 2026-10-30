'use strict';
// H.3 isolated visual roster gates: 10 talents, 20 points, M5 untouched.
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const R=require('../v5/m10-visual-roster.js');
const ID=require('../v5/build-identity.js');
const VFX=require('../v5/talent-vfx.js');
const policy=H.createPolicy(P.TALENTS);
const config={seed:4175863657,limit:145,arenaScale:5,damageScale:.5,
 mageDamageBonus:1.1,stormDelay:40,stormRateFactor:.55,
 engagementMode:'spaced',navigationMode:'steer',rangedCommitment:'recovery',
 balancePreset:'e-hp2'};
assert.throws(()=>R.createRoster(P,policy,{count:3}),/quantidade/);
assert.throws(()=>R.createRoster(P,policy,{count:30,variant:11}),/variante/);
for(const count of [4,30]){
 for(const variant of [0,3,10]){
  const players=R.createRoster(P,policy,{count,variant});
  assert.equal(players.length,count);
  assert.equal(new Set(players.map(x=>x.id)).size,count);
  assert(Object.isFrozen(players)&&Object.isFrozen(players[0]));
  for(const u of players){
   assert.equal(u.finalTrial,true);
   assert.equal(u.approvedMissions,10);
   assert.equal(u.build.approvedMissions,10);
   assert.equal(u.build.talents.length,10);
   assert.equal(new Set(u.build.talents).size,10);
   assert.equal(Object.values(u.build.attributes).reduce((a,b)=>a+b,0),20);
   assert(ID.describe(u.build,P,VFX).visualId,'Every final 3D hero has a valid canonical visual identity');
  }
  assert.throws(()=>P.battle(players,{...config,arenaMission:5}),/M5 não aceita build final M10/);
 }
 const players=R.createRoster(P,policy,{count});
 const a=P.battle(players,{...config,arenaMission:10}).run(3000);
 const b=P.battle(players,{...config,arenaMission:10}).run(3000);
 assert.equal(a.finished,true);assert.deepEqual(a,b,'M10 camera/GLB roster cannot corrupt replay determinism');
 assert(a.events.some(e=>e.type==='talent'));
 console.log('PASS M10 visual '+count+' heroes, 10 talents/20 points, deterministic winner '+a.winner.klass+' at '+a.time+'s');
}
const warriors=P.exampleBuild('warrior','M5',5,0);
const m5=[{id:'m5-w',approvedMissions:5,build:warriors},
 {id:'m5-m',approvedMissions:5,build:P.exampleBuild('mage','M5 Mago',5,0)}];
const m5a=P.battle(m5,{...config,arenaMission:5}).run(3000);
const m5b=P.battle(m5,config).run(3000);
assert.deepEqual(m5a,m5b,'M5 legacy default and explicit mission5 must match');
console.log('PASS M10 visual adapter: six roster variants and fixed M5 regressions; no student writes.');

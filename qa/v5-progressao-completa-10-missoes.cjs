'use strict';
/* PIT Game Jam IA V5 — complete M01..M10 pedagogical reward simulation.
 * Models real teacher-approved stage rows using the production V2 rules,
 * but uses four fictional build records in memory. No API, DB or XP writes.
 * A separate existing Postgres/Playwright suite verifies persistence and CAS.
 */
const assert=require('node:assert/strict');
const engine=require('../v5/phase2-combat.js');
const H0=require('../v5/progression-contract-h0.js');
const H1=require('../v5/student-bridge-h1.js');
const V2=require('../chat-api/lib/v5-build-v2-contract.js');
const ids=require('../chat-api/lib/v5-phase2-talent-ids.json');
const policy=H0.createPolicy(engine.TALENTS);
const ATTR=['FOR','DES','INT','VIT','DEF'];
const priority={warrior:'FOR',mage:'INT',hunter:'DES',guardian:'DEF'};
const empty=()=>Object.fromEntries(ATTR.map(k=>[k,0]));
const stages=n=>Array.from({length:n},(_,i)=>({stage:i+1,status:'approved'}));
const buildFor=(klass,n)=>{
 const attributes=empty();attributes[priority[klass]]=2*n;
 return {klass,attributes,talents:ids.classes[klass].slice(0,n)};
};
let assertions=0;
for(const klass of V2.CLASSES){
 let persisted=null,previousXp=0,baseline=null;
 const stageRows=[];
 const snaps=[];
 for(let mission=1;mission<=10;mission++){
  // Submitting or receiving a revision does not award XP, stats or talents.
  for(const pending of ['working','submitted','revision']){
   const rows=[...stageRows,{stage:mission,status:pending}];
   const progress=V2.progressOf(rows,mission);
   const bridge=H1.progressOf(rows,mission);
   assert.equal(progress.approvedMissions,mission-1);
   assert.equal(progress.approvedBaseXp,previousXp);
   assert.equal(bridge.approvedBaseXp,previousXp);
   assert.equal(bridge.approvedMissions,mission-1);
   assert.equal(progress.awaitingPeers,pending==='submitted');
   const early=buildFor(klass,mission);
   assert.throws(()=>V2.normalizeBuild(early,progress.approvedMissions),/pontos acima|talentos inválidos/);
   assert.throws(()=>policy.validateBuild(early,klass,mission-1),/pontos excedem|mais de 1 talento/);
   assertions+=7;
  }
  // A teacher approval is unique for each stage (stage primary key).
  stageRows.push({stage:mission,status:'approved'});
  const progress=V2.progressOf(stageRows,mission);
  const bridge=H1.progressOf(stageRows,mission);
  const b=buildFor(klass,mission);
  assert.equal(progress.approvedMissions,mission);
  assert.equal(bridge.approvedMissions,mission);
  assert.equal(progress.approvedBaseXp,mission*100);
  assert.equal(bridge.approvedBaseXp,mission*100);
  assert.equal(progress.approvedBaseXp-previousXp,100);
  assert.equal(V2.normalizeBuild(b,mission).spentAttributes,mission*2);
  assert.equal(V2.normalizeBuild(b,mission).talents.length,mission);
  const plan=V2.planSave(persisted,b,progress);
  assert.equal(plan.kind,persisted?'update':'insert');
  persisted={
   schema_version:2,revision:(persisted?.revision||0)+1,
   klass,attributes:{...plan.build.attributes},talents:[...plan.build.talents],
   m5_snapshot:baseline,m10_snapshot:null
  };
  // A second read of approved rows cannot grant another 100 XP.
  assert.equal(V2.progressOf([...stageRows],mission).approvedBaseXp,mission*100);
  assert.throws(()=>V2.normalizeBuild({...b,xp:99999},mission),/formato/);
  if(mission===5){
   const freeze=V2.planM5Entry(persisted,progress);
   assert.equal(freeze.kind,'freeze-m5');
   baseline=structuredClone(freeze.snapshot);
   persisted.m5_snapshot=structuredClone(baseline);
   assert.deepEqual(baseline,{attributes:b.attributes,talents:b.talents});
   assert.equal(V2.planM5Entry(persisted,progress).kind,'noop');
   const candidate={rosterKey:'trial-'+klass,klass,completedMissions:[1,2,3,4,5],
    build:{attributes:{...b.attributes},talents:[...b.talents]},
    m5Entered:true,m5Frozen:baseline,m10Locked:false};
   assert.equal(policy.m5ArenaAdapter(candidate).build.talents.length,5);
   assert.equal(engine.canonical(b,5).talents.length,5);
  }
  if(mission===10){
   const secondary=ATTR.find(k=>k!==priority[klass]);
   assert.throws(()=>V2.planSave(persisted,{
    ...b,attributes:{...b.attributes,[priority[klass]]:9,[secondary]:11}
   },progress),/congelados|pontos acima|talentos inválidos/);
   const locked=V2.planM10Lock(persisted,progress);
   assert.equal(locked.kind,'lock-m10');
   persisted.m10_snapshot=structuredClone(locked.snapshot);
   assert.equal(V2.planM10Lock(persisted,progress).kind,'noop');
   assert.throws(()=>V2.planSave(persisted,{
    ...b,talents:[...b.talents].reverse()
   },progress),/travado/);
   const payload=engine.canonical(b,10,{experimentalFinal:true});
   assert.equal(payload.talents.length,10);
   const candidate={rosterKey:'trial-'+klass,klass,
    completedMissions:Array.from({length:10},(_,i)=>i+1),
    build:{attributes:{...b.attributes},talents:[...b.talents]},
    m5Entered:true,m5Frozen:baseline,m10Locked:true};
   assert.equal(policy.m10ArenaAdapter(candidate).build.talents.length,10);
  }
  previousXp=progress.approvedBaseXp;
  snaps.push({mission,xp:previousXp,attributes:2*mission,talents:mission});
  assertions+=12;
 }
 assert.equal(previousXp,1000);
 assert.equal(persisted.m5_snapshot.talents.length,5);
 assert.equal(persisted.m10_snapshot.talents.length,10);
 assert.equal(persisted.attributes[priority[klass]],20);
 assert.equal(snaps.length,10);
 for(const row of snaps)assert.deepEqual(row,{
  mission:row.mission,xp:100*row.mission,
  attributes:2*row.mission,talents:row.mission});
 console.log('PASS '+klass+': M01→M10, 1000 XP derived from ten approved stages, 20 attributes, 10 talents, M5/M10 locks; no bonus on submitted/revision');
}
// Database-backed hero API and teacher status are tested separately with fake
// Postgres: this suite never awards XP or changes student identity/grades.
assert.equal(V2.CLASSES.length,4);
assert.equal(Object.values(ids.classes).reduce((total,list)=>total+list.length,0),120);
console.log('PASS complete V5 reward progression: 4 classes × 10 stages = 40 approvals; 100 XP / 2 attribute points / 1 talent per approval; '+assertions+' tracked rule assertions, NO PERSISTENT XP LEDGER');

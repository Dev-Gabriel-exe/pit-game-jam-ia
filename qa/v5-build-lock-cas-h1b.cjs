'use strict';
// Dry-run H1b only. No database, user identity, teacher PIN or awarded XP.
const assert=require('node:assert/strict');
const engine=require('../v5/phase2-combat.js');
const H0=require('../v5/progression-contract-h0.js');
const CAS=require('../v5/build-lock-cas-h1b-lab.js');
const policy=H0.createPolicy(engine.TALENTS);
const approvals=n=>Array.from({length:n},(_,i)=>i+1);
const five=engine.exampleBuild('warrior','trial-candidate',5,0);
const ten=engine.exampleBuild('warrior','trial-candidate',10,0,{experimentalFinal:true});
const base={roomKey:'trial-room-h1b',rosterKey:'trial-candidate',
 klass:'warrior',completedMissions:approvals(5),
 build:{attributes:{...five.attributes},talents:[...five.talents]}};
const student='trial-student',teacher='trial-teacher';
const tx=(state,type,index,payload=null,actor=student,revision=state.revision)=>
 CAS.apply(state,policy,{key:'trial-command-'+index,type,actor,payload,expectedRevision:revision});
let state=CAS.createRecord(policy,base),first=state;
assert.equal(state.revision,0);
assert(Object.isFrozen(state));assert(Object.isFrozen(state.build.attributes));
assert.throws(()=>tx(state,'approve-next',0,{stage:6},teacher),/posterior ao lock/);
assert.throws(()=>tx(state,'enter-m5',1,null,teacher),/primeira entrada/);
assert.throws(()=>CAS.createRecord(policy,{...base,completedMissions:[1,2,3,5,6]}),/consecutivas/);
assert.throws(()=>CAS.createRecord(policy,{...base,rosterKey:'real-student-123'}),/fictícias consecutivas/);
assert.throws(()=>tx(state,'edit',2,{build:{...base.build,talents:[...base.build.talents,'B09']}}),/mais de 1 talento/);
state=tx(state,'enter-m5',3);
assert.equal(state.m5Entered,true);
assert.deepEqual(state.m5Frozen,base.build);
const entered=state;
assert.equal(tx(state,'enter-m5',3),entered,'duplicate command is idempotent');
assert.throws(()=>CAS.apply(state,policy,{key:'trial-command-3',actor:student,type:'edit',
 expectedRevision:state.revision,payload:{build:base.build}}),/reutilizada/);
assert.throws(()=>tx(state,'approve-next',4,{stage:6},teacher,0),/revisão/);
assert.throws(()=>tx(state,'enter-m5',5),/primeira entrada/);
for(let stage=6;stage<=10;stage++){
 const stale=state.revision;
 state=tx(state,'approve-next','approval-'+stage,{stage},teacher);
 assert.equal(state.completedMissions.length,stage);
 assert.equal(tx(state,'approve-next','approval-'+stage,{stage},teacher,stale),state);
 assert.throws(()=>tx(state,'approve-next','out-of-sequence-'+stage,{stage:stage+2},teacher),/sequencial/);
}
assert.equal(state.completedMissions.length,10);
assert.throws(()=>tx(state,'edit','tamper-m5',{build:{attributes:{...ten.attributes,FOR:0},talents:[...ten.talents]}}),/congelados/);
assert.throws(()=>tx(state,'edit','drop-talent',{build:{attributes:{...ten.attributes},talents:[...ten.talents.slice(1)]}}),/congelados/);
const selected={attributes:{...ten.attributes},talents:[...ten.talents]};
state=tx(state,'edit','final-build',{build:selected});
assert.deepEqual(state.build,selected);
assert.throws(()=>tx(state,'lock-m10','teacher-lock',null,teacher),/lock final/);
state=tx(state,'lock-m10','final-lock');
assert.equal(state.m10Locked,true);
const finished=state;
assert.equal(tx(state,'lock-m10','final-lock'),finished);
assert.throws(()=>tx(state,'edit','after-final',{build:selected}),/edição proibida/);
assert.throws(()=>tx(state,'approve-next','after-final-approval',{stage:11},teacher),/sequencial/);
assert.equal(state.commands.length,8);
const snap=policy.validateCandidate({...state,completedMissions:state.completedMissions},{mission:10});
assert.equal(snap.m10Locked,true);
assert.equal(snap.approvedBaseXp,1000,'H0 derives XP budget but CAS does not grant XP');
assert.equal(JSON.stringify(state).includes('studentId'),false);
assert.equal(JSON.stringify(state).includes('approvedBaseXp'),false);
assert.equal(first.revision,0,'prior snapshots not mutated');
console.log('PASS H1b dry-run: exact replay idempotent, stale revision rejected, M5 snapshot immutable, sequential teacher approval and irreversible M10 lock');

'use strict';
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const H0=require('../v5/progression-contract-h0.js');
const V2=require('../chat-api/lib/v5-build-v2-contract.js');
const {createRepository,BuildConflict,BuildForbidden}=
 require('../chat-api/lib/v5-builds-v2-repository.js');
const ids=require('../chat-api/lib/v5-phase2-talent-ids.json');
assert.equal(ids.schemaVersion,2);
assert.deepEqual(V2.CLASSES,H0.CLASSES);
for(const klass of V2.CLASSES){
 assert.equal(P.TALENTS[klass].length,30);
 assert.deepEqual(ids.classes[klass],P.TALENTS[klass].map(x=>x.id),
  'Never deploy a stale server talent catalog: '+klass);
}
function build(klass,n,changes={}){
 return {klass,attributes:{FOR:n*2,DES:0,INT:0,VIT:0,DEF:0,...changes},
  talents:ids.classes[klass].slice(0,n)};
}
function stages(n){return Array.from({length:n},(_,i)=>({stage:i+1,status:'approved'}))}
let checks=0;
for(const klass of V2.CLASSES){
 const three=V2.progressOf(stages(3),3);
 const b=build(klass,3);
 const plan=V2.planSave(null,b,three);
 assert.equal(plan.kind,'insert');
 assert.deepEqual(plan.build.talents,b.talents);
 const legacy={klass,attributes:{power:6,agility:0,spirit:0,vitality:0},talents:{fury:1}};
 assert.throws(()=>V2.normalizeBuild(legacy,3),/cinco atributos|formato/);
 assert.throws(()=>V2.planSave(null,{...b,xp:300},three),/formato/);
 assert.throws(()=>V2.normalizeBuild({...b,talents:[ids.classes[klass][0],ids.classes[klass][0]]},3),/repetidos/);
 assert.throws(()=>V2.normalizeBuild({...b,talents:[ids.classes[V2.CLASSES.find(c=>c!==klass)][0]]},3),/talentos/);
 checks++;
}
assert.throws(()=>V2.progressOf([{stage:2,status:'approved'}],2),/fora de ordem/);
assert.throws(()=>V2.progressOf([...stages(2),{stage:2,status:'submitted'}],2),/duplicada/);
assert.throws(()=>V2.progressOf([...stages(3)],2),/inválida/);
assert.equal(V2.progressOf([...stages(2),{stage:3,status:'submitted'}],3).approvedMissions,2);
assert.equal(V2.progressOf([...stages(2),{stage:3,status:'submitted'}],3).awaitingPeers,true);
assert.equal(V2.progressOf([...stages(2),{stage:3,status:'working'}],3).awaitingPeers,false);

// Controlled fake PG driver: verifies SQL is parameterized, transaction begins,
// membership is checked, revision is compare-and-swap, and errors roll back.
const STUDENT='11111111-1111-4111-8111-111111111111',ROOM='TRIAL-ROOM';
const state={row:null,approved:3,release:3,tokenValid:true,commits:0,rollbacks:0,releases:0};
const clone=o=>o==null?null:structuredClone(o);
const pool={async connect(){
 let before=null;
 return {async query(sql,values=[]){
  if(sql==='BEGIN'){before=clone(state.row);return {rowCount:0,rows:[]}}
  if(sql==='COMMIT'){state.commits++;before=null;return {rowCount:0,rows:[]}}
  if(sql==='ROLLBACK'){state.row=before;state.rollbacks++;return {rowCount:0,rows:[]}}
  if(sql.startsWith('SELECT id FROM pit_students')){
   return {rowCount:state.tokenValid&&values[0]===STUDENT&&values[1]===ROOM?1:0,
    rows:state.tokenValid?[{id:STUDENT}]:[]};
  }
  if(sql.startsWith('SELECT current_stage FROM pit_classroom_state'))
   return {rowCount:1,rows:[{current_stage:state.release}]};
  if(sql.startsWith('SELECT stage,status FROM pit_student_stages'))
   return {rowCount:state.approved,rows:stages(state.approved)};
  if(sql.startsWith('SELECT schema_version,klass,attributes,talents,revision,m5_snapshot,m10_snapshot'))
   return {rowCount:state.row?1:0,rows:state.row?[clone(state.row)]:[]};
  if(sql.startsWith('INSERT INTO pit_hero_builds_v2')){
   assert.match(sql,/ON CONFLICT\(student_id\) DO NOTHING/);
   if(state.row)return {rowCount:0,rows:[]};
   state.row={schema_version:2,klass:values[2],attributes:JSON.parse(values[3]),
    talents:JSON.parse(values[4]),revision:1,m5_snapshot:null,m10_snapshot:null};
   return {rowCount:1,rows:[clone(state.row)]};
  }
  if(sql.startsWith('UPDATE pit_hero_builds_v2')){
   if(!state.row||values[0]!==STUDENT||values[1]!==ROOM)
    return {rowCount:0,rows:[]};
   if(sql.includes('SET m5_snapshot=')){
    assert.equal(state.row.revision,values[3]);assert.equal(state.row.m5_snapshot,null);
    state.row.m5_snapshot=JSON.parse(values[2]);
   }else if(sql.includes('SET m10_snapshot=')){
    assert.equal(state.row.revision,values[3]);assert.equal(state.row.m10_snapshot,null);
    state.row.m10_snapshot=JSON.parse(values[2]);
   }else{
    assert.equal(state.row.revision,values[5]);
    state.row.klass=values[2];
    state.row.attributes=JSON.parse(values[3]);state.row.talents=JSON.parse(values[4]);
   }
   state.row.revision++;
   return {rowCount:1,rows:[clone(state.row)]};
  }
  throw Error('Unexpected PG SQL: '+sql);
 },release(){state.releases++}};
}};
const student={id:STUDENT,roomCode:ROOM};
const repo=createRepository(pool);
(async()=>{
 assert.equal((await repo.profile(student)).revision,0);
 let view=await repo.save(student,{expectedRevision:0,build:build('warrior',3)});
 assert.equal(view.revision,1);
 assert.equal(view.progress.approvedBaseXp,300);
 assert(!JSON.stringify(view).includes(STUDENT),'No exposed real student UUID');
 assert.equal((await repo.save(student,{expectedRevision:1,build:build('warrior',3)})).revision,1,
  'Identical build does not bump revision');
 await assert.rejects(()=>repo.save(student,{expectedRevision:0,build:build('warrior',3)}),BuildConflict);
 await assert.rejects(()=>repo.save(student,{expectedRevision:1,build:build('mage',3)}),/classe/);
 await assert.rejects(()=>repo.save(student,{expectedRevision:1,build:{...build('warrior',3),xp:999}}),/formato/);
 await assert.rejects(()=>repo.save({...student,roomCode:'OTHER'},{
  expectedRevision:1,build:build('warrior',3)}),BuildForbidden);
 state.approved=5;state.release=5;
 await assert.rejects(()=>repo.enterM5(student,{expectedRevision:1}),/distribua todos/);
 view=await repo.save(student,{expectedRevision:1,build:build('warrior',5)});
 assert.equal(view.revision,2);
 view=await repo.enterM5(student,{expectedRevision:2});
 assert.equal(view.revision,3);assert.equal(view.arena.m5Entered,true);
 assert.equal((await repo.enterM5(student,{expectedRevision:2})).revision,3,
  'M5 entry retry is idempotent');
 state.approved=6;state.release=6;
 let extra=build('warrior',6,{FOR:10,DEF:2});
 view=await repo.save(student,{expectedRevision:3,build:extra});
 assert.equal(view.revision,4);
 await assert.rejects(()=>repo.save(student,{expectedRevision:4,
  build:build('warrior',6,{FOR:9,DEF:3})}),/congelados/);
 await assert.rejects(()=>repo.save(student,{expectedRevision:4,
  build:{...extra,talents:extra.talents.slice(1)}}),/congelados/);
 state.approved=10;state.release=10;
 let end=build('warrior',10,{FOR:10,DEF:10});
 view=await repo.save(student,{expectedRevision:4,build:end});
 assert.equal(view.revision,5);
 view=await repo.lockM10(student,{expectedRevision:5});
 assert.equal(view.revision,6);assert.equal(view.arena.m10Locked,true);
 assert.equal((await repo.lockM10(student,{expectedRevision:5})).revision,6,
  'M10 lock retry is idempotent');
 await assert.rejects(()=>repo.save(student,{expectedRevision:6,build:{
  ...end,attributes:{...end.attributes,FOR:11,DEF:9}}}),/travado/);
 assert.equal((await repo.profile(student)).revision,6);
 assert.equal(state.rollbacks>=6,true,'Invalid operations are rolled back');
 assert.equal(state.releases,state.commits+state.rollbacks,'Every connection is released');
 console.log('PASS V5 H1b: '+checks+' classes, catalog 120 parity, stage permissions, CAS, membership, M5/M10 atomic locks; no database used.');
})().catch(e=>{console.error(e);process.exitCode=1});

'use strict';
/*
 * H.1b laboratory-only PG transaction adapter. NOT imported by live API routes.
 * The future endpoint must authenticate x-pit-student-token exactly as the V3
 * classroom service does, then pass server-verified {id,roomCode}.
 * No client-supplied student IDs, room codes, XP, approvals or locks.
 */
const C=require('./v5-build-v2-contract.js');
class BuildConflict extends Error{
 constructor(message){super(message);this.name='BuildConflict';this.code='V5_REVISION_CONFLICT';this.status=409}
}
class BuildForbidden extends Error{
 constructor(message){super(message);this.name='BuildForbidden';this.code='V5_STUDENT_FORBIDDEN';this.status=403}
}
const ROW_SELECT='SELECT schema_version,klass,attributes,talents,revision,m5_snapshot,m10_snapshot FROM pit_hero_builds_v2 WHERE student_id=$1 AND room_code=$2 FOR UPDATE';
function assertIdentity(student){
 if(!student||!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(student.id||'')||
  typeof student.roomCode!=='string'||student.roomCode.length<1||student.roomCode.length>80)
  throw new BuildForbidden('Identidade autenticada pelo servidor obrigatória');
}
function assertRevision(value){
 if(!Number.isInteger(value)||value<0||value>2147483647)
  throw new BuildConflict('Revisão do personagem inválida');
}
function assertParams(p,keys){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!keys.includes(k))||!keys.every(k=>Object.prototype.hasOwnProperty.call(p,k)))
  throw Error('H1b: parâmetros de alteração não autorizados');
}
function createRepository(pool){
 if(!pool||typeof pool.connect!=='function')throw Error('H1b: pool PostgreSQL obrigatório');
 async function tx(verifiedStudent,callback){
  assertIdentity(verifiedStudent);
  const db=await pool.connect();
  let began=false;
  try{
   await db.query('BEGIN');began=true;
   // Serializes first INSERT and subsequent updates for this student.
   const member=await db.query('SELECT id FROM pit_students WHERE id=$1 AND room_code=$2 FOR UPDATE',
    [verifiedStudent.id,verifiedStudent.roomCode]);
   if(member.rowCount!==1)throw new BuildForbidden('Aluno não pertence à turma autenticada');
   const classState=await db.query(
    'SELECT current_stage FROM pit_classroom_state WHERE room_code=$1 FOR SHARE',
    [verifiedStudent.roomCode]);
   if(classState.rowCount!==1)throw new BuildForbidden('Turma não inicializada');
   const stages=await db.query(
    'SELECT stage,status FROM pit_student_stages WHERE student_id=$1 ORDER BY stage FOR SHARE',
    [verifiedStudent.id]);
   const progress=C.progressOf(stages.rows,Number(classState.rows[0].current_stage));
   const rowResult=await db.query(ROW_SELECT,[verifiedStudent.id,verifiedStudent.roomCode]);
   const row=rowResult.rows[0]||null;
   const result=await callback({db,row,progress,id:verifiedStudent.id,room:verifiedStudent.roomCode});
   await db.query('COMMIT');began=false;
   return result;
  }catch(err){
   if(began)try{await db.query('ROLLBACK')}catch{/* Preserve original failure */}
   throw err;
  }finally{db.release()}
 }
 async function profile(verifiedStudent){
  return tx(verifiedStudent,async({row,progress})=>C.publicView(row,progress));
 }
 async function save(verifiedStudent,params){
  assertParams(params,['expectedRevision','build']);
  assertRevision(params.expectedRevision);
  return tx(verifiedStudent,async({db,row,progress,id,room})=>{
   if((row?.revision||0)!==params.expectedRevision)
    throw new BuildConflict('O personagem mudou em outra aba. Atualize antes de salvar.');
   const plan=C.planSave(row,params.build,progress);
   if(plan.kind==='noop')return C.publicView(row,progress);
   let q;
   if(plan.kind==='insert'){
    q=await db.query(
     'INSERT INTO pit_hero_builds_v2 (student_id,room_code,schema_version,klass,attributes,talents,revision) '+
     'VALUES ($1,$2,2,$3,$4::jsonb,$5::jsonb,1) ON CONFLICT(student_id) DO NOTHING '+
     'RETURNING schema_version,klass,attributes,talents,revision,m5_snapshot,m10_snapshot',
     [id,room,plan.build.klass,JSON.stringify(plan.build.attributes),JSON.stringify(plan.build.talents)]);
   }else{
    q=await db.query(
     'UPDATE pit_hero_builds_v2 SET klass=$3,attributes=$4::jsonb,talents=$5::jsonb,'+
     'revision=revision+1,updated_at=NOW() WHERE student_id=$1 AND room_code=$2 AND revision=$6 '+
     'RETURNING schema_version,klass,attributes,talents,revision,m5_snapshot,m10_snapshot',
     [id,room,plan.build.klass,JSON.stringify(plan.build.attributes),
      JSON.stringify(plan.build.talents),row.revision]);
   }
   if(q.rowCount!==1)throw new BuildConflict('A gravação não encontrou a revisão esperada');
   return C.publicView(q.rows[0],progress);
  });
 }
 async function lock(verifiedStudent,params,mission){
  assertParams(params,['expectedRevision']);
  assertRevision(params.expectedRevision);
  return tx(verifiedStudent,async({db,row,progress,id,room})=>{
   const plan=mission===5?C.planM5Entry(row,progress):C.planM10Lock(row,progress);
   // Replaying a successful lock is harmless, even with an outdated revision.
   if(plan.kind==='noop')return C.publicView(row,progress);
   if(!row||row.revision!==params.expectedRevision)
    throw new BuildConflict('O personagem mudou. Recarregue antes de entrar na arena.');
   const m5=mission===5;
   const sql=m5
    ? 'UPDATE pit_hero_builds_v2 SET m5_snapshot=$3::jsonb,m5_entered_at=NOW(),'+
      'revision=revision+1,updated_at=NOW() WHERE student_id=$1 AND room_code=$2 '+
      'AND revision=$4 AND m5_snapshot IS NULL '+
      'RETURNING schema_version,klass,attributes,talents,revision,m5_snapshot,m10_snapshot'
    : 'UPDATE pit_hero_builds_v2 SET m10_snapshot=$3::jsonb,m10_locked_at=NOW(),'+
      'revision=revision+1,updated_at=NOW() WHERE student_id=$1 AND room_code=$2 '+
      'AND revision=$4 AND m10_snapshot IS NULL '+
      'RETURNING schema_version,klass,attributes,talents,revision,m5_snapshot,m10_snapshot';
   const out=await db.query(sql,[id,room,JSON.stringify(plan.snapshot),row.revision]);
   if(out.rowCount!==1)throw new BuildConflict('Entrada simultânea detectada; atualize a arena.');
   return C.publicView(out.rows[0],progress);
  });
 }
 return Object.freeze({profile,save,enterM5:(student,p)=>lock(student,p,5),
  lockM10:(student,p)=>lock(student,p,10)});
}
module.exports={createRepository,BuildConflict,BuildForbidden};

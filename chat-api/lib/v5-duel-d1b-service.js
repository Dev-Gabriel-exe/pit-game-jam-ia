'use strict';
/* D.1b: invite-authorized match record. The ONLY combat execution is server-side.
 * Reconnection reuses the same immutable replay. Neither viewer can decide
 * damage, select builds, create winner, or award XP/grades.
 */
const {createReplay}=require('./v5-duel-d1b-replay.js');
const {progressOf,normalizeBuild,publicView}=require('./v5-build-v2-contract.js');
const {DuelError}=require('./v5-duel-d1a-service.js');
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail=(message,status=409)=>{throw new DuelError(message,status)};
function sanitizeRecord(row,clock,includeReplay){
 const now=new Date(clock),started=new Date(row.started_at),ends=new Date(row.ends_at);
 const progress=Math.min(1,Math.max(0,(now-started)/(ends-started)));
 const complete=!!row.finished_at||now>=ends;
 return {ready:true,inviteId:row.invite_id,stage:row.stage,
  status:complete?'finished':'running',
  winnerSide:complete?row.winner_side:null,
  replaySha256:row.replay_sha256,
  startedAt:started.toISOString(),endsAt:ends.toISOString(),
  serverNow:now.toISOString(),progress,
  replay:includeReplay?row.replay:null};
}
function createMatchService(pool){
 if(!pool||typeof pool.connect!=='function')throw Error('D1b: pool obrigatório');
 async function transaction(student,fn){
  if(!student||!UUID.test(student.id||'')||
     !/^[a-z0-9_-]{4,64}$/i.test(student.roomCode||''))
   fail('Sessão de aluno inválida.',403);
  const db=await pool.connect();let started=false;
  try{
   await db.query('BEGIN');started=true;
   const own=await db.query('SELECT id FROM pit_students WHERE id=$1 AND room_code=$2',
    [student.id,student.roomCode]);
   if(own.rowCount!==1)fail('Aluno não pertence à turma.',403);
   // Finish matches that elapsed while both tabs were closed. This is also
   // called from the D.1a invitation entry points.
   await finishDue(db,student.roomCode);
   const result=await fn(db);
   await db.query('COMMIT');started=false;
   return result;
  }catch(e){
   if(started)try{await db.query('ROLLBACK')}catch{}
   throw e;
  }finally{db.release()}
 }
 async function finishDue(db,roomCode){
  const due=await db.query(
   'UPDATE pit_duel_matches SET finished_at=NOW() '+
   'WHERE room_code=$1 AND finished_at IS NULL AND ends_at<=NOW() RETURNING invite_id',
   [roomCode]);
  if(!due.rowCount)return 0;
  const ids=due.rows.map(x=>x.invite_id);
  await db.query(
   "UPDATE pit_duel_invites SET status='finished' "+
   "WHERE id=ANY($1::uuid[]) AND status='accepted'",[ids]);
  await db.query('DELETE FROM pit_duel_slots WHERE invite_id=ANY($1::uuid[])',[ids]);
  return due.rowCount;
 }
 async function getInvitation(db,student,inviteId,lock=false){
  if(!UUID.test(inviteId||''))fail('Convite inválido.',400);
  const r=await db.query(
   'SELECT * FROM pit_duel_invites WHERE id=$1 AND room_code=$2 '+
   (lock?'FOR UPDATE':''),
   [inviteId,student.roomCode]);
  if(r.rowCount!==1)fail('Convite não encontrado.',404);
  const i=r.rows[0],self=student.id.toLowerCase();
  if(![String(i.challenger_id).toLowerCase(),String(i.invited_id).toLowerCase()].includes(self))
   fail('Você não participa deste confronto.',403);
  return i;
 }
 async function getRow(db,inviteId){
  const r=await db.query('SELECT * FROM pit_duel_matches WHERE invite_id=$1',[inviteId]);
  return r.rows[0]||null;
 }
 async function read(student,inviteId,{includeReplay=true}={}){
  return transaction(student,async(db)=>{
   const i=await getInvitation(db,student,inviteId);
   const row=await getRow(db,inviteId);
   if(!row){
    if(i.status==='accepted')return {ready:false,inviteId,stage:i.stage,status:'accepted'};
    fail('Esta partida ainda não foi aceita ou foi cancelada.',409);
   }
   const clock=await db.query('SELECT clock_timestamp() AS server_now');
   return sanitizeRecord(row,clock.rows[0].server_now,includeReplay);
  });
 }
 async function start(student,inviteId){
  return transaction(student,async(db)=>{
   const invite=await getInvitation(db,student,inviteId,true);
   const existing=await getRow(db,inviteId);
   if(existing){
    const time=await db.query('SELECT clock_timestamp() AS server_now');
    return sanitizeRecord(existing,time.rows[0].server_now,true);
   }
   if(invite.status!=='accepted'||!Number.isInteger(invite.match_seed))
    fail('O outro aluno ainda não aceitou o convite.',409);
   const room=await db.query(
    'SELECT c.current_stage,COALESCE(s.enabled,false) AS enabled '+
    'FROM pit_classroom_state c LEFT JOIN pit_duel_room_settings s '+
    'ON s.room_code=c.room_code WHERE c.room_code=$1',
    [student.roomCode]);
   if(room.rowCount!==1||room.rows[0].enabled!==true||
     Number(room.rows[0].current_stage)!==Number(invite.stage))
    fail('Professor alterou a missão ou desativou os duelos.',409);
   const ids=[invite.challenger_id,invite.invited_id].sort();
   const slots=await db.query(
    'SELECT student_id FROM pit_duel_slots WHERE invite_id=$1 ORDER BY student_id',
    [inviteId]);
   if(slots.rowCount!==2||slots.rows.some((s,index)=>s.student_id!==ids[index]))
    fail('Jogadores não estão mais reservados para o duelo.',409);
   const builds=await db.query(
    'SELECT student_id,klass,attributes,talents,schema_version,m5_snapshot '+
    'FROM pit_hero_builds_v2 WHERE student_id=ANY($1::uuid[]) AND room_code=$2 '+
    'ORDER BY student_id FOR SHARE',
    [ids,student.roomCode]);
   if(builds.rowCount!==2)fail('Os dois alunos precisam forjar seus personagens antes do duelo.',409);
   const profile=new Map(builds.rows.map(b=>[String(b.student_id),b]));
   const names=await db.query(
    'SELECT id,display_name FROM pit_students WHERE id=ANY($1::uuid[]) AND room_code=$2',
    [ids,student.roomCode]);
   if(names.rowCount!==2)fail('Participantes da turma não encontrados.',403);
   const named=new Map(names.rows.map(n=>[String(n.id),n.display_name]));
   const participants=[];
   for(const [side,id] of [['left',invite.challenger_id],['right',invite.invited_id]]){
    const progressRows=await db.query(
     'SELECT stage,status FROM pit_student_stages WHERE student_id=$1 ORDER BY stage FOR SHARE',
     [id]);
    const progress=progressOf(progressRows.rows,Number(invite.stage));
    if(!progress.awaitingPeers)fail('O aluno ainda não concluiu a missão atual.',403);
    const b=profile.get(String(id));
    if(b?.schema_version!==2)fail('Personagem incompatível com esta arena.',409);
    const build={klass:b.klass,attributes:b.attributes,talents:b.talents};
    normalizeBuild(build,progress.approvedMissions);
    if(progress.approvedMissions>5&&!b.m5_snapshot)
     fail('Entrada na arena da missão 5 ainda não registrada.',409);
    // Re-validate the irreversibly frozen M5 floor even if a stale/incorrect
    // database row bypassed the regular character editor.
    publicView(b,progress);
    participants.push({side,name:named.get(String(id)),approved:progress.approvedMissions,build});
   }
   // No client-side RNG, requested build, winner, positions or score.
   const result=createReplay(participants,{seed:invite.match_seed,stage:invite.stage});
   const saved=await db.query(
    'INSERT INTO pit_duel_matches '+
    '(invite_id,room_code,stage,replay,replay_sha256,winner_side,started_at,ends_at) '+
    "VALUES($1,$2,$3,$4::jsonb,$5,$6,NOW(),NOW()+($7::integer*INTERVAL '1 second')) "+
    'ON CONFLICT(invite_id) DO NOTHING RETURNING *',
    [inviteId,student.roomCode,invite.stage,JSON.stringify(result.payload),
     result.sha256,result.winnerSide,result.realDurationSeconds]);
   if(saved.rowCount!==1)fail('O confronto já está sendo preparado. Atualize a tela.',409);
   const clock=await db.query('SELECT clock_timestamp() AS server_now');
   return sanitizeRecord(saved.rows[0],clock.rows[0].server_now,true);
  });
 }
 return Object.freeze({start,read,finishDue});
}
module.exports={createMatchService};

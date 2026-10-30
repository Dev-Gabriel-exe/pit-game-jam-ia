'use strict';
/*
 * PIT V5 D.1a — real PostgreSQL invitation and presence service for DISPOSABLE STAGING.
 * Does not enter an arena, calculate a winner, change XP, grading or hero builds.
 * Caller must authenticate the student with the existing V3 token hash before
 * passing {id,roomCode}. Database decides teacher release and stage completion.
 */
const {randomUUID,randomInt}=require('node:crypto');
class DuelError extends Error{
 constructor(message,status=409){super(message);this.name='DuelError';this.status=status;this.code='V5_DUEL_REJECTED'}
}
const fail=(reason,status)=>{throw new DuelError(reason,status)};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TTL_SECONDS=45;
const PRESENCE_SECONDS=60;
const ACTIVE=['pending','accepted'];
function assertStudent(student){
 if(!student||!UUID.test(student.id||'')||
  !/^[a-z0-9_-]{4,64}$/i.test(student.roomCode||''))
  fail('Identidade de aluno autenticada obrigatória.',403);
}
function createDuelService(pool){
 if(!pool||typeof pool.connect!=='function')throw Error('D1a: conexão PostgreSQL obrigatória');
 async function tx(student,fn){
  assertStudent(student);
  const db=await pool.connect();
  let began=false;
  try{
   await db.query('BEGIN');began=true;
   const member=await db.query(
    'SELECT id FROM pit_students WHERE id=$1 AND room_code=$2',
    [student.id,student.roomCode]);
   if(member.rowCount!==1)fail('Aluno não pertence à turma.',403);
   const room=await db.query(
    'SELECT c.current_stage,COALESCE(s.enabled,false) AS duel_enabled '+
    'FROM pit_classroom_state c LEFT JOIN pit_duel_room_settings s '+
    'ON s.room_code=c.room_code WHERE c.room_code=$1',
    [student.roomCode]);
   if(room.rowCount!==1)fail('Turma não inicializada.',503);
   const stage=Number(room.rows[0].current_stage);
   if(!Number.isInteger(stage)||stage<1||stage>10)fail('Missão liberada inválida.',503);
   await expire(db,student.roomCode);
   await finishElapsedMatchesIfInstalled(db,student.roomCode);
   const result=await fn({db,student,stage,enabled:room.rows[0].duel_enabled===true});
   await db.query('COMMIT');began=false;
   return result;
  }catch(e){
   if(began)try{await db.query('ROLLBACK')}catch{}
   throw e;
  }finally{db.release()}
 }
 async function expire(db,roomCode){
  // Only pending invitations time out; accepted challenges await the future
  // authoritative duel engine, or one participant can cancel.
  const out=await db.query(
   "UPDATE pit_duel_invites SET status='expired',decided_at=NOW() "+
   "WHERE room_code=$1 AND status='pending' AND expires_at<=NOW() RETURNING id",
   [roomCode]);
  if(out.rowCount)await db.query(
   'DELETE FROM pit_duel_slots WHERE invite_id=ANY($1::uuid[])',
   [out.rows.map(r=>r.id)]);
 }
 // D.1b is an additive opt-in migration. Keep D.1a standalone QA working
 // when the match table is not yet installed in a disposable staging DB.
 async function matchesInstalled(db){
  const result=await db.query("SELECT to_regclass('pit_duel_matches') AS match_table");
  return result.rows[0]?.match_table!==null&&result.rows[0]?.match_table!==undefined;
 }
 async function finishElapsedMatchesIfInstalled(db,roomCode){
  if(!await matchesInstalled(db))return 0;
  const due=await db.query(
   'UPDATE pit_duel_matches SET finished_at=NOW() '+
   'WHERE room_code=$1 AND finished_at IS NULL AND ends_at<=NOW() RETURNING invite_id',
   [roomCode]);
  if(!due.rowCount)return 0;
  const ids=due.rows.map(r=>r.invite_id);
  await db.query(
   "UPDATE pit_duel_invites SET status='finished' "+
   "WHERE id=ANY($1::uuid[]) AND status='accepted'",[ids]);
  await db.query('DELETE FROM pit_duel_slots WHERE invite_id=ANY($1::uuid[])',[ids]);
  return due.rowCount;
 }
 async function matchStarted(db,id){
  if(!await matchesInstalled(db))return false;
  const result=await db.query('SELECT 1 FROM pit_duel_matches WHERE invite_id=$1',[id]);
  return result.rowCount>0;
 }
 async function eligibility(db,id,roomCode,stage){
  const [progress,presence]=await Promise.all([
   db.query('SELECT status FROM pit_student_stages WHERE student_id=$1 AND stage=$2',
    [id,stage]),
   db.query('SELECT opt_in,stage,room_code,last_seen_at FROM pit_duel_presence '+
    'WHERE student_id=$1',[id])
  ]);
  const status=progress.rows[0]?.status||null;
  const available=['submitted','approved'].includes(status);
  const p=presence.rows[0];
  // DB NOW() is the authoritative heartbeat clock; never accept browser timestamps.
  const online=p?await db.query(
   "SELECT 1 FROM pit_duel_presence WHERE student_id=$1 AND opt_in=true "+
   "AND room_code=$2 AND stage=$3 AND last_seen_at>NOW()-INTERVAL '60 seconds'",
   [id,roomCode,stage]):{rowCount:0};
  return {eligible:available,online:online.rowCount===1,status};
 }
 async function current(student){
  return tx(student,async({db,stage,enabled})=>{
   const own=await eligibility(db,student.id,student.roomCode,stage);
   const busy=await db.query('SELECT invite_id FROM pit_duel_slots WHERE student_id=$1',
    [student.id]);
   const visible=enabled&&own.eligible&&own.online&&!busy.rowCount;
   const peerRows=visible?await db.query(
    'SELECT s.id,s.display_name FROM pit_duel_presence p '+
    'JOIN pit_students s ON s.id=p.student_id '+
    'JOIN pit_student_stages st ON st.student_id=s.id AND st.stage=$2 '+
    'WHERE s.room_code=$1 AND p.room_code=$1 AND p.stage=$2 '+
    "AND p.opt_in=true AND p.last_seen_at>NOW()-INTERVAL '60 seconds' "+
    "AND st.status IN ('submitted','approved') AND s.id<>$3 "+
    'AND NOT EXISTS(SELECT 1 FROM pit_duel_slots sl WHERE sl.student_id=s.id) '+
    'ORDER BY s.display_name,s.id LIMIT 40',
    [student.roomCode,stage,student.id]):{rows:[]};
   const history=await db.query(
    'SELECT i.id,i.status,i.stage,i.created_at,i.expires_at,i.decided_at,i.match_seed, '+
    'i.challenger_id=$2 AS outgoing, '+
    'CASE WHEN i.challenger_id=$2 THEN invited.display_name '+
    'ELSE challenger.display_name END AS peer_name '+
    'FROM pit_duel_invites i '+
    'JOIN pit_students challenger ON challenger.id=i.challenger_id '+
    'JOIN pit_students invited ON invited.id=i.invited_id '+
    'WHERE i.room_code=$1 AND (i.challenger_id=$2 OR i.invited_id=$2) '+
    'ORDER BY i.created_at DESC,i.id DESC LIMIT 12',
    [student.roomCode,student.id]);
   return Object.freeze({
    enabled,stage,eligibility:own.status,available:visible,
    busy:busy.rowCount>0,
    peers:peerRows.rows.map(r=>({id:r.id,name:r.display_name})),
    invites:history.rows.map(i=>({
     id:i.id,status:i.status,mission:i.stage,outgoing:i.outgoing,
     peerName:i.peer_name,expiresAt:i.expires_at,decidedAt:i.decided_at,
     matchSeed:i.status==='accepted'?i.match_seed:null
    }))
   });
  });
 }
 async function setAvailable(student,optIn){
  if(typeof optIn!=='boolean')fail('Disponibilidade inválida.',400);
  return tx(student,async({db,stage,enabled})=>{
   const eligible=await db.query(
    'SELECT status FROM pit_student_stages WHERE student_id=$1 AND stage=$2',
    [student.id,stage]);
   const valid=['submitted','approved'].includes(eligible.rows[0]?.status);
   if(optIn&&(!enabled||!valid))
    fail('Entregue a missão atual e aguarde a liberação de duelos pelo professor.',403);
   await db.query(
    'INSERT INTO pit_duel_presence(student_id,room_code,stage,opt_in,last_seen_at) '+
    'VALUES($1,$2,$3,$4,NOW()) ON CONFLICT(student_id) DO UPDATE '+
    'SET room_code=EXCLUDED.room_code,stage=EXCLUDED.stage,'+
    'opt_in=EXCLUDED.opt_in,last_seen_at=NOW()',
    [student.id,student.roomCode,stage,optIn]);
   if(!optIn){
    // Going offline cancels the pending or accepted slot and informs the other student.
    const owned=await db.query(
     'SELECT i.id FROM pit_duel_slots sl JOIN pit_duel_invites i ON i.id=sl.invite_id '+
     "WHERE sl.student_id=$1 AND i.status IN ('pending','accepted') FOR UPDATE OF i",
     [student.id]);
    for(const i of owned.rows){
     // A live server-replayed match cannot be undone by toggling presence.
     if(await matchStarted(db,i.id))continue;
     await db.query(
      "UPDATE pit_duel_invites SET status='cancelled',match_seed=NULL,decided_at=NOW() "+
      "WHERE id=$1 AND status IN ('pending','accepted')",[i.id]);
     await db.query('DELETE FROM pit_duel_slots WHERE invite_id=$1',[i.id]);
    }
   }
   return {available:optIn,stage};
  });
 }
 async function invite(student,targetId){
  if(!UUID.test(targetId||'')||targetId===student.id)
   fail('Escolha outro colega da mesma turma.',400);
  return tx(student,async({db,stage,enabled})=>{
   if(!enabled)fail('O professor ainda não liberou os duelos.',403);
   // Lock both participant rows in UUID order. Opposite-direction invites
   // serialize without cyclic locks and cannot create overlapping slots.
   const students=await db.query(
    'SELECT id FROM pit_students WHERE id=ANY($1::uuid[]) AND room_code=$2 '+
    'ORDER BY id FOR UPDATE',
    [[student.id,targetId],student.roomCode]);
   if(students.rowCount!==2)fail('Colega não encontrado nesta turma.',404);
   const mine=await eligibility(db,student.id,student.roomCode,stage);
   const theirs=await eligibility(db,targetId,student.roomCode,stage);
   if(!mine.eligible||!mine.online)fail('Conclua sua missão e ative a disponibilidade.',403);
   if(!theirs.eligible||!theirs.online)fail('Este colega não está disponível para duelar.',409);
   const id=randomUUID();
   await db.query(
    'INSERT INTO pit_duel_invites '+
    '(id,room_code,stage,challenger_id,invited_id,status,expires_at) '+
    "VALUES($1,$2,$3,$4,$5,'pending',NOW()+INTERVAL '45 seconds')",
    [id,student.roomCode,stage,student.id,targetId]);
   // Unique student_id is the atomic "one duel at a time" constraint.
   // Both inserts are in the same transaction, so partial claims roll back.
   const claims=await db.query(
    'INSERT INTO pit_duel_slots(student_id,invite_id) '+
    'SELECT sid,$2 FROM unnest($1::uuid[]) AS u(sid) ORDER BY sid '+
    'ON CONFLICT(student_id) DO NOTHING RETURNING student_id',
    [[student.id,targetId],id]);
   if(claims.rowCount!==2)fail('Um dos jogadores já recebeu ou enviou um convite.',409);
   return {id,status:'pending',expiresInSeconds:TTL_SECONDS};
  });
 }
 async function decide(student,inviteId,decision){
  if(!UUID.test(inviteId||''))fail('Convite inválido.',400);
  if(!['accept','decline','cancel'].includes(decision))fail('Decisão inválida.',400);
  return tx(student,async({db,stage,enabled})=>{
   const found=await db.query(
    'SELECT * FROM pit_duel_invites WHERE id=$1 AND room_code=$2 FOR UPDATE',
    [inviteId,student.roomCode]);
   if(found.rowCount!==1)fail('Convite não encontrado.',404);
   const i=found.rows[0];
   const self=String(student.id).toLowerCase(),challenger=String(i.challenger_id).toLowerCase(),
    invited=String(i.invited_id).toLowerCase();
   if(self!==challenger&&self!==invited)fail('Este convite pertence a outros colegas.',403);
   if(decision==='accept'||decision==='decline'){
    if(self!==invited)fail('Somente o convidado pode responder.',403);
    if(i.status!=='pending')fail('O convite já foi respondido ou expirou.',409);
   }else{
    if(!ACTIVE.includes(i.status))fail('Este desafio não está mais ativo.',409);
    if(i.status==='pending'&&self!==challenger)
     fail('Somente quem enviou pode cancelar um convite pendente.',403);
   }
   // Once the server has generated an authoritative replay, neither student
   // can cancel to rewrite its outcome or replace its snapshot.
   if(decision==='cancel'&&i.status==='accepted'&&await matchStarted(db,inviteId))
    fail('Partida iniciada. Aguarde o resultado do duelo.',409);
   if(decision==='accept'){
    if(!enabled||Number(i.stage)!==stage)
     fail('A missão mudou ou os duelos foram desativados.',409);
    const a=await eligibility(db,challenger,student.roomCode,stage);
    const b=await eligibility(db,invited,student.roomCode,stage);
    if(!a.eligible||!a.online||!b.eligible||!b.online)
     fail('Um dos alunos não está mais disponível para duelar.',409);
    const seed=randomInt(1,2147483646);
    const changed=await db.query(
     "UPDATE pit_duel_invites SET status='accepted',match_seed=$2,decided_at=NOW() "+
     "WHERE id=$1 AND status='pending' AND expires_at>NOW() RETURNING id",
     [inviteId,seed]);
    if(changed.rowCount!==1)fail('Convite expirou antes da confirmação.',409);
    // Both unique slots remain reserved until a real duel engine closes match.
    return {id:inviteId,status:'accepted',matchSeed:seed};
   }
   const status=decision==='decline'?'declined':'cancelled';
   await db.query(
    'UPDATE pit_duel_invites SET status=$2,match_seed=NULL,decided_at=NOW() WHERE id=$1',
    [inviteId,status]);
   await db.query('DELETE FROM pit_duel_slots WHERE invite_id=$1',[inviteId]);
   return {id:inviteId,status};
  });
 }
 return Object.freeze({current,setAvailable,invite,decide});
}
module.exports={createDuelService,DuelError,TTL_SECONDS,PRESENCE_SECONDS};

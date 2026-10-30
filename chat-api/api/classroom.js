'use strict';
const {Pool}=require('pg');
const {createHash,timingSafeEqual}=require('node:crypto');
const ROOM='PITGAME26', MAX_STAGE=10;
const ORIGINS=new Set(['https://dev-gabriel-exe.github.io','https://pit-game-jam-chat.vercel.app','http://127.0.0.1:8899','http://localhost:8899']);
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:9000,idleTimeoutMillis:10000});
function err(res,code,message){return res.status(code).json({ok:false,error:message})}
function eq(a,b){const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y)}
function teacher(req){const pin=String(req.headers['x-pit-teacher-pin']||'');return pin.length>=16&&eq(pin,process.env.PIT_TEACHER_PIN||'')}
async function student(req){const t=String(req.headers['x-pit-student-token']||'');if(!/^[a-f\d]{64}$/i.test(t))return null;const r=await pool.query('SELECT id,display_name FROM pit_students WHERE room_code=$1 AND token_hash=$2 LIMIT 1',[ROOM,createHash('sha256').update(t).digest('hex')]);return r.rows[0]||null}
function stageOf(value){const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=MAX_STAGE?n:null}
function clean(value,max){return String(value||'').replace(/[\x00-\x1f\x7f]/g,' ').trim().slice(0,max)}
// Structured mission evidence uses line boundaries to recover fields after a device change.
// Keep LF, normalize CRLF/CR, and strip other control characters before the 750-char cap.
function cleanEvidence(value,max){return String(value||'').replace(/\r\n?/g,'\n').replace(/[\x00-\x09\x0b-\x1f\x7f]/g,' ').trim().slice(0,max)}
async function classroom(){const r=await pool.query('SELECT current_stage,phase,updated_at FROM pit_classroom_state WHERE room_code=$1',[ROOM]);return r.rows[0]}
module.exports=async function handler(req,res){
 const origin=req.headers.origin;
 res.setHeader('Access-Control-Allow-Origin',origin&&ORIGINS.has(origin)?origin:'https://dev-gabriel-exe.github.io');
 res.setHeader('Access-Control-Allow-Headers','Content-Type,X-PIT-Teacher-Pin,X-PIT-Student-Token');
 res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
 res.setHeader('Vary','Origin');res.setHeader('Cache-Control','private,no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(origin&&!ORIGINS.has(origin))return err(res,403,'Origem não autorizada.');
 if(req.method==='OPTIONS')return res.status(204).end();
 if(!process.env.DATABASE_URL||!process.env.PIT_TEACHER_PIN)return err(res,503,'Sala não configurada.');
 try{
  const action=clean(req.query?.action,32);
  const isTeacher=teacher(req);
  const me=isTeacher?null:await student(req);
  if(!isTeacher&&!me)return err(res,401,'Entre na sala ou autentique-se como professor.');
  if(req.method==='GET'&&action==='state'){
   const state=await classroom();if(!state)return err(res,503,'Sala não inicializada.');
   if(isTeacher)return res.json({ok:true,state,role:'teacher'});
   const r=await pool.query('SELECT stage,route,status,evidence,feedback,updated_at,reviewed_at FROM pit_student_stages WHERE student_id=$1 ORDER BY stage',[me.id]);
   return res.json({ok:true,state,role:'student',student:{id:me.id,name:me.display_name},progress:r.rows});
  }
  if(req.method==='POST'&&action==='heartbeat'){
   if(!me)return err(res,403,'Apenas alunos registram atividade.');
   const n=stageOf(req.body?.stage);if(!n)return err(res,400,'Etapa inválida.');
   const released=await classroom();
   if(!released)return err(res,503,'Sala não inicializada.');
   if(n>released.current_stage)return err(res,403,'Etapa ainda não liberada pelo professor.');
   await pool.query('UPDATE pit_students SET last_seen_at=NOW(),active_stage=$2 WHERE id=$1',[me.id,n]);
   return res.json({ok:true,stage:n});
  }
  if(req.method==='POST'&&action==='progress'){
   if(!me)return err(res,403,'Apenas alunos registram atividade.');
   const n=stageOf(req.body?.stage);if(!n)return err(res,400,'Etapa inválida.');
   const state=await classroom();if(n>state.current_stage)return err(res,403,'Etapa ainda não liberada pelo professor.');
   if(n===state.current_stage&&!['practice','review'].includes(state.phase))return err(res,403,'A prática desta etapa ainda não foi liberada pelo professor.');
   const status=clean(req.body?.status,20),route=clean(req.body?.route,10);
   if(!['working','submitted'].includes(status)||!['2d','3d'].includes(route))return err(res,400,'Progresso inválido.');
   const evidence=cleanEvidence(req.body?.evidence,750);
   if(status==='submitted'&&evidence.length<8)return err(res,400,'Descreva o que foi produzido antes de enviar.');
   const query='INSERT INTO pit_student_stages(student_id,stage,route,status,evidence,feedback,updated_at,reviewed_at) '+
     "VALUES($1,$2,$3,$4,$5,'',NOW(),NULL) "+
     'ON CONFLICT(student_id,stage) DO UPDATE SET route=EXCLUDED.route,status=EXCLUDED.status,evidence=EXCLUDED.evidence,'+
     "feedback=CASE WHEN pit_student_stages.status='revision' THEN pit_student_stages.feedback ELSE '' END,"+
     "updated_at=NOW(),reviewed_at=NULL "+
     // Atomic guard: students cannot overwrite an evidence pending review or already approved.
     "WHERE pit_student_stages.status NOT IN ('submitted','approved') "+
     'RETURNING stage,route,status,evidence,feedback,updated_at,reviewed_at';
   const out=await pool.query(query,[me.id,n,route,status,evidence]);
   if(!out.rowCount)return err(res,409,'Esta entrega já foi enviada ou aprovada. Aguarde a revisão do professor.');
   return res.json({ok:true,progress:out.rows[0]});
  }
  if(req.method==='GET'&&action==='roster'){
   if(!isTeacher)return err(res,403,'Acompanhamento exclusivo do professor.');
   const state=await classroom();
   const query='SELECT s.id,s.display_name,s.joined_at,s.last_seen_at,s.active_stage,'+
   'COALESCE((SELECT MAX(p.stage) FROM pit_student_stages p WHERE p.student_id=s.id),0) AS highest_stage,'+
   "COALESCE((SELECT count(*)::int FROM pit_student_stages p WHERE p.student_id=s.id AND p.status='approved'),0) AS approved,"+
   "COALESCE((SELECT count(*)::int FROM pit_chat_messages m WHERE m.student_id=s.id AND m.author='student' AND m.read_at IS NULL),0) AS unread_chat,"+
   "(SELECT json_agg(json_build_object('stage',p.stage,'status',p.status,'route',p.route,'evidence',p.evidence,'feedback',p.feedback,'updated_at',p.updated_at,'reviewed_at',p.reviewed_at) ORDER BY p.stage) FROM pit_student_stages p WHERE p.student_id=s.id) AS stages "+
   'FROM pit_students s WHERE s.room_code=$1 ORDER BY s.last_seen_at DESC LIMIT 180';
   const result=await pool.query(query,[ROOM]);
   return res.json({ok:true,state,roster:result.rows});
  }
  if(req.method==='POST'&&action==='stage'){
   if(!isTeacher)return err(res,403,'Apenas o professor controla a turma.');
   const stage=stageOf(req.body?.stage),phase=clean(req.body?.phase,20);
   if(!stage||!['briefing','demo','practice','review'].includes(phase))return err(res,400,'Etapa ou fase inválida.');
   const r=await pool.query('UPDATE pit_classroom_state SET current_stage=$1,phase=$2,updated_at=NOW() WHERE room_code=$3 RETURNING current_stage,phase,updated_at',[stage,phase,ROOM]);
   return res.json({ok:true,state:r.rows[0]});
  }
  if(req.method==='POST'&&action==='review'){
   if(!isTeacher)return err(res,403,'Apenas o professor valida evidências.');
   const id=clean(req.body?.studentId,40),stage=stageOf(req.body?.stage);
   if(!/^[0-9a-f-]{36}$/i.test(id)||!stage)return err(res,400,'Aluno ou etapa inválida.');
   const status=clean(req.body?.status,15);
   if(!['approved','revision'].includes(status))return err(res,400,'Validação inválida.');
   const feedback=clean(req.body?.feedback,550);
   if(status==='revision'&&feedback.length<8)return err(res,400,'Explique a revisão em pelo menos 8 caracteres, indicando o teste a corrigir.');
   const r=await pool.query(
     "UPDATE pit_student_stages SET status=$1,feedback=$2,reviewed_at=NOW(),updated_at=NOW() WHERE student_id=$3 AND stage=$4 AND status='submitted' "+
     "AND EXISTS (SELECT 1 FROM pit_students s WHERE s.id=$3 AND s.room_code=$5) RETURNING stage,status,feedback",
     [status,feedback,id,stage,ROOM]);
   if(!r.rowCount)return err(res,409,'Não há entrega pendente para validar.');
   return res.json({ok:true,progress:r.rows[0]});
  }
  return err(res,404,'Ação desconhecida.');
 }catch(e){console.error('PIT classroom:',e.code||e.name);return err(res,500,'Erro temporário na sala. Tente novamente.')}
};
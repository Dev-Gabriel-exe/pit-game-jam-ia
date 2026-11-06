'use strict';
const { Pool } = require('pg');
const { randomBytes, createHash, timingSafeEqual } = require('node:crypto');

const {ROOMS,DEFAULT_ROOM,roomCode,allowed,teacherRoom}=require('../lib/pit-rooms.js');
const MAX_BODY = 1200;
const ORIGINS = new Set([
  'https://dev-gabriel-exe.github.io',
  'https://pit-game-jam-chat.vercel.app'
]);
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 9000
});
const hash = value => createHash('sha256').update(value).digest('hex');
const newRecoveryCode=()=>randomBytes(12).toString('hex').toUpperCase().match(/.{4}/g).join('-');
const normalizeRecovery=v=>String(v||'').toUpperCase().replace(/[-\s]/g,'');
const validRecovery=v=>/^[0-9A-F]{24}$/.test(normalizeRecovery(v));
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
// Preserve newlines in tutorial/chat messages while excluding unsafe control characters.
const cleanMessage = (v, max) => String(v == null ? '' : v).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0,max);
const sendError = (res, status, message) => res.status(status).json({ ok:false, error:message });
function safeEqual(a,b) {
  const x=Buffer.from(String(a||'')), y=Buffer.from(String(b||''));
  return x.length===y.length && timingSafeEqual(x,y);
}
function teacherOK(req) {
  const supplied=String(req.headers['x-pit-teacher-pin']||'');
  return supplied.length>=16 && safeEqual(supplied,process.env.PIT_TEACHER_PIN||'');
}
async function student(req) {
  const token=String(req.headers['x-pit-student-token']||'');
  if(!/^[a-f0-9]{64}$/i.test(token)) return null;
  const rows=await db.query('SELECT id,display_name,room_code FROM pit_students WHERE token_hash=$1 LIMIT 1',[hash(token)]);
  return rows.rows[0]||null;
}
function validId(id) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id||'')); }
module.exports = async function handler(req, res) {
  const origin=req.headers.origin;
  if(origin && ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Access-Control-Allow-Headers','Content-Type, X-PIT-Student-Token, X-PIT-Teacher-Pin, X-PIT-Room');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Cache-Control','no-store, private');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Vary','Origin');
  if(origin && !ORIGINS.has(origin)) return sendError(res,403,'Origem não autorizada.');
  if(req.method==='OPTIONS') return res.status(204).end();
  if(!process.env.DATABASE_URL || !process.env.PIT_TEACHER_PIN) return sendError(res,503,'Chat não configurado no servidor.');
  const action=clean(req.query && req.query.action || req.body && req.body.action,30);
  try {
    if(req.method==='GET' && action==='health') {
      const answer=await db.query("SELECT to_regclass('public.pit_students') IS NOT NULL AS students, to_regclass('public.pit_chat_messages') IS NOT NULL AS messages");
      return res.status(200).json({ok:true,chat:true,db:answer.rows[0]?.students && answer.rows[0]?.messages,version:'20261103-two-cohorts'});
    }
    if(req.method==='POST' && action==='join') {
      const room=roomCode(clean(req.body?.code,18));
      if(!allowed(room)) return sendError(res,403,'Código da turma inválido.');
      const name=clean(req.body?.name,56);
      if(name.length<2) return sendError(res,400,'Informe nome ou apelido com pelo menos dois caracteres.');
      const recently=await db.query("SELECT count(*)::int AS n FROM pit_students WHERE joined_at > now()-interval '1 minute' AND room_code=$1",[room]);
      if(recently.rows[0].n>=15) return sendError(res,429,'Muitas entradas simultâneas. Tente novamente em um minuto.');
      const already=await db.query('SELECT id FROM pit_students WHERE room_code=$1 AND lower(btrim(display_name))=lower($2) LIMIT 1',[room,name]);
      if(already.rowCount)return sendError(res,409,'Este nome já está cadastrado nesta turma. Use Retomar cadastro e seu código pessoal; se não é você, acrescente o sobrenome.');
      const count=await db.query('SELECT count(*)::int AS n FROM pit_students WHERE room_code=$1',[room]);
      if(count.rows[0].n>=160) return sendError(res,429,'Turma atingiu o limite de cadastros.');
      const token=randomBytes(32).toString('hex'),recoveryCode=newRecoveryCode();
      const result=await db.query(
       'INSERT INTO pit_students(room_code,display_name,token_hash,recovery_hash) VALUES($1,$2,$3,$4) RETURNING id,display_name',
       [room,name,hash(token),hash(normalizeRecovery(recoveryCode))]);
      return res.status(201).json({ok:true,studentId:result.rows[0].id,name:result.rows[0].display_name,token,code:room,recoveryCode});
    }
    if(req.method==='POST' && action==='recover') {
      const room=roomCode(clean(req.body?.code,18));
      const name=clean(req.body?.name,56),secret=req.body?.recoveryCode;
      if(!allowed(room)||name.length<2||!validRecovery(secret))
       return sendError(res,403,'Turma, nome ou código de retorno incorreto.');
      const match=await db.query(
       'SELECT id,display_name FROM pit_students WHERE room_code=$1 AND lower(btrim(display_name))=lower($2) AND recovery_hash=$3 LIMIT 1',
       [room,name,hash(normalizeRecovery(secret))]);
      if(!match.rowCount)return sendError(res,403,'Turma, nome ou código de retorno incorreto.');
      const token=randomBytes(32).toString('hex');
      await db.query('UPDATE pit_students SET token_hash=$1,last_seen_at=NOW() WHERE id=$2',
       [hash(token),match.rows[0].id]);
      return res.status(200).json({ok:true,studentId:match.rows[0].id,
       name:match.rows[0].display_name,token,code:room});
    }
    if(req.method==='POST' && action==='setup-recovery') {
      const me=await student(req);
      if(!me)return sendError(res,401,'Sessão do aluno inválida.');
      const recoveryCode=newRecoveryCode();
      await db.query('UPDATE pit_students SET recovery_hash=$1 WHERE id=$2 AND room_code=$3',
       [hash(normalizeRecovery(recoveryCode)),me.id,me.room_code]);
      return res.status(200).json({ok:true,recoveryCode});
    }
    if(req.method==='POST' && action==='teacher-reset-access') {
      if(!teacherOK(req))return sendError(res,403,'Apenas o professor pode gerar nova chave.');
      const room=teacherRoom(req),id=String(req.body?.studentId||'');
      if(!room||!validId(id))return sendError(res,400,'Aluno ou turma inválido.');
      const recoveryCode=newRecoveryCode();
      const row=await db.query(
       'UPDATE pit_students SET recovery_hash=$1 WHERE id=$2 AND room_code=$3 RETURNING display_name',
       [hash(normalizeRecovery(recoveryCode)),id,room]);
      if(!row.rowCount)return sendError(res,404,'Aluno não encontrado nesta turma.');
      return res.status(200).json({ok:true,name:row.rows[0].display_name,recoveryCode});
    }
    if(req.method==='POST' && action==='teacher-login') {
      if(!teacherOK(req)) return sendError(res,403,'PIN do professor inválido.');
      return res.status(200).json({ok:true,room:teacherRoom(req)||DEFAULT_ROOM,rooms:ROOMS});
    }
    if(req.method==='GET' && action==='image') {
      const teacher=teacherOK(req);
      const room=teacher?teacherRoom(req):null;
      if(teacher&&!room)return sendError(res,400,'Turma inválida.');
      const me=teacher?null:await student(req);
      if(!teacher&&!me)return sendError(res,401,'Sessão de aluno inválida.');
      const messageId=String(req.query?.messageId||'');
      if(!/^[1-9][0-9]{0,17}$/.test(messageId))return sendError(res,400,'Imagem inválida.');
      const out=await db.query(
       "SELECT i.mime,i.bytes FROM pit_chat_images i JOIN pit_chat_messages m ON m.id=i.message_id "+
       "WHERE m.id=$1 AND m.room_code=$2 AND ($3::uuid IS NULL OR m.student_id=$3::uuid) LIMIT 1",
       [messageId,teacher?room:me.room_code,teacher?null:me.id]);
      if(!out.rowCount)return sendError(res,404,'Imagem não encontrada nesta turma.');
      const img=out.rows[0];
      if(!['image/png','image/jpeg','image/webp'].includes(img.mime))return sendError(res,415,'Imagem inválida.');
      res.setHeader('Content-Type',img.mime);
      return res.status(200).send(img.bytes);
    }
    if(req.method==='POST' && action==='send-image') {
      const teacher=teacherOK(req);
      let id,room;
      if(teacher){
        room=teacherRoom(req);if(!room)return sendError(res,400,'Turma inválida.');
        id=String(req.body?.studentId||'');
        if(!validId(id))return sendError(res,400,'Selecione um aluno válido.');
        const exists=await db.query('SELECT 1 FROM pit_students WHERE id=$1 AND room_code=$2',[id,room]);
        if(!exists.rowCount)return sendError(res,404,'Aluno não encontrado nesta turma.');
      }else{
        const me=await student(req);
        if(!me)return sendError(res,401,'Sessão do aluno inválida.');
        id=me.id;room=me.room_code;
      }
      const mime=String(req.body?.mime||'');
      if(!['image/png','image/jpeg','image/webp'].includes(mime))
       return sendError(res,415,'Formato de imagem não permitido.');
      const encoded=String(req.body?.image||'');
      if(encoded.length<8||encoded.length>2800000||!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))
       return sendError(res,413,'Imagem inválida ou superior a 2 MB.');
      const binary=Buffer.from(encoded,'base64');
      if(binary.length<8||binary.length>2*1024*1024)
       return sendError(res,413,'Imagem inválida ou superior a 2 MB.');
      const validSignature=mime==='image/png'?
        binary.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):
        mime==='image/jpeg'?(binary[0]===255&&binary[1]===216&&binary[2]===255):
        binary.subarray(0,4).toString('ascii')==='RIFF'&&binary.subarray(8,12).toString('ascii')==='WEBP';
      if(!validSignature)return sendError(res,415,'O arquivo não corresponde ao formato informado.');
      const caption=clean(req.body?.caption,950);
      const rawMission=Number(req.body?.mission);
      const mission=Number.isInteger(rawMission)&&rawMission>=1&&rawMission<=6?rawMission:null;
      const author=teacher?'teacher':'student';
      const client=await db.connect();
      try{
        await client.query('BEGIN');
        const counter=await client.query(
          "SELECT count(*)::int n FROM pit_chat_messages WHERE room_code=$1 AND student_id=$2 AND author=$3 AND created_at>now()-interval '1 minute'",
          [room,id,author]);
        if(counter.rows[0].n>=12){
          await client.query('ROLLBACK');return sendError(res,429,'Limite de mensagens por minuto.');
        }
        const row=await client.query(
          'INSERT INTO pit_chat_messages(room_code,student_id,author,mission,body) VALUES($1,$2,$3,$4,$5) RETURNING id',
          [room,id,author,mission,caption?'[Imagem]\n'+caption:'[Imagem]']);
        await client.query('INSERT INTO pit_chat_images(message_id,mime,bytes) VALUES($1,$2,$3)',
          [row.rows[0].id,mime,binary]);
        await client.query('COMMIT');
        return res.status(201).json({ok:true,id:row.rows[0].id});
      }catch(e){await client.query('ROLLBACK').catch(()=>{});throw e}
      finally{client.release()}
    }
    if(req.method==='GET' && action==='unread') {
      if(teacherOK(req)) {
        const room=teacherRoom(req);if(!room)return sendError(res,400,'Turma inválida.');
        const rows=await db.query("SELECT count(*)::int AS unread FROM pit_chat_messages WHERE room_code=$1 AND author='student' AND read_at IS NULL",[room]);
        return res.status(200).json({ok:true,unread:rows.rows[0].unread});
      }
      const me=await student(req);
      if(!me) return sendError(res,401,'Sessão do aluno inválida.');
      const rows=await db.query("SELECT count(*)::int AS unread FROM pit_chat_messages WHERE room_code=$1 AND student_id=$2 AND author='teacher' AND read_at IS NULL",[me.room_code,me.id]);
      return res.status(200).json({ok:true,unread:rows.rows[0].unread});
    }
    if(req.method==='GET' && action==='threads') {
      if(!teacherOK(req)) return sendError(res,403,'Acesso exclusivo do professor.');
      const room=teacherRoom(req);if(!room)return sendError(res,400,'Turma inválida.');
      const data=await db.query(
        "SELECT s.id,s.display_name,s.joined_at, " +
        "(SELECT m.body FROM pit_chat_messages m WHERE m.student_id=s.id ORDER BY m.id DESC LIMIT 1) AS last_body, " +
        "(SELECT m.created_at FROM pit_chat_messages m WHERE m.student_id=s.id ORDER BY m.id DESC LIMIT 1) AS last_at, " +
        "(SELECT count(*)::int FROM pit_chat_messages m WHERE m.student_id=s.id AND m.author='student' AND m.read_at IS NULL) AS unread " +
        "FROM pit_students s WHERE s.room_code=$1 ORDER BY unread DESC NULLS LAST,last_at DESC NULLS LAST,s.joined_at DESC LIMIT 180",[room]);
      return res.status(200).json({ok:true,threads:data.rows});
    }
    if(req.method==='GET' && action==='messages') {
      const teacher=teacherOK(req);
      let id,room;
      if(teacher) {
        room=teacherRoom(req);if(!room)return sendError(res,400,'Turma inválida.');
        id=String(req.query.studentId||'');
        if(!validId(id)) return sendError(res,400,'Identificador do aluno inválido.');
        const check=await db.query('SELECT 1 FROM pit_students WHERE id=$1 AND room_code=$2 LIMIT 1',[id,room]);
        if(!check.rowCount) return sendError(res,404,'Aluno não encontrado.');
      } else {
        const me=await student(req);
        if(!me) return sendError(res,401,'Sessão do aluno expirada ou inválida.');
        id=me.id;room=me.room_code;
      }
      const data=await db.query(
        'SELECT id,author,mission,body,created_at,read_at FROM pit_chat_messages WHERE student_id=$1 AND room_code=$2 ORDER BY id DESC LIMIT 100',[id,room]);
      return res.status(200).json({ok:true,messages:data.rows.reverse()});
    }
    if(req.method==='POST' && action==='send') {
      const teacher=teacherOK(req);
      let id,room;
      if(teacher) {
        room=teacherRoom(req);if(!room)return sendError(res,400,'Turma inválida.');
        id=String(req.body?.studentId||'');
        if(!validId(id)) return sendError(res,400,'Escolha um aluno válido.');
        const exists=await db.query('SELECT 1 FROM pit_students WHERE id=$1 AND room_code=$2 LIMIT 1',[id,room]);
        if(!exists.rowCount) return sendError(res,404,'Aluno não encontrado.');
      } else {
        const me=await student(req);
        if(!me) return sendError(res,401,'Sessão do aluno inválida.');
        id=me.id;room=me.room_code;
      }
      const body=cleanMessage(req.body?.body,MAX_BODY);
      if(body.length<2) return sendError(res,400,'Escreva pelo menos dois caracteres.');
      const author=teacher?'teacher':'student';
      const count=await db.query(
        "SELECT count(*)::int AS n FROM pit_chat_messages WHERE student_id=$1 AND author=$2 AND created_at>now()-interval '1 minute'",[id,author]);
      if(count.rows[0].n>=12) return sendError(res,429,'Limite de mensagens por minuto atingido.');
      const rawMission=Number(req.body?.mission);
      // Legacy schema accepts mission <= 6; later messages stay visible as untagged chat.
      const mission=Number.isInteger(rawMission)&&rawMission>=1&&rawMission<=6 ? rawMission : null;
      const result=await db.query(
        'INSERT INTO pit_chat_messages(room_code,student_id,author,mission,body) VALUES($1,$2,$3,$4,$5) RETURNING id',
        [room,id,author,mission,body]);
      return res.status(201).json({ok:true,id:result.rows[0].id});
    }
    if(req.method==='POST' && action==='read') {
      const teacher=teacherOK(req);
      let id, author,room;
      if(teacher) {
        room=teacherRoom(req);if(!room)return sendError(res,400,'Turma inválida.');
        id=String(req.body?.studentId||'');
        if(!validId(id)) return sendError(res,400,'Aluno inválido.');
        author='student';
        const exists=await db.query('SELECT 1 FROM pit_students WHERE id=$1 AND room_code=$2',[id,room]);
        if(!exists.rowCount)return sendError(res,404,'Aluno não encontrado nesta turma.');
      } else {
        const me=await student(req);
        if(!me) return sendError(res,401,'Sessão do aluno inválida.');
        id=me.id;room=me.room_code;
        author='teacher';
      }
      await db.query('UPDATE pit_chat_messages SET read_at=now() WHERE student_id=$1 AND room_code=$2 AND author=$3 AND read_at IS NULL',[id,room,author]);
      return res.status(200).json({ok:true});
    }
    return sendError(res,404,'Ação inexistente.');
  } catch(e) {
    console.error('pit chat server error:',e.code||e.name||'unknown');
    return sendError(res,500,'Erro temporário no chat; tente novamente.');
  }
};
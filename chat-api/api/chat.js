'use strict';
const { Pool } = require('pg');
const { randomBytes, createHash, timingSafeEqual } = require('node:crypto');

const ROOM = 'PITGAME26';
const MAX_BODY = 1200;
const MAX_IMAGE_BYTES = 2*1024*1024;
const IMAGE_TYPES = {'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
function decodeImage(value,mime){
 if(!IMAGE_TYPES[mime]||typeof value!=='string'||value.length>2800000||!/^[A-Za-z0-9+/]+={0,2}$/.test(value))return null;
 const bytes=Buffer.from(value,'base64');
 if(!bytes.length||bytes.length>MAX_IMAGE_BYTES||bytes.toString('base64')!==value)return null;
 const png=bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'));
 const jpg=bytes.subarray(0,3).equals(Buffer.from('ffd8ff','hex'));
 const webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
 if(!(mime==='image/png'&&png||mime==='image/jpeg'&&jpg||mime==='image/webp'&&webp))return null;
 return bytes;
}
async function ensureImages(){
 await db.query('CREATE TABLE IF NOT EXISTS pit_chat_images (message_id bigint PRIMARY KEY REFERENCES pit_chat_messages(id) ON DELETE CASCADE, mime varchar(24) NOT NULL, bytes bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now())');
}

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
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
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
  const rows=await db.query('SELECT id,display_name FROM pit_students WHERE token_hash=$1 AND room_code=$2 LIMIT 1',[hash(token),ROOM]);
  return rows.rows[0]||null;
}
function validId(id) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id||'')); }
module.exports = async function handler(req, res) {
  const origin=req.headers.origin;
  if(origin && ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Access-Control-Allow-Headers','Content-Type, X-PIT-Student-Token, X-PIT-Teacher-Pin');
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
      return res.status(200).json({ok:true,chat:true,db:answer.rows[0]?.students && answer.rows[0]?.messages});
    }
    if(req.method==='POST' && action==='join') {
      if(clean(req.body?.code,18).toUpperCase()!==ROOM) return sendError(res,403,'Código da turma inválido.');
      const name=clean(req.body?.name,56);
      if(name.length<2) return sendError(res,400,'Informe nome ou apelido com pelo menos dois caracteres.');
      const recently=await db.query("SELECT count(*)::int AS n FROM pit_students WHERE joined_at > now()-interval '1 minute' AND room_code=$1",[ROOM]);
      if(recently.rows[0].n>=15) return sendError(res,429,'Muitas entradas simultâneas. Tente novamente em um minuto.');
      const count=await db.query('SELECT count(*)::int AS n FROM pit_students WHERE room_code=$1',[ROOM]);
      if(count.rows[0].n>=160) return sendError(res,429,'Turma atingiu o limite de cadastros.');
      const token=randomBytes(32).toString('hex');
      const result=await db.query('INSERT INTO pit_students(room_code,display_name,token_hash) VALUES($1,$2,$3) RETURNING id,display_name',[ROOM,name,hash(token)]);
      return res.status(201).json({ok:true,studentId:result.rows[0].id,name:result.rows[0].display_name,token,code:ROOM});
    }
    if(req.method==='POST' && action==='teacher-login') {
      if(!teacherOK(req)) return sendError(res,403,'PIN do professor inválido.');
      return res.status(200).json({ok:true,room:ROOM});
    }
    if(req.method==='GET' && action==='unread') {
      if(teacherOK(req)) {
        const rows=await db.query("SELECT count(*)::int AS unread FROM pit_chat_messages WHERE room_code=$1 AND author='student' AND read_at IS NULL",[ROOM]);
        return res.status(200).json({ok:true,unread:rows.rows[0].unread});
      }
      const me=await student(req);
      if(!me) return sendError(res,401,'Sessão do aluno inválida.');
      const rows=await db.query("SELECT count(*)::int AS unread FROM pit_chat_messages WHERE room_code=$1 AND student_id=$2 AND author='teacher' AND read_at IS NULL",[ROOM,me.id]);
      return res.status(200).json({ok:true,unread:rows.rows[0].unread});
    }
    if(req.method==='GET' && action==='threads') {
      if(!teacherOK(req)) return sendError(res,403,'Acesso exclusivo do professor.');
      const data=await db.query(
        "SELECT s.id,s.display_name,s.joined_at, " +
        "(SELECT m.body FROM pit_chat_messages m WHERE m.student_id=s.id ORDER BY m.id DESC LIMIT 1) AS last_body, " +
        "(SELECT m.created_at FROM pit_chat_messages m WHERE m.student_id=s.id ORDER BY m.id DESC LIMIT 1) AS last_at, " +
        "(SELECT count(*)::int FROM pit_chat_messages m WHERE m.student_id=s.id AND m.author='student' AND m.read_at IS NULL) AS unread " +
        "FROM pit_students s WHERE s.room_code=$1 ORDER BY unread DESC NULLS LAST,last_at DESC NULLS LAST,s.joined_at DESC LIMIT 180",[ROOM]);
      return res.status(200).json({ok:true,threads:data.rows});
    }
    if(req.method==='GET' && action==='messages') {
      const teacher=teacherOK(req);
      let id;
      if(teacher) {
        id=String(req.query.studentId||'');
        if(!validId(id)) return sendError(res,400,'Identificador do aluno inválido.');
        const check=await db.query('SELECT 1 FROM pit_students WHERE id=$1 AND room_code=$2 LIMIT 1',[id,ROOM]);
        if(!check.rowCount) return sendError(res,404,'Aluno não encontrado.');
      } else {
        const me=await student(req);
        if(!me) return sendError(res,401,'Sessão do aluno expirada ou inválida.');
        id=me.id;
      }
      const data=await db.query(
        'SELECT id,author,mission,body,created_at,read_at FROM pit_chat_messages WHERE student_id=$1 AND room_code=$2 ORDER BY id DESC LIMIT 100',[id,ROOM]);
      return res.status(200).json({ok:true,messages:data.rows.reverse()});
    }
    if(req.method==='GET' && action==='image') {
      const teacher=teacherOK(req),me=teacher?null:await student(req);
      if(!teacher&&!me)return sendError(res,401,'Sessão inválida.');
      const messageId=String(req.query?.messageId||'');
      if(!/^[1-9][0-9]{0,17}$/.test(messageId))return sendError(res,400,'Imagem inválida.');
      await ensureImages();
      const data=await db.query('SELECT i.mime,i.bytes,m.student_id FROM pit_chat_images i JOIN pit_chat_messages m ON m.id=i.message_id WHERE i.message_id=$1 AND m.room_code=$2',[messageId,ROOM]);
      if(!data.rowCount)return sendError(res,404,'Imagem não encontrada.');
      if(!teacher&&String(data.rows[0].student_id)!==String(me.id))return sendError(res,403,'Imagem de outra conversa.');
      res.setHeader('Content-Type',data.rows[0].mime);
      res.setHeader('Content-Disposition','inline; filename="print.'+IMAGE_TYPES[data.rows[0].mime]+'"');
      return res.status(200).end(data.rows[0].bytes);
    }
    if(req.method==='POST' && action==='send-image') {
      const teacher=teacherOK(req),me=teacher?null:await student(req);
      if(!teacher&&!me)return sendError(res,401,'Sessão inválida.');
      const id=teacher?String(req.body?.studentId||''):me.id;
      if(!validId(id))return sendError(res,400,'Aluno inválido.');
      if(teacher){const exists=await db.query('SELECT 1 FROM pit_students WHERE id=$1 AND room_code=$2',[id,ROOM]);if(!exists.rowCount)return sendError(res,404,'Aluno não encontrado.');}
      const mime=String(req.body?.mime||''),bytes=decodeImage(req.body?.image,mime);
      if(!bytes)return sendError(res,400,'Imagem inválida ou acima de 2 MB.');
      const author=teacher?'teacher':'student';
      const count=await db.query("SELECT count(*)::int AS n FROM pit_chat_messages WHERE student_id=$1 AND author=$2 AND created_at>now()-interval '1 minute'",[id,author]);
      if(count.rows[0].n>=6)return sendError(res,429,'Aguarde antes de enviar outra imagem.');
      const rawMission=Number(req.body?.mission),mission=Number.isInteger(rawMission)&&rawMission>=1&&rawMission<=10?rawMission:null;
      await ensureImages();
      const client=await db.connect();
      try {
       await client.query('BEGIN');
       const msg=await client.query('INSERT INTO pit_chat_messages(room_code,student_id,author,mission,body) VALUES($1,$2,$3,$4,$5) RETURNING id',[ROOM,id,author,mission,'[Imagem]']);
       await client.query('INSERT INTO pit_chat_images(message_id,mime,bytes) VALUES($1,$2,$3)',[msg.rows[0].id,mime,bytes]);
       await client.query('COMMIT');
       return res.status(201).json({ok:true,id:msg.rows[0].id});
      }catch(err){await client.query('ROLLBACK');throw err}finally{client.release()}
    }
    if(req.method==='POST' && action==='send') {
      const teacher=teacherOK(req);
      let id;
      if(teacher) {
        id=String(req.body?.studentId||'');
        if(!validId(id)) return sendError(res,400,'Escolha um aluno válido.');
        const exists=await db.query('SELECT 1 FROM pit_students WHERE id=$1 AND room_code=$2 LIMIT 1',[id,ROOM]);
        if(!exists.rowCount) return sendError(res,404,'Aluno não encontrado.');
      } else {
        const me=await student(req);
        if(!me) return sendError(res,401,'Sessão do aluno inválida.');
        id=me.id;
      }
      const body=clean(req.body?.body,MAX_BODY);
      if(body.length<2) return sendError(res,400,'Escreva pelo menos dois caracteres.');
      const author=teacher?'teacher':'student';
      const count=await db.query(
        "SELECT count(*)::int AS n FROM pit_chat_messages WHERE student_id=$1 AND author=$2 AND created_at>now()-interval '1 minute'",[id,author]);
      if(count.rows[0].n>=12) return sendError(res,429,'Limite de mensagens por minuto atingido.');
      const rawMission=Number(req.body?.mission);
      const mission=Number.isInteger(rawMission)&&rawMission>=1&&rawMission<=10 ? rawMission : null;
      const result=await db.query(
        'INSERT INTO pit_chat_messages(room_code,student_id,author,mission,body) VALUES($1,$2,$3,$4,$5) RETURNING id',
        [ROOM,id,author,mission,body]);
      return res.status(201).json({ok:true,id:result.rows[0].id});
    }
    if(req.method==='POST' && action==='read') {
      const teacher=teacherOK(req);
      let id, author;
      if(teacher) {
        id=String(req.body?.studentId||'');
        if(!validId(id)) return sendError(res,400,'Aluno inválido.');
        author='student';
      } else {
        const me=await student(req);
        if(!me) return sendError(res,401,'Sessão do aluno inválida.');
        id=me.id;
        author='teacher';
      }
      await db.query('UPDATE pit_chat_messages SET read_at=now() WHERE student_id=$1 AND room_code=$2 AND author=$3 AND read_at IS NULL',[id,ROOM,author]);
      return res.status(200).json({ok:true});
    }
    return sendError(res,404,'Ação inexistente.');
  } catch(e) {
    console.error('pit chat server error:',e.code||e.name||'unknown');
    return sendError(res,500,'Erro temporário no chat; tente novamente.');
  }
};
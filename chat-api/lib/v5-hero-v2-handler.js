'use strict';
/*
 * H.1c EXPERIMENTAL API handoff. Default-off. Never route V3 traffic here.
 * Dependency-injected for CI without Neon, Vercel, secrets or pupil accounts.
 * Authoritative token -> student ID lookup, room and teacher-approved stages
 * are all read on the backend. No cookie/session fallback, no student ID input.
 */
const {createHash}=require('node:crypto');
const {createRepository}=require('./v5-builds-v2-repository.js');
const ROOM='PITGAME26';
const ORIGINS=Object.freeze([
 'https://dev-gabriel-exe.github.io',
 'https://pit-game-jam-chat.vercel.app',
 'http://127.0.0.1:8899',
 'http://localhost:8899'
]);
function send(res,code,payload){return res.status(code).json(payload)}
function createHeroV2Handler({pool,enabled=false,roomCode=ROOM}={}){
 if(enabled&&(!pool||typeof pool.query!=='function'||typeof pool.connect!=='function'))
  throw Error('H1c: banco de dados obrigatório em modo habilitado');
 if(typeof roomCode!=='string'||!/^[a-z0-9_-]{4,64}$/i.test(roomCode))
  throw Error('H1c: sala de servidor inválida');
 const repository=enabled?createRepository(pool):null;
 return async function heroV2Handler(req,res){
  const origin=req.headers?.origin;
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('Vary','Origin');
  res.setHeader('X-Content-Type-Options','nosniff');
  // Never reflect arbitrary origin, and never use cookies.
  if(origin&&ORIGINS.includes(origin)){
   res.setHeader('Access-Control-Allow-Origin',origin);
   res.setHeader('Access-Control-Allow-Headers','Content-Type,X-PIT-Student-Token');
   res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  }
  if(origin&&!ORIGINS.includes(origin))
   return send(res,403,{ok:false,error:'Origem não autorizada.'});
  if(req.method==='OPTIONS')
   return send(res,enabled?204:503,{ok:enabled});
  if(!enabled)return send(res,503,{ok:false,error:'H1c desabilitada: integração real não autorizada.'});
  if(req.method!=='GET'&&req.method!=='POST')
   return send(res,405,{ok:false,error:'Método não permitido.'});
  if(req.method==='POST'&&!origin)
   return send(res,403,{ok:false,error:'Origem do pedido obrigatória.'});
  const token=String(req.headers?.['x-pit-student-token']||'');
  if(!/^[a-f0-9]{64}$/i.test(token))
   return send(res,401,{ok:false,error:'Entre na oficina como aluno para acessar seu herói.'});
  // Fixed, server-configured room; no accepting room_code, student_id, XP or
  // approval count from untrusted query/body parameters.
  const hash=createHash('sha256').update(token).digest('hex');
  const action=typeof req.query?.action==='string'?req.query.action:'';
  if(req.method==='GET'&&action!=='profile')
   return send(res,404,{ok:false,error:'Ação desconhecida.'});
  if(req.method==='POST'&&!['save','enter-m5','lock-m10'].includes(action))
   return send(res,404,{ok:false,error:'Ação desconhecida.'});
  const payload=req.body;
  if(req.method==='POST'){
   if(!/^application\/json(?:\s*;|\s*$)/i.test(String(req.headers?.['content-type']||'')))
    return send(res,415,{ok:false,error:'Envie JSON.'});
   if(!payload||typeof payload!=='object'||Array.isArray(payload)||
      JSON.stringify(payload).length>5000)
    return send(res,400,{ok:false,error:'Corpo do pedido inválido.'});
  }
  try{
   const r=await pool.query(
    'SELECT id,room_code FROM pit_students WHERE room_code=$1 AND token_hash=$2 LIMIT 1',
    [roomCode,hash]);
   if(r.rowCount!==1)
    return send(res,401,{ok:false,error:'Sessão do aluno inválida ou turma incorreta.'});
   const student={id:r.rows[0].id,roomCode:r.rows[0].room_code};
   let profile;
   if(req.method==='GET')profile=await repository.profile(student);
   else if(action==='save')profile=await repository.save(student,payload);
   else if(action==='enter-m5')profile=await repository.enterM5(student,payload);
   else profile=await repository.lockM10(student,payload);
   return send(res,200,{ok:true,profile});
  }catch(e){
   if(e.code==='V5_REVISION_CONFLICT')
    return send(res,409,{ok:false,error:e.message});
   if(e.code==='V5_STUDENT_FORBIDDEN')
    return send(res,403,{ok:false,error:'Aluno sem permissão nesta turma.'});
   if(e.code==='V5_BUILD_INVALID')
    return send(res,422,{ok:false,error:e.message.replace(/^H1b:\s*/, '')});
   if(e.message?.startsWith('H1b: parâmetros'))
    return send(res,400,{ok:false,error:'Formato de solicitação inválido.'});
   if(e.code==='42P01'||e.code==='42703')
    return send(res,503,{ok:false,error:'Schema V2 ainda não aplicado em ambiente autorizado.'});
   // Never expose connection strings, SQL or raw driver errors.
   return send(res,500,{ok:false,error:'Serviço de heróis temporariamente indisponível.'});
  }
 };
}
module.exports={createHeroV2Handler};

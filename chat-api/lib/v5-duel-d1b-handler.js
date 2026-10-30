'use strict';
/* D1b staging-only replay API. Student token is a header; no client seed,
 * stats, winner, grade or XP accepted. Only two invited participants can see it.
 */
const {createHash}=require('node:crypto');
const {createMatchService}=require('./v5-duel-d1b-service.js');
const ORIGINS=new Set([
 'https://dev-gabriel-exe.github.io',
 'https://pit-game-jam-chat.vercel.app',
 'http://localhost:8899','http://127.0.0.1:8899'
]);
function response(res,code,data){return res.status(code).json(data)}
function createMatchHandler({pool,enabled=false,roomCode='PITGAME26'}={}){
 if(enabled&&(!pool||typeof pool.query!=='function'||typeof pool.connect!=='function'))
  throw Error('D1b: PostgreSQL de homologação obrigatório');
 const service=enabled?createMatchService(pool):null;
 return async function handler(req,res){
  res.setHeader('Cache-Control','private,no-store');
  res.setHeader('Vary','Origin');
  res.setHeader('X-Content-Type-Options','nosniff');
  const origin=req.headers?.origin;
  if(origin&&!ORIGINS.has(origin))
   return response(res,403,{ok:false,error:'Origem não autorizada.'});
  if(origin){
   res.setHeader('Access-Control-Allow-Origin',origin);
   res.setHeader('Access-Control-Allow-Headers','Content-Type,X-PIT-Student-Token');
   res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  }
  if(req.method==='OPTIONS')return response(res,enabled?204:503,{ok:enabled});
  if(!enabled)return response(res,503,{ok:false,error:'Confrontos D1b não habilitados em produção.'});
  const action=typeof req.query?.action==='string'?req.query.action:'';
  if(!((req.method==='GET'&&action==='replay')||
        (req.method==='POST'&&action==='start')))
   return response(res,404,{ok:false,error:'Ação desconhecida.'});
  if(req.method==='POST'){
   if(!origin)return response(res,403,{ok:false,error:'Origem do convite obrigatória.'});
   if(!/^application\/json(?:\s*;|\s*$)/i.test(String(req.headers?.['content-type']||'')))
    return response(res,415,{ok:false,error:'Envie JSON.'});
   if(!req.body||typeof req.body!=='object'||Array.isArray(req.body)||
      Object.keys(req.body).length!==1||typeof req.body.inviteId!=='string')
    return response(res,400,{ok:false,error:'Pedido de duelo inválido.'});
  }
  const token=String(req.headers?.['x-pit-student-token']||'');
  if(!/^[0-9a-f]{64}$/i.test(token))
   return response(res,401,{ok:false,error:'Autenticação de aluno obrigatória.'});
  try{
   const hash=createHash('sha256').update(token).digest('hex');
   const found=await pool.query(
    'SELECT id,room_code FROM pit_students WHERE room_code=$1 AND token_hash=$2 LIMIT 1',
    [roomCode,hash]);
   if(found.rowCount!==1)
    return response(res,401,{ok:false,error:'Sessão inválida ou aluno fora desta turma.'});
   const student={id:found.rows[0].id,roomCode:found.rows[0].room_code};
   const id=req.method==='GET'?req.query?.inviteId:req.body.inviteId;
   const match=req.method==='GET'?await service.read(student,id):
    await service.start(student,id);
   return response(res,200,{ok:true,match});
  }catch(e){
   if(e.code==='V5_DUEL_REJECTED')
    return response(res,e.status||409,{ok:false,error:e.message});
   if(e.code==='V5_BUILD_INVALID')
    return response(res,422,{ok:false,error:'Personagem não corresponde às missões aprovadas.'});
   if(e.code==='42P01'||e.code==='42703')
    return response(res,503,{ok:false,error:'Arena D1b não inicializada neste banco de testes.'});
   return response(res,500,{ok:false,error:'Confronto temporariamente indisponível.'});
  }
 };
}
module.exports={createMatchHandler};

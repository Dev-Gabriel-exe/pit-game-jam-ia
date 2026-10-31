'use strict';
/* D.1a invitation API — feature gated and isolated from V3 and production. */
const {createHash}=require('node:crypto');
const {createDuelService}=require('./v5-duel-d1a-service.js');
const ORIGINS=new Set([
 'https://dev-gabriel-exe.github.io','https://pit-game-jam-chat.vercel.app',
 'http://127.0.0.1:8899','http://localhost:8899'
]);
const ROOM='PITGAME26';
const METHODS=Object.freeze({
 'state':'GET','available':'POST','invite':'POST',
 'accept':'POST','decline':'POST','cancel':'POST'
});
function respond(res,status,payload){return res.status(status).json(payload)}
function createDuelHandler({pool,enabled=false,roomCode=ROOM}={}){
 if(enabled&&(!pool||typeof pool.query!=='function'||typeof pool.connect!=='function'))
  throw Error('D1a: pool de homologação obrigatório');
 if(!/^[a-z0-9_-]{4,64}$/i.test(roomCode))throw Error('D1a: sala de homologação inválida');
 const service=enabled?createDuelService(pool):null;
 return async function duelHandler(req,res){
  res.setHeader('Cache-Control','private,no-store');
  res.setHeader('Vary','Origin');
  res.setHeader('X-Content-Type-Options','nosniff');
  const origin=req.headers?.origin;
  if(origin&&!ORIGINS.has(origin))
   return respond(res,403,{ok:false,error:'Origem não autorizada.'});
  if(origin){
   res.setHeader('Access-Control-Allow-Origin',origin);
   res.setHeader('Access-Control-Allow-Headers','Content-Type,X-PIT-Student-Token');
   res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  }
  if(req.method==='OPTIONS')return respond(res,enabled?204:503,{ok:enabled});
  if(!enabled)return respond(res,503,{ok:false,error:'Duelos de laboratório desativados.'});
  const action=typeof req.query?.action==='string'?req.query.action:'';
  if(!Object.prototype.hasOwnProperty.call(METHODS,action)||METHODS[action]!==req.method)
   return respond(res,404,{ok:false,error:'Ação desconhecida.'});
  if(req.method==='POST'){
   if(!origin)return respond(res,403,{ok:false,error:'Origem obrigatória para alterações.'});
   if(!/^application\/json(?:\s*;|\s*$)/i.test(String(req.headers?.['content-type']||'')))
    return respond(res,415,{ok:false,error:'Envie JSON.'});
   if(!req.body||typeof req.body!=='object'||Array.isArray(req.body)||
      JSON.stringify(req.body).length>800)
    return respond(res,400,{ok:false,error:'Payload inválido.'});
  }
  const token=String(req.headers?.['x-pit-student-token']||'');
  if(!/^[a-f0-9]{64}$/i.test(token))
   return respond(res,401,{ok:false,error:'Sessão de aluno necessária.'});
  try{
   const hash=createHash('sha256').update(token).digest('hex');
   const user=await pool.query(
    'SELECT id,room_code FROM pit_students WHERE room_code=$1 AND token_hash=$2 LIMIT 1',
    [roomCode,hash]);
   if(user.rowCount!==1)return respond(res,401,{ok:false,error:'Aluno não autenticado nesta turma.'});
   const me={id:user.rows[0].id,roomCode:user.rows[0].room_code};
   let result;
   if(action==='state')result=await service.current(me);
   else if(action==='available'){
    if(Object.keys(req.body).length!==1||typeof req.body.available!=='boolean')
     return respond(res,400,{ok:false,error:'Disponibilidade inválida.'});
    result=await service.setAvailable(me,req.body.available);
   }else if(action==='invite'){
    if(Object.keys(req.body).length!==1||typeof req.body.targetId!=='string')
     return respond(res,400,{ok:false,error:'Colega inválido.'});
    result=await service.invite(me,req.body.targetId);
   }else{
    if(Object.keys(req.body).length!==1||typeof req.body.inviteId!=='string')
     return respond(res,400,{ok:false,error:'Convite inválido.'});
    result=await service.decide(me,req.body.inviteId,action);
   }
   return respond(res,200,{ok:true,result});
  }catch(e){
   if(e.code==='V5_DUEL_REJECTED')
    return respond(res,e.status||409,{ok:false,error:e.message});
   if(e.code==='42P01'||e.code==='42703')
    return respond(res,503,{ok:false,error:'Duelos ainda não inicializados neste ambiente.'});
   return respond(res,500,{ok:false,error:'Serviço temporariamente indisponível.'});
  }
 };
}
module.exports={createDuelHandler};

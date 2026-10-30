'use strict';
/**
 * D.1c: staging-only teacher switch. The secret is a high-entropy, server-side
 * test credential and is NEVER read from the V3 teacher PIN or student session.
 * Only a disposable database may be connected to this handler.
 */
const {timingSafeEqual,createHash}=require('node:crypto');
const ROOM='PITGAME26';
const origins=new Set(['http://127.0.0.1:8899','http://localhost:8899']);
function fail(res,n,error){return res.status(n).json({ok:false,error})}
function createTeacherDuelHandler({pool,enabled=false,roomCode=ROOM,teacherKey}={}){
 if(enabled&&(!pool?.connect||!pool?.query||
  !/^[a-f0-9]{64}$/i.test(teacherKey||'')))
  throw Error('D1c: banco e chave de homologação de 256 bits obrigatórios');
 const expected=enabled?createHash('sha256').update(teacherKey).digest():null;
 return async(req,res)=>{
  res.setHeader('Cache-Control','private,no-store');
  res.setHeader('Vary','Origin');
  res.setHeader('X-Content-Type-Options','nosniff');
  const origin=req.headers?.origin;
  if(origin&&!origins.has(origin))return fail(res,403,'Origem de laboratório inválida.');
  if(origin){
   res.setHeader('Access-Control-Allow-Origin',origin);
   res.setHeader('Access-Control-Allow-Headers','Content-Type,X-PIT-V5-Teacher-Lab-Key');
   res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  }
  if(req.method==='OPTIONS')return fail(res,enabled?204:503,'');
  if(!enabled)return fail(res,503,'Controle docente de laboratório desativado.');
  const supplied=String(req.headers?.['x-pit-v5-teacher-lab-key']||'');
  if(!/^[a-f0-9]{64}$/i.test(supplied))return fail(res,401,'Credencial de homologação necessária.');
  const actual=createHash('sha256').update(supplied).digest();
  if(!timingSafeEqual(expected,actual))return fail(res,401,'Credencial de homologação inválida.');
  if(req.method!=='GET'&&req.method!=='POST')return fail(res,405,'Método não permitido.');
  if(req.method==='POST'){
   if(!origin)return fail(res,403,'Origem obrigatória para alteração.');
   if(!/^application\/json(?:\s*;|\s*$)/i.test(String(req.headers?.['content-type']||'')))
    return fail(res,415,'Envie JSON.');
   if(!req.body||Object.keys(req.body).length!==1||
    typeof req.body.enabled!=='boolean')
    return fail(res,400,'Use somente enabled boolean.');
  }
  const client=await pool.connect();let transaction=false;
  try{
   await client.query('BEGIN');transaction=true;
   // Lock the classroom row that D1a/D1b concurrently acquire FOR SHARE.
   // No already-running match is cancelled or modified by this switch.
   const room=await client.query(
    'SELECT room_code FROM pit_classroom_state WHERE room_code=$1 FOR UPDATE',
    [roomCode]);
   if(room.rowCount!==1)throw Error('Sala de homologação inexistente');
   if(req.method==='POST'){
    await client.query(
     'INSERT INTO pit_duel_room_settings(room_code,enabled,updated_at) '+
     'VALUES($1,$2,NOW()) ON CONFLICT(room_code) '+
     'DO UPDATE SET enabled=EXCLUDED.enabled,updated_at=NOW()',
     [roomCode,req.body.enabled]);
   }
   const setting=await client.query(
    'SELECT enabled,updated_at FROM pit_duel_room_settings WHERE room_code=$1',
    [roomCode]);
   const state={enabled:setting.rows[0]?.enabled===true,
    updatedAt:setting.rows[0]?.updated_at||null,
    note:'Somente homologação: nenhuma nota, XP ou turma real alterada.'};
   await client.query('COMMIT');transaction=false;
   return res.status(200).json({ok:true,state});
  }catch(e){
   if(transaction)try{await client.query('ROLLBACK')}catch{}
   return fail(res,503,'Controle docente de homologação indisponível.');
  }finally{client.release()}
 };
}
module.exports={createTeacherDuelHandler};

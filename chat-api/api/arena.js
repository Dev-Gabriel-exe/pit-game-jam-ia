'use strict';
/* V5 arena service. Requires v5/migration-001.sql run explicitly before deployment.
 * Student names/XP are always server-derived. No client XP, name or peer score trusted.
 * Class roster is visible ONLY with teacher PIN; peer names only after stage 9.
 */
const {Pool}=require('pg');
const {createHash,timingSafeEqual}=require('node:crypto');
const core=require('../lib/v5-hero-core.js');
const ROOM='PITGAME26';
const ORIGINS=new Set(['https://dev-gabriel-exe.github.io','https://pit-game-jam-chat.vercel.app','http://127.0.0.1:8899','http://localhost:8899']);
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:9000,idleTimeoutMillis:12000});
const err=(r,c,s)=>r.status(c).json({ok:false,error:s});
function eq(a,b){const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y)}
function teacher(req){const p=String(req.headers['x-pit-teacher-pin']||'');return p.length>=16&&eq(p,process.env.PIT_TEACHER_PIN||'')}
function cleaned(v,max=500){return String(v==null?'':v).replace(/[\x00-\x1f\x7f]/g,' ').trim().slice(0,max)}
async function student(req){
 const t=String(req.headers['x-pit-student-token']||'');
 if(!/^[a-f\d]{64}$/i.test(t))return null;
 const q=await pool.query('SELECT id,display_name FROM pit_students WHERE room_code=$1 AND token_hash=$2 LIMIT 1',[ROOM,createHash('sha256').update(t).digest('hex')]);
 return q.rows[0]||null;
}
async function progress(id){
 const r=await pool.query('SELECT COUNT(*)::int AS approved FROM pit_student_stages WHERE student_id=$1 AND status=$2',[id,'approved']);
 return r.rows[0]?.approved||0;
}
async function peerBonus(ids){
 if(!ids.length)return new Map();
 const r=await pool.query('SELECT target_id, round(avg(score))::int AS review_score FROM pit_peer_reviews WHERE target_id=ANY($1::uuid[]) GROUP BY target_id',[ids]);
 return new Map(r.rows.map(x=>[String(x.target_id),x.review_score]));
}
async function dataFor(me){
 const done=await progress(me.id);
 const scored=await peerBonus([me.id]);
 const xp=core.exp(done,scored.has(String(me.id))?scored.get(String(me.id)):null);
 const r=await pool.query('SELECT build,updated_at FROM pit_hero_builds WHERE student_id=$1',[me.id]);
 let build;
 try{build=core.canonical(r.rows[0]?.build||core.seedBuild(me.display_name),me.display_name,xp.total)}
 catch{build=core.canonical(core.seedBuild(me.display_name),me.display_name,xp.total)}
 return {id:me.id,name:me.display_name,build,progress:xp,updatedAt:r.rows[0]?.updated_at||null};
}
module.exports=async function handler(req,res){
 const origin=req.headers.origin;
 res.setHeader('Access-Control-Allow-Origin',origin&&ORIGINS.has(origin)?origin:'https://dev-gabriel-exe.github.io');
 res.setHeader('Access-Control-Allow-Headers','Content-Type,X-PIT-Teacher-Pin,X-PIT-Student-Token');
 res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
 res.setHeader('Cache-Control','private,no-store');
 res.setHeader('Vary','Origin');res.setHeader('X-Content-Type-Options','nosniff');
 if(origin&&!ORIGINS.has(origin))return err(res,403,'Origem não autorizada.');
 if(req.method==='OPTIONS')return res.status(204).end();
 if(!process.env.DATABASE_URL||!process.env.PIT_TEACHER_PIN)return err(res,503,'Serviço ainda não configurado.');
 try{
  const action=cleaned(req.query?.action,32),isTeacher=teacher(req),me=isTeacher?null:await student(req);
  if(!isTeacher&&!me)return err(res,401,'Entre com seu cadastro da oficina para criar um herói.');
  if(req.method==='GET'&&action==='me'){
   if(!me)return err(res,403,'Somente alunos podem editar seus heróis.');
   const hero=await dataFor(me);
   const stage=await pool.query('SELECT current_stage FROM pit_classroom_state WHERE room_code=$1',[ROOM]);
   const reviews=await pool.query('SELECT target_id,score,created_at FROM pit_peer_reviews WHERE evaluator_id=$1',[me.id]);
   return res.json({ok:true,hero,review:reviews.rows[0]||null,reviewUnlocked:Number(stage.rows[0]?.current_stage||0)>=9});
  }
  if(req.method==='POST'&&action==='build'){
   if(!me)return err(res,403,'Somente aluno autenticado pode personalizar seu herói.');
   const done=await progress(me.id),grades=await peerBonus([me.id]);
   const xp=core.exp(done,grades.has(String(me.id))?grades.get(String(me.id)):null);
   const payload=req.body?.build;
   if(!payload||JSON.stringify(payload).length>5000)return err(res,400,'Build inválida.');
   let b;
   try{b=core.canonical(payload,me.display_name,xp.total)}
   catch(e){return err(res,400,cleaned(e.message,180))}
   // Store ONLY editable fields; XP/name/level are derived afresh per request.
   const safe={klass:b.klass,appearance:b.appearance,attributes:b.attributes,talents:b.talents};
   await pool.query('INSERT INTO pit_hero_builds(student_id,build,updated_at) VALUES($1,$2::jsonb,NOW()) ON CONFLICT(student_id) DO UPDATE SET build=EXCLUDED.build,updated_at=NOW()',[me.id,JSON.stringify(safe)]);
   return res.json({ok:true,hero:await dataFor(me)});
  }
  if(req.method==='GET'&&action==='peers'){
   if(!me)return err(res,403,'Somente estudantes participam do playtest.');
   const s=await pool.query('SELECT current_stage FROM pit_classroom_state WHERE room_code=$1',[ROOM]);
   if(Number(s.rows[0]?.current_stage||0)<9)return err(res,403,'Avaliação por colegas disponível somente na Missão 09.');
   const r=await pool.query('SELECT id,display_name FROM pit_students WHERE room_code=$1 AND id<>$2 ORDER BY display_name,id LIMIT 180',[ROOM,me.id]);
   return res.json({ok:true,peers:r.rows.map(x=>({id:x.id,name:x.display_name}))});
  }
  if(req.method==='POST'&&action==='review'){
   if(!me)return err(res,403,'Somente estudantes podem avaliar colegas.');
   const s=await pool.query('SELECT current_stage FROM pit_classroom_state WHERE room_code=$1',[ROOM]);
   if(Number(s.rows[0]?.current_stage||0)<9)return err(res,403,'Playtest só pode ser enviado a partir da Missão 09.');
   const target=cleaned(req.body?.targetId,40);
   if(!/^[0-9a-f-]{36}$/i.test(target)||target===String(me.id))return err(res,400,'Selecione um colega diferente de você.');
   const score=Number(req.body?.score),comment=cleaned(req.body?.comment,500);
   if(!Number.isInteger(score)||score<0||score>10)return err(res,400,'A avaliação deve ser um número inteiro de 0 a 10.');
   if(comment.length<15)return err(res,400,'Explique o que funcionou e o que pode melhorar (mínimo 15 caracteres).');
   const found=await pool.query('SELECT id FROM pit_students WHERE id=$1 AND room_code=$2',[target,ROOM]);
   if(!found.rowCount)return err(res,404,'Colega não encontrado nesta turma.');
   // One review per evaluator prevents rating spam / XP farming; teachers can moderate.
   const r=await pool.query('INSERT INTO pit_peer_reviews(evaluator_id,target_id,score,comment) VALUES($1,$2,$3,$4) ON CONFLICT(evaluator_id) DO NOTHING RETURNING score',[me.id,target,score,comment]);
   if(!r.rowCount)return err(res,409,'Você já enviou a avaliação de um colega.');
   return res.json({ok:true,submitted:true,peerReviewXp:Math.min(30,score*3)});
  }
  if(req.method==='GET'&&action==='roster'){
   if(!isTeacher)return err(res,403,'A arena da turma exige autenticação do professor.');
   const r=await pool.query('SELECT id,display_name,last_seen_at FROM pit_students WHERE room_code=$1 ORDER BY joined_at,id LIMIT 180',[ROOM]);
   const p=await pool.query("SELECT student_id,COUNT(*)::int AS approved FROM pit_student_stages WHERE status='approved' AND student_id=ANY($1::uuid[]) GROUP BY student_id",[r.rows.map(x=>x.id)]);
   const counts=new Map(p.rows.map(x=>[String(x.student_id),x.approved]));
   const b=await pool.query('SELECT student_id,build FROM pit_hero_builds WHERE student_id=ANY($1::uuid[])',[r.rows.map(x=>x.id)]);
   const builds=new Map(b.rows.map(x=>[String(x.student_id),x.build]));
   const grades=await peerBonus(r.rows.map(x=>x.id));
   const heroes=r.rows.map(s=>{
    const xp=core.exp(counts.get(String(s.id))||0,grades.has(String(s.id))?grades.get(String(s.id)):null);
    let build;try{build=core.canonical(builds.get(String(s.id))||core.seedBuild(s.display_name),s.display_name,xp.total)}
    catch{build=core.canonical(core.seedBuild(s.display_name),s.display_name,xp.total)}
    return {id:s.id,name:s.display_name,build,progress:xp};
   });
   return res.json({ok:true,heroes});
  }
  if(req.method==='POST'&&action==='moderate'){
   if(!isTeacher)return err(res,403,'Somente professor pode invalidar avaliações.');
   const id=cleaned(req.body?.evaluatorId,40);
   if(!/^[0-9a-f-]{36}$/i.test(id))return err(res,400,'Identificador inválido.');
   const r=await pool.query('DELETE FROM pit_peer_reviews WHERE evaluator_id=$1 AND EXISTS(SELECT 1 FROM pit_students WHERE id=$1 AND room_code=$2) RETURNING evaluator_id',[id,ROOM]);
   return res.json({ok:true,removed:r.rowCount===1});
  }
  return err(res,404,'Ação desconhecida.');
 }catch(e){
  console.error('PIT V5 arena:',e.code||e.name);
  if(e.code==='42P01')return err(res,503,'Arena V5 ainda não inicializada. Execute a migração SQL na implantação.');
  return err(res,500,'Arena temporariamente indisponível.');
 }
};
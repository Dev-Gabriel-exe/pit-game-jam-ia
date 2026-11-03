'use strict';
// Forja real: uma ficha por aluno, vinculada ao token, e não ao nome digitado.
// 2 pontos de atributo e 1 talento para cada missão aprovada no Neon.
const {Pool}=require('pg');
const {createHash}=require('node:crypto');
const ids=require('../lib/v5-phase2-talent-ids.json').classes;
const ALLOWED_ORIGINS=new Set(['https://dev-gabriel-exe.github.io','https://pit-game-jam-chat.vercel.app']);
const ATTR=['FOR','DES','INT','VIT','DEF'];
const VALID_ROOMS=new Set(['PITGAME26','PITGAME26B']);
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:3,idleTimeoutMillis:15000,connectionTimeoutMillis:9000});
const fail=(res,status,error)=>res.status(status).json({ok:false,error});
const fresh=()=>({klass:'warrior',attributes:{FOR:0,DES:0,INT:0,VIT:0,DEF:0},talents:[]});
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const plain=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
function validateProfile(value,approved) {
 if(!plain(value)||!own(ids,value.klass))throw Error('Classe de personagem inválida.');
 if(!plain(value.attributes)||!Array.isArray(value.talents))throw Error('Ficha incompleta.');
 if(Object.keys(value.attributes).length!==ATTR.length||ATTR.some(a=>!own(value.attributes,a)))
  throw Error('Atributos incorretos.');
 const attributes={},budget=Math.max(0,Math.min(10,approved))*2;
 let spent=0;
 for(const a of ATTR) {
  const n=value.attributes[a];
  if(!Number.isInteger(n)||n<0||n>20)throw Error('Cada atributo deve ser um número inteiro entre 0 e 20.');
  attributes[a]=n;spent+=n;
 }
 if(spent>budget)throw Error('Atributos excedem os pontos de missões aprovadas.');
 if(value.talents.length>Math.min(10,approved))throw Error('Talentos excedem as missões aprovadas.');
 const allowed=new Set(ids[value.klass]),talents=[],seen=new Set();
 for(const id of value.talents) {
  if(typeof id!=='string'||!allowed.has(id)||seen.has(id))throw Error('Talento inválido ou repetido para esta classe.');
  seen.add(id);talents.push(id);
 }
 return {klass:value.klass,attributes,talents};
}
async function authenticatedStudent(client,token) {
 if(!/^[a-f\d]{64}$/i.test(token))return null;
 const hash=createHash('sha256').update(token).digest('hex');
 const q=await client.query('SELECT id,room_code FROM public.pit_students WHERE token_hash=$1 LIMIT 1',[hash]);
 const student=q.rows[0]||null;
 return student&&VALID_ROOMS.has(student.room_code)?student:null;
}
async function approvedCount(client,id) {
 const q=await client.query("SELECT count(*)::int AS n FROM public.pit_student_stages WHERE student_id=$1 AND status='approved'",[id]);
 return Math.min(10,Math.max(0,Number(q.rows[0]?.n)||0));
}
async function readProfile(client,id) {
 const q=await client.query('SELECT klass,attributes,talents,revision,updated_at FROM public.pit_student_heroes WHERE student_id=$1',[id]);
 return q.rows[0]||null;
}
function createHandler(db=pool){
 return async function handler(req,res){
  const origin=req.headers.origin;
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('Vary','Origin');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, X-PIT-Student-Token');
  if(origin&&!ALLOWED_ORIGINS.has(origin))return fail(res,403,'Origem não autorizada.');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(!['GET','POST'].includes(req.method))return fail(res,405,'Método não permitido.');
  if(!process.env.DATABASE_URL)return fail(res,503,'Persistência do herói não configurada.');
  const token=String(req.headers['x-pit-student-token']||'');
  if(!/^[a-f\d]{64}$/i.test(token))return fail(res,401,'Entre com a conta do aluno.');
  if(req.method==='POST') {
   if(!plain(req.body)||!Number.isInteger(req.body.revision)||req.body.revision<0||
      req.body.revision>2147483646)
    return fail(res,400,'Revisão da ficha inválida.');
   if(JSON.stringify(req.body).length>5000)return fail(res,413,'Ficha muito grande.');
  }
  const client=await db.connect().catch(()=>null);
  if(!client)return fail(res,503,'Não foi possível conectar ao banco.');
  try{
   if(req.method==='POST')await client.query('BEGIN');
   const student=await authenticatedStudent(client,token);
   if(!student){if(req.method==='POST')await client.query('ROLLBACK');return fail(res,401,'Sessão do aluno inválida. Recupere seu cadastro.');}
   const approved=await approvedCount(client,student.id);
   if(req.method==='GET') {
    const saved=await readProfile(client,student.id);
    return res.status(200).json({ok:true,exists:!!saved,profile:saved?{
     klass:saved.klass,attributes:saved.attributes,talents:saved.talents}:fresh(),
     revision:saved?.revision||0,updatedAt:saved?.updated_at||null,approved,room:student.room_code});
   }
   let profile;
   try{profile=validateProfile(req.body.profile,approved)}
   catch(e){await client.query('ROLLBACK');return fail(res,400,e.message)}
   const expected=req.body.revision;
   // Optimistic concurrency: another computer never silently overwrites newer choices.
   const result=await client.query(
    `INSERT INTO public.pit_student_heroes (student_id,klass,attributes,talents,revision)
     SELECT $1,$2,$3::jsonb,$4::jsonb,1 WHERE $5=0
     ON CONFLICT (student_id) DO UPDATE
       SET klass=EXCLUDED.klass,attributes=EXCLUDED.attributes,talents=EXCLUDED.talents,
           revision=pit_student_heroes.revision+1,updated_at=now()
     WHERE pit_student_heroes.revision=$5
     RETURNING revision,updated_at`,
    [student.id,profile.klass,JSON.stringify(profile.attributes),JSON.stringify(profile.talents),expected]
   );
   if(!result.rowCount) {
    await client.query('ROLLBACK');
    return fail(res,409,'O personagem foi atualizado em outro dispositivo. Recarregue a ficha antes de salvar.');
   }
   await client.query('COMMIT');
   return res.status(200).json({ok:true,profile,revision:result.rows[0].revision,
    updatedAt:result.rows[0].updated_at,approved,room:student.room_code});
  }catch(e){
   if(req.method==='POST')await client.query('ROLLBACK').catch(()=>{});
   console.error('pit hero sync:',e.code||e.name);
   return fail(res,503,'Não foi possível acessar o personagem no servidor. Tente novamente.');
  }finally{client.release()}
 };
}
module.exports=createHandler();
module.exports.createHandler=createHandler;
module.exports.validateProfile=validateProfile;

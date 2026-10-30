'use strict';
/* Local integration-only staging server — fictitious tokens, teacher and roster.
 * GET/POST are forwarded into actual D1a/D1b/D1c handlers with a disposable DB.
 */
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {Pool}=require('pg');
const {createDuelHandler}=require('../chat-api/lib/v5-duel-d1a-handler.js');
const {createMatchHandler}=require('../chat-api/lib/v5-duel-d1b-handler.js');
const {createTeacherDuelHandler}=require('../chat-api/lib/v5-duel-d1c-teacher.js');
const P=require('../chat-api/lib/v5-duel-phase2-engine.js');
const ROOT=path.resolve(__dirname,'..'),PORT=8899,KEY='f'.repeat(64);
const pool=new Pool({
 host:'127.0.0.1',port:5432,user:'postgres',password:'ci_only_password',
 database:'pit_v5_d1c_test',max:20
});
const people=[
 {id:'11111111-1111-4111-8111-111111111111',name:'Ayla',klass:'guardian',approved:2,token:'a'.repeat(64)},
 {id:'22222222-2222-4222-8222-222222222222',name:'Breno',klass:'mage',approved:3,token:'b'.repeat(64)},
 {id:'33333333-3333-4333-8333-333333333333',name:'Caio',klass:'warrior',approved:2,token:'c'.repeat(64),working:true}
];
async function seed(){
 for(const p of people){
  await pool.query('INSERT INTO pit_students(id,room_code,token_hash,display_name) VALUES($1,$2,$3,$4)',
   [p.id,'PITGAME26',createHash('sha256').update(p.token).digest('hex'),p.name]);
  for(let stage=1;stage<=3;stage++){
   await pool.query('INSERT INTO pit_student_stages(student_id,stage,status) VALUES($1,$2,$3)',
    [p.id,stage,stage<=p.approved?'approved':p.working?'working':'submitted']);
  }
  const attributes={FOR:0,DES:0,INT:0,VIT:0,DEF:0};
  attributes[{warrior:'FOR',mage:'INT',hunter:'DES',guardian:'DEF'}[p.klass]]=p.approved*2;
  await pool.query('INSERT INTO pit_hero_builds_v2 '+
   '(student_id,room_code,klass,attributes,talents) VALUES($1,$2,$3,$4::jsonb,$5::jsonb)',
   [p.id,'PITGAME26',p.klass,JSON.stringify(attributes),
    JSON.stringify(P.TALENTS[p.klass].slice(0,p.approved).map(t=>t.id))]);
 }
}
function output(res,code,data){
 res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
 res.end(JSON.stringify(data));
}
async function apiCall(handler,req,res,url){
 req.query={action:url.searchParams.get('action'),inviteId:url.searchParams.get('inviteId')};
 res.status=function(n){this.statusCode=n;return this};
 res.json=function(body){
  if(this.statusCode===204)return this.end();
  this.setHeader('Content-Type','application/json; charset=utf-8');
  this.end(JSON.stringify(body));return this;
 };
 if(req.method==='POST'){
  let raw='';
  try{
   for await(const chunk of req){
    raw+=chunk.toString('utf8');
    if(raw.length>2500)return output(res,413,{ok:false,error:'Corpo de requisição muito grande'});
   }
   req.body=JSON.parse(raw);
  }catch{return output(res,400,{ok:false,error:'JSON inválido'})}
 }
 try{await handler(req,res)}
 catch{return output(res,500,{ok:false,error:'Falha na fixture isolada'})}
}
async function run(){
 await seed();
 const handlers=new Map([
  ['/api/duel-v2-lab',createDuelHandler({pool,enabled:true})],
  ['/api/duel-match-v2-lab',createMatchHandler({pool,enabled:true})],
  ['/api/duel-teacher-v2-lab',createTeacherDuelHandler({pool,enabled:true,teacherKey:KEY})]
 ]);
 const server=http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://127.0.0.1:'+PORT);
  if(u.pathname==='/__fixture')return output(res,200,{ok:true,fictional:true});
  if(handlers.has(u.pathname))return apiCall(handlers.get(u.pathname),req,res,u);
  if(req.method!=='GET'||!u.pathname.startsWith('/v5/'))
   return output(res,404,{ok:false});
  const target=path.resolve(ROOT,'.'+decodeURIComponent(u.pathname));
  if(!target.startsWith(path.join(ROOT,'v5')+path.sep))
   return output(res,403,{ok:false});
  try{
   const body=await fs.readFile(target);
   const type=target.endsWith('.js')?'text/javascript':
    target.endsWith('.css')?'text/css':target.endsWith('.html')?'text/html':
    'application/octet-stream';
   res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'});
   res.end(body);
  }catch{return output(res,404,{ok:false})}
 });
 await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(PORT,'127.0.0.1',resolve);
 });
 console.log('D1c fixture ready',PORT);
 process.on('SIGTERM',()=>{server.close();pool.end().then(()=>process.exit(0))});
}
run().catch(e=>{console.error(e);process.exitCode=1;pool.end().catch(()=>{})});

'use strict';
/* Disposable PostgreSQL fixture for two independent Chromium clients.
 * Only 2 fake students, no Neon, no V3 API, no live grades or students.
 */
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {Pool}=require('pg');
const {createMatchHandler}=require('../chat-api/lib/v5-duel-d1b-handler.js');
const {createDuelService}=require('../chat-api/lib/v5-duel-d1a-service.js');
const {createDuelHandler}=require('../chat-api/lib/v5-duel-d1a-handler.js');
const P=require('../chat-api/lib/v5-duel-phase2-engine.js');
const ROOT=path.resolve(__dirname,'..');
const PORT=8899;
const students=[
 {id:'11111111-1111-4111-8111-111111111111',name:'Ayla',token:'a'.repeat(64),klass:'guardian',approved:2},
 {id:'22222222-2222-4222-8222-222222222222',name:'Breno',token:'b'.repeat(64),klass:'mage',approved:3}
];
const db=new Pool({host:'127.0.0.1',port:5432,user:'postgres',
 password:'ci_only_password',database:'pit_v5_d1b_test',max:15});
let inviteId=null,server=null;
async function seed(){
 await db.query("INSERT INTO pit_duel_room_settings(room_code,enabled) VALUES('PITGAME26',true)");
 for(const s of students){
  await db.query('INSERT INTO pit_students(id,room_code,token_hash,display_name) VALUES($1,$2,$3,$4)',
   [s.id,'PITGAME26',createHash('sha256').update(s.token).digest('hex'),s.name]);
  for(let m=1;m<=3;m++){
   const status=m<=s.approved?'approved':'submitted';
   await db.query('INSERT INTO pit_student_stages(student_id,stage,status) VALUES($1,$2,$3)',
    [s.id,m,status]);
  }
  const attributes={FOR:0,DES:0,INT:0,VIT:0,DEF:0};
  attributes[s.klass==='guardian'?'DEF':'INT']=s.approved*2;
  const talents=P.TALENTS[s.klass].slice(0,s.approved).map(t=>t.id);
  await db.query('INSERT INTO pit_hero_builds_v2 '+
   '(student_id,room_code,klass,attributes,talents) VALUES($1,$2,$3,$4::jsonb,$5::jsonb)',
   [s.id,'PITGAME26',s.klass,JSON.stringify(attributes),JSON.stringify(talents)]);
 }
 const service=createDuelService(db);
 for(const s of students)await service.setAvailable({id:s.id,roomCode:'PITGAME26'},true);
 const invite=await service.invite({id:students[0].id,roomCode:'PITGAME26'},students[1].id);
 await service.decide({id:students[1].id,roomCode:'PITGAME26'},invite.id,'accept');
 inviteId=invite.id;
}
function answer(res,status,payload){
 res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
 res.end(JSON.stringify(payload));
}
async function handlerHTTP(handler,req,res,u){
 req.query={action:u.searchParams.get('action'),inviteId:u.searchParams.get('inviteId')};
 res.status=function(code){this.statusCode=code;return this};
 res.json=function(o){
  if(this.statusCode===204){this.end();return this}
  this.setHeader('Content-Type','application/json');
  this.end(JSON.stringify(o));return this;
 };
 if(req.method==='POST'){
  let s='';
  try{
   for await(const chunk of req){
    s+=chunk.toString('utf8');
    if(s.length>2048)return answer(res,413,{ok:false,error:'Payload muito longo'});
   }
   req.body=JSON.parse(s);
  }catch{return answer(res,400,{ok:false,error:'JSON inválido'})}
 }
 try{await handler(req,res)}
 catch{return answer(res,500,{ok:false,error:'Serviço não disponível'})}
}
async function run(){
 await seed();
 const duel=createDuelHandler({pool:db,enabled:true});
 const match=createMatchHandler({pool:db,enabled:true});
 server=http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://127.0.0.1:'+PORT);
  if(u.pathname==='/__fixture')return answer(res,200,{inviteId});
  if(u.pathname==='/api/duel-match-v2-lab')return handlerHTTP(match,req,res,u);
  if(u.pathname==='/api/duel-v2-lab')return handlerHTTP(duel,req,res,u);
  if(req.method!=='GET'||!u.pathname.startsWith('/v5/'))
   return answer(res,404,{ok:false});
  const p=path.resolve(ROOT,'.'+decodeURIComponent(u.pathname));
  if(!p.startsWith(ROOT+path.sep+'v5'+path.sep))
   return answer(res,403,{ok:false});
  try{
   const body=await fs.readFile(p);
   const mime=p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':
    p.endsWith('.html')?'text/html':'application/octet-stream';
   res.writeHead(200,{'Content-Type':mime+'; charset=utf-8','Cache-Control':'no-store'});
   res.end(body);
  }catch{return answer(res,404,{ok:false})}
 });
 await new Promise((ok,bad)=>{
  server.once('error',bad);server.listen(PORT,'127.0.0.1',ok);
 });
 console.log('D1b fixture ready',inviteId);
}
async function close(){server?.close();await db.end()}
process.on('SIGTERM',()=>close().then(()=>process.exit(0)));
run().catch(e=>{console.error(e);process.exitCode=1;db.end().catch(()=>{})});

'use strict';
/*
 * H1d local-only Playwright HTTP fixture: real API handler with disposable PG.
 * It never connects to Neon, Vercel, external classrooms or any live system.
 * Uses fixed fake tokens and fake UUIDs exclusively inside CI.
 */
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {Pool}=require('pg');
const {createHeroV2Handler}=require('../chat-api/lib/v5-hero-v2-handler.js');
const PORT=Number(process.env.PIT_H1D_PORT||8899);
const ROOT=path.resolve(__dirname,'..');
const pool=new Pool({
 host:'127.0.0.1',port:5432,user:'postgres',password:'ci_only_password',
 database:'pit_v5_h1d_test',max:5
});
const students=[
 {id:'11111111-1111-4111-8111-111111111111',token:'a'.repeat(64)},
 {id:'22222222-2222-4222-8222-222222222222',token:'b'.repeat(64)}
];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
async function seed(){
 for(const stu of students){
  await pool.query('INSERT INTO pit_students(id,room_code,token_hash) VALUES($1,$2,$3)',
   [stu.id,'PITGAME26',createHash('sha256').update(stu.token).digest('hex')]);
  for(let stage=1;stage<=3;stage++){
   await pool.query('INSERT INTO pit_student_stages(student_id,stage,status) VALUES($1,$2,$3)',
    [stu.id,stage,'approved']);
  }
 }
}
function json(res,status,value){
 res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
 res.end(JSON.stringify(value));
}
async function run(){
 await seed();
 const api=createHeroV2Handler({pool,enabled:true,roomCode:'PITGAME26'});
 const server=http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://127.0.0.1:'+PORT);
  if(u.pathname==='/__h1d_health'){
   return json(res,200,{ok:true,fixture:true});
  }
  if(u.pathname==='/api/hero-v2-lab'){
   req.query={action:u.searchParams.get('action')};
   res.status=function(n){this.statusCode=n;return this};
   res.json=function(payload){
    if(this.statusCode===204){this.end();return this}
    this.setHeader('Content-Type','application/json; charset=utf-8');
    this.end(JSON.stringify(payload));return this;
   };
   let raw='';
   if(req.method==='POST'){
    try{
     for await (const chunk of req){
      raw+=chunk.toString('utf8');
      if(raw.length>8000)return json(res,413,{ok:false,error:'Limite do corpo excedido'});
     }
     req.body=JSON.parse(raw);
    }catch{return json(res,400,{ok:false,error:'JSON inválido'})}
   }
   try{return await api(req,res)}
   catch{return json(res,500,{ok:false,error:'Falha do ambiente de homologação'})}
  }
  if(req.method!=='GET')return json(res,405,{ok:false,error:'Método não permitido'});
  if(!u.pathname.startsWith('/v5/'))return json(res,404,{ok:false});
  const file=path.resolve(ROOT,'.'+decodeURIComponent(u.pathname));
  if(!file.startsWith(path.join(ROOT,'v5')+path.sep))
   return json(res,403,{ok:false});
  try{
   const body=await fs.readFile(file);
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream',
    'Cache-Control':'no-store'});
   res.end(body);
  }catch{return json(res,404,{ok:false})}
 });
 await new Promise((ok,fail)=>{
  server.once('error',fail);
  server.listen(PORT,'127.0.0.1',ok);
 });
 console.log('H1d disposable local test server ready at '+PORT);
 async function shutdown(){
  server.close();
  await pool.end();
 }
 process.on('SIGTERM',()=>{shutdown().then(()=>process.exit(0))});
 process.on('SIGINT',()=>{shutdown().then(()=>process.exit(0))});
}
run().catch(e=>{console.error(e);process.exitCode=1;pool.end().catch(()=>{})});

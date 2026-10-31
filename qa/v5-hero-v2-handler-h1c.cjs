'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {createHeroV2Handler}=require('../chat-api/lib/v5-hero-v2-handler.js');
const catalog=require('../chat-api/lib/v5-phase2-talent-ids.json');
const ID='11111111-1111-4111-8111-111111111111',ROOM='PITGAME26',TOKEN='a'.repeat(64);
const HASH=createHash('sha256').update(TOKEN).digest('hex');
const ORIGIN='http://127.0.0.1:8899';
const data={row:null,approved:3,reads:0,writes:0,authReads:0,transacts:0,invalidAuth:false,down:false};
const build=(n)=>({klass:'warrior',attributes:{FOR:2*n,DES:0,INT:0,VIT:0,DEF:0},
 talents:catalog.classes.warrior.slice(0,n)});
const clone=x=>x===null?null:structuredClone(x);
const stages=n=>Array.from({length:n},(_,i)=>({stage:i+1,status:'approved'}));
const pool={
 async query(sql,values){
  if(data.down){const e=Error('Sensitive database connection details');e.code='ECONNREFUSED';throw e}
  assert.match(sql,/^SELECT id,room_code FROM pit_students WHERE room_code=\$1 AND token_hash=\$2 LIMIT 1$/);
  data.authReads++;
  assert.deepEqual(values,[ROOM,HASH],'Server must hash token and fix room');
  return data.invalidAuth?{rowCount:0,rows:[]}:{rowCount:1,rows:[{id:ID,room_code:ROOM}]};
 },
 async connect(){
  data.transacts++;let snapshot=null;
  return {async query(sql,values=[]){
   if(sql==='BEGIN'){snapshot=clone(data.row);return {rowCount:0,rows:[]}}
   if(sql==='COMMIT'){snapshot=null;return {rowCount:0,rows:[]}}
   if(sql==='ROLLBACK'){data.row=snapshot;return {rowCount:0,rows:[]}}
   if(sql.startsWith('SELECT id FROM pit_students')){
    assert.deepEqual(values,[ID,ROOM]);return {rowCount:1,rows:[{id:ID}]}
   }
   if(sql.startsWith('SELECT current_stage FROM pit_classroom_state')){
    return {rowCount:1,rows:[{current_stage:data.approved}]};
   }
   if(sql.startsWith('SELECT stage,status FROM pit_student_stages')){
    return {rowCount:data.approved,rows:stages(data.approved)};
   }
   if(sql.startsWith('SELECT schema_version,klass,attributes,talents,revision,m5_snapshot,m10_snapshot')){
    return {rowCount:data.row?1:0,rows:data.row?[clone(data.row)]:[]};
   }
   if(sql.startsWith('INSERT INTO pit_hero_builds_v2')){
    data.writes++;
    if(data.row)return {rowCount:0,rows:[]};
    data.row={schema_version:2,klass:values[2],attributes:JSON.parse(values[3]),
     talents:JSON.parse(values[4]),revision:1,m5_snapshot:null,m10_snapshot:null};
    return {rowCount:1,rows:[clone(data.row)]};
   }
   if(sql.startsWith('UPDATE pit_hero_builds_v2')){
    data.writes++;
    assert.equal(values[0],ID);assert.equal(values[1],ROOM);
    if(sql.includes('SET m5_snapshot=')){data.row.m5_snapshot=JSON.parse(values[2]);}
    else if(sql.includes('SET m10_snapshot=')){data.row.m10_snapshot=JSON.parse(values[2]);}
    else {data.row.attributes=JSON.parse(values[3]);data.row.talents=JSON.parse(values[4]);}
    data.row.revision++;
    return {rowCount:1,rows:[clone(data.row)]};
   }
   throw Error('Unexpected database query '+sql);
  },release(){}};
 }
};
function request(method='GET',action='profile',body=null,headers={}){
 return {method,query:{action},body,headers:{
  origin:ORIGIN,'x-pit-student-token':TOKEN,'content-type':'application/json',...headers}};
}
async function call(handler,req){
 const res={headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;return this},
 status(n){this.statusCode=n;return this},json(p){this.payload=p;return this}};
 await handler(req,res);
 return {status:res.statusCode,body:res.payload,headers:res.headers};
}
(async()=>{
 const realRoute=require('../chat-api/api/hero-v2-lab.js');
 const oldEnabled=process.env.PIT_V5_H1C_ENABLED,oldEnvironment=process.env.VERCEL_ENV;
 delete process.env.PIT_V5_H1C_ENABLED;
 let disabledRoute=await call(realRoute,request());
 assert.equal(disabledRoute.status,503,'Production route must be disabled by default');
 process.env.PIT_V5_H1C_ENABLED='true';process.env.VERCEL_ENV='production';
 disabledRoute=await call(realRoute,request());
 assert.equal(disabledRoute.status,503,'Production must not enable lab route even with feature flag');
 if(oldEnabled===undefined)delete process.env.PIT_V5_H1C_ENABLED;else process.env.PIT_V5_H1C_ENABLED=oldEnabled;
 if(oldEnvironment===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=oldEnvironment;
 const off=createHeroV2Handler({enabled:false});
 let r=await call(off,request());
 assert.equal(r.status,503);assert.equal(data.authReads,0);
 const handler=createHeroV2Handler({pool,enabled:true});
 r=await call(handler,request('OPTIONS'));assert.equal(r.status,204);
 r=await call(handler,request('GET','profile',null,{origin:'https://evil.example'}));
 assert.equal(r.status,403);assert.equal(r.headers['Access-Control-Allow-Origin'],undefined);
 r=await call(handler,request('GET','profile',null,{'x-pit-student-token':''}));
 assert.equal(r.status,401);
 r=await call(handler,request('POST','save',{expectedRevision:0,build:build(3)},{origin:undefined}));
 assert.equal(r.status,403,'POST requires allowed origin');
 r=await call(handler,request('POST','save',{expectedRevision:0,build:build(3)},{'content-type':'text/plain'}));
 assert.equal(r.status,415);
 r=await call(handler,request('POST','unknown',{expectedRevision:0,build:build(3)}));
 assert.equal(r.status,404);
 r=await call(handler,request('GET','profile'));assert.equal(r.status,200);
 assert.equal(r.body.profile.revision,0);
 assert(!JSON.stringify(r.body).includes(ID));
 r=await call(handler,request('POST','save',{expectedRevision:0,build:build(3),studentId:ID}));
 assert.equal(r.status,400);
 r=await call(handler,request('POST','save',{expectedRevision:0,build:{...build(3),xp:1000000}}));
 assert.equal(r.status,422);
 r=await call(handler,request('POST','save',{expectedRevision:0,build:build(3)}));
 assert.equal(r.status,200);assert.equal(r.body.profile.revision,1);
 assert.equal(r.body.profile.progress.approvedBaseXp,300);
 assert.equal(data.writes,1);
 r=await call(handler,request('POST','save',{expectedRevision:0,build:build(3)}));
 assert.equal(r.status,409,'Stale revision should conflict');
 data.approved=5;
 r=await call(handler,request('POST','enter-m5',{expectedRevision:1}));
 assert.equal(r.status,422,'Must allocate all 5 talents/10 attributes');
 r=await call(handler,request('POST','save',{expectedRevision:1,build:build(5)}));
 assert.equal(r.status,200);assert.equal(r.body.profile.revision,2);
 r=await call(handler,request('POST','enter-m5',{expectedRevision:2}));
 assert.equal(r.status,200);assert.equal(r.body.profile.arena.m5Entered,true);
 assert.equal(r.body.profile.revision,3);
 r=await call(handler,request('POST','enter-m5',{expectedRevision:2}));
 assert.equal(r.status,200);assert.equal(r.body.profile.revision,3,'Replay is idempotent');
 data.approved=10;
 r=await call(handler,request('POST','lock-m10',{expectedRevision:3}));
 assert.equal(r.status,422,'Must fully allocate 10 talents');
 r=await call(handler,request('POST','save',{expectedRevision:3,build:build(10)}));
 assert.equal(r.status,200);assert.equal(r.body.profile.revision,4);
 r=await call(handler,request('POST','lock-m10',{expectedRevision:4}));
 assert.equal(r.status,200);assert.equal(r.body.profile.arena.m10Locked,true);
 r=await call(handler,request('POST','save',{expectedRevision:5,build:{
  ...build(10),attributes:{...build(10).attributes,FOR:19,DEF:1}}}));
 assert.equal(r.status,422,'Final build immutable');
 data.invalidAuth=true;
 r=await call(handler,request('GET','profile'));assert.equal(r.status,401);
 data.invalidAuth=false;data.down=true;
 r=await call(handler,request('GET','profile'));
 assert.equal(r.status,500);assert(!JSON.stringify(r.body).includes('Sensitive database'));
 assert(data.transacts>0);
 console.log('PASS H1c hero V2 endpoint: feature flag, CORS, token, room, 120 talents, stage authority, revision conflicts, M5/M10 locks, privacy. No real DB.');
})().catch(err=>{console.error(err);process.exitCode=1});

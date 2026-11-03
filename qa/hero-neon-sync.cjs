'use strict';
// Unit/contract tests: NO real students, PINs, DB connections or network requests.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const catalog=require('../chat-api/lib/v5-phase2-talent-ids.json').classes;
const phase2=require('../v5/phase2-combat.js');
const {createHandler,validateProfile}=require('../chat-api/api/hero.js');
const token='a'.repeat(64),otherToken='b'.repeat(64);
const a={id:'11111111-1111-4111-8111-111111111111',room_code:'PITGAME26'};
const b={id:'22222222-2222-4222-8222-222222222222',room_code:'PITGAME26B'};
const hashes=new Map([[crypto.createHash('sha256').update(token).digest('hex'),a],
 [crypto.createHash('sha256').update(otherToken).digest('hex'),b]]);
const approved=new Map([[a.id,1],[b.id,0]]);
const stored=new Map();
let commits=0;
const client={
 async query(sql,args=[]){
  if(['BEGIN','COMMIT','ROLLBACK'].includes(sql)){if(sql==='COMMIT')commits++;return {rows:[],rowCount:0};}
  if(sql.includes('FROM public.pit_students')){const who=hashes.get(args[0]);return {rows:who?[who]:[],rowCount:who?1:0};}
  if(sql.includes('count(*)::int AS n FROM public.pit_student_stages'))
   return {rows:[{n:approved.get(args[0])||0}],rowCount:1};
  if(sql.includes('SELECT klass,attributes,talents,revision,updated_at FROM public.pit_student_heroes')){
   const row=stored.get(args[0]);return {rows:row?[row]:[],rowCount:row?1:0};
  }
  if(sql.includes('INSERT INTO public.pit_student_heroes')){
   const [id,klass,attrs,talents,expected]=args,old=stored.get(id);
   if((!old&&expected!==0)||(old&&old.revision!==expected))return {rows:[],rowCount:0};
   const row={klass,attributes:JSON.parse(attrs),talents:JSON.parse(talents),
    revision:old?old.revision+1:1,updated_at:new Date().toISOString()};
   stored.set(id,row);return {rows:[row],rowCount:1};
  }
  throw Error('Unexpected SQL in mock: '+sql.slice(0,140));
 },
 release(){}
};
const handler=createHandler({connect:async()=>client});
async function request(method,studentToken=token,body=null,origin='https://dev-gabriel-exe.github.io'){
 const req={method,headers:{origin,'x-pit-student-token':studentToken},body};
 const res={headers:{},code:200,setHeader(k,v){this.headers[k]=v;return this;},
  status(code){this.code=code;return this;},json(value){this.body=value;return this;},
  end(){this.body=null;return this;}};
 await handler(req,res);return res;
}
(async()=>{
 for(const name of Object.keys(catalog)){
  const ids=new Set(phase2.TALENTS[name].map(t=>t.id));
  assert.equal(catalog[name].length,30);
  assert.equal(new Set(catalog[name]).size,30);
  assert.deepEqual(new Set(catalog[name]),ids,'backend talent IDs must match actual V5 catalog for '+name);
 }
 const attrs={FOR:2,DES:0,INT:0,VIT:0,DEF:0};
 const profile={klass:'warrior',attributes:attrs,talents:['B01']};
 assert.deepEqual(validateProfile(profile,1),profile);
 assert.throws(()=>validateProfile({...profile,attributes:{...attrs,FOR:3}},1),/excedem/);
 assert.throws(()=>validateProfile({...profile,talents:['B01','B01']},2),/repetido/);
 assert.throws(()=>validateProfile({...profile,talents:['E01']},1),/inválido/);
 assert.throws(()=>validateProfile({...profile,klass:'hacker'},1),/Classe/);
 let res=await request('GET');
 assert.equal(res.code,200);assert.equal(res.body.exists,false);assert.equal(res.body.revision,0);
 assert.equal(res.body.approved,1);assert.equal(res.body.room,'PITGAME26');
 res=await request('POST',token,{profile,revision:0});
 assert.equal(res.code,200,JSON.stringify(res.body));assert.equal(res.body.revision,1);
 assert.equal(commits,1);
 res=await request('GET');
 assert.equal(res.body.exists,true);assert.equal(res.body.profile.klass,'warrior');
 res=await request('POST',token,{profile,revision:0});assert.equal(res.code,409,'stale computer must not overwrite');
 const changed={klass:'mage',attributes:{FOR:0,DES:0,INT:2,VIT:0,DEF:0},talents:['E01']};
 res=await request('POST',token,{profile:changed,revision:1});assert.equal(res.code,200);
 assert.equal(res.body.revision,2);
 res=await request('GET',otherToken);assert.equal(res.body.exists,false);assert.equal(res.body.room,'PITGAME26B');
 res=await request('POST',otherToken,{profile,revision:0});assert.equal(res.code,400,'zero approved missions grant no point');
 res=await request('POST',otherToken,{profile:{klass:'guardian',attributes:{FOR:0,DES:0,INT:0,VIT:0,DEF:0},talents:[]},revision:0});
 assert.equal(res.code,200);
 assert.equal(stored.get(a.id).klass,'mage');assert.equal(stored.get(b.id).klass,'guardian');
 assert.equal((await request('GET','not-a-token')).code,401);
 assert.equal((await request('GET',token,null,'https://malicious.example')).code,403);
 assert.equal((await request('OPTIONS')).code,204);
 console.log('PASS hero Neon contract: 120 talents, budgets, authenticated GET/POST, revisions, room isolation, CORS');
})().catch(error=>{console.error(error);process.exitCode=1});
'use strict';
/* FUN-02 — Execute REAL chat/classroom handlers against a disposable in-memory
 * SQL adapter. Zero production DB, no HTTP, no real users or secrets.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ROOM='PITGAME26',students=[],stages=[];
const state={current_stage:1,phase:'practice',updated_at:'2026-10-28T00:00:00Z'};
function result(rows){return {rows,rowCount:rows.length}}
class MockPool{
 async query(sql,params=[]){
  const q=sql.replace(/\s+/g,' ').trim().toLowerCase();
  if(q.startsWith('select count(*)::int as n from pit_students where joined_at'))return result([{n:students.length}]);
  if(q.startsWith('select count(*)::int as n from pit_students where room_code'))return result([{n:students.length}]);
  if(q.startsWith('insert into pit_students(')){
   const id='00000000-0000-4000-8000-'+String(students.length+1).padStart(12,'0');
   const row={id,room_code:params[0],display_name:params[1],token_hash:params[2]};
   students.push(row);return result([{id,display_name:row.display_name}]);
  }
  if(q.startsWith('select id,display_name from pit_students where')){
   const hash=params.find(p=>typeof p==='string'&&/^[a-f0-9]{64}$/i.test(p));
   const row=students.find(s=>s.token_hash===hash&&s.room_code===ROOM);
   return result(row?[{id:row.id,display_name:row.display_name}]:[]);
  }
  if(q.startsWith('select current_stage,phase,updated_at from pit_classroom_state'))return result([state]);
  if(q.startsWith('select stage,route,status,evidence,feedback,updated_at,reviewed_at from pit_student_stages')){
   return result(stages.filter(s=>s.student_id===params[0]).map(({student_id,...rest})=>rest));
  }
  if(q.startsWith('insert into pit_student_stages(')){
   const [student_id,stage,route,status,evidence]=params;
   const previous=stages.find(s=>s.student_id===student_id&&s.stage===stage);
   if(previous&&['submitted','approved'].includes(previous.status))return result([]);
   const row={student_id,stage,route,status,evidence,feedback:previous?.status==='revision'?previous.feedback:'',updated_at:'2026-10-28T00:00:00Z',reviewed_at:null};
   if(previous)Object.assign(previous,row);else stages.push(row);
   const {student_id:omit,...publicRow}=row;return result([publicRow]);
  }
  if(q.startsWith('select id,author,mission,body,created_at,read_at from pit_chat_messages'))return result([]);

  if(q.startsWith('select s.id,s.display_name,s.joined_at,s.last_seen_at,s.active_stage')){
   return result(students.map(s=>({id:s.id,display_name:s.display_name,joined_at:state.updated_at,last_seen_at:state.updated_at,active_stage:1,highest_stage:1,approved:stages.filter(p=>p.student_id===s.id&&p.status==='approved').length,unread_chat:0,stages:stages.filter(p=>p.student_id===s.id)})));
  }
  if(q.startsWith('select s.id,s.display_name,s.joined_at,')){
   return result(students.map(s=>({id:s.id,display_name:s.display_name,joined_at:state.updated_at,last_body:null,last_at:null,unread:0})));
  }
  if(q.startsWith('update pit_classroom_state set current_stage=')){
   state.current_stage=params[0];state.phase=params[1];return result([state]);
  }
  if(q.startsWith('update pit_student_stages set status=')){
   const [status,feedback,id,stage]=params;
   const row=stages.find(s=>s.student_id===id&&s.stage===stage&&['submitted','approved','revision'].includes(s.status));
   if(!row)return result([]);
   row.status=status;row.feedback=feedback;row.reviewed_at=state.updated_at;
   return result([{stage,status,feedback}]);
  }
  if(q.startsWith('select 1 from pit_students where id=')){
   return result(students.some(s=>s.id===params[0]&&s.room_code===ROOM)?[{one:1}]:[]);
  }

  throw Error('UNMOCKED SQL: '+q.slice(0,125));
 }
}
function load(file){
 const module={exports:{}};
 const ctx={module,exports:module.exports,Buffer,console,
  process:{env:{DATABASE_URL:'postgres://isolated.invalid/test',PIT_TEACHER_PIN:'0123456789abcdef'}},
  require(name){if(name==='pg')return {Pool:MockPool};if(name==='node:crypto')return crypto;throw Error('Unexpected module '+name)}};
 vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file,timeout:1500});
 return module.exports;
}
const chat=load('chat-api/api/chat.js'),classroom=load('chat-api/api/classroom.js');
async function call(handler,method,action,body={},token='',origin='https://dev-gabriel-exe.github.io',pin='',query={}){
 const req={method,query:{action,...query},body,headers:{origin}};
 if(token)req.headers['x-pit-student-token']=token;
 if(pin)req.headers['x-pit-teacher-pin']=pin;
 const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},
  status(n){this.statusCode=n;return this},json(data){this.body=data;return this},end(){this.ended=true;return this}};
 await handler(req,res);return res;
}
(async()=>{
 const wrong=await call(chat,'POST','join',{name:'Aluno Ficticio',code:'ERRADO'});
 assert.equal(wrong.statusCode,403);
 assert.equal(students.length,0,'invalid room never writes');
 const short=await call(chat,'POST','join',{name:'X',code:ROOM});
 assert.equal(short.statusCode,400);
 const a=await call(chat,'POST','join',{name:'Aluno Ficticio A',code:ROOM});
 const b=await call(chat,'POST','join',{name:'Aluno Ficticio B',code:ROOM});
 assert.equal(a.statusCode,201);assert.equal(b.statusCode,201);
 assert.match(a.body.token,/^[a-f0-9]{64}$/);assert.match(b.body.token,/^[a-f0-9]{64}$/);
 assert.notEqual(a.body.token,b.body.token,'independent student sessions');
 assert(students.every(s=>s.token_hash.length===64&&!s.token_hash.includes(a.body.token)&&!s.token_hash.includes(b.body.token)),'only token hashes stored');
 const anonymous=await call(classroom,'GET','state');assert.equal(anonymous.statusCode,401);
 const malformed=await call(classroom,'GET','state',{},'wrong');assert.equal(malformed.statusCode,401);
 const forged=await call(classroom,'GET','state',{},'f'.repeat(64));assert.equal(forged.statusCode,401);
 const first=await call(classroom,'GET','state',{},a.body.token);
 const second=await call(classroom,'GET','state',{},b.body.token);
 assert.equal(first.statusCode,200);assert.equal(second.statusCode,200);
 assert.equal(first.body.student.id,a.body.studentId);
 assert.equal(second.body.student.id,b.body.studentId);
 assert.equal(first.body.progress.length,0);assert.equal(second.body.progress.length,0);
 const draft=await call(classroom,'POST','progress',{stage:1,route:'2d',status:'working',evidence:''},a.body.token);
 assert.equal(draft.statusCode,200,'real classroom handler accepts draft');
 const submit=await call(classroom,'POST','progress',{stage:1,route:'2d',status:'submitted',evidence:'Preview ficticio: personagem se move e encontra obstaculo.'},a.body.token);
 assert.equal(submit.statusCode,200,'real classroom handler accepts valid submission');
 const again=await call(classroom,'GET','state',{},a.body.token);
 const other=await call(classroom,'GET','state',{},b.body.token);
 assert.equal(again.body.progress.length,1,'A persisted in isolated SQL fixture');
 assert.equal(again.body.progress[0].status,'submitted');
 assert.equal(other.body.progress.length,0,'B cannot read A progress');
 const overwrite=await call(classroom,'POST','progress',{stage:1,route:'3d',status:'working',evidence:'overwrite'},a.body.token);
 assert.equal(overwrite.statusCode,409,'submitted evidence cannot be overwritten');
 const chatA=await call(chat,'GET','messages',{},a.body.token);
 const chatB=await call(chat,'GET','messages',{},b.body.token);
 assert.equal(chatA.statusCode,200);assert.equal(chatB.statusCode,200);
 const blocked=await call(chat,'GET','messages',{},'0'.repeat(64));assert.equal(blocked.statusCode,401);
 assert.equal(students.length,2);assert.equal(stages.length,1);
 console.log('PASS FUN-02: actual chat/classroom handlers, two fictional users, hashed tokens, invalid-session rejection and isolated persisted progress');
})().catch(e=>{console.error(e);process.exitCode=1});

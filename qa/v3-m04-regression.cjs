'use strict';
/* Run: node qa/v3-m04-regression.cjs
   No real database, no real students, no network calls.
   This suite does not replace a real browser or GDevelop test. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
let count=0;
function ok(x,msg){assert.ok(x,msg);count++}
const window={};
function load(p,localStorage){vm.runInNewContext(read(p),{window,localStorage,console},{filename:p})}
load('v3/teacher-mission-four-validation.js');
const T=window.PIT_TEACHER_MISSION_FOUR_VALIDATION;
ok(T.routes.length===4,'Teacher: four alternatives');
ok((T.render('practice').match(/class="t4v-lab"/g)||[]).length===3,'Teacher: three stages');
ok(['12 MIN','15 MIN','9 MIN'].every(x=>T.render('practice').includes(x)),'Aligned timebox');
ok(['ENTRADA','LIMITE','REPRODUTIBILIDADE','PERSISTÊNCIA'].every(x=>T.render('review').includes(x)),'Aligned review rubric');
load('v3/gdevelop-mission-four-guide.js');
ok(window.PIT_GDEVELOP_M04_GUIDE.routes.every(x=>x.steps.length===4),'Four technical steps per route');
const cache=new Map(),localStorage={getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,String(v))};
load('v3/student-mission-four.js',localStorage);
const M=window.PIT_STUDENT_MISSION_FOUR;
const ctx={session:'qa',phase:'practice',status:'',preview:true,canSubmit:true,idea:{title:'Castelo',genre:'RPG'},mvp:{scene:'Sala',mechanic:'Abrir porta'},previous:{project:'Castelo',scene:'Sala01',object:'Heroi',objectType:'2D Sprite',saved:'GDevelop Cloud'}};
ok(M.render(ctx).includes('Abrir porta')&&M.render(ctx).includes('Castelo'),'Student carries prior choices');
ok(!M.validate('qa',ctx).ok,'Blank evidence blocked');
const good={route:0,command:'Usei as setas',response:'O herói se moveu no Preview.',boundary:'A parede bloqueou a passagem.',retest:'Repeti e a barreira funcionou.',saved:'GDevelop Cloud',issue:'',checks:[0,1,2]};
M.save('qa',good);
ok(M.validate('qa',ctx).ok,'Complete evidence accepted');
const evidence=M.evidence('qa',ctx);
ok(evidence.length<=750,'Evidence respects API limit');
M.hydrate('qa2',evidence,'submitted');
ok(M.load('qa2').response===good.response,'Submitted evidence can hydrate');
ok(M.load('qa3').command==='','Drafts are student-isolated');
const max={route:3,command:'C'.repeat(99),response:'R'.repeat(150),boundary:'B'.repeat(150),retest:'T'.repeat(150),saved:'S'.repeat(99),issue:'I'.repeat(99),checks:[0,1,2]};
M.save('max',max);
const long=M.evidence('max',{...ctx,idea:{genre:'Narrativa interativa',title:'X'.repeat(100)},previous:{project:'P'.repeat(100),scene:'Z'.repeat(100)}});
ok(long.length<=750&&long.endsWith('I'.repeat(52)),'Longest submission remains complete');
const state={studentId:'11111111-1111-4111-8111-111111111111',room:'PITGAME26',records:new Map(),current:3,phase:'review'};
const pool={async query(sql,args=[]){
 if(sql.startsWith('SELECT id,display_name'))return{rows:[{id:state.studentId,display_name:'Aluno QA'}],rowCount:1};
 if(sql.startsWith('SELECT current_stage'))return{rows:[{current_stage:state.current,phase:state.phase}],rowCount:1};
 if(sql.startsWith('UPDATE pit_classroom_state')){state.current=args[0];state.phase=args[1];return{rows:[{current_stage:state.current,phase:state.phase}],rowCount:1}}
 if(sql.startsWith('SELECT stage,route,status,evidence')){const rows=[...state.records.values()];return{rows,rowCount:rows.length}}
 if(sql.startsWith('INSERT INTO pit_student_stages')){
  ok(sql.includes("status NOT IN ('submitted','approved')"),'Atomic SQL status guard');
  const [id,stage,route,status,evidence]=args,key=id+':'+stage,old=state.records.get(key);
  if(old&&['submitted','approved'].includes(old.status))return{rows:[],rowCount:0};
  const row={stage,route,status,evidence,student_id:id};state.records.set(key,row);return{rows:[row],rowCount:1};
 }
 if(sql.startsWith('UPDATE pit_student_stages SET status')){
  const [status,feedback,id,stage,room]=args;
  ok(sql.includes('s.room_code=$5')&&room==='PITGAME26','Review is room-scoped');
  const row=state.records.get(id+':'+stage);
  if(!row)return{rows:[],rowCount:0};row.status=status;row.feedback=feedback;return{rows:[row],rowCount:1};
 }
 throw Error('Unexpected SQL '+sql.slice(0,90));
}};
const inject=name=>name==='pg'?{Pool:class{query(...args){return pool.query(...args)}}}:name==='node:crypto'?crypto:require(name);
const mod={exports:{}};
vm.runInNewContext(read('chat-api/api/classroom.js'),{require:inject,module:mod,Buffer,console,process:{env:{DATABASE_URL:'mock',PIT_TEACHER_PIN:'teacher-secret-123456'}}});
const handler=mod.exports;
async function request(role,action,body={},method='POST'){
 const headers={origin:'https://dev-gabriel-exe.github.io'};
 if(role==='teacher')headers['x-pit-teacher-pin']='teacher-secret-123456';
 else headers['x-pit-student-token']='a'.repeat(64);
 const res={statusCode:200,setHeader(){return this},status(c){this.statusCode=c;return this},json(data){this.data=data;return this},end(){return this}};
 await handler({headers,query:{action},method,body},res);return res;
}
(async()=>{
 let r=await request('student','progress',{stage:4,route:'2d',status:'submitted',evidence});
 ok(r.statusCode===403,'Stage locked until teacher');
 await request('teacher','stage',{stage:4,phase:'briefing'});
 r=await request('student','progress',{stage:4,route:'2d',status:'submitted',evidence});
 ok(r.statusCode===403,'Briefing still locked');
 await request('teacher','stage',{stage:4,phase:'practice'});
 r=await request('student','progress',{stage:4,route:'2d',status:'submitted',evidence});
 ok(r.statusCode===200,'Released stage can be submitted');
 r=await request('student','progress',{stage:4,route:'3d',status:'working',evidence:'overwrite'});
 ok(r.statusCode===409,'Submitted evidence cannot be overwritten');
 r=await request('teacher','review',{studentId:state.studentId,stage:4,status:'revision',feedback:''});
 ok(r.statusCode===400,'Revision requires useful feedback');
 r=await request('student','review',{studentId:state.studentId,stage:4,status:'approved'});
 ok(r.statusCode===403,'Student cannot approve');
 r=await request('teacher','review',{studentId:state.studentId,stage:4,status:'revision',feedback:'Refaça o teste na parede.'});
 ok(r.statusCode===200,'Teacher requests correction');
 r=await request('student','progress',{stage:4,route:'2d',status:'submitted',evidence:'Corrigido: '+evidence});
 ok(r.statusCode===200,'Revision allows resubmission');
 r=await request('teacher','review',{studentId:state.studentId,stage:4,status:'approved',feedback:'Aceito'});
 ok(r.statusCode===200,'Teacher approves corrected work');
 r=await request('student','progress',{stage:4,route:'3d',status:'submitted',evidence:'overwrite'});
 ok(r.statusCode===409,'Approval immutable to student');
 console.log('PASS '+count+' assertions (mock SQL, no real student records).');
})().catch(e=>{console.error(e.stack);process.exitCode=1});

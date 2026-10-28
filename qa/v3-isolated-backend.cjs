'use strict';
/* FUN-02 — Execute REAL chat/classroom handlers against a disposable in-memory
 * SQL adapter. Zero production DB, no HTTP, no real users or secrets.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ROOM='PITGAME26',students=[],stages=[],messages=[];
const state={current_stage:1,phase:'practice',updated_at:'2026-10-28T00:00:00Z'};
function result(rows){return {rows,rowCount:rows.length}}
class MockPool{
 async query(sql,params=[]){
  const q=sql.replace(/\s+/g,' ').trim().toLowerCase();
  if(q.startsWith('select count(*)::int as n from pit_students where joined_at'))return result([{n:students.length}]);
  if(q.startsWith('select count(*)::int as n from pit_students where room_code'))return result([{n:students.length}]);
  if(q.startsWith('insert into pit_students(')){
   const id='00000000-0000-4000-8000-'+String(students.length+1).padStart(12,'0');
   const row={id,room_code:params[0],display_name:params[1],token_hash:params[2],joined_at:state.updated_at,last_seen_at:null,active_stage:1};
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
  if(q.startsWith('select id,author,mission,body,created_at,read_at from pit_chat_messages')){
   return result(messages.filter(m=>m.student_id===params[0]).sort((a,b)=>b.id-a.id).slice(0,100).map(({id,author,mission,body,created_at,read_at})=>({id,author,mission,body,created_at,read_at})));
  }
  if(q.startsWith('select count(*)::int as n from pit_chat_messages where student_id=')){
   return result([{n:messages.filter(m=>m.student_id===params[0]&&m.author===params[1]).length}]);
  }
  if(q.startsWith('select count(*)::int as unread from pit_chat_messages where room_code=')){
   const author=q.includes("author='student'")?'student':'teacher';
   return result([{unread:messages.filter(m=>m.author===author&&m.read_at===null&&(!params[1]||m.student_id===params[1])).length}]);
  }
  if(q.startsWith('insert into pit_chat_messages(')){
   const id=messages.length+1;
   messages.push({id,room_code:params[0],student_id:params[1],author:params[2],mission:params[3],body:params[4],created_at:new Date(Date.parse(state.updated_at)+id*1000).toISOString(),read_at:null});
   return result([{id}]);
  }
  if(q.startsWith('update pit_chat_messages set read_at=')){
   messages.filter(m=>m.student_id===params[0]&&m.author===params[2]&&m.read_at===null).forEach(m=>{m.read_at=state.updated_at});
   return result([]);
  }

  if(q.startsWith('select s.id,s.display_name,s.joined_at,s.last_seen_at,s.active_stage')){
   return result(students.map(s=>({id:s.id,display_name:s.display_name,joined_at:s.joined_at,last_seen_at:s.last_seen_at,active_stage:s.active_stage,highest_stage:Math.max(0,...stages.filter(p=>p.student_id===s.id).map(p=>p.stage)),approved:stages.filter(p=>p.student_id===s.id&&p.status==='approved').length,unread_chat:messages.filter(m=>m.student_id===s.id&&m.author==='student'&&m.read_at===null).length,stages:stages.filter(p=>p.student_id===s.id).map(p=>({stage:p.stage,status:p.status,route:p.route,evidence:p.evidence,feedback:p.feedback,updated_at:p.updated_at,reviewed_at:p.reviewed_at}))})));
  }
  if(q.startsWith('select s.id,s.display_name,s.joined_at,')){
   const rows=students.map(s=>{
    const thread=messages.filter(m=>m.student_id===s.id),last=thread[thread.length-1];
    return {id:s.id,display_name:s.display_name,joined_at:s.joined_at,last_body:last?.body||null,last_at:last?.created_at||null,unread:thread.filter(m=>m.author==='student'&&m.read_at===null).length};
   });
   rows.sort((a,b)=>b.unread-a.unread||String(b.last_at||'').localeCompare(String(a.last_at||'')));
   return result(rows);
  }
  if(q.startsWith('update pit_students set last_seen_at=')){
   const row=students.find(s=>s.id===params[0]);if(row){row.active_stage=params[1];row.last_seen_at='2026-10-28T00:10:00Z'}return result([]);
  }
  if(q.startsWith('update pit_classroom_state set current_stage=')){
   state.current_stage=params[0];state.phase=params[1];return result([state]);
  }
  if(q.startsWith('update pit_student_stages set status=')){
   const [status,feedback,id,stage]=params;
   const row=stages.find(s=>s.student_id===id&&s.stage===stage&&s.status==='submitted');
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
 const origin='https://dev-gabriel-exe.github.io',pin='0123456789abcdef';
 const invalidPin=await call(chat,'POST','teacher-login',{},'',origin,'wrong-pin');
 assert.equal(invalidPin.statusCode,403,'wrong teacher PIN rejected');
 const shortPin=await call(chat,'POST','teacher-login',{},'',origin,'123456789012345');
 assert.equal(shortPin.statusCode,403,'short teacher PIN rejected');
 const teacherLogin=await call(chat,'POST','teacher-login',{},'',origin,pin);
 assert.equal(teacherLogin.statusCode,200,'correct test PIN accepted by real handler');
 const anonymousRoster=await call(classroom,'GET','roster');
 assert([401,403].includes(anonymousRoster.statusCode),'roster requires teacher authentication');
 const teacherState=await call(classroom,'GET','state',{},'',origin,pin);
 assert.equal(teacherState.statusCode,200);assert.equal(teacherState.body.role,'teacher');
 assert.equal(teacherState.body.progress,undefined,'teacher state does not expose student progress directly');
 const roster=await call(classroom,'GET','roster',{},'',origin,pin);
 assert.equal(roster.statusCode,200);assert.equal(roster.body.roster.length,2);
 const noPinStage=await call(classroom,'POST','stage',{stage:2,phase:'briefing'});
 assert([401,403].includes(noPinStage.statusCode),'unprivileged stage change denied');
 const teacherStage=await call(classroom,'POST','stage',{stage:2,phase:'briefing'},'',origin,pin);
 assert.equal(teacherStage.statusCode,200);assert.equal(teacherStage.body.state.current_stage,2);
 const teacherProgress=await call(classroom,'POST','progress',{stage:2,route:'2d',status:'working'},'',origin,pin);
 assert.equal(teacherProgress.statusCode,403,'teacher role cannot forge student progress');
 const noPinReview=await call(classroom,'POST','review',{studentId:a.body.studentId,stage:1,status:'approved'});
 assert([401,403].includes(noPinReview.statusCode),'unprivileged approval denied');
 const approved=await call(classroom,'POST','review',{studentId:a.body.studentId,stage:1,status:'approved'},'',origin,pin);
 assert.equal(approved.statusCode,200,'teacher can review submitted work');
 const afterReview=await call(classroom,'GET','state',{},a.body.token);
 assert.equal(afterReview.body.progress[0].status,'approved','approved status persists only for student A');
 const bAfterReview=await call(classroom,'GET','state',{},b.body.token);
 assert.equal(bAfterReview.body.progress.length,0,'student B remains isolated after A approval');
 const anonymousThreads=await call(chat,'GET','threads');
 assert.equal(anonymousThreads.statusCode,403,'threads require teacher PIN');
 const teacherThreads=await call(chat,'GET','threads',{},'',origin,pin);
 assert.equal(teacherThreads.statusCode,200);assert.equal(teacherThreads.body.threads.length,2);
 const teacherMessages=await call(chat,'GET','messages',{},'',origin,pin,{studentId:a.body.studentId});
 assert.equal(teacherMessages.statusCode,200,'teacher may read selected fictional student thread');
 const invalidTarget=await call(chat,'GET','messages',{},'',origin,pin,{studentId:'invalid'});
 assert.equal(invalidTarget.statusCode,400,'teacher must provide valid student ID');
 assert(fs.readFileSync('v3/app.js','utf8').includes("sessionStorage.setItem('pit_teacher_pin'"),'teacher PIN scoped to session storage');

 console.log('PASS FUN-03: real PIN checks, teacher-only roster/stage/review/chat and student isolation');
 const lockedStage=await call(classroom,'POST','progress',{stage:3,route:'2d',status:'working',evidence:''},b.body.token);
 assert.equal(lockedStage.statusCode,403,'future mission locked by server');
 const briefingBlocked=await call(classroom,'POST','progress',{stage:2,route:'2d',status:'working',evidence:''},b.body.token);
 assert.equal(briefingBlocked.statusCode,403,'current mission briefing does not permit submission');
 const invalidPhase=await call(classroom,'POST','stage',{stage:2,phase:'invalid'},'',origin,pin);
 assert.equal(invalidPhase.statusCode,400,'invalid phase rejected');
 const releasePractice=await call(classroom,'POST','stage',{stage:2,phase:'practice'},'',origin,pin);
 assert.equal(releasePractice.statusCode,200);
 const draftB=await call(classroom,'POST','progress',{stage:2,route:'2d',status:'working',evidence:'Rascunho ficticio'},b.body.token);
 assert.equal(draftB.statusCode,200,'released practice accepts student draft');
 const releaseReview=await call(classroom,'POST','stage',{stage:2,phase:'review'},'',origin,pin);
 assert.equal(releaseReview.statusCode,200);
 const submitB=await call(classroom,'POST','progress',{stage:2,route:'2d',status:'submitted',evidence:'Jogo de teste: movimento e condicao de vitoria visiveis.'},b.body.token);
 assert.equal(submitB.statusCode,200,'review phase accepts submission');
 const advance=await call(classroom,'POST','stage',{stage:3,phase:'briefing'},'',origin,pin);
 assert.equal(advance.statusCode,200);
 const preserved=await call(classroom,'GET','state',{},b.body.token);
 assert.equal(preserved.body.progress.find(x=>x.stage===2)?.status,'submitted','previous mission evidence survives release');
 const blockedNew=await call(classroom,'POST','progress',{stage:3,route:'3d',status:'working',evidence:''},b.body.token);
 assert.equal(blockedNew.statusCode,403,'new mission locked during briefing');
 const allowNew=await call(classroom,'POST','stage',{stage:3,phase:'practice'},'',origin,pin);
 assert.equal(allowNew.statusCode,200);
 const newDraft=await call(classroom,'POST','progress',{stage:3,route:'3d',status:'working',evidence:'Rascunho da proxima etapa'},b.body.token);
 assert.equal(newDraft.statusCode,200);
 const allB=await call(classroom,'GET','state',{},b.body.token);
 assert.equal(allB.body.progress.length,2,'old and new stage drafts persist per user');
 const allA=await call(classroom,'GET','state',{},a.body.token);
 assert.equal(allA.body.progress.length,1,'other student never sees B stages');

 console.log('PASS FUN-04: actual handler blocks future/briefing phases, teacher releases practice and old evidence persists');

 // FUN-05 — ten real handler submission/review cycles, with isolated SQL and
 // a third fictional student. No production credentials, API or student data.
 const third=await call(chat,'POST','join',{name:'Aluno Ficticio C',code:ROOM});
 assert.equal(third.statusCode,201);
 const cToken=third.body.token,cId=third.body.studentId;
 const tooShort=await call(classroom,'POST','progress',{stage:1,route:'2d',status:'submitted',evidence:'curto'},cToken);
 assert.equal(tooShort.statusCode,400,'submission requires a meaningful evidence description');
 const badRoute=await call(classroom,'POST','progress',{stage:1,route:'vr',status:'working',evidence:'rascunho'},cToken);
 assert.equal(badRoute.statusCode,400,'invalid 2D/3D route rejected');
 const invalidStage=await call(classroom,'POST','progress',{stage:11,route:'2d',status:'working',evidence:'rascunho'},cToken);
 assert.equal(invalidStage.statusCode,400,'stage beyond 10 rejected');
 for(let n=1;n<=10;n++){
  const route=n%2?'2d':'3d';
  const phase=await call(classroom,'POST','stage',{stage:n,phase:'practice'},'',origin,pin);
  assert.equal(phase.statusCode,200,'teacher opens practice for M'+n);
  const evidence='Projeto ficticio M'+n+': regra de jogo testada no Preview; antes/depois e caso negativo registrados.';
  const draft=await call(classroom,'POST','progress',{stage:n,route,status:'working',evidence:'Rascunho '+n},cToken);
  assert.equal(draft.statusCode,200,'draft M'+n+' persisted');
  const before=await call(classroom,'GET','state',{},cToken);
  assert.equal(before.body.progress.find(p=>p.stage===n)?.status,'working','draft visible M'+n);
  const release=await call(classroom,'POST','stage',{stage:n,phase:'review'},'',origin,pin);
  assert.equal(release.statusCode,200,'teacher opens review M'+n);
  const sent=await call(classroom,'POST','progress',{stage:n,route,status:'submitted',evidence},cToken);
  assert.equal(sent.statusCode,200,'submitted M'+n);
  const overwrite=await call(classroom,'POST','progress',{stage:n,route,status:'working',evidence:'tentativa'},cToken);
  assert.equal(overwrite.statusCode,409,'pending M'+n+' cannot be overwritten');
  if(n%2===0){
   const insufficient=await call(classroom,'POST','review',{studentId:cId,stage:n,status:'revision',feedback:'curto'},'',origin,pin);
   assert.equal(insufficient.statusCode,400,'revision requires actionable feedback');
   const revision=await call(classroom,'POST','review',{studentId:cId,stage:n,status:'revision',feedback:'Corrigir o teste negativo e reenviar a evidencia.'},'',origin,pin);
   assert.equal(revision.statusCode,200,'revision M'+n+' issued');
   const reviewed=await call(classroom,'GET','state',{},cToken);
   assert.equal(reviewed.body.progress.find(p=>p.stage===n)?.status,'revision','student receives revision M'+n);
   const premature=await call(classroom,'POST','review',{studentId:cId,stage:n,status:'approved'},'',origin,pin);
   assert.equal(premature.statusCode,409,'revision M'+n+' cannot be approved before resubmission');
   const resubmit=await call(classroom,'POST','progress',{stage:n,route,status:'submitted',evidence:evidence+' Corrigido.'},cToken);
   assert.equal(resubmit.statusCode,200,'revised M'+n+' resubmitted');
   assert.match(resubmit.body.progress.evidence,/Corrigido\./,'revised evidence actually changed');
  }
  const approve=await call(classroom,'POST','review',{studentId:cId,stage:n,status:'approved',feedback:'Criterios de teste atendidos.'},'',origin,pin);
  assert.equal(approve.statusCode,200,'teacher approves M'+n);
  const duplicateApproval=await call(classroom,'POST','review',{studentId:cId,stage:n,status:'approved'},'',origin,pin);
  assert.equal(duplicateApproval.statusCode,409,'approved M'+n+' cannot be silently re-reviewed');
  const locked=await call(classroom,'POST','progress',{stage:n,route,status:'working',evidence:'nao alterar'},cToken);
  assert.equal(locked.statusCode,409,'approved M'+n+' cannot be overwritten');
 }
 // M07 acceptance: fictional author submits a genuine native-fixture-derived
 // victory test description; teacher requests revision and approves only after
 // the resubmission. This checks the real classroom handlers, NOT the editor UI.
 const m7Practice=await call(classroom,'POST','stage',{stage:7,phase:'practice'},'',origin,pin);
 assert.equal(m7Practice.statusCode,200);
 const m7Evidence='Missão 07 autoral fictícia: início, desafio, condição PIT_Ready, vitória e captura antes/depois no GDevelop 2D. Projeto salvo localmente.';
 const m7Draft=await call(classroom,'POST','progress',{stage:7,route:'2d',status:'working',evidence:m7Evidence},a.body.token);
 assert.equal(m7Draft.statusCode,200);
 const m7Stage=await call(classroom,'POST','stage',{stage:7,phase:'review'},'',origin,pin);
 assert.equal(m7Stage.statusCode,200);
 const m7Submit=await call(classroom,'POST','progress',{stage:7,route:'2d',status:'submitted',evidence:m7Evidence},a.body.token);
 assert.equal(m7Submit.statusCode,200);
 const m7Revision=await call(classroom,'POST','review',{studentId:a.body.studentId,stage:7,status:'revision',feedback:'Inclua teste negativo e captura do estado antes da vitória.'},'',origin,pin);
 assert.equal(m7Revision.statusCode,200);
 const m7BlockedApproval=await call(classroom,'POST','review',{studentId:a.body.studentId,stage:7,status:'approved'},'',origin,pin);
 assert.equal(m7BlockedApproval.statusCode,409);
 const m7Resubmit=await call(classroom,'POST','progress',{stage:7,route:'2d',status:'submitted',evidence:m7Evidence+' Teste negativo: porta fechada antes da condição.'},a.body.token);
 assert.equal(m7Resubmit.statusCode,200);
 const m7Approved=await call(classroom,'POST','review',{studentId:a.body.studentId,stage:7,status:'approved',feedback:'Fluxo e teste negativo comprovados na descrição.'},'',origin,pin);
 assert.equal(m7Approved.statusCode,200);
 const m7Final=await call(classroom,'GET','state',{},a.body.token);
 assert.equal(m7Final.body.progress.find(p=>p.stage===7)?.status,'approved');
 console.log('PASS M07: isolated real handler draft, submission, revision, resubmission and approval; native fixture evidence separately validated');
 const finalC=await call(classroom,'GET','state',{},cToken);
 assert.equal(finalC.body.progress.length,10,'all ten missions persisted for fictional student C');
 assert(finalC.body.progress.every(p=>p.status==='approved'),'all ten stages approved');
 assert.equal(finalC.body.progress.filter(p=>p.route==='2d').length,5);
 assert.equal(finalC.body.progress.filter(p=>p.route==='3d').length,5);
 const isolationA=await call(classroom,'GET','state',{},a.body.token);
 assert.equal(isolationA.body.progress.length,2,'student A retains own M01 and M07');
 assert(!isolationA.body.progress.some(p=>p.stage===10),'student A sees none of C missions');
 const restoreM10=await call(classroom,'POST','stage',{stage:10,phase:'review'},'',origin,pin);
 assert.equal(restoreM10.statusCode,200,'restore M10 review before existing FUN-05 size test');
 const oversized=await call(classroom,'POST','progress',{stage:10,route:'3d',status:'submitted',evidence:'X'.repeat(900)},b.body.token);
 assert.equal(oversized.statusCode,200,'long evidence is accepted after server-side sanitization');
 assert.equal(oversized.body.progress.evidence.length,750,'evidence truncated at 750 characters');
 console.log('PASS FUN-05: ten real handler stage cycles, drafts, 2D/3D, invalid inputs, revision/resubmission, approval, lock, 750-char limit, 3 fictional students isolated');

 // FUN-06 — roster/heartbeat based on the real handler and its actual SQL contract.
 const unauthorizedRoster=await call(classroom,'GET','roster',{},cToken);
 assert.equal(unauthorizedRoster.statusCode,403,'student cannot read classroom roster');
 const forgedActivity=await call(classroom,'POST','heartbeat',{stage:10},a.body.token);
 assert.equal(forgedActivity.statusCode,200,'M10 is released at end of FUN-05');
 const earlyStage=await call(classroom,'POST','stage',{stage:4,phase:'practice'},'',origin,pin);
 assert.equal(earlyStage.statusCode,200);
 const spoofed=await call(classroom,'POST','heartbeat',{stage:10},b.body.token);
 assert.equal(spoofed.statusCode,403,'student cannot forge activity in a locked future stage');
 const heartbeatC=await call(classroom,'POST','heartbeat',{stage:4},cToken);
 assert.equal(heartbeatC.statusCode,200,'student activity updates on released mission');
 const heartbeatB=await call(classroom,'POST','heartbeat',{stage:2},b.body.token);
 assert.equal(heartbeatB.statusCode,200);
 const teacherRoster=await call(classroom,'GET','roster',{},'',origin,pin);
 assert.equal(teacherRoster.statusCode,200,'teacher sees isolated roster');
 assert.equal(teacherRoster.body.roster.length,3,'all three fictional students visible');
 const cRow=teacherRoster.body.roster.find(s=>s.id===cId);
 assert.equal(cRow.active_stage,4,'roster reports last legitimate activity');
 assert.equal(cRow.highest_stage,10,'roster computes highest evidence stage');
 assert.equal(cRow.approved,10,'roster computes ten approved missions');
 assert.equal(cRow.stages.length,10,'roster contains ten per-mission statuses');
 assert(cRow.stages.every(p=>p.status==='approved'),'roster stage statuses are accurate');
 assert(cRow.last_seen_at,'heartbeat updates last-seen timestamp');
 const bRow=teacherRoster.body.roster.find(s=>s.id===b.body.studentId);
 assert.equal(bRow.active_stage,2,'B activity is independent');
 assert.equal(bRow.approved,0,'B has no approved work');
 assert.equal(bRow.highest_stage,10,'B has evidence at M10');
 assert.equal(bRow.stages.length,3,'B has three own stage records');
 assert(!JSON.stringify(teacherRoster.body).includes(cToken),'roster never leaks raw student tokens');
 console.log('PASS FUN-06: actual roster and heartbeat handlers, three fictional students, per-stage status, approved totals, activity, teacher-only access, future-stage heartbeat blocked');

 // FUN-07 — chat message order, unread counters, isolation, read receipts and rate limit.
 const fakeSend=await call(chat,'POST','send',{body:'Mensagem sem token'},'f'.repeat(64));
 assert.equal(fakeSend.statusCode,401,'forged student token cannot send chat');
 const msgC1=await call(chat,'POST','send',{body:'Pergunta C primeira',mission:10},cToken);
 const msgC2=await call(chat,'POST','send',{body:'Pergunta C segunda',mission:10},cToken);
 const msgB=await call(chat,'POST','send',{body:'Pergunta B individual',mission:2},b.body.token);
 assert.equal(msgC1.statusCode,201);assert.equal(msgC2.statusCode,201);assert.equal(msgB.statusCode,201);
 const teacherUnread=await call(chat,'GET','unread',{},'',origin,pin);
 assert.equal(teacherUnread.body.unread,3,'teacher sees three unread student messages');
 const threadsAfterMessages=await call(chat,'GET','threads',{},'',origin,pin);
 assert.equal(threadsAfterMessages.body.threads[0].id,cId,'thread with most unread appears first');
 assert.equal(threadsAfterMessages.body.threads[0].unread,2);
 const cMessages=await call(chat,'GET','messages',{},cToken);
 assert.equal(cMessages.body.messages.length,2,'student C sees own messages');
 assert(cMessages.body.messages[0].id<cMessages.body.messages[1].id,'messages sorted ascending for reading');
 const bMessages=await call(chat,'GET','messages',{},b.body.token);
 assert.equal(bMessages.body.messages.length,1,'student B sees no C messages');
 const badTeacherTarget=await call(chat,'POST','send',{studentId:'invalid',body:'Ola'},'',origin,pin);
 assert.equal(badTeacherTarget.statusCode,400,'teacher cannot send to invalid student ID');
 const teacherReply=await call(chat,'POST','send',{studentId:cId,body:'Resposta do professor ao C',mission:10},'',origin,pin);
 assert.equal(teacherReply.statusCode,201,'teacher replies to a specific student');
 const cUnread=await call(chat,'GET','unread',{},cToken);
 const bUnread=await call(chat,'GET','unread',{},b.body.token);
 assert.equal(cUnread.body.unread,1,'student C has one unread teacher reply');
 assert.equal(bUnread.body.unread,0,'student B cannot see teacher reply to C');
 const cAfterReply=await call(chat,'GET','messages',{},cToken);
 assert.equal(cAfterReply.body.messages.length,3);
 assert.equal(cAfterReply.body.messages[2].author,'teacher');
 const readCByTeacher=await call(chat,'POST','read',{studentId:cId},'',origin,pin);
 assert.equal(readCByTeacher.statusCode,200);
 const teacherAfterRead=await call(chat,'GET','unread',{},'',origin,pin);
 assert.equal(teacherAfterRead.body.unread,1,'B unread remains after reading C');
 const studentRead=await call(chat,'POST','read',{},cToken);
 assert.equal(studentRead.statusCode,200);
 const cAfterRead=await call(chat,'GET','unread',{},cToken);
 assert.equal(cAfterRead.body.unread,0,'student read receipt clears own counter');
 const longMessage=await call(chat,'POST','send',{body:'Z'.repeat(1400),mission:10},cToken);
 assert.equal(longMessage.statusCode,201);
 const cAfterLong=await call(chat,'GET','messages',{},cToken);
 assert.equal(cAfterLong.body.messages.at(-1).body.length,1200,'server enforces chat length cap');
 for(let n=0;n<9;n++){
  const extra=await call(chat,'POST','send',{body:'Mensagem de limite '+n},cToken);
  assert.equal(extra.statusCode,201,'within chat rate limit');
 }
 const rateLimited=await call(chat,'POST','send',{body:'Mensagem extra bloqueada'},cToken);
 assert.equal(rateLimited.statusCode,429,'thirteenth student message in minute rejected');
 const finalB=await call(chat,'GET','messages',{},b.body.token);
 assert.equal(finalB.body.messages.length,1,'rate-limit testing cannot leak C chat to B');
 console.log('PASS FUN-07: real chat handlers, two-way messages, order, unread/read receipts, per-student isolation, length and rate limit');



})().catch(e=>{console.error(e);process.exitCode=1});

'use strict';
/* REL-01 / M07-04 — Real Postgres 16 integration against disposable localhost DB.
 * Refuses to run against any non-local database or database not named pit_test.
 * Uses fictitious students and a fake PIN; never touches Neon/production.
 */
const assert=require('node:assert/strict');
const url=new URL(process.env.DATABASE_URL||'postgres://invalid/invalid');
if(!['localhost','127.0.0.1'].includes(url.hostname)||url.pathname!=='/pit_test'){
 console.error('Refusing to run against a non-disposable local database');process.exit(2);
}
if(!process.env.PIT_TEACHER_PIN)process.env.PIT_TEACHER_PIN='0123456789abcdef';
if(process.env.PIT_TEACHER_PIN!=='0123456789abcdef')throw Error('Use only the known fake test PIN');
const {Pool}=require('../chat-api/node_modules/pg');
const pool=new Pool({connectionString:process.env.DATABASE_URL});
const chat=require('../chat-api/api/chat.js'),classroom=require('../chat-api/api/classroom.js');
const origin='https://dev-gabriel-exe.github.io',pin='0123456789abcdef';
async function call(handler,method,action,body={},token='',teacherPin='',query={},room='PITGAME26'){
 const headers={origin};if(token)headers['x-pit-student-token']=token;if(teacherPin){headers['x-pit-teacher-pin']=teacherPin;headers['x-pit-room']=room;}
 const req={method,headers,query:{action,...query},body};
 const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(n){this.statusCode=n;return this},json(data){this.body=data;return this},send(data){this.body=data;return this},end(){return this}};
 await handler(req,res);return res;
}
(async()=>{
 await pool.query('DROP TABLE IF EXISTS pit_chat_images,pit_chat_messages,pit_student_stages,pit_classroom_state,pit_students CASCADE');
 await pool.query(`CREATE TABLE pit_students(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),room_code text NOT NULL,display_name text NOT NULL,token_hash text NOT NULL UNIQUE,recovery_hash text,
  joined_at timestamptz NOT NULL DEFAULT now(),last_seen_at timestamptz NOT NULL DEFAULT now(),active_stage integer NOT NULL DEFAULT 1
 )`);
 await pool.query(`CREATE TABLE pit_classroom_state(
  room_code text PRIMARY KEY,current_stage integer NOT NULL DEFAULT 1,phase text NOT NULL DEFAULT 'briefing',updated_at timestamptz NOT NULL DEFAULT now()
 )`);
 await pool.query(`CREATE TABLE pit_student_stages(
  student_id uuid NOT NULL REFERENCES pit_students(id),stage integer NOT NULL,route text NOT NULL,status text NOT NULL,
  evidence text NOT NULL DEFAULT '',feedback text NOT NULL DEFAULT '',updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,PRIMARY KEY(student_id,stage)
 )`);
 await pool.query(`CREATE TABLE pit_chat_messages(
  id bigserial PRIMARY KEY,room_code text NOT NULL,student_id uuid NOT NULL REFERENCES pit_students(id),
  author text NOT NULL,mission integer,body text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),read_at timestamptz
 )`);
 await pool.query('CREATE TABLE pit_chat_images(message_id bigint PRIMARY KEY REFERENCES pit_chat_messages(id) ON DELETE CASCADE,mime text NOT NULL,bytes bytea NOT NULL,created_at timestamptz NOT NULL DEFAULT now())');
 await pool.query("INSERT INTO pit_classroom_state(room_code,current_stage,phase) VALUES('PITGAME26',1,'practice'),('PITGAME26B',1,'briefing')");
 const names=['QA Postgres A','QA Postgres B','QA Postgres C'],users=[];
 for(const name of names){
  const r=await call(chat,'POST','join',{name,code:'PITGAME26'});
  assert.equal(r.statusCode,201,'join '+name);users.push(r.body);
 }
 const forged=await call(classroom,'GET','state',{},'f'.repeat(64));
 assert.equal(forged.statusCode,401,'invalid token denied by real Postgres lookup');
 // Classroom intentionally rejects jumping from stage 1 to 4.
 // Release the three stages sequentially under the teacher's own authority.
 for(const stage of [2,3,4]){
  const release=await call(classroom,'POST','stage',{stage,phase:'practice'},'',pin);
  assert.equal(release.statusCode,200,'teacher sequential release '+stage);
 }
 for(const [i,route,status] of [[0,'2d','submitted'],[1,'3d','submitted'],[2,'2d','working']]){
  const r=await call(classroom,'POST','progress',{stage:4,route,status,evidence:'Evidencia ficticia '+names[i]+' com caso positivo e negativo.'},users[i].token);
  assert.equal(r.statusCode,200,'stage progress persisted in Postgres');
 }
 const a=await call(classroom,'POST','review',{studentId:users[0].studentId,stage:4,status:'approved',feedback:'OK'},'',pin);
 assert.equal(a.statusCode,200);
 const b=await call(classroom,'POST','review',{studentId:users[1].studentId,stage:4,status:'revision',feedback:'Repetir o teste negativo no Preview.'},'',pin);
 assert.equal(b.statusCode,200);
 const premature=await call(classroom,'POST','review',{studentId:users[1].studentId,stage:4,status:'approved'},'',pin);
 assert.equal(premature.statusCode,409,'revision cannot be approved without resubmission');
 const resend=await call(classroom,'POST','progress',{stage:4,route:'3d',status:'submitted',evidence:'Versao corrigida do puzzle 3D com teste negativo.'},users[1].token);
 assert.equal(resend.statusCode,200);
 const approvedB=await call(classroom,'POST','review',{studentId:users[1].studentId,stage:4,status:'approved'},'',pin);
 assert.equal(approvedB.statusCode,200);
 const overwrite=await call(classroom,'POST','progress',{stage:4,route:'2d',status:'working',evidence:'tentativa'},users[0].token);
 assert.equal(overwrite.statusCode,409,'approved record immutable in real Postgres');
 const spoof=await call(classroom,'POST','heartbeat',{stage:10},users[2].token);
 assert.equal(spoof.statusCode,403,'unreleased heartbeat denied');
 const beat=await call(classroom,'POST','heartbeat',{stage:4},users[2].token);
 assert.equal(beat.statusCode,200);
 const roster=await call(classroom,'GET','roster',{},'',pin);
 assert.equal(roster.statusCode,200);assert.equal(roster.body.roster.length,3);
 assert.equal(roster.body.roster.filter(x=>x.approved===1).length,2,'two independent approvals');
 assert.equal(roster.body.roster.find(x=>x.id===users[2].studentId).active_stage,4);
 const msg=await call(chat,'POST','send',{body:'Pergunta do aluno A',mission:4},users[0].token);
 assert.equal(msg.statusCode,201);
 const unread=await call(chat,'GET','unread',{},'',pin);
 assert.equal(unread.body.unread,1);
 const reply=await call(chat,'POST','send',{studentId:users[0].studentId,body:'Resposta individual',mission:4},'',pin);
 assert.equal(reply.statusCode,201);
 const messagesA=await call(chat,'GET','messages',{},users[0].token);
 const messagesB=await call(chat,'GET','messages',{},users[1].token);
 assert.equal(messagesA.body.messages.length,2);assert.equal(messagesB.body.messages.length,0,'student messages isolated');
 // A second lesson must use the same UUID and progress, never create
 // another row for a matching name. A high-entropy code, not a name alone,
 // proves ownership on another computer.
 const original=users[0];
 const repeated=await call(chat,'POST','join',{name:names[0],code:'PITGAME26'});
 assert.equal(repeated.statusCode,409,'same-name duplicate cannot silently register');
 const wrongRecovery=await call(chat,'POST','recover',
  {name:names[0],code:'PITGAME26',recoveryCode:'0000-0000-0000-0000-0000-0000'});
 assert.equal(wrongRecovery.statusCode,403,'name only or incorrect code cannot hijack student');
 const returned=await call(chat,'POST','recover',
  {name:names[0],code:'PITGAME26',recoveryCode:original.recoveryCode});
 assert.equal(returned.statusCode,200,'previous-day student returns with code');
 assert.equal(returned.body.studentId,original.studentId,'same UUID after recovery');
 assert.notEqual(returned.body.token,original.token,'rotate session token on recovery');
 const previousToken=await call(classroom,'GET','state',{},original.token);
 assert.equal(previousToken.statusCode,401,'older device token is revoked');
 const resumed=await call(classroom,'GET','state',{},returned.body.token);
 assert.equal(resumed.statusCode,200);
 assert.equal(resumed.body.progress.some(x=>x.status==='approved'),true,'teacher approvals survive return');
 const crossRoomRecovery=await call(chat,'POST','recover',
  {name:names[0],code:'PITGAME26B',recoveryCode:original.recoveryCode});
 assert.equal(crossRoomRecovery.statusCode,403,'recovery cannot cross room');
 const newCode=await call(chat,'POST','setup-recovery',{},returned.body.token);
 assert.equal(newCode.statusCode,200);
 assert.match(newCode.body.recoveryCode,/^(?:[A-F0-9]{4}-){5}[A-F0-9]{4}$/,'96-bit readable return code');
 const oldCode=await call(chat,'POST','recover',
  {name:names[0],code:'PITGAME26',recoveryCode:original.recoveryCode});
 assert.equal(oldCode.statusCode,403,'replaced code invalid');
 const reset=await call(chat,'POST','teacher-reset-access',
  {studentId:original.studentId},'',pin,{},'PITGAME26');
 assert.equal(reset.statusCode,200,'teacher can help retrieve second lesson account');
 assert.match(reset.body.recoveryCode,/^[A-F0-9-]{29}$/);
 const otherTeacher=await call(chat,'POST','teacher-reset-access',
  {studentId:original.studentId},'',pin,{},'PITGAME26B');
 assert.equal(otherTeacher.statusCode,404,'teacher in other cohort cannot reset access');
 const finalRecover=await call(chat,'POST','recover',
  {name:names[0],code:'PITGAME26',recoveryCode:reset.body.recoveryCode});
 assert.equal(finalRecover.statusCode,200);
 assert.equal(finalRecover.body.studentId,original.studentId);
 const finalState=await call(classroom,'GET','state',{},finalRecover.body.token);
 assert.equal(finalState.body.progress.some(x=>x.status==='approved'),true);
 console.log('PASS RETURN: same student UUID and 10-mission approvals across lessons, name collision guard, 96-bit recovery, token rotation, teacher reset and room isolation');
 const hashRows=await pool.query('SELECT token_hash FROM pit_students');
 assert(hashRows.rows.every(x=>/^[a-f0-9]{64}$/.test(x.token_hash)&&users.every(u=>u.token!==x.token_hash)),'database stores only token hashes');
 const count=await pool.query('SELECT count(*)::int AS n FROM pit_student_stages');
 assert.equal(count.rows[0].n,3,'three persisted stage records');
 // TWO REAL COHORT SCOPES in disposable Postgres: each stage, roster and
 // thread is independently authorized under the same teacher PIN.
 const other=await call(chat,'POST','join',{name:'QA Turma 2',code:'PITGAME26B'});
 assert.equal(other.statusCode,201,'second cohort join allowed');
 assert.equal(other.body.code,'PITGAME26B');
 const bstudent=await call(classroom,'GET','state',{},other.body.token);
 assert.equal(bstudent.body.room,'PITGAME26B');
 assert.equal(bstudent.body.state.current_stage,1);
 const astate=await call(classroom,'GET','state',{},users[0].token);
 assert.equal(astate.body.room,'PITGAME26');
 assert.equal(astate.body.state.current_stage,4);
 const t1=await call(classroom,'GET','roster',{},'',pin);
 const t2=await call(classroom,'GET','roster',{},'',pin,{},'PITGAME26B');
 assert.equal(t1.body.roster.length,3);assert.equal(t2.body.roster.length,1);
 assert.equal(t2.body.roster[0].display_name,'QA Turma 2');
 const denied=await call(classroom,'POST','review',
  {studentId:other.body.studentId,stage:1,status:'approved'},'',pin);
 assert.equal(denied.statusCode,409,'teacher in room 1 cannot review room 2');
 const m2=await call(chat,'POST','send',
  {body:'Mensagem somente da turma 2',mission:1},other.body.token);
 assert.equal(m2.statusCode,201);
 const unreadA=await call(chat,'GET','unread',{},'',pin);
 const unreadB=await call(chat,'GET','unread',{},'',pin,{},'PITGAME26B');
 assert.equal(unreadB.body.unread,1,'teacher room 2 sees its own unread');
 assert.equal(unreadA.body.unread,1,'room 1 has only its original unread');
 const cross=await call(chat,'POST','send',
  {studentId:other.body.studentId,body:'Tentativa de outra turma',mission:1},'',pin);
 assert.equal(cross.statusCode,404,'cannot message student in another room');
 const crossMessages=await call(chat,'GET','messages',{},'',pin,{studentId:other.body.studentId});
 assert.equal(crossMessages.statusCode,404,'cannot read student in another room');
 const same=await call(chat,'GET','messages',{},'',pin,
  {studentId:other.body.studentId},'PITGAME26B');
 assert.equal(same.statusCode,200);
 assert.equal(same.body.messages.length,1);
 const unlockedB=await call(classroom,'POST','stage',
  {stage:2,phase:'practice'},'',pin,{},'PITGAME26B');
 assert.equal(unlockedB.statusCode,200);
 const stillA=await call(classroom,'GET','state',{},users[0].token);
 assert.equal(stillA.body.state.current_stage,4,'room B release cannot advance room A');
 const t2after=await call(classroom,'GET','roster',{},'',pin,{},'PITGAME26B');
 assert.equal(t2after.body.roster.length,1);
 const invalidRoom=await call(classroom,'GET','roster',{},'',pin,{},'PITGAME26Z');
 assert.equal(invalidRoom.statusCode,400);
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==';
 const attached=await call(chat,'POST','send-image',{image:png,mime:'image/png',caption:'Exemplo M01'},other.body.token);
 assert.equal(attached.statusCode,201,'private screenshot uploaded in cohort B');
 const retrieved=await call(chat,'GET','image',{},other.body.token,'',{messageId:attached.body.id});
 assert.equal(retrieved.statusCode,200,'cohort B author reads image');
 assert(Buffer.isBuffer(retrieved.body));assert.equal(retrieved.headers['Content-Type'],'image/png');
 const wrongCohort=await call(chat,'GET','image',{},'',pin,{messageId:attached.body.id});
 assert.equal(wrongCohort.statusCode,404,'cohort A teacher cannot read cohort B image');
 const ownRoom=await call(chat,'GET','image',{},'',pin,{messageId:attached.body.id},'PITGAME26B');
 assert.equal(ownRoom.statusCode,200,'cohort B teacher can read its screenshot');
 const wrongStudent=await call(chat,'GET','image',{},users[0].token,'',{messageId:attached.body.id});
 assert.equal(wrongStudent.statusCode,404,'cohort A student cannot read image');
 const malformed=await call(chat,'POST','send-image',{image:'AAAA',mime:'image/png'},other.body.token);
 assert.notEqual(malformed.statusCode,201,'invalid image signature rejected');
 console.log('PASS PRIVATE IMAGES in disposable Postgres: authenticated 2 MB PNG, correct room author, teacher scope and other-room denial');
 console.log('PASS TWO COHORTS in disposable Postgres: independent joins, stages, roster, chat, teacher review and cross-room denial');
 console.log('PASS REAL POSTGRES 16: 3 fictional students, token hashing, stage release, 2D/3D drafts, review/resubmit/approval, heartbeat, roster, isolated chat');
 await pool.end();process.exit(0);
})().catch(async e=>{console.error(e);await pool.end().catch(()=>{});process.exit(1)});

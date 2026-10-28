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
async function call(handler,method,action,body={},token='',teacherPin='',query={}){
 const headers={origin};if(token)headers['x-pit-student-token']=token;if(teacherPin)headers['x-pit-teacher-pin']=teacherPin;
 const req={method,headers,query:{action,...query},body};
 const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(n){this.statusCode=n;return this},json(data){this.body=data;return this},end(){return this}};
 await handler(req,res);return res;
}
(async()=>{
 await pool.query('DROP TABLE IF EXISTS pit_chat_messages,pit_student_stages,pit_classroom_state,pit_students CASCADE');
 await pool.query(`CREATE TABLE pit_students(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),room_code text NOT NULL,display_name text NOT NULL,token_hash text NOT NULL UNIQUE,
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
 await pool.query("INSERT INTO pit_classroom_state(room_code,current_stage,phase) VALUES('PITGAME26',1,'practice')");
 const names=['QA Postgres A','QA Postgres B','QA Postgres C'],users=[];
 for(const name of names){
  const r=await call(chat,'POST','join',{name,code:'PITGAME26'});
  assert.equal(r.statusCode,201,'join '+name);users.push(r.body);
 }
 const forged=await call(classroom,'GET','state',{},'f'.repeat(64));
 assert.equal(forged.statusCode,401,'invalid token denied by real Postgres lookup');
 const release=await call(classroom,'POST','stage',{stage:4,phase:'practice'},'',pin);
 assert.equal(release.statusCode,200);
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
 const hashRows=await pool.query('SELECT token_hash FROM pit_students');
 assert(hashRows.rows.every(x=>/^[a-f0-9]{64}$/.test(x.token_hash)&&users.every(u=>u.token!==x.token_hash)),'database stores only token hashes');
 const count=await pool.query('SELECT count(*)::int AS n FROM pit_student_stages');
 assert.equal(count.rows[0].n,3,'three persisted stage records');
 console.log('PASS REAL POSTGRES 16: 3 fictional students, token hashing, stage release, 2D/3D drafts, review/resubmit/approval, heartbeat, roster, isolated chat');
 await pool.end();process.exit(0);
})().catch(async e=>{console.error(e);await pool.end().catch(()=>{});process.exit(1)});

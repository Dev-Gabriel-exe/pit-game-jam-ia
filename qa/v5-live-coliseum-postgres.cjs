'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {Pool}=require('../chat-api/node_modules/pg');
process.env.DATABASE_URL||='postgresql://postgres:ci_only_password@127.0.0.1:5432/pit_v5_test';
process.env.PIT_TEACHER_PIN='ci_only_teacher_pin_32chars_long';
const {createHandler}=require('../chat-api/api/coliseum.js');
const db=new Pool({connectionString:process.env.DATABASE_URL});
const tokens=['a','b','c','d'].map(c=>c.repeat(64));
const ids=['10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',
 '20000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000004'];
const handler=createHandler(db);
const origin='https://dev-gabriel-exe.github.io';
async function call(action,method='GET',body=null,{token,teacher=false,room,id}={}){
 const headers={origin};if(token)headers['x-pit-student-token']=token;
 if(teacher){headers['x-pit-teacher-pin']=process.env.PIT_TEACHER_PIN;headers['x-pit-room']=room||'PITGAME26'}
 const req={method,headers,query:{action,id},body};
 const res={code:200,setHeader(){return this},status(c){this.code=c;return this},
  json(b){this.body=b;return this},end(){this.body=null;return this}};
 await handler(req,res);return res;
}
async function seed(){
 await db.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
 await db.query("CREATE TABLE public.pit_classroom_state(room_code text PRIMARY KEY,current_stage smallint NOT NULL,phase text NOT NULL DEFAULT 'practice',updated_at timestamptz NOT NULL DEFAULT now())");
 await db.query("CREATE TABLE public.pit_students(id uuid PRIMARY KEY,room_code text NOT NULL,display_name varchar(100) NOT NULL,token_hash char(64) NOT NULL,joined_at timestamptz NOT NULL DEFAULT now())");
 await db.query("CREATE TABLE public.pit_student_stages(student_id uuid NOT NULL REFERENCES public.pit_students(id) ON DELETE CASCADE,stage smallint NOT NULL,status text NOT NULL,PRIMARY KEY(student_id,stage))");
 await db.query("INSERT INTO public.pit_classroom_state(room_code,current_stage) VALUES('PITGAME26',5),('PITGAME26B',5)");
 await db.query(fs.readFileSync('chat-api/migrations/20261103_hero_sync.sql','utf8'));
 await db.query(fs.readFileSync('chat-api/migrations/20261103_coliseum_live.sql','utf8'));
 await db.query(fs.readFileSync('chat-api/migrations/20261103_arena_lobby.sql','utf8'));

 for(let i=0;i<4;i++){
  const room=i<2?'PITGAME26':'PITGAME26B';
  await db.query("INSERT INTO public.pit_students(id,room_code,display_name,token_hash) VALUES($1,$2,$3,$4)",
   [ids[i],room,'Fictício '+(i+1),crypto.createHash('sha256').update(tokens[i]).digest('hex')]);
  await db.query("INSERT INTO public.pit_student_heroes(student_id,klass) VALUES($1,$2)",
   [ids[i],['warrior','mage','hunter','guardian'][i]]);
  for(let n=1;n<=5;n++)await db.query("INSERT INTO public.pit_student_stages(student_id,stage,status) VALUES($1,$2,$3)",
   [ids[i],n,n===5?'submitted':'approved']);
 }
}
async function main(){
 try{
  await seed();
  assert.equal((await call('state')).code,401);
  assert.equal((await call('state','GET',null,{token:'x'.repeat(64)})).code,401);
  const teacherA={teacher:true,room:'PITGAME26'},teacherB={teacher:true,room:'PITGAME26B'};
  assert.equal((await call('state','GET',null,teacherA)).body.students.length,2);
  assert.equal((await call('state','GET',null,teacherB)).body.students.length,2);
  assert.equal((await call('state','GET',null,{token:tokens[0]})).body.duelsEnabled,false);
  let q=await call('duels','POST',{enabled:true},teacherA);assert.equal(q.code,200,JSON.stringify(q.body));
  assert.equal((await call('state','GET',null,teacherB)).body.duelsEnabled,false);
  q=await call('presence','POST',{available:true},{token:tokens[0]});assert.equal(q.code,200,JSON.stringify(q.body));
  q=await call('presence','POST',{available:true},{token:tokens[1]});assert.equal(q.code,200);
  // Recover from a crashed/closed duel tab: a stale heartbeat must not masquerade
  // as online, and a fresh availability POST must revive the same session.
  await db.query("UPDATE public.pit_coliseum_presence SET seen_at=now()-interval '90 seconds' WHERE student_id=$1",[ids[0]]);
  assert.equal((await call('state','GET',null,{token:tokens[0]})).body.optedIn,false);
  q=await call('presence','POST',{available:true},{token:tokens[0]});assert.equal(q.code,200);
  assert.equal((await call('state','GET',null,{token:tokens[0]})).body.optedIn,true);
  q=await call('presence','POST',{available:true},{token:tokens[2]});assert.equal(q.code,403,'other room duels paused');
  const state=(await call('state','GET',null,{token:tokens[0]})).body;
  assert.equal(state.peers.length,1);assert.equal(state.peers[0].id,ids[1]);
  q=await call('invite','POST',{targetId:ids[2]},{token:tokens[0]});
  assert.equal(q.code,409,'cross-cohort invitation forbidden');
  q=await call('invite','POST',{targetId:ids[1]},{token:tokens[0]});
  assert.equal(q.code,201,JSON.stringify(q.body));const inviteId=q.body.inviteId;
  const pendingHistory=(await call('state','GET',null,{token:tokens[0]})).body.invites.find(x=>x.id===inviteId);
  assert.equal(pendingHistory.status,'pending');
  assert.equal(pendingHistory.outcome,null,'unaccepted invitations must not count as a loss');
  q=await call('respond','POST',{inviteId,decision:'accept'},{token:tokens[0]});
  assert.equal(q.code,403,'sender cannot accept');
  q=await call('respond','POST',{inviteId,decision:'accept'},{token:tokens[1]});
  assert.equal(q.code,200,JSON.stringify(q.body));const matchId=q.body.matchId;
  assert.equal((await call('match','GET',null,{token:tokens[0]})).code,400);
  const replayA=await call('match','GET',null,{token:tokens[0],id:matchId});
  const replayB=await call('match','GET',null,{token:tokens[1],id:matchId});
  const replayC=await call('match','GET',null,{token:tokens[2],id:matchId});
  assert.equal(replayA.code,200);assert.equal(replayB.code,200);assert.equal(replayC.code,404);
  assert.equal(replayA.body.match.sha256,replayB.body.match.sha256,'same replay for both players');
  assert.equal(replayA.body.match.roster.length,2);
  const winnerId=replayA.body.match.result.winner?.id||null;
  const historyA=(await call('state','GET',null,{token:tokens[0]})).body.invites.find(x=>x.id===inviteId);
  const historyB=(await call('state','GET',null,{token:tokens[1]})).body.invites.find(x=>x.id===inviteId);
  const expectedA=winnerId===null?'draw':winnerId===ids[0]?'win':'loss';
  const expectedB=winnerId===null?'draw':winnerId===ids[1]?'win':'loss';
  assert.equal(historyA.outcome,expectedA,'sender sees their official result');
  assert.equal(historyB.outcome,expectedB,'receiver sees their official result');
  assert.equal(historyA.matchId,matchId);
  assert.equal(historyB.matchId,matchId);
  assert.equal((await call('state','GET',null,{token:tokens[2]})).body.invites.length,0,
   'other classroom students cannot see duel history');
  const before=(await db.query("SELECT count(*)::int AS n FROM public.pit_student_stages")).rows[0].n;
  q=await call('arena-open','POST',{mission:10},teacherA);assert.equal(q.code,403,'M10 gated');
  q=await call('arena-start','POST',{mission:5},teacherA);assert.equal(q.code,409,'cannot start before opening waiting room');
  q=await call('arena-open','POST',{mission:5},{token:tokens[0]});assert.equal(q.code,404,'students cannot open a teacher lobby');
  q=await call('arena-join','POST',{mission:5},{token:tokens[0]});assert.equal(q.code,409,'cannot join unopened lobby');
  q=await call('arena-open','POST',{mission:5},teacherA);assert.equal(q.code,200,JSON.stringify(q.body));
  assert.equal((await call('state','GET',null,teacherA)).body.lobby.joinedCount,0);
  assert.equal((await call('state','GET',null,teacherB)).body.lobby,null,'rooms isolated');
  q=await call('arena-join','POST',{mission:5},{token:tokens[2]});assert.equal(q.code,409,'other classroom cannot join');
  q=await call('arena-join','POST',{mission:5},{token:tokens[0]});assert.equal(q.code,200);
  assert.equal((await call('state','GET',null,{token:tokens[0]})).body.lobby.joined,true);
  assert.equal((await call('state','GET',null,{token:tokens[1]})).body.lobby.joined,false);
  q=await call('arena-start','POST',{mission:5},teacherA);assert.equal(q.code,409,'requires two joined students');
  q=await call('arena-join','POST',{mission:5},{token:tokens[1]});assert.equal(q.code,200);
  q=await call('arena-join','POST',{mission:5},{token:tokens[1]});assert.equal(q.code,200,'idempotent duplicate join');
  assert.equal((await call('state','GET',null,teacherA)).body.lobby.joinedCount,2);
  q=await call('arena-leave','POST',{mission:5},{token:tokens[1]});assert.equal(q.code,200);
  assert.equal((await call('state','GET',null,teacherA)).body.lobby.joinedCount,1);
  q=await call('arena-join','POST',{mission:5},{token:tokens[1]});assert.equal(q.code,200);
  q=await call('arena-start','POST',{mission:5},teacherA);assert.equal(q.code,201,JSON.stringify(q.body));
  assert.equal(q.body.participants,2);
  assert.equal((await call('state','GET',null,{token:tokens[0]})).body.lobby,null);
  assert.equal((await call('state','GET',null,{token:tokens[0]})).body.arena[0].joined,true);
  q=await call('arena-start','POST',{mission:5},teacherA);assert.equal(q.code,200);
  assert.equal(q.body.alreadyStarted,true);
  assert.equal((await call('state','GET',null,{token:tokens[2]})).body.arena.length,0,'arena stays in cohort');
  q=await call('duels','POST',{enabled:false},teacherA);assert.equal(q.code,200);
  q=await call('invite','POST',{targetId:ids[1]},{token:tokens[0]});assert.equal(q.code,403,'teacher pause');
  await db.query("UPDATE public.pit_classroom_state SET current_stage=10 WHERE room_code='PITGAME26B'");
  for(let i=2;i<4;i++){
   await db.query("UPDATE public.pit_student_stages SET status='approved' WHERE student_id=$1 AND stage=5",[ids[i]]);
   for(let n=6;n<=10;n++)await db.query("INSERT INTO public.pit_student_stages(student_id,stage,status) VALUES($1,$2,'approved')",[ids[i],n]);
  }
  q=await call('arena-open','POST',{mission:10},teacherB);assert.equal(q.code,200);
  assert.equal((await call('state','GET',null,teacherB)).body.lobby.joinedCount,0);
  q=await call('arena-join','POST',{mission:10},{token:tokens[2]});assert.equal(q.code,200);
  q=await call('arena-join','POST',{mission:10},{token:tokens[3]});assert.equal(q.code,200);
  q=await call('arena-start','POST',{mission:10},teacherB);assert.equal(q.code,201,JSON.stringify(q.body));
  assert.equal(q.body.participants,2);
  const after=(await db.query("SELECT count(*)::int AS n FROM public.pit_student_stages")).rows[0].n;
  assert.equal(after,before+10,'fights never modify stages');
  const count=(await db.query("SELECT count(*)::int AS n FROM public.pit_coliseum_matches")).rows[0].n;
  assert.equal(count,3);
  console.log('PASS PostgreSQL: authenticated 2-room arena lobby, joins, capacity/idempotency, teacher start, duel regressions and no XP writes.');
 }finally{await db.end()}
}
main().catch(e=>{console.error(e);process.exitCode=1});

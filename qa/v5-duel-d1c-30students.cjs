'use strict';
/* D1c: 30 fiction-only students, 15 concurrent pairs, real disposable PG.
 * Teacher can pause matchmaking, never grants XP or interferes with a
 * match that has already started. No real grade, account or credentials.
 */
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {Pool}=require('pg');
const P=require('../chat-api/lib/v5-duel-phase2-engine.js');
const {createDuelService}=require('../chat-api/lib/v5-duel-d1a-service.js');
const {createMatchService}=require('../chat-api/lib/v5-duel-d1b-service.js');
const {createTeacherDuelHandler}=require('../chat-api/lib/v5-duel-d1c-teacher.js');
const {createDuelHandler}=require('../chat-api/lib/v5-duel-d1a-handler.js');
const {createMatchHandler}=require('../chat-api/lib/v5-duel-d1b-handler.js');
const {createHash:hash}=require('node:crypto');
const ROOM='PITGAME26',KEY='f'.repeat(64);
const db=new Pool({host:'127.0.0.1',port:5432,user:'postgres',password:'ci_only_password',
 database:'pit_v5_d1c_test',max:35});
const duel=createDuelService(db),match=createMatchService(db);
const api=createDuelHandler({pool:db,enabled:true});
const matchApi=createMatchHandler({pool:db,enabled:true});
const teacher=createTeacherDuelHandler({pool:db,enabled:true,teacherKey:KEY});
const students=Array.from({length:30},(_,i)=>{
 const index=String(i+1).padStart(2,'0'),klass=['warrior','mage','hunter','guardian'][i%4];
 const id='a0000000-0000-4000-8000-'+String(i+1).padStart(12,'0');
 const token=createHash('sha256').update('CI-D1c-student-'+index).digest('hex');
 return {id,roomCode:ROOM,name:'Aluno fictício '+index,token,klass,approved:i%2?3:2};
});
function req(method,headers,body=null,query={}){
 return {method,headers,body,query};
}
async function handle(handler,request){
 const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},
  status(n){this.statusCode=n;return this},json(x){this.payload=x;return this}};
 await handler(request,res);return {code:res.statusCode,body:res.payload};
}
async function teacherCall(method,enabled,key=KEY,origin='http://127.0.0.1:8899'){
 return handle(teacher,req(method,{
  origin,'content-type':'application/json','x-pit-v5-teacher-lab-key':key
 },method==='POST'?{enabled}:null));
}
async function studentCall(handler,student,method,action,body=null,more={}){
 return handle(handler,req(method,{
  origin:'http://127.0.0.1:8899','content-type':'application/json',
  'x-pit-student-token':student.token
 },body,{action,...more}));
}
async function seed(){
 await db.query("UPDATE pit_classroom_state SET current_stage=3 WHERE room_code='PITGAME26'");
 for(const s of students){
  await db.query(
   'INSERT INTO pit_students(id,room_code,token_hash,display_name) VALUES($1,$2,$3,$4)',
   [s.id,ROOM,hash('sha256').update(s.token).digest('hex'),s.name]);
  for(let mission=1;mission<=3;mission++){
   const status=mission<=s.approved?'approved':'submitted';
   await db.query('INSERT INTO pit_student_stages(student_id,stage,status) VALUES($1,$2,$3)',
    [s.id,mission,status]);
  }
  const attrs={FOR:0,DES:0,INT:0,VIT:0,DEF:0};
  attrs[{warrior:'FOR',mage:'INT',hunter:'DES',guardian:'DEF'}[s.klass]]=2*s.approved;
  const talents=P.TALENTS[s.klass].slice(0,s.approved).map(t=>t.id);
  await db.query('INSERT INTO pit_hero_builds_v2 '+
   '(student_id,room_code,klass,attributes,talents) VALUES($1,$2,$3,$4::jsonb,$5::jsonb)',
   [s.id,ROOM,s.klass,JSON.stringify(attrs),JSON.stringify(talents)]);
 }
}
(async()=>{
 await seed();
 assert.equal((await teacherCall('GET')).code,200);
 assert.equal((await teacherCall('GET',null,'0'.repeat(64))).code,401);
 assert.equal((await teacherCall('POST',true,KEY,'https://evil.example')).code,403);
 assert.equal((await teacherCall('POST',true,'123')).code,401);
 assert.equal((await studentCall(api,students[0],'POST','available',{available:true})).code,403,
  'No teacher release means no one may duel');
 assert.equal((await teacherCall('POST',true)).body.state.enabled,true);
 await Promise.all(students.map(s=>duel.setAvailable(s,true)));
 const first=students[0],second=students[1];
 let invite=await duel.invite(first,second.id);
 assert.equal(invite.status,'pending');
 assert.equal((await teacherCall('POST',false)).body.state.enabled,false);
 const declined=await studentCall(api,second,'POST','accept',{inviteId:invite.id});
 assert.equal(declined.code,409,'Pause blocks accepting new pair');
 const notStarted=await studentCall(matchApi,first,'POST','start',{inviteId:invite.id});
 assert.equal(notStarted.code,409);
 assert.equal((await teacherCall('POST',true)).body.state.enabled,true);
 await duel.decide(second,invite.id,'decline');
 // The 30-person test starts with a clean invited roster.
 assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM pit_duel_slots')).rows[0].n,0);
 const started=Date.now();
 const pairs=Array.from({length:15},(_,i)=>[students[i*2],students[i*2+1]]);
 const invites=await Promise.all(pairs.map(([a,b])=>duel.invite(a,b.id)));
 assert.equal(invites.length,15);
 assert.equal(new Set(invites.map(i=>i.id)).size,15);
 await Promise.all(invites.map((i,n)=>duel.decide(pairs[n][1],i.id,'accept')));
 const pairings=await Promise.all(invites.map(async(i,n)=>{
  const [a,b]=pairs[n];
  const [left,right]=await Promise.all([match.start(a,i.id),match.start(b,i.id)]);
  assert.equal(left.replaySha256,right.replaySha256);
  assert.equal(left.replay.winnerSide,right.replay.winnerSide);
  assert.equal(left.replay.participants.length,2);
  assert.equal(left.replay.participants[0].approvedMissions,a.approved);
  assert.equal(left.replay.participants[1].approvedMissions,b.approved);
  return left;
 }));
 assert.equal(new Set(pairings.map(x=>x.inviteId)).size,15);
 assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM pit_duel_matches')).rows[0].n,15,
  'One immutable replay per accepted invitation');
 assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM pit_duel_slots')).rows[0].n,30,
  'All 30 students claimed one slot each');
 const anySecondInvite=await studentCall(api,first,'POST','invite',{targetId:students[2].id});
 assert.equal(anySecondInvite.code,409,'No 16th concurrent invite when 30 slots in use');
 // Match data is visible only to participants; classroom peers cannot snoop.
 const foreign=await studentCall(matchApi,students[2],'GET','replay',null,{inviteId:invites[0].id});
 assert.equal(foreign.code,403);
 assert.equal((await teacherCall('POST',false)).body.state.enabled,false);
 const viewDuringPause=await studentCall(matchApi,first,'GET','replay',null,{inviteId:invites[0].id});
 assert.equal(viewDuringPause.code,200,'Existing match remains watchable after teacher pauses');
 assert.equal(viewDuringPause.body.match.replaySha256,pairings[0].replaySha256);
 // Simulate passage of time only in the CI database.
 await db.query(
  "UPDATE pit_duel_matches SET started_at=NOW()-INTERVAL '200 seconds', "+
  "ends_at=NOW()-INTERVAL '2 seconds' WHERE room_code=$1",[ROOM]);
 const ended=await match.read(first,invites[0].id);
 assert.equal(ended.status,'finished');
 assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM pit_duel_slots')).rows[0].n,0,
  'Finishing all 15 duels frees every participant');
 assert.equal((await db.query("SELECT COUNT(*)::int AS n FROM pit_duel_invites WHERE status='finished'")).rows[0].n,15);
 const repeats=await Promise.all(invites.map((i,n)=>match.read(pairs[n][0],i.id)));
 assert(repeats.every((x,i)=>x.replaySha256===pairings[i].replaySha256));
 await teacherCall('POST',true);
 const again=await duel.invite(students[0],students[1].id);
 assert.equal(again.status,'pending','Students can duel again after all slots are freed');
 await duel.decide(students[0],again.id,'cancel');
 const count=await db.query(
  "SELECT COUNT(*)::int AS n FROM information_schema.tables "+
  "WHERE table_name IN ('pit_grades','pit_xp_logs','pit_peer_reviews')");
 assert.equal(count.rows[0].n,0,'No grading/XP tables created or modified');
 console.log('PASS D1c 30-student test: 15 concurrent invitations and immutable matches; teacher pause/resume, status, auth, replay, cleanup and second round. Runtime '+(Date.now()-started)+'ms.');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1}).finally(()=>db.end());

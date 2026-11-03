'use strict';
// Actual Coliseum handler and throwaway PostgreSQL. Never accepts a remote DB.
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const url=new URL(process.env.DATABASE_URL||'postgresql://postgres:ci_only_password@127.0.0.1:5432/v6_coliseum_test');
assert(['127.0.0.1','localhost'].includes(url.hostname)&&url.pathname==='/v6_coliseum_test',
 'This destructive fixture is restricted to local /v6_coliseum_test');
process.env.DATABASE_URL=url.href;process.env.PIT_TEACHER_PIN='v6_fictional_teacher_key_32chars';
const {Pool}=require('../chat-api/node_modules/pg'),db=new Pool({connectionString:url.href,max:30});
const {createHandler}=require('../chat-api/api/coliseum.js'),handler=createHandler(db);
const engine=require('../chat-api/lib/v5-phase2-engine.js');
const students=Array.from({length:30},(_,i)=>({
 id:'10000000-0000-4000-8000-'+String(i+1).padStart(12,'0'),
 token:crypto.createHash('sha256').update('v6-isolated-'+i).digest('hex'),
 klass:['warrior','mage','hunter','guardian'][i%4],name:'V6 ficticio '+(i+1)}));
const observations=[];
async function call(action,{student,teacher=false,body,id}={}){
 const headers={origin:'https://dev-gabriel-exe.github.io'};
 if(student)headers['x-pit-student-token']=student.token;
 if(teacher){headers['x-pit-teacher-pin']=process.env.PIT_TEACHER_PIN;headers['x-pit-room']='PITGAME26'}
 const req={method:body?'POST':'GET',headers,query:{action,id},body};
 const res={code:200,setHeader(){return this},status(code){this.code=code;return this},json(b){this.body=b;return this},end(){return this}};
 const began=performance.now();await handler(req,res);
 observations.push({action,ms:Math.round(performance.now()-began),status:res.code});
 assert(res.code<500,JSON.stringify({action,body,response:res.body}));return res;
}
const all=(action,body)=>Promise.all(students.map(student=>call(action,{student,body})));
const digest=async()=>crypto.createHash('sha256').update(JSON.stringify((await db.query(
 'SELECT student_id,stage,status FROM pit_student_stages ORDER BY student_id,stage')).rows)).digest('hex');
(async()=>{
 try{
  await db.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await db.query("CREATE TABLE pit_classroom_state(room_code text PRIMARY KEY,current_stage smallint NOT NULL,phase text NOT NULL DEFAULT 'practice',updated_at timestamptz NOT NULL DEFAULT now())");
  await db.query('CREATE TABLE pit_students(id uuid PRIMARY KEY,room_code text NOT NULL,display_name varchar(100) NOT NULL,token_hash char(64) NOT NULL,joined_at timestamptz NOT NULL DEFAULT now())');
  await db.query('CREATE TABLE pit_student_stages(student_id uuid NOT NULL REFERENCES pit_students(id),stage smallint NOT NULL,status text NOT NULL,PRIMARY KEY(student_id,stage))');
  await db.query("INSERT INTO pit_classroom_state(room_code,current_stage) VALUES('PITGAME26',5),('PITGAME26B',5)");
  for(const file of ['20261103_hero_sync.sql','20261103_coliseum_live.sql'])await db.query(fs.readFileSync('chat-api/migrations/'+file,'utf8'));
  for(const [i,s] of students.entries()){
   await db.query('INSERT INTO pit_students(id,room_code,display_name,token_hash) VALUES($1,$2,$3,$4)',
    [s.id,'PITGAME26',s.name,crypto.createHash('sha256').update(s.token).digest('hex')]);
   const b=engine.exampleBuild(s.klass,s.name,5,Math.floor(i/4)%11);
   await db.query('INSERT INTO pit_student_heroes(student_id,klass,attributes,talents) VALUES($1,$2,$3,$4)',
    [s.id,s.klass,JSON.stringify(b.attributes),JSON.stringify(b.talents)]);
   for(let m=1;m<=5;m++)await db.query("INSERT INTO pit_student_stages VALUES($1,$2,'approved')",[s.id,m]);
  }
  const before=await digest();
  assert.equal((await call('duels',{teacher:true,body:{enabled:true}})).code,200);
  assert((await all('presence',{available:true})).every(r=>r.code===200));
  const states=await all('state');
  assert(states.every(r=>r.body.peers.length===29),'Each student must see the other 29');
  const invites=await Promise.all(Array.from({length:15},(_,i)=>call('invite',{
   student:students[i*2],body:{targetId:students[i*2+1].id}})));
  assert(invites.every(r=>r.code===201),'15 disjoint invitations must succeed');
  const accepted=await Promise.all(invites.map((r,i)=>call('respond',{
   student:students[i*2+1],body:{inviteId:r.body.inviteId,decision:'accept'}})));
  assert(accepted.every(r=>r.code===200),'15 concurrent accepts must succeed');
  const snapshots=await Promise.all(students.map((student,i)=>call('match',{
   student,id:accepted[Math.floor(i/2)].body.matchId})));
  for(let i=0;i<30;i+=2){
   assert.equal(snapshots[i].code,200);assert.equal(snapshots[i+1].code,200);
   assert.equal(snapshots[i].body.match.sha256,snapshots[i+1].body.match.sha256);
   assert.equal(snapshots[i].body.match.roster.length,2);
  }
  for(const mission of [5,10]){
   if(mission===10){
    await db.query("UPDATE pit_classroom_state SET current_stage=10 WHERE room_code='PITGAME26'");
    for(const [i,s] of students.entries()){
     for(let m=6;m<=10;m++)await db.query("INSERT INTO pit_student_stages VALUES($1,$2,'approved')",[s.id,m]);
     const b=engine.exampleBuild(s.klass,s.name,10,Math.floor(i/4)%11,{experimentalFinal:true});
     await db.query('UPDATE pit_student_heroes SET attributes=$2,talents=$3 WHERE student_id=$1',
      [s.id,JSON.stringify(b.attributes),JSON.stringify(b.talents)]);
    }
   }
   const grades=await digest();
   const starts=await Promise.all(Array.from({length:3},()=>call('arena-start',{teacher:true,body:{mission}})));
   assert.equal(starts.filter(x=>x.code===201).length,1,'Only one official arena can be created');
   assert.equal(new Set(starts.map(x=>x.body.matchId)).size,1);
   const id=starts[0].body.matchId;
   const reads=await Promise.all(students.map(student=>call('match',{student,id})));
   assert(reads.every(x=>x.code===200&&x.body.match.roster.length===30));
   assert.equal(new Set(reads.map(x=>x.body.match.sha256)).size,1,'All 30 receive same official result');
   for(const x of reads){
    const m=x.body.match,replay=engine.battle(m.roster,{...m.options,seed:m.seed}).run(2300);
    assert.equal(replay.winner.id,m.result.winner.id);assert.equal(replay.time,m.result.time);
   }
   assert.equal(await digest(),grades,'Arenas cannot change approved work');
   console.log('PASS V6 API arena M'+mission+': 30 concurrent authenticated reads, 30 builds and matching results');
   if(mission===5)assert.equal(await digest(),before);
  }
  assert.equal((await db.query('SELECT count(*)::int AS n FROM pit_coliseum_matches')).rows[0].n,17);
  const times=observations.map(x=>x.ms).sort((a,b)=>a-b);
  console.log('PASS V6 30 clients: '+JSON.stringify({requests:observations.length,maxMs:times.at(-1),
   p95Ms:times[Math.floor(times.length*.95)],duels:15,arenas:2,failures:observations.filter(x=>x.status>=400)}));
 }finally{await db.end()}
})().catch(e=>{console.error(e);process.exitCode=1});

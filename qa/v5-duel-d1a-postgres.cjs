'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {Pool}=require('pg');
const {createDuelHandler}=require('../chat-api/lib/v5-duel-d1a-handler.js');
const {createDuelService}=require('../chat-api/lib/v5-duel-d1a-service.js');
const ids=[
 '11111111-1111-4111-8111-111111111111',
 '22222222-2222-4222-8222-222222222222',
 '33333333-3333-4333-8333-333333333333',
 '44444444-4444-4444-8444-444444444444'
];
const tokens=['a','b','c','d'].map(k=>k.repeat(64));
const pool=new Pool({host:'127.0.0.1',port:5432,user:'postgres',
 password:'ci_only_password',database:'pit_v5_duel_test',max:12});
const handler=createDuelHandler({pool,enabled:true});
const off=createDuelHandler({enabled:false});
async function call(h,actor,method,action,body=null,origin='http://127.0.0.1:8899'){
 const req={method,query:{action},headers:{
  origin,'content-type':'application/json','x-pit-student-token':tokens[actor]
 },body};
 const res={statusCode:200,headers:{},
  setHeader(k,v){this.headers[k]=v;return this},
  status(n){this.statusCode=n;return this},
  json(o){this.payload=o;return this}};
 await h(req,res);
 return {status:res.statusCode,body:res.payload,headers:res.headers};
}
const get=i=>call(handler,i,'GET','state');
const post=(i,action,body)=>call(handler,i,'POST',action,body);
const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.body));return r.body.result};
const errors=[];
(async()=>{
 for(let i=0;i<ids.length;i++){
  await pool.query('INSERT INTO pit_students(id,room_code,token_hash,display_name) '+
   'VALUES ($1,$2,$3,$4)',[
    ids[i],i===3?'OTHERROOM':'PITGAME26',
    createHash('sha256').update(tokens[i]).digest('hex'),
    ['Aluna A','Aluno B','Aluno C','Outra turma'][i]
   ]);
 }
 for(const i of [0,1,2]){
  for(let stage=1;stage<3;stage++){
   await pool.query('INSERT INTO pit_student_stages(student_id,stage,status) VALUES($1,$2,$3)',
    [ids[i],stage,'approved']);
  }
  await pool.query('INSERT INTO pit_student_stages(student_id,stage,status) VALUES($1,3,$2)',
   [ids[i],i===0?'submitted':i===1?'approved':'working']);
 }
 // Default off. The teacher must enable duels explicitly.
 let state=ok(await get(0));
 assert.equal(state.enabled,false);
 assert.equal(state.peers.length,0);
 assert.equal((await post(0,'available',{available:true})).status,403);
 await pool.query('INSERT INTO pit_duel_room_settings(room_code,enabled) VALUES($1,true)',
  ['PITGAME26']);
 assert.equal((await post(2,'available',{available:true})).status,403,'Working mission cannot duel');
 ok(await post(0,'available',{available:true}));
 ok(await post(1,'available',{available:true}));
 state=ok(await get(0));
 assert.equal(state.available,true);assert.equal(state.peers.length,1);
 assert.equal(state.peers[0].name,'Aluno B');
 assert.equal((await post(0,'invite',{targetId:ids[2]})).status,409,
  'Working peer must be rejected');
 assert.equal((await post(0,'invite',{targetId:ids[3]})).status,404,
  'Cannot challenge across rooms');
 assert.equal((await get(3)).status,401,'Other classroom cannot access this room');
 assert.equal((await post(0,'invite',{targetId:ids[0]})).status,400,
  'No self invites');
 let invite=ok(await post(0,'invite',{targetId:ids[1]}));
 assert.equal(invite.status,'pending');
 assert.equal((await post(0,'invite',{targetId:ids[1]})).status,409,
  'One pending invitation per person');
 let inbox=ok(await get(1));
 assert.equal(inbox.available,false);
 assert.equal(inbox.busy,true);
 assert.equal(inbox.invites[0].peerName,'Aluna A');
 assert.equal(inbox.invites[0].outgoing,false);
 assert.equal((await post(0,'accept',{inviteId:invite.id})).status,403,
  'Only invitee may accept');
 assert.equal((await post(2,'decline',{inviteId:invite.id})).status,403,
  'Third party may not decline');
 assert.equal(ok(await post(1,'decline',{inviteId:invite.id})).status,'declined');
 assert.equal((ok(await get(0))).invites[0].status,'declined');
 assert.equal((await pool.query('SELECT * FROM pit_duel_slots')).rowCount,0);

 invite=ok(await post(0,'invite',{targetId:ids[1]}));
 const accepted=ok(await post(1,'accept',{inviteId:invite.id}));
 assert.equal(accepted.status,'accepted');
 assert(accepted.matchSeed>0);
 const sender=ok(await get(0));
 assert.equal(sender.invites[0].status,'accepted');
 assert.equal(sender.invites[0].matchSeed,accepted.matchSeed);
 assert.equal((await post(1,'accept',{inviteId:invite.id})).status,409,
  'Double acceptance not allowed');
 assert.equal((await post(0,'invite',{targetId:ids[1]})).status,409);
 assert.equal((await pool.query('SELECT * FROM pit_duel_slots')).rowCount,2);
 assert.equal(ok(await post(0,'cancel',{inviteId:invite.id})).status,'cancelled');
 assert.equal((await pool.query('SELECT * FROM pit_duel_slots')).rowCount,0);

 invite=ok(await post(0,'invite',{targetId:ids[1]}));
 await pool.query("UPDATE pit_duel_invites SET expires_at=NOW()-INTERVAL '2 seconds' WHERE id=$1",[invite.id]);
 assert.equal((ok(await get(1))).invites[0].status,'expired');
 assert.equal((await pool.query('SELECT * FROM pit_duel_slots')).rowCount,0);
 assert.equal((await post(1,'accept',{inviteId:invite.id})).status,409);

 invite=ok(await post(0,'invite',{targetId:ids[1]}));
 ok(await post(1,'available',{available:false}));
 assert.equal((ok(await get(0))).invites[0].status,'cancelled');
 assert.equal((await pool.query('SELECT * FROM pit_duel_slots')).rowCount,0);
 assert.equal((ok(await get(0))).peers.length,0);
 ok(await post(1,'available',{available:true}));

 // Simultaneous opposite-direction challenge attempts must not pair twice.
 const races=await Promise.all([
  post(0,'invite',{targetId:ids[1]}),
  post(1,'invite',{targetId:ids[0]})
 ]);
 assert.deepEqual(races.map(r=>r.status).sort(),[200,409],
  'Exactly one challenge can claim both unique slots');
 const chosen=races.find(r=>r.status===200).body.result;
 const chosenRow=await pool.query('SELECT challenger_id FROM pit_duel_invites WHERE id=$1',[chosen.id]);
 const challengerIdx=chosenRow.rows[0].challenger_id===ids[0]?0:1;
 assert.equal(ok(await post(challengerIdx,'cancel',{inviteId:chosen.id})).status,'cancelled');
 assert.equal((await pool.query('SELECT * FROM pit_duel_slots')).rowCount,0);

 // Presence freshness and teacher permission are authoritative.
 await pool.query("UPDATE pit_duel_presence SET last_seen_at=NOW()-INTERVAL '90 seconds' WHERE student_id=$1",[ids[1]]);
 assert.equal((await post(0,'invite',{targetId:ids[1]})).status,409);
 ok(await post(1,'available',{available:true}));
 await pool.query("UPDATE pit_duel_room_settings SET enabled=false WHERE room_code='PITGAME26'");
 assert.equal((await post(0,'invite',{targetId:ids[1]})).status,403);
 const noDuel=ok(await get(0));
 assert.equal(noDuel.enabled,false);assert.equal(noDuel.peers.length,0);

 const teacherTables=await pool.query(
  "SELECT COUNT(*)::int AS n FROM information_schema.tables "+
  "WHERE table_name IN ('pit_peer_reviews','pit_hero_builds')");
 assert.equal(teacherTables.rows[0].n,0,'No XP/grades tables created by duel integration');

 // Security: arbitrary origin, malformed bodies, missing token and extra keys.
 assert.equal((await call(handler,0,'POST','invite',{targetId:ids[1]},'https://evil.example')).status,403);
 assert.equal((await post(0,'available',{available:true,teacherEnabled:true})).status,400);
 assert.equal((await call(off,0,'GET','state')).status,503);
 const noToken=await call(handler,0,'GET','state');
 // A nonexistent token must be invalid (no hidden teacher PIN fallback).
 const blankHeaders={method:'GET',query:{action:'state'},headers:{origin:'http://127.0.0.1:8899'}};
 const res={statusCode:200,setHeader(){return this},status(n){this.statusCode=n;return this},
  json(obj){this.body=obj;return this}};
 await handler(blankHeaders,res);assert.equal(res.statusCode,401);
 assert.equal(noToken.status,200);

 console.log('PASS D1a: real PostgreSQL classroom eligibility, opt-in, peer discovery, invitation, accept/decline/cancel, expiration, offline, 2-way race, authority, privacy; no XP/grades.');
})().catch(e=>{errors.push(String(e.stack||e));console.error(e);process.exitCode=1}).finally(()=>pool.end());

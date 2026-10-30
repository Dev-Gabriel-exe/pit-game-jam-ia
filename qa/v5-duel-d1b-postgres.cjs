'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {Pool}=require('pg');
const {createDuelHandler}=require('../chat-api/lib/v5-duel-d1a-handler.js');
const {createMatchHandler}=require('../chat-api/lib/v5-duel-d1b-handler.js');
const {createReplay}=require('../chat-api/lib/v5-duel-d1b-replay.js');
const core=require('../chat-api/lib/v5-build-v2-contract.js');
const raw=require('../v5/phase2-combat.js');
const pinned=require('../chat-api/lib/v5-duel-phase2-engine.js');
assert.deepEqual(Object.keys(pinned.TALENTS),Object.keys(raw.TALENTS));
for(const klass of core.CLASSES)
 assert.deepEqual(pinned.TALENTS[klass],raw.TALENTS[klass],'Approved combat catalog drift: '+klass);
const ids=[
 '11111111-1111-4111-8111-111111111111',
 '22222222-2222-4222-8222-222222222222',
 '33333333-3333-4333-8333-333333333333'
],tokens=['a','b','c'].map(x=>x.repeat(64));
const db=new Pool({
 host:'127.0.0.1',port:5432,user:'postgres',password:'ci_only_password',
 database:'pit_v5_d1b_test',max:15
});
const duel=createDuelHandler({pool:db,enabled:true});
const match=createMatchHandler({pool:db,enabled:true});
function build(klass,approved){
 const attrs={FOR:0,DES:0,INT:0,VIT:0,DEF:0};
 const target={warrior:'FOR',mage:'INT',hunter:'DES',guardian:'DEF'}[klass];
 attrs[target]=2*approved;
 return {klass,attributes:attrs,talents:pinned.TALENTS[klass].slice(0,approved).map(t=>t.id)};
}
function req(actor,method,action,body={},extra={}){
 return {method,query:{action,...extra},body,
 headers:{origin:'http://127.0.0.1:8899','content-type':'application/json',
 'x-pit-student-token':tokens[actor]}};
}
async function call(handler,request){
 const res={statusCode:200,headers:{},setHeader(n,v){this.headers[n]=v;return this},
  status(n){this.statusCode=n;return this},json(payload){this.payload=payload;return this}};
 await handler(request,res);
 return {status:res.statusCode,payload:res.payload};
}
async function act(actor,action,body){
 const r=await call(duel,req(actor,'POST',action,body));
 assert.equal(r.status,200,JSON.stringify(r.payload));
 return r.payload.result;
}
async function matchStart(actor,id){
 return call(match,req(actor,'POST','start',{inviteId:id}));
}
async function matchRead(actor,id){
 return call(match,req(actor,'GET','replay',{}, {inviteId:id}));
}
async function setup(){
 await db.query("INSERT INTO pit_duel_room_settings(room_code,enabled) VALUES('PITGAME26',true)");
 for(let i=0;i<ids.length;i++){
  await db.query(
   'INSERT INTO pit_students(id,room_code,token_hash,display_name) VALUES($1,$2,$3,$4)',
   [ids[i],'PITGAME26',createHash('sha256').update(tokens[i]).digest('hex'),
    ['Aluna Guardiã','Aluno Mago','Colega Trabalhando'][i]]);
  for(let m=1;m<=2;m++)
   await db.query('INSERT INTO pit_student_stages(student_id,stage,status) VALUES($1,$2,$3)',
    [ids[i],m,'approved']);
  await db.query('INSERT INTO pit_student_stages(student_id,stage,status) VALUES($1,3,$2)',
   [ids[i],i===0?'submitted':i===1?'approved':'working']);
 }
 const entries=[build('guardian',2),build('mage',3),build('hunter',2)];
 for(let i=0;i<ids.length;i++){
  const b=entries[i];
  await db.query('INSERT INTO pit_hero_builds_v2 '+
   '(student_id,room_code,klass,attributes,talents) VALUES($1,$2,$3,$4::jsonb,$5::jsonb)',
   [ids[i],'PITGAME26',b.klass,JSON.stringify(b.attributes),JSON.stringify(b.talents)]);
 }
}
(async()=>{
 await setup();
 // Stable determinism: same V2 builds, seed and stage => identical replay checksum.
 const p=[
  {side:'left',name:'Guardião',approved:2,build:build('guardian',2)},
  {side:'right',name:'Arcanista',approved:3,build:build('mage',3)}
 ];
 const first=createReplay(p,{seed:45321,stage:3});
 const repeated=createReplay(p,{seed:45321,stage:3});
 assert.equal(first.sha256,repeated.sha256);
 assert.equal(first.payload.winnerSide,repeated.payload.winnerSide);
 assert(first.payload.frames.length>=10);
 assert(first.payload.events.some(e=>e.type==='end'));
 assert(first.payload.frames.every(f=>f.heroes.length===2));
 // Intermediate missions must preserve each student's actual 6–9 talent
 // budget despite the existing engine exposing only M5 and experimental M10.
 for(const n of [6,7,9,10]){
  const upper=createReplay([
   {side:'left',name:'Teste Caçador',approved:n,build:build('hunter',n)},
   {side:'right',name:'Teste Guerreiro',approved:n,build:build('warrior',n)}
  ],{seed:783+n,stage:n});
  assert.equal(upper.payload.engineMode,'upper-mission-sandbox');
  assert.equal(upper.payload.participants[0].approvedMissions,n);
  assert.equal(upper.payload.participants[1].talents.length,n);
  assert(upper.payload.frames.length>2);
  assert(['left','right'].includes(upper.payload.winnerSide));
 }

 assert(first.payload.participants.every(x=>!Object.hasOwn(x,'studentId')));
 // "submitted" player is eligible but has no fictional third talent.
 assert.equal(first.payload.participants[0].approvedMissions,2);
 await act(0,'available',{available:true});
 await act(1,'available',{available:true});
 const invitation=await act(0,'invite',{targetId:ids[1]});
 const pending=await matchRead(1,invitation.id);
 assert.equal(pending.status,409,'Pending invitation cannot reveal replay');
 await act(1,'accept',{inviteId:invitation.id});
 // A student outside this invitation cannot read its result.
 let third=await matchRead(2,invitation.id);
 assert.equal(third.status,403);
 // Concurrent requests are serialized on the invitation row.
 const both=await Promise.all([
  matchStart(0,invitation.id),matchStart(1,invitation.id)
 ]);
 assert.deepEqual(both.map(x=>x.status),[200,200]);
 const x=both[0].payload.match,y=both[1].payload.match;
 assert.equal(x.replaySha256,y.replaySha256);
 assert.equal(x.replaySha256,first.sha256===x.replaySha256?first.sha256:y.replaySha256);
 assert.deepEqual(x.replay,y.replay);
 assert.equal(x.replay.participants[0].approvedMissions,2);
 assert.equal(x.replay.participants[1].approvedMissions,3);
 assert(x.replay.frames.length>20);
 assert(!JSON.stringify(x).includes(ids[0]));
 assert(!JSON.stringify(x).includes(ids[1]));
 assert(!JSON.stringify(x).includes(tokens[0]));
 assert(x.progress>=0&&x.progress<=1);
 assert.equal((await db.query('SELECT * FROM pit_duel_matches')).rowCount,1);
 assert.equal((await db.query('SELECT * FROM pit_duel_slots')).rowCount,2);
 const again=await matchRead(0,invitation.id);
 assert.equal(again.status,200);
 assert.equal(again.payload.match.replaySha256,x.replaySha256);
 // Once the replay exists, clients cannot cancel to manipulate the outcome.
 const cancel=await call(duel,req(0,'POST','cancel',{inviteId:invitation.id}));
 assert.equal(cancel.status,409);
 // Availability off does not abort an ongoing immutable match.
 await act(1,'available',{available:false});
 const afterOffline=await matchRead(0,invitation.id);
 assert.equal(afterOffline.payload.match.replaySha256,x.replaySha256);
 assert.equal((await db.query('SELECT * FROM pit_duel_slots')).rowCount,2);
 // Force the disposable server clock past the finish deadline.
 await db.query(
  "UPDATE pit_duel_matches SET started_at=NOW()-INTERVAL '180 seconds',"+
  "ends_at=NOW()-INTERVAL '2 seconds' WHERE invite_id=$1",[invitation.id]);
 const finished=await matchRead(1,invitation.id);
 assert.equal(finished.status,200);
 assert.equal(finished.payload.match.status,'finished');
 assert.equal(finished.payload.match.winnerSide,x.replay.winnerSide);
 assert.equal(finished.payload.match.replaySha256,x.replaySha256);
 assert.equal((await db.query('SELECT * FROM pit_duel_slots')).rowCount,0);
 assert.equal((await db.query("SELECT status FROM pit_duel_invites WHERE id=$1",[invitation.id])).rows[0].status,'finished');
 const repeat=await matchStart(0,invitation.id);
 assert.equal(repeat.payload.match.status,'finished');
 assert.equal(repeat.payload.match.replaySha256,x.replaySha256);
 assert.equal((await db.query('SELECT * FROM pit_duel_matches')).rowCount,1);
 const noXP=await db.query(
  "SELECT count(*)::int AS count FROM information_schema.tables "+
  "WHERE table_name IN ('pit_peer_reviews','pit_grades','pit_xp_logs')");
 assert.equal(noXP.rows[0].count,0,'Duel never touches grades or XP');
 console.log('PASS D1b: one Phase2 replay for two browsers, immutable checksum, serial starts, different approval budgets, server clock, finished slots, reconnect, unauthorized peers, no grades.');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1}).finally(()=>db.end());

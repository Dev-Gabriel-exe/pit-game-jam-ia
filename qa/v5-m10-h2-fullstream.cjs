'use strict';
// M10/H2 complete fictional 30-entrant stream; no network, auth, database or real pupils.
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const T=require('../v5/teacher-arena-release-lab.js');
const D=require('../v5/camera-director.js');
const F=require('../v5/shared-arena-feed-h2-lab.js');
const policy=H.createPolicy(P.TALENTS);
const actor='trial-teacher';
const roster=T.createRoster(P,{mission:10,count:30,roomKey:'trial-room-final-stream'});
assert.equal(roster.length,30);
assert.equal(new Set(roster.map(x=>x.klass)).size,4);
assert.equal(Object.values(P.TALENTS).reduce((sum,a)=>sum+a.length,0),120);
for(const p of roster){
 assert.equal(p.completedMissions.length,10);
 assert.equal(p.build.talents.length,10);
 assert.equal(new Set(p.build.talents).size,10);
 assert.equal(Object.values(p.build.attributes).reduce((a,b)=>a+b,0),20);
 assert.deepEqual(p.build.talents.slice(0,5),p.m5Frozen.talents);
 for(const key of P.ATTR)assert(p.build.attributes[key]>=p.m5Frozen.attributes[key]);
 assert.equal(p.m10Locked,true);
}
let state=T.createState({mission:10,roomKey:'trial-room-final-stream',participants:roster});
assert.equal(T.eligible(state,policy).filter(x=>x.eligible).length,30);
state=T.alter(state,{actor,expectedRevision:state.revision,enabled:true});
state=T.release(state,{actor,expectedRevision:state.revision,policy,seed:20261031});
assert.equal(state.release.entrants.length,30);
state=T.start(state,{actor,expectedRevision:state.revision});
let battleCalls=0;
const countedEngine={...P,battle(...args){battleCalls++;return P.battle(...args)}};
const create=()=>F.createPublisher({releaseState:state,engine:countedEngine,director:D,
 matchId:'trial-match-final-stream',historyLimit:8});
const publisher=create();
assert.equal(battleCalls,1,'one engine instance for the whole match');
const teacher=F.createReceiver(publisher.scope);
const student=F.createReceiver(publisher.scope);
const spectator=F.createReceiver(publisher.scope);
for(const receiver of [teacher,student,spectator])receiver.accept(publisher.snapshot);
assert.equal(publisher.snapshot.fighters.length,30);
let frames=0,catchup=false,reset=false,highestCameraRevision=0;
const cameraModes=new Set();
let previousTime=0;
while(!publisher.finished&&frames<1400){
 const f=publisher.tick({steps:4});frames++;
 assert.equal(f.seq,frames);
 assert.equal(f.fighters.length,30);
 assert(f.logicalTime>=previousTime,'logical clock must not reverse');
 previousTime=f.logicalTime;
 highestCameraRevision=Math.max(highestCameraRevision,f.camera.revision);
 if(f.camera.mode)cameraModes.add(f.camera.mode);
 assert.equal(new Set(f.fighters.map(x=>x.id)).size,30);
 assert.equal(f.fighters.filter(x=>x.alive).length>=1,true);
 assert(!/studentId|approvedBaseXp|password|token|talents|attributes|teacherPin/.test(JSON.stringify(f)),
  'shared frames must not leak builds, progress or credentials');
 teacher.accept(f);student.accept(f);
 if(frames===3)spectator.disconnect();
 if(frames===7){
  assert.equal(spectator.reconnect(),2);
  const backlog=publisher.since(spectator.cursor);
  assert.equal(backlog.resetRequired,false);
  assert.equal(backlog.frames.length,5);
  for(const packet of backlog.frames)spectator.accept(packet);
  assert.deepEqual(spectator.snapshot,f);
  catchup=true;
 }
 if(frames===12)spectator.disconnect();
 if(frames===25){
  assert.equal(spectator.reconnect(),12);
  const backlog=publisher.since(spectator.cursor);
  assert.equal(backlog.resetRequired,true,'evicted frames require a full snapshot');
  assert.equal(backlog.frames.length,0);
  spectator.restore(backlog.snapshot);
  assert.deepEqual(spectator.snapshot,f);
  reset=true;
 }
 if((frames<3)||(frames>=7&&frames<12)||(frames>=25))spectator.accept(f.seq===spectator.cursor?spectator.snapshot:f);
}
assert(publisher.finished,'30-entrant M10 must terminate');
assert(frames>=25,'both reconnection scenarios must run');
assert(catchup&&reset);
assert.equal(battleCalls,1,'no receiver may create a second engine');
assert.equal(publisher.snapshot.status,'finished');
assert(publisher.snapshot.winner);
assert.equal(publisher.result.winner.id,publisher.snapshot.winner);
assert.equal(publisher.result.standings.length,30);
assert(publisher.result.events.some(x=>x.type==='talent'));
assert(highestCameraRevision>0,'camera director must advance');
assert(cameraModes.size>0,'camera feed must be populated');
assert.equal(teacher.cursor,student.cursor);
assert.equal(student.cursor,spectator.cursor);
assert.deepEqual(teacher.snapshot,student.snapshot);
assert.deepEqual(student.snapshot,spectator.snapshot);
assert(Object.isFrozen(teacher.snapshot));
assert.equal(publisher.tick(),publisher.snapshot,'finished match must not advance');
assert.equal(publisher.historySize<=8,true);
assert.throws(()=>spectator.accept({...publisher.snapshot,seq:publisher.snapshot.seq+1}),/partida já encerrada/);
const replica=create();
let replayFrames=0;
while(!replica.finished&&replayFrames<1400){replica.tick({steps:4});replayFrames++}
assert(replica.finished);
assert.equal(battleCalls,2,'exactly one engine per replay');
assert.equal(replayFrames,frames);
assert.deepEqual(replica.snapshot,publisher.snapshot,'same seed and stepping => same camera and winner');
assert.deepEqual(replica.result,publisher.result,'same seed and stepping => identical combat events');
console.log('PASS M10 H2 30-player full stream: '+frames+' frames, 3 read-only viewers, bounded catch-up and reset, 10 talents/20 points, 4 KayKit classes/120 catalog talents, deterministic replay; camera modes='+[...cameraModes].join(','));

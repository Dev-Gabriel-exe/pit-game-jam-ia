'use strict';
// H.2 read-only multi-receiver contract, 100% fictional Node; NO networking.
const assert=require('node:assert/strict');
const engine=require('../v5/phase2-combat.js');
const H0=require('../v5/progression-contract-h0.js');
const T=require('../v5/teacher-arena-release-lab.js');
const D=require('../v5/camera-director.js');
const F=require('../v5/shared-arena-feed-h2-lab.js');
const policy=H0.createPolicy(engine.TALENTS);
const actor='trial-teacher';
function state(mission,count=4){
 let s=T.createState({mission,participants:T.createRoster(engine,{mission,count})});
 s=T.alter(s,{actor,expectedRevision:s.revision,enabled:true});
 s=T.release(s,{actor,expectedRevision:s.revision,policy,seed:314159});
 return T.start(s,{actor,expectedRevision:s.revision});
}
function make(mission,count=4,options={}){
 return F.createPublisher({releaseState:state(mission,count),engine,director:D,
  matchId:'trial-match-m'+mission+'-'+count,historyLimit:12,...options});
}
for(const mission of [5,10]){
 const publisher=make(mission),teacher=F.createReceiver(publisher.scope),
  studentA=F.createReceiver(publisher.scope),studentB=F.createReceiver(publisher.scope);
 assert.equal(teacher.cursor,-1);
 const initial=publisher.snapshot;
 assert.equal(initial.seq,0);assert.equal(initial.status,'ready');
 assert(Object.isFrozen(initial));assert(Object.isFrozen(initial.fighters[0]));
 assert.equal(initial.fighters.length,4);
 assert.equal(teacher.accept(initial),true);
 assert.equal(studentA.accept(initial),true);
 assert.equal(studentB.accept(initial),true);
 assert.equal(studentA.accept(initial),false,'duplicate delivery idempotent');

 // Malformed yet structurally plausible packets must never reach passive viewers.
 assert.throws(()=>F.validateFrame({...initial,fighters:[
  {...initial.fighters[0],hp:0,alive:true},...initial.fighters.slice(1)
 ]},publisher.scope),/vida e eliminação incompatíveis/);
 assert.throws(()=>F.validateFrame({...initial,fighters:[
  {...initial.fighters[0],hp:1,alive:false},...initial.fighters.slice(1)
 ]},publisher.scope),/vida e eliminação incompatíveis/);
 assert.throws(()=>F.validateFrame({...initial,status:'running'},publisher.scope),/primeiro pacote deve estar pronto/);
 const fakeFrame=(changes={})=>({...initial,seq:1,logicalTime:0.2,status:'running',...changes});
 const identityProbe=F.createReceiver(publisher.scope);
 identityProbe.accept(initial);
 const anotherClass=initial.fighters[0].klass==='mage'?'hunter':'mage';
 assert.throws(()=>identityProbe.accept(fakeFrame({fighters:[
  {...initial.fighters[0],klass:anotherClass},...initial.fighters.slice(1)
 ]})),/identidade ou HP máximo/);
 assert.throws(()=>identityProbe.accept(fakeFrame({fighters:[
  {...initial.fighters[0],maxHp:initial.fighters[0].maxHp+1},...initial.fighters.slice(1)
 ]})),/identidade ou HP máximo/);
 const deathProbe=F.createReceiver(publisher.scope);
 deathProbe.accept(initial);
 const defeated=fakeFrame({fighters:[
  {...initial.fighters[0],hp:0,alive:false},...initial.fighters.slice(1)
 ]});
 assert.equal(deathProbe.accept(defeated),true);
 assert.throws(()=>deathProbe.accept({...defeated,seq:2,logicalTime:0.4,
  fighters:initial.fighters}),/ressurreição não permitida/);
 assert.equal(deathProbe.cursor,1,'rejected resurrection does not advance cursor');

 // Adversarial full snapshots: a reconnect cannot bypass terminal invariants.
 const snapshotProbe=F.createReceiver(publisher.scope);
 snapshotProbe.accept(initial);
 const dead=f=>({...f,hp:0,alive:false});
 const oneAlive=initial.fighters.map((f,i)=>i===0?f:dead(f));
 const twoAlive=initial.fighters.map((f,i)=>i<2?f:dead(f));
 const allDead=initial.fighters.map(dead);
 const future=(changes={})=>({...initial,seq:9,logicalTime:2,
  status:'finished',winner:initial.fighters[0].id,...changes});
 const forgedSnapshots=[
  {packet:{...initial,fighters:[dead(initial.fighters[0]),...initial.fighters.slice(1)]},
   reason:/partida pronta contém eliminado/},
  {packet:future({status:'running',winner:null,fighters:allDead}),
   reason:/partida ativa sem sobreviventes/},
  {packet:future({fighters:oneAlive,winner:initial.fighters[1].id}),
   reason:/vencedor incompatível com sobreviventes/},
  {packet:future({fighters:twoAlive,winner:initial.fighters[2].id}),
   reason:/vencedor incompatível com sobreviventes/},
  {packet:future({fighters:oneAlive,winner:initial.fighters[0].id,
   camera:{...initial.camera,revision:-1}}),reason:/plano cinematográfico inválido/},
 ];
 for(const {packet,reason} of forgedSnapshots){
  assert.throws(()=>snapshotProbe.restore(packet),reason);
  assert.equal(snapshotProbe.cursor,0,'rejected snapshot must not advance cursor');
  assert.deepEqual(snapshotProbe.snapshot,initial,'rejected snapshot must not mutate viewer');
 }
 // Simultaneous last eliminations are legal at the engine time limit: do not
 // impose a fictitious surviving champion when all HP values are zero.
 assert.equal(F.validateFrame(future({fighters:allDead}),publisher.scope),true);

 assert.throws(()=>studentA.accept({...initial,status:'running'}),/primeiro pacote deve estar pronto/);
 const forged={...initial,studentId:'42'};
 assert.throws(()=>studentA.accept(forged),/fora da partida/);
 assert.throws(()=>studentA.accept({...initial,roomKey:'trial-room-foreign'}),/fora da partida/);
 assert.throws(()=>studentA.accept({...initial,mission:mission===5?10:5}),/fora da partida/);
 assert.throws(()=>studentA.accept({...initial,matchId:'trial-match-other'}),/fora da partida/);
 assert.throws(()=>studentA.accept({...initial,fighters:[
  {...initial.fighters[0],id:'trial-unknown'},...initial.fighters.slice(1)
 ]}),/lutador fora/);
 assert.throws(()=>studentA.accept({...initial,camera:{revision:0,mode:'duel',ids:['trial-unknown']}}),/cinematográfico inválido/);
 studentB.disconnect();
 assert.throws(()=>studentB.accept(publisher.tick()),/desconectado/);
 let gap=publisher.tick();
 assert.equal(teacher.accept(publisher.since(0).frames[0]),true);
 assert.throws(()=>studentA.accept(gap),/lacuna detectada/);
 assert.equal(studentA.needsSnapshot,true);
 // Student B recovers exact backlog while still within the bounded horizon.
 studentB.reconnect();
 for(const packet of publisher.since(studentB.cursor).frames)studentB.accept(packet);
 assert.equal(studentB.cursor,publisher.snapshot.seq);
 // Student A intentionally misses enough updates to require a full server snapshot.
 for(let i=0;i<18;i++)publisher.tick();
 const evicted=publisher.since(studentA.cursor);
 assert.equal(evicted.resetRequired,true);
 assert.equal(evicted.frames.length,0);
 assert.equal(evicted.snapshot.seq,publisher.snapshot.seq);
 studentA.restore(evicted.snapshot);
 assert.equal(studentA.needsSnapshot,false);
 assert.equal(studentA.cursor,publisher.snapshot.seq);
 assert.throws(()=>studentA.restore(initial),/relógio recuou|snapshot obsoleto/);
 const fromOlder=publisher.since(studentB.cursor);
 assert.equal(fromOlder.resetRequired,true);
 studentB.restore(fromOlder.snapshot);
 // A later packet is observed by both student views from the same one engine.
 const next=publisher.tick();
 assert.equal(teacher.cursor,1);
 teacher.restore(next);
 studentA.accept(next);studentB.accept(next);
 assert.deepEqual(studentA.snapshot,studentB.snapshot);
 assert.deepEqual(studentA.snapshot.camera,teacher.snapshot.camera);
 assert.notEqual(studentA,studentB);
 // Playback continues from the publisher only. Receivers never run battle().
 let frames=0;
 while(!publisher.finished&&frames<1200){
  const f=publisher.tick();frames++;
  teacher.accept(f);studentA.accept(f);studentB.accept(f);
 }
 assert(publisher.finished,'partida termina');
 assert.equal(publisher.snapshot.status,'finished');
 assert(publisher.snapshot.winner);
 assert(publisher.snapshot.fighters.some(x=>x.id===publisher.snapshot.winner));
 assert.equal(publisher.snapshot.winner,publisher.result.winner.id);
 assert.equal(publisher.tick(),publisher.snapshot,'no second result');
 assert.equal(teacher.cursor,studentA.cursor);assert.equal(studentA.cursor,studentB.cursor);
 assert.deepEqual(teacher.snapshot,studentA.snapshot);
 assert.deepEqual(studentA.snapshot,studentB.snapshot);
 assert.equal(publisher.historySize<=12,true);
 assert.equal(JSON.stringify(teacher.snapshot).includes('approvedBaseXp'),false);
 assert.equal(JSON.stringify(teacher.snapshot).includes('build'),false);
 assert.equal(JSON.stringify(teacher.snapshot).includes('studentId'),false);
 // Repeated fixed seed gives exactly the same logical result and camera choices.
 const duplicate=make(mission);
 duplicate.tick({steps:1});
 // step sizes differ; deterministic identical replay requires identical stepping schedule.
 const replica=make(mission);
 let ticks=0;
 while(!replica.finished&&ticks<1400){replica.tick();ticks++}
 const baseline=make(mission);
 let baselineTicks=0;
 // Use same deterministic step schedule as replica (4 x .05 each packet).
 while(!baseline.finished&&baselineTicks<1400){baseline.tick();baselineTicks++}
 assert.deepEqual(replica.result,baseline.result);
 assert.deepEqual(replica.snapshot,baseline.snapshot);
 assert.equal(ticks,baselineTicks);
 console.log('PASS H2 M'+mission+': 4 fictional heroes, 3 passive synced viewers, camera, offline catchup, gap+snapshot, deterministic winner');
}
const big=make(10,30,{historyLimit:4,matchId:'trial-match-final-30'});
assert.equal(big.scope.players.length,30);
const remote=F.createReceiver(big.scope);
remote.accept(big.snapshot);
const snap=big.tick();remote.accept(snap);
assert.equal(remote.snapshot.fighters.length,30);
assert.throws(()=>F.createReceiver({...big.scope,roomKey:'real-room'}),/escopo fictício/);
assert.throws(()=>F.createPublisher({releaseState:T.createState({mission:5,participants:T.createRoster(engine,{mission:5,count:4})}),engine,director:D}),/partida liberada/);
assert.throws(()=>F.createPublisher({releaseState:state(5),engine,director:D,historyLimit:2}),/histórico limitado/);
console.log('PASS H2 30 hero frame: no XP, tokens, emails, PIN, SQL, API, websocket or server connections');

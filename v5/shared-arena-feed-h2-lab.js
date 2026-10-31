/* PIT Game Jam IA V5 — H.2 proposal: ONE simulated authority, many READ-ONLY viewers.
 * Contract-only lab: no network, login, token, classroom, database, XP or writes.
 * Caller supplies a verified teacher release IN A FUTURE SERVER; a browser fake
 * teacher is not authorization. Not production transport, not a signed feed.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_SHARED_FEED_H2_LAB=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const VERSION='pit-v5-h2-shared-feed-lab-1';
 const ALIAS=/^trial-[a-z0-9_-]{1,60}$/;
 const ROOM=/^trial-room-[a-z0-9_-]{1,50}$/;
 const MATCH=/^trial-match-[a-z0-9_-]{1,50}$/;
 const FIELDS=['schema','matchId','roomKey','mission','seq','logicalTime','status','fighters','camera','winner'];
 const MODES=new Set(['overview','duel','highlight','climax','victory']);
 const STATUSES=new Set(['ready','running','finished']);
 function reject(message){throw Error('H2-FEED-LAB: '+message)}
 function integer(n,min,max){return Number.isSafeInteger(n)&&n>=min&&n<=max}
 function finite(n){return typeof n==='number'&&Number.isFinite(n)}
 function freeze(value){
  if(Array.isArray(value))return Object.freeze(value.map(freeze));
  if(value&&typeof value==='object')return Object.freeze(Object.fromEntries(Object.entries(value).map(([k,v])=>[k,freeze(v)])));
  return value;
 }
 function exact(obj,keys){
  return !!obj&&typeof obj==='object'&&!Array.isArray(obj)&&
   Object.keys(obj).length===keys.length&&Object.keys(obj).every(x=>keys.includes(x));
 }
 function validateScope(scope){
  if(!scope||!MATCH.test(scope.matchId||'')||!ROOM.test(scope.roomKey||'')||
   ![5,10].includes(scope.mission)||!Array.isArray(scope.players)||
   !integer(scope.players.length,2,30)||scope.players.some(k=>!ALIAS.test(k))||
   new Set(scope.players).size!==scope.players.length)reject('escopo fictício inválido');
  return freeze({matchId:scope.matchId,roomKey:scope.roomKey,mission:scope.mission,players:[...scope.players]});
 }
 function validateFrame(frame,scope){
  if(!exact(frame,FIELDS)||frame.schema!==VERSION||
   frame.matchId!==scope.matchId||frame.roomKey!==scope.roomKey||frame.mission!==scope.mission)
   reject('pacote fora da partida, turma ou versão');
  if(!integer(frame.seq,0,Number.MAX_SAFE_INTEGER)||!finite(frame.logicalTime)||frame.logicalTime<0||
   !STATUSES.has(frame.status)||!Array.isArray(frame.fighters)||
   frame.fighters.length!==scope.players.length)reject('sequência, tempo ou plantel inválidos');
  const players=new Set(scope.players),observed=new Set();
  for(const f of frame.fighters){
   if(!exact(f,['id','klass','hp','maxHp','x','z','alive'])||!players.has(f.id)||
    observed.has(f.id)||!['warrior','mage','hunter','guardian'].includes(f.klass)||
    !finite(f.hp)||!finite(f.maxHp)||f.maxHp<=0||f.hp<0||f.hp>f.maxHp+0.0001||
    !finite(f.x)||!finite(f.z)||typeof f.alive!=='boolean')reject('lutador fora do contrato');
   if(f.alive!==(f.hp>0))reject('vida e eliminação incompatíveis');
   observed.add(f.id);
  }
  if(!exact(frame.camera,['revision','mode','ids'])||
   !integer(frame.camera.revision,0,Number.MAX_SAFE_INTEGER)||
   !(frame.camera.mode===null||MODES.has(frame.camera.mode))||
   !Array.isArray(frame.camera.ids)||frame.camera.ids.length>2||
   frame.camera.ids.some(id=>!players.has(id))||
   new Set(frame.camera.ids).size!==frame.camera.ids.length)reject('plano cinematográfico inválido');
  if(frame.winner!==null&&(!ALIAS.test(frame.winner)||!players.has(frame.winner)))reject('vencedor fora da partida');
  if((frame.status==='finished')!== (frame.winner!==null))reject('resultado incompatível com estado');
  if(frame.status==='ready'&&(frame.seq!==0||frame.logicalTime!==0))reject('início não canônico');
  if(frame.seq===0&&frame.status!=='ready')reject('primeiro pacote deve estar pronto');
  // Final snapshots may be restored after a gap: validate what is provable
  // without replaying combat. A time-limit can leave multiple survivors;
  // simultaneous elimination can leave none. Never invent a lone winner.
  const survivors=frame.fighters.filter(f=>f.alive);
  if(frame.status==='ready'&&survivors.length!==frame.fighters.length)
   reject('partida pronta contém eliminado');
  if(frame.status==='running'&&survivors.length===0)
   reject('partida ativa sem sobreviventes');
  if(frame.status==='finished'&&survivors.length>0&&
   (survivors.length===1?survivors[0].id!==frame.winner:
    !survivors.some(f=>f.id===frame.winner)))
   reject('vencedor incompatível com sobreviventes');
  return true;
 }
 function createPublisher({releaseState,engine,director,matchId='trial-match-classroom',historyLimit=32,
   options={}}={}){
  if(!releaseState||releaseState.schema!=='pit-v5-fictional-teacher-arena-1'||
   releaseState.status!=='running'||releaseState.teacherEnabled!==true||
   !releaseState.release||!releaseState.release.entrants||
   !engine||typeof engine.battle!=='function'||typeof engine.canonical!=='function'||
   !director||typeof director.createDirector!=='function')reject('partida liberada e motor canônico obrigatórios');
  if(!integer(historyLimit,4,256))reject('histórico limitado a 4–256 pacotes');
  const release=releaseState.release;
  const scope=validateScope({matchId,roomKey:release.roomKey,mission:release.mission,
   players:release.entrants.map(x=>x.id)});
  if(scope.mission!==releaseState.mission||scope.roomKey!==releaseState.roomKey||
   !integer(release.seed,0,0xffffffff))reject('liberação divergente');
  const entries=release.entrants.map(e=>{
   if(!ALIAS.test(e.id||'')||e.approvedMissions!==scope.mission||
    (scope.mission===10)!==(e.finalTrial===true))reject('build não aprovada para a missão');
   return {id:e.id,name:e.id,approvedMissions:e.approvedMissions,
    finalTrial:e.finalTrial,build:engine.canonical(e.build,scope.mission,
     {experimentalFinal:scope.mission===10})};
  });
  // Exactly one engine instance per session. Viewers never create one.
  const simulation=engine.battle(entries,{seed:release.seed,arenaMission:scope.mission,
   arenaScale:5,damageScale:.5,stormDelay:35,stormRateFactor:.65,
   engagementMode:'spaced',navigationMode:'steer',rangedCommitment:'recovery',
   balancePreset:'e-hp2',...options,seed:release.seed,arenaMission:scope.mission});
  const cameraDirector=director.createDirector();cameraDirector.start();
  let seq=-1,done=false;const history=[];
  function emit(status){
   const plan=cameraDirector.tick(simulation.time,simulation.fighters);
   const frame=freeze({schema:VERSION,matchId:scope.matchId,roomKey:scope.roomKey,
    mission:scope.mission,seq:++seq,logicalTime:+simulation.time.toFixed(2),
    status,fighters:simulation.fighters.map(f=>({
     id:f.id,klass:f.build.klass,hp:+Math.max(0,f.hp).toFixed(4),
     maxHp:+f.stats.hp.toFixed(4),x:+f.x.toFixed(4),z:+f.z.toFixed(4),alive:f.alive
    })),
    camera:{revision:plan?.revision||0,mode:plan?.mode||null,ids:plan?.ids||[]},
    winner:status==='finished'?simulation.winner?.id||null:null});
   validateFrame(frame,scope);
   history.push(frame);if(history.length>historyLimit)history.shift();
   return frame;
  }
  let latest=emit('ready');
  function tick({steps=4}={}){
   if(done)return latest;
   if(!integer(steps,1,20))reject('avanço limitado a 1–20 ticks');
   for(let i=0;i<steps&&!simulation.finished;i++){
    const result=simulation.update(.05);
    for(const event of result.events||[])cameraDirector.observe(event,simulation.fighters);
   }
   done=simulation.finished;
   latest=emit(done?'finished':'running');
   return latest;
  }
  function since(cursor,{limit=32}={}){
   if(!integer(cursor,-1,Number.MAX_SAFE_INTEGER)||!integer(limit,1,256))
    reject('cursor de reconexão inválido');
   if(cursor>latest.seq)reject('cursor à frente do emissor');
   const first=history[0].seq;
   if(cursor<first-1)return freeze({resetRequired:true,frames:[],snapshot:latest,
    latestSeq:latest.seq});
   return freeze({resetRequired:false,frames:history.filter(f=>f.seq>cursor).slice(0,limit),
    snapshot:null,latestSeq:latest.seq});
  }
  return Object.freeze({scope,tick,since,
   get snapshot(){return latest},
   get finished(){return done},
   get result(){return done?freeze(simulation.result()):null},
   get historySize(){return history.length}});
 }
 // Passive receiver: only accepts one scoped stream, does not import the engine.
 function createReceiver(rawScope){
  const scope=validateScope(rawScope);
  let lastSeq=-1,frame=null,connected=true,needSnapshot=false;
  function validateNext(next){
   validateFrame(next,scope);
   if(frame&&next.logicalTime<frame.logicalTime)reject('relógio recuou');
   if(frame&&next.camera.revision<frame.camera.revision)reject('diretor recuou');
   // A director revision identifies one immutable shot. Catch a forged camera
   // swap even after reconnect/snapshot recovery; newer revisions may cut.
   if(frame&&next.camera.revision===frame.camera.revision&&
    (next.camera.mode!==frame.camera.mode||
     next.camera.ids.length!==frame.camera.ids.length||
     next.camera.ids.some((id,i)=>id!==frame.camera.ids[i])))
    reject('plano mudou sem revisão');
   if(frame){
    const previous=new Map(frame.fighters.map(f=>[f.id,f]));
    for(const fighter of next.fighters){
     const old=previous.get(fighter.id);
     if(fighter.klass!==old.klass||fighter.maxHp!==old.maxHp)
      reject('identidade ou HP máximo do lutador mudou');
     if(!old.alive&&fighter.alive)reject('ressurreição não permitida no torneio');
    }
   }
   if(frame?.status==='finished'&&next.seq>lastSeq)reject('partida já encerrada');
   if(frame?.status==='running'&&next.status==='ready')reject('estado retrocedeu');
  }
  function accept(next){
   if(!connected)reject('receptor desconectado');
   validateNext(next);
   if(next.seq===lastSeq){
    if(JSON.stringify(next)!==JSON.stringify(frame))reject('replay divergente');
    return false; // Duplicate delivery is idempotent.
   }
   if(next.seq<lastSeq)return false;
   if(next.seq!==lastSeq+1){needSnapshot=true;reject('lacuna detectada; solicitar snapshot');}
   frame=freeze(next);lastSeq=next.seq;needSnapshot=false;return true;
  }
  function disconnect(){connected=false}
  function reconnect(){connected=true;return lastSeq}
  function restore(next){
   if(!connected)reject('receptor desconectado');
   validateNext(next);
   if(next.seq<lastSeq)reject('snapshot obsoleto');
   if(next.seq===lastSeq&&frame&&JSON.stringify(frame)!==JSON.stringify(next))
    reject('snapshot divergente');
   frame=freeze(next);lastSeq=next.seq;needSnapshot=false;return frame;
  }
  return Object.freeze({accept,disconnect,reconnect,restore,scope,
   get snapshot(){return frame},
   get cursor(){return lastSeq},
   get needsSnapshot(){return needSnapshot},
   get connected(){return connected}});
 }
 return Object.freeze({VERSION,validateScope,validateFrame,createPublisher,createReceiver});
});

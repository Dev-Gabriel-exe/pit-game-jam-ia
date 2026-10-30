/* PIT Game Jam IA V5 — H.1a: read-only classroom-to-hero bridge.
 * NON-AUTHORITATIVE LAB CONTRACT. The API, not the student browser, must supply
 * stage rows, classroom release, character build and M5/M10 locks from DB.
 * Never transmits student name, token, room code, PIN or actual student ID.
 * No DB calls, no writes, no XP awards, no duel invitation traffic.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_STUDENT_BRIDGE_H1=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const VERSION='pit-v5-student-bridge-h1a';
 const STATUSES=new Set(['working','submitted','revision','approved']);
 const CLASSES=new Set(['warrior','mage','hunter','guardian']);
 function reject(message){throw Error('H1: '+message)}
 function integer(value,min,max){return Number.isInteger(value)&&value>=min&&value<=max}
 function freeze(o){
  if(Array.isArray(o))return Object.freeze(o.map(freeze));
  if(o&&typeof o==='object'){
   return Object.freeze(Object.fromEntries(Object.entries(o).map(([k,v])=>[k,freeze(v)])));
  }
  return o;
 }
 // Server-confirmed V3 rows: [{stage:1,status:'approved'}, ...].
 // Counting approved rows is not enough: reject missing prerequisites and duplicates.
 function progressOf(rows,currentStage){
  if(!Array.isArray(rows)||rows.length>10)reject('linhas de missão inválidas');
  if(!integer(currentStage,1,10))reject('missão liberada inválida');
  const seen=new Set(),byStage=new Map();
  for(const r of rows){
   if(!r||!integer(r.stage,1,10)||!STATUSES.has(r.status))reject('status de missão inválido');
   if(seen.has(r.stage))reject('missão duplicada');
   if(r.stage>currentStage)reject('registro de missão acima da liberação do professor');
   seen.add(r.stage);byStage.set(r.stage,r.status);
  }
  let approved=0;
  for(let n=1;n<=10;n++){
   if(byStage.get(n)==='approved'){
    if(n!==approved+1)reject('aprovações precisam ser consecutivas');
    approved=n;
   }
  }
  // "Waiting" includes a reviewed approval or a submitted evidence;
  // neither state unlocks XP or talents until approved by the teacher.
  const status=byStage.get(currentStage)||null;
  return freeze({approvedMissions:approved,completedMissions:Array.from({length:approved},(_,i)=>i+1),
   approvedBaseXp:approved*100,currentStage,currentStatus:status,
   awaitingPeers:status==='approved'||status==='submitted'});
 }
 function createBridge(policy){
  if(!policy||typeof policy.validateBuild!=='function'||typeof policy.validateCandidate!=='function')
   reject('contrato H0 obrigatório');
  function view(snapshot){
   if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))reject('snapshot inválido');
   // The roster key is an opaque laboratory alias supplied by the trusted test harness.
   // Real IDs never become a player-visible key.
   if(!/^trial-[a-z0-9_-]{1,60}$/.test(snapshot.rosterKey||''))
    reject('alias pseudônimo de laboratório obrigatório');
   if(!CLASSES.has(snapshot.klass))reject('classe inválida');
   const progress=progressOf(snapshot.stageRows,snapshot.teacherCurrentStage);
   const build=policy.validateBuild(snapshot.build,snapshot.klass,progress.approvedMissions);
   const candidate={rosterKey:snapshot.rosterKey,klass:snapshot.klass,
    completedMissions:[...progress.completedMissions],build:{
     attributes:{...build.attributes},talents:[...build.talents]},
    m5Entered:snapshot.m5Entered===true,m5Frozen:snapshot.m5Frozen??null,
    m10Locked:snapshot.m10Locked===true};
   // H0 is responsible for checking the lock when enough missions are approved.
   if(candidate.m5Entered){
    if(!candidate.m5Frozen)reject('entrada M5 sem snapshot');
    if(progress.approvedMissions>=5){
     const mission=progress.approvedMissions===5?5:10;
     // M10 requires a final lock; when still progressing use the H0
     // build validator and an explicit M5 frozen floor check below.
     if(mission===5)policy.validateCandidate(candidate,{mission:5});
     else {
      const frozen=policy.validateBuild(candidate.m5Frozen,snapshot.klass,5);
      for(const attribute of ['FOR','DES','INT','VIT','DEF'])
       if(build.attributes[attribute]<frozen.attributes[attribute])
        reject('atributos congelados da M5 alterados');
      for(const id of frozen.talents)
       if(!build.talents.includes(id))reject('talentos congelados da M5 alterados');
     }
    }
   }else if(candidate.m5Frozen!==null)reject('snapshot M5 sem entrada');
   if(progress.approvedMissions>5&&!candidate.m5Entered)
    reject('progresso após M5 exige entrada registrada');
   if(candidate.m10Locked&&progress.approvedMissions!==10)
    reject('lock M10 exige dez missões');
   const canEnterM5=progress.approvedMissions===5&&candidate.m5Entered;
   const canEnterM10=progress.approvedMissions===10&&candidate.m10Locked;
   if(canEnterM10)policy.validateCandidate(candidate,{mission:10});
   return freeze({schema:VERSION,rosterKey:snapshot.rosterKey,klass:snapshot.klass,
    progress,build,arena:{m5Eligible:canEnterM5,m10Eligible:canEnterM10},
    duel:{eligible:progress.awaitingPeers&&snapshot.duelOptIn===true,
     mission:progress.currentStage,status:progress.currentStatus,
     // No cross-room peers or invitations are exposed by this bridge.
     reason:progress.awaitingPeers?'awaiting-peers':'mission-not-finished'}});
  }
  return Object.freeze({view});
 }
 return Object.freeze({VERSION,progressOf,createBridge});
});

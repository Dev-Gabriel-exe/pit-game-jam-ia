/* PIT Game Jam IA V5 — teacher-led collective arena gate, FICTIONAL LAB ONLY.
 * NOT authorization: a browser cannot impersonate a verified teacher or student.
 * No accounts, backend, API, persistence, grades, XP or real classroom data.
 * Use server-verified snapshots and atomic locks only after G.2 and approval.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_TEACHER_ARENA_LAB=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const VERSION='pit-v5-fictional-teacher-arena-1';
 const ALIAS=/^trial-[a-z0-9_-]{1,60}$/;
 const ROOM=/^trial-room-[a-z0-9_-]{1,50}$/;
 const CLASSES=['warrior','mage','hunter','guardian'];
 const freeze=value=>{
  if(Array.isArray(value))return Object.freeze(value.map(freeze));
  if(value&&typeof value==='object')return Object.freeze(Object.fromEntries(Object.entries(value).map(([k,v])=>[k,freeze(v)])));
  return value;
 };
 const invalid=message=>{throw Error('TEACHER-ARENA-LAB: '+message)};
 const missionOk=n=>n===5||n===10;
 const countOk=n=>Number.isInteger(n)&&n>=2&&n<=30;
 const teacher=actor=>{if(actor!=='trial-teacher')invalid('somente professor fictício pode liberar a arena')};
 const revision=(state,expected)=>{
  if(!state||state.schema!==VERSION||state.revision!==expected)invalid('revisão desatualizada');
 };
 function createRoster(engine,{mission=5,count=30,roomKey='trial-room-coliseum'}={}){
  if(!missionOk(mission)||!countOk(count)||!ROOM.test(roomKey)||typeof engine?.exampleBuild!=='function')
   invalid('configuração de turma fictícia inválida');
  return freeze(Array.from({length:count},(_,i)=>{
   const klass=CLASSES[i%4],rosterKey='trial-class-'+String(i+1).padStart(2,'0')+'-'+klass;
   const base=engine.exampleBuild(klass,rosterKey,5,Math.floor(i/4)%11);
   const final=mission===10?engine.exampleBuild(klass,rosterKey,10,Math.floor(i/4)%11,{experimentalFinal:true}):base;
   return {rosterKey,roomKey,klass,ready:true,online:true,
    completedMissions:Array.from({length:mission},(_,n)=>n+1),
    build:{attributes:{...final.attributes},talents:[...final.talents]},
    m5Entered:true,m5Frozen:{attributes:{...base.attributes},talents:[...base.talents]},
    m10Locked:mission===10};
  }));
 }
 function createState({mission=5,roomKey='trial-room-coliseum',participants}={}){
  if(!missionOk(mission)||!ROOM.test(roomKey)||!Array.isArray(participants)||!countOk(participants.length))
   invalid('turma fictícia exige 2 a 30 heróis');
  if(participants.some(p=>!p||!ALIAS.test(p.rosterKey||'')||!ROOM.test(p.roomKey||''))||
     new Set(participants.map(p=>p.rosterKey)).size!==participants.length)
   invalid('identificadores fictícios inválidos ou duplicados');
  return freeze({schema:VERSION,revision:0,mission,roomKey,teacherEnabled:false,status:'draft',
   participants,release:null,result:null});
 }
 function eligible(state,policy){
  if(!state||state.schema!==VERSION||!policy?.m5ArenaAdapter||!policy?.m10ArenaAdapter)
   invalid('estado ou contrato H0 ausente');
  return freeze(state.participants.map(p=>{
   let reason=null,entry=null;
   if(p.roomKey!==state.roomKey)reason='outra-turma';
   else if(p.online!==true)reason='offline';
   else if(p.ready!==true)reason='não-pronto';
   else {
    try{
     const candidate={rosterKey:p.rosterKey,klass:p.klass,completedMissions:p.completedMissions,
      build:p.build,m5Entered:p.m5Entered,m5Frozen:p.m5Frozen,m10Locked:p.m10Locked};
     entry=state.mission===10?policy.m10ArenaAdapter(candidate):policy.m5ArenaAdapter(candidate);
    }catch{reason='progresso-ou-build-inválido'}
   }
   return {rosterKey:p.rosterKey,klass:p.klass,eligible:reason===null,
    reason,entry};
  }));
 }
 function alter(state,{actor,expectedRevision,enabled,rosterKey,online,ready}={}){
  revision(state,expectedRevision);teacher(actor);
  if(state.status!=='draft')invalid('alterações só na preparação, antes da liberação');
  if(typeof enabled==='boolean'){
   if(rosterKey!==undefined||online!==undefined||ready!==undefined)invalid('configuração misturada');
   return freeze({...state,revision:state.revision+1,teacherEnabled:enabled});
  }
  if(!ALIAS.test(rosterKey||''))invalid('herói fictício inválido');
  if(online!==undefined&&typeof online!=='boolean'||ready!==undefined&&typeof ready!=='boolean')
   invalid('disponibilidade inválida');
  if(online===undefined&&ready===undefined)invalid('nenhuma alteração solicitada');
  if(!state.participants.some(p=>p.rosterKey===rosterKey))invalid('herói não está na turma');
  return freeze({...state,revision:state.revision+1,
   participants:state.participants.map(p=>p.rosterKey===rosterKey?{...p,
    online:online===undefined?p.online:online,ready:ready===undefined?p.ready:ready}:p)});
 }
 function release(state,{actor,expectedRevision,policy,seed=4252}={}){
  revision(state,expectedRevision);teacher(actor);
  if(state.status!=='draft'||!state.teacherEnabled)invalid('professor não habilitou o coliseu');
  if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)invalid('seed inválida');
  const reports=eligible(state,policy),included=reports.filter(p=>p.eligible);
  if(included.length<2)invalid('mínimo dois heróis elegíveis');
  const entries=included.map(x=>{
   const entry=x.entry;
   return {id:x.rosterKey,name:x.rosterKey,klass:x.klass,
    approvedMissions:entry.approvedMissions,finalTrial:entry.finalTrial===true,
    build:{...entry.build,attributes:{...entry.build.attributes},talents:[...entry.build.talents]}};
  });
  return freeze({...state,revision:state.revision+1,status:'released',
   release:{mission:state.mission,seed,roomKey:state.roomKey,
    entrants:entries,excluded:reports.filter(p=>!p.eligible).map(p=>({rosterKey:p.rosterKey,reason:p.reason}))}});
 }
 function start(state,{actor,expectedRevision}={}){
  revision(state,expectedRevision);teacher(actor);
  if(state.status!=='released'||!state.teacherEnabled||!state.release?.entrants?.length)
   invalid('arena coletiva não foi liberada pelo professor');
  return freeze({...state,revision:state.revision+1,status:'running'});
 }
 function finish(state,{actor,expectedRevision,winner,time}={}){
  revision(state,expectedRevision);teacher(actor);
  if(state.status!=='running')invalid('não há partida coletiva em execução');
  if(!ALIAS.test(winner||'')||!state.release.entrants.some(e=>e.id===winner)||
     !Number.isFinite(time)||time<0||time>10000)
   invalid('resultado não pertence à partida');
  return freeze({...state,revision:state.revision+1,status:'finished',
   result:{winner,time,mission:state.mission,participants:state.release.entrants.length}});
 }
 function abort(state,{actor,expectedRevision}={}){
  revision(state,expectedRevision);teacher(actor);
  if(!['released','running'].includes(state.status))invalid('não há arena coletiva para interromper');
  return freeze({...state,revision:state.revision+1,status:'aborted',result:null});
 }
 function reset(state,{actor,expectedRevision}={}){
  revision(state,expectedRevision);teacher(actor);
  if(state.status==='running')invalid('partida em andamento exige encerramento do motor');
  return freeze({...state,revision:state.revision+1,status:'draft',
   teacherEnabled:false,release:null,result:null});
 }
 return Object.freeze({VERSION,createRoster,createState,eligible,alter,release,start,finish,abort,reset});
});

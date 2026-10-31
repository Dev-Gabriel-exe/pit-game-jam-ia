/* H.1b dry-run: optimistic concurrency and idempotent M5/M10 build locks.
 * PURE FICTIONAL CONTRACT, NOT a database transaction or an auth layer.
 * The real server must authenticate and lock rows in Postgres after G.2.
 * No HTTP, persistence, XP, student identity or production schema usage.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_BUILD_CAS_H1B_LAB=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const VERSION='pit-v5-h1b-build-cas-lab-1';
 const ALIAS=/^trial-[a-z0-9_-]{1,60}$/;
 const ROOM=/^trial-room-[a-z0-9_-]{1,50}$/;
 const KEY=/^trial-command-[a-z0-9_-]{1,55}$/;
 const ACTORS=new Set(['trial-student','trial-teacher']);
 const TYPES=new Set(['edit','enter-m5','approve-next','lock-m10']);
 function reject(message){throw Error('H1B-CAS-LAB: '+message)}
 const int=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 function freeze(o){
  if(Array.isArray(o))return Object.freeze(o.map(freeze));
  if(o&&typeof o==='object')return Object.freeze(Object.fromEntries(Object.entries(o).map(([k,v])=>[k,freeze(v)])));
  return o;
 }
 const buildCopy=b=>({attributes:{...b.attributes},talents:[...b.talents]});
 const lens=(record,policy)=>({
  schema:policy.VERSION||'pit-v5-progression-h0',
  rosterKey:record.rosterKey,klass:record.klass,
  approvedMissions:record.completedMissions.length,build:buildCopy(record.build),
  m5Entered:record.m5Entered,m5Frozen:record.m5Frozen?buildCopy(record.m5Frozen):null,
  m10Locked:record.m10Locked
 });
 function createRecord(policy,{roomKey='trial-room-h1b',rosterKey,klass,
  completedMissions,build}={}){
  if(!policy||typeof policy.validateBuild!=='function'||typeof policy.checkTransition!=='function'||
    !ROOM.test(roomKey)||!ALIAS.test(rosterKey||'')||
    !Array.isArray(completedMissions)||completedMissions.length!==5||
    completedMissions.some((x,i)=>x!==i+1))reject('entrada exige cinco aprovações fictícias consecutivas');
  const normalized=policy.validateBuild(build,klass,5);
  return freeze({schema:VERSION,roomKey,rosterKey,klass,revision:0,
   completedMissions:[...completedMissions],
   build:buildCopy(normalized),
   m5Entered:false,m5Frozen:null,m10Locked:false,commands:[]});
 }
 function apply(record,policy,{key,actor,type,expectedRevision,payload=null}={}){
  if(!record||record.schema!==VERSION||!int(record.revision,0,Number.MAX_SAFE_INTEGER)||
   !KEY.test(key||'')||!ACTORS.has(actor)||!TYPES.has(type)||
   !policy||typeof policy.validateBuild!=='function')reject('comando fictício inválido');
  const signature=JSON.stringify({actor,type,payload});
  const existing=record.commands.find(x=>x.key===key);
  if(existing){
   if(existing.signature!==signature)reject('chave idempotente reutilizada para outra alteração');
   return record; // Exact replay, even if original revision already advanced.
  }
  if(!int(expectedRevision,0,Number.MAX_SAFE_INTEGER)||record.revision!==expectedRevision)
   reject('revisão desatualizada; recarregar snapshot');
  if(record.commands.length>=100)reject('limite do laboratório; não descartar histórico de idempotência');
  const student=actor==='trial-student',teacher=actor==='trial-teacher';
  let next={...record};
  if(type==='edit'){
   if(!student||record.m10Locked)reject('edição proibida após lock final');
   const result=policy.validateBuild(payload?.build,record.klass,record.completedMissions.length);
   next.build=buildCopy(result);
  }else if(type==='enter-m5'){
   if(!student||record.completedMissions.length!==5||record.m5Entered)
    reject('primeira entrada M5 inválida');
   next.m5Entered=true;next.m5Frozen=buildCopy(record.build);
   policy.validateCandidate({...lens(next,policy),completedMissions:[...next.completedMissions]},{mission:5});
  }else if(type==='approve-next'){
   if(!teacher||!record.m5Entered||record.m10Locked||record.completedMissions.length>=10||
    payload?.stage!==record.completedMissions.length+1)
    reject('aprovação precisa ser sequencial e posterior ao lock M5');
   next.completedMissions=[...record.completedMissions,payload.stage];
  }else if(type==='lock-m10'){
   if(!student||!record.m5Entered||record.completedMissions.length!==10||record.m10Locked)
    reject('lock final exige as dez missões e primeiro lock M5');
   next.m10Locked=true;
   policy.validateCandidate({...lens(next,policy),completedMissions:[...next.completedMissions]},{mission:10});
  }
  if(next.m5Entered){
   const baseline=policy.validateBuild(next.m5Frozen,record.klass,5);
   for(const attr of ['FOR','DES','INT','VIT','DEF'])
    if(next.build.attributes[attr]<baseline.attributes[attr])reject('atributos congelados da M5 alterados');
   if(baseline.talents.some(id=>!next.build.talents.includes(id)))
    reject('talentos congelados da M5 removidos');
  }
  policy.checkTransition(lens(record,policy),lens(next,policy));
  next.revision=record.revision+1;
  next.commands=[...record.commands,{key,signature,revision:next.revision}];
  return freeze(next);
 }
 return Object.freeze({VERSION,createRecord,apply});
});

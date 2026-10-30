'use strict';
/*
 * H.1b — authoritative-server build rules for the approved four-class arena.
 * Pure module: no authentication, network, SQL, or student data access.
 * The API must authenticate the student, read teacher-approved stages from DB,
 * and apply these plans transactionally. Never reuse the legacy V5 core here.
 */
const catalog=require('./v5-phase2-talent-ids.json');
const VERSION=2;
const ATTR=Object.freeze(['FOR','DES','INT','VIT','DEF']);
const CLASSES=Object.freeze(['warrior','mage','hunter','guardian']);
const statuses=new Set(['working','submitted','revision','approved']);
const validTalent=Object.fromEntries(CLASSES.map(klass=>[klass,new Set(catalog.classes[klass]||[])]));
function fail(reason){const e=Error('H1b: '+reason);e.code='V5_BUILD_INVALID';throw e}
function isRecord(o){return o!==null&&typeof o==='object'&&!Array.isArray(o)}
function hasOwn(o,key){return Object.prototype.hasOwnProperty.call(o,key)}
function exactKeys(o,allowed){return Object.keys(o).every(k=>allowed.includes(k))}
function copyBuild(b){return {klass:b.klass,attributes:{...b.attributes},talents:[...b.talents]}}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
if(catalog.schemaVersion!==VERSION||CLASSES.some(c=>validTalent[c].size!==30))
 throw Error('H1b: server catalog is not a valid 4 x 30 schema v2');

// Accept only stage rows supplied from the database. Never trust browser-supplied
// "approvedMissions", XP or current stage.
function progressOf(stageRows,teacherCurrentStage){
 if(!Number.isInteger(teacherCurrentStage)||teacherCurrentStage<1||teacherCurrentStage>10)
  fail('missão liberada inválida');
 if(!Array.isArray(stageRows)||stageRows.length>10)fail('linhas de missão inválidas');
 const seen=new Set(),state=new Map();
 for(const row of stageRows){
  if(!isRecord(row)||!Number.isInteger(row.stage)||row.stage<1||row.stage>teacherCurrentStage||
    !statuses.has(row.status)||seen.has(row.stage))fail('linha de missão inválida ou duplicada');
  seen.add(row.stage);state.set(row.stage,row.status);
 }
 let approved=0;
 for(let n=1;n<=teacherCurrentStage;n++){
  if(state.get(n)==='approved'){
   if(n!==approved+1)fail('aprovações fora de ordem');
   approved=n;
  }
 }
 const currentStatus=state.get(teacherCurrentStage)||null;
 return Object.freeze({approvedMissions:approved,approvedBaseXp:approved*100,
  teacherCurrentStage,currentStatus,awaitingPeers:currentStatus==='approved'||currentStatus==='submitted'});
}
function normalizeBuild(raw,approvedMissions){
 if(!isRecord(raw)||!exactKeys(raw,['klass','attributes','talents'])||
    !CLASSES.includes(raw.klass))fail('classe ou formato de build inválido');
 if(!Number.isInteger(approvedMissions)||approvedMissions<0||approvedMissions>10)
  fail('quantidade de missões inválida');
 const a=raw.attributes;
 if(!isRecord(a)||!exactKeys(a,ATTR)||!ATTR.every(k=>hasOwn(a,k)))fail('cinco atributos obrigatórios');
 const attributes={};let spent=0;
 for(const key of ATTR){
  const val=a[key];
  if(!Number.isInteger(val)||val<0||val>20)fail('valor de atributo inválido');
  attributes[key]=val;spent+=val;
 }
 if(spent>approvedMissions*2)fail('pontos acima das missões aprovadas');
 const talents=raw.talents;
 if(!Array.isArray(talents)||talents.length>approvedMissions||
   talents.some(id=>typeof id!=='string'||!validTalent[raw.klass].has(id))||
   new Set(talents).size!==talents.length)fail('talentos inválidos, repetidos ou acima da progressão');
 return Object.freeze({klass:raw.klass,attributes:Object.freeze(attributes),talents:Object.freeze([...talents]),
  spentAttributes:spent,remainingAttributes:approvedMissions*2-spent,
  remainingTalents:approvedMissions-talents.length});
}
function clean(normalized){return copyBuild(normalized)}
function enforceM5Floor(next,m5Snapshot){
 if(!m5Snapshot)return;
 const floor=normalizeBuild({klass:next.klass,attributes:m5Snapshot.attributes,talents:m5Snapshot.talents},5);
 for(const key of ATTR)if(next.attributes[key]<floor.attributes[key])
  fail('atributos congelados na M5 não podem diminuir');
 for(const id of floor.talents)if(!next.talents.includes(id))
  fail('talentos congelados na M5 não podem ser removidos');
}
function planSave(existing,raw,progress){
 const next=clean(normalizeBuild(raw,progress.approvedMissions));
 if(existing){
  if(existing.schema_version!==VERSION)fail('versão de registro incompatível');
  if(existing.klass!==next.klass)fail('a classe não pode ser trocada depois de criada');
  if(existing.m10_snapshot) {
   if(!same(copyBuild(existing),next))fail('personagem travado na M10');
   return {kind:'noop',build:next};
  }
  enforceM5Floor(next,existing.m5_snapshot);
  if(!existing.m5_snapshot&&progress.approvedMissions>5)
   fail('primeira entrada na M5 não registrada');
  if(same(copyBuild(existing),next))return {kind:'noop',build:next};
  return {kind:'update',build:next};
 }
 if(progress.approvedMissions>5)fail('criação sem entrada M5 registrada');
 return {kind:'insert',build:next};
}
function requireComplete(build,mission){
 const normalized=normalizeBuild(build,mission);
 if(normalized.spentAttributes!==2*mission||normalized.talents.length!==mission)
  fail('distribua todos os pontos e talentos antes de entrar na arena');
 return normalized;
}
function planM5Entry(existing,progress){
 if(progress.approvedMissions!==5)fail('entrada M5 requer cinco missões aprovadas');
 if(!existing||existing.schema_version!==VERSION)fail('personagem V2 não encontrado');
 if(existing.m5_snapshot)return {kind:'noop',snapshot:existing.m5_snapshot};
 if(existing.m10_snapshot)fail('M10 já travada sem entrada M5');
 const b=requireComplete(copyBuild(existing),5);
 return {kind:'freeze-m5',snapshot:{attributes:{...b.attributes},talents:[...b.talents]}};
}
function planM10Lock(existing,progress){
 if(progress.approvedMissions!==10)fail('M10 requer dez missões aprovadas');
 if(!existing||existing.schema_version!==VERSION||!existing.m5_snapshot)
  fail('primeira entrada M5 obrigatória');
 enforceM5Floor(existing,existing.m5_snapshot);
 if(existing.m10_snapshot)return {kind:'noop',snapshot:existing.m10_snapshot};
 const b=requireComplete(copyBuild(existing),10);
 return {kind:'lock-m10',snapshot:{attributes:{...b.attributes},talents:[...b.talents]}};
}
function publicView(row,progress){
 if(!row)return Object.freeze({schemaVersion:VERSION,revision:0,build:null,
  progress,arena:{m5Entered:false,m10Locked:false},duel:{waiting:progress.awaitingPeers}});
 const build=clean(normalizeBuild(copyBuild(row),progress.approvedMissions));
 enforceM5Floor(build,row.m5_snapshot);
 return Object.freeze({schemaVersion:VERSION,revision:row.revision,build,
  progress,arena:{m5Entered:!!row.m5_snapshot,m10Locked:!!row.m10_snapshot},
  duel:{waiting:progress.awaitingPeers}});
}
module.exports=Object.freeze({VERSION,ATTR,CLASSES,progressOf,normalizeBuild,
 planSave,planM5Entry,planM10Lock,publicView});

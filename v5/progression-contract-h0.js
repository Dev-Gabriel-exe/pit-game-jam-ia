/* PIT Game Jam IA V5 — H.0: pure, non-authoritative progression contract.
 * NO authentication, persistence, grade/XP writes, or student data here.
 * Real permissions, idempotent locks, and snapshots MUST be server-enforced
 * after classroom hardware validation and explicit integration approval.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_PROGRESSION_CONTRACT=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const VERSION='pit-v5-progression-h0';
 const ATTR=Object.freeze(['FOR','DES','INT','VIT','DEF']);
 const CLASSES=Object.freeze(['warrior','mage','hunter','guardian']);
 function invalid(message){throw Error('H0: '+message)}
 function isObj(o){return o!==null&&typeof o==='object'&&!Array.isArray(o)}
 function freezeCopy(o){if(Array.isArray(o))return Object.freeze(o.map(freezeCopy));
  if(isObj(o))return Object.freeze(Object.fromEntries(Object.entries(o).map(([k,v])=>[k,freezeCopy(v)])));
  return o;
 }
 function verifyCatalog(catalog){
  if(!isObj(catalog))invalid('catálogo obrigatório');
  for(const klass of CLASSES){
   const list=catalog[klass];
   if(!Array.isArray(list)||list.length!==30)invalid('catálogo de 30 talentos ausente: '+klass);
   const ids=list.map(t=>t?.id);
   if(ids.some(id=>typeof id!=='string')||new Set(ids).size!==30)invalid('catálogo inconsistente: '+klass);
  }
 }
 function createPolicy(catalog){
  verifyCatalog(catalog);
  const valid=Object.fromEntries(CLASSES.map(c=>[c,new Set(catalog[c].map(x=>x.id))]));
  function validateBuild(build,klass,approved){
   if(!isObj(build))invalid('build obrigatória');
   if(!Number.isInteger(approved)||approved<0||approved>10)invalid('missões aprovadas inválidas');
   if(!isObj(build.attributes)||Object.keys(build.attributes).some(k=>!ATTR.includes(k)))
    invalid('atributos inválidos');
   const attributes={};let spent=0;
   for(const key of ATTR){
    const val=build.attributes[key]??0;
    if(!Number.isInteger(val)||val<0||val>20)invalid('valor inválido: '+key);
    attributes[key]=val;spent+=val;
   }
   if(spent>approved*2)invalid('pontos excedem 2 por missão aprovada');
   if(!Array.isArray(build.talents)||build.talents.length>approved)
    invalid('mais de 1 talento por missão aprovada');
   if(build.talents.some(t=>typeof t!=='string'||!valid[klass]?.has(t)) ||
      new Set(build.talents).size!==build.talents.length)
    invalid('talento duplicado, desconhecido ou de outra classe');
   return freezeCopy({attributes,talents:[...build.talents],spentAttributes:spent,
    remainingAttributes:approved*2-spent,remainingTalents:approved-build.talents.length});
  }
  function checkFrozen(frozen,current,klass){
   const baseline=validateBuild(frozen,klass,5);
   for(const k of ATTR)if(current.attributes[k]<baseline.attributes[k])
    invalid('pontos da primeira entrada M5 não podem ser redistribuídos');
   for(const id of baseline.talents)if(!current.talents.includes(id))
    invalid('talento da primeira entrada M5 não pode ser retirado');
   return baseline;
  }
  function validateCandidate(candidate,{mission=5}={}){
   if(!isObj(candidate)||!CLASSES.includes(candidate.klass))
    invalid('classe desconhecida');
   if(!/^trial-[a-z0-9_-]{1,60}$/.test(candidate.rosterKey||''))
    invalid('somente chave pseudônima de laboratório, sem nome de aluno');
   if(mission!==5&&mission!==10)invalid('somente arenas M5/M10 previstas');
   const completed=candidate.completedMissions;
   if(!Array.isArray(completed)||completed.length>10||completed.some((x,i)=>x!==i+1))
    invalid('missões devem ser aprovadas em ordem e sem lacunas');
   const count=completed.length;
   if(count<mission)invalid('entrada exige missão correspondente aprovada');
   const build=validateBuild(candidate.build,candidate.klass,count);
   const m5Entered=!!candidate.m5Entered;
   if(m5Entered&&!isObj(candidate.m5Frozen))invalid('primeira entrada M5 exige snapshot congelado');
   if(!m5Entered&&candidate.m5Frozen!=null)invalid('snapshot M5 sem entrada registrada');
   const m5Baseline=m5Entered?checkFrozen(candidate.m5Frozen,build,candidate.klass):null;
   if(mission===5&&count>5)invalid('M5 aceita somente snapshot da missão 5');
   if(mission===10){
    if(!m5Entered)invalid('M10 exige primeira entrada na M5');
    if(candidate.m10Locked!==true)invalid('M10 exige build definitivamente travada');
   }
   if(mission===5&&candidate.m10Locked===true)invalid('M5 não recebe lock M10');
   return freezeCopy({schema:VERSION,rosterKey:candidate.rosterKey,
    klass:candidate.klass,mission,approvedMissions:count,
    approvedBaseXp:count*100,build,
    m5Entered,m5Frozen:m5Baseline,m10Locked:candidate.m10Locked===true});
  }
  function checkTransition(before,after){
   if(before.schema!==VERSION||after.schema!==VERSION)invalid('schema desconhecido');
   if(before.rosterKey!==after.rosterKey||before.klass!==after.klass)
    invalid('identidade/classe do personagem não pode mudar');
   if(after.approvedMissions<before.approvedMissions)
    invalid('aprovações não podem retroceder');
   if(before.m5Entered&&!after.m5Entered)invalid('primeira entrada M5 não pode ser apagada');
   if(!before.m5Entered&&after.m5Entered){
    if(before.approvedMissions!==5||after.approvedMissions!==5)
     invalid('primeira entrada deve acontecer na missão 5');
    if(!after.m5Frozen||
       JSON.stringify(before.build.attributes)!==JSON.stringify(after.m5Frozen.attributes)||
       JSON.stringify(before.build.talents)!==JSON.stringify(after.m5Frozen.talents))
     invalid('a primeira entrada M5 deve congelar a build que estava aprovada');
   }
   if(!before.m5Entered&&after.approvedMissions>5)
    invalid('não é permitido avançar além da M5 sem registrar a primeira entrada');
   if(before.m5Entered){
    if(JSON.stringify(before.m5Frozen)!==JSON.stringify(after.m5Frozen))
     invalid('snapshot de entrada M5 é imutável');
   }
   if(before.m10Locked&&!after.m10Locked)invalid('lock final M10 é irreversível');
   return true;
  }
  function m5ArenaAdapter(candidate){
   const norm=validateCandidate(candidate,{mission:5});
   if(!norm.m5Entered)invalid('não executar M5 oficialmente antes de congelar a build no servidor');
   // Current B.6 engine explicitly supports 5 missions only. This adapter
   // does NOT expose an M10 battle, and retains exact canonical attributes.
   const payload={klass:norm.klass,attributes:{...norm.build.attributes},
    talents:[...norm.build.talents],name:norm.rosterKey};
   return freezeCopy({rosterKey:norm.rosterKey,build:payload,approvedMissions:5});
  }
  return Object.freeze({VERSION,ATTR,CLASSES,validateBuild,validateCandidate,
   checkTransition,m5ArenaAdapter});
 }
 return Object.freeze({VERSION,ATTR,CLASSES,createPolicy});
});
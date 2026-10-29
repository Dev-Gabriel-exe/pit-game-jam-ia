/* V5 Forge experimental rules — independent of XP, storage and student accounts.
 * All choices are local demo drafts; approvals/final lock require a real server.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PIT_V5_FORGE=api})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const ATTR=['FOR','DES','INT','VIT','DEF'];
const CLASSES=['warrior','mage','hunter','guardian'];
const budget=m=>({attributes:Math.trunc(m)*2,talents:Math.trunc(m)});
function verifyCatalog(data){
 if(!data||!CLASSES.includes(data.klass)||data.talents?.length!==30)throw Error('Catálogo incompleto: 30 talentos por classe são obrigatórios');
 const ids=new Set(),paths=new Map();
 for(const t of data.talents){
  if(!/^[A-Z][0-9]{2}$/.test(t.id)||ids.has(t.id)||!ATTR.includes(t.primary)||!ATTR.includes(t.secondary)||!['ativo','passivo','reativo'].includes(t.type)||!t.tree||!t.effect)throw Error('Talento inválido: '+t.id);
  ids.add(t.id);paths.set(t.tree,(paths.get(t.tree)||0)+1);
 }
 if(paths.size!==3||[...paths.values()].some(n=>n!==10))throw Error('Cada classe deve oferecer 3 caminhos com 10 talentos');
 return data;
}
function blank(klass,missions=5){
 if(!CLASSES.includes(klass)||!Number.isInteger(missions)||missions<1||missions>10)throw Error('Classe ou missão inválida');
 return {klass,missions,attributes:Object.fromEntries(ATTR.map(k=>[k,0])),talents:[]};
}
function validate(d,catalog){
 verifyCatalog(catalog);
 if(!d||d.klass!==catalog.klass||!Number.isInteger(d.missions)||d.missions<1||d.missions>10||!Array.isArray(d.talents))throw Error('Rascunho inválido');
 const allowed=new Set(catalog.talents.map(x=>x.id));
 if(new Set(d.talents).size!==d.talents.length||d.talents.length>d.missions||d.talents.some(t=>!allowed.has(t)))throw Error('Talentos inválidos ou excedidos');
 let points=0;
 for(const key of ATTR){const v=d.attributes?.[key];if(!Number.isInteger(v)||v<0||v>12)throw Error('Atributo '+key+' inválido');points+=v}
 if(Object.keys(d.attributes||{}).some(k=>!ATTR.includes(k))||points>d.missions*2)throw Error('Orçamento de atributos excedido');
 return {pointsUsed:points,pointsLeft:d.missions*2-points,slotsUsed:d.talents.length,slotsLeft:d.missions-d.talents.length};
}
function setMissions(d,missions,catalog){
 if(!Number.isInteger(missions)||missions<1||missions>10)throw Error('Apenas missões 1 a 10');
 const out={...d,missions,talents:d.talents.slice(0,missions),attributes:{...d.attributes}};
 let extra=Math.max(0,ATTR.reduce((s,k)=>s+out.attributes[k],0)-missions*2);
 for(const k of [...ATTR].reverse()){
  const n=Math.min(extra,out.attributes[k]);out.attributes[k]-=n;extra-=n;
 }
 validate(out,catalog);return out;
}
function choose(d,id,catalog){
 const copy={...d,talents:[...d.talents]};
 const i=copy.talents.indexOf(id);
 if(i>=0)copy.talents.splice(i,1);
 else{
  if(!catalog.talents.some(t=>t.id===id))throw Error('Talento não pertence à classe');
  if(copy.talents.length>=d.missions)throw Error('Todos os talentos desta etapa já foram escolhidos');
  copy.talents.push(id);
 }
 validate(copy,catalog);return copy;
}
function invest(d,key,delta,catalog){
 if(!ATTR.includes(key)||![-1,1].includes(delta))throw Error('Atributo inválido');
 const copy={...d,attributes:{...d.attributes,[key]:d.attributes[key]+delta}};
 validate(copy,catalog);return copy;
}
function executable(d,activeIds,catalog){
 validate(d,catalog);
 if(d.missions!==5)return {ok:false,reason:'A arena experimental aceita somente a missão 5.'};
 if(d.talents.length!==5)return {ok:false,reason:'Escolha cinco talentos para testar a missão 5.'};
 if(d.talents.some(id=>!activeIds.includes(id)))return {ok:false,reason:'Existem talentos planejados nesta build que ainda não executam na arena.'};
 return {ok:true,reason:'Esta build pode ser testada contra bots no motor experimental da missão 5.'};
}
function exportDraft(d,catalog){validate(d,catalog);return {schema:'pit-v5-forge-preview-v1',...d,status:'draft-local-only',serverVerified:false,finalLocked:false}}
return Object.freeze({ATTR,CLASSES,budget,blank,verifyCatalog,validate,setMissions,choose,invest,executable,exportDraft});
});

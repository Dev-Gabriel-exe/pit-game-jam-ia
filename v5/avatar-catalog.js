/* V5 armory catalogue — shared pure module (browser + Node).
 * IMPORTANT: 40 selectable VISUAL VARIANTS, not 120 different 3D meshes.
 * One verified CC0 rigged GLB per class. Future licensed GLBs can replace
 * baseModelId individually without changing the reservation ID.
 * This module is DEMO LOGIC: authoritative cross-device claims require
 * a DB UNIQUE(classroom_id, avatar_id) constraint in Phase H.
 */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_AVATARS=api;
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const CLASSES=Object.freeze({
 warrior:{label:'Guerreiro',baseModelId:'warrior',glyph:'⚔',role:'Vanguarda · armaduras e lâminas',
  color:'#dca17b',names:['Aldric','Bórion','Kael','Garran','Darian','Túrian','Ragnar','Edrik','Valtor','Ormund']},
 mage:{label:'Arcanista',baseModelId:'mage',glyph:'✦',role:'Feitiçaria · runas e astros',
  color:'#bb9dff',names:['Aelion','Saryth','Mavren','Ilyra','Vaelis','Erynd','Nymira','Caelum','Zareth','Elthar']},
 hunter:{label:'Caçador',baseModelId:'hunter',glyph:'➶',role:'Precisão · arcos e sombras',
  color:'#9cdaa9',names:['Eryn','Torvik','Sylven','Ravik','Deyra','Lorcan','Feylan','Veyra','Narek','Thessa']},
 guardian:{label:'Guardião',baseModelId:'guardian',glyph:'◆',role:'Égide · escudos e juramentos',
  color:'#9ecff5',names:['Aureon','Ser Halden','Valéria','Dorven','Galdor','Eryssa','Leomar','Elmar','Vesper','Astreon']}
});
const EPITHETS=['do Eclipse','da Aurora','das Cinzas'];
const ARMOR=['aço sombrio','bronze ancestral','prata rúnica','couro nobre','ferro rubro','obsidiana'];
const COLORS=['#dc8767','#9b82ed','#66c6bb','#dfbd76','#88a7ec','#cd7c9d','#9ad18b','#db9863','#96bbd9','#bd9aaa'];
const BADGES=['✦','◆','❖','✧','⟡','✶'];
const list=[];
for(const [klass,info] of Object.entries(CLASSES)){
 for(let index=0;index<10;index++){
  const i=index%10,epoch=0;
  const number=String(index+1).padStart(2,'0');
  const entry={
   id:klass+'-'+number,klass,role:info.role,name:info.names[i]+' '+EPITHETS[epoch],
   baseModelId:info.baseModelId,variant:index,
   accent:COLORS[(i*3+epoch+Object.keys(CLASSES).indexOf(klass))%COLORS.length],
   armor:ARMOR[(i+epoch*2)%ARMOR.length],badge:BADGES[(i+epoch)%BADGES.length],
   cape:(index%3!==1),headpiece:(index+epoch)%4,
   metal:epoch,license:'CC0-1.0',previewReady:true
  };
  list.push(Object.freeze(entry));
 }
}
const AVATARS=Object.freeze(list),BY_ID=new Map(AVATARS.map(a=>[a.id,a]));
function forClass(klass){return AVATARS.filter(a=>a.klass===klass)}
function get(id){return BY_ID.get(String(id||''))||null}
function assignedClass(studentId){
 const match=/^aluno-(0[1-9]|[12][0-9]|30)$/.exec(String(studentId||''));
 if(!match)return null;
 return Object.keys(CLASSES)[(Number(match[1])-1)%4];
}
function sanitizeClaims(input){
 const usedStudents=new Set(),usedAvatars=new Set(),clean=[];
 for(const c of Array.isArray(input)?input:[]){
  if(!c||typeof c!=='object')continue;
  const studentId=String(c.studentId||''),avatarId=String(c.avatarId||'');
  const avatar=get(avatarId);
  if(!avatar||assignedClass(studentId)!==avatar.klass)continue;
  if(usedStudents.has(studentId)||usedAvatars.has(avatarId))continue;
  usedStudents.add(studentId);usedAvatars.add(avatarId);
  clean.push(Object.freeze({studentId,avatarId,klass:avatar.klass}));
 }
 return clean;
}
function reserve(existing,studentId,avatarId){
 const requiredClass=assignedClass(studentId);
 if(!requiredClass)return {ok:false,error:'Aluno de demonstração inválido'};
 const avatar=get(avatarId);
 if(!avatar)return {ok:false,error:'Personagem não cadastrado'};
 if(avatar.klass!==requiredClass)return {ok:false,error:'O aluno deve escolher um personagem da classe atribuída: '+CLASSES[requiredClass].label};
 const claims=sanitizeClaims(existing);
 const taken=claims.find(c=>c.avatarId===avatarId&&c.studentId!==studentId);
 if(taken)return {ok:false,error:'Este personagem já foi escolhido por outro aluno',owner:taken.studentId,claims};
 // Changing a student's character releases their former avatar in the same room.
 const next=[...claims.filter(c=>c.studentId!==studentId),Object.freeze({studentId,avatarId,klass:avatar.klass})];
 return {ok:true,claims:next,avatar};
}
function release(existing,studentId){
 return sanitizeClaims(existing).filter(c=>c.studentId!==studentId);
}
return Object.freeze({CLASSES,AVATARS,get,forClass,assignedClass,sanitizeClaims,reserve,release});
});

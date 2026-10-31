/* V5 interactive Forge: 4 classes x 30 catalog options, 3 free-mixing paths.
 * Uses live project JSON design catalogs. Preview only; no grades, XP or server writes.
 */
const RULES=window.PIT_V5_FORGE,ENGINE=window.PIT_V5_PHASE2;
const root=document.querySelector('#forgeWorkshop');
const $=id=>document.getElementById(id);
const cls={warrior:'Guerreiro',mage:'Arcanista',hunter:'Caçador',guardian:'Guardião'};
const names={FOR:'Força',DES:'Destreza',INT:'Inteligência',VIT:'Vitalidade',DEF:'Defesa'};
const mood={warrior:'Cinzas e aço',mage:'Runas e tormentas',hunter:'Pontaria e sombras',guardian:'Luz e juramentos'};
const catalogs=new Map(),drafts=new Map(),tabs=new Map();
let klass='warrior',activeTree='Todos',ready=false,notice='';
const node=(tag,text,klassName)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(klassName)e.className=klassName;return e};
const append=(parent,...children)=>{parent.append(...children);return parent};
const message=(text,warning=false)=>{notice=text;const el=$('forgeFeedback');el.textContent=text;el.dataset.warning=String(warning)};
const catalog=()=>catalogs.get(klass);
const draft=()=>drafts.get(klass);
const activeIds=()=>ENGINE?.TALENTS?.[klass]?.map(t=>t.id)||[];
function safeValidate(){try{return RULES.validate(draft(),catalog())}catch(error){message(error.message,true);return null}}
function showClass(id){
 if(!cls[id])return;
 klass=id;activeTree='Todos';
 if(!ready){$('forgeTitle').textContent='Carregando catálogo de talentos…';return}
 render();
}
function modify(fn,good='Rascunho atualizado, sem alterações nas missões oficiais.'){
 try{drafts.set(klass,fn(draft(),catalog()));message(good);render()}
 catch(error){message(error.message,true)}
}
function updateMission(n){
 const old=draft();
 modify(d=>RULES.setMissions(d,n,catalog()),n<old.missions?
  'Missão reduzida: escolhas e atributos excedentes foram retirados do rascunho local.':
  'Etapa simulada: a missão '+n+' ainda não foi verificada pelo professor.');
}
function renderHeader(){
 const d=draft(),v=safeValidate();if(!v)return;
 $('forgeTitle').textContent=cls[klass]+' · '+mood[klass];
 $('forgeSubtitle').textContent='30 talentos · 3 caminhos · misture livremente as suas escolhas';
 $('forgeMissionNumber').textContent=String(d.missions).padStart(2,'0');
 $('forgeMissionRange').value=String(d.missions);
 $('forgeMissionRange').setAttribute('aria-valuetext','Missão '+d.missions+' (apenas simulação)');
 for(const id of ['forgeM5','forgeM10'])$(id).setAttribute('aria-pressed',String(d.missions===(id==='forgeM5'?5:10)));
 $('forgePoints').textContent=v.pointsUsed+' / '+RULES.budget(d.missions).attributes;
 $('forgeChosen').textContent=v.slotsUsed+' / '+RULES.budget(d.missions).talents;
 $('forgeRemaining').textContent=v.slotsLeft+' escolha(s) de talento disponível(is)';
 root.dataset.klass=klass;root.dataset.mission=String(d.missions);
 const test=RULES.executable(d,activeIds(),catalog());
 $('forgeTryM5').disabled=!test.ok;
 $('forgeTryM5').title=test.reason;
 $('forgeTrialHint').textContent=test.reason;
 $('forgeExport').disabled=false;
}
function renderAttributes(){
 const d=draft(),v=RULES.validate(d,catalog()),host=$('forgeAttributeList');
 host.replaceChildren();
 for(const key of RULES.ATTR){
  const row=node('div',undefined,'forge-attribute');
  const label=node('div',undefined,'forge-stat-name');
  append(label,node('strong',names[key]),node('small',key));
  const change=node('div',undefined,'forge-stat-stepper');
  const less=node('button','−');less.type='button';less.dataset.stat=key;less.dataset.change='-1';less.setAttribute('aria-label','Remover ponto de '+names[key]);less.disabled=d.attributes[key]===0;
  const value=node('output',String(d.attributes[key]));value.setAttribute('aria-label','Pontos em '+names[key]);
  const more=node('button','+');more.type='button';more.dataset.stat=key;more.dataset.change='1';more.setAttribute('aria-label','Adicionar ponto de '+names[key]);more.disabled=d.attributes[key]>=12||v.pointsLeft===0;
  append(change,less,value,more);append(row,label,change);host.append(row);
 }
}
function renderSlots(){
 const host=$('forgeSelectedSlots'),d=draft();
 host.replaceChildren();
 for(let i=0;i<d.missions;i++){
  const id=d.talents[i],t=id?catalog().talents.find(t=>t.id===id):null;
  const slot=node('div',undefined,'forge-slot'+(t?' occupied':''));
  const index=node('span',String(i+1).padStart(2,'0'),'forge-slot-index');
  const title=node('span',t?t.name:'Espaço de talento disponível','forge-slot-name');
  append(slot,index,title);
  if(t){
   const remove=node('button','×');remove.type='button';remove.dataset.removeTalent=id;remove.setAttribute('aria-label','Retirar '+t.name);slot.append(remove);
  }
  host.append(slot);
 }
}
function renderTreeFilter(){
 const host=$('forgeTreeFilters'),paths=[...new Set(catalog().talents.map(t=>t.tree))],choices=['Todos',...paths];
 host.replaceChildren();
 for(const tree of choices){
  const btn=node('button',tree,tree==='Todos'?'forge-filter-all':'');
  btn.type='button';btn.dataset.tree=tree;btn.setAttribute('aria-pressed',String(activeTree===tree));
  host.append(btn);
 }
}
function renderTalents(){
 const d=draft(),host=$('forgeTalentGrid'),titles=[...new Set(catalog().talents.map(t=>t.tree))];
 host.replaceChildren();
 for(const [index,path] of titles.entries()){
  if(activeTree!=='Todos'&&activeTree!==path)continue;
  const list=catalog().talents.filter(t=>t.tree===path);
  const section=node('section',undefined,'forge-tree');
  const heading=node('div',undefined,'forge-tree-head');
  append(heading,node('span','CAMINHO '+String(index+1).padStart(2,'0'),'forge-overline'),node('h3',path),node('span','10 talentos','forge-tree-count'));
  section.append(heading);
  const body=node('div',undefined,'forge-tree-items');
  for(const talent of list){
   const chosen=d.talents.includes(talent.id),supported=activeIds().includes(talent.id),full=d.talents.length>=d.missions;
   const btn=node('button',undefined,'forge-talent-card'+(chosen?' chosen':''));
   btn.type='button';btn.dataset.talent=talent.id;btn.setAttribute('aria-pressed',String(chosen));
   btn.disabled=!chosen&&full;
   btn.setAttribute('aria-label',(chosen?'Retirar ':'Escolher ')+talent.name+' de '+path);
   const first=node('div',undefined,'forge-talent-top');
   append(first,node('strong',talent.name),node('span',talent.id,'forge-talent-id'));
   const tags=node('div',undefined,'forge-talent-tags');
   append(tags,node('span',talent.type,'forge-type'),node('span',talent.primary+' / '+talent.secondary,'forge-attr-pill'),node('span',supported?'MOTOR ATIVO':'PLANEJADO',supported?'forge-implemented':'forge-planned'));
   append(btn,first,node('p',talent.effect),tags);
   if(chosen)btn.append(node('span','✓ ESCOLHIDO','forge-chosen-label'));
   body.append(btn);
  }
  section.append(body);host.append(section);
 }
}
function render(){
 if(!ready||!catalog())return;
 renderHeader();renderAttributes();renderSlots();renderTreeFilter();renderTalents();
}
root.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.talent)modify(d=>RULES.choose(d,button.dataset.talent,catalog()));
 else if(button.dataset.removeTalent)modify(d=>RULES.choose(d,button.dataset.removeTalent,catalog()));
 else if(button.dataset.tree){activeTree=button.dataset.tree;render()}
 else if(button.dataset.stat){modify(d=>RULES.invest(d,button.dataset.stat,Number(button.dataset.change),catalog()))}
});
$('forgeMissionRange').addEventListener('input',event=>updateMission(Number(event.target.value)));
$('forgeM5').addEventListener('click',()=>updateMission(5));
$('forgeM10').addEventListener('click',()=>updateMission(10));
$('forgeReset').addEventListener('click',()=>modify(()=>RULES.blank(klass,draft().missions),'Rascunho limpo; nenhuma nota ou progresso foi alterado.'));
$('forgeExport').addEventListener('click',()=>{
 try{
  const data=RULES.exportDraft(draft(),catalog());
  const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='forja-v5-'+klass+'-missao-'+draft().missions+'.json';
  document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
  message('Arquivo JSON exportado localmente. Ele não confirma missões e não bloqueia a build.');
 }catch(error){message(error.message,true)}
});
$('forgeTryM5').addEventListener('click',()=>{
 const d=draft(),elig=RULES.executable(d,activeIds(),catalog());
 if(!elig.ok){message(elig.reason,true);return}
 // URL is only an unauthenticated local preview transfer, NOT server-validated XP.
 const url=new URL('./arena-lab.html',location.href);
 url.searchParams.set('phase2','1');
 url.searchParams.set('draft',JSON.stringify({...d,name:'Minha build de teste'}));
 location.assign(url.toString());
});
async function loadCatalogs(){
 try{
  const list=await Promise.all(RULES.CLASSES.map(async id=>{
   const response=await fetch('./talents-'+id+'-plan.json',{cache:'no-store'});
   if(!response.ok)throw Error('HTTP '+response.status+' ao buscar '+id);
   const data=RULES.verifyCatalog(await response.json());
   if(data.klass!==id)throw Error('Classe incorreta no catálogo '+id);
   return data;
  }));
  for(const data of list){catalogs.set(data.klass,data);drafts.set(data.klass,RULES.blank(data.klass,5))}
  ready=true;render();
  message('Rascunho da missão 5 carregado. É uma simulação: missões aprovadas só podem ser verificadas pelo servidor.');
 }catch(error){
  $('forgeTitle').textContent='Catálogo indisponível';
  message('Não foi possível abrir os 120 talentos: '+String(error.message||error),true);
 }
}
loadCatalogs();
window.PIT_V5_FORGE_DEBUG=Object.freeze({
 get ready(){return ready},
 get selectedClass(){return klass},
 get mission(){return draft()?.missions||0},
 get options(){return catalog()?.talents?.length||0},
 get paths(){return catalog()?new Set(catalog().talents.map(t=>t.tree)).size:0},
 get draft(){return draft()?JSON.parse(JSON.stringify(draft())):null},
 get canTest(){return ready?RULES.executable(draft(),activeIds(),catalog()).ok:false},
 get planned(){return ready?draft().talents.filter(id=>!activeIds().includes(id)):[]}
});
export function selectForgeClass(id){showClass(id)}

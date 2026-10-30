/* PIT Game Jam IA V5 — H.1d STAGING ONLY UI.
 * No V3 token lookup, browser storage, production fallback or client-authoritative XP.
 * Session must be injected explicitly by a trusted, isolated staging harness.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const C=window.PIT_V5_HERO_V2_CLIENT;
 const catalog=window.PIT_V5_PHASE2?.TALENTS;
 const classes=[
  {id:'warrior',name:'Guerreiro',icon:'⚔',hint:'Coragem e dano direto'},
  {id:'mage',name:'Arcanista',icon:'✦',hint:'Magias e controle'},
  {id:'hunter',name:'Caçador',icon:'➶',hint:'Precisão à distância'},
  {id:'guardian',name:'Guardião',icon:'◆',hint:'Defesa e proteção'}
 ];
 const attrs=[
  {id:'FOR',name:'Força',hint:'Impacto e ataque'},
  {id:'DES',name:'Destreza',hint:'Movimento e precisão'},
  {id:'INT',name:'Intelecto',hint:'Poder das habilidades'},
  {id:'VIT',name:'Vitalidade',hint:'Sobrevivência'},
  {id:'DEF',name:'Defesa',hint:'Proteção e resistência'}
 ];
 const empty=()=>Object.fromEntries(attrs.map(a=>[a.id,0]));
 const clone=x=>structuredClone(x);
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const state={ready:false,busy:false,dirty:false,stale:false,profile:null,
  klass:'warrior',draft:{attributes:empty(),talents:[]},lastError:null,requests:0};
 let api=null;
 function info(message,kind='info'){
  $('feedback').textContent=message;
  $('feedback').dataset.kind=kind;
 }
 function approved(){return state.profile?.progress?.approvedMissions??0}
 function left(){
  const used=Object.values(state.draft.attributes).reduce((a,b)=>a+b,0);
  return {points:approved()*2-used,talents:approved()-state.draft.talents.length};
 }
 function snapshot(){return {ready:state.ready,busy:state.busy,dirty:state.dirty,
  stale:state.stale,revision:state.profile?.revision??null,
  approvedMissions:approved(),klass:state.klass,draft:clone(state.draft),
  arena:clone(state.profile?.arena??{}),duelWaiting:state.profile?.duel?.waiting??false,
  requests:state.requests,hasApi:!!api};}
 Object.defineProperty(window,'PIT_V5_H1D_LAB',{value:Object.freeze({
  get snapshot(){return snapshot();}
 }),configurable:false,writable:false});
 function markDirty(){
  const original=state.profile?.build;
  state.dirty=!original||original.klass!==state.klass||
   !same(original.attributes,state.draft.attributes)||
   !same(original.talents,state.draft.talents);
 }
 function apply(profile){
  if(profile?.schemaVersion!==2||
   !Number.isInteger(profile.revision)||profile.revision<0||
   !Number.isInteger(profile.progress?.approvedMissions)||
   profile.progress.approvedMissions<0||profile.progress.approvedMissions>10)
   throw Error('Perfil da API V2 inválido; não foram aplicadas alterações.');
  const klass=profile.build?.klass||'warrior';
  if(!classes.some(c=>c.id===klass))throw Error('Classe recebida não pertence à arena.');
  state.profile=clone(profile);
  state.klass=klass;
  state.draft={attributes:profile.build?.attributes?clone(profile.build.attributes):empty(),
   talents:profile.build?.talents?[...profile.build.talents]:[]};
  state.ready=true;state.dirty=false;state.stale=false;state.lastError=null;
  render();
 }
 async function load(force=false){
  if(!api||state.busy)return;
  if(state.dirty&&!force){
   info('Você tem escolhas não salvas. Salve ou clique em “Descartar rascunho” para carregar os dados atualizados.','error');
   return;
  }
  state.busy=true;render();
  try{
   state.requests++;
   const profile=await api.profile();
   apply(profile);
   info('Personagem sincronizado com a API V2 de homologação. Nenhum dado real foi utilizado.','success');
  }catch(e){state.lastError=e.message;info('Falha ao consultar o servidor: '+e.message,'error')}
  finally{state.busy=false;render()}
 }
 function verifyDraft(){
  if(!state.ready)throw Error('Aguarde o carregamento da sessão.');
  if(state.stale)throw Error('Personagem alterado em outra aba. Descarte seu rascunho e atualize.');
  const remaining=left();
  if(remaining.points<0||remaining.talents<0)throw Error('Pontos ou talentos excederam a missão.');
  if(state.draft.talents.some(id=>!catalog[state.klass].some(t=>t.id===id)))
   throw Error('O talento selecionado não pertence a essa classe.');
  const frozen=state.profile?.arena?.m5Snapshot;
  if(frozen){
   for(const a of attrs)if(state.draft.attributes[a.id]<frozen.attributes[a.id])
    throw Error('Atributos da Missão 5 estão congelados.');
   if(frozen.talents.some(t=>!state.draft.talents.includes(t)))
    throw Error('Talentos da Missão 5 estão congelados.');
  }
 }
 async function write(action){
  if(!state.ready||state.busy||!api)return;
  try{verifyDraft()}catch(e){info(e.message,'error');return}
  if(action!=='save'&&state.dirty){
   info('Salve suas escolhas antes de confirmar a entrada na arena.','error');return;
  }
  if(action==='save'&&!state.dirty){info('Seu personagem já está sincronizado.','success');return}
  state.busy=true;render();
  try{
   state.requests++;
   const rev=state.profile.revision;
   const updated=action==='save'
    ?await api.save({klass:state.klass,attributes:clone(state.draft.attributes),
      talents:[...state.draft.talents]},rev)
    :action==='enter-m5'?await api.enterM5(rev):await api.lockM10(rev);
   apply(updated);
   info(action==='save'?'Build V2 salva no servidor de homologação.':
    action==='enter-m5'?'Entrada na Missão 5 registrada; escolhas congeladas.':
    'Build da Missão 10 bloqueada no servidor.','success');
  }catch(e){
   if(e.status===409){
    state.stale=true;
    info('Conflito: o personagem foi alterado em outro navegador. Seu rascunho foi preservado aqui. Use “Descartar rascunho” para carregar a versão mais recente.','error');
   }else if(e.status===401){
    info('Sua sessão de homologação expirou. Reentre com uma sessão de teste válida.','error');
   }else info('Operação rejeitada: '+e.message,'error');
   state.lastError=e.message;
  }finally{state.busy=false;render()}
 }
 function chooseClass(id){
  if(!state.ready||state.busy||state.stale||state.profile?.build)return;
  if(!catalog[id])return;
  state.klass=id;state.draft={attributes:empty(),talents:[]};
  markDirty();render();
 }
 function attribute(id,delta){
  if(!state.ready||state.busy||state.stale||state.profile?.arena?.m10Locked)return;
  if(!attrs.some(a=>a.id===id))return;
  const value=state.draft.attributes[id];
  if(delta>0&&left().points<=0)return;
  const min=state.profile?.arena?.m5Snapshot?.attributes?.[id]||0;
  if(delta<0&&value<=min)return;
  state.draft.attributes[id]=value+delta;
  markDirty();render();
 }
 function talent(id){
  if(!state.ready||state.busy||state.stale||state.profile?.arena?.m10Locked)return;
  if(!catalog[state.klass].some(t=>t.id===id))return;
  const index=state.draft.talents.indexOf(id);
  const frozen=state.profile?.arena?.m5Snapshot?.talents||[];
  if(index>=0){
   if(frozen.includes(id))return;
   state.draft.talents.splice(index,1);
  }else{
   if(left().talents<=0)return;
   state.draft.talents.push(id);
  }
  markDirty();render();
 }
 function render(){
  const remaining=left(),locked=!!state.profile?.arena?.m10Locked;
  const frozen=state.profile?.arena?.m5Snapshot||null;
  const working=!state.ready||state.busy||state.stale;
  const chosen=classes.find(c=>c.id===state.klass)||classes[0];
  $('missionNumber').textContent=state.ready?approved()+' de 10':'—';
  $('pointsLeft').textContent=state.ready?remaining.points:'—';
  $('talentsLeft').textContent=state.ready?remaining.talents:'—';
  $('revision').textContent=state.profile?.revision??'—';
  $('classGrid').innerHTML=classes.map(c=>
   '<button class="class-option" data-action="class" data-id="'+c.id+
   '" type="button" aria-pressed="'+(c.id===state.klass)+'" '+
   (working||locked||(state.profile?.build&&c.id!==state.klass)?'disabled':'')+
   '><span class="class-icon" aria-hidden="true">'+c.icon+
   '</span><span><strong>'+c.name+'</strong><small>'+c.hint+
   '</small></span></button>').join('');
  $('attributes').innerHTML=attrs.map(a=>{
   const min=frozen?.attributes?.[a.id]||0;
   return '<div class="attribute"><div class="attr-name">'+a.name+'<small>'+
    a.hint+(min?' · M5: '+min+' fixos':'')+'</small></div>'+
    '<div class="attribute-controls"><button type="button" class="square-button" '+
    'data-action="minus" data-id="'+a.id+'" aria-label="Diminuir '+a.name+'" '+
    (working||locked||state.draft.attributes[a.id]<=min?'disabled':'')+
    '>−</button><strong>'+state.draft.attributes[a.id]+'</strong>'+
    '<button type="button" class="square-button" data-action="plus" data-id="'+a.id+
    '" aria-label="Aumentar '+a.name+'" '+(working||locked||remaining.points<=0?'disabled':'')+
    '>+</button></div></div>';
  }).join('');
  $('talents').innerHTML=catalog?catalog[state.klass].map(t=>{
   const active=state.draft.talents.includes(t.id);
   const frozenTalent=!!frozen?.talents?.includes(t.id);
   const disabled=working||locked||(active&&frozenTalent)||(!active&&remaining.talents<=0);
   return '<button type="button" class="talent" data-action="talent" data-id="'+t.id+
    '" aria-pressed="'+active+'" '+(disabled?'disabled':'')+'><strong>'+
    t.name+'</strong><small>'+t.id+' · '+t.type+(frozenTalent?' · M5':'')+
    '</small></button>';
  }).join(''):'';
  $('progressInfo').innerHTML=
   '<div class="progress-line"><span>Classe</span><strong>'+chosen.name+'</strong></div>'+
   '<div class="progress-line"><span>XP-base validado pelo servidor</span><strong>'+
    (state.ready?state.profile.progress.approvedBaseXp:'—')+'</strong></div>'+
   '<div class="progress-line"><span>Missão 5</span><strong>'+
    (frozen?'TRAVADA':'AGUARDANDO')+'</strong></div>'+
   '<div class="progress-line"><span>Missão 10</span><strong>'+
    (locked?'TRAVADA':'AGUARDANDO')+'</strong></div>'+
   '<div class="progress-line"><span>Rascunho não salvo</span><strong>'+
    (state.dirty?'SIM':'NÃO')+'</strong></div>'+
   '<div class="progress-line"><span>Conflito com outra aba</span><strong>'+
    (state.stale?'SIM':'NÃO')+'</strong></div>';
  $('saveBuild').disabled=working||locked||!state.dirty;
  $('reloadProfile').disabled=!api||state.busy;
  $('discardDraft').disabled=!api||state.busy;
  $('freezeM5').disabled=working||locked||approved()!==5||!!frozen||state.dirty;
  $('lockM10').disabled=working||locked||approved()!==10||!frozen||state.dirty;
  $('duelOptIn').checked=false;
  $('duelStatus').textContent=state.profile?.duel?.waiting
   ?'Missão concluída/entregue: poderá participar de duelos quando o professor habilitar. Convites ainda não disponíveis.'
   :'Missão em andamento. O sistema de convites 1×1 será implementado depois.';
 }
 document.body.addEventListener('click',event=>{
  const target=event.target.closest('button[data-action]');if(!target)return;
  const {id,action}=target.dataset;
  if(action==='class')chooseClass(id);
  else if(action==='plus')attribute(id,1);
  else if(action==='minus')attribute(id,-1);
  else if(action==='talent')talent(id);
 });
 $('saveBuild').addEventListener('click',()=>write('save'));
 $('freezeM5').addEventListener('click',()=>write('enter-m5'));
 $('lockM10').addEventListener('click',()=>write('lock-m10'));
 $('reloadProfile').addEventListener('click',()=>load(false));
 $('discardDraft').addEventListener('click',()=>load(true));
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&api&&!state.dirty&&!state.busy)void load(false);
 });
 window.addEventListener('pageshow',event=>{
  if(event.persisted&&api&&!state.dirty&&!state.busy)void load(false);
 });
 render();
 if(!C||!catalog||classes.some(c=>catalog[c.id]?.length!==30)){
  info('Catálogo ou cliente V2 ausente. Nenhuma conexão será iniciada.','error');
  return;
 }
 // Explicit trusted harness ONLY. No URL credential, global V3 storage,
 // classroom token auto-discovery or real API fallback.
 const local=['localhost','127.0.0.1'].includes(window.location.hostname);
 let config=window.__PIT_V5_H1D_STAGING;
 if(local&&!config&&window.parent!==window){
  try{
   const b=window.parent.__PIT_V5_H1E_BRIDGE;
   if(window.parent.location.origin===location.origin&&b?.enabled===true&&
      b.role==='student'&&typeof b.tokenProvider==='function')
    config={enabled:true,endpoint:b.heroEndpoint,tokenProvider:b.tokenProvider};
  }catch{}
 }
 if(!local||!config||config.enabled!==true||
  typeof config.tokenProvider!=='function'||
  typeof config.endpoint!=='string'){
  info('H.1d aguardando um ambiente de homologação local com sessão de teste autorizada. Para experimentar sem conta, use a prévia H.1c.','info');
  return;
 }
 try{
  api=C.createClient({endpoint:config.endpoint,tokenProvider:config.tokenProvider});
  info('Conectando ao servidor isolado de homologação…');
  void load(true);
 }catch(e){info('Configuração de homologação inválida: '+e.message,'error')}
})();

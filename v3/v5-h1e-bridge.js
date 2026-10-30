/* PIT Game Jam IA — H.1e bridge for Sunday visual acceptance.
 * Read-only integration with the approved V3 mission sequence.
 * An explicitly injected, localhost-only staging contract may optionally
 * connect the existing student identity to V2 APIs. Public previews NEVER
 * pass tokens to subframes or call the duel APIs.
 */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 })[c]).slice(0,160);
 const params=new URLSearchParams(location.search);
 const previewRequested=params.get('preview')==='1'||params.get('v5lab')==='1';
 const local=['localhost','127.0.0.1'].includes(location.hostname);
 const provided=window.__PIT_V5_H1E_STAGING;
 const staging=local&&provided?.enabled===true&&provided?.environment==='fictional-only';
 const TABS={
  student:[
   {key:'hero',label:'✦ MEU HERÓI',src:'./v5/hero-lab-h1c.html',live:'./v5/hero-lab-h1d.html'},
   {key:'duel',label:'⚔ DUELOS',src:'./v5/duel-lab-d1a.html',live:'./v5/duel-lobby-d1c.html'},
   {key:'arena',label:'🎥 ARENA 3D',src:'./v5/duel-replay-d1b.html?demo=1'}
  ],
  teacher:[
   {key:'teacher',label:'♛ CONTROLE',src:'./v5/duel-teacher-d1c.html?demo=1',live:'./v5/duel-teacher-d1c.html'},
   {key:'arena',label:'🎥 ARENA 3D',src:'./v5/duel-replay-d1b.html?demo=1'}
  ]
 };
 let context={role:document.body.dataset.role==='teacher'?'teacher':'student',
  stage:1,status:null,approved:0,authenticated:false,visualPreview:false},
 tokenProvider=null,lastFocus=null,currentTab=null,tabFrame=null,focusable=[];
 const hub=document.createElement('section');
 hub.className='pit-v5-h1e-overlay';
 hub.id='pitV5Hub';
 hub.hidden=true;
 hub.setAttribute('role','dialog');
 hub.setAttribute('aria-modal','true');
 hub.setAttribute('aria-label','Forja e Salão de Duelos V5');
 hub.innerHTML=
  '<div class="pit-v5-h1e-shell">'+
   '<header class="pit-v5-h1e-head">'+
    '<div><small>✦ PIT GAME JAM IA V5 · INTEGRAÇÃO EXPERIMENTAL</small>'+
    '<h2 id="pitV5HubTitle">Forja &amp; Coliseu</h2></div>'+
    '<button id="pitV5HubClose" type="button" aria-label="Fechar a experiência V5">✕ SAIR</button></header>'+
   '<div id="pitV5HubSafety" class="pit-v5-h1e-safety" role="status" aria-live="polite"></div>'+
   '<nav id="pitV5HubTabs" class="pit-v5-h1e-tabs" aria-label="Ferramentas da arena V5"></nav>'+
   '<p id="pitV5HubStatus" class="pit-v5-h1e-status" role="status" aria-live="polite"></p>'+
   '<iframe id="pitV5HubFrame" title="Ferramenta V5" loading="eager" allow="autoplay"></iframe>'+
   '<footer>Esta experiência não altera a ordem das 10 missões, as notas ou o XP.</footer>'+
  '</div>';
 document.body.appendChild(hub);
 const frame=$('pitV5HubFrame'),nav=$('pitV5HubTabs'),openButton=$('pitV5HubButton'),
   closeButton=$('pitV5HubClose'),statusNode=$('pitV5HubStatus'),safety=$('pitV5HubSafety');
 const allowedToDuel=()=>context.visualPreview||
  ['submitted','approved'].includes(context.status);
 const isLive=()=>staging&&context.authenticated&&!context.visualPreview;
 function statusText(){
  if(context.role==='teacher')
   return 'Professor · missão liberada '+context.stage+' / 10. Controle docente sem acesso a notas.';
  const progress='Missão '+context.stage+' / 10 · '+context.approved+' aprovada(s)';
  if(context.visualPreview)return progress+' · MODO VISUAL FICTÍCIO';
  if(!context.authenticated)return progress+' · aguardando identificação';
  return progress+' · '+(allowedToDuel()?'entrega concluída; pode solicitar duelos':
   'ainda em atividade; conclua e entregue para liberar duelos');
 }
 function updateSafety(){
  safety.textContent=isLive()?
   'HOMOLOGAÇÃO COM DADOS FICTÍCIOS: API isolada habilitada por configuração local. A produção permanece desligada.':
   'PRÉVIA FICTÍCIA: forja, convites e arena demonstrativos. Nenhuma conta real, token, PIN ou XP é enviado.';
  statusNode.textContent=statusText();
  if(openButton){
   openButton.hidden=!context.visualPreview&&!context.authenticated&&!previewRequested;
   openButton.disabled=false;
  }
 }
 function clearFrame(){frame.removeAttribute('src');frame.title='Ferramenta V5';}
 const tabs=()=>TABS[context.role]||TABS.student;
 function chooseTab(key){
  const t=tabs().find(x=>x.key===key);
  if(!t)return;
  if(t.key==='duel'&&!allowedToDuel()&&!previewRequested){
   statusNode.textContent='Você ainda está fazendo a missão. Entregue seu trabalho para liberar desafios.';
   return;
  }
  const url=isLive()&&t.live?t.live:t.src;
  const resolved=new URL(url,location.href);
  if(resolved.origin!==location.origin)return;
  currentTab=key;
  if(frame.getAttribute('src')!==url)frame.setAttribute('src',url);
  frame.title=t.label.replace(/[^p{L}d ]/gu,'').trim()+' — PIT Game Jam V5';
  nav.querySelectorAll('button').forEach(b=>{
   const selected=b.dataset.tab===key;
   b.setAttribute('aria-selected',String(selected));
   b.tabIndex=selected?0:-1;
   b.classList.toggle('selected',selected);
  });
  statusNode.textContent=statusText();
 }
 function open(preferred){
  if(openButton?.hidden)return;
  const gallery=$('missionGallery');
  if(gallery?.classList.contains('open')){
   const close=$('missionGalleryClose');
   close?.click();
  }
  lastFocus=document.activeElement;
  hub.hidden=false;
  document.body.classList.add('pit-v5-h1e-active');
  updateSafety();
  nav.replaceChildren();
  for(const tab of tabs()){
   const b=document.createElement('button');
   b.type='button';b.dataset.tab=tab.key;b.textContent=tab.label;
   b.setAttribute('role','tab');b.setAttribute('aria-selected','false');
   b.disabled=tab.key==='duel'&&!allowedToDuel()&&!previewRequested;
   b.addEventListener('click',()=>chooseTab(tab.key));
   nav.appendChild(b);
  }
  closeButton.focus();
  chooseTab(tabs().some(x=>x.key===preferred)?preferred:tabs()[0].key);
 }
 function close(){
  if(hub.hidden)return;
  hub.hidden=true;
  clearFrame();currentTab=null;
  document.body.classList.remove('pit-v5-h1e-active');
  lastFocus?.focus?.();
 }
 function update(value){
  if(!value||!['student','teacher'].includes(value.role))return;
  context={
   role:value.role,
   stage:Number.isInteger(value.stage)?Math.max(1,Math.min(10,value.stage)):1,
   status:['working','submitted','approved','revision'].includes(value.status)?
    value.status:null,
   approved:Number.isInteger(value.approved)?Math.max(0,Math.min(10,value.approved)):0,
   authenticated:value.authenticated===true,
   visualPreview:value.visualPreview===true
  };
  tokenProvider=typeof value.tokenProvider==='function'?value.tokenProvider:null;
  // Temporary, in-memory same-origin staging bridge. No student/PIN leaks
  // to other origins or into demo iframe URLs.
  delete window.__PIT_V5_H1E_BRIDGE;
  if(isLive()){
   if(context.role==='student'&&tokenProvider&&
    typeof provided.duelEndpoint==='string'&&
    typeof provided.matchEndpoint==='string'&&
    typeof provided.heroEndpoint==='string'){
    window.__PIT_V5_H1E_BRIDGE=Object.freeze({
     enabled:true,role:'student',tokenProvider,
     duelEndpoint:provided.duelEndpoint,
     matchEndpoint:provided.matchEndpoint,
     heroEndpoint:provided.heroEndpoint
    });
   }
   if(context.role==='teacher'&&typeof provided.teacherKeyProvider==='function'){
    window.__PIT_V5_H1E_BRIDGE=Object.freeze({
     enabled:true,role:'teacher',
     teacherEndpoint:provided.teacherEndpoint,
     keyProvider:provided.teacherKeyProvider
    });
   }
  }
  updateSafety();
  if(!hub.hidden){
   nav.querySelector('[data-tab="duel"]')?.toggleAttribute('disabled',
    !allowedToDuel()&&!previewRequested);
   if(currentTab==='duel'&&!allowedToDuel()&&!previewRequested)chooseTab('hero');
   else statusNode.textContent=statusText();
  }
 }
 closeButton.addEventListener('click',close);
 hub.addEventListener('click',ev=>{if(ev.target===hub)close()});
 document.addEventListener('keydown',ev=>{
  if(hub.hidden)return;
  if(ev.key==='Escape'){ev.stopImmediatePropagation();close();return}
  if(ev.key!=='Tab')return;
  const elements=[...hub.querySelectorAll('button:not([disabled]),iframe')];
  if(!elements.length)return;
  if(ev.shiftKey&&document.activeElement===elements[0]){
   ev.preventDefault();elements.at(-1).focus();
  }else if(!ev.shiftKey&&document.activeElement===elements.at(-1)){
   ev.preventDefault();elements[0].focus();
  }
 },true);
 openButton?.addEventListener('click',()=>open(context.role==='teacher'?'teacher':'hero'));
 updateSafety();
 Object.defineProperty(window,'PIT_V5_H1E',{value:Object.freeze({
  update,open,close,
  get snapshot(){return Object.freeze({...context,
   modalOpen:!hub.hidden,currentTab,connectedToStaging:isLive(),
   tokenExposed:false})}
 })});
})();

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
   {key:'hero',label:'✦ MEU HERÓI',native:true},
   {key:'duel',label:'⚔ DUELOS',src:'./v5/duel-lab-d1a.html',live:'./v5/duel-lobby-d1c.html'},
   {key:'duel3d',label:'⚔ DUELO 3D',src:'./v5/duel-window-lab.html'},
   {key:'arena',label:'🎥 ARENA 3D',src:'./v5/duel-replay-d1b.html?demo=1'}
  ],
  teacher:[
   {key:'teacher',label:'⚔ LIBERAR DUELOS',native:true},
   {key:'collective',label:'🏟 ARENAS M5/M10',native:true}
  ]
 };
 let context={role:document.body.dataset.role==='teacher'?'teacher':'student',
  stage:1,status:null,approved:0,authenticated:false,visualPreview:false,
  studentId:null,studentName:'',room:'PITGAME26'},
 tokenProvider=null,teacherPinProvider=null,lastFocus=null,currentTab=null,tabFrame=null,focusable=[];
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
    '<div><small id="pitV5HubEdition">✦ PIT GAME JAM IA V5</small>'+
    '<h2 id="pitV5HubTitle">Forja &amp; Coliseu</h2></div>'+
    '<button id="pitV5HubClose" type="button" aria-label="Fechar a experiência V5">✕ SAIR</button></header>'+
   '<div id="pitV5HubSafety" class="pit-v5-h1e-safety" role="status" aria-live="polite"></div>'+
   '<nav id="pitV5HubTabs" class="pit-v5-h1e-tabs" aria-label="Ferramentas da arena V5"></nav>'+
   '<p id="pitV5HubStatus" class="pit-v5-h1e-status" role="status" aria-live="polite"></p>'+
   '<iframe id="pitV5HubFrame" title="Ferramenta V5" loading="eager" allow="autoplay"></iframe>'+
   '<section id="pitV5TeacherPanel" class="pit-v5-teacher-panel" hidden aria-label="Gestão de duelos e arenas"></section>'+
   '<footer>Esta experiência não altera a ordem das 10 missões, as notas ou o XP.</footer>'+
  '</div>';
 document.body.appendChild(hub);
 const frame=$('pitV5HubFrame'),nav=$('pitV5HubTabs'),openButton=$('pitV5HubButton'),
   closeButton=$('pitV5HubClose'),statusNode=$('pitV5HubStatus'),safety=$('pitV5HubSafety'),
   teacherPanel=$('pitV5TeacherPanel'),edition=$('pitV5HubEdition');
 const allowedToDuel=()=>context.visualPreview||
  (isLive()&&['submitted','approved'].includes(context.status));
 const isLive=()=>staging&&context.authenticated&&!context.visualPreview;
 const productionLive=()=>location.origin==='https://dev-gabriel-exe.github.io'&&context.authenticated&&!context.visualPreview;
 function statusText(){
  if(context.role==='teacher')
   return 'Professor · Missão '+context.stage+' / 10 · controle da turma';
  const progress='Missão '+context.stage+' / 10 · '+context.approved+' aprovada(s)';
  if(context.visualPreview)return progress+' · MODO VISUAL FICTÍCIO';
  if(!context.authenticated)return progress+' · aguardando identificação';
  if(productionLive())return progress+' · duelos e arenas conectados à sua turma';
  return progress+' · '+(allowedToDuel()?'duelos habilitados em homologação':
   'duelos reais ainda sem sincronização com o servidor');
 }
 function updateSafety(){
  const isTeacher=context.role==='teacher';
  edition.textContent=isTeacher?'✦ PIT GAME JAM IA · PAINEL DO PROFESSOR':
   '✦ PIT GAME JAM IA · FORJA & COLISEU';
  safety.hidden=isTeacher;
  safety.textContent=isTeacher?'':productionLive()?
   'HERÓI E COLISEU: duelos 1 × 1 sincronizados e arenas M5/M10 iniciadas pelo professor; batalhas não atribuem XP.':isLive()?
   'HOMOLOGAÇÃO COM DADOS FICTÍCIOS: API isolada habilitada por configuração local. A produção permanece desligada.':
   context.visualPreview?'VISUALIZAÇÃO DE PRÉVIA: sem registros ou recompensas reais.':
   'MEU HERÓI REAL: a ficha é sincronizada com a conta no Neon. O código pessoal de retorno permite recuperá-la em outro computador; rascunhos locais são preservados.';
  statusNode.textContent=statusText();
  if(openButton){
   openButton.hidden=!context.visualPreview&&!context.authenticated&&!previewRequested;
   openButton.disabled=false;
  }
 }
 function clearFrame(){frame.removeAttribute('src');frame.title='Ferramenta V5';}
 const tabs=()=>context.role==='student'&&!context.visualPreview?
  TABS.student.filter(x=>productionLive()?['hero','duel','arena'].includes(x.key):x.key==='hero'):
  TABS[context.role]||TABS.student;
 function renderStudentHeroPanel(){
  if(!window.PIT_V5_REAL_HERO){
   teacherPanel.innerHTML='<p>Falha ao carregar a Forja. Atualize a página.</p>';
   return;
  }
  const key=context.room+'-'+context.studentId+'-'+context.approved;
  if(teacherPanel.dataset.heroKey===key&&teacherPanel.querySelector('.rhero-root'))return;
  teacherPanel.dataset.heroKey=key;
  window.PIT_V5_REAL_HERO.mount(teacherPanel,{...context,tokenProvider});
 }

 function renderTeacherPanel(key){
  if(context.role!=='teacher')return;
  if(productionLive()&&window.PIT_V5_LIVE?.mount(teacherPanel,{...context,teacherPinProvider},key))return;
  const level=context.stage;
  const status=context.authenticated?'EM PREPARAÇÃO':'SEM SESSÃO';
  const note='A comunicação de convites e partidas entre computadores ainda não está habilitada no servidor. '
   +'Por isso, os comandos de liberação permanecem bloqueados até que funcionem de verdade.';
  if(key==='collective'){
   teacherPanel.innerHTML=
    '<div class="pit-teacher-intro"><span>✦ COLISEU</span><h3>Arenas coletivas</h3>'+
    '<p>O professor iniciará a primeira arena na Missão 5 e a final na Missão 10.</p></div>'+
    '<div class="pit-teacher-grid">'+
    '<article><span>MISSÃO 05</span><h4>Primeiro confronto</h4><p>Missão '+(level>=5?'liberada':'ainda não liberada')+' para a turma.</p>'+
    '<button disabled title="Partida compartilhada ainda não habilitada">Liberar arena M5</button></article>'+
    '<article><span>MISSÃO 10</span><h4>Grande final</h4><p>Missão '+(level>=10?'liberada':'ainda não liberada')+' para a turma.</p>'+
    '<button disabled title="Partida compartilhada ainda não habilitada">Liberar arena M10</button></article></div>'+
    '<div class="pit-teacher-state" role="status"><strong>Partidas online pendentes de conexão</strong><p>'+note+'</p></div>'+
    '<button type="button" data-open-roster class="pit-teacher-go">👥 Consultar acompanhamento</button>';
  }else{
   teacherPanel.innerHTML=
    '<div class="pit-teacher-intro"><span>⚔ CONTROLE DOCENTE</span><h3>Duelo entre aventureiros</h3>'+
    '<p>Os desafios 1 × 1 poderão ser liberados pelo professor durante as pausas da oficina.</p></div>'+
    '<div class="pit-teacher-grid"><article><span>SITUAÇÃO DA TURMA</span>'+
    '<h4>Missão '+String(level).padStart(2,'0')+' / 10</h4>'+
    '<p>Os avanços e aprovações continuam registrados no acompanhamento da turma.</p></article>'+
    '<article><span>CONEXÃO DOS DUELOS</span><h4>'+status+'</h4>'+
    '<p>O controle só será habilitado após confirmação de uma partida sincronizada.</p></article></div>'+
    '<div class="pit-teacher-actions"><button type="button" disabled>⚔ Liberar duelos</button>'+
    '<button type="button" disabled>⏸ Pausar duelos</button></div>'+
    '<div class="pit-teacher-state" role="status"><strong>Duelos online ainda indisponíveis</strong>'+
    '<p>'+note+'</p></div>'+
    '<button type="button" data-open-roster class="pit-teacher-go">👥 Ver alunos e entregas</button>';
  }
  teacherPanel.querySelector('[data-open-roster]')?.addEventListener('click',()=>{
   close();document.getElementById('rosterButton')?.click();
  });
 }
 function renderStudentLive(key){
  if(!window.PIT_V5_LIVE?.mount(teacherPanel,{...context,tokenProvider},key))
   teacherPanel.textContent='Coliseu indisponível. Atualize esta página.';
 }
 function chooseTab(key){
  const t=tabs().find(x=>x.key===key);
  if(!t)return;
  if(['duel','duel3d'].includes(t.key)&&!allowedToDuel()&&!previewRequested&&!productionLive()){
   statusNode.textContent='Você ainda está fazendo a missão. Entregue seu trabalho para liberar desafios.';
   return;
  }
  window.PIT_V5_LIVE?.unmount();
  if(t.native||(productionLive()&&['duel','arena'].includes(t.key))){
   frame.hidden=true;
   frame.removeAttribute('src');
   teacherPanel.hidden=false;
   currentTab=key;
   if(context.role==='teacher')renderTeacherPanel(key);
   else if(productionLive()&&['duel','arena'].includes(key))renderStudentLive(key);
   else renderStudentHeroPanel();
  }else{
   teacherPanel.hidden=true;teacherPanel.replaceChildren();
   frame.hidden=false;
   const url=isLive()&&t.live?t.live:t.src;
   const resolved=new URL(url,location.href);
   if(resolved.origin!==location.origin)return;
   currentTab=key;
   if(frame.getAttribute('src')!==url)frame.setAttribute('src',url);
   frame.title=t.label+' — PIT Game Jam V5';
  }
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
   b.disabled=['duel','duel3d'].includes(tab.key)&&!allowedToDuel()&&!previewRequested&&!productionLive();
   b.addEventListener('click',()=>chooseTab(tab.key));
   nav.appendChild(b);
  }
  closeButton.focus();
  chooseTab(tabs().some(x=>x.key===preferred)?preferred:tabs()[0].key);
 }
 function close(){
  if(hub.hidden)return;
  hub.hidden=true;
  window.PIT_V5_LIVE?.unmount();
  clearFrame();teacherPanel.hidden=true;teacherPanel.replaceChildren();delete teacherPanel.dataset.heroKey;currentTab=null;
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
   visualPreview:value.visualPreview===true,
   studentId:typeof value.studentId==='string'?value.studentId:null,
   studentName:String(value.studentName||'Aventureiro').slice(0,56),
   room:['PITGAME26','PITGAME26B'].includes(value.room)?value.room:'PITGAME26'
  };
  tokenProvider=typeof value.tokenProvider==='function'?value.tokenProvider:null;
  teacherPinProvider=typeof value.teacherPinProvider==='function'?value.teacherPinProvider:null;
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
   for(const key of ['duel','duel3d'])nav.querySelector('[data-tab="'+key+'"]')?.toggleAttribute('disabled',
    !allowedToDuel()&&!previewRequested&&!productionLive());
   // In production, the Coliseum server (not localhost staging) authorizes duels.
   // The old condition auto-closed the live iframe during ordinary V3 state refreshes.
   if(['duel','duel3d'].includes(currentTab)&&!allowedToDuel()&&!previewRequested&&!productionLive())chooseTab('hero');
   else{statusNode.textContent=statusText();if(currentTab&&(tabs().find(t=>t.key===currentTab)?.native||(productionLive()&&['duel','arena'].includes(currentTab)))){
    if(context.role==='teacher')renderTeacherPanel(currentTab);
    else if(productionLive()&&['duel','arena'].includes(currentTab))renderStudentLive(currentTab);
    else renderStudentHeroPanel();
   }}
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

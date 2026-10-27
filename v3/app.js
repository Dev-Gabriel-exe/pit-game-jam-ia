(function(){
'use strict';
const MISSIONS=window.PIT_MISSIONS||[],BASE='https://pit-game-jam-chat.vercel.app/api/';
const role=document.body.dataset.role==='teacher'?'teacher':'student',TEACHER=role==='teacher';
const $=id=>document.getElementById(id),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phaseNames={briefing:'Entender',demo:'Assistir',practice:'Criar',review:'Comprovar'};
const phaseList=TEACHER?['briefing','demo','practice','review']:['briefing','practice','review'];
const stageThumbs=['#22bcff','#ffb865','#58f1c6','#f47fe4','#ae8cff','#ffe37f','#6edaef','#ff9598','#f5c68c','#ffdc72'];
const teacherContent=window.PIT_TEACHER_CONTENT||[];
const stageStatuses={working:'Em atividade',submitted:'Aguardando validação',approved:'Concluída ✓',revision:'Revisar entrega'};
let teacherPin=sessionStorage.getItem('pit_teacher_pin')||'';
let studentSession=null;try{studentSession=JSON.parse(localStorage.getItem('pit_chat_student_v09')||'null')}catch{}
let state={current_stage:1,phase:'briefing',updated_at:null},progress=[],roster=[],activeStage=1,activePhase='briefing';
let selectedThread=null,selectedRoster=null,chatOpen=false,chatTimer=null,rosterOpen=false,lastServerStage=1;
let lastUnread=0,rosterFilter='all',requestInFlight=false;
function stamp(){return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
function setToast(message,bad=false){const el=$('toast');el.textContent=message;el.hidden=false;el.style.borderColor=bad?'#fa7285':'#53dcb7';clearTimeout(setToast.timer);setToast.timer=setTimeout(()=>el.hidden=true,5300)}
async function call(service,action,method='GET',data=null){
 const u=new URL(BASE+service+'.js');u.pathname='/api/'+service;u.searchParams.set('action',action);
 const headers={'Content-Type':'application/json'};
 if(TEACHER&&teacherPin)headers['X-PIT-Teacher-Pin']=teacherPin;
 if(!TEACHER&&studentSession?.token)headers['X-PIT-Student-Token']=studentSession.token;
 const response=await fetch(u.toString(),{method,headers,body:method==='POST'?JSON.stringify(data||{}):undefined,cache:'no-store',signal:AbortSignal.timeout(15000)});
 let result;try{result=await response.json()}catch{throw Error('Serviço indisponível. Tente novamente.')}
 if(!response.ok||!result.ok)throw Error(result.error||'Erro ao comunicar com a oficina.');
 return result;
}
function mission(n=activeStage){return MISSIONS[n-1]||MISSIONS[0]}
function entry(n){return progress.find(p=>p.stage===n)||null}
function statusLabel(n){return stageStatuses[entry(n)?.status]||'Não iniciada'}
function renderJourney(){
 const list=$('journey');
 list.innerHTML=MISSIONS.map(m=>{
  const e=entry(m.n),locked=!TEACHER&&m.n>state.current_stage,selected=m.n===activeStage;
  const short=TEACHER?(m.n===state.current_stage?'ETAPA DA TURMA':'PRÉVIA'):e?.status==='approved'?'CONCLUÍDA':locked?'BLOQUEADA':e?.status==='submitted'?'AGUARDANDO AVALIAÇÃO':e?.status==='revision'?'REVISAR':e?.status==='working'?'EM PRODUÇÃO':m.n===state.current_stage?'DISPONÍVEL':'REVISAR';
  return '<button type="button" class="stage-btn '+(selected?'current ':'')+(locked?'locked ':'')+(e?.status==='approved'?'approved':'')+'" data-stage="'+m.n+'" aria-current="'+selected+'" '+(locked?'disabled':'')+'>'+
   '<span class="stage-poster" style="--mission-tint:'+stageThumbs[m.n-1]+'"><span class="stage-cover-index">'+String(m.n).padStart(2,'0')+'</span><span class="stage-emoji">'+m.icon+'</span></span>'+
   '<span class="stage-main"><span class="stage-time">'+esc(m.time)+'</span><strong>'+esc(m.title.toUpperCase())+'</strong><small>'+esc(m.subtitle)+'</small><em class="stage-state">'+esc(short)+'</em></span>'+
   '<span class="stage-status-dot" aria-hidden="true">'+(e?.status==='approved'?'✓':selected?'◆':locked?'🔒':'')+'</span></button>';
 }).join('');
 list.querySelectorAll('button[data-stage]').forEach(b=>b.onclick=()=>selectStage(Number(b.dataset.stage),false));
 const sel=list.querySelector('.current');
 if(sel)sel.scrollIntoView({block:'nearest',inline:'nearest'});
}
function renderRight(){
 const done=TEACHER?0:progress.filter(x=>x.status==='approved').length;
 $('progressText').textContent=TEACHER?'ETAPA '+String(state.current_stage).padStart(2,'0')+'/10':Math.round(done/10*100)+'%';
 $('progressCircle').style.borderColor=TEACHER?'#14759b':'#0e4863';
 $('progressLabel').textContent=TEACHER?'Sala PITGAME26 · '+phaseNames[state.phase]:'XP '+done*100+' / 1000 · '+done+' etapa(s) aprovadas';
 $('badgeList').innerHTML=MISSIONS.map(m=>{
  const isDone=!TEACHER&&entry(m.n)?.status==='approved';
  const isActive=m.n===state.current_stage;
  return '<div class="badge-item '+(isDone?'done':'')+'"><span class="dot"></span><span>'+m.icon+' '+esc(m.title)+(isActive&&!isDone?' · em curso':'')+'</span></div>'
 }).join('');
 $('roleSubtitle').textContent=TEACHER?'MISSION CONTROL · CONTROLE DIDÁTICO':'CREATOR MODE · MINHA JORNADA';
 $('roomState').textContent='TURMA · ETAPA '+String(state.current_stage).padStart(2,'0')+' · '+phaseNames[state.phase].toUpperCase();
}
function phaseButtons(){
 const labels=TEACHER?{briefing:'Conceitos',demo:'Exemplo em ação',practice:'Oficina liberada',review:'Resultados'}:{briefing:'Briefing',practice:'Construir',review:'Entregar'};
 $('phasebar').innerHTML=phaseList.map((p,i)=>'<button type="button" data-phase="'+p+'" class="'+(p===activePhase?'active':'')+'" aria-current="'+(p===activePhase)+'"><span class="step-count">'+String(i+1).padStart(2,'0')+'/'+String(phaseList.length).padStart(2,'0')+'</span>'+labels[p]+'</button>').join('');
 $('phasebar').querySelectorAll('[data-phase]').forEach(x=>x.onclick=()=>{activePhase=x.dataset.phase;renderMain()});
}
function cards(list){return list.map(([heading,description])=>'<div class="concept-card"><strong>'+esc(heading)+'</strong><p>'+esc(description)+'</p></div>').join('')}
function tasks(list){return list.map((text,i)=>'<div class="task-card"><span class="num">'+String(i+1).padStart(2,'0')+'</span><div><p>'+esc(text)+'</p></div></div>').join('')}

function getTeacherContent(m){return teacherContent[m.n-1]||null}
function visualSimulator(m){
 const info=getTeacherContent(m);
 if(!info)return '';
 const body=info.labels.map((label,i)=>'<div class="sim-cell '+(i===0?'sim-on':'')+'" data-sim-stage="'+i+'"><span class="sim-cell-index">0'+(i+1)+'</span><span class="sim-cell-symbol">'+['🎮','⚡','🏆'][i]+'</span><strong>'+esc(label)+'</strong><p>'+esc(info.details[i])+'</p></div>').join('');
 return '<section class="simulation" data-scene="'+esc(info.scene)+'"><div class="simulation-head"><span>◈ LABORATÓRIO VISUAL</span><span class="sim-counter" id="simCount">01 / 03</span></div><h3>'+esc(info.demoTitle)+'</h3><div class="sim-stage">'+body+'</div><div class="sim-bottom"><p id="simDescription">'+esc(info.details[0])+'</p><button id="simNext" type="button" class="action">▶ Executar exemplo</button></div></section>';
}
function conceptSlides(m){
 const info=getTeacherContent(m);
 const parts=(info?.concepts||m.theory.map(x=>[x[0],x[1],x[1],'']));
 return '<div class="cinematic-eyebrow">PIT GAME STUDIO / AULA '+String(m.n).padStart(2,'0')+'</div>'+
 '<div class="lesson-headline"><span class="lesson-big-number">'+String(m.n).padStart(2,'0')+'</span><h2>'+esc(info?.headline||m.title)+'</h2></div>'+
 '<p class="lesson-lead">'+esc(info?.lead||m.goal)+'</p>'+
 '<div class="learning-cards">'+parts.map((arr,i)=>'<article class="learning-card"><div class="learning-top"><span class="learning-index">0'+(i+1)+'</span><h3>'+esc(arr[0])+'</h3></div><p>'+esc(arr[1])+'</p><div class="learning-example"><span>EXEMPLO NO JOGO</span>'+esc(arr[2])+'</div><p class="learning-insight">'+esc(arr[3]||'Observe essa ideia no projeto e compare com a ação do jogador.')+'</p></article>').join('')+'</div>'+
 '<div class="concept-finale"><span aria-hidden="true">✦</span>'+esc(info?.close||m.goal)+'</div>';
}
function instructorDemo(m){
 const info=getTeacherContent(m);
 return '<div class="lesson-headline"><span class="lesson-big-number">'+String(m.n).padStart(2,'0')+'</span><h2>'+esc(info?.demoTitle||'Exemplo em ação')+'</h2></div>'+
 '<p class="lesson-lead">Observe o que muda a cada ação. Cada transformação corresponde a uma regra ou operação que também pode ser construída no GDevelop.</p>'+
 visualSimulator(m)+
 '<h3 class="section-label">Do exemplo visual ao GDevelop</h3>'+
 '<div class="teacher-walkthrough">'+m.demo.map((line,i)=>'<article><span>0'+(i+1)+'</span><p>'+esc(line)+'</p></article>').join('')+'</div>'+
 '<div class="lesson-finale">O resultado esperado desta etapa: <strong>'+esc(m.deliver)+'</strong></div>';
}
function instructorPractice(m){
 return '<div class="lesson-headline"><span class="lesson-big-number">'+String(m.n).padStart(2,'0')+'</span><h2>'+esc(m.title)+'</h2></div>'+
 '<p class="lesson-lead">'+esc(m.goal)+'</p><div class="practice-intro"><strong>MISSÃO NO EDITOR</strong><span>'+esc(m.route)+'</span></div>'+
 '<h3 class="section-label">Três movimentos para construir</h3>'+tasks(m.steps)+
 '<div class="practice-outcome"><strong>PROVA DE CONCLUSÃO</strong><p>'+esc(m.deliver)+'</p></div>'+
 '<div class="teacher-grid-bottom"><div><strong>ERRO FREQUENTE</strong><p>'+esc(m.help)+'</p></div><div><strong>PRÓXIMA FRONTEIRA</strong><p>'+esc(getTeacherContent(m)?.close||'Avance quando o resultado estiver funcionando.')+'</p></div></div>';
}
function instructorResults(m){
 return '<div class="lesson-headline"><span class="lesson-big-number">✓</span><h2>O que foi construído?</h2></div>'+
 '<p class="lesson-lead">'+esc(m.deliver)+'</p>'+
 '<h3 class="section-label">Critérios observáveis de aprendizagem</h3>'+
 m.checks.map((x,i)=>'<div class="result-criterion"><span>0'+(i+1)+'</span><strong>'+esc(x)+'</strong></div>').join('')+
 '<div class="practice-outcome"><strong>APRESENTAÇÃO DE RESULTADOS</strong><p>O projeto e sua execução no Preview comprovam o resultado. As evidências enviadas ficam disponíveis em 👥 Acompanhamento, onde é possível aprovar ou solicitar revisão individual.</p></div>';
}
function savedChecks(n){try{const v=JSON.parse(localStorage.getItem('pit_v3_checks_'+n)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function studentTasks(m){
 const checked=savedChecks(m.n);
 return '<div class="build-steps">'+m.steps.map((step,i)=>'<label class="build-step '+(checked.includes(i)?'checked':'')+'"><span class="build-index">'+String(i+1).padStart(2,'0')+'</span><span class="build-text"><strong>'+esc(['PREPARAR','CONSTRUIR','TESTAR'][i]||'PRATICAR')+'</strong><span>'+esc(step)+'</span><small>Resultado observado: '+esc(m.checks[i]||m.deliver)+'</small></span><input type="checkbox" data-step-check="'+i+'" '+(checked.includes(i)?'checked':'')+' aria-label="Concluí o passo '+(i+1)+'"></label>').join('')+'</div>';
}
function studentBrief(m){
 const isReleased=m.n<=state.current_stage;
 return '<div class="stage-story"><span class="stage-story-kicker">MISSÃO '+String(m.n).padStart(2,'0')+' · '+m.minutes+' MINUTOS</span><h2>'+esc(m.title.toUpperCase())+'</h2><p>'+esc(m.subtitle)+'</p><div class="story-objective"><strong>🎯 SEU OBJETIVO</strong>'+esc(m.goal)+'</div>'+
 '<div class="story-reward"><span>🏆 MISSÃO CONCLUÍDA QUANDO</span><strong>'+esc(m.deliver)+'</strong></div>'+
 '<p class="story-wait">'+(isReleased?'Prepare seu projeto. Siga para CONSTRUIR quando chegar a hora da prática.':'🔒 Aguarde a liberação desta missão pelo professor.')+'</p></div>';
}
function studentBuild(m){
 const canWork=m.n<=state.current_stage&& (m.n!==state.current_stage||['practice','review'].includes(state.phase));
 return '<div class="quest-kicker">MISSÃO '+String(m.n).padStart(2,'0')+' · OFICINA</div>'+
 '<h2 class="quest-title">Agora é sua vez de criar.</h2><p class="lesson-lead">'+esc(m.goal)+'</p>'+
 (!canWork?'<div class="notice gold">⏳ A prática ainda não foi liberada. Os passos estão disponíveis para você conhecer o objetivo; o envio só abre quando o professor autorizar.</div>':'')+
 studentTasks(m)+
 '<div class="quest-resource"><strong>◈ NO GDEVELOP / RECURSOS</strong><p>'+esc(m.route)+'</p><div class="buttonrow">'+m.tools.map(([label,href])=>'<a class="tool-link" href="'+esc(href)+'" target="_blank" rel="noopener">'+esc(label)+' ↗</a>').join('')+'</div></div>'+
 '<div class="quest-fallback"><strong>TRAVOU?</strong><p>'+esc(m.help)+'</p></div>'+
 '<div class="quest-evidence">'+studentWorkForm(m)+'</div>';
}
function studentDeliver(m){
 return '<div class="quest-kicker">MISSÃO '+String(m.n).padStart(2,'0')+' · VALIDAÇÃO</div><h2 class="quest-title">Conclua o que você começou.</h2>'+
 '<p class="lesson-lead">A entrega usa os mesmos três passos da oficina. Não existe uma segunda lista de perguntas: registre o resultado real do seu projeto.</p>'+
 studentTasks(m)+'<div class="quest-evidence">'+studentWorkForm(m)+'</div>';
}
function phaseBody(m){
 if(TEACHER){if(activePhase==='briefing')return conceptSlides(m);if(activePhase==='demo')return instructorDemo(m);if(activePhase==='practice')return instructorPractice(m);return instructorResults(m)}
 if(activePhase==='briefing'||activePhase==='demo')return studentBrief(m);
 if(activePhase==='practice')return studentBuild(m);
 return studentDeliver(m);
}
function studentWorkForm(m){
 const e=entry(m.n)||{};
 const draft=localStorage.getItem('pit_v2_draft_'+m.n);
 const evidence=draft!==null?draft:(e.evidence||'');
 const locked=m.n>state.current_stage||(m.n===state.current_stage&&!['practice','review'].includes(state.phase));
 const approved=e.status==='approved';
 return '<div class="concept-card"><strong>📋 Seu registro de atividade</strong>'+
  '<p>O que você fez ou testou? Descreva o resultado real. O professor poderá verificar e devolver comentários.</p>'+
  '<div class="formline"><label for="evidenceInput">Minha evidência</label><textarea id="evidenceInput" maxlength="750" '+(approved?'disabled':'')+' placeholder="Ex.: Consegui abrir o Preview e meu personagem se move com WASD.">'+esc(evidence)+'</textarea></div>'+
  '<div class="formline"><label for="routeSelect">Rota escolhida</label><select id="routeSelect" '+(approved?'disabled':'')+'><option value="2d" '+((e.route||'2d')==='2d'?'selected':'')+'>🎮 2D</option><option value="3d" '+(e.route==='3d'?'selected':'')+'>🧊 3D</option></select></div>'+
  '<div class="buttonrow"><button type="button" class="outline" id="startWork" '+(locked||approved?'disabled':'')+'>Registrar em andamento</button><button type="button" class="action" id="submitWork" '+(locked||approved?'disabled':'')+'>Enviar para validação</button></div>'+
  '<p class="step-hint">Situação: <span class="state-pill '+(e.status||'')+'">'+statusLabel(m.n)+'</span></p>'+
  (e.feedback?'<div class="notice gold"><b>Comentário do professor:</b> '+esc(e.feedback)+'</div>':'')+
  (locked&&!approved?'<div class="notice gold">⏳ Aguarde o professor liberar a prática desta etapa. Você já pode acompanhar a explicação e a demonstração.</div>':'')+
  (approved?'<div class="notice green">Missão validada! Você pode revisar o material enquanto aguarda a próxima etapa.</div>':'')+
  '</div>';
}
function renderMain(){
 const m=mission(),e=entry(m.n);
 $('missionNumber').textContent='ETAPA '+String(m.n).padStart(2,'0')+' / 10 · '+esc(m.time)+' · '+m.minutes+' MINUTOS';
 $('missionTitle').textContent=m.icon+' '+m.title.toUpperCase();
 $('missionSubtitle').textContent=m.subtitle;
 $('mainContent').innerHTML=phaseBody(m);
 phaseButtons();
 if(TEACHER){
  // Pré-visualizar é diferente de liberar: o botão azul compartilha a etapa/fase com a turma.
  $('missionStatus').textContent=m.n===state.current_stage?'ETAPA ATIVA · '+phaseNames[state.phase]: 'ETAPA '+String(m.n).padStart(2,'0')+' · PRÉVIA';
  $('missionStatus').className='state-pill';
  $('navPrimary').textContent=m.n===state.current_stage?'Atualizar fase da turma':'Iniciar etapa '+String(m.n).padStart(2,'0')+' para turma';
  $('navPrimary').disabled=false;
  $('navSecondary').textContent='Próxima etapa →';
  $('navSecondary').disabled=m.n>=10;
 }else{
  $('missionStatus').textContent=statusLabel(m.n);
  $('missionStatus').className='state-pill '+(e?.status||'');
  $('navPrimary').textContent=activePhase==='review'?'Conferir a entrega':'Próximo passo →';
  $('navPrimary').disabled=false;
  $('navSecondary').textContent='← Passo anterior';
  $('navSecondary').disabled=activePhase==='briefing';
 }
 const evidence=$('evidenceInput');
 if(evidence)evidence.oninput=()=>localStorage.setItem('pit_v2_draft_'+m.n,evidence.value);
 if($('startWork'))$('startWork').onclick=()=>sendWork('working');
 if($('submitWork'))$('submitWork').onclick=()=>sendWork('submitted');
}
function renderAll(){renderJourney();renderRight();renderMain();}
function selectStage(n,fromServer=false){
 if(!Number.isInteger(n)||n<1||n>10||(!TEACHER&&n>state.current_stage))return;
 activeStage=n;activePhase=fromServer?state.phase:'briefing';
 renderAll();
 $('mainContent').scrollTop=0;
}
async function sendWork(status){
 const evidence=$('evidenceInput')?.value||'';
 const route=$('routeSelect')?.value||'2d';
 if(status==='submitted'&&evidence.trim().length<8)return setToast('Descreva sua evidência em pelo menos 8 caracteres.',true);
 try{
  const response=await call('classroom','progress','POST',{stage:activeStage,route,evidence,status});
  const index=progress.findIndex(p=>p.stage===activeStage);
  if(index>=0)progress[index]=response.progress;else progress.push(response.progress);
  localStorage.removeItem('pit_v2_draft_'+activeStage);
  renderAll();setToast(status==='submitted'?'Evidência enviada ao professor.':'Etapa marcada como em atividade.');
 }catch(e){setToast(e.message,true)}
}
async function teacherAdvance(stage,phase){
 try{
  const result=await call('classroom','stage','POST',{stage,phase});
  state=result.state;lastServerStage=state.current_stage;
  activeStage=stage;activePhase=phase;renderAll();
  setToast('Turma atualizada: etapa '+stage+' · '+phaseNames[phase]+'.');
 }catch(e){setToast(e.message,true)}
}
$('navPrimary').onclick=()=>{
 if(TEACHER)return teacherAdvance(activeStage,activePhase);
 const idx=phaseList.indexOf(activePhase);
 if(idx<3){activePhase=phaseList[idx+1];renderMain();$('mainContent').scrollTop=0;}
 else {$('mainContent').scrollTop=$('mainContent').scrollHeight;setToast('Registre a evidência e envie para validação.')}
};
$('navSecondary').onclick=()=>{
 if(TEACHER){if(activeStage<10){selectStage(activeStage+1);teacherAdvance(activeStage,'briefing')}return}
 const idx=phaseList.indexOf(activePhase);if(idx>0){activePhase=phaseList[idx-1];renderMain();}
};
async function poll(){
 if(requestInFlight||document.visibilityState==='hidden')return;
 requestInFlight=true;
 try{
  const data=await call('classroom','state');
  const oldStage=state.current_stage,oldPhase=state.phase;
  state=data.state;
  if(!TEACHER){progress=data.progress||[];
    if(state.current_stage!==oldStage){
     const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
     if(!typing){activeStage=state.current_stage;activePhase=state.phase;renderAll();setToast('O professor iniciou a etapa '+state.current_stage+'.')}
     else {$('roomState').textContent='NOVA ETAPA LIBERADA · '+state.current_stage;setToast('Nova etapa disponível. Termine seu registro antes de avançar.');}
    } else if(state.phase!==oldPhase&&activeStage===state.current_stage&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){activePhase=state.phase;renderAll();}
    else {renderRight();renderJourney();}
  }else{if(state.current_stage!==oldStage||state.phase!==oldPhase){renderRight();renderJourney();}}
  if(!TEACHER&&studentSession?.token)await call('classroom','heartbeat','POST',{stage:activeStage});
  if(rosterOpen)await loadRoster();
  if(chatOpen)await loadChat();
  else await refreshUnread();
  $('lastSync').textContent='Atualizado às '+stamp();
 }catch(e){$('lastSync').textContent='Sem conexão: '+e.message}
 finally{requestInFlight=false}
}
async function authenticate(){
 $('auth').hidden=false;
 $('authTitle').textContent=TEACHER?'🔐 Acesso do professor':'🎮 Entre na sua jornada';
 $('authMessage').textContent=TEACHER?'Use o PIN privado de professor. O painel de acompanhamento fica disponível após a entrada.':'Informe seu nome ou apelido e o código da turma. O progresso é vinculado a esta sessão.';
 $('authCode').parentElement.hidden=TEACHER;
 $('authName').parentElement.hidden=TEACHER;
 $('authPin').parentElement.hidden=!TEACHER;
 $('authForm').onsubmit=async ev=>{
  ev.preventDefault();const btn=$('authSubmit');btn.disabled=true;$('authError').textContent='';
  try{
   if(TEACHER){
    teacherPin=$('authPin').value.trim();
    await call('chat','teacher-login','POST');
    sessionStorage.setItem('pit_teacher_pin',teacherPin);
   }else{
    const joined=await call('chat','join','POST',{name:$('authName').value,code:$('authCode').value.trim()});
    studentSession={studentId:joined.studentId,name:joined.name,token:joined.token};
    localStorage.setItem('pit_chat_student_v09',JSON.stringify(studentSession));
   }
   $('auth').hidden=true;
   await startApp();
  }catch(e){if(TEACHER)teacherPin='';$('authError').textContent=e.message}
  finally{btn.disabled=false}
 };
}
async function startApp(){
 try{
  const data=await call('classroom','state');
  state=data.state;progress=data.progress||[];
  activeStage=state.current_stage;activePhase=state.phase;lastServerStage=state.current_stage;
  $('currentUser').textContent=TEACHER?'PROFESSOR':studentSession.name;
  renderAll();$('loading').hidden=true;$('workspace').hidden=false;
  $('lastSync').textContent='Conectado · '+stamp();
  clearInterval(window.pitPoll);window.pitPoll=setInterval(poll,14000);
  await refreshUnread();
 }catch(e){
  $('auth').hidden=false;$('authError').textContent=e.message;
  if(TEACHER)teacherPin='';
 }
}
function openDrawer(which){
 if(!TEACHER&&which==='roster')return;
 rosterOpen=which==='roster';chatOpen=which==='chat';
 $('drawerShade').classList.toggle('open',rosterOpen);
 $('rosterDrawer').classList.toggle('open',rosterOpen);
 $('rosterDrawer').setAttribute('aria-hidden',String(!rosterOpen));
 $('chatWindow').classList.toggle('open',chatOpen);
 $('chatButton').setAttribute('aria-expanded',String(chatOpen));
 if(rosterOpen)loadRoster();
 if(chatOpen)loadChat();
}
function closePanels(){rosterOpen=false;chatOpen=false;$('drawerShade').classList.remove('open');$('rosterDrawer').classList.remove('open');$('rosterDrawer').setAttribute('aria-hidden','true');$('chatWindow').classList.remove('open');$('chatButton').setAttribute('aria-expanded','false')}
$('rosterButton').onclick=()=>openDrawer('roster');
$('rosterClose').onclick=closePanels;$('drawerShade').onclick=closePanels;
$('chatButton').onclick=()=>chatOpen?closePanels():openDrawer('chat');
$('chatClose').onclick=closePanels;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanels()});
function chooseStatus(s){if(s==='approved')return '✓ Aprovada';if(s==='submitted')return '⏳ Pendente';if(s==='revision')return '↻ Revisão';return s==='working'?'🎮 Criando':'—'}
async function loadRoster(){
 if(!TEACHER)return;
 try{const data=await call('classroom','roster');roster=data.roster||[];renderRoster()}
 catch(e){$('rosterContent').textContent=e.message}
}
function renderRoster(){
 const active=roster.filter(s=>Date.now()-new Date(s.last_seen_at).getTime()<90000).length;
 const pend=roster.filter(s=>s.stages?.some(p=>p.status==='submitted')).length;
 const needsHelp=roster.filter(s=>Number(s.unread_chat)>0).length;
 $('rosterStats').textContent=roster.length+' inscritos · '+active+' ativos nos últimos 90s · '+pend+' com entrega pendente · '+needsHelp+' com dúvida';
 if(selectedRoster){renderStudentDetails();return}
 const f=rosterFilter;
 const visible=roster.filter(x=>f==='all'||(f==='pending'&&x.stages?.some(p=>p.status==='submitted'))||(f==='online'&&Date.now()-new Date(x.last_seen_at).getTime()<90000)||(f==='help'&&Number(x.unread_chat)>0));
 $('rosterContent').innerHTML='<table class="roster-table"><thead><tr><th>Aluno</th><th>Etapa</th><th>Entregas</th><th>Atividade</th></tr></thead><tbody>'+
  visible.map(s=>{
   const stages=s.stages||[],latest=stages.find(p=>Number(p.stage)===Number(s.active_stage))||stages[stages.length-1];
   const when=Date.now()-new Date(s.last_seen_at).getTime()<90000?'🟢 Online':'⚪ Ausente';
   return '<tr data-student="'+esc(s.id)+'"><td><b>'+esc(s.display_name)+'</b>'+(s.unread_chat?' <span class="count-bubble">'+s.unread_chat+'</span>':'')+'</td><td>'+esc(s.active_stage||latest?.stage||0)+'/10 · '+esc(chooseStatus(latest?.status))+'</td><td>'+s.approved+' aprovadas</td><td>'+when+'</td></tr>'
  }).join('')+'</tbody></table>'+(visible.length?'':'<p class="notice">Nenhum estudante nesse filtro.</p>');
 $('rosterContent').querySelectorAll('tr[data-student]').forEach(tr=>tr.onclick=()=>{selectedRoster=tr.dataset.student;renderStudentDetails()});
}
function renderStudentDetails(){
 const user=roster.find(x=>x.id===selectedRoster);if(!user){selectedRoster=null;renderRoster();return}
 $('rosterContent').innerHTML='<div class="buttonrow"><button id="rosterBack" class="outline">← Voltar à turma</button></div>'+
 '<h2>'+esc(user.display_name)+'</h2><p class="muted">Última atualização: '+new Date(user.last_seen_at).toLocaleString('pt-BR')+'</p>'+
 (user.stages||[]).map(st=>'<div class="concept-card"><strong>Etapa '+String(st.stage).padStart(2,'0')+' · '+esc(mission(st.stage).title)+'</strong>'+
 '<span class="state-pill '+esc(st.status)+'">'+esc(chooseStatus(st.status))+'</span><p>Rota '+esc(st.route.toUpperCase())+'</p><p><b>Registro:</b> '+esc(st.evidence||'Nenhum registro')+'</p>'+
 (st.feedback?'<p><b>Retorno anterior:</b> '+esc(st.feedback)+'</p>':'')+
 (st.status==='submitted'||st.status==='revision'?'<div class="formline"><label>Comentário</label><textarea class="review-comment" data-n="'+st.stage+'" maxlength="550" placeholder="Orientação para o aluno (opcional)"></textarea></div><div class="buttonrow"><button class="action btnsmall" data-review="approved" data-stage="'+st.stage+'">✓ Aprovar</button><button class="outline btnsmall" data-review="revision" data-stage="'+st.stage+'">↻ Pedir revisão</button></div>':'')+'</div>').join('')+
 (!(user.stages||[]).length?'<p class="notice">O estudante ainda não registrou prática.</p>':'');
 $('rosterBack').onclick=()=>{selectedRoster=null;renderRoster()};
 $('rosterContent').querySelectorAll('[data-review]').forEach(btn=>btn.onclick=async()=>{
  const n=Number(btn.dataset.stage),comment=$('rosterContent').querySelector('textarea[data-n="'+n+'"]')?.value||'';
  try{await call('classroom','review','POST',{studentId:user.id,stage:n,status:btn.dataset.review,feedback:comment});setToast('Entrega atualizada.');await loadRoster()}
  catch(e){setToast(e.message,true)}
 });
}
$('filterAll').onclick=()=>{selectedRoster=null;rosterFilter='all';renderRoster()};
$('filterPending').onclick=()=>{selectedRoster=null;rosterFilter='pending';renderRoster()};
$('filterOnline').onclick=()=>{selectedRoster=null;rosterFilter='online';renderRoster()};
$('filterHelp').onclick=()=>{selectedRoster=null;rosterFilter='help';renderRoster()};
async function refreshUnread(){
 try{const data=await call('chat','unread');lastUnread=Number(data.unread)||0;$('chatBadge').textContent=lastUnread>99?'99+':String(lastUnread);$('chatBadge').hidden=!lastUnread;$('chatButton').title=lastUnread+' nova(s) mensagem(ns)'}
 catch{}
}
async function loadChat(){
 if(!chatOpen)return;
 try{
  if(TEACHER){
   const response=await call('chat','threads');const threads=response.threads||[];
   $('chatThreads').innerHTML=threads.map(t=>'<button type="button" data-thread="'+esc(t.id)+'" class="'+(t.id===selectedThread?'active':'')+'">'+esc(t.display_name)+(t.unread?' • '+t.unread:'')+'</button>').join('');
   $('chatThreads').querySelectorAll('button').forEach(b=>b.onclick=()=>{selectedThread=b.dataset.thread;loadChat()});
   if(!selectedThread&&threads.length)selectedThread=threads[0].id;
   if(!selectedThread){$('chatMessages').innerHTML='<p class="muted">Nenhum aluno se cadastrou ainda.</p>';return}
   const student=threads.find(t=>t.id===selectedThread);
   const uri=new URL(BASE+'chat');uri.searchParams.set('action','messages');uri.searchParams.set('studentId',selectedThread);
   const response2=await fetch(uri,{headers:{'X-PIT-Teacher-Pin':teacherPin},cache:'no-store'});
   const read=await response2.json();if(!response2.ok)throw Error(read.error||'Erro ao ler conversa.');
   renderChat(read.messages);
   if(student?.unread){await call('chat','read','POST',{studentId:selectedThread});await refreshUnread()}
  }else{
   $('chatThreads').innerHTML='';
   const response=await call('chat','messages');
   renderChat(response.messages);
   await call('chat','read','POST');await refreshUnread();
  }
 }catch(e){$('chatMessages').textContent='Erro: '+e.message}
}
function renderChat(messages){
 const el=$('chatMessages');const prevBottom=el.scrollHeight-el.scrollTop-el.clientHeight;
 el.innerHTML=(messages||[]).map(m=>{
  const mine=(TEACHER&&m.author==='teacher')||(!TEACHER&&m.author==='student');
  return '<div class="msg '+(mine?'mine':'')+'"><small>'+esc(m.author==='teacher'?'Professor':'Aluno')+(m.mission?' · Etapa '+String(m.mission).padStart(2,'0'):'')+' · '+new Date(m.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+'</small>'+esc(m.body)+'</div>'
 }).join('')||'<p class="muted">Ainda não há mensagens.</p>';
 if(prevBottom<120)el.scrollTop=el.scrollHeight;
}
$('chatForm').onsubmit=async e=>{
 e.preventDefault();
 const field=$('chatInput'),text=field.value.trim();
 if(text.length<2)return;
 if(TEACHER&&!selectedThread)return setToast('Escolha um aluno antes de responder.',true);
 try{
  await call('chat','send','POST',{body:text,studentId:TEACHER?selectedThread:undefined,mission:activeStage});
  field.value='';await loadChat();setToast('Mensagem enviada ✓');
 }catch(err){setToast(err.message,true)}
};
$('showResources').onclick=()=>{window.open('./index.html#recursos','_blank','noopener')};
$('changeUser').onclick=()=>{if(TEACHER){sessionStorage.removeItem('pit_teacher_pin');teacherPin=''}else{localStorage.removeItem('pit_chat_student_v09');studentSession=null}location.reload()};
(async()=>{
 if(MISSIONS.length!==10){$('loading').textContent='Erro: catálogo de etapas incompleto.';return}
 if(TEACHER?Boolean(teacherPin):Boolean(studentSession?.token)){
  try{await startApp();if($('workspace').hidden)await authenticate()}
  catch{await authenticate()}
 }else await authenticate();
})();
})();
(function(){
'use strict';
const MISSIONS=window.PIT_MISSIONS||[],BASE='https://pit-game-jam-chat.vercel.app/api/';
const role=document.body.dataset.role==='teacher'?'teacher':'student',TEACHER=role==='teacher';
let visualPreview=false;
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
let lastUnread=0,rosterFilter='all',requestInFlight=false,chatRequest=0,chatSending=false;
function stamp(){return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
function setToast(message,bad=false){const el=$('toast');el.textContent=message;el.hidden=false;el.style.borderColor=bad?'#fa7285':'#53dcb7';clearTimeout(setToast.timer);setToast.timer=setTimeout(()=>el.hidden=true,5300)}
async function call(service,action,method='GET',data=null,query=null){
 if(visualPreview)throw Error('Modo demonstração: nenhuma informação é enviada ao servidor.');
 if(window.PIT_HOSTING_POLICY?.mode(location.origin,false)==='static-only')throw Error('Esta cópia é uma prévia estática. Use ?preview=1; nenhum dado da turma deve ser enviado aqui.');
 const u=new URL(BASE+service+'.js');u.pathname='/api/'+service;u.searchParams.set('action',action);
 if(query)for(const [key,value] of Object.entries(query))u.searchParams.set(key,String(value));
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
function missionOneContext(){
 return {
  session:visualPreview?'preview':studentSession?.studentId||'student-unverified',
  phase:activePhase,preview:visualPreview,status:entry(1)?.status||'',
  feedback:entry(1)?.feedback||'',
  canSubmit:state.current_stage>1||(state.current_stage===1&&['practice','review'].includes(state.phase))
 };
}
function missionTwoContext(){
 const session=visualPreview?'preview':studentSession?.studentId||'student-unverified';
 if(!TEACHER&&window.PIT_MISSION_ONE){
  const e=entry(1);if(e?.evidence)window.PIT_MISSION_ONE.hydrate(session,e.evidence,e.status);
 }
 return {session,idea:!TEACHER&&window.PIT_MISSION_ONE?window.PIT_MISSION_ONE.load(session):{},
  phase:activePhase,status:entry(2)?.status||'',feedback:entry(2)?.feedback||'',preview:visualPreview,
  canSubmit:state.current_stage>2||(state.current_stage===2&&['practice','review'].includes(state.phase))};
}
function missionThreeContext(){
 const session=visualPreview?'preview':studentSession?.studentId||'student-unverified';
 const one=entry(1),two=entry(2);
 if(!TEACHER&&window.PIT_MISSION_ONE&&one?.evidence)window.PIT_MISSION_ONE.hydrate(session,one.evidence,one.status);
 if(!TEACHER&&window.PIT_STUDENT_MISSION_TWO&&two?.evidence)window.PIT_STUDENT_MISSION_TWO.hydrate(session,two.evidence,two.status);
 return {session,idea:!TEACHER&&window.PIT_MISSION_ONE?window.PIT_MISSION_ONE.load(session):{},
  mvp:!TEACHER&&window.PIT_STUDENT_MISSION_TWO?window.PIT_STUDENT_MISSION_TWO.load(session):{},
  phase:activePhase,status:entry(3)?.status||'',feedback:entry(3)?.feedback||'',preview:visualPreview,
  canSubmit:state.current_stage>3||(state.current_stage===3&&['practice','review'].includes(state.phase))};
}
function missionFourContext(){
 const session=visualPreview?'preview':studentSession?.studentId||'student-unverified';
 const one=entry(1),two=entry(2),three=entry(3);
 if(!TEACHER&&one?.evidence&&window.PIT_MISSION_ONE)window.PIT_MISSION_ONE.hydrate(session,one.evidence,one.status);
 if(!TEACHER&&two?.evidence&&window.PIT_STUDENT_MISSION_TWO)window.PIT_STUDENT_MISSION_TWO.hydrate(session,two.evidence,two.status);
 if(!TEACHER&&three?.evidence&&window.PIT_STUDENT_MISSION_THREE)window.PIT_STUDENT_MISSION_THREE.hydrate(session,three.evidence,three.status);
 return {
  session,
  idea:!TEACHER&&window.PIT_MISSION_ONE?window.PIT_MISSION_ONE.load(session):{},
  mvp:!TEACHER&&window.PIT_STUDENT_MISSION_TWO?window.PIT_STUDENT_MISSION_TWO.load(session):{},
  previous:!TEACHER&&window.PIT_STUDENT_MISSION_THREE?window.PIT_STUDENT_MISSION_THREE.load(session):{},
  phase:activePhase,status:entry(4)?.status||'',feedback:entry(4)?.feedback||'',preview:visualPreview,
  canSubmit:state.current_stage>4||(state.current_stage===4&&['practice','review'].includes(state.phase))
 };
}
function missionFiveContext(){
 const previous=missionFourContext(),session=previous.session,e=entry(4);
 if(!TEACHER&&e?.evidence&&window.PIT_STUDENT_MISSION_FOUR)
  window.PIT_STUDENT_MISSION_FOUR.hydrate(session,e.evidence,e.status);
 return {...previous,
  playable:!TEACHER&&window.PIT_STUDENT_MISSION_FOUR?window.PIT_STUDENT_MISSION_FOUR.load(session):{},
  phase:activePhase,status:entry(5)?.status||'',feedback:entry(5)?.feedback||'',
  canSubmit:state.current_stage>5||(state.current_stage===5&&['practice','review'].includes(state.phase))
 };
}
function missionSixContext(){
 const previous=missionFiveContext(),session=previous.session,e=entry(5);
 if(!TEACHER&&e?.evidence&&window.PIT_STUDENT_MISSION_FIVE)
  window.PIT_STUDENT_MISSION_FIVE.hydrate(session,e.evidence,e.status);
 return {...previous,rule:!TEACHER&&window.PIT_STUDENT_MISSION_FIVE?window.PIT_STUDENT_MISSION_FIVE.load(session):{},
  phase:activePhase,status:entry(6)?.status||'',feedback:entry(6)?.feedback||'',
  preview:visualPreview,
  canSubmit:state.current_stage>6||(state.current_stage===6&&['practice','review'].includes(state.phase))};
}
function missionSevenContext(){
 const previous=missionSixContext(),session=previous.session,e=entry(6);
 if(!TEACHER&&e?.evidence&&window.PIT_STUDENT_MISSION_SIX)
  window.PIT_STUDENT_MISSION_SIX.hydrate(session,e.evidence,e.status);
 return {...previous,forge:!TEACHER&&window.PIT_STUDENT_MISSION_SIX?window.PIT_STUDENT_MISSION_SIX.load(session):{},
  phase:activePhase,status:entry(7)?.status||'',feedback:entry(7)?.feedback||'',
  preview:visualPreview,
  canSubmit:state.current_stage>7||(state.current_stage===7&&['practice','review'].includes(state.phase))};
}
function missionEightContext(){
 const previous=missionSevenContext(),session=previous.session,e=entry(7);
 if(!TEACHER&&e?.evidence&&window.PIT_STUDENT_MISSION_SEVEN)window.PIT_STUDENT_MISSION_SEVEN.hydrate(session,e.evidence,e.status);
 return {...previous,conclusion:!TEACHER&&window.PIT_STUDENT_MISSION_SEVEN?window.PIT_STUDENT_MISSION_SEVEN.load(session):{},
  phase:activePhase,status:entry(8)?.status||'',feedback:entry(8)?.feedback||'',preview:visualPreview,
  canSubmit:state.current_stage>8||(state.current_stage===8&&['practice','review'].includes(state.phase))};
}
function missionNineContext(){
 const previous=missionEightContext(),session=previous.session,e=entry(8);
 if(!TEACHER&&e?.evidence&&window.PIT_STUDENT_MISSION_EIGHT)window.PIT_STUDENT_MISSION_EIGHT.hydrate(session,e.evidence,e.status);
 return {...previous,polish:!TEACHER&&window.PIT_STUDENT_MISSION_EIGHT?window.PIT_STUDENT_MISSION_EIGHT.load(session):{},
  phase:activePhase,status:entry(9)?.status||'',feedback:entry(9)?.feedback||'',preview:visualPreview,
  canSubmit:state.current_stage>9||(state.current_stage===9&&['practice','review'].includes(state.phase))};
}
function missionTenContext(){
 const previous=missionNineContext(),session=previous.session,e=entry(9);
 if(!TEACHER&&e?.evidence&&window.PIT_STUDENT_MISSION_NINE)window.PIT_STUDENT_MISSION_NINE.hydrate(session,e.evidence,e.status);
 return {...previous,playtest:!TEACHER&&window.PIT_STUDENT_MISSION_NINE?window.PIT_STUDENT_MISSION_NINE.load(session):{},
  phase:activePhase,status:entry(10)?.status||'',feedback:entry(10)?.feedback||'',preview:visualPreview,
  approvedStages:progress.filter(p=>p.status==='approved').map(p=>Number(p.stage)),
  canSubmit:state.current_stage>=10&&['practice','review'].includes(state.phase)};
}
function statusLabel(n){return stageStatuses[entry(n)?.status]||'Não iniciada'}
function renderJourney(){
 const list=$('journey');
 list.innerHTML=MISSIONS.map(m=>{
  const e=entry(m.n),locked=!TEACHER&&m.n>state.current_stage,selected=m.n===activeStage;
  const short=TEACHER?(m.n===state.current_stage?'ETAPA DA TURMA':'PRÉVIA'):e?.status==='approved'?'CONCLUÍDA':locked?'BLOQUEADA':e?.status==='submitted'?'AGUARDANDO AVALIAÇÃO':e?.status==='revision'?'REVISAR':e?.status==='working'?'EM PRODUÇÃO':m.n===state.current_stage?'DISPONÍVEL':'REVISAR';
  const artState=TEACHER?(m.n===state.current_stage?'active':'preview'):e?.status==='approved'?'approved':locked?'locked':e?.status==='submitted'?'submitted':e?.status==='revision'?'revision':'active';
  return '<button type="button" class="stage-btn '+(selected?'current ':'')+(locked?'locked ':'')+(e?.status==='approved'?'approved':'')+'" data-mission-state="'+artState+'" data-stage="'+m.n+'" aria-current="'+selected+'" '+(locked?'disabled':'')+'>'+
   '<span class="stage-poster" style="--mission-tint:'+stageThumbs[m.n-1]+'"><img class="stage-art" data-pit-fallback src="./v3/assets/missions/missao-'+String(m.n).padStart(2,'0')+'.webp" alt="" loading="lazy" decoding="async"><span class="stage-cover-index">'+String(m.n).padStart(2,'0')+'</span><span class="stage-emoji">'+m.icon+'</span></span>'+
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
 $('progressLabel').textContent=TEACHER?(visualPreview?'PRÉVIA · SEM TURMA':'Sala PITGAME26 · '+phaseNames[state.phase]):'XP '+done*100+' / 1000 · '+done+' etapa(s) aprovadas';
 $('badgeList').innerHTML=MISSIONS.map(m=>{
  const isDone=!TEACHER&&entry(m.n)?.status==='approved';
  const isActive=m.n===state.current_stage;
  return '<div class="badge-item '+(isDone?'done':'')+'"><span class="dot"></span><span>'+m.icon+' '+esc(m.title)+(isActive&&!isDone?' · em curso':'')+'</span></div>'
 }).join('');
 $('roleSubtitle').textContent=TEACHER?'MISSION CONTROL · CONTROLE DIDÁTICO':'CREATOR MODE · MINHA JORNADA';
 $('roomState').textContent=visualPreview?'PRÉVIA VISUAL · 10 MISSÕES LIBERADAS PARA TESTE · SEM ENVIO':'TURMA · ETAPA '+String(state.current_stage).padStart(2,'0')+' · '+phaseNames[state.phase].toUpperCase();
}
// A tela do aluno usa scroll interno no desktop, mas scroll da página no celular.
// Ao trocar de etapa, reposicionamos no início do capítulo, nunca no meio da etapa nova.
function scrollMissionToStart(){
 const content=$('mainContent'),pane=$('mainPane');
 if(content)content.scrollTop=0;
 window.requestAnimationFrame(()=>{
  if(content)content.scrollTop=0;
  if(!pane||!window.matchMedia('(max-width: 700px)').matches)return;
  const nav=document.querySelector('.topnav');
  const sticky=nav&&['sticky','fixed'].includes(window.getComputedStyle(nav).position);
  const offset=sticky?nav.getBoundingClientRect().height+8:8;
  const y=Math.max(0,window.scrollY+pane.getBoundingClientRect().top-offset);
  window.scrollTo({top:y,behavior:'auto'});
 });
}
function phaseButtons(){
 const labels=TEACHER?{briefing:'Conceitos',demo:'Exemplo em ação',practice:'Oficina liberada',review:'Resultados'}:{briefing:'Briefing',practice:'Construir',review:'Entregar'};
 const cadence=TEACHER&&window.PIT_TEACHER_MISSION_ONE?window.PIT_TEACHER_MISSION_ONE.minutes(activeStage):null;
 $('phasebar').innerHTML=phaseList.map((p,i)=>'<button type="button" data-phase="'+p+'" class="'+(p===activePhase?'active':'')+'" aria-current="'+(p===activePhase)+'"><span class="step-count">'+(cadence?cadence[i]+' MIN':String(i+1).padStart(2,'0')+'/'+String(phaseList.length).padStart(2,'0'))+'</span>'+labels[p]+'</button>').join('');
 $('phasebar').querySelectorAll('[data-phase]').forEach(x=>x.onclick=()=>{activePhase=x.dataset.phase;renderMain();scrollMissionToStart()});
}
function cards(list){return list.map(([heading,description])=>'<div class="concept-card"><strong>'+esc(heading)+'</strong><p>'+esc(description)+'</p></div>').join('')}
function tasks(list){return list.map((text,i)=>'<div class="task-card"><span class="num">'+String(i+1).padStart(2,'0')+'</span><div><p>'+esc(text)+'</p></div></div>').join('')}

function getTeacherContent(m){return teacherContent[m.n-1]||null}
function visualSimulator(m){
 if(m.n===5)return '<section class="simulation logic-lab"><div class="simulation-head"><span>◈ LABORATÓRIO VIVO DE LÓGICA</span><span>EVENTOS → VARIÁVEIS</span></div>'+
 '<h3>O jogo muda quando uma regra é ativada.</h3><p>Uma variável registra um fato. Outro evento consulta esse fato e decide o que acontecerá a seguir.</p>'+
 '<div class="logic-states"><div><small>VIDA</small><strong id="logicHealth">3</strong></div><div><small>SCORE</small><strong id="logicScore">0</strong></div><div><small>TEM CHAVE?</small><strong id="logicKey">NÃO</strong></div><div><small>PORTA</small><strong id="logicDoor">FECHADA</strong></div></div>'+
 '<div class="buttonrow logic-actions"><button class="outline" type="button" data-logic="item">💎 Coletar item</button><button class="outline" type="button" data-logic="damage">❤️ Tomar dano</button><button class="outline" type="button" data-logic="key">🔑 Pegar chave</button><button class="action" type="button" data-logic="door">🚪 Tentar porta</button><button class="ghost" type="button" data-logic="reset">↺ Reiniciar</button></div>'+
 '<div class="logic-output" id="logicOutput" aria-live="polite">Jogo iniciado. Score=0 · Vida=3 · TemChave=0. Escolha uma ação para observar a regra.</div></section>';
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
// Gênero e escolhas do aluno vêm da Missão 01. Recupera a ficha oficial
// enviada ao servidor caso o aluno abra a oficina em outro navegador.
function genreContext(n){
 if(TEACHER||!window.PIT_GENRE_CONTEXT||!window.PIT_MISSION_ONE)return null;
 const session=visualPreview?'preview':studentSession?.studentId||'student-unverified';
 const official=entry(1);
 if(official?.evidence)window.PIT_MISSION_ONE.hydrate(session,official.evidence,official.status);
 const draft=window.PIT_MISSION_ONE.load(session);
 if(!draft.genre)return null;
 return window.PIT_GENRE_CONTEXT.stage(n,draft.genre,draft);
}
function studentGenreFocus(m){
 const g=genreContext(m.n);
 if(!g)return '';
 return '<aside class="pit-genre-focus" aria-label="Exemplo adaptado ao gênero escolhido">'+
  '<div class="pit-genre-focus-kicker"><span>✦ EXEMPLO PARA '+esc(g.genre.toUpperCase())+'</span><small>PROJETO · '+esc(g.title)+'</small></div>'+
  '<p>'+esc(g.focus)+'</p><small>Referência opcional: adapte à mecânica real do seu jogo.</small></aside>';
}
// Generic fallback forms must never share drafts/checklists across students using one browser.
// Old unscoped V2/V3 keys are deliberately not read or deleted: ownership cannot be established.
function studentStorageKey(kind,n){
 const id=visualPreview?'preview':studentSession?.studentId;
 const identity=typeof id==='string'&&(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||id==='preview')?id:'unverified';
 return 'pit_v3_'+kind+'_'+identity+'_'+n;
}
function savedChecks(n){try{const v=JSON.parse(localStorage.getItem(studentStorageKey('checks',n))||'[]');return Array.isArray(v)?v.filter(x=>Number.isInteger(x)&&x>=0&&x<3):[]}catch{return []}}
function studentTasks(m){
 const checked=savedChecks(m.n);
 const g=genreContext(m.n);
 return '<div class="build-steps">'+m.steps.map((step,i)=>'<label class="build-step '+(checked.includes(i)?'checked':'')+'"><span class="build-index">'+String(i+1).padStart(2,'0')+'</span><span class="build-text"><strong>'+esc(['PREPARAR','CONSTRUIR','TESTAR'][i]||'PRATICAR')+'</strong><span>'+esc(step)+'</span>'+
 (g&&g.steps[i]?'<small class="pit-genre-step">✧ No seu gênero: '+esc(g.steps[i])+'</small>':'')+
 '<small>Resultado observado: '+esc(m.checks[i]||m.deliver)+'</small></span><input type="checkbox" data-step-check="'+i+'" '+(checked.includes(i)?'checked':'')+' aria-label="Concluí o passo '+(i+1)+'"></label>').join('')+'</div>';
}
function studentBrief(m){
 const isReleased=m.n<=state.current_stage;
 return '<div class="stage-story"><span class="stage-story-kicker">MISSÃO '+String(m.n).padStart(2,'0')+' · '+m.minutes+' MINUTOS</span><h2>'+esc(m.title.toUpperCase())+'</h2><p>'+esc(m.subtitle)+'</p><div class="story-objective"><strong>🎯 SEU OBJETIVO</strong>'+esc(m.goal)+'</div>'+
 '<div class="story-reward"><span>🏆 MISSÃO CONCLUÍDA QUANDO</span><strong>'+esc(m.deliver)+'</strong></div>'+studentGenreFocus(m)+
 '<p class="story-wait">'+(isReleased?'Prepare seu projeto. Siga para CONSTRUIR quando chegar a hora da prática.':'🔒 Aguarde a liberação desta missão pelo professor.')+'</p></div>';
}
function studentBuild(m){
 const canWork=m.n<=state.current_stage&& (m.n!==state.current_stage||['practice','review'].includes(state.phase));
 return '<div class="quest-kicker">MISSÃO '+String(m.n).padStart(2,'0')+' · OFICINA</div>'+
 '<h2 class="quest-title">Agora é sua vez de criar.</h2><p class="lesson-lead">'+esc(m.goal)+'</p>'+studentGenreFocus(m)+
 (!canWork?'<div class="notice gold">⏳ A prática ainda não foi liberada. Os passos estão disponíveis para você conhecer o objetivo; o envio só abre quando o professor autorizar.</div>':'')+
 studentTasks(m)+
 '<div class="quest-resource"><strong>◈ NO GDEVELOP / RECURSOS</strong><p>'+esc(m.route)+'</p><div class="buttonrow">'+m.tools.map(([label,href])=>'<a class="tool-link" href="'+esc(href)+'" target="_blank" rel="noopener">'+esc(label)+' ↗</a>').join('')+'</div></div>'+
 '<div class="quest-fallback"><strong>TRAVOU?</strong><p>'+esc(m.help)+'</p>'+
 (genreContext(m.n)?'<p class="pit-genre-support">✧ Para seu gênero: '+esc(genreContext(m.n).support)+'</p>':'')+'</div>'+
 '<div class="quest-evidence">'+studentWorkForm(m)+'</div>';
}
function studentDeliver(m){
 return '<div class="quest-kicker">MISSÃO '+String(m.n).padStart(2,'0')+' · VALIDAÇÃO</div><h2 class="quest-title">Conclua o que você começou.</h2>'+
 '<p class="lesson-lead">A entrega usa os mesmos três passos da oficina. Não existe uma segunda lista de perguntas: registre o resultado real do seu projeto.</p>'+studentGenreFocus(m)+
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
 const draft=localStorage.getItem(studentStorageKey('draft',m.n)),evidence=draft!==null?draft:(e.evidence||'');
 const locked=m.n>state.current_stage||(m.n===state.current_stage&&!['practice','review'].includes(state.phase));
 const approved=e.status==='approved',genre=genreContext(m.n);
 const done=savedChecks(m.n).length,ready=done>=m.steps.length;
 return '<section class="mission-submission"><div class="submission-head"><span>◈ REGISTRO DE MISSÃO</span><span class="state-pill '+esc(e.status||'')+'">'+esc(statusLabel(m.n))+'</span></div>'+
  '<h3>Seu jogo é a evidência.</h3><p>Faça os três passos acima e descreva o resultado que realmente funcionou. É esta mesma prática que o professor vai avaliar.</p>'+
  '<div class="submission-progress"><strong>'+done+' / '+m.steps.length+' passos realizados</strong><div class="mini-progress"><span style="width:'+Math.round(done/m.steps.length*100)+'%"></span></div></div>'+
  '<div class="formline"><label for="evidenceInput">O que você conseguiu construir ou testar?</label><textarea id="evidenceInput" maxlength="750" '+(approved?'disabled':'')+' placeholder="'+esc(genre?.evidence||m.deliver)+'">'+esc(evidence)+'</textarea>'+
 (genre?'<small class="pit-genre-evidence-hint">✧ Exemplo de estrutura para '+esc(genre.genre)+'. Registre somente o que você realmente fez, mesmo que seja diferente do exemplo.</small>':'')+'</div>'+
  (m.n>=4?'<div class="formline"><label for="routeSelect">Meu jogo será</label><select id="routeSelect" '+(approved?'disabled':'')+'><option value="2d" '+((e.route||'2d')==='2d'?'selected':'')+'>🎮 2D</option><option value="3d" '+(e.route==='3d'?'selected':'')+'>🧊 3D</option></select></div>':'')+
  '<div class="buttonrow"><button type="button" class="outline" id="startWork" '+(locked||approved?'disabled':'')+'>Salvar andamento</button><button type="button" class="action" id="submitWork" '+(locked||approved||!ready?'disabled':'')+'>🏆 Entregar missão para avaliação</button></div>'+
  (!ready?'<p class="submission-warning">Marque os passos que realmente realizou para ativar a entrega.</p>':'')+
  (locked&&!approved?'<div class="notice gold">⏳ Aguarde a liberação da prática pelo professor. Você pode preparar seu projeto e revisar os passos.</div>':'')+
  (e.feedback?'<div class="notice gold"><b>Retorno do professor:</b> '+esc(e.feedback)+'</div>':'')+
  (approved?'<div class="notice green">🏆 Missão aprovada! Sua conquista foi registrada no placar.</div>':'')+
 '</section>';
}
function renderMain(){
 const m=mission(),e=entry(m.n);
 $('missionNumber').textContent='MISSÃO '+String(m.n).padStart(2,'0')+' / 10 · '+esc(m.time)+' · '+m.minutes+' MINUTOS';
 $('mainPane').style.setProperty('--mission-accent',stageThumbs[m.n-1]);
 $('missionTitle').textContent=m.icon+' '+m.title.toUpperCase();
 $('missionSubtitle').textContent=m.subtitle;
 const missionOne=!TEACHER&&m.n===1&&!!window.PIT_MISSION_ONE;
 const missionTwo=!TEACHER&&m.n===2&&!!window.PIT_STUDENT_MISSION_TWO;
 const missionThree=!TEACHER&&m.n===3&&!!window.PIT_STUDENT_MISSION_THREE;
 const missionFour=!TEACHER&&m.n===4&&!!window.PIT_STUDENT_MISSION_FOUR;
 const missionFive=!TEACHER&&m.n===5&&!!window.PIT_STUDENT_MISSION_FIVE;
 const missionSix=!TEACHER&&m.n===6&&!!window.PIT_STUDENT_MISSION_SIX;
 const missionSeven=!TEACHER&&m.n===7&&!!window.PIT_STUDENT_MISSION_SEVEN;
 const missionEight=!TEACHER&&m.n===8&&!!window.PIT_STUDENT_MISSION_EIGHT;
 const missionNine=!TEACHER&&m.n===9&&!!window.PIT_STUDENT_MISSION_NINE;
 const missionTen=!TEACHER&&m.n===10&&!!window.PIT_STUDENT_MISSION_TEN;
 const teacherMissionOne=TEACHER&&m.n===1&&!!window.PIT_TEACHER_MISSION_ONE;
 const teacherMissionTwo=TEACHER&&m.n===2&&!!window.PIT_TEACHER_MISSION_TWO;
 const teacherMissionThree=TEACHER&&m.n===3&&!!window.PIT_TEACHER_MISSION_THREE;
 const teacherMissionFourBriefing=TEACHER&&m.n===4&&activePhase==='briefing'&&!!window.PIT_TEACHER_MISSION_FOUR_FOUNDATIONS;
 const teacherMissionFourDemo=TEACHER&&m.n===4&&activePhase==='demo'&&!!window.PIT_GDEVELOP_M04_GUIDE;
 const teacherMissionFourValidation=TEACHER&&m.n===4&&['practice','review'].includes(activePhase)&&!!window.PIT_TEACHER_MISSION_FOUR_VALIDATION;
 const teacherMissionFiveDemo=TEACHER&&m.n===5&&activePhase==='demo'&&!!window.PIT_GDEVELOP_M05_GUIDE;
 const teacherMissionFiveBriefing=TEACHER&&m.n===5&&activePhase==='briefing'&&!!window.PIT_TEACHER_MISSION_FIVE_FOUNDATIONS;
 const teacherMissionFiveValidation=TEACHER&&m.n===5&&['practice','review'].includes(activePhase)&&!!window.PIT_TEACHER_MISSION_FIVE_VALIDATION;
 const teacherMissionTenValidation=TEACHER&&m.n===10&&['practice','review'].includes(activePhase)&&!!window.PIT_TEACHER_MISSION_TEN_VALIDATION;
 const teacherMissionTenDemo=TEACHER&&m.n===10&&activePhase==='demo'&&!!window.PIT_GDEVELOP_M10_GUIDE;
 const teacherMissionTenBriefing=TEACHER&&m.n===10&&activePhase==='briefing'&&!!window.PIT_TEACHER_MISSION_TEN_FOUNDATIONS;
 const teacherMissionNineDemo=TEACHER&&m.n===9&&activePhase==='demo'&&!!window.PIT_TEACHER_MISSION_NINE_FOUNDATIONS;
 const teacherMissionNineValidation=TEACHER&&m.n===9&&['practice','review'].includes(activePhase)&&!!window.PIT_TEACHER_MISSION_NINE_VALIDATION;
 const teacherMissionNineBriefing=TEACHER&&m.n===9&&activePhase==='briefing'&&!!window.PIT_TEACHER_MISSION_NINE_FOUNDATIONS;
 const teacherMissionEightValidation=TEACHER&&m.n===8&&['practice','review'].includes(activePhase)&&!!window.PIT_TEACHER_MISSION_EIGHT_VALIDATION;
 const teacherMissionEightDemo=TEACHER&&m.n===8&&activePhase==='demo'&&!!window.PIT_GDEVELOP_M08_GUIDE;
 const teacherMissionEightBriefing=TEACHER&&m.n===8&&activePhase==='briefing'&&!!window.PIT_TEACHER_MISSION_EIGHT_FOUNDATIONS;
 const teacherMissionSevenValidation=TEACHER&&m.n===7&&['practice','review'].includes(activePhase)&&!!window.PIT_TEACHER_MISSION_SEVEN_VALIDATION;
 const teacherMissionSevenDemo=TEACHER&&m.n===7&&activePhase==='demo'&&!!window.PIT_GDEVELOP_M07_GUIDE;
 const teacherMissionSevenBriefing=TEACHER&&m.n===7&&activePhase==='briefing'&&!!window.PIT_TEACHER_MISSION_SEVEN_FOUNDATIONS;
 const teacherMissionSixReview=TEACHER&&m.n===6&&activePhase==='review'&&!!window.PIT_TEACHER_MISSION_SIX_VALIDATION;
 const teacherMissionSixPractice=TEACHER&&m.n===6&&activePhase==='practice'&&!!window.PIT_ASSET_FORGE_TUTORIAL;
 const teacherMissionSixDemo=TEACHER&&m.n===6&&activePhase==='demo'&&!!window.PIT_TEACHER_MISSION_SIX_MATRIX;
 const teacherMissionSixBriefing=TEACHER&&m.n===6&&activePhase==='briefing'&&!!window.PIT_TEACHER_MISSION_SIX_FOUNDATIONS;
 document.body.classList.toggle('pit-mission-one',missionOne);
 document.body.classList.toggle('pit-mission-two',missionTwo);
 document.body.classList.toggle('pit-mission-three',missionThree);
 document.body.classList.toggle('pit-mission-four',missionFour);
 document.body.classList.toggle('pit-mission-five',missionFive);
 document.body.classList.toggle('pit-mission-six',missionSix);
 document.body.classList.toggle('pit-mission-seven',missionSeven);
 document.body.classList.toggle('pit-mission-eight',missionEight);
 document.body.classList.toggle('pit-mission-nine',missionNine);
 document.body.classList.toggle('pit-mission-ten',missionTen);
 if(missionOne)window.PIT_MISSION_ONE.hydrate(missionOneContext().session,e?.evidence,e?.status);
 if(missionTwo)window.PIT_STUDENT_MISSION_TWO.hydrate(missionTwoContext().session,e?.evidence,e?.status);
 if(missionThree)window.PIT_STUDENT_MISSION_THREE.hydrate(missionThreeContext().session,e?.evidence,e?.status);
 if(missionFour)window.PIT_STUDENT_MISSION_FOUR.hydrate(missionFourContext().session,e?.evidence,e?.status);
 if(missionFive)window.PIT_STUDENT_MISSION_FIVE.hydrate(missionFiveContext().session,e?.evidence,e?.status);
 if(missionSix)window.PIT_STUDENT_MISSION_SIX.hydrate(missionSixContext().session,e?.evidence,e?.status);
 if(missionSeven)window.PIT_STUDENT_MISSION_SEVEN.hydrate(missionSevenContext().session,e?.evidence,e?.status);
 if(missionEight)window.PIT_STUDENT_MISSION_EIGHT.hydrate(missionEightContext().session,e?.evidence,e?.status);
 if(missionNine)window.PIT_STUDENT_MISSION_NINE.hydrate(missionNineContext().session,e?.evidence,e?.status);
 if(missionTen)window.PIT_STUDENT_MISSION_TEN.hydrate(missionTenContext().session,e?.evidence,e?.status);
 $('mainContent').innerHTML=teacherMissionTenValidation?window.PIT_TEACHER_MISSION_TEN_VALIDATION.render(activePhase):
  teacherMissionTenDemo?window.PIT_GDEVELOP_M10_GUIDE.render():
  teacherMissionTenBriefing?window.PIT_TEACHER_MISSION_TEN_FOUNDATIONS.render():
  teacherMissionNineValidation?window.PIT_TEACHER_MISSION_NINE_VALIDATION.render(activePhase):
  teacherMissionNineDemo?window.PIT_TEACHER_MISSION_NINE_FOUNDATIONS.renderDemo():
  teacherMissionNineBriefing?window.PIT_TEACHER_MISSION_NINE_FOUNDATIONS.render():
  teacherMissionEightValidation?window.PIT_TEACHER_MISSION_EIGHT_VALIDATION.render(activePhase):
  teacherMissionEightDemo?window.PIT_GDEVELOP_M08_GUIDE.render():
  teacherMissionEightBriefing?window.PIT_TEACHER_MISSION_EIGHT_FOUNDATIONS.render():
  teacherMissionSevenValidation?window.PIT_TEACHER_MISSION_SEVEN_VALIDATION.render(activePhase):
  teacherMissionSevenDemo?window.PIT_GDEVELOP_M07_GUIDE.render():
  teacherMissionSevenBriefing?window.PIT_TEACHER_MISSION_SEVEN_FOUNDATIONS.render():
  teacherMissionSixReview?window.PIT_TEACHER_MISSION_SIX_VALIDATION.render():
  teacherMissionSixPractice?window.PIT_ASSET_FORGE_TUTORIAL.render():
  teacherMissionSixDemo?window.PIT_TEACHER_MISSION_SIX_MATRIX.render():
  teacherMissionSixBriefing?window.PIT_TEACHER_MISSION_SIX_FOUNDATIONS.render():
  teacherMissionFiveValidation?window.PIT_TEACHER_MISSION_FIVE_VALIDATION.render(activePhase):
  teacherMissionFiveBriefing?window.PIT_TEACHER_MISSION_FIVE_FOUNDATIONS.render():
  teacherMissionFiveDemo?window.PIT_GDEVELOP_M05_GUIDE.render():
  teacherMissionFourValidation?window.PIT_TEACHER_MISSION_FOUR_VALIDATION.render(activePhase):
  teacherMissionFourDemo?window.PIT_GDEVELOP_M04_GUIDE.render():
  teacherMissionFourBriefing?window.PIT_TEACHER_MISSION_FOUR_FOUNDATIONS.render():
  teacherMissionThree?window.PIT_TEACHER_MISSION_THREE.render(activePhase):
  teacherMissionTwo?window.PIT_TEACHER_MISSION_TWO.render(activePhase):
  teacherMissionOne?window.PIT_TEACHER_MISSION_ONE.render(activePhase):
  missionTen?window.PIT_STUDENT_MISSION_TEN.render(missionTenContext()):
  missionNine?window.PIT_STUDENT_MISSION_NINE.render(missionNineContext()):
  missionEight?window.PIT_STUDENT_MISSION_EIGHT.render(missionEightContext()):
  missionSeven?window.PIT_STUDENT_MISSION_SEVEN.render(missionSevenContext()):
  missionSix?window.PIT_STUDENT_MISSION_SIX.render(missionSixContext()):
  missionFive?window.PIT_STUDENT_MISSION_FIVE.render(missionFiveContext()):
   missionFour?window.PIT_STUDENT_MISSION_FOUR.render(missionFourContext()):
  missionThree?window.PIT_STUDENT_MISSION_THREE.render(missionThreeContext()):
  missionTwo?window.PIT_STUDENT_MISSION_TWO.render(missionTwoContext()):
  missionOne?window.PIT_MISSION_ONE.render(missionOneContext()):phaseBody(m);
 phaseButtons();
 if(TEACHER){
  // Pré-visualizar é diferente de liberar: o botão azul compartilha a etapa/fase com a turma.
  $('missionStatus').textContent=m.n===state.current_stage?'ETAPA ATIVA · '+phaseNames[state.phase]: 'ETAPA '+String(m.n).padStart(2,'0')+' · PRÉVIA';
  $('missionStatus').className='state-pill';
  $('navPrimary').textContent=visualPreview?'SIMULAR LIBERAÇÃO (SEM TURMA)':m.n===state.current_stage?'Atualizar fase da turma':'Iniciar etapa '+String(m.n).padStart(2,'0')+' para turma';
  $('navPrimary').disabled=false;
  $('navSecondary').textContent='Próxima etapa →';
  $('navSecondary').disabled=m.n>=10;
 }else{
  $('missionStatus').textContent=statusLabel(m.n);
  $('missionStatus').className='state-pill '+(e?.status||'');
  $('navPrimary').textContent=activePhase==='review'?((missionOne||missionTwo||missionThree||missionFour||missionFive||missionSix||missionSeven||missionEight||missionNine||missionTen)?'✦ CONFIRMAR NA FICHA':'🏆 Entregar missão'):'Continuar a missão →';
  $('navPrimary').disabled=false;
  $('navSecondary').textContent='← Passo anterior';
  $('navSecondary').disabled=activePhase==='briefing';
 }
 const evidence=$('evidenceInput');
 if(evidence)evidence.oninput=()=>localStorage.setItem(studentStorageKey('draft',m.n),evidence.value);
 if($('startWork'))$('startWork').onclick=()=>sendWork('working');
 if($('submitWork'))$('submitWork').onclick=()=>sendWork('submitted');
 if(teacherMissionOne)window.PIT_TEACHER_MISSION_ONE.mount();
 if(teacherMissionTwo)window.PIT_TEACHER_MISSION_TWO.mount();
 if(teacherMissionThree)window.PIT_TEACHER_MISSION_THREE.mount();
 if(teacherMissionFourBriefing)window.PIT_TEACHER_MISSION_FOUR_FOUNDATIONS.mount();
 if(teacherMissionFourDemo)window.PIT_GDEVELOP_M04_GUIDE.mount();
 if(teacherMissionFourValidation)window.PIT_TEACHER_MISSION_FOUR_VALIDATION.mount();
 if(teacherMissionFiveBriefing)window.PIT_TEACHER_MISSION_FIVE_FOUNDATIONS.mount();
 if(teacherMissionFiveValidation)window.PIT_TEACHER_MISSION_FIVE_VALIDATION.mount();
 if(teacherMissionSixBriefing)window.PIT_TEACHER_MISSION_SIX_FOUNDATIONS.mount();
 if(teacherMissionSixDemo)window.PIT_TEACHER_MISSION_SIX_MATRIX.mount();
 if(teacherMissionSixPractice)window.PIT_ASSET_FORGE_TUTORIAL.mount();
 if(teacherMissionSixReview)window.PIT_TEACHER_MISSION_SIX_VALIDATION.mount();
 if(teacherMissionSevenBriefing)window.PIT_TEACHER_MISSION_SEVEN_FOUNDATIONS.mount();
 if(teacherMissionSevenDemo)window.PIT_GDEVELOP_M07_GUIDE.mount();
 if(teacherMissionSevenValidation)window.PIT_TEACHER_MISSION_SEVEN_VALIDATION.mount();
 if(teacherMissionEightBriefing)window.PIT_TEACHER_MISSION_EIGHT_FOUNDATIONS.mount();
 if(teacherMissionEightDemo)window.PIT_GDEVELOP_M08_GUIDE.mount();
 if(teacherMissionEightValidation)window.PIT_TEACHER_MISSION_EIGHT_VALIDATION.mount();
 if(teacherMissionNineBriefing||teacherMissionNineDemo)window.PIT_TEACHER_MISSION_NINE_FOUNDATIONS.mount();
 if(teacherMissionNineValidation)window.PIT_TEACHER_MISSION_NINE_VALIDATION.mount();
 if(teacherMissionTenBriefing)window.PIT_TEACHER_MISSION_TEN_FOUNDATIONS.mount();
 if(teacherMissionTenDemo)window.PIT_GDEVELOP_M10_GUIDE.mount();
 if(teacherMissionTenValidation)window.PIT_TEACHER_MISSION_TEN_VALIDATION.mount();
 if(teacherMissionFiveDemo)window.PIT_GDEVELOP_M05_GUIDE.mount();
 if(missionTen)window.PIT_STUDENT_MISSION_TEN.mount({
  ...missionTenContext(),
  onPhase:p=>{activePhase=p;renderMain();scrollMissionToStart();},
  onMessage:message=>setToast(message,true)
 });
 if(missionNine)window.PIT_STUDENT_MISSION_NINE.mount({
  ...missionNineContext(),
  onPhase:p=>{activePhase=p;renderMain();scrollMissionToStart();},
  onMessage:message=>setToast(message,true)
 });
 if(missionEight)window.PIT_STUDENT_MISSION_EIGHT.mount({
  ...missionEightContext(),
  onPhase:p=>{activePhase=p;renderMain();scrollMissionToStart();},
  onMessage:message=>setToast(message,true)
 });
 if(missionSeven)window.PIT_STUDENT_MISSION_SEVEN.mount({
  ...missionSevenContext(),
  onPhase:p=>{activePhase=p;renderMain();scrollMissionToStart();},
  onMessage:message=>setToast(message,true)
 });
 if(missionSix)window.PIT_STUDENT_MISSION_SIX.mount({
  ...missionSixContext(),
  onPhase:p=>{activePhase=p;renderMain();scrollMissionToStart();},
  onMessage:message=>setToast(message,true)
 });
 if(missionFive)window.PIT_STUDENT_MISSION_FIVE.mount({
  ...missionFiveContext(),
  onPhase:p=>{activePhase=p;renderMain();scrollMissionToStart();},
  onMessage:message=>setToast(message,true)
 });
 if(missionFour)window.PIT_STUDENT_MISSION_FOUR.mount({
  ...missionFourContext(),
  onPhase:p=>{activePhase=p;renderMain();scrollMissionToStart();},
  onMessage:message=>setToast(message,true)
 });
 if(missionThree)window.PIT_STUDENT_MISSION_THREE.mount({
  ...missionThreeContext(),
  onPhase:p=>{activePhase=p;renderMain();scrollMissionToStart();},
  onMessage:message=>setToast(message,true)
 });
 if(missionTwo)window.PIT_STUDENT_MISSION_TWO.mount({
  ...missionTwoContext(),
  onPhase:phase=>{activePhase=phase;renderMain();scrollMissionToStart();},
  onMessage:message=>setToast(message,true)
 });
 if(missionOne)window.PIT_MISSION_ONE.mount({
  ...missionOneContext(),
  onPhase:p=>{activePhase=p;renderMain();scrollMissionToStart();},
  onToast:message=>setToast(message)
 });
 $('mainContent').querySelectorAll('[data-step-check]').forEach(input=>input.onchange=()=>{
  const checks=new Set(savedChecks(m.n));const n=Number(input.dataset.stepCheck);
  if(input.checked)checks.add(n);else checks.delete(n);
  localStorage.setItem(studentStorageKey('checks',m.n),JSON.stringify([...checks].sort()));
  renderMain();
 });
 const logicButtons=$('mainContent').querySelectorAll('[data-logic]');
 if(logicButtons.length){
  const logic={health:3,score:0,key:false,door:false};
  logicButtons.forEach(btn=>btn.onclick=()=>{
   const action=btn.dataset.logic;
   let message='';
   if(action==='reset'){logic.health=3;logic.score=0;logic.key=false;logic.door=false;message='Estado restaurado. Observe como cada nova decisão modifica as variáveis.'}
   if(action==='item'){logic.score++;message='SE o jogador toca no item → remover item e aumentar Score em 1.'}
   if(action==='damage'){logic.health=Math.max(0,logic.health-1);message=logic.health?'SE recebe dano → reduzir Vida em 1.':'Vida chegou a zero: uma condição de derrota pode acontecer.'}
   if(action==='key'){logic.key=true;message='SE pega chave → guardar TemChave=1. A porta continua fechada até receber uma nova interação.'}
   if(action==='door'){
    if(logic.key){logic.door=true;message='SE toca porta E TemChave=1 → abrir a porta. O jogo consultou a variável.'}
    else message='Sem chave: a porta permanece fechada. A condição não foi satisfeita.';
   }
   $('logicHealth').textContent=String(logic.health);
   $('logicScore').textContent=String(logic.score);
   $('logicKey').textContent=logic.key?'SIM':'NÃO';
   $('logicDoor').textContent=logic.door?'ABERTA ✓':'FECHADA';
   $('logicOutput').textContent=message;
  });
 }
 const sim=$('simNext');if(sim){let current=0;sim.onclick=()=>{
  current=(current+1)%3;
  $('mainContent').querySelectorAll('[data-sim-stage]').forEach(el=>el.classList.toggle('sim-on',Number(el.dataset.simStage)===current));
  const info=getTeacherContent(m);
  $('simDescription').textContent=info?.details[current]||'';
  $('simCount').textContent=String(current+1).padStart(2,'0')+' / 03';
  sim.textContent=current===2?'↺ Reiniciar exemplo':'▶ Próxima transformação';
 }}
 const status=$('missionStatus');if(status)status.title=TEACHER?'Ao escolher outra fase, clique no botão azul para enviar a atualização à turma.':'';
}
function renderAll(){renderJourney();renderRight();renderMain();}
function selectStage(n,fromServer=false){
 if(!Number.isInteger(n)||n<1||n>10||(!TEACHER&&n>state.current_stage))return;
 activeStage=n;activePhase=fromServer?state.phase:'briefing';
 renderAll();
 scrollMissionToStart();
}
async function sendWork(status){
 const pilot=!TEACHER&&activeStage===1&&!!window.PIT_MISSION_ONE;
 const pilotTwo=!TEACHER&&activeStage===2&&!!window.PIT_STUDENT_MISSION_TWO;
 const pilotThree=!TEACHER&&activeStage===3&&!!window.PIT_STUDENT_MISSION_THREE;
 const pilotFour=!TEACHER&&activeStage===4&&!!window.PIT_STUDENT_MISSION_FOUR;
 const pilotFive=!TEACHER&&activeStage===5&&!!window.PIT_STUDENT_MISSION_FIVE;
 const pilotSix=!TEACHER&&activeStage===6&&!!window.PIT_STUDENT_MISSION_SIX;
 const pilotSeven=!TEACHER&&activeStage===7&&!!window.PIT_STUDENT_MISSION_SEVEN;
 const pilotEight=!TEACHER&&activeStage===8&&!!window.PIT_STUDENT_MISSION_EIGHT;
 const pilotNine=!TEACHER&&activeStage===9&&!!window.PIT_STUDENT_MISSION_NINE;
 const pilotTen=!TEACHER&&activeStage===10&&!!window.PIT_STUDENT_MISSION_TEN;
 let evidence=$('evidenceInput')?.value||'';
 let route=$('routeSelect')?.value||'2d';
 if(pilot){
  const q=missionOneContext(),validation=window.PIT_MISSION_ONE.validate(q.session);
  if(!validation.ok){activePhase='practice';renderMain();$('mainContent').scrollTop=0;setToast(validation.label,true);$('qo-'+validation.field)?.focus();return}
  evidence=window.PIT_MISSION_ONE.evidence(q.session);
  if(status==='submitted'&&!q.canSubmit)return setToast('O professor ainda não liberou a prática.',true);
  if(visualPreview)return setToast('Simulação concluída: ficha preparada, mas nenhum dado foi enviado ao professor.');
 }else if(pilotTwo){
  const q=missionTwoContext(),validation=window.PIT_STUDENT_MISSION_TWO.validate(q.session);
  if(!validation.ok){activePhase='practice';renderMain();scrollMissionToStart();setToast(validation.label,true);$('m2-'+validation.field)?.focus();return}
  if(status==='submitted'&&!q.canSubmit)return setToast('O professor ainda não liberou a prática.',true);
  evidence=window.PIT_STUDENT_MISSION_TWO.evidence(q.session,q.idea);
  if(visualPreview)return setToast('Simulação do MVP concluída. Nenhum dado foi enviado ao professor.');
 }else if(pilotThree){
  const q=missionThreeContext(),validation=window.PIT_STUDENT_MISSION_THREE.validate(q.session);
  if(!validation.ok){activePhase='practice';renderMain();scrollMissionToStart();setToast(validation.label,true);
   $('m3-'+validation.field)?.focus();return}
  if(status==='submitted'&&!q.canSubmit)return setToast('O professor ainda não liberou a prática.',true);
  evidence=window.PIT_STUDENT_MISSION_THREE.evidence(q.session,q.idea);
  route=window.PIT_STUDENT_MISSION_THREE.load(q.session).objectType.startsWith('3D')?'3d':'2d';
  if(visualPreview)return setToast('Prévia: registro preparado, sem envio para a turma real.');
 }else if(pilotFour){
  const q=missionFourContext(),validation=window.PIT_STUDENT_MISSION_FOUR.validate(q.session,q);
  if(!validation.ok){
   activePhase='practice';renderMain();scrollMissionToStart();setToast(validation.label,true);
   if(validation.field!=='checks')$('m4s-'+validation.field)?.focus();
   else $('mainContent').querySelector('[data-m4s-check]')?.focus();
   return;
  }
  if(status==='submitted'&&!q.canSubmit)return setToast('O professor ainda não liberou a prática.',true);
  evidence=window.PIT_STUDENT_MISSION_FOUR.evidence(q.session,q);
  const draft=window.PIT_STUDENT_MISSION_FOUR.load(q.session);
  route=window.PIT_STUDENT_MISSION_FOUR.routeServerType(window.PIT_STUDENT_MISSION_FOUR.activeRoute(q,draft));
  if(visualPreview)return setToast('Prévia: testes registrados, sem envio para a turma real.');
 }else if(pilotFive){
  const q=missionFiveContext(),v=window.PIT_STUDENT_MISSION_FIVE.validate(q.session);
  if(!v.ok){
   activePhase='practice';renderMain();scrollMissionToStart();setToast(v.label,true);
   if(v.field==='checks')$('mainContent').querySelector('[data-m5s-check]')?.focus();
   else $('m5s-'+v.field)?.focus();
   return;
  }
  if(status==='submitted'&&!q.canSubmit)return setToast('O professor ainda não liberou a prática.',true);
  evidence=window.PIT_STUDENT_MISSION_FIVE.evidence(q.session,q);
  const d=window.PIT_STUDENT_MISSION_FIVE.load(q.session);
  route=window.PIT_STUDENT_MISSION_FIVE.routeType(window.PIT_STUDENT_MISSION_FIVE.activeRoute(q,d));
  if(visualPreview)return setToast('Prévia: regra registrada, sem envio para a turma real.');
 }else if(pilotSix){
  const q=missionSixContext(),v=window.PIT_STUDENT_MISSION_SIX.validate(q.session);
  if(!v.ok){
   activePhase='practice';renderMain();scrollMissionToStart();setToast(v.label,true);
   $('mainContent').querySelector(v.field==='checks'?'[data-m6s-check]':'#m6s-'+v.field)?.focus();
   return;
  }
  if(status==='submitted'&&!q.canSubmit)return setToast('O professor ainda não liberou a prática.',true);
  evidence=window.PIT_STUDENT_MISSION_SIX.evidence(q.session);
  const r=window.PIT_STUDENT_MISSION_FIVE?.activeRoute(q,q.rule);
  route=window.PIT_STUDENT_MISSION_FIVE?.routeType(r)||'2d';
  if(visualPreview)return setToast('Prévia: asset registrado, sem envio para a turma real.');
 }else if(pilotSeven){
  const q=missionSevenContext(),v=window.PIT_STUDENT_MISSION_SEVEN.validate(q.session);
  if(!v.ok){
   activePhase='practice';renderMain();scrollMissionToStart();setToast(v.label,true);
   $('mainContent').querySelector(v.field==='checks'?'[data-m7s-check]':'#m7s-'+v.field)?.focus();
   return;
  }
  if(status==='submitted'&&!q.canSubmit)return setToast('O professor ainda não liberou a prática.',true);
  evidence=window.PIT_STUDENT_MISSION_SEVEN.evidence(q.session);
  const d=window.PIT_STUDENT_MISSION_SEVEN.load(q.session);
  route=d.route;
  if(visualPreview)return setToast('Prévia: conclusão registrada, sem envio para a turma real.');
 }else if(pilotEight){
  const q=missionEightContext(),v=window.PIT_STUDENT_MISSION_EIGHT.validate(q.session);
  if(!v.ok){activePhase='practice';renderMain();scrollMissionToStart();setToast(v.label,true);$('mainContent').querySelector(v.field==='checks'?'[data-m8s-check]':'#m8s-'+v.field)?.focus();return;}
  if(status==='submitted'&&!q.canSubmit)return setToast('O professor ainda não liberou a prática.',true);
  evidence=window.PIT_STUDENT_MISSION_EIGHT.evidence(q.session);
  route=window.PIT_STUDENT_MISSION_EIGHT.load(q.session).route==='3d'?'3d':'2d';
  if(visualPreview)return setToast('Prévia: polimento registrado, sem envio à turma real.');
 }else if(pilotNine){
  const q=missionNineContext(),v=window.PIT_STUDENT_MISSION_NINE.validate(q.session);
  if(!v.ok){activePhase='practice';renderMain();scrollMissionToStart();setToast(v.label,true);$('mainContent').querySelector(v.field==='checks'?'[data-m9s-check]':'#m9s-'+v.field)?.focus();return;}
  if(status==='submitted'&&!q.canSubmit)return setToast('O professor ainda não liberou a prática.',true);
  evidence=window.PIT_STUDENT_MISSION_NINE.evidence(q.session);
  route=q.polish?.route==='3d'?'3d':'2d';
  if(visualPreview)return setToast('Prévia: playtest registrado, sem envio à turma real.');
 }else if(pilotTen){
  const q=missionTenContext(),v=window.PIT_STUDENT_MISSION_TEN.validate(q.session);
  if(!v.ok){activePhase='practice';renderMain();scrollMissionToStart();setToast(v.label,true);$('mainContent').querySelector(v.field==='checks'?'[data-m10s-check]':'#m10s-'+v.field)?.focus();return;}
  if(status==='submitted'&&!q.canSubmit)return setToast('O professor ainda não liberou a prática.',true);
  evidence=window.PIT_STUDENT_MISSION_TEN.evidence(q.session);
  route=q.polish?.route==='3d'?'3d':'2d';
  if(visualPreview)return setToast('Prévia: lançamento registrado, sem envio à turma real.');
 }else{
  if(visualPreview)return setToast('Essa é uma prévia visual: entre pela oficina oficial para enviar trabalhos.',true);
  if(status==='submitted'&&savedChecks(activeStage).length<mission().steps.length)return setToast('Conclua e marque os três passos da oficina antes de entregar.',true);
 }
 if(status==='submitted'&&evidence.trim().length<8)return setToast('Descreva sua evidência em pelo menos 8 caracteres.',true);
 try{
  const response=await call('classroom','progress','POST',{stage:activeStage,route,evidence,status});
  const index=progress.findIndex(p=>p.stage===activeStage);
  if(index>=0)progress[index]=response.progress;else progress.push(response.progress);
  localStorage.removeItem(studentStorageKey('draft',activeStage));
  renderAll();setToast(status==='submitted'?'Evidência enviada ao professor.':'Etapa marcada como em atividade.');
 }catch(e){setToast(e.message,true)}
}
async function teacherAdvance(stage,phase){
 if(visualPreview){
  state={current_stage:stage,phase,updated_at:null};activeStage=stage;activePhase=phase;
  renderAll();scrollMissionToStart();
  setToast('Prévia didática: a turma real não foi alterada.');
  return;
 }
 try{
  const result=await call('classroom','stage','POST',{stage,phase});
  state=result.state;lastServerStage=state.current_stage;
  activeStage=stage;activePhase=phase;renderAll();
  setToast('Turma atualizada: etapa '+stage+' · '+phaseNames[phase]+'.');
 }catch(e){setToast(e.message,true)}
}

// Galeria cinematográfica de missões, independente da rolagem do caderno.
function showMissionGallery(){
 if(!TEACHER&&window.PIT_ARCADE){
  const g=genreContext(1);
   window.PIT_ARCADE.open({activeStage,currentStage:state.current_stage,progress,
    studentName:visualPreview?'VISITANTE · PRÉVIA':studentSession?.name||'AVENTUREIRO',
    genre:g?.genre||'',projectTitle:g?.title||'',preview:visualPreview,
    onEnter:n=>selectStage(n)});
  return;
 }
 const modal=$('missionGallery');if(!modal)return;
 modal.hidden=false;modal.classList.add('open');
 const gallery=$('missionGalleryGrid');
 gallery.innerHTML=MISSIONS.map(m=>{
  const locked=!TEACHER&&m.n>state.current_stage,done=!TEACHER&&entry(m.n)?.status==='approved';
  return '<button type="button" class="gallery-card '+(activeStage===m.n?'selected ':'')+(locked?'locked ':'')+'" data-gallery-stage="'+m.n+'" '+(locked?'disabled':'')+' style="--card-color:'+stageThumbs[m.n-1]+'"><span class="gallery-photo"><img class="tm1-gallery-art" data-pit-fallback loading="lazy" decoding="async" src="./v3/assets/missions/missao-'+String(m.n).padStart(2,'0')+'.webp" alt=""><span>'+m.icon+'</span></span><span class="gallery-card-content"><small>MISSÃO '+String(m.n).padStart(2,'0')+' · '+m.minutes+' MIN</small><strong>'+esc(m.title)+'</strong><em>'+esc(done?'✓ CONQUISTADA':locked?'🔒 BLOQUEADA':m.subtitle)+'</em></span></button>'
 }).join('');
 gallery.querySelectorAll('[data-gallery-stage]').forEach(b=>b.onclick=()=>{selectStage(Number(b.dataset.galleryStage));closeGallery()});
 $('missionGalleryClose').focus();
}
function closeGallery(){
 const x=$('missionGallery');
 // Escape also closes chat/roster. Do not refocus the gallery launcher when
 // the gallery is already closed: that steals focus from the chat trigger.
 if(!x||!x.classList.contains('open'))return;
 if(!TEACHER&&window.PIT_ARCADE){window.PIT_ARCADE.close();return;}
 x.hidden=true;x.classList.remove('open');
}
if($('openGallery'))$('openGallery').onclick=showMissionGallery;
if($('missionGalleryClose'))$('missionGalleryClose').onclick=closeGallery;
if($('missionGallery'))$('missionGallery').addEventListener('click',e=>{if(e.target===$('missionGallery'))closeGallery()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGallery()});

$('navPrimary').onclick=()=>{
 if(TEACHER)return teacherAdvance(activeStage,activePhase);
 const idx=phaseList.indexOf(activePhase);
 if(idx<phaseList.length-1){activePhase=phaseList[idx+1];renderMain();scrollMissionToStart();}
 else {if(!TEACHER&&((activeStage===1&&window.PIT_MISSION_ONE)||(activeStage===2&&window.PIT_STUDENT_MISSION_TWO)||(activeStage===3&&window.PIT_STUDENT_MISSION_THREE)||(activeStage===4&&window.PIT_STUDENT_MISSION_FOUR)||(activeStage===5&&window.PIT_STUDENT_MISSION_FIVE)||(activeStage===6&&window.PIT_STUDENT_MISSION_SIX)||(activeStage===7&&window.PIT_STUDENT_MISSION_SEVEN)||(activeStage===8&&window.PIT_STUDENT_MISSION_EIGHT)||(activeStage===9&&window.PIT_STUDENT_MISSION_NINE)||(activeStage===10&&window.PIT_STUDENT_MISSION_TEN))){$('mainContent').querySelector('#submitWork')?.focus();setToast('Sua ficha é montada automaticamente a partir do planejamento.');}else{$('mainContent').querySelector('#evidenceInput')?.focus();setToast('Descreva sua entrega e clique em Entregar missão.')}}
};
$('navSecondary').onclick=()=>{
 if(TEACHER){if(activeStage<10){selectStage(activeStage+1);teacherAdvance(activeStage,'briefing')}return}
 const idx=phaseList.indexOf(activePhase);if(idx>0){activePhase=phaseList[idx-1];renderMain();scrollMissionToStart();}
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
     if(!typing){activeStage=state.current_stage;activePhase=state.phase==='demo'?'briefing':state.phase==='review'?'practice':state.phase;renderAll();setToast('O professor iniciou a missão '+state.current_stage+'.')}
     else {$('roomState').textContent='NOVA ETAPA LIBERADA · '+state.current_stage;setToast('Nova etapa disponível. Termine seu registro antes de avançar.');}
    } else if(state.phase!==oldPhase&&activeStage===state.current_stage&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){activePhase=state.phase==='demo'?'briefing':state.phase==='review'?'practice':state.phase;renderAll();}
    else {renderRight();renderJourney();}
  }else{if(state.current_stage!==oldStage||state.phase!==oldPhase){renderRight();renderJourney();}}
  if(!TEACHER&&window.PIT_ARCADE?.isOpen())window.PIT_ARCADE.refresh({activeStage,currentStage:state.current_stage,progress,studentName:studentSession?.name||'AVENTUREIRO'});
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
  activeStage=state.current_stage;activePhase=TEACHER?state.phase:(state.phase==='demo'?'briefing':state.phase==='review'?'practice':state.phase);lastServerStage=state.current_stage;
  $('currentUser').textContent=TEACHER?'PROFESSOR':studentSession.name;
  renderAll();$('loading').hidden=true;$('workspace').hidden=false;
  if(!TEACHER)showMissionGallery();
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
 $('chatWindow').setAttribute('aria-hidden',String(!chatOpen));
 $('chatButton').setAttribute('aria-expanded',String(chatOpen));
 if(rosterOpen)loadRoster();
 if(chatOpen){loadChat();$('chatClose').focus();}
}
function closePanels(){
 const restore=chatOpen&&$('chatWindow').contains(document.activeElement);
 rosterOpen=false;chatOpen=false;chatRequest++;
 $('drawerShade').classList.remove('open');$('rosterDrawer').classList.remove('open');
 $('rosterDrawer').setAttribute('aria-hidden','true');$('chatWindow').classList.remove('open');
 $('chatWindow').setAttribute('aria-hidden','true');$('chatButton').setAttribute('aria-expanded','false');
 if(restore)$('chatButton').focus();
}
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
 for(const [id,filter] of [['filterAll','all'],['filterPending','pending'],['filterOnline','online'],['filterHelp','help']]){
  const button=$(id);if(!button)continue;
  button.setAttribute('aria-pressed',String(rosterFilter===filter));
  button.classList.toggle('active',rosterFilter===filter);
 }
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
 '<span class="state-pill '+esc(st.status)+'">'+esc(chooseStatus(st.status))+'</span><p>Rota '+esc(String(st.route||'2d').toUpperCase())+'</p><div class="roster-evidence"><b>REGISTRO DO ALUNO</b><pre>'+esc(st.evidence||'Nenhum registro')+'</pre></div>'+
 (st.feedback?'<p><b>Retorno anterior:</b> '+esc(st.feedback)+'</p>':'')+
 (st.status==='submitted'?'<div class="formline"><label>Devolutiva ao aluno</label><textarea class="review-comment" data-n="'+st.stage+'" maxlength="550" placeholder="Para pedir revisão, descreva o teste que deve ser repetido (mín. 8 caracteres)."></textarea><small>Obrigatória ao pedir revisão; opcional para aprovação.</small></div><div class="buttonrow"><button class="action btnsmall" data-review="approved" data-stage="'+st.stage+'">✓ Aprovar</button><button class="outline btnsmall" data-review="revision" data-stage="'+st.stage+'">↻ Pedir revisão</button></div>':'')+'</div>').join('')+
 (!(user.stages||[]).length?'<p class="notice">O estudante ainda não registrou prática.</p>':'');
 $('rosterBack').onclick=()=>{selectedRoster=null;renderRoster()};
 $('rosterContent').querySelectorAll('[data-review]').forEach(btn=>btn.onclick=async()=>{
  const n=Number(btn.dataset.stage),field=$('rosterContent').querySelector('textarea[data-n="'+n+'"]'),comment=field?.value?.trim()||'';
  if(btn.dataset.review==='revision'&&comment.length<8){
   setToast('Explique qual teste o estudante deve repetir (mínimo 8 caracteres).',true);
   field?.focus();return;
  }
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
function setChatStatus(message,kind='info'){
 const status=$('chatStatus');if(status){status.textContent=message;status.dataset.kind=kind}
 const retry=$('chatRetry');if(retry)retry.hidden=kind!=='error';
}
function setChatEnabled(enabled){
 const input=$('chatInput'),submit=$('chatForm')?.querySelector('button[type="submit"]');
 if(input)input.disabled=!enabled;
 if(submit)submit.disabled=!enabled||chatSending;
}
$('chatRetry').onclick=()=>loadChat();
async function loadChat(){
 if(!chatOpen)return;
 const request=++chatRequest;
 setChatStatus('Atualizando conversa…');$('chatRetry').hidden=true;
 try{
  if(TEACHER){
   const response=await call('chat','threads');
   if(!chatOpen||request!==chatRequest)return;
   const threads=response.threads||[];
   if(!threads.some(t=>t.id===selectedThread))selectedThread=threads[0]?.id||null;
   $('chatThreads').innerHTML=threads.map(t=>'<button type="button" data-thread="'+esc(t.id)+'" aria-pressed="'+String(t.id===selectedThread)+'" class="'+(t.id===selectedThread?'active':'')+'">'+esc(t.display_name)+(t.unread?' • '+Number(t.unread):'')+'</button>').join('')||'<p class="chat-empty">Nenhuma conversa disponível.</p>';
   $('chatThreads').querySelectorAll('button').forEach(b=>b.onclick=()=>{selectedThread=b.dataset.thread;loadChat()});
   if(!selectedThread){
    setChatEnabled(false);
    $('chatMessages').innerHTML='<div class="chat-empty"><strong>Aguardando o primeiro aluno</strong>Quando alguém entrar na turma, a conversa individual aparecerá aqui.</div>';
    setChatStatus('Nenhum aluno disponível para responder.');return;
   }
   setChatEnabled(true);
   const student=threads.find(t=>t.id===selectedThread);
   // Consistent 15-second timeout, preview guard and HTTP error handling.
   const read=await call('chat','messages','GET',null,{studentId:selectedThread});
   if(!chatOpen||request!==chatRequest)return;
   renderChat(read.messages);
   setChatStatus('Conversa individual com '+(student?.display_name||'aluno')+'.','success');
   if(student?.unread){await call('chat','read','POST',{studentId:selectedThread});await refreshUnread()}
  }else{
   $('chatThreads').innerHTML='';
   setChatEnabled(true);
   const response=await call('chat','messages');
   if(!chatOpen||request!==chatRequest)return;
   renderChat(response.messages);
   setChatStatus('Conversa privada com o professor.','success');
   await call('chat','read','POST');await refreshUnread();
  }
 }catch(e){
  if(!chatOpen||request!==chatRequest)return;
  setChatStatus('Não foi possível atualizar a conversa: '+e.message,'error');
  if(!$('chatMessages').querySelector('.msg'))$('chatMessages').innerHTML='<div class="chat-empty"><strong>Conexão indisponível</strong>Suas mensagens digitadas não foram apagadas. Tente novamente quando houver conexão.</div>';
 }
}
// Image attachment draft is local-only until the chat API supports authenticated uploads.
// Never send base64 through the text-only chat endpoint or expose object URLs to others.
let chatImageDraft=null;
function clearChatImageDraft(){
 if(chatImageDraft?.url)URL.revokeObjectURL(chatImageDraft.url);
 chatImageDraft=null;
 const input=$('chatImageInput'),preview=$('chatImagePreview');
 if(input)input.value='';
 if(preview){preview.hidden=true;preview.style.display='none';preview.replaceChildren()}
}
function prepareChatImage(file){
 if(!file)return;
 const types=['image/png','image/jpeg','image/webp'];
 if(!types.includes(file.type)||file.size>2*1024*1024){
  setChatStatus('Escolha PNG, JPG ou WebP de até 2 MB.','error');return;
 }
 clearChatImageDraft();
 const url=URL.createObjectURL(file);
 chatImageDraft={file,url};
 const preview=$('chatImagePreview');
 if(preview){
  const img=document.createElement('img');img.src=url;img.alt='Prévia local do print';img.style.cssText='max-width:150px;max-height:100px;object-fit:contain;border-radius:8px';
  const label=document.createElement('span');label.textContent=(file.name.length>46?file.name.slice(0,30)+'…'+file.name.slice(-12):file.name)+' · pronto para envio';label.title=file.name;label.style.cssText='display:block;min-width:0;max-width:100%;overflow-wrap:anywhere;word-break:break-word;font-size:12px;line-height:1.4';
  const remove=document.createElement('button');remove.type='button';remove.textContent='Remover imagem';remove.onclick=clearChatImageDraft;
  preview.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center;max-width:100%;min-width:0;overflow:hidden;padding:8px 0';
  preview.replaceChildren(img,label,remove);preview.hidden=false;
 }
 setChatStatus('Imagem pronta para enviar na conversa privada.','info');
}
$('chatImageInput')?.addEventListener('change',e=>prepareChatImage(e.target.files?.[0]));
$('chatInput')?.addEventListener('paste',e=>{
 const file=Array.from(e.clipboardData?.files||[]).find(f=>f.type.startsWith('image/'));
 if(file){e.preventDefault();prepareChatImage(file)}
});
async function openChatImage(id,button){
 if(!/^[1-9][0-9]{0,17}$/.test(String(id)))return;
 button.disabled=true;
 try{
  const url=new URL(BASE+'chat.js');url.pathname='/api/chat';url.searchParams.set('action','image');url.searchParams.set('messageId',id);
  const headers={};
  if(TEACHER&&teacherPin)headers['X-PIT-Teacher-Pin']=teacherPin;
  if(!TEACHER&&studentSession?.token)headers['X-PIT-Student-Token']=studentSession.token;
  const response=await fetch(url,{headers,cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Acesso à imagem indisponível.');
  const blob=await response.blob();
  if(!['image/png','image/jpeg','image/webp'].includes(blob.type)||blob.size>2*1024*1024)throw Error('Arquivo de imagem inválido.');
  const objectURL=URL.createObjectURL(blob),img=document.createElement('img');
  img.src=objectURL;img.alt='Imagem compartilhada na conversa';img.style.cssText='max-width:100%;max-height:340px;object-fit:contain;border-radius:8px';
  img.onload=()=>URL.revokeObjectURL(objectURL);
  img.onerror=()=>{URL.revokeObjectURL(objectURL);img.replaceWith(button);button.disabled=false;setChatStatus('Não foi possível exibir a imagem.','error')};
  button.replaceWith(img);
 }catch(error){setChatStatus(error.message,'error');button.disabled=false}
}
function renderChat(messages){
 const el=$('chatMessages'),prevBottom=el.scrollHeight-el.scrollTop-el.clientHeight;
 el.innerHTML=(messages||[]).map(m=>{
  const mine=(TEACHER&&m.author==='teacher')||(!TEACHER&&m.author==='student');
  return '<div class="msg '+(mine?'mine':'')+'"><small>'+esc(m.author==='teacher'?'Professor':'Aluno')+(m.mission?' · Etapa '+String(m.mission).padStart(2,'0'):'')+' · '+new Date(m.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+'</small>'+(m.body==='[Imagem]'||m.body?.startsWith('[Imagem]\n')?'<button type="button" data-image-id="'+Number(m.id)+'">🖼️ Abrir imagem privada</button>'+(m.body.length>8?'<p style="overflow-wrap:anywhere;white-space:pre-wrap;margin:8px 0 0">'+esc(m.body.slice(9))+'</p>':''):esc(m.body))+'</div>'
 }).join('')||'<div class="chat-empty"><strong>Nenhuma mensagem ainda</strong>'+(TEACHER?'Selecione uma conversa e envie uma orientação.':'Descreva em qual missão e passo você precisa de ajuda.')+'</div>';
 el.querySelectorAll('[data-image-id]').forEach(button=>button.onclick=()=>openChatImage(button.dataset.imageId,button));
 if(prevBottom<120)el.scrollTop=el.scrollHeight;
}
$('chatForm').onsubmit=async e=>{
 e.preventDefault();
 const field=$('chatInput'),text=field.value.trim();
 if(chatSending||(!chatImageDraft&&text.length<2))return;
 if(TEACHER&&!selectedThread)return setChatStatus('Escolha um aluno antes de responder.','error');
 chatSending=true;setChatEnabled(true);setChatStatus('Enviando mensagem…');
 try{
  if(chatImageDraft){
   const file=chatImageDraft.file;
   const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(Error('Falha ao ler imagem.'));reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.readAsDataURL(file)});
   await call('chat','send-image','POST',{image,mime:file.type,caption:text,studentId:TEACHER?selectedThread:undefined,mission:activeStage});
   clearChatImageDraft();
  }else await call('chat','send','POST',{body:text,studentId:TEACHER?selectedThread:undefined,mission:activeStage});
  field.value='';await loadChat();setToast('Mensagem enviada ✓');
 }catch(err){setChatStatus('Falha no envio: '+err.message+'. A mensagem continua no campo.','error');setToast(err.message,true)}
 finally{chatSending=false;setChatEnabled(!TEACHER||!!selectedThread)}
};
function startTeacherPreview(){
 if(!TEACHER)return;
 visualPreview=true;document.body.classList.add('pit-v3-visual-preview');
 state={current_stage:1,phase:'briefing',updated_at:null};activeStage=1;activePhase='briefing';progress=[];
 $('auth').hidden=true;$('loading').hidden=true;$('workspace').hidden=false;
 $('currentUser').textContent='MESTRE DA JORNADA · PRÉVIA';
 renderAll();
 $('roomState').textContent='PRÉVIA LOCAL · NÃO CONTROLA A TURMA';
 $('lastSync').textContent='Modo demonstração, sem conexão com alunos';
 showMissionGallery();
}
function startVisualPreview(){
 if(TEACHER||!window.PIT_ARCADE){setToast('Prévia indisponível nesta página.',true);return;}
 visualPreview=true;
 document.body.classList.add('pit-v3-visual-preview');
 progress=[];state={current_stage:10,phase:'practice',updated_at:null};activeStage=1;activePhase='briefing';
 $('auth').hidden=true;$('loading').hidden=true;$('workspace').hidden=false;
 $('currentUser').textContent='VISITANTE · DEMONSTRAÇÃO';
 $('lastSync').textContent='Prévia local, sem conexão nem cadastro';
 $('roomState').textContent='MODO VISUAL · PROGRESSO NÃO REGISTRADO';
 $('roleSubtitle').textContent='PRÉVIA DA INTERFACE · SEM DADOS REAIS';
 renderAll();
 showMissionGallery();
}
if($('previewOnly'))$('previewOnly').onclick=startVisualPreview;
$('showResources').onclick=()=>{window.open('./index.html#recursos','_blank','noopener')};
const changeIdentity=()=>{if(TEACHER){sessionStorage.removeItem('pit_teacher_pin');teacherPin=''}else{localStorage.removeItem('pit_chat_student_v09');studentSession=null}location.reload()};
$('changeUser').onclick=changeIdentity;
if($('changeUserTop'))$('changeUserTop').onclick=changeIdentity;
(async()=>{
 if(MISSIONS.length!==10){$('loading').textContent='Erro: catálogo de etapas incompleto.';return}
 if(new URLSearchParams(location.search).get('preview')==='1'){
   if(TEACHER)startTeacherPreview();else startVisualPreview();
   return;
  }
 if(window.PIT_HOSTING_POLICY?.mode(location.origin,false)==='static-only'){
  authenticate();
  $('authTitle').textContent='PRÉVIA ESTÁTICA · SEM ACESSO À TURMA';
  $('authMessage').textContent='Esta origem não está autorizada para o serviço de turma. A prévia local não exige cadastro, PIN nem token.';
  const previewLink=document.createElement('a');
  previewLink.href='?preview=1';previewLink.textContent='Abrir prévia segura (sem conexão)';
  previewLink.className='visual-preview-button';
  $('authMessage').appendChild(document.createTextNode(' '));
  $('authMessage').appendChild(previewLink);
  $('authForm').hidden=true;$('authForm').style.display='none';
  $('loading').hidden=true;
  return;
 }
 if(TEACHER?Boolean(teacherPin):Boolean(studentSession?.token)){
  try{await startApp();if($('workspace').hidden)await authenticate()}
  catch{await authenticate()}
 }else await authenticate();
})();
})();
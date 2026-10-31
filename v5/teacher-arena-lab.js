/* V5 — teacher collective M5/M10 VISUAL LAB, never production authorization.
 * All entries are generated in this tab, with no student accounts or writes.
 * The actual Three.js stage and KayKit assets are reused, not duplicated.
 */
import {createStage} from './arena-three.js';
const engine=window.PIT_V5_PHASE2;
const h0=window.PIT_V5_PROGRESSION_CONTRACT;
const gate=window.PIT_V5_TEACHER_ARENA_LAB;
if(!engine||!h0||!gate)throw Error('Contratos H0, B.6 e liberação coletiva são necessários');
const policy=h0.createPolicy(engine.TALENTS),teacher='trial-teacher';
const $=id=>document.getElementById(id);
let state=null,stage=null,monitor=null,loadStarted=0,ready=false,playing=false,runGeneration=0;
const reason={
 'outra-turma':'Turma divergente','offline':'Offline','não-pronto':'Ainda não está pronto',
 'progresso-ou-build-inválido':'Faltam aprovações ou lock de build'
};
function status(message){$('arenaStatus').textContent=message}
function teacherMessage(message){$('teacherStatus').textContent=message}
function eventLog(message){
 const box=$('battleLog');
 if(box.dataset.empty!=='false'){box.replaceChildren();box.dataset.empty='false'}
 const line=document.createElement('div');line.textContent=message;box.prepend(line);
 while(box.children.length>24)box.lastElementChild.remove();
}
function report(){
 const checks=gate.eligible(state,policy);
 $('totalCount').textContent=state.participants.length;
 $('eligibleCount').textContent=checks.filter(x=>x.eligible).length;
 $('excludedCount').textContent=checks.filter(x=>!x.eligible).length;
 return checks;
}
function drawRoster(checks){
 const view=checks||report();
 $('roster').replaceChildren();
 const people=new Map(state.participants.map(x=>[x.rosterKey,x]));
 for(const row of view){
  const p=people.get(row.rosterKey);
  const article=document.createElement('div');article.className='member';
  article.dataset.eligible=String(row.eligible);article.dataset.key=p.rosterKey;
  article.setAttribute('role','listitem');
  const name=document.createElement('div');
  const title=document.createElement('strong');title.textContent=p.rosterKey;
  const details=document.createElement('small');
  details.textContent=(row.eligible?'✦ Elegível':reason[row.reason]||'Bloqueado')+' · '+p.klass;
  name.append(title,details);article.append(name);
  for(const field of ['ready','online']){
   const label=document.createElement('label');
   label.append(field==='ready'?'Pronto':'Online');
   const checkbox=document.createElement('input');checkbox.type='checkbox';
   checkbox.checked=p[field]===true;checkbox.dataset.key=p.rosterKey;checkbox.dataset.field=field;
   checkbox.disabled=state.status!=='draft';
   checkbox.setAttribute('aria-label',(field==='ready'?'Pronto ':'Online ')+p.rosterKey);
   label.append(checkbox);article.append(label);
  }
  $('roster').append(article);
 }
}
function controls(){
 const draft=state.status==='draft',released=state.status==='released',running=state.status==='running';
 $('mission').disabled=!draft;$('count').disabled=!draft;$('teacherEnabled').disabled=!draft;
 $('teacherEnabled').checked=state.teacherEnabled;
 $('release').disabled=!draft||!state.teacherEnabled||report().filter(x=>x.eligible).length<2;
 $('prepare').disabled=!released||Boolean(stage);
 $('start').disabled=!released||!ready||!stage;
 $('abort').disabled=!released&&!running;
 $('pause').disabled=!running||!stage;
 $('pause').textContent=playing?'Ⅱ Pausar':'▶ Continuar';
 $('reset').disabled=false;
 $('release').textContent=state.status==='draft'?'✦ Liberar participantes elegíveis':'✦ Entrada encerrada';
 $('prepare').textContent=stage?'◈ Modelos em preparação':'◈ Preparar modelos 3D';
}
function stopStage(){
 runGeneration++;
 if(monitor!==null){clearInterval(monitor);monitor=null}
 if(stage){stage.dispose();stage=null}
 $('arenaStage').replaceChildren();
 $('stagePlaceholder').hidden=false;
 $('models').textContent='0';$('alive').textContent='—';
 ready=false;playing=false;
}
function setup(){
 stopStage();
 const mission=Number($('mission').value),count=Number($('count').value);
 state=gate.createState({mission,participants:gate.createRoster(engine,{mission,count})});
 $('teacherEnabled').checked=false;$('result').hidden=true;
 $('battleLog').textContent='Nenhuma batalha iniciada.';$('battleLog').dataset.empty='true';
 teacherMessage('A turma é simulada. Libere apenas heróis elegíveis.');
 status('Coliseu fechado: o professor fictício ainda não liberou a missão.');
 drawRoster(report());controls();
 $('arenaStage').dataset.teacherLab='fictional';
}
function mutate(method,details={}){
 try{
  state=gate[method](state,{actor:teacher,expectedRevision:state.revision,...details});
  controls();return true;
 }catch(error){teacherMessage(error.message);return false}
}
$('mission').addEventListener('change',setup);
$('count').addEventListener('change',setup);
$('teacherEnabled').addEventListener('change',()=>{
 if(mutate('alter',{enabled:$('teacherEnabled').checked}))
  teacherMessage(state.teacherEnabled?'Professor fictício habilitou a entrada.':'Arena desabilitada pelo professor fictício.');
});
$('roster').addEventListener('change',event=>{
 const input=event.target;
 if(input?.tagName!=='INPUT'||!input.dataset.key)return;
 const field=input.dataset.field;
 if(!['online','ready'].includes(field))return;
 if(mutate('alter',{rosterKey:input.dataset.key,[field]:input.checked})){
  drawRoster(report());teacherMessage('Disponibilidade fictícia alterada; elegibilidade recalculada.');
 }else drawRoster(report());
});
$('release').addEventListener('click',()=>{
 if(!mutate('release',{policy,seed:20261031}))return;
 const count=state.release.entrants.length,blocked=state.release.excluded.length;
 teacherMessage('O professor liberou '+count+' elegíveis; '+blocked+' bloqueados. Nenhuma pontuação foi alterada.');
 status('Liberação fictícia confirmada: '+count+' heróis. Clique em “Preparar modelos 3D”.');
 drawRoster(report());controls();
});
function finish(result,generation){
 if(generation!==runGeneration||state?.status!=='running')return;
 const winner=result?.winner;
 if(!winner||!result.finished)return;
 if(!mutate('finish',{winner:winner.id,time:result.time}))return;
 playing=false;
 $('result').hidden=false;
 $('result').textContent='✦ Vencedor: '+winner.name+' · '+result.time+' segundos · '+state.result.participants+' participantes fictícios. Nenhum XP ou nota foi alterado.';
 eventLog('🏆 '+winner.name+' venceu a partida coletiva.');
 status('Partida experimental M'+state.mission+' encerrada. Professor pode iniciar outra simulação.');
 controls();
}
function prepare(){
 if(state?.status!=='released'||stage)return;
 const generation=++runGeneration;
 let currentStage=null;
 const mission=state.mission,entrants=state.release.entrants;
 const roster=entrants.map(e=>({
  id:e.id,name:e.name,approvedMissions:e.approvedMissions,
  finalTrial:e.finalTrial,
  build:engine.canonical(e.build,mission,{experimentalFinal:mission===10})
 }));
 try{
  $('stagePlaceholder').hidden=true;
  currentStage=createStage($('arenaStage'),{
   quality:(navigator.deviceMemory||4)<4?'low':'auto',arenaScale:5,
   spriteEffects:mission===5?'on':'off',
   onEvent:event=>{
    if(runGeneration!==generation)return;
    if(event.type==='talent')eventLog('✧ '+event.hero+' ativou '+(event.name||event.talent));
    if(event.type==='knockout')eventLog('☠ Eliminação registrada na arena.');
    if(event.type==='end'&&stage?.simulation)
     finish(stage.simulation.result(),generation);
   }
  });
  stage=currentStage;
  stage.fighters(roster,{arenaMission:mission,seed:state.release.seed,
   limit:95,damageScale:.5,stormDelay:35,stormRateFactor:.65,
   engagementMode:'spaced',navigationMode:'steer',
   rangedCommitment:'recovery',balancePreset:'e-hp2'});
  stage.enableAutoCamera(true);
  loadStarted=Date.now();
  status('Carregando '+roster.length+' GLBs oficiais KayKit. Início bloqueado até todos aparecerem.');
  $('alive').textContent=roster.length;controls();
  monitor=setInterval(()=>{
   if(runGeneration!==generation||!stage)return;
   const loaded=Number($('arenaStage').dataset.v5ModelsLoaded||0);
   const failed=Number($('arenaStage').dataset.v5ModelsFailed||0);
   $('models').textContent=loaded+' / '+roster.length;
   const fighters=stage.simulation?.fighters||[];
   $('alive').textContent=fighters.filter(f=>f.alive).length;
   if(!ready&&failed){
    status('Falharam '+failed+' GLBs. A batalha não começa invisível. Interrompa e tente novamente.');
    if(monitor!==null){clearInterval(monitor);monitor=null}
   }else if(!ready&&Date.now()-loadStarted>45000){
    status('Tempo esgotado ao carregar modelos. Interrompa e tente novamente.');
    if(monitor!==null){clearInterval(monitor);monitor=null}
   }else if(!ready&&loaded===roster.length){
    ready=true;
    status('✓ '+loaded+' heróis KayKit prontos. Agora o professor fictício pode iniciar o confronto.');
    controls();
   }
   if(state.status==='running'&&stage.simulation?.finished)finish(stage.simulation.result(),generation);
  },350);
 }catch(error){
  stopStage();status('Não foi possível preparar WebGL: '+(error?.message||error));
  controls();
 }
}
$('prepare').addEventListener('click',prepare);
$('start').addEventListener('click',()=>{
 if(!stage||!ready)return;
 if(!mutate('start'))return;
 stage.resume();playing=true;
 status('⚔ Confronto M'+state.mission+' iniciado pelo professor fictício; câmera automática ativada.');
 eventLog('⚔ Começou o torneio com '+state.release.entrants.length+' participantes.');
 controls();
});
$('pause').addEventListener('click',()=>{
 if(!stage||state.status!=='running')return;
 if(stage.playing){stage.pause();playing=false;status('O professor fictício pausou a partida.')}
 else{stage.resume();playing=true;status('Partida coletiva retomada.')}
 controls();
});
$('abort').addEventListener('click',()=>{
 if(!mutate('abort'))return;
 stopStage();
 status('Partida fictícia interrompida pelo professor. Nenhum vencedor ou XP atribuído.');
 teacherMessage('Use “Nova simulação” para recriar a turma e reabrir a arena.');
 controls();
});
$('reset').addEventListener('click',()=>{
 if(state?.status==='running'||state?.status==='released')mutate('abort');
 if(state?.status==='finished'||state?.status==='aborted')mutate('reset');
 setup();
});
window.addEventListener('pagehide',stopStage,{once:true});
// Read-only debug affordance: CI can inspect status, not write to the gate.
window.PIT_V5_TEACHER_ARENA_LAB_VIEW=Object.freeze({
 get status(){return state?.status||'uninitialized'},
 get mission(){return state?.mission||null},
 get eligible(){return state?gate.eligible(state,policy).filter(p=>p.eligible).length:0},
 get released(){return state?.release?.entrants.length||0},
 get engine(){return $('arenaStage').dataset.v5CombatEngine||'not-loaded'},
 get realModels(){return Number($('arenaStage').dataset.v5ModelsLoaded||0)},
 get running(){return state?.status==='running'}
});
setup();

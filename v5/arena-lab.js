/* Arena V5 | Isolated 3D battle lab for educational prototyping.
 * Uses existing legacy V5 battle engine as a temporary scaffold.
 * NO approved-stages API, no teacher PIN, no XP writes, no student identities.
 * The 120 Phase-2 talents are NOT executed in this demonstrator.
 */
import {createStage} from './arena-three.js';
import * as THREE from 'three';
const CORE=window.PIT_V5_CORE;
const CATALOG=window.PIT_V5_FASE1||[];
const $=id=>document.getElementById(id);
const palette={warrior:'ember',mage:'amethyst',hunter:'jade',guardian:'azure'};
const names={warrior:'Guerreiro das Cinzas',mage:'Arcanista das Runas',hunter:'Caçador do Eclipse',guardian:'Guardião do Alvorecer'};
const glyph={warrior:'⚔',mage:'✦',hunter:'➶',guardian:'◆'};
const allowed=CATALOG.map(x=>x.id);
const expected=['warrior','mage','hunter','guardian'];
if(!CORE||expected.some(x=>!allowed.includes(x)))throw Error('A arena exige as quatro classes CC0 e o núcleo V5.');
const state={mission:5,count:30,stage:null,busy:true,fought:false,interval:null,result:null,speed:1,roster:[]};
const $status=$('arenaStatus'),$models=$('modelReport');
function message(text,kind='ready'){$status.textContent=text;$status.dataset.status=kind;}
function roster(mission,count=30){
 // The first M5/M10 lab deliberately uses 10/20 points ONLY,
 // not the historical 6 free points nor peer-review bonus XP.
 const presets={
  warrior:{power:6,agility:2,spirit:0,vitality:2},
  mage:{power:0,agility:2,spirit:7,vitality:1},
  hunter:{power:2,agility:7,spirit:0,vitality:1},
  guardian:{power:1,agility:0,spirit:1,vitality:8}
 };
 const factor=mission===10?2:1,xp=mission*100;
 return Array.from({length:count},(_,i)=>{
  const klass=expected[i%4],label=count===4?names[klass]:(names[klass].split(' ')[0]+' '+String(i+1).padStart(2,'0'));
  const build=CORE.seedBuild(label,klass);
  build.appearance.palette=palette[klass];
  for(const [key,value] of Object.entries(presets[klass]))build.attributes[key]=value*factor;
  return {id:'arena-lab-'+i+'-'+klass,name:label,build:CORE.canonical(build,label,xp),progress:{missions:mission,total:xp,approvedXp:xp,reviewXp:0}};
 });
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function updateScoreboard(){
 const sim=state.stage?.simulation,combatants=sim?.fighters||[];
 const panel=$('fighters');
 if(!combatants.length){panel.textContent='Inicializando combatentes...';return;}
 const signature=combatants.map(f=>f.id).join('|');
 if(panel.dataset.rosterSignature!==signature){
  // Rebuild ONLY when roster changes; otherwise focus buttons are detached
  // every 450ms and cannot be tapped reliably on mobile or in Playwright.
  panel.innerHTML=combatants.map(f=>'<div role="listitem" class="fighter" data-id="'+esc(f.id)+'" data-fighter="'+esc(f.build.klass)+'">'+
   '<div class="name"><strong>'+glyph[f.build.klass]+' '+esc(f.name)+'</strong><span data-hp></span></div>'+
   '<div class="bar"><span data-health style="width:100%"></span></div>'+
   '<div class="small"><span data-damage></span><button type="button" data-focus="'+esc(f.id)+'" aria-label="Seguir '+esc(f.name)+'">◉ Seguir</button></div></div>').join('');
  panel.dataset.rosterSignature=signature;
 }
 for(let i=0;i<combatants.length;i++){
  const f=combatants[i],item=panel.children[i];if(!item)continue;
  const val=Math.max(0,f.hp),max=f.stats.hp;
  item.classList.toggle('defeated',!f.alive);
  item.querySelector('[data-hp]').textContent=Math.ceil(val)+' / '+max+' HP';
  item.querySelector('[data-health]').style.width=Math.max(0,Math.min(100,val/max*100)).toFixed(1)+'%';
  item.querySelector('[data-damage]').textContent=CORE.CLASS[f.build.klass].label+' · '+Math.round(f.damage||0)+' dano';
 }
}
function appendLog(content,klass='hit'){
 const log=$('battleLog');if(log.querySelector('p'))log.replaceChildren();
 const el=document.createElement('div');el.className='event '+klass;el.textContent=content;
 log.prepend(el);
 while(log.children.length>26)log.lastChild.remove();
}
function onEvent(event){
 if(event.type==='special'){
  const name=state.roster.find(x=>x.id===event.hero)?.name||'Herói';
  appendLog('✦ '+name+' conjurou '+(event.ability||'sua técnica de classe')+'!','special');
 }
 if(event.type==='critical')appendLog('⚡ Um golpe crítico atingiu o adversário!','special');
 if(event.type==='knockout'){
  const defeated=state.roster.find(x=>x.id===event.target)?.name||'Um combatente';
  appendLog('☠ '+defeated+' foi eliminado!','hit');
 }
 if(event.type==='storm')appendLog('☄ A tempestade engoliu um dos combatentes.','hit');
 if(event.type==='end'){
  const winner=state.stage.simulation?.result()?.winner;
  state.result=winner||null;state.fought=true;
  const title=winner?'✶ Vencedor: '+winner.name:'A luta terminou sem vencedor.';
  $('result').textContent=title;
  appendLog('✶ '+title,'end');
  message('CONFRONTO FINALIZADO','finished');
  $('startBattle').disabled=true;$('pauseBattle').disabled=true;$('resetBattle').disabled=false;
 }
 updateScoreboard();
}
function reportModels(){
 const stage=$('arenaStage');
 const count=Number(stage.dataset.v5ModelsLoaded||0);
 const failed=Number(stage.dataset.v5ModelsFailed||0);
 const expectedCount=Number(stage.dataset.v5ModelsExpected||4);
 if(failed){
  $models.textContent='Falha em '+failed+' modelo(s) GLB. O confronto fica indisponível até carregar todos os modelos reais.';
  $models.dataset.error='true';state.busy=true;$('startBattle').disabled=true;
  message('MODELO 3D INDISPONÍVEL');return;
 }
 $models.textContent=count+' / '+expectedCount+' modelos 3D reais carregados';
 if(count===expectedCount&&expectedCount===state.count&&!state.fought&&!state.stage?.playing&&!state.busy){
  return;
 }
 if(count===expectedCount&&expectedCount===state.count&&!state.fought&&!state.stage?.playing){
  state.busy=false;
  $('startBattle').disabled=false;
  message('OS '+state.count+' HERÓIS ESTÃO PRONTOS');
 }
}
function initRound(){
 if(!state.stage)return;
 state.stage.pause();
 state.fought=false;state.result=null;state.busy=true;state.speed=1;
 state.stage.setSpeed(1);
 $('speedBattle').textContent='Velocidade ×1';
 $('result').textContent='Ainda não há vencedor. Prepare o coliseu.';
 $('battleLog').innerHTML='<p>As ações aparecerão aqui quando a batalha começar.</p>';
 $('startBattle').disabled=true;$('pauseBattle').disabled=true;$('resetBattle').disabled=false;$('speedBattle').disabled=false;$('overviewCamera').disabled=false;
 const mission=state.mission;
 $('arenaTitle').textContent=mission===5?'Missão 05 · Arena de Teste':'Missão 10 · Prévia da Arena Final';
 const prefix=mission===5?'Treino com 500 XP e sem travamento.':'Prévia com 1.000 XP, sem travamento ou autenticação.';
 message('CARREGANDO '+state.count+' HERÓIS');
 state.roster=roster(mission,state.count);
 try{state.stage.fighters(state.roster,{seed:mission===5?10929:20929,limit:75});
  // Close-in spectator camera for four characters. The full coliseum remains orbitable.
  state.stage.camera.position.set(0,state.count===30?76:16,state.count===30?112:26);}
 catch(e){message('ERRO AO PREPARAR ARENA');$models.textContent=String(e.message||e);return;}
 if($('stageLoading'))$('stageLoading').hidden=true;
 updateScoreboard();$models.textContent=prefix+' Carregando modelos CC0 reais...';
 reportModels();
}
function begin(){
 if(state.busy||state.fought||!state.stage?.simulation)return;
 state.stage.resume();
 $('startBattle').disabled=true;$('pauseBattle').disabled=false;$('pauseBattle').textContent='Ⅱ Pausar';
 message('BATALHA EM ANDAMENTO','running');
 appendLog('⚔ O confronto da missão '+String(state.mission).padStart(2,'0')+' começou!','special');
}
function pause(){
 if(!state.stage?.simulation||state.fought)return;
 if(state.stage.playing){
  state.stage.pause();$('pauseBattle').textContent='▶ Continuar';
  message('BATALHA PAUSADA');
 }else{
  state.stage.resume();$('pauseBattle').textContent='Ⅱ Pausar';
  message('BATALHA EM ANDAMENTO','running');
 }
}
document.querySelectorAll('.roster-mode').forEach(button=>button.addEventListener('click',()=>{
 const count=Number(button.dataset.roster);if(![4,30].includes(count)||state.count===count)return;
 state.count=count;document.querySelectorAll('.roster-mode').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.roster)===count)));
 initRound();
}));
document.querySelectorAll('.milestone').forEach(button=>{
 button.addEventListener('click',()=>{
  const next=Number(button.dataset.mission);
  if(state.mission===next)return;
  state.mission=next;
  document.querySelectorAll('.milestone').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.mission)===next)));
  initRound();
 });
});
$('startBattle').addEventListener('click',begin);
$('pauseBattle').addEventListener('click',pause);
$('resetBattle').addEventListener('click',initRound);
$('overviewCamera').addEventListener('click',()=>state.stage?.overview());
const expandButton=$('expandStage');
function setImmersive(on){
 document.body.classList.toggle('arena-immersive',on);
 expandButton.setAttribute('aria-pressed',String(on));
 expandButton.textContent=on?'✕ Fechar arena':'⛶ Ampliar arena';
 requestAnimationFrame(()=>state.stage?.resize());
}
expandButton.addEventListener('click',()=>setImmersive(!document.body.classList.contains('arena-immersive')));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('arena-immersive'))setImmersive(false)});
$('fighters').addEventListener('click',event=>{const btn=event.target.closest('[data-focus]');if(btn)state.stage?.focusFighter(btn.dataset.focus);});
$('speedBattle').addEventListener('click',()=>{
 if(!state.stage)return;
 state.speed=state.speed===1?1.5:state.speed===1.5?2:state.speed===2?3:1;
 state.stage.setSpeed(state.speed);$('speedBattle').textContent='Velocidade ×'+state.speed;
});
window.addEventListener('pagehide',()=>{clearInterval(state.interval);state.stage?.dispose()},{once:true});
try{
 state.stage=createStage($('arenaStage'),{quality:(navigator.deviceMemory||4)<4?'low':'auto',arenaScale:2.6,onEvent});
 const actorFill=new THREE.DirectionalLight(0xffd5b9,2.5);actorFill.position.set(4,13,14);state.stage.scene.add(actorFill);
 initRound();
 state.interval=setInterval(()=>{if(!document.hidden){updateScoreboard();reportModels()}},450);
}catch(e){
 state.busy=true;message('WEBGL INDISPONÍVEL');
 if($('stageLoading'))$('stageLoading').textContent='O Three.js não pôde iniciar: '+String(e?.message||e);
 $models.textContent='O navegador não conseguiu iniciar o protótipo. Nenhum dado de aluno foi alterado.';
}
window.PIT_V5_ARENA_LAB=Object.freeze({
 get mission(){return state.mission},
 get fighterCount(){return state.count},
 get modelState(){return {loaded:Number($('arenaStage').dataset.v5ModelsLoaded||0),failed:Number($('arenaStage').dataset.v5ModelsFailed||0)}},
 get finished(){return !!state.stage?.simulation?.finished},
 get winner(){return state.stage?.simulation?.result()?.winner||null},
 get previewOnly(){return true},
 get mapId(){return $('arenaStage').dataset.v5Map||'not-loaded'}
});
/* Arena V5 | Isolated 3D battle lab for educational prototyping.
 * Uses existing legacy V5 battle engine as a temporary scaffold.
 * NO approved-stages API, no teacher PIN, no XP writes, no student identities.
 * B.6 executes all 120 approved Phase-2 talents in the M5 sandbox; final lock and exclusive animations remain pending.
 */
import {createStage} from './arena-three.js';
import * as THREE from 'three';
const CORE=window.PIT_V5_CORE,PHASE2=window.PIT_V5_PHASE2;
const M10_VISUAL=window.PIT_V5_M10_VISUAL_ROSTER;
const PROGRESSION=window.PIT_V5_PROGRESSION_CONTRACT;
const CATALOG=window.PIT_V5_FASE1||[];
const $=id=>document.getElementById(id);
const palette={warrior:'ember',mage:'amethyst',hunter:'jade',guardian:'azure'};
const names={warrior:'Guerreiro das Cinzas',mage:'Arcanista das Runas',hunter:'Caçador do Eclipse',guardian:'Guardião do Alvorecer'};
const glyph={warrior:'⚔',mage:'✦',hunter:'➶',guardian:'◆'};
const allowed=CATALOG.map(x=>x.id);
const expected=['warrior','mage','hunter','guardian'];
if(!CORE||expected.some(x=>!allowed.includes(x)))throw Error('A arena exige as quatro classes CC0 e o núcleo V5.');
const params=new URLSearchParams(location.search);
// H.3: M10 strictly opt-in, fictional roster, no writes to XP or user progress.
const m10Preview=params.get('m10preview')==='1';
if(m10Preview&&(!PHASE2||!M10_VISUAL||!PROGRESSION))
 throw Error('Prévia M10 exige motor e contrato H0; legado bloqueado');
const m10Policy=m10Preview?PROGRESSION.createPolicy(PHASE2.TALENTS):null;
// Experimental M5-only comparison; absent query retains established movement.
const experimentalSteering=params.get('nav')==='steer';
const experimentalCounterplay=params.get('counterplay')==='1';
const experimentalHpBalance=params.get('balance')==='hp2';
// E.6: original animated talent sprites in M5 only (never progression or M10).
const experimentalTalentSprites=params.get('sprites')==='1';
// G.1: explicitly opt-in local diagnostics; no forced low graphics quality.
const performanceDiagnostics=params.get('perf')==='1';
// Reproduce a reported lab run exactly without touching student data.
const requestedSeed=/^\d{1,10}$/.test(params.get('seed')||'')?(Number(params.get('seed'))>>>0):0;
const importedBuild=(()=>{
 try{
  const raw=params.get('draft');
  if(!raw||raw.length>1800||!PHASE2)return null;
  const input=JSON.parse(raw);
  if(input?.missions!==5||!expected.includes(input?.klass)||!Array.isArray(input.talents)||input.talents.length!==5)return null;
  return PHASE2.canonical({...input,name:'Minha build de teste'},5);
 }catch{return null}
})();
// Isolated presentation presets. No global class statistics or persistent XP changes.
const PACES=[
 {scale:1,mageBonus:1,label:'Dano 100% · original'},
 {scale:.75,mageBonus:1.10,label:'Dano 75% · prolongado'},
 {scale:.60,mageBonus:1.10,label:'Dano 60% · épico'},
 {scale:.50,mageBonus:1.10,label:'Dano 50% · lendário'}
];
const state={damageIndex:3,mission:m10Preview?10:5,count:importedBuild||params.get('count')==='4'?4:30,customBuild:importedBuild,phase2:m10Preview||params.get('phase2')==='1'||!!importedBuild,phase2Variant:0,stage:null,busy:true,fought:false,interval:null,result:null,speed:1,roster:[],round:0,seed:0,spotId:null,spotPriority:0,spotTime:-999,lastHitLog:-999,director:false,lastCameraTime:-999,abilityCount:0};
const $status=$('arenaStatus'),$models=$('modelReport');
function message(text,kind='ready'){$status.textContent=text;$status.dataset.status=kind;}
function roster(mission,count=30){
 if(mission===10&&m10Preview)
  return M10_VISUAL.createRoster(PHASE2,m10Policy,{count,variant:state.phase2Variant});
 if(state.phase2){
  if(mission!==5||!PHASE2)throw Error('Motor B.4 aceita apenas missão 5');
  return Array.from({length:count},(_,i)=>{
   const mine=i===0&&state.customBuild;
   const klass=mine?state.customBuild.klass:expected[i%4];
   const label=mine?'Minha build de teste':count===4?names[klass]:(names[klass].split(' ')[0]+' '+String(i+1).padStart(2,'0'));
   const build=mine?state.customBuild:PHASE2.exampleBuild(klass,label,5,(Math.floor(i/4)+state.phase2Variant)%11);
   return {id:mine?'phase2-my-forged-build':'phase2-'+i+'-'+klass,name:label,build,approvedMissions:5};
  });
 }
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
  // Different strategies within the same class and *same* total XP:
  // a reproducible variation in point allocation avoids 30 mirror builds.
  const preset={...presets[klass]};
  if(count>4){
   const idx=Math.floor(i/4);
   if(idx%3===1){
    if(preset.vitality>=2){preset.vitality-=2;preset.agility+=2}
    else if(preset.spirit>=2){preset.spirit-=2;preset.vitality+=2}
    else {preset.power=Math.max(0,preset.power-2);preset.vitality+=2}
   }else if(idx%3===2){
    if(preset.power>=2){preset.power-=2;preset.vitality+=2}
    else if(preset.agility>=2){preset.agility-=2;preset.spirit+=2}
    else {preset.vitality=Math.max(0,preset.vitality-2);preset.power+=2}
   }
  }
  for(const [key,value] of Object.entries(preset))build.attributes[key]=value*factor;
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
   '<div class="small"><span data-damage></span><button type="button" data-focus="'+esc(f.id)+'" aria-label="Seguir '+esc(f.name)+'">◉ Seguir</button></div>'+
   (state.phase2?'<div class="small talents" title="Talentos selecionados">✦ '+esc(f.build.talents.join(' · '))+'</div>':'')+'</div>').join('');
  panel.dataset.rosterSignature=signature;
 }
 for(let i=0;i<combatants.length;i++){
  const f=combatants[i],item=panel.children[i];if(!item)continue;
  const val=Math.max(0,f.hp),max=f.stats.hp;
  item.classList.toggle('defeated',!f.alive);
  item.querySelector('[data-hp]').textContent=Math.ceil(val)+' / '+max+' HP';
  item.querySelector('[data-health]').style.width=Math.max(0,Math.min(100,val/max*100)).toFixed(1)+'%';
  item.querySelector('[data-damage]').textContent=f.alive?CORE.CLASS[f.build.klass].label+' · '+Math.round(f.damage||0)+' dano':'👁 Arquibancada · eliminado';
 }
 const watching=combatants.filter(f=>!f.alive).length;
 const audience=$('spectatorsCount');if(audience)audience.textContent=watching+' na arquibancada';
 const remaining=$('aliveCount');if(remaining)remaining.textContent=(combatants.length-watching)+' em combate';
}
function appendLog(content,klass='hit'){
 const log=$('battleLog');if(log.querySelector('p'))log.replaceChildren();
 const el=document.createElement('div');el.className='event '+klass;el.textContent=content;
 log.prepend(el);
 while(log.children.length>26)log.lastChild.remove();
}
function heroName(id){
 const candidate=state.stage?.simulation?.fighters.find(f=>f.id===id);
 return candidate?.name||'Combatente';
}
function spotlight(text,detail,id,kind,priority,eventTime){
 // A dozen ordinary hits at once should never obscure a knockout or skill.
 const t=Number(eventTime)||0;
 if(priority<state.spotPriority&&t-state.spotTime<(state.spotPriority>=3?2.4:1.3))return;
 const element=$('battleSpotlight');
 element.dataset.type=kind;
 $('spotlightText').textContent=text;
 $('spotlightSource').textContent=detail;
 state.spotId=id;
 $('followSpotlight').disabled=!id;
 state.spotPriority=priority;state.spotTime=t;
 // F.1: the pure director selects camera plans from unfiltered real combat
 // events. HUD spotlight text must never override its shot or force a cut.
}
function onEvent(event){
 const t=Number(event.time)||0;
 const hero=heroName(event.hero),target=heroName(event.target);
 if(event.type==='talent'){
  const name=event.name||event.talent;
  spotlight('✦ '+hero+' usou '+name,'Talento '+event.talent+' · Missão 5',event.hero,'special',3,t);
  appendLog('✦ '+hero+' ativou '+name+' ('+event.talent+')','special');
  state.abilityCount++;
  $('talentLast').textContent=name+' · '+hero;
  $('talentCount').textContent=state.abilityCount+' '+(state.abilityCount===1?'talento ativado':'talentos ativados');
  $('talentTelemetry').dataset.active='true';
 }else if(event.type==='proc'||event.type==='charge'){
  if(t-state.lastHitLog>1){appendLog('✧ '+hero+' '+(event.type==='charge'?'carregou ':'ativou ')+event.talent,'special');state.lastHitLog=t}
 }else if(event.type==='prepare'){
  spotlight('⚠ '+hero+' prepara '+(event.ability||'especial'),'Ataque iminente — observe a animação',event.hero,'special',2,t);
  if(t-state.lastHitLog>1.0){
   appendLog('⚠ '+hero+' está preparando '+(event.ability||'especial'),'special');
   state.lastHitLog=t;
  }
 }else if(event.type==='hit'){
  const kind=event.kind==='melee'?'golpe corpo a corpo':
   event.kind==='multishot'?'flecha dupla':'projétil';
  const points=Math.round(event.amount||0);
  if(t-state.lastHitLog>=1.4){
   appendLog('⚔ '+hero+' acertou '+target+': −'+points+' PV ('+kind+')','hit');
   state.lastHitLog=t;
  }
  if(points>=6)spotlight(hero+' atingiu '+target,'−'+points+' PV · '+kind,event.hero,'hit',1,t);
 }else if(event.type==='special'){
  const ability=event.ability||'habilidade de classe';
  spotlight(hero+' usou '+ability,'Habilidade especial · '+CORE.CLASS[state.stage.simulation.fighters.find(f=>f.id===event.hero)?.build.klass]?.label,event.hero,'special',3,t);
  appendLog('✦ '+hero+' ativou '+ability,'special');
 }else if(event.type==='dodge'){
  if(t-state.lastHitLog>=.7){
   appendLog('◇ '+hero+' esquivou de um golpe','dodge');
   state.lastHitLog=t;
  }
  spotlight(hero+' desviou do ataque','Esquiva — dano evitado',event.hero,'dodge',2,t);
 }else if(event.type==='dash'){
  if(t-state.lastHitLog>=1){
   appendLog('➤ '+hero+' avançou para atacar','special');
   state.lastHitLog=t;
  }
 }else if(event.type==='knockout'){
  const killer=event.by||heroName(event.hero);
  spotlight(killer+' eliminou '+target,'☠ '+target+' foi para a arquibancada',event.hero,'knockout',5,t);
  appendLog('☠ '+killer+' eliminou '+target+' · arquibancada','end');
 }else if(event.type==='storm'){
  spotlight(target+' foi eliminado pela tempestade','A área segura está diminuindo',event.target||event.hero,'knockout',5,t);
  appendLog('☄ '+target+' saiu da arena pela tempestade','end');
 }else if(event.type==='end'){
  const sim=state.stage?.simulation,detail=sim?.result(),winner=detail?.winner;
  state.result=winner||null;state.fought=true;
  const champion=sim?.fighters.find(f=>f.id===winner?.id);
  const title=winner?'✶ Vencedor: '+winner.name:'A luta terminou sem vencedor.';
  $('result').textContent=title+(champion?' · '+CORE.CLASS[champion.build.klass].label+' · '+champion.kills+' eliminações · '+Math.round(champion.damage)+' dano':'');
  spotlight(title,champion?'Dano total: '+Math.round(champion.damage)+' · KOs: '+champion.kills:'Fim de confronto',winner?.id,'knockout',6,t);
  appendLog('✶ '+title,'end');
  message('CONFRONTO FINALIZADO','finished');
  $('startBattle').disabled=true;$('pauseBattle').disabled=true;$('resetBattle').disabled=false;
 }
 // Updating 30 fighter DOM cards for every projectile hit starves the
 // WebGL frame loop. The scoreboard also refreshes every 450ms; only
 // knockouts and the winner need an immediate refresh.
 if(event.type==='knockout'||event.type==='storm'||event.type==='end')updateScoreboard();
}
function reportModels(){
 const stage=$('arenaStage');
 const count=Number(stage.dataset.v5ModelsLoaded||0);
 const failed=Number(stage.dataset.v5ModelsFailed||0);
 const expectedCount=Number(stage.dataset.v5ModelsExpected||4);
 if(failed){
  $models.textContent='Falha em '+failed+' modelo(s) GLB. A batalha não começa com modelos incompletos. Verifique a conexão e tente novamente.';
  $models.dataset.error='true';state.busy=true;$('startBattle').disabled=true;
  $('retryModels').hidden=false;$('retryModels').disabled=false;
  $('retryModels').textContent='↻ Repetir download de '+failed+' modelo(s) ausentes';
  message('MODELO 3D INDISPONÍVEL');return;
 }
 $('retryModels').hidden=true;delete $models.dataset.error;
 $models.textContent=count+' / '+expectedCount+' modelos 3D reais carregados';
 const proof=$('realModelProof');
 if(proof){
  proof.dataset.ready=String(count===expectedCount&&expectedCount>0);
  proof.title=count+' de '+expectedCount+' GLBs oficiais efetivamente carregados nesta partida';
 }
 if(count===expectedCount&&expectedCount===state.count&&!state.fought&&!state.stage?.playing&&!state.busy){
  return;
 }
 if(count===expectedCount&&expectedCount===state.count&&!state.fought&&!state.stage?.playing){
  state.busy=false;
  $('startBattle').disabled=false;
  message('OS '+state.count+' HERÓIS ESTÃO PRONTOS');
 }
}
function initRound({sameSeed=false}={}){
 if(!state.stage)return;
 state.stage.pause();
 state.fought=false;state.result=null;state.busy=true;state.speed=1;
 state.director=false;$('actionCamera').setAttribute('aria-pressed','false');
 $('actionCamera').textContent='◎ Diretor automático';
 $('directorStatus').textContent='Câmera: manual';
 $('studentViewStatus').textContent='Professor · diretor cinematográfico';
 state.spotId=null;state.spotPriority=0;state.spotTime=-999;state.lastHitLog=-999;state.lastCameraTime=-999;
 state.abilityCount=0;
 $('talentTelemetry').dataset.active='false';
 $('talentLast').textContent='Aguardando uma habilidade real';
 $('talentCount').textContent='0 talentos ativados';
 $('battleSpotlight').dataset.type='ready';$('spotlightText').textContent='Aguardando início do confronto';$('spotlightSource').textContent='Os golpes, habilidades e eliminações aparecem aqui.';
 $('combatClock').textContent='00:00';$('followSpotlight').disabled=true;
 state.stage.setSpeed(1);
 $('speedBattle').textContent='Velocidade ×1';
 const pace=PACES[state.damageIndex];
 $('damagePace').textContent='⚔ '+pace.label;
 $('damagePace').setAttribute('aria-label','Alterar ritmo do confronto. '+pace.label+'. '+(pace.scale===1?'Regras originais, sem compensação.':'O Arcanista recebe uma compensação ofensiva experimental de 10%.'));
 $('damagePace').setAttribute('title','Reduz dano de ataques/habilidades e adia o fechamento do círculo. O dano causado pela tempestade permanece inalterado. Experimento reversível.');
 $('damagePace').dataset.scale=String(pace.scale);
 $('result').textContent='Ainda não há vencedor. Prepare o coliseu.';
 $('retryModels').hidden=true;$('retryModels').disabled=false;
 $('battleLog').innerHTML='<p>As ações aparecerão aqui quando a batalha começar.</p>';
 $('startBattle').disabled=true;$('pauseBattle').disabled=true;$('resetBattle').disabled=false;$('speedBattle').disabled=false;$('overviewCamera').disabled=false;$('cinematicCamera').disabled=false;$('actionCamera').disabled=false;
 const mission=state.mission,trial=state.phase2&&(mission===5||mission===10&&m10Preview);
 document.querySelectorAll('.milestone').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.mission)===mission)));
 const toggle=$('phase2Mode');
 $('studentViewControls').hidden=!trial;
 $('studentViewButton').disabled=!trial;
 $('teacherViewButton').disabled=!trial;
 const sets=['Brutalidade / Elemental','Alternativos I','Mistos I','Caminhos II','Mistos II','Caminhos III','Mistos III','Caminhos IV','Mistos IV','Caminhos V','Mistos V'];
 const chooseBuilds=$('phase2Builds');
 chooseBuilds.disabled=!trial;
 chooseBuilds.textContent='✦ Combinações: '+sets[state.phase2Variant];
 chooseBuilds.setAttribute('aria-label','Alterar combinação de talentos: '+sets[state.phase2Variant]);
 toggle.setAttribute('aria-pressed',String(trial));
 toggle.innerHTML=mission===10&&trial?
  '<strong>✦ Final 3D experimental</strong><small>M10 · 10 talentos · sem alunos</small>':
  trial?'<strong>✦ Talentos reais: ATIVO</strong><small>MOTOR M5 · B.6</small>':
  '<strong>✦ Experimentar 120 talentos</strong><small>ATIVAR MOTOR DA MISSÃO 5</small>';
 $('engineModeInfo').textContent=trial&&mission===10?
  'H.3: PRÉVIA 3D EXPERIMENTAL da Missão 10. Dez talentos e vinte pontos por herói; personagens fictícios, sem login, XP, aprovações nem sincronização real. Build M5 congelada apenas em memória.':
  trial?(state.customBuild?'SUA BUILD EXPERIMENTAL DA FORJA · cinco talentos e até dez pontos na missão 5. O confronto NÃO verifica aprovações, notas ou entrada oficial no torneio.':
  'MOTOR B.6 · 120 talentos executáveis, 30 opções por classe; 5 talentos escolhidos e até 10 pontos por herói na missão 5. Sem animações exclusivas, servidor ou arena final.'):
  'Motor legado · os 120 talentos finais ainda não foram integrados; modo experimental B.1 disponível.';
 state.round++;
 // Keep identical starting positions, talent build and RNG when comparing
 // 100%, 75% and 60%. Reset/New Mission still creates a fresh scenario.
 if(!sameSeed||!state.seed){
  const random=new Uint32Array(1);
  if(globalThis.crypto?.getRandomValues)crypto.getRandomValues(random);
  else random[0]=Math.floor(Math.random()*0xffffffff);
  state.seed=requestedSeed||((random[0]||1)>>>0);
 }
 $('arenaTitle').textContent=mission===5?'Missão 05 · Arena de Teste':'Missão 10 · Prévia da Arena Final';
 const prefix=trial&&mission===10?'Simulação local M10: 10 talentos e 20 pontos (sem XP real).':trial?'Teste real de cinco talentos e cinco atributos (M5).':mission===5?'Treino com 500 XP e sem travamento.':'Prévia com 1.000 XP, sem travamento ou autenticação.';
 const gameInfo=$('matchInfo');if(gameInfo)gameInfo.textContent='PARTIDA '+state.round+' · SEED '+state.seed+
  (trial&&experimentalCounterplay?' · MIRA COM RECUPERAÇÃO (EXPERIMENTAL)':'')+
  (trial&&experimentalHpBalance?' · VIDA E ALCANCE BALANCEADOS (TESTE)':'')+
  (trial&&experimentalTalentSprites?' · TALENTOS COM SPRITES ANIMADOS (E.6)':'')+
  (trial&&mission===10?' · FINAL M10 OPT-IN · 10 TALENTOS':'');
 message('CARREGANDO '+state.count+' HERÓIS');
 state.roster=roster(mission,state.count);
 try{
  const damageMode=PACES[state.damageIndex];
  const battleLimit=damageMode.scale===1?95:damageMode.scale===.75?110:damageMode.scale===.60?125:145;
  state.stage.fighters(state.roster,{seed:state.seed,limit:battleLimit,
   damageScale:damageMode.scale,mageDamageBonus:damageMode.mageBonus,
   stormDelay:damageMode.scale===1?18:damageMode.scale===.75?28:damageMode.scale===.60?34:40,
   stormRateFactor:damageMode.scale===1?1:damageMode.scale===.75?.70:damageMode.scale===.60?.60:.55,
   engagementMode:trial?'spaced':'free',
   navigationMode:trial&&experimentalSteering?'steer':'direct',
   rangedCommitment:trial&&experimentalCounterplay?'recovery':'none',
   balancePreset:trial&&experimentalHpBalance?'e-hp2':'baseline',
   arenaMission:trial?mission:5});
  // Default D-phase review is a genuine close scene, not the old tiny bird's-eye view.
  state.stage.cinematic();
  // F.3 uses the exact fictitious roster already in this single simulation.
  // No second engine, account binding or network broadcast.
  const select=$('studentViewHero');select.replaceChildren();
  for(const hero of state.roster){
   const choice=document.createElement('option');
   choice.value=String(hero.id);choice.textContent=hero.name||hero.build?.name||String(hero.id);
   select.append(choice);
  }
  $('cinematicCamera').setAttribute('aria-pressed','true');
  $('overviewCamera').setAttribute('aria-pressed','false');}
 catch(e){message('ERRO AO PREPARAR ARENA');$models.textContent=String(e.message||e);return;}
 if($('stageLoading'))$('stageLoading').hidden=true;
 updateScoreboard();$models.textContent=prefix+' Carregando modelos CC0 reais...';
 reportModels();
}
function begin(){
 if(state.busy||state.fought||!state.stage?.simulation)return;
 if(state.stage.graphicsContext==='lost'){message('GPU INDISPONÍVEL — RECARREGUE SE NÃO RESTAURAR');return}
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
  if(state.stage.graphicsContext==='lost'){message('GPU INDISPONÍVEL — AGUARDE A RESTAURAÇÃO');return}
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
  state.mission=next;if(next===10)state.phase2=m10Preview;
  document.querySelectorAll('.milestone').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.mission)===next)));
  initRound();
 });
});
$('phase2Mode').addEventListener('click',()=>{
 if(!PHASE2)return;
 if(state.mission===10&&m10Preview){
  state.mission=5;state.phase2=true;initRound();return;
 }
 state.phase2=!state.phase2;
 if(state.phase2){state.mission=5;document.querySelectorAll('.milestone').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.mission)===5)))}
 initRound();
});
$('phase2Builds').addEventListener('click',()=>{
 if(!state.phase2||(state.mission!==5&&state.mission!==10))return;
 state.phase2Variant=(state.phase2Variant+1)%11;
 initRound();
});
$('startBattle').addEventListener('click',begin);
$('pauseBattle').addEventListener('click',pause);
$('arenaStage').addEventListener('v5-stage-autopaused',()=>{
 if(!state.fought){
  $('pauseBattle').textContent='▶ Continuar';
  message('PAUSADO — VOLTE À ABA E TOQUE EM CONTINUAR');
 }
});
// Prevent silent blanks when the browser or graphics driver loses WebGL.
$('arenaStage').addEventListener('v5-graphics-lost',()=>{
 $('pauseBattle').textContent='▶ Continuar';
 $('pauseBattle').disabled=true;
 message('GPU REINICIANDO — BATALHA PAUSADA');
 $('perfContext').textContent='Contexto perdido';
 $('performancePanel').dataset.status='context-lost';
});
$('arenaStage').addEventListener('v5-graphics-restored',()=>{
 $('pauseBattle').disabled=!state.stage?.simulation||state.fought;
 $('pauseBattle').textContent='▶ Continuar';
 message('GPU RESTAURADA — TOQUE EM CONTINUAR');
 $('perfContext').textContent='Restaurada · pausada';
 $('performancePanel').dataset.status='measuring';
});
// Passive local performance sampling, including unfiltered GPU resource totals.
$('performancePanel').hidden=!performanceDiagnostics;
$('arenaStage').addEventListener('v5-perf-sample',e=>{
 if(!performanceDiagnostics)return;
 const snap=e.detail;
 $('perfFps').textContent=String(snap.fps);
 $('perfP10').textContent=String(snap.p10Fps);
 $('perfFrame').textContent=Math.round(snap.peakFrameMs)+' ms';
 $('perfCalls').textContent=String(snap.drawCalls);
 $('perfTriangles').textContent=Number(snap.triangles).toLocaleString('pt-BR');
 $('perfMemory').textContent=snap.geometries+' / '+snap.textures;
 $('perfModels').textContent=snap.modelsLoaded+' / '+snap.modelsExpected;
 if(snap.contextLost)$('perfContext').textContent='Contexto perdido';
 else if(state.stage?.graphicsContext==='restored-paused')$('perfContext').textContent='Restaurada · pausada';
 else $('perfContext').textContent='Normal';
 $('performancePanel').dataset.status=snap.status;
 $('perfNote').textContent=snap.fps<30?'FPS baixo neste navegador — teste no PC com GPU real.':
  'Medição local — renderização por software no CI não representa o PC dos alunos.';
});
$('perfCopy').addEventListener('click',async()=>{
 const report=state.stage?.performanceReport;
 if(!report)return;
 const body=JSON.stringify({...report,seed:state.seed,players:state.count,
  context:state.stage.graphicsContext},null,2);
 try{
  if(!navigator.clipboard?.writeText)throw Error('clipboard');
  await navigator.clipboard.writeText(body);
  $('perfNote').textContent='Relatório local copiado — sem nomes de alunos.';
 }catch{
  const input=document.createElement('textarea');
  input.value=body;input.style.position='fixed';input.style.opacity='0';
  document.body.append(input);input.select();
  const copied=document.execCommand?.('copy');input.remove();
  $('perfNote').textContent=copied?'Relatório local copiado.':'Copiar indisponível neste navegador.';
 }
});
$('retryModels').addEventListener('click',()=>{
 if(!state.stage||state.stage.playing||state.fought)return;
 const count=state.stage.retryFailedModels();
 if(!count)return;
 state.busy=true;$('startBattle').disabled=true;$('retryModels').hidden=true;
 $models.textContent='Baixando novamente apenas '+count+' modelos 3D ausentes...';
 message('RECUPERANDO MODELOS 3D');
});
$('resetBattle').addEventListener('click',initRound);
$('overviewCamera').addEventListener('click',()=>{
 if(state.stage?.viewerSnapshot()?.viewer?.audience==='student')state.stage.setTeacherCamera();
 state.director=false;$('actionCamera').setAttribute('aria-pressed','false');
 $('cinematicCamera').setAttribute('aria-pressed','false');
 $('overviewCamera').setAttribute('aria-pressed','true');
 state.stage?.overview();
});
$('cinematicCamera').addEventListener('click',()=>{
 if(state.stage?.viewerSnapshot()?.viewer?.audience==='student')state.stage.setTeacherCamera();
 state.director=false;$('actionCamera').setAttribute('aria-pressed','false');
 $('overviewCamera').setAttribute('aria-pressed','false');
 $('cinematicCamera').setAttribute('aria-pressed','true');
 state.stage?.cinematic();
});
$('followSpotlight').addEventListener('click',()=>{if(state.spotId){if(state.stage?.viewerSnapshot()?.viewer?.audience==='student')state.stage.setTeacherCamera();state.stage?.focusFighter(state.spotId)}});
function cameraStatus(automatic,shot){
 state.director=automatic;
 $('actionCamera').setAttribute('aria-pressed',String(automatic));
 $('actionCamera').textContent=automatic?'◉ Diretor: ATIVO':'◎ Diretor automático';
 const labels={overview:'visão geral',duel:'duelo',highlight:'habilidade',climax:'clímax',victory:'vencedor'};
 $('directorStatus').textContent=automatic?'Automática · '+(labels[shot]||'selecionando plano'):'Câmera: manual';
 $('directorStatus').dataset.mode=automatic?'auto':'manual';
}
$('actionCamera').addEventListener('click',()=>{
 if(state.stage?.viewerSnapshot()?.viewer?.audience==='student'){state.stage.setTeacherCamera();return}
 if(state.director){state.stage?.enableAutoCamera(false);state.stage?.cinematic()}
 else state.stage?.enableAutoCamera(true);
});
$('arenaStage').addEventListener('v5-camera-changed',e=>{
 cameraStatus(!!e.detail.enabled,e.detail.shot||'overview');
});
$('arenaStage').addEventListener('v5-director-shot',e=>{
 if(state.director)cameraStatus(true,e.detail.mode);
});
$('studentViewButton').addEventListener('click',()=>{
 const hero=$('studentViewHero').value;
 if(hero)state.stage?.setStudentCamera(hero);
});
$('teacherViewButton').addEventListener('click',()=>state.stage?.setTeacherCamera());
$('arenaStage').addEventListener('v5-student-view',event=>{
 const view=event.detail;
 if(view.audience==='student'){
  const hero=state.roster.find(r=>String(r.id)===view.studentId);
  const label=hero?.name||'Personagem';
  const spectating=view.mode==='spectating';
  $('studentViewStatus').textContent=spectating?
   label+' eliminado · vendo o MESMO diretor da arena':label+' vivo · câmera própria em 3ª pessoa';
  cameraStatus(spectating,spectating?'climax':'third-person');
 }else{
  $('studentViewStatus').textContent='Professor · diretor cinematográfico';
  cameraStatus(true,state.stage?.viewerSnapshot()?.feed?.mode||'overview');
 }
});
const expandButton=$('expandStage');
function setImmersive(on){
 document.body.classList.toggle('arena-immersive',on);
 expandButton.setAttribute('aria-pressed',String(on));
 expandButton.textContent=on?'✕ Fechar arena':'⛶ Ampliar arena';
 requestAnimationFrame(()=>state.stage?.resize());
}
expandButton.addEventListener('click',()=>setImmersive(!document.body.classList.contains('arena-immersive')));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('arena-immersive'))setImmersive(false)});
$('fighters').addEventListener('click',event=>{const btn=event.target.closest('[data-focus]');if(btn){if(state.stage?.viewerSnapshot()?.viewer?.audience==='student')state.stage.setTeacherCamera();state.stage?.focusFighter(btn.dataset.focus)}});
$('damagePace').addEventListener('click',()=>{
 state.damageIndex=(state.damageIndex+1)%PACES.length;
 initRound({sameSeed:true});
});
$('speedBattle').addEventListener('click',()=>{
 if(!state.stage)return;
 // Slow motion (×0.5) is deliberate: 30 simultaneous fighters are difficult
 // to read at full speed. Always expose this directly via the speed control.
 const speeds=[1,.5,1.5,2,3];
 state.speed=speeds[(speeds.indexOf(state.speed)+1)%speeds.length];
 state.stage.setSpeed(state.speed);$('speedBattle').textContent='Velocidade ×'+state.speed;
});
window.addEventListener('pagehide',()=>{clearInterval(state.interval);state.stage?.dispose()},{once:true});
try{
 state.stage=createStage($('arenaStage'),{quality:(navigator.deviceMemory||4)<4?'low':'auto',arenaScale:5,spriteEffects:experimentalTalentSprites?'on':'off',onEvent});
 const actorFill=new THREE.DirectionalLight(0xffd5b9,2.5);actorFill.position.set(4,13,14);state.stage.scene.add(actorFill);
 document.querySelectorAll('.roster-mode').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.roster)===state.count)));
 initRound();
 state.interval=setInterval(()=>{if(!document.hidden){
  updateScoreboard();reportModels();
  const seconds=state.stage?.simulation?.time||0;
  $('combatClock').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(Math.floor(seconds%60)).padStart(2,'0');
 }},450);
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
 get phase2(){return state.phase2},
 get m10Visual(){return m10Preview&&state.mission===10},
 get approvedTalentSlots(){return Number($('arenaStage').dataset.v5ApprovedTalentSlots||0)},
 get combatEngine(){return $('arenaStage').dataset.v5CombatEngine||'uninitialized'},
 get talentEvents(){return state.stage?.simulation?.events?.filter(e=>e.type==='talent').length||0},
 get abilityCount(){return state.abilityCount},
 get selectedTalents(){return state.roster.map(x=>({klass:x.build.klass,ids:x.build.talents||[]}))},
 get customBuildLoaded(){return !!state.customBuild},
 get mapId(){return $('arenaStage').dataset.v5Map||'not-loaded'},
 get seed(){return state.seed},
 get damageMode(){return {...PACES[state.damageIndex]}},
 get round(){return state.round},
 get performanceReport(){return state.stage?.performanceReport||null},
 get graphicsContext(){return state.stage?.graphicsContext||'uninitialized'},
 retryModels(){return state.stage?.retryFailedModels()||0},
 get cameraViewer(){return state.stage?.viewerSnapshot()||null},
 tryStudentCamera(id){return state.stage?.setStudentCamera(id)||false}
});
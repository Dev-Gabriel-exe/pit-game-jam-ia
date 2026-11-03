/* Deterministic 3D replay of a server-verified duel/arena. This iframe has no auth secrets.
 * Only the authenticated V3 parent can deliver a signed-off match snapshot.
 */
import {createStage} from './arena-three.js?v=20261103-small3d-return1';
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').slice(0,58);
let stage=null,match=null,interval=null,elapsed=0,verified=false;
const ui=(text)=>{$('replayStatus').textContent=text};
function tick(){
 if(!stage?.simulation)return;
 const sim=stage.simulation,alive=sim.fighters.filter(x=>x.alive).length;
 $('fightersAlive').textContent=String(alive);
 $('fightersOut').textContent=String(sim.fighters.length-alive);
 $('replayClock').textContent=String(Math.floor(sim.time/60)).padStart(2,'0')+':'+String(Math.floor(sim.time%60)).padStart(2,'0');
 for(const node of $('scoreboard').children){
  const fighter=sim.fighters.find(x=>x.id===node.dataset.hero);
  if(!fighter)continue;
  node.dataset.defeated=String(!fighter.alive);
  node.textContent=(fighter.alive?'⚔ ':'👁 ')+safe(fighter.name)+' · '+Math.ceil(fighter.hp)+' HP';
 }
 if(sim.finished&&!verified){
  verified=true;stage.pause();
  const actual=sim.result().winner?.id||null,expected=match.result?.winner?.id||null;
  $('resultPanel').hidden=false;
  if(actual!==expected){$('resultPanel').textContent='Replay divergente. O resultado oficial permanece no servidor.';ui('O servidor detectou um confronto incompatível com a versão visual.');return}
  $('resultPanel').textContent='🏆 CAMPEÃO: '+safe(match.result.winner?.name||'Sem vencedor');
  $('pauseReplay').disabled=true;
  ui('Partida concluída! Resultado calculado e registrado pelo servidor; nenhuma nota ou XP alterados.');
 }
}
function load(record){
 if(!record||!['arena','duel'].includes(record.kind)||!Array.isArray(record.roster)||
  record.roster.length<2||record.roster.length>30||!Number.isInteger(record.seed)||
  ![5,10].includes(record.options?.arenaMission)||record.mission!==record.options.arenaMission||
  !/^[a-f\d]{64}$/i.test(String(record.sha256||'')))throw Error('Replay inválido.');
 if(!window.PIT_V5_PHASE2||record.roster.some(x=>x.build?.schema!==window.PIT_V5_PHASE2.VERSION))
  throw Error('Versão do motor de combate incompatível com o registro do servidor.');
 match=record;verified=false;
 $('coliseumHeading').textContent=record.kind==='arena'?'ARENA DA MISSÃO '+record.mission:'DUELO ENTRE HEROIS';
 $('coliseumSub').textContent=record.roster.length+' jogadores · mesmo resultado em todos os computadores · replay oficial';
 try{
  // Keep full official combat geometry/seed in the engine; only the duel
  // presentation uses fewer WebGL draw calls so two tabs remain responsive.
  const duel=record.kind==='duel';
  stage=createStage($('arenaStage'),{mode:duel?'duel':'hero',arenaScale:5,
   quality:duel?'low':'auto',spriteEffects:'on',
   renderScale:duel?.58:1});
  stage.fighters(record.roster,{seed:record.seed,...record.options});
  stage.enableAutoCamera(true);
  $('scoreboard').replaceChildren();
  for(const item of record.roster){
   const node=document.createElement('div');node.dataset.hero=item.id;node.textContent=safe(item.name);
   $('scoreboard').appendChild(node);
  }
  $('followHero').innerHTML='<option value="">Selecionar herói</option>';
  for(const item of record.roster){
   const op=document.createElement('option');op.value=item.id;op.textContent=safe(item.name);$('followHero').appendChild(op);
  }
  for(const id of ['playReplay','pauseReplay','directorCam','overviewCam','followHero'])$(id).disabled=false;
  $('pauseReplay').disabled=true;
  ui('Confronto oficial carregado. Clique em Iniciar replay para acompanhar a batalha.');
  interval=setInterval(tick,150);
  tick();
 }catch(e){ui('Não foi possível montar a arena 3D: '+e.message)}
}
window.addEventListener('message',event=>{
 if(event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='PIT_COLISEUM_REPLAY'||match)return;
 try{load(event.data.match)}catch(e){ui(e.message)}
});
$('playReplay').onclick=()=>{
 if(!stage||!match)return;
 if(stage.simulation.finished){
  verified=false;stage.fighters(match.roster,{seed:match.seed,...match.options});
  stage.enableAutoCamera(true);$('resultPanel').hidden=true;
 }
 stage.resume();$('pauseReplay').disabled=false;ui('Batalha em reprodução · câmera cinematográfica.');
};
$('pauseReplay').onclick=()=>{stage?.pause();ui('Reprodução pausada.');$('pauseReplay').disabled=true};
$('directorCam').onclick=()=>stage?.enableAutoCamera(true);
$('overviewCam').onclick=()=>stage?.overview();
$('followHero').onchange=()=>{if($('followHero').value)stage?.focusFighter($('followHero').value);else stage?.enableAutoCamera(true)};
window.addEventListener('pagehide',()=>{if(interval)clearInterval(interval);stage?.dispose()});

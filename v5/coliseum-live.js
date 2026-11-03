/* Deterministic 3D replay of a server-verified duel/arena. This iframe has no auth secrets.
 * Only the authenticated V3 parent can deliver a signed-off match snapshot.
 */
// WebGL engine is loaded lazily ONLY when a user chooses the experimental 3D view.
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
async function switchVisual(mode){
 if(!match)return;
 try{stage?.pause();stage?.dispose()}catch(e){console.warn('graphics cleanup',e.message)}
 stage=null;
 try{
  if(mode==='3d'){
   const module=await import('./arena-three.js?v=20261103-duel-lite-2');
   stage=module.createStage($('arenaStage'),{mode:match.kind==='duel'?'duel':'hero',
    arenaScale:5,quality:match.kind==='duel'?'low':'auto',spriteEffects:'on'});
  }else{
   if(!window.PIT_V5_SAFE_ARENA?.createStage)throw Error('Modo seguro indisponível');
   stage=window.PIT_V5_SAFE_ARENA.createStage($('arenaStage'));
  }
  stage.fighters(match.roster,{seed:match.seed,...match.options});
  stage.enableAutoCamera(true);
  verified=false;$('resultPanel').hidden=true;
  $('try3d').hidden=mode==='3d';$('back2d').hidden=mode!=='3d';
  for(const id of ['playReplay','try3d','back2d','directorCam','overviewCam','followHero'])$(id).disabled=false;
  stage.resume();$('pauseReplay').disabled=false;
  ui(mode==='safe'?'▶ Batalha em andamento · MODO SEGURO 2D: sem WebGL, com regras oficiais do servidor.':
   '◈ 3D experimental: se apresentar lentidão, volte ao Modo seguro 2D.');
 }catch(e){
  console.error('Coliseum rendering error:',e);
  ui('Falha ao carregar '+mode+': '+e.message);
  if(mode==='3d'){await switchVisual('safe')}
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
  void switchVisual('safe');
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
$('try3d').onclick=()=>{void switchVisual('3d')};
$('back2d').onclick=()=>{void switchVisual('safe')};
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

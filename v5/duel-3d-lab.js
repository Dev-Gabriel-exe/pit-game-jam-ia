/* V5 H laboratory only — an accepted FICTIONAL invitation rendered with the
 * existing CC0 KayKit Three.js stage. Never accesses students, API, XP or storage.
 * Reuses precisely the Phase-2 simulation that animates the main arena lab.
 */
import {createStage} from './arena-three.js';

export function createDuelVisualization({
 container,onStatus=()=>{},onUpdate=()=>{},onFinish=()=>{}
}={}){
 if(!container)throw Error('Recipiente 3D obrigatório');
 const combat=window.PIT_V5_PHASE2,adapter=window.PIT_V5_DUEL_BATTLE_LAB;
 if(!combat||!adapter)throw Error('Motor V5 de laboratório não foi carregado');
 let stage=null,interval=null,disposed=false,ended=false,started=false,loadStartedAt=0;
 const stopMonitor=()=>{if(interval!==null){clearInterval(interval);interval=null}};
 function stop(){
  stopMonitor();
  if(stage){stage.dispose();stage=null}
  container.replaceChildren();
  ended=false;started=false;
 }
 function snapshot(){
  if(!stage?.simulation)return null;
  const sim=stage.simulation;
  return {
   time:sim.time,
   fighters:sim.fighters.map(f=>({
    id:f.id,name:f.name,klass:f.build.klass,alive:f.alive,
    hp:Math.max(0,Number(f.hp)||0),maxHp:f.stats.hp
   })),
   modelsLoaded:Number(container.dataset.v5ModelsLoaded||0),
   modelsFailed:Number(container.dataset.v5ModelsFailed||0),
   modelsReady:started
  };
 }
 function start(descriptor,{mission=5,seed=4252}={}){
  if(disposed)throw Error('Visualização descartada');
  stop();
  // The adapter validates accepted consent, a two-person roster and opt-in M10.
  const trial=adapter.createTrial(descriptor,combat,{mission,seed});
  const roster=trial.roster;
  if(roster.length!==2)throw Error('Duelo deve conter exatamente dois jogadores fictícios');
  try{
   stage=createStage(container,{
    quality:(navigator.deviceMemory||4)<4?'low':'auto',
    arenaScale:2.6,spriteEffects:mission===5?'on':'off',
    onEvent:event=>{
     if(disposed||!stage)return;
     if(event.type==='talent')onStatus('✦ '+String(event.hero||'Herói')+' ativou '+String(event.name||event.talent));
     if(event.type==='knockout')onStatus('⚔ Um herói foi eliminado; resultado em apuração');
     if(event.type==='end'&&!ended){
      ended=true;stopMonitor();
      onFinish(stage.simulation.result());
     }
    }
   });
   stage.fighters(roster,{arenaMission:mission,seed,limit:95});
   stage.enableAutoCamera(true);
   loadStartedAt=Date.now();started=false;
   onStatus('Carregando os dois personagens KayKit CC0. O combate só começa quando ambos estiverem visíveis.');
   onUpdate(snapshot());
   interval=setInterval(()=>{
    if(disposed||!stage)return;
    const s=snapshot();
    if(!started){
     if(s?.modelsFailed>0||Date.now()-loadStartedAt>35000){
      stopMonitor();stage.pause();
      onStatus('Modelos GLB indisponíveis. Não iniciaremos um duelo invisível. Tente reiniciar ou use a simulação textual.');
      onUpdate(s);return;
     }
     if(s?.modelsLoaded===2){
      started=true;stage.resume();
      onStatus('Os dois heróis KayKit carregaram. Duelo 3D iniciado com câmera cinematográfica.');
     }
    }
    if(s)onUpdate({...s,modelsReady:started});
    if(stage.simulation?.finished&&!ended){
     ended=true;stopMonitor();onFinish(stage.simulation.result());
    }
   },250);
   return {mission,players:trial.aliases};
  }catch(error){stop();throw error}
 }
 function pause(){if(started&&stage?.playing){stage.pause();onStatus('Combate 3D pausado');return true}return false}
 function resume(){if(started&&stage&&!stage.playing&&!stage.simulation?.finished){stage.resume();onStatus('Combate 3D retomado');return true}return false}
 function setSpeed(value){
  if(!started||!stage||![1,2,3].includes(value))return false;
  stage.setSpeed(value);return true;
 }
 function dispose(){if(disposed)return;disposed=true;stop()}
 return Object.freeze({start,pause,resume,setSpeed,dispose,
  get playing(){return !!stage?.playing},
  get finished(){return !!stage?.simulation?.finished},
  snapshot
 });
}

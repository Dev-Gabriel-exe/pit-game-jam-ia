/* PIT Game Jam IA V5 — D.1b synchronized duel spectator, NOT a game engine.
 * Real matches: frames, hit events and winner originate exclusively on the
 * authenticated server. Only ?demo=1 runs a clearly fictional local showcase.
 */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createArenaAudio} from './arena-audio.js';
const $=id=>document.getElementById(id);
const demo=new URLSearchParams(location.search).get('demo')==='1';
const classes={
 warrior:{icon:'⚔',label:'Guerreiro',color:0xb86d4a},
 mage:{icon:'✦',label:'Arcanista',color:0x9b80c4},
 hunter:{icon:'➶',label:'Caçador',color:0x6fa77b},
 guardian:{icon:'◆',label:'Guardião',color:0x719cc8}
};
const sceneSettings={quality:'medium'};
const avatars=new Map(),particles=[],audio=createArenaAudio();
const status={mode:'director',demo,ready:false,match:null,replay:null,
 clockOffset:0,replayTime:0,sceneReady:false,modelsLoaded:0,modelsFailed:0,
 lastEventIndex:0,lastShownEventIndex:0,lastAudioTime:0,victoryPlayed:false,
 apiCalls:0,assetRequests:0};
let stage=null,scene=null,camera=null,renderer=null,previous=0,
 cameraPos=new THREE.Vector3(0,11,23),lookPos=new THREE.Vector3(0,0,0),
 showFrameTime=0,raf=0,matchPoll=0,glbLoader=new GLTFLoader();
const htmlSafe=s=>String(s??'').slice(0,60);
function label(text,kind='info'){
 $('safetyNotice').textContent=text;
 $('safetyNotice').dataset.kind=kind;
}
const snapshot=()=>({
 ready:status.ready,demo:status.demo,mode:status.mode,
 replaySha256:status.match?.replaySha256||null,
 winnerSide:status.replay?.winnerSide||null,
 playback:+status.replayTime.toFixed(2),modelsLoaded:status.modelsLoaded,
 modelsFailed:status.modelsFailed,sceneReady:status.sceneReady,
 frameCount:status.replay?.frames?.length||0,
 eventCount:status.replay?.events?.length||0,
 apiCalls:status.apiCalls,progress:status.match?.progress??null
});
Object.defineProperty(window,'PIT_V5_D1B_VIEW',{
 value:Object.freeze({get snapshot(){return snapshot()}}),
 configurable:false,writable:false
});
function selectMode(mode){
 if(!['director','left','right'].includes(mode))return;
 status.mode=mode;
 for(const [id,value] of [['director','director'],['followLeft','left'],['followRight','right']])
  $(id).setAttribute('aria-pressed',String(mode===value));
}
function createFallback(klass){
 const palette=classes[klass]?.color||0xb17b63;
 const root=new THREE.Group();
 const metal=new THREE.MeshStandardMaterial({color:palette,roughness:.52,metalness:.4});
 const skin=new THREE.MeshStandardMaterial({color:0xc8ad8f,roughness:.87});
 const black=new THREE.MeshStandardMaterial({color:0x332b33,roughness:.9});
 const place=(geo,mat,x,y,z,parent=root)=>{
  const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);
  m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
 };
 place(new THREE.CylinderGeometry(.33,.42,.93,8),metal,0,1.23,0);
 place(new THREE.SphereGeometry(.31,12,8),skin,0,1.98,0);
 place(new THREE.CylinderGeometry(.34,.34,.19,8),metal,0,2.28,0);
 for(const x of [-.48,.48])place(new THREE.CylinderGeometry(.12,.13,.76,8),metal,x,1.35,0);
 for(const x of [-.21,.21])place(new THREE.CylinderGeometry(.14,.15,.67,8),black,x,.44,0);
 if(klass==='guardian'){
  const shield=place(new THREE.CylinderGeometry(.58,.58,.10,8),metal,-.76,1.1,.24);
  shield.rotation.x=Math.PI/2;
 }
 if(klass==='mage'){
  place(new THREE.CylinderGeometry(.04,.06,2.1,8),black,.73,1.48,0);
  place(new THREE.OctahedronGeometry(.22),new THREE.MeshBasicMaterial({color:0xc89aff}),.73,2.48,0);
 }
 if(klass==='hunter')place(new THREE.TorusGeometry(.45,.04,6,25,Math.PI),metal,.7,1.3,.15).rotation.y=Math.PI/2;
 return root;
}
function createWorld(){
 stage=$('stage');
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.6;
  renderer.shadowMap.enabled=true;
  renderer.setClearColor(0x14101c);
  scene=new THREE.Scene();
  scene.fog=new THREE.Fog(0x17131f,24,86);
  camera=new THREE.PerspectiveCamera(47,1,.1,140);
  scene.add(new THREE.HemisphereLight(0xcfc5dc,0x56403c,2.7));
  const sun=new THREE.DirectionalLight(0xe8ba91,3);
  sun.position.set(10,21,8);sun.castShadow=true;scene.add(sun);
  scene.add(new THREE.AmbientLight(0xa8a0cc,.48));
  const floor=new THREE.Mesh(
   new THREE.CylinderGeometry(21,21,.45,80),
   new THREE.MeshStandardMaterial({color:0x443440,roughness:.95,metalness:.06}));
  floor.position.y=-.34;floor.receiveShadow=true;scene.add(floor);
  const circle=new THREE.Mesh(
   new THREE.TorusGeometry(17,.16,8,100),
   new THREE.MeshStandardMaterial({color:0x9b7650,metalness:.63,roughness:.36}));
  circle.rotation.x=Math.PI/2;circle.position.y=.02;scene.add(circle);
  const inner=new THREE.Mesh(
   new THREE.RingGeometry(15.2,15.35,100),
   new THREE.MeshBasicMaterial({color:0x8a5e9a,transparent:true,opacity:.32,side:THREE.DoubleSide}));
  inner.rotation.x=-Math.PI/2;inner.position.y=.07;scene.add(inner);
  for(let i=0;i<14;i++){
   const t=i*Math.PI*2/14,r=23,x=Math.cos(t)*r,z=Math.sin(t)*r;
   const col=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.15,10,8),
    new THREE.MeshStandardMaterial({color:0x382f3f,roughness:.75,metalness:.2}));
   col.position.set(x,4,z);col.castShadow=true;scene.add(col);
   const flame=new THREE.PointLight(i%2?0xd97a49:0xb58ddd,7.5,15);
   flame.position.set(x,8.6,z);scene.add(flame);
  }
  for(const side of ['left','right']){
   const root=new THREE.Group();
   root.add(createFallback(side==='left'?'guardian':'mage'));
   scene.add(root);
   avatars.set(side,{root,modelLoaded:false,mixer:null,actions:new Map(),
    motion:'idle',facing:0,klass:null,lastHealth:0});
  }
  stage.prepend(renderer.domElement);
  const resize=()=>{
   const rect=stage.getBoundingClientRect();
   const w=Math.max(1,rect.width),h=Math.max(1,rect.height);
   camera.aspect=w/h;camera.updateProjectionMatrix();
   renderer.setSize(w,h,false);
  };
  resize();
  new ResizeObserver(resize).observe(stage);
  $('stagePlaceholder').hidden=true;
  status.sceneReady=true;
  return true;
 }catch(e){
  status.sceneReady=false;
  $('stagePlaceholder').textContent='Este navegador não conseguiu iniciar WebGL. O acompanhamento e o placar continuam disponíveis.';
  return false;
 }
}
async function loadGLB(side,klass){
 const item=avatars.get(side),asset=window.PIT_V5_ASSETS?.[klass];
 if(!item||!asset||item.klass===klass)return;
 item.klass=klass;status.assetRequests++;
 try{
  const gltf=await Promise.race([
   glbLoader.loadAsync(asset.model),
   new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),12000))
  ]);
  if(item.klass!==klass)return;
  const model=gltf.scene;
  const bounds=new THREE.Box3().setFromObject(model);
  const size=new THREE.Vector3(),center=new THREE.Vector3();
  bounds.getSize(size);bounds.getCenter(center);
  if(size.y<=0||!Number.isFinite(size.y))throw Error('GLB inválido');
  const scale=2.6/size.y;
  model.scale.setScalar(scale);
  model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
  const holder=new THREE.Group();holder.add(model);
  item.root.clear();item.root.add(holder);
  model.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});
  if(gltf.animations?.length){
   item.mixer=new THREE.AnimationMixer(model);
   for(const clip of gltf.animations){
    const action=item.mixer.clipAction(clip);
    item.actions.set(clip.name.toLowerCase(),action);
   }
  }
  item.modelLoaded=true;status.modelsLoaded++;
  $('modelInfo').textContent=status.modelsLoaded+' modelos KayKit CC0 carregados (2 previstos)';
 }catch{
  status.modelsFailed++;
  $('modelInfo').textContent='Modelo remoto indisponível; personagens substitutos nesta prévia (visual principal preservado).';
 }
}
function motion(item,name){
 if(!item.mixer||item.motion===name)return;
 const patterns={
  idle:[/idle/,/breath/],
  walk:[/run/,/walk/],
  attack:[/attack/,/swing/,/cast/],
  hit:[/hit/,/damage/],
  victory:[/victory/,/cheer/,/celebrat/]
 };
 let action=null;
 for(const re of patterns[name]||patterns.idle){
  action=[...item.actions].find(([key])=>re.test(key))?.[1];
  if(action)break;
 }
 if(!action)action=[...item.actions.values()][0];
 if(action){
  item.mixer.stopAllAction();action.reset().play();
 }
 item.motion=name;
}
function setupActors(){
 const replay=status.replay;
 if(!replay)return;
 for(const p of replay.participants){
  const side=p.side,ui=$(side==='left'?'leftCard':'rightCard');
  const meta=classes[p.klass]||classes.guardian;
  ui.querySelector('.icon').textContent=meta.icon;
  ui.querySelector('strong').textContent=htmlSafe(p.name);
  ui.querySelector('small').textContent=meta.label+' · '+p.approvedMissions+' missões aprovadas';
  if(status.sceneReady)void loadGLB(side,p.klass);
 }
}
function makeDemoReplay(){
 const P=window.PIT_V5_PHASE2;
 if(!P)throw Error('Motor demonstrativo não encontrado.');
 const left=P.exampleBuild('guardian','Ayla',3);
 const right=P.exampleBuild('mage','Breno',3);
 const sim=P.battle([
  {id:'left',approvedMissions:3,build:left},
  {id:'right',approvedMissions:3,build:right}
 ],{seed:30412,limit:60,engagementMode:'spaced',navigationMode:'steer',
    rangedCommitment:'recovery',arenaMission:5});
 const frames=[];
 const frame=()=>({
  t:+sim.time.toFixed(2),
  heroes:sim.fighters.map(f=>({
   side:f.id,x:+f.x.toFixed(3),z:+f.z.toFixed(3),
   face:+f.face.toFixed(3),hp:Math.max(0,+f.hp.toFixed(2)),
   maxHp:+f.stats.hp.toFixed(2),shield:+f.shield.toFixed(2),
   alive:f.alive,animation:f.animation
  }))
 });
 frames.push(frame());
 for(let i=0;i<1400&&!sim.finished;i++){
  sim.update(.05);
  if((i+1)%4===0||sim.finished)frames.push(frame());
 }
 const events=sim.events.map(e=>({
  t:e.time,seq:e.seq,type:e.type,hero:e.hero,target:e.target,
  talent:e.talent,skill:e.skill,amount:e.amount
 }));
 return {
  schema:'pit-v5-duel-replay-v1',stage:3,seed:30412,
  playbackRate:1.7,duration:+sim.time.toFixed(2),
  participants:[
   {side:'left',name:'Ayla',klass:'guardian',approvedMissions:3},
   {side:'right',name:'Breno',klass:'mage',approvedMissions:3}
  ],frames,events,winnerSide:sim.winner?.id||'left'
 };
}
function installMatch(match){
 if(!match?.ready||!match.replay||
    match.replay.schema!=='pit-v5-duel-replay-v1')throw Error('Replay incompatível.');
 const newReplay=match.replay;
 if(!status.replay||status.match?.replaySha256!==match.replaySha256){
  status.replay=newReplay;
  status.lastEventIndex=0;status.lastShownEventIndex=0;status.victoryPlayed=false;
  setupActors();
  $('eventList').replaceChildren();
 }
 status.match=match;
 status.ready=true;
 status.clockOffset=Date.parse(match.serverNow)-Date.now();
 $('matchInfo').textContent=(status.demo?'PRÉVIA FICTÍCIA · ':'PARTIDA SINCRONIZADA · ')+
  String(match.replaySha256||'DEMONSTRAÇÃO').slice(0,11).toUpperCase();
 $('battleStatus').textContent='EM CONFRONTO';
 $('reconnect').disabled=status.demo?false:false;
}
function frameAt(time){
 const frames=status.replay?.frames;
 if(!frames?.length)return null;
 if(time<=frames[0].t)return frames[0];
 if(time>=frames.at(-1).t)return frames.at(-1);
 let lo=0,hi=frames.length-1;
 while(lo+1<hi){
  const m=(lo+hi)>>1;
  if(frames[m].t<=time)lo=m;else hi=m;
 }
 const a=frames[lo],b=frames[hi],dt=Math.max(.001,b.t-a.t);
 const fraction=THREE.MathUtils.clamp((time-a.t)/dt,0,1);
 return {t:time,heroes:a.heroes.map((p,i)=>{
  const q=b.heroes[i];
  const angle=Math.atan2(Math.sin(q.face-p.face),Math.cos(q.face-p.face));
  return {...p,x:THREE.MathUtils.lerp(p.x,q.x,fraction),
   z:THREE.MathUtils.lerp(p.z,q.z,fraction),
   face:p.face+angle*fraction,
   hp:THREE.MathUtils.lerp(p.hp,q.hp,fraction),
   shield:THREE.MathUtils.lerp(p.shield,q.shield,fraction),
   alive:fraction>.8?q.alive:p.alive,
   animation:fraction>.5?q.animation:p.animation};
 })};
}
function cueFor(ev){return ev.type==='hit'?'hit':
 ev.type==='shield'?'shield':
 ['talent','talent-cast','special','proc'].includes(ev.type)?'talent':
 ['knockout','storm'].includes(ev.type)?'knockout':
 ev.type==='end'?'victory':null}
function cameraDistance(side){
 const pos=avatars.get(side)?.root.position;
 if(!camera||!pos)return null;
 const delta=pos.clone().sub(camera.position);
 const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
 return {distance:delta.length(),pan:delta.normalize().dot(right)};
}
function effect(side,kind){
 if(!scene||particles.length>=15)return;
 const a=avatars.get(side);if(!a)return;
 const color=kind==='shield'?0x84cae1:kind==='talent'?0xaf83df:0xe5a46d;
 const radius=kind==='talent'?1.3:kind==='shield'?1.1:.53;
 const mesh=new THREE.Mesh(
  new THREE.TorusGeometry(radius,.075,5,38),
  new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false}));
 mesh.rotation.x=Math.PI/2;
 mesh.position.set(a.root.position.x,.45,a.root.position.z);
 scene.add(mesh);particles.push({mesh,life:.55});
}
function eventsAt(t){
 const events=status.replay?.events||[];
 let added=0;
 while(status.lastEventIndex<events.length&&events[status.lastEventIndex].t<=t){
  const ev=events[status.lastEventIndex++];
  const cue=cueFor(ev);
  const actor=ev.hero==='left'||ev.hero==='right'?ev.hero:null;
  if(cue&&ev.t>=t-1.4&&status.lastAudioTime<=ev.t){
   // No excessive catch-up noise after tab backgrounding.
   if(cue==='victory'){
    if(!status.victoryPlayed){audio.play('victory');status.victoryPlayed=true}
   }else if(actor){
    const point=cameraDistance(actor);
    audio.play(cue,Date.now(),point);
    if(cue!=='hit'||added<5)effect(actor,cue);
   }
  }
  if(['hit','talent','special','knockout','end','shield'].includes(ev.type)
    &&ev.t>=t-7&&added<5){
   const item=document.createElement('div');
   item.className='event-item '+(cue||'');
   const from=status.replay.participants.find(x=>x.side===ev.hero)?.name||'Arena';
   const name=ev.type==='hit'?'golpe':
    ev.type==='end'?'resultado final':ev.type==='talent'?'talento':
    ev.type==='special'?'habilidade especial':ev.type==='knockout'?'eliminação':'defesa';
   item.textContent=Math.floor(ev.t)+'s · '+from+' — '+name+
    (typeof ev.amount==='number'&&ev.type==='hit'?' ('+Math.round(ev.amount)+' dano)':'');
   $('eventList').prepend(item);
   while($('eventList').children.length>12)$('eventList').lastChild.remove();
   added++;
  }
 }
 status.lastAudioTime=t;
}
function updateHUD(frame,t){
 if(!frame)return;
 const bySide=new Map(frame.heroes.map(h=>[h.side,h]));
 for(const side of ['left','right']){
  const f=bySide.get(side);if(!f)continue;
  const fill=$(side==='left'?'hpLeft':'hpRight');
  fill.style.width=Math.max(0,Math.min(100,100*f.hp/Math.max(1,f.maxHp))).toFixed(1)+'%';
 }
 const sec=Math.floor(t);
 $('battleClock').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+
  String(sec%60).padStart(2,'0');
}
function moveActors(frame,dt){
 if(!scene||!frame)return;
 for(const f of frame.heroes){
  const a=avatars.get(f.side);if(!a)continue;
  a.root.position.set(f.x,0,f.z);
  a.root.rotation.y=f.face;
  a.root.visible=true;
  motion(a,!f.alive?'hit':f.animation==='run'?'walk':f.animation==='attack'?'attack':'idle');
  a.mixer?.update(dt);
 }
}
function cameraShot(frame,t,dt){
 if(!camera||!frame)return;
 const a=frame.heroes.find(h=>h.side==='left');
 const b=frame.heroes.find(h=>h.side==='right');
 if(!a||!b)return;
 const center=new THREE.Vector3((a.x+b.x)/2,1.2,(a.z+b.z)/2);
 let dest;
 if(status.mode==='director'){
  const dx=a.x-b.x,dz=a.z-b.z;
  const spacing=Math.hypot(dx,dz);
  dest=new THREE.Vector3(center.x+Math.sin(t*.09)*Math.max(11,spacing*.9),
   Math.max(7,spacing*.38+4),center.z+Math.cos(t*.09)*Math.max(14,spacing*1.1));
 }else{
  const subject=status.mode==='left'?a:b;
  const back=new THREE.Vector3(
   subject.x-Math.sin(subject.face)*5.4,4.2,
   subject.z-Math.cos(subject.face)*6.7);
  dest=back;
  center.set(subject.x,1.65,subject.z);
 }
 const f=1-Math.exp(-Math.min(dt,.06)*3.5);
 cameraPos.lerp(dest,f);lookPos.lerp(center,f);
 camera.position.copy(cameraPos);camera.lookAt(lookPos);
}
function showVictory(t){
 const replay=status.replay;
 const complete=t>=replay.duration-.025;
 $('victory').hidden=!complete;
 if(complete){
  const winner=replay.participants.find(p=>p.side===replay.winnerSide);
  $('winnerName').textContent=winner?.name||'Campeão';
  $('battleStatus').textContent='FINALIZADO';
 }else $('battleStatus').textContent='EM CONFRONTO';
}
function render(t){
 if(!status.ready||!status.replay)return;
 const replay=status.replay;
 const actual=(Date.now()+status.clockOffset-Date.parse(status.match.startedAt))/1000;
 const elapsed=THREE.MathUtils.clamp(actual*replay.playbackRate,0,replay.duration);
 status.replayTime=elapsed;
 const frame=frameAt(elapsed);
 const dt=previous?Math.max(0,Math.min(.07,(t-previous)/1000)):.016;
 previous=t;
 moveActors(frame,dt);
 cameraShot(frame,elapsed,dt);
 eventsAt(elapsed);
 updateHUD(frame,elapsed);
 showVictory(elapsed);
 for(let i=particles.length-1;i>=0;i--){
  const p=particles[i];p.life-=dt;
  p.mesh.scale.multiplyScalar(1+dt*.8);p.mesh.material.opacity=Math.max(0,p.life/.55);
  if(p.life<=0){scene?.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();particles.splice(i,1)}
 }
 renderer?.render(scene,camera);
}
function loop(t){try{render(t)}catch(e){label('Visualização interrompida: '+e.message,'error')}raf=requestAnimationFrame(loop)}
function startDemo(){
 const replay=makeDemoReplay();
 const now=new Date();
 installMatch({ready:true,status:'running',stage:3,
  replaySha256:'DEMO-ONLY-LOCAL',
  startedAt:now.toISOString(),
  endsAt:new Date(now.getTime()+Math.ceil(replay.duration/replay.playbackRate)*1000).toISOString(),
  serverNow:now.toISOString(),progress:0,replay});
 label('PRÉVIA FICTÍCIA — uma batalha demonstrativa reproduzida localmente. Sem contas, servidor, turmas ou XP.','info');
 $('description').textContent='Exemplo com duas classes e câmera cinematográfica. O duelo real usa o replay imutável calculado no servidor.';
}
async function invokeMatch(action){
 const config=window.__PIT_V5_D1B_STAGING;
 if(!config||typeof config.tokenProvider!=='function'||typeof config.inviteId!=='string')
  throw Error('Sessão de homologação ausente.');
 const endpoint=config.endpoint;
 if(typeof endpoint!=='string'||!/^https:\/\/|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(endpoint)||
    !endpoint.endsWith('/api/duel-match-v2-lab'))
  throw Error('Endpoint não autorizado.');
 const token=await config.tokenProvider();
 if(typeof token!=='string'||!/^[a-f0-9]{64}$/i.test(token))
  throw Error('Sessão de estudante inválida.');
 const url=new URL(endpoint);
 url.searchParams.set('action',action);
 const method=action==='start'?'POST':'GET';
 if(method==='GET')url.searchParams.set('inviteId',config.inviteId);
 const began=Date.now();
 status.apiCalls++;
 const response=await fetch(url.toString(),{
  method,headers:{
   'X-PIT-Student-Token':token,...(method==='POST'?{'Content-Type':'application/json'}:{})
  },...(method==='POST'?{body:JSON.stringify({inviteId:config.inviteId})}:{}),
  credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer'
 });
 const body=await response.json();
 if(!response.ok||!body.ok)throw Error(String(body.error||'Servidor indisponível.').slice(0,210));
 // Use midpoint to reduce device clock skew under network round-trip.
 if(body.match?.serverNow)body.match.serverNow=
  new Date(Date.parse(body.match.serverNow)+(Date.now()-began)/2).toISOString();
 return body.match;
}
async function syncReal(){
 try{
  const get=await invokeMatch('replay');
  const m=get.ready?get:await invokeMatch('start');
  if(!m.ready)throw Error('O adversário ainda não aceitou o convite.');
  installMatch(m);
  label('HOMOLOGAÇÃO EM TEMPO REAL — os dois alunos reproduzem a mesma sequência assinada pelo servidor.','success');
 }catch(e){label('Conexão de teste: '+e.message,'error')}
}
$('director').addEventListener('click',()=>selectMode('director'));
$('followLeft').addEventListener('click',()=>selectMode('left'));
$('followRight').addEventListener('click',()=>selectMode('right'));
$('enableAudio').addEventListener('click',()=>{
 const ok=audio.unlock();
 $('enableAudio').textContent=ok?'🔊 Som espacial ativo':'🔇 Som indisponível';
});
$('reconnect').addEventListener('click',()=>{if(demo)startDemo();else void syncReal()});
document.addEventListener('visibilitychange',()=>{
 // No catch-up orchestra after Android pauses a background tab.
 if(!document.hidden&&status.ready){
  status.lastEventIndex=status.replay?.events?.findIndex(e=>e.t>=status.replayTime)||0;
  status.lastAudioTime=status.replayTime;
  if(!demo)void syncReal();
 }
});
selectMode('director');
createWorld();
raf=requestAnimationFrame(loop);
if(demo)startDemo();
else if(['localhost','127.0.0.1'].includes(location.hostname)&&
 window.__PIT_V5_D1B_STAGING?.enabled===true){
 void syncReal();
 matchPoll=setInterval(()=>{if(!document.hidden)void syncReal()},4500);
}else{
 label('A D.1b está desativada para contas reais. Abra ?demo=1 para testar somente com personagens fictícios.','info');
 $('description').textContent='Homologação bloqueada para dados reais. O teste demonstrativo permanece disponível.';
}
window.addEventListener('pagehide',()=>{audio.dispose();if(matchPoll)clearInterval(matchPoll);cancelAnimationFrame(raf)});

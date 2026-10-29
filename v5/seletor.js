/* PIT Game Jam IA — V5 / Fase 1.
 * Only real source-verified GLBs: no generated character substitutes.
 * Isolated character audition. No authentication, grade, XP or database writes.
 */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from 'three/addons/utils/SkeletonUtils.js';

const CATALOG=window.PIT_V5_FASE1||[];
const SOURCES=window.PIT_V5_ASSETS||{};
const $=id=>document.getElementById(id);
const stage=$('stage'),loading=$('loading'),status=$('stageStatus'),badge=$('webglBadge');
const buttons=new Map(),clipsByRole=new Map(),assetCache=new Map();
const ROLES=[
 {id:'idle',label:'Repouso',keys:[/idle/i,/breath/i]},
 {id:'walk',label:'Caminhar',keys:[/walk/i,/walking/i]},
 {id:'run',label:'Correr',keys:[/run/i,/sprint/i]},
 {id:'attack',label:'Atacar',keys:[/attack/i,/slash/i,/shoot/i,/cast/i]},
 {id:'hit',label:'Dano',keys:[/hit/i,/hurt/i,/damage/i]},
 {id:'death',label:'Morte',keys:[/death/i,/die/i,/defeat/i]}
];
let renderer,scene,camera,controls,actorGroup,clock,frame=0,resizeObserver;
let activeRoot=null,mixer=null,activeAction=null,activeClipId=null;
let currentId='',loadSequence=0,autoSpin=false,glReady=false;
const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader=new GLTFLoader();

function setMessage(message,error=false){
 status.textContent=message;
 status.style.color=error?'#efaba0':'';
}
function setLoading(message,sub='Aguarde a leitura do GLB original…'){
 loading.hidden=false;
 loading.querySelector('strong').textContent=message;
 loading.querySelector('span').textContent=sub;
}
function cacheGLB(asset){
 if(!assetCache.has(asset.model)){
  assetCache.set(asset.model,loader.loadAsync(asset.model).catch(e=>{assetCache.delete(asset.model);throw e;}));
 }
 return assetCache.get(asset.model);
}
function classifyClips(animations){
 const found=new Map();
 ROLES.forEach(role=>{
  const candidates=animations.filter(c=>role.keys.some(re=>re.test(c.name)));
  if(candidates.length){
   candidates.sort((a,b)=>{
    const score=c=>(/_a\b|_01\b|^idle$|^walk$|^run$|^attack$/i.test(c.name)?0:1)+(/loop/i.test(c.name)?0:1);
    return score(a)-score(b);
   });
   found.set(role.id,candidates[0]);
  }
 });
 return found;
}
function updateAnimationButtons(){
 const host=$('animationControls');
 host.replaceChildren();buttons.clear();
 ROLES.forEach(role=>{
  const b=document.createElement('button');
  b.type='button';b.textContent=role.label;b.dataset.animation=role.id;
  b.disabled=!clipsByRole.has(role.id);
  b.title=b.disabled?'Este arquivo não contém um clipe identificável para este movimento':clipsByRole.get(role.id).name;
  b.setAttribute('aria-pressed',String(activeClipId===role.id));
  b.addEventListener('click',()=>playClip(role.id));
  host.appendChild(b);buttons.set(role.id,b);
 });
}
function playClip(role){
 const clip=clipsByRole.get(role);
 if(!clip||!mixer)return false;
 if(activeClipId===role)return true;
 const next=mixer.clipAction(clip);
 next.reset();next.enabled=true;next.setEffectiveWeight(1);next.setEffectiveTimeScale(1);
 next.setLoop(role==='death'?THREE.LoopOnce:THREE.LoopRepeat,role==='death'?1:Infinity);
 next.clampWhenFinished=role==='death';
 next.play();
 if(activeAction)activeAction.fadeOut(.22);
 next.fadeIn(.22);
 activeAction=next;activeClipId=role;
 buttons.forEach((b,id)=>b.setAttribute('aria-pressed',String(id===role)));
 setMessage('Reproduzindo clipe real: '+clip.name);
 stage.dataset.animation=role;
 return true;
}
function clearActor(){
 if(mixer){mixer.stopAllAction();if(activeRoot)mixer.uncacheRoot(activeRoot);}
 if(activeRoot)actorGroup.remove(activeRoot);
 activeRoot=null;mixer=null;activeAction=null;activeClipId=null;
 clipsByRole.clear();updateAnimationButtons();
 stage.dataset.model='none';stage.dataset.animation='';
 stage.dataset.clipCount='0';
}
function showDetails(entry,asset){
 $('className').textContent=entry.name;
 $('classType').textContent=entry.type;
 $('classLore').textContent=entry.lore;
 $('classSpecial').textContent=entry.special;
 $('classWeakness').textContent=entry.weakness;
 $('classGlyph').textContent=entry.glyph;
 $('classGlyph').style.color=entry.accent;
 $('assetName').textContent=entry.modelName;
 $('assetLicense').textContent=asset.license+' · '+asset.creator;
 $('assetAnimations').textContent='Aguardando leitura do arquivo';
 $('assetLink').href=asset.source;
}
function renderClasses(){
 const holder=$('classList');holder.replaceChildren();
 CATALOG.forEach(entry=>{
  const button=document.createElement('button');
  button.type='button';button.className='class-button';
  button.dataset.class=entry.id;button.style.setProperty('--accent',entry.accent);
  button.setAttribute('aria-pressed',String(currentId===entry.id));
  const glyph=document.createElement('span');glyph.className='class-icon';glyph.setAttribute('aria-hidden','true');glyph.textContent=entry.glyph;
  const name=document.createElement('span');
  const strong=document.createElement('strong');strong.textContent=entry.name;
  const small=document.createElement('small');small.textContent=entry.type;
  name.append(strong,small);
  const check=document.createElement('span');check.className='check';check.setAttribute('aria-hidden','true');check.textContent='✦';
  button.append(glyph,name,check);
  button.addEventListener('click',()=>selectClass(entry.id));
  holder.appendChild(button);
 });
}
function makeStage(){
 const canvas=document.createElement('canvas');
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.25;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 stage.appendChild(canvas);
 scene=new THREE.Scene();
 scene.fog=new THREE.FogExp2(0x17121a,.032);
 camera=new THREE.PerspectiveCamera(38,1,.1,75);
 camera.position.set(5.6,3.4,7.4);
 controls=new OrbitControls(camera,canvas);
 controls.enableDamping=true;controls.dampingFactor=.07;
 controls.minDistance=2.5;controls.maxDistance=12;
 controls.minPolarAngle=.26;controls.maxPolarAngle=Math.PI*.49;
 controls.target.set(0,1.5,0);controls.update();
 scene.add(new THREE.HemisphereLight(0xb7c1e9,0x533327,2.2));
 const key=new THREE.DirectionalLight(0xfac69b,3.7);
 key.position.set(-4,9,7);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);
 key.shadow.camera.left=-6;key.shadow.camera.right=6;
 key.shadow.camera.top=7;key.shadow.camera.bottom=-7;scene.add(key);
 const rim=new THREE.DirectionalLight(0x8c69cc,3.0);rim.position.set(4,6,-5);scene.add(rim);
 const ground=new THREE.Mesh(
  new THREE.CylinderGeometry(3.55,3.8,.38,64),
  new THREE.MeshStandardMaterial({color:0x1d1a25,metalness:.42,roughness:.7})
 );
 ground.position.y=-.23;ground.receiveShadow=true;scene.add(ground);
 for(const [radius,weight,color] of [[3.25,.055,0x9b7151],[2.5,.017,0x664d58],[1.85,.017,0x846657]]){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,weight,6,96),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.12,metalness:.7}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.015;scene.add(ring);
 }
 const dustGeo=new THREE.BufferGeometry(),points=[];
 for(let i=0;i<100;i++){const phi=i*2.399963229728653,r=2+Math.sqrt(i/100)*3;points.push(Math.cos(phi)*r,.3+(i%17)*.28,Math.sin(phi)*r);}
 dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
 scene.add(new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xb99577,size:.045,transparent:true,opacity:.43,depthWrite:false})));
 actorGroup=new THREE.Group();scene.add(actorGroup);
 clock=new THREE.Clock();
 resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resize();
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();glReady=false;setMessage('Contexto WebGL perdido. Recarregue a página para tentar novamente.',true);loading.hidden=false;});
 glReady=true;
 badge.dataset.ready='true';badge.textContent='THREE.JS · WEBGL ATIVO';
 function frameLoop(){
  if(!glReady)return;
  frame=requestAnimationFrame(frameLoop);
  const dt=Math.min(clock.getDelta(),.06);
  if(!document.hidden){
   mixer?.update(dt);
   if(autoSpin&&!prefersReduced)actorGroup.rotation.y+=dt*.27;
   controls.update();renderer.render(scene,camera);
  }
 }
 frameLoop();
}
function resize(){
 if(!renderer||!camera)return;
 const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
 camera.aspect=w/h;camera.updateProjectionMatrix();
 renderer.setSize(w,h,false);
}
async function selectClass(id){
 const entry=CATALOG.find(x=>x.id===id),asset=SOURCES[id];
 if(!entry||!asset)return;
 const request=++loadSequence;currentId=id;
 document.querySelectorAll('.class-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.class===id)));
 showDetails(entry,asset);
 clearActor();
 if(!glReady){
  setMessage('WebGL indisponível neste navegador.',true);return;
 }
 stage.dataset.assetClass=id;
 setLoading('Invocando '+entry.name+'…','Lendo '+entry.modelName+' de um commit público fixado');
 setMessage('Carregando GLB real · '+entry.modelName);
 try{
  const gltf=await cacheGLB(asset);
  if(request!==loadSequence)return;
  const root=cloneSkinned(gltf.scene);
  if(!root||!root.children.length)throw Error('GLB sem cena renderizável');
  const bounds=new THREE.Box3().setFromObject(root);
  const dimensions=bounds.getSize(new THREE.Vector3());
  if(!Number.isFinite(dimensions.y)||dimensions.y<.01)throw Error('Modelo sem altura 3D válida');
  const scale=3.15/dimensions.y;root.scale.multiplyScalar(scale);
  const scaledBounds=new THREE.Box3().setFromObject(root),center=scaledBounds.getCenter(new THREE.Vector3());
  root.position.x-=center.x;root.position.y-=scaledBounds.min.y;root.position.z-=center.z;
  root.traverse(obj=>{if(obj.isMesh||obj.isSkinnedMesh){obj.castShadow=true;obj.receiveShadow=true;}});
  actorGroup.rotation.y=0;actorGroup.add(root);activeRoot=root;
  mixer=new THREE.AnimationMixer(root);
  const clips=(gltf.animations||[]).filter(a=>a&&a.duration>0);
  const mapped=classifyClips(clips);
  mapped.forEach((clip,role)=>clipsByRole.set(role,clip));
  stage.dataset.model='loaded';
  stage.dataset.clipCount=String(clips.length);
  $('assetAnimations').textContent=clips.length+' clipe(s) · '+mapped.size+' ação(ões) reconhecida(s)';
  updateAnimationButtons();
  loading.hidden=true;
  if(!playClip('idle')){
    if(mapped.size){playClip(mapped.keys().next().value);}
    else setMessage('Modelo 3D carregado sem animações identificáveis. Nenhuma animação foi inventada.',true);
  }
 }catch(err){
  if(request!==loadSequence)return;
  stage.dataset.model='error';
  $('assetAnimations').textContent='Falha ao carregar · verifique a rede';
  setLoading('Não foi possível abrir '+entry.modelName,'Sem substitutos falsos. Verifique o acesso à CDN/GitHub e selecione a classe novamente.');
  setMessage('Falha no GLB: '+String(err?.message||err),true);
 }
}
$('resetCamera').addEventListener('click',()=>{
 if(!controls)return;
 camera.position.set(5.6,3.4,7.4);controls.target.set(0,1.5,0);
 actorGroup.rotation.y=0;controls.update();
});
$('toggleTurn').addEventListener('click',()=>{
 autoSpin=!autoSpin;$('toggleTurn').setAttribute('aria-pressed',String(autoSpin));
 $('toggleTurn').textContent=autoSpin?'Ⅱ Pausar giro':'↻ Giro automático';
});
window.addEventListener('pagehide',()=>{
 cancelAnimationFrame(frame);resizeObserver?.disconnect();controls?.dispose();
 if(mixer){mixer.stopAllAction();if(activeRoot)mixer.uncacheRoot(activeRoot);}
 renderer?.dispose();
},{once:true});
updateAnimationButtons();renderClasses();
try{
 if(!CATALOG.length||!CATALOG.every(c=>SOURCES[c.id]?.model.endsWith('.glb')))throw Error('Catálogo de modelos reais incompleto');
 makeStage();selectClass(CATALOG[0].id);
}catch(err){
 badge.textContent='VISUALIZAÇÃO INDISPONÍVEL';badge.dataset.ready='false';
 setLoading('Visualização 3D indisponível',String(err?.message||err));
 setMessage('Não foi possível inicializar o Three.js neste dispositivo.',true);
}
window.PIT_V5_FASE1_DEBUG=Object.freeze({
 get selected(){return currentId;},
 get modelState(){return stage.dataset.model;},
 get clips(){return [...clipsByRole.keys()];}
});

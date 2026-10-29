/* Four clean KayKit Adventurers CC0 GLB characters. No modular armor.
 * FOUR distinct source models, identical rendered height and original animations.
 * No fake avatar reservation, no professor/student progress writes.
 */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from 'three/addons/utils/SkeletonUtils.js';
const A=window.PIT_V5_ASSETS,$=id=>document.getElementById(id);
const defs={
 warrior:{name:'Guerreiro',glyph:'⚔',color:'#daa16d',description:'Bárbaro animado do KayKit Adventurers. Ataques corpo a corpo e força, sem alterar atributos ou habilidades pelo aspecto visual.'},
 mage:{name:'Arcanista',glyph:'✦',color:'#b38be9',description:'Mago original do mesmo pacote KayKit, pronto para magia, runas e habilidades à distância.'},
 hunter:{name:'Caçador',glyph:'➶',color:'#99ceaa',description:'Ladino encapuzado original do mesmo pacote KayKit, com identidade furtiva. A classe preserva suas habilidades de Caçador no motor de combate.'},
 guardian:{name:'Guardião',glyph:'◆',color:'#92bbdb',description:'Cavaleiro original, diferente do Bárbaro. Seus atributos e talentos defensivos são preservados.'}
};
const cache=new Map(),loader=new GLTFLoader();
let selected='warrior',scene,renderer,camera,controls,modelHost,mixer,clock,glReady=false,ticket=0;
function state(){return window.PIT_V5_SIMPLE_HERO_LAB}
function buildTabs(){
 const group=$('classTabs');group.replaceChildren();
 for(const [klass,info] of Object.entries(defs)){
  const b=document.createElement('button');b.type='button';b.className='class-button';
  b.dataset.class=klass;b.style.setProperty('--accent',info.color);
  b.setAttribute('aria-pressed',String(klass===selected));
  const icon=document.createElement('span');icon.className='class-icon';icon.textContent=info.glyph;
  const copy=document.createElement('span'),head=document.createElement('strong'),sub=document.createElement('small');
  head.textContent=info.name;sub.textContent='GLB original · CC0';
  copy.append(head,sub);b.append(icon,copy);
  b.addEventListener('click',()=>select(klass));group.append(b);
 }
}
function select(klass){
 if(!defs[klass])return;
 selected=klass;buildTabs();
 $('viewerTitle').textContent=defs[klass].name;
 $('className').textContent=defs[klass].name;
 $('classDescription').textContent=defs[klass].description;
 $('avatarName').textContent=defs[klass].name;
 $('modelFile').textContent=A[klass].model.split('/').pop();
 $('avatarEquipment').textContent=A[klass].label+' · '+A[klass].weapon+' · original';
 if(glReady)show(klass);
}
function load(url){
 if(!cache.has(url))cache.set(url,loader.loadAsync(url).catch(e=>{cache.delete(url);throw e}));
 return cache.get(url);
}
function initWebGL(){
 const container=$('avatarStage');
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'default'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.setSize(container.clientWidth||520,container.clientHeight||470);
  container.append(renderer.domElement);
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(38,1,.1,80);
  camera.position.set(4,3.2,6.5);
  controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.target.set(0,1.3,0);
  controls.minDistance=2.8;controls.maxDistance=11;controls.maxPolarAngle=Math.PI*.64;
  controls.update();
  scene.add(new THREE.HemisphereLight(0xd1c6e4,0x483647,2.1));
  const main=new THREE.DirectionalLight(0xffe1b9,3.0);main.position.set(-4,8,6);scene.add(main);
  const rim=new THREE.DirectionalLight(0xb3a2ff,2.1);rim.position.set(4,6,-5);scene.add(rim);
  const platform=new THREE.Mesh(new THREE.CylinderGeometry(2.55,2.9,.27,48),
   new THREE.MeshStandardMaterial({color:0x322736,metalness:.35,roughness:.67}));
  platform.position.y=-.18;scene.add(platform);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.038,6,56),
   new THREE.MeshBasicMaterial({color:0xc6a077}));
  ring.rotation.x=-Math.PI/2;ring.position.y=-.018;scene.add(ring);
  modelHost=new THREE.Group();scene.add(modelHost);
  clock=new THREE.Clock();glReady=true;
  new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;
   if(w&&h){camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}
  }).observe(container);
  renderer.setAnimationLoop(()=>{mixer?.update(Math.min(.05,clock.getDelta()));controls.update();renderer.render(scene,camera)});
  return true;
 }catch(e){
  $('loading').textContent='WebGL indisponível neste aparelho. Você pode ver as quatro classes no Coliseu.';
  $('assetStatus').textContent='SEM WEBGL';
  console.warn('[V5] WebGL unavailable',e);
  return false;
 }
}
async function show(klass){
 const key=++ticket,asset=A[klass];
 $('assetStatus').textContent='CARREGANDO GLB';$('loading').hidden=false;
 $('loading').textContent='✧ Carregando '+defs[klass].name+'...';
 try{
  const gltf=await load(asset.model);
  if(key!==ticket)return;
  mixer?.stopAllAction();mixer=null;modelHost.clear();
  const model=cloneSkinned(gltf.scene);
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model);
  const height=bounds.getSize(new THREE.Vector3()).y,center=bounds.getCenter(new THREE.Vector3());
  if(!(height>.05))throw Error('Arquivo GLB sem geometria válida');
  const factor=2.55/height;
  model.scale.setScalar(factor);model.position.set(-center.x*factor,-bounds.min.y*factor,-center.z*factor);
  modelHost.add(model);
  if(gltf.animations?.length){
   mixer=new THREE.AnimationMixer(model);
   const idle=gltf.animations.find(c=>/idle|stand|breath/i.test(c.name))||gltf.animations[0];
   mixer.clipAction(idle).setLoop(THREE.LoopRepeat).play();
  }
  const h=new THREE.Box3().setFromObject(modelHost).getSize(new THREE.Vector3()).y;
  containerStatus(klass,asset,gltf.animations.length,h);
  $('loading').hidden=true;
 }catch(e){
  if(key!==ticket)return;
  $('loading').textContent='Não foi possível carregar o GLB original. '+(e.message||e);
  $('assetStatus').textContent='ERRO DE ASSET';
  $('avatarStage').dataset.loadState='error';
  console.warn('[V5] Original GLB fetch error:',e);
 }
}
function containerStatus(klass,asset,clips,height){
 const host=$('avatarStage');
 host.dataset.loadState='ready';
 host.dataset.selectedClass=klass;
 host.dataset.sourceFamily='kaykit-adventurers';
 host.dataset.modelFile=asset.model.split('/').pop();
 host.dataset.modelHeight=String(height);
 host.dataset.clips=String(clips);
 $('assetStatus').textContent='GLB CC0 · '+clips+' ANIMAÇÕES';
}
window.PIT_V5_SIMPLE_HERO_LAB=Object.freeze({
 get class(){return selected},
 get glReady(){return glReady},
 get source(){return 'kaykit-adventurers'},
 get modelHeight(){return Number($('avatarStage').dataset.modelHeight||0)},
 get selectedModel(){return A[selected].model},
 get animationCount(){return Number($('avatarStage').dataset.clips||0)}
});
initWebGL();select(selected);

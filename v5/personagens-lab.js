/* Arsenal das Lendas — single browser demonstration, not authoritative H.
 * Preview: real KayKit CC0 3D GLBs, 40 inventory IDs (10/class), 30 fictitious
 * pupils, teacher-like deterministic class assignments 8/8/7/7.
 * Reservation: localStorage per demo room ONLY. Cannot prevent cross-device
 * races. Phase H must claim via authenticated DB unique(roomId,avatarId).
 */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from 'three/addons/utils/SkeletonUtils.js';
const API=window.PIT_V5_AVATARS,ASSETS=window.PIT_V5_ASSETS,WARDROBE=window.PIT_V5_WARDROBE;
const $=id=>document.getElementById(id);
const modelCache=new Map(),loader=new GLTFLoader();
let currentStudent='aluno-01',currentClass='warrior',selectedAvatar='warrior-01',room='TURMA-01';
let renderer,scene,camera,controls,root,mixer,clock,glReady=false,loadId=0,activeWardrobe=null,activeVisual=null;
let demoShowroomSource='pending';
const theme={warrior:'⚔',mage:'✦',hunter:'➶',guardian:'◆'};
const names={warrior:'Guerreiros',mage:'Arcanistas',hunter:'Caçadores',guardian:'Guardiões'};
const safeRoom=v=>(String(v||'TURMA-01').toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,24)||'TURMA-01');
const key=()=> 'pit-v5-avatar-demo-v1:'+room;
function claims(){
 try{return API.sanitizeClaims(JSON.parse(localStorage.getItem(key())||'[]'))}
 catch{return []}
}
function save(value){
 try{localStorage.setItem(key(),JSON.stringify(value));return true}
 catch{return false}
}
function own(){return claims().find(c=>c.studentId===currentStudent)}
function setMessage(msg,error=false){$('claimMessage').textContent=msg;$('claimMessage').style.color=error?'#f3a29b':'#c8e4b7'}
function selectStudent(id){
 currentStudent=id;
 currentClass=API.assignedClass(currentStudent)||'warrior';
 selectedAvatar=own()?.avatarId||API.forClass(currentClass).find(a=>!claims().some(c=>c.avatarId===a.id))?.id||API.forClass(currentClass)[0].id;
 draw();
 setMessage('Classe atribuída: '+API.CLASSES[currentClass].label+' · somente personagens dessa classe podem ser reservados.');
}
function renderStudents(){
 const select=$('studentSelect');
 for(let i=1;i<=30;i++){
  const id='aluno-'+String(i).padStart(2,'0'),klass=API.assignedClass(id),option=document.createElement('option');
  option.value=id;option.textContent='Aluno '+String(i).padStart(2,'0')+' · '+API.CLASSES[klass].label;
  select.appendChild(option);
 }
 select.value=currentStudent;
 select.addEventListener('change',()=>selectStudent(select.value));
}
function renderClasses(){
 const host=$('classTabs');host.replaceChildren();
 for(const [klass,entry] of Object.entries(API.CLASSES)){
  const assigned=currentClass===klass;
  const button=document.createElement('button');
  button.className='class-button';button.style.setProperty('--accent',entry.color);
  button.dataset.class=klass;button.type='button';button.disabled=!assigned;
  button.setAttribute('aria-pressed',String(assigned));
  const icon=document.createElement('span');icon.className='class-icon';icon.textContent=entry.glyph;icon.setAttribute('aria-hidden','true');
  const words=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');
  strong.textContent=entry.label;small.textContent=entry.role;words.append(strong,small);
  const check=document.createElement('span');check.className='check';check.textContent=assigned?'✦ ATRIBUÍDA':'BLOQUEADA';
  button.append(icon,words,check);
  button.title=assigned?'Classe atribuída pelo professor':'Escolha outro aluno de demonstração para ver esta classe';
  host.appendChild(button);
 }
}
function renderGallery(){
 const host=$('avatarGallery');host.replaceChildren();
 const list=API.forClass(currentClass),used=claims(),mine=own();
 const available=list.filter(a=>!used.some(c=>c.avatarId===a.id&&c.studentId!==currentStudent)).length;
 $('galleryTitle').textContent=names[currentClass];
 $('availableCount').textContent=available+' / 10 disponíveis';
 for(const avatar of list){
  const taken=used.find(c=>c.avatarId===avatar.id),blocked=!!taken&&taken.studentId!==currentStudent;
  const b=document.createElement('button');b.type='button';b.className='avatar-card';
  b.dataset.avatarId=avatar.id;b.disabled=blocked;b.style.setProperty('--accent',avatar.accent);
  b.setAttribute('aria-pressed',String(selectedAvatar===avatar.id));
  const portrait=document.createElement('span');portrait.className='portrait';portrait.textContent=avatar.badge;
  portrait.setAttribute('aria-hidden','true');
  const info=document.createElement('span');info.className='info';
  const title=document.createElement('strong');title.textContent=avatar.name;
  const recipe=WARDROBE.spec(avatar);
  const armor=document.createElement('small');armor.textContent=recipe.weapon.toUpperCase()+' · '+avatar.armor+' · '+avatar.id.toUpperCase();
  const state=document.createElement('span');state.className='state';
  state.textContent=blocked?'✕ JÁ ESCOLHIDO':mine?.avatarId===avatar.id?'✓ SEU PERSONAGEM':'✦ DISPONÍVEL';
  info.append(title,armor,state);b.append(portrait,info);
  b.title=blocked?'Indisponível: já reservado por '+taken.studentId:avatar.name+' · '+recipe.outfit+' · '+recipe.weapon+' · armadura e capacete próprios';
  b.addEventListener('click',()=>{selectedAvatar=avatar.id;draw()});
  host.appendChild(b);
 }
 const selected=API.get(selectedAvatar),taken=used.find(c=>c.avatarId===selectedAvatar);
 const blocked=!!taken&&taken.studentId!==currentStudent;
 $('claimAvatar').disabled=!selected||blocked||mine?.avatarId===selectedAvatar;
 $('releaseAvatar').disabled=!mine;
 $('selectedSummary').textContent=selected?
  selected.name+' · '+API.CLASSES[selected.klass].label+' · '+(blocked?'Já reservado':mine?.avatarId===selectedAvatar?'Sua escolha atual':'Disponível para este aluno'):'Selecione um herói';
 $('avatarName').textContent=selected?.name||'Selecione um herói';
 $('avatarEquipment').textContent=selected?selected.armor+' · identidade '+selected.id:'';
}
function draw(){
 renderClasses();renderGallery();
 if(glReady&&selectedAvatar)show3d(API.get(selectedAvatar));
}
function reserve(){
 const result=API.reserve(claims(),currentStudent,selectedAvatar);
 if(!result.ok){setMessage(result.error,true);draw();return}
 if(!save(result.claims)){setMessage('Este navegador bloqueou o armazenamento da demonstração',true);return}
 setMessage('✦ '+result.avatar.name+' agora pertence ao '+currentStudent+' nesta turma de demonstração');
 draw();
}
function release(){
 const prior=own();if(!prior){setMessage('Este aluno não possui reserva');return}
 if(!save(API.release(claims(),currentStudent))){setMessage('Armazenamento indisponível',true);return}
 setMessage('Personagem liberado para nova escolha nesta turma');
 draw();
}
function changeRoom(){
 room=safeRoom($('roomCode').value);$('roomCode').value=room;
 const assigned=API.assignedClass(currentStudent);
 const entries=API.forClass(assigned);
 selectedAvatar=claims().find(c=>c.studentId===currentStudent)?.avatarId||entries[0].id;
 draw();setMessage('Turma: '+room+' · reservas locais separadas por turma');
}
function getGLB(url){
 if(!modelCache.has(url))modelCache.set(url,loader.loadAsync(url).catch(err=>{modelCache.delete(url);throw err}));
 return modelCache.get(url);
}
function init3d(){
 const stage=$('avatarStage');
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.6;
  renderer.setSize(stage.clientWidth||400,stage.clientHeight||410);
  stage.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(40,1,.1,100);
  camera.position.set(4,3.6,7.3);
  controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.minDistance=2.5;controls.maxDistance=12;
  controls.minPolarAngle=.25;controls.maxPolarAngle=Math.PI*.58;controls.target.set(0,1.45,0);controls.update();
  scene.add(new THREE.HemisphereLight(0xd8cbed,0x52405d,2.4));
  const key=new THREE.DirectionalLight(0xf8d6a4,3.5);key.position.set(-4,7,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0x8e6add,2.9);rim.position.set(4,5,-5);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(3.1,3.6,.28,50),
   new THREE.MeshStandardMaterial({color:0x352635,metalness:.36,roughness:.67}));
  floor.position.y=-.15;scene.add(floor);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.8,.045,8,60),
   new THREE.MeshBasicMaterial({color:0xb69168}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.011;scene.add(ring);
  root=new THREE.Group();scene.add(root);clock=new THREE.Clock();glReady=true;
  const resize=new ResizeObserver(()=>{
   if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;
   if(w&&h){camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}
  });resize.observe(stage);
  renderer.setAnimationLoop(()=>{
   const dt=Math.min(.06,clock.getDelta());mixer?.update(dt);
   if(activeVisual&&!mixer){
    const t=clock.elapsedTime;activeVisual.position.y=Math.sin(t*1.5)*.016;
    activeVisual.rotation.y=Math.sin(t*.5)*.028;
   }
   controls.update();renderer.render(scene,camera);
  });
  $('assetStatus').textContent='GLB + ARMADURA 3D · CC0';
 }catch(e){
  $('loading').textContent='Prévia WebGL indisponível neste aparelho. As reservas ainda funcionam.';
  $('assetStatus').textContent='SEM WEBGL';console.warn('[V5] GL unavailable',e);
 }
}
function disposeGenerated(){
 if(!activeWardrobe)return;
 activeWardrobe.root.traverse(obj=>{
  if(obj.isMesh){
   obj.geometry?.dispose();
   if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());
   else obj.material?.dispose();
  }
 });
 activeWardrobe=null;
}
async function show3d(avatar){
 const ticket=++loadId;
 const recipe=WARDROBE.spec(avatar),asset=ASSETS[avatar?.baseModelId];
 if(!recipe||!asset||!glReady)return;
 $('loading').hidden=false;$('loading').textContent='✧ Forjando '+avatar.name+'…';
 $('assetStatus').textContent='MALHA CC0 · GLTF';
 let data,source='Quaternius';
 try{
  // All four authentic medieval outfits are hosted as free/CC0 Standard
  // glTF exports at an immutable public GitHub commit. A KayKit CC0 GLB
  // remains a working fallback for browsers with failed cross-origin fetch.
  try{data=await getGLB(recipe.url)}
  catch(error){
   console.warn('[V5] Quaternius Standard outfit not reachable; fallback CC0',recipe.outfit,error);
   data=await getGLB(asset.model);source='KayKit fallback';
  }
  if(ticket!==loadId)return;
  mixer?.stopAllAction();disposeGenerated();root.clear();
  const model=cloneSkinned(data.scene);
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),
   center=bounds.getCenter(new THREE.Vector3());
  if(!Number.isFinite(size.y)||size.y<.01)throw Error('Altura do GLB inválida');
  // Class-independent apparent height; NO previous max-factor cap.
  const factor=2.6/size.y;
  model.scale.setScalar(factor);
  model.position.set(-center.x*factor,-bounds.min.y*factor,-center.z*factor);
  const accent=new THREE.Color(avatar.accent);
  model.traverse(part=>{
   if(!part.isMesh)return;
   const recolor=mat=>{
    const m=mat.clone();
    // Keep photographic/hand-painted cloth texture legible; class identity
    // is primarily shown by unique 3D equipment, not garish overall tint.
    if(m.color)m.color.lerp(accent,.13);
    m.side=THREE.FrontSide;
    return m;
   };
   part.material=Array.isArray(part.material)?part.material.map(recolor):recolor(part.material);
  });
  root.add(model);
  activeWardrobe=WARDROBE.construct(THREE,avatar);
  activeVisual=activeWardrobe.root;root.add(activeVisual);
  mixer=null;
  if(data.animations?.length){
   mixer=new THREE.AnimationMixer(model);
   const clip=data.animations.find(c=>/idle|breath/i.test(c.name))||data.animations[0];
   mixer.clipAction(clip).play();
  }
  demoShowroomSource=source;
  $('assetStatus').textContent=(source==='Quaternius'?'QUATERNIUS · CC0':'KAYKIT · CC0')+' · '+activeWardrobe.meshCount+' PARTES';
  $('avatarEquipment').textContent=avatar.armor+' · '+recipe.weapon+' · '+recipe.outfit;
  $('avatarStage').dataset.avatarId=avatar.id;
  $('avatarStage').dataset.baseSource=source;
  $('avatarStage').dataset.meshCount=String(activeWardrobe.meshCount);
  $('avatarStage').dataset.outfit=recipe.outfit;
  $('loading').hidden=true;
 }catch(e){
  if(ticket!==loadId)return;
  $('loading').hidden=false;$('loading').textContent='Modelo 3D indisponível: '+(e.message||e);
  $('assetStatus').textContent='ERRO DE ASSET';
  console.error('[V5] Character asset failed',e);
 }
}
function init(){
 renderStudents();init3d();
 $('claimAvatar').addEventListener('click',reserve);
 $('releaseAvatar').addEventListener('click',release);
 $('roomCode').addEventListener('change',changeRoom);
 $('roomCode').addEventListener('blur',changeRoom);
 window.addEventListener('storage',e=>{if(e.key===key())draw()});
 selectStudent(currentStudent);
 window.PIT_V5_AVATAR_LAB=Object.freeze({
  get student(){return currentStudent},get room(){return room},
  get assignedClass(){return currentClass},
  get selectedAvatar(){return selectedAvatar},
  get claims(){return claims()},get catalogSize(){return API.AVATARS.length},
  get glReady(){return glReady},
  get previewSource(){return demoShowroomSource},
  get renderedAvatar(){return $('avatarStage').dataset.avatarId||null},
  get renderedParts(){return Number($('avatarStage').dataset.meshCount||0)},
  get recipe(){return WARDROBE.spec(API.get(selectedAvatar))},
  validateAllGear(){
   const unique=new Set(),summary=[];
   for(const avatar of API.AVATARS){
    const o=WARDROBE.construct(THREE,avatar);
    const key=o.recipe.id+'|'+o.recipe.weapon+'|'+o.recipe.outfit+'|'+o.meshCount;
    unique.add(key);summary.push({id:avatar.id,meshCount:o.meshCount,weapon:o.recipe.weapon,source:o.recipe.outfit});
    o.root.traverse(obj=>{if(obj.isMesh){obj.geometry.dispose();if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material.dispose()}});
   }
   return {count:summary.length,unique:unique.size,summary};
  }
 });
}
init();

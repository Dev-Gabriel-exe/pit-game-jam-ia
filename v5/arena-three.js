/* V5 cinematic Three.js arena — WebGL 2, custom low-poly armatures and fixed-step combat.
 * MIT Three.js v0.186.1. No stolen franchise materials; original geometry and effects.
 * No game server required: deterministic, teacher-authorized roster snapshot.
 */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from 'three/addons/utils/SkeletonUtils.js';
import {buildEclipseCitadel} from './arena-citadel.js';
const CORE=window.PIT_V5_CORE, ASSETS=window.PIT_V5_ASSETS||{};
const loader=new GLTFLoader(), cache=new Map();
function loadCharacter(klass){
 const asset=ASSETS[klass];if(!asset)return Promise.reject(Error('GLB não cadastrado: '+klass));
 if(!cache.has(klass))cache.set(klass,new Promise((resolve,reject)=>loader.load(asset.model,resolve,undefined,reject)).catch(err=>{cache.delete(klass);throw err}));
 return cache.get(klass);
}
const MATERIAL={
 floor:new THREE.MeshStandardMaterial({color:0x25222b,roughness:.95,metalness:.04}),
 floorEdge:new THREE.MeshStandardMaterial({color:0x73523b,roughness:.69,metalness:.52}),
 dark:new THREE.MeshStandardMaterial({color:0x15121b,metalness:.25,roughness:.75}),
 gold:new THREE.MeshStandardMaterial({color:0xb58a59,metalness:.83,roughness:.34}),
 bright:new THREE.MeshStandardMaterial({color:0xdfb883,metalness:.72,roughness:.34}),
 bone:new THREE.MeshStandardMaterial({color:0xd9b998,metalness:.06,roughness:.91}),
 flame:new THREE.MeshBasicMaterial({color:0xffa353}),
 cyan:new THREE.MeshStandardMaterial({color:0x74b2b9,emissive:0x2a8583,emissiveIntensity:.4}),
 purple:new THREE.MeshStandardMaterial({color:0xaf86db,emissive:0x482183,emissiveIntensity:.37})
};
const PALETTES={ember:0xc5774c,amethyst:0x7c6ba9,jade:0x508b6f,azure:0x507d9d,ashen:0x737c88,golden:0xc2a36a};
const geo=(kind,...a)=>new THREE[kind](...a);
function put(group,geometry,material,x=0,y=0,z=0){
 const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;
}
function mat(color,metalness=.3,roughness=.7){return new THREE.MeshStandardMaterial({color,metalness,roughness})}
function caption(text,size=65){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,128);
 ctx.font='bold '+size+'px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.shadowColor='#09070c';ctx.shadowBlur=14;ctx.fillStyle='#ffe5b6';
 ctx.fillText(String(text).slice(0,22),256,64,490);
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));
 sp.scale.set(2.6,.66,1);return sp;
}
function equipment(group,weaponType,klass,metal,glow){
 const arm=put(group,geo('CylinderGeometry',.12,.16,1.0,8),metal,.5,1.47,0);
 arm.rotation.z=-.25;
 let weapon;
 if(weaponType==='staff'){
  weapon=put(group,geo('CylinderGeometry',.045,.07,1.7,8),MATERIAL.gold,.7,1.5,.3);weapon.rotation.z=.25;
  put(group,geo('OctahedronGeometry',.24,0),glow,.91,2.32,.36);
 }else if(weaponType==='bow'){
  weapon=put(group,geo('TorusGeometry',.52,.055,6,24,Math.PI),MATERIAL.gold,.74,1.45,.17);weapon.rotation.y=Math.PI/2;
  put(group,geo('CylinderGeometry',.014,.014,.91,5),MATERIAL.bone,.79,1.45,.1);
 }else{
  const edge=put(group,geo('BoxGeometry',.14,1.35,.19),MATERIAL.bright,.86,1.3,.2);edge.rotation.z=klass==='guardian'?.24:.16;weapon=edge;
  put(group,geo('BoxGeometry',.66,.12,.22),MATERIAL.gold,.85,.86,.2);
  if(klass==='guardian'){
    const shield=put(group,geo('CylinderGeometry',.53,.53,.13,6),metal,-.75,1.16,.3);
    shield.rotation.x=Math.PI/2;put(group,geo('TorusGeometry',.44,.035,5,6),MATERIAL.gold,-.75,1.16,.4);
  }
 }
 return {arm,weapon};
}
function heroMesh(build,scale=1){
 const root=new THREE.Group(),actor=new THREE.Group();root.add(actor);
 const palette=PALETTES[build.appearance.palette]||PALETTES.ember;
 const armor=mat(palette,.6,.34),trim=MATERIAL.gold,glow=build.klass==='mage'?MATERIAL.purple:build.klass==='hunter'?MATERIAL.cyan:MATERIAL.flame;
 const skin=mat(0xc3a288,.02,.88),boots=mat(0x251b23,.27,.75);
 const legs=[];
 for(const z of [-.22,.22]){const leg=put(actor,geo('CylinderGeometry',.145,.18,.85,8),boots,z, .51,.04);legs.push(leg)}
 const body=put(actor,geo('CylinderGeometry',.32,.39,1.04,8),armor,0,1.39,0);
 const chest=put(actor,geo('OctahedronGeometry',.31,0),trim,0,1.52,.35);chest.scale.set(.85,1,.35);
 put(actor,geo('SphereGeometry',.34,12,8),skin,0,2.11,0);
 const helm=build.appearance.helmet;
 if(helm){
  const h=put(actor,geo('CylinderGeometry',.32,.34,helm===2?.4:.24,8),armor,0,2.35,0);
  if(helm===3)put(actor,geo('ConeGeometry',.31,.48,7),trim,0,2.7,0);
  if(helm===2)put(actor,geo('BoxGeometry',.56,.095,.18),trim,0,2.22,.3);
 }
 const arms=[];
 for(const x of [-.48,.48])arms.push(put(actor,geo('CylinderGeometry',.135,.16,.83,7),armor,x,1.47,.02));
 let cape=null;
 if(build.appearance.cape){
  const mesh=geo('PlaneGeometry',.92,1.34,7,8);const p=mesh.attributes.position;
  for(let i=0;i<p.count;i++)p.setZ(i,Math.pow(1-(p.getY(i)+.67)/1.34,2)*-.13);
  p.needsUpdate=true;
  const material=new THREE.MeshStandardMaterial({color:palette,side:THREE.DoubleSide,roughness:.8,transparent:true,opacity:.83});
  cape=put(actor,mesh,material,0,1.3,-.36);
  cape.rotation.x=.13;
 }
 const equipmentParts=equipment(actor,build.appearance.weapon,build.klass,armor,glow);
 const circle=put(root,geo('TorusGeometry',.69,.035,5,28),mat(palette,.4,.5),0,.11,0);circle.rotation.x=Math.PI/2;
 root.scale.setScalar(scale);
 return {root,actor,arms,legs,cape,circle,...equipmentParts,baseY:0};
}
function arenaScenery(scene,ground){
 const map=new THREE.Group();scene.add(map);
 const land=put(map,geo('CylinderGeometry',21.3,21.8,1.2,64),MATERIAL.floor,0,-.72,0);
 const ring=put(map,geo('TorusGeometry',18,.20,8,96),MATERIAL.gold,0,.04,0);ring.rotation.x=Math.PI/2;
 for(let r=4;r<=16;r+=4){const torus=put(map,geo('TorusGeometry',r,.022,4,96),MATERIAL.floorEdge,0,.035,0);torus.rotation.x=Math.PI/2}
 // Instancing reduces 250+ separate draw calls to a single GPU draw call.
 const tiles=[];
 for(let x=-18;x<19;x+=2.25)for(let z=-18;z<19;z+=2.25){
  if(Math.hypot(x,z)>19.3)continue;
  tiles.push({x,z,angle:((Math.round(x-z)%4)-2)*.012});
 }
 const tile=geo('BoxGeometry',2.16,.075,2.16);
 const instances=new THREE.InstancedMesh(tile,MATERIAL.floor,tiles.length);
 const dummy=new THREE.Object3D(),shade=new THREE.Color();
 tiles.forEach((v,i)=>{
  dummy.position.set(v.x,-.04-Math.abs(Math.sin(v.x*v.z))*.025,v.z);
  dummy.rotation.set(0,v.angle,0);dummy.updateMatrix();instances.setMatrixAt(i,dummy.matrix);
  shade.setHex(i%3===0?0x19171d:i%5===0?0x29222a:0x25222b);instances.setColorAt(i,shade);
 });
 instances.instanceMatrix.needsUpdate=true;instances.receiveShadow=true;map.add(instances);
 for(const [x,z,r] of [[0,0,1.7],[5.5,-5.5,1.5],[-5.5,5.5,1.5],[5.7,5.7,1.2],[-5.7,-5.7,1.2]]){
  const socle=put(map,geo('CylinderGeometry',r*.81,r,1.05,8),MATERIAL.floorEdge,x,.42,z);
  socle.material=MATERIAL.dark;put(map,geo('CylinderGeometry',r*.3,r*.6,.6,8),MATERIAL.gold,x,1.2,z);
  const rune=put(map,geo('OctahedronGeometry',r*.38,0),MATERIAL.purple,x,1.72,z);
  rune.userData.float=Math.random()*6;
 }
 for(let n=0;n<22;n++){
  const a=n/22*Math.PI*2,r=19+Math.sin(n*97)*.9,x=Math.cos(a)*r,z=Math.sin(a)*r;
  const height=2+Math.abs(Math.sin(n*3.47))*3.4;
  const col=put(map,geo('CylinderGeometry',.32,.55,height,8),MATERIAL.dark,x,height/2-.1,z);
  put(map,geo('CylinderGeometry',.62,.62,.24,8),MATERIAL.floorEdge,x,height-.02,z);
  if(n%3===0){const fire=put(map,geo('ConeGeometry',.22,.7,6),MATERIAL.flame,x,height+.5,z);fire.rotation.z=.12;
   const light=new THREE.PointLight(0xd78b45,1.9,6);light.position.set(x,height+.5,z);scene.add(light)}
 }
 const dustCount=240;
 const pos=new Float32Array(dustCount*3);for(let i=0;i<dustCount;i++){const a=Math.random()*Math.PI*2,r=2+Math.random()*22;pos[i*3]=Math.sin(a)*r;pos[i*3+1]=1+Math.random()*7;pos[i*3+2]=Math.cos(a)*r}
 const dust=new THREE.BufferGeometry();dust.setAttribute('position',new THREE.BufferAttribute(pos,3));
 map.add(new THREE.Points(dust,new THREE.PointsMaterial({color:0xb88a58,size:.085,transparent:true,opacity:.42,sizeAttenuation:true,depthWrite:false})));
 ground.add(map);return {map};
}
// Real CC0 GLB architectural pieces from Tactical Slash (KayKit derivatives).
// Asset provenance: https://github.com/sion-rgb/tactical-slash/blob/main/THIRD_PARTY_ASSETS.md
// Use source-commit-pinned URLs rather than unlicensed third-party game content.
function loadMedievalArchitecture(root,worldScale,quality,container){
 const source='https://raw.githubusercontent.com/sion-rgb/tactical-slash/8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727/assets/environment/';
 const planned=[
  {name:'dungeon_wall.glb',count:quality==='low'?18:36,radius:20.1,height:4.6,rotate:true},
  {name:'dungeon_pillar.glb',count:quality==='low'?12:24,radius:18.5,height:5.7,rotate:false},
  {name:'dungeon_crate.glb',count:quality==='low'?10:18,radius:16.8,height:1.5,rotate:true}
 ];
 container.dataset.v5Environment='loading';
 Promise.allSettled(planned.map(async cfg=>{
  const gltf=await loader.loadAsync(source+cfg.name);
  const raw=gltf.scene;
  const bounds=new THREE.Box3().setFromObject(raw),size=bounds.getSize(new THREE.Vector3());
  const longest=Math.max(size.x,size.y,size.z,.01);
  const group=new THREE.Group();root.add(group);
  for(let n=0;n<cfg.count;n++){
   const angle=n/cfg.count*2*Math.PI+(cfg.name.includes('crate')?.27:0);
   const object=raw.clone(true),scale=cfg.height/longest*worldScale;
   object.scale.setScalar(scale);
   object.position.set(Math.cos(angle)*cfg.radius*worldScale,-bounds.min.y*scale,Math.sin(angle)*cfg.radius*worldScale);
   object.rotation.y=angle+(cfg.rotate?Math.PI/2:0);
   object.traverse(part=>{if(part.isMesh){part.castShadow=quality!=='low';part.receiveShadow=true}});
   group.add(object);
  }
  return cfg.name;
 })).then(results=>{
  const successes=results.filter(x=>x.status==='fulfilled').map(x=>x.value);
  container.dataset.v5Environment=successes.length===planned.length?'loaded':successes.length?'partial':'failed';
  container.dataset.v5EnvironmentAssets=successes.join(',');
 });
}
export function createStage(container,{mode='hero',quality='auto',arenaScale=1,onEvent=()=>{}}={}){
 const worldScale=Math.max(1,Math.min(3,Number(arenaScale)||1));
 if(!container)throw Error('Stage container is required');
 if(!window.WebGL2RenderingContext)throw Error('Este dispositivo não suporta WebGL 2.');
 const renderer=new THREE.WebGLRenderer({antialias:quality!=='low',alpha:false,powerPreference:'high-performance'});
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,quality==='low'?.85:1.18));
 renderer.shadowMap.enabled=quality!=='low';
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=worldScale>1.3?1.65:1.38;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.setClearColor(0x09070f,1);
 container.replaceChildren(renderer.domElement);renderer.domElement.className='v5-webgl';
 const scene=new THREE.Scene();scene.background=new THREE.Color(worldScale>1.3?0x17121c:0x09070f);scene.fog=new THREE.FogExp2(0x17121c,worldScale>1.3?.004:.018);
 const camera=new THREE.PerspectiveCamera(41,1,.15,330);
 camera.position.set(0,17,27);camera.lookAt(0,1,0);
 const controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=7;controls.maxDistance=48*worldScale;controls.maxPolarAngle=Math.PI*.48;controls.minPolarAngle=.25;
 controls.target.set(0,1,0);
 scene.add(new THREE.HemisphereLight(0xb9a7bb,0x574132,worldScale>1.3?3.4:2.2));
 if(worldScale>1.3){
  scene.add(new THREE.AmbientLight(0xbdb2ad,1.45));
  const fill=new THREE.DirectionalLight(0xe4c3a0,1.9);fill.position.set(20,25,-12);scene.add(fill);
  MATERIAL.floor.color.setHex(0x4b3b45);MATERIAL.floorEdge.color.setHex(0x8c6a54);MATERIAL.dark.color.setHex(0x30252c);
 }
 const moon=new THREE.DirectionalLight(0x929dd3,3.4);moon.position.set(-12,26,15);moon.castShadow=quality!=='low';
 moon.shadow.mapSize.set(quality==='low'?512:1024,quality==='low'?512:1024);
 moon.shadow.camera.left=-28*worldScale;moon.shadow.camera.right=28*worldScale;moon.shadow.camera.top=28*worldScale;moon.shadow.camera.bottom=-28*worldScale;
 scene.add(moon);
 const amber=new THREE.PointLight(0xd66c38,42,29);amber.position.set(12,11,-8);scene.add(amber);
 const root=new THREE.Group();scene.add(root);
 const world=worldScale>1.3?buildEclipseCitadel(root,{quality}):arenaScenery(scene,root);
 if(worldScale>1.3){container.dataset.v5Map=world.mapType;loadMedievalArchitecture(root,worldScale,quality,container)}
 else container.dataset.v5Map='original-ring-1';
 const individuals=new Map(),effects=[],labels=new Map();
 let modelLoadedCount=0,modelErrorCount=0;
 let simulation=null,playing=false,speed=1,elapsed=0,previous=0,frame=0,live=true,resizeObserver;
 let accumulator=0;const shots=new Map();let followId=null;
 function clearHeroes(){
  modelLoadedCount=0;modelErrorCount=0;
  delete container.dataset.v5ModelsLoaded;delete container.dataset.v5ModelsFailed;
  delete container.dataset.v5ModelsExpected;
  for(const obj of shots.values()){root.remove(obj);obj.geometry.dispose();obj.material.dispose()}shots.clear();
  for(const x of individuals.values()){
   x.mixer?.stopAllAction();if(x.modelRoot)x.mixer?.uncacheRoot(x.modelRoot);
   x.personalMaterials?.forEach(material=>material.dispose());
   root.remove(x.mesh.root);
   x.mesh.root.traverse(o=>{
    if(o.userData?.v5SharedGLB)return;
    o.geometry?.dispose?.();
    const mats=Array.isArray(o.material)?o.material:[o.material];
    for(const m of mats)if(m&&!Object.values(MATERIAL).includes(m)){m.map?.dispose?.();m.dispose?.()}
   });
   labels.delete(x.id);
  }
  individuals.clear();
 }
 function animateModel(item,motion){
  if(!item.actions||item.lastMotion===motion)return;
  const choices={
   idle:[/idle/,/breath/,/stand/],
   run:[/run/,/walk/,/move/],
   attack:[/attack/,/slash/,/punch/,/sword/,/bow/,/shoot/],
   cast:[/spell/,/cast/,/magic/,/attack/],
   defeated:[/death/,/die/,/dead/,/hit/,/idle/]
  }[motion]||[/idle/];
  let choice;for(const regexp of choices){choice=[...item.actions].find(([name])=>regexp.test(name))?.[1];if(choice)break}
  choice||=item.actions.values().next().value;
  if(!choice)return;
  if(item.lastAction!==choice){item.lastAction?.fadeOut(.2);choice.reset().fadeIn(.2).play();item.lastAction=choice}
  item.lastMotion=motion;
 }
 function addRealCharacter(item){
  const klass=item.build.klass,asset=ASSETS[klass];if(!asset)return;
  if(item.id==='preview'){container.dataset.v5Asset='loading';container.dataset.v5AssetClass=klass}
  loadCharacter(klass).then(gltf=>{
   if(!live||individuals.get(item.id)!==item)return;
   const model=cloneSkinned(gltf.scene);
   const bounds=new THREE.Box3().setFromObject(model),measure=new THREE.Vector3(),center=new THREE.Vector3();
   bounds.getSize(measure);bounds.getCenter(center);
   if(!Number.isFinite(measure.y)||measure.y<.05)throw Error('Modelo sem geometria válida');
   const factor=Math.min(3,2.55/measure.y);
   model.scale.setScalar(factor);
   model.position.set(-center.x*factor,-bounds.min.y*factor,-center.z*factor);
   const tint=new THREE.Color(PALETTES[item.build.appearance.palette]||PALETTES.ember);
   const personalMaterials=[];
   model.traverse(o=>{
    // Cached GLB geometry and textures are shared across clones.
    o.userData.v5SharedGLB=true;
    if(!o.isMesh)return;
    o.castShadow=true;o.receiveShadow=true;
    const custom=source=>{const mat=source.clone();if(mat.color)mat.color.lerp(tint,.10);personalMaterials.push(mat);return mat};
    if(o.material)o.material=Array.isArray(o.material)?o.material.map(custom):custom(o.material);
   });
   // Keep original procedural mesh as offline fallback, but do not overlay it.
   const actor=item.mesh.actor;for(const child of actor.children)child.visible=false;
   actor.visible=true;
   actor.add(model);item.modelRoot=model;item.personalMaterials=personalMaterials;
   if(item.id!=='preview'){modelLoadedCount++;container.dataset.v5ModelsLoaded=String(modelLoadedCount)}
   if(gltf.animations?.length){
    item.mixer=new THREE.AnimationMixer(model);item.actions=new Map();
    for(const clip of gltf.animations)item.actions.set(clip.name.toLowerCase(),item.mixer.clipAction(clip));
    animateModel(item,'idle');
   }
   if(item.id==='preview'){container.dataset.v5Asset='loaded';container.dataset.v5AnimationCount=String(gltf.animations?.length||0)}
  }).catch(err=>{
   if(item.id==='preview'&&individuals.get(item.id)===item){
    container.dataset.v5Asset='fallback';container.dataset.v5AssetError=String(err.message||err).slice(0,140);
   }
   if(item.id!=='preview'&&individuals.get(item.id)===item){modelErrorCount++;container.dataset.v5ModelsFailed=String(modelErrorCount)}
   console.warn('[V5] GLB indisponível, preservado herói procedural:',klass,err.message||err);
  });
 }
 function addHero(raw,id,position={x:0,z:0},scale=1){
  const b=CORE.canonical(raw,raw.name||'Aventureiro',raw.xp||0);
  const m=heroMesh(b,scale);m.root.position.set(position.x,0,position.z);root.add(m.root);
  m.actor.visible=false; // Never expose a procedural placeholder as a real CC0 character
  const label=caption(b.name,b.name.length>18?43:56);
  label.position.set(0,3.35,0);m.root.add(label);
  const bar=new THREE.Group();bar.position.y=3.08;m.root.add(bar);
  const background=put(bar,geo('PlaneGeometry',1.37,.14),new THREE.MeshBasicMaterial({color:0x170f19,depthTest:false}),0,0,0);
  const fill=put(bar,geo('PlaneGeometry',1.30,.095),new THREE.MeshBasicMaterial({color:0xd8a773,depthTest:false}),0,0,.02);
  const item={id:String(id),name:b.name,build:b,mesh:m,label,bar,fill,hp:100,dead:false};
  individuals.set(item.id,item);
  addRealCharacter(item);
  return item;
 }
 function preview(b){
  simulation=null;playing=false;clearHeroes();
  delete container.dataset.v5AssetError;
  const item=addHero(b,'preview',{x:0,z:0},1.75);item.bar.visible=false;
  camera.position.set(7.5,5.5,10);controls.target.set(0,1.4,0);controls.update();
  return item;
 }
 function fighters(list,{seed=48211,limit=70}={}){
  clearHeroes();const normalized=list.map((entry,i)=>({
   ...CORE.canonical(entry.build||entry,entry.name||entry.build?.name||'Aventureiro',entry.progress?.total??entry.xp??0),
   id:String(entry.id||i),name:entry.name||entry.build?.name||'Aventureiro'}));
  simulation=CORE.battle(normalized,{seed,limit,arenaScale:worldScale});
  container.dataset.v5ModelsExpected=String(simulation.fighters.length);
  container.dataset.v5ModelsLoaded='0';container.dataset.v5ModelsFailed='0';
  for(const f of simulation.fighters)addHero(f.build,f.id,{x:f.x,z:f.z});
  camera.position.set(0,worldScale>1.3?76:26,worldScale>1.3?112:37);controls.target.set(0,.2,0);controls.update();
  elapsed=0;accumulator=0;playing=false;
  return {count:simulation.fighters.length,seed};
 }
 function resume(){if(simulation&&!simulation.finished){playing=true;physicsLast=performance.now();simulateStep(.20)}}
 function pause(){playing=false}
 function setSpeed(n){speed=Math.max(.5,Math.min(3,Number(n)||1))}
 function burst(x,z,color=0xf4bb7e,count=10){
  if(effects.length>140)return;
  for(let i=0;i<count;i++){
   const part=put(root,geo('OctahedronGeometry',.058+Math.random()*.06,0),new THREE.MeshBasicMaterial({color}),x,1.1+Math.random(),z);
   part.userData.velocity=new THREE.Vector3((Math.random()-.5)*4,Math.random()*3.5,(Math.random()-.5)*4);
   effects.push({mesh:part,life:.5+Math.random()*.3});
  }
 }
 function sync(f){
  const unit=individuals.get(f.id);if(!unit)return;
  unit.hp=f.hp;unit.dead=!f.alive;
  const health=Math.max(.001,f.hp/f.stats.hp);
  unit.fill.scale.x=health;unit.fill.position.x=-.65*(1-health);
  unit.fill.material.color.setHex(health>.55?0xd0a86e:health>.24?0xd08e52:0xbf5051);
  unit.mesh.root.position.set(f.x,Math.max(0,f.y||0),f.z);
  unit.mesh.actor.rotation.y=f.face;
  animateModel(unit,f.alive?(f.animation||'idle'):'defeated');
  if(!f.alive){unit.mesh.actor.rotation.z=THREE.MathUtils.lerp(unit.mesh.actor.rotation.z,-1.2,.07);unit.mesh.circle.visible=false}
 }
 function overview(){
  followId=null;camera.position.set(0,worldScale>1.3?76:26,worldScale>1.3?112:37);controls.target.set(0,.2,0);controls.update();
 }
 function focusFighter(id){
  const f=simulation?.fighters.find(x=>String(x.id)===String(id));if(!f)return false;
  followId=String(id);camera.position.set(f.x+9,11,f.z+14);controls.target.set(f.x,1.4,f.z);controls.update();return true;
 }
 function resize(){
  if(!live)return;
  const w=Math.max(10,container.clientWidth),h=Math.max(10,container.clientHeight);
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
 }
 resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);resize();
 const now=()=>performance.now();
 function simulateStep(seconds){
  if(!live||!playing||!simulation)return;
  accumulator+=Math.min(1,Math.max(0,seconds))*speed;
  for(let n=0;n<20&&accumulator>=.05;n++){
   accumulator-=.05;
   const result=simulation.update(.05);
   for(const ev of result.events){
    if(ev.type==='hit'||ev.type==='special'){
     const unit=individuals.get(ev.target||ev.hero);
     if(unit)burst(unit.mesh.root.position.x,unit.mesh.root.position.z,ev.type==='special'?0xb98ef1:0xf4ae7e,ev.type==='special'?17:5);
    }
    onEvent(ev);
   }
   for(const f of simulation.fighters)sync(f);
   if(result.finished){playing=false;break}
  }
 }
 let physicsLast=performance.now();
 const physicsTimer=setInterval(()=>{
  const now=performance.now(),span=Math.max(0,(now-physicsLast)/1000);
  physicsLast=now;
  if(playing)simulateStep(span);
 },50);
 function loop(t){
  if(!live)return;
  const rawDt=Math.max(0,(t-previous)/1000||0);
  const dt=Math.min(.06,rawDt);
  previous=t;
  frame++;elapsed+=dt;
  if(simulation){
    const active=new Set();
    for(let i=0;i<simulation.projectiles.length;i++){
      const p=simulation.projectiles[i],k=p.from+':'+p.to+':'+i;active.add(k);
      let mesh=shots.get(k);
      if(!mesh){mesh=put(root,geo('OctahedronGeometry',.16,0),new THREE.MeshBasicMaterial({color:p.kind==='multishot'?0x9ed6ab:0xdbacfa}),p.x,1.4,p.z);shots.set(k,mesh)}
      mesh.position.set(p.x,p.y+.14*Math.sin(p.age*9),p.z);mesh.rotation.y+=dt*4;
    }
    for(const [key,m] of shots)if(!active.has(key)){root.remove(m);m.geometry.dispose();m.material.dispose();shots.delete(key)}
  }
  for(const [id,u] of individuals){
   u.bar.quaternion.copy(camera.quaternion);
   if(u.mixer&&!reduce)u.mixer.update(dt);
   const a=u.mesh.actor,active=!u.dead;
   if(!active)continue;
   const wobble=reduce?0:Math.sin(elapsed*2.7+id.length)*.055;
   a.position.y=wobble;
   if(!reduce){u.mesh.arms.forEach((arm,i)=>{arm.rotation.x=Math.sin(elapsed*3+i*Math.PI)*.18});
     u.mesh.legs.forEach((leg,i)=>{leg.rotation.x=Math.sin(elapsed*3+i*Math.PI)*.21});
     if(u.mesh.cape)u.mesh.cape.rotation.x=.14+Math.sin(elapsed*3)*.06;
   }
   u.mesh.circle.material.emissive=new THREE.Color(PALETTES[u.build.appearance.palette]||0xc58865);
   u.mesh.circle.material.emissiveIntensity=.25+Math.sin(elapsed*2)*.1;
  }
  for(let i=effects.length-1;i>=0;i--){
   const e=effects[i];e.life-=dt;e.mesh.position.addScaledVector(e.mesh.userData.velocity,dt);
   e.mesh.userData.velocity.y-=dt*7;
   e.mesh.scale.setScalar(Math.max(.01,e.life));
   if(e.life<=0){root.remove(e.mesh);e.mesh.geometry.dispose();e.mesh.material.dispose();effects.splice(i,1)}
  }
  if(followId&&simulation){const f=simulation.fighters.find(x=>x.id===followId&&x.alive);if(f){
    const target=new THREE.Vector3(f.x,1.4,f.z);const delta=target.sub(controls.target).multiplyScalar(Math.min(1,dt*3));
    controls.target.add(delta);camera.position.add(delta);
   }}
  controls.update();renderer.render(scene,camera);
 }
 renderer.setAnimationLoop(loop);
 const onVisibility=()=>{if(document.hidden)pause()};
 document.addEventListener('visibilitychange',onVisibility);
 const dispose=()=>{
  if(!live)return;live=false;pause();clearInterval(physicsTimer);renderer.setAnimationLoop(null);resizeObserver.disconnect();
  document.removeEventListener('visibilitychange',onVisibility);controls.dispose();
  clearHeroes();
  scene.traverse(o=>{if(o.geometry)o.geometry.dispose?.()});
  // Shared palette materials remain reusable if a stage is reopened.
  renderer.dispose();renderer.domElement.remove();
 };
 return {preview,fighters,resume,pause,setSpeed,dispose,resize,focusFighter,overview,get simulation(){return simulation},get playing(){return playing},get core(){return CORE},camera,scene};
}

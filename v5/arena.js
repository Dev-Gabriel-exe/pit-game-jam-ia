/* V5 · Arena dos Criadores: Three.js 3D auto-battler preview.
   All characters/meshes/music synthesized in browser. No paid API or remote game server.
   Official XP only from classroom authenticated approved missions. No score writes. */
const R=window.PIT_V5_RULES;
const $=id=>document.getElementById(id);
const safeJSON=(s,fb)=>{try{return JSON.parse(s)}catch{return fb}};
const SESSION=safeJSON(localStorage.getItem('pit_chat_student_v09'),null);
const AUTH_NAME=R.clean(SESSION?.name||'');
const STORAGE='pit_v5_hero_'+(SESSION?.studentId||'preview');
const saved=safeJSON(localStorage.getItem(STORAGE),{})||{};
const API='https://pit-game-jam-chat.vercel.app/api/classroom?action=';
const tones=[0xd99d70,0x9f88d6,0x70b894,0x719fc9,0xd46f70,0xcbd0db];
let officialXp=0,shownXp=0,demoXp=0,view=null,THREE=null,world=null,roster=[],allowSound=false,audio=null,heroMeshes=new Map(),effects=[],sceneFrame=null,previewName=AUTH_NAME||'Aventureiro',running=false,rotate=0,tilt=.63,zoom=28;
let player=R.normalize({...saved,name:previewName},0);
const Sfx={
 enable(){if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(AC)audio=new AC()} audio?.resume?.()},
 play(hz=220,duration=.09,type='triangle',gain=.08){
  if(!allowSound||!audio)return;
  const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;
  o.type=type;o.frequency.setValueAtTime(hz,now);o.frequency.exponentialRampToValueAtTime(Math.max(55,hz*.55),now+duration);
  g.gain.setValueAtTime(gain,now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);
  o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+duration+.01);
 }
};
function write(msg){const box=$('battleLog');const p=document.createElement('p');p.textContent=msg;box.prepend(p);while(box.children.length>10)box.lastElementChild.remove();}
function save(){localStorage.setItem(STORAGE,JSON.stringify({...player,name:previewName}))}
const budget=()=>R.budget(shownXp);
function recount(){
 player=R.normalize(player,shownXp);
 const b=budget(),spent=Object.values(player.attrs).reduce((a,v)=>a+v,0),chosen=Object.values(player.talents).reduce((a,v)=>a+v,0);
 $('heroName').value=previewName;$('heroLevel').textContent='NÍVEL '+String(b.level).padStart(2,'0');
 $('xpText').textContent=shownXp+' / 1.000 XP';$('xpFill').style.width=(shownXp/10)+'%';
 $('xpHint').textContent=demoXp?'XP DEMONSTRATIVO: '+demoXp+' extra. Este bônus não é oficial.':'XP real vem apenas das missões aprovadas pelo professor.';
 $('attrRemaining').textContent=(b.points-spent)+' ponto(s) livres';
 $('talentRemaining').textContent=(b.talents-chosen)+' talento(s) livres';
 document.querySelectorAll('[data-class]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.class===player.classId)));
 $('appearanceTone').value=player.appearance.tone;$('appearanceHead').value=player.appearance.head;$('appearanceCrest').value=player.appearance.crest;
 const attrs={forca:['Força','Dano dos golpes'],agilidade:['Agilidade','Movimento e crítico'],vitalidade:['Vitalidade','Vida e defesa'],arcano:['Arcano','Poder da habilidade']};
 $('attributes').replaceChildren();
 for(const key of R.ATTRS){
  const val=player.attrs[key],line=document.createElement('div');line.className='attribute';
  const label=document.createElement('div');const name=document.createElement('strong');name.textContent=attrs[key][0];const hint=document.createElement('small');hint.textContent=attrs[key][1];label.append(name,document.createElement('br'),hint);
  const controls=document.createElement('div');controls.className='statbuttons';
  const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.disabled=val<=0;minus.setAttribute('aria-label','Diminuir '+attrs[key][0]);
  const n=document.createElement('span');n.className='value';n.textContent=val;
  const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.disabled=spent>=b.points||val>=8;plus.setAttribute('aria-label','Aumentar '+attrs[key][0]);
  minus.addEventListener('click',()=>changeAttr(key,-1));plus.addEventListener('click',()=>changeAttr(key,1));
  controls.append(minus,n,plus);line.append(label,controls);$('attributes').append(line);
 }
 $('talents').replaceChildren();
 for(const [id,t] of Object.entries(R.TALENTS)){
  const count=player.talents[id]||0,card=document.createElement('div');card.className='talent';
  const title=document.createElement('strong');title.textContent=t.label;const desc=document.createElement('small');desc.textContent=t.desc;
  const footer=document.createElement('footer');const progress=document.createElement('span');progress.textContent=count+' / '+t.max;
  const ctrl=document.createElement('div');ctrl.className='statbuttons';
  const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.disabled=count>=t.max||chosen>=b.talents;
  const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.disabled=count<=0;
  plus.setAttribute('aria-label','Melhorar '+t.label);minus.setAttribute('aria-label','Reverter '+t.label);
  plus.addEventListener('click',()=>changeTalent(id,1));minus.addEventListener('click',()=>changeTalent(id,-1));
  ctrl.append(minus,plus);footer.append(progress,ctrl);card.append(title,desc,footer);$('talents').append(card);
 }
 const s=R.stats(player,shownXp);
 $('combatStats').replaceChildren();
 for(const [name,value] of [['VIDA',s.hp],['ATAQUE',s.attack],['DEFESA',Math.round(s.defense)],['VELOCIDADE',s.speed.toFixed(1)]]){
  const d=document.createElement('div'),n=document.createElement('b'),label=document.createElement('span');n.textContent=value;label.textContent=name;d.append(n,label);$('combatStats').append(d);
 }
 save(); if(!running)showHero();
}
function changeAttr(key,delta){player.attrs[key]=Math.max(0,(player.attrs[key]||0)+delta);recount();Sfx.play(400,.09)}
function changeTalent(key,delta){player.talents[key]=Math.max(0,(player.talents[key]||0)+delta);recount();Sfx.play(535,.11)}
function myProfile(){return {id:SESSION?.studentId||'hero',name:previewName,xp:shownXp,build:{...player,name:previewName}}}
document.querySelectorAll('[data-class]').forEach(btn=>btn.addEventListener('click',()=>{player.classId=btn.dataset.class;recount();Sfx.play(310,.18)}));
for(const [id,key] of [['appearanceTone','tone'],['appearanceHead','head'],['appearanceCrest','crest']]) $(id).addEventListener('change',e=>{player.appearance[key]=Number(e.target.value);recount()});
$('demoLevel').addEventListener('click',()=>{demoXp=Math.min(1000-officialXp,demoXp+200);shownXp=Math.min(1000,officialXp+demoXp);recount();write('✦ Nível demonstrativo aumentado. Nenhum XP foi atribuído à turma.');Sfx.play(660,.3)});
$('demoReset').addEventListener('click',()=>{demoXp=0;shownXp=officialXp;recount();write('Pontuação demonstrativa zerada.')});
$('audioToggle').addEventListener('click',()=>{allowSound=!allowSound;if(allowSound)Sfx.enable();$('audioToggle').setAttribute('aria-pressed',String(allowSound));$('audioToggle').textContent=allowSound?'🔊 Som ligado':'🔇 Som desligado'});
async function fetchOfficial(){
 if(!SESSION?.token){$('identityHint').textContent='Prévia sem cadastro: personagem fictício. Cadastre-se no Caderno do Aluno para vincular o nome e o XP real.';return}
 try{
  const resp=await fetch(API+'state',{headers:{'X-PIT-Student-Token':SESSION.token},cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!resp.ok)throw Error('Sessão da turma indisponível');
  const data=await resp.json();
  const approved=(data.progress||[]).filter(s=>s.status==='approved').length;
  officialXp=R.xpFor(approved);shownXp=Math.min(1000,officialXp+demoXp);
  previewName=R.clean(data.student?.name||SESSION.name);
  $('identityHint').textContent=approved+' missão(ões) aprovadas pelo professor · personagem com nome do cadastro.';
  recount();
 }catch(e){$('identityHint').textContent='Cadastro encontrado, mas sem confirmação do servidor. XP real não disponível; só demonstração.';write('Atenção: '+e.message)}
}
function fakeRoster(n=12){
 const names=['Arel das Ruínas','Nix da Lua','Thora','Kael Rubro','Lira da Névoa','Eryndor','Astra','Lohra','Fenrir','Eloen','Rook','Nyra','Aron','Zaya','Kora','Arwyn'];
 const classes=Object.keys(R.CLASSES);
 return names.slice(0,n).map((name,i)=>{
  const xp=Math.min(1000,200+Math.floor((i*191)%800/100)*100),b=R.budget(xp),attrs={forca:0,agilidade:0,vitalidade:0,arcano:0},a=R.ATTRS;
  let rem=b.points;
  for(let j=0;j<4;j++){const v=Math.min(8,Math.floor((i+j*3)%5)+1,rem);attrs[a[(j+i)%4]]=v;rem-=v}
  const talents=Object.fromEntries(Object.keys(R.TALENTS).map(k=>[k,0]));
  const ks=Object.keys(R.TALENTS);for(let j=0;j<b.talents;j++)talents[ks[(j+i)%ks.length]]++;
  return {id:'demo-'+i,name,xp,build:{classId:classes[i%4],attrs,talents,appearance:{tone:i%6,head:i%3,crest:(i+1)%3}}};
 })
}
$('loadClass').addEventListener('click',async()=>{
 const pin=sessionStorage.getItem('pit_teacher_pin')||prompt('PIN privado do professor (somente para consultar a turma):');
 if(!pin){write('Importação cancelada.');return}
 $('loadClass').disabled=true;
 try{
  const resp=await fetch(API+'roster',{headers:{'X-PIT-Teacher-Pin':pin},signal:AbortSignal.timeout(15000),cache:'no-store'});
  const data=await resp.json();if(!resp.ok||!data.ok)throw Error(data.error||'Turma indisponível');
  const active=(data.roster||[]).filter(x=>(x.approved||0)>0).slice(0,24);
  if(active.length<2)throw Error('São necessários ao menos dois alunos com missão aprovada.');
  roster=active.map((s,i)=>{
   const xp=R.xpFor(s.approved),classKeys=Object.keys(R.CLASSES);
   // Passive prototype: other students' private local builds are NOT visible to teacher.
   // Allocate a transparent neutral default until V5 profile persistence is added to backend.
   const classId=classKeys[i%4],b=R.budget(xp),attrs={forca:0,agilidade:0,vitalidade:0,arcano:0};
   let remaining=b.points;for(const key of R.ATTRS){attrs[key]=Math.min(2,remaining);remaining-=attrs[key]}
   return {id:s.id,name:R.clean(s.display_name),xp,build:{classId,attrs,talents:{},appearance:{tone:i%6,head:i%3,crest:i%3}}};
  });
  $('startClass').disabled=false;
  $('matchHint').textContent=roster.length+' alunos autenticados carregados. Builds neutras provisórias: escolhas individuais ainda não são compartilhadas com o servidor.';
  write('Elenco autorizado carregado: '+roster.length+' alunos. Nenhum dado foi modificado.');
 }catch(e){write('Falha ao carregar turma: '+e.message)}finally{$('loadClass').disabled=false}
});
$('previewHero').addEventListener('click',showHero);
$('startDuel').addEventListener('click',()=>start([myProfile(),...fakeRoster(1)],'Duelo de treinamento'));
$('startDemo').addEventListener('click',()=>start([myProfile(),...fakeRoster(11)],'Battle Royale demonstrativo'));
$('startClass').addEventListener('click',()=>{if(roster.length>1)start(roster,'Arena da turma · builds neutras provisórias')});
function scoreboard(){
 $('scoreboard').replaceChildren();
 const fighters=world?world.fighters.slice().sort((a,b)=>Number(b.alive)-Number(a.alive)||b.kills-a.kills||b.hp-a.hp):[];
 for(const f of fighters){
  const d=document.createElement('div');d.className='score'+(f.alive?'':' dead');
  const label=document.createElement('b');label.textContent=f.name;
  const info=document.createElement('small');info.textContent='⚔ '+f.kills+' · '+Math.round(f.hp)+' HP';
  const bar=document.createElement('div');bar.className='hpbar';const fill=document.createElement('div');fill.style.width=Math.round(f.hp/f.maxHp*100)+'%';bar.append(fill);
  d.append(label,bar,info);$('scoreboard').append(d);
 }
 $('aliveCount').textContent=(world?world.fighters.filter(x=>x.alive).length:1)+' HERÓI(S)';
 $('arenaClock').textContent=world?String(Math.floor(world.elapsed/60)).padStart(2,'0')+':'+String(Math.floor(world.elapsed%60)).padStart(2,'0'):'00:00';
}
function start(list,label){
 if(!R)return;
 const profiles=list.slice(0,24),uniq=new Set();
 for(const p of profiles){while(uniq.has(p.id))p.id=p.id+'-2';uniq.add(p.id)}
 world=R.begin(profiles,8182);running=true;stopSceneMeshes();
 for(const f of world.fighters)spawn(f);
 $('battleStatus').textContent='BATALHA EM ANDAMENTO';$('matchHint').textContent=label+' · combate automático, sem alterar XP nem notas.';
 $('leaderName').textContent='Sobreviva ao confronto';
 write('⚔ '+label+' iniciada com '+world.fighters.length+' heróis.');Sfx.play(180,.35,'sawtooth',.055);
 scoreboard();
}
function showHero(){
 if(!view||!THREE)return;
 running=false;world=null;stopSceneMeshes();
 spawn({...R.fighterPreview??{},id:'hero',name:previewName,build:player,x:0,z:0,hp:100,maxHp:100,alive:true,kills:0,walk:0,flash:0,attackPhase:0,angle:0});
 $('battleStatus').textContent='PERSONAGEM EM EXIBIÇÃO';$('leaderName').textContent=previewName;
 $('matchHint').textContent='Seu herói em 3D; arraste o mapa para mudar o ângulo da câmera.';
 $('scoreboard').replaceChildren();$('aliveCount').textContent='1 HERÓI';$('arenaClock').textContent='00:00';
}
function fallback(message){
 $('canvasFallback').hidden=false;
 $('canvasFallback').querySelector('p').textContent=message;
 $('arenaCanvas').hidden=true;write(message);
}
function stopSceneMeshes(){
 for(const entry of heroMeshes.values()){
  entry.root.parent?.remove(entry.root);entry.root.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){if(Array.isArray(x.material))x.material.forEach(m=>m.dispose());else x.material.dispose()}})
 }
 heroMeshes.clear();
 for(const e of effects){e.mesh.parent?.remove(e.mesh);e.mesh.geometry?.dispose();e.mesh.material?.dispose()}effects=[];
}
function mesh(geometry,material,x=0,y=0,z=0){
 const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;return object
}
function createHeroVisual(build){
 const color=tones[build.appearance.tone],bodyColor=new THREE.Color(color),metal=new THREE.MeshStandardMaterial({color:0x463744,metalness:.7,roughness:.38}),cloth=new THREE.MeshStandardMaterial({color:bodyColor,metalness:.3,roughness:.68}),
 gold=new THREE.MeshStandardMaterial({color:0xdbad73,metalness:.72,roughness:.32}),skin=new THREE.MeshStandardMaterial({color:0xd5a781,roughness:.9}),glow=new THREE.MeshStandardMaterial({color:bodyColor,emissive:bodyColor,emissiveIntensity:1.2,roughness:.3});
 const root=new THREE.Group();root.userData.body=new THREE.Group();const bod=root.userData.body;root.add(bod);
 const trunk=mesh(new THREE.CylinderGeometry(.37,.51,1.06,8),cloth,0,1.15,0);bod.add(trunk);
 bod.add(mesh(new THREE.CylinderGeometry(.22,.25,.22,8),gold,0,1.68,0));
 const head=mesh(new THREE.SphereGeometry(.37,12,9),skin,0,1.93,0);bod.add(head);
 const helmet=mesh(build.appearance.head===2?new THREE.ConeGeometry(.43,.52,7):build.appearance.head===1?new THREE.CylinderGeometry(.38,.42,.32,8):new THREE.ConeGeometry(.46,.45,8),metal,0,2.29,0);bod.add(helmet);
 if(build.appearance.head===2){const crown=mesh(new THREE.TorusGeometry(.34,.07,6,10),gold,0,2.24,0);crown.rotation.x=Math.PI/2;bod.add(crown)}
 const eyes=new THREE.MeshBasicMaterial({color:0x91f5f0});
 for(const x of [-.14,.14])bod.add(mesh(new THREE.SphereGeometry(.045,6,6),eyes,x,1.99,.33));
 const cape=mesh(new THREE.ConeGeometry(.55,1.35,7,1,true),new THREE.MeshStandardMaterial({color:0x221e30,side:THREE.DoubleSide,roughness:.8}),0,1.04,-.26);cape.rotation.x=.21;bod.add(cape);
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.45,1.54,0);arm.add(mesh(new THREE.CylinderGeometry(.16,.19,.72,8),cloth,side*.06,-.35,0));bod.add(arm);arms.push(arm);
  const leg=new THREE.Group();leg.position.set(side*.19,.75,0);leg.add(mesh(new THREE.CylinderGeometry(.19,.22,.7,8),metal,0,-.35,0));bod.add(leg);legs.push(leg);
  bod.add(mesh(new THREE.IcosahedronGeometry(.19,0),gold,side*.5,1.58,0));
 }
 const weapon=new THREE.Group();weapon.position.set(.7,1.16,.1);bod.add(weapon);
 if(build.classId==='warrior'||build.classId==='guardian'){
  weapon.add(mesh(new THREE.CylinderGeometry(.055,.07,1.4,7),metal,0,.38,0));
  weapon.add(mesh(new THREE.ConeGeometry(build.classId==='guardian'?.2:.13,.65,5),gold,0,1.22,0));
  if(build.classId==='guardian'){const shield=mesh(new THREE.CylinderGeometry(.53,.48,.11,7),gold,-1,.10,.25);shield.rotation.x=Math.PI/2;weapon.add(shield)}
 }else if(build.classId==='arcanist'){
  weapon.add(mesh(new THREE.CylinderGeometry(.06,.08,1.65,8),gold,0,.4,0));weapon.add(mesh(new THREE.IcosahedronGeometry(.28,0),glow,0,1.33,0));
 }else{
  const bow=mesh(new THREE.TorusGeometry(.48,.065,6,14,Math.PI),gold,0,.25,.05);bow.rotation.z=Math.PI/2;weapon.add(bow);
  weapon.add(mesh(new THREE.CylinderGeometry(.024,.024,.96),metal,0,.25,.05));
 }
 const insignia=mesh(build.appearance.crest===2?new THREE.OctahedronGeometry(.17):build.appearance.crest===1?new THREE.TorusGeometry(.16,.045,5,8):new THREE.IcosahedronGeometry(.16),glow,0,1.34,.48);bod.add(insignia);
 const ring=mesh(new THREE.TorusGeometry(.75,.045,4,32),glow,0,.06,0);ring.rotation.x=Math.PI/2;root.add(ring);
 root.userData.parts={arms,legs,weapon,body:bod,ring};
 return root;
}
function spawn(hero){
 if(!THREE||!view)return;
 const root=createHeroVisual(hero.build);
 root.position.set(hero.x||0,0,hero.z||0);view.scene.add(root);heroMeshes.set(hero.id,{root,parts:root.userData.parts});
}
function effect(x,z,color=0xeab16c,scale=.3){
 if(!THREE||!view||effects.length>140)return;
 const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95}),m=mesh(new THREE.IcosahedronGeometry(scale,0),mat,x,1.05,z);view.scene.add(m);
 effects.push({mesh:m,age:0,max:.55,scale});
}
function renderUnits(t){
 if(!view)return;
 for(const [id,entry] of heroMeshes){
  const unit=world?.fighters.find(f=>f.id===id);
  const root=entry.root,parts=entry.parts;
  if(unit){
   root.visible=unit.alive;root.position.set(unit.x,unit.alive?0:-2,unit.z);
   root.rotation.y=unit.angle;
   parts.body.position.y=Math.sin(unit.walk*1.7)*.08;
   const motion=Math.sin(unit.walk)*.35;parts.legs[0].rotation.x=motion;parts.legs[1].rotation.x=-motion;
   parts.arms[0].rotation.x=-motion*.65;parts.arms[1].rotation.x=motion*.65-unit.attackPhase*.8;
   parts.weapon.rotation.z=unit.attackPhase*-.8;
   parts.ring.material.emissiveIntensity=unit.flash>0?3:1.2;
  }else{
   root.rotation.y=t*.22;
   parts.body.position.y=Math.sin(t*1.8)*.09;parts.weapon.rotation.z=Math.sin(t*2)*.07;
   parts.legs.forEach(l=>l.rotation.x=0);
  }
 }
 for(let i=effects.length-1;i>=0;i--){
  const e=effects[i];e.age+=.018;e.mesh.position.y+=.026;e.mesh.rotation.y+=.12;e.mesh.scale.setScalar(1+e.age*2.2);
  e.mesh.material.opacity=Math.max(0,1-e.age/e.max);
  if(e.age>=e.max){e.mesh.parent?.remove(e.mesh);e.mesh.geometry.dispose();e.mesh.material.dispose();effects.splice(i,1)}
 }
}
function animate(t){
 if(!view||!THREE)return;
 const now=t/1000,dt=Math.min(.05,now-(view.last||now));view.last=now;
 if(running&&world){
  for(let i=0;i<3;i++){
   if(!world.over)R.step(world,Math.min(.05,dt*.55));
   for(const ev of world.events){
    if(ev.type==='hit'){effect(ev.x,ev.z,ev.kind==='arcane'?0xa18bf2:0xe9ab66,.14);if(Math.random()<.17)Sfx.play(195,.08,'sawtooth',.027)}
    if(ev.type==='special'){effect(ev.x,ev.z,ev.kind==='arcane'?0x9377e6:0xe7bc77,.65);Sfx.play(365,.22)}
    if(ev.type==='elimination'){write('☠ '+ev.name+' foi eliminado.');Sfx.play(110,.24)}
   }
  }
  if(world.over){running=false;const winner=world.winner;
   $('battleStatus').textContent='🏆 CAMPEÃO DA ARENA';$('leaderName').textContent=winner?.name||'Batalha encerrada';
   write('🏆 CAMPEÃO: '+(winner?.name||'Sem vencedor')+' — '+(winner?.kills||0)+' eliminações. Resultado recreativo; nenhum XP ou nota alterado.');
   Sfx.play(620,.45,'triangle',.1);
  }
  if(Math.floor(now*2)!==Math.floor((now-dt)*2))scoreboard();
 }
 renderUnits(now);
 // Cinematic orbit is small, bounded and completely local.
 const yaw=rotate+Math.sin(now*.11)*.045;
 const orbit=zoom,cy=9+tilt*12;
 view.camera.position.set(Math.sin(yaw)*orbit,cy,Math.cos(yaw)*orbit);
 view.camera.lookAt(0,1.2,0);
 const size=view.host.getBoundingClientRect();
 if(Math.abs(size.width-view.width)>2||Math.abs(size.height-view.height)>2){
  view.width=size.width;view.height=size.height;view.camera.aspect=size.width/Math.max(1,size.height);view.camera.updateProjectionMatrix();
  view.renderer.setSize(size.width,size.height,false);
 }
 view.renderer.render(view.scene,view.camera);
 sceneFrame=requestAnimationFrame(animate);
}
async function initThree(){
 if(!R){fallback('Regras de jogo indisponíveis.');return}
 try{
  const mod=await import('https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js');THREE=mod;
  const canvas=$('arenaCanvas'),renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  const small=window.matchMedia('(max-width:600px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,small?1.35:1.7));renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x100e17);scene.fog=new THREE.FogExp2(0x18101f,.023);
  const camera=new THREE.PerspectiveCamera(48,1,.1,130);
  scene.add(new THREE.HemisphereLight(0x9fa0cb,0x362219,2.0));
  const main=new THREE.DirectionalLight(0xf9ca89,3.1);main.position.set(7,18,10);main.castShadow=true;
  main.shadow.mapSize.set(small?512:1024,small?512:1024);main.shadow.camera.left=-21;main.shadow.camera.right=21;main.shadow.camera.top=21;main.shadow.camera.bottom=-21;scene.add(main);
  const blue=new THREE.PointLight(0x806bbd,110,30);blue.position.set(-10,5,-6);scene.add(blue);
  const ground=new THREE.Mesh(new THREE.CylinderGeometry(13.6,14.1,.9,64,1),new THREE.MeshStandardMaterial({color:0x30282c,roughness:.96,metalness:.13}));ground.position.y=-.48;ground.receiveShadow=true;scene.add(ground);
  const rings=[11.5,8.5,4.5];for(const rad of rings){const band=mesh(new THREE.TorusGeometry(rad,.12,5,110),new THREE.MeshStandardMaterial({color:0xa0754a,metalness:.58,roughness:.45}),0,.04,0);band.rotation.x=Math.PI/2;scene.add(band)}
  for(let i=0;i<13;i++){
   const a=i/13*Math.PI*2,rad=12.9;
   const tile=mesh(new THREE.BoxGeometry(3.1,.035,.16),new THREE.MeshStandardMaterial({color:0x775b46}),Math.cos(a)*rad,.04,Math.sin(a)*rad);
   tile.rotation.y=-a;scene.add(tile);
  }
  const broken=new THREE.MeshStandardMaterial({color:0x494047,roughness:1});
  for(let i=0;i<12;i++){
   const a=i/12*Math.PI*2,r=15.5,height=2.4+(i%3)*.7;
   const p=mesh(new THREE.CylinderGeometry(.65,.85,height,8),broken,Math.sin(a)*r,height/2-.4,Math.cos(a)*r);
   p.rotation.z=((i%3)-1)*.065;p.receiveShadow=true;scene.add(p);
   const cap=mesh(new THREE.BoxGeometry(1.9,.32,1.9),broken,p.position.x,height-.18,p.position.z);scene.add(cap);
   if(i%3===0){
    const fire=mesh(new THREE.ConeGeometry(.28,.75,7),new THREE.MeshBasicMaterial({color:0xf7a95c}),p.position.x,height+.38,p.position.z);
    scene.add(fire);const light=new THREE.PointLight(0xf59b55,23,9);light.position.set(p.position.x,height+.4,p.position.z);scene.add(light);
   }
  }
  const center=mesh(new THREE.OctahedronGeometry(1.9,0),new THREE.MeshStandardMaterial({color:0x77506d,emissive:0x42264e,emissiveIntensity:.3,metalness:.6,roughness:.35}),0,-1.4,0);center.scale.y=.35;scene.add(center);
  const host=$('viewport');view={host,scene,camera,renderer,last:0,width:0,height:0};
  let dragging=false,lastX=0,lastY=0;
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;rotate+=(e.clientX-lastX)*.007;tilt=Math.max(.1,Math.min(1.15,tilt+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY});
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(19,Math.min(43,zoom+Math.sign(e.deltaY)*2))},{passive:false});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(sceneFrame);renderer.dispose();stopSceneMeshes()});
  showHero();sceneFrame=requestAnimationFrame(animate);
  write('Cena Three.js carregada. Escolha sua classe e personalize os atributos.');
 }catch(e){console.warn('Arena 3D não foi carregada:',e);fallback('Three.js/WebGL indisponível ou conexão bloqueada. O editor de atributos continua utilizável.')}
}
(function init(){
 if(!R){$('identityHint').textContent='Regras indisponíveis.';return}
 previewName=SESSION?.name?R.clean(SESSION.name):'Aventureiro de demonstração';
 player=R.normalize({...saved,name:previewName},0);
 $('heroName').value=previewName;
 $('identityHint').textContent=SESSION?.name?'Nome obtido do cadastro do Caderno do Aluno.':'Personagem de demonstração — faça login no Caderno do Aluno para usar seu nome.';
 recount();fetchOfficial();initThree();
})();

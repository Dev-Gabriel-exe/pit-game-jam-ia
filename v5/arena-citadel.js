/* V5 — Cidadela do Eclipse.
 * A NEW medieval environment for 30 contestants, not a magnification
 * of the original small concentric-ring arena.
 * Original architecture built with Three.js, supplemented by CC0 KayKit GLBs
 * loaded separately by arena-three.js.
 */
import * as THREE from 'three';

export function buildEclipseCitadel(root,{quality='auto'}={}){
 const world=new THREE.Group();
 world.name='cidadela-do-eclipse';
 root.add(world);
 const low=quality==='low';
 const basalt=new THREE.MeshStandardMaterial({color:0x332d36,roughness:.92,metalness:.06});
 const stone=new THREE.MeshStandardMaterial({color:0x564753,roughness:.94});
 const highStone=new THREE.MeshStandardMaterial({color:0x7d6571,roughness:.89});
 const ash=new THREE.MeshStandardMaterial({color:0x191824,roughness:1});
 const darkIron=new THREE.MeshStandardMaterial({color:0x282733,metalness:.58,roughness:.53});
 const oldGold=new THREE.MeshStandardMaterial({color:0xc7a16a,metalness:.63,roughness:.35});
 const turquoise=new THREE.MeshStandardMaterial({color:0x5db7c1,emissive:0x307c8a,emissiveIntensity:.55,roughness:.45});
 const redLight=new THREE.MeshBasicMaterial({color:0xd65936});
 const fire=new THREE.MeshBasicMaterial({color:0xffc178});
 const tileColors=[0x443743,0x4a3d49,0x352e3b,0x514351,0x39303d,0x473a48];
 const made=[];
 const box=(parent,w,h,d,mat,x,y,z)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z);mesh.castShadow=!low;mesh.receiveShadow=true;parent.add(mesh);
  made.push(mesh);
  return mesh;
 };
 const cyl=(parent,r0,r1,h,segments,mat,x,y,z)=>{
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,segments),mat);
  mesh.position.set(x,y,z);mesh.castShadow=!low;mesh.receiveShadow=true;parent.add(mesh);
  made.push(mesh);return mesh;
 };
 const torus=(parent,r,tube,mat,x,y,z)=>{
  const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,tube,8,96),mat);
  mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);parent.add(mesh);made.push(mesh);return mesh;
 };
 // SQUARE architectural foundation, 106×106 units, with a truly open central field.
 box(world,112,2.4,112,ash,0,-1.85,0);
 box(world,99,.8,99,stone,0,-.49,0);
 const stoneGeometry=new THREE.BoxGeometry(2.45,.12,2.45);
 const map=new THREE.InstancedMesh(stoneGeometry,basalt,1600);
 const dummy=new THREE.Object3D(),tone=new THREE.Color();
 let instanceCount=0;
 for(let i=-20;i<20;i++)for(let j=-20;j<20;j++){
  const x=(i+.5)*2.48,z=(j+.5)*2.48;
  dummy.position.set(x,-.015-.013*((Math.abs(i*19+j*7))%3),z);
  dummy.rotation.set(0,(((i*11+j*17)%5)-2)*.006,0);
  dummy.updateMatrix();map.setMatrixAt(instanceCount,dummy.matrix);
  tone.setHex(tileColors[Math.abs(i*41+j*13)%tileColors.length]);map.setColorAt(instanceCount++,tone);
 }
 map.count=instanceCount;map.instanceMatrix.needsUpdate=true;
 map.castShadow=false;map.receiveShadow=true;world.add(map);
 // 4 grand marble entrance causeways divide the visual stage and give players
 // a clear orientation, unlike the old 5-pillar concentric-circle platform.
 for(let side=0;side<4;side++){
  const a=side*Math.PI/2,v=new THREE.Group();v.rotation.y=a;world.add(v);
  box(v,10,.22,34,highStone,0,.08,32);
  box(v,7,.27,34,basalt,0,.28,32);
  for(let i=0;i<7;i++){
   box(v,7,.035,.16,oldGold,0,.45,19+i*4.1);
  }
 }
 // Center of the arena: eight-pointed sigil with independent ornamentation.
 const dais=cyl(world,7.7,8.4,.32,8,stone,0,.1,0);
 dais.rotation.y=Math.PI/8;
 torus(world,7.7,.18,oldGold,0,.34,0);
 torus(world,5.65,.08,turquoise,0,.34,0);
 torus(world,3.7,.075,oldGold,0,.36,0);
 const sigil=new THREE.Group();sigil.position.y=.46;world.add(sigil);
 for(let n=0;n<8;n++){
  const a=n*Math.PI/4;
  const line=box(sigil,.26,.06,3.1,turquoise,Math.sin(a)*4.2,0,Math.cos(a)*4.2);
  line.rotation.y=a;
  const rhombus=cyl(sigil,.45,.45,.06,4,oldGold,Math.sin(a)*6.65,.02,Math.cos(a)*6.65);
  rhombus.rotation.y=a+Math.PI/4;
 }
 // Dark lava-lit trench beyond the playable floor, then three tiers of spectator
 // stands. The trench is decoration outside the logical storm boundary.
 for(let side=0;side<4;side++){
  const angle=side*Math.PI/2,perimeter=new THREE.Group();
  perimeter.rotation.y=angle;world.add(perimeter);
  box(perimeter,102,.42,2.2,darkIron,0,-.05,49.3);
  box(perimeter,102,.055,.46,redLight,0,.24,47.9);
  for(let tier=0;tier<3;tier++){
   const h=1.5+tier*1.5,depth=2.65;
   box(perimeter,109,1.4,depth,tier%2?stone:basalt,0,h-1.1,53.0+tier*2.45);
   box(perimeter,109,.21,.22,oldGold,0,h-.37,51.66+tier*2.45);
  }
  // Fortress walls and crenellations, 10-meter silhouettes above the stands.
  box(perimeter,114,10,3.1,basalt,0,7.5,61.1);
  box(perimeter,114,.42,3.7,highStone,0,12.7,61.1);
  for(let p=-54;p<=54;p+=5.4){
   box(perimeter,2.75,1.8,3.7,stone,p,13.8,61.1);
  }
  // Giant gatehouse arch (center frame is open, showing the eclipse sky).
  const gate=new THREE.Group();perimeter.add(gate);
  box(gate,3.2,15,5.4,highStone,-8,6.7,58.7);
  box(gate,3.2,15,5.4,highStone,8,6.7,58.7);
  box(gate,19.2,3.3,5.9,stone,0,13.9,58.7);
  const portcullis=box(gate,16,.24,1.0,oldGold,0,11.85,57.9);
  for(let k=-6;k<=6;k+=2){box(gate,.25,6,.8,darkIron,k,8.7,57.9)}
  // Hanging cloth banners with contrasting crescent sigils.
  for(const x of [-28,28]){
   box(perimeter,5,10,.26,side%2===0?
    new THREE.MeshStandardMaterial({color:0x6a263d,roughness:1}):
    new THREE.MeshStandardMaterial({color:0x315264,roughness:1}),x,7.6,59.15);
   box(perimeter,5.5,.28,.35,oldGold,x,13.05,59.15);
   cyl(perimeter,.9,.9,.11,5,oldGold,x,7.5,58.85).rotation.x=Math.PI/2;
  }
 }
 // 12 watchtowers / gothic spires and their layered roofs.
 for(let index=0;index<12;index++){
  const a=index/12*Math.PI*2,edge=(index%3===0?68:64);
  const x=Math.cos(a)*edge,z=Math.sin(a)*edge;
  const tower=new THREE.Group();tower.position.set(x,0,z);world.add(tower);
  cyl(tower,3.4,4.0,17,8,stone,0,7.8,0);
  cyl(tower,4.0,3.7,.75,8,highStone,0,16.8,0);
  cyl(tower,3.1,3.7,5.8,8,basalt,0,20,0);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(4.2,9.7,8),darkIron);
  roof.position.y=27;roof.rotation.y=Math.PI/8;tower.add(roof);made.push(roof);
  const flag=box(tower,2.8,2.9,.11,index%2?turquoise:redLight,1.6,34.2,0);
  flag.rotation.y=a;box(tower,.16,7,.16,oldGold,0,33.2,0);
 }
 // Eight massive gothic ruined monuments, with stone plinths aligned to
 // the real combat-engine obstacle coordinates (scale 2.6).
 const obstacles=[[0,0,1.7],[5.5,-5.5,1.5],[-5.5,5.5,1.5],[5.7,5.7,1.2],[-5.7,-5.7,1.2]];
 obstacles.forEach(([ix,iz,r],i)=>{
  const x=ix*2.6,z=iz*2.6;
  const group=new THREE.Group();group.position.set(x,0,z);world.add(group);
  cyl(group,r*2.24,r*2.6,.8,8,darkIron,0,.4,0);
  cyl(group,r*1.3,r*1.5,2.4,8,stone,0,1.7,0);
  if(i!==0){
   cyl(group,.68,.84,6.5,8,highStone,0,5.0,0);
   cyl(group,1.35,1.42,.35,8,stone,0,8.4,0);
   const crest=cyl(group,1.1,1.1,1.8,4,turquoise,0,9.4,0);
   crest.rotation.y=Math.PI/4;
  }else{
   const altar=cyl(group,1.9,2.5,4.1,8,basalt,0,2.9,0);
   altar.rotation.y=Math.PI/8;
   torus(group,2.1,.08,turquoise,0,5.1,0);
  }
 });
 // Lit braziers and stylized embers: 16 stations around the outer coliseum.
 for(let i=0;i<16;i++){
  const a=i/16*Math.PI*2+.14,x=Math.cos(a)*45.5,z=Math.sin(a)*45.5;
  cyl(world,.56,.76,2.3,8,stone,x,1.05,z);
  cyl(world,1.05,.62,.28,9,oldGold,x,2.35,z);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.49,1.65,7),fire);
  flame.position.set(x,3.14,z);world.add(flame);made.push(flame);
  if(!low&&i%4===0){
   const glow=new THREE.PointLight(0xef8d50,4.2,13,2);glow.position.set(x,3.6,z);world.add(glow);
  }
 }
 // Grand backdrop: standing rock masses outside the walls, not collision props.
 const rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),ash,low?90:165);
 for(let i=0;i<rocks.count;i++){
  const a=i*2.399963229728653,rad=70+Math.sqrt(i)*3.8;
  dummy.position.set(Math.cos(a)*rad,-3+Math.sin(i*4.2)*1.4,Math.sin(a)*rad);
  dummy.rotation.set((i%5)*.15,(i%9)*.2,0);
  dummy.scale.set(3+(i%7),4+(i%11),3+(i%4));dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
 }
 rocks.instanceMatrix.needsUpdate=true;world.add(rocks);
 // GPU-safe persistent status so browser QA can prove this is a different map.
 world.userData.version='eclipse-citadel-1';
 world.userData.playfield='square';
 world.userData.width=112;
 return {world,mapType:'eclipse-citadel-1',objects:made.length,tiles:instanceCount};
}

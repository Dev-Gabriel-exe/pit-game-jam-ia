/* PIT V5: 40 DISTINCT FULL-3D EQUIPMENT ASSEMBLIES (10 per class).
 * All added geometry authored here, no paid assets, no outside license burden.
 * Clothing base: Quaternius CC0 Standard via agentkaerf/FreeModels, pinned
 * to commit db3df04d1e4714298a09510b26fb6de6645138a2.
 * Four real source clothing meshes are shared, gear is generated per avatar
 * with differently shaped helms, capes, plated shoulders and held weapons.
 * Important: 40 composites, NOT 40 independently sculpted humanoid rigs.
 */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_WARDROBE=api;
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const REPO='https://raw.githubusercontent.com/agentkaerf/FreeModels/db3df04d1e4714298a09510b26fb6de6645138a2/Modular%20Character%20Outfits%20-%20Fantasy%5BStandard%5D/Exports/glTF%20%28Godot-Unreal%29/Outfits/';
const OUTFITS=Object.freeze({
 warrior:['Male_Ranger.gltf','Female_Ranger.gltf','Male_Peasant.gltf'],
 mage:['Female_Peasant.gltf','Male_Peasant.gltf','Female_Ranger.gltf'],
 hunter:['Female_Ranger.gltf','Male_Ranger.gltf','Female_Peasant.gltf'],
 guardian:['Male_Ranger.gltf','Female_Ranger.gltf','Male_Peasant.gltf']
});
const CLASSES=['warrior','mage','hunter','guardian'];
const METALS=[0x948f9c,0xb89b68,0x635e75,0x9e6579,0x9ba9b0,0x7d6e4e,0xb1a4a0,0x7e90a9,0xab8161,0x889182];
const CLOTH=[0x422338,0x162e3d,0x41304b,0x303f2b,0x5e3137,0x1e314d,0x62443a,0x3d2d59,0x244643,0x552f4d];
const WEAPONS={
 warrior:['longsword','greatsword','axe','hammer','spear','dual','longsword','axe','greatsword','spear'],
 mage:['staff','orb','staff','book','staff','orb','staff','book','staff','orb'],
 hunter:['bow','crossbow','bow','dual','bow','crossbow','bow','dual','bow','crossbow'],
 guardian:['shield','shield','hammer','shield','spear','shield','hammer','shield','spear','shield']
};
function spec(avatar){
 if(!avatar||!CLASSES.includes(avatar.klass))return null;
 const index=Number(avatar.variant);
 if(!Number.isInteger(index)||index<0||index>=10)return null;
 const classIndex=CLASSES.indexOf(avatar.klass);
 return Object.freeze({
  id:avatar.id,klass:avatar.klass,variant:index,
  outfit:OUTFITS[avatar.klass][(index+classIndex)%3],
  source:'Quaternius Modular Outfits Fantasy Standard (CC0)',
  url:REPO+OUTFITS[avatar.klass][(index+classIndex)%3],
  metal:METALS[index],cloth:CLOTH[(index+classIndex*2)%10],accent:avatar.accent,
  headgear:index%5,cape:index%3!==1,pauldrons:(index+classIndex)%4,
  weapon:WEAPONS[avatar.klass][index],emblem:index%6,
  ornament:index%4,rank:Math.floor(index/3)
 });
}
function construct(THREE,avatar,{height=2.6}={}){
 const p=spec(avatar);
 if(!p)throw Error('Avatar não reconhecido');
 const root=new THREE.Group();root.name='gear-'+p.id;
 const detail=new THREE.Group();detail.name='equipment-model-'+p.id;
 root.add(detail);
 const unit=height/2.6;
 const col=new THREE.Color(p.accent);
 const material=(hex,metalness=.2,roughness=.7,emissive=0)=>new THREE.MeshStandardMaterial({
  color:hex,metalness,roughness,emissive:emissive?hex:0x000000,emissiveIntensity:emissive
 });
 const steel=material(p.metal,.7,.32),trim=material(0xc8a77d,.74,.29),cloth=material(p.cloth,.08,.93),
  dark=material(0x27252f,.35,.7),skin=material(0xa8826a,.03,.94),glow=material(col,.26,.28,.3),
  leather=material(0x543b32,.1,.82),shadow=material(0x13151c,.2,.7),white=material(0xeee7d4);
 const palette={steel,trim,cloth,dark,skin,glow,leather,shadow,white};
 const mesh=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{
  const o=new THREE.Mesh(geo,mat);o.position.set(x*unit,y*unit,z*unit);
  o.rotation.set(rx,ry,rz);o.scale.multiplyScalar(unit);
  o.castShadow=false;o.receiveShadow=true;detail.add(o);return o;
 };
 const box=(sx,sy,sz,mat,x,y,z,rx=0,ry=0,rz=0)=>mesh(new THREE.BoxGeometry(sx,sy,sz),mat,x,y,z,rx,ry,rz);
 const sphere=(x,y,z,sx,sy,sz,mat,segments=12)=>{
  const o=mesh(new THREE.SphereGeometry(1,segments,9),mat,x,y,z);o.scale.set(sx*unit,sy*unit,sz*unit);return o
 };
 const cylinder=(r1,r2,h,mat,x,y,z,rot=0,sides=10)=>mesh(new THREE.CylinderGeometry(r1,r2,h,sides),mat,x,y,z,0,0,rot);
 const cone=(r,h,mat,x,y,z,sides=8,rot=0)=>mesh(new THREE.ConeGeometry(r,h,sides),mat,x,y,z,0,0,rot);
 const torus=(r,t,mat,x,y,z,rx=0,ry=0)=>mesh(new THREE.TorusGeometry(r,t,6,26),mat,x,y,z,rx,ry,0);
 const rod=(a,b,r,mat,r2=r)=>{
  const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b);
  const length=from.distanceTo(to),geo=new THREE.CylinderGeometry(r2,r,length,8),o=mesh(geo,mat,
    (a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.sub(from).normalize());return o
 };
 const jewel=(x,y,z,r=.11)=>mesh(new THREE.OctahedronGeometry(r,0),glow,x,y,z);
 // Face makes the GLTF outfits wearable even when the Standard exports omit
 // the base-character head. Avatar shape is fully 3D and independently varied.
 sphere(0,2.24,.02,.20,.25,.19,skin,16);
 sphere(0,2.17,.209,.058,.068,.078,skin,10);
 sphere(-.085,2.29,.185,.029,.034,.023,white,8);
 sphere(.085,2.29,.185,.029,.034,.023,white,8);
 sphere(-.086,2.292,.205,.015,.020,.012,shadow,8);
 sphere(.086,2.292,.205,.015,.020,.012,shadow,8);
 box(.135,.024,.023,dark,0,2.095,.208);
 const hair=material(0x302529+(p.variant*917%28)*0x030203,.06,.91);
 if(p.headgear===0){
  // Plated visor and two small horns (distinct silhouette).
  sphere(0,2.38,-.02,.235,.16,.23,steel);
  box(.44,.09,.085,trim,0,2.27,.211);
  cone(.095,.37,steel,-.155,2.61,-.035,6,-.25);
  cone(.095,.37,steel,.155,2.61,-.035,6,.25);
 }else if(p.headgear===1){
  // High-pointed mage/archer hood with metal clasp.
  cone(.285,.55,cloth,0,2.59,-.04,10);
  torus(.22,.028,trim,0,2.40,-.04,Math.PI/2);
  jewel(0,2.39,.194,.09);
 }else if(p.headgear===2){
  sphere(0,2.41,-.09,.27,.14,.25,hair,12);
  for(let k=0;k<3;k++)cone(.095,.3,hair,(k-1)*.13,2.55,-.11,5);
 }else if(p.headgear===3){
  // Winged circlet, identifiable at isometric camera distance.
  torus(.22,.046,trim,0,2.37,-.01,Math.PI/2);
  cone(.10,.4,steel,-.23,2.48,-.01,7,-.55);
  cone(.10,.4,steel,.23,2.48,-.01,7,.55);
  jewel(0,2.42,.24,.075);
 }else{
  sphere(0,2.42,-.02,.24,.13,.22,steel);
  box(.28,.065,.085,glow,0,2.39,.21);
  cone(.085,.41,trim,0,2.65,-.055,6);
 }
 // Armor is not flat recoloring: each torso is layered in different geometry.
 const heavy=p.klass==='warrior'||p.klass==='guardian';
 box(heavy?.61:.47,heavy?.79:.65,.24,heavy?steel:cloth,0,1.51,.085);
 for(const side of [-1,1]){
  const x=side*(heavy?.38:.31);
  const shoulder=p.pauldrons===0?'plate':p.pauldrons===1?'wing':p.pauldrons===2?'round':'spike';
  sphere(x,1.96,0,shoulder==='round'?.27:.23,.19,.24,heavy?steel:leather);
  if(shoulder==='wing')cone(.09,.4,trim,x+side*.11,2.15,-.06,7,side*.5);
  if(shoulder==='spike')cone(.10,.45,steel,x+side*.12,2.18,.04,7,side*.6);
  if(shoulder==='plate'){
   box(.27,.075,.28,trim,x,1.96,.18,0,0,side*.13);
   box(.26,.075,.27,steel,x,1.87,.16,0,0,side*.15);
  }
  box(.08,.34,.24,heavy?steel:leather,side*.47,1.53,.01,0,0,side*.16);
  torus(.145,.028,trim,x,1.91,.08,Math.PI/2);
  if(heavy)box(.26,.23,.19,steel,side*.19,.81,.1);
 }
 if(p.klass==='guardian'){
  for(let j=0;j<3;j++)box(.54-j*.09,.095,.27,steel,0,1.66-j*.24,.26,0,0,j*.04);
 }else if(p.klass==='mage'){
  for(let j=0;j<3;j++)torus(.23+j*.025,.022,glow,0,1.63-j*.19,.28,Math.PI/2);
  jewel(0,1.69,.33,.11);
 }else if(p.klass==='hunter'){
  for(let j=0;j<3;j++)box(.50,.052,.32,leather,0,1.74-j*.19,.24,0,0,.22);
 }else{
  box(.45,.055,.30,trim,0,1.69,.25);
  box(.38,.055,.32,steel,0,1.48,.26);
 }
 // Belt with 3D buckle, segmentable combat skirt / tunic and cloak.
 cylinder(.33,.33,.08,leather,0,1.10,0,Math.PI/2);
 box(.17,.16,.05,trim,0,1.1,.285);jewel(0,1.10,.327,.045);
 for(let j=0;j<5;j++){
  const angle=(j-2)*.49;
  const x=Math.sin(angle)*.25,z=Math.cos(angle)*.20;
  const tab=box(.18,heavy?.47:.64,.095,j%2?steel:cloth,x,.76,z,0,angle,0);
  tab.rotation.z=Math.sin(angle)*.14;
 }
 for(const x of [-.2,.2]){
  box(.17,.11,.16,trim,x,.46,.13);
  box(.18,.22,.23,heavy?steel:leather,x,.32,.09);
 }
 if(p.cape){
  // Real tapered 3D cloak, with layered inset strips and heraldic trim.
  // Root-static geometry for showcase; physics cloth rigging comes later.
  const shape=new THREE.Shape();
  shape.moveTo(-.27,0);shape.lineTo(.27,0);shape.lineTo(.51,-1.05);
  shape.quadraticCurveTo(0,-1.23,-.49,-1.05);shape.lineTo(-.27,0);
  const cape=mesh(new THREE.ShapeGeometry(shape),cloth,0,2.01,-.245);
  cape.material=cloth.clone();cape.material.side=THREE.DoubleSide;cape.rotation.x=-.075;
  box(.60,.065,.1,trim,0,1.97,-.28);
  for(const x of [-.35,.35])rod([x*.69,1.92,-.29],[x,.90,-.33],.012,trim);
 }
 if(p.klass==='hunter'){
  // Quiver and actual 3D arrow shafts, not a 2D icon.
  cylinder(.14,.12,.63,leather,-.34,1.67,-.32,-.25);
  for(let j=0;j<5;j++){
   const x=-.44+j*.048;
   rod([x,1.9,-.30],[x+.04,2.35+(j%2)*.09,-.34],.014,trim);
   cone(.07,.14,glow,x+.04,2.38+(j%2)*.09,-.34,5);
  }
 }
 // Held equipment. Different meshes and counts per candidate create
 // full silhouette differences on all 40 avatars, not only colored skins.
 const w=p.weapon;
 if(w==='longsword'||w==='greatsword'||w==='dual'){
  const blade=(x,scale=1)=>{
   rod([x,.96,.32],[x,1.60+.31*scale,.32],.048*scale,steel,.008);
   box(.34*scale,.075,.13,trim,x,1.0,.32);
   cylinder(.068,.07,.29,leather,x,.83,.32);
   jewel(x,1.01,.36,.06);
  };
  blade(.62,w==='greatsword'?1.55:1);
  if(w==='dual')blade(-.61,.78);
 }else if(w==='axe'||w==='hammer'){
  rod([.62,.72,.22],[.62,1.96,.22],.038,leather);
  if(w==='axe'){
   const axe=box(.40,.50,.12,steel,.75,1.73,.22);
   axe.rotation.z=-.16;
   cone(.20,.48,trim,.98,1.73,.22,7,Math.PI/2);
  }else{
   box(.58,.27,.29,steel,.62,1.78,.22);
   box(.48,.05,.35,trim,.62,1.96,.22);
  }
 }else if(w==='spear'){
  rod([.65,.4,.21],[.65,2.62,.21],.036,leather);
  cone(.15,.59,steel,.65,2.78,.21,8);
  cylinder(.095,.095,.10,trim,.65,2.49,.21);
 }else if(w==='staff'){
  rod([.62,.4,.18],[.62,2.55,.18],.047,leather);
  for(let j=0;j<3;j++)torus(.10+j*.045,.02,trim,.62,2.25+j*.12,.18,Math.PI/2);
  sphere(.62,2.69,.18,.19,.21,.19,glow,12);
  torus(.22,.026,trim,.62,2.69,.18,0,0);
 }else if(w==='orb'){
  sphere(.63,1.58,.27,.25,.25,.25,glow,14);
  for(let j=0;j<3;j++)torus(.30,.022,trim,.63,1.58,.27,j*.46,j*.36);
 }else if(w==='book'){
  box(.32,.46,.11,leather,.64,1.42,.28,0,0,-.3);
  box(.29,.43,.13,white,.64,1.42,.31,0,0,-.3);
  box(.30,.43,.04,steel,.59,1.42,.38,0,0,-.3);
  jewel(.61,1.44,.415,.068);
 }else if(w==='bow'||w==='crossbow'){
  // Bow: bending stave with taut string, arrow and grip.
  const h=w==='bow'?1.4:1.02,x=.67;
  rod([x,1.13,.24],[x+.19,1.13+h*.42,.23],.034,leather);
  rod([x+.19,1.13+h*.42,.23],[x,1.13+h,.24],.034,leather);
  rod([x,1.13,.24],[x,1.13+h,.24],.008,white);
  rod([x,1.13+h*.53,.30],[x-.45,1.13+h*.53,.40],.024,steel,.006);
  cone(.06,.16,trim,x-.48,1.13+h*.53,.41,5,Math.PI/2);
  if(w==='crossbow')box(.40,.12,.22,steel,x-.11,1.13+h*.42,.26);
 }else if(w==='shield'){
  box(.07,.71,.50,steel,-.61,1.39,.26,0,0,-.12);
  box(.09,.68,.06,trim,-.61,1.39,.53);
  sphere(-.61,1.39,.56,.14,.14,.08,glow);
  box(.065,.38,.10,trim,-.68,1.39,.38);
  rod([.62,.80,.3],[.62,1.7,.3],.037,steel);
  box(.26,.06,.15,trim,.62,.96,.30);
 }
 // Unique 3D heraldic facets — supports 10 separate looks even within one rig.
 jewel(0,1.59,.39,.10+(.012*(p.emblem%3)));
 for(let n=0;n<1+(p.ornament%3);n++){
  const a=n/(1+p.ornament%3)*Math.PI*2,angle=a+p.variant*.33;
  const pos=[Math.sin(angle)*.36,1.62+n*.13,Math.cos(angle)*.32];
  sphere(...pos,.052,.075,.045,n%2?trim:glow,8);
 }
 root.userData.appearance={id:p.id,outfit:p.outfit,weapon:p.weapon,
  geometryMeshes:detail.children.filter(c=>c.isMesh).length,license:'CC0-1.0',
  sources:['Quaternius CC0 Standard outfits','original authored geometry']};
 root.userData.hero=p;
 return {root,recipe:p,meshCount:detail.children.length};
}
return Object.freeze({spec,construct,OUTFITS,REPO,WEAPONS});
});

/* V5 E.6 — original procedural animated sprite frames for REAL talent events.
 * CanvasTexture sheets are generated locally, once per stage. No outside image CDN,
 * game-affecting writes, trademarks, or simulated combat activations.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PIT_V5_TALENT_SPRITES=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const STYLES=Object.freeze(['arc','barrier','bolt','dash','fire','frost','heal','orbit','arrow','radiance','rune','trap','impact']);
const FLOOR=new Set(['heal','orbit','radiance','rune','trap']);
const STYLE_FAMILY=Object.freeze({arc:'blade',barrier:'shield',bolt:'spark',dash:'trail',fire:'flame',frost:'crystal',heal:'mend',orbit:'orbit',arrow:'arrow',radiance:'sun',rune:'sigil',trap:'snare',impact:'impact'});
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function spec(style,{subtle=false,reducedMotion=false,quality='auto'}={}){
 if(!STYLES.includes(style))return null;
 const ground=FLOOR.has(style),impact=style==='impact';
 return Object.freeze({style,family:STYLE_FAMILY[style],ground,
  frames:reducedMotion?2:quality==='low'?3:6,
  duration:impact?.29:reducedMotion?.44:subtle?.63:style==='barrier'?.95:.76,
  size:impact?1.25:subtle?1.7:ground?3.6:style==='arc'?2.85:2.55,
  opacity:subtle?.52:.91,priority:impact?0:subtle?1:2});
}
function makeAtlas(THREE,{quality='auto',reducedMotion=false}={}){
 if(!THREE?.CanvasTexture||!THREE?.Sprite)throw Error('E.6 requer Three.js');
 if(typeof document==='undefined')throw Error('E.6 requer Canvas 2D');
 const dim=quality==='low'?80:160,frames=reducedMotion?2:quality==='low'?3:6;
 const textures=new Map(),cache=new Map();
 function trace(ctx,pts,closed=false){
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);
  if(closed)ctx.closePath();
 }
 function line(ctx,pts,width=.10){
  ctx.lineWidth=width;trace(ctx,pts);ctx.stroke();
 }
 function ring(ctx,rad,thin=.085,begin=0,end=Math.PI*2){
  ctx.beginPath();ctx.arc(0,0,rad,begin,end);ctx.lineWidth=thin;ctx.stroke();
 }
 function rays(ctx,n,r0,r1,rotation=0,width=.07){
  for(let i=0;i<n;i++){
   const a=rotation+i*Math.PI*2/n;
   line(ctx,[[Math.cos(a)*r0,Math.sin(a)*r0],[Math.cos(a)*r1,Math.sin(a)*r1]],width);
  }
 }
 function draw(ctx,style,t){
  // Normalized local co-ordinates: -1 to 1, camera-facing white alpha mask.
  const rise=.12+.75*t,burst=Math.sin(Math.PI*clamp(t,0,1));
  ctx.save();ctx.translate(dim/2,dim/2);ctx.scale(dim*.43,dim*.43);
  ctx.globalAlpha=clamp(1-t*.73,.08,1);
  const glow=ctx.createRadialGradient(0,0,.015,0,0,.97);
  glow.addColorStop(0,'rgba(255,255,255,.35)');
  glow.addColorStop(.30,'rgba(255,255,255,.15)');
  glow.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,.98,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.97)';ctx.fillStyle='rgba(255,255,255,.94)';
  ctx.lineJoin='round';ctx.lineCap='round';
  ctx.shadowColor='rgba(255,255,255,.88)';ctx.shadowBlur=dim*.06;
  switch(style){
   case 'arc':
    ctx.rotate(-.48+t*.64);ring(ctx,.47+rise*.24,.23,-2.3,1.1);
    ring(ctx,.76,.055,-2.15,.36);rays(ctx,3,.47,.85,-.6,.08);break;
   case 'barrier':
    ctx.rotate(Math.PI/6);ring(ctx,.70,.10);
    line(ctx,[[0,-.73],[.60,-.36],[.53,.45],[0,.78],[-.53,.45],[-.60,-.36],[0,-.73]],.10);
    line(ctx,[[-.28,.04],[0,.27],[.34,-.30]],.12);break;
   case 'bolt':
    ctx.rotate(-.3);line(ctx,[[-.68,-.84],[-.18,-.18],[.12,-.37],[.53,.73],[.05,.32],[-.13,.58]],.19);
    rays(ctx,4,.16,.7,t,.07);break;
   case 'dash':
    for(let i=0;i<4;i++)line(ctx,[[-.82,-.57+i*.34],[-.16+t*.3,-.76+i*.34],[.78,-.6+i*.34]],.16-i*.023);
    break;
   case 'fire':
    for(let i=0;i<3;i++){
     ctx.save();ctx.translate((i-1)*.35,.08);ctx.scale(.78-i*.08,.82+rise*.40);
     trace(ctx,[[0,.85],[-.30,.28],[-.16,-.24],[-.02,-.75],[.20,-.18],[.37,.39],[0,.85]],true);
     ctx.lineWidth=.11;ctx.stroke();ctx.restore();
    }
    break;
   case 'frost':
    rays(ctx,6,.12,.82,t*.22,.11);ring(ctx,.25,.075);rays(ctx,12,.46,.70,t*.22,.065);break;
   case 'heal':
    ring(ctx,.67,.085);line(ctx,[[0,-.55],[0,.55]],.19);line(ctx,[[-.55,0],[.55,0]],.19);
    rays(ctx,8,.73,.86,t*.15,.05);break;
   case 'orbit':
    ctx.save();ctx.scale(1,.48);ring(ctx,.78,.14);ctx.restore();
    ctx.save();ctx.rotate(-.52+t*.45);ctx.scale(1,.58);ring(ctx,.72,.11);ctx.restore();
    ring(ctx,.20,.15);break;
   case 'arrow':
    ctx.rotate(.72);line(ctx,[[0,.77],[0,-.68]],.16);
    line(ctx,[[-.35,-.25],[0,-.77],[.35,-.25]],.18);
    line(ctx,[[-.26,.40],[0,.65],[.26,.40]],.10);break;
   case 'radiance':
    ring(ctx,.43,.18);rays(ctx,10,.56,.91,t*.22,.10);
    ring(ctx,.17,.10);break;
   case 'rune':
    ring(ctx,.75,.09);ring(ctx,.48,.07);
    ctx.rotate(.35+t*.29);line(ctx,[[0,-.70],[.61,.34],[-.61,.34],[0,-.70]],.085);
    rays(ctx,6,.53,.68,.4,.045);break;
   case 'trap':
    ring(ctx,.77,.11);ring(ctx,.44,.065);
    for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);line(ctx,[[0,-.86],[.23,-.53],[0,-.39],[-.23,-.53],[0,-.86]],.09);ctx.restore()}
    break;
   case 'impact':
    ctx.scale(.7+burst*.35,.7+burst*.35);rays(ctx,9,.14,.72,t*.9,.13);
    ring(ctx,.25+rise*.48,.13);break;
  }
  // Strong readable center core, class color comes from SpriteMaterial tint.
  ctx.shadowBlur=0;ctx.globalAlpha=.36+burst*.46;ctx.beginPath();
  ctx.arc(0,0,style==='impact'?.09:.10,0,Math.PI*2);ctx.fill();
  ctx.restore();
 }
 for(const style of STYLES){
  const set=[];
  for(let i=0;i<frames;i++){
   const canvas=document.createElement('canvas');canvas.width=canvas.height=dim;
   const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw Error('Canvas indisponível');
   ctx.clearRect(0,0,dim,dim);
   draw(ctx,style,i/Math.max(1,frames-1));
   const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
   tex.magFilter=THREE.LinearFilter;tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;
   set.push(tex);
  }
  textures.set(style,set);
 }
 function spawn({style,color=0xffffff,scale=1,subtle=false,x=0,z=0}){
  const cfg=spec(style,{subtle,reducedMotion,quality});
  if(!cfg)return null;
  const frameset=textures.get(style),mat=new THREE.SpriteMaterial({
   map:frameset[0],color,transparent:true,opacity:cfg.opacity,
   blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true
  });
  const mesh=new THREE.Sprite(mat);
  mesh.position.set(x,cfg.ground?.52:style==='impact'?1.65:1.98,z);
  mesh.scale.set(cfg.size*scale,cfg.size*scale,1);
  mesh.userData.velocity=new THREE.Vector3();
  return {mesh,life:cfg.duration,maxLife:cfg.duration,baseScale:cfg.size*scale,
   spriteVisual:true,frames:frameset,frameIndex:0,subtle,style,config:cfg,isAbility:style!=='impact'};
 }
 function dispose(){
  for(const set of textures.values())for(const tex of set)tex.dispose();
  textures.clear();cache.clear();
 }
 return Object.freeze({spawn,dispose,frameCount:frames,textureCount:STYLES.length*frames});
}
return Object.freeze({STYLES,STYLE_FAMILY,FLOOR: [...FLOOR],spec,makeAtlas});
});

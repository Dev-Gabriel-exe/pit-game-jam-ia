/* PIT Game Jam IA V5 — cinematic ability motion, visual-only and deterministic.
 * Timelines are derived from verified combat events (not fake damage or casts).
 * No timers, mutable game state, RNG, server interaction or student data.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_TALENT_MOTION=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const PROJECTILES=Object.freeze(['arrow','bolt','fire','frost','dash']);
 const GROUND=Object.freeze(['heal','orbit','radiance','rune','trap']);
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 const ease=n=>{const p=clamp(n,0,1);return p*p*(3-2*p)};
 const finitePoint=o=>o&&Number.isFinite(o.x)&&Number.isFinite(o.z);
 function plan(cue,{from,to,subtle=false,reducedMotion=false}={}){
  if(!cue||typeof cue.style!=='string'||!Number.isFinite(cue.duration)||
    !Number.isFinite(cue.scale)||!Number.isInteger(cue.variant))
   throw Error('VFX cinematic: precisa de descritor canônico');
  if(!finitePoint(from))throw Error('VFX cinematic: origem inválida');
  const origin={x:from.x,z:from.z},dist=finitePoint(to)?Math.hypot(to.x-from.x,to.z-from.z):0;
  const projectile=PROJECTILES.includes(cue.style)&&dist>1.1&&dist<=70&&!subtle&&!reducedMotion;
  const mode=projectile?'projectile':GROUND.includes(cue.style)?'ground':cue.style==='barrier'?'ward':'burst';
  const end=projectile?{x:to.x,z:to.z}:origin;
  const phase=mode==='projectile'?{windup:.11,flight:.74}:{windup:.16,flight:.67};
  // The FX lasts long enough for six frames to read, but cannot hold the
  // animation budget hostage (maximum active ability meshes stays 9 / 18).
  const duration=reducedMotion?.43:subtle?.58:
   projectile?clamp(.56+dist/38,.68,1.20):
   mode==='ward'?.90:mode==='ground'?.92:.77;
  const lift=mode==='projectile'?(cue.style==='dash'?.45:cue.style==='arrow'?.65:1.28):0;
  const angle=projectile?Math.atan2(end.z-origin.z,end.x-origin.x):0;
  return Object.freeze({cue:cue.key,style:cue.style,mode,origin:Object.freeze(origin),
   end:Object.freeze(end),distance:+dist.toFixed(4),duration,
   phase:Object.freeze(phase),lift,angle,variant:cue.variant,spin:cue.spin,
   scale:cue.scale*(subtle?.76:1),subtle:!!subtle,reducedMotion:!!reducedMotion});
 }
 function sample(motion,age){
  if(!motion||!Number.isFinite(age)||!Number.isFinite(motion.duration)||motion.duration<=0)
   throw Error('VFX cinematic: timeline inválida');
  const p=clamp(age/motion.duration,0,1);
  const alpha=Math.min(1,ease(p/.12))*Math.min(1,(1-ease((p-.74)/.26)));
  const cast=Math.min(1,ease(p/motion.phase.windup));
  const flight=ease((p-motion.phase.windup)/(motion.phase.flight-motion.phase.windup));
  const spread=ease((p-motion.phase.windup)/(1-motion.phase.windup));
  const {origin,end,mode,style}=motion;
  let x=origin.x,z=origin.z,y=1.85,scale=motion.scale,rotation=0;
  if(mode==='projectile'){
   x=origin.x+(end.x-origin.x)*flight;
   z=origin.z+(end.z-origin.z)*flight;
   const arc=Math.sin(Math.PI*flight);
   y=(style==='dash'?.92:style==='arrow'?1.52:2.05)+arc*motion.lift;
   scale*=.78+.38*Math.sin(Math.PI*flight)+.25*spread;
   rotation=motion.angle+(style==='arrow'?.42:0);
  }else if(mode==='ground'){
   y=.35;
   scale*=.45+1.42*spread;
   rotation=(motion.reducedMotion?0:motion.spin)*p*.45;
   if(style==='orbit'){
    const radius=.55*spread;
    x+=Math.cos(p*Math.PI*2+motion.variant)*radius;
    z+=Math.sin(p*Math.PI*2+motion.variant)*radius;
   }
  }else if(mode==='ward'){
   y=1.58;
   scale*=.53+1.00*spread;
   rotation=motion.reducedMotion?0:p*motion.spin*.17;
  }else{
   y=style==='arc'?1.75:2.04;
   scale*=.58+1.08*spread;
   rotation=motion.reducedMotion?0:p*motion.spin*.18;
  }
  const opacity=clamp(alpha*(motion.subtle?.59:1),0,1);
  return Object.freeze({phase:p<motion.phase.windup?'charge':p<motion.phase.flight?'release':'afterglow',
   x,z,y,scale:Math.max(.02,scale),opacity,rotation,progress:p,
   active:p<1,energy:motion.reducedMotion?0:Math.max(0,Math.sin(Math.PI*p))*cast});
 }
 return Object.freeze({PROJECTILES,GROUND,plan,sample});
});

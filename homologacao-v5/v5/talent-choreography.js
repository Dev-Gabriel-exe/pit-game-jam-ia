/* PIT Game Jam V5 C.2 — combat choreography for the 120 canonical talents.
 * Visual-only. No physics, damage, RNG, talent cooldown or student progress writes.
 * Existing open-licensed GLB clips are preferred; these signed local poses augment them.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PIT_V5_CHOREOGRAPHY=api})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const BY_CLASS=Object.freeze({
 warrior:{windup:.33,forward:.22,pitch:.23,roll:.14,weight:1.16},
 mage:{windup:.23,forward:.055,pitch:.12,roll:.16,weight:.92},
 hunter:{windup:.14,forward:.16,pitch:.14,roll:.20,weight:1.04},
 guardian:{windup:.28,forward:.12,pitch:.12,roll:.10,weight:1.12}
});
const STYLE=Object.freeze({
 arc:{windup:1,travel:1,pose:'slash',impact:1},
 barrier:{windup:1.12,travel:.28,pose:'guard',impact:.45},
 bolt:{windup:.85,travel:.6,pose:'cast',impact:.66},
 dash:{windup:.55,travel:1.5,pose:'evade',impact:1},
 fire:{windup:1.06,travel:.75,pose:'cast',impact:1},
 frost:{windup:1.13,travel:.64,pose:'cast',impact:.81},
 heal:{windup:1.17,travel:.22,pose:'invoke',impact:.42},
 orbit:{windup:1.18,travel:.6,pose:'invoke',impact:.66},
 arrow:{windup:.78,travel:.85,pose:'shoot',impact:.85},
 radiance:{windup:1.13,travel:.43,pose:'invoke',impact:.75},
 rune:{windup:1.14,travel:.4,pose:'invoke',impact:.64},
 trap:{windup:1.02,travel:.48,pose:'place',impact:.54}
});
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function smooth(t){const v=clamp(t,0,1);return v*v*(3-2*v)}
function plan(cue){
 if(!cue||!BY_CLASS[cue.klass]||!STYLE[cue.style]||!/^[A-Z][0-9]{2}$/.test(cue.id||''))throw Error('C.2 requer um talento válido da C.1');
 const c=BY_CLASS[cue.klass],t=STYLE[cue.style];
 const duration=clamp(cue.duration*c.weight*(cue.type==='ativo'?1:.75),.31,1.12);
 const windup=clamp(c.windup*t.windup,.10,.48),contact=clamp(windup+(.20*t.travel),windup+.09,.80);
 const index=Number(cue.id.slice(1)),direction=(index%2===0?1:-1);
 const intensity=clamp((.82+(index%5)*.085)*(cue.scale||1)*t.impact,.12,1.7);
 const motion=cue.motion;
 const speed=clamp((.95+(index%3)*.09)/c.weight,.7,1.25);
 return Object.freeze({key:cue.key,id:cue.id,klass:cue.klass,motion,pose:t.pose,style:cue.style,
  duration,windup,contact,direction,intensity,speed,forward:c.forward,pitch:c.pitch,roll:c.roll,
  animateClip:motion==='attack'||motion==='cast'||motion==='dodge'||motion==='block'});
}
function sample(timeline,age,{reducedMotion=false}={}){
 if(!timeline||!Number.isFinite(age)||age<0||age>=timeline.duration)
  return {active:false,phase:'rest',forward:0,lift:0,pitch:0,roll:0,glow:0,progress:1};
 const p=clamp(age/timeline.duration,0,1);
 const start=smooth(p/timeline.windup),strike=smooth((p-timeline.windup)/(timeline.contact-timeline.windup));
 const release=1-smooth((p-timeline.contact)/(1-timeline.contact));
 const energize=p<timeline.windup?start*.48:p<timeline.contact?.48+strike*.52:release;
 const pose=timeline.pose;
 const direction=timeline.direction,st=timeline.intensity;
 const forward=(pose==='slash'||pose==='shoot'?timeline.forward:pose==='evade'?timeline.forward*.72:timeline.forward*.25)*energize;
 const pitch=(pose==='slash'?-timeline.pitch:pose==='shoot'?-timeline.pitch*.55:pose==='evade'?-timeline.pitch*.82:timeline.pitch*.44)*energize*st;
 const roll=(pose==='evade'?timeline.roll*1.55:pose==='slash'?timeline.roll:timeline.roll*.58)*energize*direction*st;
 const lift=(pose==='evade'?.22:pose==='invoke'?.12:pose==='place'?.04:.07)*energize;
 return {active:true,phase:p<timeline.windup?'anticipation':p<timeline.contact?'execution':'recovery',
  forward:reducedMotion?0:forward,lift:reducedMotion?0:lift,
  pitch:reducedMotion?0:pitch,roll:reducedMotion?0:roll,
  glow:reducedMotion?0:.18+energize*.7,progress:p};
}
function buildManifest(cues){
 const map={};
 if(!cues||typeof cues!=='object')throw Error('Catálogo C.1 necessário');
 for(const klass of Object.keys(BY_CLASS)){
  if(!Array.isArray(cues[klass]))throw Error('Classe ausente: '+klass);
  map[klass]=Object.freeze(Object.fromEntries(cues[klass].map(c=>[c.id,plan(c)])));
 }
 return Object.freeze(map);
}
return Object.freeze({BY_CLASS,STYLE,plan,sample,buildManifest});
});
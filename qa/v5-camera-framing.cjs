'use strict';
const assert=require('node:assert/strict');
const F=require('../v5/camera-framing.js');
const {createDirector}=require('../v5/camera-director.js');
const actors=Array.from({length:30},(_,i)=>({id:'p'+i,alive:true,x:(i%6-2.5)*8,z:(Math.floor(i/6)-2)*8,build:{klass:['warrior','mage','hunter','guardian'][i%4]}}));
const pillars=[{x:0,z:0,r:8.5},{x:27.5,z:-27.5,r:7.5},{x:-27.5,z:27.5,r:7.5},{x:28.5,z:28.5,r:6},{x:-28.5,z:-28.5,r:6}];
assert.equal(F.resolveShot({shot:{mode:'overview',ids:[]},fighters:[]}),null);
assert.equal(F.occlusions({x:-10,y:2,z:0},[{x:10,y:2,z:0}],[{x:0,z:0,r:2}]),1);
assert.equal(F.occlusions({x:-10,y:45,z:0},[{x:10,y:2,z:0}],[{x:0,z:0,r:2}]),0,'Raised eye over pillar');
const shot={mode:'duel',ids:['p2','p8'],reason:'prepare',focus:{x:9,z:12},at:5,revision:1};
const portrait=F.resolveShot({shot,fighters:actors,obstacles:pillars,aspect:.7});
const landscape=F.resolveShot({shot,fighters:actors,obstacles:pillars,aspect:1.8});
assert(portrait&&landscape);
assert(portrait.focusedTelegraph);
assert.equal(portrait.subjectIds.length,2);
assert(portrait.distance>=landscape.distance,'Portrait screen needs more distance to fit visible field');
assert(portrait.blocked<=1,'Camera must try to avoid obscuring the combatants');
assert(portrait.position.y>10);
const focusless=F.resolveShot({shot:{...shot,focus:null},fighters:actors,obstacles:pillars});
assert(!focusless.focusedTelegraph);
assert.notDeepEqual(focusless.look,landscape.look,'Area position should shift look point');
const dead=actors.map(f=>({...f}));dead[2].alive=false;
const after=F.resolveShot({shot,fighters:dead,obstacles:pillars});
assert(!after.subjectIds.includes('p2'));
const reduced=F.resolveShot({shot:{mode:'victory',ids:['p1'],at:15},fighters:actors,
 obstacles:pillars,elapsed:10,reducedMotion:true});
const noOrbit=F.resolveShot({shot:{mode:'victory',ids:['p1'],at:15},fighters:actors,
 obstacles:pillars,elapsed:0,reducedMotion:true});
assert.deepEqual(reduced,noOrbit,'Reduced motion must prevent winner-orbit');
const orbital=F.resolveShot({shot:{mode:'victory',ids:['p1'],at:15},fighters:actors,
 obstacles:pillars,elapsed:10,reducedMotion:false});
assert.notDeepEqual(orbital.position,reduced.position,'Standard motion includes subtle winner orbit');
const director=createDirector();director.start();
let modes=[];
for(let t=0;t<=30;t+=5){
 const plan=director.tick(t,actors);modes.push(plan.mode);
}
assert(modes.includes('overview')&&modes.includes('duel'),'Idle camera must leave overview to show duels');
director.observe({type:'prepare',hero:'p1',target:'p2',x:12,z:-15,time:35},actors);
const prepared=director.tick(35,actors);
assert(prepared.focus&&prepared.focus.x===12&&prepared.focus.z===-15,'Real telegraph has a camera focus');
assert.deepEqual(actors[0],{id:'p0',alive:true,x:-20,z:-16,build:{klass:'warrior'}},
 'Pure camera must never modify a fighter');
const short=director.tick(40,actors.slice(0,2));
assert.equal(short.mode,'climax');
const champion=director.tick(40.1,actors.slice(0,1));
assert.equal(champion.mode,'victory');
console.log('PASS F.2: camera avoids foreground pillars, frames true AoE impact, portrait fit, respects reduced motion, rotates wide/duels, maintains immutable combat.');

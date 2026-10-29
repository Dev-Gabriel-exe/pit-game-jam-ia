'use strict';
// D-phase regression: the larger 30-character stage and shared simulation
// must remain deterministic. This does not certify visual quality or FPS.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const PHASE2=require('../v5/phase2-combat.js');
const code=name=>fs.readFileSync(path.join(__dirname,'../v5',name),'utf8');
const citadel=code('arena-citadel.js');
const renderer=code('arena-three.js');
const lab=code('arena-lab.js');
assert.match(citadel,/eclipse-citadel-4-gothic-hex/);
assert.match(citadel,/const duelCourts=low\?8:12/);
assert.match(renderer,/KayKit-Game-Assets\/KayKit-Dungeon-Remastered-1\.0/);
assert.match(renderer,/container\.dataset\.v5DuelCourts/);
assert.match(citadel,/CylinderGeometry\(1\.42,1\.42,\.13,6,1\)/,'Piso hexagonal instanciado deve existir');
assert.match(citadel,/stained-glass-gothic/,'Vitrais góticos presentes na arena');
assert.match(renderer,/function cinematic\(\)/,'Câmera de aproximação disponível');
assert.match(renderer,/v5VisibleNicks/,'Cotas de nomes visíveis devem existir');
assert.match(renderer,/function followPose\(f,hero\)/,'Follow camera requires a real hero facing vector');
assert.match(renderer,/v5FollowBackDot/,'Follow camera must expose rear-camera QA');
assert.match(renderer,/Math\.max\(1\.45,cue\.duration\*1\.9\)/,'Active talents need sustained visible cues');
assert.match(renderer,/new THREE\.TorusGeometry\(1\.65,\.12/,'Real skills should show a second glowing ring');

assert.match(lab,/arenaScale:5,onEvent/);
const klasses=['warrior','mage','hunter','guardian'];
const roster=Array.from({length:30},(_,i)=>{
 const klass=klasses[i%4],name='Arena D '+String(i+1).padStart(2,'0');
 return {id:'d-phase-'+i,name,build:PHASE2.exampleBuild(klass,name,5,Math.floor(i/4)%11),approvedMissions:5};
});
function buildBattle(){return PHASE2.battle(roster,{seed:849137,limit:95,arenaScale:5})}
const a=buildBattle(),b=buildBattle();
assert.equal(a.fighters.length,30);
for(let i=0;i<30;i++){
 const f=a.fighters[i],f2=b.fighters[i];
 assert.equal(f.id,f2.id);
 assert.deepEqual([f.x,f.z],[f2.x,f2.z], 'initial positions must be reproducible');
 assert.ok(Math.hypot(f.x,f.z)<90, 'spawn should start inside initial safe zone');
}
for(let n=0;n<150;n++){
 const x=a.update(.05),y=b.update(.05);
 assert.equal(x.finished,y.finished);
 assert.equal(x.events.length,y.events.length,'same seed must emit same number of events');
 for(let i=0;i<a.fighters.length;i++){
  const f=a.fighters[i],other=b.fighters[i];
  assert.ok(Number.isFinite(f.x)&&Number.isFinite(f.z)&&Number.isFinite(f.hp));
  assert.deepEqual([f.x,f.z,f.hp,f.alive],[other.x,other.z,other.hp,other.alive]);
 }
 if(x.finished)break;
}
console.log('PASS D: 30 heroes; arenaScale=5; 12 duel court visuals (8 low); deterministic 30-hero simulation');

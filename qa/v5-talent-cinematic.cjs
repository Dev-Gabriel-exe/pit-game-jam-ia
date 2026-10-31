'use strict';
const assert=require('node:assert/strict');
const VFX=require('../v5/talent-vfx.js');
const ENGINE=require('../v5/phase2-combat.js');
const MOTION=require('../v5/talent-motion-cinematic.js');
const SPRITES=require('../v5/talent-sprites.js');
const manifest=VFX.manifest(ENGINE.TALENTS);
let cues=0,paths=0;
for(const [klass,items] of Object.entries(manifest)){
 assert.equal(items.length,30);
 for(const cue of items){
  const anchored=MOTION.plan(cue,{from:{x:12,z:-4}});
  assert.equal(anchored.cue,klass+':'+cue.id);
  assert(Object.isFrozen(anchored)&&Object.isFrozen(anchored.origin));
  assert.equal(anchored.mode==='projectile',false,'no fake projectiles without an actual target');
  assert(MOTION.PROJECTILES.includes(cue.style)||['ground','ward','burst'].includes(anchored.mode));
  assert(anchored.duration>=.43&&anchored.duration<=1.2);
  assert(SPRITES.spec(cue.style).frames===8);
  const distant=MOTION.plan(cue,{from:{x:12,z:-4},to:{x:22,z:6}});
  const reduced=MOTION.plan(cue,{from:{x:12,z:-4},to:{x:22,z:6},reducedMotion:true});
  assert.equal(reduced.mode==='projectile',false);
  assert.equal(reduced.duration,.43);
  assert.equal(MOTION.sample(reduced,reduced.duration*.5).energy,0);
  const subtle=MOTION.plan(cue,{from:{x:12,z:-4},to:{x:22,z:6},subtle:true});
  assert.notEqual(subtle.mode,'projectile','passive procs never simulate a new attack flight');
  assert.equal(subtle.duration,.58);
  if(MOTION.PROJECTILES.includes(cue.style)){
   assert.equal(distant.mode,'projectile');
   paths++;
   const start=MOTION.sample(distant,0);
   const before=MOTION.sample(distant,distant.duration*.1);
   const middle=MOTION.sample(distant,distant.duration*.48);
   const late=MOTION.sample(distant,distant.duration*.75);
   assert.equal(start.x,12);assert.equal(start.z,-4);
   assert.equal(before.x,12,'windup stays at the caster');
   assert(middle.x>12&&middle.x<22,'projectile moves through the arena');
   assert(middle.z>-4&&middle.z<6);
   assert(Math.abs(late.x-22)<1e-6);
   assert(Math.abs(late.z-6)<1e-6);
   assert(middle.y>.7&&middle.scale>0,'dashes follow low ground arcs, spells fly higher');
  }
  const phases=new Set();
  for(let i=0;i<=30;i++){
   const at=Math.min(1,i/30)*anchored.duration;
   const sample=MOTION.sample(anchored,at);
   phases.add(sample.phase);
   for(const f of ['x','y','z','scale','opacity','rotation','energy','progress'])
    assert(Number.isFinite(sample[f]),'VFX pose must be finite: '+cue.key+' '+f);
   assert(sample.opacity>=0&&sample.opacity<=1);
   assert(sample.scale>0);
  }
  assert.deepEqual([...phases].sort(),['afterglow','charge','release']);
  assert.deepEqual(MOTION.sample(anchored,anchored.duration),{
   ...MOTION.sample(anchored,anchored.duration),progress:1,active:false
  });
  assert.deepEqual(MOTION.plan(cue,{from:{x:12,z:-4},to:{x:22,z:6}}),distant);
  cues++;
 }
}
assert.equal(cues,120);assert(paths>=20);
const sample=MOTION.plan(manifest.mage.find(x=>x.id==='E01'),{from:{x:0,z:0},to:{x:5,z:0}});
assert.equal(sample.style,'fire');assert.equal(sample.mode,'projectile');
assert.equal(MOTION.plan(manifest.guardian.find(x=>x.id==='G01'),{from:{x:0,z:0},to:{x:5,z:0}}).mode,'ward');
assert.equal(MOTION.plan(manifest.hunter.find(x=>x.id==='E01'),{from:{x:0,z:0},to:{x:5,z:0}}).mode,'ground');
assert.equal(MOTION.plan(manifest.mage.find(x=>x.id==='E01'),{
 from:{x:0,z:0},to:{x:5,z:0},reducedMotion:true
}).mode,'burst');
assert.throws(()=>MOTION.plan(null,{from:{x:0,z:0}}),/descritor/);
assert.throws(()=>MOTION.plan(manifest.mage[0],{from:{x:Infinity,z:0}}),/origem/);
assert.throws(()=>MOTION.sample(null,1),/timeline/);
console.log('PASS cinematic talent VFX: 120 canonical talents, '+paths+' aimed projectile plans, charge/flight/afterglow, reduced motion and no battle state changes');

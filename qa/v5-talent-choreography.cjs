'use strict';
const assert=require('node:assert/strict');
const C=require('../v5/talent-choreography.js');
const V=require('../v5/talent-vfx.js');
const E=require('../v5/phase2-combat.js');
const catalog=C.buildManifest(V.manifest(E.TALENTS));
const signatures=new Set(),speeds=new Set(),poses=new Set(),phases=new Set();
for(const klass of Object.keys(C.BY_CLASS)){
 assert.equal(Object.keys(catalog[klass]).length,30);
 for(const t of E.TALENTS[klass]){
  const plan=catalog[klass][t.id];
  assert.equal(plan.key,klass+':'+t.id);
  assert(plan.duration>=.31&&plan.duration<=1.12);
  assert(plan.windup>0&&plan.contact>plan.windup&&plan.contact<1);
  assert(plan.speed>=.7&&plan.speed<=1.25);
  poses.add(plan.pose);speeds.add(plan.speed);
  signatures.add([plan.klass,plan.id,plan.pose,plan.speed,plan.direction].join(':'));
  let lastPhase='';
  for(let i=0;i<40;i++){
   const age=plan.duration*(i+.5)/40;
   const state=C.sample(plan,age);
   assert(state.active,'Must be active during sequence');
   assert(['anticipation','execution','recovery'].includes(state.phase));
   for(const k of ['forward','lift','pitch','roll','glow','progress'])assert(Number.isFinite(state[k])&&Math.abs(state[k])<4,plan.key+' '+k);
   phases.add(state.phase);
   const reduced=C.sample(plan,age,{reducedMotion:true});
   assert.equal(reduced.forward,0);assert.equal(reduced.pitch,0);assert.equal(reduced.roll,0);
   lastPhase=state.phase;
  }
  assert.equal(lastPhase,'recovery');
  assert.deepEqual(C.sample(plan,plan.duration),{active:false,phase:'rest',forward:0,lift:0,pitch:0,roll:0,glow:0,progress:1});
  assert.deepEqual(C.plan(V.descriptor(klass,t)),plan,'same skill should have same choreography');
 }
}
assert.equal(signatures.size,120);
assert(poses.size>=7);
assert(speeds.size>=6);
assert.deepEqual([...phases].sort(),['anticipation','execution','recovery']);
assert.notEqual(catalog.warrior.B01.pitch,catalog.mage.E01.pitch);
assert.notEqual(catalog.hunter.S01.pose,catalog.guardian.G01.pose);
assert.throws(()=>C.plan({klass:'warrior',id:'INVALID'}),/válido/);
assert.throws(()=>C.buildManifest({}),/ausente/);
console.log('PASS C.2: 120 deterministic, class-distinct, three-phase GLB-friendly choreographies, bounded poses and reduced-motion policy');
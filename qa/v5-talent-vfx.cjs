'use strict';
const assert=require('node:assert/strict'),V=require('../v5/talent-vfx.js'),E=require('../v5/phase2-combat.js');
const groups={warrior:['assault','duelist','bastion'],mage:['elemental','runic','astral'],hunter:['precision','trapper','survival'],guardian:['defense','light','judgment']};
const r=V.manifest(E.TALENTS),styles=new Set(),colors=new Set(),paths=new Set(),keys=new Set(),signatures=new Set();
for(const [klass,trees]of Object.entries(groups)){
 assert.equal(r[klass].length,30);
 for(let i=0;i<30;i++){
  const cue=r[klass][i],skill=E.TALENTS[klass][i];
  assert.equal(cue.key,klass+':'+skill.id);
  assert.equal(cue.animationId,skill.animationId);assert.equal(cue.name,skill.name);
  assert.equal(cue.path,trees[Math.floor(i/10)]);assert(V.SHAPES.includes(cue.style));
  assert(V.MOTIONS.has(cue.motion));assert(cue.duration>0&&cue.duration<=.8);
  assert(cue.scale>.8&&cue.scale<1.5);
  assert(!keys.has(cue.key)&&!signatures.has(cue.signature));
  keys.add(cue.key);signatures.add(cue.signature);
  paths.add(klass+':'+cue.path);styles.add(cue.style);colors.add(cue.color);
  assert.deepEqual(V.descriptor(klass,skill),cue);
 }
}
assert.equal(keys.size,120);assert.equal(signatures.size,120);assert.equal(paths.size,12);
assert(styles.size>=10);assert(colors.size>=10);
assert.equal(r.mage.find(x=>x.id==='E01').style,'fire');
assert.equal(r.hunter.find(x=>x.id==='E01').style,'trap');
assert.equal(r.hunter.find(x=>x.id==='S01').motion,'dodge');
assert.equal(r.guardian.find(x=>x.id==='G01').motion,'block');
assert.equal(V.descriptor('mage',{...E.TALENTS.mage[0],animationId:'fake'}),null);
assert.equal(V.descriptor('warrior',E.TALENTS.mage[0]),null);
assert.throws(()=>V.manifest({}),/incompleto/);
console.log('PASS C.1 VFX manifest: 120 talent cues, 12 paths, real phase2 IDs, 10+ shapes, class-scoped E IDs');
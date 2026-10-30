'use strict';
// E.6: sprite semantics must cover every real talent and not change its engine.
const assert=require('node:assert/strict');
const V=require('../v5/talent-vfx.js'),E=require('../v5/phase2-combat.js');
const S=require('../v5/talent-sprites.js');
const map=V.manifest(E.TALENTS),seen=new Set(),styles=new Set();
let count=0;
for(const [klass,cues] of Object.entries(map))for(const cue of cues){
 const spec=S.spec(cue.style);
 assert(spec,'Missing sprite for '+klass+':'+cue.id);
 assert(spec.duration>0&&spec.duration<=1.0);
 assert(spec.frames===6);
 assert(spec.size>=1.25);
 assert(spec.opacity>0&&spec.opacity<=1);
 assert(spec.family&&spec.style===cue.style);
 const low=S.spec(cue.style,{quality:'low',subtle:true});
 assert.equal(low.frames,3);
 assert(low.opacity<spec.opacity);
 const reduced=S.spec(cue.style,{reducedMotion:true});
 assert.equal(reduced.frames,2);
 assert(reduced.duration<=spec.duration);
 seen.add(cue.key);styles.add(cue.style);count++;
}
assert.equal(count,120);
assert.equal(seen.size,120);
assert(styles.size>=10);
assert.equal(S.STYLES.length,13);
assert.equal(new Set(S.STYLES).size,13);
assert.equal(S.spec('not-a-style'),null);
assert.equal(S.spec('rune').ground,true);
assert.equal(S.spec('arrow').ground,false);
assert.equal(S.spec('impact').priority,0);
assert.equal(S.STYLE_FAMILY.guardian,undefined);
assert.throws(()=>S.makeAtlas(null),/Three/);
console.log('PASS E.6: 120 real talents mapped to 13 sprite shapes, low/reduced frames and no combat dependencies.');
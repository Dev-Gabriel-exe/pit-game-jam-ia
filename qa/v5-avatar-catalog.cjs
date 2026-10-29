'use strict';
const assert=require('node:assert/strict');
const API=require('../v5/avatar-catalog.js');
assert.equal(API.AVATARS.length,40,'40 identifiers total, not 120');
assert.equal(new Set(API.AVATARS.map(a=>a.id)).size,40,'every avatar identity unique');
for(const klass of Object.keys(API.CLASSES)){
 const list=API.forClass(klass);
 assert.equal(list.length,10,'ten avatars per class');
 assert(list.every(x=>x.klass===klass&&x.baseModelId===klass&&x.license==='CC0-1.0'));
}
const assigned={};
for(let n=1;n<=30;n++){
 const id='aluno-'+String(n).padStart(2,'0'),klass=API.assignedClass(id);
 assigned[klass]=(assigned[klass]||0)+1;
}
assert.deepEqual(assigned,{warrior:8,mage:8,hunter:7,guardian:7});
let claims=[];
for(let n=1;n<=30;n++){
 const id='aluno-'+String(n).padStart(2,'0'),klass=API.assignedClass(id);
 const avatar=API.forClass(klass).find(a=>!claims.some(c=>c.avatarId===a.id));
 const result=API.reserve(claims,id,avatar.id);
 assert(result.ok,'30 students reserve 30 different avatars with assigned classes');
 claims=result.claims;
}
assert.equal(claims.length,30);
assert.equal(new Set(claims.map(c=>c.avatarId)).size,30);
assert.equal(API.AVATARS.length-claims.length,10,'10 free slots for flexibility');
const wrong=API.reserve(claims,'aluno-01','mage-09');
assert(!wrong.ok&&/classe atribuída/.test(wrong.error),'cannot steal a different class');
const held=API.reserve(claims,'aluno-05',claims[0].avatarId);
assert(!held.ok&&/outro aluno/.test(held.error),'cannot steal another player identity');
const changed=API.reserve(claims,'aluno-01','warrior-09');
assert(changed.ok);
assert(!changed.claims.some(c=>c.avatarId==='warrior-01'),'previous avatar is released on change');
assert(changed.claims.some(c=>c.avatarId==='warrior-09'));
const cleared=API.release(changed.claims,'aluno-01');
assert.equal(cleared.length,29,'release frees one option');
const reissued=API.reserve(cleared,'aluno-05','warrior-09');
assert(reissued.ok,'released model is reusable in same assigned class');
const manipulated=API.sanitizeClaims([
 {studentId:'aluno-01',avatarId:'warrior-01'},
 {studentId:'aluno-02',avatarId:'warrior-01'},
 {studentId:'aluno-01',avatarId:'warrior-02'},
 {studentId:'aluno-03',avatarId:'hunter-02'}
]);
assert.equal(manipulated.length,2,'invalid class and duplicate claims filtered');
console.log('PASS 40 CC0 variant identities, 10/class, 8+8+7+7 assignments, no duplicate reservations, release and claim integrity');

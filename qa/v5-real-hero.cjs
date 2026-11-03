'use strict';
const assert=require('node:assert/strict');
const HERO=require('../v5/real-hero-profile.js');
const CORE=require('../v5/phase2-combat.js');
assert.deepEqual(Object.keys(CORE.CLASSES),['warrior','mage','hunter','guardian']);
assert.equal(Object.values(CORE.TALENTS).reduce((n,t)=>n+t.length,0),120);
const base=HERO.create();
assert.equal(base.klass,'warrior');assert.equal(base.talents.length,0);
assert(Object.values(base.attributes).every(n=>n===0));
assert.notEqual(HERO.storageKey('PITGAME26','student-a'),HERO.storageKey('PITGAME26B','student-a'));
assert.notEqual(HERO.storageKey('PITGAME26','student-a'),HERO.storageKey('PITGAME26','student-b'));
for(let approved=0;approved<=10;approved++){
 for(const klass of Object.keys(CORE.CLASSES)){
  const source={klass,attributes:{FOR:200,DES:200,INT:200,VIT:200,DEF:200},
   talents:CORE.TALENTS[klass].map(t=>t.id)};
  const bounded=HERO.clean(source,approved,CORE);
  const used=Object.values(bounded.attributes).reduce((a,b)=>a+b,0);
  assert.equal(used,approved*2,'points granted only for real approvals');
  assert.equal(bounded.talents.length,approved);
  assert(bounded.talents.every(x=>CORE.TALENTS[klass].some(t=>t.id===x)));
 }
}
const forged=HERO.clean({klass:'mage',attributes:{FOR:999,DES:-1,VIT:NaN},talents:['E01','E01','forged']},1,CORE);
assert.equal(forged.attributes.FOR,2);assert.equal(forged.attributes.DES,0);
assert.deepEqual(forged.talents,['E01']);
const guardianTalent=CORE.TALENTS.guardian[0].id;
const approved=HERO.clean({klass:'guardian',attributes:{DEF:1,VIT:1},talents:['B01',guardianTalent]},1,CORE);
assert.deepEqual(approved.talents,[guardianTalent]);
assert.equal(HERO.clean(approved,0,CORE).talents.length,0,'revocation also revokes local talent budget');
console.log('PASS REAL HERO: 4 canonical classes, 120 talents, 0–10 approved missions, no imported fake XP, per-cohort/UUID isolation and revoked-point clamping');

'use strict';
// H.0 pure contract regression. Not an authorization or real student integration.
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
assert.equal(Object.keys(P.TALENTS).length,4);
for(const entries of Object.values(P.TALENTS))assert.equal(entries.length,30);
const h=H.createPolicy(P.TALENTS);
const approvals=n=>Array.from({length:n},(_,i)=>i+1);
function fixture(klass='warrior'){
 const b=P.exampleBuild(klass,'Teste',5,0);
 return {rosterKey:'trial-hero01',klass,completedMissions:approvals(5),
  build:{attributes:{...b.attributes},talents:[...b.talents]},
  m5Entered:false,m5Frozen:null,m10Locked:false};
}
const base=fixture(),pre=h.validateCandidate(base,{mission:5});
assert.equal(pre.approvedBaseXp,500);
assert.equal(pre.build.spentAttributes,10);
assert.equal(pre.build.talents.length,5);
assert.equal(pre.m5Entered,false);
assert(Object.isFrozen(pre.build.attributes)&&Object.isFrozen(pre.build.talents));
assert.throws(()=>h.m5ArenaAdapter(base),/congelar/);
const entered={...base,m5Entered:true,m5Frozen:JSON.parse(JSON.stringify(base.build))};
const locked=h.validateCandidate(entered,{mission:5});
assert(h.checkTransition(pre,locked));
const payload=h.m5ArenaAdapter(entered);
assert.equal(payload.approvedMissions,5);
assert.deepEqual(P.canonical(payload.build,5).talents,payload.build.talents);
assert.deepEqual(P.canonical(payload.build,5).attributes,payload.build.attributes);
assert.throws(()=>h.validateCandidate({...base,completedMissions:[1,2,4,5]},{mission:5}),/ordem/);
assert.throws(()=>h.validateCandidate({...base,build:{...base.build,attributes:{...base.build.attributes,FOR:12}}},{mission:5}),/pontos/);
assert.throws(()=>h.validateCandidate({...base,build:{...base.build,talents:[...base.build.talents,'B06']}}),/1 talento/);
assert.throws(()=>h.validateCandidate({...base,build:{...base.build,talents:[...base.build.talents.slice(0,4),'E01']}}),/outra classe/);
assert.throws(()=>h.validateCandidate({...base,build:{...base.build,talents:[...base.build.talents.slice(0,4),base.build.talents[0]]}}),/duplicado/);
assert.throws(()=>h.validateCandidate({...base,rosterKey:'Gabriel Alencar'}),/pseudônima/);
assert.throws(()=>h.validateCandidate({...base,m5Entered:true,m5Frozen:null}),/snapshot congelado/);
const altered={...entered,build:{
 attributes:{...entered.build.attributes,FOR:entered.build.attributes.FOR-1,INT:entered.build.attributes.INT+1},
 talents:[...entered.build.talents]}};
assert.throws(()=>h.validateCandidate(altered),/redistribuídos/);
const noSkill={...entered,build:{...entered.build,talents:entered.build.talents.slice(1)}};
assert.throws(()=>h.validateCandidate(noSkill),/retirado/);
const sneaky={...entered,m5Frozen:{...entered.m5Frozen,
 attributes:{...entered.m5Frozen.attributes,FOR:0}}};
assert.throws(()=>h.checkTransition(locked,h.validateCandidate(sneaky)),/imutável/);
const illegalEntry={...entered,m5Frozen:{...entered.build,
 attributes:{...entered.build.attributes,FOR:0}}};
assert.throws(()=>h.checkTransition(pre,h.validateCandidate(illegalEntry)),/build que estava aprovada/);
const tenTalent=[...entered.build.talents,'B06','B07','B08','B09','B10'];
const finalBuild={...entered.build,attributes:{
 ...entered.build.attributes,DEF:entered.build.attributes.DEF+10},talents:tenTalent};
const finalCandidate={...entered,completedMissions:approvals(10),
 build:finalBuild,m10Locked:true};
const ten=h.validateCandidate(finalCandidate,{mission:10});
assert.equal(ten.approvedBaseXp,1000);
assert.equal(ten.build.spentAttributes,20);
assert.equal(ten.build.talents.length,10);
assert(h.checkTransition(locked,ten));
assert.throws(()=>h.validateCandidate({...finalCandidate,m10Locked:false},{mission:10}),/definitivamente/);
assert.throws(()=>h.checkTransition(ten,h.validateCandidate({...finalCandidate,m10Locked:false},{mission:10}).value),/./);
assert.throws(()=>h.validateCandidate({...finalCandidate,m5Entered:false,m5Frozen:null},{mission:10}),/primeira entrada/);
assert.throws(()=>h.validateCandidate({...finalCandidate,build:{...finalBuild,talents:[...tenTalent,'D01']}},{mission:10}),/1 talento/);
// Explicit integration gate: Phase2 battle is still M5-only, NOT a working M10.
assert.throws(()=>P.canonical({klass:ten.klass,attributes:finalBuild.attributes,
 talents:finalBuild.talents},10),/no máximo cinco/);
let count=0;
for(const klass of H.CLASSES){
 for(const talent of P.TALENTS[klass]){
  const item={...fixture(klass),rosterKey:'trial-'+klass,
   build:{attributes:fixture(klass).build.attributes,talents:[talent.id]}};
  h.validateCandidate(item,{mission:5});count++;
 }
}
assert.equal(count,120);
console.log('PASS H.0: all 120 class talents, +2 attributes/mission, +1 talent/mission, M5 irrevocable freeze, final M10 lock and engine M10 gate; no real user writes.');

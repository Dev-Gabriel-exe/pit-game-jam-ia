#!/usr/bin/env node
'use strict';
// Static validation ONLY for the V5 Phase-2 design catalogs. Does not imply game implementation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root,'v5',f), 'utf8'));
const progress = read('fase2-progression-plan.json');
const defs = [
  ['warrior','talents-warrior-plan.json'],
  ['mage','talents-mage-plan.json'],
  ['hunter','talents-hunter-plan.json'],
  ['guardian','talents-guardian-plan.json']
];
const attrs = new Set(progress.attributes.map(a => a.id));
const types = ['ativo','passivo','reativo'];
assert.equal(attrs.size,5);
assert.deepEqual([...attrs].sort(),['DEF','DES','FOR','INT','VIT']);
assert.equal(progress.maxInvestedPerAttribute,12);
assert.equal(progress.approvedMissionXp,100);
assert.equal(progress.attributePointsPerApprovedMission,2);
assert.equal(progress.talentChoicesPerApprovedMission,1);
assert.equal(progress.talentsPerClass,30);
assert.equal(progress.totalClasses,4);
assert.equal(progress.freelyMixTrees,true);
assert.equal(progress.distinctTalentsOnly,true);
assert.equal(progress.bonusXpUnlocksPoints,false);
assert.deepEqual(progress.classes,defs.map(([c]) => c));
const m5 = progress.milestones.find(m=>m.approvedMissions===5);
const m10 = progress.milestones.find(m=>m.approvedMissions===10);
assert(m5 && m10);
assert.equal(m5.awardedXp,500);assert.equal(m5.attributePoints,10);assert.equal(m5.talentChoices,5);
assert.equal(m5.locksBuild,false);assert.equal(m5.mayRespecAfter,true);
assert.equal(m10.awardedXp,1000);assert.equal(m10.attributePoints,20);assert.equal(m10.talentChoices,10);
assert.equal(m10.locksBuildOnFirstEntry,true);assert.equal(m10.mayRespecBeforeFirstEntry,true);
assert.equal(progress.persistence.trialDoesNotLock,true);
assert.equal(progress.persistence.finalFirstEntryIsAtomicLock,true);
const animationIDs = new Set(),all = [];
for (const [klass,file] of defs) {
 const obj = read(file);assert.equal(obj.klass,klass);assert.equal(obj.status,'planning-only');
 const talents=obj.talents;
 assert.equal(talents.length,30,klass+' count');
 const ids=new Set(),names=new Set(),trees=new Map(),counts={ativo:0,passivo:0,reativo:0};
 for(const t of talents){
  assert.match(t.id,/^[A-Z][0-9]{2}$/,klass+' id');
  assert(!ids.has(t.id),klass+' duplicate '+t.id);ids.add(t.id);
  assert(t.name.length>=5 && !names.has(t.name),klass+' duplicated/invalid name '+t.name);
  names.add(t.name);
  assert(types.includes(t.type),klass+' invalid type '+t.id);counts[t.type]++;
  assert(attrs.has(t.primary) && attrs.has(t.secondary) && t.primary!==t.secondary,klass+' attrs '+t.id);
  assert(t.effect.length>=30,klass+' effect too short '+t.id);
  assert(t.animation.storyboard.length>=32,klass+' animation too short '+t.id);
  assert(t.synergyAndCounter.length>=12,klass+' synergy missing '+t.id);
  assert(!animationIDs.has(t.animation.id),'duplicate animation '+t.animation.id);
  animationIDs.add(t.animation.id);
  assert(t.animation.id.startsWith(klass+'_'),klass+' animation prefix');
  assert(t.tree && t.tree.length>=4,klass+' tree absent');
  trees.set(t.tree,(trees.get(t.tree)||0)+1);
  all.push(klass+':'+t.id);
 }
 assert.equal(trees.size,3,klass+' tree count');
 assert.deepEqual([...trees.values()].sort((a,b)=>a-b),[10,10,10],klass+' per tree');
 assert.deepEqual(counts,progress.combat.expectedCategoryCountsPerClass,klass+' category distribution');
 console.log('PASS '+klass+' — 30 talentos, 3 caminhos e 30 assinaturas de animação distintas');
}
assert.equal(all.length,120);
assert.equal(animationIDs.size,120);
// Examples of valid FREE path mixes; these are planning checks, not gameplay API tests.
const canPlan=(klass,mission,ids,investment)=>{
 const obj=read(defs.find(([id])=>id===klass)[1]);
 const allowed=new Map(obj.talents.map(t=>[t.id,t]));
 const chosen=[...ids],used=Object.values(investment);
 return chosen.length<=mission && chosen.length===new Set(chosen).size &&
 chosen.every(id=>allowed.has(id)) && used.every(n=>Number.isInteger(n)&&n>=0&&n<=progress.maxInvestedPerAttribute) &&
 used.reduce((sum,n)=>sum+n,0)<=mission*progress.attributePointsPerApprovedMission;
};
assert(canPlan('warrior',5,['B01','D02','T01','B03','D10'],{FOR:5,DES:3,DEF:2}));
assert(canPlan('mage',5,['E01','R01','A02','E04','R06'],{INT:7,DES:3}));
assert(canPlan('hunter',5,['P05','E01','S01','P02','E10'],{DES:5,INT:5}));
assert(canPlan('guardian',5,['G01','L01','J03','L07','J04'],{DEF:5,INT:3,FOR:2}));
assert(!canPlan('hunter',5,['P05','P05'],{DES:3}),'duplicate talent must fail');
assert(!canPlan('mage',5,['E01','R01','A02','E04','R06','E03'],{INT:3}),'six talents at mission5 must fail');
assert(!canPlan('guardian',5,['G01','L01'],{DEF:11}),'eleven points at mission5 must fail');
assert(!canPlan('warrior',10,['B01','D02'],{FOR:13}),'excess stat cap must fail');
console.log('PASS 120 talents, 120 storyboards, milestones M5/M10, and cross-tree selection rules');
console.log('NOTE: design-data static validation; battle/win-rate/3D animations/API lock still NOT implemented.');

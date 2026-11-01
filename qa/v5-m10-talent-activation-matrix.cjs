'use strict';
// H.3 / M10: diagnostics of *observed* talent events in fictional 30-hero
// battles. Selectability is NOT activation, and neither proves balance.
// Passive effects may not emit "talent" events. No classroom/API/XP writes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const R=require('../v5/m10-visual-roster.js');
const policy=H.createPolicy(P.TALENTS);
const classes=Object.keys(P.CLASSES).sort();
assert.deepEqual(classes,['guardian','hunter','mage','warrior']);
const canonical=new Map();
for(const klass of classes){
 assert.equal(P.TALENTS[klass].length,30);
 for(const t of P.TALENTS[klass])canonical.set(klass+':'+t.id,t);
}
assert.equal(canonical.size,120);
const activeCatalog=new Set([...canonical].filter(([,t])=>t.type==='ativo').map(([key])=>key));
assert.equal(activeCatalog.size,60,'Expected 15 active talents per KayKit class');
const selected=new Set(),observed=new Map(),byClass={};
for(const klass of classes)byClass[klass]={selected:new Set(),observed:new Set(),events:0};
const config={arenaMission:10,limit:145,arenaScale:5,damageScale:.5,
 mageDamageBonus:1.1,stormDelay:40,stormRateFactor:.55,
 engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
const seeds=[4175863657,4187654321];
let battles=0,totalTalentEvents=0,deterministicReplays=0;
for(let variant=0;variant<=10;variant++){
 const roster=R.createRoster(P,policy,{count:30,variant});
 const equipped=new Map();
 for(const p of roster){
  assert.equal(p.build.talents.length,10);
  assert.equal(Object.values(p.build.attributes).reduce((a,b)=>a+b,0),20);
  equipped.set(p.id,new Set(p.build.talents));
  for(const id of p.build.talents){
   const key=p.build.klass+':'+id;
   assert(canonical.has(key),'Unknown/off-class talent in M10');
   selected.add(key);byClass[p.build.klass].selected.add(id);
  }
 }
 for(const seed of seeds){
  const options={...config,seed:seed+variant};
  const first=P.battle(roster,options).run(3000);
  assert(first.finished&&first.winner?.id,'M10 did not finish');
  assert.equal(first.standings.length,30);
  const talentEvents=first.events.filter(e=>e.type==='talent');
  assert(talentEvents.length>0,'No talent events in M10 battle');
  for(const e of talentEvents){
   assert(equipped.has(e.hero),'Talent event from unknown hero');
   assert(equipped.get(e.hero).has(e.talent),
    'Talent event not equipped by hero: '+e.hero+':'+e.talent);
   const klass=roster.find(p=>p.id===e.hero).build.klass;
   const key=klass+':'+e.talent;
   assert(canonical.has(key),'Noncanonical talent event '+key);
   observed.set(key,(observed.get(key)||0)+1);
   byClass[klass].observed.add(e.talent);
   byClass[klass].events++;
  }
  totalTalentEvents+=talentEvents.length;
  battles++;
  if([0,5,10].includes(variant)&&seed===seeds[0]){
   const replay=P.battle(roster,options).run(3000);
   assert.deepEqual(replay,first,'Nondeterministic replay variant '+variant);
   deterministicReplays++;
  }
 }
}
assert.equal(selected.size,120,'All canonical talents must be selectable');
for(const key of activeCatalog)assert(observed.has(key),
 'Active talent equipped but never emitted in 22 M10 trials: '+key);
assert.equal(battles,22);
const report={
 schema:'pit-v5-m10-activation-telemetry-v1',scope:'fictional-laboratory',
 hardwareG2Validated:false,realStudentIntegration:false,
 variants:11,seedsPerVariant:2,battles,heroesPerBattle:30,
 selectableTalents:selected.size,activeTalentKinds:activeCatalog.size,
 activeTalentKindsObserved:[...activeCatalog].filter(key=>observed.has(key)).length,
 observedTalentEventKinds:observed.size,
 totalTalentEvents,deterministicReplays,
 classes:Object.fromEntries(classes.map(klass=>{
  const s=byClass[klass];
  return [klass,{
   selectable:s.selected.size,observedEventKinds:s.observed.size,
   talentEvents:s.events,
   noTalentEventObserved:[...s.selected].filter(id=>!s.observed.has(id)).sort(),
   passiveTalentsNotMeasurableByTalentEvent:P.TALENTS[klass]
    .filter(t=>t.type==='passivo').map(t=>t.id)
  }];
 })),
 limitations:[
  'A selected talent is not necessarily activated in any particular match.',
  'No talent event does not prove a passive or reactive talent is broken.',
  'This does not validate VFX, animation, balance, hardware, or real classrooms.'
 ]
};
fs.writeFileSync('qa/v5-m10-talent-activation-report.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS M10 event provenance: '+battles+' fictional 30-KayKit battles, 120 selectable talents, '+
 observed.size+' class-qualified talent IDs observed in emitted talent events (all '+
 activeCatalog.size+' active catalog talents covered), '+
 totalTalentEvents+' events, '+deterministicReplays+' exact replays; G.2 NOT tested.');
console.log(JSON.stringify({classes:Object.fromEntries(classes.map(k=>[k,{
 selected:report.classes[k].selectable,observed:report.classes[k].observedEventKinds,
 events:report.classes[k].talentEvents}]))}));

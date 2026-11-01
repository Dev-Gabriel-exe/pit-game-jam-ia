'use strict';
// H.3/M10 — deterministic audit of actual passive/reactive engine events.
// All participants are fictional. No browser, authentication, persistence or XP.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const V=require('../v5/talent-vfx.js');
const S=require('../v5/talent-sprites.js');
const C=require('../v5/talent-choreography.js');
const R=require('../v5/m10-visual-roster.js');
const policy=H.createPolicy(P.TALENTS);
const classes=Object.keys(P.CLASSES);
const catalog=V.manifest(P.TALENTS);
const approvals=Array.from({length:10},(_,i)=>i+1);
const seeds=[20261031,4175863657,20261101,3719];
const report={schema:'m10-passive-reactive-event-audit-v1',synthetic:true,
  physicalPCsValidated:false,humanVisualApproval:false,
  limitations:['Event-to-cue mapping only; not proof of on-screen readability or all 120 activations',
    'charge indicates readiness and is not rendered as a proc sprite',
    'SwiftShader/GitHub Actions cannot substitute physical G.2'],
  seeds,selected:{ativo:new Set(),passivo:new Set(),reativo:new Set()},
  observed:{ativo:new Set(),passivo:new Set(),reativo:new Set()},
  events:{talent:0,proc:0,charge:0},consumptions:[],anomalies:[],perSeed:[]};
const entries=Array.from({length:30},(_,i)=>{
 const klass=classes[i%4],name='trial-m10-vfx-'+i,variant=i%11;
 const m5=P.exampleBuild(klass,name,5,variant);
 const m10=P.exampleBuild(klass,name,10,variant,{experimentalFinal:true});
 const pool=P.TALENTS[klass].filter(t=>t.type!=='ativo'&&!m5.talents.includes(t.id));
 assert(pool.length>=5);
 const extras=Array.from({length:5},(_,j)=>pool[(i+j)%pool.length].id);
 const talents=[...m5.talents,...extras];
 assert.equal(new Set(talents).size,10);
 const candidate={rosterKey:name,klass,completedMissions:approvals,
  build:{attributes:m10.attributes,talents},m5Entered:true,
  m5Frozen:{attributes:m5.attributes,talents:m5.talents},m10Locked:true};
 const entry={...policy.m10ArenaAdapter(candidate),id:name};
 assert.equal(entry.build.talents.length,10);
 assert.equal(Object.values(entry.build.attributes).reduce((a,b)=>a+b,0),20);
 for(const id of talents){
  const talent=P.TALENTS[klass].find(t=>t.id===id);
  report.selected[talent.type].add(klass+':'+id);
 }
 return entry;
});
assert.equal(entries.length,30);
const byHero=new Map(entries.map(e=>[e.id,e]));
// Canonical per-talent counters distinguish visible triggers from readiness charges.
const perTalent=new Map(Object.entries(P.TALENTS).flatMap(([klass,items])=>
 items.map(t=>[klass+':'+t.id,{klass,id:t.id,type:t.type,selected:report.selected[t.type].has(klass+':'+t.id),talent:0,proc:0,charge:0}])));
assert.equal(perTalent.size,120,'Canonical audit must cover 120 distinct class-qualified IDs');
const options={arenaMission:10,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
for(const seed of seeds){
 const first=P.battle(entries,{...options,seed}).run();
 assert(first.finished&&first.winner&&first.events.some(e=>e.type==='end'));
 if(seed===seeds[0])assert.deepEqual(P.battle(entries,{...options,seed}).run(),first,
  'M10 event stream must be deterministic');
 const counts={talent:0,proc:0,charge:0},types={ativo:0,passivo:0,reativo:0};
 for(const event of first.events){
  if(event.type==='debuff'&&event.talent==='D07'&&event.kind==='next-hit-weaken-consumed'){
   const source=byHero.get(event.hero),victim=byHero.get(event.target);
   assert(source&&source.build.klass==='warrior'&&source.build.talents.includes('D07'),
    'D07 consumption must name its Warrior caster');
   assert(victim&&victim.id!==source.id,'D07 consumption must name the affected victim');
   report.consumptions.push({seed,seq:event.seq,source:source.id,victim:victim.id});
   continue;
  }
  if(!['talent','proc','charge'].includes(event.type)||!event.talent)continue;
  const owner=byHero.get(event.hero);
  assert(owner,'Event has no fictional owner: '+JSON.stringify(event));
  // M10 must never count consumption of a foreign D07 as the victim's proc.
  if(event.type==='proc'&&event.talent==='D07'&&event.kind==='weakened'){
   report.anomalies.push({seed,seq:event.seq,heroClass:owner.build.klass,
    talent:'D07',kind:'foreign-debuff-consumption-attributed-to-victim'});
   assert.fail('Legacy D07 victim-attributed proc leaked into M10');
  }
  const talent=P.TALENTS[owner.build.klass].find(t=>t.id===event.talent);
  assert(talent,'Unknown talent in event: '+JSON.stringify(event));
  assert(owner.build.talents.includes(event.talent),
   'Unselected talent activated: '+JSON.stringify(event));
  const cue=catalog[owner.build.klass].find(t=>t.id===event.talent);
  assert(cue&&cue.type===talent.type,'Missing canonical visual cue');
  const sprite=S.spec(cue.style,{subtle:event.type!=='talent'});
  const choreography=C.plan(cue);
  assert(sprite&&sprite.frames>0&&choreography.duration>0,
   'Missing sprite/choreography for real engine event');
  perTalent.get(owner.build.klass+':'+talent.id)[event.type]++;
  counts[event.type]++;report.events[event.type]++;
  types[talent.type]++;
  if(event.type==='proc'||event.type==='talent')
   report.observed[talent.type].add(owner.build.klass+':'+talent.id);
 }
 report.perSeed.push({seed,winnerClass:first.winner.klass,seconds:first.time,
  events:counts,triggerTypes:types});
}
assert(report.selected.passivo.size>0&&report.selected.reativo.size>0,
 'M10 fixture must select both passive and reactive skills');
assert(report.observed.passivo.size>0,
 'No passive proc rendered from any M10 synthetic event');
assert(report.observed.reativo.size>0,
 'No reactive proc rendered from any M10 synthetic event');
assert(report.consumptions.length>0,'M10 D07 consumption was not exercised');
assert.equal(report.anomalies.length,0,'D07 attribution anomaly must be eliminated');
// M5 remains the original 5-talent/10-point opt-out path.
const a=P.exampleBuild('warrior','trial-m5-a',5,0);
const b=P.exampleBuild('guardian','trial-m5-b',5,1);
const m5Entries=[{id:'trial-m5-a',build:a,approvedMissions:5},
 {id:'trial-m5-b',build:b,approvedMissions:5}];
const m5Opts={seed:20261031,arenaScale:5};
assert.deepEqual(P.battle(m5Entries,m5Opts).run(),
 P.battle(m5Entries,{...m5Opts,arenaMission:5}).run(),
 'M5 regression must be identical');
// Expanded M10-only matrix: selection coverage is separate from actual procs.
// It never mutates the original four-seed diagnostic or M5 baseline.
const matrix={schema:'m10-passive-reactive-variant-matrix-v1',synthetic:true,
 variants:11,seedsPerVariant:2,battles:0,events:{proc:0,charge:0},
 selected:{passivo:new Set(),reativo:new Set()},
 procObserved:{passivo:new Set(),reativo:new Set()},
 chargeOnly:{passivo:new Set(),reativo:new Set()},
 note:'Selection of 60 passive/reactive talents is not proof that all 60 proc in combat.'};
for(let variant=0;variant<11;variant++){
 const roster=R.createRoster(P,policy,{count:30,variant});
 const owners=new Map(roster.map(hero=>[hero.id,hero]));
 for(const hero of roster){
  assert.equal(hero.build.talents.length,10);
  assert.equal(Object.values(hero.build.attributes).reduce((sum,n)=>sum+n,0),20);
  for(const id of hero.build.talents){
   const t=P.TALENTS[hero.build.klass].find(x=>x.id===id);
   assert(t,'M10 variant selected an unknown talent');
   if(t.type!=='ativo')matrix.selected[t.type].add(hero.build.klass+':'+id);
  }
 }
 for(const seed of [4175863657,20261101]){
  const outcome=P.battle(roster,{...options,seed:seed+variant}).run(3000);
  assert(outcome.finished&&outcome.winner?.id&&outcome.standings.length===30,
   'M10 synthetic variant did not finish');
  matrix.battles++;
  for(const event of outcome.events){
   if(!['proc','charge'].includes(event.type)||!event.talent)continue;
   const hero=owners.get(event.hero);
   assert(hero,'Proc/charge attributed to unknown hero');
   assert(hero.build.talents.includes(event.talent),
    'Proc/charge attributed to an unequipped talent: '+JSON.stringify(event));
   const t=P.TALENTS[hero.build.klass].find(x=>x.id===event.talent);
   assert(t,'Proc/charge references unknown or off-class talent');
   if(event.talent==='D07'&&event.type==='proc'&&event.kind==='weakened')
    assert.fail('Foreign D07 victim attribution returned in M10 variant');
   const cue=catalog[hero.build.klass].find(x=>x.id===event.talent);
   assert(cue&&cue.type===t.type,'Proc/charge lacks canonical visual metadata');
   assert(S.spec(cue.style,{subtle:true})?.frames>0&&C.plan(cue)?.duration>0,
    'Proc/charge has no valid visual specification');
   matrix.events[event.type]++;
   if(t.type==='ativo')continue;
   const key=hero.build.klass+':'+t.id;
   if(event.type==='proc')matrix.procObserved[t.type].add(key);
   else matrix.chargeOnly[t.type].add(key);
  }
 }
}
assert.equal(matrix.battles,22);
assert.equal(matrix.selected.passivo.size,36,'Expected 36 selectable canonical passives');
assert.equal(matrix.selected.reativo.size,24,'Expected 24 selectable canonical reactives');
assert(matrix.procObserved.passivo.size>0&&matrix.procObserved.reativo.size>0,
 'No passive/reactive proc was observed across 22 M10 variants');
report.variantMatrix={schema:matrix.schema,synthetic:true,
 variants:matrix.variants,seedsPerVariant:matrix.seedsPerVariant,battles:matrix.battles,
 events:matrix.events,
 selected:Object.fromEntries(Object.entries(matrix.selected).map(([k,v])=>[k,{count:v.size,ids:[...v].sort()}])),
 procObserved:Object.fromEntries(Object.entries(matrix.procObserved).map(([k,v])=>[k,{count:v.size,ids:[...v].sort()}])),
 charged:Object.fromEntries(Object.entries(matrix.chargeOnly).map(([k,v])=>[k,{count:v.size,ids:[...v].sort()}])),
 notObserved:Object.fromEntries(Object.entries(matrix.selected).map(([k,v])=>
  [k,[...v].filter(id=>!matrix.procObserved[k].has(id)).sort()])),
 note:matrix.note};
const serialize=sets=>Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,
 {count:v.size,keys:[...v].sort()}]));
// Diagnostic only: absence in four synthetic seeds is not proof of a broken talent.
// A charge is readiness telemetry, not evidence of a rendered proc/sprite.
const talentRows=[...perTalent.values()].sort((a,b)=>(a.klass+':'+a.id).localeCompare(b.klass+':'+b.id));
const byType=Object.fromEntries(['ativo','passivo','reativo'].map(type=>{
 const rows=talentRows.filter(t=>t.type===type);
 return [type,{catalog:rows.length,selected:rows.filter(t=>t.selected).length,
  triggered:rows.filter(t=>t.talent+t.proc>0).length,
  selectedNotTriggered:rows.filter(t=>t.selected&&t.talent+t.proc===0).length}];
}));
const untriggered=talentRows.filter(t=>t.selected&&t.talent+t.proc===0).map(t=>t.klass+':'+t.id);
const rareTriggered=talentRows.filter(t=>t.selected&&t.talent+t.proc>0&&t.talent+t.proc<=2)
 .map(t=>({key:t.klass+':'+t.id,triggers:t.talent+t.proc}));
const chargedOnly=talentRows.filter(t=>t.selected&&t.charge>0&&t.talent+t.proc===0)
 .map(t=>({key:t.klass+':'+t.id,charges:t.charge}));
assert.equal(talentRows.reduce((n,t)=>n+t.talent,0),report.events.talent);
assert.equal(talentRows.reduce((n,t)=>n+t.proc,0),report.events.proc);
assert.equal(talentRows.reduce((n,t)=>n+t.charge,0),report.events.charge);
for(const type of ['ativo','passivo','reativo']){
 assert.equal(byType[type].triggered,report.observed[type].size,
  'Canonical observed count mismatch for '+type);
 assert.equal(byType[type].selected,report.selected[type].size,
  'Canonical selected count mismatch for '+type);
}
const coverage={schema:'canonical-talent-coverage-v1',totalCatalog:talentRows.length,
 note:'Synthetic engine-event coverage only; no visual readability or physical-PC validation',
 byType,untriggered,rareTriggered,chargedOnly,talents:talentRows};
const output={...report,selected:serialize(report.selected),observed:serialize(report.observed),
 coverage,m5Regression:'identical default and explicit M5 result'};
fs.writeFileSync('qa/v5-m10-passive-reactive-report.json',JSON.stringify(output,null,2)+'\n');
console.log('PASS M10 passive/reactive event audit: '+JSON.stringify({
 seeds:seeds.length,selected:Object.fromEntries(Object.entries(output.selected).map(([k,v])=>[k,v.count])),
 observed:Object.fromEntries(Object.entries(output.observed).map(([k,v])=>[k,v.count])),
 events:report.events,d07Consumptions:report.consumptions.length,
 anomalies:report.anomalies.length,coverage:byType,
 untriggered:untriggered.length,untriggeredIds:untriggered,
 rareTriggered:rareTriggered.length,chargedOnly:chargedOnly.length,
 chargedOnlyIds:chargedOnly,m5:'identical',variantMatrix:{battles:matrix.battles,selectedPassives:matrix.selected.passivo.size,selectedReactives:matrix.selected.reativo.size,proccedPassives:matrix.procObserved.passivo.size,proccedReactives:matrix.procObserved.reativo.size}}));

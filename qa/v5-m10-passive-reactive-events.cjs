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
const serialize=sets=>Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,
 {count:v.size,keys:[...v].sort()}]));
const output={...report,selected:serialize(report.selected),observed:serialize(report.observed),
 m5Regression:'identical default and explicit M5 result'};
fs.writeFileSync('qa/v5-m10-passive-reactive-report.json',JSON.stringify(output,null,2)+'\n');
console.log('PASS M10 passive/reactive event audit: '+JSON.stringify({
 seeds:seeds.length,selected:Object.fromEntries(Object.entries(output.selected).map(([k,v])=>[k,v.count])),
 observed:Object.fromEntries(Object.entries(output.observed).map(([k,v])=>[k,v.count])),
 events:report.events,d07Consumptions:report.consumptions.length,
 anomalies:report.anomalies.length,m5:'identical'}));

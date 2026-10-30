'use strict';
// M10 isolated trial — zero accounts, persistence, XP or real student data.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const policy=H.createPolicy(P.TALENTS);
const classes=Object.keys(P.CLASSES);
const approvals=Array.from({length:10},(_,i)=>i+1);
function candidate(klass,i){
 const name='trial-'+klass+'-'+i;
 const variant=i%11;
 const first=P.exampleBuild(klass,name,5,variant);
 const final=P.exampleBuild(klass,name,10,variant,{experimentalFinal:true});
 assert.equal(final.approvedMissions,10);
 assert.equal(final.talents.length,10);
 assert.equal(new Set(final.talents).size,10);
 assert.equal(Object.values(final.attributes).reduce((a,b)=>a+b,0),20);
 assert.deepEqual(final.talents.slice(0,5),first.talents);
 for(const key of P.ATTR)assert(final.attributes[key]>=first.attributes[key]);
 return {rosterKey:name,klass,completedMissions:approvals,
  build:{attributes:final.attributes,talents:final.talents},
  m5Entered:true,m5Frozen:{attributes:first.attributes,talents:first.talents},
  m10Locked:true};
}
function entry(klass,i){
 const c=candidate(klass,i),e=policy.m10ArenaAdapter(c);
 assert.equal(e.approvedMissions,10);
 assert.equal(e.finalTrial,true);
 assert(Object.isFrozen(e.build.attributes));
 return {...e,id:c.rosterKey};
}
assert.equal(classes.length,4);
assert.equal(classes.reduce((n,k)=>n+P.TALENTS[k].length,0),120);
for(const klass of classes){
 for(let i=0;i<11;i++)candidate(klass,i);
}
const m5a=P.exampleBuild('warrior','trial-m5',5,4);
const m5b=P.exampleBuild('guardian','trial-m5b',5,3);
assert.equal(m5a.talents.length,5);
assert.equal(Object.values(m5a.attributes).reduce((a,b)=>a+b,0),10);
assert.throws(()=>P.canonical({klass:'warrior',...candidate('warrior',0).build},10),/opt-in experimental/);
assert.throws(()=>P.exampleBuild('warrior','trial',10,0),/opt-in experimental/);
const valid=entry('warrior',0);
assert.throws(()=>P.battle([valid,entry('guardian',1)]),/M5 não aceita/);
assert.throws(()=>P.battle([{...valid,finalTrial:false},entry('guardian',1)],{arenaMission:10}),/finalTrial/);
assert.throws(()=>P.battle([{...valid,approvedMissions:5},entry('guardian',1)],{arenaMission:10}),/dez missões/);
assert.throws(()=>P.battle([valid,entry('guardian',1)],{arenaMission:9}),/Somente arena/);
assert.throws(()=>policy.m10ArenaAdapter({...candidate('warrior',0),m10Locked:false}),/travada/);
assert.throws(()=>policy.m10ArenaAdapter({...candidate('warrior',0),completedMissions:approvals.slice(0,9)}),/entrada exige/);
assert.throws(()=>policy.m10ArenaAdapter({...candidate('warrior',0),m5Entered:false,m5Frozen:null}),/primeira entrada/);
function compare(n,seed){
 const entries=Array.from({length:n},(_,i)=>entry(classes[i%4],i));
 const opts={arenaMission:10,seed,arenaScale:5,damageScale:.5,stormDelay:35,
  stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',
  rangedCommitment:'recovery',balancePreset:'e-hp2'};
 const first=P.battle(entries,opts).run();
 const second=P.battle(entries,opts).run();
 assert.deepEqual(second,first,'replay determinístico para '+n+' heróis');
 assert(first.finished,'M10 precisa encerrar no tempo limite');
 assert(first.winner&&entries.some(e=>e.id===first.winner.id));
 assert.equal(first.standings.length,n);
 assert(first.events.some(e=>e.type==='talent'),'M10 deve disparar talentos reais');
 assert(first.events.some(e=>e.type==='end'),'M10 deve produzir evento final');
 assert(first.standings.every(f=>Number.isFinite(f.hp)&&Number.isFinite(f.damage)));
 const used=new Set(first.events.filter(e=>e.type==='talent').map(e=>e.talent));
 const digest=crypto.createHash('sha256').update(JSON.stringify(first)).digest('hex').slice(0,16);
 console.log('M10 '+n+' heróis: winner='+first.winner.klass+', time='+first.time+
  's, talentos distintos ativados='+used.size+', eventos='+first.events.length+', sha256='+digest);
 return {first,used};
}
const m5Options={seed:4175863657,arenaScale:5,damageScale:.5};
const before=P.battle([{id:'trial-m5',build:m5a,approvedMissions:5},
 {id:'trial-m5b',build:m5b,approvedMissions:5}],m5Options).run();
const after=P.battle([{id:'trial-m5',build:m5a,approvedMissions:5},
 {id:'trial-m5b',build:m5b,approvedMissions:5}],{...m5Options,arenaMission:5}).run();
assert.deepEqual(after,before,'M5 deve permanecer idêntica com ou sem arenaMission=5');
compare(4,20261030);
compare(30,20261031);
console.log('PASS M10 sandbox: 4 classes/120 catalog talents, 10 picks, 20 stats, 4/30 reproducible battles, M5 unchanged, opt-in guard, no real writes.');

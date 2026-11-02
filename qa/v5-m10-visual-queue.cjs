'use strict';
// Isolated H.3 contract tests: no browser, no accounts, no real combat mutations.
const assert=require('node:assert/strict');
const {createQueue}=require('../v5/m10-visual-queue.js');
const PHASE2=require('../v5/phase2-combat.js');
const keys=['guardian:J08','hunter:P09','mage:A07'];
for(const key of keys){
 const [klass,id]=key.split(':');
 assert(PHASE2.TALENTS[klass].some(t=>t.id===id),'Missing canonical talent '+key);
}
for(const bad of [0,-1,19,1.5,NaN])assert.throws(()=>createQueue(bad),RangeError);
const q=createQueue(18);
for(const invalid of [
 null,{}, {key:'guardian:J08',x:NaN,z:0},
 {key:'guardian:J08',x:0,z:Infinity},
 {key:'guardian:ZZZ',x:0,z:0},
 {key:'student@example.com',x:0,z:0}
])assert.throws(()=>q.enqueue(invalid),TypeError);
const expected=[];
for(let k=0;k<6;k++){
 for(const key of keys){
  const original={key,x:k,z:-k,privateStudentName:'never-retained'};
  assert.equal(q.enqueue(original),true);
  original.x=999;
  expected.push({key,x:k,z:-k});
 }
}
assert.equal(q.enqueue({key:keys[0],x:99,z:99}),false,'Queue must not exceed 18');
assert.deepEqual(q.snapshot().queuedKeys,keys);
assert.equal(q.snapshot().size,18);
assert.equal(q.snapshot().rejected,1);
assert.deepEqual(q.snapshot().acceptedByKey,Object.fromEntries(keys.map(k=>[k,6])));
assert.deepEqual(q.snapshot().rejectedByKey,{[keys[0]]:1});
const observed=[];
for(let frame=0;frame<18;frame++){
 const cue=q.nextForFrame(frame);
 assert(cue&&Object.isFrozen(cue));
 assert(!Object.hasOwn(cue,'privateStudentName'),'No student data may be stored');
 observed.push(cue);
 assert.throws(()=>q.nextForFrame(frame),RangeError,'At most one dequeue per frame');
}
assert.deepEqual(observed,expected,'Round-robin must preserve each key lane FIFO');
assert.equal(q.snapshot().size,0);
assert.equal(q.snapshot().dispatched,18);
assert.deepEqual(q.snapshot().dispatchedByKey,Object.fromEntries(keys.map(k=>[k,6])));
assert.equal(q.nextForFrame(18),null);
assert.throws(()=>q.nextForFrame(17),RangeError);
q.clear();
assert.deepEqual(q.snapshot(),{capacity:18,size:0,queuedKeys:[],
 accepted:0,rejected:0,dispatched:0,evicted:0,evictedSingleton:0,lastFrame:-1,
 acceptedByKey:{},rejectedByKey:{},dispatchedByKey:{},evictedByKey:{},evictedSingletonByKey:{}});
assert.equal(q.enqueue({key:keys[2],x:0,z:0}),true);
assert.deepEqual(q.nextForFrame(0),{key:keys[2],x:0,z:0});
// Single-key bursts cannot starve later arriving canonical keys.
const fair=createQueue(18);
for(let i=0;i<12;i++)assert(fair.enqueue({key:keys[0],x:i,z:0}));
for(let i=0;i<3;i++)assert(fair.enqueue({key:keys[1],x:i,z:0}));
for(let i=0;i<3;i++)assert(fair.enqueue({key:keys[2],x:i,z:0}));
assert.deepEqual(Array.from({length:9},(_,i)=>fair.nextForFrame(i).key),
 [keys[0],keys[1],keys[2],keys[0],keys[1],keys[2],keys[0],keys[1],keys[2]]);
assert.equal(fair.snapshot().size,9);
// A new canonical proc gets a slot by replacing only redundant queued visuals.
const admission=createQueue(18);
for(let i=0;i<17;i++)assert(admission.enqueue({key:'warrior:B06',x:i,z:0}));
assert(admission.enqueue({key:'guardian:G06',x:0,z:0}));
assert(admission.enqueue({key:'guardian:J08',x:1,z:1}),
 'A first-display proc must replace one redundant queued visual');
assert.equal(admission.snapshot().size,18);
assert.equal(admission.snapshot().evicted,1);
assert.deepEqual(admission.snapshot().evictedByKey,{'warrior:B06':1});
assert.deepEqual([0,1,2].map(i=>admission.nextForFrame(i).key),
 ['warrior:B06','guardian:G06','guardian:J08']);
assert.equal(admission.snapshot().dispatchedByKey['guardian:J08'],1);
// Diagnostic regression: a key that previously had duplicates can have its
// last pending cue displaced by the original admission policy. This records
// that loss without claiming the rare-key WebGL gate has been solved.
const singleton=createQueue(3);
assert(singleton.enqueue({key:keys[0],x:0,z:0}));
assert(singleton.enqueue({key:keys[0],x:1,z:0}));
assert(singleton.enqueue({key:keys[1],x:0,z:0}));
assert.equal(singleton.nextForFrame(0).key,keys[0]);
assert(singleton.enqueue({key:keys[2],x:0,z:0}));
assert.equal(singleton.enqueue({key:'warrior:B06',x:0,z:0}),true);
assert.equal(singleton.snapshot().size,3);
assert.equal(singleton.snapshot().evicted,1);
assert.equal(singleton.snapshot().evictedSingleton,1);
assert.deepEqual(singleton.snapshot().evictedSingletonByKey,{[keys[0]]:1});
assert.deepEqual(singleton.snapshot().queuedKeys,[keys[1],keys[2],'warrior:B06']);
// Do not sacrifice a unique pending proc when all 18 keys are one-offs.
const unique=createQueue(18);
const canonical=Object.entries(PHASE2.TALENTS)
 .flatMap(([klass,talents])=>talents.map(t=>klass+':'+t.id));
for(const key of canonical.slice(0,18))assert(unique.enqueue({key,x:0,z:0}));
assert.equal(unique.enqueue({key:canonical[18],x:0,z:0}),false);
assert.equal(unique.snapshot().evicted,0);
assert.equal(unique.snapshot().rejected,1);
// Regression: a few attempts do NOT imply a singleton reached WebGL.
// Low-frequency first-display cues must survive admission pressure.
const unrendered=createQueue(3);
for(const key of keys)assert(unrendered.enqueue({key,x:0,z:0}));
for(let i=0;i<3;i++)assert.equal(unrendered.enqueue({key:keys[0],x:i,z:0}),false);
assert.equal(unrendered.enqueue({key:'warrior:B06',x:0,z:0}),false,
 'Low-frequency never-dispatched singleton must not be evicted');
assert.equal(unrendered.snapshot().evicted,0);
assert.equal(unrendered.snapshot().evictedSingleton,0);
assert.deepEqual(unrendered.snapshot().queuedKeys,keys);
assert.deepEqual([0,1,2].map(i=>unrendered.nextForFrame(i).key),keys);
// Deterministic replay, bounded under 1,000 synthetic incoming proc cues.
function replay(){
 const a=createQueue(18),out=[];
 for(let i=0;i<1000;i++)a.enqueue({key:keys[i%3],x:i,z:-i});
 for(let i=0;i<18;i++)out.push(a.nextForFrame(i));
 return {out,snapshot:a.snapshot()};
}
assert.deepEqual(replay(),replay());
assert.equal(replay().snapshot.accepted,18);
assert.equal(replay().snapshot.rejected,982);
assert.equal(Object.values(replay().snapshot.rejectedByKey).reduce((a,b)=>a+b,0),982);
assert.equal(Object.values(replay().snapshot.dispatchedByKey).reduce((a,b)=>a+b,0),18);
// Regression: the visual scheduler does not mutate M5 builds or Phase2 options.
const m5=PHASE2.exampleBuild('guardian','Synthetic M5',5,0);
assert.equal(m5.talents.length,5);
assert.equal(Object.values(m5.attributes).reduce((a,b)=>a+b,0),10);
const m10=PHASE2.exampleBuild('guardian','Synthetic M10',10,0,{experimentalFinal:true});
assert.equal(m10.talents.length,10);
assert.equal(Object.values(m10.attributes).reduce((a,b)=>a+b,0),20);
console.log('PASS M10 visual scheduler: 18-slot cap, 3-key fairness, first-frame gating contract, deterministic replay, M5/M10 budgets. WebGL coverage not inferred from counters; G2 NOT tested.');

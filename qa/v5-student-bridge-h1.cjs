'use strict';
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const H0=require('../v5/progression-contract-h0.js');
const H1=require('../v5/student-bridge-h1.js');
const policy=H0.createPolicy(P.TALENTS),bridge=H1.createBridge(policy);
const approvals=(n)=>Array.from({length:n},(_,i)=>({stage:i+1,status:'approved'}));
const build=(klass,n)=>({
 attributes:{FOR:2*n,DES:0,INT:0,VIT:0,DEF:0},
 talents:P.TALENTS[klass].slice(0,n).map(t=>t.id)
});
const snapshot=(klass='warrior',n=3)=>({
 rosterKey:'trial-safe42',klass,teacherCurrentStage:n,stageRows:approvals(n),
 build:build(klass,n),m5Entered:false,m5Frozen:null,m10Locked:false,duelOptIn:true,
 name:'Never expose name',token:'secret',studentId:'real-uuid',xp:999999
});
let checks=0;
for(const klass of H0.CLASSES){
 const s=snapshot(klass,3),view=bridge.view(s);
 assert.equal(view.progress.approvedMissions,3);
 assert.equal(view.progress.approvedBaseXp,300);
 assert.equal(view.duel.eligible,true);
 assert.equal(view.arena.m5Eligible,false);
 assert(!JSON.stringify(view).includes('secret'));
 assert(!JSON.stringify(view).includes('Never expose name'));
 assert(!JSON.stringify(view).includes('real-uuid'));
 assert(Object.isFrozen(view)&&Object.isFrozen(view.build.attributes));
 checks++;
}
const waiting={...snapshot(),teacherCurrentStage:3,stageRows:[...approvals(2),{stage:3,status:'submitted'}],
 build:build('warrior',2)};
assert.equal(bridge.view(waiting).progress.approvedMissions,2);
assert.equal(bridge.view(waiting).duel.eligible,true,'submitted evidence may duel but unlocks no points');
assert.equal(bridge.view({...waiting,duelOptIn:false}).duel.eligible,false,'requires opt in');
assert.equal(bridge.view({...waiting,stageRows:[...approvals(2),{stage:3,status:'working'}]}).duel.eligible,false);
assert.equal(bridge.view({...waiting,stageRows:[...approvals(2),{stage:3,status:'revision'}]}).duel.eligible,false);
assert.equal(bridge.view({...snapshot(),teacherCurrentStage:4}).duel.eligible,false,'released next mission clears waiting');
assert.throws(()=>bridge.view({...snapshot(),stageRows:[{stage:1,status:'approved'},{stage:3,status:'approved'}]}),/consecutivas/);
assert.throws(()=>bridge.view({...snapshot(),stageRows:[...approvals(3),{stage:3,status:'submitted'}]}),/duplicada/);
assert.throws(()=>bridge.view({...snapshot(),stageRows:[...approvals(3),{stage:4,status:'approved'}]}),/acima da liberação/);
assert.throws(()=>bridge.view({...waiting,build:build('warrior',3)}),/pontos excedem/);
assert.throws(()=>bridge.view({...snapshot(),rosterKey:'student-name'}),/pseudônimo/);
assert.throws(()=>bridge.view({...snapshot(),teacherCurrentStage:11}),/missão liberada/);
assert.throws(()=>bridge.view({...snapshot(),m5Entered:true,m5Frozen:build('warrior',3)}),/antes de cinco/);
const legacy=require('../chat-api/lib/v5-hero-core.js');
assert.throws(()=>bridge.view({...snapshot(),build:legacy.seedBuild('Aluna fictícia')}),/atributos inválidos|pontos excedem|talento/,'Never silently accept legacy V5 build schema');
const five=snapshot('guardian',5);
const before=bridge.view(five);
assert.equal(before.arena.m5Eligible,false,'M5 requires authoritative freeze');
const m5={...five,m5Entered:true,m5Frozen:five.build};
assert.equal(bridge.view(m5).arena.m5Eligible,true);
const seven={...snapshot('guardian',7),m5Entered:true,m5Frozen:five.build};
assert.equal(bridge.view(seven).arena.m10Eligible,false);
assert.throws(()=>bridge.view({...seven,build:{
 attributes:{...seven.build.attributes,FOR:8,INT:6},talents:seven.build.talents
}}),/congelados/);
const ten={...snapshot('guardian',10),m5Entered:true,m5Frozen:five.build,m10Locked:true};
assert.equal(bridge.view(ten).arena.m10Eligible,true);
assert.equal(bridge.view({...ten,m10Locked:false}).arena.m10Eligible,false,'no unlock while not locked');
assert.throws(()=>bridge.view({...snapshot('guardian',7)}),/entrada registrada/);
console.log('PASS H1a: '+checks+' classes, reviewed/submitted waiting eligibility, no XP trust, privacy, M5 freeze, M10 lock; no DB or student writes.');

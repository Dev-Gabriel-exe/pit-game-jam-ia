'use strict';
const assert=require('node:assert/strict');
const D=require('../v5/duel-invitations-lab.js');
const P=require('../v5/phase2-combat.js');
const B=require('../v5/duel-battle-lab.js');
const context={currentStage:3,duelsEnabled:true};
const person=k=>({view:{rosterKey:'trial-'+k,progress:{currentStage:3,awaitingPeers:true},duel:{eligible:true,mission:3}},roomKey:'trial-room-lab',online:true});
const from=person('ana'),to=person('bia');
let state=D.invite(D.createState(),{from,to,context,nowMs:1000,expectedRevision:0});
assert.throws(()=>D.arenaWindowFor(state,{id:1,actor:'trial-ana'}),/indisponível/);
state=D.respond(state,{id:1,actor:'trial-bia',decision:'accept',from,to,context,nowMs:2000,expectedRevision:state.revision});
const descriptor=D.arenaWindowFor(state,{id:1,actor:'trial-ana'});
for(const mission of [5,10]){
 const opts={seed:412,mission,classes:['warrior','guardian']};
 const first=B.createTrial(descriptor,P,opts);
 const result=first.run();
 assert(result.finished,'battle must finish');
 assert(result.winner,'must report a winner');
 assert.equal(result.standings.length,2);
 assert(result.standings.every(x=>['trial-ana','trial-bia'].includes(x.id)));
 assert.deepEqual(B.createTrial(descriptor,P,opts).run(),result,'deterministic replay');
 console.log('PASS fictional duel engine M'+mission+': '+result.winner.id+', '+result.time+'s');
}
assert.throws(()=>B.createTrial({...descriptor,readOnly:false},P),/inválido/);
assert.throws(()=>B.createTrial(descriptor,P,{mission:9}),/somente M5/);
const declined=D.respond(D.invite(D.createState(),{from,to,context,nowMs:1000,expectedRevision:0}),{id:1,actor:'trial-bia',decision:'decline',from,to,context,nowMs:2000,expectedRevision:1});
assert.throws(()=>D.arenaWindowFor(declined,{id:1,actor:'trial-ana'}),/indisponível/);
console.log('PASS: no XP, accounts or student records used');

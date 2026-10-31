'use strict';
const assert=require('node:assert/strict');
const engine=require('../v5/phase2-combat.js');
const H0=require('../v5/progression-contract-h0.js');
const T=require('../v5/teacher-arena-release-lab.js');
const policy=H0.createPolicy(engine.TALENTS),actor='trial-teacher';
const expectedCount=30;
const dispatch=(state,method,args={})=>T[method](state,{actor,expectedRevision:state.revision,...args});
const checks=[];
for(const mission of [5,10]){
 const participants=T.createRoster(engine,{mission,count:expectedCount});
 let state=T.createState({mission,participants});
 assert(Object.isFrozen(state.participants)&&Object.isFrozen(state.participants[0].build));
 assert.equal(T.eligible(state,policy).filter(p=>p.eligible).length,expectedCount);
 assert.throws(()=>dispatch(state,'release',{policy}),/não habilitou/);
 assert.throws(()=>T.alter(state,{actor:'trial-student',expectedRevision:state.revision,enabled:true}),/somente professor/);
 assert.throws(()=>T.alter(state,{actor,expectedRevision:22,enabled:true}),/revisão/);
 assert.throws(()=>T.createState({mission,participants:[participants[0],participants[0]]}),/duplicados/);
 assert.throws(()=>T.createState({mission,participants:[participants[0]]}),/2 a 30/);
 const badRoom={...participants[0],roomKey:'trial-room-foreign'};
 const badReady={...participants[1],ready:false};
 const badOffline={...participants[2],online:false};
 const badBuild={...participants[3],m5Entered:false,m5Frozen:null};
 const mixed=[badRoom,badReady,badOffline,badBuild,...participants.slice(4)];
 state=T.createState({mission,participants:mixed});
 const reasons=T.eligible(state,policy);
 assert.deepEqual(reasons.slice(0,4).map(p=>p.reason),
  ['outra-turma','não-pronto','offline','progresso-ou-build-inválido']);
 assert.equal(reasons.filter(p=>p.eligible).length,26);
 state=dispatch(state,'alter',{enabled:true});
 assert.throws(()=>dispatch(state,'release',{policy,seed:-1}),/seed inválida/);
 state=dispatch(state,'release',{policy,seed:20261031});
 assert.equal(state.status,'released');
 assert.equal(state.release.entrants.length,26);
 assert.equal(state.release.excluded.length,4);
 assert.equal(state.release.entrants.every(e=>e.approvedMissions===mission),true);
 assert.equal(state.release.entrants.every(e=>e.build.talents.length===mission),true);
 assert.equal(state.release.entrants.every(e=>Object.values(e.build.attributes).reduce((a,b)=>a+b,0)===mission*2),true);
 assert.equal(state.release.entrants.every(e=>e.finalTrial===(mission===10)),true);
 assert.equal(new Set(state.release.entrants.map(e=>e.id)).size,26);
 assert(Object.isFrozen(state.release.entrants[0].build.attributes));
 assert.throws(()=>dispatch(state,'release',{policy}),/não habilitou/);
 assert.throws(()=>dispatch(state,'alter',{enabled:false}),/antes da liberação/);
 assert.throws(()=>dispatch(state,'finish',{winner:state.release.entrants[0].id,time:12}),/não há partida/);
 state=dispatch(state,'start');
 assert.equal(state.status,'running');
 assert.throws(()=>dispatch(state,'start'),/não foi liberada/);
 assert.throws(()=>dispatch(state,'reset'),/andamento/);
 assert.throws(()=>dispatch(state,'finish',{winner:'trial-foreign',time:9}),/não pertence/);
 // Execute the released *immutable* H.0 payload with exactly the same M5/M10 engine.
 const fighters=state.release.entrants.map(e=>({...e,
  build:engine.canonical(e.build,mission,{experimentalFinal:mission===10})}));
 const options={arenaMission:mission,seed:20261031,arenaScale:5,
  damageScale:.5,stormDelay:35,stormRateFactor:.65,engagementMode:'spaced',
  navigationMode:'steer',rangedCommitment:'recovery',balancePreset:'e-hp2'};
 const result=engine.battle(fighters,options).run();
 assert(result.finished&&result.winner);
 assert.equal(result.standings.length,26);
 assert.deepEqual(engine.battle(fighters,options).run(),result);
 state=dispatch(state,'finish',{winner:result.winner.id,time:result.time});
 assert.equal(state.status,'finished');
 assert.equal(state.result.winner,result.winner.id);
 assert.equal(state.result.participants,26);
 assert.throws(()=>dispatch(state,'finish',{winner:result.winner.id,time:result.time}),/não há partida/);
 state=dispatch(state,'reset');
 assert.equal(state.status,'draft');
 assert.equal(state.teacherEnabled,false);
 assert.equal(state.release,null);
 let full=T.createState({mission,participants});
 full=dispatch(full,'alter',{enabled:true});
 full=dispatch(full,'release',{policy,seed:20261031});
 assert.equal(full.release.entrants.length,30,'collective class must allow all 30 eligible');
 const all=full.release.entrants.map(e=>({...e,
  build:engine.canonical(e.build,mission,{experimentalFinal:mission===10})}));
 const complete=engine.battle(all,options).run();
 assert.equal(complete.standings.length,30,'30 genuine entrants in the engine');
 assert(complete.finished&&complete.winner);
 checks.push('M'+mission+' / 30 eligible released + full engine; 4 exclusions tested / replay deterministic');
 // At least two are mandatory, never launch a one-player victory.
 let tiny=T.createState({mission,participants:participants.slice(0,2)});
 tiny=dispatch(tiny,'alter',{enabled:true});
 tiny=dispatch(tiny,'alter',{rosterKey:participants[1].rosterKey,ready:false});
 assert.throws(()=>dispatch(tiny,'release',{policy}),/mínimo dois/);
 tiny=dispatch(tiny,'alter',{rosterKey:participants[1].rosterKey,ready:true});
 tiny=dispatch(tiny,'release',{policy});
 assert.equal(tiny.release.entrants.length,2);
 tiny=dispatch(tiny,'abort');
 assert.equal(tiny.status,'aborted');
 assert.equal(tiny.result,null);
 assert.throws(()=>dispatch(tiny,'start'),/não foi liberada/);
 tiny=dispatch(tiny,'reset');
 assert.equal(tiny.status,'draft');
}
// No real account IDs can enter this fictional state.
assert.throws(()=>T.createState({mission:5,participants:[
 {rosterKey:'student-123',roomKey:'trial-room-coliseum'},
 {rosterKey:'trial-ok',roomKey:'trial-room-coliseum'}]}),/fictícios/);
console.log('PASS fictional teacher collective arena: '+checks.join('; '));

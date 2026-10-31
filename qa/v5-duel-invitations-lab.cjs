'use strict';
const assert=require('node:assert/strict');
const D=require('../v5/duel-invitations-lab.js');
const context={currentStage:3,duelsEnabled:true};
const view=(key,{stage=3,eligible=true,awaiting=true}={})=>({
 rosterKey:'trial-'+key,progress:{currentStage:stage,awaitingPeers:awaiting,approvedBaseXp:200},
 duel:{eligible,mission:stage},build:{attributes:{FOR:4},talents:['trial-talent']}
});
const person=(key,opts={},roomKey='trial-room-a')=>({view:view(key,opts),roomKey,online:true});
const a=person('ana'),b=person('bia'),c=person('cai');
const run=(state,from=a,to=b,nowMs=1000)=>D.invite(state,{from,to,context,nowMs,expectedRevision:state.revision});
const answer=(state,decision='accept',from=a,to=b,nowMs=2000)=>D.respond(state,{id:1,actor:'trial-bia',decision,from,to,context,nowMs,expectedRevision:state.revision});
let checks=0;
const test=(name,fn)=>{fn();checks++;console.log('ok '+checks+' '+name)};
test('convite e notificações de destinatário e remetente',()=>{
 const s=run(D.createState());assert.equal(s.invitations[0].status,'pending');
 assert.deepEqual(D.notificationsFor(s,'trial-bia')[0].actions,['accept','decline']);
 assert.deepEqual(D.notificationsFor(s,'trial-ana')[0].actions,['cancel']);
 assert.deepEqual(D.notificationsFor(s,'trial-cai'),[]);
 assert(Object.isFrozen(s)&&Object.isFrozen(s.invitations[0]));
});
test('aceite cria somente descritor fictício de janela para ambos',()=>{
 const s=answer(run(D.createState()));assert.equal(s.invitations[0].status,'accepted');
 for(const actor of ['trial-ana','trial-bia']){
  assert.equal(D.arenaWindowFor(s,{id:1,actor}).kind,'fictional-duel-window');
  assert.equal(D.notificationsFor(s,actor)[0].arenaReady,true);
 }
 assert.throws(()=>D.arenaWindowFor(s,{id:1,actor:'trial-cai'}),/indisponível/);
 assert.throws(()=>answer(s),/respondido/);
});
test('recusa não abre janela',()=>{
 const s=answer(run(D.createState()),'decline');
 assert.equal(D.notificationsFor(s,'trial-ana')[0].status,'declined');
 assert.equal(D.notificationsFor(s,'trial-bia')[0].arenaReady,false);
 assert.throws(()=>D.arenaWindowFor(s,{id:1,actor:'trial-ana'}),/indisponível/);
});
test('expiração exata e resposta tardia',()=>{
 const s=run(D.createState());assert.throws(()=>answer(s,'accept',a,b,91000),/expirado/);
 const expired=D.expire(s,{nowMs:91000,expectedRevision:s.revision});
 assert.equal(expired.invitations[0].status,'expired');
 assert.strictEqual(D.expire(expired,{nowMs:91001,expectedRevision:expired.revision}),expired);
 assert.throws(()=>answer(expired),/respondido/);
});
test('cancelamento apenas pelo remetente',()=>{
 const s=run(D.createState());
 assert.throws(()=>D.cancel(s,{id:1,actor:'trial-bia',nowMs:2000,expectedRevision:s.revision}),/não autorizado/);
 const cancelled=D.cancel(s,{id:1,actor:'trial-ana',nowMs:2000,expectedRevision:s.revision});
 assert.equal(cancelled.invitations[0].status,'cancelled');
 assert.throws(()=>D.arenaWindowFor(cancelled,{id:1,actor:'trial-bia'}),/indisponível/);
});
test('mesma turma, professor, presença, opt-in e missão corrente',()=>{
 const invalid=[
  [a,person('bia',{},'trial-room-other'),context,/turmas diferentes/],
  [a,{...b,online:false},context,/não está disponível/],
  [a,person('bia',{eligible:false}),context,/não está disponível/],
  [a,person('bia',{stage:2}),context,/não está disponível/],
  [a,b,{...context,duelsEnabled:false},/desabilitados/],
  [a,a,context,/autoconvite/]
 ];
 for(const [from,to,ctx,reason] of invalid)assert.throws(()=>D.invite(D.createState(),{
  from,to,context:ctx,nowMs:1000,expectedRevision:0}),reason);
});
test('apenas destinatário responde; bloqueio por mudança de professor',()=>{
 const s=run(D.createState());
 assert.throws(()=>D.respond(s,{id:1,actor:'trial-ana',decision:'accept',from:a,to:b,context,nowMs:2000,expectedRevision:1}),/destinatário/);
 assert.throws(()=>D.respond(s,{id:1,actor:'trial-bia',decision:'accept',from:a,to:b,context:{...context,duelsEnabled:false},nowMs:2000,expectedRevision:1}),/desabilitados/);
 assert.throws(()=>D.respond(s,{id:1,actor:'trial-bia',decision:'accept',from:a,to:b,context:{...context,currentStage:4},nowMs:2000,expectedRevision:1}),/disponível/);
});
test('replay, concorrência e segundo convite só após encerramento',()=>{
 const s=run(D.createState());
 assert.throws(()=>D.invite(s,{from:a,to:c,context,nowMs:2000,expectedRevision:0}),/revisão/);
 assert.throws(()=>run(s,a,c),/duelo ativo/);
 assert.throws(()=>run(s,c,b),/duelo ativo/);
 const accepted=answer(s);
 assert.throws(()=>run(accepted,a,c),/duelo ativo/);
 const closed=D.close(accepted,{id:1,actor:'trial-ana',nowMs:3000,expectedRevision:accepted.revision});
 assert.equal(closed.invitations[0].status,'closed');
 const next=run(closed,a,c,4000);assert.equal(next.invitations[1].id,2);
});
test('dados privados e XP não entram no contrato nem são modificados',()=>{
 const fake={...a,view:{...a.view,name:'PRIVATE STUDENT',xp:999999,token:'PRIVATE TOKEN'}};
 const before=JSON.stringify(fake),s=run(D.createState(),fake,b);
 const text=JSON.stringify(s)+JSON.stringify(D.notificationsFor(s,'trial-bia'));
 assert(!text.includes('PRIVATE')&&!text.includes('999999'));
 assert.equal(JSON.stringify(fake),before);
 assert.equal(fake.view.progress.approvedBaseXp,200);
 assert(!text.includes('approvedBaseXp')&&!text.includes('talents'));
});
test('fechamento bloqueia janela e não reabre',()=>{
 const s=answer(run(D.createState()));
 assert.throws(()=>D.close(s,{id:1,actor:'trial-cai',nowMs:3000,expectedRevision:s.revision}),/não autorizado/);
 const closed=D.close(s,{id:1,actor:'trial-bia',nowMs:3000,expectedRevision:s.revision});
 assert.throws(()=>D.arenaWindowFor(closed,{id:1,actor:'trial-ana'}),/indisponível/);
});
console.log('PASS DUEL LAB: '+checks+' fictional scenarios; no real account, DB, XP or UI opened.');

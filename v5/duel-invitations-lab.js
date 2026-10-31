/* PIT Game Jam IA V5 — fictional, side-effect-free duel invitation contract.
 * NOT a classroom API, authority, notification transport, WebSocket, or real arena.
 * Caller must supply server-verified H1 views, teacher release and online/room data.
 * All aliases and room keys must be trial-only; no XP, DB, or user writes.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_DUEL_INVITATIONS_LAB=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const VERSION='pit-v5-duel-invitations-lab-1';
 const ALIAS=/^trial-[a-z0-9_-]{1,60}$/;
 const ROOM=/^trial-room-[a-z0-9_-]{1,50}$/;
 const ACTIVE=new Set(['pending','accepted']);
 const MAX_INVITES=500;
 function fail(reason){throw Error('DUEL-LAB: '+reason)}
 function freeze(value){
  if(Array.isArray(value))return Object.freeze(value.map(freeze));
  if(value&&typeof value==='object')return Object.freeze(Object.fromEntries(Object.entries(value).map(([k,v])=>[k,freeze(v)])));
  return value;
 }
 function int(n,min,max){return Number.isSafeInteger(n)&&n>=min&&n<=max}
 function alias(s){if(typeof s!=='string'||!ALIAS.test(s))fail('alias fictício inválido');return s}
 function room(s){if(typeof s!=='string'||!ROOM.test(s))fail('turma fictícia inválida');return s}
 function clock(nowMs){if(!int(nowMs,0,Number.MAX_SAFE_INTEGER))fail('relógio lógico inválido');return nowMs}
 function revision(state,expectedRevision){
  if(!state||state.schema!==VERSION||!int(state.revision,0,Number.MAX_SAFE_INTEGER)||!Array.isArray(state.invitations))fail('estado inválido');
  if(state.revision!==expectedRevision)fail('revisão desatualizada');
 }
 function teacher(context){
  if(!context||!int(context.currentStage,1,10)||typeof context.duelsEnabled!=='boolean')fail('liberação do professor inválida');
  return context;
 }
 function peer(p,context){
  if(!p||!p.view||!p.view.progress||!p.view.duel)fail('visão H1 ausente');
  const key=alias(p.view.rosterKey);
  room(p.roomKey);
  if(p.online!==true||p.view.duel.eligible!==true||p.view.progress.awaitingPeers!==true||
   p.view.progress.currentStage!==context.currentStage||p.view.duel.mission!==context.currentStage)
   fail('aluno não está disponível na missão liberada');
  return {key,roomKey:p.roomKey};
 }
 function pair(from,to,context){
  teacher(context);
  if(!context.duelsEnabled)fail('duelos desabilitados pelo professor');
  const a=peer(from,context),b=peer(to,context);
  if(a.key===b.key)fail('autoconvite proibido');
  if(a.roomKey!==b.roomKey)fail('alunos de turmas diferentes');
  return {a,b};
 }
 function next(state,invitations){
  return freeze({schema:VERSION,revision:state.revision+1,nextId:state.nextId+1,invitations});
 }
 function replace(state,id,updated){
  return freeze({schema:VERSION,revision:state.revision+1,nextId:state.nextId,
   invitations:state.invitations.map(x=>x.id===id?updated:x)});
 }
 function get(state,id){
  if(!int(id,1,Number.MAX_SAFE_INTEGER))fail('convite inválido');
  const x=state.invitations.find(y=>y.id===id);
  if(!x)fail('convite inexistente');
  return x;
 }
 function createState(){return freeze({schema:VERSION,revision:0,nextId:1,invitations:[]})}
 function invite(state,{from,to,context,nowMs,expectedRevision,ttlMs=90000}){
  revision(state,expectedRevision);clock(nowMs);
  if(!int(ttlMs,1000,300000)||nowMs+ttlMs>Number.MAX_SAFE_INTEGER)fail('prazo inválido');
  const {a,b}=pair(from,to,context);
  if(state.invitations.length>=MAX_INVITES)fail('limite de histórico fictício');
  if(state.invitations.some(x=>ACTIVE.has(x.status)&&
    [x.from,x.to].some(k=>k===a.key||k===b.key)))fail('aluno já tem duelo ativo');
  const item={id:state.nextId,from:a.key,to:b.key,roomKey:a.roomKey,
   mission:context.currentStage,status:'pending',createdAt:nowMs,expiresAt:nowMs+ttlMs,resolvedAt:null};
  return next(state,[...state.invitations,item]);
 }
 function respond(state,{id,actor,decision,context,from,to,nowMs,expectedRevision}){
  revision(state,expectedRevision);clock(nowMs);alias(actor);
  const x=get(state,id);
  if(x.status!=='pending')fail('convite já respondido');
  if(nowMs>=x.expiresAt)fail('convite expirado; executar expire');
  if(actor!==x.to)fail('somente destinatário responde');
  if(decision!=='accept'&&decision!=='decline')fail('resposta inválida');
  const {a,b}=pair(from,to,context);
  if(x.from!==a.key||x.to!==b.key||x.roomKey!==a.roomKey||x.mission!==context.currentStage)
   fail('contexto de convite mudou');
  return replace(state,id,{...x,status:decision==='accept'?'accepted':'declined',resolvedAt:nowMs});
 }
 function cancel(state,{id,actor,nowMs,expectedRevision}){
  revision(state,expectedRevision);clock(nowMs);alias(actor);
  const x=get(state,id);
  if(x.status!=='pending'||actor!==x.from)fail('cancelamento não autorizado');
  if(nowMs>=x.expiresAt)fail('convite expirado; executar expire');
  return replace(state,id,{...x,status:'cancelled',resolvedAt:nowMs});
 }
 function expire(state,{nowMs,expectedRevision}){
  revision(state,expectedRevision);clock(nowMs);
  const changed=state.invitations.some(x=>x.status==='pending'&&nowMs>=x.expiresAt);
  if(!changed)return state;
  return freeze({schema:VERSION,revision:state.revision+1,nextId:state.nextId,
   invitations:state.invitations.map(x=>x.status==='pending'&&nowMs>=x.expiresAt?
    {...x,status:'expired',resolvedAt:nowMs}:x)});
 }
 function close(state,{id,actor,nowMs,expectedRevision}){
  revision(state,expectedRevision);clock(nowMs);alias(actor);
  const x=get(state,id);
  if(x.status!=='accepted'||(actor!==x.from&&actor!==x.to))fail('fechamento não autorizado');
  return replace(state,id,{...x,status:'closed',closedAt:nowMs});
 }
 function notificationsFor(state,actor){
  alias(actor);
  if(!state||state.schema!==VERSION||!Array.isArray(state.invitations))fail('estado inválido');
  return freeze(state.invitations.filter(x=>x.from===actor||x.to===actor).map(x=>({
   invitationId:x.id,mission:x.mission,peer:x.from===actor?x.to:x.from,status:x.status,
   role:x.to===actor?'recipient':'sender',
   actions:x.status==='pending'?(x.to===actor?['accept','decline']:['cancel']):[],
   arenaReady:x.status==='accepted'
  })));
 }
 function arenaWindowFor(state,{id,actor}){
  alias(actor);
  if(!state||state.schema!==VERSION||!Array.isArray(state.invitations))fail('estado inválido');
  const x=get(state,id);
  if(x.status!=='accepted'||(actor!==x.from&&actor!==x.to))fail('arena indisponível');
  // Descriptor only: caller must independently authorize and open a real window.
  return freeze({kind:'fictional-duel-window',invitationId:x.id,mission:x.mission,
   players:[x.from,x.to],roomKey:x.roomKey,readOnly:true});
 }
 return Object.freeze({VERSION,createState,invite,respond,cancel,expire,close,notificationsFor,arenaWindowFor});
});
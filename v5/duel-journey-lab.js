/* PIT Game Jam V5 — isolated read-only duel journey contract.
 * This is an IN-MEMORY fictional UI state machine, not a source of authorization.
 * No database, API, XP, classroom or student accounts.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_DUEL_JOURNEY_LAB=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const VERSION='pit-v5-fictional-journey-1';
 const phases=Object.freeze(['mission','invited','declined','accepted','entering','fighting','finished','returned']);
 const transitions=Object.freeze({
  mission:{invite:'invited'},declined:{invite:'invited'},returned:{invite:'invited'},
  invited:{accept:'accepted',decline:'declined'},
  accepted:{enter:'entering'},
  entering:{ready:'fighting',finish:'finished',leave:'accepted'},
  fighting:{finish:'finished',leave:'accepted'},
  finished:{return:'returned'}
 });
 function fail(message){throw Error('DUEL-JOURNEY-LAB: '+message)}
 function integer(n){return Number.isSafeInteger(n)&&n>0}
 function create(){return Object.freeze({schema:VERSION,revision:0,phase:'mission',invitationId:null,result:null})}
 function advance(state,event,detail={}){
  if(!state||state.schema!==VERSION||!phases.includes(state.phase)||!integer(state.revision+1))
   fail('estado inválido');
  const next=transitions[state.phase]?.[event];
  if(!next)fail('transição inválida: '+state.phase+' → '+String(event));
  let invitationId=state.invitationId,result=state.result;
  if(event==='invite'){
   if(!integer(detail.invitationId))fail('convite fictício obrigatório');
   invitationId=detail.invitationId;result=null;
  }
  if(event==='finish'){
   if(!detail||!['3d','text'].includes(detail.mode)||typeof detail.winner!=='string'||
      !/^trial-[a-z0-9_-]{1,60}$/.test(detail.winner)||
      !Number.isFinite(detail.seconds)||detail.seconds<0||detail.seconds>1e4)
    fail('resultado fictício inválido');
   if(!Array.isArray(detail.players)||detail.players.length!==2||!detail.players.includes(detail.winner)||
      new Set(detail.players).size!==2)fail('vencedor fora do duelo');
   result=Object.freeze({winner:detail.winner,mode:detail.mode,seconds:detail.seconds});
  }
  return Object.freeze({schema:VERSION,revision:state.revision+1,phase:next,invitationId,result});
 }
 return Object.freeze({VERSION,phases,create,advance});
});

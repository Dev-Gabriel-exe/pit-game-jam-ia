/* D.1a — OFFLINE fictional classroom preview, not a network client.
 * Real invitation decisions are validated by the PostgreSQL staging service.
 * No student credentials, account access, XP writes, scores or gameplay.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const avatars=[
  {id:'a',name:'Ayla',klass:'Guardião',icon:'◆',status:'submitted',available:true},
  {id:'b',name:'Breno',klass:'Arcanista',icon:'✦',status:'approved',available:true},
  {id:'c',name:'Caio',klass:'Guerreiro',icon:'⚔',status:'working',available:false},
  {id:'d',name:'Dara',klass:'Caçador',icon:'➶',status:'submitted',available:true}
 ];
 const statusNames={submitted:'Missão entregue',approved:'Missão aprovada',working:'Em atividade'};
 const inviteNames={pending:'Aguardando resposta',accepted:'Aceito — aguardando arena',
  declined:'Recusado',expired:'Expirado',cancelled:'Cancelado'};
 const state={actor:'a',teacherEnabled:true,players:avatars,invites:[],nextId:0,notification:''};
 const actor=()=>state.players.find(p=>p.id===state.actor);
 const player=id=>state.players.find(p=>p.id===id);
 const isDone=p=>p&&['submitted','approved'].includes(p.status);
 const active=i=>i.status==='pending'||i.status==='accepted';
 const involved=(i,p)=>i.from===p.id||i.to===p.id;
 const activeFor=p=>state.invites.find(i=>active(i)&&involved(i,p));
 const view=i=>i?{...i}:null;
 const mark=(text,kind='info')=>{state.notification=text;$('message').dataset.kind=kind};
 function expire(){
  let changed=false;
  for(const invite of state.invites){
   if(invite.status==='pending'&&Date.now()>=invite.expiresAt){
    invite.status='expired';changed=true;
   }
  }
  if(changed)render();
 }
 function available(p){
  return state.teacherEnabled&&isDone(p)&&p.available&&!activeFor(p);
 }
 function send(target){
  const from=actor(),to=player(target);
  if(!available(from)){mark('Você precisa concluir a missão, ficar disponível e não ter outro convite ativo.','error');render();return}
  if(!to||to.id===from.id||!available(to)){
   mark('Este colega não está disponível. Escolha outro jogador.','error');render();return;
  }
  const invite={id:'duel-'+(++state.nextId),from:from.id,to:to.id,
   status:'pending',expiresAt:Date.now()+45000,seed:null};
  state.invites.unshift(invite);
  mark('Convite enviado para '+to.name+'! Aguarde a resposta.','success');
  render();
 }
 function decide(id,action){
  expire();
  const i=state.invites.find(x=>x.id===id),me=actor();
  if(!i){mark('Convite não encontrado.','error');render();return}
  if(action==='accept'||action==='decline'){
   if(i.to!==me.id||i.status!=='pending'){
    mark('Somente o destinatário pode responder um convite pendente.','error');render();return
   }
   if(action==='accept'&&(!availableWithoutSlot(me)||!availableWithoutSlot(player(i.from)))){
    mark('Um dos personagens não está mais disponível para duelar.','error');render();return
   }
   i.status=action==='accept'?'accepted':'declined';
   if(action==='accept')i.seed=17703+i.id.length+state.nextId;
   mark(action==='accept'?'Convite aceito! Os dois alunos foram pareados.':'Convite recusado. O colega poderá desafiar outra pessoa.','success');
  }else if(action==='cancel'){
   if(!active(i)||!involved(i,me)||(i.status==='pending'&&i.from!==me.id)){
    mark('Este convite não pode ser cancelado por você.','error');render();return
   }
   i.status='cancelled';i.seed=null;mark('Convite cancelado. Ambos podem receber novos desafios.','success');
  }else if(action==='expire'){
   if(i.status!=='pending'){mark('Este convite não está pendente.','error');render();return}
   i.status='expired';mark('Convite expirou. Você pode convidar outro colega.','info');
  }
  render();
 }
 function availableWithoutSlot(p){
  return state.teacherEnabled&&isDone(p)&&p.available;
 }
 function changeActor(id){
  if(!player(id))return;
  state.actor=id;state.notification='';render();
 }
 function toggleAvailable(want){
  const me=actor();
  if(want&&!state.teacherEnabled){mark('O professor ainda não liberou duelos.','error');render();return}
  if(want&&!isDone(me)){mark('Primeiro termine e entregue a missão atual.','error');render();return}
  me.available=want;
  if(!want)for(const i of state.invites)if(involved(i,me)&&active(i)){i.status='cancelled';i.seed=null}
  mark(want?'Você está disponível para receber desafios.':'Disponibilidade desligada e convites pendentes cancelados.','success');
  render();
 }
 function teacher(want){
  state.teacherEnabled=want;
  if(!want){
   for(const i of state.invites)if(active(i)){i.status='cancelled';i.seed=null}
   mark('Duelos pausados pelo professor. Convites em aberto foram cancelados.','info');
  }else mark('O professor liberou os duelos para esta missão.','success');
  render();
 }
 function describe(i){
  const outgoing=i.from===state.actor,other=player(outgoing?i.to:i.from);
  return {outgoing,other,heading:outgoing?'Desafio para '+other.name:'Convite de '+other.name};
 }
 function render(){
  expireQuiet();
  const me=actor(),invitations=state.invites.filter(i=>involved(i,me)),
   current=invitations.find(active),latest=invitations[0];
  $('players').innerHTML=state.players.map(p=>
   '<button type="button" class="player-switch" data-action="actor" data-id="'+p.id+
   '" aria-pressed="'+(state.actor===p.id)+'"><span class="avatar" aria-hidden="true">'+
   p.icon+'</span><strong>'+p.name+'</strong><small>'+p.klass+' · '+
   (p.status==='working'?'Em atividade':'Missão concluída')+'</small></button>'
  ).join('');
  $('actorStatus').textContent=statusNames[me.status];
  $('actorAvailability').textContent=!state.teacherEnabled?'Duelos pausados':
   !isDone(me)?'Conclua a missão':activeFor(me)?'Ocupado':me.available?'Disponível':'Indisponível';
  $('teacherToggle').checked=state.teacherEnabled;
  $('availableToggle').checked=me.available;
  $('availableToggle').disabled=!state.teacherEnabled||!isDone(me);
  const peers=state.players.filter(p=>p.id!==me.id&&available(p));
  $('peerList').innerHTML=available(me)
   ?peers.length?peers.map(p=>
    '<div class="peer"><span class="avatar" aria-hidden="true">'+p.icon+
    '</span><div class="description"><strong>'+p.name+'</strong><small>'+
    p.klass+' · '+statusNames[p.status]+' · Online</small></div>'+
    '<button data-action="send" data-id="'+p.id+'" type="button">⚔ Desafiar</button></div>'
   ).join(''):'<div class="duel-empty">Nenhum colega disponível agora. Aguarde mais jogadores terminarem.</div>'
   :'<div class="duel-empty">'+(!state.teacherEnabled?'O professor pausou os duelos.':
    !isDone(me)?'Conclua e entregue a missão antes de entrar na arena de espera.':
    activeFor(me)?'Você já participa de um convite. Responda ou aguarde a conclusão.':
    'Ative “Estou disponível para duelos” para encontrar colegas.')+'</div>';
  let notice=state.notification;
  if(!notice&&current){
   const d=describe(current);
   notice=current.status==='pending'
    ?d.outgoing?'Aguardando '+d.other.name+' aceitar ou recusar o desafio.':
      d.other.name+' enviou um convite para duelar com você!'
    :'Duelo aceito! Os dois personagens foram pareados.';
  }
  if(!notice&&latest){
   notice=latest.status==='declined'?'Convite recusado. Tente outro colega.':
    latest.status==='expired'?'O convite expirou. Escolha outro rival.':
    latest.status==='cancelled'?'Convite cancelado. Você está livre para desafiar alguém.':
    'Escolha seu próximo adversário.';
  }
  $('message').textContent=notice||'Desafie um colega que já terminou a missão.';
  if(!state.notification)$('message').dataset.kind=latest?.status==='declined'?'error':'info';
  const inbox=current?[current]:[];
  $('inbox').innerHTML=inbox.length?inbox.map(i=>{
   const d=describe(i);
   const remaining=Math.max(0,Math.ceil((i.expiresAt-Date.now())/1000));
   const controls=i.status==='accepted'
    ?'<button data-action="cancel" data-id="'+i.id+'" class="decline">Sair do pareamento</button>'
    :d.outgoing
      ?'<button data-action="cancel" data-id="'+i.id+'" class="decline">Cancelar</button>'+
       '<button data-action="expire" data-id="'+i.id+'">Simular expiração</button>'
      :'<button data-action="accept" data-id="'+i.id+'">✓ Aceitar</button>'+
       '<button class="decline" data-action="decline" data-id="'+i.id+'">✕ Recusar</button>';
   return '<div class="duel-card"><h3>'+d.heading+'</h3><p>'+
    (i.status==='pending'?'Convite pendente · '+remaining+'s até expirar.':
     'Duelo aceito. A arena compartilhada será implementada na próxima fase.')+
    '</p><div class="duel-actions">'+controls+'</div></div>';
  }).join(''):'<div class="duel-empty">Nenhum convite ativo.</div>';
  $('duelHistory').innerHTML=invitations.length?invitations.slice(0,5).map(i=>{
   const d=describe(i);
   return '<div class="history-row">'+(d.outgoing?'Enviado a ':'Recebido de ')+d.other.name+
    '<small>'+inviteNames[i.status]+'</small></div>';
  }).join(''):'<p class="muted">Sem duelos anteriores nesta demonstração.</p>';
  const accepted=invitations.find(i=>i.status==='accepted');
  $('duelStage').hidden=!accepted;
  if(accepted){
   $('duelStage').innerHTML='<div class="eyebrow">DESAFIO ACEITO · FASE D.1a</div>'+
    '<h2>Os dois jogadores estão prontos</h2><div class="versus">'+
    player(accepted.from).name+' <span>VS</span> '+player(accepted.to).name+'</div>'+
    '<p>Convite sincronizado conceitualmente. A partida 3D real e o resultado compartilhado fazem parte da próxima fase D.1b.</p>';
  }
 }
 function expireQuiet(){
  for(const i of state.invites){
   if(i.status==='pending'&&Date.now()>=i.expiresAt)i.status='expired';
  }
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');if(!button)return;
  const {action,id}=button.dataset;
  if(action==='actor')changeActor(id);
  else if(action==='send')send(id);
  else decide(id,action);
 });
 $('availableToggle').addEventListener('change',event=>toggleAvailable(event.target.checked));
 $('teacherToggle').addEventListener('change',event=>teacher(event.target.checked));
 window.PIT_V5_DUEL_D1A_LAB=Object.freeze({get snapshot(){
  return {actor:state.actor,teacherEnabled:state.teacherEnabled,
   players:state.players.map(p=>({...p})),invites:state.invites.map(view)}
 }});
 setInterval(()=>{if(state.invites.some(i=>i.status==='pending')){expireQuiet();render()}},1000);
 render();
})();

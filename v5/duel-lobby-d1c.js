/* D.1c — unified invite-to-replay staging flow.
 * Auth is injected ONLY by a local, trusted fixture. Never access real V3
 * sessions, grade records, XP or browser storage. No tokens in URL.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 const clean=s=>String(s??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 })[ch]).slice(0,150);
 const config=window.__PIT_V5_D1C_STAGING;
 const local=['localhost','127.0.0.1'].includes(location.hostname);
 let client=null,latest=null,poll=null,heartbeat=null,lock=false,battleId=null,
  lastNotice=null,lastSignature='';
 const state={connected:false,view:'lobby',requests:0,polls:0,
  errors:0,activeInvite:null,teacherEnabled:false,peers:0,hasToken:false};
 function alert(message,kind='info'){
  $('feedback').textContent=message;
  $('feedback').dataset.kind=kind;
 }
 const eligible=s=>['submitted','approved'].includes(s);
 const statusName=s=>({
  working:'Em atividade',submitted:'Missão entregue',
  approved:'Missão aprovada',revision:'Ajustes pendentes'
 }[s]||'Aguardando progresso');
 const inviteName=s=>({
  pending:'Aguardando resposta',accepted:'Aceito — partida iniciada',
  declined:'Convite recusado',expired:'Convite expirado',
  cancelled:'Convite cancelado',finished:'Batalha concluída'
 }[s]||'Convite');
 function snapshot(){return {
  connected:state.connected,view:state.view,requests:state.requests,
  polls:state.polls,errors:state.errors,activeInvite:state.activeInvite,
  teacherEnabled:state.teacherEnabled,peers:state.peers,
  optedIn:latest?.optedIn??false,busy:latest?.busy??false,
  mission:latest?.stage??null,eligibility:latest?.eligibility??null,
  lastStatus:latest?.invites?.[0]?.status??null,hasToken:false
 }}
 Object.defineProperty(window,'PIT_V5_D1C_LOBBY',{
  value:Object.freeze({get snapshot(){return snapshot()}}),
  configurable:false,writable:false
 });
 async function use(action,payload=null){
  if(!client)throw Error('Sem conexão com o laboratório.');
  if(lock)throw Error('Outra operação ainda está em andamento.');
  lock=true;renderButtons();
  try{
   state.requests++;
   const out=await({
    state:()=>client.state(),
    available:()=>client.available(payload),
    invite:()=>client.invite(payload),
    accept:()=>client.accept(payload),
    decline:()=>client.decline(payload),
    cancel:()=>client.cancel(payload)
   })[action]();
   return out;
  }finally{lock=false;renderButtons()}
 }
 function renderButtons(){
  $('refresh').disabled=!client||lock;
  $('availableToggle').disabled=!client||lock||!latest?.enabled||
   !eligible(latest?.eligibility);
 }
 function render(){
  if(!latest){renderButtons();return}
  state.teacherEnabled=latest.enabled===true;
  state.peers=latest.peers?.length??0;
  $('mission').textContent='Missão '+latest.stage;
  $('progress').textContent=statusName(latest.eligibility);
  $('teacherStatus').textContent=latest.enabled?'LIBERADOS':'PAUSADOS';
  $('availableToggle').checked=latest.optedIn===true;
  $('availabilityHint').textContent=!latest.enabled?
   'Professor pausou novos duelos. Partidas já iniciadas continuam até o fim.':
   !eligible(latest.eligibility)?
    'Entregue a missão antes de receber ou enviar convites.':
   latest.busy?'Você já possui um convite ou uma batalha em andamento.':
   latest.optedIn?'Você aparece para colegas enquanto esta página estiver ativa.':
   'Ative a disponibilidade para aparecer na lista de colegas.';
  renderButtons();
  const peers=latest.peers||[];
  $('peers').innerHTML=latest.enabled&&latest.optedIn&&!latest.busy
   ?peers.length?peers.map(p=>{
    const id=UUID.test(p.id)?p.id:'';
    return '<div class="peer"><span class="avatar" aria-hidden="true">⚔</span>'+
     '<div class="description"><strong>'+clean(p.name)+'</strong><small>'+
     'Missão '+latest.stage+' concluída · <span class="online">Disponível</span></small></div>'+
     '<button type="button" data-action="invite" data-id="'+id+'" '+
     (!id||lock?'disabled':'')+'>Desafiar</button></div>';
   }).join(''):'<div class="duel-empty">Nenhum colega disponível. Aguarde outros terminarem a missão.</div>'
   :'<div class="duel-empty">'+(!latest.enabled?'Duelos pausados pelo professor.':
    !eligible(latest.eligibility)?'Termine a missão para acessar os desafios.':
    latest.busy?'Você já está em um convite ou duelo.':
    'Ative sua disponibilidade acima para procurar rivais.')+'</div>';
  const invites=Array.isArray(latest.invites)?latest.invites:[];
  const active=invites.find(i=>i.status==='pending'||i.status==='accepted');
  state.activeInvite=active?.id??null;
  if(active){
   const peer=clean(active.peerName);
   const remaining=Math.max(0,Math.ceil((Date.parse(active.expiresAt)-Date.now())/1000));
   const canRespond=active.status==='pending'&&!active.outgoing;
   const buttons=canRespond?
    '<button data-action="accept" data-id="'+clean(active.id)+'">✓ Aceitar</button>'+
    '<button class="decline" data-action="decline" data-id="'+clean(active.id)+'">✕ Recusar</button>':
    active.status==='pending'&&active.outgoing?
     '<button class="decline" data-action="cancel" data-id="'+clean(active.id)+'">Cancelar convite</button>':
     '<span class="actor-pill">Confronto sincronizado no Coliseu</span>';
   $('currentInvite').innerHTML=
    '<div class="duel-card '+(active.status==='accepted'?'accepted':'')+'">'+
    '<h3>'+(!active.outgoing?'⚔ '+peer+' te desafiou!':'Convite enviado a '+peer)+'</h3>'+
    '<p>'+inviteName(active.status)+
    (active.status==='pending'?' · <span class="countdown">'+remaining+'s</span>':'')+
    '</p><div class="duel-actions">'+buttons+'</div></div>';
  }else $('currentInvite').innerHTML='<div class="duel-empty">Nenhum convite ativo.</div>';
  $('history').innerHTML=invites.length?invites.slice(0,8).map(i=>
   '<div class="history-row">'+(i.outgoing?'Desafio para ':'Convite de ')+
   clean(i.peerName)+'<small>'+inviteName(i.status)+'</small></div>'
  ).join(''):'<p class="muted">Nenhum desafio anterior.</p>';
  if(active?.status==='accepted'){
   void enterBattle(active.id);
  }else if(!active&&battleId&&invites.some(i=>i.id===battleId&&i.status==='finished')){
   // Keep the final result visible until the user explicitly returns.
  }
  const key=invites[0]?.id+':'+invites[0]?.status;
  if(invites[0]&&key!==lastSignature){
   lastSignature=key;
   const i=invites[0];
   if(i.status==='pending'&&!i.outgoing)alert('⚔ '+i.peerName+' te convidou para um duelo!','success');
   else if(i.status==='declined'&&i.outgoing)alert('Convite recusado. Escolha outro colega.','error');
   else if(i.status==='expired')alert('O convite expirou. Você já pode tentar outro.','info');
   else if(i.status==='accepted')alert('Convite aceito! Abrindo a arena para os dois jogadores.','success');
   else if(i.status==='finished')alert('Batalha concluída. Você pode desafiar outro colega.','success');
  }
 }
 async function enterBattle(id){
  if(!UUID.test(id)||!client||!config||battleId===id)return;
  battleId=id;
  // Same-origin child reads this injected, short-lived in-memory transport.
  // The only URL data is the non-secret invitation UUID.
  window.__PIT_V5_D1C_EMBED=Object.freeze({
   enabled:true,inviteId:id,endpoint:config.matchEndpoint,
   tokenProvider:config.tokenProvider
  });
  const frame=$('arenaFrame');
  frame.src='./duel-replay-d1b.html?invite='+encodeURIComponent(id);
  $('arenaPanel').hidden=false;
  $('lobbyLayout').hidden=true;
  state.view='battle';
  alert('Preparando a batalha compartilhada…','success');
 }
 function exitBattle(){
  $('arenaFrame').removeAttribute('src');
  $('arenaPanel').hidden=true;
  $('lobbyLayout').hidden=false;
  battleId=null;state.view='lobby';
  delete window.__PIT_V5_D1C_EMBED;
  void refresh();
 }
 async function refresh(){
  if(!client||lock||document.hidden)return;
  try{
   state.polls++;
   latest=await use('state');
   state.connected=true;
   render();
  }catch(e){
   state.errors++;
   alert('Falha ao atualizar: '+e.message,'error');
  }
 }
 async function act(action,value){
  if(!client||lock)return;
  if(!['invite','accept','decline','cancel'].includes(action)||
   !UUID.test(value||''))return;
  try{
   await use(action,value);
   alert(action==='invite'?'Convite enviado. Aguardando resposta…':
    action==='accept'?'Aceito! Entrando na arena…':
    action==='decline'?'Convite recusado. O colega pode tentar outro jogador.':
    'Convite cancelado.','success');
   await refresh();
  }catch(e){state.errors++;alert(e.message,'error');await refresh()}
 }
 $('peers').addEventListener('click',ev=>{
  const btn=ev.target.closest('button[data-action]');if(btn)void act(btn.dataset.action,btn.dataset.id);
 });
 $('currentInvite').addEventListener('click',ev=>{
  const btn=ev.target.closest('button[data-action]');if(btn)void act(btn.dataset.action,btn.dataset.id);
 });
 $('availableToggle').addEventListener('change',async ev=>{
  const checked=ev.target.checked;
  try{await use('available',checked);alert(checked?
    'Você está disponível para receber convites.':
    'Disponibilidade encerrada.','success')}
  catch(e){alert(e.message,'error');state.errors++}
  await refresh();
 });
 $('refresh').addEventListener('click',()=>void refresh());
 $('backToLobby').addEventListener('click',exitBattle);
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&client)void refresh();
 });
 if(!local||!config||config.enabled!==true||
   typeof config.tokenProvider!=='function'){
  alert('D.1c aguardando sessão de homologação local. Para ver o visual, abra a prévia fictícia D.1a.','info');
  return;
 }
 try{
  client=window.PIT_V5_D1C_CLIENT.createClient({
   duelEndpoint:config.duelEndpoint,matchEndpoint:config.matchEndpoint,
   tokenProvider:config.tokenProvider
  });
  alert('Conectando à turma fictícia de homologação…');
  void refresh();
  poll=setInterval(()=>{if(!document.hidden)void refresh()},4000);
  heartbeat=setInterval(async()=>{
   if(!document.hidden&&latest?.optedIn&&latest?.enabled&&!lock){
    try{await use('available',true)}catch{}
   }
  },25000);
  window.addEventListener('pagehide',()=>{
   clearInterval(poll);clearInterval(heartbeat);
   delete window.__PIT_V5_D1C_EMBED;
  });
 }catch(e){alert('Configuração de laboratório inválida: '+e.message,'error')}
})();

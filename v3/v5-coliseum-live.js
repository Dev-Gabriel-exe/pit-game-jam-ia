/* Native V5 live coliseum controls. Session secrets stay only in the parent page's memory.
 * Match viewer receives a validated public-to-room snapshot, not authentication tokens.
 */
(function(){
 'use strict';
 const BASE='https://pit-game-jam-chat.vercel.app/api/coliseum';
 const $=(root,query)=>root.querySelector(query);
 const esc=value=>String(value??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x])).slice(0,160);
 let live=null;
 const isUUID=s=>/^[0-9a-f-]{36}$/i.test(String(s||''));
 const seen=new Set();
 const recent=x=>{const age=Date.now()-Date.parse(x?.createdAt||'');return age>=-30000&&age<=180000};
 const seenKey=(ctx,id)=>String(ctx?.room||'')+'|'+String(ctx?.studentId||'')+'|'+id;
 const alreadySeen=(ctx,id)=>{const key=seenKey(ctx,id);try{return seen.has(key)||sessionStorage.getItem('pit_live_open_'+key)==='1'}catch{return seen.has(key)}};
 const markSeen=(ctx,id)=>{const key=seenKey(ctx,id);seen.add(key);try{sessionStorage.setItem('pit_live_open_'+key,'1')}catch{}};
 function sessionToken(x){return x.role==='student'?x.tokenProvider?.():x.teacherPinProvider?.()}
 function activeRoom(x){return x.room==='PITGAME26B'?'PITGAME26B':'PITGAME26'}
 async function request(x,action,body=null,id=null){
  const secret=sessionToken(x);
  if(!secret||x.visualPreview)throw Error('Entre como aluno ou professor para acessar o Coliseu.');
  const u=new URL(BASE);u.searchParams.set('action',action);if(id)u.searchParams.set('id',id);
  const headers={'Content-Type':'application/json'};
  if(x.role==='student')headers['X-PIT-Student-Token']=secret;
  else{headers['X-PIT-Teacher-Pin']=secret;headers['X-PIT-Room']=activeRoom(x)}
  const response=await fetch(u,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined,
   cache:'no-store',signal:AbortSignal.timeout(24000)});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||!result.ok)throw Error(result.error||'Não foi possível contatar o Coliseu.');
  return result;
 }
 function banner(text,kind='info'){
  if(!live)return;
  live.note={text,kind};
  const node=$(live.root,'[data-live-note]');
  if(node){node.textContent=text;node.dataset.kind=kind}
 }
 function clear(){
  if(!live)return;
  clearInterval(live.timer);
  clearInterval(live.heartbeat);
  live.root.replaceChildren();
  live=null;
 }
 async function refresh(){
  const a=live;
  if(!a||a.busy||a.viewing||document.hidden)return;
  try{
   a.data=await request(a.ctx,'state');
   if(live!==a)return;
   a.errorCount=0;render();
  }catch(e){
   if(live!==a)return;
   a.errorCount++;banner('Falha ao sincronizar: '+e.message,'error');
  }
 }
 async function action(kind,body){
  const a=live;if(!a||a.busy)return;
  a.busy=true;
  const buttons=a.root.querySelectorAll('button, input[type=checkbox]');
  buttons.forEach(el=>el.disabled=true);
  try{
   const data=await request(a.ctx,kind,body);
   if(live!==a)return;
   banner(kind==='invite'?'Convite enviado!':kind==='respond'?'Resposta registrada.':
    kind==='arena-start'?'Arena iniciada e registrada no Neon.':'Controle atualizado.','success');
   a.busy=false;
   if(kind==='respond'&&data.matchId)return viewMatch(data.matchId);
   if(kind==='arena-start'&&data.matchId)return viewMatch(data.matchId);
   await refresh();
  }catch(e){if(live===a){a.busy=false;banner(e.message,'error');render()}}
 }
 async function viewMatch(id){
  const a=live;if(!a||!isUUID(id))return;
  a.busy=true;
  try{
   const result=await request(a.ctx,'match',null,id);
   if(live!==a)return;
   a.viewing=result.match;
   if(a.ctx.role==='student')markSeen(a.ctx,id);
   a.busy=false;
   a.root.innerHTML='<div class="pit-live-toolbar"><button type="button" data-back>← Voltar ao Coliseu</button>'+
    '<div><strong>⚔ '+(a.viewing.kind==='arena'?'ARENA M'+a.viewing.mission:'DUELO 1 × 1')+'</strong>'+
    '<small>Confronto compartilhado · resultado validado pelo servidor</small></div></div>'+
    '<iframe class="pit-live-replay" title="Replay 3D do combate" src="./v5/coliseum-live.html?v=20261103-duel-autostart1" allow="autoplay; fullscreen"></iframe>';
   const frame=$(a.root,'iframe');
   frame.addEventListener('load',()=>frame.contentWindow?.postMessage({
    type:'PIT_COLISEUM_REPLAY',match:a.viewing,
    studentHeroId:a.ctx.role==='student'?a.ctx.studentId:null},location.origin),{once:true});
   $(a.root,'[data-back]').onclick=()=>{
    // Dispose of the WebGL iframe immediately, before fetching the lobby again.
    // Otherwise its render loop can keep consuming GPU memory behind the lobby.
    frame.remove();a.viewing=null;
    a.root.innerHTML='<p role="status" data-live-note>Retornando ao salão de duelos…</p>';
    void refresh();
   };
  }catch(e){if(live===a){a.viewing=null;a.busy=false;banner(e.message,'error');render()}}
 }
 function render(){
  const a=live;if(!a||!a.data||a.viewing||a.busy)return;
  const d=a.data,teacher=a.ctx.role==='teacher',room=activeRoom(a.ctx);
  // Both participants automatically enter a freshly accepted shared duel.
  // Fresh classroom arenas also open for students already viewing the arena tab.
  // A session-scoped marker prevents replay loops when returning to the lobby.
  if(!teacher&&a.tab==='duel'){
   const accepted=(d.invites||[]).find(i=>i.status==='accepted'&&isUUID(i.matchId)&&recent(i)&&!alreadySeen(a.ctx,i.matchId));
   if(accepted){void viewMatch(accepted.matchId);return}
  }
  if(!teacher&&a.tab==='arena'){
   const justStarted=(d.arena||[]).find(i=>isUUID(i.id)&&recent(i)&&!alreadySeen(a.ctx,i.id));
   if(justStarted){void viewMatch(justStarted.id);return}
  }
  const note=a.note?'<p role="status" data-live-note data-kind="'+esc(a.note.kind)+'">'+esc(a.note.text)+'</p>':
   '<p role="status" data-live-note>Os controles são sincronizados com o servidor desta turma.</p>';
  const head='<div class="pit-live-head"><div><small>✦ SALÃO DO COLISEU · '+(room==='PITGAME26'?'TURMA 1':'TURMA 2')+'</small>'+
   '<h3>'+(a.tab==='collective'?'🏟 Arenas coletivas':teacher?'⚔ Controle docente de duelos':a.tab==='arena'?'🏟 Arenas da turma':'⚔ Desafios entre heróis')+'</h3>'+
   '<p>Missão liberada: '+String(d.stage).padStart(2,'0')+' · Nenhuma batalha concede XP ou altera as avaliações.</p></div>'+
   '<button type="button" data-refresh>↻ Atualizar</button></div>'+note;
  let content='';
  if(teacher&&a.tab==='teacher'){
   content='<section class="pit-live-panel"><h4>Disponibilidade dos duelos</h4>'+
    '<p>Somente alunos da mesma turma que entregaram a missão atual e salvaram seu herói podem se desafiar.</p>'+
    '<strong class="pit-live-state">'+(d.duelsEnabled?'● DUELOS LIBERADOS':'Ⅱ DUELOS PAUSADOS')+'</strong>'+
    '<div class="pit-live-actions"><button type="button" data-duels="true" '+(d.duelsEnabled?'disabled':'')+'>⚔ Liberar duelos</button>'+
    '<button type="button" data-duels="false" '+(!d.duelsEnabled?'disabled':'')+'>Ⅱ Pausar novos duelos</button></div>'+
    '<small>'+d.pendingInvites+' convite(s) pendente(s). Pausar impede novos convites e aceites, mas mantém os confrontos já iniciados.</small></section>';
  }else if(teacher&&a.tab==='collective'){
   const roster=d.students||[],available=roster.filter(x=>x.heroSaved),m10=available.filter(x=>x.approved===10);
   content='<div class="pit-live-grid">'+[5,10].map(m=>{
    const record=d.arena?.find(x=>x.mission===m),ready=m===5?available:m10;
    const disabled=!record&&(d.stage<m||ready.length<2);
    return '<section class="pit-live-panel"><span class="pit-live-mission">MISSÃO '+String(m).padStart(2,'0')+'</span>'+
     '<h4>'+(m===5?'Primeira arena':'Grande final')+'</h4><p>'+ready.length+' de '+roster.length+' aluno(s) com personagem apto(s)'+
     (m===10?' (10 missões aprovadas)':'')+'.</p>'+
     '<button type="button" '+(disabled?'disabled ':'')+(record?'data-view="'+esc(record.id)+'"':'data-start="'+m+'"')+'>'+
     (record?'▶ Rever arena M'+m:'▶ Iniciar Arena M'+m)+'</button>'+
     '<small>'+(record?'Partida registrada. '+record.fighters+' combatentes.':d.stage<m?
      'Disponível após o professor liberar a missão '+m+'.':ready.length<2?
      'São necessários pelo menos dois personagens aptos.':'Até 30 heróis · mesma turma · batalha automática 3D')+'</small></section>';
   }).join('')+'</div>'+
    '<section class="pit-live-panel"><h4>Alunos e personagens</h4>'+
    '<div class="pit-live-roster">'+roster.map(x=>'<div>'+esc(x.name)+'<span>'+
     (x.heroSaved?'✦ Herói salvo · ':'Sem herói salvo · ')+x.approved+'/10 aprovadas</span></div>').join('')+'</div></section>';
  }else if(!teacher&&a.tab==='arena'){
   const arenas=d.arena||[];
   content='<section class="pit-live-panel"><h4>Confrontos iniciados pelo professor</h4>'+
    (arenas.length?arenas.map(x=>'<div class="pit-live-row"><span>🏟 Arena da Missão '+x.mission+'</span>'+
     '<button type="button" data-view="'+esc(x.id)+'">▶ Assistir em 3D</button></div>').join(''):
     '<p>Aguardando o professor iniciar a Arena M5 ou a Arena M10. Volte aqui quando ela for liberada.</p>')+'</section>';
  }else{
   const eligible=d.eligible&&d.heroSaved,canPlay=eligible&&d.duelsEnabled;
   const active=(d.invites||[]).find(x=>x.status==='pending');
   const history=(d.invites||[]).slice(0,8);
   const notice=!d.duelsEnabled?'O professor ainda não liberou os duelos.':
    !d.heroSaved?'Salve seu personagem na aba Meu Herói antes de duelar.':
    !d.eligible?'Envie a atividade da missão atual ou aguarde a aprovação.':
    d.busy?'Existe um convite pendente para você.':d.optedIn?'Você aparece na lista de rivais desta turma.':
    'Ative a disponibilidade para encontrar colegas.';
   content='<section class="pit-live-panel"><strong class="pit-live-state">'+
    (canPlay?'⚔ DUELAR DISPONÍVEL':'Ⅱ AGUARDANDO LIBERAÇÃO')+'</strong><p>'+esc(notice)+'</p>'+
    '<div class="pit-live-actions"><button data-available="'+(!d.optedIn)+'" type="button" '+
    (!canPlay?'disabled':'')+'>'+(d.optedIn?'◉ Sair da lista de rivais':'✦ Ficar disponível para duelos')+'</button></div></section>'+
    (active?'<section class="pit-live-panel pit-live-invite"><h4>'+
      (active.outgoing?'Convite enviado para ':'⚔ Você recebeu um desafio de ')+esc(active.peerName)+'</h4>'+
      '<p>Aguardando resposta · expira automaticamente em aproximadamente 60 segundos.</p>'+
      '<div class="pit-live-actions">'+(active.outgoing?
        '<button type="button" data-respond="cancel" data-invite="'+esc(active.id)+'">Cancelar convite</button>':
        '<button type="button" data-respond="accept" data-invite="'+esc(active.id)+'">✓ Aceitar desafio</button>'+
        '<button type="button" data-respond="decline" data-invite="'+esc(active.id)+'">✕ Recusar</button>')+'</div></section>':'')+
    '<section class="pit-live-panel"><h4>Rivais disponíveis na mesma turma</h4>'+
    (d.optedIn&&!d.busy&&canPlay&&(d.peers||[]).length?
      d.peers.map(p=>'<div class="pit-live-row"><span>⚔ '+esc(p.name)+'</span>'+
       '<button type="button" data-invite="'+esc(p.id)+'">Desafiar</button></div>').join(''):
      '<p>Nenhum rival disponível agora. Os colegas devem ativar a disponibilidade no próprio computador.</p>')+
    '</section><section class="pit-live-panel"><h4>Convites e confrontos anteriores</h4>'+
    (history.length?history.map(i=>'<div class="pit-live-row"><span>'+esc(i.peerName)+' · '+
      (i.outgoing?'enviado':'recebido')+' · '+esc(i.status)+'</span>'+
      (i.matchId?'<button type="button" data-view="'+esc(i.matchId)+'">▶ Rever duelo</button>':'')+
      '</div>').join(''):'<p>Ainda não há duelos nesta conta.</p>')+'</section>';
  }
  a.root.innerHTML=head+content;
  $(a.root,'[data-refresh]')?.addEventListener('click',()=>void refresh());
  a.root.querySelectorAll('[data-view]').forEach(btn=>btn.onclick=()=>void viewMatch(btn.dataset.view));
  a.root.querySelectorAll('[data-start]').forEach(btn=>btn.onclick=()=>void action('arena-start',{mission:Number(btn.dataset.start)}));
  a.root.querySelectorAll('[data-duels]').forEach(btn=>btn.onclick=()=>void action('duels',{enabled:btn.dataset.duels==='true'}));
  a.root.querySelectorAll('[data-available]').forEach(btn=>btn.onclick=()=>void action('presence',{available:btn.dataset.available==='true'}));
  a.root.querySelectorAll('[data-invite]').forEach(btn=>btn.onclick=()=>void action('invite',{targetId:btn.dataset.invite}));
  a.root.querySelectorAll('[data-respond]').forEach(btn=>btn.onclick=()=>void action('respond',{decision:btn.dataset.respond,inviteId:btn.dataset.invite}));
 }
 function mount(root,ctx,tab){
  if(!root||!ctx?.authenticated||ctx.visualPreview)return false;
  const key=ctx.role+'|'+activeRoom(ctx)+'|'+(ctx.studentId||'professor')+'|'+tab;
  if(live?.key===key&&live.root===root){live.ctx=ctx;return true}
  clear();
  live={root,ctx,tab,key,data:null,note:null,busy:false,viewing:null,errorCount:0,timer:null};
  root.innerHTML='<div class="pit-live-head"><h3>⚔ Conectando ao Coliseu...</h3></div><p role="status" data-live-note>Sincronizando sua turma.</p>';
  live.timer=setInterval(()=>{if(!document.hidden)void refresh()},4500);
  // Availability is temporary; renew opt-in every 25 seconds while this panel is visible.
  live.heartbeat=setInterval(async()=>{
   const current=live;
   if(!current||document.hidden||current.busy||current.ctx.role!=='student'||
      current.tab!=='duel'||!current.data?.optedIn||!current.data?.duelsEnabled)return;
   try{await request(current.ctx,'presence',{available:true})}catch(e){banner('Presença temporária: '+e.message,'error')}
  },25000);
  void refresh();
  return true;
 }
 window.PIT_V5_LIVE=Object.freeze({mount,unmount:clear});
})();

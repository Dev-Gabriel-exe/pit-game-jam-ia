/* PIT Game Jam IA · M04-03 · Primeiro Jogável · aluno
 * Continua os dados das missões 01, 02 e 03; usa o guia oficial GDevelop
 * da Missão 04 e não fabrica execução nem resultado de Preview.
 */
(function(){
 'use strict';
 const keys=['command','response','boundary','retest','saved','issue'];
 const config={
  command:{min:6,max:56,label:'Qual entrada você usou?',help:'Informe o comando que realmente testou: setas, WASD, Espaço, clique ou toque.'},
  response:{min:12,max:94,label:'Qual resposta apareceu no Preview?',help:'Descreva uma mudança observada na execução. Não basta dizer “funcionou”.'},
  boundary:{min:12,max:93,label:'Como funcionou o obstáculo ou limite?',help:'Explique o que aconteceu ao tentar atravessar a parede, o chão, a área clicável ou outra restrição.'},
  retest:{min:12,max:84,label:'O que mudou ao repetir o teste?',help:'Execute de novo, incluindo um caso que não deveria ativar a ação. Compare os resultados.'},
  saved:{min:6,max:58,label:'Onde salvou o projeto atualizado?',help:'Indique o projeto na nuvem ou o caminho/nome do arquivo local.'},
  issue:{min:0,max:52,label:'Qual erro encontrou e como resolveu? (opcional)',help:'Escreva um diagnóstico real. Se não houve erro, pode deixar vazio.'}
 };
 const genres={
  'Plataforma':1,
  'Puzzle':2,
  'Narrativa interativa':2
 };
 const names=['RPG / EXPLORAÇÃO','PLATAFORMA','PUZZLE / NARRATIVA','3D / PRIMEIRA PESSOA'];
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const clean=x=>String(x??'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim();
 const blank=()=>({route:null,command:'',response:'',boundary:'',retest:'',saved:'',issue:'',checks:[]});
 const storageKey=id=>'pit_v3_missao04_rascunho_'+String(id||'preview').replace(/[^A-Za-z0-9_-]/g,'').slice(0,80);
 function load(id){
  const d=blank();
  try{
   const source=JSON.parse(localStorage.getItem(storageKey(id))||'{}');
   if(Number.isInteger(source.route)&&source.route>=0&&source.route<4)d.route=source.route;
   for(const field of keys)if(typeof source[field]==='string')d[field]=source[field].slice(0,config[field].max);
   d.checks=Array.isArray(source.checks)?[...new Set(source.checks.filter(x=>Number.isInteger(x)&&x>=0&&x<3))]:[];
  }catch{}
  return d;
 }
 function save(id,d){
  try{
   const safeData=blank();
   safeData.route=Number.isInteger(d.route)&&d.route>=0&&d.route<=3?d.route:null;
   for(const name of keys)safeData[name]=String(d[name]??'').slice(0,config[name].max);
   safeData.checks=Array.isArray(d.checks)?[...new Set(d.checks.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]:[];
   localStorage.setItem(storageKey(id),JSON.stringify(safeData));
  }catch{}
 }
 function suggestedRoute(ctx={}){
  const requested=ctx?.previous?.objectType==='3D Box/Modelo';
  if(requested)return 3;
  return genres[ctx?.idea?.genre]??0;
 }
 function activeRoute(ctx,d){
  return Number.isInteger(d.route)&&d.route>=0&&d.route<4?d.route:suggestedRoute(ctx);
 }
 function routeServerType(index){return index===3?'3d':'2d'}
 function profile(ctx){
  const data=ctx.idea||{},mvp=ctx.mvp||{},previous=ctx.previous||{};
  const g=window.PIT_GENRE_CONTEXT?.profile(data.genre)||{};
  return {
   title:data.title||previous.project||'Meu jogo',
   genre:data.genre||'Gênero autoral',
   project:previous.project||data.title||'Projeto salvo na Missão 03',
   scene:previous.scene||mvp.scene||g.scene||'Cena inicial',
   object:previous.object||g.character||'Primeiro objeto',
   mechanic:mvp.mechanic||data.action||g.mechanic||'Interação principal',
   obstacle:g.obstacle||'obstáculo do seu jogo',
   objective:data.objective||g.objective||'Seu objetivo autoral',
   previousSave:previous.saved||'Seu local de salvamento'
  };
 }
 function routeHints(ctx,r){
  const i=profile(ctx);
  const rpg={
   command:'Usei as setas para mover '+i.object+' na cena '+i.scene+'.',
   response:'No Preview, '+i.object+' mudou de posição quando pressionei a tecla.',
   boundary:'Ao encostar em '+i.obstacle+', a personagem parou e não atravessou.',
   retest:'Com a tecla solta, o objeto ficou parado; ao pressionar contra a parede, permaneceu bloqueado.'
  };
  const platform={
   command:'Usei setas para caminhar e Espaço para saltar com '+i.object+'.',
   response:'No Preview, '+i.object+' correu, saltou e voltou ao chão.',
   boundary:'O personagem pousou sobre a plataforma e não caiu através dela.',
   retest:'Repeti o salto com o personagem parado e andando; nos dois casos ele voltou à plataforma.'
  };
  const puzzle={
   command:'Cliquei ou toquei no objeto interativo de '+i.scene+'.',
   response:'No Preview, o símbolo reagiu ao clique com uma mudança visual.',
   boundary:'Cliquei fora do símbolo; a resposta não apareceu porque o alvo não foi atingido.',
   retest:'Cliquei fora e depois dentro; só o clique sobre o objeto ativou o feedback.'
  };
  const three={
   command:'Usei teclado e mouse para controlar o personagem no cenário 3D.',
   response:'No Preview, o personagem se moveu e a câmera mostrou o caminho.',
   boundary:'Ao alcançar a parede 3D, o personagem não atravessou o obstáculo.',
   retest:'Tentei atravessar a parede por outro lado; a física manteve o limite.'
  };
  return [rpg,platform,puzzle,three][r]||rpg;
 }
 function validity(d,ctx){
  const result=keys.filter(k=>config[k].min>0).map(k=>clean(d[k]).length>=config[k].min);
  result.push([0,1,2].every(n=>d.checks.includes(n)));
  return result;
 }
 function validate(session,ctx={}){
  const d=load(session);
  for(const k of keys)if(config[k].min>0&&clean(d[k]).length<config[k].min){
   return {ok:false,field:k,label:'Descreva o resultado real: '+config[k].label};
  }
  if(![0,1,2].every(x=>d.checks.includes(x)))return {
   ok:false,field:'checks',label:'Confirme os três testes realizados no Preview: entrada, limite e repetição.'
  };
  return {ok:true,field:null,label:'Registro pronto para avaliação.'};
 }
 function evidence(session,ctx={}){
  const d=load(session),i=profile(ctx),r=activeRoute(ctx,d);
  // Keep each record on a single complete line and below the 750-char API limit.
  const cut=(s,n)=>clean(s).slice(0,n);
  return [
   'MISSÃO 04 — PRIMEIRO JOGÁVEL',
   'Jogo: '+cut(i.title,45),
   'Gênero: '+cut(i.genre,20),
   'Projeto: '+cut(i.project,37),
   'Cena: '+cut(i.scene,32),
   'Rota: '+names[r],
   'Comando: '+cut(d.command,config.command.max),
   'Resposta: '+cut(d.response,config.response.max),
   'Limite: '+cut(d.boundary,config.boundary.max),
   'Repetição: '+cut(d.retest,config.retest.max),
   'Salvo em: '+cut(d.saved,config.saved.max),
   'Correção: '+cut(d.issue||'Não informada',config.issue.max)
  ].join('\n');
 }
 function parseEvidence(raw){
  if(typeof raw!=='string'||!raw.startsWith('MISSÃO 04 — PRIMEIRO JOGÁVEL'))return null;
  const lines=raw.split('\n'),read=pre=>{
   const line=lines.find(x=>x.startsWith(pre));return line?line.slice(pre.length).trim():'';
  };
  const route=names.indexOf(read('Rota: '));
  if(route<0)return null;
  const d=blank();d.route=route;
  Object.assign(d,{
   command:read('Comando: '),response:read('Resposta: '),boundary:read('Limite: '),
   retest:read('Repetição: '),saved:read('Salvo em: '),issue:read('Correção: ')==='Não informada'?'':read('Correção: ')
  });
  // Restoration of a submitted evidence reflects the three test declarations.
  d.checks=[0,1,2];return d;
 }
 function hydrate(session,raw,status){
  const d=parseEvidence(raw);
  if(!d||!d.command||!d.response)return;
  const old=load(session);
  if(status==='revision'&&keys.some(k=>clean(old[k])))return;
  if(status!=='submitted'&&status!=='approved'&&keys.some(k=>clean(old[k])))return;
  save(session,d);
 }
 function title(phase,ctx){
  const i=profile(ctx);
  return '<header class="m4s-header"><small>✦ PIT GAME JAM IA · MISSÃO 04 / 10 · '+
   (phase==='briefing'?'NOVO PODER':phase==='practice'?'OFICINA DE DESENVOLVIMENTO':'ENTREGA TÉCNICA')+'</small>'+
   '<div class="m4s-head-main"><span>IV</span><div><span>PRIMEIRO JOGÁVEL · 50 MINUTOS</span>'+
   '<h2>Acorde o seu jogo.</h2><p>Seu projeto ganha controle, resposta e limites.</p></div></div>'+
   '<div class="m4s-origin"><strong>'+esc(i.title)+'</strong><span>'+esc(i.genre)+
   ' · Projeto: '+esc(i.project)+' · Cena: '+esc(i.scene)+'</span></div></header>';
 }
 function briefing(ctx){
  const i=profile(ctx),r=activeRoute(ctx,load(ctx.session)),hint=routeHints(ctx,r);
  return '<div class="m4s-page"><div class="m4s-intro"><div class="m4s-cover"><span>✧ CAPÍTULO IV · O PRIMEIRO CONTROLE</span></div>'+
   '<div><small>MISSÃO 04 · CONTINUAÇÃO DA SUA CRIAÇÃO</small><h3>Seu personagem ou objeto<br><em>já existe. Agora ele responde.</em></h3>'+
   '<p>Reabra <b>'+esc(i.project)+'</b> no GDevelop. Você já tem a cena <b>'+esc(i.scene)+'</b> e o objeto <b>'+
   esc(i.object)+'</b> da Missão 03. Não comece outro jogo.</p>'+
   '<div class="m4s-goal"><span>MISSÃO AUTORAL</span><strong>'+esc(i.mechanic)+'</strong><p>Hoje você vai tornar essa ideia interativa e testar uma restrição do mundo.</p></div>'+
   '<button type="button" class="m4s-action" data-m4s-nav="practice">✦ CONTINUAR MEU JOGO ›</button></div></div>'+
   '<div class="m4s-brief-grid">'+[
    ['01','ENTRADA','O teclado, clique ou toque provoca uma ação observável.'],
    ['02','LIMITE','Uma parede, plataforma ou área clicável restringe a interação.'],
    ['03','COMPROVAÇÃO','Você repete testes no Preview e registra o que ocorreu.']
   ].map(([n,h,p])=>'<article><span>'+n+' / '+h+'</span><p>'+p+'</p></article>').join('')+'</div>'+
   '<div class="m4s-brief-route"><small>ROTA INICIAL SUGERIDA</small><b>'+esc(names[r])+'</b>'+
   '<p>Exemplo: '+esc(hint.command)+' É uma referência, não uma resposta para copiar. Você poderá trocar a rota se o projeto exigir.</p></div></div>';
 }
 function field(id,d,ctx,r,locked){
  const f=config[id],i=profile(ctx);
  const example=id==='saved'?i.previousSave:id==='issue'?'A parede atravessava; incluí Separate objects.':
   routeHints(ctx,r)[id]||'Descreva seu teste.';
  const attr='id="m4s-'+id+'" data-m4s-field="'+id+'" maxlength="'+f.max+'" '+(locked?'disabled':'')+
   ' placeholder="'+esc('Ex.: '+example)+'"';
  const control=['response','boundary','retest','issue'].includes(id)?
   '<textarea rows="'+(id==='response'?3:2)+'" '+attr+'>'+esc(d[id])+'</textarea>':
   '<input type="text" '+attr+' value="'+esc(d[id])+'">';
  return '<label class="m4s-field" for="m4s-'+id+'"><b>'+esc(f.label)+'</b>'+control+
   '<small>'+esc(f.help)+'</small></label>';
 }
 function tests(d,locked){
  return '<section class="m4s-tests"><span>3 TESTES REALIZADOS NO PREVIEW · CONFIRMAÇÃO MANUAL</span>'+
  [
   ['TESTE A · ENTRADA','A ação responde ao comando usado no meu jogo.'],
   ['TESTE B · LIMITE','A parede, o chão, a área clicável ou outra restrição tem efeito verificável.'],
   ['TESTE C · REPETIÇÃO','Repeti e comparei a interação válida com uma tentativa que não deveria funcionar.']
  ].map(([n,txt],index)=>'<label><input type="checkbox" data-m4s-check="'+index+'" '+(d.checks.includes(index)?'checked':'')+
   ' '+(locked?'disabled':'')+'><span><strong>'+n+'</strong><small>'+txt+'</small></span></label>').join('')+
   '<p>Essas caixas registram sua declaração. Este caderno não acessa o GDevelop nem verifica a execução automaticamente.</p></section>';
 }
 function practice(ctx){
  const i=profile(ctx),d=load(ctx.session),r=activeRoute(ctx,d);
  const locked=['approved','submitted'].includes(ctx.status);
  const count=validity(d,ctx).filter(Boolean).length;
  return '<div class="m4s-page m4s-practice"><div class="m4s-lead"><small>◈ 36 MIN DE PRÁTICA · GDEVELOP</small>'+
   '<h3>Implemente um controle. Teste um limite.</h3><p>Continue o projeto <strong>'+esc(i.project)+'</strong>, salve a versão atualizada e descreva apenas o que realmente funcionou. O tutorial apresenta quatro rotas; <b>você precisa executar somente uma.</b></p>'+
   '<div class="m4s-continue" role="note"><strong>COMO REALIZAR ESTA PRÁTICA</strong><p><b>Onde:</b> abra o <a href="https://editor.gdevelop.io/" target="_blank" rel="noopener noreferrer">editor gratuito do GDevelop (nova aba)</a> ou o aplicativo já instalado e reabra o projeto salvo na Missão 03. Abrir o link não importa nem recupera seu projeto automaticamente; se estiver sem internet, use o aplicativo instalado e o arquivo local. <b>1.</b> Escolha somente uma das quatro rotas do tutorial abaixo, conforme seu gênero. <b>2.</b> Siga os cliques do tutorial para configurar um controle ou clique que produza resposta visível. <b>3.</b> Acrescente uma parede, chão, limite ou área clicável, conforme a rota. <b>4.</b> Abra o Preview e faça três testes: comando válido, tentativa contra o limite e repetição com caso inválido. <b>5.</b> Salve o projeto editável. <b>6.</b> Nesta página, descreva o comando, a resposta, o limite, a repetição e onde salvou. Marque apenas os testes que realmente fez. <b>Entrega:</b> clique em “Verificar minha entrega” e depois envie ao professor quando estiver liberado.</p><p><b>Se algo falhar:</b> confira se o comportamento foi adicionado ao objeto correto, se existe instância do obstáculo na cena e se a condição de colisão também possui uma ação de bloqueio. Não declare como concluído um Preview que não executou.</p></div>'+
   (locked?'<div class="m4s-locked">Entrega '+(ctx.status==='approved'?'aprovada':'enviada')+'; campos preservados para consulta.</div>':'')+
   '<div class="m4s-timebox"><span><b>12 min</b> · controle/entrada</span><span><b>15 min</b> · obstáculo ou restrição</span><span><b>9 min</b> · três testes e salvar</span></div></div>'+
   '<div class="m4s-3d-hint" id="m4s3DHint" '+(r===3?'':'hidden')+'>'+
   '<strong>ROTA 3D · CONSERVE A AUTORIA</strong><p>Se o projeto da Missão 03 tem só uma 3D Box, você pode partir do starter oficial já jogável. Transfira ou recrie no starter o seu objeto/cenário e mantenha nome e objetivo do seu jogo. Salve como uma nova versão do MESMO projeto autoral. Não entregue o starter sem adaptação como se fosse seu jogo pronto.</p></div>'+
   '<div class="m4s-continue"><span>DO SEU PROJETO ANTERIOR</span><div>'+
   '<strong>'+esc(i.project)+'</strong><small>'+esc(i.scene)+'</small><small>Objeto: '+esc(i.object)+'</small><small>Mecânica: '+esc(i.mechanic)+'</small>'+
   '</div><p>Se perdeu o arquivo, recupere-o de <b>'+esc(i.previousSave)+'</b>. Caso não consiga recuperar, registre o impedimento no caderno sem declarar testes que não fez.</p></div>'+
   (window.PIT_GDEVELOP_M04_GUIDE?window.PIT_GDEVELOP_M04_GUIDE.render(r):'<p>Abra o GDevelop: personagem → movimento → obstáculo → Preview.</p>')+
   '<div class="m4s-workspace"><section class="m4s-form"><span>◈ REGISTRO DE ENGENHARIA · TESTE REAL</span>'+
   '<h4>O que seu jogo já consegue fazer?</h4><p>A ficha ao lado é atualizada enquanto você descreve seus testes. Você pode ajustar o caminho escolhido no tutorial acima.</p>'+
   field('command',d,ctx,r,locked)+field('response',d,ctx,r,locked)+
   field('boundary',d,ctx,r,locked)+field('retest',d,ctx,r,locked)+
   field('saved',d,ctx,r,locked)+field('issue',d,ctx,r,locked)+
   tests(d,locked)+
   '<div class="m4s-form-footer"><span id="m4sNotice" aria-live="polite">Rascunho guardado neste navegador</span>'+
   '<button type="button" class="m4s-action" data-m4s-nav="review">VERIFICAR MINHA ENTREGA ›</button></div></section>'+
   '<aside class="m4s-aside"><div class="m4s-aside-image"><span>JOGO EM CONSTRUÇÃO</span></div>'+
   '<div class="m4s-aside-inner"><small>◈ PROTÓTIPO · PRIMEIRO JOGÁVEL</small><h4>'+esc(i.title)+'</h4>'+
   '<div class="m4s-info"><span>CAMINHO ESCOLHIDO</span><strong id="m4sRouteLabel">'+esc(names[r])+'</strong></div>'+
   '<div class="m4s-info"><span>ENTRADA OBSERVADA</span><p data-m4s-preview="command">'+esc(d.command||'Aguardando teste real')+'</p></div>'+
   '<div class="m4s-info"><span>LIMITAÇÃO DO MUNDO</span><p data-m4s-preview="boundary">'+esc(d.boundary||'Aguardando teste real')+'</p></div>'+
   '<div class="m4s-progress"><strong><span id="m4sCount">'+count+'</span>/6</strong><small>critérios registrados</small><div><i id="m4sBar" style="width:'+(count/6*100)+'%"></i></div></div>'+
   '<p class="m4s-aside-note">Aprovação e XP serão definidos pelo professor após analisar a evidência. Preencher a ficha não prova que o jogo funcionou.</p></div></aside></div></div>';
 }
 function review(ctx){
  const i=profile(ctx),d=load(ctx.session),r=activeRoute(ctx,d),v=validate(ctx.session,ctx);
  const submitted=['submitted','approved'].includes(ctx.status);
  const status=ctx.status==='approved'?'MISSÃO APROVADA PELO PROFESSOR':
   ctx.status==='submitted'?'AGUARDANDO VALIDAÇÃO DO PROFESSOR':
   ctx.status==='revision'?'CORREÇÃO SOLICITADA PELO PROFESSOR':'REGISTRO PARA AVALIAÇÃO';
  return '<div class="m4s-page m4s-review"><div class="m4s-lead"><small>◈ ENTREGA TÉCNICA · MISSÃO 04</small>'+
   '<h3>Um comando. Uma resposta. Um limite comprovado.</h3>'+
   '<p>Seu registro descreve o que você executou no Preview. O professor avaliará a evidência e poderá solicitar ajustes.</p></div>'+
   '<div class="m4s-review-layout"><div><div class="m4s-review-status">'+status+'</div>'+
   (ctx.feedback?'<div class="m4s-feedback"><b>DEVOLUTIVA DO PROFESSOR</b><p>'+esc(ctx.feedback)+'</p></div>':'')+
   '<div class="m4s-review-card"><span>FICHA DE EVIDÊNCIA · PRIMEIRO JOGÁVEL</span><h4>'+esc(i.title)+'</h4>'+
   '<div class="m4s-review-grid">'+[['PROJETO',i.project],['CENA',i.scene],['ROTA',names[r]],
    ['COMANDO',d.command],['RESPOSTA',d.response],['LIMITE',d.boundary],['RETESTE',d.retest],['SALVAMENTO',d.saved],['DIAGNÓSTICO',d.issue||'Não informado']
   ].map(([label,value])=>'<div><small>'+label+'</small><p>'+esc(value||'Não informado')+'</p></div>').join('')+'</div>'+
   '<label for="evidenceInput">Texto estruturado enviado ao professor</label>'+
   '<textarea id="evidenceInput" readonly maxlength="750">'+esc(evidence(ctx.session,ctx))+'</textarea>'+
   '<small>A evidência é uma declaração do aluno; o caderno não testa o jogo por conta própria.</small></div>'+
   (!v.ok?'<div class="m4s-warning">'+esc(v.label)+'</div>':'')+
   '<div class="m4s-submit"><button type="button" class="m4s-back" data-m4s-nav="practice" '+(submitted?'disabled':'')+'>‹ REVISAR TESTES</button>'+
   '<button type="button" class="m4s-action" id="submitWork" '+(!v.ok||submitted||(!ctx.canSubmit&&!ctx.preview)?'disabled':'')+'>'+
   (ctx.preview?'✧ SIMULAR ENTREGA':'✦ ENVIAR AO PROFESSOR')+'</button></div>'+
   (ctx.preview?'<p class="m4s-preview-note">Simulação local: nenhum resultado será enviado para uma turma real.</p>':'')+
   '</div><aside class="m4s-review-side"><span>IV</span><h4>Primeiro Jogável</h4>'+
   '<p>O próximo capítulo adicionará uma regra de jogo. Guarde o projeto que você acabou de salvar.</p>'+
   '<div class="m4s-info"><small>PROJETO BASE</small><strong>'+esc(i.project)+'</strong></div></aside></div></div>';
 }
 function render(ctx){
  return '<div class="m4s-root" id="m4sRoot">'+title(ctx.phase,ctx)+
  (ctx.phase==='practice'?practice(ctx):ctx.phase==='review'?review(ctx):briefing(ctx))+'</div>';
 }
 function mount(ctx){
  const root=document.querySelector('#m4sRoot');if(!root)return;
  const d=load(ctx.session),r=activeRoute(ctx,d);
  const guide=root.querySelector('#g4Tutorial');
  const locked=['approved','submitted'].includes(ctx.status);
  // A route switch changes only the selected tutorial. Existing answers remain intact.
  window.PIT_GDEVELOP_M04_GUIDE?.mount(guide,{
   initialRoute:r,
   onRouteChange:(routeName,index)=>{
    if(locked)return;
    d.route=index;save(ctx.session,d);
    const label=root.querySelector('#m4sRouteLabel');if(label)label.textContent=names[index];
    const hint3D=root.querySelector('#m4s3DHint');if(hint3D)hint3D.hidden=index!==3;
    for(const key of ['command','response','boundary','retest']){
     const el=root.querySelector('#m4s-'+key);
     if(el)el.placeholder='Ex.: '+routeHints(ctx,index)[key];
    }
   }
  });
  function redraw(){
   const done=validity(d,ctx).filter(Boolean).length;
   const count=root.querySelector('#m4sCount'),bar=root.querySelector('#m4sBar'),notice=root.querySelector('#m4sNotice');
   if(count)count.textContent=String(done);
   if(bar)bar.style.width=done/6*100+'%';
   if(notice)notice.textContent=done+'/6 registros e testes · rascunho guardado neste navegador';
   root.querySelectorAll('[data-m4s-preview]').forEach(el=>{
    const k=el.dataset.m4sPreview;
    el.textContent=clean(d[k])||'Aguardando teste real';
   });
  }
  root.querySelectorAll('[data-m4s-field]').forEach(input=>input.addEventListener('input',()=>{
   if(locked)return;
   d[input.dataset.m4sField]=input.value;save(ctx.session,d);redraw();
  }));
  root.querySelectorAll('[data-m4s-check]').forEach(input=>input.addEventListener('change',()=>{
   if(locked)return;
   const n=Number(input.dataset.m4sCheck);
   d.checks=input.checked?[...new Set([...d.checks,n])]:d.checks.filter(i=>i!==n);
   save(ctx.session,d);redraw();
  }));
  root.querySelectorAll('[data-m4s-nav]').forEach(button=>button.addEventListener('click',()=>{
   if(button.dataset.m4sNav==='practice'){ctx.onPhase('practice');return}
   if(button.dataset.m4sNav==='review'){
    const v=validate(ctx.session,ctx);
    if(!v.ok){
     ctx.onMessage(v.label);
     if(v.field!=='checks')root.querySelector('#m4s-'+v.field)?.focus();
     else root.querySelector('[data-m4s-check]')?.focus();
     return;
    }
    ctx.onPhase('review');
   }
  }));
  redraw();
 }
 window.PIT_STUDENT_MISSION_FOUR={
  render,mount,load,save,hydrate,validate,evidence,validity,
  suggestedRoute,activeRoute,routeServerType,routeHints,parseEvidence
 };
})();
/* PIT GAME JAM IA V3 — M05-03: aluno cria uma regra no próprio jogo.
   Persistência por sessão; a comprovação depende de testes reais no GDevelop.
   Tutorial oficial é uma referência, não respostas que podem ser copiadas. */
(function(){
'use strict';
const fields=[
 {key:'condition',label:'Quando a regra deve acontecer? (SE...)',min:10,max:70,tip:'Descreva o gatilho REAL do seu jogo; objeto, ação ou condição.'},
 {key:'action',label:'O que o evento faz? (ENTÃO...)',min:10,max:70,tip:'Qual ação você adicionou na aba Events do GDevelop?'},
 {key:'variable',label:'Qual variável registra a mudança?',min:3,max:28,tip:'Nome da variável e valor (Score=1, TemChave=1...).'},
 {key:'positive',label:'O que ocorreu quando a condição foi verdadeira?',min:12,max:73,tip:'Descreva o que observou no Preview, antes e depois.'},
 {key:'negative',label:'O que ocorreu com a condição falsa ou ao repetir?',min:12,max:73,tip:'Teste um caso que NÃO deveria ativar a ação; veja se pontua só uma vez.'},
 {key:'feedback',label:'Como o jogador percebeu a mudança?',min:10,max:57,tip:'Anote uma resposta visual ou sonora verificada no Preview.'},
 {key:'saved',label:'Onde ficou o projeto atualizado?',min:6,max:49,tip:'Nome do projeto na nuvem ou arquivo/pasta local.'},
 {key:'issue',label:'Que problema corrigiu? (opcional)',min:0,max:38,tip:'Só registre um erro realmente encontrado; pode deixar em branco.'}
];
const routes=[
 {id:'collect',label:'COLETA / PONTUAÇÃO',short:'COLETA',key:'Score',initial:'0',cue:'Um item tem efeito ao ser coletado e deixa de existir.',positive:'O item desapareceu e a pontuação aumentou.',negative:'Não tocar no item não pontuou; mantive contato e não somou de novo.'},
 {id:'puzzle',label:'ESCOLHA / INTERAÇÃO',short:'ESCOLHA',key:'Acertou',initial:'0',cue:'Uma opção ou objeto responde somente ao clique/toque válido.',positive:'O alvo respondeu ao clique e apareceu uma confirmação.',negative:'Fora do alvo a ação não ocorreu; repeti e não contei duas vezes.'},
 {id:'3d',label:'REGRA EM CENÁRIO 3D',short:'3D',key:'TemChave',initial:'0',cue:'A porta ou objeto 3D responde só quando o estado permite.',positive:'Com a chave e próximo à porta, a passagem abriu no Preview.',negative:'Sem chave a porta não abriu; depois de aberta não repetiu.'}
];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=x=>String(x??'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim();
const fresh=()=>({route:null,checks:[],...Object.fromEntries(fields.map(f=>[f.key,'']))});
const key=id=>'pit_v3_m05_'+String(id||'preview').replace(/[^A-Za-z0-9_-]/g,'').slice(0,80);
function load(id){
 const d=fresh();
 try{
  const x=JSON.parse(localStorage.getItem(key(id))||'{}');
  if(Number.isInteger(x.route)&&x.route>=0&&x.route<3)d.route=x.route;
  for(const f of fields)if(typeof x[f.key]==='string')d[f.key]=x[f.key].slice(0,f.max);
  d.checks=Array.isArray(x.checks)?[...new Set(x.checks.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]:[];
 }catch{}
 return d;
}
function save(id,raw){
 const d=fresh();
 d.route=Number.isInteger(raw.route)&&raw.route>=0&&raw.route<3?raw.route:null;
 for(const f of fields)d[f.key]=String(raw[f.key]??'').slice(0,f.max);
 d.checks=Array.isArray(raw.checks)?[...new Set(raw.checks.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]:[];
 try{localStorage.setItem(key(id),JSON.stringify(d))}catch{}
 return d;
}
function suggestedRoute(ctx={}){
 const m4=ctx.playable||{};
 if(Number.isInteger(m4.route)){
  if(m4.route===3)return 2;
  if(m4.route===2)return 1;
 }
 if(ctx.previous?.objectType==='3D Box/Modelo')return 2;
 if(['Puzzle','Narrativa interativa'].includes(ctx.idea?.genre))return 1;
 return 0;
}
function activeRoute(ctx,d){return Number.isInteger(d.route)&&d.route>=0&&d.route<3?d.route:suggestedRoute(ctx)}
function routeType(index){return index===2?'3d':'2d'}
function profile(ctx){
 const idea=ctx.idea||{},mvp=ctx.mvp||{},previous=ctx.previous||{},playable=ctx.playable||{};
 return {
  title:idea.title||previous.project||'Meu jogo',
  genre:idea.genre||'Gênero livre',
  project:previous.project||idea.title||'Projeto salvo',
  scene:previous.scene||mvp.scene||'Minha cena',
  object:previous.object||'Meu objeto',
  mechanic:mvp.mechanic||idea.action||'Minha mecânica',
  lastControl:playable.command||'Um controle já testado',
  lastLimit:playable.boundary||'Um limite já testado',
  location:playable.saved||previous.saved||'Local do projeto'
 };
}
function suggestion(ctx,route){
 const p=profile(ctx);
 const obj=clean(p.object).slice(0,35)||'Personagem';
 if(route===1)return {
  condition:'SE clicar ou tocar no alvo de '+p.scene+' E Acertou=0',
  action:'ENTÃO exibir feedback da escolha e definir Acertou=1.',
  variable:'Acertou=0 → 1',
  saved:p.location
 };
 if(route===2)return{
  condition:'SE '+obj+' interagir com a porta E TemChave=1',
  action:'ENTÃO definir PortaAberta=1 e abrir a passagem.',
  variable:'TemChave / PortaAberta',
  saved:p.location
 };
 return{
  condition:'SE '+obj+' tocar no item de '+p.scene,
  action:'ENTÃO Score+1, remover o item e atualizar o texto.',
  variable:'Score=0 → 1',
  saved:p.location
 };
}
function validity(d){
 return fields.filter(f=>f.min>0).map(f=>clean(d[f.key]).length>=f.min)
  .concat([0,1,2].every(n=>d.checks.includes(n)));
}
function validate(session){
 const d=load(session);
 for(const f of fields.filter(f=>f.min>0))if(clean(d[f.key]).length<f.min)
  return {ok:false,field:f.key,label:'Preencha com observações reais: '+f.label};
 if(![0,1,2].every(n=>d.checks.includes(n)))
  return {ok:false,field:'checks',label:'Execute e confirme os três testes no Preview: positivo, negativo e repetição.'};
 return {ok:true,label:'Evidência pronta para análise do professor.'};
}
function evidence(session,ctx={}){
 const d=load(session),p=profile(ctx),r=activeRoute(ctx,d);
 return [
  'MISSÃO 05 — A PRIMEIRA REGRA',
  'Jogo: '+clean(p.title).slice(0,32),
  'Gênero: '+clean(p.genre).slice(0,19),
  'Projeto: '+clean(p.project).slice(0,34),
  'Cena: '+clean(p.scene).slice(0,29),
  'Trilha: '+routes[r].short,
  'Condição: '+clean(d.condition),
  'Ação: '+clean(d.action),
  'Variável: '+clean(d.variable),
  'Positivo: '+clean(d.positive),
  'Negativo: '+clean(d.negative),
  'Feedback: '+clean(d.feedback),
  'Salvo em: '+clean(d.saved),
  'Correção: '+clean(d.issue||'Não informada')
 ].join('\n');
}
function parseEvidence(raw){
 if(typeof raw!=='string'||!raw.startsWith('MISSÃO 05 — A PRIMEIRA REGRA'))return null;
 const lines=raw.split('\n'),get=label=>{
  const hit=lines.find(l=>l.startsWith(label));return hit?hit.slice(label.length).trim():'';
 };
 const route=routes.findIndex(r=>r.short===get('Trilha: '));
 if(route<0)return null;
 const d=fresh();d.route=route;
 for(const [f,label] of [['condition','Condição: '],['action','Ação: '],['variable','Variável: '],
  ['positive','Positivo: '],['negative','Negativo: '],['feedback','Feedback: '],
  ['saved','Salvo em: '],['issue','Correção: ']]){
  const val=get(label);d[f]=val==='Não informada'&&f==='issue'?'':val.slice(0,fields.find(x=>x.key===f).max);
 }
 d.checks=[0,1,2];return d;
}
function hydrate(session,raw,status){
 const d=parseEvidence(raw);if(!d||!d.condition||!d.positive)return;
 const old=load(session),hasLocal=fields.some(f=>clean(old[f.key]));
 if(status==='submitted'||status==='approved'){save(session,d);return}
 if(!hasLocal)save(session,d);
}
function heading(ctx,phase){
 const p=profile(ctx);
 return '<header class="m5s-hero"><span>✦ PIT GAME JAM IA · JORNADA DO ALUNO · CAPÍTULO V</span>'+
 '<div class="m5s-hero-main"><div class="m5s-chapter">V</div><div><small>MISSÃO 05 / 10 · A PRIMEIRA REGRA · 40 MIN</small>'+
 '<h2>Seu jogo agora toma decisões.</h2><p>SE uma coisa acontecer → ENTÃO o mundo responde.</p></div></div>'+
 '<div class="m5s-inherit"><strong>'+esc(p.title)+'</strong>'+
 '<small>'+esc(p.genre)+' · Cena: '+esc(p.scene)+' · Projeto: '+esc(p.project)+'</small></div>'+
 '</header>';
}
function briefing(ctx){
 const p=profile(ctx),d=load(ctx.session),r=activeRoute(ctx,d);
 return '<section class="m5s-brief"><div class="m5s-cover"><span>O PODER DAS REGRAS</span></div>'+
 '<div class="m5s-lead"><small>SEU JOGO NÃO RECOMEÇA DO ZERO</small>'+
 '<h3>Aquilo que você controla agora pode <em>reagir e lembrar.</em></h3>'+
 '<p>Na Missão 04, você testou <b>'+esc(p.lastControl)+'</b>. Agora retome o mesmo projeto e use eventos para transformar sua mecânica em uma regra visível.</p>'+
 '<div class="m5s-mechanic"><small>MECÂNICA DEFINIDA NA MISSÃO 02</small><strong>'+esc(p.mechanic)+'</strong>'+
 '<p>Se a mecânica não combina com os exemplos, invente sua própria condição e ação. Os exemplos são caminhos técnicos, não respostas obrigatórias.</p></div>'+
 '<button type="button" class="m5s-primary" data-m5s-nav="practice">✧ ABRIR A FORJA DE REGRAS ›</button></div></section>'+
 '<div class="m5s-brief-steps">'+[
 ['SE','Uma condição reconhece uma ação ou um estado.'],
 ['ENTÃO','Uma ação altera uma variável, objeto ou decisão.'],
 ['PROVE','Teste quando a regra deve — e não deve — executar.']
 ].map(([a,b],i)=>'<article><span>0'+(i+1)+' · '+a+'</span><p>'+b+'</p></article>').join('')+'</div>'+
 '<div class="m5s-route-intro"><small>EXEMPLO DE ROTA SUGERIDA</small><b>'+esc(routes[r].label)+'</b>'+
 '<p>'+esc(routes[r].cue)+' Você pode trocar a rota no laboratório.</p></div>';
}
function input(f,d,ctx,r,locked){
 const hint=suggestion(ctx,r)[f.key]||({
  positive:routes[r].positive,
  negative:routes[r].negative,
  feedback:'No Preview, apareceu uma alteração visível após o evento.',
  issue:'O evento repetia; corrigi a condição.'
 })[f.key]||'Descreva seu resultado real.';
 const attrs='id="m5s-'+f.key+'" data-m5s-input="'+f.key+'" maxlength="'+f.max+'" '+(locked?'disabled':'')+
 ' placeholder="'+esc('Ex.: '+hint)+'"';
 const control=['condition','action','positive','negative','feedback','issue'].includes(f.key)?
  '<textarea rows="2" '+attrs+'>'+esc(d[f.key])+'</textarea>':
  '<input type="text" '+attrs+' value="'+esc(d[f.key])+'">';
 return '<label for="m5s-'+f.key+'" class="m5s-field"><b>'+esc(f.label)+'</b>'+control+'<small>'+esc(f.tip)+'</small></label>';
}
function checks(d,locked){
 const items=[
 ['POSITIVO','Com a condição verdadeira, vi a ação acontecer no Preview.'],
 ['NEGATIVO','Com a condição falsa, a ação não aconteceu.'],
 ['REPETIÇÃO','Repeti a interação e confirmei que o evento não produziu efeito indevido.']
 ];
 return '<div class="m5s-checks"><b>TESTES REALIZADOS NO PREVIEW · DECLARAÇÃO MANUAL</b>'+
 items.map(([label,desc],i)=>'<label><input type="checkbox" data-m5s-check="'+i+'" '+(d.checks.includes(i)?'checked':'')+' '+(locked?'disabled':'')+'>'+
 '<span><strong>'+label+'</strong><small>'+desc+'</small></span></label>').join('')+
 '<p>Marcar estas caixas não comprova a execução automaticamente. O professor pode solicitar uma demonstração.</p></div>';
}
function practice(ctx){
 const p=profile(ctx),d=load(ctx.session),r=activeRoute(ctx,d),locked=['approved','submitted'].includes(ctx.status);
 const completed=validity(d).filter(Boolean).length;
 const guide=window.PIT_GDEVELOP_M05_GUIDE?window.PIT_GDEVELOP_M05_GUIDE.render(r):
  '<p class="m5s-warning">Abra a aba Events do GDevelop, configure uma condição, uma ação e teste no Preview.</p>';
 return '<section class="m5s-practice"><div class="m5s-leadtext"><small>◈ OFICINA · 24 MINUTOS</small><h3>Construa uma regra real no seu projeto.</h3>'+
 '<p>Reabra <strong>'+esc(p.project)+'</strong> na cena <strong>'+esc(p.scene)+'</strong>. Escolha uma das três rotas ou adapte o exemplo à sua mecânica. Não é necessário construir todas.</p>'+
 '<div class="m5s-context" role="note"><strong>PASSO A PASSO · UMA REGRA NO SEU JOGO</strong><p><b>Onde:</b> reabra o projeto no GDevelop e entre na aba Events (Eventos) da cena. <b>1.</b> Escolha apenas uma rota do tutorial abaixo. <b>2.</b> Adicione um evento e uma condição SE, como colisão ou clique válido. <b>3.</b> No mesmo evento, adicione uma ação ENTÃO que altere uma variável e produza um feedback visível. <b>4.</b> Abra o Preview e teste quando a condição é verdadeira, quando é falsa e ao repetir a ação. <b>5.</b> Salve o projeto editável. <b>6.</b> Preencha nesta página Condição, Ação, Variável, Positivo, Negativo, Feedback e Salvo em; marque apenas testes realmente executados. <b>7.</b> Clique “Conferir minha evidência” e envie quando a prática estiver liberada.</p><p><b>Se a pontuação duplicar:</b> confira se o evento dispara a cada quadro; remova o item coletado ou controle o estado. Se nada acontecer, confira se condição, objeto e ação estão no mesmo evento. O rascunho no navegador não é a entrega ao professor.</p></div>'+ 
 '<div class="m5s-timebox"><span><b>8 min</b> · evento + condição</span><span><b>8 min</b> · variável + feedback</span><span><b>8 min</b> · testes + evidência</span></div>'+
 (locked?'<div class="m5s-warning">A entrega está '+(ctx.status==='approved'?'aprovada':'enviada')+'. Os registros foram bloqueados para preservar o envio.</div>':'')+
 '</div><div class="m5s-context"><small>DO JOGO QUE VOCÊ ESTÁ CONSTRUINDO</small><strong>'+esc(p.title)+'</strong>'+
 '<p>Objeto: <b>'+esc(p.object)+'</b> · Mecânica: <b>'+esc(p.mechanic)+'</b></p>'+
 '<p>Controle anterior: '+esc(p.lastControl)+'</p><p>Limite anterior: '+esc(p.lastLimit)+'</p>'+
 '<p>Salvamento anterior: '+esc(p.location)+'</p></div>'+
 '<div class="m5s-3d-note" id="m5s3DNote" '+(r===2?'':'hidden')+'>'+
 '<strong>JOGO 3D · NÃO TROQUE A FÍSICA POR UMA CONDIÇÃO 2D</strong>'+
 '<p>Continue seu projeto ou starter adaptado da Missão 04. Use os componentes de Physics 3D que ele já possui. A colisão 2D e a distância X/Y não comprovam proximidade volumétrica.</p></div>'+
 guide+
 '<div class="m5s-lab"><section class="m5s-form"><small>◈ CADERNO DE ENGENHARIA · REGISTRO AUTORAL</small><h3>O que você implementou e comprovou?</h3>'+
 '<p>Os exemplos nos campos são apenas pistas; cada resposta descreve o que aconteceu no SEU jogo, não no exemplo da página.</p>'+
 fields.map(f=>input(f,d,ctx,r,locked)).join('')+checks(d,locked)+
 '<div class="m5s-form-footer"><span id="m5sStatus" aria-live="polite">Rascunho salvo neste navegador.</span>'+
 '<button type="button" class="m5s-primary" data-m5s-nav="review">CONFERIR MINHA EVIDÊNCIA ›</button></div></section>'+
 '<aside class="m5s-aside"><div class="m5s-aside-art"><span>✦ A PRIMEIRA REGRA</span></div>'+
 '<div class="m5s-aside-content"><small>PAINEL DO PROTÓTIPO</small><h4>'+esc(p.title)+'</h4>'+
 '<div class="m5s-card-row"><strong>ROTA SELECIONADA</strong><span id="m5sRouteName">'+esc(routes[r].label)+'</span></div>'+
 '<div class="m5s-card-row"><strong>SE · CONDIÇÃO</strong><p data-m5s-preview="condition">'+esc(d.condition||'Aguardando seu evento real')+'</p></div>'+
 '<div class="m5s-card-row"><strong>ENTÃO · AÇÃO</strong><p data-m5s-preview="action">'+esc(d.action||'Aguardando sua ação real')+'</p></div>'+
 '<div class="m5s-card-row"><strong>RESULTADO</strong><p data-m5s-preview="feedback">'+esc(d.feedback||'Aguardando feedback no Preview')+'</p></div>'+
 '<div class="m5s-gauge"><b><span id="m5sComplete">'+completed+'</span>/8</b><small>critérios registrados</small><div><i id="m5sGauge" style="width:'+(completed/8*100)+'%"></i></div></div>'+
 '<p>Esta ficha não executa o GDevelop. O professor valida o resultado após analisar a entrega.</p></div></aside></div></section>';
}
function review(ctx){
 const p=profile(ctx),d=load(ctx.session),r=activeRoute(ctx,d),v=validate(ctx.session);
 const fixed=['submitted','approved'].includes(ctx.status);
 const status=ctx.status==='approved'?'APROVADA PELO PROFESSOR':ctx.status==='submitted'?'ENVIADA · AGUARDANDO AVALIAÇÃO':ctx.status==='revision'?'REVISÃO SOLICITADA':'PRONTA PARA AVALIAÇÃO';
 const summary=[['PROJETO',p.project],['TRILHA',routes[r].label],...fields.map(f=>[f.label.replace(/\?.*$/,'').slice(0,28).toUpperCase(),d[f.key]||'Não informado'])];
 return '<section class="m5s-review"><div class="m5s-leadtext"><small>◈ RESULTADOS · 3 MINUTOS</small><h3>Seu evento já tem uma história verificável?</h3>'+
 '<p>O professor vai conferir a regra SE/ENTÃO, os resultados positivo e negativo e o estado do projeto.</p></div>'+
 '<div class="m5s-review-body"><div><div class="m5s-status">'+status+'</div>'+
 (ctx.feedback?'<div class="m5s-feedback"><b>DEVOLUTIVA DO PROFESSOR</b><p>'+esc(ctx.feedback)+'</p></div>':'')+
 '<div class="m5s-summary"><small>RELATÓRIO DA PRIMEIRA REGRA</small><h4>'+esc(p.title)+'</h4>'+
 '<div class="m5s-summary-grid">'+summary.map(([label,value])=>'<div><small>'+esc(label)+'</small><p>'+esc(value)+'</p></div>').join('')+'</div>'+
 '<label for="evidenceInput">Evidência estruturada para o professor</label>'+
 '<textarea id="evidenceInput" readonly maxlength="750">'+esc(evidence(ctx.session,ctx))+'</textarea>'+
 '<small>Esta evidência é um relato. Se necessário, demonstre o resultado no Preview.</small></div>'+
 (!v.ok?'<div class="m5s-warning">'+esc(v.label)+'</div>':'')+
 '<div class="m5s-actions"><button type="button" class="m5s-back" data-m5s-nav="practice" '+(fixed?'disabled':'')+'>‹ CORRIGIR REGISTRO</button>'+
 '<button type="button" class="m5s-primary" id="submitWork" '+(!v.ok||fixed||(!ctx.canSubmit&&!ctx.preview)?'disabled':'')+'>'+
 (ctx.preview?'✧ SIMULAR ENTREGA':'✦ ENVIAR AO PROFESSOR')+'</button></div>'+
 (ctx.preview?'<p class="m5s-preview-info">Prévia isolada: não haverá envio para a turma real.</p>':'')+
 '</div><aside class="m5s-finale"><strong>V</strong><h4>O mundo responde.</h4>'+
 '<p>Na próxima missão, sua regra ganhará recursos originais. Preserve o projeto editável para continuar.</p>'+
 '<small>'+esc(p.project)+'</small></aside></div></section>';
}
function render(ctx){
 return '<div class="m5s-root" id="m5sRoot">'+heading(ctx,ctx.phase)+
  (ctx.phase==='practice'?practice(ctx):ctx.phase==='review'?review(ctx):briefing(ctx))+'</div>';
}
function mount(ctx){
 const root=document.querySelector('#m5sRoot');if(!root)return;
 const d=load(ctx.session),locked=['submitted','approved'].includes(ctx.status);
 window.PIT_GDEVELOP_M05_GUIDE?.mount(root.querySelector('#m5Guide'),{
  initialRoute:activeRoute(ctx,d),onRouteChange:(id,index)=>{
   if(locked)return;
   d.route=index;save(ctx.session,d);
   const name=root.querySelector('#m5sRouteName');if(name)name.textContent=routes[index].label;
   const box=root.querySelector('#m5s3DNote');if(box)box.hidden=index!==2;
   for(const f of fields){
    const inp=root.querySelector('#m5s-'+f.key);
    if(!inp)continue;
    const hint=suggestion(ctx,index)[f.key]||({positive:routes[index].positive,negative:routes[index].negative})[f.key];
    if(hint)inp.placeholder='Ex.: '+hint;
   }
  }
 });
 function redraw(){
  const count=validity(d).filter(Boolean).length;
  const c=root.querySelector('#m5sComplete'),g=root.querySelector('#m5sGauge'),s=root.querySelector('#m5sStatus');
  if(c)c.textContent=String(count);
  if(g)g.style.width=(count/8*100)+'%';
  if(s)s.textContent=count+'/8 critérios preenchidos · rascunho salvo neste navegador';
  root.querySelectorAll('[data-m5s-preview]').forEach(el=>{
   el.textContent=clean(d[el.dataset.m5sPreview])||'Aguardando resultado real';
  });
 }
 root.querySelectorAll('[data-m5s-input]').forEach(input=>input.addEventListener('input',()=>{
  if(locked)return;
  d[input.dataset.m5sInput]=input.value;save(ctx.session,d);redraw();
 }));
 root.querySelectorAll('[data-m5s-check]').forEach(box=>box.addEventListener('change',()=>{
  if(locked)return;
  const n=Number(box.dataset.m5sCheck);
  d.checks=box.checked?[...new Set([...d.checks,n])]:d.checks.filter(i=>i!==n);
  save(ctx.session,d);redraw();
 }));
 root.querySelectorAll('[data-m5s-nav]').forEach(button=>button.addEventListener('click',()=>{
  if(button.dataset.m5sNav==='practice'){ctx.onPhase('practice');return}
  const v=validate(ctx.session);
  if(!v.ok){
   ctx.onMessage(v.label);
   const target=v.field==='checks'?root.querySelector('[data-m5s-check]'):root.querySelector('#m5s-'+v.field);
   target?.focus();return;
  }
  ctx.onPhase('review');
 }));
 redraw();
}
window.PIT_STUDENT_MISSION_FIVE={fields,routes,load,save,suggestedRoute,activeRoute,routeType,profile,suggestion,validity,validate,evidence,parseEvidence,hydrate,render,mount};
})();
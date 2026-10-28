/* Missão 01 — aula projetada contínua. Usa o conteúdo das quatro etapas sem alterar a turma. */
(function(){
'use strict';
const M=window.PIT_TEACHER_MISSION_ONE;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function parse(phase){const tpl=document.createElement('template');tpl.innerHTML=M.render(phase);return tpl.content}
function one(root,sel){return root.querySelector(sel)}
function html(root,sel){const e=one(root,sel);return e?e.outerHTML:''}
function inner(root,sel){const e=one(root,sel);return e?e.innerHTML:''}
function txt(root,sel){const e=one(root,sel);return e?clean(e.textContent):''}
function slide(section,title,body,extra){return Object.assign({section,title,html:'<section class="pit-m01-deck">'+body+'</section>'},extra||{})}
function eyebrow(str){return '<div class="pit-m01-kicker">'+esc(str)+'</div>'}
function lead(str){return '<p class="pit-m01-lead">'+str+'</p>'}
function card(heading,body){return '<div class="pit-m01-pane"><h3>'+esc(heading)+'</h3>'+body+'</div>'}
function build(){
 if(!M||!M.render)return [];
 const b=parse('briefing'),d=parse('demo'),p=parse('practice'),r=parse('review');
 const all=[];
 all.push(slide('CONCEITOS · 9 MIN','Um jogo é um sistema de decisões',
  eyebrow('CAPÍTULO I · O CHAMADO · 20 MINUTOS')+
  '<div class="pit-m01-cover"><div><h2>Da ideia à primeira regra.</h2><p>Hoje você vai definir uma interação, visualizar seu funcionamento e criar uma ficha de game design testável.</p><div class="pit-m01-chips"><span>9 min · Conceitos</span><span>4 min · Exemplo vivo</span><span>6 min · Oficina</span><span>1 min · Resultados</span></div></div><div class="pit-m01-cover-art" aria-hidden="true"><span>✦</span><strong>ENTRADA<br>REGRA<br>ESTADO<br>RESPOSTA</strong></div></div>'));
 all.push(slide('CONCEITOS · 9 MIN','O que faz uma ideia virar jogo?',
  eyebrow('FUNDAMENTO · GAME DESIGN')+lead(inner(b,'.tm-pro-lead p'))+
  '<div class="pit-m01-flow"><span>01 · ENTRADA</span><b>→</b><span>02 · CONDIÇÃO</span><b>→</b><span>03 · ESTADO</span><b>→</b><span>04 · RESPOSTA</span></div>'+
  card('Exemplo: o castelo dos cristais','<p>O jogador coleta um cristal. A regra aumenta o contador. O estado muda de <strong>2/3</strong> para <strong>3/3</strong>. A interface mostra que o portal foi liberado.</p>')));
 const concepts=[...b.querySelectorAll('.tm-pro-grid .tm-pro-card')];
 concepts.forEach((c,i)=>{
  const title=txt(c,'h4'),label=txt(c,'.tm-pro-card-tag');
  const example=inner(c,'.tm-pro-example p'),output=inner(c,'.tm-pro-output');
  all.push(slide('CONCEITOS · 9 MIN',title,
   eyebrow('CONCEITO '+String(i+1).padStart(2,'0')+' / '+String(concepts.length).padStart(2,'0')+' · '+label)+
   '<div class="pit-m01-concept">'+
   '<div class="pit-m01-explanation">'+inner(c,'.tm-pro-body')+'</div>'+
   '<div class="pit-m01-example"><span>EXEMPLO NO JOGO</span><p>'+example+'</p></div>'+
   (output?'<div class="pit-m01-snippet">'+output+'</div>':'')+'</div>'));
 });
 const genres=one(b,'.tm-pro-example-switch');
 if(genres)all.push(slide('CONCEITOS · 9 MIN','A mesma lógica serve para gêneros diferentes',
  eyebrow('EXPERIMENTE · RPG, PUZZLE OU TERROR')+
  '<div class="pit-m01-runtime pit-m01-genres">'+genres.innerHTML+'</div>'+
  '<p class="pit-m01-caption">Troque de gênero: ação, regra e feedback mudam, mas a estrutura de interação permanece.</p>',{interactive:true}));
 const pseudo=one(b,'.tm-pro-codepanel pre')?.textContent.trim()||'';
 if(pseudo){
  const at=pseudo.indexOf('aoInteragirComPorta');
  const first=at>0?pseudo.slice(0,at):pseudo;
  const second=at>0?pseudo.slice(at):'';
  all.push(slide('CONCEITOS · 9 MIN','Transformando a coleta em pseudocódigo',
   eyebrow('DA REGRA AO ALGORITMO')+
   lead('O estado guarda a quantidade de cristais. Coletar um item modifica esse estado e atualiza o contador.')+
   '<pre class="pit-m01-pseudocode">'+esc(first)+'</pre>'));
  if(second)all.push(slide('CONCEITOS · 9 MIN','A condição de vitória precisa de uma interação',
   eyebrow('RESTRIÇÃO E TESTE')+
   lead('Ter 3 cristais é necessário, mas não basta: o jogador ainda precisa interagir com a porta.')+
   '<pre class="pit-m01-pseudocode">'+esc(second)+'</pre>'));
 }
 const stage=html(d,'.tm-pro-stage'),debug=html(d,'.tm-pro-debugger'),tests=html(d,'.tm-pro-tests'),testResult=html(d,'.tm-pro-test-result');
 if(stage&&debug){
  all.push(slide('EXEMPLO EM AÇÃO · 4 MIN','Simulador: o castelo dos cristais',
   eyebrow('INTERAÇÃO REAL · CLIQUE NOS BOTÕES')+
   '<div class="pit-m01-runtime pit-m01-sim"><div class="pit-m01-sim-grid">'+stage+debug+'</div></div>',
   {interactive:true,simulator:true}));
  all.push(slide('EXEMPLO EM AÇÃO · 4 MIN','A regra resiste aos três casos de teste?',
   eyebrow('EXERCÍCIO · TESTE A, B E C')+
   '<div class="pit-m01-runtime pit-m01-sim pit-m01-test"><div class="pit-m01-sim-grid">'+stage+
   '<div class="pit-m01-testing">'+card('Teste de caixa-preta','<p>Selecione 0/3, 2/3 ou 3/3. O simulador prepara o cenário, interage com a porta e compara o resultado com o esperado.</p>')+
   tests+testResult+'<p class="pit-m01-caption">Resultado esperado: A e B bloqueados; C aprovado e porta aberta.</p></div></div></div>',
   {interactive:true,simulator:true}));
 }
 const model=one(d,'.tm-pro-tech-grid article');
 if(model)all.push(slide('EXEMPLO EM AÇÃO · 4 MIN','Como interpretar o estado do jogo',
   eyebrow('ESTADO → TRANSIÇÃO → RESULTADO')+
   card(txt(model,'h4'),inner(model,'p')+html(model,'.tm-pro-graph'))+
   lead('A mesma entrada pode produzir resultados diferentes conforme o estado: antes de 3 cristais a porta bloqueia; depois libera a passagem.')));
 const guide=window.PIT_TEACHER_GDEVELOP_GUIDE;
 if(guide&&Array.isArray(guide.stages)){
  guide.stages.forEach((g,i)=>{
   const steps=(g.steps||[]).map((item,n)=>'<div class="pit-m01-guide-step"><span>'+String(n+1).padStart(2,'0')+'</span><div><strong>'+esc(item[0])+'</strong><p>'+esc(item[1])+'</p></div></div>').join('');
   all.push(slide('EXEMPLO EM AÇÃO · GDEVELOP','GDevelop: '+g.title,
    eyebrow('TUTORIAL · PASSO '+String(i+1).padStart(2,'0')+' / '+String(guide.stages.length).padStart(2,'0'))+
    '<div class="pit-m01-guide"><div class="pit-m01-guide-image"><div class="pit-m01-image-label">'+(i<3?'CAPTURA DA DOCUMENTAÇÃO OFICIAL':'ILUSTRAÇÃO DIDÁTICA')+'</div>'+
    '<img src="'+esc(g.img)+'" alt="'+esc(g.alt)+'" loading="eager"></div>'+
    '<div class="pit-m01-guide-content">'+lead(esc(g.lead))+steps+'</div></div>'+
    '<p class="pit-m01-hint">'+esc(g.note)+'</p>',
    {images:true}));
  });
 }
 all.push(slide('OFICINA LIBERADA · 6 MIN','Sua ideia precisa virar uma ficha testável',
  eyebrow('DO JOGO IMAGINADO AO PRIMEIRO REQUISITO')+
  lead(inner(p,'.tm-pro-lead p'))+
  '<div class="pit-m01-two">'+card('Exemplo: A Última Chave',
   '<p><strong>Gênero:</strong> Aventura / RPG</p><p><strong>Ação:</strong> explorar e coletar cristais</p><p><strong>Condição:</strong> interagir com a porta após 3 coletas</p>')+
   card('Seu projeto é livre',
   '<p>RPG, terror, corrida, puzzle ou outro gênero. O fundamental é descrever <strong>o que o jogador faz</strong>, <strong>o que muda</strong> e <strong>quando termina</strong>.</p>')+'</div>'));
 const specs=[...p.querySelectorAll('.tm-pro-spec-row')];
 for(let offset=0;offset<specs.length;offset+=4){
  const group=specs.slice(offset,offset+4);
  all.push(slide('OFICINA LIBERADA · 6 MIN',offset===0?'Os primeiros campos da sua ficha':'Complete a mecânica e a vitória',
   eyebrow('FICHA DE GAME DESIGN · CAMPOS '+(offset+1)+' A '+(offset+group.length))+
   '<div class="pit-m01-fields">'+group.map((e,i)=>'<div class="pit-m01-field"><b>'+String(offset+i+1).padStart(2,'0')+'</b><div><span>'+esc(txt(e,'small'))+'</span><strong>'+esc(txt(e,'strong'))+'</strong><p>'+esc(txt(e,'p'))+'</p></div></div>').join('')+'</div>'));
 }
 all.push(slide('OFICINA LIBERADA · 6 MIN','Como criar, conferir e entregar',
  eyebrow('CADERNO DO ALUNO · FLUXO DA MISSÃO 01')+
  '<div class="pit-m01-steps">'+[
   ['01','ABRIR','No Caderno do Aluno, entre na Missão 01 e escolha “Começar a criar”.'],
   ['02','PREENCHER','Defina gênero, título, protagonista, ação, objetivo, condição de término e feedback.'],
   ['03','CONFERIR','Use “Ver minha ficha de missão” e confira se a ação e o final são verificáveis.'],
   ['04','ENTREGAR','Quando a prática estiver liberada, selecione “Enviar ao professor”. O rascunho não equivale ao envio.']
  ].map(a=>'<div class="pit-m01-action"><b>'+a[0]+'</b><div><strong>'+a[1]+'</strong><p>'+a[2]+'</p></div></div>').join('')+'</div>'));
 const vague=one(p,'.tm-pro-criteria');
 if(vague)all.push(slide('OFICINA LIBERADA · 6 MIN','Ideia criativa ≠ requisito verificável',
  eyebrow('COMPARE ANTES DE ENTREGAR')+
  '<div class="pit-m01-compare">'+[...vague.querySelectorAll('.tm-pro-criteria-grid > div')].map((e,i)=>'<div><span>'+(i===0?'AINDA VAGO':'JÁ TESTÁVEL')+'</span><h3>'+inner(e,'p')+'</h3><p>'+inner(e,'small')+'</p></div>').join('')+'</div>'));
 const criteria=one(p,'.tm-pro-codepanel pre')?.textContent.trim()||'';
 if(criteria)all.push(slide('OFICINA LIBERADA · 6 MIN','Como reconhecer um requisito correto',
  eyebrow('CRITÉRIOS DE ACEITAÇÃO')+lead('Um requisito precisa prever tanto o sucesso quanto os casos em que a vitória ainda não deve acontecer.')+
  '<pre class="pit-m01-pseudocode">'+esc(criteria)+'</pre>'));
 const evals=[...r.querySelectorAll('.tm-pro-eval article')];
 if(evals.length)all.push(slide('RESULTADOS · 1 MIN','O que será avaliado na Missão 01?',
  eyebrow('TRÊS CRITÉRIOS CLAROS')+
  '<div class="pit-m01-evaluation">'+evals.map((e,i)=>'<div><b>'+String(i+1).padStart(2,'0')+'</b><span>'+esc(txt(e,'small'))+'</span><h3>'+esc(txt(e,'h4'))+'</h3><p>'+esc(txt(e,'p'))+'</p></div>').join('')+'</div>'));
 all.push(slide('RESULTADOS · 1 MIN','Próxima missão: transformar a ideia em MVP',
  eyebrow('MISSÃO 01 CONCLUÍDA · PREPARAÇÃO PARA A 02')+
  '<div class="pit-m01-finale"><div class="pit-m01-mark">✦</div><h2>Uma ideia se torna projeto quando pode ser testada.</h2><p>Na Missão 02, vamos reduzir a proposta a uma cena, uma ação principal e um resultado verificável — a primeira versão mínima jogável.</p><div class="pit-m01-chips"><span>IDENTIDADE</span><span>MECÂNICA</span><span>CONDIÇÃO DE VITÓRIA</span></div></div>'));
 return all;
}
function mount(root,slide){
 if(slide.interactive&&window.PIT_TEACHER_MISSION_ONE?.mount){
  const runtime=root.querySelector('.pit-m01-runtime');
  if(runtime)window.PIT_TEACHER_MISSION_ONE.mount(runtime);
 }
 if(slide.images)root.querySelectorAll('.pit-m01-guide img').forEach(img=>{
  const fallback=()=>{if(img.dataset.failed)return;img.dataset.failed='1';img.src='./v3/assets/guide/gdevelop-eventos-pt.svg';img.alt='Ilustração alternativa do editor de eventos do GDevelop'};
  img.addEventListener('error',fallback);
  if(img.complete&&img.naturalWidth===0)fallback();
 });
}
window.PIT_M01_PROJECTOR={build,mount};
})();
/* PIT Game Jam IA — Missão 01, versão de oficina: 7 telas + aprofundamento voluntário.
 * Mantém o deck anterior de 27 telas acessível com ?m01=detalhado.
 * Conceitos autoexplicativos, simulador real, tempo de criação e avaliação.
 * NÃO altera API, aula do aluno, notas privadas ou liberação de missões.
 */
(function(){
'use strict';
const previous=window.PIT_M01_PROJECTOR;
const M=window.PIT_TEACHER_MISSION_ONE;
const G=window.PIT_TEACHER_GDEVELOP_GUIDE;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const cap=s=>'<div class="pit-m01-kicker">'+s+'</div>';
const shot=(section,title,html,extra={})=>({section,title,html:'<section class="pit-m01-deck pit-workshop-deck">'+html+'</section>',...extra});
const deep=(id,title)=>'<button type="button" class="pit-ws-depth-trigger" data-pit-depth="'+id+'" aria-haspopup="dialog">✧ Aprofundar conceito <span aria-hidden="true">↗</span></button>';
const cards=(data,cls='pit-ws-concepts')=>'<div class="'+cls+'">'+data.map(x=>'<article class="pit-ws-concept"><span>'+x[0]+'</span><h3>'+x[1]+'</h3><p>'+x[2]+'</p></article>').join('')+'</div>';
const deeper={
 design:{
  title:'Além da definição: game design e desenvolvimento',
  body:'<div class="pit-ws-depth-grid">'+
   '<article><h3>Game design não é programação</h3><p><strong>Game design</strong> determina ações, regras, objetivos, desafios e retornos. <strong>Desenvolvimento</strong> implementa esse plano com cenas, objetos, eventos, variáveis e testes.</p><p>Exemplo: “três cristais liberam a saída” é um requisito. Criar os eventos de coleta e abertura da porta é implementação.</p></article>'+
   '<article><h3>Mecânica → dinâmica → experiência (MDA)</h3><p><strong>Mecânica:</strong> o jogador tem energia limitada. <strong>Dinâmica:</strong> precisa agir com cuidado. <strong>Experiência:</strong> sente tensão e conquista. Estética envolve a sensação provocada, não apenas o visual.</p><p>Em uma oficina curta, escolha uma mecânica central antes de adicionar sistemas secundários.</p></article></div>'+
   '<p class="pit-ws-depth-foot">Leitura de referência: <a href="https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/" target="_blank" rel="noopener noreferrer">Modelo MDA</a></p>'
 },
 loop:{
  title:'Estado, variável, condição e ciclo de jogo',
  body:'<div class="pit-ws-depth-grid">'+
   '<article><h3>Variável = informação armazenada</h3><p>Uma variável guarda um valor que o jogo precisa lembrar. <strong>cristais = 2</strong> é o estado atual. Quando o jogador coleta mais um, <strong>cristais = 3</strong>. Estado é o conjunto de informações relevantes para a partida.</p><p>Formalmente: o próximo estado depende do estado atual e da ação do jogador.</p></article>'+
   '<article><h3>Condição = pergunta de verdadeiro ou falso</h3><p>Para abrir a porta, o evento verifica duas coisas: <strong>cristais ≥ 3</strong> e <strong>interagiu com a porta</strong>. Antes disso, uma tentativa produz uma resposta de bloqueio.</p><p>O <strong>core gameplay loop</strong> se repete: perceber → agir → receber feedback → decidir novamente. É diferente do loop técnico da engine.</p></article></div>'+
   '<pre class="pit-ws-code">SE coletou cristal → cristais = cristais + 1\nSE interagiu com a porta E cristais >= 3 → vitória\nSENÃO → mostrar "Ainda faltam cristais"</pre>'
 },
 engine:{
  title:'Como a lógica aparece dentro do GDevelop',
  body:'<div class="pit-ws-depth-grid">'+
    '<article><h3>As cinco peças do editor</h3><p><strong>Scene:</strong> espaço onde o jogo acontece. <strong>Objects:</strong> jogador, cristais e porta. <strong>Behaviors:</strong> movimento ou física prontos. <strong>Events:</strong> condições e ações da lógica. <strong>Variables:</strong> armazenam o contador.</p><p><strong>Preview</strong> executa o jogo e mostra se a regra funcionou.</p></article>'+
    '<article><h3>Dois eventos que você pode construir</h3><p><strong>Evento A:</strong> se o jogador toca no cristal, excluir o cristal e somar 1 à variável.</p><p><strong>Evento B:</strong> se há pelo menos 3 cristais e o jogador interage com a porta, trocar a cena ou mostrar a mensagem de vitória.</p><p>Se a porta abrir sem coletar cristais, a regra está errada.</p></article></div>'+
    '<p class="pit-ws-depth-foot"><a href="https://wiki.gdevelop.io/gdevelop5/interface/events-editor/" target="_blank" rel="noopener noreferrer">Documentação oficial do editor de eventos</a></p>'
 },
 test:{
  title:'Testar significa comparar esperado e observado',
  body:'<div class="pit-ws-depth-grid">'+
    '<article><h3>Casos que precisam funcionar</h3><p><strong>Teste A:</strong> 0 cristais + interagir → porta fechada.</p><p><strong>Teste B:</strong> 2 cristais + interagir → porta fechada.</p><p><strong>Teste C:</strong> 3 cristais + interagir → porta aberta.</p></article>'+
    '<article><h3>O que é um requisito testável?</h3><p>“Quero um jogo incrível” não diz o que programar ou testar. “O jogador coleta três cristais e, ao interagir com a porta, vence” define ação, estado, condição e resposta.</p><p>Um teste verifica comportamento, não opinião estética.</p></article></div>'
 }
};
function guideContent(){
 const stages=Array.isArray(G?.stages)?G.stages:[];
 return '<div class="pit-ws-guide-list">'+stages.map((g,i)=>'<article><div class="pit-ws-guide-art"><img src="'+esc(g.img)+'" alt="'+esc(g.alt)+'" loading="lazy"></div><div><small>ETAPA '+(i+1)+' / '+stages.length+'</small><h3>'+esc(g.title)+'</h3><p>'+esc(g.lead)+'</p><ol>'+(g.steps||[]).map(s=>'<li><strong>'+esc(s[0])+'</strong> · '+esc(s[1])+'</li>').join('')+'</ol><p class="pit-ws-guide-note">'+esc(g.note)+'</p></div></article>').join('')+'</div>';
}
deeper.guide={title:'GDevelop — tutorial visual por etapas',body:guideContent()};
const clock={seconds:11*60,started:false,tick:null,until:0};
const stopClock=()=>{if(clock.tick){clearInterval(clock.tick);clock.tick=null;} if(clock.started){clock.seconds=Math.max(0,Math.ceil((clock.until-performance.now())/1000));clock.started=false;}};
function build(){
 if(new URLSearchParams(location.search).get('m01')==='detalhado')return previous.build();
 stopClock();clock.seconds=11*60;
 const slides=[];
 slides.push(shot('ABERTURA · 1 MIN','Missão 01 — o chamado',
  cap('CAPÍTULO I · O CHAMADO · DA IDEIA À PRIMEIRA REGRA')+
  '<div class="pit-m01-cover pit-ws-cover"><div class="pit-ws-cover-copy"><h2>Seu jogo começa com uma escolha.</h2>'+
  '<p>Toda aventura nasce de uma ação e de uma regra. Hoje, vamos descobrir como um jogo responde ao jogador e planejar a primeira mecânica testável.</p>'+
  '<div class="pit-m01-chips"><span>CONCEITO</span><span>EXPERIMENTO</span><span>CRIAÇÃO</span></div></div>'+
  '<div class="pit-m01-hero-cinema" aria-hidden="true"><img class="pit-cinema-poster" src="./v3/assets/missions/missao-01.webp" alt="" loading="eager">'+
  '<video class="pit-cinema-film" src="./v3/assets/missions/missao-01-motion.mp4" poster="./v3/assets/missions/missao-01.webp" muted loop playsinline preload="metadata" aria-hidden="true"></video>'+
  '<div class="pit-m01-cinema-shade"></div><div class="pit-m01-cinema-runes"><span>✧</span><span>✦</span><span>✧</span></div>'+
  '<div class="pit-m01-cinema-legend"><span>MISSÃO 01 / 10</span><strong>O CHAMADO</strong></div></div></div>'));
 slides.push(shot('CONCEITOS · 3 MIN','O que transforma uma ideia em jogo?',
  cap('FUNDAMENTOS · JOGADOR, OBJETIVO, REGRA E FEEDBACK')+
  '<p class="pit-ws-lead">Um jogo digital é um sistema interativo: o jogador realiza ações, as regras determinam o que acontece e a interface mostra o resultado. Sem uma ação e uma resposta, há uma história — mas não necessariamente uma jogabilidade.</p>'+
  cards([
   ['01 · QUEM AGE','Jogador','É quem toma decisões. No nosso exemplo, controla uma exploradora dentro de um castelo.'],
   ['02 · PARA ONDE','Objetivo','É o resultado desejado: encontrar três cristais e sair do castelo.'],
   ['03 · COMO FUNCIONA','Mecânica e regra','A mecânica é coletar. A regra diz que a porta só abre após três coletas.'],
   ['04 · O QUE MUDA','Feedback','O contador mostra 1/3, 2/3 e 3/3; a porta reage conforme a regra.']
  ])+
  '<div class="pit-ws-bottom"><strong>Em qualquer gênero:</strong> escolha o que o jogador faz, o que precisa conseguir e como saberá que conseguiu.'+deep('design','Game design')+'</div>',{deepId:'design'}));
 slides.push(shot('CONCEITOS · 3 MIN','Como o jogo reage a uma ação?',
  cap('SISTEMA INTERATIVO · DO COMANDO À RESPOSTA')+
  '<p class="pit-ws-lead">A cada interação, o jogo verifica uma condição, modifica informações armazenadas e mostra uma resposta. Depois, o jogador decide o que fazer novamente.</p>'+
  '<div class="pit-ws-flow" aria-label="Entrada, condição, estado e feedback">'+
   [['01','ENTRADA','Coletar um cristal'],['02','CONDIÇÃO','O item existe e pode ser coletado?'],['03','ESTADO','Cristais: 2 → 3'],['04','FEEDBACK','HUD: 3/3 · porta liberada']].map((x,i)=>'<div class="pit-ws-flow-node"><span>'+x[0]+'</span><h3>'+x[1]+'</h3><p>'+x[2]+'</p></div>'+(i<3?'<b aria-hidden="true">›</b>':'')).join('')+'</div>'+
  '<div class="pit-ws-bottom"><strong>Loop da jogabilidade:</strong> perceber → agir → receber resposta → decidir novamente.'+deep('loop','Estado e variável')+'</div>',{deepId:'loop'}));
 const d=document.createElement('template');d.innerHTML=M.render('demo');
 const stage=d.content.querySelector('.tm-pro-stage')?.outerHTML||'';
 const debug=d.content.querySelector('.tm-pro-debugger')?.outerHTML||'';
 slides.push(shot('EXEMPLO VIVO · 4 MIN','Experimente a regra dos três cristais',
  cap('SIMULADOR INTERATIVO · TENTE FALHAR ANTES DE VENCER')+
  '<p class="pit-ws-lead pit-ws-compact-lead">Primeiro tente abrir a porta com <strong>0 cristais</strong>. Depois colete três e tente de novo. Observe como a mesma ação gera resultados diferentes conforme o estado do jogo.</p>'+
  '<div class="pit-m01-runtime pit-m01-sim pit-ws-simulator"><div class="pit-m01-sim-grid">'+stage+debug+'</div></div>',
  {interactive:true,simulator:true}));
 slides.push(shot('DO CONCEITO AO EDITOR · 2 MIN','Como fazer isso no GDevelop?',
  cap('FERRAMENTA · CENAS, OBJETOS, EVENTOS E VARIÁVEIS')+
  '<p class="pit-ws-lead">O GDevelop permite programar regras sem escrever código: cada evento tem uma <strong>condição</strong> (SE) e uma <strong>ação</strong> (ENTÃO). Assim, as decisões da Missão 1 poderão virar um jogo jogável.</p>'+
  cards([
   ['1 · CENA','Onde acontece','Uma cena reúne o cenário e os objetos da partida.'],
   ['2 · OBJETOS','Quem participa','Jogador, cristais, porta e textos do HUD.'],
   ['3 · EVENTOS','O que acontece','Se tocar no cristal, some 1 ao contador; se tiver 3 e interagir, a porta abre.'],
   ['4 · PREVIEW','Como conferir','Execute o jogo e compare o comportamento com o resultado esperado.']
  ],'pit-ws-concepts pit-ws-engine')+
  '<div class="pit-ws-bottom"><strong>Não vamos programar tudo agora:</strong> esta missão define a regra; as seguintes implementam o protótipo.'+deep('engine','Editor de eventos')+
  '<button type="button" class="pit-ws-quiet" data-pit-depth="guide" aria-haspopup="dialog">◈ Tutorial visual do GDevelop</button></div>',
  {deepId:'engine'}));
 const fields=[['Gênero','RPG, puzzle, terror, plataforma...'],['Título','Nome provisório do jogo'],['Protagonista','Quem o jogador controla'],['Ação principal','O que ele faz? Use um verbo'],['Objetivo','O que precisa alcançar?'],['Condição de vitória','Como saber que terminou?'],['Feedback','Como o jogo mostra o resultado?']];
 slides.push(shot('MODO OFICINA · 11 MIN','Agora é a sua vez: crie a primeira ficha',
  cap('MOMENTO DE CRIAÇÃO · CADERNO DO ALUNO · MISSÃO 01')+
  '<div class="pit-ws-practice"><div class="pit-ws-worksheet"><h3>Os sete campos do seu jogo</h3><div class="pit-ws-fields">'+fields.map((x,i)=>'<div><b>'+String(i+1).padStart(2,'0')+'</b><span><strong>'+x[0]+'</strong><small>'+x[1]+'</small></span></div>').join('')+'</div></div>'+
  '<aside class="pit-ws-task"><div class="pit-ws-task-top">⏳ SEU TEMPO DE CRIAÇÃO</div><div class="pit-ws-timer" data-pit-timer role="timer" aria-label="Tempo restante de oficina">11:00</div>'+
  '<div class="pit-ws-timer-controls"><button type="button" data-pit-timer-action="toggle">▶ Iniciar</button><button type="button" data-pit-timer-action="reset">↺ Reiniciar</button></div>'+
  '<p><strong>Leia (2 min):</strong> o briefing. <strong>Explore (2 min):</strong> os exemplos e o prompt de ideias. <strong>Crie (5 min):</strong> preencha 7 campos. <strong>Revise (2 min):</strong> confira e entregue.</p>'+
  '<label class="pit-ws-check"><input type="checkbox" data-pit-task="1"> Escolhi gênero, título e protagonista</label>'+
  '<label class="pit-ws-check"><input type="checkbox" data-pit-task="2"> Minha ação leva a um objetivo testável</label>'+
  '<label class="pit-ws-check"><input type="checkbox" data-pit-task="3"> Defini condição de vitória e feedback</label>'+
  '<div class="pit-ws-progress" aria-live="polite">0 de 3 verificações</div></aside></div>',
  {workshop:true}));
 slides.push(shot('VALIDAÇÃO · 1 MIN','Uma boa ideia pode ser testada',
  cap('FECHAMENTO · CRITÉRIOS DE ACEITAÇÃO')+
  '<p class="pit-ws-lead">Antes de enviar sua ficha, verifique se ela permite que outra pessoa entenda <strong>o que o jogador faz</strong>, <strong>o que acontece</strong> e <strong>quando a partida termina</strong>.</p>'+
  cards([
   ['01 · IDENTIDADE','Universo definido','Gênero, título e personagem principal identificáveis.'],
   ['02 · MECÂNICA','Ação verificável','Uma ação concreta do jogador, como coletar, saltar ou conversar.'],
   ['03 · CONDIÇÃO','Final observável','Uma regra que permite saber se o jogador venceu ou falhou.']
  ],'pit-ws-concepts pit-ws-review')+
  '<div class="pit-ws-bottom"><strong>Checklist real da Missão 01:</strong> gênero, título, protagonista, ação e objetivo; condição final observável; feedback explicado. Revise a ficha e selecione “Enviar ao professor”. O GDevelop começa na Missão 03.'+
  deep('test','Testes de aceitação')+'</div>',{deepId:'test'}));
 return slides;
}
function mountClock(root){
 const timer=root.querySelector('[data-pit-timer]'),toggle=root.querySelector('[data-pit-timer-action="toggle"]'),reset=root.querySelector('[data-pit-timer-action="reset"]');
 if(!timer||!toggle||!reset)return;
 const redraw=()=>{
  const sec=Math.max(0,clock.seconds);
  timer.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
  toggle.textContent=clock.started?'Ⅱ Pausar':'▶ '+(clock.seconds<660?'Retomar':'Iniciar');
  timer.classList.toggle('pit-ws-time-over',sec===0);
 };
 function update(){
  clock.seconds=Math.max(0,Math.ceil((clock.until-performance.now())/1000));
  if(!clock.seconds)stopClock();
  redraw();
 }
 toggle.addEventListener('click',()=>{
  if(clock.started){stopClock()}else if(clock.seconds){clock.until=performance.now()+clock.seconds*1000;clock.started=true;clock.tick=setInterval(update,250)}
  redraw();
 });
 reset.addEventListener('click',()=>{stopClock();clock.seconds=660;redraw()});
 root.querySelectorAll('[data-pit-task]').forEach(x=>x.addEventListener('change',()=>{
  root.querySelector('.pit-ws-progress').textContent=root.querySelectorAll('[data-pit-task]:checked').length+' de 3 verificações';
 }));
 redraw();
}
function mount(root,slide){
 stopClock();
 if(new URLSearchParams(location.search).get('m01')==='detalhado')return previous.mount(root,slide);
 if(slide.simulator)previous.mount(root,slide);
 if(slide.workshop)mountClock(root);
 root.querySelectorAll('[data-pit-depth]').forEach(button=>button.addEventListener('click',()=>showDepth(root,button.dataset.pitDepth,button)));
}
function showDepth(root,id,trigger){
 const entry=deeper[id];if(!entry)return;
 const modal=document.createElement('div');modal.className='pit-ws-depth-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',entry.title);
 modal.innerHTML='<div class="pit-ws-depth-pane"><div class="pit-ws-depth-head"><div><small>✧ APROFUNDAMENTO OPCIONAL · NÃO FAZ PARTE DAS 7 TELAS</small><h2>'+esc(entry.title)+'</h2></div><button type="button" data-pit-depth-close>✕ Fechar</button></div><div class="pit-ws-depth-body">'+entry.body+'</div></div>';
 root.appendChild(modal);
 const close=()=>{modal.remove();document.removeEventListener('keydown',onEscape,true);trigger?.focus()};
 const onEscape=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}};
 modal.querySelector('[data-pit-depth-close]').addEventListener('click',close);
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 document.addEventListener('keydown',onEscape,true);
 modal.querySelector('[data-pit-depth-close]').focus();
 modal.querySelectorAll('.pit-ws-guide-art img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;img.parentElement.textContent='Imagem de referência indisponível; siga o roteiro textual ao lado.'}));
}
window.PIT_M01_PROJECTOR={build,mount,previousBuild:previous.build};
})();
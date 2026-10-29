/* PIT Game Jam IA — Caderno do Professor · Missão 01 / edição universitária.
 * Material para projeção: conceitos, modelos, exemplos e laboratório, não notas de fala.
 * Atividade simulada localmente; não acessa a API da turma.
 */
(function(){
'use strict';
const PLAN={
 1:[9,4,6,1],2:[9,5,14,2],3:[5,5,18,2],4:[6,5,36,3],5:[8,5,24,3],
 6:[5,5,32,3],7:[7,4,36,3],8:[5,4,28,3],9:[3,3,16,3],10:[4,3,18,5]
};
const PHASES=['briefing','demo','practice','review'];
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function minutes(n){return PLAN[n]||PLAN[1]}
function badge(n,p){return minutes(n)[Math.max(0,PHASES.indexOf(p))]+' min'}
const headline=(tag,title,lead)=>'<header class="tm-pro-lead" data-reveal><span class="tm-pro-eyebrow">'+tag+'</span><h3>'+title+'</h3><p>'+lead+'</p></header>';
function frame(phase,body){
 const titles={briefing:'ARQUITETURA DE UM JOGO',demo:'EVENTOS EM EXECUÇÃO',practice:'PROJETO DA EXPERIÊNCIA',review:'REQUISITOS VERIFICÁVEIS'};
 return '<div class="tm1-root tm-pro-root" data-teacher-phase="'+phase+'"><header class="tm1-chapter tm-pro-chapter">'+
 '<span class="tm1-crest">✦ PIT GAME JAM IA / CIÊNCIA & DESIGN DE JOGOS</span>'+
 '<div class="tm1-headline"><span class="tm1-numeral">I</span><div><span>CAPÍTULO I · O CHAMADO</span><h2>Um jogo é um sistema de decisões.</h2>'+
 '<p>Interatividade, estado, regras e experiência do jogador.</p></div></div>'+
 '<div class="tm1-cadence" aria-label="Distribuição do tempo">'+
 ['CONCEITOS','SIMULAÇÃO','CRIAÇÃO','RESULTADO'].map((v,i)=>'<div class="'+(PHASES[i]===phase?'active':'')+'"><strong>'+minutes(1)[i]+' min</strong><span>'+v+'</span></div>').join('')+
 '</div></header><div class="tm1-section tm-pro-section"><div class="tm1-section-heading"><span>◈ '+titles[phase]+'</span><span>'+badge(1,phase)+' / 20 MIN</span></div>'+body+
 '</div><footer class="tm1-footer">PIT GAME JAM IA · DA DEFINIÇÃO À IMPLEMENTAÇÃO · MISSÃO 01 / 10</footer></div>';
}
const card=(n,label,title,body,example,output='')=>
 '<article class="tm-pro-card" data-reveal style="--tm-index:'+n+'"><div class="tm-pro-card-top"><span class="tm-pro-card-no">'+String(n).padStart(2,'0')+'</span><span class="tm-pro-card-tag">'+esc(label)+'</span></div>'+
 '<h4>'+title+'</h4><div class="tm-pro-body">'+body+'</div>'+
 (example?'<div class="tm-pro-example"><span>NO JOGO</span><p>'+example+'</p></div>':'')+
 (output?'<div class="tm-pro-output">'+output+'</div>':'')+'</article>';
function concepts(){
 return frame('briefing',
 headline('FUNDAMENTOS DE GAME DESIGN · ENSINO SUPERIOR','Do requisito à experiência jogável.',
 'Um jogo digital é um sistema de software que recebe ações do jogador, modifica seu estado conforme regras e comunica o resultado. Game design define <strong>quais interações produzirão a experiência</strong>; a engenharia implementa, executa e testa essas regras.')+
 '<div class="tm-pro-hero" data-reveal><div class="tm-pro-hero-art" role="img" aria-label="Portal de fantasia sobre um castelo gótico"><span>GAME DESIGN / 01</span></div>'+
 '<div class="tm-pro-hero-content"><small>MODELO DE SISTEMA INTERATIVO</small><h4>Entrada → Regra → Estado → Feedback</h4>'+
 '<p>Cada decisão do jogador gera uma entrada. A lógica verifica as condições e altera as variáveis. O jogo apresenta essa mudança e permite uma nova decisão.</p>'+
 '<div class="tm-pro-flow" aria-label="Fluxo de processamento">'+
 ['ENTRADA','CONDIÇÃO','ESTADO','RESPOSTA'].map((t,i)=>'<div class="tm-pro-flow-node"><span>0'+(i+1)+'</span><strong>'+t+'</strong></div>').join('<b aria-hidden="true">›</b>')+'</div>'+
 '</div></div>'+
 '<div class="tm-pro-grid">'+
 card(1,'MODELAGEM','Estado, ações e transições',
 '<p>Uma interação pode ser descrita por um <strong>estado S</strong>, uma <strong>ação a</strong> e uma <strong>função de transição T</strong>. A regra calcula o próximo estado: <strong>Sₜ₊₁ = T(Sₜ, aₜ)</strong>. Essa é a mesma abstração empregada em máquinas de estados e aplicações orientadas a eventos.</p>',
 'S = {cristais: 2, porta: fechada}. A ação “coletar” produz S = {cristais: 3, porta: liberada}.',
 '<code>Entrada → verificação → atualização → saída</code>')+
 card(2,'ENGENHARIA','Game design ≠ programação',
 '<p><strong>Game design</strong> determina objetivos, mecânicas, regras, progressão e feedback. <strong>Desenvolvimento</strong> transforma essas decisões em cenas, objetos, eventos, variáveis, controles e recursos. São atividades complementares, não sinônimas.</p>',
 'Requisito: “3 cristais liberam a porta”. Implementação: colisão com item, contador, verificação da condição e mudança no objeto Porta.',
 '<code>Requisito verificável → evento + teste</code>')+
 card(3,'MODELO MDA','Mecânicas, dinâmicas e estética',
 '<p>No modelo <strong>MDA</strong>, mecânicas são as regras e componentes; dinâmicas são os comportamentos que surgem quando o sistema funciona; estética é a experiência provocada no jogador (como desafio, descoberta ou tensão). A estética aqui não significa apenas qualidade gráfica.</p>',
 'Mecânica: energia limitada. Dinâmica: explorar com cautela. Estética: sensação de risco.',
 '<code>Regras → comportamento → experiência</code>')+
 card(4,'GAMEPLAY','Core gameplay loop',
 '<p>É o <strong>ciclo de decisões do jogador</strong>, repetido durante a experiência: perceber um problema, agir, obter retorno e decidir novamente. Ele organiza a jogabilidade. <strong>Não é o mesmo que o loop técnico</strong> que a engine executa a cada atualização para processar lógica e renderização.</p>',
 'Explorar → encontrar cristal → coletar → perceber 1/3 → continuar explorando.',
 '<code>Desafio → ação → feedback → decisão ↻</code>')+
 card(5,'LÓGICA','Condição, restrição e vitória',
 '<p>O <strong>objetivo</strong> descreve o que o jogador tenta alcançar. A <strong>condição</strong> é uma expressão booleana que decide quando isso aconteceu. Restrições controlam ações inválidas, enquanto o feedback torna o estado observável. Um bom requisito especifica os três elementos.</p>',
 'Condição: cristais ≥ 3 E interagir com a porta. Sem os três itens, a porta permanece fechada.',
 '<code>canOpen = (cristais ≥ 3) && interagiu</code>')+
 card(6,'ENGINE','Como o GDevelop representa isso',
 '<p>Uma <strong>Scene</strong> contém instâncias; <strong>Objects</strong> representam jogador, itens e porta; <strong>Behaviors</strong> oferecem controles prontos; <strong>Events</strong> combinam condições e ações; <strong>variables</strong> guardam o estado. O <strong>Preview</strong> executa o projeto para validar seu comportamento.</p>',
 'Evento: Player colide com Cristal → remover a instância selecionada e aumentar a variável de cena cristais.',
 '<code>Scene → Objects → Events → Preview</code>')+
 '</div>'+
 '<section class="tm-pro-example-switch" data-reveal><div class="tm-pro-switch-head"><div><span class="tm-pro-eyebrow">UMA ESTRUTURA, VÁRIOS GÊNEROS</span><h4>Troque o gênero. O modelo continua válido.</h4></div><div class="tm-pro-switch-controls" role="group" aria-label="Exemplos por gênero">'+
 '<button type="button" data-tm-genre="rpg" aria-pressed="true">RPG</button><button type="button" data-tm-genre="puzzle" aria-pressed="false">PUZZLE</button><button type="button" data-tm-genre="terror" aria-pressed="false">TERROR</button></div></div>'+
 '<div class="tm-pro-case-grid"><div><small>AÇÃO PRINCIPAL</small><strong data-tm-genrefield="action">Explorar e coletar relíquias</strong></div><div><small>REGRA</small><strong data-tm-genrefield="rule">Três relíquias liberam o portal</strong></div><div><small>FEEDBACK</small><strong data-tm-genrefield="feedback">Contador e portal iluminado</strong></div></div>'+
 '<div class="tm-pro-case-code" data-tm-genrefield="pseudo">SE itens ≥ 3 E interagirPortal → concluirMissão()</div></section>'+
 '<div class="tm-pro-codepanel" data-reveal><div class="tm-pro-code-title"><span>DO GAME DESIGN À ESPECIFICAÇÃO</span><span>EXEMPLO DE PSEUDOCÓDIGO</span></div>'+
 '<pre><code><span class="cm">// Modelo conceitual do primeiro protótipo</span>\nestado = { cristais: 0, portaAberta: false }\n\n<span class="kw">aoColetarCristal</span>():\n  estado.cristais = min(3, estado.cristais + 1)\n  atualizarContadorNaTela(estado.cristais)\n\n<span class="kw">aoInteragirComPorta</span>():\n  <span class="kw">se</span> estado.cristais >= 3:\n    estado.portaAberta = true\n    mostrarMensagem("Missão concluída")\n  <span class="kw">senão</span>:\n    mostrarMensagem("Ainda faltam cristais")</code></pre>'+
 '<p><strong>Critério de aceitação:</strong> com 0, 1 ou 2 cristais a porta permanece fechada; com 3 cristais e interação, abre. O aluno implementará condições equivalentes no GDevelop nas próximas missões.</p></div>'+
 '<div class="tm1-sources" data-reveal><span>FUNDAMENTAÇÃO</span>'+
 '<a href="https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/" target="_blank" rel="noopener noreferrer">MDA · Hunicke, LeBlanc e Zubek</a>'+
 '<a href="https://wiki.gdevelop.io/gdevelop5/tutorials/basic-game-making-concepts/" target="_blank" rel="noopener noreferrer">Conceitos do GDevelop</a>'+
 '<a href="https://wiki.gdevelop.io/gdevelop5/interface/events-editor/" target="_blank" rel="noopener noreferrer">Editor de eventos</a></div>');
}
function demo(){
 return frame('demo',
 headline('LABORATÓRIO INTERATIVO','A regra não é uma imagem: é uma transição de estado.',
 'O protótipo abaixo executa um conjunto de regras e mantém um estado observável. As mesmas condições podem ser representadas por eventos no GDevelop. Experimente uma interação inválida, colete recursos e avalie a mudança no comportamento.')+
 '<div class="tm-pro-demo-layout">'+
 '<section class="tm-pro-stage" data-reveal><div class="tm-pro-stage-label">◈ CASTELO DOS CRISTAIS · PROTÓTIPO LÓGICO</div>'+
 '<div class="tm-pro-game-scene" id="tm1Scene"><div class="tm-pro-game-player" aria-hidden="true">♟</div>'+
 '<div class="tm-pro-game-crystal" id="tm1Crystal" aria-hidden="true">◆</div>'+
 '<div class="tm-pro-game-door" id="tm1Gate" aria-hidden="true">♜</div>'+
 '<div class="tm-pro-game-victory" id="tm1Victory" hidden>✦ MISSÃO CONCLUÍDA ✦</div></div>'+
 '<div class="tm-pro-stats"><div><small>CONTADOR</small><strong id="tm1Gems">0/3</strong><div class="tm-pro-stat-rail"><i id="tm1Bar"></i></div></div>'+
 '<div><small>PORTA</small><strong id="tm1Door">FECHADA</strong></div><div><small>FASE</small><strong id="tm1GameState">EXPLORAR</strong></div></div>'+
 '<div class="tm-pro-game-controls" role="group" aria-label="Ações do jogador">'+
 '<button type="button" data-tm1="collect">◆ COLETAR CRISTAL</button>'+
 '<button type="button" data-tm1="door">♜ INTERAGIR COM A PORTA</button>'+
 '<button type="button" data-tm1="reset">↺ REINICIAR</button></div></section>'+
 '<section class="tm-pro-debugger" data-reveal><div class="tm-pro-debug-head"><div><span>EVENTO ATUAL</span><strong id="tm1Step">Aguardando entrada</strong></div><span class="tm-pro-live"><i></i> SIMULADOR LOCAL</span></div>'+
 '<div id="tm1Feedback" class="tm-pro-dbg-message" role="status" aria-live="polite">S = {cristais: 0, fase: EXPLORAR}. A porta está fechada. Selecione uma ação.</div>'+
 '<div class="tm-pro-rule-stack" aria-label="Condições e ações da máquina de estados">'+
 '<div data-tm-rule="collect"><span>REGRA 01 · COLETA</span><code>SE coletar E cristais &lt; 3 → cristais++</code></div>'+
 '<div data-tm-rule="lock"><span>REGRA 02 · RESTRIÇÃO</span><code>SE interagir E cristais &lt; 3 → bloquear</code></div>'+
 '<div data-tm-rule="win"><span>REGRA 03 · CONCLUSÃO</span><code>SE interagir E cristais ≥ 3 → vitória</code></div></div>'+
 '<div class="tm-pro-trace"><span>RASTRO DE EVENTOS</span><ol id="tm1Trace"><li>Inicialização: cristais = 0; porta = fechada.</li></ol></div></section></div>'+
 '<div class="tm-pro-tech-grid"><article data-reveal><span>MODELO DE TRANSIÇÃO</span><h4>Sₜ₊₁ = T(Sₜ, entrada)</h4>'+
 '<p>O estado é alterado apenas quando uma regra é satisfeita. O mesmo comando pode produzir resultados diferentes dependendo dos valores armazenados.</p>'+
 '<div class="tm-pro-graph"><span>EXPLORAR</span><b>3 itens</b><span>DESBLOQUEAR</span><b>interagir</b><span>CONCLUÍDO</span></div></article>'+
 '<article data-reveal><span>TESTE DE CAIXA-PRETA</span><h4>Qual resultado a regra deve produzir?</h4>'+
 '<p>Cada teste isola uma entrada e compara o estado final com o resultado esperado.</p>'+
 '<div class="tm-pro-tests"><button type="button" data-tm-test="0">TESTE A · 0/3</button><button type="button" data-tm-test="2">TESTE B · 2/3</button><button type="button" data-tm-test="3">TESTE C · 3/3</button></div>'+
 '<div class="tm-pro-test-result" id="tm1TestResult" aria-live="polite">Escolha um cenário para verificar a regra de abertura.</div></article></div>'+
 '<div class="tm-pro-engine" data-reveal><div><span>NO MOTOR GDEVELOP</span><h4>Uma regra = condições + ações</h4><p><b>Objeto:</b> Jogador, Cristal e Porta. <b>Variável da cena:</b> cristais. <b>Condição:</b> colisão com objeto. <b>Ações:</b> excluir o item selecionado, somar ao contador ou concluir a partida. O <b>Preview</b> verifica o resultado real do evento.</p></div>'+
 '<span class="tm-pro-guide-direction">EXPLICAÇÃO COMPLETA LOGO ABAIXO ↓</span></div>'+
 (window.PIT_TEACHER_GDEVELOP_GUIDE?window.PIT_TEACHER_GDEVELOP_GUIDE.render():'<p class="tm-pro-guide-fallback">Os eventos combinam condições (SE) e ações (ENTÃO).</p>'));
}
const cases=[
 ['GÊNERO','Aventura / RPG','Define a linguagem de interação e expectativas do jogador.'],
 ['TÍTULO','A Última Chave','Identificador provisório do projeto.'],
 ['PROTAGONISTA','Uma exploradora','Objeto ou personagem controlável.'],
 ['AÇÃO PRINCIPAL','Coletar três cristais','Verbo que dá origem à mecânica.'],
 ['OBJETIVO','Abrir o portão do castelo','Resultado que direciona a exploração.'],
 ['CONDIÇÃO FINAL','Interagir com a porta após 3 cristais','Expressão verificável no sistema.'],
 ['FEEDBACK','Contador 3/3 e mensagem de vitória','Resposta observável da aplicação.']
];
function practice(){
 return frame('practice',
 headline('DOCUMENTO MÍNIMO DE GAME DESIGN','A ideia se transforma em uma especificação inicial.',
 'Na Missão 01, o resultado é uma ficha de concepção. Ela fornece requisitos funcionais para as próximas missões, quando o projeto será implementado no GDevelop. Os alunos podem escolher qualquer gênero: o modelo não impõe uma história única.')+
 '<details class="pit-private-teacher-notes"><summary title="Roteiro privado: abrir somente após retirar o espelhamento" aria-label="Abrir roteiro privado do professor">▤</summary><div class="pit-private-teacher-notes-body"><small>ROTEIRO PRIVADO · NÃO PROJETAR</small><span>FLUXO PRÁTICO ESPELHADO · SEM PREPARAÇÃO PRÉVIA</span><h4>O que aparece na tela do aluno e como a entrega funciona</h4><p><b>1. Abrir a Missão 01:</b> o aluno lê o desafio e seleciona “Começar a criar”. <b>2. Preencher:</b> escolhe gênero, título, protagonista, ação, objetivo, condição de vitória e feedback nos três fragmentos. <b>3. Conferir:</b> acompanha a prévia e verifica se os 3 fragmentos foram completados. <b>4. Revisar:</b> seleciona “Ver minha ficha de missão”; o sistema gera um texto com suas escolhas. <b>5. Entregar:</b> com a prática liberada, seleciona “Enviar ao professor”. A ficha só vira evidência oficial após o envio; o rascunho local não é uma entrega.</p><p><b>Se o aluno não conseguir enviar:</b> verificar mensagem de campo obrigatório, se a prática está liberada e se já existe entrega enviada ou aprovada. <b>Critério de avaliação:</b> ação expressa por verbo, objetivo observável, condição de término testável e feedback claro — independentemente do gênero escolhido.</p></div></details>'+
 '<div class="tm-pro-proposal">'+
 '<div class="tm-pro-dossier" data-reveal><span>PROJETO DE REFERÊNCIA · VERSÃO 0.1</span><h4>A Última Chave</h4><p><b>Gênero:</b> Aventura / RPG</p>'+
 '<div class="tm-pro-dossier-art" role="img" aria-label="Castelo e portal mágico"></div>'+
 '<p><b>Loop:</b> explorar → coletar → conferir o contador → explorar novamente.</p>'+
 '<p><b>Desafio:</b> obter 3 cristais e abrir a porta de saída.</p><p><b>Final:</b> uma mensagem confirma o desbloqueio.</p></div>'+
 '<div class="tm-pro-spec" data-reveal><div class="tm-pro-spec-head">SETE COMPONENTES DA PRIMEIRA FICHA</div>'+
 cases.map((c,i)=>'<div class="tm-pro-spec-row"><div class="tm-pro-spec-index">'+String(i+1).padStart(2,'0')+'</div><div><small>'+esc(c[0])+'</small><strong>'+esc(c[1])+'</strong><p>'+esc(c[2])+'</p></div></div>').join('')+'</div></div>'+
 '<div class="tm-pro-criteria" data-reveal><h4>Uma ideia criativa também precisa ser testável.</h4><div class="tm-pro-criteria-grid">'+
 '<div><span>OBJETIVO VAGO</span><p>“O jogador deve viver uma grande aventura.”</p><small>Não descreve uma ação implementável nem uma conclusão verificável.</small></div>'+
 '<div><span>REQUISITO TESTÁVEL</span><p>“Coletar 3 cristais e interagir com a porta para encerrar a fase.”</p><small>Tem entrada, estado e condição observáveis.</small></div></div></div>'+
 '<div class="tm-pro-codepanel" data-reveal><div class="tm-pro-code-title"><span>CRITÉRIO DE ACEITAÇÃO</span><span>CASOS DE TESTE</span></div>'+
 '<pre><code>Estado inicial: cristais = 0; porta = fechada.\nCaso A: interagir com porta em 0/3 → continua fechada.\nCaso B: interagir com porta em 2/3 → continua fechada.\nCaso C: interagir com porta em 3/3 → abre e conclui.</code></pre>'+
 '<p>A especificação da Missão 01 será refinada como MVP na Missão 02, implementada como eventos nas missões posteriores e validada em Preview.</p></div>');
}
function review(){
 return frame('review',
 headline('COMPROVAÇÃO DE APRENDIZAGEM','O que diferencia uma intenção de um projeto?',
 'A ficha final é uma hipótese de experiência jogável. Sua qualidade pode ser avaliada por clareza técnica, coerência entre interação e objetivo, e uma regra de término que poderá ser implementada e testada.')+
 '<div class="tm-pro-eval">'+
 [
 ['IDENTIDADE','Gênero, título provisório e protagonista definidos.','Há um universo inteligível e um agente controlável.'],
 ['MECÂNICA','Ação principal expressa como verbo e relacionada a um objetivo.','Há uma interação a ser implementada no jogo.'],
 ['CONDIÇÃO','Critério de conclusão com resultado perceptível ao usuário.','Há um teste que pode comprovar a vitória ou o desfecho.']
 ].map((x,i)=>'<article data-reveal><span class="tm-pro-eval-num">0'+(i+1)+'</span><div><small>'+esc(x[0])+'</small><h4>'+esc(x[1])+'</h4><p>'+esc(x[2])+'</p></div></article>').join('')+'</div>'+
 '<div class="tm-pro-tech-grid"><article data-reveal><span>DESCRIÇÃO IMPRECISA</span><h4>“Um RPG gigante, épico e divertido.”</h4><p>Não permite decidir quais eventos programar nem quando a experiência estará concluída.</p></article>'+
 '<article data-reveal><span>REQUISITO FUNCIONAL</span><h4>“Coletar 3 cristais para liberar a saída.”</h4><p>Pode ser representado por uma variável, um teste booleano e um feedback verificável.</p></article></div>'+
 '<div class="tm-pro-engine" data-reveal><div><span>TRANSIÇÃO PARA O MVP</span><h4>Missão 02 · MVP em Foco</h4><p>O objetivo definido será limitado a uma cena, um comportamento principal, um evento e uma condição de conclusão. Esse recorte é o protótipo que será construído ao longo da oficina.</p></div></div>');
}
function render(phase){return phase==='demo'?demo():phase==='practice'?practice():phase==='review'?review():concepts()}
function mount(){
 const root=document.querySelector('.tm1-root');if(!root)return;
 if(window.PIT_TEACHER_GDEVELOP_GUIDE)window.PIT_TEACHER_GDEVELOP_GUIDE.mount();
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const reveal=[...root.querySelectorAll('[data-reveal]')];
 if(!reduced&&typeof IntersectionObserver!=='undefined'){
  root.classList.add('tm-pro-motion-ready');
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('tm-pro-revealed');observer.unobserve(entry.target);}
  },{threshold:0.08,rootMargin:'0px 0px 40px 0px'});
  reveal.forEach((el,i)=>{el.style.setProperty('--tm-delay',(i%4*100)+'ms');observer.observe(el)});
  // When the user moves to another tab, the old DOM and observer are collectible.
 }else reveal.forEach(el=>el.classList.add('tm-pro-revealed'));
 const variants={
  rpg:{action:'Explorar e coletar relíquias',rule:'Três relíquias liberam o portal',feedback:'Contador e portal iluminado',pseudo:'SE itens ≥ 3 E interagirPortal → concluirMissão()'},
  puzzle:{action:'Girar peças e ativar símbolos',rule:'Três símbolos corretos abrem a passagem',feedback:'Símbolos acesos e animação da passagem',pseudo:'SE simbolosCorretos === 3 → abrirPassagem()'},
  terror:{action:'Investigar e encontrar pistas',rule:'Obter a chave antes de acessar a saída',feedback:'Porta destrava e indicador muda',pseudo:'SE temChave E tocarPorta → escapar()'}
 };
 root.querySelectorAll('[data-tm-genre]').forEach(btn=>btn.addEventListener('click',()=>{
  const data=variants[btn.dataset.tmGenre];if(!data)return;
  root.querySelectorAll('[data-tm-genre]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  for(const [field,value] of Object.entries(data))root.querySelectorAll('[data-tm-genrefield="'+field+'"]').forEach(el=>el.textContent=value);
  const box=root.querySelector('.tm-pro-example-switch');if(box&&!reduced){box.classList.remove('tm-pro-flash');void box.offsetWidth;box.classList.add('tm-pro-flash')}
 }));
 const count=root.querySelector('#tm1Gems'),door=root.querySelector('#tm1Door'),step=root.querySelector('#tm1Step'),feedback=root.querySelector('#tm1Feedback'),gate=root.querySelector('#tm1Gate');
 if(!count||!door||!step||!feedback||!gate)return;
 const stateLabel=root.querySelector('#tm1GameState'),bar=root.querySelector('#tm1Bar'),crystal=root.querySelector('#tm1Crystal'),victory=root.querySelector('#tm1Victory'),trace=root.querySelector('#tm1Trace');
 let gems=0,won=false;
 const append=msg=>{
  if(!trace)return;
  const item=document.createElement('li');item.textContent=msg;trace.appendChild(item);
  while(trace.children.length>6)trace.removeChild(trace.firstElementChild);
 };
 function update(message,name,rule){
  count.textContent=gems+'/3';
  door.textContent=won?'ABERTA':gems===3?'LIBERADA':'FECHADA';
  if(stateLabel)stateLabel.textContent=won?'CONCLUÍDO':gems===3?'PORTA LIVRE':'EXPLORAR';
  if(bar)bar.style.width=Math.round(gems/3*100)+'%';
  gate.classList.toggle('unlocked',gems===3);
  gate.classList.toggle('won',won);
  if(crystal)crystal.classList.toggle('tm-pro-pulse',!reduced&&gems>0&&!won);
  if(victory)victory.hidden=!won;
  root.querySelectorAll('[data-tm-rule]').forEach(el=>el.classList.toggle('tm-pro-rule-active',el.dataset.tmRule===rule));
  feedback.textContent=message;step.textContent=name;
  append(name+' · '+gems+'/3 · '+(won?'vitória':gems===3?'liberada':'fechada'));
 }
 function reset(){gems=0;won=false;if(trace)trace.textContent='';update('S = {cristais: 0, fase: EXPLORAR}. A porta está fechada.','Reinício do sistema','')}
 function collect(){
  if(won){update('A partida já foi concluída. Reinicie para voltar a coletar.','Estado terminal','');return}
  if(gems<3){gems++;update('Evento de coleta: cristais = '+gems+'. O HUD reflete a variável atualizada.','Coleta processada','collect');}
  else update('O contador já atingiu o limite de 3 cristais.','Limite da coleção','collect');
 }
 function interact(){
  if(won){update('A porta já está aberta. O estado final foi preservado.','Estado terminal','win');return}
  if(gems>=3){won=true;update('Condição verdadeira: cristais ≥ 3. A porta abriu e o jogo sinalizou a conclusão.','Vitória validada','win');}
  else update('Condição falsa: cristais < 3. A porta permanece fechada; faltam '+(3-gems)+' cristais.','Acesso negado','lock');
 }
 root.querySelectorAll('[data-tm1]').forEach(btn=>btn.addEventListener('click',()=>{
  if(btn.dataset.tm1==='reset')reset();
  if(btn.dataset.tm1==='collect')collect();
  if(btn.dataset.tm1==='door')interact();
 }));
 root.querySelectorAll('[data-tm-test]').forEach(btn=>btn.addEventListener('click',()=>{
  const input=Number(btn.dataset.tmTest),expected=input===3;
  gems=input;won=false;update('Cenário preparado: '+gems+'/3 cristais. Interação com a porta executada.','Teste de aceitação','');
  interact();
  const actual=won,test=root.querySelector('#tm1TestResult');
  if(test){test.textContent='Entrada: '+input+'/3 · Esperado: '+(expected?'ABERTA':'FECHADA')+' · Obtido: '+(actual?'ABERTA':'FECHADA')+' · '+(actual===expected?'TESTE APROVADO':'TESTE FALHOU');test.classList.toggle('tm-pro-test-pass',actual===expected);}
 }));
}
window.PIT_TEACHER_MISSION_ONE={render,mount,minutes,badge,PLAN};
})();

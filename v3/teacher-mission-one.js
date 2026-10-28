/* Professor — Missão 01. Conteúdo didático autoral, não notas de fala. */
(function(){
'use strict';
const PLAN={
 1:[9,4,6,1],2:[9,5,14,2],3:[7,5,16,2],4:[6,5,36,3],5:[8,5,24,3],
 6:[5,5,32,3],7:[5,6,36,3],8:[5,4,28,3],9:[3,3,16,3],10:[4,3,18,5]
};
const PHASES=['briefing','demo','practice','review'];
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function minutes(n){return PLAN[n]||PLAN[1]}
function badge(n,phase){const k=PHASES.indexOf(phase);return minutes(n)[Math.max(0,k)]+' min';}
const frame=(phase,body)=>{
 const tabText={briefing:'FUNDAMENTOS',demo:'LABORATÓRIO',practice:'OFICINA',review:'APRENDIZAGEM'};
 return '<div class="tm1-root"><header class="tm1-chapter">'+
 '<span class="tm1-crest">✦ PIT GAME JAM IA · PROFESSOR</span>'+
 '<div class="tm1-headline"><span class="tm1-numeral">I</span><div><span>MISSÃO 01 · O CHAMADO</span><h2>O universo nasce de uma escolha</h2>'+
 '<p>Da ideia à primeira regra: o que torna uma experiência realmente jogável.</p></div></div>'+
 '<div class="tm1-cadence" aria-label="Distribuição do tempo da missão">'+
 ['CONCEITOS','EXEMPLO','CRIAÇÃO','RESULTADOS'].map((v,i)=>'<div class="'+(PHASES[i]===phase?'active':'')+'"><strong>'+minutes(1)[i]+' min</strong><span>'+v+'</span></div>').join('')+
 '</div></header><section class="tm1-section"><div class="tm1-section-heading"><span>◈ '+tabText[phase]+'</span><span>'+badge(1,phase)+' / 20 MIN</span></div>'+body+'</section>'+
 '<footer class="tm1-footer">PIT GAME JAM · PROFESSOR E ALUNO COMPARTILHAM A MESMA MISSÃO</footer></div>';
};
function concept(n,title,definition,example,detail){
 return '<article class="tm1-concept"><div class="tm1-concept-num">'+String(n).padStart(2,'0')+'</div><div>'+
 '<h3>'+esc(title)+'</h3><p>'+esc(definition)+'</p>'+
 '<div class="tm1-case"><strong>EXEMPLO APLICADO</strong><p>'+esc(example)+'</p></div>'+
 (detail?'<p class="tm1-precision">'+esc(detail)+'</p>':'')+'</div></article>';
}
function concepts(){
 return frame('briefing',
 '<div class="tm1-hero-line"><div><small>POR QUE ESTA MISSÃO EXISTE?</small><h3>Projetar o jogo vem antes de programar o jogo.</h3>'+
 '<p>Programação transforma regras em software. <strong>Game design</strong> decide quais regras, escolhas e objetivos compõem a experiência. Uma boa ideia é aquela que pode ser descrita como uma ação do jogador e uma resposta do sistema.</p></div>'+
 '<div class="tm1-cover" role="img" aria-label="Castelo de fantasia e portal iluminado"></div></div>'+
 '<div class="tm1-concepts">'+
 concept(1,'O que define um jogo?','Um jogo é um sistema interativo em que o jogador age sob regras e percebe consequências. O objetivo pode ser vencer, explorar, solucionar, criar ou chegar a um desfecho.','Um personagem coleta pistas para sair de uma sala. O jogador decide onde procurar; o sistema reage quando encontra algo.','Uma animação de uma porta abrindo sozinha pode contar uma história, mas não oferece a mesma decisão ao jogador.')+
 concept(2,'Game design × desenvolvimento','Game design descreve a experiência desejada: objetivo, mecânicas, desafios e feedback. Desenvolvimento implementa isso com cenas, objetos, eventos, lógica, arte e testes.','Design: “coletar 3 cristais abre a saída”. Implementação: colisão com Cristal → aumentar contador → verificar se chegou a 3 → liberar Porta.','Para estudantes de TI, as regras do design podem ser vistas como requisitos funcionais testáveis.')+
 concept(3,'Mecânica, dinâmica e experiência','Mecânica é a regra ou ação disponível, como coletar, saltar ou negociar. Dinâmica é o comportamento que emerge durante o uso dessas regras. Experiência é o que o jogador percebe e sente.','Mecânica: perder vida ao tocar espinhos. Dinâmica: o jogador passa a medir riscos. Experiência: tensão ao atravessar uma área perigosa.','Essas dimensões ajudam a analisar o design sem confundir regra, comportamento e efeito sobre o jogador.')+
 concept(4,'Core game loop — o ciclo principal','É a sequência curta e repetível que ocupa a maior parte da experiência: perceber um desafio → agir → receber feedback → decidir de novo. Deve ser reconhecível antes mesmo de existir uma arte final.','Explorar → encontrar cristal → coletar → ver contador 1/3 → buscar o próximo. O retorno à exploração fecha o ciclo.','Não confundir core gameplay loop com o laço técnico de atualização do motor gráfico, executado repetidamente para processar entrada, regras e desenho da cena.')+
 concept(5,'Objetivo, condição de vitória e feedback','Objetivo é o resultado pretendido. Condição de vitória é a regra verificável que marca sua realização. Feedback é o sinal que informa ao jogador o que aconteceu.','Objetivo: escapar do castelo. Condição: chegar à porta com 3 cristais. Feedback: contador 3/3, porta iluminada e mensagem de conclusão.','“Ter um jogo divertido” é uma intenção; “abrir a porta após coletar 3 cristais” é uma condição que podemos testar.')+
 '</div><div class="tm1-key"><strong>✦ DEFINIÇÃO ESSENCIAL</strong><p>Um jogo inicial precisa de um <em>verbo de ação</em>, uma <em>regra</em>, um <em>objetivo alcançável</em> e uma <em>resposta visível</em>. Seu gênero e sua história são livres.</p></div>'+
 '<div class="tm1-sources"><span>REFERÊNCIAS PARA APROFUNDAR</span><a href="https://unity.com/blog/find-your-core-game-loop" target="_blank" rel="noopener noreferrer">Core game loop · Unity</a><a href="https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/" target="_blank" rel="noopener noreferrer">Mecânica, dinâmica e estética · MDA</a><a href="https://wiki.gdevelop.io/gdevelop5/interface/" target="_blank" rel="noopener noreferrer">Documentação oficial · GDevelop</a></div>'
 );
}
function demonstration(){
 return frame('demo',
 '<div class="tm1-lead"><h3>Um mesmo game loop pode ser observado em funcionamento.</h3><p>Este laboratório representa a lógica de um jogo sem precisar abrir uma engine. O estado se altera quando um botão é acionado. O objetivo é coletar três cristais e abrir a porta.</p></div>'+
 '<div class="tm1-simulator" aria-label="Simulação interativa de um ciclo de jogo">'+
 '<div class="tm1-world"><span class="tm1-world-name">O CASTELO DOS CRISTAIS · EXEMPLO</span><div class="tm1-world-scene"><span class="tm1-avatar" aria-hidden="true">♟</span><span class="tm1-gem" aria-hidden="true">◆</span><span class="tm1-gate" id="tm1Gate" aria-hidden="true">♜</span></div>'+
 '<div class="tm1-hud"><div>CRISTAIS <strong id="tm1Gems">0/3</strong></div><div>PORTA <strong id="tm1Door">FECHADA</strong></div></div></div>'+
 '<div class="tm1-control"><div class="tm1-logic">ESTADO INICIAL <strong id="tm1Step">Observar a sala</strong></div>'+
 '<div class="tm1-actions"><button type="button" data-tm1="collect">◆ COLETAR CRISTAL</button><button type="button" data-tm1="door">♜ TENTAR PORTA</button><button type="button" data-tm1="reset">↺ REINICIAR</button></div>'+
 '<div class="tm1-feedback" role="status" aria-live="polite" id="tm1Feedback">O personagem encontra um cristal. Qual ação fará o estado mudar?</div>'+
 '<div class="tm1-event"><span>REGRA EM PSEUDOCÓDIGO</span><code>SE jogador toca Cristal → coletar; cristais = cristais + 1<br>SE cristais ≥ 3 E jogador toca Porta → concluir</code></div></div></div>'+
 '<div class="tm1-loop"><div><span>01</span><strong>DESAFIO</strong><small>Encontrar os cristais</small></div><b>→</b><div><span>02</span><strong>AÇÃO</strong><small>Coletar</small></div><b>→</b><div><span>03</span><strong>FEEDBACK</strong><small>Contador muda</small></div><b>↺</b><div><span>04</span><strong>NOVA DECISÃO</strong><small>Buscar mais ou abrir</small></div></div>'+
 '<div class="tm1-two">'+
 '<article><h4>Mesmo princípio, gêneros diferentes</h4><p><strong>Terror:</strong> procurar pista → encontrá-la → liberar passagem.</p><p><strong>Corrida:</strong> desviar obstáculos → manter velocidade → avançar.</p><p><strong>Puzzle:</strong> acionar símbolo → observar resposta → testar outra combinação.</p><p><strong>RPG:</strong> explorar → interagir → obter recurso → progredir.</p></article>'+
 '<article><h4>Como isso chegará ao GDevelop</h4><p><strong>Scene:</strong> ambiente onde o desafio acontece.</p><p><strong>Objects:</strong> jogador, cristais, porta e contador.</p><p><strong>Events:</strong> condições e ações que definem a regra.</p><p><strong>Preview:</strong> execução usada para verificar se a regra funciona.</p><p><a href="https://wiki.gdevelop.io/gdevelop5/tutorials/basic-game-making-concepts/" target="_blank" rel="noopener noreferrer">Conceitos oficiais do GDevelop ↗</a></p></article></div>'+
 '<div class="tm1-key"><strong>UMA DISTINÇÃO IMPORTANTE</strong><p>A demonstração acima é um simulador didático. Nas missões seguintes, as mesmas decisões serão implementadas no GDevelop e verificadas no Preview.</p></div>'
 );
}
function practice(){
 const examples=[
 ['GÊNERO','Aventura','Terror, corrida, RPG, puzzle, plataforma, narrativa ou outra proposta'],
 ['TÍTULO','A Última Chave','Um nome provisório já é suficiente'],
 ['PROTAGONISTA','Exploradora de um castelo','Pessoa, veículo, criatura ou objeto que o jogador controla'],
 ['AÇÃO','Coletar três cristais','O verbo representa aquilo que o jogador efetivamente fará'],
 ['OBJETIVO','Destrancar a saída','O resultado pretendido precisa ser claro'],
 ['CONCLUSÃO','Abrir a porta após obter três cristais','Critério verificável: o jogo reconhece que terminou'],
 ['FEEDBACK','Contador 3/3 e mensagem de vitória','Sinal visível ou sonoro que confirma a conquista']
 ];
 return frame('practice',
 '<div class="tm1-lead"><h3>Do conceito à primeira ficha de game design.</h3>'+
 '<p>A Missão 01 não exige abrir o GDevelop. Ela constrói o <strong>documento mínimo de concepção</strong> que orientará o protótipo nas próximas etapas. O aluno é livre para criar qualquer gênero; o exemplo abaixo não é um modelo obrigatório.</p></div>'+
 '<div class="tm1-planning"><div class="tm1-paper"><span>EXEMPLO DE REGISTRO COMPLETO</span><h3>A Última Chave</h3><p><b>Meu jogador precisa</b> coletar três cristais <b>para</b> destrancar a saída.</p><p><b>A missão acaba quando</b> a porta abre após os três cristais. <b>O jogo confirma</b> a conclusão com contador 3/3 e uma mensagem.</p></div>'+
 '<div class="tm1-workfields">'+examples.map(([label,value,meaning],i)=>'<div class="tm1-field"><span>'+String(i+1).padStart(2,'0')+' / '+esc(label)+'</span><strong>'+esc(value)+'</strong><p>'+esc(meaning)+'</p></div>').join('')+'</div></div>'+
 '<div class="tm1-three"><article><strong>FRAGMENTO I · IDENTIDADE</strong><p>Gênero, título provisório e protagonista. Esses campos respondem <em>que universo será criado</em> e <em>quem o jogador controla</em>.</p></article>'+
 '<article><strong>FRAGMENTO II · MECÂNICA</strong><p>Ação principal e objetivo. A frase “O jogador precisa [ação] para [objetivo]” conecta a fantasia a um comportamento implementável.</p></article>'+
 '<article><strong>FRAGMENTO III · CONCLUSÃO</strong><p>Condição final e feedback. Uma pessoa que não conhece o projeto precisa conseguir verificar o que representa terminar a experiência.</p></article></div>'+
 '<div class="tm1-key"><strong>PRÓXIMO CAPÍTULO · MVP EM FOCO</strong><p>A ideia será reduzida a um cenário, uma ação principal, uma regra e um resultado alcançável em seis horas. Nada exige construir um mundo inteiro nesta primeira missão.</p></div>'
 );
}
function review(){
 return frame('review',
 '<div class="tm1-lead"><h3>O resultado é uma ideia com regras testáveis.</h3><p>A Missão 01 termina com uma ficha gerada pelas escolhas do aluno, enviada para avaliação. Não é necessário executar o jogo ainda: esse trabalho começa nas próximas missões.</p></div>'+
 '<div class="tm1-checklist">'+[
 ['IDENTIDADE','Gênero, nome provisório e protagonista identificados.'],
 ['INTERAÇÃO','Ação do jogador descrita por um verbo concreto e associada a um objetivo.'],
 ['RESULTADO','Condição de término verificável e feedback perceptível.']
 ].map(([name,desc],i)=>'<div><span class="tm1-check">✓</span><p><strong>'+esc(name)+'</strong>'+esc(desc)+'</p></div>').join('')+'</div>'+
 '<div class="tm1-two"><article><h4>Exemplo verificável</h4><p>“O personagem coleta três cristais; ao chegar à porta, ela abre e aparece a mensagem de vitória.”</p><p>É possível implementar, executar e testar cada parte desse objetivo.</p></article>'+
 '<article><h4>Exemplo ainda impreciso</h4><p>“Vou criar um jogo épico e divertido com muitos mundos.”</p><p>Há uma intenção criativa, mas faltam ação, regra, objetivo e critério concreto de conclusão.</p></article></div>'+
 '<div class="tm1-key"><strong>VALIDAÇÃO E PROGRESSO</strong><p>A entrega pode ficar em análise, receber solicitação de revisão ou ser aprovada. Apenas a aprovação real do professor registra a missão como conquistada.</p></div>'
 );
}
function render(phase){return phase==='demo'?demonstration():phase==='practice'?practice():phase==='review'?review():concepts()}
function mount(){
 const root=document.querySelector('.tm1-root');if(!root)return;
 let gems=0,won=false;
 const count=root.querySelector('#tm1Gems'),door=root.querySelector('#tm1Door'),stage=root.querySelector('#tm1Step'),feedback=root.querySelector('#tm1Feedback'),gate=root.querySelector('#tm1Gate');
 if(!count||!door||!stage||!feedback||!gate)return;
 function update(message,step){
  count.textContent=gems+'/3';
  door.textContent=won?'ABERTA':gems===3?'LIBERADA':'FECHADA';
  gate.classList.toggle('unlocked',gems===3);
  gate.classList.toggle('won',won);
  feedback.textContent=message;stage.textContent=step;
 }
 root.querySelectorAll('[data-tm1]').forEach(b=>b.addEventListener('click',()=>{
  const action=b.dataset.tm1;
  if(action==='reset'){gems=0;won=false;update('A sala voltou ao início. A regra depende do estado dos objetos.','Observar a sala');return}
  if(won){update('Jogo concluído. Reinicie para explorar novamente o ciclo.', 'Vitória');return}
  if(action==='collect'){
   if(gems===3)update('O inventário atingiu três cristais. A próxima decisão é tentar a porta.','Cristais suficientes');
   else{gems++;update(gems===3?'O terceiro cristal foi coletado. A porta está LIBERADA — mas ainda falta interagir com ela.':'Cristal coletado. O contador mudou para '+gems+'/3. A exploração pode continuar.','Coletar → receber feedback');}
  }
  if(action==='door'){
   if(gems>=3){won=true;update('PORTA ABERTA! A regra verificou o contador e o jogador recebeu um sinal de vitória.','Condição cumprida');}
   else update('A porta permanece trancada: faltam '+(3-gems)+' cristais. A regra impede a ação.', 'Teste da condição');
  }
 }));
}
window.PIT_TEACHER_MISSION_ONE={render,mount,minutes,badge,PLAN};
})();

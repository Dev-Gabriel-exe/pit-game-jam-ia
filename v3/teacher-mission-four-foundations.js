/* M04-01 — Fundamentos da Missão 04 (professor).
   Ensino superior, professor iniciante; sem notas de fala. As fases práticas
   continuam no conteúdo existente até as próximas metas do agente. */
(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phaseMinutes=[6,5,36,3];
const pathways=[
 {key:'topdown',label:'RPG / EXPLORAÇÃO',kind:'2D · visão de cima',
  behavior:'Top-down movement',
  response:'Setas do teclado movimentam o Sprite em 4 ou 8 direções, com velocidade e aceleração configuráveis.',
  wall:'Parede: verifique colisão e use Separate objects (Separar objetos); Top-down movement sozinho não cria paredes sólidas.',
  test:'Pressione quatro setas; tente atravessar a parede; observe se o jogador fica do lado correto.',
  distinction:'Entrada → movimento (behavior) → separação após colisão'},
 {key:'platform',label:'PLATAFORMA',kind:'2D · gravidade e salto',
  behavior:'Platformer character + Platform',
  response:'O personagem se move pelas setas e salta com Espaço ou Shift nos controles padrão, desde que o objeto receba o comportamento.',
  wall:'Chão/plataforma: o objeto do chão recebe Platform. O comportamento do personagem trata gravidade e contato com a plataforma.',
  test:'Verifique deslocamento, salto, pouso e impedimento de atravessar o chão.',
  distinction:'Entrada → gravidade → plataforma → pouso'},
 {key:'pointclick',label:'PUZZLE / NARRATIVA',kind:'2D · clique ou toque',
  behavior:'Condição de clique/toque + ação no objeto',
  response:'Para um jogo de escolhas, a entrada principal pode ser um clique numa opção ou símbolo; não é obrigatório mover um personagem.',
  wall:'Limite pode ser uma área de interação, opção desabilitada ou um botão que só responde quando o requisito está presente.',
  test:'Clique dentro e fora da área; confirme que apenas a opção pretendida reage no Preview.',
  distinction:'Ponteiro → alvo válido → resposta visível'},
 {key:'3d',label:'PRIMEIRA PESSOA / 3D',kind:'3D · volume e câmera',
  behavior:'3D Physics Character + mapper de teclado (quando usar física)',
  response:'Um Box/Model 3D estático não se move sozinho. Controle requer comportamento ou eventos; a câmera precisa ser posicionada ou vinculada ao personagem.',
  wall:'Para física 3D, objetos relevantes recebem Physics 3D e suas formas de colisão; a condição 2D Collision não substitui a detecção 3D.',
  test:'Verifique entrada, deslocamento em três dimensões, câmera apontando para a cena e parede sólida.',
  distinction:'Entrada → personagem 3D → física 3D → câmera'}
];
function block(n,tag,title,definition,example,warning){
 return '<article class="tm4f-card" data-tm4f-reveal style="--tm4f-order:'+n+'"><div class="tm4f-card-header">'+
 '<span class="tm4f-card-n">'+String(n).padStart(2,'0')+'</span><small>'+tag+'</small></div>'+
 '<h4>'+title+'</h4><p>'+definition+'</p><div class="tm4f-card-example"><span>NO JOGO</span><p>'+example+'</p></div>'+
 (warning?'<p class="tm4f-card-detail">'+warning+'</p>':'')+'</article>';
}
function pathway(i){
 const p=pathways[i];
 return '<div class="tm4f-route-content"><div class="tm4f-route-head"><span>'+esc(p.kind)+'</span><strong>'+esc(p.behavior)+'</strong></div>'+
 '<div class="tm4f-route-steps">'+[
 ['ENTRADA / COMPORTAMENTO',p.response],
 ['LIMITES E COLISÃO',p.wall],
 ['TESTE NO PREVIEW',p.test]
 ].map((x,j)=>'<div class="tm4f-route-step"><span>'+String(j+1).padStart(2,'0')+'</span>'+
 '<div><strong>'+esc(x[0])+'</strong><p>'+esc(x[1])+'</p></div></div>').join('')+'</div>'+
 '<div class="tm4f-route-conclusion"><span>FLUXO OBSERVÁVEL</span><p>'+esc(p.distinction)+'</p></div></div>';
}
function render(){
 return '<section class="tm4f-root" aria-label="Missão 04: fundamentos do primeiro jogável">'+
 '<header class="tm4f-hero"><span class="tm4f-eyebrow">PIT GAME JAM IA · PROFESSOR · CAPÍTULO IV</span>'+
 '<div class="tm4f-hero-title"><div class="tm4f-emblem">IV</div><div><span>MISSÃO 04 / 10 · PRIMEIRO JOGÁVEL</span>'+
 '<h2>Uma ação. Uma resposta. Um mundo com limites.</h2>'+
 '<p>Entrada do jogador, comportamentos, movimento, colisões e câmera.</p></div></div>'+
 '<div class="tm4f-time">'+['CONCEITOS','EXEMPLO','LABORATÓRIO','RESULTADOS'].map((name,i)=>
 '<div class="'+(i===0?'current':'')+'"><b>'+phaseMinutes[i]+' min</b><small>'+name+'</small></div>').join('')+'</div></header>'+
 '<div class="tm4f-body">'+
 '<div class="tm4f-intro" data-tm4f-reveal><small>FUNDAMENTOS DE ENGENHARIA DE JOGOS · 6 MIN</small>'+
 '<h3>Por que uma imagem na tela ainda não é jogabilidade?</h3>'+
 '<p>Na Missão 03, um objeto aparecia no Preview. Um jogo começa a responder quando um <strong>dispositivo fornece uma entrada</strong> e o sistema produz uma mudança observável. Isso envolve código/eventos, comportamentos prontos, posição, regras de contato e representação visual. <strong>O jogador deve conseguir prever o resultado de sua ação.</strong></p></div>'+
 '<div class="tm4f-architecture" data-tm4f-reveal><span>FLUXO DO MOTOR · DO INPUT À TELA</span>'+
 '<div class="tm4f-flow">'+[
 ['01','INPUT','Seta · clique · toque'],
 ['02','REGRA','Behavior ou evento'],
 ['03','ESTADO','Posição / velocidade'],
 ['04','LIMITE','Colisão / restrição'],
 ['05','SAÍDA','Câmera + Preview']
 ].map((x,j)=>'<div class="tm4f-flow-item"><span>'+x[0]+'</span><strong>'+x[1]+'</strong><small>'+x[2]+'</small></div>'+
 (j<4?'<span class="tm4f-arrow" aria-hidden="true">→</span>':'')).join('')+'</div>'+
 '<p>O editor descreve componentes e regras; o motor os atualiza durante a execução. Uma imagem parada é conteúdo; uma interação testável é comportamento.</p></div>'+
 '<div class="tm4f-grid">'+
 block(1,'ENTRADA + INTENÇÃO','Controle não significa necessariamente andar.',
 '<strong>Input</strong> é o evento de entrada (teclado, toque, mouse, gamepad). <strong>Ação do jogador</strong> é o efeito pretendido: caminhar, selecionar, arrastar, acelerar ou escolher uma fala. A interface deve confirmar a ação.',
 'RPG: setas deslocam a personagem. Puzzle: clique ativa um símbolo. Narrativa: toque seleciona uma resposta.',
 'O dispositivo e o gênero mudam; a relação entrada → resposta continua sendo o núcleo da interação.')+
 block(2,'COMPONENTES','Behavior não é o objeto: é capacidade adicionada.',
 'Um <strong>objeto</strong> representa o personagem; um <strong>behavior</strong> implementa capacidade reutilizável. Top-down movement oferece deslocamento 2D em 4/8 direções; Platformer character fornece movimentação e gravidade, mas precisa de objetos com behavior Platform para formar o chão.',
 'Um único Sprite no editor pode ser personagem imóvel. Ao adicionar o comportamento correto, passa a reagir no Preview.',
 'Para top-down, colisão com paredes geralmente exige evento de separação ou outro mecanismo adequado.')+
 block(3,'MATEMÁTICA DISCRETA','A engine atualiza o mundo a cada quadro.',
 'O <strong>loop técnico</strong> consulta entradas, processa comportamentos/regras e desenha a cena repetidamente. <strong>Delta time</strong> (Δt) é o tempo decorrido entre atualizações; em movimento manual ele evita que o jogo fique mais rápido em computadores com mais FPS.',
 'Em movimento linear simplificado: <code>xₙ₊₁ = xₙ + v · Δt</code>. Com v=180 px/s e Δt≈1/60 s, o deslocamento é ~3 px por quadro.',
 'Comportamentos de movimento do GDevelop já gerenciam sua atualização; não multiplique por Δt uma segunda vez sem necessidade.')+
 block(4,'GEOMETRIA + FÍSICA','Detectar colisão não é bloquear passagem.',
 '<strong>Detecção</strong> identifica contato/sobreposição entre áreas. <strong>Resposta</strong> resolve a interação: separar, parar, deslizar, sofrer dano. A forma de colisão (máscara/hitbox) pode ser diferente da arte. Plataforma, top-down e física 3D têm soluções próprias.',
 'RPG top-down: Collision + Separate objects. Plataforma: Platformer character + Platform. 3D físico: Physics 3D e formas volumétricas.',
 'Somente uma condição Collision pode informar que houve toque, mas não necessariamente impedir atravessar a parede.')+
 block(5,'ESPAÇO / CÂMERA','Coordenadas do mundo não são o enquadramento.',
 'Em uma cena 2D, X e Y posicionam instâncias. Em uma cena 3D, também existe profundidade Z. A <strong>câmera</strong> define o recorte ou ponto de vista da cena, mas não é uma barreira física. Um objeto pode existir e ficar fora da área visível.',
 'Câmera seguindo personagem: a visualização acompanha o movimento. Câmera mal orientada em 3D: a cena pode parecer vazia mesmo com objetos presentes.',
 'Uma câmera fixa é suficiente para um primeiro protótipo curto; seguir personagem e efeitos de câmera podem vir depois.')+
 '</div>'+
 '<div class="tm4f-pathways" data-tm4f-reveal><div class="tm4f-pathways-title"><span>COMPARAÇÃO EM AÇÃO · COMO O GÊNERO MUDA A IMPLEMENTAÇÃO</span>'+
 '<h3>Escolha uma rota de interação.</h3><p>Os quatro caminhos resolvem o mesmo problema — transformar um comando em resposta testável — com componentes diferentes.</p></div>'+
 '<div class="tm4f-route-tabs" role="tablist" aria-label="Rotas de implementação do primeiro jogável">'+
 pathways.map((x,i)=>'<button type="button" id="tm4fTab'+i+'" role="tab" aria-controls="tm4fRoutePanel" aria-selected="'+(i===0?'true':'false')+'" tabindex="'+(i===0?'0':'-1')+'" data-tm4f-route="'+i+'">'+esc(x.label)+'</button>').join('')+'</div>'+
 '<div class="tm4f-route-panel" role="tabpanel" id="tm4fRoutePanel" aria-labelledby="tm4fTab0">'+pathway(0)+'</div></div>'+
 '<div class="tm4f-exit" data-tm4f-reveal><span>CRITÉRIO DA MISSÃO 04 · NÃO É UMA AULA DE ANIMAÇÃO OU COMBATE</span>'+
 '<h3>O protótipo deve reagir ao controle e respeitar pelo menos um limite.</h3>'+
 '<p>O aluno continua o <strong>mesmo projeto salvo na Missão 03</strong>. O teste demonstrará uma entrada, uma mudança visível e um obstáculo ou restrição observável. Não precisa criar uma fase inteira, inimigos ou efeitos de cinema.</p></div>'+
 '<footer class="tm4f-references"><span>REFERÊNCIAS TÉCNICAS · DOCUMENTAÇÃO GDEVELOP</span>'+
 '<p><a href="https://wiki.gdevelop.io/gdevelop5/behaviors/" target="_blank" rel="noopener noreferrer">Behaviors</a> · '+
 '<a href="https://wiki.gdevelop.io/gdevelop5/all-features/collisions/" target="_blank" rel="noopener noreferrer">Colisões 2D/3D</a> · '+
 '<a href="https://wiki.gdevelop.io/gdevelop5/behaviors/platformer/" target="_blank" rel="noopener noreferrer">Plataformas</a></p>'+
 '<small>Conceitos e exemplos estão explicados nesta página; links são fontes opcionais, não etapas necessárias para ministrar a aula.</small></footer>'+
 '</div></section>';
}
function mount(){
 const root=document.querySelector('.tm4f-root');if(!root)return;
 const routes=[...root.querySelectorAll('[data-tm4f-route]')],panel=root.querySelector('#tm4fRoutePanel');
 function select(index,focus){
  if(index<0||index>=pathways.length||!panel)return;
  routes.forEach((el,i)=>{el.setAttribute('aria-selected',String(i===index));el.tabIndex=i===index?0:-1});
  panel.setAttribute('aria-labelledby','tm4fTab'+index);panel.innerHTML=pathway(index);
  if(focus)routes[index].focus();
 }
 routes.forEach((button,i)=>{
  button.addEventListener('click',()=>select(i,false));
  button.addEventListener('keydown',event=>{
   const next=event.key==='ArrowRight'?(i+1)%routes.length:
    event.key==='ArrowLeft'?(i-1+routes.length)%routes.length:
    event.key==='Home'?0:event.key==='End'?routes.length-1:null;
   if(next===null)return;event.preventDefault();select(next,true);
  });
 });
 const revealed=[...root.querySelectorAll('[data-tm4f-reveal]')];
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(reduced||typeof IntersectionObserver==='undefined'){revealed.forEach(el=>el.classList.add('tm4f-visible'));return}
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('tm4f-visible');observer.unobserve(e.target)}
 }),{threshold:0.05,rootMargin:'0px 0px 55px 0px'});
 root.classList.add('tm4f-animate');revealed.forEach(e=>observer.observe(e));
}
window.PIT_TEACHER_MISSION_FOUR_FOUNDATIONS={render,mount,minutes:()=>phaseMinutes,pathways};
})();
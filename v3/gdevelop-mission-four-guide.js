/* PIT Game Jam IA V3 — M04-02
 * Tutorial real da interface do GDevelop, em português e com 4 rotas.
 * Fontes: wiki.gdevelop.io/gdevelop5/behaviors/, /behaviors/topdown/,
 * /behaviors/platformer/, /all-features/collisions/,
 * /behaviors/physics3d/, /interface/events-editor/ (revisadas em 2026-10-27).
 * O fallback é diagrama autoral, e nunca é apresentado como captura literal.
 */
(function(){
 'use strict';
 const fallback='./v3/assets/guide/gdevelop-m04-movimento-limites-pt.svg';
 const docs={
  behaviors:'https://wiki.gdevelop.io/gdevelop5/behaviors/',
  topdown:'https://wiki.gdevelop.io/gdevelop5/behaviors/topdown/',
  collisions:'https://wiki.gdevelop.io/gdevelop5/all-features/collisions/',
  platformer:'https://wiki.gdevelop.io/gdevelop5/behaviors/platformer/',
  physics3d:'https://wiki.gdevelop.io/gdevelop5/behaviors/physics3d/',
  events:'https://wiki.gdevelop.io/gdevelop5/interface/events-editor/'
 };
 const img={
  add:'https://wiki.gdevelop.io/gdevelop5/behaviors/add-behavior-properties-panel.png',
  list:'https://wiki.gdevelop.io/gdevelop5/behaviors/add-behavior-list.png',
  topdown:'https://wiki.gdevelop.io/gdevelop5/behaviors/topdown/top-down-movement-behav-inlist.png',
  topOptions:'https://wiki.gdevelop.io/gdevelop5/behaviors/topdown/topdown-movement-options.png',
  defaultTop:'https://wiki.gdevelop.io/gdevelop5/behaviors/topdown/top-down-movement-default-controls-box.png',
  separate:'https://wiki.gdevelop.io/gdevelop5/all-features/separate-objects-action.png',
  platformer:'https://wiki.gdevelop.io/gdevelop5/behaviors/platformer/pasted/20230304-153154.png',
  platformControls:'https://wiki.gdevelop.io/gdevelop5/behaviors/platformer/platformer-defaultcontrols-box.png',
  platformGround:'https://wiki.gdevelop.io/gdevelop5/tutorials/platformer/grass-platform-add-behavior.jpg',
  physics3d:'https://wiki.gdevelop.io/gdevelop5/behaviors/physics3d/first-person.png',
  eventSheet:'https://wiki.gdevelop.io/gdevelop5/interface/events-editor/pasted/20230313-175502.png'
 };
 const common={
  screenshot:'Captura publicada na documentação oficial do GDevelop; a posição dos controles pode mudar entre versões.',
  diagram:'Diagrama autoral de apoio em português, não é uma captura do editor.'
 };
 const routes=[
 {id:'topdown',label:'RPG / EXPLORAÇÃO',type:'2D superior',minutes:'Passos 01–04',intro:'No jogo que começou na Missão 03, uma personagem passa a andar com as setas e deixa de atravessar um obstáculo.',
  steps:[
   {title:'Adicionar movimento ao personagem',shot:img.add,what:'Painel Behaviors (Comportamentos) no editor de objetos',caption:'Captura oficial · local do botão + Behaviors',where:'Abra o projeto salvo. Na cena, selecione ou dê dois cliques no seu Sprite de personagem. Entre na aba Behaviors (Comportamentos) e pressione Add a behavior / + (Adicionar comportamento).',action:'O Sprite já tem sua instância na cena desde a Missão 03. Não crie outro projeto.',result:'A janela oferece a lista de comportamentos para o objeto.',fix:'Se não enxergar a aba Behaviors, abra as propriedades do objeto na lista Objects. Não é a aba Events.',source:docs.behaviors},
   {title:'Selecionar Top-down movement',shot:img.topdown,what:'Opção Top-down movement na lista de behaviors',caption:'Captura oficial · Top-down movement',where:'Na busca da lista, digite Top-down movement (Movimento em visão superior). Adicione esse behavior ao personagem e mantenha Default controls (Controles padrão) ativado.',action:'Deixe os valores iniciais de velocidade e aceleração. Clique Apply (Aplicar) para fechar as propriedades.',result:'No Preview, as setas movimentam a instância do personagem em 2D.',fix:'Se as teclas não funcionarem, confira se o comportamento foi aplicado ao mesmo objeto da instância e clique dentro da janela de Preview.',source:docs.topdown},
   {title:'Criar obstáculo e impedir atravessar',shot:img.separate,what:'Ação Separate objects usada para evitar sobreposição entre parede e jogador',caption:'Captura oficial · ação Separate objects',where:'Na cena, acrescente um Sprite visível chamado Parede e coloque uma instância à frente da personagem. Abra Events (Eventos) → Add event (Adicionar evento).',action:'Adicione a condição Collision: Personagem com Parede. Nas ações, selecione Personagem → Separate objects (Separar objetos) de Parede. A ação deve atuar sobre o personagem, não empurrar a parede.',result:'Personagem e parede deixam de se sobrepor quando se encontram.',fix:'Só ter a condição Collision não impede atravessar. É preciso a ação Separate objects; se houver muitos obstáculos, use um grupo de objetos.',source:docs.collisions},
   {title:'Executar os testes de aceitação',shot:img.topOptions,what:'Parâmetros reais do comportamento Top-down movement',caption:'Captura oficial · parâmetros de movimento',where:'Clique Preview; pressione ← → ↑ ↓. Em seguida, mantenha a seta pressionada contra a parede. Altere a velocidade máxima apenas se necessário.',action:'Verifique: (A) há movimento; (B) parar a tecla encerra o deslocamento; (C) a personagem não atravessa a parede. Salve o projeto.',result:'Preview controlável com uma barreira comprovada; jogo salvo.',fix:'Se o movimento parecer rápido demais, reduza Maximum speed. Se o objeto não parar, confira fricção e propriedades do comportamento.',source:docs.topdown}
  ]},
 {id:'platform',label:'PLATAFORMA',type:'2D lateral',minutes:'Passos 01–04',intro:'O Sprite corre e salta sobre um chão definido como plataforma. Colisão com o chão é resolvida pelo comportamento próprio da engine.',
  steps:[
   {title:'Transformar Sprite em personagem de plataforma',shot:img.add,what:'Área de edição dos comportamentos de um objeto',caption:'Captura oficial · Behaviors',where:'Abra o Sprite de jogador criado na Missão 03. Em Behaviors, clique Add a behavior / + e procure Platformer character (Personagem de plataforma).',action:'Adicione o comportamento e confirme Apply. Deixe Default controls ativado, sem construir eventos de movimento agora.',result:'O objeto tem gravidade e controles padrões de plataforma.',fix:'Se o personagem cair e desaparecer, isso é esperado antes de haver chão com behavior Platform.',source:docs.platformer},
   {title:'Conferir os controles de movimento',shot:img.platformControls,what:'Opção de controles padrão no comportamento Platformer character',caption:'Captura oficial · controles padrão do Platformer character',where:'Nas propriedades do Platformer character, localize Default controls. O controle padrão usa as setas para mover e Space/Shift para saltar.',action:'Execute um Preview breve. O personagem pode cair: ainda falta a plataforma para pousar.',result:'As teclas provocam deslocamento e tentativa de salto.',fix:'Se não houver resposta, confira o behavior do jogador. Não desative Default controls nesta primeira versão.',source:docs.platformer},
   {title:'Criar chão que realmente sustenta o jogador',shot:img.platformGround,what:'Adição do comportamento Platform a um objeto de chão',caption:'Captura oficial · comportamento Platform no chão',where:'Crie um Sprite ou Tiled Sprite chamado Chao e coloque a instância sob o personagem. Abra as propriedades de Chao → Behaviors → Add a behavior → Platform (Plataforma).',action:'Mantenha o tipo Platform padrão. Não aplique Platformer character ao chão: ele deve ser adicionado apenas ao personagem controlável.',result:'No Preview, o personagem para de cair ao encontrar o chão e pode caminhar sobre ele.',fix:'Se cair através do chão, confirme que a instância de Chao existe na cena e que o behavior Platform foi aplicado ao objeto correto.',source:docs.platformer},
   {title:'Testar salto, queda e colisão',shot:img.platformer,what:'Exemplo de configuração do comportamento Platformer character',caption:'Captura oficial · opções de Platformer character',where:'Abra Preview. Caminhe sobre a plataforma; pressione Space para saltar; solte e observe o pouso. Experimente aproximar-se das bordas.',action:'Comprove três comportamentos: (A) movimento lateral; (B) salto e queda; (C) o personagem pousa sem atravessar o chão. Salve o projeto.',result:'Protótipo 2D lateral com entrada e obstáculo/floor funcionando.',fix:'O comportamento Platform trata a colisão com o chão. Não substitua por evento Separate objects desnecessário.',source:docs.platformer}
  ]},
 {id:'point',label:'PUZZLE / NARRATIVA',type:'2D clique ou toque',minutes:'Passos 01–04',intro:'Aqui a interação pode ser um clique válido, e o limite é o objeto interativo ou uma opção indisponível. Não obrigue personagens de puzzle a andar.',
  steps:[
   {title:'Definir o alvo de interação',shot:img.add,what:'Objetos e comportamentos na interface do GDevelop',caption:'Captura oficial · editor e propriedades de objetos',where:'No projeto da Missão 03, use um Sprite de botão, símbolo, porta ou opção de diálogo. Coloque sua instância em uma área visível da cena.',action:'Adicione um segundo objeto visual chamado Indicador, que representará o resultado do clique (pode usar um ícone ou Sprite simples).',result:'Alvo e resultado estão na mesma cena, com posições visíveis.',fix:'Dê nomes simples como Botao e Indicador, pois a lista de eventos usa esses identificadores.',source:docs.behaviors},
   {title:'Criar um evento na aba Events',shot:img.eventSheet,what:'Editor de eventos oficial do GDevelop',caption:'Captura oficial · estrutura dos eventos',where:'Abra a aba Events (Eventos) da cena → Add event (Adicionar evento). Na primeira condição, selecione Cursor/Touch is on object (Cursor/toque sobre objeto) e escolha Botao.',action:'Adicione outra condição de input: Mouse button is pressed (Botão do mouse pressionado), clique esquerdo, ou a condição de toque equivalente ao dispositivo.',result:'O evento fica verdadeiro apenas quando a entrada coincide com o alvo, não quando o usuário clica fora dele.',fix:'Se a regra disparar em todo clique, verifique a condição Cursor/Touch is on object. Se repetir sem parar, considere Trigger once para ações instantâneas.',source:docs.events},
   {title:'Produzir uma resposta visual simples',shot:img.eventSheet,what:'Condições e ações no editor de eventos',caption:'Captura oficial · condições e ações',where:'No mesmo evento, em Actions (Ações), selecione Indicador → Show (Mostrar objeto) ou Change the color (Alterar cor) do alvo.',action:'Se usar Show, coloque Indicador invisível no início da cena por uma propriedade inicial ou evento no início. Outra opção é alterar a cor/opacidade do próprio Botao.',result:'O clique correto causa uma mudança visual inequívoca, sem exigir nova cena.',fix:'Se o feedback surgir antes do clique, revise a visibilidade inicial. Se a ação não aparecer, confirme os nomes e a existência de instâncias.',source:docs.events},
   {title:'Comprovar o limite e salvar',shot:img.eventSheet,what:'Fluxo lógico do editor Event: condição e ação',caption:'Captura oficial · evento de interação',where:'No Preview, clique fora do objeto; depois clique dentro de Botao. Teste com mouse ou touch disponível no equipamento.',action:'A mudança só pode ocorrer no alvo válido. Registre o resultado real; o jogo pode continuar sem movimento físico nesta missão. Salve.',result:'Interação funcional com área limitada, sem clique fora do alvo.',fix:'Se a interação não for detectada no celular, use condição de toque; não dependa exclusivamente de Mouse button pressed para todos os dispositivos.',source:docs.events}
  ]},
 {id:'3d',label:'3D / PRIMEIRA PESSOA',type:'3D com física',minutes:'Exemplo + adaptação',intro:'Rota avançada: prefira um exemplo 3D oficial funcional e substitua a aparência/ambiente. Criar do zero personagem, câmera, movimento e física normalmente excede o tempo de um iniciante.',
  steps:[
   {title:'Partir de um exemplo oficial 3D funcional',shot:img.physics3d,what:'Imagem oficial de exemplo 3D em primeira pessoa',caption:'Imagem de jogo de exemplo oficial · NÃO é print da interface do editor',where:'No GDevelop, abra um exemplo de first-person shooter ou 3D platformer pelos exemplos oficiais indicados na documentação de Physics 3D.',action:'Execute Preview ANTES de modificar. Comprove deslocamento e câmera: isso estabelece uma base funcional sem configurar controles e física do zero.',result:'Existe um projeto 3D com movimento e câmera testados, que será adaptado.',fix:'Se não houver tempo ou um exemplo acessível, use o protótipo 2D básico. Um objeto 3D Box estático não atende sozinho à entrega de movimento.',source:docs.physics3d},
   {title:'Identificar os behaviors certos',shot:img.list,what:'Lista oficial para adicionar comportamentos',caption:'Captura oficial · lista de comportamentos',where:'Abra as propriedades do personagem → Behaviors. Verifique 3D Physics Character; para entrada FPS, procure 3D shooter keyboard mapper e First person camera mouse mapper.',action:'Identifique qual objeto é o personagem controlável e onde a câmera está configurada. Preserve o funcionamento do starter, sem substituir todas as regras.',result:'O personagem e a câmera continuam conectados e respondem ao input.',fix:'Somente adicionar Physics 3D a uma caixa não habilita controles de FPS nem vincula a câmera automaticamente.',source:docs.physics3d},
   {title:'Identificar chão/parede e tipo de física',shot:img.physics3d,what:'Imagem de exemplo oficial de personagem 3D e obstáculos',caption:'Imagem de jogo de exemplo oficial · não é captura do painel',where:'Nas propriedades da parede ou chão, confira o behavior 3D Physics com Body Type: Static. No personagem, preserve 3D Physics Character e forma de colisão apropriada, frequentemente Capsule.',action:'Mantenha a parede fixa e posicione o personagem em distância suficiente para caminhar até ela.',result:'Colisão 3D é tratada pelo sistema de física 3D, não por Collision 2D.',fix:'Se atravessar uma parede, confira que as duas entidades participam da física 3D e as camadas/máscaras de colisão permitem contato.',source:docs.physics3d},
   {title:'Executar três testes do protótipo 3D',shot:img.physics3d,what:'Preview demonstrativo do gênero 3D',caption:'Imagem de exemplo oficial · execução de jogo 3D',where:'No Preview do starter/adaptação, teste deslocamento com teclado, orientação da câmera e aproximação de uma parede.',action:'Comprove (A) resposta ao input; (B) câmera visualiza o ambiente; (C) parede impede passagem física. Salve o projeto editável.',result:'Interação e restrição 3D observadas sem prometer criação integral de um FPS em poucos minutos.',fix:'Se a câmera girar mas o personagem não andar, verifique os mappers. Se andar mas atravessar, revise Physics 3D e tipos de corpo.',source:docs.physics3d}
  ]}
 ];
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 function card(step,index,total){
  return '<article class="g4-step"><div class="g4-step-picture">'+
   '<div class="g4-picture-label"><span>'+safe(step.caption)+'</span><b>'+String(index+1).padStart(2,'0')+' / '+String(total).padStart(2,'0')+'</b></div>'+
   '<img src="'+safe(step.shot)+'" alt="'+safe(step.what)+'" loading="lazy" decoding="async" data-g4-image>'+
   '<div class="g4-picture-source">Fonte: documentação oficial do GDevelop. Se o arquivo não carregar, aparece um diagrama autoral rotulado.</div></div>'+
   '<div class="g4-step-guide"><span class="g4-mini-tag">PASSO '+String(index+1).padStart(2,'0')+'</span><h4>'+safe(step.title)+'</h4>'+
   '<div class="g4-instruction"><strong><span>1</span> ONDE CLICAR</strong><p>'+safe(step.where)+'</p></div>'+
   '<div class="g4-instruction"><strong><span>2</span> O QUE FAZER</strong><p>'+safe(step.action)+'</p></div>'+
   '<div class="g4-result"><strong>✓ RESULTADO ESPERADO</strong><p>'+safe(step.result)+'</p></div>'+
   '<details class="g4-diagnostic"><summary>Algo não funcionou?</summary><p>'+safe(step.fix)+'</p></details>'+
   '<a class="g4-source-link" href="'+safe(step.source)+'" target="_blank" rel="noopener noreferrer">Fonte técnica (consulta opcional) ↗</a></div></article>';
 }
 function body(routeIndex,stepIndex){
  const r=routes[routeIndex],x=r.steps[stepIndex];
  return '<div class="g4-exposition">'+card(x,stepIndex,r.steps.length)+'</div>'+
   '<nav class="g4-pager" aria-label="Navegação no tutorial">'+
   '<button type="button" data-g4-prev '+(stepIndex===0?'disabled':'')+'>‹ ANTERIOR</button>'+
   '<span><b>'+String(stepIndex+1).padStart(2,'0')+'</b> / '+r.steps.length+' · '+safe(r.label)+'</span>'+
   '<button type="button" data-g4-next '+(stepIndex===r.steps.length-1?'disabled':'')+'>PRÓXIMO ›</button></nav>';
 }
 function render(){
  return '<section class="g4-tutorial" id="g4Tutorial" aria-label="Tutorial ilustrado de controles e limites no GDevelop">'+
   '<header class="g4-heading"><div><span>◈ LABORATÓRIO DE INTERAÇÃO · 5 MIN DE DEMONSTRAÇÃO</span>'+
   '<h3>Da tecla ao limite — no editor real.</h3>'+
   '<p>Quatro caminhos possíveis. Escolha <b>somente a rota adequada ao jogo</b>. Cada tela mostra onde clicar, o resultado esperado e o que verificar se falhar. A prática completa acontece na oficina de 36 minutos.</p></div></header>'+
   '<div class="g4-branches" role="tablist" aria-label="Tipos de projeto">'+routes.map((r,i)=>
   '<button type="button" role="tab" id="g4Tab'+i+'" data-g4-route="'+i+'" aria-controls="g4Panel" aria-selected="'+(i===0?'true':'false')+'" tabindex="'+(i===0?'0':'-1')+'"><strong>'+safe(r.label)+'</strong><small>'+safe(r.type)+'</small></button>').join('')+'</div>'+
   '<div class="g4-context"><strong id="g4Context">RPG / EXPLORAÇÃO</strong><p id="g4Intro">'+safe(routes[0].intro)+'</p></div>'+
   '<div class="g4-frame" id="g4Panel" role="tabpanel" aria-labelledby="g4Tab0">'+body(0,0)+'</div>'+
   '<footer class="g4-footer"><strong>REGRA DE PRODUÇÃO</strong><p>O objetivo não é dominar quatro estilos. Um único tipo de controle, um obstáculo/restrição e três testes no Preview bastam. Imagens oficiais podem representar versões diferentes; o fallback é deliberadamente identificado como diagrama.</p></footer></section>';
 }
 function mount(scope){
  const root=scope||document.querySelector('#g4Tutorial');if(!root)return;
  const buttons=[...root.querySelectorAll('[data-g4-route]')],frame=root.querySelector('#g4Panel');
  if(!frame)return;
  let r=0,step=0;
  function draw(focus,scroll){
   if(r<0||r>=routes.length)return;
   const current=routes[r];
   buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===r));b.tabIndex=i===r?0:-1});
   frame.setAttribute('aria-labelledby','g4Tab'+r);
   const heading=root.querySelector('#g4Context'),desc=root.querySelector('#g4Intro');
   if(heading)heading.textContent=current.label;
   if(desc)desc.textContent=current.intro;
   frame.innerHTML=body(r,step);
   const shot=frame.querySelector('[data-g4-image]');
   if(shot)shot.addEventListener('error',()=>{
    if(shot.dataset.g4Fallback)return;
    shot.dataset.g4Fallback='true';shot.src=fallback;
    shot.alt='Diagrama didático em português de movimento e colisões (não é captura literal do editor)';
    const label=frame.querySelector('.g4-picture-label span');
    if(label)label.textContent='DIAGRAMA AUTORAL · CAPTURA EXTERNA INDISPONÍVEL';
   });
   frame.querySelector('[data-g4-prev]')?.addEventListener('click',()=>changeStep(step-1));
   frame.querySelector('[data-g4-next]')?.addEventListener('click',()=>changeStep(step+1));
   if(focus)buttons[r]?.focus();
   if(scroll&&frame.scrollIntoView){
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    frame.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
   }
  }
  function changeStep(index){
   if(index<0||index>=routes[r].steps.length)return;
   step=index;draw(false,true);
  }
  function changeRoute(index,focus){
   if(index<0||index>=routes.length)return;
   r=index;step=0;draw(focus,false);
  }
  buttons.forEach((b,i)=>{
   b.addEventListener('click',()=>changeRoute(i,false));
   b.addEventListener('keydown',e=>{
    const next=e.key==='ArrowRight'?(i+1)%routes.length:
     e.key==='ArrowLeft'?(i+routes.length-1)%routes.length:
     e.key==='Home'?0:e.key==='End'?routes.length-1:null;
    if(next===null)return;e.preventDefault();changeRoute(next,true);
   });
  });
  draw(false,false);
 }
 window.PIT_GDEVELOP_M04_GUIDE={render,mount,routes,images:img,fallback};
})();
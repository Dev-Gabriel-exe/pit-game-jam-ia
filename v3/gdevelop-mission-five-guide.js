/* PIT GAME JAM IA · M05-02 · tutorial ilustrado de regras GDevelop
   Capturas oficiais com créditos e fallback local autoral.
   Documentação: https://wiki.gdevelop.io/gdevelop5/interface/events-editor/
   https://wiki.gdevelop.io/gdevelop5/tutorials/platformer/part-5/
   https://wiki.gdevelop.io/gdevelop5/all-features/advanced-conditions/trigger-once/
   https://wiki.gdevelop.io/gdevelop5/all-features/collisions/
   NÃO se apresenta simulação como captura ou teste executado da engine.
*/
(function(){
'use strict';
const docs={
 events:'https://wiki.gdevelop.io/gdevelop5/interface/events-editor/',
 variables:'https://wiki.gdevelop.io/gdevelop5/tutorials/platformer/part-5/',
 trigger:'https://wiki.gdevelop.io/gdevelop5/all-features/advanced-conditions/trigger-once/',
 collision:'https://wiki.gdevelop.io/gdevelop5/all-features/collisions/'
};
const screenshots=[
 {src:'https://wiki.gdevelop.io/gdevelop5/interface/events-editor/pasted/20230313-180413.png',caption:'Captura da documentação oficial · Editor de eventos',source:docs.events},
 {src:'https://wiki.gdevelop.io/gdevelop5/interface/events-editor/pasted/20230313-175502.png',caption:'Captura da documentação oficial · Estrutura de eventos',source:docs.events},
 {src:'https://wiki.gdevelop.io/gdevelop5/tutorials/platformer/05-02-coin-collectible.jpg',caption:'Captura de projeto-exemplo oficial · Evento de coleta 2D',source:docs.variables},
 {src:'https://wiki.gdevelop.io/gdevelop5/tutorials/platformer/05-03-scene-variable.jpg',caption:'Captura de projeto-exemplo oficial · Variável de cena',source:docs.variables},
 {src:'https://wiki.gdevelop.io/gdevelop5/tutorials/platformer/05-05-modify-text-object.jpg',caption:'Captura de projeto-exemplo oficial · Feedback por texto',source:docs.variables}
];
const fallback='./v3/assets/guide/gdevelop-eventos-pt.svg';
const routes=[
 {id:'collect',label:'RPG / PLATAFORMA',type:'2D · coletar item',title:'Coleta única com Score',
  object:'Jogador e Cristal (ou Moeda)',variable:'Score',start:'0',
  condition:'Jogador em Collision com Cristal',
  actions:'Value of a scene variable → Score → + → 1; depois Delete an object → Cristal',
  feedback:'Cristal desaparece e marcador TextoScore exibe o valor atualizado de Score.',
  negative:'Sem tocar no cristal, Score continua 0; depois da coleta, segurar direção não soma pontos adicionais.',
  fix:'Se Score aumenta muitas vezes, confirme a exclusão da instância de Cristal. Trigger once global não substitui controle por instância quando há muitos itens.',
  step3:'No evento, pressione Add condition. Escolha o objeto Jogador → Collision (Colisão) → Cristal. A condição é 2D e usa máscaras de colisão.',
  step4:'Clique Add action → Variables → Value of a scene variable. Crie/seleciona Score (valor inicial 0), alteração +, valor 1. Adicione outra ação Delete object → Cristal.',
  step5:'Na cena, coloque um Text chamado TextoScore. Adicione evento sem condição para atualizar o texto usando a expressão de Score selecionada pelo editor. Execute Preview com e sem tocar no cristal.',
  note:'A mesma instância coletada deve ser consumida após pontuar; não acumule pontos indefinidamente por quadro.'},
 {id:'puzzle',label:'PUZZLE / NARRATIVA',type:'2D · clicar resposta',title:'Uma escolha e um feedback',
  object:'Resposta e TextoFeedback',variable:'Acertou',start:'0',
  condition:'Cursor/Touch is on Resposta E botão esquerdo pressionado; Trigger once while true',
  actions:'Value of a scene variable → Acertou → = → 1; mudar texto de TextoFeedback para "Você acertou!"',
  feedback:'O texto muda apenas quando a escolha válida é selecionada.',
  negative:'Clique fora da opção não altera Acertou. Segurar o botão não repete a ação; depois de marcado Acertou=1, novos cliques não recontam.',
  fix:'Se o evento repetir, adicione também a condição Acertou = 0 antes da atualização. Trigger once funciona por evento, não separadamente para cada instância.',
  step3:'Pressione Add condition → Cursor/Touch is on object → Resposta. Adicione outra condição de mouse/touch para a ativação e Trigger once while true; para suportar toque, ajuste a condição de entrada ao dispositivo.',
  step4:'No evento, adicione condição Variables → Acertou = 0. Em Add action → Variables → Value of a scene variable, defina Acertou como 1.',
  step5:'Adicione a ação de Text → Modify the text no objeto TextoFeedback e defina o texto "Você acertou!". Abra Preview, clique fora e depois dentro da opção. Teste novamente.',
  note:'O evento só deve ativar com alvo e entrada válidos. Para múltiplas opções, use estado por objeto ou eventos específicos.'},
 {id:'3d',label:'3D / TERROR',type:'3D · interagir com porta',title:'Porta que responde à chave',
  object:'Personagem3D e Porta3D (com Physics 3D)',variable:'TemChave / PortaAberta',start:'0 / 0',
  condition:'Tecla E pressionada E Physics 3D → Collision entre personagem e porta E TemChave = 1 E PortaAberta = 0',
  actions:'Value of a scene variable → PortaAberta → = → 1; ocultar Porta3D ou ativar animação de abertura compatível',
  feedback:'Com a chave, a porta deixa de bloquear ou mostra a abertura; sem a chave, continua fechada.',
  negative:'Com TemChave = 0, pressionar E não abre. Com TemChave = 1 e contato 3D válido, abre apenas uma vez.',
  fix:'A condição padrão "Distance between two objects" mede X/Y, ignorando Z; para colisão 3D use condições do behavior Physics 3D. Ocultar a porta visualmente não garante remover o colisor físico: desative/remova a barreira quando abrir.',
  step3:'Use o projeto 3D com Physics 3D já funcionando. Em Add condition, escolha a condição Collision do comportamento 3D Physics Engine usada pelos dois corpos; adicione a tecla E e a variável TemChave=1.',
  step4:'Adicione a condição PortaAberta=0. Na ação de variável de cena, defina PortaAberta=1. Se a chave ainda não existe, configure TemChave=1 apenas para testar a regra, e depois integre o evento real de coleta.',
  step5:'Na ação, oculte/abra Porta3D e desative a barreira física pelo mecanismo suportado no projeto 3D. Teste Preview com TemChave=0 e 1; salve o projeto editável.',
  note:'Esta rota reaproveita o starter 3D e seus eventos. Não adapte condições de colisão 2D à física 3D; use as condições do behavior e verifique o colisor.'}
];
const guideSteps=[
 {name:'ABRIR EVENTS',title:'Localizar a aba de eventos',common:'Abra o mesmo projeto salvo na Missão 04. Na cena, alterne da guia Scene para Events (Eventos). O editor de cena mostra objetos; a aba Events mostra as regras SE/ENTÃO.',expect:'Uma lista de eventos e a barra de ferramentas aparecem na área de trabalho.',diagnose:'Se estiver vendo apenas os objetos do cenário, você ainda está na guia Scene. A guia Events pertence à cena aberta.'},
 {name:'CRIAR EVENTO',title:'Adicionar um evento vazio',common:'Clique Add a new event / Add event (Adicionar evento), na barra da aba Events. Surge um bloco com as áreas Add condition e Add action.',expect:'Um bloco vazio aparece na lista de eventos da cena.',diagnose:'Um evento sem condição executa as ações em todos os quadros. Não coloque Score +1 num evento sem condição.'},
 {name:'DEFINIR CONDIÇÃO',title:'Qual é o gatilho verdadeiro?',common:'Clique Add condition (Adicionar condição). Use a busca do seletor de condições para encontrar o objeto e o teste adequado.',expect:'No lado das condições, o bloco descreve quando a regra deve ser aplicada.',diagnose:'Se nunca dispara, confira os objetos e suas instâncias na cena. Se dispara sempre, falta uma condição limitadora.'},
 {name:'VARIÁVEL + AÇÃO',title:'Mudar o estado do jogo',common:'Abra Add action (Adicionar ação), procure Variables/Scene variable e escolha a modificação adequada. A mesma variável poderá ser lida em outro evento.',expect:'Uma ação atualiza um valor e a próxima ação produz uma consequência.',diagnose:'Se a mudança de variável não aparece, confirme o escopo (scene/global/object) e o nome exato. A pontuação não surge na tela automaticamente.'},
 {name:'FEEDBACK + PREVIEW',title:'Provar antes e depois',common:'Associe a regra a uma mudança visível (remover item, texto, abrir porta). Abra Preview, execute um caso com condição falsa, outro verdadeiro e repita a ação; salve o projeto.',expect:'O comportamento muda apenas no caso correto e o projeto permanece editável.',diagnose:'Use Debugger para inspecionar variáveis se o resultado não aparecer. A ação pode executar sem que a interface mostre o novo valor.'}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function picture(step,r){
 const pic=screenshots[step];
 return '<div class="m5g-picture"><div class="m5g-picture-top"><strong>'+esc(pic.caption)+'</strong><small>'+(step+1)+' / 5</small></div>'+
 '<img src="'+esc(pic.src)+'" alt="'+esc(pic.caption)+'. Figura ilustrativa da documentação do GDevelop, não substitui a configuração exata do jogo.'+'" data-m5g-image loading="lazy" decoding="async">'+
 '<div class="m5g-photo-foot">Fonte: <a href="'+esc(pic.source)+'" target="_blank" rel="noopener noreferrer">documentação oficial do GDevelop</a> · exemplo ilustrativo. Caso a captura falhe, um diagrama em português será exibido.</div></div>';
}
function extra(step,route){
 const r=routes[route];
 const messages=[
  'Projeto: '+r.object+' · Variável desta trilha: '+r.variable,
  'Uma única regra de jogo é suficiente nesta missão. Não crie outra cena só para o tutorial.',
  r.step3,r.step4,r.step5
 ];
 return messages[step];
}
function panel(route,step){
 const r=routes[route],g=guideSteps[step];
 return '<div class="m5g-frame"><article class="m5g-step">'+picture(step,route)+
 '<div class="m5g-guide"><small>ETAPA '+String(step+1).padStart(2,'0')+' · '+esc(g.name)+'</small>'+
 '<h3>'+esc(g.title)+'</h3><div class="m5g-instruction"><strong>1 · ONDE CLICAR</strong><p>'+esc(g.common)+'</p></div>'+
 '<div class="m5g-instruction emph"><strong>2 · NO SEU JOGO</strong><p>'+esc(extra(step,route))+'</p></div>'+
 '<div class="m5g-expect"><b>✓ RESULTADO ESPERADO</b><p>'+esc(g.expect)+'</p></div>'+
 '<details><summary>Problema comum e correção</summary><p>'+esc(g.diagnose)+' '+esc(r.fix)+'</p></details>'+
 '</div></article></div>'+
 '<nav class="m5g-controls" aria-label="Próxima etapa do tutorial">'+
 '<button type="button" data-m5g-prev '+(step===0?'disabled':'')+'>‹ ANTERIOR</button>'+
 '<span>'+String(step+1).padStart(2,'0')+' / 05 · '+esc(r.label)+'</span>'+
 '<button type="button" data-m5g-next '+(step===4?'disabled':'')+'>PRÓXIMA ›</button></nav>';
}
function render(initialRoute=0){
 const route=Number.isInteger(initialRoute)&&initialRoute>=0&&initialRoute<routes.length?initialRoute:0;
 return '<section class="m5g-root" id="m5Guide" aria-label="Tutorial de eventos do GDevelop — Missão 05">'+
 '<header class="m5g-head"><span>◈ MISSÃO 05 · PROFESSOR · DEMONSTRAÇÃO DE 5 MINUTOS</span>'+
 '<h2>Do SE ao ENTÃO. Na interface real.</h2><p>Escolha apenas uma rota conforme o gênero. As capturas pertencem à documentação oficial do editor; comandos e posições podem variar conforme a versão. O diagrama de apoio é autoral.</p>'+
 '<div class="m5g-clock">1 min · localizar Events <b>→</b> 1 min · criar evento <b>→</b> 1 min · condição <b>→</b> 1 min · variável/ação <b>→</b> 1 min · Preview</div></header>'+
 '<div class="m5g-tabs" role="tablist" aria-label="Rota por gênero">'+routes.map((r,i)=>
 '<button type="button" role="tab" id="m5gTab'+i+'" aria-controls="m5gPanel" aria-selected="'+(i===route?'true':'false')+'" tabindex="'+(i===route?'0':'-1')+'" data-m5g-route="'+i+'"><b>'+esc(r.label)+'</b><small>'+esc(r.type)+'</small></button>').join('')+'</div>'+
 '<div class="m5g-context"><span>REGRA DA ROTA</span><strong id="m5gRule">'+esc(routes[route].title)+'</strong><p id="m5gCondition">'+esc(routes[route].condition)+'</p></div>'+
 '<div id="m5gPanel" role="tabpanel" aria-labelledby="m5gTab'+route+'">'+panel(route,0)+'</div>'+
 '<div class="m5g-check"><b>VERIFICAÇÃO NO PREVIEW</b><p id="m5gCheck">'+esc(routes[route].negative)+'</p>'+
 '<small>Não confunda uma captura do editor com o jogo em execução. A entrega precisa demonstrar a regra no projeto autoral.</small></div>'+
 '<footer class="m5g-footer"><strong>DOCUMENTAÇÃO</strong> · '+
 '<a href="'+docs.events+'" target="_blank" rel="noopener noreferrer">Eventos</a> · '+
 '<a href="'+docs.variables+'" target="_blank" rel="noopener noreferrer">Variáveis</a> · '+
 '<a href="'+docs.trigger+'" target="_blank" rel="noopener noreferrer">Trigger once</a> · '+
 '<a href="'+docs.collision+'" target="_blank" rel="noopener noreferrer">Colisões 2D/3D</a>'+
 '<p>Rota de 3D: colisões físicas são diferentes das condições padrão 2D. A condição de distância comum mede X/Y e ignora Z. Não é necessário desenvolver as três rotas.</p></footer></section>';
}
function mount(scope,opts={}){
 const root=scope||document.querySelector('#m5Guide');if(!root)return;
 const tabs=[...root.querySelectorAll('[data-m5g-route]')],frame=root.querySelector('#m5gPanel');
 if(!frame)return;
 let route=Number.isInteger(opts.initialRoute)&&opts.initialRoute>=0&&opts.initialRoute<routes.length?opts.initialRoute:0,step=0;
 function draw(scroll,focus){
  tabs.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===route));b.tabIndex=i===route?0:-1});
  frame.setAttribute('aria-labelledby','m5gTab'+route);
  frame.innerHTML=panel(route,step);
  const rule=root.querySelector('#m5gRule'),condition=root.querySelector('#m5gCondition'),check=root.querySelector('#m5gCheck');
  if(rule)rule.textContent=routes[route].title;
  if(condition)condition.textContent=routes[route].condition;
  if(check)check.textContent=routes[route].negative;
  const img=frame.querySelector('[data-m5g-image]');
  if(img){
   const fail=()=>{
    if(img.dataset.m5gFallback)return;
    img.dataset.m5gFallback='1';img.src=fallback;
    img.alt='Diagrama didático autoral sobre eventos do GDevelop, não é captura de tela';
    const c=frame.querySelector('.m5g-picture-top strong');
    if(c)c.textContent='DIAGRAMA AUTORAL · CAPTURA OFICIAL INDISPONÍVEL';
   };
   img.addEventListener('error',fail);
   if(img.complete&&img.naturalWidth===0)fail();
  }
  frame.querySelector('[data-m5g-prev]')?.addEventListener('click',()=>go(step-1));
  frame.querySelector('[data-m5g-next]')?.addEventListener('click',()=>go(step+1));
  if(scroll&&frame.scrollIntoView)frame.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  if(focus)tabs[route].focus();
 }
 function go(next){if(next<0||next>=guideSteps.length)return;step=next;draw(true,false)}
 tabs.forEach((t,i)=>{
  t.addEventListener('click',()=>{route=i;step=0;draw(false,false);opts.onRouteChange?.(routes[i].id,i)});
  t.addEventListener('keydown',e=>{
   const next=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;
   if(next===null)return;
   e.preventDefault();route=next;step=0;draw(false,true);opts.onRouteChange?.(routes[next].id,next);
  });
 });
 draw(false,false);
}
window.PIT_GDEVELOP_M05_GUIDE={render,mount,routes,guideSteps,screenshots,fallback};
})();
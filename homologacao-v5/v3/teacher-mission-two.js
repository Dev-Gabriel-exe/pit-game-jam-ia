(function module2(){
'use strict';
const PLAN=window.PIT_TEACHER_MISSION_ONE?.PLAN||{2:[9,5,14,2]};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shell=(phase,content)=>{
 const names={briefing:'FUNDAMENTOS',demo:'LABORATÓRIO DE ESCOPO',practice:'OFICINA DE PROJETO',review:'CRITÉRIOS DE APRENDIZAGEM'};
 const times=[9,5,14,2],labels=['CONCEITOS','SIMULAÇÃO','PLANEJAMENTO','RESULTADO'];
 return '<div class="tm2-root tm-pro-root"><header class="tm2-masthead">'+
 '<small>✦ PIT GAME JAM IA · CADERNO DO PROFESSOR · CAPÍTULO II</small>'+
 '<div class="tm2-masthead-main"><span class="tm2-numeral">II</span><div><span>MISSÃO 02 · MVP EM FOCO</span><h2>Um jogo pequeno que funciona.</h2><p>Escopo, requisitos funcionais, priorização e critérios de aceitação.</p></div></div>'+
 '<div class="tm2-times">'+times.map((v,i)=>'<span class="'+(['briefing','demo','practice','review'][i]===phase?'active':'')+'"><b>'+v+' min</b> · '+labels[i]+'</span>').join('')+'</div></header>'+
 '<div class="tm2-content"><div class="tm2-section-title"><span>◈ '+names[phase]+'</span><span>'+times[Math.max(0,['briefing','demo','practice','review'].indexOf(phase))]+' / 30 MIN</span></div>'+content+'</div>'+
 '<footer class="tm2-footer">PIT GAME JAM IA · MISSÃO 02 / 10 · UM PROTÓTIPO DEMONSTRÁVEL</footer></div>';
};
const intro=(overline,h,para)=>'<div class="tm2-intro" data-reveal><small>'+overline+'</small><h3>'+h+'</h3><p>'+para+'</p></div>';
const card=(idx,label,title,body,example)=>'<article class="tm2-concept" data-reveal style="--tm2-delay:'+idx*90+'ms"><div class="tm2-card-top"><span>'+('0'+idx)+'</span><small>'+label+'</small></div><h4>'+title+'</h4><p>'+body+'</p><div class="tm2-example"><b>APLICAÇÃO EM UM JOGO</b><p>'+example+'</p></div></article>';
function concepts(){
 return shell('briefing',intro('GAME DESIGN + ENGENHARIA DE SOFTWARE','Transforme ambição em um sistema que pode ser testado.','A Missão 01 definiu gênero, ação principal, objetivo e desfecho. Agora vamos decidir o <strong>menor conjunto de funcionalidades</strong> necessário para comprovar essa experiência. Uma boa redução de escopo preserva o núcleo do jogo, não a quantidade de conteúdo.')+
 '<div class="tm2-split-hero" data-reveal><div class="tm2-hero-art"><span>MISSÃO 02 / PLANEJAMENTO</span></div><div class="tm2-hero-copy"><span>DO SONHO AO PROTÓTIPO</span><h4>Uma grande ideia. Uma versão jogável.</h4>'+
 '<div class="tm2-compare"><div><small>VISÃO COMPLETA</small><strong>20 mapas · 8 chefes · inventário · diálogos · multiplayer</strong><p>Muitas dependências; alto risco de não terminar.</p></div><div><small>MVP DE GAME JAM</small><strong>1 cena · 1 personagem · 1 desafio · 1 condição de vitória</strong><p>Um ciclo completo que pode ser implementado e verificado.</p></div></div></div></div>'+
 '<div class="tm2-concepts">'+
 card(1,'PRODUTO','O que é MVP em uma game jam?','<strong>MVP</strong> (Minimum Viable Product) é a menor versão capaz de demonstrar e avaliar a proposta central. Nesta oficina, significa um <strong>protótipo jogável</strong> com objetivo claro, interação e final. Não é um jogo comercial completo.','RPG: em vez de 20 masmorras, uma sala onde a guardiã coleta itens e abre um portal.')+
 card(2,'RECORTE','MVP, protótipo e vertical slice','<strong>Protótipo</strong> valida uma mecânica; pode usar arte provisória. Uma <strong>vertical slice</strong> demonstra pequena parte com qualidade representativa de diversos sistemas do produto. Para seis horas, priorizamos o protótipo funcional/MVP didático, <strong>não</strong> uma vertical slice polida.','Testar um personagem abrindo uma porta com três itens prova a regra; não exige menus, trilha e animações finais.')+
 card(3,'ARQUITETURA','Dependência e escopo técnico','Cada funcionalidade acrescenta objetos, eventos, arte, possíveis erros e testes. <strong>Dependências</strong> são partes que precisam existir antes de outra funcionar. A condição de vitória depende do evento de coleta e de uma variável; multiplayer depende de uma infraestrutura muito maior.','A sequência mínima é cena → objeto controlável → interação → estado → vitória.')+
 card(4,'PRIORIZAÇÃO','Must have, should have, could have','Priorize o <strong>indispensável</strong> (sem ele não existe a mecânica), o <strong>recomendável</strong> (melhora clareza) e o <strong>opcional</strong> (pode ser deixado para depois). Essa adaptação do método MoSCoW evita gastar tempo com detalhes que não comprovam o objetivo.','Indispensável: coletar chave e abrir porta. Recomendável: contador. Opcional: dublagem e cinco personagens.')+
 card(5,'REQUISITOS','Da narrativa ao requisito verificável','Um <strong>requisito funcional</strong> descreve comportamento observável do software. Pode ser expresso como “Dado um estado inicial, quando ocorre uma ação, então o sistema produz um resultado”. Essa estrutura facilita o teste e revela ambiguidades.','Dado 0 cristais, quando tocar a porta, então permanece fechada. Dado 3 cristais, quando tocar a porta, então abre.')+
 card(6,'GDEVELOP','Estruture antes de abrir o editor','No GDevelop, a <strong>Scene</strong> é o ambiente; <strong>Objects</strong> são elementos; <strong>Behaviors</strong> oferecem funções prontas; <strong>Events</strong> definem condições e ações; <strong>variables</strong> armazenam estado. O Preview comprova o que foi realmente implementado.','Plano inicial: Cena Sala, objetos Jogador/Cristal/Porta, variável cristais e condição de finalização.')+
 '</div>'+
 '<div class="tm2-requirement" data-reveal><span>CRITÉRIO DE PROJETO</span><strong>Se retirarmos esse elemento, a experiência principal ainda pode ser jogada e encerrada?</strong>'+
 '<p>Se sim, ele provavelmente pode ficar no backlog. Se não, faz parte do núcleo mínimo. O recorte será documentado e testado nas próximas missões.</p></div>'+
 '<div class="tm2-sources" data-reveal><span>REFERÊNCIA TÉCNICA</span><a href="https://wiki.gdevelop.io/gdevelop5/tutorials/basic-game-making-concepts/" rel="noopener" target="_blank">Conceitos de cena, objetos, eventos e variáveis · GDevelop</a></div>');
}
const features=[
 {id:'scene',name:'Uma cena inicial',cost:1,required:true,why:'Lugar onde o jogo começa'},
 {id:'control',name:'Um objeto controlável',cost:1,required:true,why:'Entrada do jogador'},
 {id:'rule',name:'Uma mecânica central',cost:2,required:true,why:'Ação, condição e consequência'},
 {id:'end',name:'Condição de conclusão',cost:1,required:true,why:'Resultado que pode ser testado'},
 {id:'extra',name:'Cinco cenários adicionais',cost:5,required:false,why:'Amplia o conteúdo, não prova a mecânica'},
 {id:'inventory',name:'Sistema completo de inventário',cost:4,required:false,why:'Novas estruturas e testes'},
 {id:'cinema',name:'Cutscenes e diálogos longos',cost:3,required:false,why:'Aumenta produção audiovisual'},
 {id:'multiplayer',name:'Multiplayer online',cost:7,required:false,why:'Sincronização, rede e infraestrutura'}
];
function simulator(){
 return shell('demo',intro('LABORATÓRIO DE DECISÃO','Reduzir escopo é uma decisão de engenharia.','Este simulador compara um MVP viável com uma versão excessivamente complexa. Ative funcionalidades opcionais e observe o aumento das dependências. <strong>Os pontos representam complexidade relativa para comparação, não horas de desenvolvimento.</strong>')+
 '<div class="tm2-lab" data-reveal><div class="tm2-feature-list"><div class="tm2-lab-title"><span>ESCOPO DO PROJETO</span><small>As quatro primeiras funções são essenciais</small></div>'+
 features.map(x=>'<label class="tm2-feature '+(x.required?'required':'')+'"><input type="checkbox" data-tm2-feature="'+x.id+'" '+(x.required?'checked disabled':'')+'><span><b>'+x.name+'</b><small>'+x.why+'</small></span><em>+'+x.cost+' PTS</em></label>').join('')+'</div>'+
 '<div class="tm2-lab-output"><div class="tm2-art"></div><small>ESTIMATIVA DIDÁTICA · COMPLEXIDADE RELATIVA</small><strong id="tm2Complexity">5</strong>'+
 '<div class="tm2-meter"><span id="tm2Meter" style="width:17%"></span></div>'+
 '<p id="tm2Verdict">Núcleo mínimo preservado: o jogo já tem cenário, entrada, mecânica e conclusão.</p>'+
 '<div class="tm2-lab-kpis"><span>ELEMENTOS <b id="tm2Features">4</b></span><span>OPCIONAIS <b id="tm2Extras">0</b></span></div>'+
 '<button type="button" id="tm2Reset">↺ VOLTAR AO MVP</button></div></div>'+
 '<div class="tm2-demo-notes" data-reveal><article><span>REGRA DE CORTE</span><h4>Retire volume, preserve comportamento.</h4><p>Menos cenários e personagens não elimina a aprendizagem. Retirar a mecânica principal eliminaria a hipótese que o jogo deveria demonstrar.</p></article>'+
 '<article><span>EXEMPLOS POR GÊNERO</span><h4>O mesmo raciocínio para várias ideias.</h4>'+
 '<div class="tm2-genre-buttons" role="group" aria-label="Exemplos por gênero"><button type="button" data-tm2-genre="rpg" aria-pressed="true">RPG</button><button type="button" data-tm2-genre="corrida" aria-pressed="false">CORRIDA</button><button type="button" data-tm2-genre="puzzle" aria-pressed="false">PUZZLE</button></div>'+
 '<p id="tm2GenreOutput">RPG: uma sala, uma guardiã, três cristais e um portal. Depois: inventário e múltiplos mapas.</p></article></div>');
}
function practice(){
 return shell('practice',intro('ESPECIFICAÇÃO E BACKLOG','Uma ideia só está reduzida quando tem critério de pronto.','A construção desta missão é <strong>um documento curto de planejamento</strong>, não um projeto já executado na engine. A cena, a mecânica, os elementos essenciais e o teste de conclusão serão implementados nas missões seguintes.')+
 '<details class="pit-private-teacher-notes"><summary title="Roteiro privado: abrir somente após retirar o espelhamento" aria-label="Abrir roteiro privado do professor">▤</summary><div class="pit-private-teacher-notes-body"><small>ROTEIRO PRIVADO · NÃO PROJETAR</small><span>GUIA OPERACIONAL DA MISSÃO 02</span><strong>O aluno planeja; ainda não precisa abrir o GDevelop.</strong><p>Na tela do aluno: selecionar “Definir meu MVP”; preencher uma cena curta, uma mecânica central, exatamente três elementos separados por vírgula e um teste no formato Dado / Quando / Então. O campo “Depois” é opcional. Conferir as quatro decisões no resumo, selecionar “Ver meu plano de jogo” e, com a prática liberada, “Enviar ao professor”. Se não conseguir enviar, verificar campos incompletos, quantidade de elementos, liberação da prática e estado da entrega. Avaliar a coerência entre cena, mecânica, elementos e teste; não exigir jogo pronto nesta missão.</p></div></details>'+ 
 '<div class="tm2-spec-architecture" data-reveal><div class="tm2-spec-art"></div><div><span>MODELAGEM DO PRIMEIRO MVP</span><h4>1 cena + 1 ação + elementos essenciais + 1 condição final</h4>'+
 '<p>O plano é um contrato de escopo. Se uma funcionalidade não ajuda a executar a ação principal ou chegar ao resultado, ela entra na lista de melhorias futuras.</p></div></div>'+
 '<div class="tm2-spec-grid">'+
 card(1,'CENÁRIO','Onde a interação acontece?','Escolha <strong>uma única cena</strong> ou um percurso curto. Ela pode ser uma sala, pista, tela de diálogo ou arena. Não é necessário desenhar todos os elementos ainda.','Puzzle: uma sala com três símbolos, um painel bloqueado e um cofre.')+
 card(2,'MECÂNICA','O que o usuário faz repetidamente?','Defina a <strong>interação principal</strong> que dará origem aos eventos do GDevelop: coletar, saltar, clicar, conversar, desviar. Outras mecânicas ficam fora do primeiro protótipo.','Narrativa: escolher opções de diálogo e observar a mudança na conversa.')+
 card(3,'DEPENDÊNCIAS','Quais três elementos são suficientes?','Liste os <strong>três objetos ou sistemas indispensáveis</strong>, como Jogador, Chave e Porta. Cada um será transformado em objeto, comportamento, variável ou evento.','Corrida: Kart, Checkpoint e Linha de Chegada; as paisagens detalhadas podem esperar.')+
 card(4,'TESTE','Como demonstrar que ficou pronto?','Descreva uma <strong>condição de aceitação</strong>: estado inicial, ação de teste e resultado esperado. Assim, o projeto não depende apenas da opinião do criador.','Dado que a pessoa ativou os três símbolos, quando tocar no cofre, então ele deverá abrir.')+
 '</div>'+
 '<div class="tm2-sample" data-reveal><div class="tm2-sample-bar"><span>DOCUMENTO DE EXEMPLO · MVP 0.1</span><span>RPG / CASTELO DOS CRISTAIS</span></div>'+
 '<div class="tm2-sample-lines"><div><b>CENA</b><span>Uma sala de masmorra</span></div><div><b>MECÂNICA</b><span>Coletar cristais</span></div>'+
 '<div><b>3 ELEMENTOS</b><span>Guardiã · Cristais · Portal</span></div><div><b>TESTE DE PRONTO</b><span>Portal abre apenas com 3 cristais</span></div><div><b>BACKLOG</b><span>Inventário · áudio narrativo · mapas extras</span></div></div></div>'+
 '<div class="tm2-requirement" data-reveal><span>LIMITAÇÃO DA OFICINA</span><strong>Escopo não significa padronizar a criatividade.</strong><p>O gênero, a mecânica e a história do aluno permanecem autorais. O professor mostra como identificar requisitos viáveis, enquanto o aluno decide quais elementos preservam sua ideia.</p></div>');
}
function review(){
 return shell('review',intro('VALIDAÇÃO DE PROJETO','O que uma equipe consegue implementar e testar?','A entrega da Missão 02 é o <strong>MVP especificado</strong>. Ainda não é um jogo funcional. As próximas missões transformam o documento em um projeto executável e verificam se o comportamento prometido funciona.')+
 '<div class="tm2-review-grid">'+[
 ['CENA DELIMITADA','Uma cena ou percurso curto, com função definida e sem mapas extras obrigatórios.'],
 ['MECÂNICA CENTRAL','Uma ação observável que representa o núcleo da experiência.'],
 ['ELEMENTOS ESSENCIAIS','Três objetos, controles ou sistemas necessários à ação principal.'],
 ['CRITÉRIO DE ACEITAÇÃO','Um teste “dado/quando/então” que permitirá comprovar o resultado.']
 ].map((x,i)=>'<article data-reveal style="--tm2-delay:'+i*100+'ms"><span>0'+(i+1)+'</span><div><h4>'+x[0]+'</h4><p>'+x[1]+'</p></div></article>').join('')+'</div>'+
 '<div class="tm2-requirement" data-reveal><span>TRANSIÇÃO · MISSÃO 03</span><strong>O MVP está especificado. Agora vamos abrir o GDevelop.</strong><p>Na próxima etapa, a cena e os objetos do documento serão criados no editor, e o Preview confirmará que o projeto está pronto para receber regras.</p></div>');
}
function render(phase){return phase==='demo'?simulator():phase==='practice'?practice():phase==='review'?review():concepts()}
function mount(rootOverride){
 const root=rootOverride||document.querySelector('.tm2-root');if(!root)return;
 const reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const reveal=[...root.querySelectorAll('[data-reveal]')];
 if(!reduced&&typeof IntersectionObserver!=='undefined'){
  root.classList.add('tm2-reveal-enabled');
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('tm2-visible');observer.unobserve(e.target)}});
  },{threshold:0.04,rootMargin:'0px 0px 35px 0px'});
  reveal.forEach(el=>observer.observe(el));
 }else reveal.forEach(el=>el.classList.add('tm2-visible'));
 const inputs=[...root.querySelectorAll('[data-tm2-feature]')];
 function update(){
  if(!inputs.length)return;
  const active=inputs.filter(el=>el.checked);
  const cost=active.reduce((sum,el)=>sum+(features.find(x=>x.id===el.dataset.tm2Feature)?.cost||0),0);
  const extras=active.filter(el=>!features.find(x=>x.id===el.dataset.tm2Feature)?.required).length;
  const $=sel=>root.querySelector(sel);
  $('#tm2Complexity').textContent=String(cost);
  $('#tm2Features').textContent=String(active.length);
  $('#tm2Extras').textContent=String(extras);
  $('#tm2Meter').style.width=Math.min(100,Math.round(cost/25*100))+'%';
  $('#tm2Verdict').textContent=extras===0?'MVP mínimo preservado: cenário, entrada, mecânica e conclusão.':extras===1?'Um recurso opcional foi incluído. Ele ajuda a testar a mecânica principal?':'O projeto ganhou '+extras+' recursos opcionais. Priorize o núcleo antes de ampliar o escopo.';
 }
 inputs.forEach(el=>el.addEventListener('change',update));
 const reset=root.querySelector('#tm2Reset');
 if(reset)reset.addEventListener('click',()=>{inputs.forEach(el=>{if(!el.disabled)el.checked=false});update()});
 const examples={
  rpg:'RPG: uma sala, uma guardiã, três cristais e um portal. Depois: inventário e múltiplos mapas.',
  corrida:'Corrida: uma pista curta, um veículo e três checkpoints. Depois: carros extras e campeonatos.',
  puzzle:'Puzzle: uma tela, três símbolos e um cofre. Depois: dezenas de fases e dicas animadas.'
 };
 root.querySelectorAll('[data-tm2-genre]').forEach(btn=>btn.addEventListener('click',()=>{
  root.querySelectorAll('[data-tm2-genre]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  const out=root.querySelector('#tm2GenreOutput');if(out)out.textContent=examples[btn.dataset.tm2Genre]||examples.rpg;
 }));
 update();
}
window.PIT_TEACHER_MISSION_TWO={render,mount,minutes:()=>[9,5,14,2],features};
})();
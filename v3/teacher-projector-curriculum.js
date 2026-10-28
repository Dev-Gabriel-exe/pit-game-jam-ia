/* PIT Game Jam IA — curriculum-first projector for missions 02–10.
 * Source of deliverables: student-mission-{two...ten}.js (audited 2026-10-28).
 * Non-destructive: prior universal >12-slide versions remain behind ?oficina=detalhado.
 * Lecture 7 slides; remaining time explicitly allocated to the student reader, guide,
 * hands-on build and real evidence. The teacher checklist is NOT auto-grading.
 */
(function(){
'use strict';
const legacy=window.PIT_PROJECTOR_UNIVERSAL;
if(!legacy)return;
const TIME={2:[30,6,4,5,12,3],3:[30,7,3,5,12,3],4:[50,8,4,7,25,6],5:[40,7,4,5,19,5],6:[45,7,4,7,22,5],7:[50,8,4,7,25,6],8:[40,7,3,5,20,5],9:[25,4,2,3,12,4],10:[30,5,2,5,13,5]};
const lessons={
 2:{
  name:'MVP em Foco',tagline:'Uma ideia grande. Um primeiro jogo possível.',goal:'Entregar o recorte da sua ideia antes de abrir o GDevelop.',
  terms:[['MVP','A menor versão que permite testar a mecânica principal. Não precisa estar bonita.'],['Escopo','Limite de cenas, objetos e comportamentos que cabem nas seis horas.'],['Prioridade','Primeiro o indispensável; detalhes e efeitos ficam para depois.'],['Teste','Descreve o que outra pessoa fará e qual resposta deverá observar.']],
  cycle:[['01 · IDEIA','Recupere o jogo imaginado na Missão 01.'],['02 · RECORTE','Escolha UMA cena e UMA interação principal.'],['03 · ESSENCIAIS','Liste exatamente TRÊS elementos necessários.'],['04 · PROVA','Escreva DADO → QUANDO → ENTÃO com um resultado observável.']],
  demo:'Compare uma ideia de mundo enorme com um MVP que tenha apenas uma cena, uma ação e uma saída verificável.',
  tutorial:['Abra o Caderno do Aluno na Missão 02.','Explore os exemplos de recorte e a diferença entre obrigatório e opcional.','Preencha os fragmentos de planejamento; nesta missão ainda NÃO é necessário abrir o GDevelop.'],
  action:'Planejar o MVP: cena única, mecânica principal, três elementos e um teste, deixando extras no backlog.',
  check:['A cena do MVP está definida e é pequena.','Escolhi apenas UMA mecânica jogável.','Listei exatamente TRÊS elementos essenciais.','Escrevi um teste DADO/QUANDO/ENTÃO e enviei a ficha.'],
  depth:['O MVP não é um jogo incompleto por descuido: é uma versão intencionalmente pequena para validar a ideia.','O backlog guarda melhorias opcionais sem desviá-lo da entrega principal.','Exemplo: não construir um mundo aberto; começar com uma sala, uma chave, uma porta e uma condição de saída.'],
  proof:'Ficha do MVP no Caderno do Aluno. Não pedir código nesta missão.'
 },
 3:{
  name:'Ligar o Motor',tagline:'Sua ideia se torna um projeto que abre no Preview.',goal:'Criar, executar e salvar uma primeira cena no GDevelop.',
  terms:[['Engine','Ferramenta que organiza cenas, objetos, eventos e a execução do jogo.'],['Cena','Área inicial que será executada e onde os objetos aparecem.'],['Objeto','Elemento visível da cena: sprite 2D ou caixa/modelo 3D.'],['Preview','Execução real para verificar o que aparece, sem supor que funcionou.']],
  cycle:[['01 · PROJETO','Crie um projeto reconhecível no GDevelop.'],['02 · CENA','Nomeie e abra a cena inicial.'],['03 · OBJETO','Adicione um objeto 2D ou 3D e registre a origem.'],['04 · EXECUÇÃO','Abra Preview, observe e salve o projeto editável.']],
  demo:'Abra uma cena e identifique a lista de objetos. Diferencie visualizar o editor de EXECUTAR a cena no Preview.',
  tutorial:['No Caderno do Aluno, leia o roteiro e escolha 2D ou 3D.','Explore as imagens do tutorial do editor de cenas e objetos.','No GDevelop: projeto → cena → objeto → Preview → salvar.'],
  action:'Construir a primeira cena REAL; não basta descrever um projeto hipotético.',
  check:['Existe projeto e cena com nomes registrados.','Adicionei objeto 2D/3D e registrei a origem do asset.','Executei o Preview e descrevi o resultado que realmente vi.','Salvei o editável e enviei o registro de execução.'],
  depth:['Uma cena é um conjunto de objetos e eventos; o projeto é o conjunto de cenas e recursos.','O Preview é um teste de execução, não um desenho nem uma promessa de que o jogo funciona.','Salvamento local/nuvem precisa ser localizável para as próximas missões.'],
  proof:'Nome do projeto, cena, objeto, origem do asset, resultado real do Preview e onde o projeto foi salvo.'
 },
 4:{
  name:'Primeiro Jogável',tagline:'Seu personagem ou objeto começa a responder.',goal:'Implementar um controle real e testar também um limite.',
  terms:[['Entrada','Comando do jogador: tecla, clique, toque ou interação.'],['Comportamento','Regra pronta do GDevelop, como Platformer ou movimentação.'],['Movimento','Mudança de posição: coordenadas X/Y, ou X/Y/Z no espaço 3D.'],['Limite','Verificação de obstáculo, borda ou ação inválida.']],
  cycle:[['01 · RETOMAR','Reabra o projeto e a cena da Missão 03.'],['02 · CONTROLAR','Escolha o controle adequado a 2D ou 3D.'],['03 · EXECUTAR','No Preview, faça o objeto responder à entrada.'],['04 · LIMITAR','Teste uma borda, obstáculo ou condição de parada.']],
  demo:'Compare pressionar uma tecla sem comportamento configurado com um objeto que responde. Mostre um limite sendo respeitado.',
  tutorial:['Leia no Caderno do Aluno qual rota combina com o seu projeto (2D ou 3D).','Explore o tutorial correspondente de controle e colisão.','Aplique os eventos/behaviors no projeto da Missão 03 e rode Preview.'],
  action:'Ter um comando real com resultado visível, incluindo um teste de limite.',
  check:['Meu objeto responde ao comando escolhido no Preview.','Usei a rota 2D ou 3D compatível com o projeto.','Testei um limite/obstáculo e descrevi o que aconteceu.','Salvei o projeto e registrei os testes na entrega.'],
  depth:['Um comportamento reaproveita lógica de movimento já fornecida pela engine.','Coordenadas representam posição; não confunda velocidade com deslocamento.','Teste negativo: o que deveria acontecer quando o jogador tenta ultrapassar uma borda?'],
  proof:'Controle executado + resultado observado + limite testado + projeto atualizado salvo.'
 },
 5:{
  name:'A Primeira Regra',tagline:'Seu jogo começa a tomar decisões.',goal:'Implementar um evento SE/ENTÃO com variável e testar condição verdadeira e falsa.',
  terms:[['Evento','Associação de uma condição com ações executadas no jogo.'],['Condição SE','Pergunta que vale verdadeiro ou falso; determina se a ação dispara.'],['Ação ENTÃO','Mudança produzida quando a condição é satisfeita.'],['Variável','Memória do estado, como Score ou TemChave, que pode aparecer no HUD.']],
  cycle:[['01 · SE','Defina um gatilho real: toque, tecla, colisão.'],['02 · ENTÃO','Escolha a ação que deve ocorrer.'],['03 · MEMÓRIA','Registre a mudança com uma variável.'],['04 · TESTE','Confirme caso verdadeiro, caso falso e feedback.']],
  demo:'Altere um evento real e observe Score mudar. Teste o mesmo caso sem colisão e verifique que não pontua.',
  tutorial:['Leia a explicação SE/ENTÃO do Caderno do Aluno.','Explore o tutorial da aba Events correspondente ao seu gênero.','Crie condição, ação, variável e feedback no SEU jogo; execute pelo menos dois cenários.'],
  action:'Uma regra implementada e comprovada no editor de eventos, não uma resposta teórica.',
  check:['Registrei o SE e o ENTÃO executados no jogo.','Uma variável guarda a mudança real de estado.','Testei um caso verdadeiro E um falso/repetido no Preview.','Mostrei feedback, salvei o projeto e enviei a evidência.'],
  depth:['Condições controlam decisões, ações mudam objetos ou variáveis, e feedback mostra ao jogador o efeito.','Uma regra que soma pontos toda atualização sem controle pode gerar pontuação duplicada.','Teste negativo protege contra vitórias e incrementos que não deveriam ocorrer.'],
  proof:'Evento real, variável, cenário positivo, cenário negativo, feedback e local do projeto.'
 },
 6:{
  name:'Forja de IA',tagline:'Um recurso novo para o jogo que você já criou.',goal:'Criar ou escolher UM asset adequado, verificar origem/licença e importar.',
  terms:[['Asset','Arquivo usado no jogo: sprite, som, imagem, modelo ou vídeo.'],['Formato','PNG, WAV/OGG e GLB têm usos diferentes; o editor precisa reconhecer o arquivo.'],['Licença','Condição de uso: verificar permissão comercial, atribuição ou autoria própria.'],['Integração','Importar não basta: recurso precisa aparecer e funcionar no Preview.']],
  cycle:[['01 · NECESSIDADE','Qual objeto ou som realmente falta no seu jogo?'],['02 · ESCOLHA','Criar com IA, produzir sozinho ou baixar de biblioteca CC0.'],['03 · IMPORTAR','Selecione formato adequado e adicione ao projeto.'],['04 · COMPROVAR','Registre antes/depois e ao menos uma falha testada.']],
  demo:'Compare a escolha do formato e a importação de um arquivo adequado. Nem todo 3D é GLB e nem todo arquivo baixado serve como objeto.',
  tutorial:['Leia os critérios de seleção e licença no Caderno do Aluno.','Explore o tutorial da Forja e a Biblioteca Arcana do portal; escolha UM asset apenas.','Importe no GDevelop, veja o Preview e registre origem, formato, licença e falha testada.'],
  action:'Integrar UM asset ao projeto existente e provar o resultado real.',
  check:['Identifiquei a necessidade do jogo e selecionei UM recurso.','Anotei nome, formato, origem e licença/autoria verificados.','Comparei o Preview antes e depois da importação.','Registrei falha/incompatibilidade testada, salvei e enviei.'],
  depth:['Licença CC0 e arquivo gratuito não são conceitos idênticos. Verifique a página do autor.','Para objeto 3D no GDevelop, privilegie GLB; pacote OBJ/FBX pode precisar conversão.','Um asset sem função na mecânica apenas consome tempo; priorize o que torna o jogo melhor.'],
  proof:'Diário real de importação de UM asset com formato, fonte, licença, antes/depois, falha e editável.'
 },
 7:{
  name:'Dar Vida ao Universo',tagline:'Agora seu jogo precisa começar, desafiar e terminar.',goal:'Implementar uma condição real de conclusão, feedback e teste negativo.',
  terms:[['Estado inicial','Como o jogador começa a partida e quais variáveis estão zeradas.'],['Desafio','Objetivo concreto definido no planejamento, agora implementado.'],['Condição final','Regra SE que permite declarar vitória ou conclusão.'],['Estado terminal','Resposta visual/cena exibida quando a condição é atendida.']],
  cycle:[['01 · INÍCIO','O jogador começa em um estado previsível.'],['02 · DESAFIO','Executa ações e interage com o objetivo.'],['03 · REGRA','Uma condição válida habilita o final.'],['04 · RETORNO','Mostra vitória e não permite concluir cedo demais.']],
  demo:'Simule uma partida que tem início, desafio e vitória. Teste vencer sem cumprir a condição: o jogo deve bloquear.',
  tutorial:['Leia no Caderno do Aluno o modelo de início–desafio–fim.','Explore a rota do tutorial que se adapta ao seu gênero.','Adicione a condição de conclusão no editor e teste vitória cedo, repetição e reinício.'],
  action:'Conectar o projeto existente a um final real e observável.',
  check:['Consigo descrever e executar o estado inicial e o desafio.','Implementei uma condição SE real de conclusão.','O jogo mostra uma resposta/cena ao vencer.','Testei vitória antecipada e reinício/repetição; salvei e enviei.'],
  depth:['Estados distinguem início, jogando e conclusão. A mesma ação pode ter efeitos diferentes conforme o estado.','Uma condição final precisa ser satisfeita no Preview, não apenas escrita no caderno.','Um teste negativo evita que a vitória apareça antes de o desafio estar concluído.'],
  proof:'Registro de início, desafio, condição final, feedback, teste negativo, repetição/reinício e editável.'
 },
 8:{
  name:'Polimento',tagline:'Faça seu jogo ser compreendido, não apenas bonito.',goal:'Corrigir UM problema de usabilidade com evidência de antes e depois.',
  terms:[['Usabilidade','Facilidade com que o jogador entende a ação e o objetivo.'],['Feedback','Resposta visual ou sonora que informa se a entrada funcionou.'],['Antes × Depois','Comparação observável que mostra o efeito de uma melhoria.'],['Prioridade','Corrija o que atrapalha jogar antes de adicionar enfeites.']],
  cycle:[['01 · PROBLEMA','Encontre um ponto que confunde ou atrapalha.'],['02 · ESCOLHA','Selecione UMA melhoria viável.'],['03 · MUDANÇA','Altere HUD, contraste, som ou indicação de objetivo.'],['04 · TESTE','Compare o Preview antes e depois, inclusive caso negativo.']],
  demo:'Mostre a diferença entre uma interface sem orientação e outra com objetivo e feedback claros. Observe a ação, não apenas as cores.',
  tutorial:['Leia o conceito de problema de usabilidade no Caderno do Aluno.','Explore exemplos antes/depois do tutorial GDevelop.','Implemente UMA correção e execute Preview nos dois cenários.'],
  action:'Polir UMA experiência específica, explicando por que a alteração ajuda.',
  check:['Identifiquei um problema real de usabilidade.','Implementei UMA mudança no GDevelop.','Descrevi o que havia antes e o que mudou no Preview.','Verifiquei um erro/caso negativo, salvei e enviei.'],
  depth:['Polimento pode ser melhorar legibilidade, objetivo, feedback sonoro ou resposta de controle.','Não confunda mudança estética com melhoria comprovada.','Antes/depois deve referir-se à experiência do seu próprio jogador.'],
  proof:'Problema, mudança aplicada, antes/depois observado, teste negativo e projeto atualizado.'
 },
 9:{
  name:'Playtest Cruzado',tagline:'Seu jogo encontra outro jogador.',goal:'Observar um colega jogando sem ajuda e registrar uma decisão concreta.',
  terms:[['Hipótese','O que você espera que outra pessoa consiga fazer sozinha.'],['Teste com colega','Outra pessoa executa a tarefa sem receber a solução.'],['Observação','Fato visto durante a partida, sem inventar resultados.'],['Reprodução','Passos claros que permitem repetir um problema ou sucesso.']],
  cycle:[['01 · COMBINAR','Defina a tarefa e o resultado esperado.'],['02 · OBSERVAR','O colega joga; não explique como fazer.'],['03 · REGISTRAR','Anote o que realmente aconteceu e como reproduzir.'],['04 · DECIDIR','Corrigir um ponto simples ou registrar no backlog.']],
  demo:'Peça a um colega para testar a saída sem ajuda e compare esperado versus observado. Um jogo sem defeito também gera um teste válido.',
  tutorial:['Leia as regras de playtest e privacidade no Caderno do Aluno.','Explore o modelo de observação; combine papéis com um colega.','Testem os jogos no Preview, invertam papéis e registrem uma evidência real.'],
  action:'Realizar playtest real, com colega identificado anonimamente, e escolher próximo passo.',
  check:['Defini hipótese, tarefa e resultado esperado.','Um colega REAL testou sem ajuda; registrei observação objetiva.','Anotei reprodução do resultado e seu impacto.','Escolhi correção ou backlog, registrei o editável e enviei.'],
  depth:['Não grave nomes pessoais, áudio ou imagens sem necessidade: use “Colega A”.','Uma resposta “funcionou” não basta: detalhe a tarefa e como foi observada.','O objetivo do playtest é aprender com o jogador e priorizar a melhoria seguinte.'],
  proof:'Relatório de teste por colega: tarefa, hipótese, esperado, observado, reprodução, impacto, decisão e editável.'
 },
10:{
  name:'Lançamento',tagline:'Seu jogo merece ser jogado por outras pessoas.',goal:'Preparar demonstração de até dois minutos e uma rota de acesso real.',
  terms:[['Build','Versão executável ou exportada; não se confunde com o editável.'],['Preview local','Rota válida para demonstrar sem conta, pagamento ou hospedagem.'],['Publicação Web','Opcional quando há acesso permitido; link exige verificação real.'],['Pitch técnico','Explicação curta de mecânica, regra, teste e limitação.']],
  cycle:[['01 · ESCOLHER','Defina Preview local, exportação Web ou compartilhamento.'],['02 · CONFERIR','Abra o projeto editável e rode a experiência completa.'],['03 · MOSTRAR','Demonstre mecânica, regra, vitória e correção do playtest.'],['04 · ENTREGAR','Explique como professor vai conseguir jogar.']],
  demo:'Compare um link público testado com o Preview local. Nenhum aluno precisa inventar uma URL para comprovar conclusão.',
  tutorial:['Leia as opções de lançamento e acesso no Caderno do Aluno.','Explore o tutorial da rota escolhida; nunca inclua credenciais em links.','Execute demo de até 2 min, registre limites e indique localização do projeto editável.'],
  action:'Demonstrar a versão jogável e disponibilizar uma forma real para avaliação; publicação Web é opcional.',
  check:['Preparei pitch com público, mecânica e regra SE/ENTÃO.','Mostrei início, mecânica, conclusão e uma correção do playtest.','Registrei limitação e onde está o projeto editável/asset.','Informei acesso REAL (Preview local ou link válido), executei testes e enviei.'],
  depth:['A publicação pode acontecer de várias formas; a opção local é válida no material do aluno.','Se compartilhar um link, teste em outro dispositivo sem credenciais nem tokens.','O professor precisa abrir o jogo; uma promessa de link não é um acesso demonstrável.'],
  proof:'Ficha de lançamento com 8 campos e três verificações reais no Preview; link público opcional.'
 }
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const yes=(section,title,body,extra={})=>({section,title,html:'<section class="pit-m01-deck pit-workshop-deck pit-ws-universal">'+body+'</section>',...extra});
const key=s=>'<div class="pit-m01-kicker">'+esc(s)+'</div>';
const cards=items=>'<div class="pit-ws-concepts">'+items.map(([n,t,txt])=>'<article class="pit-ws-concept"><span>'+esc(n)+'</span><h3>'+esc(t)+'</h3><p>'+esc(txt)+'</p></article>').join('')+'</div>';
const btn=(kind,title)=>'<button type="button" data-pit-ws-more="'+kind+'" class="pit-ws-depth-trigger" aria-haspopup="dialog">✧ '+esc(title)+' ↗</button>';
const timing=l=>'<span>'+l+' MIN · OFICINA</span>';
const state=new Map();
function stateFor(m){
 if(!state.has(m))state.set(m,{sec:(TIME[m][2]+TIME[m][3]+TIME[m][4]+TIME[m][5])*60,running:false,ends:0,timer:null,marks:new Set()});
 return state.get(m);
}
const displayClock=v=>String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0');
function stopAll(){for(const s of state.values()){if(s.timer)clearInterval(s.timer);s.timer=null;s.running=false;}}
function tryDepth(m,type,trigger,root){
 const l=lessons[m];if(!l)return;
 const modal=document.createElement('div');modal.className='pit-ws-depth-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
 const content=type==='guide'
  ?'<h3>Roteiro de exploração · siga também o tutorial do aluno</h3><ol class="pit-ws-curriculum-list">'+l.tutorial.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>'+
   '<p><strong>Critério de saída:</strong> '+esc(l.proof)+'</p>'
  :'<h3>Entenda antes de executar</h3><div class="pit-ws-depth-grid">'+l.depth.map((s,i)=>'<article><h3>'+(i+1)+' · '+esc(l.terms[i]?.[1]||'Na prática')+'</h3><p>'+esc(s)+'</p></article>').join('')+'</div>'+
   '<p>Esses conceitos estão disponíveis sob demanda. Não é preciso projetar toda a teoria enquanto a turma programa.</p>';
 modal.innerHTML='<div class="pit-ws-depth-pane"><div class="pit-ws-depth-head"><div><small>✦ '+String(m).padStart(2,'0')+' · '+(type==='guide'?'TUTORIAL E EXPLORAÇÃO':'APROFUNDAMENTO OPCIONAL')+'</small><h2>'+esc(l.name)+'</h2></div><button type="button" data-ws-close>✕ Fechar</button></div><div class="pit-ws-depth-body">'+content+'</div></div>';
 root.appendChild(modal);
 const close=()=>{modal.remove();document.removeEventListener('keydown',escKey,true);trigger?.focus()};
 const escKey=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}};
 document.addEventListener('keydown',escKey,true);
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 modal.querySelector('[data-ws-close]').addEventListener('click',close);
 modal.querySelector('[data-ws-close]').focus();
}
function build(m){
 if(!lessons[m]||new URLSearchParams(location.search).get('oficina')==='detalhado')return legacy.build(m);
 const l=lessons[m],time=TIME[m],minutes=time[0];
 const format=String(m).padStart(2,'0');
 const old=legacy.build(m);
 // Reuse existing tested interactive components, without cloning away their listeners.
 const live=old.filter(x=>x.interactive);
 const prefer={2:/tm2-lab|tm2-demo/i,3:/gd3-root/i,4:/g4Tutorial|tm4f-pathways/i,5:/tm5-simulator|score/i,6:/f6Matrix|f6-decision/i,7:/t7f-sim/i,8:/t8f-lab/i,9:/t9-lab/i,10:/t10-choices/i};
 const sim=live.find(x=>prefer[m]?.test(x.html))||live[0];
 const estimate=time[2]+time[3]+time[4]+time[5];
 const start=()=>{
  const s=stateFor(m);if(!s.running&&!s.timer&&s.sec<=0)s.sec=estimate*60;
 };
 start();
 const deck=[];
 deck.push(yes('ABERTURA · GUIA DA MISSÃO','Missão '+format+' — '+l.name,
  key('CAPÍTULO '+format+' / 10 · OFICINA · '+minutes+' MINUTOS')+
  '<div class="pit-u-cover pit-ws-new-cover"><div><h2>'+esc(l.tagline)+'</h2><p>'+esc(l.goal)+'</p>'+
  '<div class="pit-m01-chips"><span>'+minutes+' MIN TOTAL</span><span>'+time[1]+' MIN · CONCEITOS E DEMONSTRAÇÃO</span><span>'+estimate+' MIN · CADERNO E CRIAÇÃO</span></div></div>'+
  '<div class="pit-u-cinema-panel" aria-hidden="true"><img class="pit-cinema-poster" src="./v3/assets/missions/missao-'+format+'.webp" alt="" loading="eager"><video class="pit-cinema-film" muted loop playsinline preload="metadata" src="./v3/assets/missions/missao-'+format+'-motion.mp4" poster="./v3/assets/missions/missao-'+format+'.webp"></video><div class="pit-u-cinema-glaze"></div><div class="pit-u-cinema-label"><span>CAPÍTULO '+format+'</span><strong>'+esc(l.name)+'</strong></div></div></div>'));
 deck.push(yes('CONCEITOS','Entenda antes de construir',
  key('VOCABULÁRIO · O QUE VOCÊ PRECISA SABER')+
  '<p class="pit-ws-lead">Aprenda o significado destes quatro conceitos e reconheça como aparecem no projeto que você está desenvolvendo.</p>'+
  cards(l.terms)+
  '<div class="pit-ws-bottom"><strong>Conceito ≠ clicar no editor.</strong> Cada decisão técnica tem uma finalidade no jogo.'+btn('concepts','Aprofundar')+'</div>'));
 deck.push(yes('CONCEITOS','Do conceito à ação',
  key('MAPA MENTAL · O QUE ENTRA, O QUE MUDA, O QUE SAI')+
  '<p class="pit-ws-lead">O trabalho desta missão segue uma sequência. O professor demonstra uma vez, e você repete com o seu próprio projeto.</p>'+
  '<div class="pit-ws-flow">'+l.cycle.map((x,i)=>'<div class="pit-ws-flow-node"><span>'+x[0].split(' · ')[0]+'</span><h3>'+esc(x[0].split(' · ')[1]||x[0])+'</h3><p>'+esc(x[1])+'</p></div>'+(i<3?'<b aria-hidden="true">›</b>':'')).join('')+'</div>'+
  '<div class="pit-ws-bottom"><strong>Resultado esperado:</strong> '+esc(l.goal)+'</div>'));
 deck.push(yes('EXEMPLO EM AÇÃO','Veja a ideia funcionando',
  key('DEMONSTRAÇÃO · EXEMPLO NÃO É ENTREGA')+
  '<p class="pit-ws-lead pit-ws-compact-lead">'+esc(l.demo)+'</p>'+
  (sim?'<div class="pit-ws-live-stage">'+sim.html+'</div>':
    '<div class="pit-ws-explainer">'+cards(l.cycle.slice(0,3))+'</div>')+
  '<div class="pit-ws-example-foot">Experimente e observe o resultado; depois adapte a lógica ao seu próprio jogo.</div>',
  sim?{interactive:true,mountModule:sim.mountModule,phase:sim.phase}:{interactive:false}));
 deck.push(yes('TUTORIAL','Como explorar o material do aluno',
  key('NÃO PULE A LEITURA NEM O TUTORIAL')+
  '<div class="pit-ws-reading-guide">'+l.tutorial.map((x,i)=>'<article><b>'+String(i+1).padStart(2,'0')+'</b><p>'+esc(x)+'</p></article>').join('')+'</div>'+
  '<div class="pit-ws-bottom"><strong>Liberdade com direção:</strong> use os exemplos como referência, sem copiar como se fossem resultados já obtidos.'+btn('guide','Consultar roteiro completo')+'</div>'));
 deck.push(yes('MODO OFICINA · '+estimate+' MIN','Agora é a sua vez — leia, explore e construa',
  key('MODO CRIAÇÃO · '+l.name+' · CADERNO DO ALUNO')+
  '<div class="pit-ws-practice pit-ws-practice-universal"><div class="pit-ws-worksheet"><h3>'+esc(l.action)+'</h3>'+
  '<div class="pit-ws-reading-guide pit-ws-workflow">'+
  [['LER',time[2],'No Caderno do Aluno, entenda o desafio e os termos desta missão.'],
   ['EXPLORAR',time[3],'Explore o tutorial, escolha a rota e experimente os exemplos.'],
   ['CRIAR',time[4],l.action],['CONFERIR',time[5],'Teste no Preview quando exigido, preencha o registro real e envie ao professor.']].map((x,i)=>
    '<article><b>'+String(i+1).padStart(2,'0')+'</b><div><strong>'+x[0]+' · '+x[1]+' MIN</strong><p>'+esc(x[2])+'</p></div></article>').join('')+'</div></div>'+
  '<aside class="pit-ws-task"><div class="pit-ws-task-top">⏳ TEMPO PARA LER, EXPLORAR E FAZER</div>'+
  '<div class="pit-ws-timer" data-ws-time>'+displayClock(stateFor(m).sec)+'</div>'+
  '<div class="pit-ws-timer-controls"><button type="button" data-ws-timer="start">▶ Iniciar</button><button type="button" data-ws-timer="reset">↺ Reiniciar</button></div>'+
  '<p><strong>Entrega real desta missão:</strong> '+esc(l.proof)+'</p>'+
  '<p class="pit-ws-notice">O cronômetro e as marcações são locais à projeção. Não substituem a atividade nem a entrega do aluno.</p></aside></div>',
  {workshop:true,mission:m}));
 deck.push(yes('VALIDAÇÃO','Checklist de entrega — Missão '+format,
  key('CONFERIR ANTES DE AVANÇAR · NÃO É NOTA AUTOMÁTICA')+
  '<p class="pit-ws-lead">Confira os resultados efetivamente obtidos no jogo ou no caderno. Marque somente o que os alunos realmente realizaram.</p>'+
  '<div class="pit-ws-evidence-list">'+l.check.map((x,i)=>'<label><input type="checkbox" data-ws-check="'+i+'" '+(stateFor(m).marks.has(i)?'checked':'')+'><span><b>'+String(i+1).padStart(2,'0')+'</b>'+esc(x)+'</span></label>').join('')+'</div>'+
  '<div class="pit-ws-bottom"><strong>O que entregar:</strong> '+esc(l.proof)+
  '<span class="pit-ws-evidence-total" data-ws-check-progress>'+stateFor(m).marks.size+' / 4 conferidos</span></div>',
  {checklist:true,mission:m}));
 return deck;
}
function mount(host,slide){
 if(!slide)return;
 if(new URLSearchParams(location.search).get('oficina')==='detalhado')return legacy.mount(host,slide);
 if(slide.interactive)legacy.mount(host,slide);
 const m=slide.mission||Number((document.getElementById('pitProjectorMission')?.textContent||'').slice(0,2));
 if(!lessons[m])return;
 host.querySelectorAll('[data-pit-ws-more]').forEach(b=>b.addEventListener('click',()=>tryDepth(m,b.dataset.pitWsMore,b,host)));
 if(slide.workshop){
  const s=stateFor(m),total=(TIME[m].slice(2).reduce((a,b)=>a+b,0))*60;
  const clock=host.querySelector('[data-ws-time]'),start=host.querySelector('[data-ws-timer="start"]'),reset=host.querySelector('[data-ws-timer="reset"]');
  const paint=()=>{
   const shown=s.running?Math.max(0,Math.ceil((s.ends-performance.now())/1000)):s.sec;
   clock.textContent=displayClock(shown);
   start.textContent=s.running?'Ⅱ Pausar':'▶ '+(shown<total?'Retomar':'Iniciar');
   clock.classList.toggle('pit-ws-time-over',!shown);
  };
  const tick=()=>{if(s.running){s.sec=Math.max(0,Math.ceil((s.ends-performance.now())/1000));if(!s.sec){clearInterval(s.timer);s.timer=null;s.running=false}}if(clock.isConnected)paint()};
  if(s.timer)clearInterval(s.timer);
  if(s.running)s.timer=setInterval(tick,250);
  start.addEventListener('click',()=>{if(s.running){s.sec=Math.max(0,Math.ceil((s.ends-performance.now())/1000));s.running=false;clearInterval(s.timer);s.timer=null}else if(s.sec){s.running=true;s.ends=performance.now()+s.sec*1000;s.timer=setInterval(tick,250)}paint()});
  reset.addEventListener('click',()=>{clearInterval(s.timer);s.timer=null;s.running=false;s.sec=total;paint()});paint();
 }
 if(slide.checklist){
  const s=stateFor(m),progress=host.querySelector('[data-ws-check-progress]');
  host.querySelectorAll('[data-ws-check]').forEach(c=>c.addEventListener('change',()=>{const i=Number(c.dataset.wsCheck);if(c.checked)s.marks.add(i);else s.marks.delete(i);progress.textContent=s.marks.size+' / 4 conferidos'}));
 }
}
window.PIT_PROJECTOR_UNIVERSAL={...legacy,build,mount};
window.PIT_WORKSHOP_CURRICULUM=Object.freeze({lessons,TIME,stopAll});
})();
/* PIT Game Jam IA — oficina guiada M02–M10: 7 telas por missão.
   Fonte pedagógica: v2/missions.js + fichas oficiais do Caderno do Aluno v3.
   Não altera entregas, estado da turma, liberações ou lógica do caderno.
   Apresentação antiga acessível com ?aula=detalhada.
 */
(function(){
'use strict';
const base=window.PIT_PROJECTOR_UNIVERSAL;
if(!base)return;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MID=n=>String(n).padStart(2,'0');
const M={
2:{time:[1,3,3,4,5,12,2],intro:'Seu universo pode ser imenso. Seu primeiro jogo precisa ser possível.',concepts:[
['MVP','A menor versão que já permite jogar e testar a ideia, sem todos os extras.'],
['Escopo','O limite que você escolhe para não transformar um jogo de seis horas em um projeto de meses.'],
['Mecânica central','A única interação indispensável do primeiro protótipo.'],
['Teste observável','Um resultado que outra pessoa consegue verificar ao jogar.']],
flow:[['IDEIA','Imagine o jogo completo'],['RECORTE','Escolha uma cena curta'],['NÚCLEO','Três elementos + uma mecânica'],['TESTE','Descreva quando funciona']],
scenario:['Qual dos dois planos realmente cabe na oficina?',
 ['10 mundos, 25 inimigos e 6 sistemas de progressão','Escopo excessivo. Não haverá tempo para testar o jogo básico.',false],
 ['Uma sala, um personagem, uma chave e uma saída','MVP testável: uma cena, mecânica e condição de conclusão.',true]],
explore:['Leia o exemplo de MVP no seu Caderno do Aluno.','Explore as ideias de cena e mecânica já sugeridas.','Compare a ideia gigante com a versão possível hoje.','Preencha a ficha sem abrir o GDevelop nesta etapa.'],
work:['Descrever uma cena ou percurso curto.','Escolher UMA mecânica central.','Selecionar exatamente três elementos indispensáveis.','Escrever um teste DADO / QUANDO / ENTÃO e marcar o que fica para depois.'],
verify:['Cena ou percurso curto delimitado.','Uma mecânica e exatamente três elementos.','Teste observável e extras adiados registrados.'],
deliver:'Ficha do MVP: cena, mecânica, três elementos, teste e itens adiados (opcional).',depth:'MVP não é uma maquete sem funcionamento: ele executa a ação essencial e oferece evidência de que a regra funciona. A palavra “mínimo” se refere ao escopo, não à qualidade do que foi testado.',hint:'O estudante planeja o MVP; ele abrirá o motor de jogos na Missão 03.'},
3:{time:[1,3,3,4,7,10,2],intro:'Seu projeto ganha um lugar para existir — e uma primeira execução.',concepts:[
['Engine','Motor que organiza cenas, objetos, eventos, execução e exportação de jogos.'],
['Cena','Uma tela ou ambiente onde o jogo acontece.'],
['Objeto','Uma instância visual, como personagem, moeda, caixa 3D ou porta.'],
['Preview','Execução de teste que mostra o que realmente aparece no jogo.']],
flow:[['PROJETO','Criar ou abrir jogo'],['CENA','Localizar cena inicial'],['OBJETO','Inserir um asset próprio'],['PREVIEW','Executar, observar e salvar']],
scenario:['O projeto foi criado, mas a tela de Preview está vazia. O que verificar?',
 ['Se a cena tem um objeto visível e está realmente aberta','Certo. Uma cena sem objeto visível pode executar e continuar vazia.',true],
 ['Trocar o nome do jogo várias vezes','O título não adiciona objetos nem altera a cena em execução.',false]],
explore:['Leia “Ligar o Motor” no Caderno e conheça as partes da interface.','Acompanhe o tutorial inicial de GDevelop do próprio caderno.','Crie projeto, localize cena/objetos e escolha um asset 2D ou 3D.','Execute Preview e confira onde o projeto foi salvo.'],
work:['Criar um projeto com nome real no GDevelop.','Adicionar uma cena inicial e pelo menos um objeto.','Abrir o Preview e descrever o resultado observado.','Salvar e registrar nome do projeto, cena, objeto, origem do asset e local.'],
verify:['Projeto, cena e objeto identificáveis.','Preview realmente executado e descrito.','Projeto salvo, com origem do recurso registrada.'],
deliver:'Registro real do projeto, da cena, de um objeto, do Preview e do local salvo.',depth:'Uma cena pode ter vários objetos; inserir um modelo não cria sozinho controle, física ou condição de vitória. O Preview é um teste observável — não basta marcar uma caixa dizendo que abriu.',hint:'No GDevelop: projeto → cena → lista de objetos → Preview. Uma cena simples basta.'},
4:{time:[1,4,3,5,9,25,3],intro:'A primeira diferença entre uma imagem e um jogo: o mundo responde ao jogador.',concepts:[
['Entrada','Tecla, toque ou clique que representa a intenção do jogador.'],
['Comportamento','Componente do GDevelop que implementa movimento ou interação.'],
['Coordenadas','Posição e direção usadas para mover objetos 2D ou 3D.'],
['Limite','Parede, chão, obstáculo ou restrição que impede uma ação inválida.']],
flow:[['COMANDO','Pressionar tecla ou toque'],['MOVIMENTO','Objeto muda de posição'],['LIMITE','Colisão impede atravessar'],['RETESTE','Repetir e observar o Preview']],
scenario:['O personagem se move, mas atravessa a parede. O que ainda falta?',
 ['Só aumentar a velocidade','Atravessar continua possível; velocidade não é uma colisão.',false],
 ['Configurar obstáculo/colisão e repetir o teste','Correto: movimento e limite físico são condições diferentes.',true]],
explore:['Leia “Primeiro Jogável” no Caderno do Aluno.','Escolha a rota 2D ou 3D adequada ao seu projeto.','Siga o tutorial guiado de movimento e limites no GDevelop.','Execute Preview para conferir comando, resposta e obstáculo.'],
work:['Adicionar um controle real ao personagem ou objeto.','Garantir uma resposta visível ao comando no Preview.','Criar e testar pelo menos um limite ou obstáculo.','Repetir o teste e registrar comando, resultado, limite e local salvo.'],
verify:['Comando e resposta observados no Preview.','Obstáculo ou limite impede a ação indevida.','Reteste documentado e projeto atualizado salvo.'],
deliver:'Preview de movimento controlável, limite testado e relatório do comportamento.',depth:'Movimento é uma mudança de estado controlada pelo jogador. Em 2D, colisão e comportamento de plataforma/top-down podem resolver muito; em 3D, a câmera e a física exigem outra configuração. Não substitua física 3D por evento 2D arbitrário.',hint:'Se o modelo não se move, confira o comportamento e a cena; se atravessa, confira colisão e limite.'},
5:{time:[1,3,3,5,7,18,3],intro:'Agora seu mundo aprende uma regra: SE acontecer algo, ENTÃO responda.',concepts:[
['Evento','Conjunto de condições e ações que o GDevelop executa.'],
['Condição','Teste lógico: verdadeiro ou falso. Ex.: jogador tocou no item?'],
['Ação','O que acontece quando a condição é atendida.'],
['Variável','Informação persistida, como Score, Energia ou TemChave.']],
flow:[['SE','Detectar coleta, tecla ou contato'],['ENTÃO','Alterar um objeto ou variável'],['FEEDBACK','Mostrar nova pontuação ou estado'],['REPETIR','Testar cenário positivo e negativo']],
scenario:['Uma moeda dá 10 pontos sempre que o jogador permanece em contato. Como corrigir?',
 ['Consumir/remover a moeda ou impedir acionamento repetido','Evita pontuação múltipla pelo mesmo objeto e permite reteste.',true],
 ['Aumentar a fonte do placar','A aparência muda, mas o erro de pontuação persiste.',false]],
explore:['Leia sobre condição, ação e variável no seu caderno.','Veja o tutorial do editor de eventos e escolha sua rota.','Monte um evento SE/ENTÃO com feedback claro.','Teste quando a condição ocorre e quando NÃO ocorre.'],
work:['Criar condição e ação no projeto real.','Usar uma variável ou estado observável.','Conferir o resultado positivo e o negativo no Preview.','Registrar nome da variável, feedback, resultado e projeto salvo.'],
verify:['Condição SE e ação ENTÃO configuradas.','Variável/feedback mudam apenas quando deveriam.','Teste verdadeiro, falso e projeto atualizado documentados.'],
deliver:'Evidência real de um evento SE/ENTÃO, variável, feedback e dois testes.',depth:'Uma condição avalia um estado lógico. Uma ação pode modificar variáveis, destruir um objeto ou mudar de cena. Um bom teste negativo garante que a regra não dispara fora da condição.',hint:'Use somente uma mecânica: pontuação, chave/porta, clique ou outra que faça sentido para seu jogo.'},
6:{time:[1,3,4,5,9,20,3],intro:'Seu jogo precisa de um recurso que faça sentido — não de vinte ferramentas de IA.',concepts:[
['Asset','Recurso de jogo: imagem, som, vídeo, modelo 3D ou animação.'],
['Formato','Extensão compatível com o uso: PNG, WAV/OGG, GLB etc.'],
['Autoria e licença','Origem e permissão para usar e redistribuir o recurso.'],
['Integração','Importar não basta: o asset precisa aparecer ou funcionar no Preview.']],
flow:[['NECESSIDADE','Escolher uma lacuna do jogo'],['ORIGEM','Criar ou buscar 1 recurso'],['IMPORTAÇÃO','Validar formato e inserir'],['VERIFICAÇÃO','Comparar antes e depois no Preview']],
scenario:['Você baixou dez modelos 3D, mas nenhum aparece no Preview. A missão foi concluída?',
 ['Sim, porque dez downloads valem mais que um teste','Não. Downloads não provam integração no seu jogo.',false],
 ['Não; importar um recurso compatível e verificar no Preview','Correto. Um asset utilizável e comprovado cumpre o objetivo.',true]],
explore:['Leia as opções de ferramentas gratuitas no Caderno do Aluno.','Explore a Biblioteca Arcana e o tutorial de importação.','Escolha UMA necessidade e confira formato e licença.','Faça a importação e teste antes/depois e uma possível falha.'],
work:['Escolher apenas um asset necessário ao seu jogo.','Registrar arquivo, formato, origem e licença/autoria.','Importar e fazer o recurso aparecer ou funcionar no Preview.','Registrar antes, depois, incompatibilidade testada e projeto salvo.'],
verify:['Um asset adequado foi obtido com origem/licença.','O recurso integra o jogo e aparece no Preview.','Antes/depois, falha testada e projeto salvos documentados.'],
deliver:'Registro de um único asset integrado, sua procedência e testes observáveis.',depth:'Uma imagem pode precisar de fundo transparente; um modelo 3D normalmente precisa de GLB no GDevelop; sons precisam de formato compatível. Use o gerador de IA ou a biblioteca aberta respeitando licença e restrições.',hint:'Não acumule recursos: um arquivo que funciona é melhor que dez downloads sem integração.'},
7:{time:[1,3,4,6,9,24,3],intro:'Todo jogo precisa de começo, desafio e final.',concepts:[
['Estado inicial','Condição em que a partida começa, com jogador e objetivos preparados.'],
['Desafio','Obstáculo ou meta que exige ação real do jogador.'],
['Vitória','Condição verificável que conclui a partida.'],
['Reinício','Capacidade de repetir a experiência sem preservar estado incorreto.']],
flow:[['COMEÇO','Posicionar jogador e metas'],['DESAFIO','Executar a mecânica central'],['CONDIÇÃO','Validar requisito de término'],['FINAL','Feedback, cena de vitória ou reinício']],
scenario:['A tela diz “vitória” ao abrir, antes de qualquer ação. O ciclo está completo?',
 ['Não; a vitória depende de uma condição jogável','Correto. O final deve ser conquistado a partir do estado inicial.',true],
 ['Sim; qualquer tela de vitória conta como jogo completo','Uma mensagem sem condição não demonstra gameplay.',false]],
explore:['Leia o material de começo, desafio e condição de final.','Explore o tutorial 2D ou 3D adequado ao projeto.','Configure a condição real de conclusão no GDevelop.','Execute teste cedo demais, teste de vitória e reinício.'],
work:['Definir estado inicial e desafio principal.','Implementar evento que permite concluir a partida.','Mostrar feedback ou cena final no Preview.','Testar vitória antecipada, repetição e salvar projeto editável.'],
verify:['O jogo começa num estado coerente.','Um desafio e uma condição real levam à vitória.','Testes negativo/reinício e projeto salvo registrados.'],
deliver:'Protótipo demonstrável com começo, desafio e fim, incluindo testes.',depth:'Uma máquina de estados simples possui início, jogando e concluído. Eventos devem preservar transições coerentes e impedir vitória antecipada. O objetivo é completar o núcleo do jogo, não aumentar sua complexidade.',hint:'Comprove que o jogo termina sem que o professor precise editar o projeto.'},
8:{time:[1,3,4,5,7,17,3],intro:'Polimento é fazer o jogador compreender e reagir.',concepts:[
['UX','Experiência de quem joga: entender controles, objetivos e resultados.'],
['HUD','Informações visíveis, como vida, pontuação, objetivo ou indicador.'],
['Feedback','Resposta visual/sonora que informa o efeito de uma ação.'],
['Antes/depois','Comparação concreta entre um problema e a melhoria implementada.']],
flow:[['OBSERVE','Identifique uma dúvida real'],['ESCOLHA','Priorize uma melhoria'],['IMPLEMENTE','Altere o projeto no GDevelop'],['COMPARE','Teste o antes e depois no Preview']],
scenario:['O jogador não percebe que pegou a chave. Qual melhoria ajuda?',
 ['Mostrar chave coletada, som ou mudança visível do HUD','Sinalização imediata confirma que a ação produziu efeito.',true],
 ['Colocar dez partículas sem informar a coleta','Mais efeitos podem confundir sem melhorar a informação.',false]],
explore:['Leia o conceito de feedback e interface no caderno.','Explore o exemplo antes/depois do tutorial.','Escolha uma única melhoria de usabilidade do seu próprio jogo.','Compare o Preview antes, depois e em um caso negativo.'],
work:['Identificar uma dúvida real do jogador.','Melhorar HUD, instrução, sinalização ou feedback.','Comparar mudança observável no Preview.','Registrar teste negativo, alteração e projeto salvo.'],
verify:['Problema de UX identificável.','Uma melhoria foi implementada no jogo real.','Comparação antes/depois, reteste e salvamento registrados.'],
deliver:'Relatório de uma melhoria de UX com antes/depois e teste real.',depth:'Polimento funcional ajuda o jogador a compreender o que pode fazer e o efeito de suas ações. Mais animações não significam automaticamente melhor UX. Priorize clareza sobre efeitos decorativos.',hint:'Não reinvente o jogo: melhore uma coisa que atrapalha o entendimento.'},
9:{time:[1,2,2,3,4,10,3],intro:'O próximo jogador revela problemas que o autor deixou de enxergar.',concepts:[
['Playtest','Observar outra pessoa jogando o protótipo real.'],
['Hipótese','Afirmação que você quer verificar: ela encontra a saída sozinha?'],
['Observação','O que o colega fez de fato — sem inventar dados.'],
['Backlog','Problema registrado para corrigir agora ou depois.']],
flow:[['PREPARO','Definir tarefa e resultado esperado'],['TROCA','Colega joga sem ajuda constante'],['REGISTRO','Observar e reproduzir dificuldade'],['DECISÃO','Corrigir ou priorizar para depois']],
scenario:['Um colega não encontrou a saída. Como registrar?',
 ['“Jogo difícil”, sem explicar a ocorrência','É genérico demais para reproduzir ou corrigir.',false],
 ['Descrever tarefa, comportamento observado e passos de reprodução','O registro permite decidir se corrige agora ou no backlog.',true]],
explore:['Leia o roteiro de teste em dupla no Caderno do Aluno.','Combine uma tarefa simples e um resultado esperado.','Troque os jogos com um colega; não dê a resposta durante o teste.','Observe e registre fatos antes de decidir como corrigir.'],
work:['Identificar testador anonimamente (ex.: Colega A).','Registrar hipótese, tarefa e resultado esperado.','Anotar observação real, passos de reprodução e impacto.','Escolher correção pequena ou backlog e registrar projeto testado.'],
verify:['O teste foi realizado com outra pessoa.','Observação e reprodução foram registradas.','Correção ou backlog foi decidido e justificado.'],
deliver:'Relatório de playtest em dupla com observação verdadeira e decisão.',depth:'Teste de usabilidade não é perguntar se o colega gostou; é observar se ele consegue realizar uma tarefa sem instruções adicionais. Um relato útil distingue resultado esperado, observado e passos de reprodução.',hint:'Não invente teste nem use nomes completos do colega; registre observação real.'},
10:{time:[1,2,2,4,4,12,5],intro:'Seu jogo merece uma demonstração — e um caminho real para ser jogado.',concepts:[
['Build/projeto','Versão editável salva, com cenas e recursos necessários.'],
['Publicação','Disponibilizar jogo, link ou exportação que possa ser acessada.'],
['Pitch','Apresentação curta que explica a proposta e mostra a mecânica.'],
['Limitação','O que não ficou pronto e o que entraria numa próxima versão.']],
flow:[['SALVAR','Conferir projeto e assets'],['ACESSO','Escolher web, GDevelop ou local'],['DEMO','Mostrar mecânica e vitória'],['PITCH','Apresentar aprendizados e próximo passo']],
scenario:['A exportação web falhou, mas o jogo roda no Preview e está salvo. E agora?',
 ['Apagar o projeto e declarar que nada foi concluído','Não. Preserve os arquivos e mostre a versão jogável disponível.',false],
 ['Entregar projeto editável e Preview demonstrável, explicando a limitação','Caminho válido: o caderno admite projeto/Preview quando publicação não for possível.',true]],
explore:['Leia a preparação para a Game Expo no Caderno do Aluno.','Explore as rotas de entrega: local, web ou projeto GDevelop.','Garanta que o professor consiga acessar a versão jogável.','Prepare uma demonstração breve e seu pitch.'],
work:['Salvar projeto e todos os recursos editáveis.','Definir e testar como o professor acessará o jogo.','Demonstrar mecânica, condição final e aprendizado do playtest.','Registrar limitação, próximo incremento e preparar fala de até dois minutos.'],
verify:['Projeto/arquivos preservados e acessíveis.','Jogo demonstrável ou publicado com instruções de acesso.','Pitch, playtest e próximo incremento registrados.'],
deliver:'Ficha de lançamento: projeto/URL ou Preview, acesso e apresentação final.',depth:'Publicar na web depende das opções e limites de hospedagem. A evidência honesta pode ser uma versão editável com Preview demonstrável. Uma boa demonstração apresenta objetivo, ação principal, condição final e próximo passo.',hint:'Não prometa uma URL que não existe: registre a forma de acesso que você realmente testou.'}
};
const deepState={};const clocks={};
const shot=(m,k,title,html,opts={})=>({section:opts.section||'MISSÃO '+MID(m)+' · '+k,title,html:'<section class="pit-m01-deck pit-workshop-deck pit-ws-all" data-ws-mission="'+m+'">'+html+'</section>',...opts});
const eyebrow=s=>'<div class="pit-m01-kicker">'+esc(s)+'</div>';
const lead=s=>'<p class="pit-ws-lead">'+esc(s)+'</p>';
const cardGrid=(a,cls='pit-ws-concepts')=>'<div class="'+cls+'">'+a.map((row,i)=>'<article class="pit-ws-concept"><span>'+MID(i+1)+' · '+esc(row[0])+'</span><h3>'+esc(row[0])+'</h3><p>'+esc(row[1])+'</p></article>').join('')+'</div>';
const menu=(m,kind)=>'<button type="button" class="pit-ws-depth-trigger" data-pit-ws-depth="'+kind+'" data-pit-ws-m="'+m+'">✧ '+(kind==='tutorial'?'Orientações e tutorial completo':'Aprofundar conceito')+' ↗</button>';
const sections=[
'ABERTURA CINEMATOGRÁFICA','CONCEITOS','COMPREENDER A LÓGICA','EXEMPLO INTERATIVO','LER E EXPLORAR','MODO OFICINA','VERIFICAR E ENTREGAR'
];
const conceptual=M=>M.concepts.map((x,i)=>'<article><small>CONCEITO '+MID(i+1)+'</small><h3>'+esc(x[0])+'</h3><p>'+esc(x[1])+'</p></article>').join('');
function build(n){
 if(!(n in M))return base.build(n);
 if(new URLSearchParams(location.search).get('aula')==='detalhada')return base.build(n);
 const data=M[n],mission=window.PIT_MISSIONS?.[n-1]||{};
 const time=data.time,goal=mission.goal||'Construir um jogo e comprovar o resultado.';
 const code=MID(n);
 const slides=[];
 slides.push(shot(n,'ABERTURA · '+time[0]+' MIN',mission.title||'Missão '+code,
  eyebrow('MISSÃO '+code+' · '+esc(mission.title||'')+' · '+mission.minutes+' MINUTOS')+
  '<div class="pit-m01-cover pit-ws-cover"><div class="pit-ws-cover-copy"><h2>'+esc(data.intro)+'</h2><p>'+esc(goal)+'</p>'+
  '<div class="pit-m01-chips"><span>'+mission.minutes+' MIN</span><span>LEITURA</span><span>CRIAÇÃO</span><span>COMPROVAÇÃO</span></div></div>'+
  '<div class="pit-u-cinema-panel" aria-hidden="true"><img class="pit-cinema-poster" src="./v3/assets/missions/missao-'+code+'.webp" alt="" loading="eager"><video class="pit-cinema-film" muted loop playsinline preload="metadata" src="./v3/assets/missions/missao-'+code+'-motion.mp4" poster="./v3/assets/missions/missao-'+code+'.webp"></video>'+
  '<div class="pit-u-cinema-glaze"></div><div class="pit-u-cinema-label"><span>CAPÍTULO '+code+'</span><strong>'+esc(mission.title||'')+'</strong></div></div></div>',
  {section:'ABERTURA · '+time[0]+' MIN',workshop:true}));
 slides.push(shot(n,'CONCEITOS · '+time[1]+' MIN','Para entender antes de fazer',
  eyebrow('FUNDAMENTOS · '+esc(mission.title||'')+ ' · '+time[1]+' MIN')+
  lead('Esses conceitos explicam as decisões que você tomará no seu próprio jogo. Não é necessário decorar: observe como se aplicam à missão.')+
  cardGrid(data.concepts)+
  '<div class="pit-ws-bottom"><strong>OBJETIVO DA MISSÃO:</strong> '+esc(goal)+menu(n,'concept')+'</div>',
  {section:'CONCEITOS · '+time[1]+' MIN'}));
 slides.push(shot(n,'MODELO · '+time[2]+' MIN','Da ideia à ação do aluno',
  eyebrow('ENTENDA O CAMINHO · '+time[2]+' MIN')+
  lead('Siga os quatro momentos. Cada passo prepara a evidência que será registrada no Caderno do Aluno.')+
  '<div class="pit-ws-flow">'+data.flow.map((r,i)=>'<div class="pit-ws-flow-node"><span>'+MID(i+1)+'</span><h3>'+esc(r[0])+'</h3><p>'+esc(r[1])+'</p></div>'+(i<3?'<b aria-hidden="true">›</b>':'')).join('')+'</div>'+
  '<div class="pit-ws-bottom"><strong>POR QUE ISSO IMPORTA?</strong> '+esc(data.depth)+menu(n,'concept')+'</div>',
  {section:'CONCEITOS · '+time[2]+' MIN'}));
 const choices=data.scenario;
 slides.push(shot(n,'EXPERIMENTO · '+time[3]+' MIN','Escolha uma solução e veja a consequência',
  eyebrow('EXEMPLO INTERATIVO · '+time[3]+' MIN')+
  lead(choices[0])+
  '<div class="pit-ws-choice-grid">'+choices.slice(1).map((row,i)=>'<button type="button" class="pit-ws-choice" data-pit-ws-choice="'+i+'" aria-pressed="false"><span>OPÇÃO '+(i===0?'A':'B')+'</span><strong>'+esc(row[0])+'</strong></button>').join('')+'</div>'+
  '<div class="pit-ws-choice-answer" role="status" aria-live="polite" data-pit-ws-result>Escolha uma alternativa. Observe o resultado e justifique sua decisão.</div>'+
  '<div class="pit-ws-bottom"><strong>NÃO É O JOGO DO ALUNO:</strong> este exemplo explica o conceito; cada aluno aplica a ideia ao próprio projeto.</div>',
  {section:'EXEMPLO · '+time[3]+' MIN',choice:true}));
 slides.push(shot(n,'LEITURA/TUTORIAL · '+time[4]+' MIN','Abra o Caderno: ler, explorar, experimentar',
  eyebrow('TEMPO RESERVADO NO MATERIAL DO ALUNO · '+time[4]+' MIN')+
  lead('Não é necessário correr para a programação. O estudante lê o conteúdo, explora as opções e usa o tutorial que já está no seu caderno.')+
  '<div class="pit-ws-read-grid"><div class="pit-ws-read-list">'+data.explore.map((x,i)=>'<div class="pit-ws-read-step"><b>'+MID(i+1)+'</b><p>'+esc(x)+'</p></div>').join('')+'</div>'+
  '<div class="pit-ws-read-aside"><span>ESTAÇÃO DE APRENDIZAGEM</span><strong>'+time[4]+' minutos</strong>'+
  '<p>O material de cada missão inclui instruções, exemplos e, nas missões de construção, tutoriais do GDevelop. Use esse tempo para ler e seguir os passos no próprio ritmo.</p>'+
  '<a href="./aluno-v3.html" target="_blank" rel="noopener noreferrer">Abrir Caderno do Aluno ↗</a>'+
  '<button type="button" data-pit-ws-depth="tutorial" data-pit-ws-m="'+n+'">✧ Ver orientações detalhadas</button></div></div>',
  {section:'LEITURA E EXPLORAÇÃO · '+time[4]+' MIN'}));
 slides.push(shot(n,'OFICINA · '+time[5]+' MIN','Agora crie no seu projeto',
  eyebrow('TRABALHO AUTORAL · '+time[5]+' MIN')+
  '<div class="pit-ws-practice"><div class="pit-ws-worksheet"><h3>O que fazer nesta missão</h3><div class="pit-ws-task-steps">'+data.work.map((x,i)=>'<div class="pit-ws-task-step"><b>'+MID(i+1)+'</b><p>'+esc(x)+'</p></div>').join('')+'</div></div>'+
  '<aside class="pit-ws-task"><div class="pit-ws-task-top">⏳ TEMPO PARA FAZER</div><div class="pit-ws-timer" data-pit-ws-time>'+String(time[5]).padStart(2,'0')+':00</div>'+
  '<div class="pit-ws-timer-controls"><button type="button" data-pit-ws-clock="toggle">▶ Iniciar</button><button type="button" data-pit-ws-clock="reset">↺ Reiniciar</button></div>'+
  '<p>'+esc(data.hint)+'</p><div class="pit-ws-task-tiny">Você pode deixar esta tela projetada enquanto a turma trabalha. O cronômetro é opcional e funciona só nesta apresentação.</div></aside></div>',
  {section:'OFICINA · '+time[5]+' MIN',workshop:true,clock:true}));
 const checks= data.verify;
 slides.push(shot(n,'EVIDÊNCIA · '+time[6]+' MIN','O que deve estar pronto antes de enviar?',
  eyebrow('CHECKLIST ALINHADO AO CADERNO DO ALUNO · '+time[6]+' MIN')+
  lead('Marque cada item somente se você realmente realizou ou registrou a etapa no seu projeto/ficha. Não basta assistir à demonstração.')+
  '<div class="pit-ws-final-checks">'+checks.map((x,i)=>'<label class="pit-ws-final-check"><input type="checkbox" data-pit-ws-check="'+i+'"><span><b>'+MID(i+1)+'</b><strong>'+esc(x)+'</strong></span></label>').join('')+'</div>'+
  '<div class="pit-ws-final-deliver"><div><small>ENTREGA DA MISSÃO '+code+'</small><strong>'+esc(data.deliver)+'</strong>'+
  '<p>Depois de completar e revisar a ficha de evidência no seu Caderno do Aluno, use “Enviar ao professor” quando estiver disponível. Rascunho não é envio.</p></div><div data-pit-ws-complete aria-live="polite">0 de 3 itens conferidos</div></div>',
  {section:'VALIDAÇÃO · '+time[6]+' MIN',verify:true}));
 return slides;
}
function clockFor(n,duration){let c=clocks[n];if(!c)clocks[n]=c={remaining:duration,until:0,running:false,tick:null,original:duration};return c}
function stopClock(c){
 if(!c||!c.tick)return;
 c.remaining=Math.max(0,Math.ceil((c.until-performance.now())/1000));
 clearInterval(c.tick);c.tick=null;c.running=false;
}
function mount(root,slide){
 // The projector replaces slide HTML on navigation; stop any clock tied to the previous slide.
 Object.values(clocks).forEach(stopClock);
 if(!root.querySelector('.pit-ws-all'))return base.mount(root,slide);
 const m=Number(root.querySelector('.pit-ws-all').dataset.wsMission);
 const data=M[m];if(!data)return;
 root.querySelectorAll('[data-pit-ws-choice]').forEach(b=>b.addEventListener('click',()=>{
  const idx=Number(b.dataset.pitWsChoice),answer=data.scenario[idx+1];
  root.querySelectorAll('[data-pit-ws-choice]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));
  const out=root.querySelector('[data-pit-ws-result]');
  out.textContent=(answer[2]?'✓ DECISÃO ADEQUADA. ':'↺ REPENSE SUA ESCOLHA. ')+answer[1];
  out.classList.toggle('pit-ws-correct',answer[2]);out.classList.toggle('pit-ws-incorrect',!answer[2]);
 }));
 root.querySelectorAll('[data-pit-ws-check]').forEach(el=>el.addEventListener('change',()=>{
  const count=root.querySelectorAll('[data-pit-ws-check]:checked').length;
  root.querySelector('[data-pit-ws-complete]').textContent=count+' de 3 itens conferidos';
 }));
 root.querySelectorAll('[data-pit-ws-depth]').forEach(b=>b.addEventListener('click',()=>details(root,data,b.dataset.pitWsDepth,b)));
 if(slide.clock){
  const seconds=data.time[5]*60,c=clockFor(m,seconds);
  const label=root.querySelector('[data-pit-ws-time]'),play=root.querySelector('[data-pit-ws-clock="toggle"]');
  const redraw=()=>{
   label.textContent=String(Math.floor(c.remaining/60)).padStart(2,'0')+':'+String(c.remaining%60).padStart(2,'0');
   label.classList.toggle('pit-ws-time-over',c.remaining===0);
   play.textContent=c.running?'Ⅱ Pausar':c.remaining<seconds?'▶ Retomar':'▶ Iniciar';
  };
  const tick=()=>{c.remaining=Math.max(0,Math.ceil((c.until-performance.now())/1000));if(!c.remaining)stopClock(c);redraw()};
  play.addEventListener('click',()=>{if(c.running)stopClock(c);else if(c.remaining){c.running=true;c.until=performance.now()+c.remaining*1000;c.tick=setInterval(tick,250)}redraw()});
  root.querySelector('[data-pit-ws-clock="reset"]').addEventListener('click',()=>{stopClock(c);c.remaining=seconds;redraw()});
  if(c.running){stopClock(c);}redraw();
 }
}
function details(root,data,mode,source){
 const isTutorial=mode==='tutorial';
 const modal=document.createElement('div');modal.className='pit-ws-depth-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',isTutorial?'Guia e tutorial da missão':'Aprofundamento da missão');
 const content=isTutorial?
  '<p>Os passos completos e exercícios correspondentes estão dentro do <strong>Caderno do Aluno</strong>. A sequência abaixo ajuda a acompanhar o trabalho sem fechar a apresentação.</p>'+
  '<div class="pit-ws-depth-grid">'+data.explore.map((v,i)=>'<article><h3>Etapa '+MID(i+1)+'</h3><p>'+esc(v)+'</p></article>').join('')+'</div>'+
  '<p class="pit-ws-depth-foot">O GDevelop fica em <a href="https://editor.gdevelop.io/" target="_blank" rel="noopener noreferrer">editor.gdevelop.io</a>. O professor também pode abrir o modo detalhado da apresentação, que preserva os tutoriais e simuladores existentes.</p>':
  '<p>'+esc(data.depth)+'</p><div class="pit-ws-depth-grid">'+conceptual(data)+'</div>';
 modal.innerHTML='<div class="pit-ws-depth-pane"><div class="pit-ws-depth-head"><div><small>✧ '+(isTutorial?'CONSULTA AO MATERIAL DO ALUNO':'CONTEÚDO ADICIONAL · OPCIONAL')+'</small><h2>'+(isTutorial?'Orientações para ler e explorar':'Entenda os fundamentos')+'</h2></div><button type="button" data-pit-depth-close>✕ Fechar</button></div><div class="pit-ws-depth-body">'+content+'</div></div>';
 root.appendChild(modal);
 const close=()=>{modal.remove();document.removeEventListener('keydown',escape,true);source.focus()};
 const escape=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}};
 modal.querySelector('[data-pit-depth-close]').addEventListener('click',close);
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 document.addEventListener('keydown',escape,true);
 modal.querySelector('[data-pit-depth-close]').focus();
}
document.addEventListener('click',event=>{
 if(event.target?.closest?.('#pitProjectorClose'))Object.values(clocks).forEach(stopClock);
});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden)Object.values(clocks).forEach(stopClock);
});
window.PIT_PROJECTOR_UNIVERSAL={...base,build,mount,originalBuild:base.build,workshopMissions:M};
})();
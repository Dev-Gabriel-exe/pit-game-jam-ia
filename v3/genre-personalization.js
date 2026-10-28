(function genreModule(){
 'use strict';
 // The chosen genre changes examples, not the academic objective or student submissions.
 const profiles={
  'Aventura':{
   title:'O Farol Perdido',hero:'Uma exploradora de ruínas',action:'Encontrar três pistas no templo',objective:'Abrir a passagem secreta',
   victory:'A exploradora alcança a saída com três pistas',feedback:'A porta se ilumina e surge “Passagem descoberta!”',
   scene:'um templo antigo',character:'exploradora',item:'pista',obstacle:'parede do templo',mechanic:'encontrar pistas',
   trigger:'reunir três pistas e alcançar a saída',signal:'porta iluminada',asset:'mapa antigo em PNG',
   test:'encontrar a primeira pista',improve:'indicar visualmente as pistas',control:'setas ou WASD',
   intro:'Explorar uma área pequena, descobrir pistas e encontrar uma saída.'
  },
  'RPG':{
   title:'A Guardiã dos Cristais',hero:'Uma aprendiz de guardiã',action:'Coletar três cristais mágicos',objective:'Libertar o portal da fortaleza',
   victory:'O portal abre quando três cristais são reunidos',feedback:'O portal acende e aparece “Guardião desperto!”',
   scene:'uma sala de masmorra',character:'guardiã',item:'cristal',obstacle:'muralha de pedra',mechanic:'coletar cristais',
   trigger:'obter três cristais e tocar o portal',signal:'contador 3/3 e portal brilhante',asset:'cristal mágico PNG',
   test:'perceber que os cristais liberam o portal',improve:'mostrar a contagem de cristais',control:'WASD ou setas',
   intro:'Explorar uma pequena masmorra, coletar cristais e liberar o portal.'
  },
  'Terror':{
   title:'A Ala Esquecida',hero:'Uma investigadora noturna',action:'Encontrar duas chaves sem ser vista',objective:'Escapar do hospital abandonado',
   victory:'A saída destranca com as duas chaves',feedback:'A luz de saída fica verde e surge “Você escapou!”',
   scene:'um corredor escuro',character:'investigadora',item:'chave',obstacle:'porta trancada',mechanic:'encontrar chaves',
   trigger:'obter duas chaves e alcançar a saída',signal:'porta destrancada',asset:'chave antiga em PNG',
   test:'entender as pistas que levam à saída',improve:'destacar objetos interativos',control:'setas ou WASD',
   intro:'Vasculhar um corredor, encontrar chaves e escapar da área.'
  },
  'Plataforma':{
   title:'Salto da Torre',hero:'Um mensageiro acrobata',action:'Saltar plataformas e coletar moedas',objective:'Alcançar o topo da torre',
   victory:'O personagem chega à bandeira final',feedback:'A bandeira anima e surge “Fase concluída!”',
   scene:'uma torre com três plataformas',character:'mensageiro',item:'moeda',obstacle:'espinho',mechanic:'saltar e atravessar plataformas',
   trigger:'encostar na bandeira ao final do percurso',signal:'animação da bandeira',asset:'personagem 2D em pose de salto',
   test:'saber quando e onde saltar',improve:'indicar o próximo salto seguro',control:'setas e espaço',
   intro:'Controlar saltos, superar obstáculos e alcançar uma bandeira.'
  },
  'Corrida':{
   title:'Circuito da Lua',hero:'Um piloto de kart',action:'Passar por três checkpoints',objective:'Cruzar a linha de chegada',
   victory:'O veículo cruza a chegada após três checkpoints',feedback:'O cronômetro para e aparece “Chegada!”',
   scene:'uma pista curta com curvas',character:'kart',item:'checkpoint',obstacle:'barreira da pista',mechanic:'passar checkpoints',
   trigger:'cruzar a linha final após três checkpoints',signal:'placar de checkpoints e mensagem final',asset:'kart visto de cima em PNG',
   test:'perceber o próximo checkpoint',improve:'colocar setas indicando a direção',control:'setas ou WASD',
   intro:'Controlar um veículo, passar checkpoints e cruzar a chegada.'
  },
  'Puzzle':{
   title:'O Cofre dos Símbolos',hero:'Uma pesquisadora de enigmas',action:'Ativar três símbolos na ordem correta',objective:'Abrir o cofre central',
   victory:'Três símbolos corretos abrem o cofre',feedback:'Os símbolos ficam verdes e o cofre acende',
   scene:'uma sala com três mecanismos',character:'cursor de seleção',item:'símbolo',obstacle:'painel bloqueado',
   mechanic:'acionar símbolos',trigger:'ativar três símbolos na sequência certa',signal:'luzes verdes e cofre aberto',
   asset:'símbolo rúnico transparente',test:'descobrir a ordem das interações',improve:'indicar os símbolos já acertados',
   control:'clique ou toque',intro:'Acionar mecanismos, identificar padrões e abrir um cofre.'
  },
  'Narrativa interativa':{
   title:'O Último Sinal',hero:'Uma operadora de rádio',action:'Escolher respostas em três conversas',objective:'Descobrir o código de segurança',
   victory:'Uma escolha correta revela o código e termina o diálogo',feedback:'A tela anuncia “Comunicação restabelecida!”',
   scene:'uma cabine de rádio',character:'operadora',item:'mensagem',obstacle:'resposta bloqueada',
   mechanic:'escolher opções de diálogo',trigger:'selecionar respostas que revelam o código',signal:'novo diálogo e tela final',
   asset:'retrato de personagem em PNG',test:'perceber que as escolhas mudam a conversa',improve:'destacar opções clicáveis',
   control:'clique ou toque',intro:'Fazer escolhas de diálogo, observar consequências e chegar a um desfecho.'
  },
  'Exploração':{
   title:'A Cartógrafa do Vale',hero:'Uma cartógrafa',action:'Descobrir três pontos do mapa',objective:'Revelar o caminho para o observatório',
   victory:'Os três locais são encontrados e o mapa revela o caminho',feedback:'O mapa ilumina a trilha e surge “Vale mapeado!”',
   scene:'um vale com trilhas curtas',character:'cartógrafa',item:'marco do mapa',obstacle:'rocha do caminho',
   mechanic:'localizar marcos no mapa',trigger:'encontrar três marcos e chegar ao observatório',signal:'trilha destacada no mapa',
   asset:'bússola desenhada em PNG',test:'entender para onde explorar primeiro',improve:'adicionar ícones de localização',
   control:'WASD ou setas',intro:'Percorrer um mapa, localizar três lugares e descobrir uma rota.'
  },
  'Outro':{
   title:'Meu Primeiro Desafio',hero:'Um personagem original',action:'Interagir com três objetos do cenário',objective:'Concluir o desafio principal',
   victory:'O objetivo é atingido e a fase termina',feedback:'Uma mensagem anuncia a conclusão',
   scene:'um cenário simples',character:'personagem',item:'objeto interativo',obstacle:'limite do cenário',
   mechanic:'interagir com objetos',trigger:'concluir a interação principal',signal:'mensagem de conclusão',
   asset:'objeto importante do jogo em PNG',test:'entender o objetivo sem ajuda',
   improve:'deixar o objetivo mais visível',control:'teclado, clique ou toque',
   intro:'Construir uma interação simples com começo, desafio e conclusão.'
  }
 };
 const genres=Object.keys(profiles);
 const norm=genre=>genres.includes(genre)?genre:'Outro';
 const profile=genre=>({...profiles[norm(genre)],genre:norm(genre)});
 const clean=x=>String(x==null?'':x).trim();
 function stage(n,genre,draft={}){
  const p=profile(genre);
  const title=clean(draft.title)||p.title;
  const hero=clean(draft.hero)||p.hero;
  const goal=clean(draft.objective)||p.objective;
  const action=clean(draft.action)||p.action;
  const ending=clean(draft.victory)||p.victory;
  const feedback=clean(draft.feedback)||p.feedback;
  const i=p.item,where=p.scene;
  const stages={
   1:{
    focus:`Em ${title}: ${p.intro}`,
    steps:[`Personagem possível: ${hero}.`,`Ação: ${action}.`,`Condição: ${ending}.`],
    evidence:`Meu jogo é de ${p.genre}: ${title}. O jogador precisa ${action.toLowerCase()} para ${goal.toLowerCase()}.`,
    support:'Use os exemplos como inspiração, nunca como respostas obrigatórias.'
   },
   2:{
    focus:`MVP de ${p.genre}: ${where}, ${p.character}, a mecânica ${p.mechanic} e uma condição final.`,
    steps:[`Uma cena pode ser ${where}, com ${p.character}.`,`Apenas a mecânica ${p.mechanic}; deixe extras para depois.`,`Critério de pronto: ${p.trigger}.`],
    evidence:`No MVP de ${title}, vou usar ${where}, a mecânica ${p.mechanic} e terminar quando ${p.trigger}.`,
    support:'O MVP demonstra a mecânica central antes de conteúdos adicionais.'
   },
   3:{
    focus:`Crie a cena inicial de ${title} com ${where} e um objeto representando ${p.character}.`,
    steps:[`Monte a cena inicial, por exemplo ${where}.`,`Adicione um objeto Sprite ou 3D para ${p.character}.`,`Abra o Preview e confirme se o cenário e objeto aparecem.`],
    evidence:`Criei o projeto ${title}, coloquei ${p.character} em ${where}, abri o Preview e salvei.`,
    support:`Não precisa programar ${p.trigger} nesta missão: o foco é a engine.`
   },
   4:{
    focus:`Teste ${p.control} para controlar ${p.character} e adicione um limite como ${p.obstacle}.`,
    steps:[`Escolha um controle simples: ${p.control}.`,`Teste movimento ou interação de ${p.character} no Preview.`,`Inclua limite ou obstáculo, como ${p.obstacle}, e teste.`],
    evidence:`Em ${title}, usei ${p.control} para controlar ${p.character} e testei ${p.obstacle} no Preview.`,
    support:'Em narrativas e puzzles, um clique com área interativa também pode ser a ação controlada.'
   },
   5:{
    focus:`Exemplo de regra: SE interagir com ${i}, ENTÃO atualizar estado e mostrar ${p.signal}.`,
    steps:[`Use como condição a interação com ${i}.`,`Crie uma ação que atualiza o objeto ou uma variável.`,`Teste a diferença entre ativar e não ativar a condição.`],
    evidence:`No jogo ${title}, implementei evento SE interagir com ${i}, ENTÃO atualizar estado, com ${p.signal}.`,
    support:'O evento precisa de uma condição; evite executar a ação sem controle a cada frame.'
   },
   6:{
    focus:`Asset para ${p.genre}: ${p.asset}, com uma função identificável no jogo.`,
    steps:[`Escolha um asset essencial, como ${p.asset}.`,`Obtenha PNG, GLB ou áudio conforme o objeto utilizado.`,`Importe e confira no Preview se aparece e funciona.`],
    evidence:`Para ${title}, produzi ou selecionei ${p.asset}, identifiquei a origem e testei a importação.`,
    support:'Se a ferramenta de IA não permitir exportação, use a biblioteca de apoio.'
   },
   7:{
    focus:`Final de ${title}: ${p.trigger}. A conclusão aparece como ${p.signal}.`,
    steps:[`Deixe claro o objetivo: ${goal}.`,`Implemente a condição: ${p.trigger}.`,`Teste o resultado com e sem a condição satisfeita.`],
    evidence:`No jogo ${title}, a conclusão acontece quando ${p.trigger}; o feedback é ${feedback}. Testei início e final.`,
    support:'Uma condição simples e demonstrável é suficiente para um primeiro jogo.'
   },
   8:{
    focus:`Melhoria útil em ${p.genre}: ${p.improve}. Explique o controle: ${p.control}.`,
    steps:[`Mostre na tela o controle (${p.control}) e o objetivo.`,`Adicione um feedback, por exemplo ${p.improve}.`,`Reabra o Preview e verifique clareza e estabilidade.`],
    evidence:`Em ${title}, expliquei o controle (${p.control}) e melhorei a experiência: ${p.improve}.`,
    support:'Uma mudança de texto, cor ou animação simples já pode ser um feedback adequado.'
   },
   9:{
    focus:`No playtest de ${title}, a outra pessoa consegue ${p.test} sem ajuda?`,
    steps:[`Deixe um colega testar ${title} sem explicar a solução.`,`Observe se consegue ${p.test}; registre o que aconteceu.`,`Aplique ou planeje uma correção concreta.`],
    evidence:`No playtest de ${title}, um colega tentou ${p.test}. Observei a dificuldade e fiz uma melhoria.`,
    support:'Descreva o que realmente aconteceu, sem inventar resultados do colega.'
   },
   10:{
    focus:`Pitch de ${p.genre}: “Criei ${title}; o jogador precisa ${action.toLowerCase()} para ${goal.toLowerCase()}”.`,
    steps:[`Salve uma versão demonstrável de ${title}.`,`Teste Preview ou link fora da sessão do autor.`,`Apresente objetivo, mecânica, uso da IA e melhoria futura.`],
    evidence:`Meu jogo ${title} é de ${p.genre}, com ${p.mechanic}. Demonstrei a condição ${ending} e registrei o Preview.`,
    support:'Um jogo pequeno que funcione é melhor que uma demo grande inacabada.'
   }
  };
  return {...(stages[n]||stages[1]),genre:p.genre,title,hero,selected:!!draft.genre,profile:p};
 }
 window.PIT_GENRE_CONTEXT={profile,stage,genres,norm};
})();
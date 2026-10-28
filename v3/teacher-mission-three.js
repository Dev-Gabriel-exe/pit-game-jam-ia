/* Missão 03 — Professor universitário, conteúdo autoexplicativo e projetável. */
(function(){
'use strict';
const phaseNames={briefing:'ESTRUTURA DA ENGINE',demo:'EDITOR ILUSTRADO',practice:'LABORATÓRIO DE CRIAÇÃO',review:'RESULTADOS VERIFICÁVEIS'};
const minutes=[5,5,18,2],phases=['briefing','demo','practice','review'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shell(phase,body){
 const i=Math.max(0,phases.indexOf(phase));
 return '<div class="tm3-root" data-tm3-phase="'+esc(phase)+'"><header class="tm3-mast">'+
 '<small>✦ PIT GAME JAM IA · ENGENHARIA DE JOGOS</small><div class="tm3-mast-main"><span class="tm3-roman">III</span><div>'+
 '<span>MISSÃO 03 / 10 · LIGAR O MOTOR</span><h2>Do plano ao primeiro Preview.</h2>'+
 '<p>Ambiente de desenvolvimento, cena, objetos, instâncias e execução.</p></div></div>'+
 '<div class="tm3-minutes">'+['CONCEITOS','DEMONSTRAÇÃO','CRIAÇÃO','RESULTADOS'].map((x,j)=>
 '<div class="'+(i===j?'selected':'')+'"><b>'+minutes[j]+' min</b><span>'+x+'</span></div>').join('')+'</div></header>'+
 '<section class="tm3-body"><div class="tm3-section-label"><span>◈ '+phaseNames[phase]+'</span><span>'+minutes[i]+' / 30 MIN</span></div>'+
 body+'</section><footer class="tm3-footer">PIT GAME JAM IA · MISSÃO 03 / 10 · PRIMEIRA EXECUÇÃO REAL</footer></div>';
}
const lead=(mark,title,desc)=>'<div class="tm3-lead" data-tm3-reveal><small>'+mark+'</small><h3>'+title+'</h3><p>'+desc+'</p></div>';
function concept(n,tag,name,meaning,caseStudy,detail=''){
 return '<article class="tm3-concept" data-tm3-reveal style="--tm3-stagger:'+((n%4)*90)+'ms"><div class="tm3-num">'+String(n).padStart(2,'0')+'</div>'+
 '<div><small>'+tag+'</small><h4>'+name+'</h4><p>'+meaning+'</p>'+
 '<div class="tm3-example"><strong>EXEMPLO TÉCNICO</strong><p>'+caseStudy+'</p></div>'+
 (detail?'<p class="tm3-fine">'+detail+'</p>':'')+'</div></article>';
}
function briefing(){
 return shell('briefing',lead('FUNDAMENTOS · ENGINE, OBJETOS E EXECUÇÃO','O GDevelop transforma uma especificação em software executável.',
 'O documento MVP da Missão 02 descreve o que o jogo deverá fazer. Nesta missão, criamos a primeira estrutura que pode ser aberta, editada, executada e recuperada. <strong>Um objeto visível no Preview já representa uma entrega técnica legítima</strong>: movimento e lógica serão implementados depois.')+
 '<div class="tm3-lead-art" data-tm3-reveal><div class="tm3-lead-pic"><span>CAPÍTULO III · O MOTOR</span></div>'+
 '<div class="tm3-model"><small>ARQUITETURA MÍNIMA</small><h4>Project → Scene → Objects → Instances → Preview</h4>'+
 '<div class="tm3-model-flow"><span>ARQUIVO DO JOGO</span><b>→</b><span>TELA</span><b>→</b><span>ELEMENTOS</span><b>→</b><span>CÓPIAS</span><b>→</b><span>EXECUÇÃO</span></div>'+
 '<p>A engine reúne edição visual e um runtime. O que é configurado no editor só se torna comportamento observável quando o jogo é executado no Preview.</p></div></div>'+
 '<div class="tm3-concepts">'+
 concept(1,'UNIDADE DE TRABALHO','Projeto × cena',
 'O <strong>projeto</strong> reúne cenas, recursos, variáveis e regras. A <strong>cena</strong> representa uma tela, nível ou ambiente e possui instâncias posicionadas em seu espaço.',
 'Projeto “Salto da Torre” → cena “TorreInicial”. Não é necessário criar dezenas de cenas.')+
 concept(2,'MODELO DE DADOS','Object × Instance',
 'Um <strong>Object</strong> é uma definição reutilizável, análoga à classe/molde. Uma <strong>Instance</strong> é sua ocorrência concreta na cena, com posição e propriedades próprias.',
 'Object “Moeda”: um único tipo. Instances: três moedas em X=200, 400 e 600. Criar o Object sem posicionar instância não garante que apareça no Preview.')+
 concept(3,'RECURSOS E TIPOS','Sprite, 3D Box e Assets',
 '<strong>Sprite</strong> apresenta uma imagem 2D ou animações. <strong>3D Box</strong> é um objeto tridimensional simples. O Asset Store fornece recursos prontos; um arquivo local também pode ser importado.',
 'Aventura: Sprite de exploradora. Corrida: kart visto de cima. Jogo 3D: uma caixa ou modelo 3D. O objetivo comum é visualizar a primeira instância.',
 'O formato 2D/3D muda o tipo de objeto e a câmera, mas não altera o conceito de projeto, cena e execução.')+
 concept(4,'CICLO DE DESENVOLVIMENTO','Editor × Preview × Persistência',
 'O <strong>editor</strong> modifica a definição do jogo; o <strong>Preview</strong> executa a cena e revela o resultado. <strong>Salvar</strong> preserva o projeto editável para continuar nas próximas missões. Esses estados não são equivalentes.',
 'Ver a personagem na área do editor não comprova que aparece na execução. Salvar um projeto não significa publicá-lo ou compartilhar um link jogável.',
 'O Preview pode ocorrer em nova janela. Em geral, começa pela cena aberta ou pela cena inicial configurada; confira qual está selecionada.')+
 '</div>'+
 '<div class="tm3-comparison" data-tm3-reveal><div><span>DEFINIÇÃO</span><strong>Objeto</strong><p>“Personagem” na lista Objects, com imagem e propriedades.</p></div>'+
 '<div><span>OCORRÊNCIA</span><strong>Instância</strong><p>“Personagem” colocado na posição (X, Y) dentro da cena.</p></div>'+
 '<div><span>EXECUÇÃO</span><strong>Preview</strong><p>A cena carregada no motor mostra o que realmente foi configurado.</p></div></div>'+
 '<div class="tm3-principle" data-tm3-reveal><strong>PRÉ-REQUISITOS DO LABORATÓRIO</strong><p>GDevelop acessível no computador ou navegador; permissões para abrir o Preview; salvamento local ou em nuvem disponível. Com a internet instável, o Asset Store pode falhar: um Sprite com imagem local ou um 3D Box nativo permite concluir a missão sem aguardar uma geração de IA.</p></div>'+
 '<div class="tm3-principle" data-tm3-reveal><strong>✓ O QUE JÁ DEVE FUNCIONAR AO FINAL</strong><p>Um projeto vazio criado, uma cena aberta e nomeada, um objeto visível na cena e no Preview, e o projeto salvo em um destino identificável. <b>O personagem ainda não precisa se mover.</b></p></div>');
}
function demo(){
 return shell('demo',lead('DEMONSTRAÇÃO VISUAL · 6 TELAS','O editor por dentro — sem abrir a documentação.',
 'O tutorial abaixo reúne capturas da interface do GDevelop, explicações traduzidas e um diagrama de apoio local. Cada etapa contém a ação, o resultado esperado e uma solução para o erro mais frequente.')+
 (window.PIT_GDEVELOP_FIRST_RUN?window.PIT_GDEVELOP_FIRST_RUN.render('teacher'):'<div class="tm3-principle">Projeto vazio → cena → objeto → instância → Preview → salvar.</div>'));
}
function practice(){
 return shell('practice',lead('OFICINA · 18 MINUTOS','Construção real do primeiro projeto.',
 'O documento da Missão 02 será implementado gradualmente. Nesta etapa, a meta é criar <strong>um objeto visível e testá-lo no Preview</strong>, usando um PNG, um recurso da biblioteca ou um 3D Box nativo. Não é obrigatório gerar arte com IA. O mesmo percurso admite projetos 2D e 3D; efeitos, música e cutscenes são extensões opcionais.')+
 '<details class="pit-private-teacher-notes"><summary title="Roteiro privado: abrir somente após retirar o espelhamento" aria-label="Abrir roteiro privado do professor">▤</summary><div class="pit-private-teacher-notes-body"><small>ROTEIRO PRIVADO · NÃO PROJETAR</small><h4>Acompanhar a prática da Missão 03</h4><p><b>Antes de abrir:</b> retire o espelhamento HDMI. O ícone de papel deve permanecer fechado enquanto a tela estiver projetada.</p><p><b>Primeiros 4 minutos:</b> confirme que os alunos abriram o GDevelop em outra aba ou no aplicativo e criaram um projeto vazio com cena nomeada conforme a Missão 02. <b>Próximos 8 minutos:</b> cada aluno escolhe um Sprite/PNG, item da biblioteca ou 3D Box; confira se criou o objeto e posicionou uma instância na cena. <b>Últimos 6 minutos:</b> peça o Preview real, a conferência visual do objeto e o salvamento em local recuperável.</p><p><b>Na ficha do aluno:</b> projeto, cena, objeto, origem do recurso, observação do Preview, local do salvamento e três confirmações manuais. O botão de revisão gera a ficha; o envio só ocorre após a liberação da prática. <b>Se travar:</b> objeto ausente no Preview geralmente exige verificar instância, cena aberta e câmera; se o Asset Store não carregar, use 3D Box ou PNG local. <b>Avalie:</b> objeto realmente visível no Preview e projeto recuperável; não exija movimento nesta missão nem trate a declaração como teste automático.</p></div></details>'+ 
 '<div class="tm3-lab-overview" data-tm3-reveal><div><span>ENTRADA</span><strong>Ficha do MVP</strong><small>Nome, cena e mecânica</small></div><b>→</b>'+
 '<div><span>CONSTRUÇÃO</span><strong>GDevelop</strong><small>Projeto, objeto e instância</small></div><b>→</b>'+
 '<div><span>SAÍDA</span><strong>Preview + fonte salva</strong><small>Resultado visível e recuperável</small></div></div>'+
 '<div class="tm3-practical-timing" data-tm3-reveal><span>04 MIN · PROJETO + CENA</span><span>08 MIN · ASSET + INSTÂNCIA</span><span>06 MIN · PREVIEW + SALVAR</span></div>'+ '<div class="tm3-labcards">'+
 [
  ['01','PROJETO E CENA','Criar projeto vazio e abrir uma cena.','Create/New project → Empty game. No Project manager, use a cena existente ou adicione uma nova; renomeie com nome significativo.','Projeto editável com uma cena inicial nomeada.','Se estiver vendo um template que já joga sozinho, abra um projeto vazio.'],
  ['02','ASSET, OBJETO E INSTÂNCIA','Obter um visual original, registrando sua origem.','Escolha um recurso do Asset Store ou tente gerar uma única imagem PNG no Gemini por até 2 minutos. Para 3D use 3D Box pronto. Em Objects → + crie Sprite/3D Box e posicione uma instância na cena.','Arquivo visual obtido; origem anotada; objeto e instância no editor.','Se a imagem demorar mais de 2 minutos, use imediatamente Asset Store/3D Box. Não aguarde vídeo, áudio ou geração 3D.'],
  ['03','PREVIEW E SALVAMENTO','Executar, observar, corrigir e persistir.','Clique Preview. Confira a presença da instância. Se não aparecer, volte ao editor, corrija e teste novamente. Salve e confirme onde o projeto ficou.','Objeto visível na execução; projeto local ou na nuvem identificado.','Não confunda salvar com publicar. Não feche a janela antes de confirmar o destino do projeto.']
 ].map(([num,title,desc,actions,result,help])=>'<article class="tm3-labcard" data-tm3-reveal><span>FRAGMENTO '+num+' / 03</span><h4>'+title+'</h4><p>'+desc+'</p>'+
 '<div><strong>NO EDITOR</strong><p>'+actions+'</p></div><div class="tm3-ok"><strong>✓ CONCLUÍDO QUANDO</strong><p>'+result+'</p></div>'+
 '<details><summary>Possível erro e recuperação</summary><p>'+help+'</p></details></article>').join('')+'</div>'+
 '<div class="tm3-asset-inset" data-tm3-reveal><strong>UMA IMAGEM OU UM ASSET PRONTO, NADA MAIS</strong><p>O aluno pode tentar criar UMA imagem no Gemini. Se a geração atrasar, deve usar o Asset Store do GDevelop ou uma 3D Box. Vídeos do Flow, música do Suno e vozes do ElevenLabs ficam para a Missão 06.</p></div>'+
 (window.PIT_ASSET_STUDIO?window.PIT_ASSET_STUDIO.render({title:'A Guardiã dos Cristais',genre:'RPG',hero:'Uma guardiã de cristais',scene:'masmorra com portal',objective:'liberar a saída'},'teacher'):'')+
 '<div class="tm3-paths" data-tm3-reveal><div><span>ROTA 2D</span><h4>Sprite e imagem</h4><p>Escolha um recurso da biblioteca ou um PNG local; adicione-o como Sprite e coloque sua instância na cena. O Preview deve exibir a imagem.</p></div>'+
 '<div><span>ROTA 3D</span><h4>3D Box ou modelo</h4><p>Crie uma caixa 3D simples ou selecione modelo pronto; coloque na cena e confira câmera e profundidade no Preview. Não é necessário importar um GLB nesta missão.</p></div></div>'+
 '<div class="tm3-principle" data-tm3-reveal><strong>RESULTADO DA MISSÃO 03</strong><p>Projeto e cena criados; primeiro objeto/instância visível no Preview; nome do projeto e local de salvamento registrados. A Missão 04 adicionará controle e interação — um personagem parado agora é um resultado válido.</p></div>');
}
function review(){
 return shell('review',lead('VERIFICAÇÃO DE APRENDIZAGEM','Projeto aberto, executado e salvo.',
 'A entrega só deve registrar resultados que o estudante verificou no GDevelop. Uma afirmação genérica como “deu certo” não permite distinguir erro de cena, objeto ou Preview.')+
 '<div class="tm3-checklist">'+
 [
  ['PROJETO','Nome e cena inicial informados; projeto salvo em local identificável.'],
  ['OBJETO E INSTÂNCIA','Tipo e nome do objeto indicados; ao menos uma instância realmente posicionada. Origem do asset (IA, biblioteca ou desenho próprio) registrada.'],
  ['PREVIEW','Descrição do que apareceu na janela de execução. Não basta ter visto a instância no editor.'],
  ['DIAGNÓSTICO','Se houve falha, registrar onde ocorreu e a correção; se não houve, declarar isso com precisão.']
 ].map(([tag,desc],i)=>'<article data-tm3-reveal><span>0'+(i+1)+'</span><div><strong>'+tag+'</strong><p>'+desc+'</p></div></article>').join('')+'</div>'+
 '<div class="tm3-comparison"><div><span>NÃO É PROVA SUFICIENTE</span><strong>“Consegui.”</strong><p>Não identifica o projeto, o objeto nem o resultado da execução.</p></div>'+
 '<div><span>REGISTRO VERIFICÁVEL</span><strong>“Preview exibiu Personagem.”</strong><p>O estudante informa cena inicial, objeto, o que observou e onde salvou o projeto.</p></div></div>'+
 '<div class="tm3-principle"><strong>PRÓXIMA MISSÃO: PRIMEIRO JOGÁVEL</strong><p>Um objeto estático ganhará controle e interação. O projeto salvo nesta etapa será a base obrigatória para continuar o desenvolvimento.</p></div>');
}
function render(phase){return phase==='demo'?demo():phase==='practice'?practice():phase==='review'?review():briefing()}
function mount(){
 const root=document.querySelector('.tm3-root');if(!root)return;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const reveals=[...root.querySelectorAll('[data-tm3-reveal]')];
 if(!reduced&&typeof IntersectionObserver!=='undefined'){
  root.classList.add('tm3-animation-enabled');
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('tm3-entered');io.unobserve(e.target)}}),{threshold:0.03,rootMargin:'0px 0px 60px 0px'});
  reveals.forEach(e=>io.observe(e));
 }else reveals.forEach(e=>e.classList.add('tm3-entered'));
 window.PIT_GDEVELOP_FIRST_RUN?.mount(root.querySelector('.gd3-root'));
 window.PIT_ASSET_STUDIO?.mount(root.querySelector('.ast3-root'),{title:'A Guardiã dos Cristais',genre:'RPG',hero:'Uma guardiã de cristais',scene:'masmorra com portal',objective:'liberar a saída'});
}
window.PIT_TEACHER_MISSION_THREE={render,mount,minutes:()=>minutes};
})();
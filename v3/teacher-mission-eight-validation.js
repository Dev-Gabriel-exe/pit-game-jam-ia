/* PIT Game Jam IA V3 · M08-04 · professor practice/review rubric.
 * Manual criteria only. No claim of real mobile, performance or GDevelop tests.
 */
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const rubric=[
{title:'PROBLEMA ANTES',question:'Qual dúvida do jogador foi observada antes da mudança?',accept:'Há uma interação reproduzível e uma dificuldade específica, não apenas gosto estético.'},
{title:'MELHORIA REAL',question:'O que mudou no GDevelop?',accept:'Texto, HUD, contraste, resposta ou mensagem de erro foi implementado na cena original, sem recomeçar o projeto.'},
{title:'COMPARAÇÃO',question:'O mesmo percurso foi testado antes e depois?',accept:'O aluno demonstra o mesmo comando, com resultados diferentes e compreensíveis.'},
{title:'ACESSIBILIDADE',question:'O feedback é legível sem depender apenas de cor?',accept:'Texto contrastante, informação por palavra/ícone, foco/controle reconhecível e nenhuma instrução oculta.'},
{title:'MOBILE / TELA PEQUENA',question:'O conteúdo permanece utilizável em tela estreita?',accept:'Testar no Preview redimensionado ou dispositivo isolado: texto não corta, comandos são acessíveis, sem sobreposição com HUD.'},
{title:'DESEMPENHO E REGRESSÃO',question:'A melhoria preserva jogabilidade e estabilidade?',accept:'Nenhuma ação pesada repetida por frame; a cena mantém controle, regra, conclusão e teste negativo da Missão 07.'}
];
function practice(){return '<div class="t8v-grid">'+[
['5 MIN · ANTES','Abrir o Preview do projeto salvo e executar uma interação confusa. Registrar o comando, o resultado e o problema observado.','A dificuldade é reproduzível e o jogo anterior continua funcionando.'],
['11 MIN · MELHORIA','No Events Editor ou objeto Text, mudar UMA resposta do jogo. Evitar efeitos desnecessários, chamadas externas e texto reescrito a cada quadro.','Uma alteração implementada e observável, sem quebrar as regras anteriores.'],
['8 MIN · DEPOIS','Repetir a mesma ação, tentar caso negativo, verificar legibilidade em tela estreita e movimento da câmera.','Comparação antes/depois, negativo e projeto editável; nenhum resultado deve ser presumido.']
].map(([title,action,accept],i)=>'<article><small>ETAPA 0'+(i+1)+'</small><h3>'+esc(title)+'</h3><p>'+esc(action)+'</p><b>RESULTADO A CONFERIR</b><p>'+esc(accept)+'</p></article>').join('')+'</div>'}
function review(){return '<div class="t8v-rubric">'+rubric.map((r,i)=>'<article><span>0'+(i+1)+'</span><div><small>'+esc(r.title)+'</small><h3>'+esc(r.question)+'</h3><p>'+esc(r.accept)+'</p></div></article>').join('')+'</div><div class="t8v-decisions"><article><h3>✓ APROVAR APÓS OBSERVAR</h3><p>O aluno demonstra antes/depois, teste negativo, legibilidade e preservação da mecânica. Aprovação real somente pelo painel do professor.</p></article><article><h3>↺ DEVOLVER COM CRITÉRIO</h3><p>Registrar a interação, o resultado esperado, o resultado observado e como reproduzir a falha. Solicitar uma correção pequena.</p></article></div>'}
function render(phase='review'){return '<section class="t8v-root" id="t8vRoot"><header><small>MISSÃO 08 · PROFESSOR · '+(phase==='practice'?'OFICINA · 24 MIN':'REVISÃO · 3 MIN')+'</small><h2>'+(phase==='practice'?'Polimento que resolve uma dificuldade real.':'A melhoria precisa sobreviver ao teste.')+'</h2><p>Compare a ficha Problema, Interação, Mudança, Antes, Depois, Negativo e Projeto salvo. A ficha não executa o GDevelop, e não concede aprovação automática.</p></header>'+(phase==='practice'?practice():review())+'<footer><p><b>Limite da verificação automática:</b> testes de código não substituem Preview real, inspeção em celular ou medição de FPS. O professor registra aprovação/revisão apenas após observar o projeto.</p></footer></section>'}
function mount(){return !!document.querySelector('#t8vRoot')}
window.PIT_TEACHER_MISSION_EIGHT_VALIDATION={render,mount,rubric};
})();
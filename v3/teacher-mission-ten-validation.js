/* M10-04 · Teacher launch verification, no automatic approval. */
(function(){'use strict';
const rubric=[
['PROJETO EDITÁVEL','A cópia editável abre e inclui os assets, eventos e cenas do protótipo.'],
['JOGABILIDADE','No Preview ou build, o jogador inicia, controla, executa uma regra e alcança a conclusão.'],
['PLAYTEST','O aluno demonstra observação real de colega e uma decisão: correção retestada, backlog justificado ou nenhuma alteração após teste sem falha.'],
['ENTREGA ACESSÍVEL','Link opcional abre sem credenciais, ou o professor acompanha demonstração local autorizada.'],
['DIREITOS E PRIVACIDADE','Não há dados pessoais, tokens ou recursos sem licença/atribuição verificável.'],
['APROVAÇÃO REAL','A conquista final depende das dez missões aprovadas no backend; apresentação ou envio isolado não basta.']
];
// Public practice checklist mirrors the eight student fields; never includes teacher-only workflow.
const practiceFields=[
 ['Público e experiência do jogo','Para quem é o jogo e qual experiência o protótipo oferece?'],
 ['Mecânica principal demonstrada','Qual controle, interação e resposta visual serão mostrados?'],
 ['Regra SE/ENTÃO e condição final','Que condição ativa a ação e como a partida termina?'],
 ['Percurso demonstrado no Preview','Que sequência foi realmente executada do início ao fim?'],
 ['Observação e decisão após o playtest','O que o colega observou? Houve reteste, backlog ou nenhuma falha?'],
 ['Limitação e próximo incremento','Qual melhoria futura é proposta, sem afirmar que já foi feita?'],
 ['Local do projeto editável e assets','Onde a cópia completa está salva e como será reaberta?'],
 ['Como o professor acessa o jogo','Preview local, pasta exportada ou link testado sem credenciais?']
];
const practiceChecks=[
 'Reabri projeto editável e assets.',
 'Executei mecânica e final no Preview/build.',
 'Conferi privacidade, licença e acesso.'
];
function renderPracticeGuide(){return '<section class="t10v-practice-guide" aria-label="Ficha pública de demonstração"><h3>Os oito registros da ficha do aluno</h3><p>O aluno registra apenas o que fez no próprio jogo. Não inventar teste, link ou melhoria concluída.</p><div class="t10v-practice-fields">'+Array.from({length:4},(_,i)=>'<article><small>REGISTROS '+(i*2+1)+'–'+(i*2+2)+' DE 8</small>'+practiceFields.slice(i*2,i*2+2).map(([label,hint])=>'<div><h4>'+label+'</h4><p>'+hint+'</p></div>').join('')+'</article>').join('')+'</div><section class="t10v-practice-tests"><h3>Três conferências manuais, não automáticas</h3><ol>'+practiceChecks.map(x=>'<li>'+x+'</li>').join('')+'</ol><p>Marcar somente após verificar de verdade. A ficha não executa o Preview e não concede aprovação.</p></section></section>'}
function render(phase='review'){return '<section class="t10v-root" id="t10vRoot"><header><small>MISSÃO 10 · PROFESSOR · '+(phase==='practice'?'APRESENTAÇÕES · 18 MIN':'AVALIAÇÃO · 5 MIN')+'</small><h2>'+(phase==='practice'?'O protótipo deve ser jogado.':'Conquista só depois da validação.')+'</h2><p>A avaliação exige jogo executável e projeto editável recuperável. Ficha, link ou imagem isolados não comprovam o funcionamento do protótipo.</p></header>'+(phase==='practice'?'<details class="pit-private-teacher-notes"><summary title="Roteiro reservado: abrir somente sem espelhamento" aria-label="Abrir roteiro privado da Missão 10">▤</summary><div class="pit-private-teacher-notes-body"><small>ROTEIRO PRIVADO · NÃO PROJETAR</small><h4>Apresentações e conferência final</h4><p><b>Antes:</b> confirmar projeto editável e acesso por Preview local ou link opcional. <b>18 minutos:</b> pedir demonstrações de até dois minutos: início, controle, regra, final e decisão pós-playtest. <b>Depois:</b> conferir oito campos, três testes, licença e privacidade; registrar aprovação ou devolutiva no acompanhamento.</p><p><b>Se travar:</b> não exigir publicação paga; usar Preview local. Se assets faltarem, conferir associação de recursos. Se não houver final, solicitar correção específica. A conquista depende das dez missões aprovadas no backend. Feche antes de espelhar.</p></div></details>':'<details class="pit-private-teacher-notes"><summary title="Roteiro reservado: abrir somente sem espelhamento" aria-label="Abrir roteiro privado da avaliação da Missão 10">▤</summary><div class="pit-private-teacher-notes-body"><small>ROTEIRO PRIVADO · NÃO PROJETAR</small><h4>Conferência e registro no acompanhamento</h4><p>Depois de retirar o espelhamento HDMI, abra o acompanhamento e selecione a entrega da Missão 10. Confira o projeto editável, a demonstração real, os campos de evidência, os testes declarados, o playtest, as licenças e o acesso autorizado. Registre Aprovar ou Solicitar revisão com indicação específica do que falta; não atribua conquista manualmente.</p><p>Feche este painel antes de voltar a projetar.</p></div></details>')+'<div class="t10v-rubric">'+rubric.map(([title,desc],i)=>'<article><span>0'+(i+1)+'</span><div><h3>'+title+'</h3><p>'+desc+'</p></div></article>').join('')+'</div>'+(phase==='practice'?renderPracticeGuide():'')+'<footer><b>CRITÉRIO PÚBLICO</b><p>A aprovação depende da verificação real do jogo e do projeto editável. Esta tela não cria notas, aprovações ou insígnias.</p></footer></section>'}
function mount(){return !!document.querySelector('#t10vRoot')}
window.PIT_TEACHER_MISSION_TEN_VALIDATION={rubric,practiceFields,practiceChecks,render,mount};
})();
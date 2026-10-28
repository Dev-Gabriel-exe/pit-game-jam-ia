/* PIT Game Jam IA V3 · M09-03 · professor review of cross-playtest.
 * Review rubric only: does not issue approval or fabricate tests.
 */
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const rubric=[
{title:'TESTADOR REAL',question:'Uma segunda pessoa executou o jogo?',accept:'Registro anônimo do testador e observação concreta. Não exigir nome, imagem, chat ou dados pessoais.'},
{title:'HIPÓTESE E TAREFA',question:'O teste buscava verificar algo específico?',accept:'Tarefa executável e resultado esperado descritos antes da observação.'},
{title:'OBSERVADO E REPRODUÇÃO',question:'É possível repetir o percurso relatado?',accept:'Passos concretos, resultado observado e impacto. Não aceitar apenas “deu erro” ou texto genérico.'},
{title:'CORREÇÃO OU BACKLOG',question:'A decisão corresponde ao impacto encontrado?',accept:'Se corrigido: alteração pequena e reteste. Se backlog: justificativa clara e impacto limitado.'},
{title:'REGRESSÃO',question:'O protótipo permanece jogável e com conclusão?',accept:'Abrir projeto salvo, testar entrada, regra, condição final e a interação alterada. Não presumir sucesso pelo checkbox.'}
];
function practice(){return '<div class="t9v-work">'+[
['TESTE · 1 + 5 + 2 MIN','A dupla define hipótese e tarefa; o testador joga sem receber instruções extras; o autor registra tentativas, esperado e observado.','Um relatório que distingue fato de expectativa.'],
['TROCA DE PAPÉIS','A outra pessoa executa o mesmo protocolo no jogo do colega. Não registrar dados pessoais, apenas “Colega A/B”.','Cada jogo tem observação própria, não cópia de outro projeto.'],
['CORRIGIR OU PRIORIZAR','Se a falha bloqueia a vitória, aplicar uma correção pequena e repetir os passos. Se não couber no tempo, registrar backlog e justificativa.','Mudança verificável ou decisão de backlog fundamentada.']
].map(([title,body,accept],i)=>'<article><small>ETAPA 0'+(i+1)+'</small><h3>'+esc(title)+'</h3><p>'+esc(body)+'</p><b>SAÍDA</b><p>'+esc(accept)+'</p></article>').join('')+'</div>'}
function review(){return '<div class="t9v-rubric">'+rubric.map((r,i)=>'<article><span>0'+(i+1)+'</span><div><small>'+esc(r.title)+'</small><h3>'+esc(r.question)+'</h3><p>'+esc(r.accept)+'</p></div></article>').join('')+'</div><div class="t9v-decisions"><article><h3>✓ APROVAR APÓS VERIFICAR</h3><p>O aluno reproduz o resultado e mostra a correção ou explica um backlog coerente. A aprovação real ocorre somente no painel do professor.</p></article><article><h3>↺ SOLICITAR REVISÃO</h3><p>Faltou testador, hipótese, reprodução ou justificativa. Registrar o caso concreto e o que deve ser testado novamente.</p></article></div>'}
function render(phase='review'){return '<section class="t9v-root" id="t9vRoot"><header><small>MISSÃO 09 · PROFESSOR · '+(phase==='practice'?'PLAYTEST · 16 MIN':'RESULTADOS · 3 MIN')+'</small><h2>'+(phase==='practice'?'Observe o jogo, não conduza a resposta.':'Um defeito útil pode ser reproduzido.')+'</h2><p>O caderno do aluno registra Testador, Hipótese, Tarefa, Esperado, Observado, Reprodução, Impacto, Decisão e Projeto. A decisão é correção testada ou backlog justificado.</p></header>'+(phase==='practice'?practice():review())+'<footer>Não é possível validar execução apenas pelo texto: solicite o Preview e confira o projeto editável. Nenhum teste real foi executado por esta página.</footer></section>'}
function mount(){return !!document.querySelector('#t9vRoot')}
window.PIT_TEACHER_MISSION_NINE_VALIDATION={render,mount,rubric};
})();
/* M10-04 · Teacher launch verification, no automatic approval. */
(function(){'use strict';
const rubric=[
['PROJETO EDITÁVEL','A cópia editável abre e inclui os assets, eventos e cenas do protótipo.'],
['JOGABILIDADE','No Preview ou build, o jogador inicia, controla, executa uma regra e alcança a conclusão.'],
['PLAYTEST','O aluno demonstra observação de colega e correção testada ou backlog justificado.'],
['ENTREGA ACESSÍVEL','Link opcional abre sem credenciais, ou o professor acompanha demonstração local autorizada.'],
['DIREITOS E PRIVACIDADE','Não há dados pessoais, tokens ou recursos sem licença/atribuição verificável.'],
['APROVAÇÃO REAL','A conquista final depende das dez missões aprovadas no backend; apresentação ou envio isolado não basta.']
];
function render(phase='review'){return '<section class="t10v-root" id="t10vRoot"><header><small>MISSÃO 10 · PROFESSOR · '+(phase==='practice'?'APRESENTAÇÕES · 18 MIN':'AVALIAÇÃO · 5 MIN')+'</small><h2>'+(phase==='practice'?'O protótipo deve ser jogado.':'Conquista só depois da validação.')+'</h2><p>Abra a versão editável e peça a demonstração. Não confunda uma ficha preenchida, um link ou uma imagem com a execução do jogo.</p></header><div class="t10v-rubric">'+rubric.map(([title,desc],i)=>'<article><span>0'+(i+1)+'</span><div><h3>'+title+'</h3><p>'+desc+'</p></div></article>').join('')+'</div><footer><b>DECISÃO</b><p>Após verificar os critérios, registre aprovação ou devolutiva no painel de acompanhamento. Esta tela não cria notas, aprovações ou insígnias.</p></footer></section>'}
function mount(){return !!document.querySelector('#t10vRoot')}
window.PIT_TEACHER_MISSION_TEN_VALIDATION={rubric,render,mount};
})();
/* PIT Game Jam IA V3 · M05-04
   Espelho pedagógico da prática/avaliação do aluno.
   Sem roteiro de fala: o conteúdo projetado é autossuficiente.
 */
(function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const routes=[
 {name:'COLETA / PONTUAÇÃO',kind:'SE tocar em item',control:'Condição Collision entre Jogador e Cristal; o objeto precisa existir na cena.',limit:'Ações Score +1 e Delete object Cristal, em sequência: uma coleta por instância.',negative:'Sem colisão a pontuação não muda. Manter contato após consumir o item não gera pontos adicionais.',risk:'Pontuação multiplica: o evento está rodando quadro a quadro sem remover o cristal ou sem limitar a ocorrência.'},
 {name:'ESCOLHA / NARRATIVA',kind:'SE clicar no alvo',control:'Condição Cursor/Touch is on object + entrada de clique/toque, estado Acertou=0.',limit:'Ação Acertou=1 e TextFeedback alterado. Testar apenas o alvo válido.',negative:'Clique fora do alvo não muda estado nem pontuação; repetição após Acertou=1 não contabiliza novamente.',risk:'O clique fora também ativa, porque faltou a condição de posição ou o bloqueio pelo estado.'},
 {name:'PORTA 3D / TERROR',kind:'SE TemChave=1',control:'Condição da Physics 3D usada pelo próprio starter e tecla de interação; TemChave=1.',limit:'Ações PortaAberta=1, mudança visível e ajuste da barreira física do objeto.',negative:'Sem chave a porta permanece fechada. Com chave abre uma vez, sem ficar atravessando o colisor fechado.',risk:'Visibilidade desativada não necessariamente remove colisor; nunca use Collision 2D para comprovar física 3D.'}
];const headings=['EVENTO / CONDIÇÃO','VARIÁVEL / FEEDBACK','TESTES + SALVAMENTO'];
function routeHTML(index){
 const r=routes[index];
 return '<div class="t5v-route-detail">'+
 '<div class="t5v-route-title"><span>'+esc(r.kind)+'</span><strong>'+esc(r.name)+'</strong></div>'+
 '<div class="t5v-route-parts">'+
 [['COMANDO TESTÁVEL',r.control],['LIMITE IMPLEMENTADO',r.limit],['TESTE NEGATIVO',r.negative],['FALHA MAIS COMUM',r.risk]]
 .map(([label,value],i)=>'<article><span>0'+(i+1)+' · '+esc(label)+'</span><p>'+esc(value)+'</p></article>').join('')+
 '</div></div>';
}
function shell(phase,content){
 const index=phase==='practice'?2:3;
 return '<section class="t5v-root" data-t5v-phase="'+phase+'">'+
 '<header class="t5v-head"><span>✦ PIT GAME JAM IA · MISSÃO V · '+(phase==='practice'?'OFICINA':'VALIDAÇÃO')+'</span>'+
 '<div class="t5v-top"><strong>IV</strong><div><small>A PRIMEIRA REGRA · 40 MINUTOS</small>'+
 '<h2>'+(phase==='practice'?'Uma condição, uma variável, três testes.':'A regra só conta quando há antes e depois.')+'</h2>'+
 '<p>'+(phase==='practice'?'Continue a mesma cena e implemente uma regra jogável, sem criar outra fase.':'Confronte o SE/ENTÃO registrado com o Preview e seu caso negativo.')+'</p></div></div>'+
 '<div class="t5v-cadence">'+[8,5,24,3].map((time,i)=>'<span class="'+(i===index?'active':'')+'"><b>'+time+' min</b> '+['CONCEITOS','DEMONSTRAÇÃO','OFICINA','RESULTADOS'][i]+'</span>').join('')+'</div></header>'+
 '<div class="t5v-content">'+content+'</div></section>';
}
function practice(){
 return shell('practice',
 '<div class="t5v-intro"><small>OFICINA · 24 MINUTOS</small>'+
 '<h3>Três blocos idênticos ao caderno do aluno.</h3>'+
 '<p>O aluno reabre o jogo das Missões 03–04. Escolhe <strong>apenas uma regra</strong>, coerente com o gênero e a mecânica da Missão 02. Não deve gastar este bloco fazendo imagens, música, novas telas ou múltiplos eventos.</p></div>'+
 '<div class="t5v-lab-grid">'+[
  {time:'8 MIN',name:'01 · SE: CONDIÇÃO',details:'Aba Events → Add event → Add condition. A condição especifica quando o evento é verdadeiro. Pode ser colisão 2D, clique/toque em alvo ou contato do behavior Physics 3D.',output:'O gatilho dispara somente quando a interação válida acontece.',problem:'Evento sem condição dispara a ação a cada quadro; colisão incorreta jamais dispara.'},
  {time:'8 MIN',name:'02 · ENTÃO: ESTADO',details:'No mesmo evento → Add action, atualizar uma variável de cena (Score, Acertou ou TemChave/PortaAberta) e produzir feedback (texto, remoção do item, porta que abre).',output:'O estado muda e o jogador consegue reconhecer essa mudança.',problem:'Atualizar variável sem feedback visual não comprova resposta para o jogador.'},
  {time:'8 MIN',name:'03 · PREVIEW + EVIDÊNCIA',details:'Testar um caso verdadeiro, um falso e a repetição. Registrar condição, ação, variável, resultados, feedback e local do projeto editável.',output:'Uma regra demonstrável, sem pontuação duplicada nem ativação indevida.',problem:'Checkbox ou descrição gerada pela IA não comprova que o evento foi executado no jogo.'}
 ].map((x,i)=>'<article class="t5v-lab" data-t5v-reveal><div class="t5v-lab-label"><span>'+x.time+'</span><small>ETAPA 0'+(i+1)+'/03</small></div><h4>'+x.name+'</h4><p>'+x.details+'</p><div><b>✓ ACEITE</b><p>'+x.output+'</p></div><footer><strong>FALHA COMUM</strong><p>'+x.problem+'</p></footer></article>').join('')+'</div>'+
 '<div class="t5v-route-picker"><div class="t5v-route-header"><span>◈ TRÊS CAMINHOS, UM OBJETIVO</span>'+
 '<h3>Selecione a regra correspondente ao jogo.</h3><p>A escolha altera a orientação técnica, não adiciona tarefas. O aluno pode criar outra regra autoral se ela tiver condição, ação, variável e feedback.</p></div>'+
 '<div role="tablist" class="t5v-tabs" aria-label="Exemplos de regra por gênero">'+routes.map((r,i)=>'<button type="button" id="t5vTab'+i+'" data-t5v-tab="'+i+'" aria-controls="t5vPanel" role="tab" aria-selected="'+(i===0)+'" tabindex="'+(i===0?'0':'-1')+'">'+esc(r.name)+'</button>').join('')+'</div>'+
 '<div id="t5vPanel" aria-labelledby="t5vTab0" role="tabpanel">'+routeHTML(0)+'</div></div>'+
 '<div class="t5v-verification"><strong>REGISTRO QUE O PROFESSOR RECEBE</strong>'+
 '<p>Condição, Ação, Variável, Positivo, Negativo, Feedback, Salvo em e Correção opcional. A aprovação depende de demonstração ou evidência verificável; o formulário registra declarações e não executa o jogo.</p></div>'
 );
}
function results(){
 return shell('review',
 '<div class="t5v-intro"><small>RESULTADOS · 3 MINUTOS</small><h3>Regra real significa mudança de estado comprovável.</h3>'+
 '<p>É possível obter uma descrição plausível de IA sem ter criado nenhum evento. A avaliação relaciona a condição com a ação no Preview. O professor registra a aprovação ou devolutiva no <strong>Acompanhamento</strong>.</p></div>'+
 '<div class="t5v-rubric">'+[
 ['01','EVENTO','Qual SE inicia a ação?','A condição aponta objetos, entrada ou estado real da cena; não é apenas intenção.'],
 ['02','AÇÃO E ESTADO','O que muda no ENTÃO?','Existe ação compatível e variável com nome/valor verificável; feedback observável.'],
 ['03','ACEITE 3×','Quando funciona, quando não e ao repetir?','O teste positivo passa, o negativo não dispara e a repetição não duplica efeitos.'],
 ['04','CONTINUIDADE','Onde está o projeto editável?','O aluno salva o mesmo jogo e consegue continuar na Missão 06.']
 ].map(([n,tag,q,accept])=>'<article><div>'+n+'</div><section><small>'+tag+'</small><h4>'+q+'</h4><p>'+accept+'</p></section></article>').join('')+'</div>'+
 '<div class="t5v-decisions"><div><strong>✓ APROVAR</strong><p>SE/ENTÃO existe, a variável muda com feedback real, os três testes passam e o projeto pode ser reaberto.</p></div>'+
 '<div><strong>↺ SOLICITAR REVISÃO</strong><p>Condição dispara indevidamente, ação duplica por quadro, variável não muda, feedback ausente ou projeto não é recuperável. A devolutiva identifica o teste a refazer.</p></div></div>'+
 '<div class="t5v-verification"><strong>VERIFICAÇÃO NO PAINEL</strong>'+
 '<p>Em <b>Acompanhamento</b> → aluno → <b>Missão 05</b>, compare Condição, Ação, Variável, Positivo, Negativo, Feedback e Salvo em. A análise e o resultado são gravados pelo servidor, não pelo preenchimento da ficha.</p>'+
 '<p class="t5v-caution">Se o professor não puder observar o Preview, a evidência permanece autodeclaratória. Não afirmar que houve teste de execução automático.</p></div>'
 );
}
function render(phase){return phase==='review'?results():practice()}
function mount(){
 const root=document.querySelector('.t5v-root');if(!root)return;
 const tabs=[...root.querySelectorAll('[data-t5v-tab]')],panel=root.querySelector('#t5vPanel');
 if(panel&&tabs.length){
  function change(i,focus){
   if(i<0||i>=routes.length)return;
   tabs.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1});
   panel.setAttribute('aria-labelledby','t5vTab'+i);panel.innerHTML=routeHTML(i);
   if(focus)tabs[i].focus();
  }
  tabs.forEach((button,i)=>{
   button.addEventListener('click',()=>change(i,false));
   button.addEventListener('keydown',e=>{
    const next=e.key==='Home'?0:e.key==='End'?routes.length-1:e.key==='ArrowRight'?(i+1)%routes.length:e.key==='ArrowLeft'?(i-1+routes.length)%routes.length:null;
    if(next===null)return;e.preventDefault();change(next,true);
   });
  });
 }
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const content=[...root.querySelectorAll('[data-t5v-reveal]')];
 if(reduced||typeof IntersectionObserver==='undefined')return content.forEach(e=>e.classList.add('t5v-visible'));
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('t5v-visible');io.unobserve(e.target)}
 }),{threshold:0.05});
 root.classList.add('t5v-animate');
 content.forEach(e=>io.observe(e));
}
window.PIT_TEACHER_MISSION_FIVE_VALIDATION={render,mount,routes,headings};
})();
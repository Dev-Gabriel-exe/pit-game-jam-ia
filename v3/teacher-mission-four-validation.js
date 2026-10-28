/* PIT Game Jam IA V3 · M04-04
   Espelho pedagógico da prática/avaliação do aluno.
   Sem roteiro de fala: o conteúdo projetado é autossuficiente.
 */
(function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const routes=[
 {name:'RPG / EXPLORAÇÃO',kind:'Movimento superior',control:'Setas para mover o personagem.',limit:'Collision + Separate objects contra uma parede.',negative:'Soltar as setas e pressionar contra a parede não produz deslocamento indevido.',risk:'O movimento funciona, mas o personagem atravessa a parede: falta a ação de separação.'},
 {name:'PLATAFORMA',kind:'Movimento lateral',control:'Setas para andar e Espaço/Shift para saltar.',limit:'Platformer character no jogador + Platform no chão.',negative:'Ao cair, a personagem pousa no chão; não o atravessa.',risk:'O personagem cai sem parar: o chão não tem comportamento Platform ou não há instância.'},
 {name:'PUZZLE / NARRATIVA',kind:'Clique/toque',control:'Clicar ou tocar em um alvo visível.',limit:'O evento exige cursor/toque sobre o objeto e comando de entrada.',negative:'Clicar fora do alvo não produz feedback nem avança a escolha.',risk:'Toda a tela ativa o evento: falta conferir a posição do cursor sobre o alvo.'},
 {name:'3D / PRIMEIRA PESSOA',kind:'Física tridimensional',control:'Teclado + orientação da câmera em starter 3D adaptado.',limit:'Parede e jogador participam do Physics 3D; colisores configurados.',negative:'O personagem não atravessa a parede; a câmera continua mostrando a cena.',risk:'Câmera se move, mas não há controle do jogador, ou o colisor 3D não impede a passagem.'}
];
const headings=['ENTRADA / CONTROLE','LIMITE OU RESTRIÇÃO','RETESTE + SALVAMENTO'];
function routeHTML(index){
 const r=routes[index];
 return '<div class="t4v-route-detail">'+
 '<div class="t4v-route-title"><span>'+esc(r.kind)+'</span><strong>'+esc(r.name)+'</strong></div>'+
 '<div class="t4v-route-parts">'+
 [['COMANDO TESTÁVEL',r.control],['LIMITE IMPLEMENTADO',r.limit],['TESTE NEGATIVO',r.negative],['FALHA MAIS COMUM',r.risk]]
 .map(([label,value],i)=>'<article><span>0'+(i+1)+' · '+esc(label)+'</span><p>'+esc(value)+'</p></article>').join('')+
 '</div></div>';
}
function shell(phase,content){
 const index=phase==='practice'?2:3;
 return '<section class="t4v-root" data-t4v-phase="'+phase+'">'+
 '<header class="t4v-head"><span>✦ PIT GAME JAM IA · MISSÃO IV · '+(phase==='practice'?'OFICINA':'VALIDAÇÃO')+'</span>'+
 '<div class="t4v-top"><strong>IV</strong><div><small>PRIMEIRO JOGÁVEL · 50 MINUTOS</small>'+
 '<h2>'+(phase==='practice'?'Controle, limite e prova real.':'O jogo precisa demonstrar o que faz.')+'</h2>'+
 '<p>'+(phase==='practice'?'Um resultado por etapa, sem abandonar o projeto anterior.':'Aprovação baseada em comportamento observável, não em texto convincente.')+'</p></div></div>'+
 '<div class="t4v-cadence">'+[6,5,36,3].map((time,i)=>'<span class="'+(i===index?'active':'')+'"><b>'+time+' min</b> '+['CONCEITOS','DEMONSTRAÇÃO','OFICINA','RESULTADOS'][i]+'</span>').join('')+'</div></header>'+
 '<div class="t4v-content">'+content+'</div></section>';
}
function practice(){
 return shell('practice',
 '<div class="t4v-intro"><small>OFICINA DE DESENVOLVIMENTO · 36 MINUTOS</small>'+
 '<h3>Três blocos que coincidem com o caderno do aluno.</h3>'+
 '<p>O estudante reabre o projeto da Missão 03. A implementação varia com o gênero, mas o aceite é igual: <strong>comando reconhecido, resposta visível e limite funcionando</strong>. Não é necessário implementar inimigos, trilha sonora ou mais de uma fase.</p></div>'+
 '<div class="t4v-lab-grid">'+[
  {time:'12 MIN',name:'01 · CONTROLE',details:'No GDevelop, um Sprite ou personagem 3D recebe o behavior adequado; em puzzle, uma condição de clique/toque ativa a resposta.',output:'Na janela Preview, o comando provoca uma mudança observável.',problem:'Um objeto apenas posicionado na cena não comprova controle.'},
  {time:'15 MIN',name:'02 · OBSTÁCULO / LIMITE',details:'Incluir parede, chão de plataforma ou área restrita. Aplicar resposta correta à colisão ou à condição de alvo.',output:'Uma ação inválida não atravessa a barreira e não dispara a opção errada.',problem:'Detecção de colisão sem resposta pode permitir atravessar a parede.'},
  {time:'9 MIN',name:'03 · TESTES E REGISTRO',details:'Executar teste de entrada, teste do limite e repetição com caso negativo. Salvar e registrar onde ficou o projeto.',output:'Projeto recuperável + ficha com comando, resposta, limite e repetição.',problem:'Texto da IA, imagem do editor ou caixa de seleção não substitui Preview.'}
 ].map((s,i)=>'<article class="t4v-lab" data-t4v-reveal><div class="t4v-lab-label"><span>'+s.time+'</span><small>FRAGMENTO 0'+(i+1)+'/03</small></div>'+
 '<h4>'+s.name+'</h4><p>'+s.details+'</p><div><b>✓ VERIFICÁVEL</b><p>'+s.output+'</p></div><footer><strong>ERRO FREQUENTE</strong><p>'+s.problem+'</p></footer></article>').join('')+'</div>'+
 '<div class="t4v-route-picker"><div class="t4v-route-header"><span>◈ IMPLEMENTAÇÃO COMPATÍVEL COM O GÊNERO</span>'+
 '<h3>O mesmo teste, quatro formas de construir.</h3><p>Selecione uma rota para comparar controles, limite e reteste. As outras rotas não são tarefas adicionais.</p></div>'+
 '<div role="tablist" class="t4v-tabs" aria-label="Rota de implementação">'+routes.map((r,i)=>
 '<button type="button" id="t4vTab'+i+'" data-t4v-tab="'+i+'" aria-controls="t4vPanel" role="tab" aria-selected="'+(i===0)+'" tabindex="'+(i===0?'0':'-1')+'">'+esc(r.name)+'</button>').join('')+'</div>'+
 '<div id="t4vPanel" aria-labelledby="t4vTab0" role="tabpanel">'+routeHTML(0)+'</div></div>'+
 '<div class="t4v-verification"><strong>ENTREGA COMPATÍVEL COM O CADERNO DO ALUNO</strong>'+
 '<p>Os campos são: entrada utilizada, resposta no Preview, efeito do limite, repetição/contraprova e onde salvou o projeto. O aluno pode acrescentar um diagnóstico. O checklist é declaratório e o professor pode solicitar que o resultado seja demonstrado ao vivo.</p></div>'
 );
}
function results(){
 return shell('review',
 '<div class="t4v-intro"><small>VALIDAÇÃO · 3 MINUTOS</small>'+
 '<h3>Uma evidência é uma afirmação verificável.</h3>'+
 '<p>O registro enviado não executa o jogo automaticamente. A análise compara as respostas do caderno com o projeto aberto no GDevelop quando necessário. O professor aprova ou solicita revisão no <strong>painel de acompanhamento</strong>.</p></div>'+
 '<div class="t4v-rubric">'+[
 ['01','ENTRADA','Qual comando foi testado?','A entrada e a mudança observada são descritas com precisão.'],
 ['02','LIMITE','O que aconteceu ao tentar atravessar ou clicar fora?','A restrição funciona na rota escolhida; não depende só de imagem estática.'],
 ['03','REPRODUTIBILIDADE','O que ocorreu ao repetir com um caso negativo?','Há descrição de um segundo teste, comparando ações válidas e inválidas.'],
 ['04','PERSISTÊNCIA','Onde está o projeto editável?','O aluno identifica o arquivo ou projeto na nuvem que pode continuar na Missão 05.']
 ].map(([n,tag,q,accept])=>'<article><div>'+n+'</div><section><small>'+tag+'</small><h4>'+q+'</h4><p>'+accept+'</p></section></article>').join('')+'</div>'+
 '<div class="t4v-decisions"><div><strong>✓ APROVAR</strong><p>O comando produz resposta, o limite é observado, o reteste foi realizado e o projeto está recuperável.</p></div>'+
 '<div><strong>↺ SOLICITAR REVISÃO</strong><p>Um dos testes não ocorreu, a barreira falhou, o aluno apenas descreveu código sem executar ou o projeto não foi salvo. Informar qual teste deve ser repetido.</p></div></div>'+
 '<div class="t4v-verification"><strong>COMO A AVALIAÇÃO É REGISTRADA</strong>'+
 '<p>Em <b>👥 Acompanhamento</b>, selecione o aluno e a entrega da Missão 04. Leia <b>Comando, Resposta, Limite, Repetição, Salvo em</b>; depois use Aprovar ou Solicitar revisão. O status deve ser registrado pelo servidor, não pelo preenchimento da ficha.</p>'+
 '<p class="t4v-caution">Se não for possível ver a demonstração no momento, o registro escrito permanece uma declaração do aluno. A ausência de validação automática deve ser apresentada com clareza.</p></div>'
 );
}
function render(phase){return phase==='review'?results():practice()}
function mount(){
 const root=document.querySelector('.t4v-root');if(!root)return;
 const tabs=[...root.querySelectorAll('[data-t4v-tab]')],panel=root.querySelector('#t4vPanel');
 if(panel&&tabs.length){
  function change(i,focus){
   if(i<0||i>=routes.length)return;
   tabs.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1});
   panel.setAttribute('aria-labelledby','t4vTab'+i);panel.innerHTML=routeHTML(i);
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
 const content=[...root.querySelectorAll('[data-t4v-reveal]')];
 if(reduced||typeof IntersectionObserver==='undefined')return content.forEach(e=>e.classList.add('t4v-visible'));
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('t4v-visible');io.unobserve(e.target)}
 }),{threshold:0.05});
 root.classList.add('t4v-animate');
 content.forEach(e=>io.observe(e));
}
window.PIT_TEACHER_MISSION_FOUR_VALIDATION={render,mount,routes,headings};
})();
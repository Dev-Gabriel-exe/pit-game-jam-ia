/* Guia interno: eventos no GDevelop, em português, baseado na documentação oficial.
   Capturas originais são exemplos da interface (podem mudar entre versões).
   Ilustração em PT-BR está hospedada no próprio repositório. */
(function(){
'use strict';
const stage=[
 {label:'01 · LOCALIZAR',title:'Onde ficam as regras do jogo?',lead:'No GDevelop, a cena organiza aquilo que aparece e a aba de eventos organiza aquilo que acontece. O editor visual de eventos é a área em que uma regra se torna executável.',
  img:'https://wiki.gdevelop.io/gdevelop5/interface/events-editor/pasted/20230313-180413.png',
  alt:'Captura da interface do GDevelop: duas abas no topo, GameScene e GameScene (Events).',
  steps:[
   ['CENA','A aba da cena mostra os objetos posicionados: Jogador, Cristal e Porta. É a composição visual.'],
   ['EVENTOS','A aba da mesma cena com “(Events)” abre as regras. É nela que aparecem condições e ações.'],
   ['PREVIEW','O botão Preview executa o jogo para conferir o comportamento e verificar se a regra funciona.']],
  note:'A imagem é uma captura da documentação oficial (interface em inglês). “GameScene” corresponde a “Cena”; “GameScene (Events)” identifica os eventos dessa cena.'},
 {label:'02 · ADICIONAR',title:'Como criar o primeiro evento vazio?',lead:'Cada evento padrão representa uma relação de causa e efeito. Ele reúne, à esquerda, as condições avaliadas e, à direita, as ações executadas quando elas forem verdadeiras.',
  img:'https://wiki.gdevelop.io/gdevelop5/interface/events-editor/pasted/20230313-175252.png',
  alt:'Captura da aba de eventos vazia com um botão central Add an event.',
  steps:[
   ['01 · ABA DE EVENTOS','Abra os eventos da cena pela aba no topo da janela.'],
   ['02 · ADICIONAR EVENTO','Selecione “Add an event” (Adicionar evento). Surge um evento padrão vazio.'],
   ['03 · DUAS COLUNAS','O lado esquerdo contém testes lógicos; o lado direito contém operações que modificam o jogo.']],
  note:'A aparência dos ícones pode variar conforme a versão do editor. O conceito é estável: um evento padrão possui condições e ações.'},
 {label:'03 · PREENCHER',title:'O que se coloca em condição e em ação?',lead:'Condição é uma pergunta com resultado verdadeiro/falso. Ação é uma operação. Várias condições no mesmo evento padrão devem ser satisfeitas para que suas ações sejam executadas.',
  img:'https://wiki.gdevelop.io/gdevelop5/interface/events-editor/pasted/20230313-175502.png',
  alt:'Captura da interface do GDevelop destacando Add condition na coluna esquerda e Add action na direita.',
  steps:[
   ['CONDIÇÃO','“Add condition” → escolher o objeto e o teste; exemplo: Jogador está em colisão com Cristal.'],
   ['AÇÃO','“Add action” → escolher o objeto ou variável e a operação; exemplo: excluir o Cristal tocado e somar 1 a cristais.'],
   ['ESTADO','A variável cristais é numérica, começa em 0 e registra quantos itens já foram coletados.']],
  note:'A condição de colisão seleciona as instâncias envolvidas. A ação de exclusão, nesse evento, deve excluir o cristal selecionado, não todos os cristais da cena.'},
 {label:'04 · EXEMPLO COMPLETO',title:'Duas regras bastam para implementar o desafio.',lead:'Abaixo está um esquema didático em português inspirado no editor de eventos. Ele representa o nosso protótipo de coletar três cristais e abrir a porta. O visual é ilustrativo, não uma captura literal da interface.',
  img:'./v3/assets/guide/gdevelop-eventos-pt.svg',
  alt:'Ilustração didática em português do editor de eventos com duas regras: coletar cristal, e abrir porta após três cristais.',
  steps:[
   ['EVENTO 01 · COLETA','SE Jogador colide com Cristal → excluir apenas a instância tocada; somar +1 à variável de cena cristais.'],
   ['EVENTO 02 · PORTA','SE Jogador colide com Porta E cristais ≥ 3 → acionar a conclusão (por exemplo, trocar para a cena Vitória).'],
   ['POR QUE DUAS CONDIÇÕES?','É necessário estar na porta E ter coletado os itens. Ter cristais suficientes não deve encerrar o jogo automaticamente.']],
  note:'A variável de cena pertence à cena atual. Se a pontuação precisar sobreviver à troca entre cenas, será preciso analisar o uso de uma variável global.'},
 {label:'05 · CONFERIR',title:'Como saber se o evento ficou correto?',lead:'O Preview permite executar um teste funcional. A pergunta não é apenas “o jogo abre?”, mas “a condição muda o estado somente quando deveria?”.',
  img:'./v3/assets/guide/gdevelop-eventos-pt.svg',
  alt:'Ilustração didática do editor com regra de coleta e regra de vitória, em português.',
  steps:[
   ['CASO A · 0 CRISTAIS','Tocar a porta com cristais = 0. Esperado: nenhuma vitória; a porta continua bloqueada.'],
   ['CASO B · 2 CRISTAIS','Tocar a porta com cristais = 2. Esperado: nenhuma vitória; ainda falta um cristal.'],
   ['CASO C · 3 CRISTAIS','Depois de coletar 3 cristais, tocar a porta. Esperado: a conclusão acontece.']],
  note:'Atenção ao evento sem condições: suas ações podem ser executadas em todo quadro (frame). Para uma coleta ocorrer uma única vez, o item tocado deve ser removido ou a interação precisa ser controlada.'}
];
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 return '<section class="tm-guide" data-reveal aria-label="GDevelop explicado no próprio material">'+
 '<div class="tm-guide-heading"><span class="tm-pro-eyebrow">◈ GDEVELOP DESCOMPLICADO · REFERÊNCIA VISUAL</span>'+
 '<h3>Do evento vazio à primeira regra.</h3><p>O editor de eventos pode ser compreendido sem experiência prévia em desenvolvimento de jogos. As capturas oficiais, as traduções e o exemplo do castelo estão organizados nesta aula.</p></div>'+
 '<div class="tm-guide-toolbar" role="tablist" aria-label="Etapas do editor de eventos">'+
 stage.map((d,i)=>'<button type="button" role="tab" id="tmGuideTab'+i+'" aria-controls="tmGuidePanel" aria-selected="'+(i===0?'true':'false')+'" tabindex="'+(i===0?'0':'-1')+'" data-tm-guide="'+i+'">'+d.label+'</button>').join('')+'</div>'+
 '<div class="tm-guide-screen" id="tmGuidePanel" role="tabpanel" aria-labelledby="tmGuideTab0" tabindex="0">'+panel(0)+'</div>'+
 '<footer class="tm-guide-footer"><span>IMAGENS 01–03: CAPTURAS DA DOCUMENTAÇÃO OFICIAL DO GDEVELOP · INTERFACE ORIGINAL EM INGLÊS. QUADRO 04–05: ILUSTRAÇÃO DIDÁTICA AUTORAL EM PORTUGUÊS.</span>'+
 '<p>Os nomes exatos dos comandos e a disposição de botões podem variar em versões futuras do GDevelop. O material acima explica o funcionamento essencial sem exigir abrir a documentação externa.</p></footer></section>';
}
function panel(index){
 const d=stage[index];
 const img='<img loading="lazy" decoding="async" src="'+escapeHTML(d.img)+'" alt="'+escapeHTML(d.alt)+'" onerror="this.onerror=null;this.src=&#39;./v3/assets/guide/gdevelop-eventos-pt.svg&#39;;this.alt=&#39;Esquema local em português que representa condições e ações&#39;">';
 return '<div class="tm-guide-panel tm-guide-panel-in"><div class="tm-guide-image"><div class="tm-guide-image-head"><span>'+(index<3?'CAPTURA REAL DO GDEVELOP':'ILUSTRAÇÃO EM PORTUGUÊS')+'</span><strong>'+String(index+1).padStart(2,'0')+' / 05</strong></div>'+img+'</div>'+
 '<div class="tm-guide-explanation"><span class="tm-guide-part">ETAPA '+String(index+1).padStart(2,'0')+'</span>'+
 '<h4>'+d.title+'</h4><p class="tm-guide-lead">'+d.lead+'</p>'+
 d.steps.map(([title,desc],i)=>'<div class="tm-guide-item"><span class="tm-guide-step">'+String(i+1).padStart(2,'0')+'</span><div><strong>'+title+'</strong><p>'+desc+'</p></div></div>').join('')+
 '<div class="tm-guide-alert"><span>ENTENDA O DETALHE</span><p>'+d.note+'</p></div></div></div>'+
 '<div class="tm-guide-panel-actions"><button type="button" data-tm-guide-prev '+(index===0?'disabled':'')+'>‹ ETAPA ANTERIOR</button><span>'+String(index+1).padStart(2,'0')+' / 05</span><button type="button" data-tm-guide-next '+(index===stage.length-1?'disabled':'')+'>PRÓXIMA ETAPA ›</button></div>';
}
function mount(){
 const root=document.querySelector('.tm-guide');
 if(!root)return;
 let index=0;
 const tabs=[...root.querySelectorAll('[data-tm-guide]')],screen=root.querySelector('#tmGuidePanel');
 if(!screen)return;
 function choose(n,focus){
  if(n<0||n>=stage.length)return;
  index=n;
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
  screen.setAttribute('aria-labelledby','tmGuideTab'+index);
  screen.innerHTML=panel(index);
  screen.querySelector('[data-tm-guide-prev]')?.addEventListener('click',()=>choose(index-1,false));
  screen.querySelector('[data-tm-guide-next]')?.addEventListener('click',()=>choose(index+1,false));
  if(focus)tabs[index].focus();
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>choose(i,false));
  tab.addEventListener('keydown',e=>{
   const n=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?stage.length-1:null;
   if(n===null)return;
   e.preventDefault();choose((n+stage.length)%stage.length,true);
  });
 });
 choose(0,false);
}
window.PIT_TEACHER_GDEVELOP_GUIDE={render,mount,stageCount:stage.length};
})();
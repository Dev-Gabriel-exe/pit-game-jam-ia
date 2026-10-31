/* PIT GAME JAM IA V3 — M05-01
   Fundamentos técnicos da Missão 05 — professor universitário.
   Explica o GDevelop sem notas de fala. O simulador é DIDÁTICO,
   não executa eventos da engine; a implementação vem na M05-02.
*/
(function(){
'use strict';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const minutes=[8,5,24,3];
const topics=[
 ['01','EVENTO','SE a condição for verdadeira, ENTÃO execute as ações.',
  'Um evento combina condições e ações. Na aba Events do GDevelop, as condições de um mesmo evento precisam ser satisfeitas; em seguida a engine executa as ações, na ordem em que aparecem.',
  'SE Jogador toca Cristal → aumentar Score em 1 e remover Cristal. A regra produz consequência observável.',
  'Um evento sem condição é processado a cada quadro. Se a condição permanece verdadeira, sua ação também pode se repetir.'],
 ['02','MEMÓRIA','Variáveis transformam ações em decisões futuras.',
  'Uma variável de cena, como Score=0 ou TemChave=0, guarda o estado daquela cena. Variáveis globais são compartilhadas entre cenas. Variáveis de objeto pertencem às instâncias: inimigos diferentes podem ter vidas diferentes.',
  'Ao tocar a chave, TemChave passa a 1. Ao alcançar a porta, outro evento consulta TemChave para decidir se abre.',
  'A variável não muda por causa da imagem: é preciso uma ação que a atualize.'],
 ['03','LOOP','O evento não espera uma tecla: ele é reavaliado continuamente.',
  'Em cada quadro (frame), a engine processa os eventos e atualiza o jogo. A 60 FPS, uma ação cuja condição fica verdadeira durante um segundo pode executar dezenas de vezes.',
  'SE Jogador colide com Cristal → Score += 1. Mantendo a colisão por cinco quadros, o bug soma cinco vezes.',
  'Correção: apagar/consumir a instância coletada; ou usar Trigger once quando a ação deve ocorrer só na transição da condição de falsa para verdadeira.'],
 ['04','FEEDBACK','O jogador precisa enxergar que o estado mudou.',
  'Condição, atualização de variável e resposta visual são responsabilidades diferentes. O estado deve refletir a regra, e o feedback deve comunicar o resultado ao jogador.',
  'Uma chave foi coletada: o ícone desaparece, TemChave=1 e a porta muda quando o jogador volta até ela.',
  'Um número no caderno não substitui o efeito no Preview. O teste precisa ter antes, depois e um caso que não deve ativar a regra.']
];
const examples=[
 {label:'RPG / AVENTURA',rule:'SE tocar no cristal E cristal ainda existe → Score += 1; apagar cristal',variable:'Score: variável de cena',feedback:'O cristal desaparece e o marcador aumenta.'},
 {label:'PLATAFORMA',rule:'SE personagem toca moeda → adicionar um ponto; apagar moeda',variable:'Score: variável de cena',feedback:'Moeda some ao coletar; a pontuação muda.'},
 {label:'PUZZLE / NARRATIVA',rule:'SE clicar na resposta correta E não respondeu antes → marcar Acertou=1',variable:'Acertou: variável de cena',feedback:'Opção correta muda de cor; clique repetido não pontua.'},
 {label:'TERROR / 3D',rule:'SE jogador encontra a chave → TemChave=1; SE tenta porta E TemChave=1 → abrir',variable:'TemChave: variável de cena',feedback:'A chave desaparece; porta abre apenas com a chave.'}
];
const initialState=()=>({score:0,hasKey:false,door:'FECHADA',crystal:true,contact:false,frames:0,attempts:0,trace:[{kind:'info',message:'Jogo iniciado. Score=0, TemChave=0, Porta=FECHADA.'}]});
function snapshot(s){return {...s,trace:[...s.trace]}}
function transition(original,action,mode='guard'){
 const st=snapshot(original),safe=mode!=='bug';
 const record=(kind,message)=>{st.trace.push({kind,message});st.trace=st.trace.slice(-6)};
 if(action==='reset')return initialState();
 if(action==='touch'){
  st.frames++;
  if(safe){
   if(st.crystal){st.score++;st.crystal=false;record('ok','SE colidir com Cristal E Cristal existe → Score +1; consumir Cristal.')}
   else record('skip','Condição falsa: o Cristal já foi consumido. Score não muda.');
  }else{
   st.score++;st.contact=true;
   record('warn','BUG: colisão verdadeira no quadro '+st.frames+'; Score +1, mas o Cristal continua disponível.');
  }
 }else if(action==='hold'){
  for(let n=0;n<5;n++){
   st.frames++;
   if(safe){
    if(st.crystal){st.score++;st.crystal=false;record('ok','Coleta única: Cristal removido.')}
    else if(n===0)record('skip','Cinco quadros com o mesmo contato: nenhuma coleta extra.');
   }else{
    st.score++;st.contact=true;
    if(n===0)record('warn','Contato mantido: a mesma ação executa a cada quadro.');
   }
  }
  if(!safe)record('warn','Cinco novos quadros de contato → cinco pontos indevidos. Score='+st.score+'.');
 }else if(action==='release'){
  st.frames++;
  st.contact=false;record('info','Contato encerrado. Trigger once pode voltar a disparar em um próximo contato válido.');
 }else if(action==='key'){
  st.frames++;
  if(st.hasKey)record('skip','A chave já foi coletada: TemChave continua 1.');
  else{st.hasKey=true;record('ok','SE tocar Chave → TemChave recebe 1; exibir feedback.');}
 }else if(action==='door'){
  st.frames++;
  st.attempts++;
  if(st.hasKey){st.door='ABERTA';record('ok','SE tentar Porta E TemChave=1 → abrir Porta.')}
  else{st.door='FECHADA';record('skip','SE tentar Porta E TemChave=0 → manter fechada; exibir aviso.');}
 }
 return st;
}
const buttons=[
 {id:'touch',label:'◆ Encostar no cristal'},
 {id:'hold',label:'⏩ Manter contato · 5 quadros'},
 {id:'release',label:'↔ Encerrar contato'},
 {id:'key',label:'⚿ Coletar chave'},
 {id:'door',label:'🚪 Testar porta'},
 {id:'reset',label:'↺ Reiniciar'}
];
function topicCard([number,tag,heading,definition,example,warning]){
 return '<article class="tm5-concept"><div class="tm5-concept-tag"><span>'+number+'</span><b>'+tag+'</b></div>'+
 '<h4>'+heading+'</h4><p>'+definition+'</p><div class="tm5-concept-example"><strong>EXEMPLO EM JOGO</strong><p>'+example+'</p></div>'+
 '<p class="tm5-concept-warning">'+warning+'</p></article>';
}
function render(){
 return '<section class="tm5-root" id="tm5Foundations" aria-label="Fundamentos de eventos e variáveis no GDevelop">'+
 '<header class="tm5-hero"><span>✦ PIT GAME JAM IA · PROFESSOR · CAPÍTULO V</span>'+
 '<div class="tm5-hero-row"><div class="tm5-emblem">V</div><div><small>MISSÃO 05 / 10 · A PRIMEIRA REGRA</small>'+
 '<h2>O mundo obedece às suas decisões.</h2><p>Eventos, condições, ações, variáveis e feedback.</p></div></div>'+
 '<div class="tm5-clock">'+minutes.map((time,i)=>'<div class="'+(i===0?'active':'')+'"><b>'+time+' min</b><small>'+['FUNDAMENTOS','EXEMPLO','LABORATÓRIO','RESULTADOS'][i]+'</small></div>').join('')+'</div></header>'+
 '<div class="tm5-content"><div class="tm5-lead"><small>ENGENHARIA DE JOGOS · 8 MINUTOS</small>'+
 '<h3>Uma imagem se move. Uma regra transforma movimento em jogo.</h3>'+
 '<p>Na Missão 04, o projeto passou a responder aos controles. Agora a cena precisa <strong>lembrar o que aconteceu</strong> e decidir o próximo resultado. O GDevelop faz isso por eventos: condições verificadas continuamente e ações que mudam o estado.</p>'+
 '<div class="tm5-mini-timeline"><span><b>2 min</b> · evento + variável</span><span><b>3 min</b> · simular repetição</span><span><b>3 min</b> · exemplos por gênero</span></div></div>'+
 '<div class="tm5-rule-strip"><div><span>CONDIÇÃO</span><b>SE jogador toca o Cristal</b></div><span aria-hidden="true">→</span>'+
 '<div><span>AÇÃO</span><b>Score = Score + 1</b></div><span aria-hidden="true">→</span>'+
 '<div><span>FEEDBACK</span><b>Remover item · atualizar HUD</b></div></div>'+
 '<div class="tm5-concept-grid">'+topics.map(topicCard).join('')+'</div>'+
 '<section class="tm5-simulator" aria-label="Simulador didático de regras por quadro">'+
 '<div class="tm5-sim-title"><small>LABORATÓRIO INTERATIVO · MODELO DE EVENTOS</small>'+
 '<h3>O bug de pontuação que aparece em cinco quadros.</h3>'+
 '<p>Compare a mesma colisão com e sem proteção. Este simulador representa a lógica da engine, mas <strong>não é uma execução do GDevelop</strong>.</p></div>'+
 '<div class="tm5-sim-modes" role="radiogroup" aria-label="Proteção do evento">'+
 '<label><input type="radio" name="tm5-mode" value="guard" checked><span><strong>✓ CORRIGIDO</strong><small>Consome o item após pontuar</small></span></label>'+
 '<label><input type="radio" name="tm5-mode" value="bug"><span><strong>⚠ COM BUG</strong><small>Repete a ação enquanto colide</small></span></label></div>'+
 '<div class="tm5-sim-stats" aria-live="polite">'+
 '<div><small>SCORE</small><strong data-tm5-score>0</strong></div>'+
 '<div><small>TEM CHAVE?</small><strong data-tm5-key>NÃO</strong></div>'+
 '<div><small>PORTA</small><strong data-tm5-door>FECHADA</strong></div>'+
 '<div><small>CRISTAL</small><strong data-tm5-crystal>DISPONÍVEL</strong></div>'+
 '<div><small>QUADROS PROCESSADOS</small><strong data-tm5-frames>0</strong></div>'+
 '</div><div class="tm5-sim-actions">'+buttons.map(b=>
 '<button type="button" data-tm5-action="'+b.id+'" class="'+(b.id==='reset'?'reset':'')+'">'+b.label+'</button>').join('')+'</div>'+
 '<div class="tm5-trace"><div><strong>REGISTRO DE EXECUÇÃO</strong><span>EVENTOS → VARIÁVEIS → RESPOSTAS</span></div>'+
 '<ol data-tm5-trace aria-live="polite">'+initialState().trace.map(x=>'<li class="'+x.kind+'">'+escape(x.message)+'</li>').join('')+'</ol></div>'+
 '<div class="tm5-explainer" data-tm5-summary><strong>REGRA CORRIGIDA</strong><p>Ao coletar, a ação consome a instância. O contato prolongado não encontra o mesmo Cristal: Score permanece em 1.</p></div></section>'+
 '<section class="tm5-genres"><span>MESMA ESTRUTURA, QUATRO GÊNEROS</span><h3>A regra muda, a lógica permanece.</h3>'+
 '<div class="tm5-genre-tabs" role="tablist" aria-label="Exemplos de regras por gênero">'+examples.map((x,i)=>
 '<button type="button" role="tab" aria-selected="'+(i===0?'true':'false')+'" tabindex="'+(i===0?'0':'-1')+'" data-tm5-example="'+i+'" id="tm5Tab'+i+'" aria-controls="tm5ExamplePanel">'+escape(x.label)+'</button>').join('')+'</div>'+
 '<div role="tabpanel" id="tm5ExamplePanel" aria-labelledby="tm5Tab0">'+examplePanel(0)+'</div></section>'+
 '<div class="tm5-acceptance"><strong>SAÍDA DOS 8 MINUTOS DE CONCEITOS</strong>'+
 '<p>O estudante deve reconhecer: <b>SE condição → ENTÃO ação</b>, onde a variável registra estado, por que uma ação pode repetir a cada quadro e como demonstrar feedback. Na prática da Missão 05, bastará implementar <b>uma regra real no projeto autoral</b>.</p></div>'+
 '<footer class="tm5-sources"><span>REFERÊNCIAS TÉCNICAS DO GDEVELOP</span>'+
 '<a href="https://wiki.gdevelop.io/gdevelop5/interface/events-editor/" target="_blank" rel="noopener noreferrer">Editor de eventos</a> · '+
 '<a href="https://wiki.gdevelop.io/gdevelop5/tutorials/how-to-debug-poor-performance/" target="_blank" rel="noopener noreferrer">Trigger once / repetição</a> · '+
 '<a href="https://wiki.gdevelop.io/gdevelop5/tutorials/platform-game/5-add-coins-and-number-of-collected-coins/" target="_blank" rel="noopener noreferrer">Variáveis e pontuação</a>'+
 '<p>Explicações e simulação estão na página. Links opcionais para consulta técnica, não pré-requisitos da aula.</p></footer></div></section>';
}
function examplePanel(i){
 const e=examples[i];
 return '<div class="tm5-example"><div><strong>REGRA DE EVENTO</strong><p>'+escape(e.rule)+'</p></div>'+
 '<div><strong>ESCOPO / MEMÓRIA</strong><p>'+escape(e.variable)+'</p></div>'+
 '<div><strong>FEEDBACK OBSERVÁVEL</strong><p>'+escape(e.feedback)+'</p></div></div>';
}
function mount(rootOverride){
 const root=rootOverride||document.querySelector('#tm5Foundations');if(!root)return;
 let mode='guard',state=initialState();
 const $=s=>root.querySelector(s);
 const redraw=()=>{
  const fields={score:state.score,key:state.hasKey?'SIM':'NÃO',door:state.door,crystal:state.crystal?'DISPONÍVEL':'CONSUMIDO',frames:state.frames};
  for(const [k,v]of Object.entries(fields)){const el=$('[data-tm5-'+k+']');if(el)el.textContent=String(v)}
  const log=$('[data-tm5-trace]');
  if(log)log.innerHTML=state.trace.map(item=>'<li class="'+escape(item.kind)+'">'+escape(item.message)+'</li>').join('');
  const summary=$('[data-tm5-summary]');
  if(summary)summary.innerHTML=mode==='guard'?
   '<strong>✓ REGRA PROTEGIDA</strong><p>Uma coleta consome o item. O evento não pontua novamente enquanto o mesmo item não existir; outras instâncias podem ser coletadas separadamente.</p>':
   '<strong>⚠ REPETIÇÃO INDEVIDA</strong><p>A colisão permanece verdadeira e a ação soma 1 por quadro. Cinquenta ou sessenta quadros poderiam produzir dezenas de pontos sem uma nova coleta.</p>';
 };
 root.querySelectorAll('input[name="tm5-mode"]').forEach(input=>input.addEventListener('change',()=>{
  if(!input.checked)return;mode=input.value==='bug'?'bug':'guard';state=initialState();redraw();
 }));
 root.querySelectorAll('[data-tm5-action]').forEach(button=>button.addEventListener('click',()=>{
  state=transition(state,button.dataset.tm5Action,mode);redraw();
 }));
 const tabs=[...root.querySelectorAll('[data-tm5-example]')],panel=$('#tm5ExamplePanel');
 function choose(index,focus){
  if(index<0||index>=examples.length||!panel)return;
  tabs.forEach((b,j)=>{b.setAttribute('aria-selected',String(index===j));b.tabIndex=index===j?0:-1});
  panel.innerHTML=examplePanel(index);panel.setAttribute('aria-labelledby','tm5Tab'+index);
  if(focus)tabs[index].focus();
 }
 tabs.forEach((button,i)=>{
  button.addEventListener('click',()=>choose(i,false));
  button.addEventListener('keydown',e=>{
   const next=e.key==='ArrowRight'?(i+1)%examples.length:e.key==='ArrowLeft'?(i+examples.length-1)%examples.length:e.key==='Home'?0:e.key==='End'?examples.length-1:null;
   if(next===null)return;e.preventDefault();choose(next,true);
  });
 });
 redraw();
}
window.PIT_TEACHER_MISSION_FIVE_FOUNDATIONS={render,mount,initialState,transition,minutes:()=>minutes,topics,examples};
})();
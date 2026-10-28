/* PIT GAME JAM IA V3 · M07-01 · Fundamentos professor.
 * Simulador de estados didático; NÃO é execução do GDevelop.
 */
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initial=()=>({phase:'MENU',key:false,lives:2,frames:0,log:['Aguardando início. A porta não pode abrir antes do desafio.']});
function step(old,action){
const s={...old,log:[...old.log]};const record=t=>{s.log.push(t);s.log=s.log.slice(-5)};
if(action==='reset')return initial();
if(action==='start'){if(s.phase==='MENU'){s.phase='JOGANDO';record('Início: estado JOGANDO; objetivos e controles disponíveis.')}else record('Início ignorado: a partida já começou ou terminou.');return s}
if(s.phase!=='JOGANDO'){record('Ação ignorada: somente JOGANDO aceita interações.');return s}
s.frames++;
if(action==='collect'){if(!s.key){s.key=true;record('Chave coletada. Variável TemChave = 1.')}else record('Chave já coletada: não repetir recompensa.')}
else if(action==='door'){if(s.key){s.phase='VITÓRIA';record('Porta + TemChave=1: vitória e feedback final.')}else record('Porta fechada: falta a chave. Não declarar vitória.')}
else if(action==='damage'){s.lives=Math.max(0,s.lives-1);if(s.lives===0){s.phase='DERROTA';record('Vidas=0: derrota e opção de reiniciar.')}else record('Dano recebido. Vidas restantes: '+s.lives+'.')}
return s;
}
const cases=[
{title:'RPG / EXPLORAÇÃO',start:'Cena inicial apresenta objetivo: encontrar uma chave.',challenge:'Interagir com objeto e registrar TemChave=1.',win:'Porta abre apenas com a chave; cena de conclusão.'},
{title:'PLATAFORMA',start:'Personagem inicia na fase com movimento ativo.',challenge:'Alcançar saída depois de coletar o item necessário.',win:'Condição da saída é satisfeita e aparece conclusão.'},
{title:'PUZZLE / NARRATIVA',start:'Apresentar pergunta ou objetivo da cena.',challenge:'Registrar escolhas válidas em variável.',win:'Somente resposta correta e estado válido liberam conclusão.'},
{title:'TERROR / 3D',start:'Câmera e controles 3D funcionam antes do desafio.',challenge:'Encontrar item sem atravessar obstáculos.',win:'Porta/saída reage à condição 3D e mostra resultado final.'}
];
function render(){return '<section class="t7f-root" id="t7Foundations"><header><small>✦ PIT GAME JAM IA · PROFESSOR · CAPÍTULO VII</small><h2>Uma partida precisa de começo, desafio e conclusão.</h2><p>Estados de jogo, transições, condição de vitória/derrota e feedback — sem transformar o protótipo em dez fases.</p><div class="t7f-clock">'+[7,4,36,3].map((n,i)=>'<span><b>'+n+' min</b> '+['CONCEITOS','DEMONSTRAÇÃO','CONSTRUÇÃO','REVISÃO'][i]+'</span>').join('')+'</div></header>'+
'<div class="t7f-concepts">'+[
['ESTADO','Menu, Jogando, Vitória e Derrota são estados distintos. A variável EstadoJogo impede ações fora da fase correta.'],
['TRANSIÇÃO','Uma condição válida muda o estado: SE TemChave=1 E tocar na porta, ENTÃO EstadoJogo=Vitoria.'],
['LOOP','O motor verifica eventos continuamente. Um evento final deve ser protegido contra repetição por frame, por estado ou Trigger once.'],
['FEEDBACK','Uma conclusão real precisa aparecer no Preview: mensagem, cena final ou painel; vitória não pode ser apenas texto na ficha.']
].map(([name,desc],i)=>'<article><small>0'+(i+1)+' · '+name+'</small><p>'+desc+'</p></article>').join('')+'</div>'+
'<div class="t7f-flow" aria-label="Diagrama textual de estados"><div>MENU <span>→ iniciar →</span> JOGANDO</div><div><span>JOGANDO + objetivo concluído →</span> VITÓRIA</div><div><span>JOGANDO + vidas = 0 →</span> DERROTA</div><p>Somente o estado JOGANDO processa interações. Vitória e derrota encerram a partida até reiniciar.</p></div>'+
'<section class="t7f-sim"><small>SIMULADOR DIDÁTICO · NÃO É O GDEVELOP</small><h3>Uma porta não deve abrir cedo demais.</h3><div class="t7f-stats" aria-live="polite"><div><small>ESTADO</small><b id="t7fPhase">MENU</b></div><div><small>TEM CHAVE</small><b id="t7fKey">NÃO</b></div><div><small>VIDAS</small><b id="t7fLives">2</b></div><div><small>FRAMES SIMULADOS</small><b id="t7fFrames">0</b></div></div>'+
'<div class="t7f-actions">'+[
['start','▶ Iniciar'],['door','🚪 Tentar saída'],['collect','⚿ Coletar chave'],['damage','♥ Perder vida'],['reset','↺ Reiniciar']
].map(([id,label])=>'<button type="button" data-t7f-action="'+id+'">'+label+'</button>').join('')+'</div><ol id="t7fLog" aria-live="polite"><li>Aguardando início. A porta não pode abrir antes do desafio.</li></ol>'+
'<p>Experimente iniciar e tentar a porta sem chave; depois colete a chave e tente novamente. Reinicie e perca duas vidas para comparar derrota. O GDevelop exigirá eventos reais na Missão 07.</p></section>'+
'<div class="t7f-genres"><h3>Mesma máquina de estados, quatro gêneros</h3>'+cases.map(x=>'<article><h4>'+esc(x.title)+'</h4><p><b>Início:</b> '+esc(x.start)+'</p><p><b>Desafio:</b> '+esc(x.challenge)+'</p><p><b>Conclusão:</b> '+esc(x.win)+'</p></article>').join('')+'</div>'+
'<footer><b>CRITÉRIO TÉCNICO</b><p>O aluno deverá demonstrar no Preview: começo reconhecível, desafio com condição real, resultado final e um teste negativo que não libere vitória prematura. A cena pode ser 2D ou 3D, conforme o projeto já criado.</p><p>O simulador ensina a lógica de estados, mas não substitui implementação ou teste no GDevelop.</p></footer></section>'}
function mount(root=document.querySelector('#t7Foundations')){if(!root)return;let s=initial();const update=()=>{const set=(id,value)=>{const el=root.querySelector('#'+id);if(el)el.textContent=String(value)};set('t7fPhase',s.phase);set('t7fKey',s.key?'SIM':'NÃO');set('t7fLives',s.lives);set('t7fFrames',s.frames);const list=root.querySelector('#t7fLog');if(list)list.innerHTML=s.log.map(x=>'<li>'+esc(x)+'</li>').join('')};root.querySelectorAll('[data-t7f-action]').forEach(b=>b.addEventListener('click',()=>{s=step(s,b.dataset.t7fAction);update()}));update()}
window.PIT_TEACHER_MISSION_SEVEN_FOUNDATIONS={render,mount,initial,step,cases};
})();
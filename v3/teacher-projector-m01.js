/* Cinematic projection for all ten teacher missions; one content card per slide. */
(function(){
'use strict';
let index=0,slides=[],overlay=null,origin=null;
const CARD_SELECTOR=['.tm1-hero-line','.tm1-concept','.tm1-key','.tm2-intro','.tm2-concept','.tm2-requirement','.tm3-lead','.tm3-concept','.tm3-principle','.tm3-comparison','.tm4f-card','.tm5-concept','.f6-card','.f6-scope','[class*="-concept-card"]','[class*="-theory-card"]','.t7f-concepts > *','.t8f-concepts > *','.t9-concepts > *','.t10-concepts > *','article','[class*="-card"]'].join(',');
function missionNumber(){const match=($('missionNumber')?.textContent||'').match(/MISSÃO\s+(\d+)/i);return match?Number(match[1]):0;}
const $=id=>document.getElementById(id);
function eligible(){return document.body.dataset.role==='teacher'&&missionNumber()>=1&&missionNumber()<=10&&!$('workspace')?.hidden;}
function cleanCopy(node){
 const copy=node.cloneNode(true);
 copy.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').forEach(el=>el.remove());
 return copy.outerHTML;
}
function pedagogicalDemoSlides(root,mission){
 const teacherGuide=window.PIT_TEACHER_GDEVELOP_GUIDE;
 const firstRun=window.PIT_GDEVELOP_FIRST_RUN;
 if(mission===1&&root.querySelector('[data-teacher-phase="demo"]')&&teacherGuide?.projectorPanel&&teacherGuide.stageCount===5){
  const result=[];
  function add(selector,title){
   const node=root.querySelector(selector);
   if(node)result.push({title:title||node.querySelector('h3,h4,strong')?.textContent?.trim()||'Demonstração',html:cleanCopy(node)});
  }
  add('.tm-pro-lead','Como funciona a transição de estado');
  add('.tm-pro-demo-layout','Simulador local: entrada, regra e resposta');
  root.querySelectorAll('.tm-pro-tech-grid > article').forEach(node=>result.push({title:node.querySelector('h4')?.textContent?.trim()||'Teste da regra',html:cleanCopy(node)}));
  add('.tm-pro-engine','Da simulação aos eventos do GDevelop');
  add('.tm-guide-heading','Tutorial de eventos: cinco etapas');
  for(let i=0;i<teacherGuide.stageCount;i++){
   const container=document.createElement('div');container.innerHTML=teacherGuide.projectorPanel(i);
   container.querySelector('.tm-guide-panel-actions')?.remove();
   const panel=container.querySelector('.tm-guide-panel');
   if(!panel)continue;
   const title=panel.querySelector('h4')?.textContent?.trim()||'Etapa '+(i+1);
   result.push({title,html:'<section class="pit-projector-tutorial-step" data-pit-projector-step="M01:'+i+'">'+panel.outerHTML+'</section>'});
  }
  add('.tm-guide-footer','Referências e limites do tutorial');
  return result.length>=10?result:null;
 }
 if(mission===3&&root.querySelector('[data-tm3-phase="demo"]')&&firstRun?.projectorPanel&&firstRun.steps?.length===6){
  const result=[];
  for(const [selector,title] of [['.tm3-lead','Do projeto ao primeiro Preview'],['.gd3-heading','Tutorial de GDevelop: seis etapas']]){
   const node=root.querySelector(selector);if(node)result.push({title,html:cleanCopy(node)});
  }
  for(let i=0;i<firstRun.steps.length;i++){
   const container=document.createElement('div');container.innerHTML=firstRun.projectorPanel(i);
   container.querySelector('.gd3-nav')?.remove();
   const panel=container.querySelector('.gd3-panel');if(!panel)continue;
   result.push({title:firstRun.steps[i].title,html:'<section class="pit-projector-tutorial-step" data-pit-projector-step="M03:'+i+'">'+panel.outerHTML+'</section>'});
  }
  const footer=root.querySelector('.gd3-footer');
  if(footer)result.push({title:'Conferência final do Preview',html:cleanCopy(footer)});
  return result.length>=8?result:null;
 }
 return null;
}
function activateProjectorControls(content){
 const demo=content.querySelector('.tm-pro-demo-layout');
 if(demo){
  let gems=0,won=false;
  const el=id=>demo.querySelector('#'+id);
  const trace=el('tm1Trace');
  function update(message,rule){
   if(el('tm1Gems'))el('tm1Gems').textContent=gems+'/3';
   if(el('tm1Door'))el('tm1Door').textContent=won?'ABERTA':gems===3?'LIBERADA':'FECHADA';
   if(el('tm1GameState'))el('tm1GameState').textContent=won?'CONCLUÍDO':gems===3?'PORTA LIVRE':'EXPLORAR';
   if(el('tm1Bar'))el('tm1Bar').style.width=Math.round(gems/3*100)+'%';
   if(el('tm1Gate')){el('tm1Gate').classList.toggle('unlocked',gems===3);el('tm1Gate').classList.toggle('won',won)}
   if(el('tm1Victory'))el('tm1Victory').hidden=!won;
   if(el('tm1Feedback'))el('tm1Feedback').textContent=message;
   if(el('tm1Step'))el('tm1Step').textContent=rule==='collect'?'Coleta processada':rule==='win'?'Vitória validada':rule==='lock'?'Acesso negado':'Estado inicial';
   demo.querySelectorAll('[data-tm-rule]').forEach(node=>node.classList.toggle('tm-pro-rule-active',node.dataset.tmRule===rule));
   if(trace){const item=document.createElement('li');item.textContent=gems+'/3 · '+(won?'vitória':gems===3?'porta liberada':'porta fechada');trace.appendChild(item);while(trace.children.length>6)trace.removeChild(trace.firstElementChild)}
  }
  demo.querySelectorAll('[data-tm1]').forEach(button=>button.addEventListener('click',()=>{
   if(button.dataset.tm1==='reset'){gems=0;won=false;if(trace)trace.textContent='';update('S = {cristais: 0, fase: EXPLORAR}. Reinício do simulador local.','');return}
   if(won){update('A partida já foi concluída. Reinicie para jogar novamente.','win');return}
   if(button.dataset.tm1==='collect'){if(gems<3)gems++;update(gems===3?'Terceiro cristal coletado: a porta está liberada.':'Cristal coletado: contador atualizado.','collect');return}
   if(gems===3){won=true;update('Condição verdadeira: cristais ≥ 3. A porta abriu.','win')}
   else update('Condição falsa: faltam '+(3-gems)+' cristais. A porta continua fechada.','lock');
  }));
 }
 content.querySelectorAll('[data-tm-test]').forEach(button=>button.addEventListener('click',()=>{
  const gems=Number(button.dataset.tmTest),pass=gems===3;
  const output=content.querySelector('#tm1TestResult');
  if(output){output.textContent='Simulação local · Entrada: '+gems+'/3 · Esperado: '+(pass?'ABERTA':'FECHADA')+' · Obtido: '+(pass?'ABERTA':'FECHADA')+' · REGRA CONFIRMADA';output.classList.add('tm-pro-test-pass')}
 }));
}
function build(){
 const root=$('mainContent');if(!root)return [];
 const special=pedagogicalDemoSlides(root,missionNumber());
 if(special)return special;
 const heading=$('missionTitle')?.textContent||'PIT GAME JAM IA';
 const cards=[...root.querySelectorAll(CARD_SELECTOR)].filter(node=>!node.closest('.pit-private-teacher-notes,[data-private-note],.teacher-private-note')&&!node.matches('.tm1-root,.tm2-root,.tm3-root'));
 const unique=cards.filter(node=>!cards.some(parent=>parent!==node&&parent.contains(node)));
 const usable=unique.filter(node=>node.textContent.trim().length>=25||node.querySelector('img,canvas,video,svg'));
 const blocks=usable.length?usable:[...root.querySelectorAll('section,article,.tm1-root > *, .tm2-content > *, .tm3-body > *')].filter(node=>node.textContent.trim().length>=35&&!node.querySelector('.pit-private-teacher-notes'));
 return blocks.map((node,n)=>{const copy=node.cloneNode(true);copy.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').forEach(privateNode=>privateNode.remove());return {title:copy.querySelector('h2,h3,h4,strong')?.textContent?.trim().slice(0,95)||heading,html:copy.outerHTML,number:n+1};});
}
function render(){
 if(!overlay)return;
 const slide=slides[index];const content=$('pitProjectorContent');content.classList.remove('pit-projector-enter');void content.offsetWidth;content.innerHTML='<div class="pit-projector-card">'+slide.html+'</div>';activateProjectorControls(content);content.classList.add('pit-projector-enter');
 $('pitProjectorCount').textContent=(index+1)+' / '+slides.length;
 $('pitProjectorTitle').textContent=slide.title;
 $('pitProjectorPrev').disabled=index===0;$('pitProjectorNext').disabled=index===slides.length-1;
 $('pitProjectorProgress').style.width=((index+1)/slides.length*100)+'%';
}
function close(){if(!overlay)return;overlay.remove();overlay=null;document.body.classList.remove('pit-projecting');origin?.focus();}
function move(step){index=Math.max(0,Math.min(slides.length-1,index+step));render();}
function open(){
 if(!eligible())return;
 slides=build();if(!slides.length)return;
 origin=document.activeElement;index=0;
 overlay=document.createElement('div');overlay.id='pitProjector';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Apresentação da missão atual');
 overlay.innerHTML='<div class="pit-projector-top"><div><small>✦ PIT GAME JAM IA · MISSÃO <span id="pitProjectorMission"></span></small><h1 id="pitProjectorTitle"></h1></div><button id="pitProjectorClose" type="button">✕ Encerrar apresentação</button></div><main id="pitProjectorContent" class="pit-projector-slide"></main><footer class="pit-projector-footer"><button id="pitProjectorPrev" type="button">← Anterior</button><div class="pit-projector-meter"><span id="pitProjectorCount"></span><div><i id="pitProjectorProgress"></i></div></div><button id="pitProjectorNext" type="button">Próximo →</button></footer>';
 document.body.appendChild(overlay);document.body.classList.add('pit-projecting');$('pitProjectorMission').textContent=String(missionNumber()).padStart(2,'0');
 $('pitProjectorClose').onclick=close;$('pitProjectorPrev').onclick=()=>move(-1);$('pitProjectorNext').onclick=()=>move(1);
 render();$('pitProjectorClose').focus();
}
document.addEventListener('keydown',e=>{if(!overlay)return;if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();move(1)}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();move(-1)}});
document.addEventListener('click',e=>{if(e.target?.closest?.('#pitProjectorLaunch'))open()});
const button=document.createElement('button');button.id='pitProjectorLaunch';button.type='button';button.innerHTML='<svg class="pit-projector-sigil" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M32 3 40 17 54 12 49 28 60 34 45 39 49 55 33 48 18 59 18 41 4 35 18 27 12 12 27 17Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/><path d="M32 14 42 32 32 50 22 32Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M32 22v20M26 32h12" stroke="currentColor" stroke-width="2.4"/><circle cx="32" cy="32" r="3" fill="#e8a74e"/></svg><span>APRESENTAR <small id="pitProjectorButtonMission">MISSÃO 01</small></span>';button.setAttribute('aria-label','Apresentar aula da missão atual');button.title='Apresentação cinematográfica: um card por slide';
const pane=$('mainPane');if(pane){const head=pane.querySelector('.mainhead');head?.appendChild(button)}
const observer=new MutationObserver(()=>{const active=eligible();button.hidden=!active;if(active&&$('pitProjectorButtonMission'))$('pitProjectorButtonMission').textContent='MISSÃO '+String(missionNumber()).padStart(2,'0');if(overlay&&!active)close()});if($('missionNumber'))observer.observe($('missionNumber'),{childList:true,subtree:true});if($('workspace'))observer.observe($('workspace'),{attributes:true,attributeFilter:['hidden']});button.hidden=!eligible();
})();
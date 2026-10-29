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
 // The live university edition uses .tm-pro-spec-row (not the legacy .tm1-field).
 // Keep every example, acceptance criterion and test case visible, but never private notes.
 if(mission===1&&root.querySelector('.tm-pro-proposal')){
  const fields=[...root.querySelectorAll('.tm-pro-spec .tm-pro-spec-row')];
  if(fields.length!==7)return null;
  const result=[];
  function add(selector,title){
   const node=root.querySelector(selector);
   if(node)result.push({title,html:cleanCopy(node)});
  }
  add('.tm-pro-lead','Da ideia a uma especificação de jogo');
  add('.tm-pro-dossier','Projeto de referência: A Última Chave');
  for(let i=0;i<fields.length;i+=2){
   const group=document.createElement('section');
   group.className='pit-projector-m01-fields pit-projector-m01-pro-fields';
   const heading=document.createElement('h3');
   heading.textContent='Ficha de game design · campos '+(i+1)+'–'+Math.min(i+2,fields.length)+' de 7';
   group.appendChild(heading);
   fields.slice(i,i+2).forEach(field=>group.insertAdjacentHTML('beforeend',cleanCopy(field)));
   result.push({title:heading.textContent,html:group.outerHTML});
  }
  add('.tm-pro-criteria','Da ideia vaga ao requisito testável');
  add('.tm-pro-codepanel','Casos de teste: quando a porta deve abrir?');
  return result.length===8?result:null;
 }
 // M01 / Criar: preserve the complete authorial worksheet in the mirrored presentation.
 // The original generic card extractor misses the seven .tm1-field entries.
 if(mission===1&&root.querySelector('.tm1-planning')){
  const fields=[...root.querySelectorAll('.tm1-workfields .tm1-field')];
  if(fields.length!==7)return null;
  const result=[];
  function add(selector,title){
   const node=root.querySelector(selector);
   if(node)result.push({title,html:cleanCopy(node)});
  }
  add('.tm1-lead','Da ideia à primeira ficha de game design');
  add('.tm1-paper','Exemplo preenchido: uma ideia verificável');
  for(let i=0;i<fields.length;i+=2){
   const group=document.createElement('section');
   group.className='pit-projector-m01-fields';
   fields.slice(i,i+2).forEach(field=>group.insertAdjacentHTML('beforeend',cleanCopy(field)));
   result.push({title:'Ficha autoral · campos '+(i+1)+'–'+Math.min(i+2,fields.length)+' de 7',html:group.outerHTML});
  }
  root.querySelectorAll('.tm1-three article').forEach((node,i)=>
   result.push({title:'A ficha · fragmento '+(i+1)+' de 3',html:cleanCopy(node)}));
  add('.tm1-key','Próxima missão: reduzir a ideia a um MVP');
  return result.length===10?result:null;
 }
 // M03 / Criar: project the three actual GDevelop lab fragments, not just generic cards.
 // Private teacher instructions are deliberately excluded from every slide.
 if(mission===3&&root.querySelector('[data-tm3-phase="practice"]')){
  const cards=[...root.querySelectorAll('.tm3-labcards > .tm3-labcard')];
  if(cards.length!==3)return null;
  const result=[];
  function add(selector,title){
   const node=root.querySelector(selector);
   if(node)result.push({title,html:cleanCopy(node)});
  }
  add('.tm3-lead','Da ficha MVP ao primeiro projeto executável');
  add('.tm3-lab-overview','Entrada, construção e evidência');
  add('.tm3-practical-timing','Laboratório: 4 + 8 + 6 minutos');
  cards.forEach((card,i)=>{
   const copy=card.cloneNode(true);
   // In the projected tutorial, recovery instructions must be readable
   // without asking the class to expand a hidden disclosure.
   copy.querySelectorAll('details').forEach(details=>{
    const visible=document.createElement('section');
    visible.className='pit-projector-diagnostic';
    const label=document.createElement('strong');
    label.textContent=details.querySelector('summary')?.textContent?.trim()||'SE NÃO FUNCIONAR';
    visible.appendChild(label);
    [...details.children].filter(el=>el.tagName!=='SUMMARY').forEach(el=>visible.appendChild(el.cloneNode(true)));
    details.replaceWith(visible);
   });
   result.push({title:'Fragmento '+(i+1)+' de 3 · '+(card.querySelector('h4')?.textContent?.trim()||'GDevelop'),
    html:'<section data-pit-projector-lab="M03:'+(i+1)+'">'+cleanCopy(copy)+'</section>'});
  });
  add('.tm3-asset-inset','Escolher um recurso gratuito sem atrasar a prática');
  add('.tm3-paths','Rotas alternativas: Sprite 2D ou 3D Box');
  const outcome=[...root.querySelectorAll('.tm3-principle')].find(node=>node.textContent.includes('RESULTADO DA MISSÃO 03'));
  if(outcome)result.push({title:'Critério de entrega: Preview e projeto recuperável',html:cleanCopy(outcome)});
  return result.length>=8?result:null;
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
 // M04/Comprovar: project the complete rubric and evidence, not only nested cards.
 // These are public assessment criteria; private HDMI-off guidance is removed.
 if(mission===4&&root.querySelector('.t4v-root[data-t4v-phase="review"]')){
  const source=root.querySelector('.t4v-root[data-t4v-phase="review"]');
  const result=[];
  function add(node,title,id,group){
   if(!node)return;
   const wrapper=document.createElement('section');
   wrapper.className='pit-projector-review-step t4v-root';
   wrapper.dataset.pitProjectorReview='M04:'+id;
   const content=document.createElement('div');content.className='t4v-content';
   if(group){
    const grid=document.createElement('div');grid.className=group;
    grid.innerHTML=cleanCopy(node);content.append(grid);
   }else content.innerHTML=cleanCopy(node);
   wrapper.append(content);
   result.push({title,html:wrapper.outerHTML});
  }
  add(source.querySelector('.t4v-intro'),'Como avaliar uma evidência verificável','intro');
  const criteria=[...source.querySelectorAll('.t4v-rubric > article')];
  criteria.forEach((criterion,i)=>add(criterion,'Critério '+(i+1)+' de 4 · '+(criterion.querySelector('small')?.textContent||'Teste'),'rubric-'+(i+1),'t4v-rubric'));
  add(source.querySelector('.t4v-decisions'),'Decisão: aprovar ou solicitar revisão','decision');
  add(source.querySelector('.t4v-verification'),'Registro, limites e devolutiva','record');
  return criteria.length===4&&result.length===7?result:null;
 }
 if(mission===4&&root.querySelector('#g4Tutorial')){
  const guide=window.PIT_GDEVELOP_M04_GUIDE;
  if(guide?.projectorPanel&&guide.routes?.length){
   const selected=Number(root.querySelector('#g4Tutorial [data-g4-route][aria-selected="true"]')?.dataset.g4Route??0);
   const routeIndex=Number.isInteger(selected)&&guide.routes[selected]?selected:0;
   const route=guide.routes[routeIndex],result=[];
   const heading=root.querySelector('#g4Tutorial .g4-heading');
   if(heading)result.push({title:'Primeiro jogável: movimento e limites',html:cleanCopy(heading)});
   const intro=document.createElement('section');intro.className='pit-projector-route-intro';
   const title=document.createElement('h3');title.textContent='Rota escolhida: '+route.label;
   const description=document.createElement('p');description.textContent=route.intro;
   const criterion=document.createElement('p');criterion.textContent='Objetivo: entrada funcional, um limite observável e três verificações no Preview. As outras rotas são alternativas, não tarefas adicionais.';
   intro.append(title,description,criterion);
   result.push({title:'Rota de construção: '+route.label,html:intro.outerHTML});
   for(let i=0;i<route.steps.length;i++){
    const wrapper=document.createElement('section');
    wrapper.className='pit-projector-tutorial-step pit-projector-g4-step';
    wrapper.dataset.pitProjectorStep='M04:'+i;
    wrapper.innerHTML=guide.projectorPanel(routeIndex,i);
    const diagnostic=wrapper.querySelector('details.g4-diagnostic');
    if(diagnostic){
     const explanation=document.createElement('div');explanation.className='g4-diagnostic pit-projector-diagnostic';
     const label=document.createElement('strong');label.textContent='SE NÃO FUNCIONAR';
     explanation.append(label,...[...diagnostic.querySelectorAll('p')].map(p=>p.cloneNode(true)));
     diagnostic.replaceWith(explanation);
    }
    result.push({title:'Passo '+(i+1)+' · '+route.steps[i].title,html:wrapper.outerHTML});
   }
   const footer=root.querySelector('#g4Tutorial .g4-footer');
   if(footer)result.push({title:'Critério de conclusão e documentação',html:cleanCopy(footer)});
   return result.length>=route.steps.length+2?result:null;
  }
 }

 // M05/Comprovar: preserve public criteria and caveats; never project HDMI-off notes.
 if(mission===5&&root.querySelector('.t5v-root[data-t5v-phase="review"]')){
  const source=root.querySelector('.t5v-root[data-t5v-phase="review"]');
  const result=[];
  function add(node,title,id,group){
   if(!node)return;
   const wrapper=document.createElement('section');
   wrapper.className='pit-projector-review-step t5v-root';
   wrapper.dataset.pitProjectorReview='M05:'+id;
   const content=document.createElement('div');content.className='t5v-content';
   if(group){
    const grid=document.createElement('div');grid.className=group;
    grid.innerHTML=cleanCopy(node);content.append(grid);
   }else content.innerHTML=cleanCopy(node);
   wrapper.append(content);
   result.push({title,html:wrapper.outerHTML});
  }
  add(source.querySelector('.t5v-intro'),'Como comprovar uma regra SE/ENTÃO','intro');
  const criteria=[...source.querySelectorAll('.t5v-rubric > article')];
  criteria.forEach((criterion,i)=>add(criterion,'Critério '+(i+1)+' de 4 · '+(criterion.querySelector('small')?.textContent||'Teste'),'rubric-'+(i+1),'t5v-rubric'));
  add(source.querySelector('.t5v-decisions'),'Decisão: aprovar ou solicitar revisão','decision');
  add(source.querySelector('.t5v-verification'),'Registro no painel e limites da evidência','record');
  return criteria.length===4&&result.length===7?result:null;
 }
 if(mission===5&&root.querySelector('#m5Guide')){
  const guide=window.PIT_GDEVELOP_M05_GUIDE;
  if(guide?.projectorPanel&&guide.guideSteps?.length===5&&guide.routes?.length){
   const selected=Number(root.querySelector('#m5Guide [data-m5g-route][aria-selected="true"]')?.dataset.m5gRoute??0);
   const routeIndex=Number.isInteger(selected)&&guide.routes[selected]?selected:0;
   const route=guide.routes[routeIndex],result=[];
   const heading=root.querySelector('#m5Guide .m5g-head');
   if(heading)result.push({title:'A primeira regra: eventos SE/ENTÃO',html:cleanCopy(heading)});
   const intro=document.createElement('section');intro.className='pit-projector-route-intro';
   for(const [tag,value] of [['h3','Rota escolhida: '+route.label],['p','Condição: '+route.condition],['p','Ação: '+route.actions],['p','No Preview, a regra só pode ativar quando a condição for verdadeira. As rotas são alternativas.']]){
    const node=document.createElement(tag);node.textContent=value;intro.append(node);
   }
   result.push({title:'Regra do projeto: '+route.label,html:intro.outerHTML});
   for(let i=0;i<guide.guideSteps.length;i++){
    const wrapper=document.createElement('section');
    wrapper.className='pit-projector-tutorial-step pit-projector-g5-step';
    wrapper.dataset.pitProjectorStep='M05:'+i;
    wrapper.innerHTML=guide.projectorPanel(routeIndex,i);
    wrapper.querySelector('.m5g-controls')?.remove();
    const diagnostic=wrapper.querySelector('.m5g-guide details');
    if(diagnostic){
     const visible=document.createElement('div');visible.className='pit-projector-diagnostic';
     const label=document.createElement('strong');label.textContent='SE NÃO FUNCIONAR';
     visible.append(label,...[...diagnostic.querySelectorAll('p')].map(x=>x.cloneNode(true)));
     diagnostic.replaceWith(visible);
    }
    result.push({title:'Passo '+(i+1)+' · '+guide.guideSteps[i].title,html:wrapper.outerHTML});
   }
   const check=root.querySelector('#m5Guide .m5g-check');
   if(check)result.push({title:'Teste negativo e repetição no Preview',html:cleanCopy(check)});
   const footer=root.querySelector('#m5Guide .m5g-footer');
   if(footer)result.push({title:'Fontes e cuidados com eventos 3D',html:cleanCopy(footer)});
   return result.length>=guide.guideSteps.length+2?result:null;
  }
 }
 if(mission===7&&root.querySelector('#g7Guide')){
  const guide=window.PIT_GDEVELOP_M07_GUIDE;
  if(guide?.projectorCard&&guide.routes?.length===2){
   const selected=Number(root.querySelector('#g7Guide [data-g7-route][aria-selected="true"]')?.dataset.g7Route??0);
   const routeIndex=Number.isInteger(selected)&&guide.routes[selected]?selected:0;
   const route=guide.routes[routeIndex],result=[];
   const heading=root.querySelector('#g7Guide header');
   if(heading)result.push({title:'Do desafio à conclusão verificável',html:cleanCopy(heading)});
   const intro=document.createElement('section');intro.className='pit-projector-route-intro';
   for(const [tag,value] of [['h3','Rota escolhida: '+route.label],['p','Mecânica: '+route.type],['p','Objetivo: início jogável → desafio com condição real → conclusão visível. Rotas 2D e 3D são alternativas.']]){
    const node=document.createElement(tag);node.textContent=value;intro.append(node);
   }
   result.push({title:'Condição de vitória: '+route.label,html:intro.outerHTML});
   for(let i=0;i<route.steps.length;i++){
    const wrapper=document.createElement('section');
    wrapper.className='pit-projector-tutorial-step pit-projector-g7-step';
    wrapper.dataset.pitProjectorStep='M07:'+i;
    wrapper.innerHTML=guide.projectorCard(routeIndex,i);
    if(!wrapper.querySelector('.g7-card'))continue;
    result.push({title:'Passo '+(i+1)+' · '+route.steps[i].title,html:wrapper.outerHTML});
   }
   const footer=root.querySelector('#g7Guide footer');
   if(footer)result.push({title:'Plano B e limites das capturas',html:cleanCopy(footer)});
   return result.length>=route.steps.length+2?result:null;
  }
 }
 return null;
}
function activateProjectorControls(content){
 // Cloned tutorial images do not inherit the original tab component's error listeners.
 content.querySelectorAll('[data-gd3-image],[data-tm-guide-image],[data-g4-image],[data-m5g-image],[data-g7-shot]').forEach(img=>{
  const fallback=()=>{
   if(img.dataset.pitProjectorFallback)return;
   img.dataset.pitProjectorFallback='1';
   img.src=img.hasAttribute('data-g7-shot')?(window.PIT_GDEVELOP_M07_GUIDE?.fallback||'./v3/assets/guide/gdevelop-eventos-pt.svg'):img.hasAttribute('data-m5g-image')?(window.PIT_GDEVELOP_M05_GUIDE?.fallback||'./v3/assets/guide/gdevelop-eventos-pt.svg'):img.hasAttribute('data-g4-image')?(window.PIT_GDEVELOP_M04_GUIDE?.fallback||'./v3/assets/guide/gdevelop-m04-movimento-limites-pt.svg'):img.hasAttribute('data-gd3-image')?(window.PIT_GDEVELOP_FIRST_RUN?.localFallback||'./v3/assets/guide/gdevelop-inicio-pt.svg'):'./v3/assets/guide/gdevelop-eventos-pt.svg';
   img.alt='Diagrama didático autoral em português; captura externa indisponível';
   const caption=img.closest('.gd3-picture,.tm-guide-image,.g4-step-picture,.m5g-picture,.g7-card figure')?.querySelector('.gd3-picture-caption span,.tm-guide-image-head span,.g4-picture-label span,.m5g-picture-top strong,.g7-card figcaption span');
   if(caption)caption.textContent='DIAGRAMA AUTORAL · CAPTURA INDISPONÍVEL';
  };
  img.addEventListener('error',fallback);
  if(img.complete&&img.naturalWidth===0)fallback();
 });
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
function updateScrollHint(){
 const content=$('pitProjectorContent'),hint=$('pitProjectorScrollHint');
 if(!content||!hint)return;
 const maxScroll=Math.max(0,content.scrollHeight-content.clientHeight);
 hint.hidden=maxScroll<=12;
 if(!hint.hidden)hint.textContent=maxScroll-content.scrollTop>12?'↓ Há mais conteúdo neste slide · PageDown para ler':'Fim deste slide · PageDown avança';
}
function render(){
 if(!overlay)return;
 const slide=slides[index];const content=$('pitProjectorContent');content.classList.remove('pit-projector-enter');void content.offsetWidth;content.innerHTML='<div class="pit-projector-card">'+slide.html+'</div>';content.scrollTop=0;activateProjectorControls(content);content.classList.add('pit-projector-enter');
 content.querySelectorAll('img').forEach(img=>img.addEventListener('load',updateScrollHint,{once:true}));
 updateScrollHint();
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
 overlay.innerHTML='<div class="pit-projector-top"><div><small>✦ PIT GAME JAM IA · MISSÃO <span id="pitProjectorMission"></span></small><h1 id="pitProjectorTitle"></h1></div><button id="pitProjectorClose" type="button">✕ Encerrar apresentação</button></div><main id="pitProjectorContent" class="pit-projector-slide"></main><footer class="pit-projector-footer"><button id="pitProjectorPrev" type="button">← Anterior</button><div class="pit-projector-meter"><span id="pitProjectorCount"></span><small id="pitProjectorScrollHint" role="status" aria-live="polite" hidden></small><div><i id="pitProjectorProgress"></i></div></div><button id="pitProjectorNext" type="button">Próximo →</button></footer>';
 document.body.appendChild(overlay);document.body.classList.add('pit-projecting');$('pitProjectorMission').textContent=String(missionNumber()).padStart(2,'0');
 $('pitProjectorClose').onclick=close;$('pitProjectorPrev').onclick=()=>move(-1);$('pitProjectorNext').onclick=()=>move(1);
 $('pitProjectorContent').addEventListener('scroll',updateScrollHint,{passive:true});render();$('pitProjectorClose').focus();
}
document.addEventListener('keydown',e=>{if(!overlay)return;if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='ArrowRight'){e.preventDefault();move(1)}
 else if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}
 else if(e.key==='PageDown'||e.key==='PageUp'){
  e.preventDefault();
  const content=$('pitProjectorContent');
  const canScrollDown=e.key==='PageDown'&&content.scrollTop+content.clientHeight<content.scrollHeight-12;
  const canScrollUp=e.key==='PageUp'&&content.scrollTop>12;
  if(canScrollDown||canScrollUp){
   content.scrollTop+=(e.key==='PageDown'?1:-1)*Math.max(160,Math.floor(content.clientHeight*.8));
   updateScrollHint();
  }else move(e.key==='PageDown'?1:-1);
 }});
document.addEventListener('click',e=>{if(e.target?.closest?.('#pitProjectorLaunch'))open()});
const button=document.createElement('button');button.id='pitProjectorLaunch';button.type='button';button.innerHTML='<svg class="pit-projector-sigil" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M32 3 40 17 54 12 49 28 60 34 45 39 49 55 33 48 18 59 18 41 4 35 18 27 12 12 27 17Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/><path d="M32 14 42 32 32 50 22 32Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M32 22v20M26 32h12" stroke="currentColor" stroke-width="2.4"/><circle cx="32" cy="32" r="3" fill="#e8a74e"/></svg><span>APRESENTAR <small id="pitProjectorButtonMission">MISSÃO 01</small></span>';button.setAttribute('aria-label','Apresentar aula da missão atual');button.title='Apresentação cinematográfica: um card por slide';
const pane=$('mainPane');if(pane){const head=pane.querySelector('.mainhead');head?.appendChild(button)}
const observer=new MutationObserver(()=>{const active=eligible();button.hidden=!active;if(active&&$('pitProjectorButtonMission'))$('pitProjectorButtonMission').textContent='MISSÃO '+String(missionNumber()).padStart(2,'0');if(overlay&&!active)close()});if($('missionNumber'))observer.observe($('missionNumber'),{childList:true,subtree:true});if($('workspace'))observer.observe($('workspace'),{attributes:true,attributeFilter:['hidden']});button.hidden=!eligible();
})();
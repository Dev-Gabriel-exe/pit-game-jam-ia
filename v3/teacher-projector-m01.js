/* Cinematic projection for all ten teacher missions; one content card per slide. */
(function(){
'use strict';
let index=0,slides=[],overlay=null,origin=null,projectorResizeObserver=null;
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
    // 720p: show where/how and result/recovery on distinct slides, never shrink away the teaching text.
    const verification=document.createElement('section');
    verification.className='pit-projector-g4-verify';
    verification.dataset.pitProjectorVerify='M04:'+i;
    const verifyTitle=document.createElement('h3');
    verifyTitle.textContent='Conferência '+(i+1)+' de 4 · '+route.steps[i].title;
    verification.append(verifyTitle);
    for(const selector of ['.g4-result','.pit-projector-diagnostic','.g4-source-link']){
     const node=wrapper.querySelector(selector);
     if(node){verification.append(node.cloneNode(true));node.remove();}
    }
    const previewNote=document.createElement('p');
    previewNote.className='pit-projector-g4-verify-reminder';
    previewNote.textContent='Teste no Preview do seu próprio jogo e registre o resultado real. A captura da documentação não comprova o funcionamento.';
    verification.append(previewNote);
    result.push({title:'Passo '+(i+1)+' · Onde clicar e o que fazer',html:wrapper.outerHTML});
    result.push({title:'Passo '+(i+1)+' · Resultado e recuperação',html:verification.outerHTML});
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
    // Split each dense 720p tutorial step into action and verification without losing content.
    const verify=document.createElement('section');
    verify.className='pit-projector-g5-verify';
    verify.dataset.pitProjectorVerify='M05:'+i;
    const heading=document.createElement('h3');
    heading.textContent='Conferência '+(i+1)+' de 5 · '+guide.guideSteps[i].title;
    verify.append(heading);
    const expected=wrapper.querySelector('.m5g-expect');
    const recovery=wrapper.querySelector('.pit-projector-diagnostic');
    if(expected)verify.append(expected.cloneNode(true));
    if(recovery)verify.append(recovery.cloneNode(true));
    const reference=wrapper.querySelector('.m5g-photo-foot a');
    if(reference){
     const sourceLink=document.createElement('p');
     sourceLink.className='pit-projector-g5-verify-source';
     sourceLink.append('Referência técnica: ',reference.cloneNode(true));
     verify.append(sourceLink);
    }
    const reminder=document.createElement('p');
    reminder.className='pit-projector-g5-verify-reminder';
    reminder.textContent='Confira o resultado no Preview do seu jogo. A captura ilustra o editor, mas não comprova a implementação.';
    verify.append(reminder);
    wrapper.querySelector('.m5g-expect')?.remove();
    wrapper.querySelector('.pit-projector-diagnostic')?.remove();
    result.push({title:'Passo '+(i+1)+' · Onde clicar e o que fazer',html:wrapper.outerHTML});
    result.push({title:'Passo '+(i+1)+' · Resultado e recuperação',html:verify.outerHTML});
   }
   const check=root.querySelector('#m5Guide .m5g-check');
   if(check)result.push({title:'Teste negativo e repetição no Preview',html:cleanCopy(check)});
   const footer=root.querySelector('#m5Guide .m5g-footer');
   if(footer)result.push({title:'Fontes e cuidados com eventos 3D',html:cleanCopy(footer)});
   return result.length>=guide.guideSteps.length+2?result:null;
  }
 }
 // M08/Demonstrar: project every step of the selected GDevelop route, not just the active card.
 if(mission===8&&root.querySelector('#g8Guide')){
  const guide=window.PIT_GDEVELOP_M08_GUIDE;
  if(guide?.routes?.length===3){
   const selected=Number(root.querySelector('#g8Guide [data-g8-route][aria-selected="true"]')?.dataset.g8Route??0);
   const routeIndex=Number.isInteger(selected)&&guide.routes[selected]?selected:0;
   const route=guide.routes[routeIndex],result=[];
   if(route.steps?.length!==4)return null;
   const intro=document.createElement('section');intro.className='pit-projector-route-intro pit-projector-g8-intro';
   for(const [tag,value] of [['h3','Rota: '+route.label],['p','Escolha apenas uma rota: '+route.type],['p','Mantenha o jogo da Missão 07; registre o ANTES e o DEPOIS no Preview.']]){
    const el=document.createElement(tag);el.textContent=value;intro.append(el);
   }
   result.push({title:'Polimento · '+route.label,html:intro.outerHTML});
   for(let i=0;i<route.steps.length;i++){
    const step=route.steps[i],action=document.createElement('section');
    action.className='pit-projector-g8-step';action.dataset.pitProjectorStep='M08:'+i;
    const heading=document.createElement('h3');heading.textContent='Passo '+(i+1)+' de 4 · '+step.title;
    const figure=document.createElement('figure'),img=document.createElement('img');
    img.setAttribute('data-g8-shot','');img.loading='lazy';img.src=guide.images[step.image]||guide.fallback;
    img.alt='Referência oficial do GDevelop: '+(step.image==='events'?'eventos':'cena');
    const caption=document.createElement('figcaption');caption.textContent='CAPTURA OFICIAL DE REFERÊNCIA · INTERFACE PODE VARIAR';
    figure.append(img,caption);
    const instructions=document.createElement('dl');
    for(const [label,value] of [['ONDE CLICAR',step.where],['O QUE FAZER',step.do]]){
     const dt=document.createElement('dt');dt.textContent=label;
     const dd=document.createElement('dd');dd.textContent=value;instructions.append(dt,dd);
    }
    action.append(heading,figure,instructions);
    result.push({title:'Passo '+(i+1)+' · Onde clicar e o que fazer',html:action.outerHTML});
    const verify=document.createElement('section');
    verify.className='pit-projector-g8-verify';verify.dataset.pitProjectorVerify='M08:'+i;
    const title=document.createElement('h3');title.textContent='Conferência '+(i+1)+' de 4 · '+step.title;verify.append(title);
    for(const [label,value] of [['RESULTADO ESPERADO',step.expect],['SE NÃO FUNCIONAR',step.fix]]){
     const panel=document.createElement('div');
     panel.className=label==='RESULTADO ESPERADO'?'pit-projector-g8-expected':'pit-projector-g8-recovery';
     const strong=document.createElement('strong');strong.textContent=label;
     const p=document.createElement('p');p.textContent=value;panel.append(strong,p);verify.append(panel);
    }
    const source=document.createElement('a');source.href=step.source||guide.docs[step.doc]||guide.docs.events;
    source.target='_blank';source.rel='noopener noreferrer';source.textContent='Documentação oficial do GDevelop';
    const link=document.createElement('p');link.className='pit-projector-g8-source';link.append('Referência: ',source);
    const reminder=document.createElement('p');reminder.className='pit-projector-g8-reminder';
    reminder.textContent='Confira no Preview do seu jogo: a captura não comprova o teste. Registre ANTES, DEPOIS e caso negativo.';
    verify.append(link,reminder);
    result.push({title:'Passo '+(i+1)+' · Resultado e recuperação',html:verify.outerHTML});
   }
   const footer=root.querySelector('#g8Guide footer');
   if(footer)result.push({title:'Critério de aceite e plano B offline',html:cleanCopy(footer)});
   return result.length===10?result:null;
  }
 }
 // M10/Demonstrar: the shared GDevelop guide has four steps per route.
 // A cloned active tab omits saving, re-opening and independent access checks.
 // Project the selected route as public action/verification pairs; no teacher procedure.
 if(mission===10&&root.querySelector('#g10Guide')){
  const guide=window.PIT_GDEVELOP_M10_GUIDE;
  if(guide?.routes?.length===3){
   const selected=Number(root.querySelector('#g10Guide [data-g10-route][aria-selected="true"]')?.dataset.g10Route??0);
   const routeIndex=Number.isInteger(selected)&&guide.routes[selected]?selected:0;
   const route=guide.routes[routeIndex],result=[];
   if(route.steps?.length!==4)return null;
   const intro=document.createElement('section');
   intro.className='pit-projector-g10-intro';
   intro.dataset.pitProjectorM10='intro';
   const title=document.createElement('h3');title.textContent='Entrega final · '+route.label;
   const explain=document.createElement('p');explain.textContent=route.intro+' O projeto editável é obrigatório em qualquer rota; publicação pública é opcional.';
   intro.append(title,explain);
   result.push({title:'Lançamento · escolha uma rota gratuita',html:intro.outerHTML});
   for(let i=0;i<route.steps.length;i++){
    const step=route.steps[i];
    function panel(kind,entries){
     const section=document.createElement('section');
     section.className='pit-projector-g10-'+kind;
     section.dataset.pitProjectorM10=kind+':'+i;
     const h=document.createElement('h3');h.textContent=(kind==='action'?'Passo ':'Conferência ')+(i+1)+' de 4 · '+step.title;
     const dl=document.createElement('dl');
     for(const [label,value] of entries){
      const dt=document.createElement('dt');dt.textContent=label;
      const dd=document.createElement('dd');dd.textContent=value;
      dl.append(dt,dd);
     }
     section.append(h,dl);
     return section;
    }
    const action=panel('action',[['ONDE CLICAR',step.where],['O QUE FAZER',step.do]]);
    const verify=panel('verify',[['RESULTADO A VERIFICAR',step.result],['SE NÃO FUNCIONAR',step.fix]]);
    const source=document.createElement('a');source.href=step.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Documentação oficial GDevelop';
    const note=document.createElement('p');note.textContent='Confirme no Preview ou no acesso realmente disponível; esta apresentação não executa nem publica o jogo.';
    verify.append(source,note);
    result.push({title:'Passo '+(i+1)+' · Salvar e preparar',html:action.outerHTML});
    result.push({title:'Conferência '+(i+1)+' · Testar e recuperar',html:verify.outerHTML});
   }
   const footer=document.createElement('section');
   footer.className='pit-projector-g10-footer';footer.dataset.pitProjectorM10='footer';
   const finalTitle=document.createElement('h3');finalTitle.textContent='Entrega verificável, sem publicação obrigatória';
   const finalText=document.createElement('p');finalText.textContent='Mostre início, controle, regra SE/ENTÃO, conclusão, decisão do playtest e local da cópia editável com assets. Não exponha PINs, dados pessoais ou links não autorizados. A aprovação depende de revisão real.';
   footer.append(finalTitle,finalText);
   result.push({title:'O que apresentar e comprovar',html:footer.outerHTML});
   return result.length===10?result:null;
  }
 }
 // M10/Comprovar: the six public release criteria must be legible on HDMI.
 // Never clone the collapsed teacher-only guidance into projected content.
 if(mission===10&&root.querySelector('#t10vRoot .t10v-rubric')){
  const source=root.querySelector('#t10vRoot');
  const criteria=[...source.querySelectorAll('.t10v-rubric > article')];
  if(criteria.length===6){
   const result=[];
   function add(node,title,id,isCriterion){
    if(!node)return;
    const wrapper=document.createElement('section');
    wrapper.className='t10v-root pit-projector-m10-review';
    wrapper.dataset.pitProjectorM10Review='M10:'+id;
    if(isCriterion){
     const rubric=document.createElement('div');
     rubric.className='t10v-rubric';
     rubric.innerHTML=cleanCopy(node);
     wrapper.append(rubric);
    }else wrapper.innerHTML=cleanCopy(node);
    result.push({title,html:wrapper.outerHTML});
   }
   add(source.querySelector('header'),'Entrega final: o que será verificado','intro',false);
   criteria.forEach((node,i)=>add(node,'Critério '+(i+1)+' de 6 · '+(node.querySelector('h3')?.textContent||'Entrega'),'criterion-'+(i+1),true));
   add(source.querySelector('footer'),'Aprovação e conquista exigem verificação real','footer',false);
   return result.length===8?result:null;
  }
 }
 // M09/Demonstrar: split all three fictitious triage cases into readable public
 // projection screens. Do not imply a human test or reveal HDMI-off notes.
 if(mission===9&&root.querySelector('#t9Foundations .t9-tabs')){
  const guide=window.PIT_TEACHER_MISSION_NINE_FOUNDATIONS;
  const source=root.querySelector('#t9Foundations');
  if(guide?.caseHtml&&guide.cases?.length===3){
   const result=[];
   function add(node,title,id){
    if(!node)return;
    const wrapper=document.createElement('section');
    wrapper.className='t9-root pit-projector-m09-demo';
    wrapper.dataset.pitProjectorM09Demo='M09:'+id;
    wrapper.innerHTML=cleanCopy(node);
    result.push({title,html:wrapper.outerHTML});
   }
   add(source.querySelector('header'),'Triagem: três cenários fictícios, não testes reais','intro');
   for(let i=0;i<guide.cases.length;i++){
    const holder=document.createElement('div');
    holder.innerHTML=guide.caseHtml(i);
    const original=holder.querySelector('.t9-case');
    if(!original)continue;
    const label='Caso '+String.fromCharCode(65+i);
    const action=document.createElement('article');
    action.className='t9-case pit-projector-m09-action';
    for(const selector of ['small','h3','.t9-steps']){
     const part=original.querySelector(selector);
     if(part)action.append(part.cloneNode(true));
    }
    add(action,label+' · Hipótese e reprodução','case-'+(i+1)+'-action');
    const observation=document.createElement('article');
    observation.className='t9-case pit-projector-m09-observation';
    const title=document.createElement('h3');
    title.textContent=label+' · Esperado, observado e impacto';
    observation.append(title);
    const comparison=original.querySelector('dl');
    if(comparison)observation.append(comparison.cloneNode(true));
    add(observation,label+' · Evidência fictícia para comparar','case-'+(i+1)+'-observation');
    const decision=document.createElement('article');
    decision.className='t9-case pit-projector-m09-decision';
    const heading=document.createElement('h3');
    heading.textContent=label+' · Prioridade e próxima ação';
    decision.append(heading);
    const priority=original.querySelector('.t9-priority');
    if(priority)decision.append(priority.cloneNode(true));
    add(decision,label+' · Decisão e recuperação','case-'+(i+1)+'-decision');
   }
   add(source.querySelector('footer'),'Demonstração não substitui playtest entre colegas','footer');
   return result.length===11?result:null;
  }
 }
 // M09/Comprovar: one public rubric criterion per projected screen.
 // The HDMI-off teacher procedure is deliberately excluded by cleanCopy.
 if(mission===9&&root.querySelector('#t9vRoot .t9v-rubric')){
  const source=root.querySelector('#t9vRoot');
  const criteria=[...source.querySelectorAll('.t9v-rubric > article')];
  const decisions=[...source.querySelectorAll('.t9v-decisions > article')];
  if(criteria.length===5&&decisions.length===2){
   const result=[];
   function add(node,title,id,group){
    if(!node)return;
    const wrapper=document.createElement('section');
    wrapper.className='t9v-root pit-projector-m09-review';
    wrapper.dataset.pitProjectorM09Review='M09:'+id;
    if(group){
     const grid=document.createElement('div');
     grid.className=group;
     grid.innerHTML=cleanCopy(node);
     wrapper.append(grid);
    }else wrapper.innerHTML=cleanCopy(node);
    result.push({title,html:wrapper.outerHTML});
   }
   add(source.querySelector('header'),'Critérios públicos da Missão 09','intro');
   criteria.forEach((node,i)=>add(node,'Critério '+(i+1)+' de 5 · '+(node.querySelector('small')?.textContent||'Playtest'),'criterion-'+(i+1),'t9v-rubric'));
   decisions.forEach((node,i)=>add(node,i===0?'Quando aprovar após verificar':'Quando solicitar revisão','decision-'+(i+1),'t9v-decisions'));
   add(source.querySelector('footer'),'O relatório não substitui o Preview real','footer');
   return result.length===9?result:null;
  }
 }
 // M09/Criar: restore the public peer-playtest protocol and evidence; never HDMI-off notes.
 if(mission===9&&root.querySelector('#t9vRoot .t9v-work')){
  const source=root.querySelector('#t9vRoot');
  const tasks=[...source.querySelectorAll('.t9v-work > article')];
  if(tasks.length===3){
   const result=[];
   function add(node,title,id,asTask){
    if(!node)return;
    const wrapper=document.createElement('section');
    wrapper.className='t9v-root pit-projector-m09-practice';
    wrapper.dataset.pitProjectorPractice='M09:'+id;
    if(asTask){
     const work=document.createElement('div');
     work.className='t9v-work';
     work.innerHTML=cleanCopy(node);
     wrapper.append(work);
    }else wrapper.innerHTML=cleanCopy(node);
    result.push({title,html:wrapper.outerHTML});
   }
   add(source.querySelector('header'),'Playtest cruzado: observação real em 16 minutos','intro',false);
   tasks.forEach((task,i)=>add(task,'Playtest · etapa '+(i+1)+' de 3 · '+(task.querySelector('h3')?.textContent||'Prática'),'step-'+(i+1),true));
   const evidence=document.createElement('section');
   evidence.className='t9v-root pit-projector-m09-practice';
   evidence.dataset.pitProjectorPractice='M09:evidence';
   const heading=document.createElement('h3');
   heading.textContent='O que o aluno registra como evidência';
   const checklist=document.createElement('p');
   checklist.textContent='Testador anônimo · Hipótese · Tarefa · Esperado · Observado · Reprodução · Impacto · Decisão · Projeto editável.';
   evidence.append(heading,checklist);
   const footer=source.querySelector('footer');
   if(footer)evidence.insertAdjacentHTML('beforeend',cleanCopy(footer));
   result.push({title:'Evidência observável, sem inventar testes',html:evidence.outerHTML});
   return result.length===5?result:null;
  }
 }
 // M08/Entender: preserve all six UX concepts and the interactive before/after comparison.
 if(mission===8&&root.querySelector('#t8Foundations')){
  const source=root.querySelector('#t8Foundations'),concepts=[...source.querySelectorAll('.t8f-concepts > article')];
  if(concepts.length===6&&source.querySelector('.t8f-scene')){
   const result=[];
   function add(node,title,id){
    if(!node)return;
    const wrapper=document.createElement('section');
    wrapper.className='t8f-root pit-projector-m08-briefing';
    wrapper.dataset.pitProjectorBriefing='M08:'+id;
    wrapper.innerHTML=cleanCopy(node);
    result.push({title,html:wrapper.outerHTML});
   }
   add(source.querySelector('header'),'Polimento é comunicação, não decoração','intro');
   concepts.forEach((node,i)=>add(node,'UX '+(i+1)+' de 6 · '+(node.querySelector('h3')?.textContent||'Conceito'),'concept-'+(i+1)));
   add(source.querySelector('.t8f-lab > div:first-child'),'Antes/depois: o que a simulação demonstra','simulation-intro');
   const demo=document.createElement('section');
   demo.className='t8f-root pit-projector-m08-briefing';
   demo.dataset.pitProjectorBriefing='M08:simulation';
   const lab=document.createElement('section');lab.className='t8f-lab';
   for(const selector of ['.t8f-modes','.t8f-scene']){
    const node=source.querySelector(selector);
    if(node)lab.insertAdjacentHTML('beforeend',cleanCopy(node));
   }
   demo.append(lab);
   result.push({title:'Simulador interativo: interface antes e depois',html:demo.outerHTML});
   add(source.querySelector('.t8f-accept'),'Critério: uma melhoria real no próprio jogo','accept');
   add(source.querySelector('footer'),'Evidência: Preview real, não simulação','evidence');
   return result.length===11?result:null;
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
 content.querySelectorAll('[data-gd3-image],[data-tm-guide-image],[data-g4-image],[data-m5g-image],[data-g7-shot],[data-g8-shot]').forEach(img=>{
  const fallback=()=>{
   if(img.dataset.pitProjectorFallback)return;
   img.dataset.pitProjectorFallback='1';
   img.src=img.hasAttribute('data-g8-shot')?(window.PIT_GDEVELOP_M08_GUIDE?.fallback||'./v3/assets/guide/gdevelop-eventos-pt.svg'):img.hasAttribute('data-g7-shot')?(window.PIT_GDEVELOP_M07_GUIDE?.fallback||'./v3/assets/guide/gdevelop-eventos-pt.svg'):img.hasAttribute('data-m5g-image')?(window.PIT_GDEVELOP_M05_GUIDE?.fallback||'./v3/assets/guide/gdevelop-eventos-pt.svg'):img.hasAttribute('data-g4-image')?(window.PIT_GDEVELOP_M04_GUIDE?.fallback||'./v3/assets/guide/gdevelop-m04-movimento-limites-pt.svg'):img.hasAttribute('data-gd3-image')?(window.PIT_GDEVELOP_FIRST_RUN?.localFallback||'./v3/assets/guide/gdevelop-inicio-pt.svg'):'./v3/assets/guide/gdevelop-eventos-pt.svg';
   img.alt='Diagrama didático autoral em português; captura externa indisponível';
   const caption=img.closest('.gd3-picture,.tm-guide-image,.g4-step-picture,.m5g-picture,.g7-card figure,.pit-projector-g8-step figure')?.querySelector('.gd3-picture-caption span,.tm-guide-image-head span,.g4-picture-label span,.m5g-picture-top strong,.g7-card figcaption span,.pit-projector-g8-step figcaption');
   if(caption)caption.textContent='DIAGRAMA AUTORAL · CAPTURA INDISPONÍVEL';
  };
  img.addEventListener('error',fallback);
  if(img.complete&&img.naturalWidth===0)fallback();
 });
 const ux=content.querySelector('.pit-projector-m08-briefing[data-pit-projector-briefing="M08:simulation"]');
 if(ux){
  let mode='raw';
  const scene=ux.querySelector('[data-t8f-scene]'),objective=ux.querySelector('#t8fObjective');
  const controls=ux.querySelector('#t8fControls'),status=ux.querySelector('#t8fStatus'),message=ux.querySelector('#t8fMessage');
  function update(){
   if(scene)scene.dataset.t8fScene=mode;
   if(objective)objective.textContent=mode==='polished'?'Objetivo: coletar cristal e abrir a porta':'Objetivo desconhecido';
   if(controls)controls.textContent=mode==='polished'?'Controles: setas/WASD e interação':'Controles não indicados';
   if(status)status.textContent='AGUARDANDO AÇÃO';
   if(message)message.textContent='Execute uma ação e observe a diferença.';
  }
  ux.querySelectorAll('input[name="t8fMode"]').forEach(input=>input.addEventListener('change',()=>{
   if(input.checked){mode=input.value;update()}
  }));
  ux.querySelectorAll('[data-t8f-action]').forEach(button=>button.addEventListener('click',()=>{
   const response=window.PIT_TEACHER_MISSION_EIGHT_FOUNDATIONS?.feedback?.(mode,button.dataset.t8fAction);
   if(response&&status&&message){status.textContent=response.status;message.textContent=response.message}
  }));
  update();
 }
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
function close(){
 if(!overlay)return;
 projectorResizeObserver?.disconnect();projectorResizeObserver=null;
 window.removeEventListener('resize',updateScrollHint);
 overlay.remove();overlay=null;document.body.classList.remove('pit-projecting');origin?.focus();
}
function move(step){index=Math.max(0,Math.min(slides.length-1,index+step));render();}
function open(){
 if(!eligible())return;
 slides=build();if(!slides.length)return;
 origin=document.activeElement;index=0;
 overlay=document.createElement('div');overlay.id='pitProjector';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Apresentação da missão atual');
 overlay.innerHTML='<div class="pit-projector-top"><div><small>✦ PIT GAME JAM IA · MISSÃO <span id="pitProjectorMission"></span></small><h1 id="pitProjectorTitle"></h1></div><button id="pitProjectorClose" type="button">✕ Encerrar apresentação</button></div><main id="pitProjectorContent" class="pit-projector-slide"></main><footer class="pit-projector-footer"><button id="pitProjectorPrev" type="button">← Anterior</button><div class="pit-projector-meter"><span id="pitProjectorCount"></span><small id="pitProjectorScrollHint" role="status" aria-live="polite" hidden></small><div><i id="pitProjectorProgress"></i></div></div><button id="pitProjectorNext" type="button">Próximo →</button></footer>';
 document.body.appendChild(overlay);document.body.classList.add('pit-projecting');$('pitProjectorMission').textContent=String(missionNumber()).padStart(2,'0');
 $('pitProjectorClose').onclick=close;$('pitProjectorPrev').onclick=()=>move(-1);$('pitProjectorNext').onclick=()=>move(1);
 const content=$('pitProjectorContent');
 content.addEventListener('scroll',updateScrollHint,{passive:true});
 // HDMI/projector resolution changes and dynamic content heights must refresh the reading hint.
 if(typeof ResizeObserver==='function'){
  projectorResizeObserver=new ResizeObserver(updateScrollHint);
  projectorResizeObserver.observe(content);
 }
 window.addEventListener('resize',updateScrollHint);
 render();$('pitProjectorClose').focus();
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
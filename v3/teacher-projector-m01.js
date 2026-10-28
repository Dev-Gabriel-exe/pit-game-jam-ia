/* Prototype: cinematic projection for teacher Mission 01 only. */
(function(){
'use strict';
let index=0,slides=[],overlay=null,origin=null;
const $=id=>document.getElementById(id);
function eligible(){return document.body.dataset.role==='teacher'&&$('missionNumber')?.textContent.includes('MISSÃO 01')&&!$('workspace')?.hidden;}
function build(){
 const root=$('mainContent');if(!root)return [];
 const chapter=root.querySelector('.tm1-root');if(!chapter)return [];
 const heading=$('missionTitle')?.textContent||'O CHAMADO';
 const items=[...chapter.querySelectorAll('.tm1-hero-line,.tm1-concept,.tm1-key,.tm1-section > :not(.tm1-section-heading):not(.tm1-concepts),.tm1-section > .tm1-concepts > *')];
 const unique=items.filter(e=>!items.some(child=>child!==e&&e.contains(child)));
 return unique.map((node,n)=>({title:node.querySelector('h3,h2')?.textContent||heading,html:node.outerHTML,number:n+1}));
}
function render(){
 if(!overlay)return;
 const slide=slides[index];$('pitProjectorContent').innerHTML=slide.html;
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
 overlay=document.createElement('div');overlay.id='pitProjector';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Apresentação da Missão 01');
 overlay.innerHTML='<div class="pit-projector-top"><div><small>✦ PIT GAME JAM IA · MISSÃO 01</small><h1 id="pitProjectorTitle"></h1></div><button id="pitProjectorClose" type="button">✕ Encerrar apresentação</button></div><main id="pitProjectorContent" class="pit-projector-slide"></main><footer class="pit-projector-footer"><button id="pitProjectorPrev" type="button">← Anterior</button><div class="pit-projector-meter"><span id="pitProjectorCount"></span><div><i id="pitProjectorProgress"></i></div></div><button id="pitProjectorNext" type="button">Próximo →</button></footer>';
 document.body.appendChild(overlay);document.body.classList.add('pit-projecting');
 $('pitProjectorClose').onclick=close;$('pitProjectorPrev').onclick=()=>move(-1);$('pitProjectorNext').onclick=()=>move(1);
 render();$('pitProjectorClose').focus();
}
document.addEventListener('keydown',e=>{if(!overlay)return;if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();move(1)}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();move(-1)}});
document.addEventListener('click',e=>{if(e.target?.id==='pitProjectorLaunch')open()});
const button=document.createElement('button');button.id='pitProjectorLaunch';button.type='button';button.innerHTML='<svg class="pit-projector-sigil" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M32 3 40 17 54 12 49 28 60 34 45 39 49 55 33 48 18 59 18 41 4 35 18 27 12 12 27 17Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/><path d="M32 14 42 32 32 50 22 32Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M32 22v20M26 32h12" stroke="currentColor" stroke-width="2.4"/><circle cx="32" cy="32" r="3" fill="#e8a74e"/></svg><span>APRESENTAR <small>MISSÃO 01</small></span>';button.setAttribute('aria-label','Apresentar aula da Missão 01');button.title='Protótipo exclusivo da Missão 01';
const pane=$('mainPane');if(pane){const head=pane.querySelector('.mainhead');head?.appendChild(button)}
const observer=new MutationObserver(()=>{const active=eligible();button.hidden=!active;if(overlay&&!active)close()});if($('missionNumber'))observer.observe($('missionNumber'),{childList:true,subtree:true});if($('workspace'))observer.observe($('workspace'),{attributes:true,attributeFilter:['hidden']});button.hidden=!eligible();
})();
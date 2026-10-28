/* Cinematic projection for all ten teacher missions; one content card per slide. */
(function(){
'use strict';
let index=0,slides=[],overlay=null,origin=null;
const CARD_SELECTOR=['.tm1-hero-line','.tm1-concept','.tm1-key','.tm2-intro','.tm2-concept','.tm2-requirement','.tm3-lead','.tm3-concept','.tm3-principle','.tm3-comparison','.tm4f-card','.tm5-concept','.f6-card','.f6-scope','[class*="-concept-card"]','[class*="-theory-card"]','.t7f-concepts > *','.t8f-concepts > *','.t9-concepts > *','.t10-concepts > *','article','[class*="-card"]'].join(',');
function missionNumber(){const match=($('missionNumber')?.textContent||'').match(/MISSÃO\s+(\d+)/i);return match?Number(match[1]):0;}
const $=id=>document.getElementById(id);
function eligible(){return document.body.dataset.role==='teacher'&&missionNumber()>=1&&missionNumber()<=10&&!$('workspace')?.hidden;}
function build(){
 if(missionNumber()===1&&window.PIT_M01_PROJECTOR?.build)return window.PIT_M01_PROJECTOR.build();
 if(missionNumber()>=2&&window.PIT_PROJECTOR_UNIVERSAL?.build)return window.PIT_PROJECTOR_UNIVERSAL.build(missionNumber());
 const root=$('mainContent');if(!root)return [];
 const heading=$('missionTitle')?.textContent||'PIT GAME JAM IA';
 const cards=[...root.querySelectorAll(CARD_SELECTOR)].filter(node=>!node.closest('.pit-private-teacher-notes,[data-private-note],.teacher-private-note')&&!node.matches('.tm1-root,.tm2-root,.tm3-root'));
 const unique=cards.filter(node=>!cards.some(parent=>parent!==node&&parent.contains(node)));
 const usable=unique.filter(node=>node.textContent.trim().length>=25||node.querySelector('img,canvas,video,svg'));
 const blocks=usable.length?usable:[...root.querySelectorAll('section,article,.tm1-root > *, .tm2-content > *, .tm3-body > *')].filter(node=>node.textContent.trim().length>=35&&!node.querySelector('.pit-private-teacher-notes'));
 return blocks.map((node,n)=>{const copy=node.cloneNode(true);copy.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').forEach(privateNode=>privateNode.remove());return {title:copy.querySelector('h2,h3,h4,strong')?.textContent?.trim().slice(0,95)||heading,html:copy.outerHTML,number:n+1};});
}
function render(){
 if(!overlay)return;
 const slide=slides[index];const content=$('pitProjectorContent');const isM01=Boolean(slide.section&&missionNumber()>=1&&missionNumber()<=10);
 overlay.classList.toggle('pit-projector-m01',isM01);
 const sectionOpening=isM01&&(index===0||slide.html.includes('pit-u-cover'));
 const code=String(missionNumber()).padStart(2,'0');
 const prefix=sectionOpening?'<div class="pit-projector-motion" aria-hidden="true"><video muted loop playsinline preload="none" poster="./v3/assets/missions/missao-'+code+'.webp" src="./v3/assets/missions/missao-'+code+'-motion.mp4"></video></div>':'';
 content.classList.toggle('pit-projector-has-motion',sectionOpening);
 content.classList.remove('pit-projector-enter');void content.offsetWidth;content.innerHTML=prefix+'<div class="pit-projector-card">'+slide.html+'</div>';content.scrollTop=0;content.classList.add('pit-projector-enter');
 if(sectionOpening&&new URLSearchParams(location.search).get('motion')!=='off'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.connection?.saveData){
   content.querySelector('.pit-projector-motion video')?.play().catch(()=>{});
 }
 if(isM01&&missionNumber()===1&&window.PIT_M01_PROJECTOR?.mount)window.PIT_M01_PROJECTOR.mount(content,slide);
 if(isM01&&missionNumber()>1&&window.PIT_PROJECTOR_UNIVERSAL?.mount)window.PIT_PROJECTOR_UNIVERSAL.mount(content,slide);
 $('pitProjectorMission').textContent=isM01?String(missionNumber()).padStart(2,'0')+' · '+slide.section:String(missionNumber()).padStart(2,'0');
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
const button=document.createElement('button');button.id='pitProjectorLaunch';button.type='button';button.innerHTML='<svg class="pit-projector-sigil" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M32 3 40 17 54 12 49 28 60 34 45 39 49 55 33 48 18 59 18 41 4 35 18 27 12 12 27 17Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/><path d="M32 14 42 32 32 50 22 32Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M32 22v20M26 32h12" stroke="currentColor" stroke-width="2.4"/><circle cx="32" cy="32" r="3" fill="#e8a74e"/></svg><span>APRESENTAR <small id="pitProjectorButtonMission">MISSÃO 01</small></span>';button.setAttribute('aria-label','Apresentar aula da missão atual');button.title='Aula completa em sequência contínua na Missão 01; outras missões preservadas';
const pane=$('mainPane');if(pane){const head=pane.querySelector('.mainhead');head?.appendChild(button)}
const observer=new MutationObserver(()=>{const active=eligible();button.hidden=!active;if(active&&$('pitProjectorButtonMission'))$('pitProjectorButtonMission').textContent='MISSÃO '+String(missionNumber()).padStart(2,'0');if(overlay&&!active)close()});if($('missionNumber'))observer.observe($('missionNumber'),{childList:true,subtree:true});if($('workspace'))observer.observe($('workspace'),{attributes:true,attributeFilter:['hidden']});button.hidden=!eligible();
})();
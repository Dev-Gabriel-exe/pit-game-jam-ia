/* Portal cinematográfico — LTX original da própria Game Jam, sem rastreamento. */
(function(){
'use strict';
const body=document.body;
const hero=document.getElementById('inicio');
const media=document.querySelector('.pit-hero-media');
const video=document.getElementById('pitPortalHeroVideo');
const control=document.getElementById('pitPortalMotion');
if(!body||!hero||!media||!video||!control)return;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const params=new URLSearchParams(location.search);
let userOn=params.get('motion')!=='off';
let inView=true,loaded=false,frame=0,desired={x:0,y:0};
const allowed=()=>userOn&&!reduced.matches&&!connection?.saveData;
const showToggle=()=>{control.hidden=Boolean(reduced.matches||connection?.saveData);control.setAttribute('aria-pressed',String(userOn));control.textContent=userOn?'Ⅱ Pausar cenário':'▷ Animar cenário';control.setAttribute('aria-label',userOn?'Pausar animações do portal':'Retomar animações do portal')};
function resetPointer(){
 const pairs=['grid-x','grid-y','halo-x','halo-y','runes-x','runes-y','video-x','video-y','mark-x','mark-y','sparks-x','sparks-y'];
 for(const key of pairs)document.documentElement.style.setProperty('--pit-'+key,'0px');
}
function setCamera(){
 frame=0;
 if(!allowed()||!fine.matches){resetPointer();return}
 const x=desired.x,y=desired.y;
 for(const [k,v] of Object.entries({
 'grid-x':x*.12,'grid-y':y*.12,'halo-x':x*-.26,'halo-y':y*-.26,
 'runes-x':x*.38,'runes-y':y*.38,'video-x':x*-.45,'video-y':y*-.45,
 'mark-x':x*-.68,'mark-y':y*-.68,'sparks-x':x*.38,'sparks-y':y*.38
 }))document.documentElement.style.setProperty('--pit-'+k,v.toFixed(2)+'px');
}
function onPointer(event){
 if(!allowed()||!fine.matches)return;
 desired.x=((event.clientX/Math.max(1,innerWidth))-.5)*46;
 desired.y=((event.clientY/Math.max(1,innerHeight))-.5)*36;
 if(!frame)frame=requestAnimationFrame(setCamera);
}
function ensureVideo(){
 if(loaded||!allowed())return;
 loaded=true;
 video.src=video.dataset.src;
 video.load();
}
function sync(){
 showToggle();
 const active=allowed();
 body.classList.toggle('pit-motion-enabled',active);
 body.classList.toggle('pit-motion-paused',!active);
 if(!active||!inView||document.hidden){
  video.pause();
  if(!active)resetPointer();
  return;
 }
 ensureVideo();
 const attempt=video.play();
 if(attempt&&typeof attempt.catch==='function')attempt.catch(()=>{media.classList.remove('pit-video-playing')});
}
video.addEventListener('playing',()=>media.classList.add('pit-video-playing'));
video.addEventListener('pause',()=>{media.classList.remove('pit-video-playing')});
video.addEventListener('error',()=>{media.classList.remove('pit-video-playing');media.classList.add('pit-video-fallback')});
control.addEventListener('click',()=>{userOn=!userOn;sync()});
document.addEventListener('pointermove',onPointer,{passive:true});
window.addEventListener('blur',()=>video.pause());
window.addEventListener('focus',sync);
document.addEventListener('visibilitychange',sync);
window.addEventListener('pagehide',()=>video.pause());
reduced.addEventListener?.('change',sync);
connection?.addEventListener?.('change',sync);
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{
  inView=entries[0]?.isIntersecting??false;
  sync();
 },{rootMargin:'140px 0px',threshold:0.01});
 observer.observe(hero);
}
if(!fine.matches)resetPointer();
sync();
})();
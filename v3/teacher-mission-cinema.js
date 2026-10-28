/* Professor V3 — single-video cinematic mission preview.
   Uses existing per-mission MP4s and WebP posters; never auto-generates video. */
(function(){
'use strict';
if(document.body.dataset.role!=='teacher')return;
const root=document.querySelector('#mainPane .mainhead'), label=document.getElementById('missionNumber');
if(!root||!label)return;
const wrapper=document.createElement('div');
wrapper.className='pit-mission-cinema';
wrapper.setAttribute('aria-hidden','true');
wrapper.innerHTML='<video muted loop playsinline preload="none" aria-hidden="true"></video><div class="pit-cinema-overlay"></div><div class="pit-cinema-rune">✦ <span>UMA JORNADA · DEZ MISSÕES</span></div>';
root.prepend(wrapper);
const video=wrapper.querySelector('video');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const off=new URLSearchParams(location.search).get('motion')==='off';
let number=0,failed=false;
const eligible=()=>!off&&!reduced.matches&&!connection?.saveData&&!document.hidden&&!document.querySelector('#pitProjector');
function sync(){
 if(!eligible()||failed||document.getElementById('workspace')?.hidden){video.pause();wrapper.classList.remove('pit-cinema-playing');return}
 video.play().then(()=>wrapper.classList.add('pit-cinema-playing')).catch(()=>wrapper.classList.remove('pit-cinema-playing'));
}
function update(){
 const match=(label.textContent||'').match(/MISSÃO\s+(\d+)/i),n=Number(match?.[1]);
 if(n<1||n>10||n===number)return;
 number=n;failed=false;
 const code=String(n).padStart(2,'0');
 video.pause();wrapper.classList.remove('pit-cinema-playing');
 wrapper.style.setProperty('--pit-poster','url("./v3/assets/missions/missao-'+code+'.webp")');
 wrapper.style.backgroundImage='linear-gradient(90deg,#0c0c12d9 0%,#0c0c128c 55%,#0c0c12d9 100%),url("./v3/assets/missions/missao-'+code+'.webp")';
 video.poster='./v3/assets/missions/missao-'+code+'.webp';
 video.src='./v3/assets/missions/missao-'+code+'-motion.mp4';
 video.load();sync();
}
video.addEventListener('error',()=>{failed=true;wrapper.classList.remove('pit-cinema-playing')});
video.addEventListener('playing',()=>wrapper.classList.add('pit-cinema-playing'));
document.addEventListener('visibilitychange',sync);
reduced.addEventListener?.('change',sync);
connection?.addEventListener?.('change',sync);
const observer=new MutationObserver(update);observer.observe(label,{childList:true,subtree:true});
const work=document.getElementById('workspace');
if(work)new MutationObserver(sync).observe(work,{attributes:true,attributeFilter:['hidden']});
document.addEventListener('click',e=>{if(e.target.closest('#pitProjectorLaunch,#pitProjectorClose'))queueMicrotask(sync)});
window.addEventListener('pagehide',()=>video.pause());
update();
})();

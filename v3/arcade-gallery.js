/* PIT GAME JAM IA · V3 Arcade Gallery — independente do estado da sala */
(function(){
"use strict";
const M=window.PIT_MISSIONS||[],$=id=>document.getElementById(id);
const palettes=[
 ['#78d7ff','#6779ff','#c6f8ff'],['#ffe4ab','#b36aef','#e7f4ff'],['#2ef8d7','#04b7dd','#aefff3'],
 ['#ed7ce7','#d95876','#ffddb2'],['#ffbc57','#ec6552','#ffefbc'],['#7c9cff','#ae68ff','#d8f5fc'],
 ['#4aebff','#16bba8','#d8f7fd'],['#ff9dcb','#b356eb','#ffc9bd'],['#92ffbc','#2bd5e8','#fff2b0'],['#ffda79','#ed8b44','#fff5c8']
];
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function seeded(n,i){const x=Math.sin(n*88.12+i*17.21)*43197.08;return x-Math.floor(x)}
function scene(m){
 const n=m.n,[cyan,secondary,pale]=palettes[n-1];const skyIndex=[8,35,61,75,88,18,55,29,65,98][n-1];
 const skyline=Array.from({length:9},(_,i)=>{const h=90+Math.round(seeded(n,i)*180),x=i*68-19;
  return '<path d="M'+x+' 480V'+(480-h)+'l16 -17 15 17 v'+(h+6)+'z" fill="'+(i%2?'#0a1b36':'#08152b')+'" stroke="'+cyan+'" stroke-opacity=".16" stroke-width="2"/><path d="M'+(x+11)+' '+(475-h)+'v'+(h-10)+'" stroke="'+cyan+'" stroke-opacity=".15" stroke-width="2"/>';
 }).join('');
 const stars=Array.from({length:32},(_,i)=>{const x=18+seeded(n,i+9)*500,y=16+seeded(n,i+60)*290,r=(i%5===0?2.1:1);
  return '<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="'+r+'" fill="'+pale+'" opacity="'+(0.25+seeded(n,i+125)*.6).toFixed(2)+'"/>';
 }).join('');
 const glyph={
 1:'<path d="M255 405V270l19 -25 19 25v135M225 405V299l15-13 15 13v106M293 405v-113l16 -14 17 14v113" fill="none" stroke="'+pale+'" stroke-width="13"/><circle cx="274" cy="238" r="33" fill="'+cyan+'" opacity=".65"/>',
 2:'<path d="M188 322l77-112 85 112-85 99z" fill="none" stroke="'+pale+'" stroke-width="12"/><path d="M207 327l58-85 60 85-60 69z" fill="'+secondary+'" opacity=".65"/><path d="M265 242v156M208 326h117" stroke="'+cyan+'" stroke-width="4"/>',
 3:'<circle cx="270" cy="313" r="93" fill="none" stroke="'+pale+'" stroke-width="11" stroke-dasharray="17 9"/><circle cx="270" cy="313" r="65" fill="'+secondary+'" opacity=".36"/><path d="M198 313h144M270 241v144" stroke="'+cyan+'" stroke-width="13"/><circle cx="270" cy="313" r="23" fill="'+pale+'"/>',
 4:'<path d="M180 405h178l-45-62h-54l-29-48-45 62z" fill="'+secondary+'" stroke="'+pale+'" stroke-width="7"/><path d="M235 287l35-71 35 71-35 18z" fill="'+cyan+'"/><circle cx="270" cy="250" r="11" fill="'+pale+'"/>',
 5:'<rect x="186" y="226" width="168" height="178" rx="19" fill="'+secondary+'" opacity=".4" stroke="'+pale+'" stroke-width="10"/><circle cx="231" cy="286" r="17" fill="'+cyan+'"/><circle cx="311" cy="340" r="17" fill="'+cyan+'"/><path d="M247 286h65v54" fill="none" stroke="'+pale+'" stroke-width="8" stroke-dasharray="11 11"/>',
 6:'<path d="M270 195l65 77-65 114-65-114z" fill="'+secondary+'" opacity=".65" stroke="'+pale+'" stroke-width="10"/><path d="M270 195v191M205 272h130" stroke="'+cyan+'" stroke-width="8"/><path d="M180 399l90-20 90 20" fill="none" stroke="'+pale+'" stroke-width="7"/>',
 7:'<path d="M158 345q112-169 224 0l-27 46H182z" fill="'+secondary+'" opacity=".6" stroke="'+pale+'" stroke-width="7"/><path d="M204 358v-95l66-35 66 35v95" fill="none" stroke="'+cyan+'" stroke-width="10"/><circle cx="270" cy="249" r="25" fill="'+pale+'"/>',
 8:'<path d="M168 351l59-104 43 35 49-80 56 149-108 51z" fill="'+secondary+'" stroke="'+pale+'" stroke-width="8"/><path d="M230 280l35 37 55-71" fill="none" stroke="'+cyan+'" stroke-width="11"/><circle cx="265" cy="317" r="14" fill="'+pale+'"/>',
 9:'<circle cx="220" cy="299" r="40" fill="none" stroke="'+pale+'" stroke-width="10"/><circle cx="325" cy="299" r="40" fill="none" stroke="'+cyan+'" stroke-width="10"/><path d="M184 387q37-78 76 0M287 387q37-78 76 0" fill="none" stroke="'+pale+'" stroke-width="13"/><path d="M255 274l25 25-25 25" fill="none" stroke="'+pale+'" stroke-width="7"/>',
 10:'<path d="M220 239h100l-17 98-33 24-33-24z" fill="'+secondary+'" stroke="'+pale+'" stroke-width="9"/><path d="M220 251h-41q-10 77 60 78M320 251h41q10 77-60 78" fill="none" stroke="'+cyan+'" stroke-width="12"/><path d="M270 355v46M230 404h80" stroke="'+pale+'" stroke-width="11"/><path d="M270 198l13 27 29 4-21 20 5 29-26-14-26 14 5-29-21-20 29-4z" fill="'+pale+'"/>'
 }[n];
 const particles=Array.from({length:12},(_,i)=>{let x=60+seeded(n,i+80)*420,y=230+seeded(n,i+60)*230;return '<circle cx="'+Math.round(x)+'" cy="'+Math.round(y)+'" r="'+(i%4===0?4:2)+'" fill="'+pale+'" opacity=".85"/>';}).join('');
 return '<svg class="mission-illustration" viewBox="0 0 540 640" role="img" aria-label="Ilustração original animada da missão '+n+'" xmlns="http://www.w3.org/2000/svg">'+
 '<defs><linearGradient id="sky'+n+'" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#060c26"/><stop offset=".5" stop-color="'+secondary+'"/><stop offset="1" stop-color="#061a31"/></linearGradient>'+
 '<radialGradient id="light'+n+'"><stop offset="0" stop-color="'+pale+'" stop-opacity=".8"/><stop offset=".45" stop-color="'+cyan+'" stop-opacity=".27"/><stop offset="1" stop-color="'+cyan+'" stop-opacity="0"/></radialGradient>'+
 '<filter id="blur'+n+'"><feGaussianBlur stdDeviation="10"/></filter></defs>'+
 '<rect width="540" height="640" fill="url(#sky'+n+')"/>'+
 '<g class="mission-clouds" opacity=".34"><path d="M-120 212q140-135 330-42t360-44v90q-220 102-430 40t-260 20z" fill="'+pale+'" filter="url(#blur'+n+')"/></g>'+
 '<g class="mission-stars">'+stars+'</g>'+
 '<g class="mission-glow"><circle cx="273" cy="290" r="220" fill="url(#light'+n+')"/></g>'+
 '<g class="mission-castle" opacity=".94">'+skyline+'</g>'+
 '<path d="M0 475l90-40 63 46 99-70 87 60 98-40 103 53v175H0z" fill="#071124" opacity=".85"/>'+
 '<path d="M0 537l74-38 61 43 110-34 99 35 76-20 120 34v83H0z" fill="#03101e" stroke="'+cyan+'" stroke-opacity=".22" stroke-width="3"/>'+
 '<g class="mission-artifact"><circle cx="270" cy="306" r="125" fill="url(#light'+n+')"/>'+glyph+'</g>'+
 '<g class="mission-sparks">'+particles+'</g>'+
 '<g class="mission-foreground"><path d="M0 590l58-20 42 29 60-17 58 28 64-24 74 14 70-26 114 21v45H0z" fill="#030912" stroke="'+cyan+'" stroke-opacity=".22" stroke-width="4"/>'+
 '<path d="M0 605h540" stroke="'+cyan+'" stroke-opacity=".18" stroke-width="5"/></g>'+
 '</svg>';
}


const root=$('missionGallery');
if(!root||!M.length){window.PIT_ARCADE=null;return;}
const track=$('missionGalleryGrid'),steps=$('arcadeChapters'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowStimulus=reduced||Boolean(window.navigator?.connection?.saveData);
const pad=n=>String(n).padStart(2,'0');
let active=0,opened=false,launching=false,options={},previousFocus=null,touchX=null,transitionTimer=null;
let progressMap=new Map();
function isLocked(m){return m.n>(options.currentStage||1);}
function isDone(m){return progressMap.get(m.n)?.status==='approved';}
function stateOf(m){
 if(options.preview)return ['PRÉVIA','active'];
 if(isDone(m))return ['CONQUISTADA','complete'];
 if(isLocked(m))return ['BLOQUEADA','locked'];
 const status=progressMap.get(m.n)?.status;
 if(status==='submitted')return ['EM VALIDAÇÃO','pending'];
 if(status==='revision')return ['REVISAR ENTREGA','revision'];
 if(status==='working')return ['EM PRODUÇÃO','active'];
 return [m.n===options.currentStage?'DISPONÍVEL':'REVISITAR','active'];
}
function loadProgress(data){
 options={...options,...data};
 progressMap=new Map((options.progress||[]).map(x=>[Number(x.stage),x]));
}
function poster(m){
 const color=palettes[m.n-1],status=stateOf(m);
 return '<article class="arcade-card" data-index="'+(m.n-1)+'" data-state="'+status[1]+'" style="--accent:'+color[0]+';--halo:'+color[1]+'">'+
 '<button type="button" class="arcade-card-button" data-pick="'+(m.n-1)+'" aria-label="Selecionar missão '+pad(m.n)+': '+esc(m.title)+'">'+
 '<span class="arcade-poster"><img class="arcade-mission-photo" alt="" loading="lazy" decoding="async" src="./v3/assets/missions/missao-'+pad(m.n)+'.webp" onerror="this.hidden=true">'+(window.PIT_GOTHIC_ART?window.PIT_GOTHIC_ART(m):scene(m))+((window.PIT_MOTION_READY||[]).includes(m.n)?'<video class="arcade-mission-motion-video" muted loop playsinline preload="none" poster="./v3/assets/missions/missao-'+pad(m.n)+'.webp" aria-hidden="true"><source src="./v3/assets/missions/missao-'+pad(m.n)+'-motion.mp4" type="video/mp4"></video>':'')+'</span>'+
 '<span class="arcade-poster-top"><span class="arcade-number-shield">'+pad(m.n)+'</span></span>'+
 '<span class="arcade-poster-status '+status[1]+'">'+(status[1]==='locked'?'◆ ':status[1]==='complete'?'★ ':'')+status[0]+'</span>'+
 '<span class="arcade-card-bottom"><span class="arcade-chapter">CAPÍTULO '+pad(m.n)+' / 10</span>'+
 '<strong>'+esc(m.title)+'</strong><small>'+esc(m.subtitle)+'</small></span></button>'+
 '<div class="arcade-card-footer"><span>'+m.minutes+' MIN · OFICINA</span><span class="arcade-card-stars" aria-label="'+(isDone(m)?'Missão aprovada':'Ainda não aprovada')+'">'+(isDone(m)?'★':'☆')+'</span></div></article>';
}
function build(){
 track.innerHTML=M.map(poster).join('');
 track.querySelectorAll('[data-pick]').forEach(btn=>btn.addEventListener('click',()=>{
  const n=Number(btn.dataset.pick);
  if(n!==active)choose(n);
  else enter();
 }));
 steps.innerHTML=M.map((m,i)=>'<button type="button" class="arcade-chapter-dot" data-step="'+i+'" aria-label="Ver missão '+pad(m.n)+'"><span>'+pad(m.n)+'</span></button>').join('');
 steps.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.step))));
 choose(active,true);
}
function choose(index,initial){
 active=(index+M.length)%M.length;
 track.querySelectorAll('.arcade-card').forEach(card=>{
  let delta=Number(card.dataset.index)-active;
  if(delta>5)delta-=M.length;
  if(delta< -5)delta+=M.length;
  card.dataset.distance=String(delta);
  card.classList.toggle('current',delta===0);
  card.classList.remove('out-of-view');
  card.dataset.state=stateOf(M[Number(card.dataset.index)])[1];
  card.removeAttribute('aria-hidden');
  card.querySelector('button').tabIndex=0;
 });
 const m=M[active],status=stateOf(m),locked=isLocked(m);
 $('arcadeTitle').textContent=m.title;
 const themed=options.genre&&window.PIT_GENRE_CONTEXT?window.PIT_GENRE_CONTEXT.stage(m.n,options.genre,{title:options.projectTitle||''}):null;
  $('arcadeDescription').textContent=m.goal+(themed?' · Exemplo para '+themed.genre+': '+themed.focus:'');
 $('arcadeDeliverable').textContent=m.deliver;
 $('arcadeStatus').textContent=status[0];
 $('arcadeStatus').className='arcade-status '+status[1];
 $('arcadeTime').textContent=m.minutes+' MIN';
 $('arcadeIndex').textContent=pad(m.n)+' / 10';
 const launch=$('arcadeEnter');
 launch.disabled=locked;launch.textContent=locked?'◆ AGUARDANDO LIBERAÇÃO':'▶ ENTRAR NA MISSÃO '+pad(m.n);
 const approved=M.filter(isDone).length,percent=Math.round(approved/M.length*100);
 if($('arcadePercent'))$('arcadePercent').textContent=percent+'%';
 if($('arcadeProgressFill'))$('arcadeProgressFill').style.width=percent+'%';
 if($('arcadeProgress'))$('arcadeProgress').setAttribute('aria-valuenow',String(approved));
 if($('arcadeProgressLabel'))$('arcadeProgressLabel').textContent=approved+' de '+M.length+' missões aprovadas';
 if($('arcadePlayerName'))$('arcadePlayerName').textContent=options.studentName||'AVENTUREIRO';
 if($('arcadePlayerStage'))$('arcadePlayerStage').textContent=options.genre?'CRIANDO '+options.genre.toUpperCase()+' · 10 MISSÕES':options.preview?'MODO PRÉVIA · 10 MISSÕES':'MISSÃO LIBERADA '+pad(options.currentStage||1)+' / 10';
 steps.querySelectorAll('button').forEach((dot,i)=>{
  dot.classList.toggle('current',i===active);
  dot.classList.toggle('done',isDone(M[i]));
  dot.classList.toggle('locked',isLocked(M[i]));
  dot.setAttribute('aria-current',String(i===active));
 });
 const selected=track.querySelector('.arcade-card.current');
 if(selected&&selected.scrollIntoView)selected.scrollIntoView({behavior:initial||lowStimulus?'auto':'smooth',block:'nearest',inline:'center'});
 if(!initial&&!lowStimulus&&selected){selected.classList.remove('arcade-pop');void selected.offsetWidth;selected.classList.add('arcade-pop');}
}
function enter(){
 if(!opened||launching)return;
 const m=M[active];
 if(isLocked(m))return;
 launching=true;
 $('arcadeCinematicTitle').textContent=m.title;
 $('arcadeCinematicChapter').textContent='MISSÃO '+pad(m.n)+' · ENTRANDO NO UNIVERSO';
 const curtain=$('arcadeCinematic');
 curtain.hidden=false;curtain.setAttribute('aria-hidden','false');
 root.classList.add('launching');
 transitionTimer=window.setTimeout(()=>{
   transitionTimer=null;
   close();
   if(typeof options.onEnter==='function')options.onEnter(m.n);
 },lowStimulus?130:1600);
}
function open(data){
 if(opened){refresh(data);return;}
 loadProgress(data);
 active=Math.max(0,Math.min(M.length-1,Number(options.activeStage||options.currentStage||1)-1));
 previousFocus=document.activeElement;
 opened=true;
 root.hidden=false;root.classList.add('open');root.classList.toggle('pit-low-stimulus',lowStimulus);document.body.classList.add('pit-arcade-open');
 build();
 $('missionGalleryClose').focus();
}
function refresh(data){
 loadProgress(data||{});
 if(!opened||launching)return;
 build();
}
function close(){
 clearTimeout(transitionTimer);transitionTimer=null;launching=false;opened=false;
 $('arcadeCinematic').hidden=true;$('arcadeCinematic').setAttribute('aria-hidden','true');
 root.classList.remove('launching','open','pit-low-stimulus');root.hidden=true;
 document.body.classList.remove('pit-arcade-open');
 if(previousFocus&&previousFocus.isConnected)previousFocus.focus();
}
$('arcadePrev').addEventListener('click',()=>choose(active-1));
$('arcadeNext').addEventListener('click',()=>choose(active+1));
$('arcadeEnter').addEventListener('click',enter);
$('missionGalleryClose').addEventListener('click',close);
$('arcadeSkip').addEventListener('click',()=>{
 if(!launching)return;
 const n=M[active].n,handler=options.onEnter;
 close();if(typeof handler==='function')handler(n);
});
track.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{passive:true});
track.addEventListener('touchend',e=>{
 if(touchX===null)return;
 const dx=e.changedTouches[0].clientX-touchX;touchX=null;
 if(Math.abs(dx)>45)choose(active+(dx<0?1:-1));
},{passive:true});
track.addEventListener('pointermove',e=>{
 if(lowStimulus)return;const card=e.target.closest('.arcade-card.current');
 if(!card)return;const box=card.getBoundingClientRect();
 card.style.setProperty('--mx',(((e.clientX-box.left)/box.width-.5)*15).toFixed(1)+'px');
 card.style.setProperty('--my',(((e.clientY-box.top)/box.height-.5)*10).toFixed(1)+'px');
});
track.addEventListener('pointerleave',()=>{const c=track.querySelector('.arcade-card.current');if(c){c.style.setProperty('--mx','0px');c.style.setProperty('--my','0px');}});
root.addEventListener('keydown',e=>{
 if(!opened)return;
 if(launching){if(e.key==='Escape'){e.preventDefault();$('arcadeSkip').click();}return;}
 if(e.key==='Escape'){e.preventDefault();close();}
 if(e.key==='ArrowLeft'){e.preventDefault();choose(active-1);}
 if(e.key==='ArrowRight'){e.preventDefault();choose(active+1);}
 if(e.key==='Tab'){
  const nodes=[...root.querySelectorAll('button:not([disabled])')].filter(b=>b.offsetParent!==null&&b.tabIndex!==-1);
  if(!nodes.length)return;
  const first=nodes[0],last=nodes[nodes.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
window.PIT_ARCADE={open,close,refresh,isOpen:()=>opened};
})();

/* PIT Game Jam IA · Fase 1 — mission-select experience, isolated from live classroom state. */
(function(){
'use strict';
const M=window.PIT_MISSIONS||[];
const $=id=>document.getElementById(id);
const compact=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const palettes=[
 ['#78d7ff','#6779ff','#c6f8ff'],['#ffe4ab','#b36aef','#e7f4ff'],['#2ef8d7','#04b7dd','#aefff3'],
 ['#ed7ce7','#d95876','#ffddb2'],['#ffbc57','#ec6552','#ffefbc'],['#7c9cff','#ae68ff','#d8f5fc'],
 ['#4aebff','#16bba8','#d8f7fd'],['#ff9dcb','#b356eb','#ffc9bd'],['#92ffbc','#2bd5e8','#fff2b0'],['#ffda79','#ed8b44','#fff5c8']
];
let active=0,opened=false,focusWas=null,touchStart=null;
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
function card(m){
 const p=palettes[m.n-1],n=m.n;
 return '<article class="orbit-card" data-n="'+(n-1)+'" style="--a:'+p[0]+';--b:'+p[1]+';--c:'+p[2]+'">'+
 '<button class="orbit-cover" type="button" data-select="'+(n-1)+'" aria-label="Selecionar missão '+String(n).padStart(2,'0')+', '+esc(m.title)+'" tabindex="-1">'+
 '<span class="orbit-art">'+scene(m)+'</span><span class="orbit-scan"></span><span class="orbit-vignette"></span>'+
 '<span class="orbit-index">'+String(n).padStart(2,'0')+'</span><span class="orbit-rank">'+(n<=3?'✦':'◆')+'</span>'+
 '<span class="orbit-overlay"><span>CAPÍTULO '+String(n).padStart(2,'0')+'</span><strong>'+esc(m.title.toUpperCase())+'</strong><small>'+esc(m.subtitle)+'</small></span></button>'+
 '<div class="orbit-meta"><span>'+m.icon+' '+m.minutes+' MIN</span><span>✦ ✦ ✦</span></div></article>';
}
function paint(){
 $('cardTrack').innerHTML=M.map(card).join('');
 document.querySelectorAll('[data-select]').forEach(b=>b.addEventListener('click',()=>{
  const n=Number(b.dataset.select);
  if(n!==active)go(n);else showBrief();
 }));
 go(0,true);
}
function go(idx,initial=false){
 active=(idx+M.length)%M.length;
 document.querySelectorAll('.orbit-card').forEach(card=>{
  let distance=Number(card.dataset.n)-active;
  if(distance>Math.floor(M.length/2))distance-=M.length;
  if(distance<-Math.floor(M.length/2))distance+=M.length;
  const a=Math.abs(distance),visible=a<=2;
  card.style.setProperty('--dist',distance);
  card.dataset.distance=String(distance);
  card.dataset.position=distance===0?'center':distance<0?'left':'right';
  card.classList.toggle('is-current',distance===0);
  card.classList.toggle('is-hidden',!visible);
  card.setAttribute('aria-hidden',String(!visible));
  const button=card.querySelector('button');
  button.tabIndex=visible?0:-1;button.disabled=!visible;
 });
 const m=M[active];
 $('selectedEyebrow').textContent='MISSÃO '+String(m.n).padStart(2,'0')+' / 10   ·   '+m.time;
 $('selectedName').textContent=m.title.toUpperCase();
 $('selectedGoal').textContent=m.goal;
 $('missionCount').textContent=String(m.n).padStart(2,'0')+' / 10';
 $('stageMinutes').textContent=m.minutes+' MINUTOS';
 $('completionGoal').textContent=m.deliver;
 $('selectedPoster').textContent=m.icon;
 $('progressMeter').style.width=(m.n/10*100)+'%';
 $('steps').innerHTML=M.map((x,i)=>'<button type="button" aria-label="Ir para missão '+x.n+'" aria-current="'+(i===active)+'" class="'+(i===active?'active':'')+'" data-step="'+i+'"></button>').join('');
 $('steps').querySelectorAll('button').forEach(b=>b.onclick=()=>go(Number(b.dataset.step)));
 if(!initial&&!compact){const center=document.querySelector('.orbit-card.is-current');center?.classList.add('just-selected');setTimeout(()=>center?.classList.remove('just-selected'),700)}
}
function showBrief(){
 focusWas=document.activeElement;opened=true;const m=M[active];
 $('briefIndex').textContent='MISSÃO '+String(m.n).padStart(2,'0')+' • '+m.minutes+' MIN';
 $('briefTitle').textContent=m.title;
 $('briefIntro').textContent=m.goal;
 $('briefResult').textContent=m.deliver;
 $('briefSteps').innerHTML=m.steps.map((x,i)=>'<li><b>0'+(i+1)+'</b><span>'+esc(x)+'</span></li>').join('');
 $('briefModal').hidden=false;
 $('briefModal').querySelector('#closeBrief').focus();
 document.body.classList.add('modal-open');
}
function closeBrief(){opened=false;$('briefModal').hidden=true;document.body.classList.remove('modal-open');focusWas?.focus()}
$('next').onclick=()=>go(active+1);
$('previous').onclick=()=>go(active-1);
$('launchMission').onclick=showBrief;
$('closeBrief').onclick=closeBrief;
$('briefModal').addEventListener('click',e=>{if(e.target.id==='briefModal')closeBrief()});
document.addEventListener('keydown',e=>{
 if(opened){if(e.key==='Escape')closeBrief();return}
 if(e.key==='ArrowRight'){e.preventDefault();go(active+1)}
 if(e.key==='ArrowLeft'){e.preventDefault();go(active-1)}
 if(e.key==='Enter'&&document.activeElement.id==='launchMission')showBrief();
});
$('carousel').addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].clientX},{passive:true});
$('carousel').addEventListener('touchend',e=>{if(touchStart===null)return;const dx=e.changedTouches[0].clientX-touchStart;touchStart=null;if(Math.abs(dx)>45)go(active+(dx<0?1:-1))},{passive:true});
$('carousel').addEventListener('pointermove',e=>{
 if(compact)return;const card=e.target.closest('.orbit-card.is-current');if(!card)return;
 const box=card.getBoundingClientRect();const x=(e.clientX-box.left)/box.width-.5,y=(e.clientY-box.top)/box.height-.5;
 card.style.setProperty('--px',(x*18).toFixed(1)+'px');card.style.setProperty('--py',(y*12).toFixed(1)+'px');
});
$('carousel').addEventListener('pointerleave',()=>{const card=document.querySelector('.orbit-card.is-current');card?.style.setProperty('--px','0px');card?.style.setProperty('--py','0px')});
if(M.length===10)paint();else $('selectedName').textContent='Missões indisponíveis.';
})();
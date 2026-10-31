/* Original illustrated scenes for the PIT Game Jam RPG gallery — no external image dependency. */
(function(){
"use strict";
const palettes=[
 ["#d23b20","#fca347","#39121e"],["#ab6225","#ffe0a0","#17202a"],
 ["#f85b20","#ffce74","#24120f"],["#3e8ed9","#b3e9ff","#102035"],
 ["#15b473","#83fdb1","#08251b"],["#5182f8","#bfb7ff","#171d42"],
 ["#8265db","#ffb970","#211d42"],["#e78531","#ffe3a9","#251714"],
 ["#ae3439","#ffc06d","#25141b"],["#e57d28","#ffdfa2","#251810"]
];
const areas={
 1:`<g stroke="#ff9047" stroke-width="5"><path d="M110 442V200q50-106 100 0v242" fill="#100d14"/><path d="M122 420V213q38-79 76 0v207" fill="url(#portal1)" stroke-width="3"/></g><path d="M130 428L156 218l31 210Z" fill="#fe663a" opacity=".58"/><path d="M152 420V296h18v124" fill="#190c15"/><path d="M150 296l11-26 11 26" fill="#25111c"/><g fill="#f9be68"><circle cx="162" cy="255" r="4"/><circle cx="147" cy="221" r="3"/></g>`,
 2:`<path d="M44 404L121 359l155 35-67 45Z" fill="#241e1c" stroke="#a37039" stroke-width="5"/><path d="M81 350l65-48 51 19 46-19 45 42-90 44-54-19Z" fill="#baa075" stroke="#ffe1a1" stroke-width="4"/><path d="M145 303l0 67M196 320l1 66" stroke="#77532d" stroke-width="4"/><g fill="none" stroke="#f5dfaa"><path d="M100 343l39-23M99 356l45-24M205 340l42-9M205 352l45-7"/></g><circle cx="170" cy="250" r="76" fill="url(#glow2)" opacity=".5"/><g stroke="#ffd376" fill="none" stroke-width="3"><path d="M173 274l-23-37 22-26 26 31-25 32"/><path d="M132 258q45-84 88 0"/></g>`,
 3:`<path d="M45 390Q130 332 276 388l18 76H21Z" fill="#22140e"/><path d="M91 360h150l-24 35-43 10-12 55h-34l-10-56Z" fill="#292b2c" stroke="#c87e4b" stroke-width="6"/><path d="M163 146l29 34-3 156-44 0 1-159Z" fill="#f3b45e" stroke="#ffda96" stroke-width="5" transform="rotate(32 170 240)"/><path d="M122 170h99v29h-99z" fill="#373333" stroke="#ddb37b" stroke-width="4" transform="rotate(32 170 240)"/><path d="M61 430l15-75 30 40M230 432l26-80 27 53" stroke="#e76835" stroke-width="6" fill="none"/><circle cx="177" cy="330" r="72" fill="url(#glow3)" opacity=".6"/>`,
 4:`<path d="M56 439l41-156 61-49 66 49 44 156Z" fill="#0e1b2b" stroke="#567992" stroke-width="5"/><path d="M119 266l18-60h43l20 60-22 53h-38Z" fill="#3a4858" stroke="#a5cce3" stroke-width="6"/><path d="M133 261h51l-9 28h-34Z" fill="#111a27"/><path d="M116 317l-19 125M212 317l18 125" stroke="#708ca1" stroke-width="14"/><path d="M211 142l15 0 2 240-19 0Z" fill="#b9f0ff" stroke="#82baff" stroke-width="4"/><path d="M188 226h61v17h-61z" fill="#adc5cc"/><circle cx="223" cy="286" r="85" fill="url(#glow4)" opacity=".47"/>`,
 5:`<path d="M61 461V207q97-153 197 0v254" fill="#0b1c19" stroke="#24644b" stroke-width="17"/><path d="M79 434V210q79-126 160 0v224" fill="url(#portal5)" stroke="#63e5a9" stroke-width="6"/><path d="M117 401L157 255l53 146Z" fill="#042218"/><path d="M143 415v-92l14-24 17 24v92" fill="#081b17"/><path d="M88 272l16-13m107 3 21 12M112 216l14-15m56 8 18 13" stroke="#8afeae" stroke-width="6"/><ellipse cx="159" cy="435" rx="105" ry="18" fill="#4effac" opacity=".22"/>`,
 6:`<path d="M38 440q7-138 105-155h37q96 25 103 155" fill="#1e2446" stroke="#685ab5" stroke-width="7"/><path d="M138 319q-24-80 18-100 51 15 23 100Z" fill="#8193c5" stroke="#d7dcff" stroke-width="5"/><path d="M125 321q34 45 68 0" fill="none" stroke="#a3bcff" stroke-width="6"/><circle cx="159" cy="180" r="73" fill="url(#glow6)" opacity=".75"/><circle cx="159" cy="180" r="30" fill="#8bd2ff" stroke="#dfebff" stroke-width="7"/><path d="M159 108v144M88 180h143M111 131l97 97M209 133l-98 96" stroke="#a1a6ff" stroke-width="3" opacity=".9"/><path d="M77 392l60-47 25 42 37-42 47 47" fill="none" stroke="#7562e1" stroke-width="12"/>`,
 7:`<path d="M13 289q50-29 87 0h39q38-33 88-8l76 6-38 53-59 9-38 49-55-16-35-38-49 2Z" fill="#253047" stroke="#dda66c" stroke-width="5"/><path d="M95 279V155l28-38 24 38v124M175 278V181l26-42 29 42v97" fill="#1f2145" stroke="#9b80d7" stroke-width="5"/><path d="M130 294l16 125 21 30 11-32 18-122" fill="#4fa6dc" opacity=".65"/><g fill="#ffcf8d"><circle cx="124" cy="187" r="5"/><circle cx="200" cy="214" r="5"/></g><path d="M59 308l74-12 57 5 58-10" stroke="#ecd8b2" stroke-width="3" fill="none"/>`,
 8:`<path d="M36 391h248v52H36z" fill="#3b291e" stroke="#c48442" stroke-width="6"/><path d="M66 315h90v75H66z" fill="#33221a" stroke="#b87738" stroke-width="5"/><path d="M177 312l20-108h12l14 109" fill="none" stroke="#ffc17d" stroke-width="8"/><path d="M227 285l13-42 10 42" fill="#e3a859"/><path d="M101 327v-68M89 267h31M109 292h41" stroke="#ffe0a2" stroke-width="9"/><path d="M161 344l29-23 46 14-29 26z" fill="#c6a770" stroke="#ffe6b0" stroke-width="4"/><path d="M187 335l27 6M197 348l22-6" stroke="#69451c" stroke-width="3"/><circle cx="202" cy="283" r="73" fill="url(#glow8)" opacity=".35"/>`,
 9:`<path d="M39 427V273q121-180 242 0v154Z" fill="#23171b" stroke="#93423b" stroke-width="8"/><path d="M67 418V284q93-128 187 0v134" fill="#0d121b" stroke="#ab5a46" stroke-width="5"/><path d="M107 415V311q53-62 105 0v104" fill="#240b10" stroke="#c76b43" stroke-width="5"/><path d="M155 273l-17-41 17-43 18 43Z" fill="#eab476"/><path d="M80 350h159M80 390h159" stroke="#dc633f" stroke-width="4"/><circle cx="157" cy="220" r="69" fill="url(#glow9)" opacity=".5"/><path d="M110 438h93" stroke="#f0ae64" stroke-width="5"/>`,
 10:`<path d="M82 445l26-184 24-23 29 15 29-15 25 23 27 184Z" fill="#28211a" stroke="#f8ab54" stroke-width="7"/><path d="M106 363h111v76H106z" fill="#58231b" stroke="#c77f47" stroke-width="5"/><path d="M124 325l15-89 20 34 21-34 19 89" fill="#ab632d" stroke="#ffe0a2" stroke-width="5"/><circle cx="161" cy="311" r="18" fill="#ffcf79" stroke="#fff1b8" stroke-width="5"/><path d="M110 233l-19-80 45 47 27-83 25 83 43-47-20 80Z" fill="#c58c47" stroke="#ffe0a2" stroke-width="5"/><circle cx="160" cy="280" r="105" fill="url(#glow10)" opacity=".38"/>`
};
window.PIT_GOTHIC_ART=function(m){
 const n=Number(m.n),c=palettes[n-1]||palettes[0];
 const towers=Array.from({length:10},(_,i)=>{const x=i*36-27,h=55+(i*51+n*23)%85;return `<path d="M${x} 398v-${h}l9-15 9 15v${h}Z" fill="#0a0c11" stroke="${c[0]}" stroke-opacity=".18" stroke-width="1"/>`}).join("");
 const ash=Array.from({length:22},(_,i)=>{const x=(i*89+n*33)%320,y=(i*47+n*73)%440;return `<circle cx="${x}" cy="${y}" r="${i%4===0?2:1}" fill="${c[1]}" opacity="${i%3===0?.62:.32}"/>`}).join("");
 return `<svg class="mission-illustration" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 520" role="img" aria-label="Ilustração da missão ${n}">
 <defs>
 <linearGradient id="sky${n}" x2=".7" y2="1"><stop stop-color="${c[2]}"/><stop offset=".52" stop-color="#26202a"/><stop offset="1" stop-color="${c[0]}"/></linearGradient>
 <radialGradient id="glow${n}"><stop stop-color="${c[1]}" stop-opacity=".9"/><stop offset=".45" stop-color="${c[0]}" stop-opacity=".26"/><stop offset="1" stop-color="${c[0]}" stop-opacity="0"/></radialGradient>
 <radialGradient id="portal${n}"><stop stop-color="${c[1]}"/><stop offset=".35" stop-color="${c[0]}"/><stop offset="1" stop-color="#080b13"/></radialGradient>
 <radialGradient id="v${n}"><stop offset=".25" stop-opacity="0"/><stop offset="1" stop-opacity=".78"/></radialGradient>
 </defs>
 <rect width="320" height="520" fill="url(#sky${n})"/>
 <circle cx="175" cy="230" r="205" fill="url(#glow${n})" opacity=".45"/>
 <g class="mission-clouds" opacity=".48"><path d="M-20 155q68-73 151-28t211-23v82q-126 44-221-5t-141 40z" fill="#060b18"/></g>
 <g opacity=".95">${towers}</g>
 <path d="M-15 403l43-55 25 20 40-60 40 45 31-33 59 42 43-45 72 55v155H-15Z" fill="#0c1115" opacity=".62"/>
 <path d="M0 455l77-38 45 21 68-59 48 38 82-32v138H0Z" fill="#080b0e" opacity=".65"/>
 <g class="mission-artifact">${areas[n]||areas[1]}</g>
 <g class="mission-sparks">${ash}</g>
 <path d="M0 469q61-19 120 8t200-9v52H0Z" fill="#06080b" opacity=".76"/>
 <rect width="320" height="520" fill="url(#v${n})" opacity=".55"/>
 </svg>`;
};
})();

'use strict';
/* node qa/v3-m05-integration.cjs
   Offline regression: DOM-mocked interactions, no real browser or database. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};
const teacherSrc=read('v3/teacher-mission-five-validation.js');
const studentSrc=read('v3/student-mission-five.js');
const guideSrc=read('v3/gdevelop-mission-five-guide.js');
const app=read('v3/app.js'),html=read('professor-v3.html'),studentHtml=read('aluno-v3.html');
const style=read('v3/teacher-mission-five-validation.css');
const api=read('chat-api/api/classroom.js');
const window={matchMedia:()=>({matches:true})};
vm.runInNewContext(teacherSrc,{window});vm.runInNewContext(guideSrc,{window});
const T=window.PIT_TEACHER_MISSION_FIVE_VALIDATION;
const workshop=T.render('practice'),review=T.render('review');
ok(T.routes.length===3,'three game paths');
ok((workshop.match(/class="t5v-lab"/g)||[]).length===3,'three practical blocks');
ok(['8 MIN','24 MINUTOS','40 MINUTOS'].every(x=>workshop.includes(x)),'timebox');
ok(workshop.includes('variável de cena')&&workshop.includes('condição'),'event+variable');
ok(review.includes('teste positivo')&&review.includes('negativo')&&review.includes('repetição'),'three QA cases');
ok(review.includes('Acompanhamento')&&review.includes('Missão 05'),'review matches roster');
ok(review.includes('autodeclaratória'),'evidence honesty');
ok(T.routes[2].risk.includes('Collision 2D'),'3D collision distinction');
ok(style.split('{').length===style.split('}').length,'CSS braces balanced');
ok(style.includes('prefers-reduced-motion'),'reduced motion');
ok(html.includes('teacher-mission-five-validation.js')&&html.includes('teacher-mission-five-validation.css'),'teacher imports');
ok(!studentHtml.includes('teacher-mission-five-validation.js'),'student isolated');
ok(app.includes("TEACHER&&m.n===5&&['practice','review'].includes(activePhase)"),'proper teacher phase guard');
ok(app.includes('PIT_TEACHER_MISSION_FIVE_VALIDATION.render(activePhase)'),'teacher renders');
ok(app.includes('PIT_TEACHER_MISSION_FIVE_VALIDATION.mount()'),'teacher mounts');
ok(api.includes("status NOT IN ('submitted','approved')"),'sent evidence protected');
ok(api.includes("status==='revision'&&feedback.length<8"),'teacher revision requires explanation');
function elem(x={}){return {listeners:{},attrs:{},tabIndex:0,classList:{classes:[],add(k){this.classes.push(k)}},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,v){this.listeners[k]=v},focus(){this.focused=true},click(){this.listeners.click?.()},...x}}
const tabs=Array.from({length:3},()=>elem()),panel=elem(),cards=Array.from({length:3},()=>elem());
const scope={querySelector:s=>s==='#t5vPanel'?panel:null,querySelectorAll:s=>s==='[data-t5v-tab]'?tabs:s==='[data-t5v-reveal]'?cards:[],classList:{add(){}}};
vm.runInNewContext(teacherSrc,{window,document:{querySelector:s=>s==='.t5v-root'?scope:null}});
T.mount();
tabs[1].click();ok(panel.innerHTML.includes('Acertou=0'),'puzzle route switching');
tabs[1].listeners.keydown({key:'End',preventDefault(){}});
ok(tabs[2].focused&&panel.innerHTML.includes('Physics 3D'),'keyboard selects 3D route');
tabs[2].listeners.keydown({key:'ArrowRight',preventDefault(){}});
ok(tabs[0].attrs['aria-selected']==='true','arrow wraps routes');
ok(cards.every(x=>x.classList.classes.includes('t5v-visible')),'reduced motion cards visible');
const mem=new Map(),localStorage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,String(v))};
vm.runInNewContext(studentSrc,{window,localStorage});
const S=window.PIT_STUDENT_MISSION_FIVE;
const ctx={session:'qa',phase:'practice',status:'',preview:true,canSubmit:true,
 idea:{title:'Castelo',genre:'RPG'},mvp:{mechanic:'Pegar chave'},
 previous:{project:'Castelo',scene:'Sala1',object:'Heroi'},playable:{route:0,saved:'Nuvem'}};
ok(S.render(ctx).includes('Pegar chave'),'prior mission mechanic survives');
ok(S.render(ctx).includes('m5g-root'),'guide embedded');
ok(!S.validate('qa').ok,'blank evidence rejected');
const good={route:0,condition:'SE tocar no cristal no jogo',action:'Adicionar 1 no Score e excluir item',variable:'Score=1',
 positive:'Cristal desapareceu e marcou um ponto.',negative:'Fora do cristal sem ponto, repetição sem duplicar.',feedback:'Placar alterou de zero para um.',saved:'Castelo na nuvem',issue:'',checks:[0,1,2]};
S.save('qa',good);
ok(S.validate('qa').ok,'positive negative and repetition required');
ok(S.validity(S.load('qa')).filter(Boolean).length===8,'progress criteria');
const evidence=S.evidence('qa',ctx);
ok(evidence.includes('Condição:')&&evidence.includes('Negativo:')&&evidence.length<=750,'valid evidence');
S.hydrate('other',evidence,'submitted');ok(S.load('other').positive===good.positive,'submission restore');
ok(S.load('independent').condition==='','separate local drafts');
const max={route:2,checks:[0,1,2]};for(const f of S.fields)max[f.key]='X'.repeat(f.max);
S.save('max',max);const huge=S.evidence('max',{...ctx,idea:{title:'T'.repeat(90),genre:'Narrativa interativa'},previous:{project:'P'.repeat(90),scene:'S'.repeat(90)}});
ok(huge.length<=750&&huge.endsWith('X'.repeat(38)),'no silent truncated field');
ok(app.includes('PIT_STUDENT_MISSION_FIVE.routeType('),'2D/3D route transmitted');
ok(app.includes("if(visualPreview)return setToast('Prévia: regra registrada"),'preview cannot submit');
console.log('PASS '+n+' M05 integration assertions (offline, no browser/Neon/GDevelop E2E).');

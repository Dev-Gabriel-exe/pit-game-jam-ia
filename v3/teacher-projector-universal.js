/* PIT Game Jam — aulas contínuas M02–M10. Quatro etapas por sessão, conteúdo íntegro,
 * slides sem notas privadas e interações montadas por componente (sem clonar listeners).
 * Não altera estado da turma, etapa ativa, nem backend.
 */
(function(){
'use strict';
const PHASES=['briefing','demo','practice','review'];
const LABELS=['CONCEITOS','EXEMPLO EM AÇÃO','OFICINA LIBERADA','RESULTADOS'];
const TITLES={2:'MVP em Foco',3:'Ligar o Motor',4:'Primeiro Jogável',5:'A Primeira Regra',6:'Forja de IA',7:'Dar Vida ao Universo',8:'Polimento',9:'Playtest Cruzado',10:'Lançamento'};
const MAP={
 2:[['PIT_TEACHER_MISSION_TWO','render'],['PIT_TEACHER_MISSION_TWO','render'],['PIT_TEACHER_MISSION_TWO','render'],['PIT_TEACHER_MISSION_TWO','render']],
 3:[['PIT_TEACHER_MISSION_THREE','render'],['PIT_TEACHER_MISSION_THREE','render'],['PIT_TEACHER_MISSION_THREE','render'],['PIT_TEACHER_MISSION_THREE','render']],
 4:[['PIT_TEACHER_MISSION_FOUR_FOUNDATIONS','render'],['PIT_GDEVELOP_M04_GUIDE','render'],['PIT_TEACHER_MISSION_FOUR_VALIDATION','render'],['PIT_TEACHER_MISSION_FOUR_VALIDATION','render']],
 5:[['PIT_TEACHER_MISSION_FIVE_FOUNDATIONS','render'],['PIT_GDEVELOP_M05_GUIDE','render'],['PIT_TEACHER_MISSION_FIVE_VALIDATION','render'],['PIT_TEACHER_MISSION_FIVE_VALIDATION','render']],
 6:[['PIT_TEACHER_MISSION_SIX_FOUNDATIONS','render'],['PIT_TEACHER_MISSION_SIX_MATRIX','render'],['PIT_ASSET_FORGE_TUTORIAL','render'],['PIT_TEACHER_MISSION_SIX_VALIDATION','render']],
 7:[['PIT_TEACHER_MISSION_SEVEN_FOUNDATIONS','render'],['PIT_GDEVELOP_M07_GUIDE','render'],['PIT_TEACHER_MISSION_SEVEN_VALIDATION','render'],['PIT_TEACHER_MISSION_SEVEN_VALIDATION','render']],
 8:[['PIT_TEACHER_MISSION_EIGHT_FOUNDATIONS','render'],['PIT_GDEVELOP_M08_GUIDE','render'],['PIT_TEACHER_MISSION_EIGHT_VALIDATION','render'],['PIT_TEACHER_MISSION_EIGHT_VALIDATION','render']],
 9:[['PIT_TEACHER_MISSION_NINE_FOUNDATIONS','render'],['PIT_TEACHER_MISSION_NINE_FOUNDATIONS','renderDemo'],['PIT_TEACHER_MISSION_NINE_VALIDATION','render'],['PIT_TEACHER_MISSION_NINE_VALIDATION','render']],
10:[['PIT_TEACHER_MISSION_TEN_FOUNDATIONS','render'],['PIT_GDEVELOP_M10_GUIDE','render'],['PIT_TEACHER_MISSION_TEN_VALIDATION','render'],['PIT_TEACHER_MISSION_TEN_VALIDATION','render']]
};
const WHOLE={2:'PIT_TEACHER_MISSION_TWO',3:'PIT_TEACHER_MISSION_THREE'};
const REGION='.tm2-content,.tm3-body,.tm4f-body,.t4v-content,.tm5-content,.t5v-content,.f6-body';
const PRIVATE='.pit-private-teacher-notes,[data-private-note],.teacher-private-note';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>String(s??'').replace(/\s+/g,' ').trim();
const slide=(section,title,html,more={})=>Object.assign({section,title,html:'<section class="pit-m01-deck pit-u-deck">'+html+'</section>'},more);
function source(m,p){
 const [key,fn]=MAP[m][p],obj=window[key];
 if(!obj||typeof obj[fn]!=='function')return null;
 const phase=PHASES[p];
 let markup;
 try{markup=(fn==='render'&&(['PIT_TEACHER_MISSION_TWO','PIT_TEACHER_MISSION_THREE','PIT_TEACHER_MISSION_FOUR_VALIDATION','PIT_TEACHER_MISSION_FIVE_VALIDATION','PIT_TEACHER_MISSION_SEVEN_VALIDATION','PIT_TEACHER_MISSION_EIGHT_VALIDATION','PIT_TEACHER_MISSION_NINE_VALIDATION','PIT_TEACHER_MISSION_TEN_VALIDATION'].includes(key)))?obj[fn](phase):obj[fn]()}catch(error){console.warn('PIT projector: phase source unavailable',m,p,error);return null}
 const tpl=document.createElement('template');tpl.innerHTML=markup||'';
 tpl.content.querySelectorAll(PRIVATE).forEach(x=>x.remove());
 return {root:tpl.content,mod:key,phase};
}
function heading(s){return '<div class="pit-m01-kicker">'+esc(s)+'</div>'}
function cover(m,p,minutes){
 const title=LABELS[p],sub={
  0:'Entenda o modelo, as decisões e os conceitos que sustentam esta missão.',
  1:'Veja como funciona, teste as regras e acompanhe os passos na ferramenta.',
  2:'Agora é sua vez: aplique a ideia e confira o que deve entregar.',
  3:'Verifique os resultados e prepare a continuidade da sua jornada.'
 }[p];
 return slide(title+' · '+minutes[p]+' MIN',title+' · Missão '+String(m).padStart(2,'0'),
 heading('MISSÃO '+String(m).padStart(2,'0')+' / 10 · '+TITLES[m])+
 '<div class="pit-u-cover"><div><h2>'+esc(title)+'</h2><p>'+sub+'</p>'+
 '<div class="pit-m01-chips"><span>'+minutes[p]+' MINUTOS</span><span>'+esc(TITLES[m])+'</span></div></div>'+
 '<div class="pit-u-insignia" aria-hidden="true">✦<span>'+String(m).padStart(2,'0')+'</span></div></div>');
}
function mins(m){
 const a=window[WHOLE[m]||MAP[m][0][0]];
 if(a&&typeof a.minutes==='function'){try{const x=a.minutes();if(Array.isArray(x)&&x.length===4)return x}catch{}}
 const schedule={4:[6,5,36,3],5:[8,5,24,3],6:[5,5,32,3],7:[5,6,36,3],8:[5,4,28,3],9:[3,3,16,3],10:[4,3,18,5]};
 return schedule[m]||[8,5,15,2];
}
function contentRegion(root){return root.querySelector(REGION)||root.querySelector('[class$="-body"],[class*="-content"],main')||root;}
function readable(root){
 const selection=contentRegion(root);
 const tags=[...selection.querySelectorAll('h2,h3,h4,h5,p,li,pre,blockquote,img')];
 const result=[];
 for(const el of tags){
  if(el.closest(PRIVATE+' ,[hidden],[aria-hidden="true"],[role="tablist"]'))continue;
  if(el.closest('button,[role="button"],nav,summary'))continue;
  const text=plain(el.textContent);
  if(el.tagName==='IMG'){
   if(!el.getAttribute('src')||el.closest('button'))continue;
   result.push({type:'img',html:el.outerHTML,text:el.getAttribute('alt')||''});continue;
  }
  if(text.length<15&& !/^H[2-5]$/.test(el.tagName))continue;
  if(text.length<3)continue;
  const type=/^H[2-5]$/.test(el.tagName)?'title':el.tagName==='PRE'?'code':'body';
  let inner=el.innerHTML;
  if(type==='body')inner=el.tagName==='LI'?'<span class="pit-u-bullet">◆</span>'+inner:inner;
  result.push({type,html:inner,text});
 }
 return result;
}
function storytelling(m,p,src,minutes){
 const atoms=readable(src.root),section=LABELS[p]+' · '+minutes[p]+' MIN';
 const results=[];let title='',text=[],words=0;
 const push=()=>{
  if(!text.length)return;
  const body=text.map(x=>x.type==='img'?'<div class="pit-u-illustration">'+x.html+'</div>':x.type==='code'?'<pre class="pit-m01-pseudocode">'+esc(x.text)+'</pre>':'<div class="pit-u-point">'+x.html+'</div>').join('');
  results.push(slide(section,title||TITLES[m],heading('MISSÃO '+String(m).padStart(2,'0')+' · '+LABELS[p])+
   '<div class="pit-u-explainer">'+body+'</div>'));
  text=[];words=0;
 };
 for(const atom of atoms){
  if(atom.type==='title'){
   if(text.length)push();
   title=plain(atom.text).slice(0,118);
   continue;
  }
  const w=atom.text.split(/\s+/).length;
  if(text.length&&(words+w>110||text.length>=4||(atom.type==='img'&&words>55)))push();
  text.push(atom);words+=w;
 }
 push();
 if(!results.length){
  const r=plain(contentRegion(src.root).textContent).slice(0,780);
  if(r)results.push(slide(section,'Vamos colocar em prática',heading(LABELS[p])+'<div class="pit-u-explainer"><p>'+esc(r)+'</p></div>'));
 }
 return results;
}
function liveSegments(src){
 const root=contentRegion(src.root);
 const controls=[...root.querySelectorAll('button:not([hidden]),input,select,textarea,[role="tab"]')].filter(x=>!x.closest(PRIVATE));
 if(!controls.length)return [];
 const clusters=[];
 const seen=new Set();
 for(const el of controls){
  let n=el;
  while(n.parentElement&&n.parentElement!==root){
   if(/^(SECTION|FORM|ARTICLE)$/.test(n.tagName)&&n.querySelectorAll('button,input,select,textarea').length>=2)break;
   if(/\b(?:sim|simulator|lab|tutorial|switch|tabs|route|choices|selector|feature|test|matrix|guide|studio)\b/i.test(n.className||'')&&n.querySelectorAll('button,input,select,textarea').length>=2)break;
   n=n.parentElement;
  }
  if(n===el)n=el.parentElement||el;
  // Collapse nested groups: one live slide per self-contained control panel.
  if([...seen].some(x=>x.contains(n)))continue;
  for(const old of [...seen])if(n.contains(old)){seen.delete(old);const j=clusters.indexOf(old);if(j>=0)clusters.splice(j,1)}
  seen.add(n);clusters.push(n);
 }
 // Several controls from a single widget can be nested in different sibling panels;
 // use a shared ancestor where all required fields are needed.
 const compact=[];
 for(const node of clusters){
  if(compact.some(x=>x.contains(node)))continue;
  compact.push(node);
 }
 return compact.slice(0,4).map(n=>{
  let el=n;
  if(el.textContent.length<120&&el.parentElement&&el.parentElement!==root)el=el.parentElement;
  return el;
 });
}
function interactive(m,p,src,minutes){
 const nodes=liveSegments(src),section=LABELS[p]+' · '+minutes[p]+' MIN';
 return nodes.map((node,i)=>{
  const title=plain(node.querySelector('h2,h3,h4')?.textContent||node.closest('section')?.querySelector('h2,h3,h4')?.textContent||'Experimente no simulador').slice(0,100);
  return slide(section,title,heading('SIMULAÇÃO / TUTORIAL · INTERATIVO')+
   '<div class="pit-u-live" data-pit-live="1"><div class="pit-u-component">'+node.outerHTML+'</div></div>'+
   '<p class="pit-u-prompt">Experimente os controles. A simulação é local e não altera a etapa liberada para os alunos.</p>',
   {interactive:true,mountModule:src.mod,phase:PHASES[p]});
 });
}
function tutorial(m,p,src,minutes){
 const module=window[src.mod],routes=Array.isArray(module?.routes)?module.routes:null;
 if(!routes||p!==1)return [];
 // Instructor sees all route options. Each tool step gets its own readable slide.
 const out=[],section='EXEMPLO EM AÇÃO · '+minutes[p]+' MIN';
 routes.forEach((route,r)=>{
  const label=route.label||route.title||('ROTA '+(r+1));
  let steps=Array.isArray(route.steps)?route.steps:route.step3?[{title:'Criar a condição',where:route.step3},{title:'Registrar as ações',where:route.step4},{title:'Executar e testar',where:route.step5,fix:route.fix}]:[];
  if(!steps.length)return;
  out.push(slide(section,'Rota '+(r+1)+': '+label,
   heading('GDEVELOP · ESCOLHA DA ROTA')+
   '<div class="pit-u-explainer"><div class="pit-u-point"><h3>'+esc(route.type||route.title||label)+'</h3><p>'+esc(route.intro||route.condition||'Selecione a rota de acordo com o gênero e os objetos do jogo.')+'</p></div></div>'));
  steps.forEach((step,i)=>{
   const what=step.where||step.what||'',action=step.action||step.do||'',result=step.result||step.expect||step.feedback||'',fix=step.fix||'';
   const picture=step.shot||step.image;
   out.push(slide(section,step.title||('Passo '+(i+1)),
    heading('GDEVELOP · '+esc(label)+' · PASSO '+String(i+1).padStart(2,'0')+' / '+String(steps.length).padStart(2,'0'))+
    '<div class="pit-u-tutorial">'+
    '<div class="pit-u-instruction">'+
    (what?'<div><span>ONDE CLICAR</span><p>'+esc(what)+'</p></div>':'')+
    (action?'<div><span>O QUE FAZER</span><p>'+esc(action)+'</p></div>':'')+
    (result?'<div><span>RESULTADO ESPERADO</span><p>'+esc(result)+'</p></div>':'')+
    (fix?'<div><span>SE NÃO DER CERTO</span><p>'+esc(fix)+'</p></div>':'')+
    '</div></div>'));
  });
 });
 return out;
}
function build(m){
 if(!MAP[m])return [];
 const minutes=mins(m),slides=[];
 for(let p=0;p<4;p++){
  const src=source(m,p);
  slides.push(cover(m,p,minutes));
  if(!src)continue;
  slides.push(...storytelling(m,p,src,minutes));
  slides.push(...interactive(m,p,src,minutes));
  slides.push(...tutorial(m,p,src,minutes));
 }
 slides.push(slide('CONCLUSÃO','Missão '+String(m).padStart(2,'0')+' · '+TITLES[m],
 heading('MISSÃO '+String(m).padStart(2,'0')+' / 10 · ENCERRAMENTO')+
 '<div class="pit-u-finale"><div>✦</div><h2>Missão concluída.</h2><p>Revise a evidência da turma e avance para a próxima missão quando estiver pronta. O modo apresentação não libera etapas automaticamente.</p></div>'));
 return slides;
}
function mount(host,s){
 if(!s?.interactive||!s.mountModule)return;
 const module=window[s.mountModule],root=host.querySelector('.pit-u-component');
 if(!module||!root)return;
 try{module.mount?.(root)}catch(err){console.warn('PIT projector: mount failed',s.mountModule,err)}
 // Some mission 3 nested components are autonomous and require their own scoped mounts.
 if(s.mountModule==='PIT_TEACHER_MISSION_THREE'){
  if(root.querySelector('.gd3-root'))window.PIT_GDEVELOP_FIRST_RUN?.mount(root.querySelector('.gd3-root'));
  if(root.querySelector('.ast3-root'))window.PIT_ASSET_STUDIO?.mount(root.querySelector('.ast3-root'),{title:'Projeto de jogo',genre:'Livre',hero:'Protagonista',scene:'Primeira cena',objective:'Criar o MVP'});
 }
}
window.PIT_PROJECTOR_UNIVERSAL={build,mount,PHASES,MAP};
})();
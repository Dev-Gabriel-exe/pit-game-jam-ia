/* Missão 03 — aluno: projeto real no GDevelop; evidence is a truthful self-report,
   not an auto-generated fake claim of opening Preview. */
(function(){
'use strict';
const FIELDS=[
 {key:'project',max:70,min:3,label:'Nome real do projeto no GDevelop',hint:'Nome que aparece na lista de projetos; deve permitir reencontrar o arquivo.'},
 {key:'scene',max:65,min:3,label:'Nome da cena inicial',hint:'Confira o nome da cena aberta no gerenciador.'},
 {key:'object',max:65,min:2,label:'Nome do primeiro objeto',hint:'O nome que você deu no painel Objects, não apenas o nome da imagem.'},
 {key:'preview',max:180,min:15,label:'O que apareceu quando abriu o Preview?',hint:'Descreva o que você viu na execução, inclusive se precisou corrigir algo.'},
 {key:'saved',max:105,min:6,label:'Onde o projeto foi salvo?',hint:'Informe se foi em arquivo/pasta local ou na nuvem, com nome ou caminho que consiga localizar.'},
 {key:'fix',max:105,min:0,label:'Qual problema apareceu e como resolveu? (opcional)',hint:'Se não houve falha, deixe em branco ou explique uma escolha que fez.'}
];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim();
const blank=()=>({project:'',scene:'',object:'',preview:'',saved:'',fix:'',objectType:'2D Sprite',checks:[]});
const key=id=>'pit_v3_missao03_rascunho_'+String(id||'preview').replace(/[^A-Za-z0-9_-]/g,'').slice(0,80);
function load(id){
 try{const o=JSON.parse(localStorage.getItem(key(id))||'{}'),d=blank();for(const f of FIELDS)if(typeof o[f.key]==='string')d[f.key]=o[f.key].slice(0,f.max);
 if(['2D Sprite','3D Box/Modelo'].includes(o.objectType))d.objectType=o.objectType;
 d.checks=Array.isArray(o.checks)?o.checks.filter(x=>[0,1,2].includes(x)):[];
 return d;
 }catch{return blank()}
}
function save(id,d){try{localStorage.setItem(key(id),JSON.stringify(d))}catch{}}
function parseEvidence(raw){
 if(typeof raw!=='string'||!raw.startsWith('MISSÃO 03 — LIGAR O MOTOR'))return null;
 const lines=raw.split('\n');
 const find=p=>{const l=lines.find(s=>s.startsWith(p));return l?l.slice(p.length).trim():''};
 const d=blank();d.project=find('Projeto: ');d.scene=find('Cena: ');d.object=find('Objeto: ');
 const type=find('Tipo: ');if(['2D Sprite','3D Box/Modelo'].includes(type))d.objectType=type;
 d.preview=find('Preview: ');d.saved=find('Salvo em: ');d.fix=find('Diagnóstico: ');
 d.checks=[0,1,2];return d;
}
function hydrate(id,raw,status){
 const d=parseEvidence(raw);if(!d||!d.project||!d.scene)return;
 if(Object.values(load(id)).some(v=>typeof v==='string'&&v.trim())&&!['approved','submitted'].includes(status))return;
 save(id,d);
}
function validity(d){
 const vals=FIELDS.filter(f=>f.min).map(f=>clean(d[f.key]).length>=f.min);
 const checks=[0,1,2].every(x=>d.checks.includes(x));
 return [...vals,checks];
}
function validate(id){
 const d=load(id);
 for(const f of FIELDS)if(clean(d[f.key]).length<f.min)return {ok:false,field:f.key,label:'Descreva com precisão: '+f.label};
 if(![0,1,2].every(n=>d.checks.includes(n)))return {ok:false,field:'checks',label:'Confirme os três testes realizados no GDevelop (cena, Preview e salvamento).'};
 return {ok:true,field:null,label:'Registro técnico pronto para enviar.'};
}
function evidence(id,idea={}){
 const d=load(id);
 const entries=[
  'MISSÃO 03 — LIGAR O MOTOR',
  'Jogo: '+clean(idea.title||'Sem título informado'),
  'Gênero: '+clean(idea.genre||'Não definido'),
  'Projeto: '+clean(d.project),'Cena: '+clean(d.scene),'Objeto: '+clean(d.object),
  'Tipo: '+d.objectType,'Preview: '+clean(d.preview),'Salvo em: '+clean(d.saved),
  'Diagnóstico: '+clean(d.fix||'Nenhum problema relatado')
 ];
 return entries.join('\n').slice(0,750);
}
function ideaOf(ctx){
 const d=ctx.idea||{},m=ctx.mvp||{};
 const p=d.genre?window.PIT_GENRE_CONTEXT?.profile(d.genre):null;
 return {title:d.title||'Seu projeto',genre:d.genre||'',scene:m.scene||p?.scene||'CenaInicial',
  item:p?.character||'Personagem',action:d.action||'uma ação principal',
  mechanism:m.mechanic||p?.mechanic||'uma mecânica'};
}
function header(phase,ctx){
 const i=ideaOf(ctx);
 return '<header class="m3-header"><small>✦ MISSÃO 03 / 10 · '+(phase==='practice'?'CONSTRUÇÃO':phase==='review'?'EVIDÊNCIA':'PORTAL DA ENGINE')+'</small>'+
 '<div class="m3-header-main"><span>III</span><div><small>30 MINUTOS · GDEVELOP</small><h2>Ligar o Motor</h2><p>Da ideia ao primeiro projeto executável.</p></div></div>'+
 '<div class="m3-bond"><strong>SEU JOGO: '+esc(i.title)+'</strong><span>'+esc(i.genre||'Gênero autoral')+' · Cena planejada: '+esc(i.scene)+'</span></div></header>';
}
function intro(ctx){
 const i=ideaOf(ctx);
 return '<div class="m3-page m3-intro"><div class="m3-intro-hero"><div class="m3-cover"><span>✦ UMA NOVA FERRAMENTA FOI DESBLOQUEADA</span></div>'+
 '<div><small>MISSÃO 03 · DESAFIO REAL</small><h3>Seu jogo vai abrir<br><em>pela primeira vez.</em></h3>'+
 '<p>Agora você vai criar <strong>'+esc(i.title)+'</strong> no GDevelop. Sua missão: abrir uma cena, adicionar um objeto de verdade, enxergá-lo no Preview e salvar o projeto. Sem programar controles ainda.</p>'+
 '<div class="m3-target"><small>HERDADO DO SEU MVP</small><strong>'+esc(i.scene)+'</strong><span>Uma cena e um objeto inicial; sua mecânica planejada é '+esc(i.mechanism)+'.</span></div>'+
 '<button type="button" class="m3-primary" data-m3-action="build">✦ ABRIR A MISSÃO NO GDEVELOP ›</button></div></div>'+
 '<div class="m3-goals">'+[
  ['01','CRIAR','Projeto vazio e uma cena nomeada'],
  ['02','MONTAR','Objeto e instância posicionada'],
  ['03','EXECUTAR','Preview visível e arquivo salvo']
 ].map(([n,a,b])=>'<article><span>'+n+' · '+a+'</span><p>'+b+'</p></article>').join('')+'</div></div>';
}
function field(f,d,idea,locked){
 const hint={project:idea.title,scene:idea.scene,object:idea.item,preview:'No Preview apareceu uma personagem no centro da cena, sem movimento.',saved:'Projeto salvo na pasta Jogos/MeuProjeto ou em GDevelop Cloud',fix:'O objeto não aparecia; arrastei uma instância para a cena.'};
 const placeholder='Ex.: '+hint[f.key];
 const attr='id="m3-'+f.key+'" data-m3-field="'+f.key+'" maxlength="'+f.max+'" placeholder="'+esc(placeholder)+'" '+(locked?'disabled':'')+' autocomplete="off"';
 const control=['preview','saved','fix'].includes(f.key)?'<textarea rows="'+(f.key==='preview'?3:2)+'" '+attr+'>'+esc(d[f.key])+'</textarea>':
  '<input type="text" '+attr+' value="'+esc(d[f.key])+'">';
 return '<label class="m3-field" for="m3-'+f.key+'"><strong>'+esc(f.label)+'</strong>'+control+'<small>'+esc(f.hint)+'</small></label>';
}
function checklist(d,locked){
 const steps=[
  ['CRIEI UMA CENA','A cena aparece no gerenciador e contém uma instância do meu objeto.'],
  ['VI O PREVIEW','O Preview abriu e eu observei o objeto em execução (não só no editor).'],
  ['SALVEI O ARQUIVO','Conheço a pasta ou projeto na nuvem e consigo voltar a ele.']
 ];
 return '<div class="m3-checklist"><span>TESTES REALIZADOS · CONFIRMAÇÃO MANUAL</span>'+
 steps.map(([tag,desc],n)=>'<label class="m3-check"><input type="checkbox" data-m3-check="'+n+'" '+(d.checks.includes(n)?'checked':'')+' '+(locked?'disabled':'')+'><span><b>'+tag+'</b><small>'+desc+'</small></span></label>').join('')+
 '<p>Essas confirmações são declarações do estudante: o site não consegue observar o GDevelop automaticamente.</p></div>';
}
function counter(d){
 const total=validity(d).filter(Boolean).length;
 return '<div class="m3-progress"><div><strong><span id="m3Progress">'+total+'</span>/6</strong><small>Verificações e registros completos</small></div>'+
 '<div class="m3-progress-track"><i id="m3ProgressRail" style="width:'+(total/6*100)+'%"></i></div></div>';
}
function practice(ctx){
 const i=ideaOf(ctx),d=load(ctx.session),locked=['approved','submitted'].includes(ctx.status);
 const tags=[
 ['01','PROJETO E CENA','Crie um projeto vazio. Use a cena planejada na Missão 02.','project','scene'],
 ['02','PRIMEIRO OBJETO','Escolha um Sprite 2D ou objeto 3D, nomeie e coloque uma instância na área da cena.','object'],
 ['03','PREVIEW E SALVAR','Execute o jogo, observe o resultado e salve o projeto editável.','preview','saved','fix']
 ];
 return '<div class="m3-page m3-work"><div class="m3-lead"><span>◈ PRIMEIRO PROJETO REAL</span><h3>Construa o começo do seu jogo.</h3>'+
 '<p>Use as imagens do tutorial e execute as ações no GDevelop. O objetivo nesta missão é verificar a estrutura e o Preview, não ter um personagem andando.</p></div>'+
 (locked?'<div class="m3-notice">Esta entrega está '+(ctx.status==='approved'?'aprovada':'em análise')+'. O registro permanece disponível para leitura.</div>':'')+
 (window.PIT_GDEVELOP_FIRST_RUN?window.PIT_GDEVELOP_FIRST_RUN.render('student'):'<p>Projeto vazio → cena → objeto → Preview → salvar.</p>')+
 '<div class="m3-work-layout"><div class="m3-work-fields">'+tags.map(([num,title,desc,...keys])=>
 '<section class="m3-chapter"><span>✦ FRAGMENTO '+num+' / 03</span><h4>'+title+'</h4><p>'+desc+'</p>'+
 (num==='02'?'<div class="m3-type-select"><span>TIPO DO SEU PRIMEIRO OBJETO</span><div>'+
 ['2D Sprite','3D Box/Modelo'].map(t=>'<label><input type="radio" name="m3ObjectType" data-m3-type="'+esc(t)+'" value="'+esc(t)+'" '+(d.objectType===t?'checked':'')+' '+(locked?'disabled':'')+'> '+esc(t)+'</label>').join('')+
 '</div></div>':'')+
 keys.map(k=>field(FIELDS.find(f=>f.key===k),d,i,locked)).join('')+
 (num==='03'?checklist(d,locked):'')+'</section>').join('')+
 '<div class="m3-controls"><span id="m3Notice" aria-live="polite">Rascunho guardado neste navegador</span>'+
 '<button type="button" class="m3-primary" data-m3-action="review">CONFERIR MEU PRIMEIRO PROJETO ›</button></div></div>'+
 '<aside class="m3-status">'+
 '<div class="m3-status-art"><span>SEU PRIMEIRO PREVIEW</span></div>'+
 '<div class="m3-status-inner"><small>GAME PROJECT · '+esc(i.genre||'AUTORAL')+'</small><h4>'+esc(i.title)+'</h4>'+
 '<p><b>CENA</b><span data-m3-preview="scene">'+esc(d.scene||i.scene)+'</span></p>'+
 '<p><b>OBJETO</b><span data-m3-preview="object">'+esc(d.object||'Ainda não registrado')+'</span></p>'+
 '<p><b>TIPO</b><span id="m3SelectedType">'+esc(d.objectType)+'</span></p>'+counter(d)+
 '<small>Os campos registram o trabalho real. A ficha não cria um jogo automaticamente.</small></div></div></aside></div></div>';
}
function review(ctx){
 const i=ideaOf(ctx),d=load(ctx.session),v=validate(ctx.session),submitted=['submitted','approved'].includes(ctx.status);
 const status=ctx.status==='approved'?'✦ APROVADA PELO PROFESSOR':ctx.status==='submitted'?'⌛ ENVIADA PARA AVALIAÇÃO':ctx.status==='revision'?'↺ REVISÃO SOLICITADA':'✦ REGISTRO TÉCNICO';
 return '<div class="m3-page m3-review"><div class="m3-lead"><span>◈ ENTREGA · PRIMEIRO PREVIEW</span><h3>Seu projeto já executa uma cena.</h3>'+
 '<p>Confira a descrição do objeto, o resultado que você observou e onde salvou o arquivo. A entrega registra sua execução real.</p></div>'+
 '<div class="m3-review-layout"><div><div class="m3-review-badge">'+status+'</div>'+
 (ctx.feedback?'<div class="m3-notice"><strong>RETORNO DO PROFESSOR</strong><p>'+esc(ctx.feedback)+'</p></div>':'')+
 '<div class="m3-review-report"><strong>✦ DOCUMENTO DA MISSÃO 03</strong><h4>'+esc(i.title)+'</h4>'+
 '<div class="m3-review-grid">'+[['PROJETO',d.project],['CENA',d.scene],['OBJETO',d.object],['TIPO',d.objectType],['PREVIEW',d.preview],['SALVAMENTO',d.saved],['DIAGNÓSTICO',d.fix||'Nenhum problema relatado']].map(([label,v])=>
 '<div><span>'+label+'</span><p>'+esc(v||'Não informado')+'</p></div>').join('')+'</div>'+
 '<label for="evidenceInput">Evidência enviada para avaliação</label><textarea id="evidenceInput" readonly maxlength="750">'+esc(evidence(ctx.session,ctx.idea))+'</textarea>'+
 '<small>O professor receberá somente os dados declarados aqui. O site não consegue verificar automaticamente seu Preview.</small></div>'+
 (!v.ok?'<div class="m3-notice">Antes de enviar: '+esc(v.label)+'</div>':'')+
 '<div class="m3-actions"><button type="button" data-m3-action="back" class="m3-back" '+(submitted?'disabled':'')+'>‹ REVISAR PROJETO</button>'+
 '<button type="button" id="submitWork" class="m3-primary" '+(!v.ok||submitted||!ctx.canSubmit?'disabled':'')+'>'+
 (ctx.preview?'✧ SIMULAR ENTREGA':'✦ ENVIAR AO PROFESSOR')+'</button></div>'+
 (ctx.preview?'<p class="m3-preview-note">Prévia local: nenhum registro será enviado para a turma real.</p>':'')+'</div>'+
 '<aside class="m3-review-side"><div class="m3-result"><span>III</span><h4>Primeiro projeto executável</h4>'+
 '<p>Conquistar a missão depende da avaliação real do professor.</p></div>'+
 '<div class="m3-transition"><strong>PRÓXIMA MISSÃO</strong><p>Primeiro Jogável: controle do personagem, interação e limites no GDevelop.</p></div></aside></div></div>';
}
function render(ctx){return '<div class="m3-root" id="m3Root">'+header(ctx.phase,ctx)+(ctx.phase==='practice'?practice(ctx):ctx.phase==='review'?review(ctx):intro(ctx))+'</div>'}
function mount(ctx){
 const root=document.querySelector('#m3Root');if(!root)return;
 window.PIT_GDEVELOP_FIRST_RUN?.mount(root.querySelector('.gd3-root'));
 let d=load(ctx.session);
 function update(){
  const result=validity(d),filled=result.filter(Boolean).length;
  const n=root.querySelector('#m3Progress'),rail=root.querySelector('#m3ProgressRail');
  if(n)n.textContent=String(filled);
  if(rail)rail.style.width=(filled/6*100)+'%';
  root.querySelectorAll('[data-m3-preview]').forEach(el=>{
   const name=el.dataset.m3Preview;el.textContent=d[name]||'Ainda não registrado';
  });
  const type=root.querySelector('#m3SelectedType');if(type)type.textContent=d.objectType;
  const note=root.querySelector('#m3Notice');if(note)note.textContent=filled+'/6 registros e verificações · rascunho salvo neste navegador';
 }
 root.querySelectorAll('[data-m3-field]').forEach(el=>el.addEventListener('input',()=>{
  d[el.dataset.m3Field]=el.value;save(ctx.session,d);update();
 }));
 root.querySelectorAll('[data-m3-type]').forEach(el=>el.addEventListener('change',()=>{
  if(!el.checked)return;d.objectType=el.value;save(ctx.session,d);update();
 }));
 root.querySelectorAll('[data-m3-check]').forEach(el=>el.addEventListener('change',()=>{
  const v=Number(el.dataset.m3Check);
  d.checks=el.checked?[...new Set([...d.checks,v])].sort() :d.checks.filter(x=>x!==v);
  save(ctx.session,d);update();
 }));
 root.querySelectorAll('[data-m3-action]').forEach(el=>el.addEventListener('click',()=>{
  const act=el.dataset.m3Action;
  if(act==='build'||act==='back')ctx.onPhase('practice');
  if(act==='review'){
   const result=validate(ctx.session);
   if(!result.ok){
    ctx.onMessage(result.label);root.querySelector('#m3-'+result.field)?.focus();return;
   }
   ctx.onPhase('review');
  }
 }));
 update();
}
window.PIT_STUDENT_MISSION_THREE={render,mount,load,save,hydrate,validate,evidence,validity};
})();
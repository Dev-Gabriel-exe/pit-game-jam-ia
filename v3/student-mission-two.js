(function studentTwo(){
'use strict';
const FIELDS=[
 {id:'scene',label:'Onde seu primeiro jogo vai acontecer?',min:5,max:86,help:'Uma cena, sala, pista, tela ou percurso curto — não o universo inteiro.'},
 {id:'mechanic',label:'Qual mecânica será jogável primeiro?',min:5,max:105,help:'Escolha uma única interação principal: coletar, conversar, clicar, saltar, correr...'},
 {id:'elements',label:'Quais três elementos são indispensáveis?',min:9,max:120,help:'Separe três elementos por vírgula, por exemplo: Personagem, Chave, Porta.'},
 {id:'test',label:'Como alguém vai comprovar que funciona?',min:12,max:155,help:'Defina uma situação e um resultado: quando acontecer X, o jogo mostrará Y.'},
 {id:'later',label:'O que pode ficar para depois?',min:0,max:120,help:'Opcional: efeitos, personagens, mapas ou sistemas que não são essenciais ao MVP.'}
];
const blank=()=>({scene:'',mechanic:'',elements:'',test:'',later:''});
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const key=id=>'pit_v3_missao02_rascunho_'+String(id||'preview').replace(/[^A-Za-z0-9_-]/g,'').slice(0,80);
function load(session){
 try{
  const obj=JSON.parse(localStorage.getItem(key(session))||'{}'),out=blank();
  for(const f of FIELDS)if(typeof obj[f.id]==='string')out[f.id]=obj[f.id].slice(0,f.max);
  return out;
 }catch{return blank()}
}
function save(session,data){try{localStorage.setItem(key(session),JSON.stringify(data))}catch{}}
function parseEvidence(raw){
 if(typeof raw!=='string'||!raw.startsWith('MISSÃO 02 — MVP EM FOCO'))return null;
 const lines=raw.split('\n'),take=prefix=>{const line=lines.find(l=>l.startsWith(prefix));return line?line.slice(prefix.length).trim():''};
 return {scene:take('Cena: '),mechanic:take('Mecânica: '),elements:take('Elementos: '),test:take('Teste: '),later:take('Depois: ')};
}
function hydrate(session,raw,status){
 const obj=parseEvidence(raw);if(!obj)return;
 if(Object.values(load(session)).some(Boolean)&&!['approved','submitted'].includes(status))return;
 if(obj.scene&&obj.mechanic)save(session,obj);
}
function validate(session){
 const d=load(session);
 for(const f of FIELDS){
  if(clean(d[f.id]).length<f.min)return {ok:false,field:f.id,label:'Complete o campo "'+f.label+'" para definir seu MVP.'};
 }
 const count=d.elements.split(/[,;\n]/).map(clean).filter(Boolean).length;
 if(count!==3)return {ok:false,field:'elements',label:'Liste exatamente três elementos indispensáveis, separados por vírgula.'};
 return {ok:true,label:'MVP especificado.',field:null};
}
function progress(d){
 return [clean(d.scene).length>=5,clean(d.mechanic).length>=5,
  clean(d.elements).split(/[,;\n]/).map(clean).filter(Boolean).length===3,clean(d.test).length>=12];
}
function getIdea(ctx){
 const c=ctx?.idea||{},g=window.PIT_GENRE_CONTEXT;
 const profile=g?.profile(c.genre)||null;
 return {genre:c.genre||'',title:c.title||'Seu jogo',hero:c.hero||'Seu personagem',action:c.action||'Sua primeira ação',
  objective:c.objective||'Seu objetivo',victory:c.victory||'Sua conclusão',profile};
}
function example(id,ctx){
 const i=getIdea(ctx),p=i.profile;
 if(!p)return ({scene:'Uma sala ou cenário curto',mechanic:'Coletar um objeto e mudar o estado',elements:'Personagem, Item, Saída',
  test:'Quando encontrar o objeto e chegar à saída, mostrar uma vitória',later:'Cenas extras, menus e efeitos avançados'})[id]||'';
 return ({
  scene:p.scene,
  mechanic:p.mechanic,
  elements:p.character+', '+p.item+', '+(p.genre==='Puzzle'?'cofre':p.genre==='Corrida'?'linha de chegada':'saída'),
  test:p.trigger+' → '+p.signal,
  later:'Vários cenários, inventário completo, animações extras'
 })[id]||'';
}
function field(id,ctx,d,readonly){
 const f=FIELDS.find(x=>x.id===id),sample=example(id,ctx);
 const textarea=id==='test'||id==='later';
 const attr='data-m2-field="'+id+'" id="m2-'+id+'" maxlength="'+f.max+'" '+(readonly?'disabled':'')+' placeholder="'+esc('Ex.: '+sample)+'" autocomplete="off"';
 const input=textarea?'<textarea rows="'+(id==='test'?3:2)+'" '+attr+'>'+esc(d[id])+'</textarea>':
  '<input type="text" '+attr+' value="'+esc(d[id])+'">';
 return '<label class="m2-field" for="m2-'+id+'"><span>'+f.label+'</span>'+input+'<small>'+f.help+'</small></label>';
}
function live(d,ctx){
 const i=getIdea(ctx);
 const pairs=[['CENÁRIO','scene','Uma cena pequena'],['MECÂNICA','mechanic','Uma interação principal'],
  ['3 ELEMENTOS','elements','Três objetos ou sistemas'],['PRONTO QUANDO','test','Uma condição testável']];
 const done=progress(d).filter(Boolean).length;
 return '<aside class="m2-live" aria-label="Resumo do MVP em construção"><div class="m2-live-art"><span>PROJETO '+esc(i.genre?i.genre.toUpperCase():'AUTORAL')+'</span></div>'+
 '<div class="m2-live-inner"><span class="m2-brow">◈ DOCUMENTO DE ESCOPO · VERSÃO 0.1</span>'+
 '<h4>'+esc(i.title)+'</h4><p class="m2-live-idea">Da Missão 01: <strong>'+esc(i.action)+'</strong> para <strong>'+esc(i.objective)+'</strong>.</p>'+
 pairs.map(([name,id,empty],j)=>'<div class="m2-live-row '+(clean(d[id])?'ready':'')+'"><span>'+('0'+(j+1))+'</span><div><small>'+name+'</small><p data-m2-preview="'+id+'">'+esc(clean(d[id])||empty)+'</p></div></div>').join('')+
 '<div class="m2-scope-meter"><span><b id="m2Done">'+done+'</b>/4 decisões essenciais definidas</span><div><i id="m2Rail" style="width:'+(done*25)+'%"></i></div></div>'+
 '<div class="m2-later"><small>DEPOIS DA OFICINA · NÃO ESSENCIAL</small><p data-m2-preview="later">'+esc(clean(d.later)||'Nenhum item opcional registrado')+'</p></div></div></aside>';
}
function header(phase,ctx){
 const idea=getIdea(ctx),p=idea.profile;
 return '<header class="m2-header"><small>✦ CAPÍTULO II · '+(phase==='briefing'?'DESAFIO DE PROJETO':phase==='practice'?'CONSTRUÇÃO':'ENTREGA')+'</small>'+
 '<div class="m2-title-row"><span class="m2-shield">II</span><div><span>MISSÃO 02 / 10 · 30 MINUTOS</span><h2>MVP em Foco</h2><p>Uma ideia grande. Um jogo possível.</p></div></div>'+
 (p&&idea.genre?'<div class="m2-genre-chip">⚔ UNIVERSO: '+esc(idea.genre.toUpperCase())+' · PROJETO: '+esc(idea.title)+'</div>':'')+'</header>';
}
function intro(ctx){
 const idea=getIdea(ctx);
 return '<div class="m2-page">'+
 '<div class="m2-intro-hero"><div class="m2-intro-art" role="img" aria-label="Livro de planos gótico em uma oficina mágica"></div>'+
 '<div><span class="m2-brow">✧ O DESAFIO DO CRIADOR</span><h3>O seu mundo pode ser enorme.<br><em>Seu primeiro jogo, não.</em></h3>'+
 '<p>Na Missão 01 você definiu sua ideia. Agora vamos separar o que é <strong>indispensável para jogar</strong> daquilo que poderá ser acrescentado depois. Não é necessário abrir o GDevelop ainda.</p>'+
 '<div class="m2-origin"><small>DA SUA MISSÃO 01</small><strong>'+esc(idea.title)+'</strong><span>'+esc(idea.action)+' → '+esc(idea.objective)+'</span></div>'+
 '<button type="button" data-m2-action="build" class="m2-primary">✦ DEFINIR MEU MVP ›</button></div></div>'+
 '<div class="m2-brief-grid"><article><span>01 / ESCOLHER</span><p>Uma cena e uma única mecânica central.</p></article>'+
 '<article><span>02 / PRIORIZAR</span><p>Três elementos indispensáveis. O resto pode esperar.</p></article>'+
 '<article><span>03 / COMPROVAR</span><p>Uma regra clara para saber quando o protótipo está pronto.</p></article></div></div>';
}
function building(ctx){
 const idea=getIdea(ctx),d=load(ctx.session),locked=['submitted','approved'].includes(ctx.status);
 const blocks=[
  ['01','♜','Seu primeiro cenário','Em que lugar a experiência mínima acontecerá?',field('scene',ctx,d,locked)],
  ['02','⚒','A mecânica que importa','Qual ação da sua ideia precisa funcionar primeiro?',field('mechanic',ctx,d,locked)+field('elements',ctx,d,locked)],
  ['03','✦','Comprovação e backlog','O que precisa acontecer para afirmar que a experiência funciona?',field('test',ctx,d,locked)+field('later',ctx,d,locked)]
 ];
 return '<div class="m2-page"><div class="m2-lead"><span class="m2-brow">✦ DO CONCEITO AO ESCOPO</span><h3>Seu jogo cabe em <em>uma primeira versão?</em></h3>'+
 '<p>Use sua ideia como ponto de partida e escolha um recorte possível. O importante é preservar a ação central e um resultado verificável.</p>'+
 (locked?'<div class="m2-state-notice">Entrega '+(ctx.status==='approved'?'aprovada':'enviada')+'. Seu documento está disponível somente para leitura.</div>':'')+
 '</div><div class="m2-workspace"><div class="m2-sections">'+blocks.map(([num,icon,name,description,fields])=>
 '<section class="m2-panel"><div class="m2-panel-heading"><span>'+icon+' FRAGMENTO '+num+' / 03</span><h4>'+name+'</h4><p>'+description+'</p></div>'+fields+'</section>').join('')+
 '<div class="m2-next"><span id="m2Notice" aria-live="polite">'+progress(d).filter(Boolean).length+' de 4 decisões essenciais definidas · rascunho salvo neste navegador</span>'+
 '<button class="m2-primary" type="button" data-m2-action="review">VER MEU PLANO DE JOGO ›</button></div></div>'+
 '<div class="m2-asides">'+live(d,ctx)+
 '<div class="m2-hint"><span>✧ EXEMPLO PARA '+esc((idea.genre||'UM JOGO').toUpperCase())+'</span>'+
 '<p>Uma versão pequena pode funcionar com <strong>'+esc(example('scene',ctx))+'</strong>, a mecânica <strong>'+esc(example('mechanic',ctx))+'</strong> e uma condição de conclusão.</p>'+
 '<small>É uma referência para adaptar, não uma resposta obrigatória.</small></div></div></div></div>';
}
function delivery(ctx){
 const d=load(ctx.session),v=validate(ctx.session),submitted=['submitted','approved'].includes(ctx.status);
 const status=ctx.status==='approved'?'✦ PLANO APROVADO PELO PROFESSOR':
  ctx.status==='revision'?'↻ O PROFESSOR SOLICITOU REVISÃO':
  submitted?'⌛ PLANO ENVIADO PARA AVALIAÇÃO':'✦ SEU MVP ESTÁ ESPECIFICADO';
 return '<div class="m2-page m2-delivery"><div class="m2-lead"><span class="m2-brow">✦ MVP EM FOCO · ENTREGA</span>'+
 '<h3>Uma primeira versão <em>que pode funcionar.</em></h3><p>Esta é a especificação que orientará a criação do projeto no GDevelop. Ainda não é necessário ter um jogo executável.</p></div>'+
 '<div class="m2-delivery-layout"><div><div class="m2-stamp">'+status+'</div>'+
 (ctx.feedback?'<div class="m2-feedback"><strong>RETORNO DO PROFESSOR</strong><p>'+esc(ctx.feedback)+'</p></div>':'')+
 live(d,ctx)+
 '<div class="m2-evidence"><strong>◈ FICHA DO MVP PARA AVALIAÇÃO</strong><label for="evidenceInput">Registro enviado ao professor</label>'+
 '<textarea id="evidenceInput" readonly maxlength="750">'+esc(evidence(ctx.session,ctx.idea))+'</textarea><small>O texto é criado a partir do que você definiu. Para alterar, volte à construção.</small></div>'+
 '<div class="m2-actions"><button type="button" class="m2-back" data-m2-action="back" '+(submitted?'disabled':'')+'>‹ REVISAR MVP</button>'+
 '<button type="button" class="m2-primary" id="submitWork" '+(!v.ok||submitted||!ctx.canSubmit?'disabled':'')+'>'+
 (ctx.preview?'✧ SIMULAR ENTREGA':'✦ ENVIAR AO PROFESSOR')+'</button></div>'+
 (!v.ok?'<p class="m2-warning">Ainda falta definir uma parte do MVP: '+esc(v.label)+'</p>':'')+
 (ctx.preview?'<p class="m2-preview-msg">Prévia local: nenhuma informação será enviada para uma turma real.</p>':'')+'</div>'+
 '<aside class="m2-result-aside"><div class="m2-result-medal"><span>✦</span><strong>'+(ctx.status==='approved'?'MISSÃO CONQUISTADA':'PLANO EM CONSTRUÇÃO')+'</strong>'+
 '<p>A aprovação da missão depende de avaliação do professor, não do simples preenchimento.</p></div>'+
 '<div class="m2-hint"><span>PRÓXIMA ETAPA</span><p>Missão 03 — Ligar o Motor: criar a cena e os primeiros objetos no GDevelop.</p></div></aside></div></div>';
}
function evidence(session,source){
 const i=getIdea({idea:source}),d=load(session);
 const lines=['MISSÃO 02 — MVP EM FOCO','Jogo: '+clean(i.title),'Gênero: '+clean(i.genre),
  'Cena: '+clean(d.scene),'Mecânica: '+clean(d.mechanic),'Elementos: '+clean(d.elements),
  'Teste: '+clean(d.test),'Depois: '+clean(d.later||'Não informado')];
 return lines.join('\n').slice(0,750);
}
function render(ctx){return '<div class="m2-root" id="m2Root">'+header(ctx.phase,ctx)+(ctx.phase==='practice'?building(ctx):ctx.phase==='review'?delivery(ctx):intro(ctx))+'</div>'}
function mount(ctx){
 const root=document.querySelector('#m2Root');if(!root)return;
 const d=load(ctx.session),updating=()=>{};
 function redraw(){
  const filled=progress(d).filter(Boolean).length;
  root.querySelectorAll('[data-m2-preview]').forEach(el=>{
   const k=el.dataset.m2Preview;
   const fallback={scene:'Uma cena pequena',mechanic:'Uma interação principal',elements:'Três objetos ou sistemas',
    test:'Uma condição testável',later:'Nenhum item opcional registrado'};
   el.textContent=clean(d[k])||fallback[k]||'';
   el.closest('.m2-live-row')?.classList.toggle('ready',!!clean(d[k]));
  });
  const notice=root.querySelector('#m2Notice'),done=root.querySelector('#m2Done'),bar=root.querySelector('#m2Rail');
  if(notice)notice.textContent=filled+' de 4 decisões essenciais definidas · rascunho salvo neste navegador';
  if(done)done.textContent=filled;
  if(bar)bar.style.width=filled*25+'%';
 }
 root.querySelectorAll('[data-m2-field]').forEach(el=>{
  const change=()=>{d[el.dataset.m2Field]=el.value;save(ctx.session,d);redraw()};
  el.addEventListener('input',change);el.addEventListener('change',change);
 });
 root.querySelectorAll('[data-m2-action]').forEach(btn=>btn.addEventListener('click',()=>{
  const a=btn.dataset.m2Action;
  if(a==='build')ctx.onPhase('practice');
  if(a==='back')ctx.onPhase('practice');
  if(a==='review'){
   const v=validate(ctx.session);
   if(!v.ok){
    ctx.onMessage(v.label);
    root.querySelector('#m2-'+v.field)?.focus();return;
   }
   ctx.onPhase('review');
  }
 }));
 redraw();
}
window.PIT_STUDENT_MISSION_TWO={render,mount,load,save,hydrate,validate,evidence,progress,example};
})();
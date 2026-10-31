(function studentTwo(){
'use strict';
const FIELDS=[
 {id:'scene',label:'Onde seu primeiro jogo vai acontecer?',min:5,max:86,help:'Uma cena, sala, pista, tela ou percurso curto — não o universo inteiro.'},
 {id:'mechanic',label:'Qual mecânica será jogável primeiro?',min:5,max:105,help:'Escolha uma única interação principal: coletar, conversar, clicar, saltar, correr...'},
 {id:'elements',label:'Quais três elementos são indispensáveis?',min:9,max:120,help:'Liste três elementos separados por vírgula, ponto e vírgula ou ·. Ex.: Personagem, Chave, Porta.'},
 {id:'test',label:'Como alguém vai comprovar que funciona?',min:12,max:155,help:'Escreva um teste observável: DADO um estado, QUANDO alguém age, ENTÃO o jogo responde.'},
 {id:'later',label:'O que pode ficar para depois?',min:0,max:120,help:'Opcional: efeitos, personagens, mapas ou sistemas que não são essenciais ao MVP.'}
];
const blank=()=>({scene:'',mechanic:'',elements:'',test:'',later:''});
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const parts=s=>String(s??'').split(/[,;·•\n]/).map(clean).filter(Boolean);
const essential=d=>[clean(d.scene).length>=5,clean(d.mechanic).length>=5,clean(d.elements).length>=9&&parts(d.elements).length===3,clean(d.test).length>=12];
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
 // API antiga podia achatar as linhas. Nao reconstruir respostas por suposicao.
 if(typeof raw!=='string')return null;
 const lines=raw.replace(/\r\n?/g,'\n').split('\n');
 const labels=['Jogo: ','Gênero: ','Cena: ','Mecânica: ','Elementos: ','Teste: ','Depois: '];
 if(lines.length!==labels.length+1||lines[0]!=='MISSÃO 02 — MVP EM FOCO')return null;
 const values=[];
 for(let i=0;i<labels.length;i++){
  if(!lines[i+1].startsWith(labels[i]))return null;
  const value=lines[i+1].slice(labels[i].length);
  if(value!==value.trim())return null;
  values.push(value);
 }
 const [title,genre,scene,mechanic,elements,test,later]=values;
 if(title.length>50||genre.length>25)return null;
 const d={scene,mechanic,elements,test,later:later==='Não informado'?'':later};
 if(FIELDS.some(f=>clean(d[f.id]).length<f.min||d[f.id].length>f.max))return null;
 if(parts(d.elements).length!==3)return null;
 return d;
}
function hydrate(session,raw,status){
 const obj=parseEvidence(raw);if(!obj)return;
 // Rascunhos locais sempre prevalecem, inclusive com entrega aprovada.
 if(Object.values(load(session)).some(Boolean))return;
 save(session,obj);
}
function validate(session){
 const d=load(session);
 for(const f of FIELDS){
  if(clean(d[f.id]).length<f.min)return {ok:false,field:f.id,label:'Complete o campo "'+f.label+'" para definir seu MVP.'};
 }
 const count=parts(d.elements).length;
 if(count!==3)return {ok:false,field:'elements',label:'Liste exatamente três elementos indispensáveis, separados por vírgula.'};
 return {ok:true,label:'MVP especificado.',field:null};
}
function progress(d){
 return essential(d);
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
  test:'Dado o início da fase, quando '+p.trigger+', então '+p.signal+'.',
  later:'Vários cenários, inventário completo, animações extras'
 })[id]||'';
}
function field(id,ctx,d,readonly){
 const f=FIELDS.find(x=>x.id===id),sample=example(id,ctx);
 const textarea=id==='test'||id==='later';
 const attr='data-m2-field="'+id+'" id="m2-'+id+'" maxlength="'+f.max+'" '+(readonly?'disabled':'')+' placeholder="'+esc('Ex.: '+sample)+'" autocomplete="off"';
 const input=textarea?'<textarea rows="'+(id==='test'?3:2)+'" '+attr+'>'+esc(d[id])+'</textarea>':
  '<input type="text" '+attr+' value="'+esc(d[id])+'">';
 return '<label class="m2-field" for="m2-'+id+'"><span>'+f.label+'</span>'+input+'<small>'+f.help+'</small>'+(
  id==='elements'?'<small class="m2-field-counter" id="m2ElementsCount" aria-live="polite">'+parts(d.elements).length+' de 3 elementos identificados</small>':
  id==='test'?'<div class="m2-acceptance-guide"><b>TESTE DE ACEITAÇÃO</b><span>DADO que existe um estado inicial, QUANDO o jogador faz algo, ENTÃO o jogo mostra um resultado verificável.</span></div>':'')+'</label>';
}
function live(d,ctx){
 const i=getIdea(ctx);
 const pairs=[['CENÁRIO','scene','Uma cena pequena'],['MECÂNICA','mechanic','Uma interação principal'],
  ['3 ELEMENTOS','elements','Três objetos ou sistemas'],['PRONTO QUANDO','test','Uma condição testável']];
 const ok=progress(d),done=ok.filter(Boolean).length;
 return '<aside class="m2-live" aria-label="Resumo do MVP em construção"><div class="m2-live-art"><span>PROJETO '+esc(i.genre?i.genre.toUpperCase():'AUTORAL')+'</span></div>'+
 '<div class="m2-live-inner"><span class="m2-brow">◈ DOCUMENTO DE ESCOPO · VERSÃO 0.1</span>'+
 '<h4>'+esc(i.title)+'</h4><p class="m2-live-idea">Da Missão 01: <strong>'+esc(i.action)+'</strong> para <strong>'+esc(i.objective)+'</strong>.</p>'+
 pairs.map(([name,id,empty],j)=>'<div class="m2-live-row '+(ok[j]?'ready':'')+'"><span>'+('0'+(j+1))+'</span><div><small>'+name+'</small><p data-m2-preview="'+id+'">'+esc(clean(d[id])||empty)+'</p></div></div>').join('')+
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
 '<div class="m2-hint" role="note"><strong>PASSO A PASSO · SEM ABRIR O GDEVELOP</strong><p><b>Onde:</b> preencha os campos dos três fragmentos desta página. <b>1.</b> Descreva uma cena pequena, como uma sala. <b>2.</b> Escreva uma única ação jogável, como coletar. <b>3.</b> Liste exatamente três elementos, separados por vírgulas (ex.: Jogador, Chave, Porta). <b>4.</b> Escreva o teste: “Dado que o jogador tem a chave, quando tocar a porta, então a saída abre”. <b>5.</b> Se quiser, registre o que ficará para depois. <b>Como conferir:</b> observe as quatro decisões no resumo ao lado e o contador “3 de 3 elementos”. <b>Entrega:</b> clique em “Ver meu plano de jogo”, revise a ficha e selecione “Enviar ao professor” quando a prática estiver liberada. O rascunho salvo neste navegador não equivale à entrega.</p><p>Se o envio não estiver disponível, confira campos incompletos, a quantidade de elementos, a liberação da prática e se o plano já foi enviado.</p></div>'+
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
 // Orçamento total máximo: 747 caracteres; nunca truncar um campo no meio.
 const lines=['MISSÃO 02 — MVP EM FOCO','Jogo: '+clean(i.title).slice(0,50),'Gênero: '+clean(i.genre).slice(0,25),
  'Cena: '+clean(d.scene),'Mecânica: '+clean(d.mechanic),'Elementos: '+clean(d.elements),
  'Teste: '+clean(d.test),'Depois: '+clean(d.later||'Não informado')];
 return lines.join('\n');
}
function render(ctx){return '<div class="m2-root" id="m2Root">'+header(ctx.phase,ctx)+(ctx.phase==='practice'?building(ctx):ctx.phase==='review'?delivery(ctx):intro(ctx))+'</div>'}
function mount(ctx){
 const root=document.querySelector('#m2Root');if(!root)return;
 const d=load(ctx.session);
 function redraw(){
  const results=progress(d),filled=results.filter(Boolean).length;
  root.querySelectorAll('[data-m2-preview]').forEach(el=>{
   const k=el.dataset.m2Preview;
   const fallback={scene:'Uma cena pequena',mechanic:'Uma interação principal',elements:'Três objetos ou sistemas',
    test:'Uma condição testável',later:'Nenhum item opcional registrado'};
   el.textContent=clean(d[k])||fallback[k]||'';
   const index={scene:0,mechanic:1,elements:2,test:3}[k];
   el.closest('.m2-live-row')?.classList.toggle('ready',index!==undefined?results[index]:!!clean(d[k]));
  });
  const notice=root.querySelector('#m2Notice'),done=root.querySelector('#m2Done'),bar=root.querySelector('#m2Rail');
  if(notice)notice.textContent=filled+' de 4 decisões essenciais definidas · rascunho salvo neste navegador';
  if(done)done.textContent=filled;
  if(bar)bar.style.width=filled*25+'%';
  const counter=root.querySelector('#m2ElementsCount');
  if(counter){const n=parts(d.elements).length;counter.textContent=n+' de 3 elementos identificados'+(n>3?' · reduza o escopo':n===3?' · quantidade correta':'');counter.classList.toggle('m2-counter-complete',results[2]);}
  const input=root.querySelector('#m2-elements');
  if(input){const n=parts(d.elements).length;input.setAttribute('aria-invalid',String(Boolean(n)&&!results[2]));}
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
window.PIT_STUDENT_MISSION_TWO={render,mount,load,save,parseEvidence,hydrate,validate,evidence,progress,example};
})();
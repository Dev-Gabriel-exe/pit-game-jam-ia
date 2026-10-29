/* PIT Game Jam V3 — Missão 01: jornada autoral, sem alterar a API existente. */
(function(){
'use strict';
const FIELDS=[
 {id:'title',label:'Nome provisório do jogo',min:3,max:55},
 {id:'hero',label:'Protagonista ou objeto controlado',min:3,max:55},
 {id:'action',label:'O que o jogador vai fazer',min:3,max:80},
 {id:'objective',label:'Para alcançar qual objetivo',min:5,max:105},
 {id:'victory',label:'Quando o jogo estará concluído',min:5,max:105},
 {id:'feedback',label:'Como o jogador perceberá que conseguiu',min:5,max:105}
];
const GENRES=['','Aventura','RPG','Terror','Plataforma','Corrida','Puzzle','Narrativa interativa','Exploração','Outro'];
const escapeHTML=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initial=()=>({genre:'',title:'',hero:'',action:'',objective:'',victory:'',feedback:''});
function key(session){return 'pit_v3_missao01_rascunho_'+String(session||'preview').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);}
function load(session){
 try{
  const data=JSON.parse(localStorage.getItem(key(session))||'{}');
  const base=initial();for(const field of ['genre',...FIELDS.map(f=>f.id)])if(typeof data[field]==='string')base[field]=data[field].slice(0,110);
  return base;
 }catch{return initial();}
}
function save(session,draft){try{localStorage.setItem(key(session),JSON.stringify(draft))}catch{}}
function hydrate(session,serverEvidence,status){
 if(!serverEvidence||typeof serverEvidence!=='string'||!serverEvidence.startsWith('MISSÃO 01 — O CHAMADO'))return;
 const stored=load(session),exists=Object.values(stored).some(x=>!!x);
 // A entrega aprovada/enviada é a versão oficial, não um rascunho antigo.
 if(exists&&status!=='approved'&&status!=='submitted')return;
 const lines=serverEvidence.split('\n'),parsed=initial();
 const take=prefix=>{const line=lines.find(x=>x.startsWith(prefix));return line?line.slice(prefix.length).trim():''};
 parsed.title=take('Jogo: ');
 const pair=take('Gênero: ');
 const split=pair.indexOf('; Protagonista: ');
 if(split>=0){parsed.genre=pair.slice(0,split);parsed.hero=pair.slice(split+'; Protagonista: '.length)}
 parsed.action=take('Ação principal: ');
 parsed.objective=take('Objetivo do jogador: ');
 parsed.victory=take('Condição de conclusão: ');
 parsed.feedback=take('Feedback da conquista: ');
 // Nunca substituir uma ficha local por uma evidencia remota incompleta ou truncada.
  // Em uma entrega valida, todos os campos obrigatorios e o genero precisam sobreviver ao roundtrip.
  if(GENRES.includes(parsed.genre)&&parsed.genre&&FIELDS.every(f=>parsed[f.id].trim().length>=f.min&&parsed[f.id].length<=f.max))save(session,parsed);
}
function stepProgress(draft){
 return [
  !!(draft.genre&&draft.title.trim().length>=3&&draft.hero.trim().length>=3),
  !!(draft.action.trim().length>=3&&draft.objective.trim().length>=5),
  !!(draft.victory.trim().length>=5&&draft.feedback.trim().length>=5)
 ];
}
function validate(session){
 const d=load(session);
 if(!GENRES.includes(d.genre)||!d.genre)return {ok:false,field:'genre',label:'Escolha o gênero do jogo.'};
 for(const field of FIELDS){
  if(d[field.id].trim().length<field.min)return {ok:false,field:field.id,label:'Preencha "'+field.label+'" com pelo menos '+field.min+' caracteres.'};
 }
 return {ok:true,field:null,label:'Pronta para entregar.'};
}
function evidence(session){
 const d=load(session),clean=x=>String(x||'').trim().replace(/\s+/g,' ');
 return [
  'MISSÃO 01 — O CHAMADO',
  'Jogo: '+clean(d.title),
  'Gênero: '+clean(d.genre)+'; Protagonista: '+clean(d.hero),
  'Ação principal: '+clean(d.action),
  'Objetivo do jogador: '+clean(d.objective),
  'Condição de conclusão: '+clean(d.victory),
  'Feedback da conquista: '+clean(d.feedback)
 ].join('\n').slice(0,750);
}
function chosenExample(d){return d.genre&&window.PIT_GENRE_CONTEXT?window.PIT_GENRE_CONTEXT.profile(d.genre):null}
function heading(step,icon,title,description){
 return '<div class="qo-section-kicker"><span class="qo-step-icon" aria-hidden="true">'+icon+'</span><span>FRAGMENTO '+step+' / 03</span></div>'+
 '<h3>'+title+'</h3><p class="qo-section-desc">'+description+'</p>';
}
function field(id,label,hint,d,placeholder,disabled){
 const f=FIELDS.find(x=>x.id===id);
 const example=chosenExample(d),sample=example&&example[id]?example[id]:String(placeholder).replace(/^Ex\.:\s*/,'');
 return '<label class="qo-input-wrap" for="qo-'+id+'"><span>'+label+'</span><input id="qo-'+id+'" data-q-field="'+id+'" type="text" maxlength="'+f.max+'" value="'+escapeHTML(d[id])+'" placeholder="'+escapeHTML('Ex.: '+sample)+'" autocomplete="off" '+(disabled?'disabled':'')+'><small>'+hint+'</small></label>';
}
function genre(d,disabled){
 return '<label class="qo-input-wrap" for="qo-genre"><span>Universo que você quer criar</span><select id="qo-genre" data-q-field="genre" '+(disabled?'disabled':'')+'>'+
 GENRES.map((g,i)=>'<option value="'+escapeHTML(g)+'" '+(g===d.genre?'selected':'')+' '+(i===0?'disabled':'')+'>'+(i===0?'Escolha um gênero...':escapeHTML(g))+'</option>').join('')+
 '</select><small>Você pode misturar gêneros — escolha o principal para começar.</small></label>';
}
function worldPreview(d,large=false){
 return '<aside class="qo-vision '+(large?'qo-vision-large':'')+'" aria-label="Prévia da ideia do jogo">'+
 '<div class="qo-vision-art"><span class="qo-vision-label">SUA PRIMEIRA CRIAÇÃO</span><span class="qo-vision-moon" aria-hidden="true">✦</span></div>'+
 '<div class="qo-vision-info"><span class="qo-vision-genre" data-q-preview="genre">'+escapeHTML(d.genre||'GÊNERO A DEFINIR')+'</span>'+
 '<h3 data-q-preview="title">'+escapeHTML(d.title||'O NOME DA SUA LENDA')+'</h3>'+
 '<div class="qo-vision-divider"></div><p><b>HERÓI</b> <span data-q-preview="hero">'+escapeHTML(d.hero||'Quem será controlado?')+'</span></p>'+
 '<p><b>MISSÃO</b> <span data-q-preview="mission">'+escapeHTML((d.action&&d.objective)?d.action+' para '+d.objective:'Escolha uma ação e um objetivo')+'</span></p>'+
 '<p><b>CONQUISTA</b> <span data-q-preview="victory">'+escapeHTML(d.victory||'O que define a vitória?')+'</span></p></div></aside>';
}
/* The student sees the same design logic as the professor, without extra fields.
   This is a draft model, not a claim that a playable game already exists. */
function designFlow(d){
 const items=[
  ['01','DESAFIO','objective','Qual resultado o jogador busca?'],
  ['02','AÇÃO','action','O que o jogador faz?'],
  ['03','CONDIÇÃO','victory','Quando a tentativa dá certo?'],
  ['04','FEEDBACK FINAL','feedback','Como a conquista aparece?']
 ];
 return '<section class="qo-cycle" aria-label="Modelo da ideia para implementação">'+
 '<div class="qo-cycle-head"><span>◈ DA IDEIA À MECÂNICA</span><strong>SEU PRIMEIRO MODELO DE JOGO</strong></div>'+
 '<div class="qo-cycle-steps">'+
 items.map(([num,label,id,empty])=>'<div class="qo-cycle-step '+(d[id].trim()?'filled':'')+'">'+
 '<span class="qo-cycle-step-number">'+num+'</span><div><strong>'+label+'</strong><p data-q-flow="'+id+'">'+escapeHTML(d[id].trim()||empty)+'</p></div></div>').join('')+
 '</div><p class="qo-cycle-explain">Durante a partida, o jogador tenta, observa o resultado e decide novamente. A condição e o feedback acima definem quando esse ciclo termina.</p></section>';
}
function progressMarkup(d){
 const steps=stepProgress(d),done=steps.filter(Boolean).length;
 return '<div class="qo-fragments" aria-label="Progresso do planejamento">'+
 steps.map((yes,i)=>'<div class="qo-fragment '+(yes?'complete':'')+'"><span>'+(yes?'✦':'0'+(i+1))+'</span><small>'+['IDENTIDADE','MECÂNICA','CONCLUSÃO'][i]+'</small></div>').join('')+
 '</div><div class="qo-save-notice" id="qoSaveNotice" aria-live="polite">✧ '+done+'/3 fragmentos definidos · rascunho salvo neste navegador</div>';
}
function intro(d){
 const idea=chosenExample(d),personal=d.genre&&idea?'<div class="qo-genre-intro">✧ SEU UNIVERSO: '+escapeHTML(d.genre.toUpperCase())+' · '+escapeHTML(idea.intro)+'</div>':'';
 return '<div class="qo-page qo-intro">'+
 '<div class="qo-intro-hero"><div class="qo-intro-portrait" role="img" aria-label="Castelo gótico com um portal mágico brilhante"></div>'+
 '<div class="qo-intro-copy"><span class="qo-crest">✦ PRIMEIRO CAPÍTULO · 20 MINUTOS</span>'+
 '<h3>Antes da primeira linha de código,<br><em>existe uma escolha.</em></h3>'+
 '<p>Todo jogo nasce de uma pergunta: <strong>o que a pessoa poderá fazer aqui?</strong> Sua missão é imaginar uma experiência pequena o suficiente para ganhar vida nesta oficina.</p>'+personal+
 '<div class="qo-objective"><span aria-hidden="true">⚔</span><div><strong>SEU DESAFIO</strong><p>Escolher um gênero, definir uma ação principal e decidir como o jogador saberá que chegou ao objetivo.</p></div></div>'+
 '<button class="qo-action" type="button" data-q-action="begin">✦ COMEÇAR A CRIAR <span aria-hidden="true">›</span></button></div></div>'+
 '<div class="qo-brief-bottom"><article><span>01 · IMAGINAR</span><p>Um jogo de terror, corrida, exploração ou qualquer universo seu.</p></article>'+
 '<article><span>02 · DECIDIR</span><p>Uma ação que o jogador possa realizar de verdade.</p></article>'+
 '<article><span>03 · CONQUISTAR</span><p>Uma condição clara para terminar a experiência.</p></article></div></div>';
}
function building(session,status,preview){
 const d=load(session),disabled=status==='approved'||status==='submitted',idea=chosenExample(d);
 return '<div class="qo-page qo-build"><div class="qo-lead"><span class="qo-crest">✦ O CHAMADO · SUA OFICINA</span>'+
 '<h3>Escreva o destino do <em>seu universo.</em></h3><p>As escolhas abaixo serão o primeiro registro do seu jogo. Não é preciso programar nesta missão.</p>'+
 '<div class="qo-tip" role="note"><strong>COMO FAZER · MISSÃO 01</strong><p><b>Onde:</b> nesta página, nos campos dos três fragmentos abaixo. <b>Como:</b> escolha um gênero, digite o título e o protagonista, descreva a ação e o objetivo, depois defina quando termina e qual sinal aparece ao vencer. <b>Exemplo:</b> coletar 3 cristais → abrir a porta → mostrar “Vitória!”. <b>Como conferir:</b> veja a prévia da sua ficha à direita e confirme que os 3 fragmentos estão completos. <b>O que entregar:</b> clique em “Ver minha ficha de missão”, revise o texto gerado e depois em “Enviar ao professor” quando a prática estiver liberada.</p><p>Se não conseguir avançar, procure o campo indicado na mensagem de validação. Seu rascunho é salvo neste navegador; não o confunda com a entrega ao professor.</p></div>'+
 (disabled?'<div class="qo-lock-note">Sua entrega já foi '+(status==='approved'?'aprovada':'enviada para avaliação')+'. O registro permanece visível, sem novas edições.</div>':'')+
 '</div><div class="qo-builder-grid"><div class="qo-fields">'+
 '<section class="qo-section">'+heading('01','♜','O mundo e seu protagonista','Escolha o tipo de jogo e quem vive a aventura.')+
 genre(d,disabled)+field('title','Título do seu jogo','Pode ser alterado nas próximas missões.',d,'Ex.: A Última Chave',disabled)+field('hero','Quem o jogador controla?','Pode ser uma pessoa, criatura, veículo ou objeto.',d,'Ex.: Uma exploradora presa no castelo',disabled)+'</section>'+
 '<section class="qo-section">'+heading('02','⚔','A ação que move a história','É aqui que uma ideia vira algo que podemos jogar.')+
 field('action','O jogador precisa fazer o quê?','Use um verbo concreto: coletar, fugir, correr, conversar, resolver...',d,'Ex.: Encontrar três fragmentos mágicos',disabled)+
 field('objective','Para alcançar qual resultado?','O objetivo precisa ser observável no jogo.',d,'Ex.: Destrancar a porta da torre',disabled)+
 '<div class="qo-formula">MEU JOGADOR PRECISA <strong id="qoSentenceAction">[FAZER ALGO]</strong> PARA <strong id="qoSentenceGoal">[ALCANÇAR O OBJETIVO]</strong></div></section>'+
 '<section class="qo-section">'+heading('03','✦','A conquista final','Um bom jogo deixa claro quando a missão terminou.')+
 field('victory','O que precisa acontecer para terminar?','Defina uma condição que outra pessoa possa testar.',d,'Ex.: Abrir a porta com os três fragmentos',disabled)+
 field('feedback','Como o jogador percebe a conquista?','Uma mensagem, mudança de cena, cor ou som já resolve.',d,'Ex.: Surge a mensagem “Castelo libertado!”',disabled)+'</section>'+
 '<div class="qo-builder-bottom">'+progressMarkup(d)+
 '<button class="qo-action" type="button" data-q-action="review">VER MINHA FICHA DE MISSÃO <span aria-hidden="true">›</span></button></div>'+
 '</div><div class="qo-preview-column">'+worldPreview(d)+designFlow(d)+
 '<div class="qo-tip"><span id="qoGenreLabel">✧ EXEMPLO DE '+escapeHTML((d.genre||'AVENTURA').toUpperCase())+'</span><p id="qoGenreExample">'+escapeHTML(idea?idea.intro:'Em um jogo de aventura, uma personagem pode coletar itens para abrir uma saída.')+'</p><p class="qo-inspiration-note">Exemplo de referência, não uma resposta pronta. Você pode criar outra mecânica.</p></div>'+
 '<div class="qo-tip qo-tip-ai"><span>✦ A IA É SUA ALIADA</span><p>Peça sugestões, compare ideias e escolha o que combina com o jogo que <strong>você</strong> quer criar. Não é preciso copiar um roteiro pronto.</p><button type="button" data-q-action="copy-prompt" class="qo-secondary">COPIAR PROMPT DE IDEIAS</button></div></div></div></div>';
}
function delivery(session,status,feedback,preview,canSubmit){
 const d=load(session),v=validate(session),done=stepProgress(d).filter(Boolean).length;
 const submitted=status==='submitted'||status==='approved';
 const statusMsg=status==='approved'?'✦ CONQUISTA VALIDADA PELO PROFESSOR':status==='revision'?'↻ SEU PROFESSOR PEDIU UMA REVISÃO':status==='submitted'?'⌛ ENTREGA AGUARDANDO AVALIAÇÃO':'✦ SUA FICHA ESTÁ PRONTA PARA SER ENVIADA';
 return '<div class="qo-page qo-deliver"><div class="qo-lead"><span class="qo-crest">✦ O CHAMADO · ENTREGA</span>'+
 '<h3>O primeiro registro <em>da sua lenda.</em></h3>'+
 '<p>Esta ficha reúne as escolhas da oficina. Ela será a referência para criar o primeiro protótipo na próxima missão.</p></div>'+
 '<div class="qo-delivery-layout"><div class="qo-delivery-main"><div class="qo-quest-stamp '+escapeHTML(status||'')+'">'+statusMsg+'</div>'+
 (feedback?'<div class="qo-feedback"><b>RETORNO DO PROFESSOR</b><p>'+escapeHTML(feedback)+'</p></div>':'')+
 worldPreview(d,true)+designFlow(d)+
 '<section class="qo-record"><div class="qo-record-head"><span>◈ REGISTRO DO CRIADOR</span><small>GERADO A PARTIR DAS SUAS ESCOLHAS</small></div>'+
 '<label for="evidenceInput" class="qo-record-label">Texto que será enviado ao professor</label>'+
 '<textarea id="evidenceInput" maxlength="750" readonly>'+escapeHTML(evidence(session))+'</textarea>'+
 '<p class="qo-record-help">A ficha é montada automaticamente. Para corrigir algo, volte à construção.</p></section>'+
 '<div class="qo-delivery-buttons">'+
 '<button class="qo-secondary" type="button" data-q-action="back" '+(submitted?'disabled':'')+'>‹ REVISAR MINHAS ESCOLHAS</button>'+
 '<button id="submitWork" class="qo-action" type="button" '+(!v.ok||submitted||!canSubmit?'disabled':'')+'>'+(preview?'✧ SIMULAR ENTREGA':'✦ ENVIAR AO PROFESSOR')+'</button></div>'+
 (!v.ok?'<p class="qo-validation" role="status">'+escapeHTML(v.label)+' ('+done+'/3 fragmentos completos).</p>':'')+
 (!canSubmit&&!preview&&!submitted?'<p class="qo-validation">A entrega estará disponível quando o professor liberar a prática.</p>':'')+
 (preview?'<p class="qo-preview-disclaimer">DEMONSTRAÇÃO: nenhum dado será enviado ou aprovado.</p>':'')+
 '</div><aside class="qo-delivery-aside"><div class="qo-reward"><span class="qo-reward-star">✦</span><span>INSÍGNIA DA MISSÃO</span><strong>O CHAMADO</strong><p>'+(status==='approved'?'Conquistada com a aprovação do professor.':'Será conquistada após a aprovação real da sua entrega.')+'</p></div>'+
 '<div class="qo-tip"><span>◈ ANTES DE SEGUIR</span><p>Uma ideia simples com ação e objetivo claros é o ponto de partida de um jogo de verdade.</p></div></aside></div></div>';
}
function render(ctx){
 const d=load(ctx.session),phase=ctx.phase,body=phase==='briefing'?intro(d):phase==='practice'?building(ctx.session,ctx.status,ctx.preview):delivery(ctx.session,ctx.status,ctx.feedback,ctx.preview,ctx.canSubmit);
 const p=stepProgress(d).filter(Boolean).length;
 return '<div id="qOne" class="qo-root" data-phase="'+escapeHTML(phase)+'">'+
 '<div class="qo-banner"><div class="qo-banner-image"></div><div class="qo-banner-content"><div class="qo-breadcrumb">PIT GAME JAM <span> / </span> JORNADA DO CRIADOR <span> / </span> MISSÃO 01</div>'+
 '<div class="qo-banner-title"><span class="qo-shield">I</span><div><small>CAPÍTULO I · A ORIGEM</small><h2>O CHAMADO</h2><p>Sua história começa com uma escolha.</p></div></div></div>'+
 '<div class="qo-banner-rune" aria-hidden="true">✦</div></div>'+
 '<nav class="qo-map" aria-label="Partes da missão">'+
 [['briefing','01 · BRIEFING'],['practice','02 · CONSTRUIR'],['review','03 · ENTREGAR']].map(([id,label])=>'<button type="button" data-q-tab="'+id+'" class="'+(phase===id?'active':'')+'"><span class="qo-map-glyph">'+(phase===id?'✦':'◇')+'</span>'+label+'</button>').join('')+'</nav>'+
 body+'<div class="qo-fineprint">PIT GAME JAM IA <span>✦</span> VOCÊ CRIA. A IA APOIA. O JOGO É SEU. <span>✦</span> MISSÃO 01 / 10</div></div>';
}
function update(root,session){
 const d=load(session),idea=chosenExample(d);
 root.querySelectorAll('input[data-q-field]').forEach(input=>{
  if(idea&&Object.prototype.hasOwnProperty.call(idea,input.dataset.qField))input.placeholder='Ex.: '+idea[input.dataset.qField];
 });
 const label=root.querySelector('#qoGenreLabel'),example=root.querySelector('#qoGenreExample');
 if(label)label.textContent='✧ EXEMPLO DE '+(d.genre||'AVENTURA').toUpperCase();
 if(example)example.textContent=idea?idea.intro:'Crie uma ação principal e uma condição de término.';
 const val=(id,text)=>root.querySelectorAll('[data-q-preview="'+id+'"]').forEach(n=>n.textContent=text);
 val('genre',d.genre||'GÊNERO A DEFINIR');val('title',d.title||'O NOME DA SUA LENDA');
 val('hero',d.hero||'Quem será controlado?');
 val('mission',d.action&&d.objective?d.action+' para '+d.objective:'Escolha uma ação e um objetivo');
 val('victory',d.victory||'O que define a vitória?');
 root.querySelectorAll('[data-q-flow]').forEach(el=>{
  const id=el.dataset.qFlow;
  const entry=d[id]||'';
  const empty={objective:'Qual resultado o jogador busca?',action:'O que o jogador faz?',victory:'Quando a tentativa dá certo?',feedback:'Como a conquista aparece?'};
  el.textContent=entry.trim()||empty[id]||'';
  const step=el.closest('.qo-cycle-step');
  if(step)step.classList.toggle('filled',Boolean(entry.trim()));
 });
 const a=root.querySelector('#qoSentenceAction'),b=root.querySelector('#qoSentenceGoal');
 if(a)a.textContent=d.action||'[FAZER ALGO]';if(b)b.textContent=d.objective||'[ALCANÇAR O OBJETIVO]';
 const flags=stepProgress(d),count=flags.filter(Boolean).length;
 root.querySelectorAll('.qo-fragment').forEach((node,i)=>{node.classList.toggle('complete',flags[i]);node.querySelector('span').textContent=flags[i]?'✦':'0'+(i+1)});
 const notice=root.querySelector('#qoSaveNotice');if(notice)notice.textContent='✧ '+count+'/3 fragmentos definidos · rascunho salvo neste navegador';
}
function mount(ctx){
 const root=document.getElementById('qOne');if(!root)return;
 root.querySelectorAll('[data-q-tab]').forEach(b=>b.addEventListener('click',()=>ctx.onPhase(b.dataset.qTab)));
 root.querySelectorAll('[data-q-field]').forEach(input=>{
  input.addEventListener('input',()=>{const d=load(ctx.session);d[input.dataset.qField]=input.value;save(ctx.session,d);update(root,ctx.session);});
  input.addEventListener('change',()=>{const d=load(ctx.session);d[input.dataset.qField]=input.value;save(ctx.session,d);update(root,ctx.session);});
 });
 root.querySelectorAll('[data-q-action]').forEach(button=>button.addEventListener('click',()=>{
  const action=button.dataset.qAction;
  if(action==='begin'||action==='back')ctx.onPhase('practice');
  if(action==='review')ctx.onPhase('review');
  if(action==='copy-prompt'){
   const draft=load(ctx.session);
   const prompt='Estou criando um jogo do gênero '+(draft.genre||'a escolher')+' na oficina PIT Game Jam. O título provisório é '+(draft.title||'a definir')+'. A ação que considero é '+(draft.action||'a definir')+'. Sugira 3 variações pequenas e originais que possam ser prototipadas em seis horas no GDevelop. Compare protagonista, ação central, objetivo, condição de vitória e viabilidade. Não escreva nem gere meu jogo inteiro: quero decidir e adaptar as opções.';
   if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(prompt).then(()=>ctx.onToast('Prompt copiado. Adapte as ideias à sua criação.')).catch(()=>ctx.onToast('Não foi possível copiar. Tente novamente.'));
   else ctx.onToast('Seu navegador não liberou a cópia automática.');
  }
 }));
 update(root,ctx.session);
}
window.PIT_MISSION_ONE={render,mount,validate,evidence,load,hydrate,stepProgress};
})();

/* PIT GAME JAM IA V3 — M06-04: registro de UM asset autoral.
 * Não afirma teste executado: aluno registra manualmente; professor valida.
 * Sem APIs ou dados de turma em prévia.
 */
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim();
const fields=[
{id:'need',label:'Qual necessidade do seu jogo este asset resolve?',min:10,max:75},
{id:'file',label:'Nome e formato do arquivo importado',min:5,max:65},
{id:'source',label:'Origem: ferramenta, criação própria ou biblioteca',min:5,max:70},
{id:'license',label:'Licença e atribuição verificada (ou autoria própria)',min:8,max:90},
{id:'before',label:'O que existia antes da importação?',min:12,max:85},
{id:'after',label:'O que apareceu no Preview após importar?',min:12,max:95},
{id:'negative',label:'Que falha ou incompatibilidade você testou?',min:12,max:85},
{id:'saved',label:'Onde está o projeto editável atualizado?',min:6,max:65}
];
const routes=['image','video','music','voice','model'];
const blank=()=>({route:'image',checks:[],...Object.fromEntries(fields.map(f=>[f.id,'']))});
const key=id=>'pit_v3_m06_'+String(id||'preview').replace(/[^A-Za-z0-9_-]/g,'').slice(0,80);
function load(session){let d=blank();try{const x=JSON.parse(localStorage.getItem(key(session))||'{}');if(routes.includes(x.route))d.route=x.route;for(const f of fields)if(typeof x[f.id]==='string')d[f.id]=x[f.id].slice(0,f.max);if(Array.isArray(x.checks))d.checks=[...new Set(x.checks.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]}catch{}return d}
function save(session,d){const x=blank();x.route=routes.includes(d.route)?d.route:'image';for(const f of fields)x[f.id]=clean(d[f.id]).slice(0,f.max);x.checks=[...new Set((d.checks||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<3))];try{localStorage.setItem(key(session),JSON.stringify(x));return true}catch{return false}}
function validate(session){const d=load(session);for(const f of fields){const n=clean(d[f.id]).length;if(n<f.min)return {ok:false,field:f.id,label:'Preencha "'+f.label+'" com pelo menos '+f.min+' caracteres.'};if(n>f.max)return {ok:false,field:f.id,label:'Reduza o campo "'+f.label+'".'}}if(d.checks.length!==3)return {ok:false,field:'checks',label:'Confirme manualmente os três testes do asset no Preview.'};return {ok:true,label:'Registro completo. O professor ainda deve verificar a execução.'}}
function evidence(session){const d=load(session);const map={need:'Necessidade',file:'Asset',source:'Origem',license:'Licença',before:'Antes',after:'Depois',negative:'Teste negativo',saved:'Projeto salvo'};return ['M06 | '+d.route,...fields.map(f=>map[f.id]+': '+clean(d[f.id]))].join('\n').slice(0,750)}
function parseEvidence(s){
 // Evidências antigas achatadas ou parciais não podem virar rascunho aparentemente válido.
 if(typeof s!=='string'||!s.startsWith('M06 | '))return null;
 const lines=s.split(/\r?\n/),route=lines[0].slice(6).trim();
 if(!routes.includes(route)||lines.length!==fields.length+1)return null;
 const map={Necessidade:'need',Asset:'file',Origem:'source','Licença':'license',Antes:'before',Depois:'after','Teste negativo':'negative','Projeto salvo':'saved'};
 const x=blank(),seen=new Set();x.route=route;
 for(const line of lines.slice(1)){
  const i=line.indexOf(': ');if(i<0)return null;
  const id=map[line.slice(0,i)],f=fields.find(z=>z.id===id);
  if(!f||seen.has(id))return null;
  const value=line.slice(i+2);
  if(clean(value).length<f.min||value.length>f.max)return null;
  seen.add(id);x[id]=value;
 }
 return seen.size===fields.length?x:null;
}
function hydrate(session,evidenceText,status){const parsed=parseEvidence(evidenceText);if(!parsed)return;const current=load(session);if(fields.some(f=>current[f.id].trim()))return;parsed.checks=[];save(session,parsed)}
function profile(ctx){const idea=ctx.idea||{};return {title:clean(idea.title)||'seu jogo da Missão 01',genre:clean(idea.genre)||'gênero autoral',hero:clean(idea.hero)||'personagem do jogo'}}
function heading(ctx){const p=profile(ctx);return '<header class="m6s-head"><small>✦ MISSÃO 06 / 10 · FORJA DE IA · 45 MINUTOS</small><h2>Um recurso novo. Um mundo mais vivo.</h2><p>Continue <b>'+esc(p.title)+'</b> ('+esc(p.genre)+'). Você não precisa aprender cinco ferramentas: escolha apenas a que resolve uma necessidade real.</p></header>'}
function briefing(ctx){return '<div class="m6s-brief"><h3>A missão não é colecionar IAs.</h3><p>O jogo já tem controle e regra. Agora acrescente <b>um</b> recurso original, gratuito e importável, sem substituir o protótipo inteiro.</p><ol><li>Escolha imagem, som, voz, vídeo opcional ou modelo 3D.</li><li>Confirme licença, possibilidade de download e formato.</li><li>Importe no GDevelop e execute o Preview.</li><li>Registre antes, depois, teste negativo e arquivo editável.</li></ol><button type="button" data-m6s-nav="practice">ABRIR LABORATÓRIO ›</button></div>'}
function practice(ctx){const d=load(ctx.session),p=profile(ctx),locked=['approved','submitted'].includes(ctx.status);const tutorial=window.PIT_ASSET_FORGE_TUTORIAL?window.PIT_ASSET_FORGE_TUTORIAL.render({title:p.title,genre:p.genre,hero:p.hero,need:d.need,route:d.route}):'<p>Guia indisponível. Consulte a documentação oficial do GDevelop.</p>';
return '<div class="m6s-practice"><div class="m6s-time"><b>32 MINUTOS DE PRODUÇÃO</b><span>5 min escolha · 12 min criação · 8 min importação · 7 min Preview + registro</span></div>'+
(locked?'<p class="m6s-alert">Entrega '+(ctx.status==='approved'?'aprovada':'enviada')+'. Campos bloqueados para preservar o registro.</p>':'')+
'<div class="m6s-log" role="note"><strong>ABRIR O EDITOR · CONTINUAR O JOGO EXISTENTE</strong><p><a href="https://editor.gdevelop.io/" target="_blank" rel="noopener noreferrer">Abrir GDevelop gratuito em outra aba ↗</a>. O link não abre nem importa seu projeto automaticamente: no editor, abra o projeto salvo na Missão 05, pela nuvem ou pelo arquivo local. Sem internet, use o aplicativo GDevelop já instalado e abra o arquivo salvo. Não crie outro projeto para esta missão.</p></div>'+
 '<div class="m6s-log" role="note"><strong>COMO CONCLUIR A MISSÃO 06 · APENAS UM ASSET</strong><p><b>1. Escolha:</b> identifique uma necessidade do jogo já criado (personagem, efeito, som, vídeo ou modelo). <b>2. Crie ou obtenha:</b> use uma ferramenta gratuita, desenho próprio ou biblioteca com licença permitida; confira se o arquivo realmente pode ser baixado e reutilizado. <b>3. Prepare:</b> verifique extensão, transparência, tamanho e direitos de uso. <b>4. Importe no GDevelop:</b> siga o tutorial a seguir para o tipo escolhido e insira o recurso na cena do seu jogo, não em projeto novo. <b>5. Teste:</b> abra Preview, compare antes/depois e execute novamente a regra da Missão 05. <b>6. Registre:</b> preencha os oito campos e marque somente os três testes realizados. <b>7. Envie:</b> clique “Conferir registro” e depois “Enviar para avaliação” quando liberado.</p><p><b>Se falhar:</b> revise formato do arquivo, recurso associado ao objeto/evento, áudio bloqueado antes de interação ou licença não confirmada. Se a IA estiver indisponível, use um arquivo criado por você. Rascunho local não é entrega.</p></div>'+tutorial+'<section class="m6s-log"><h3>Diário de importação · um asset</h3><p>Preencha somente com resultados observados no seu jogo. Não copie o exemplo da ferramenta como se fosse sua entrega.</p>'+
fields.map(f=>'<label class="m6s-field" for="m6s-'+f.id+'"><b>'+esc(f.label)+'</b><textarea id="m6s-'+f.id+'" data-m6s-field="'+f.id+'" maxlength="'+f.max+'" rows="2" '+(locked?'disabled':'')+' placeholder="Descreva o que você realmente fez.">'+esc(d[f.id])+'</textarea></label>').join('')+
'<div class="m6s-checks"><strong>DECLARAÇÃO MANUAL DE TESTES</strong>'+[
'Abri o arquivo no GDevelop e inseri o asset na cena original.',
'Vi o recurso funcionar no Preview sem quebrar a regra da Missão 05.',
'Conferi origem/licença e testei um caso de falha ou ausência do recurso.'
].map((v,i)=>'<label><input type="checkbox" data-m6s-check="'+i+'" '+(d.checks.includes(i)?'checked':'')+' '+(locked?'disabled':'')+'>'+esc(v)+'</label>').join('')+
'<small>As marcações não executam o GDevelop nem substituem a demonstração ao professor.</small></div>'+
'<p id="m6sSaveStatus" aria-live="polite">Rascunho local. Não enviado.</p><button type="button" data-m6s-nav="review">CONFERIR REGISTRO ›</button></section></div>'}
function review(ctx){const d=load(ctx.session),locked=['approved','submitted'].includes(ctx.status),v=locked?{ok:true}:validate(ctx.session);return '<section class="m6s-review"><h3>O recurso entrou no seu jogo?</h3><p>Confira o relato. O professor pode solicitar a abertura do projeto no Preview; texto e marcações não comprovam execução automaticamente.</p><div class="m6s-summary"><strong>ROTA: '+esc(d.route.toUpperCase())+'</strong>'+fields.map(f=>'<p><b>'+esc(f.label)+'</b> '+esc(d[f.id]||'Não preenchido')+'</p>').join('')+'</div><label for="evidenceInput">Evidência estruturada para revisão</label><textarea id="evidenceInput" readonly maxlength="750">'+esc(evidence(ctx.session))+'</textarea>'+
(!v.ok?'<p class="m6s-alert">'+esc(v.label)+'</p>':'')+
(ctx.feedback?'<p class="m6s-alert">Devolutiva do professor: '+esc(ctx.feedback)+'</p>':'')+
'<div class="m6s-actions"><button type="button" data-m6s-nav="practice" '+(locked?'disabled':'')+'>‹ CORRIGIR</button><button type="button" id="submitWork" '+(!v.ok||locked||(!ctx.canSubmit&&!ctx.preview)?'disabled':'')+'>'+(ctx.preview?'SIMULAR ENVIO':'ENVIAR PARA AVALIAÇÃO')+'</button></div>'+
(ctx.preview?'<small>Prévia isolada: nenhum dado será enviado à turma.</small>':'')+'</section>'}
function render(ctx){return '<section id="m6sRoot" class="m6s-root">'+heading(ctx)+(ctx.phase==='practice'?practice(ctx):ctx.phase==='review'?review(ctx):briefing(ctx))+'</section>'}
function mount(ctx){const root=document.querySelector('#m6sRoot');if(!root)return;const locked=['approved','submitted'].includes(ctx.status);const d=load(ctx.session);
if(ctx.phase==='practice'&&window.PIT_ASSET_FORGE_TUTORIAL){const guide=root.querySelector('#f6Tutorial');window.PIT_ASSET_FORGE_TUTORIAL.mount(guide);const select=guide?.querySelector('#f6tRoute');if(select){select.disabled=locked;select.addEventListener('change',()=>{if(locked)return;d.route=select.value;save(ctx.session,d)})}if(locked)guide?.querySelectorAll('input,textarea,button').forEach(x=>x.disabled=true)}
root.querySelectorAll('[data-m6s-field]').forEach(el=>el.addEventListener('input',()=>{if(locked)return;d[el.dataset.m6sField]=el.value;const ok=save(ctx.session,d);const status=root.querySelector('#m6sSaveStatus');if(status)status.textContent=ok?'Rascunho salvo neste navegador. Não enviado.':'Não foi possível salvar localmente.'}));
root.querySelectorAll('[data-m6s-check]').forEach(el=>el.addEventListener('change',()=>{if(locked)return;const n=Number(el.dataset.m6sCheck);d.checks=el.checked?[...new Set([...d.checks,n])]:d.checks.filter(x=>x!==n);save(ctx.session,d)}));
root.querySelectorAll('[data-m6s-nav]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.m6sNav==='practice'){ctx.onPhase('practice');return}const v=validate(ctx.session);if(!v.ok){ctx.onMessage(v.label);root.querySelector(v.field==='checks'?'[data-m6s-check]':'#m6s-'+v.field)?.focus();return}ctx.onPhase('review')}));
}
window.PIT_STUDENT_MISSION_SIX={fields,routes,load,save,validate,evidence,parseEvidence,hydrate,profile,render,mount};
})();
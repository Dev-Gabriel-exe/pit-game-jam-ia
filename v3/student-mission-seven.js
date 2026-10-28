/* PIT GAME JAM IA V3 — M07-03: aluno conclui o próprio protótipo.
 * Evidência é declaração humana; sem vitória, aprovação ou teste automáticos.
 */
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim();
const fields=[
{id:'start',label:'Como o jogador começa a partida?',min:12,max:75},
{id:'challenge',label:'Qual desafio do seu jogo precisa ser concluído?',min:12,max:90},
{id:'condition',label:'Qual condição real libera o final? (SE...)',min:12,max:90},
{id:'result',label:'Qual feedback/cena aparece ao concluir? (ENTÃO...)',min:12,max:90},
{id:'negative',label:'O que aconteceu ao tentar vencer cedo demais?',min:12,max:90},
{id:'repeat',label:'O que ocorreu ao repetir a interação ou reiniciar?',min:12,max:75},
{id:'saved',label:'Onde está o projeto editável com início e final?',min:6,max:65}
];
const blank=()=>({route:'2d',checks:[],...Object.fromEntries(fields.map(f=>[f.id,'']))});
const key=id=>'pit_v3_m07_'+String(id||'preview').replace(/[^A-Za-z0-9_-]/g,'').slice(0,80);
function load(session){let d=blank();try{const x=JSON.parse(localStorage.getItem(key(session))||'{}');if(['2d','3d'].includes(x.route))d.route=x.route;for(const f of fields)if(typeof x[f.id]==='string')d[f.id]=x[f.id].slice(0,f.max);if(Array.isArray(x.checks))d.checks=[...new Set(x.checks.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]}catch{}return d}
function save(session,d){const x=blank();x.route=d.route==='3d'?'3d':'2d';for(const f of fields)x[f.id]=clean(d[f.id]).slice(0,f.max);x.checks=[...new Set((d.checks||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<3))];try{localStorage.setItem(key(session),JSON.stringify(x));return true}catch{return false}}
function validate(session){const d=load(session);for(const f of fields){const n=clean(d[f.id]).length;if(n<f.min)return {ok:false,field:f.id,label:'Descreva "'+f.label+'" com pelo menos '+f.min+' caracteres.'};if(n>f.max)return {ok:false,field:f.id,label:'Reduza "'+f.label+'".'}}if(d.checks.length!==3)return {ok:false,field:'checks',label:'Confirme os três testes reais no Preview antes de enviar.'};return {ok:true,label:'Registro completo, aguardando verificação do professor.'}}
function evidence(session){const d=load(session),names={start:'Início',challenge:'Desafio',condition:'SE',result:'ENTÃO',negative:'Negativo',repeat:'Repetição',saved:'Projeto salvo'};return ['M07 | '+d.route,...fields.map(f=>names[f.id]+': '+clean(d[f.id]))].join('\n').slice(0,750)}
function parseEvidence(text){if(typeof text!=='string'||!text.startsWith('M07 | '))return null;const d=blank(),lines=text.split(/\r?\n/);d.route=lines[0].includes('3d')?'3d':'2d';const names={'Início':'start','Desafio':'challenge','SE':'condition','ENTÃO':'result','Negativo':'negative','Repetição':'repeat','Projeto salvo':'saved'};for(const line of lines.slice(1)){const n=line.indexOf(': ');if(n<0)continue;const id=names[line.slice(0,n)],f=fields.find(x=>x.id===id);if(f)d[id]=line.slice(n+2).slice(0,f.max)}return d}
function hydrate(session,text,status){const d=parseEvidence(text);if(!d)return;const existing=load(session);if(fields.some(f=>existing[f.id].trim()))return;d.checks=['submitted','approved'].includes(status)?[0,1,2]:[];save(session,d)}
function profile(ctx){const idea=ctx.idea||{},mvp=ctx.mvp||{};return {title:clean(idea.title)||'seu jogo',genre:clean(idea.genre)||'gênero livre',goal:clean(idea.objective||mvp.objective)||'o objetivo definido na Missão 02',victory:clean(idea.victory)||'a conclusão definida pelo criador'}}
function routeFor(ctx,d){if(d.route==='3d')return 1;if(ctx.rule&&ctx.rule.route===2)return 1;if(ctx.playable&&ctx.playable.route===3)return 1;return 0}
function brief(ctx){const p=profile(ctx);return '<section class="m7s-brief"><h3>Um jogo começa, desafia e termina.</h3><p>O objetivo original de <b>'+esc(p.title)+'</b> era: '+esc(p.goal)+'. Agora transforme essa intenção em uma condição testável de vitória ou derrota, sem criar várias fases.</p><ol><li>Preserve movimento, regra e asset das missões anteriores.</li><li>Implemente uma condição de conclusão no GDevelop.</li><li>Mostre o resultado final e teste a tentativa prematura.</li></ol><button type="button" data-m7s-nav="practice">CRIAR CONCLUSÃO ›</button></section>'}
function practice(ctx){const d=load(ctx.session),p=profile(ctx),locked=['submitted','approved'].includes(ctx.status),r=routeFor(ctx,d);
const guide=window.PIT_GDEVELOP_M07_GUIDE?window.PIT_GDEVELOP_M07_GUIDE.render(r):'<p>Guia indisponível. Consulte a documentação oficial do GDevelop.</p>';
return '<section class="m7s-practice"><div class="m7s-plan"><small>OFICINA · 33 MINUTOS</small><h3>Uma condição real de conclusão para '+esc(p.title)+'</h3><p>Conceito autoral da Missão 01: '+esc(p.victory)+'. Adapte o tutorial ao seu gênero. O exemplo de chave e porta não é obrigatório.</p><div><span>10 min · condição</span><span>12 min · feedback final</span><span>11 min · testes</span></div></div>'+
(locked?'<p class="m7s-warning">Registro enviado ou aprovado; edição bloqueada.</p>':'')+guide+
'<div class="m7s-log"><h3>Relatório de conclusão do seu jogo</h3><p>Descreva ações e resultados reais. Não copie o resultado esperado do tutorial.</p>'+
fields.map(f=>'<label for="m7s-'+f.id+'"><b>'+esc(f.label)+'</b><textarea id="m7s-'+f.id+'" data-m7s-field="'+f.id+'" maxlength="'+f.max+'" rows="2" '+(locked?'disabled':'')+'>'+esc(d[f.id])+'</textarea></label>').join('')+
'<div class="m7s-checks"><b>TESTES REALIZADOS NO PREVIEW · DECLARAÇÃO MANUAL</b>'+[
'Abri o mesmo projeto e a partida começou com controles funcionais.',
'Tentei concluir antes de cumprir a condição; o final não apareceu.',
'Cumpri a condição, vi o final e confirmei o comportamento ao repetir/reiniciar.'
].map((x,i)=>'<label><input type="checkbox" data-m7s-check="'+i+'" '+(d.checks.includes(i)?'checked':'')+' '+(locked?'disabled':'')+'>'+esc(x)+'</label>').join('')+'<small>O professor poderá pedir a demonstração. Marcar caixas não executa o jogo.</small></div>'+
'<p id="m7sStatus" aria-live="polite">Rascunho local, ainda não enviado.</p><button type="button" data-m7s-nav="review">CONFERIR RESULTADO ›</button></div></section>'}
function review(ctx){const d=load(ctx.session),v=validate(ctx.session),locked=['submitted','approved'].includes(ctx.status);return '<section class="m7s-review"><h3>Seu jogo já tem uma conclusão verificável?</h3><div class="m7s-summary"><b>ROTA '+esc(d.route.toUpperCase())+'</b>'+fields.map(f=>'<p><strong>'+esc(f.label)+'</strong> '+esc(d[f.id]||'Não preenchido')+'</p>').join('')+'</div><label for="evidenceInput">Evidência para avaliação</label><textarea id="evidenceInput" readonly maxlength="750">'+esc(evidence(ctx.session))+'</textarea>'+
(!v.ok?'<p class="m7s-warning">'+esc(v.label)+'</p>':'')+
(ctx.feedback?'<p class="m7s-warning">Devolutiva: '+esc(ctx.feedback)+'</p>':'')+
'<div class="m7s-actions"><button type="button" data-m7s-nav="practice" '+(locked?'disabled':'')+'>‹ CORRIGIR</button><button type="button" id="submitWork" '+(!v.ok||locked||(!ctx.canSubmit&&!ctx.preview)?'disabled':'')+'>'+(ctx.preview?'SIMULAR ENTREGA':'ENVIAR AO PROFESSOR')+'</button></div>'+
'<small>O envio não concede aprovação automática. A conclusão deve ser observada no Preview.</small></section>'}
function render(ctx){const p=profile(ctx);return '<section class="m7s-root" id="m7sRoot"><header><small>MISSÃO 07 / 10 · DAR VIDA AO UNIVERSO</small><h2>O final precisa acontecer no jogo.</h2><p>'+esc(p.title)+' · '+esc(p.genre)+' · 50 minutos</p></header>'+(ctx.phase==='practice'?practice(ctx):ctx.phase==='review'?review(ctx):brief(ctx))+'</section>'}
function mount(ctx){const root=document.querySelector('#m7sRoot');if(!root)return;const d=load(ctx.session),locked=['submitted','approved'].includes(ctx.status);
if(ctx.phase==='practice'&&window.PIT_GDEVELOP_M07_GUIDE){const r=routeFor(ctx,d);if(!locked&&!fields.some(f=>d[f.id].trim())&&d.checks.length===0){d.route=r===1?'3d':'2d';save(ctx.session,d)}const guide=root.querySelector('#g7Guide');window.PIT_GDEVELOP_M07_GUIDE.mount(guide,{initialRoute:r,onRouteChange:(_,index)=>{if(locked)return;d.route=index===1?'3d':'2d';save(ctx.session,d)}});if(locked)guide?.querySelectorAll('button').forEach(b=>b.disabled=true)}
root.querySelectorAll('[data-m7s-field]').forEach(el=>el.addEventListener('input',()=>{if(locked)return;d[el.dataset.m7sField]=el.value;const ok=save(ctx.session,d),status=root.querySelector('#m7sStatus');if(status)status.textContent=ok?'Rascunho salvo localmente. Não enviado.':'Falha ao salvar rascunho local.'}));
root.querySelectorAll('[data-m7s-check]').forEach(el=>el.addEventListener('change',()=>{if(locked)return;const n=Number(el.dataset.m7sCheck);d.checks=el.checked?[...new Set([...d.checks,n])]:d.checks.filter(x=>x!==n);save(ctx.session,d)}));
root.querySelectorAll('[data-m7s-nav]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.m7sNav==='practice'){ctx.onPhase('practice');return}const v=validate(ctx.session);if(!v.ok){ctx.onMessage(v.label);root.querySelector(v.field==='checks'?'[data-m7s-check]':'#m7s-'+v.field)?.focus();return}ctx.onPhase('review')}));
}
window.PIT_STUDENT_MISSION_SEVEN={fields,load,save,validate,evidence,parseEvidence,hydrate,profile,routeFor,render,mount};
})();
/* PIT Game Jam IA V3 · M09-02 · playtest cruzado com registro manual.
 * Não há observações pré-preenchidas; não envia nomes de colegas nem testes fictícios.
 */
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const clean=s=>String(s??'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim();
const fields=[
{id:'peer',label:'Identificação anônima do testador (ex.: Colega A)',min:6,max:25},
{id:'hypothesis',label:'Qual hipótese de usabilidade foi testada?',min:12,max:70},
{id:'task',label:'Qual tarefa o colega tentou realizar?',min:12,max:60},
{id:'expected',label:'Qual era o resultado esperado?',min:12,max:70},
{id:'observed',label:'O que você OBSERVOU de fato, sem ajudar?',min:12,max:85},
{id:'steps',label:'Como reproduzir o resultado observado?',min:12,max:80},
{id:'impact',label:'Qual impacto para quem joga?',min:12,max:65},
{id:'decision',label:'Qual correção, backlog ou ausência de mudança você justificou?',min:12,max:80},
{id:'saved',label:'Onde está o projeto editável testado?',min:6,max:60}
];
const fieldHints={
peer:'Use um identificador neutro, como Colega A. Nunca registre nome, telefone, imagem ou conta pessoal.',
hypothesis:'Antes de observar, escreva uma afirmação que o teste pode confirmar ou refutar. Não antecipe o resultado.',
task:'Descreva a ação que a outra pessoa tentou realizar no seu jogo e em qual cena.',
expected:'Explique o comportamento que deveria acontecer ao completar essa tarefa.',
observed:'Registre somente o que viu no Preview: tentativas, dificuldades, resultado e eventual ajuda prestada.',
steps:'Informe cena inicial, controles e sequência de ações suficientes para outra pessoa repetir a situação.',
impact:'Explique se o ocorrido bloqueia a conclusão, dificulta entender o jogo ou afeta apenas a aparência.',
decision:'Se corrigiu, diga o que mudou e como retestou. Se ficou no backlog, justifique. Sem falha, explique por que manteve.',
saved:'Indique o projeto editável realmente testado. Se alterar este caminho, reabra o arquivo e confirme que é o mesmo jogo usado no playtest; se for outro jogo, repita o teste. Não compartilhe credenciais.'
};
const outcomes=['issue','passed'];
const resolutions=['fixed','backlog','nochange'];
const blank=()=>({outcome:'',resolution:'',checks:[],...Object.fromEntries(fields.map(f=>[f.id,'']))});
const key=id=>'pit_v3_m09_'+String(id||'preview').replace(/[^A-Za-z0-9_-]/g,'').slice(0,80);
const volatileDrafts=new Map(),writeStatus=new Map(); // Temporário apenas nesta aba; não é persistência em disco.
function load(session){const d=blank();try{const k=key(session),x=volatileDrafts.get(k)||JSON.parse(localStorage.getItem(k)||'{}');if(outcomes.includes(x.outcome))d.outcome=x.outcome;if(resolutions.includes(x.resolution))d.resolution=x.resolution;for(const f of fields)if(typeof x[f.id]==='string')d[f.id]=x[f.id];if(Array.isArray(x.checks))d.checks=[...new Set(x.checks.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]}catch{}return d}
function save(session,d){const x=blank();x.outcome=outcomes.includes(d.outcome)?d.outcome:'';x.resolution=resolutions.includes(d.resolution)?d.resolution:'';for(const f of fields)x[f.id]=clean(d[f.id]);x.checks=[...new Set((d.checks||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<3))];const k=key(session);volatileDrafts.set(k,x);try{localStorage.setItem(k,JSON.stringify(x));writeStatus.set(k,true);return true}catch{writeStatus.set(k,false);return false}}
function draftNotice(session){const k=key(session);if(writeStatus.get(k)===false)return '⚠ Não foi possível salvar neste navegador. O rascunho permanece apenas nesta aba: copie seu relatório antes de sair.';if(writeStatus.get(k)===true)return 'Rascunho salvo neste navegador. Não enviado.';try{if(localStorage.getItem(k)!==null)return 'Rascunho salvo neste navegador. Não enviado.'}catch{}return 'Rascunho local. Não enviado.'}
function validate(session){const d=load(session);if(!outcomes.includes(d.outcome))return {ok:false,field:'outcome',label:'Selecione o resultado observado somente após realizar o teste com outra pessoa.'};if(!resolutions.includes(d.resolution))return {ok:false,field:'resolution',label:'Selecione a decisão real: corrigido e retestado, backlog ou nenhuma alteração necessária.'};if(d.outcome==='passed'&&d.resolution!=='nochange')return {ok:false,field:'resolution',label:'Se o teste não encontrou falha, escolha nenhuma alteração necessária e justifique no relatório. Correção ou backlog exigem um problema observado.'};if(d.outcome==='issue'&&d.resolution==='nochange')return {ok:false,field:'resolution',label:'Se encontrou uma falha, descreva correção retestada ou backlog justificado.'};for(const f of fields){const value=clean(d[f.id]);if(value.length>f.max)return {ok:false,field:f.id,label:'O campo "'+f.label+'" excede '+f.max+' caracteres ('+value.length+'). Revise o texto sem perder o rascunho.'};if(value.length<f.min)return {ok:false,field:f.id,label:'Registre "'+f.label+'" com pelo menos '+f.min+' caracteres.'};}if(d.checks.length!==3)return {ok:false,field:'checks',label:'Confirme os três passos realizados com colega real; não marque testes que não ocorreram.'};return {ok:true,label:'Registro pronto para avaliação do professor; nenhuma aprovação automática.'}}
const names={peer:'Testador',hypothesis:'Hipótese',task:'Tarefa',expected:'Esperado',observed:'Observado',steps:'Reprodução',impact:'Impacto',decision:'Decisão',saved:'Projeto'};
function evidence(session){const d=load(session);return ['M09 | '+d.outcome+' | '+d.resolution,...fields.map(f=>names[f.id]+': '+clean(d[f.id]))].join('\n')}
function parseEvidence(s){
 // Only the exact structured report can restore historical fields. Never infer
 // an unobserved peer test from a flattened, truncated or altered API record.
 if(typeof s!=='string')return null;
 const lines=s.replace(/\r\n?/g,'\n').split('\n'),header=lines[0].split(' | ');
 if(lines.length!==fields.length+1||header.length!==3||header[0]!=='M09')return null;
 const outcome=header[1],resolution=header[2];
 if(!outcomes.includes(outcome)||!resolutions.includes(resolution))return null;
 if((outcome==='passed')!==(resolution==='nochange'))return null;
 const d=blank();d.outcome=outcome;d.resolution=resolution;
 for(let i=0;i<fields.length;i++){
  const f=fields[i],prefix=names[f.id]+': ',line=lines[i+1];
  if(!line.startsWith(prefix))return null;
  const value=line.slice(prefix.length);
  // No silent truncation, reordered labels, missing values or fabricated checks.
  if(value!==clean(value)||value.length<f.min||value.length>f.max)return null;
  d[f.id]=value;
 }
 return d;
}
function hydrate(session,text,status){
 const d=parseEvidence(text);if(!d)return;
 const existing=load(session);
 // Preserve partial drafts too: radio-only and check-only drafts are deliberate.
 if(volatileDrafts.has(key(session))||existing.outcome||existing.resolution||existing.checks.length||fields.some(f=>existing[f.id].trim()))return;
 // Submission/approval never proves the three manual peer-test checks.
 d.checks=[];save(session,d);
}
function profile(ctx){const i=ctx.idea||{};return {title:clean(i.title)||'seu jogo',genre:clean(i.genre)||'gênero livre'}}
function brief(ctx){const p=profile(ctx);return '<section class="m9s-brief"><h3>Seu colega não deve precisar da sua explicação.</h3><p>Teste <b>'+esc(p.title)+'</b> ('+esc(p.genre)+') com outra pessoa. Um playtest registra comportamentos observados, não opiniões inventadas. Se não houver colega disponível, peça ao professor uma alternativa e não marque um teste inexistente.</p><ol><li>Defina uma tarefa curta e uma hipótese verificável.</li><li>Observe em silêncio enquanto o colega joga.</li><li>Troquem os papéis; registrem o resultado e a decisão.</li></ol><button type="button" data-m9s-nav="practice">COMEÇAR TESTE CRUZADO ›</button></section>'}
function practice(ctx){const d=load(ctx.session),locked=['submitted','approved'].includes(ctx.status),overLimit=fields.filter(f=>clean(d[f.id]).length>f.max);return '<section class="m9s-practice"><div class="m9s-plan"><small>PLAYTEST · 16 MINUTOS</small><h3>Observe, reproduza, decida.</h3><p>Rodada A: 1 min hipótese/tarefa + 5 min teste + 2 min registro. Rodada B: inverter os papéis e repetir os mesmos 8 min. A revisão final da missão dura 3 min: decidir entre correção retestada de fato, backlog justificado ou nenhuma alteração após teste sem falha. Não presuma tempo extra para corrigir. Não grave nomes, imagens ou conversas do colega.</p></div>'+'<div class="m9s-plan" role="note"><strong>COMO FAZER O PLAYTEST EM DUPLA</strong><p><b>1.</b> Abra no GDevelop o projeto jogável da Missão 08 e execute o Preview. <b>2.</b> Combine com um colega uma tarefa clara, por exemplo: “chegar ao final sem ajuda”. <b>3.</b> Autor observa sem explicar; testador tenta sozinho por cinco minutos. <b>4.</b> Registre o que esperava e o que realmente aconteceu, com passos que permitam repetir o teste. <b>5.</b> Troquem os papéis e testem o outro jogo. <b>6.</b> Se encontrou falha, só declare “corrigido” após modificar o projeto e repetir o teste; se não couber no tempo, registre backlog com motivo. Se não houve falha, descreva a hipótese confirmada e justifique por que não precisou corrigir. <b>7.</b> Salve e reabra o projeto editável indicado, confirme que é o mesmo jogo testado com o colega, preencha o relatório e clique “Conferir relatório” antes de enviar.</p><p><b>Privacidade:</b> use apenas “Colega A/B”, sem nomes, fotos, vídeos ou gravações. <b>Se o testador travar:</b> registre o ponto exato antes de dar ajuda; não esconda a dificuldade. O formulário não testa o jogo automaticamente.</p></div>'+'<div class="m9s-editor-handoff" role="note"><strong>ONDE TESTAR · GDEVELOP</strong><p>Abra <a href="https://editor.gdevelop.io/" target="_blank" rel="noopener noreferrer">o editor gratuito do GDevelop</a> em outra aba e carregue manualmente o projeto editável salvo na Missão 08. O link não abre nem importa seu jogo automaticamente. Sem internet, use o aplicativo GDevelop já instalado e abra o projeto local. Execute o Preview, observe o colega e volte a este caderno para preencher o relatório. Se não houver outra pessoa disponível, não marque o playtest como realizado.</p></div>'+(locked?'<p class="m9s-warning">Entrega enviada/aprovada; edição bloqueada.</p>':'')+'<div class="m9s-roles"><article><strong>AUTOR</strong><p>Observe sem dar pistas. Registre tentativas, travamentos e pedidos de ajuda.</p></article><article><strong>TESTADOR</strong><p>Tente cumprir o objetivo sem instruções extras. Diga o que você entendeu ao final.</p></article></div><div class="m9s-log"><h3>Relatório de uma observação real</h3><p>Um resultado sem defeito também é válido, desde que tenha sido observado e descrito.</p><fieldset><legend>RESULTADO DO TESTE</legend><label><input type="radio" name="m9Outcome" value="issue" '+(d.outcome==='issue'?'checked':'')+' '+(locked?'disabled':'')+'> Encontrei um problema</label><label><input type="radio" name="m9Outcome" value="passed" '+(d.outcome==='passed'?'checked':'')+' '+(locked?'disabled':'')+'> A hipótese foi confirmada sem falha</label></fieldset><fieldset><legend>DECISÃO APÓS O TESTE</legend><label><input type="radio" name="m9Resolution" value="fixed" '+(d.resolution==='fixed'?'checked':'')+' '+(locked?'disabled':'')+'> Corrigi um problema e repeti o teste</label><label><input type="radio" name="m9Resolution" value="backlog" '+(d.resolution==='backlog'?'checked':'')+' '+(locked?'disabled':'')+'> Registrei uma justificativa de backlog</label><label><input type="radio" name="m9Resolution" value="nochange" '+(d.resolution==='nochange'?'checked':'')+' '+(locked?'disabled':'')+'> Não foi necessária alteração após o teste sem falha</label></fieldset>'+fields.map(f=>'<label for="m9s-'+f.id+'"><b>'+esc(f.label)+'</b><small class="m9s-field-hint" id="m9s-help-'+f.id+'">'+esc(fieldHints[f.id])+'</small><textarea id="m9s-'+f.id+'" data-m9s-field="'+f.id+'" aria-describedby="m9s-help-'+f.id+'" maxlength="'+f.max+'" rows="2" '+(locked?'disabled':'')+'>'+esc(d[f.id])+'</textarea></label>').join('')+'<div class="m9s-checks"><b>DECLARAÇÃO MANUAL · TESTE REAL</b>'+['Uma pessoa diferente de mim executou a tarefa no mesmo projeto editável indicado, que reabri e conferi.','Registrei o que aconteceu sem completar lacunas com respostas de IA.','Conferi a reprodução e justifiquei correção, backlog ou nenhuma mudança.'].map((x,i)=>'<label><input type="checkbox" data-m9s-check="'+i+'" '+(d.checks.includes(i)?'checked':'')+' '+(locked?'disabled':'')+'>'+esc(x)+'</label>').join('')+'<small>Em Decisão, descreva o reteste, o motivo do backlog ou por que não foi necessária mudança. As caixas não comprovam execução nem substituem a observação do professor.</small></div>'+(overLimit.length?'<p class="m9s-warning" role="alert">Rascunho antigo preservado: revise os limites de '+overLimit.map(f=>esc(f.label)+' ('+f.max+')').join('; ')+'. A entrega fica bloqueada até corrigir.</p>':'')+'<p id="m9sStatus" role="status">'+esc(draftNotice(ctx.session))+'</p><button type="button" data-m9s-nav="review">CONFERIR RELATÓRIO ›</button></div></section>'}
function review(ctx){const d=load(ctx.session),locked=['submitted','approved'].includes(ctx.status),v=locked?{ok:true}:validate(ctx.session);return '<section class="m9s-review"><h3>É possível reproduzir o que você observou?</h3><div class="m9s-summary"><b>RESULTADO '+esc(d.outcome.toUpperCase())+' · '+esc(d.resolution.toUpperCase())+'</b>'+fields.map(f=>'<p><strong>'+esc(f.label)+'</strong> '+esc(d[f.id]||'Não preenchido')+'</p>').join('')+'</div><label for="evidenceInput">Relatório estruturado</label><textarea id="evidenceInput" readonly maxlength="750">'+esc(evidence(ctx.session))+'</textarea>'+(writeStatus.get(key(ctx.session))===false?'<p class="m9s-warning">⚠ Salvamento permanente indisponível. Copie o relatório acima antes de sair desta aba.</p>':'')+(!v.ok?'<p class="m9s-warning">'+esc(v.label)+'</p>':'')+(ctx.feedback?'<p class="m9s-warning">Devolutiva: '+esc(ctx.feedback)+'</p>':'')+'<div class="m9s-actions"><button type="button" data-m9s-nav="practice" '+(locked?'disabled':'')+'>‹ CORRIGIR</button><button type="button" id="submitWork" '+(!v.ok||locked||(!ctx.canSubmit&&!ctx.preview)?'disabled':'')+'>'+(ctx.preview?'SIMULAR ENTREGA':'ENVIAR AO PROFESSOR')+'</button></div><small>A aprovação só ocorre após revisão real do professor.</small></section>'}
function render(ctx){const p=profile(ctx);return '<section class="m9s-root" id="m9sRoot"><header><small>MISSÃO 09 / 10 · PLAYTEST CRUZADO · 25 MIN</small><h2>Seu jogo encontra outro jogador.</h2><p>'+esc(p.title)+' · '+esc(p.genre)+'</p></header>'+(ctx.phase==='practice'?practice(ctx):ctx.phase==='review'?review(ctx):brief(ctx))+'</section>'}
// A changed observation/decision must not inherit a prior manual confirmation.
function changeOutcome(session,d,next){if(!outcomes.includes(next)||d.outcome===next)return false;d.outcome=next;d.resolution='';d.checks=d.checks.filter(n=>n!==2);save(session,d);return true}
function changeResolution(session,d,next){if(!resolutions.includes(next)||d.resolution===next)return false;d.resolution=next;d.checks=d.checks.filter(n=>n!==2);save(session,d);return true}
// A manual peer-test declaration belongs to the exact task and observation it attests.
const retestByField={
 peer:[0,1,2],hypothesis:[0,1,2],task:[0,1,2],expected:[0,1,2],
 observed:[1,2],steps:[1,2],impact:[1,2],decision:[2],saved:[0]
};
function changeField(session,d,id,value){
 if(!Object.prototype.hasOwnProperty.call(retestByField,id))return [];
 const before=clean(d[id]),after=clean(value);
 d[id]=String(value??'');
 const invalidated=before===after?[]:retestByField[id];
 if(invalidated.length)d.checks=d.checks.filter(n=>!invalidated.includes(n));
 save(session,d);
 return invalidated;
}
function mount(ctx){const root=document.querySelector('#m9sRoot');if(!root)return;const d=load(ctx.session),locked=['submitted','approved'].includes(ctx.status);
root.querySelectorAll('[data-m9s-field]').forEach(el=>el.addEventListener('input',()=>{if(locked)return;const invalidated=changeField(ctx.session,d,el.dataset.m9sField,el.value);if(invalidated.length)root.querySelectorAll('[data-m9s-check]').forEach(c=>{if(invalidated.includes(Number(c.dataset.m9sCheck)))c.checked=false});const status=root.querySelector('#m9sStatus');if(status)status.textContent=draftNotice(ctx.session)+(invalidated.length?(el.dataset.m9sField==='saved'?' Reabra o projeto editável indicado e confira que é o mesmo jogo do playtest antes de reconfirmar a primeira declaração. Se mudou de jogo, repita o teste.':' O relatório mudou: confirme novamente as declarações desmarcadas após verificar o teste real.'):'')}));
root.querySelectorAll('input[name="m9Resolution"]').forEach(el=>el.addEventListener('change',()=>{if(locked||!el.checked)return;const changed=changeResolution(ctx.session,d,el.value);if(changed){root.querySelectorAll('[data-m9s-check]').forEach(c=>{if(c.dataset.m9sCheck==='2')c.checked=false})}const status=root.querySelector('#m9sStatus');if(status)status.textContent=draftNotice(ctx.session)+(changed?' Confira novamente a reprodução e marque a terceira declaração somente após justificar a nova decisão.':'')}));
root.querySelectorAll('input[name="m9Outcome"]').forEach(el=>el.addEventListener('change',()=>{if(locked||!el.checked)return;const changed=changeOutcome(ctx.session,d,el.value);if(changed){root.querySelectorAll('input[name="m9Resolution"]').forEach(r=>{r.checked=false});root.querySelectorAll('[data-m9s-check]').forEach(c=>{if(c.dataset.m9sCheck==='2')c.checked=false})}const status=root.querySelector('#m9sStatus');if(status)status.textContent=draftNotice(ctx.session)+(changed?' Selecione novamente a decisão e confirme a terceira declaração após revisar o novo resultado.':'')}));
root.querySelectorAll('[data-m9s-check]').forEach(el=>el.addEventListener('change',()=>{if(locked)return;const n=Number(el.dataset.m9sCheck);d.checks=el.checked?[...new Set([...d.checks,n])]:d.checks.filter(x=>x!==n);save(ctx.session,d);const status=root.querySelector('#m9sStatus');if(status)status.textContent=draftNotice(ctx.session)}));
root.querySelectorAll('[data-m9s-nav]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.m9sNav==='practice'){ctx.onPhase('practice');return}const v=validate(ctx.session);if(!v.ok){ctx.onMessage(v.label);const focusTarget=v.field==='checks'?'[data-m9s-check]':v.field==='outcome'?'input[name="m9Outcome"]':v.field==='resolution'?'input[name="m9Resolution"]':'#m9s-'+v.field;root.querySelector(focusTarget)?.focus();return}ctx.onPhase('review')}))}
window.PIT_STUDENT_MISSION_NINE={fields,outcomes,resolutions,load,save,draftNotice,validate,evidence,parseEvidence,hydrate,profile,render,mount,changeOutcome,changeResolution,changeField};
})();
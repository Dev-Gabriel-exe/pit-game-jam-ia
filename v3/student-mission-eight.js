/* PIT Game Jam IA V3 · M08-03 · melhoria UX autoral com registro verificável.
 * O registro é declaração do estudante, não execução automática do GDevelop.
 */
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const clean=s=>String(s??'').replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim();
const fields=[
{id:'issue',label:'Qual problema de usabilidade existia?',min:12,max:75},
{id:'control',label:'Qual interação do seu jogo você testou?',min:12,max:70},
{id:'change',label:'Qual melhoria você implementou no GDevelop?',min:12,max:90},
{id:'before',label:'O que o jogador via ou entendia ANTES?',min:12,max:90},
{id:'after',label:'O que mudou no Preview DEPOIS?',min:12,max:90},
{id:'negative',label:'Que caso negativo ou erro você verificou?',min:12,max:85},
{id:'saved',label:'Onde está o projeto editável atualizado?',min:6,max:65}
];
const fieldHelp={
 issue:'No Preview ANTES: identifique a dúvida ou obstáculo observado, sem inventar comportamento.',
 control:'Indique a cena, o objeto e o comando usados para reproduzir o problema.',
 change:'Nomeie o objeto ou evento que editou no GDevelop e explique a alteração feita.',
 before:'Descreva o resultado real da primeira execução do mesmo caminho.',
 after:'Repita exatamente o caminho do ANTES e descreva o resultado real após a alteração.',
 negative:'Diga qual tentativa inválida executou e o que o jogo mostrou; registre também se falhou.',
 saved:'Informe o nome e o local do arquivo editável salvo, ou o caminho usado para recuperá-lo.'
};
const routes=['hud','puzzle','3d'];
// O roteiro é uma pergunta de teste, nunca uma resposta ou aprovação automática.
const routeTestPrompts={
 hud:'HUD/RPG: execute a coleta uma vez, observe a atualização e tente repetir a coleta do mesmo item. Registre se o contador duplicou ou permaneceu correto.',
 puzzle:'Puzzle/narrativa: faça uma escolha incorreta, depois a correta, e repita o clique. Registre a mensagem e se a pontuação ou a vitória mudaram indevidamente.',
 '3d':'Exploração 3D: tente atravessar ou abrir a porta sem a condição exigida; depois cumpra a condição e tente novamente. Registre mensagem, colisão e resultado real.'
};
const routeTestPrompt=route=>routeTestPrompts[route]||routeTestPrompts.hud;
const blank=()=>({route:'hud',checks:[],...Object.fromEntries(fields.map(f=>[f.id,'']))});
const key=id=>'pit_v3_m08_'+String(id||'preview').replace(/[^A-Za-z0-9_-]/g,'').slice(0,80);
function load(session){const d=blank();try{const x=JSON.parse(localStorage.getItem(key(session))||'{}');if(routes.includes(x.route))d.route=x.route;for(const f of fields)if(typeof x[f.id]==='string')d[f.id]=x[f.id].slice(0,f.max);if(Array.isArray(x.checks))d.checks=[...new Set(x.checks.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]}catch{}return d}
function save(session,d){const x=blank();x.route=routes.includes(d.route)?d.route:'hud';for(const f of fields)x[f.id]=clean(d[f.id]).slice(0,f.max);x.checks=[...new Set((d.checks||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<3))];try{localStorage.setItem(key(session),JSON.stringify(x));return true}catch{return false}}
function validate(session){const d=load(session);for(const f of fields){const n=clean(d[f.id]).length;if(n<f.min)return {ok:false,field:f.id,label:'Descreva "'+f.label+'" com pelo menos '+f.min+' caracteres.'}}if(d.before.toLowerCase()===d.after.toLowerCase())return {ok:false,field:'after',label:'ANTES e DEPOIS precisam descrever resultados diferentes observados no Preview.'};if(d.checks.length!==3)return {ok:false,field:'checks',label:'Confirme manualmente os três testes reais no Preview.'};return {ok:true,label:'Registro completo; aguarda revisão e demonstração ao professor.'}}
const names={issue:'Problema',control:'Interação',change:'Mudança',before:'Antes',after:'Depois',negative:'Negativo',saved:'Projeto salvo'};
function evidence(session){const d=load(session);return ['M08 | '+d.route,...fields.map(f=>names[f.id]+': '+clean(d[f.id]))].join('\n')}
function parseEvidence(s){
 // A API antiga podia achatar LF em espaços. Não inferir campos de texto
 // ambíguo, nem converter uma rota desconhecida silenciosamente para HUD.
 if(typeof s!=='string'||s.length>750)return null;
 const lines=s.replace(/\r\n?/g,'\n').split('\n');
 if(lines.length!==fields.length+1)return null;
 const routeLine=lines[0];
 if(!/^M08 \| (hud|puzzle|3d)$/.test(routeLine))return null;
 const d=blank();d.route=routeLine.slice(6);
 const labels=['Problema','Interação','Mudança','Antes','Depois','Negativo','Projeto salvo'];
 for(let i=0;i<fields.length;i++){
  const f=fields[i],prefix=labels[i]+': ',line=lines[i+1];
  if(!line.startsWith(prefix))return null;
  const value=line.slice(prefix.length);
  if(value!==clean(value)||value.length<f.min||value.length>f.max)return null;
  d[f.id]=value;
 }
 if(d.before.toLowerCase()===d.after.toLowerCase())return null;
 // Texto remoto não comprova que o aluno executou os testes no Preview.
 return d;
}
function hydrate(session,text,status){
 const d=parseEvidence(text);if(!d)return;
 const current=load(session);
 // Até um rascunho com somente checks marcados deve ser preservado.
 if(fields.some(f=>current[f.id].trim())||current.checks.length)return;
 d.checks=[];save(session,d);
}
function profile(ctx){const idea=ctx.idea||{};return {title:clean(idea.title)||'seu jogo',genre:clean(idea.genre)||'gênero livre',goal:clean(idea.objective)||'seu objetivo autoral'}}
function brief(ctx){const p=profile(ctx);return '<section class="m8s-brief"><h3>Polimento não é adicionar dez efeitos.</h3><p>Continue <b>'+esc(p.title)+'</b> ('+esc(p.genre)+'). Escolha UMA dificuldade real do jogador: instrução, HUD, resposta, contraste ou mensagem de erro. Preserve o controle e a condição de conclusão da Missão 07.</p><ol><li>Execute Preview e registre o problema ANTES.</li><li>Implemente uma melhoria pequena no mesmo projeto.</li><li>Repita a interação, teste o erro e registre o DEPOIS.</li></ol><button type="button" data-m8s-nav="practice">INICIAR POLIMENTO ›</button></section>'}
function practice(ctx){const d=load(ctx.session),p=profile(ctx),locked=['submitted','approved'].includes(ctx.status),guide=window.PIT_GDEVELOP_M08_GUIDE?window.PIT_GDEVELOP_M08_GUIDE.render():'<p>Guia indisponível. Use o editor de eventos e a documentação oficial do GDevelop.</p>';return '<section class="m8s-practice"><div class="m8s-plan"><small>OFICINA · 28 MINUTOS</small><h3>Uma melhoria no projeto '+esc(p.title)+'</h3><p>Objetivo autoral: '+esc(p.goal)+'. A melhoria precisa resolver um problema observado, não apenas mudar uma cor aleatória.</p><div><span>5 min · ANTES</span><span>15 min · IMPLEMENTAR</span><span>8 min · DEPOIS + TESTE</span></div></div>'+'<div class="m8s-plan" role="note"><strong>PASSO A PASSO · MELHORE UMA COISA QUE REALMENTE ATRAPALHA</strong><p><b>1.</b> Abra o projeto GDevelop das Missões 03–07 e rode o Preview. <b>2.</b> Reproduza uma dificuldade real (ex.: texto ilegível, ausência de aviso, botão sem resposta clara ou câmera confusa) e registre o ANTES. <b>3.</b> Escolha apenas uma melhoria do tutorial abaixo. <b>4.</b> Edite o objeto ou evento correspondente, sem reconstruir o jogo. <b>5.</b> Execute exatamente a mesma interação no Preview e registre o DEPOIS. <b>6.</b> Teste também uma tentativa inválida e confirme que ainda é possível chegar ao final da Missão 07. <b>7.</b> Confira texto, HUD e controles na resolução para a qual criou o jogo. Se o destino inclui celular, redimensione a janela do Preview para uma largura estreita e observe se algo corta ou se sobrepõe; isso não equivale a teste em celular físico. <b>8.</b> Salve o projeto, preencha a comparação e marque somente testes realmente executados. <b>9.</b> Clique “Revisar comparação” e depois “Enviar ao professor”.</p><p><b>Se não houver diferença observável:</b> volte ao problema original e ajuste o feedback; mudar uma cor aleatória não basta. Se a mudança quebrar o final, restaure o evento anterior e refaça um ajuste menor.</p></div>'+ '<div class="m8s-editor-handoff" role="note"><strong>ONDE CONSTRUIR · GDEVELOP</strong><p>Abra <a href="https://editor.gdevelop.io/" target="_blank" rel="noopener noreferrer">o editor gratuito do GDevelop</a> em outra aba e carregue manualmente o projeto salvo na Missão 07. O link não abre nem importa seu projeto automaticamente. Sem internet, use o aplicativo GDevelop já instalado e abra o arquivo local. Volte a este caderno para registrar ANTES, DEPOIS, teste negativo e local do projeto salvo.</p></div>'+(locked?'<p class="m8s-warning">Registro enviado/aprovado: campos bloqueados.</p>':'')+guide+'<aside class="m8s-plan m8s-route-test-plan" role="note"><strong>TESTE REAL · ROTA SELECIONADA</strong><p id="m8sRouteTestPlan" aria-live="polite">'+esc(routeTestPrompt(d.route))+'</p><small>É uma sugestão de tentativa, não um resultado esperado preenchido. Execute no Preview do seu próprio jogo e registre o que aconteceu, inclusive falhas.</small></aside><div class="m8s-log"><h3>Registro de comparação no Preview</h3><p>Escreva o que realmente aconteceu no seu jogo. Não copie o resultado esperado do tutorial.</p>'+fields.map(f=>'<label for="m8s-'+f.id+'"><b>'+esc(f.label)+'</b><small class="m8s-field-hint" id="m8s-help-'+f.id+'">'+esc(fieldHelp[f.id])+' Mínimo: '+f.min+' caracteres.</small><textarea id="m8s-'+f.id+'" data-m8s-field="'+f.id+'" aria-describedby="m8s-help-'+f.id+'" maxlength="'+f.max+'" rows="2" '+(locked?'disabled':'')+'>'+esc(d[f.id])+'</textarea></label>').join('')+'<div class="m8s-checks"><b>DECLARAÇÃO MANUAL · TESTES NO PREVIEW</b>'+['Observei a interação ANTES e registrei uma dificuldade real.','Executei o mesmo caminho DEPOIS e vi uma melhoria observável.','Testei um erro ou caso negativo e confirmei que o jogo ainda chega ao final.'].map((x,i)=>'<label><input type="checkbox" data-m8s-check="'+i+'" '+(d.checks.includes(i)?'checked':'')+' '+(locked?'disabled':'')+'>'+esc(x)+'</label>').join('')+'<small>As caixas não executam o jogo nem comprovam aprovação. O professor pode solicitar demonstração.</small></div><p id="m8sStatus" role="status">Rascunho local, ainda não enviado.</p><button type="button" data-m8s-nav="review">REVISAR COMPARAÇÃO ›</button></div></section>'}
function review(ctx){const d=load(ctx.session),locked=['submitted','approved'].includes(ctx.status),v=locked?{ok:true}:validate(ctx.session);return '<section class="m8s-review"><h3>O jogador percebe a diferença?</h3><div class="m8s-summary"><b>ROTA '+esc(d.route.toUpperCase())+'</b>'+fields.map(f=>'<p><strong>'+esc(f.label)+'</strong> '+esc(d[f.id]||'Não preenchido')+'</p>').join('')+'</div><label for="evidenceInput">Registro estruturado para avaliação</label><textarea id="evidenceInput" readonly maxlength="750">'+esc(evidence(ctx.session))+'</textarea>'+(!v.ok?'<p class="m8s-warning">'+esc(v.label)+'</p>':'')+(ctx.feedback?'<p class="m8s-warning">Devolutiva: '+esc(ctx.feedback)+'</p>':'')+'<div class="m8s-actions"><button type="button" data-m8s-nav="practice" '+(locked?'disabled':'')+'>‹ CORRIGIR</button><button type="button" id="submitWork" '+(!v.ok||locked||(!ctx.canSubmit&&!ctx.preview)?'disabled':'')+'>'+(ctx.preview?'SIMULAR ENTREGA':'ENVIAR AO PROFESSOR')+'</button></div><small>A evidência não concede nota nem aprovação automática.</small></section>'}
function render(ctx){const p=profile(ctx);return '<section class="m8s-root" id="m8sRoot"><header><small>MISSÃO 08 / 10 · POLIMENTO · 40 MINUTOS</small><h2>Antes e depois: seu jogo mais claro.</h2><p>'+esc(p.title)+' · '+esc(p.genre)+'</p></header>'+(ctx.phase==='practice'?practice(ctx):ctx.phase==='review'?review(ctx):brief(ctx))+'</section>'}
function mount(ctx){const root=document.querySelector('#m8sRoot');if(!root)return;const d=load(ctx.session),locked=['submitted','approved'].includes(ctx.status);
if(ctx.phase==='practice'&&window.PIT_GDEVELOP_M08_GUIDE){const guide=root.querySelector('#g8Guide');window.PIT_GDEVELOP_M08_GUIDE.mount(guide,{initialRoute:routes.indexOf(d.route),onRouteChange:(id)=>{if(locked)return;d.route=id;save(ctx.session,d);const prompt=root.querySelector('#m8sRouteTestPlan');if(prompt)prompt.textContent=routeTestPrompt(id)}});if(locked)guide?.querySelectorAll('button').forEach(b=>b.disabled=true)}
root.querySelectorAll('[data-m8s-field]').forEach(el=>el.addEventListener('input',()=>{if(locked)return;d[el.dataset.m8sField]=el.value;const ok=save(ctx.session,d),status=root.querySelector('#m8sStatus');if(status)status.textContent=ok?'Rascunho salvo localmente; não enviado.':'Falha ao salvar o rascunho.'}));
root.querySelectorAll('[data-m8s-check]').forEach(el=>el.addEventListener('change',()=>{if(locked)return;const n=Number(el.dataset.m8sCheck);d.checks=el.checked?[...new Set([...d.checks,n])]:d.checks.filter(x=>x!==n);save(ctx.session,d)}));
root.querySelectorAll('[data-m8s-nav]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.m8sNav==='practice'){ctx.onPhase('practice');return}const v=validate(ctx.session);if(!v.ok){ctx.onMessage(v.label);root.querySelector(v.field==='checks'?'[data-m8s-check]':'#m8s-'+v.field)?.focus();return}ctx.onPhase('review')}))}
window.PIT_STUDENT_MISSION_EIGHT={fields,routes,load,save,validate,evidence,parseEvidence,hydrate,profile,render,mount};
})();
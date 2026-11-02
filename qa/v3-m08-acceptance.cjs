'use strict';
// M08-04 automated student/professor evidence and accessibility regression.
// No physical device or human GDevelop Preview claimed.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const store=new Map();
const ctx={window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{}};
for(const f of ['v3/student-mission-eight.js','v3/teacher-mission-eight-validation.js'])
 vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const student=ctx.window.PIT_STUDENT_MISSION_EIGHT;
assert(student&&student.fields.length===7,'seven independent evidence fields');
assert.equal(student.validate('student-a').ok,false,'blank evidence cannot submit');
const d=student.load('student-a');
for(const f of student.fields)d[f.id]='Registro verificável de interação e comparação '+f.id;
d.before='O comando era confuso, sem indicação textual.';
d.after='O comando mostra uma mensagem textual clara.';
d.checks=[0,1,2];
assert(student.save('student-a',d),'draft persisted');
assert.equal(student.validate('student-a').ok,true,'complete evidence can submit');
assert.equal(student.validate('student-b').ok,false,'student isolation');
const e=student.evidence('student-a');
assert(e.includes('Antes:')&&e.includes('Depois:')&&e.includes('Negativo:'),'structured before/after/negative');
assert.equal(student.parseEvidence(e).before,d.before,'roundtrip before');
assert.equal(student.parseEvidence(e).after,d.after,'roundtrip after');

// Historical drafts must never lose text when a field exceeds today's limits.
for(const f of student.fields){
 const session='legacy-over-'+f.id,legacy={...d,[f.id]:'X'.repeat(f.max+9),checks:[0,1,2]};
 store.set('pit_v3_m08_'+session,JSON.stringify(legacy));
 assert.equal(student.load(session)[f.id],legacy[f.id],'legacy load preserves overlong '+f.id);
 const invalid=student.validate(session);
 assert.equal(invalid.ok,false,'legacy overlong invalid '+f.id);
 assert.equal(invalid.field,f.id,'exact invalid field '+f.id);
 assert.match(invalid.label,new RegExp(String(f.max)),'specific max in warning '+f.id);
 assert.equal(student.save(session,student.load(session)),true,'save legacy '+f.id);
 assert.equal(student.load(session)[f.id],legacy[f.id],'save preserves legacy '+f.id);
 assert.equal(JSON.parse(store.get('pit_v3_m08_'+session))[f.id],legacy[f.id],'disk preserves legacy '+f.id);
 const practice=student.render({session,phase:'practice',status:'draft',idea:{}});
 assert.match(practice,/Resposta antiga preservada/,'student sees over-limit warning '+f.id);
 assert.match(practice,new RegExp('limite de '+f.max),'student sees field limit '+f.id);
 const review=student.render({session,phase:'review',status:'draft',idea:{},canSubmit:true});
 assert.match(review,/Revise o texto preservado antes de enviar/,'review explains correction '+f.id);
 assert.match(review,/id="submitWork" disabled/,'submission blocked '+f.id);
 const corrected=student.load(session);corrected[f.id]=d[f.id];
 student.save(session,corrected);
 assert.equal(student.validate(session).ok,true,'corrected draft validates '+f.id);
 assert.doesNotMatch(student.render({session,phase:'practice',status:'draft',idea:{}}),/Resposta antiga preservada/,'warning disappears after correction '+f.id);
}


assert.equal(student.parseEvidence(e).route,'hud','valid route is preserved');
const invalidLegacy=[
 ['achatado',e.replace(/\n/g,' ')],
 ['sem campo',e.split('\n').slice(0,-1).join('\n')],
 ['rótulo duplicado',e.replace('Depois: ','Antes: ')],
 ['rota desconhecida',e.replace('M08 | hud','M08 | imagem')],
 ['campo vazio',e.replace(/Negativo: [^\n]+/,'Negativo: ')],
 ['campo longo',e.replace(/Mudança: [^\n]+/,'Mudança: '+'X'.repeat(91))],
 ['campo extra',e+'\nOutro: valor'],
 ['linha extra',e+'\n'],
 ['ordem trocada',e.split('\n').map((line,i,arr)=>i===1?arr[2]:i===2?arr[1]:line).join('\n')],
 ['antes e depois iguais',e.replace(/Depois: [^\n]+/,'Depois: '+d.before)]
];
for(const [name,raw] of invalidLegacy){
 assert.equal(student.parseEvidence(raw),null,'M08 rejects '+name);
 student.hydrate('legacy-'+name,raw,'submitted');
 assert.equal(student.load('legacy-'+name).issue,'','invalid M08 evidence must not hydrate '+name);
}
assert.equal(student.parseEvidence(e.replace(/\n/g,'\r\n')).route,'hud','CRLF evidence supported');
student.hydrate('remote-valid',e,'submitted');
assert.equal(student.load('remote-valid').issue,d.issue,'valid remote text restored');
assert.equal(student.load('remote-valid').checks.length,0,'remote text never proves Preview checks');
const checksOnly=student.load('checks-only');checksOnly.checks=[1];
student.save('checks-only',checksOnly);
student.hydrate('checks-only',e,'submitted');
assert.equal(student.load('checks-only').issue,'','local check-only draft preserved');
assert.equal(student.load('checks-only').checks.length,1);

const same={...d,after:d.before};
student.save('student-b',same);
assert.equal(student.validate('student-b').ok,false,'identical before and after rejected');
const studentPractice=student.render({phase:'practice',session:'student-a',idea:{title:'Jogo de teste',genre:'puzzle'}});
for(const field of student.fields){
 assert(studentPractice.includes('id="m8s-help-'+field.id+'"'),'M08 student explains what to fill in '+field.id);
 assert(studentPractice.includes('aria-describedby="m8s-help-'+field.id+'"'),'M08 student links textarea to instructions for '+field.id);
}
assert(!studentPractice.includes('pit-private-teacher-notes'),'private teacher notes absent from student M08');
// The suggested negative test must follow the selected route, not stay on HUD.
for(const [route,term] of [['hud','contador'],['puzzle','pontuação'],['3d','colisão']]){
 const data=student.load('student-route');data.route=route;student.save('student-route',data);
 const html=student.render({phase:'practice',session:'student-route',idea:{title:'Jogo fictício'}});
 assert(html.includes('id="m8sRouteTestPlan"')&&html.includes(term),'student sees an actionable Preview test for '+route);
 assert(html.includes('não um resultado esperado preenchido'),'student is not given a canned test outcome');
 assert(!html.includes('pit-private-teacher-notes'),'student route guidance never contains teacher notes');
}
// Simulate the tutorial's tab callback without claiming a real browser test.
const testPlan={textContent:''},guideRoot={querySelectorAll:()=>[]};
const checkboxes=Array.from({length:3},()=>({checked:true,addEventListener:()=>{}}));
const fakeRoot={
 querySelector:sel=>sel==='#g8Guide'?guideRoot:sel==='#m8sRouteTestPlan'?testPlan:null,
 querySelectorAll:sel=>sel==='[data-m8s-check]'?checkboxes:[]
};
const beforeSwitch=student.load('student-route');
beforeSwitch.route='hud';beforeSwitch.checks=[0,1,2];
student.save('student-route',beforeSwitch);
assert.equal(student.selectRoute({...beforeSwitch},'hud'),false,'same route must not invalidate tests');
assert.equal(student.selectRoute({...beforeSwitch},'invalid'),false,'unknown route ignored');
ctx.document.querySelector=sel=>sel==='#m8sRoot'?fakeRoot:null;
ctx.window.PIT_GDEVELOP_M08_GUIDE={mount:(_guide,options)=>options.onRouteChange('3d')};
student.mount({phase:'practice',session:'student-route',status:'draft'});
assert.equal(student.load('student-route').route,'3d','route selection persisted by tutorial callback');
assert.equal(student.load('student-route').checks.length,0,'old Preview confirmations invalidated after route change');
assert(checkboxes.every(x=>!x.checked),'visible checkboxes reset with saved checks');
assert(testPlan.textContent.includes('colisão'),'negative-test prompt updates on route selection');
const unchanged=student.load('student-route');unchanged.checks=[0,1,2];
assert.equal(student.selectRoute(unchanged,'3d'),false,'same route preserves confirmations');
assert.equal(unchanged.checks.length,3,'same route does not erase valid confirmations');
assert.equal(student.selectRoute(unchanged,'puzzle'),true,'new route triggers retest');
assert.equal(unchanged.checks.length,0,'direct route change invalidates confirmations');

// Each changed field invalidates only the manual Preview checks it attests.
// A changed saved-project path must be reopened and reconfirmed (check 2).
const affectedChecks={
 issue:[0,1,2],control:[0,1,2],change:[0,1,2],
 before:[0,1],after:[1,2],negative:[2],saved:[2]
};
for(const f of student.fields){
 const draft=student.load('m08-retest-'+f.id);
 draft[f.id]='Versão anterior do registro';draft.checks=[0,1,2];
 assert.equal(student.updateField(draft,f.id,'Nova observação real no Preview'),true,'changed '+f.id+' requires selective retest');
 const retained=[0,1,2].filter(n=>!affectedChecks[f.id].includes(n));
 assert.deepEqual(Array.from(draft.checks),retained,'only affected Preview checks removed for '+f.id);
 student.save('m08-retest-'+f.id,draft);
 assert.deepEqual(Array.from(student.load('m08-retest-'+f.id).checks),retained,'selective retest persisted for '+f.id);
}
const unchangedDraft=student.load('m08-same-text');
unchangedDraft.issue='A mesma observação';unchangedDraft.checks=[0,1,2];
assert.equal(student.updateField(unchangedDraft,'issue','  A mesma   observação  '),false,'whitespace-only edit does not invalidate checks');
assert.equal(unchangedDraft.checks.length,3,'same observation keeps tests');
assert.equal(student.updateField(unchangedDraft,'saved','projeto-local.json'),true,'changed project requires reopen');
assert.deepEqual(Array.from(unchangedDraft.checks),[0,1],'project path only invalidates final/reopen check');
assert.equal(student.updateField(unchangedDraft,'saved','  projeto-local.json  '),false,'whitespace-only project edit preserves checks');
assert.deepEqual(Array.from(unchangedDraft.checks),[0,1],'equivalent project path keeps prior confirmations');
assert.equal(student.updateField(unchangedDraft,'unknown','anything'),false,'unknown field ignored');
assert.equal(unchangedDraft.checks.length,3,'unknown field keeps checks');
// Simulate a real input callback with a fake DOM; this is NOT a browser/HDMI test.
const editSession='m08-input-event';
const editDraft=student.load(editSession);
editDraft.after='A mensagem aparecia de forma confusa.';editDraft.checks=[0,1,2];
student.save(editSession,editDraft);
const editChecks=Array.from({length:3},()=>({checked:true,addEventListener:()=>{}}));
const editStatus={textContent:''};
let onInput;
const editField={dataset:{m8sField:'after'},value:'Agora a mensagem é clara e verificável.',addEventListener:(name,callback)=>{if(name==='input')onInput=callback}};
const editRoot={
 querySelector:sel=>sel==='#m8sStatus'?editStatus:null,
 querySelectorAll:sel=>sel==='[data-m8s-field]'?[editField]:sel==='[data-m8s-check]'?editChecks:[]
};
ctx.window.PIT_GDEVELOP_M08_GUIDE=null;
ctx.document.querySelector=sel=>sel==='#m8sRoot'?editRoot:null;
student.mount({phase:'practice',session:editSession,status:'draft'});
assert.equal(typeof onInput,'function','M08 input event bound');
onInput();
assert.deepEqual(Array.from(student.load(editSession).checks),[0],'DOM after edit preserves only independent before test');
assert.deepEqual(editChecks.map(c=>c.checked),[true,false,false],'DOM edit unchecks only affected visible tests');
assert.match(editStatus.textContent,/reconfirme os testes afetados no Preview/,'DOM edit announces selective retest');
assert.match(student.render({session:editSession,phase:'practice',status:'draft',idea:{}}),/aria-live="polite"/,'status is live for keyboard/screen-reader users');
console.log('PASS M08 edit-retest: seven fields, selective check invalidation, saved-project reopen, normalized edits, DOM input and persistence');

const studentCss=fs.readFileSync('v3/student-mission-eight.css','utf8');
assert(studentCss.includes('.m8s-field-hint'),'M08 guidance is styled for legibility');
const rubric=ctx.window.PIT_TEACHER_MISSION_EIGHT_VALIDATION;
assert(rubric&&rubric.rubric.length===6,'teacher rubric covers six criteria');
assert(rubric.rubric.some(x=>/LEGIBILIDADE NA TELA-ALVO/.test(x.title) && /resolução-alvo no Preview/.test(x.accept) && /Se o jogo também é para celular/.test(x.accept) && /Teste em celular físico não é requisito/.test(x.accept)),'target-screen rubric: Preview at intended resolution, conditional narrow-screen check, no physical-device claim');
assert(rubric.rubric.some(x=>/ACESSIBILIDADE/.test(x.title)),'accessibility rubric');
assert(rubric.rubric.some(x=>/DESEMPENHO/.test(x.title)),'performance rubric');
const page=fs.readFileSync('v3/app.js','utf8');
assert(page.includes('PIT_STUDENT_MISSION_EIGHT'),'M08 student wired into app');
assert(page.includes('PIT_TEACHER_MISSION_EIGHT_VALIDATION'),'M08 teacher wired into app');

const deniedCtx={window:{},localStorage:{getItem:()=>{throw Error('storage denied')},setItem:()=>{throw Error('storage denied')}},document:{}};
vm.runInNewContext(fs.readFileSync('v3/student-mission-eight.js','utf8'),deniedCtx,{filename:'v3/student-mission-eight.js'});
const denied=deniedCtx.window.PIT_STUDENT_MISSION_EIGHT;
const deniedDraft=denied.load('m08-ficticio');
for(const f of denied.fields)deniedDraft[f.id]='Resultado observado no Preview para '+f.id;
deniedDraft.before='A interação não mostrava nenhuma instrução.';
deniedDraft.after='A interação agora mostra instrução visível.';
deniedDraft.route='3d';deniedDraft.checks=[0,1,2];
assert.equal(denied.save('m08-ficticio',deniedDraft),false,'blocked storage reported honestly');
assert.equal(denied.load('m08-ficticio').route,'3d','volatile route preserved');
assert.equal(denied.load('m08-ficticio').checks.length,3,'volatile checks preserved');
assert.equal(denied.load('m08-ficticio').after,deniedDraft.after,'volatile before/after preserved');
assert.equal(denied.validate('m08-ficticio').ok,true,'volatile complete draft validates');
assert.equal(denied.load('m08-outro').issue,'','volatile draft isolated per session');
const volatileLong=denied.load('m08-legacy-long');volatileLong.issue='X'.repeat(95);
assert.equal(denied.save('m08-legacy-long',volatileLong),false,'overlong volatile save reports storage denial');
assert.equal(denied.load('m08-legacy-long').issue.length,95,'overlong volatile draft is preserved');
assert.equal(denied.validate('m08-legacy-long').field,'issue','overlong volatile draft cannot submit');
assert.match(denied.draftNotice('m08-ficticio'),/apenas nesta aba/,'warning describes actual storage failure');
assert.doesNotMatch(denied.draftNotice('m08-ficticio'),/Rascunho salvo neste navegador/);
const deniedPractice=denied.render({session:'m08-ficticio',phase:'practice',status:'draft',idea:{}});
assert.match(deniedPractice,/copie sua ficha antes de sair/,'practice warns about loss on tab close');
assert.match(denied.render({session:'m08-ficticio',phase:'review',status:'draft',idea:{}}),/Copie a evidência acima/,'review provides manual backup');
const deniedEvidence=denied.evidence('m08-ficticio');
assert.equal(denied.parseEvidence(deniedEvidence).route,'3d','volatile evidence remains parseable');
denied.hydrate('m08-ficticio',deniedEvidence,'approved');
assert.equal(denied.load('m08-ficticio').checks.length,3,'remote hydration does not overwrite volatile draft');
const onlyRoute=denied.load('m08-rota');onlyRoute.route='3d';
denied.save('m08-rota',onlyRoute);
denied.hydrate('m08-rota',deniedEvidence,'submitted');
assert.equal(denied.load('m08-rota').issue,'','route-only draft preserved');
assert.equal(denied.load('m08-rota').route,'3d');
console.log('PASS M08 denied-storage: volatile session draft, route, checks, warnings and evidence precedence; physical/browser UI NOT_RUN');

console.log('PASS M08-04 automated: validation, isolation, before/after, negative, rubric and app wiring; physical device and actual GDevelop Preview NOT_RUN');

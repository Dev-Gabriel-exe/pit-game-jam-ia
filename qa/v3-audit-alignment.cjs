'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('v3/app.js'),teacher=read('professor-v3.html'),student=read('aluno-v3.html');
const files=['mission-one','student-mission-two','student-mission-three','student-mission-four','student-mission-five','student-mission-six','student-mission-seven','student-mission-eight','student-mission-nine','student-mission-ten'];
for(let n=1;n<=10;n++){
 const name=files[n-1];
 assert(student.includes('./v3/'+name+'.js'),'student loads '+n);
 assert(app.includes('mission'+['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'][n-1]+'?window.'),'student render '+n);
}
for(const [n,module] of [[1,'teacher-mission-one-pro'],[2,'teacher-mission-two'],[3,'teacher-mission-three'],[4,'teacher-mission-four-foundations'],[5,'teacher-mission-five-foundations'],[6,'teacher-mission-six-foundations'],[7,'teacher-mission-seven-foundations'],[8,'teacher-mission-eight-foundations'],[9,'teacher-mission-nine-foundations'],[10,'teacher-mission-ten-foundations']]){
 assert(teacher.includes('./v3/'+module+'.js'),'teacher loads '+n);
}
assert(app.includes('teacherMissionNineDemo?window.PIT_TEACHER_MISSION_NINE_FOUNDATIONS.renderDemo()'),'M09 demo not legacy speaking notes');
const expected=[
 ['v3/student-mission-three.js',['4 min</b> · projeto','8 min</b> · um asset','6 min</b> · Preview']],
 ['v3/student-mission-four.js',['36 MIN DE PRÁTICA']],
 ['v3/student-mission-five.js',['OFICINA · 24 MINUTOS']],
 ['v3/student-mission-six.js',['32 MINUTOS DE PRODUÇÃO']],
 ['v3/student-mission-seven.js',['OFICINA · 36 MINUTOS','14 min · feedback final','12 min · testes']],
 ['v3/teacher-mission-seven-validation.js',['OFICINA · 36 MINUTOS','14 MIN · RESULTADO','12 MIN · TESTES']],
 ['v3/student-mission-eight.js',['OFICINA · 28 MINUTOS','15 min · IMPLEMENTAR']],
 ['v3/teacher-mission-eight-validation.js',['OFICINA · 28 MIN','15 MIN · MELHORIA']],
 ['v3/student-mission-nine.js',['PLAYTEST · 16 MINUTOS']],
 ['v3/student-mission-ten.js',['18 minutos · demonstração']]
];
for(const [file,terms] of expected){const c=read(file);for(const term of terms)assert(c.includes(term),file+' missing '+term)}
for(const n of [4,5,6,7,8,9,10]){
 const word=['','','','', 'Four','Five','Six','Seven','Eight','Nine','Ten'][n];
 assert(app.includes('teacherMission'+word+'Briefing'),'teacher concepts '+n);
}
assert(app.includes('teacherMissionTenValidation?'),'M10 real review');
// Teacher-only facilitation notes must never appear expanded on the projected slides.
const teacherNotes=['v3/teacher-mission-one-pro.js','v3/teacher-mission-two.js','v3/teacher-mission-three.js'];
for(const file of teacherNotes){
 const source=read(file);
 assert(source.includes('<details class="pit-private-teacher-notes">'),file+' must conceal the teacher notes');
 assert(source.includes('aria-label="Abrir roteiro privado do professor">▤</summary>'),file+' needs discreet accessible paper control');
 assert(!source.includes('<details class="pit-private-teacher-notes" open'),file+' must default to closed');
}
assert(teacher.includes('./v3/teacher-private-notes.css'),'teacher-only stylesheet loaded');
assert(!student.includes('teacher-private-notes.css'),'student should not load teacher-only stylesheet');
assert(read('v3/student-mission-three.js').includes('https://editor.gdevelop.io/'),'student M03 must have real editor handoff');
assert(read('v3/student-mission-three.js').includes('não abre nem cria o jogo automaticamente'),'student M03 should not imply automatic GDevelop launch');
const m04Teacher=read('v3/teacher-mission-four-validation.js');
const m04Student=read('v3/student-mission-four.js');
assert.equal((m04Teacher.match(/<details class="pit-private-teacher-notes">/g)||[]).length,2,'M04 practice and review each conceal private guidance');
assert((m04Teacher.match(/class="pit-private-teacher-notes-body"/g)||[]).length>=1,'M04 practice notes use shared CSS');
assert(m04Teacher.includes('aria-label="Abrir roteiro privado da prática da Missão 04"'),'M04 practice paper control accessible');
assert(m04Teacher.includes('aria-label="Abrir roteiro privado da avaliação da Missão 04"')||m04Teacher.includes('aria-label="Orientações reservadas ao professor — abrir somente sem espelhamento"'),'M04 review paper control accessible');
assert(!m04Teacher.includes('<details class="pit-private-teacher-notes" open'),'M04 notes default closed');
assert(!m04Student.includes('pit-private-teacher-notes'),'student M04 must not contain private teacher notes');
assert(teacher.includes('./v3/gdevelop-mission-four-guide.js'),'M04 GDevelop guide must be loaded');
assert(read('v3/gdevelop-mission-four-guide.js').includes('GDevelop'),'M04 guide must explain GDevelop');
for(const time of ['12 min','15 min','9 min'])assert(m04Student.includes(time),'M04 student practice time '+time);
for(const time of ['12 MIN','15 MIN','9 MIN'])assert(m04Teacher.includes(time),'M04 teacher practice time '+time);
// M05: chapter identity, practical handoff and projector-safe assessment.
const m05Teacher=read('v3/teacher-mission-five-validation.js');
const m05Student=read('v3/student-mission-five.js');
assert(m05Teacher.includes('<div class="t5v-top"><strong>V</strong>'),'M05 must display chapter V, not IV');
assert.equal((m05Teacher.match(/<details class="pit-private-teacher-notes">/g)||[]).length,2,'M05 practice and review notes must be private');
assert.equal((m05Teacher.match(/class="pit-private-teacher-notes-body"/g)||[]).length,2,'M05 private panels use shared stylesheet');
assert(m05Teacher.includes('aria-label="Abrir roteiro privado da avaliação da Missão 05"'),'M05 assessment paper icon accessible');
assert(!m05Teacher.includes('<details class="pit-private-teacher-notes" open'),'M05 notes must default closed');
assert(!m05Student.includes('pit-private-teacher-notes'),'M05 student must not receive private teacher notes');
assert(m05Student.includes('https://editor.gdevelop.io/'),'M05 student editor link exists');
assert(m05Student.includes('não abre nem importa seu jogo automaticamente'),'M05 editor link must not imply automatic project loading');
assert(m05Student.includes('aplicativo GDevelop já instalado'),'M05 student offline fallback exists');
assert(read('v3/gdevelop-mission-five-guide.js').includes('TUTORIAL DE EVENTOS · 5 MINUTOS'),'M05 shared tutorial must use neutral audience heading');
assert(!read('v3/gdevelop-mission-five-guide.js').includes('PROFESSOR · DEMONSTRAÇÃO'),'M05 student tutorial must not show teacher-only heading');
for(const time of ['8 min','8 min','8 min'])assert(m05Student.includes(time),'M05 student 24min split');
for(const time of ['8 MIN'])assert(m05Teacher.includes(time),'M05 teacher 24min split');
// M06: editor handoff and projector-safe teacher foundations/assessment.
const m06Student=read('v3/student-mission-six.js');
const m06Foundations=read('v3/teacher-mission-six-foundations.js');
const m06Validation=read('v3/teacher-mission-six-validation.js');
assert(m06Student.includes('https://editor.gdevelop.io/'),'M06 student links real GDevelop editor');
assert(m06Student.includes('não abre nem importa seu projeto automaticamente'),'M06 editor link cannot imply automatic import');
assert(m06Student.includes('aplicativo GDevelop já instalado'),'M06 offline fallback exists');
assert(m06Student.includes('tutorial a seguir'),'M06 tutorial order matches screen');
assert(!m06Student.includes('pit-private-teacher-notes'),'M06 student has no private teacher notes');
for(const [name,source] of [['foundations',m06Foundations],['validation',m06Validation]]){
 assert(source.includes('<details class="pit-private-teacher-notes">'),'M06 '+name+' has private guidance');
 assert(source.includes('<summary aria-label="Abrir roteiro privado da Missão 06">▤</summary>')||source.includes('aria-label="Abrir roteiro privado da Missão 06">▤</summary>'),'M06 '+name+' accessible paper control');
 assert(source.includes('class="pit-private-teacher-notes-body"'),'M06 '+name+' shared private note style');
 assert(!source.includes('<details class="pit-private-teacher-notes" open'),'M06 '+name+' private notes default closed');
}
assert(!m06Foundations.includes('PRÓXIMA ETAPA DO PROFESSOR'),'M06 foundations projected footer has no teacher facilitation');
assert(m06Validation.indexOf('Acompanhamento → aluno → Missão 06')<m06Validation.indexOf('</details>'),'M06 assessment navigation remains inside private notes');
for(const t of ['5 min escolha','12 min criação','8 min importação','7 min Preview'])assert(m06Student.includes(t),'M06 student timing '+t);
// M07: 50-minute schedule, shared guide neutral heading and no projected assessment workflow.
const m07Student=read('v3/student-mission-seven.js');
const m07Foundations=read('v3/teacher-mission-seven-foundations.js');
const m07Validation=read('v3/teacher-mission-seven-validation.js');
const m07Guide=read('v3/gdevelop-mission-seven-guide.js');
assert(m07Student.includes('https://editor.gdevelop.io/'),'M07 student editor handoff');
assert(m07Student.includes('não abre nem importa seu projeto automaticamente'),'M07 editor manual recovery notice');
assert(m07Student.includes('aplicativo GDevelop já instalado'),'M07 offline fallback');
assert(!m07Student.includes('pit-private-teacher-notes'),'M07 student contains no private teacher notes');
assert(m07Guide.includes('TUTORIAL DE CONCLUSÃO · 4 MINUTOS'),'M07 shared guide neutral heading');
assert(!m07Guide.includes('PROFESSOR · DEMONSTRAÇÃO'),'M07 shared guide cannot label student as professor');
assert(m07Foundations.includes('[7,4,36,3]'),'M07 teacher 7+4+36+3=50 minutes');
assert.equal((m07Validation.match(/<details class="pit-private-teacher-notes">/g)||[]).length,2,'M07 practice/review notes private');
assert.equal((m07Validation.match(/class="pit-private-teacher-notes-body"/g)||[]).length,2,'M07 private notes styled');
assert(m07Validation.includes('aria-label="Abrir roteiro privado da avaliação da Missão 07"'),'M07 review icon accessible');
assert(!m07Validation.includes('<details class="pit-private-teacher-notes" open'),'M07 private notes closed');
assert(m07Validation.indexOf('No acompanhamento, selecione')>m07Validation.lastIndexOf('<details class="pit-private-teacher-notes">'),'M07 assessment workflow within private note');
// M08: one real before/after improvement, 40-minute alignment, neutral shared tutorial, and HDMI-safe review.
const m08Student=read('v3/student-mission-eight.js');
const m08Foundations=read('v3/teacher-mission-eight-foundations.js');
const m08Validation=read('v3/teacher-mission-eight-validation.js');
const m08Guide=read('v3/gdevelop-mission-eight-guide.js');
assert(m08Foundations.includes('[5,4,28,3]'),'M08 teacher 5+4+28+3=40 minutes');
assert(m08Student.includes('OFICINA · 28 MINUTOS'),'M08 student practice 28 min');
for(const t of ['5 min · ANTES','15 min · IMPLEMENTAR','8 min · DEPOIS + TESTE'])assert(m08Student.includes(t),'M08 student timing '+t);
assert(m08Guide.includes('TUTORIAL DE POLIMENTO · 4 MINUTOS'),'M08 shared guide neutral 4-minute heading');
assert(!m08Guide.includes('PROFESSOR · DEMONSTRAÇÃO'),'M08 student cannot see teacher-only heading');
assert(m08Student.includes('https://editor.gdevelop.io/'),'M08 student editor handoff');
assert(m08Student.includes('não abre nem importa seu projeto automaticamente'),'M08 link cannot imply automatic GDevelop loading');
assert(m08Student.includes('aplicativo GDevelop já instalado'),'M08 student offline fallback');

assert(m08Student.includes('Confira texto, HUD e controles na resolução para a qual criou o jogo.'),'M08 student must check target resolution');
assert(m08Student.includes('Se o destino inclui celular, redimensione a janela do Preview'),'M08 student optional narrow-screen path');
assert(m08Student.includes('isso não equivale a teste em celular físico'),'M08 student must distinguish resized Preview from physical device');
assert(m08Validation.includes('LEGIBILIDADE NA TELA-ALVO'),'M08 projected rubric cannot require mobile for desktop-only games');
assert(m08Validation.includes('Se o jogo também é para celular, redimensionar a janela'),'M08 teacher rubric must agree with optional mobile path');
assert(m08Validation.includes('Teste em celular físico não é requisito desta oficina.'),'M08 teacher rubric cannot silently demand physical device');
assert(m08Validation.includes('na resolução-alvo (e em tela estreita quando aplicável)'),'M08 practice/teacher-only notes must agree on device target');

assert(!m08Student.includes('pit-private-teacher-notes'),'M08 student must not receive teacher private notes');
assert.equal((m08Validation.match(/<details class="pit-private-teacher-notes">/g)||[]).length,2,'M08 practice and review must have private panels');
assert.equal((m08Validation.match(/class="pit-private-teacher-notes-body"/g)||[]).length,2,'M08 panels must use shared CSS');
assert(m08Validation.includes('aria-label="Abrir roteiro privado da avaliação da Missão 08"'),'M08 review private icon accessible');
assert(!m08Validation.includes('<details class="pit-private-teacher-notes" open'),'M08 private notes default closed');
assert(m08Validation.indexOf('Depois de retirar o espelhamento')>m08Validation.indexOf('function review()'),'M08 assessment workflow hidden in review panel');
// M09: honest peer observation, exact 25-minute schedule, student GDevelop access and HDMI-safe review.
const m09Student=read('v3/student-mission-nine.js');
const m09Foundations=read('v3/teacher-mission-nine-foundations.js');
const m09Validation=read('v3/teacher-mission-nine-validation.js');
const m09Css=read('v3/student-mission-nine.css');
assert(m09Foundations.includes('[3,3,16,3]'),'M09 teacher 3+3+16+3=25 minutes');
assert(m09Student.includes('PLAYTEST · 16 MINUTOS'),'M09 student playtest 16 min');
assert(m09Student.includes('Rodada A: 1 min hipótese/tarefa + 5 min teste + 2 min registro'),'M09 student first round 8 min');
assert(m09Student.includes('Rodada B: inverter os papéis e repetir os mesmos 8 min'),'M09 student second round 8 min');
assert(m09Foundations.includes('Rodada A (8 min)'),'M09 teacher round A 8 min');
assert(m09Foundations.includes('Rodada B (8 min)'),'M09 teacher round B 8 min');
assert(m09Student.includes("outcome:'',resolution:''"),'M09 must not preselect a fictitious issue or resolution');
assert(m09Student.includes("x.outcome=outcomes.includes(d.outcome)?d.outcome:''"),'M09 save must not inject issue by default');
assert(m09Student.includes("const resolutions=['fixed','backlog','nochange']"),'M09 allows honest no-defect playtest');
assert(m09Student.includes("d.outcome==='passed'&&d.resolution==='fixed'"),'M09 rejects fictitious correction of no-defect test');
assert(m09Student.includes("d.outcome==='issue'&&d.resolution==='nochange'"),'M09 requires backlog or fix for observed defect');
// The projected professor rubric must match all three student outcomes, including a genuine no-defect test.
assert(m09Validation.includes('A decisão pode ser correção retestada, backlog justificado ou nenhuma alteração após um teste sem falha.'),'M09 projected professor summary must allow no-defect outcome');
assert(m09Validation.includes('ausência de alteração justificada após teste sem falha'),'M09 private acceptance criteria must not reject a genuine no-defect playtest');
assert(m09Foundations.includes('nenhuma alteração quando o teste não encontrou falha'),'M09 projected protocol must include the no-defect branch');
assert(m09Foundations.includes('nenhuma alteração após teste sem falha'),'M09 projected output must describe no-change evidence');
assert(!m09Validation.includes('A decisão é correção testada ou backlog justificado.'),'M09 old two-option claim must not reappear');
assert(m09Student.includes('https://editor.gdevelop.io/'),'M09 student GDevelop editor handoff');
assert(m09Student.includes('não abre nem importa seu jogo automaticamente'),'M09 editor handoff must be honest');
assert(m09Student.includes('aplicativo GDevelop já instalado'),'M09 student offline fallback');
assert(m09Css.includes('.m9s-editor-handoff a:focus-visible'),'M09 editor link keyboard focus');
assert(!m09Student.includes('pit-private-teacher-notes'),'M09 student must not receive private notes');
assert.equal((m09Validation.match(/<details class="pit-private-teacher-notes">/g)||[]).length,2,'M09 teacher practice and review private panels');
assert.equal((m09Validation.match(/class="pit-private-teacher-notes-body"/g)||[]).length,2,'M09 panels share private notes styling');
assert(m09Validation.includes('aria-label="Abrir roteiro privado da avaliação da Missão 09"'),'M09 review private paper icon accessible');
assert(!m09Validation.includes('<details class="pit-private-teacher-notes" open'),'M09 private notes closed by default');
assert(m09Validation.indexOf('Depois de retirar o espelhamento')>m09Validation.indexOf('function review()'),'M09 review workflow is concealed');
assert(m09Student.includes('só declare')===false || m09Student.includes('após modificar'),'M09 cannot claim unobserved correction');

assert(m09Validation.includes('nenhuma mudança após teste sem falha'),'M09 projected practice must show the legitimate no-defect decision');
assert(!m09Validation.includes('solicite o Preview e confira o projeto editável'),'M09 projected footer must not contain teacher-only instructions');

// M10: self-guided launch, neutral shared tutorial, projector-safe teacher review.
const m10Student=read('v3/student-mission-ten.js');
const m10Guide=read('v3/gdevelop-mission-ten-guide.js');
const m10Teacher=read('v3/teacher-mission-ten-validation.js');
const m10Css=read('v3/student-mission-ten.css');
assert(m10Student.includes('https://editor.gdevelop.io/'),'M10 student has real editor handoff');
assert(m10Student.includes('não abre nem importa seu jogo automaticamente'),'M10 does not imply automatic project import');
assert(m10Student.includes('aplicativo GDevelop já instalado'),'M10 offline fallback exists');
assert(m10Css.includes('.m10s-editor-handoff a:focus-visible'),'M10 editor link keyboard focus');
assert(!m10Student.includes('pit-private-teacher-notes'),'M10 student must not receive teacher-only notes');
assert(m10Guide.includes('MISSÃO 10 · TUTORIAL DE ENTREGA · 3 MIN'),'M10 shared guide neutral heading');
assert(!m10Guide.includes('PROFESSOR · DEMONSTRAÇÃO'),'M10 shared guide cannot label student as teacher');
assert.equal((m10Teacher.match(/<details class="pit-private-teacher-notes">/g)||[]).length,2,'M10 teacher practice and review notes concealed');
assert.equal((m10Teacher.match(/class="pit-private-teacher-notes-body"/g)||[]).length,2,'M10 notes use shared CSS');
assert(m10Teacher.includes('aria-label="Abrir roteiro privado da avaliação da Missão 10"'),'M10 review icon accessible');
assert(!m10Teacher.includes('<details class="pit-private-teacher-notes" open'),'M10 private notes default closed');
assert(m10Teacher.includes('Depois de retirar o espelhamento HDMI'),'M10 assessment workflow kept private');

// M09→M10 cumulative contract: a successful peer test must not force a fictitious defect or AI use.
const legacyMissions=read('v2/missions.js');
assert(legacyMissions.includes('Identificação anônima do colega, observação real e decisão justificada'),'M09 legacy delivery must protect peer identity and support real outcomes');
assert(legacyMissions.includes('nenhuma alteração após teste sem falha'),'M09 legacy checklist accepts no-defect playtest');
assert(!legacyMissions.includes('Registre um problema encontrado e faça a correção possível'),'M09 legacy steps must not force a fictitious bug');
assert(legacyMissions.includes('decisão técnica (IA opcional)'),'M10 legacy pitch cannot require generative AI');
assert(!legacyMissions.includes('eu usei IA para'),'M10 legacy sample pitch must not require AI');
assert(m10Student.includes('Observação e decisão após o playtest'),'M10 student field accepts all legitimate M09 outcomes');
assert(m10Student.includes('correção retestada, backlog ou ausência de falha'),'M10 student presentation does not require a fictional correction');
assert(m10Teacher.includes('nenhuma alteração após teste sem falha'),'M10 projected teacher rubric recognizes a successful peer test');
assert(!m10Teacher.includes('correção testada ou backlog justificado.'),'M10 old two-outcome rubric must not reappear');

// M10 projected foundations and timed pitch must agree with M09's three honest
// outcomes. A peer test without a defect must not force a fictional correction.
const m10TeacherFoundations=read('v3/teacher-mission-ten-foundations.js');
const m10TeacherEnv={window:{}};
require('node:vm').runInNewContext(m10TeacherFoundations,m10TeacherEnv,{timeout:3000,filename:'teacher-mission-ten-foundations.js'});
const m10Projected=m10TeacherEnv.window.PIT_TEACHER_MISSION_TEN_FOUNDATIONS;
const m10ProjectedHtml=m10Projected.render();
for(const phrase of ['correção retestada','backlog justificado','nenhuma alteração após teste sem falha']){
 assert(m10ProjectedHtml.includes(phrase),'M10 projected pitch must accept '+phrase);
}
assert(m10Projected.concepts[2].body.includes('nenhuma alteração quando não houve falha'),'M10 technical concept must accept a no-defect playtest');
assert(!m10ProjectedHtml.includes('e uma correção da Missão 09'),'M10 projected foundations must not demand a fictional correction');
assert(!m10ProjectedHtml.includes('teste de colega e correção ou backlog'),'M10 timed pitch must not restrict peer-test outcomes');

assert(m10Guide.includes('nenhuma alteração após teste sem falha'),'M10 shared GDevelop guide keeps M09 tri-state outcome');

assert(m10Teacher.includes('CRITÉRIO PÚBLICO'),'M10 projected footer must state student-facing criteria');
assert(!m10Teacher.includes('registre aprovação ou devolutiva no painel de acompanhamento'),'M10 projected footer cannot expose teacher workflow');

// End-to-end source contract: every mission has student evidence and a private teacher practice guide.
const teacherValidation={
 4:'teacher-mission-four-validation',5:'teacher-mission-five-validation',
 6:'teacher-mission-six-validation',7:'teacher-mission-seven-validation',
 8:'teacher-mission-eight-validation',9:'teacher-mission-nine-validation',
 10:'teacher-mission-ten-validation'
};
for(let n=1;n<=10;n++){
 const studentSource=read('v3/'+files[n-1]+'.js');
 assert(studentSource.includes('evidence'),'M'+n+' must support student evidence');
 assert(studentSource.includes('submitWork')||n<=2,'M'+n+' must provide submit control');
}
for(const [number,name] of Object.entries(teacherValidation)){
 const source=read('v3/'+name+'.js');
 assert(source.includes('<details class="pit-private-teacher-notes">'),'M'+number+' must hide teacher facilitation');
 assert(source.includes('<summary'),'M'+number+' must provide a discreet notes control');
 assert(!source.includes('<details class="pit-private-teacher-notes" open'),'M'+number+' notes must default closed');
}
assert(teacher.includes('./v3/teacher-private-notes-guard.js'),'teacher must load notes guard');
assert(!student.includes('teacher-private-notes-guard.js'),'student must not load private notes guard');
const guard=read('v3/teacher-private-notes-guard.js');
assert(guard.includes("event.key==='Escape'"),'Escape must close private notes');
assert(guard.includes('visibilitychange'),'private notes must close on hidden tab');
// M10 route-aware handoff: the student must know exactly what to enter for local,
// exported Web and optional gd.games delivery; a typed note is not a valid public URL.
const vm=require('node:vm');
const draftStore=new Map(),sandbox={window:{},localStorage:{
 getItem:key=>draftStore.get(key)||null,setItem:(key,value)=>draftStore.set(key,value)
}};
vm.runInNewContext(m10Student,sandbox,{timeout:3000,filename:'student-mission-ten.js'});
const m10=sandbox.window.PIT_STUDENT_MISSION_TEN;
for(const route of ['local','web','gd']){
 assert(m10.accessHelp(route).length>65,'M10 route '+route+' explains what to fill');
 assert(m10.accessPlaceholder(route).length>12,'M10 route '+route+' gives a concrete example');
}
assert(m10.accessHelp('local').includes('Não invente URL'),'M10 local route must not suggest fabricated publication');
assert(m10.accessHelp('web').includes('servidor estático'),'M10 web route explains local execution');
assert(m10.accessHelp('gd').includes('sem login'),'M10 gd.games route requires unauthenticated check');
const launchHtml=m10.render({session:'m10-qa',idea:{title:'Projeto teste',genre:'RPG'},status:'draft',phase:'practice',canSubmit:true,preview:true});
assert(launchHtml.includes('id="m10sAccessHelp"'),'M10 route-specific hint visible beside access field');
assert(launchHtml.includes('aria-describedby="m10sAccessHelp"'),'M10 access hint accessible to screen readers');
assert(m10Student.includes('hint.textContent=accessHelp(id)'),'M10 hint updates when route changes');
const launchFixture={route:'gd',checks:[0,1,2]};
for(const f of m10.fields)launchFixture[f.id]='Resultado observado em teste real de projeto editável';
launchFixture.access='O jogo está na pasta do laboratório';
m10.save('m10-qa',launchFixture);
assert.equal(m10.validate('m10-qa').ok,false,'M10 gd route cannot accept a local-path description as URL');
launchFixture.access='https://gd.games/jogo-teste';
m10.save('m10-qa',launchFixture);
assert.equal(m10.validate('m10-qa').ok,true,'M10 gd route accepts a properly formatted URL');
launchFixture.access='https://gd.games/jogo-teste?token=segredo';
m10.save('m10-qa',launchFixture);
assert.equal(m10.validate('m10-qa').ok,false,'M10 must reject token-bearing URLs');
// M09 regression: a submitted/approved evidence record does not prove three real
// peer-test checkbox events. Hydration must restore text without fabricating them.
const m09RestoreStore=new Map(),m09RestoreSandbox={window:{},localStorage:{
 getItem:key=>m09RestoreStore.get(key)||null,
 setItem:(key,value)=>m09RestoreStore.set(key,value)
}};
vm.runInNewContext(m09Student,m09RestoreSandbox,{timeout:3000,filename:'student-mission-nine.js'});
const m09Restore=m09RestoreSandbox.window.PIT_STUDENT_MISSION_NINE;
const m09Fixture={outcome:'passed',resolution:'nochange',checks:[0,1,2]};
for(const f of m09Restore.fields)m09Fixture[f.id]='Observação fictícia de QA sem participante real';
m09Restore.save('m09-original',m09Fixture);
assert.equal(m09Restore.validate('m09-original').ok,true,'M09 QA fixture valid before evidence roundtrip');
const m09Evidence=m09Restore.evidence('m09-original');
m09Restore.hydrate('m09-recovered',m09Evidence,'approved');
const m09Recovered=m09Restore.load('m09-recovered');
assert.equal(m09Recovered.checks.length,0,'M09 restored status must not invent peer test confirmations');
assert.equal(m09Recovered.outcome,'passed','M09 restores genuine outcome text');
assert.equal(m09Recovered.resolution,'nochange','M09 restores genuine resolution text');
const m09Review=m09Restore.render({session:'m09-recovered',status:'approved',phase:'review',idea:{title:'QA fictícia'}});
assert(!m09Review.includes('Confirme os três passos realizados'),'M09 locked review must not claim missing checkmarks invalidate accepted evidence');
assert(m09Review.includes('disabled'),'M09 approved record stays read-only');
m09Restore.hydrate('m09-original',m09Evidence,'approved');
assert.equal(m09Restore.load('m09-original').checks.length,3,'M09 existing locally marked checks are not erased');
// M06/M07/M08/M10 integrity regression: remote evidence carries written answers but
// no trustworthy record of the three manual Preview checkboxes. A submission
// or approval status must never synthesize test execution on a new device.
for(const [number,source,globalName,warningClass] of [
 [6,m06Student,'PIT_STUDENT_MISSION_SIX','m6s-alert'],
 [7,m07Student,'PIT_STUDENT_MISSION_SEVEN','m7s-warning'],
 [8,m08Student,'PIT_STUDENT_MISSION_EIGHT','m8s-warning'],
 [10,m10Student,'PIT_STUDENT_MISSION_TEN','m10s-warning']
]){
 const store=new Map(),env={window:{},localStorage:{
  getItem:key=>store.get(key)||null,
  setItem:(key,value)=>store.set(key,value)
 }};
 vm.runInNewContext(source,env,{timeout:3000,filename:'student-mission-'+number+'.js'});
 const mod=env.window[globalName],draft={checks:[0,1,2]};
 for(const field of mod.fields)draft[field.id]='Registro de QA fictício, sem execução humana '+field.id;
 if(number===8){
  draft.before='ANTES: personagem sem indicador visual na cena';
  draft.after='DEPOIS: personagem com indicador visual na cena';
 }
 if(number===10)draft.route='local';
 assert(mod.save('original-'+number,draft),'M'+number+' fixture can be stored locally');
 assert.equal(mod.validate('original-'+number).ok,true,'M'+number+' original fixture passes form validation');
 const remoteText=mod.evidence('original-'+number);
 mod.hydrate('restored-'+number,remoteText,'approved');
 const recovered=mod.load('restored-'+number);
 assert.equal(recovered.checks.length,0,'M'+number+' approved status must not fabricate three manual Preview tests');
 assert.equal(recovered[mod.fields[0].id],draft[mod.fields[0].id],'M'+number+' preserves written evidence on restore');
 assert.equal(mod.validate('restored-'+number).ok,false,'M'+number+' new editable draft still requires manual test confirmation');
 const approved=mod.render({session:'restored-'+number,status:'approved',phase:'review',idea:{title:'Jogo fictício'},approvedStages:[],preview:true});
 assert(!approved.includes('class="'+warningClass+'"'),'M'+number+' approved read-only review must not display misleading missing-checkbox warning');
 assert(approved.includes('disabled'),'M'+number+' approved record cannot be resubmitted');
 const draftReview=mod.render({session:'restored-'+number,status:'draft',phase:'review',idea:{title:'Jogo fictício'},approvedStages:[],preview:true});
 assert(draftReview.includes('class="'+warningClass+'"'),'M'+number+' editable draft still warns about unchecked tests');
 mod.hydrate('original-'+number,remoteText,'approved');
 assert.equal(mod.load('original-'+number).checks.length,3,'M'+number+' preserves actual existing local checkbox declarations');
}
// M03-M05 regression: an approved/submitted text record cannot attest to
// three Preview tests. Existing local answers and manually marked checks win.
const earlyEvidenceFixtures=[
 [3,'student-mission-three','PIT_STUDENT_MISSION_THREE',{
  project:'Meu Jogo QA',scene:'Cena Inicial',object:'Heroi',objectType:'2D Sprite',
  source:'Desenho autoral',preview:'O objeto apareceu na cena de teste sem falhas',
  saved:'Pasta de projetos local',fix:'',checks:[0,1,2]
 },'Antes de enviar:'],
 [4,'student-mission-four','PIT_STUDENT_MISSION_FOUR',{
  route:0,command:'Setas e teclado',response:'O heroi moveu no Preview ao pressionar setas',
  boundary:'O heroi parou ao encontrar uma parede na cena',
  retest:'Repeti com as teclas soltas e nada se moveu',
  saved:'Projeto salvo na pasta local',issue:'',checks:[0,1,2]
 },'class="m4s-warning"'],
 [5,'student-mission-five','PIT_STUDENT_MISSION_FIVE',{
  route:0,condition:'SE o heroi tocar no cristal',action:'ENTAO somar um ponto e remover cristal',
  variable:'Score=0 depois 1',positive:'O placar aumentou de zero para um',
  negative:'Fora do cristal nao houve pontuacao',
  feedback:'O placar mudou ao coletar cristal',
  saved:'Projeto salvo na pasta local',issue:'',checks:[0,1,2]
 },'class="m5s-warning"']
];
for(const [number,filename,globalName,warning,] of earlyEvidenceFixtures.map(x=>[x[0],x[1],x[2],x[4]])){
 const fixture=earlyEvidenceFixtures.find(x=>x[0]===number)[3];
 const store=new Map(),env={window:{},localStorage:{
  getItem:k=>store.get(k)||null,setItem:(k,value)=>store.set(k,String(value))
 }};
 vm.runInNewContext(read('v3/'+filename+'.js'),env,{timeout:3000,filename:filename+'.js'});
 const mod=env.window[globalName],original='early-original-'+number,recovered='early-restored-'+number;
 mod.save(original,fixture);
 assert.equal(mod.validate(original).ok,true,'M'+number+' valid original fixture');
 const remote=mod.evidence(original,{idea:{title:'Jogo QA',genre:'RPG'}});
 mod.hydrate(recovered,remote,'approved');
 const restored=mod.load(recovered);
 assert.equal(restored.checks.length,0,'M'+number+' approved evidence cannot invent Preview checks');
 const firstField=number===3?'project':number===4?'command':'condition';
 assert.equal(restored[firstField],fixture[firstField],'M'+number+' restores actual written evidence');
 assert.equal(mod.validate(recovered).ok,false,'M'+number+' editable restored record requires manual confirmation');
 const approved=mod.render({session:recovered,status:'approved',phase:'review',idea:{title:'Jogo QA',genre:'RPG'},canSubmit:true,preview:true});
 assert(!approved.includes(warning),'M'+number+' locked review cannot display missing-check warning');
 assert(approved.includes('id="submitWork"')&&approved.includes('disabled'),'M'+number+' approved review stays locked');
 const draft=mod.render({session:recovered,status:'draft',phase:'review',idea:{title:'Jogo QA',genre:'RPG'},canSubmit:true,preview:true});
 assert(draft.includes(warning),'M'+number+' editable review still warns about incomplete tests');
 mod.hydrate(original,remote,'approved');
 assert.equal(mod.load(original).checks.length,3,'M'+number+' preserves locally marked test declarations');
 assert.equal(mod.load(original)[firstField],fixture[firstField],'M'+number+' preserves local written answers');
}
// M01-M02 are planning documents, not GDevelop Preview tests. Their evidence
// has no manual-test checkboxes, but partial remote records must not erase a
// complete local plan when a submitted/approved record is hydrated.
{
 const store=new Map(),env={window:{},localStorage:{
  getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))
 }};
 vm.runInNewContext(read('v3/mission-one.js'),env,{timeout:3000,filename:'mission-one.js'});
 const mod=env.window.PIT_MISSION_ONE;
 const draft={genre:'RPG',title:'Castelo QA',hero:'Uma guardia',action:'Coletar tres chaves',
  objective:'Destrancar a saida do castelo',victory:'Abrir o portao com tres chaves',
  feedback:'Exibir mensagem de vitoria'};
 const set=(id,data)=>env.localStorage.setItem('pit_v3_missao01_rascunho_'+id,JSON.stringify(data));
 set('m01-original',draft);
 assert.equal(mod.validate('m01-original').ok,true,'M01 complete original plan valid');
 const full=mod.evidence('m01-original');
 mod.hydrate('m01-restored',full,'approved');
 assert.equal(mod.validate('m01-restored').ok,true,'M01 complete approved plan restores');
 assert.equal(mod.load('m01-restored').feedback,draft.feedback,'M01 roundtrip retains feedback');
 const partial=full.replace('Feedback da conquista: '+draft.feedback,'Feedback da conquista: ');
 set('m01-original',draft);
 mod.hydrate('m01-original',partial,'approved');
 assert.equal(mod.load('m01-original').feedback,draft.feedback,'M01 partial approved evidence must not erase local feedback');
 mod.hydrate('m01-empty',partial,'submitted');
 assert.equal(mod.load('m01-empty').title,'','M01 partial submitted evidence cannot initialize an invalid plan');
 mod.hydrate('m01-original',full,'draft');
 assert.equal(mod.load('m01-original').title,draft.title,'M01 draft local work remains unchanged');
}
{
 const store=new Map(),env={window:{},localStorage:{
  getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))
 }};
 vm.runInNewContext(read('v3/student-mission-two.js'),env,{timeout:3000,filename:'student-mission-two.js'});
 const mod=env.window.PIT_STUDENT_MISSION_TWO;
 const draft={scene:'Uma sala do castelo',mechanic:'Coletar chaves e abrir a porta',
  elements:'Jogador, Chave, Porta',
  test:'Dado que tenho a chave, quando toco a porta, entao ela abre',
  later:'Efeitos e mapas adicionais'};
 mod.save('m02-original',draft);
 assert.equal(mod.validate('m02-original').ok,true,'M02 complete original MVP valid');
 const full=mod.evidence('m02-original',{title:'Castelo QA',genre:'RPG'});
 mod.hydrate('m02-restored',full,'approved');
 assert.equal(mod.validate('m02-restored').ok,true,'M02 complete approved MVP restores');
 assert.equal(mod.load('m02-restored').test,draft.test,'M02 roundtrip retains acceptance test');
 const partial=full.replace('Elementos: '+draft.elements,'Elementos: Jogador, Porta');
 mod.hydrate('m02-original',partial,'approved');
 assert.equal(mod.load('m02-original').elements,draft.elements,'M02 partial approved evidence must not erase local elements');
 mod.hydrate('m02-empty',partial,'submitted');
 assert.equal(mod.load('m02-empty').scene,'','M02 partial submitted evidence cannot initialize invalid MVP');
 mod.hydrate('m02-original',full,'draft');
 assert.equal(mod.load('m02-original').scene,draft.scene,'M02 draft local work remains unchanged');
 const noBacklog={...draft,later:''};
 mod.save('m02-no-backlog',noBacklog);
 const optionalRemote=mod.evidence('m02-no-backlog',{title:'Castelo QA',genre:'RPG'});
 assert(optionalRemote.includes('Depois: Não informado'),'M02 optional field serialized as explicitly not informed');
 mod.hydrate('m02-optional-restored',optionalRemote,'approved');
 assert.equal(mod.load('m02-optional-restored').later,'','M02 empty optional backlog remains empty after restore');
}
console.log('PASS AUD-02: student/teacher 10 missions wired; corrected M03/M07/M08 practice time; private M01–M03 notes collapsed; M09 custom demo; no fallback in audited routes.');

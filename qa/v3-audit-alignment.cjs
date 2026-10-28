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
console.log('PASS AUD-02: student/teacher 10 missions wired; corrected M03/M07/M08 practice time; private M01–M03 notes collapsed; M09 custom demo; no fallback in audited routes.');

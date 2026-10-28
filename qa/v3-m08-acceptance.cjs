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
const same={...d,after:d.before};
student.save('student-b',same);
assert.equal(student.validate('student-b').ok,false,'identical before and after rejected');
const rubric=ctx.window.PIT_TEACHER_MISSION_EIGHT_VALIDATION;
assert(rubric&&rubric.rubric.length===6,'teacher rubric covers six criteria');
assert(rubric.rubric.some(x=>/MOBILE/.test(x.title)),'mobile rubric');
assert(rubric.rubric.some(x=>/ACESSIBILIDADE/.test(x.title)),'accessibility rubric');
assert(rubric.rubric.some(x=>/DESEMPENHO/.test(x.title)),'performance rubric');
const page=fs.readFileSync('v3/app.js','utf8');
assert(page.includes('PIT_STUDENT_MISSION_EIGHT'),'M08 student wired into app');
assert(page.includes('PIT_TEACHER_MISSION_EIGHT_VALIDATION'),'M08 teacher wired into app');
console.log('PASS M08-04 automated: validation, isolation, before/after, negative, rubric and app wiring; physical device and actual GDevelop Preview NOT_RUN');

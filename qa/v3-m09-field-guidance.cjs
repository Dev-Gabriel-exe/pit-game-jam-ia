'use strict';
// M09 static+isolated JS checks; no actual peer playtest, GDevelop GUI or HDMI test.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const store=new Map();
const ctx={window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{}};
for(const f of ['v3/student-mission-nine.js','v3/teacher-mission-nine-validation.js'])
 vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const student=ctx.window.PIT_STUDENT_MISSION_NINE;
const teacher=ctx.window.PIT_TEACHER_MISSION_NINE_VALIDATION;
assert(student&&student.fields.length===9,'M09 nine evidence fields');
assert(teacher&&teacher.rubric.length===5,'M09 teacher review rubric');
const page=student.render({session:'student-a',phase:'practice',status:'',idea:{title:'Jogo de teste',genre:'puzzle'}});
for(const f of student.fields){
 assert(page.includes('id="m9s-help-'+f.id+'"'),'guidance exists for '+f.id);
 assert(page.includes('aria-describedby="m9s-help-'+f.id+'"'),'accessible guidance for '+f.id);
}
assert(!page.includes('pit-private-teacher-notes'),'private teacher notes not in student content');
assert(page.includes('Não grave nomes')&&page.includes('Preview'),'student instructions protect privacy and point to real Preview');
const css=fs.readFileSync('v3/student-mission-nine.css','utf8');
assert(css.includes('.m9s-field-hint'),'legible guidance CSS');
const blank=student.validate('student-a');
assert.equal(blank.ok,false,'blank student evidence not accepted');
const draft=student.load('student-a');
draft.outcome='issue';draft.resolution='backlog';draft.checks=[0,1,2];
for(const f of student.fields)draft[f.id]='Registro observado e justificativa verificável '+f.id;
assert(student.save('student-a',draft),'draft saved');
assert.equal(student.validate('student-a').ok,true,'valid structured draft passes client-side validation');
assert.equal(student.validate('student-b').ok,false,'student data isolated');
const ev=student.evidence('student-a');
assert(ev.includes('Observado:')&&ev.includes('Decisão:'),'structured evidence');
assert.equal(student.parseEvidence(ev).outcome,'issue','outcome roundtrip');
student.hydrate('student-c',ev,'submitted');
assert.equal(student.load('student-c').checks.length,0,'hydrated submission never fabricates manual peer checks');
const impossible={...draft,outcome:'passed',resolution:'fixed'};
student.save('student-d',impossible);
assert.equal(student.validate('student-d').ok,false,'no fake fix after passed test');
const teacherHtml=teacher.render('review');
assert(teacherHtml.includes('<details class="pit-private-teacher-notes">'),'teacher guidance stays in private details');
assert(!/<details class="pit-private-teacher-notes"[^>]*\bopen\b/.test(teacherHtml),'teacher details closed by default');
assert(teacherHtml.includes('<summary')&&teacherHtml.includes('▤'),'discreet private notes control');
const app=fs.readFileSync('v3/app.js','utf8');
assert(app.includes('PIT_STUDENT_MISSION_NINE')&&app.includes('PIT_TEACHER_MISSION_NINE_VALIDATION'),'M09 wired into both profiles');
console.log('PASS M09 field guidance, accessibility, isolation, evidence and private-notes static checks; human playtest NOT_RUN');

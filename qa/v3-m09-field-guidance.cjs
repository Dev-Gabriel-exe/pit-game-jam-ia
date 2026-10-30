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

// Legacy API flattened evidence into one line. It must not preselect an unverified peer outcome.
const legacy=ev.replace(/\r?\n/g,' ');
assert.equal(student.parseEvidence(legacy),null,'flattened M09 evidence is ambiguous');
const legacySize=store.size;
student.hydrate('legacy-student',legacy,'approved');
assert.equal(store.size,legacySize,'flattened M09 must not create a local draft');
assert.equal(student.load('legacy-student').outcome,'','no invented peer-test outcome');
assert.equal(student.load('legacy-student').resolution,'','no invented correction/backlog');
const truncated=ev.split('\n').slice(0,-1).join('\n');
assert.equal(student.parseEvidence(truncated),null,'incomplete structured evidence rejected');
student.hydrate('partial-student',truncated,'submitted');
assert.equal(store.size,legacySize,'partial M09 must not be persisted');
const wrongLabel=ev.replace('\nObservado:', '\nCampo estranho:');
assert.equal(student.parseEvidence(wrongLabel),null,'unknown label rejected');
const duplicate=ev.replace('\nObservado:', '\nEsperado:');
assert.equal(student.parseEvidence(duplicate),null,'duplicate field rejected');
assert.equal(student.parseEvidence(ev.replace('M09 | issue', 'M09 | unknown')),null,'unknown result rejected');

student.hydrate('student-c',ev,'submitted');
assert.equal(student.load('student-c').checks.length,0,'hydrated submission never fabricates manual peer checks');
const impossible={...draft,outcome:'passed',resolution:'fixed'};
student.save('student-d',impossible);
assert.equal(student.validate('student-d').ok,false,'no fake fix after passed test');
// The report must not claim backlog or a fix when the observed test had no failure.
for(const [outcome,resolution,accepted] of [
 ['issue','fixed',true],
 ['issue','backlog',true],
 ['issue','nochange',false],
 ['passed','fixed',false],
 ['passed','backlog',false],
 ['passed','nochange',true]
]){
 const session='m09-matrix-'+outcome+'-'+resolution;
 assert(student.save(session,{...draft,outcome,resolution}),'matrix draft saved');
 const verdict=student.validate(session);
 assert.equal(verdict.ok,accepted,'outcome/resolution consistency: '+outcome+'/'+resolution);
 if(!accepted)assert.equal(verdict.field,'resolution','focus contradictory decision');
}
assert(student.render({session:'student-a',phase:'practice',status:'',idea:{}}).includes('Se não houve falha, descreva a hipótese confirmada'),'student no-failure guidance');
const teacherHtml=teacher.render('review');
assert(teacherHtml.includes('<details class="pit-private-teacher-notes">'),'teacher guidance stays in private details');
assert(!/<details class="pit-private-teacher-notes"[^>]*\bopen\b/.test(teacherHtml),'teacher details closed by default');
assert(teacherHtml.includes('<summary')&&teacherHtml.includes('▤'),'discreet private notes control');
const app=fs.readFileSync('v3/app.js','utf8');
assert(app.includes('PIT_STUDENT_MISSION_NINE')&&app.includes('PIT_TEACHER_MISSION_NINE_VALIDATION'),'M09 wired into both profiles');
console.log('PASS M09 field guidance, accessibility, isolation, evidence and private-notes static checks; human playtest NOT_RUN');

'use strict';
// M10 student field guidance: isolated JS simulation, not a GDevelop/HDMI/human test.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const store=new Map(),ctx={window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{}};
for(const file of ['v3/student-mission-ten.js','v3/teacher-mission-ten-validation.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const student=ctx.window.PIT_STUDENT_MISSION_TEN,teacher=ctx.window.PIT_TEACHER_MISSION_TEN_VALIDATION;
assert.equal(student.fields.length,8);
const html=student.render({session:'student-a',phase:'practice',status:'',idea:{title:'Protótipo',genre:'puzzle'}});
for(const f of student.fields){
 const id=f.id==='access'?'m10sAccessHelp':'m10s-help-'+f.id;
 assert(html.includes('id="'+id+'"'),'field hint missing: '+f.id);
 assert(html.includes('aria-describedby="'+id+'"'),'accessible hint missing: '+f.id);
}
assert(!html.includes('pit-private-teacher-notes'),'private teacher notes must not appear for student');
assert(html.includes('Não registre senha')&&html.includes('Preview local'),'privacy and free fallback');
assert(fs.readFileSync('v3/student-mission-ten.css','utf8').includes('.m10s-field-hint'),'readable field hint style');
assert.equal(student.validate('student-a').ok,false,'empty evidence cannot be submitted');
const d=student.load('student-a');d.checks=[0,1,2];
for(const f of student.fields)d[f.id]='Registro real verificável do jogo e do teste '+f.id;
assert(student.save('student-a',d));
assert.equal(student.validate('student-a').ok,true,'client-side filled draft validation');
assert.equal(student.validate('student-b').ok,false,'session isolation');
const evidence=student.evidence('student-a');
assert.equal(student.parseEvidence(evidence).project,d.project,'structured evidence roundtrip');
student.hydrate('student-c',evidence,'submitted');
assert.equal(student.load('student-c').checks.length,0,'hydration cannot invent Preview checks');
for(const route of student.routes){
 assert(student.accessHelp(route).length>40,'route-specific access instruction '+route);
}
const review=teacher.render('review');
assert(review.includes('<details class="pit-private-teacher-notes">'),'teacher private notes retained');
assert(!/<details class="pit-private-teacher-notes"[^>]*\bopen\b/.test(review),'private notes closed by default');
assert(review.includes('<summary')&&review.includes('▤'),'discreet keyboard-accessible control');
const app=fs.readFileSync('v3/app.js','utf8');
assert(app.includes('PIT_STUDENT_MISSION_TEN')&&app.includes('PIT_TEACHER_MISSION_TEN_VALIDATION'),'both profiles wired');
console.log('PASS M10 accessible student guidance, privacy, persistence, isolated draft, teacher private notes; human/GDevelop/HDMI NOT_RUN');

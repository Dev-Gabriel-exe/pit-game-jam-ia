'use strict';
// M10 public professor/student alignment, not a physical GDevelop or HDMI test.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const store=new Map();
const ctx={window:{},document:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}};
for(const path of ['v3/student-mission-ten.js','v3/teacher-mission-ten-validation.js'])
 vm.runInNewContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const student=ctx.window.PIT_STUDENT_MISSION_TEN;
const teacher=ctx.window.PIT_TEACHER_MISSION_TEN_VALIDATION;
assert.equal(teacher.practiceFields.length,8,'eight student fields must be mirrored');
assert.equal(teacher.practiceChecks.length,3,'three manual checks must be mirrored');
assert.deepEqual(Array.from(teacher.practiceFields,field=>field[0]),Array.from(student.fields,field=>field.label),'same field labels and order');
const studentHtml=student.render({session:'test-alignment',phase:'practice',status:'',idea:{title:'Jogo de teste',genre:'puzzle'}});
const teacherHtml=teacher.render('practice');
for(const [label,hint] of teacher.practiceFields){
 assert(label.length>5&&hint.length>20,'teacher guidance must explain the field');
 assert(teacherHtml.includes(label),'teacher missing field '+label);
 assert(studentHtml.includes(label),'student missing field '+label);
}
for(const check of teacher.practiceChecks){
 assert(teacherHtml.includes(check),'teacher missing manual check');
 assert(studentHtml.includes(check),'student missing manual check');
}
assert.equal((teacherHtml.match(/REGISTROS \d–\d DE 8/g)||[]).length,4,'four projected pairs');
assert(teacherHtml.includes('t10v-practice-tests'),'public manual checks visible');
assert(teacherHtml.includes('<details class="pit-private-teacher-notes">'),'private notes retained');
assert(!/<details class="pit-private-teacher-notes"[^>]*\bopen\b/.test(teacherHtml),'private notes closed by default');
assert(!studentHtml.includes('pit-private-teacher-notes'),'no private notes in student material');
assert(!teacher.render('review').includes('t10v-practice-guide'),'review remains dedicated to rubric');
const projector=fs.readFileSync('v3/teacher-projector-m01.js','utf8');
assert(projector.includes("root.querySelector('#t10vRoot .t10v-practice-guide')"),'practice-specific projector route');
assert(projector.includes("wrapper.innerHTML=cleanCopy(node)"),'private notes sanitized');
assert(projector.includes("return result.length===8?result:null"),'eight public practice slides');
console.log('PASS M10: eight student fields, three manual checks, closed private notes, dedicated public projection; GDevelop/HDMI/human NOT_RUN');

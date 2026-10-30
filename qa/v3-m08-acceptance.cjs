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
const fakeRoot={
 querySelector:sel=>sel==='#g8Guide'?guideRoot:sel==='#m8sRouteTestPlan'?testPlan:null,
 querySelectorAll:()=>[]
};
ctx.document.querySelector=sel=>sel==='#m8sRoot'?fakeRoot:null;
ctx.window.PIT_GDEVELOP_M08_GUIDE={mount:(_guide,options)=>options.onRouteChange('3d')};
student.mount({phase:'practice',session:'student-route',status:'draft'});
assert.equal(student.load('student-route').route,'3d','route selection persisted by tutorial callback');
assert(testPlan.textContent.includes('colisão'),'negative-test prompt updates on route selection');

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
console.log('PASS M08-04 automated: validation, isolation, before/after, negative, rubric and app wiring; physical device and actual GDevelop Preview NOT_RUN');

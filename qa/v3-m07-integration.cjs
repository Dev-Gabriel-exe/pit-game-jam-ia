/* Execute: node qa/v3-m07-integration.cjs — offline, fictitious only */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const memory=new Map(),ctx={window:{},document:{},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}};
for(const file of ['v3/teacher-mission-seven-validation.js','v3/student-mission-seven.js','v3/teacher-mission-seven-foundations.js'])vm.runInNewContext(read(file),ctx,{filename:file});
const t=ctx.window.PIT_TEACHER_MISSION_SEVEN_VALIDATION,s=ctx.window.PIT_STUDENT_MISSION_SEVEN,f=ctx.window.PIT_TEACHER_MISSION_SEVEN_FOUNDATIONS;
assert.equal(t.rubric.length,6);
assert.ok(t.render('practice').includes('36 MINUTOS'));
assert.ok(t.render('review').includes('NÃO VENCE CEDO'));
const practice=t.render('practice'),review=t.render('review');
for(const [name,html] of [['practice',practice],['review',review]]){
 assert.match(html,/<details class="pit-private-teacher-notes">/,'M07 '+name+' has private guidance');
 assert.match(html,/class="pit-private-teacher-notes-body"/,'M07 '+name+' uses shared private styling');
 assert.doesNotMatch(html,/<details class="pit-private-teacher-notes" open/,'M07 '+name+' defaults closed');
}
assert.match(review,/aria-label="Abrir roteiro privado da avaliação da Missão 07"/);
assert.ok(review.indexOf('No acompanhamento, selecione')>review.indexOf('<details class="pit-private-teacher-notes">'));
assert.match(s.render({session:'ficticio',phase:'practice',status:'draft',canSubmit:true}),/https:\/\/editor\.gdevelop\.io\//);
assert.match(s.render({session:'ficticio',phase:'practice',status:'draft',canSubmit:true}),/não abre nem importa seu projeto automaticamente/);
assert.match(f.render(),/7 min/);
assert.match(f.render(),/4 min/);
assert.match(f.render(),/36 min/);
assert.equal(f.step(f.step(f.initial(),'start'),'door').phase,'JOGANDO');
assert.equal(f.step(f.step(f.step(f.initial(),'start'),'collect'),'door').phase,'VITÓRIA');
assert.equal(f.step(f.step(f.step(f.initial(),'start'),'damage'),'damage').phase,'DERROTA');
assert.equal(s.validate('ficticio').ok,false);
const d=s.load('ficticio');for(const x of s.fields)d[x.id]='Resultado observado e registrado '+x.id;d.checks=[0,1,2];s.save('ficticio',d);
assert.equal(s.validate('ficticio').ok,true);
assert.ok(s.evidence('ficticio').includes('Negativo:'));
assert.ok(s.render({session:'ficticio',phase:'review',status:'submitted',canSubmit:true}).includes('id="submitWork" disabled'));
const app=read('v3/app.js');new vm.Script(app);
assert.match(app,/teacherMissionSevenValidation=TEACHER&&m.n===7/);
assert.match(app,/PIT_STUDENT_MISSION_SEVEN.validate\(q.session\)/);
assert.match(app,/Prévia: conclusão registrada, sem envio/);
assert.ok(read('professor-v3.html').includes('teacher-mission-seven-validation.js'));
console.log('M07-04: offline teacher/student tests passed. API, browser and GDevelop E2E NOT executed.');

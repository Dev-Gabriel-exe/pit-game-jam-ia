'use strict';
// Targeted pre-class V3 regression. All inputs are static source and fictional
// DOM-rendered HTML; never signs in or writes classroom/XP/student data.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path');
function load(filename,api){
 const code=fs.readFileSync(path.join(__dirname,'../v3',filename),'utf8');
 const sandbox={window:{},document:{querySelector:()=>null},console};
 vm.runInNewContext(code,sandbox,{filename,timeout:5000});
 assert(sandbox.window[api]?.render,'Missing API '+filename);
 return {api:sandbox.window[api],code};
}
const five=load('teacher-mission-five-validation.js','PIT_TEACHER_MISSION_FIVE_VALIDATION');
const six=load('teacher-mission-six-foundations.js','PIT_TEACHER_MISSION_SIX_FOUNDATIONS');
const eight=load('teacher-mission-eight-validation.js','PIT_TEACHER_MISSION_EIGHT_VALIDATION');
const ten=load('gdevelop-mission-ten-guide.js','PIT_GDEVELOP_M10_GUIDE');

assert(five.api.render('practice').includes('t5v-root'));
const fiveReview=five.api.render('review');
assert(fiveReview.includes('<strong>V</strong>'),'M05 chapter is V, not IV');
assert(fiveReview.includes('VERIFICAÇÃO NO PAINEL'));
assert(fiveReview.includes('pit-private-teacher-notes'));
assert(fiveReview.includes('sem espelhamento'),'M05 personal review directions hidden behind paper control');
assert(!fiveReview.includes('<details class="pit-private-teacher-notes" open'),'M05 private notes must start closed');
assert(/function mount\(rootOverride\)/.test(five.code),'Preserve main modular mount(rootOverride)');

const sixPresentation=six.api.render();
assert(sixPresentation.includes('SE NÃO APARECER NO PREVIEW'));
for(const x of ['1 · ARQUIVO','2 · OBJETO E CENA','3 · TESTE ISOLADO'])assert(sixPresentation.includes(x),'M06 diagnostic missing '+x);
assert(sixPresentation.includes('ROTEIRO RESERVADO'));
assert(sixPresentation.includes('pit-private-teacher-notes'));
assert(!sixPresentation.includes('<details class="pit-private-teacher-notes" open'),'M06 guide private by default');
assert(/function mount\(rootOverride\)/.test(six.code),'Preserve main M06 mount(rootOverride)');
assert.equal(six.api.assets.length,4,'Four existing M06 asset formats must be preserved');

const eightPractice=eight.api.render('practice'),eightReview=eight.api.render('review');
assert(eightReview.includes('LEGIBILIDADE NA TELA-ALVO'),'M08 target screen check');
assert(eightReview.includes('Teste em celular físico não é requisito'),'No invented mobile test obligation');
assert(eightReview.includes('projeto editável reaberto'),'M08 evidence traces same source');
assert(eightReview.includes('pit-private-teacher-notes'),'M08 private review guidance');
assert(eightPractice.includes('pit-private-teacher-notes'));
assert(!eightReview.includes('<details class="pit-private-teacher-notes" open'));
assert(!eightPractice.includes('<details class="pit-private-teacher-notes" open'));

const tenGuide=ten.api.render();
assert(tenGuide.includes('MISSÃO 10 · TUTORIAL DE ENTREGA'),'M10 header must not say professor on student tutorial');
assert(!tenGuide.includes('MISSÃO 10 · PROFESSOR · DEMONSTRAÇÃO'));
assert.equal(ten.api.routes.length,3,'three free/publication options unchanged');
for(const route of ten.api.routes){
 assert.equal(route.steps.length,4,'original tutorial step count');
 const retest=route.steps[1];
 assert.match(retest.where,/Reabra a cópia editável salva/);
 assert.match(retest.do,/correção retestada, backlog justificado ou nenhuma alteração/);
 assert.match(retest.result,/foi reaberto/);
}
const app=fs.readFileSync(path.join(__dirname,'../v3/app.js'),'utf8');
assert(app.includes('teacherMissionTenValidation?'),'existing M10 review shell preserved');
console.log('PASS V3 pre-aula: M05 chapter/privacy; M06 GDevelop import/Preview; M08 target screen/private rubric; M10 reopen saved project x3, unchanged student/teacher hub contracts');

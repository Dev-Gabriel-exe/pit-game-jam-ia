/* Execute: node qa/v3-m06-student.cjs — alunos fictícios; sem rede */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const memory=new Map(),storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
const context={window:{},localStorage:storage,document:{}};
vm.runInNewContext(read('v3/student-mission-six.js'),context);
const m=context.window.PIT_STUDENT_MISSION_SIX;
assert.equal(m.fields.length,8);assert.equal(m.routes.length,5);
assert.equal(m.validate('ficticio-A').ok,false);
const d=m.load('ficticio-A');for(const f of m.fields)d[f.id]='Resultado observado e descrito '+f.id;
d.checks=[0,1,2];d.route='model';m.save('ficticio-A',d);
assert.equal(m.validate('ficticio-A').ok,true);
assert.equal(m.load('ficticio-B').file,'');
assert.equal(m.load('ficticio-A').route,'model');
const evidence=m.evidence('ficticio-A');
assert.ok(evidence.includes('Licença:')&&evidence.includes('Teste negativo:'));
assert.equal(m.parseEvidence(evidence).route,'model');
m.hydrate('ficticio-C',evidence,'submitted');
assert.equal(m.load('ficticio-C').route,'model');
assert.equal(m.load('ficticio-C').checks.length,0,'remote submission must not invent Preview checks');
m.hydrate('ficticio-A','M06 | image\nAsset: sobrescrito','submitted');
assert.equal(m.load('ficticio-A').route,'model');
const bad=m.load('ficticio-A');bad.after='curto';m.save('ficticio-A',bad);
assert.equal(m.validate('ficticio-A').field,'after');
m.save('ficticio-A',d);
const max=m.load('ficticio-A');for(const f of m.fields)max[f.id]='X'.repeat(f.max);m.save('max',max);
assert.ok(m.evidence('max').length<=750);
assert.equal(m.parseEvidence(m.evidence('max')).saved.length,65);
// Historical API flattened LF separators. Reject partial, duplicated, unknown and invalid evidence.
const good=m.evidence('ficticio-A');
const lines=good.split('\\n');
const corrupt=[
 good.replace(/\\n/g,' '),
 lines.slice(0,-1).join('\\n'),
 good+'\\nExtra: inválido',
 good.replace('M06 | model','M06 | outra'),
 good.replace('Asset: ','Necessidade: '),
 good.replace('Asset: ','Campo desconhecido: '),
 good.replace(/Asset: [^\\n]*/,'Asset: x'),
 good.replace(/Asset: [^\\n]*/,'Asset: '+'x'.repeat(66))
];
for(const [index,e] of corrupt.entries())assert.equal(m.parseEvidence(e),null,'M06 corrupted evidence '+index);
m.hydrate('ficticio-legado',corrupt[0],'approved');
assert.equal(m.load('ficticio-legado').need,'','Flattened evidence must not hydrate an apparent submission');
m.hydrate('ficticio-legado',good,'approved');
assert.equal(m.load('ficticio-legado').route,'model','Valid evidence can hydrate');
assert.equal(m.load('ficticio-legado').checks.length,0,'Hydration must not invent manual tests');
const app=read('v3/app.js'),html=read('aluno-v3.html'),css=read('v3/student-mission-six.css');
new vm.Script(app);
assert.match(app,/const pilotSix=!TEACHER&&activeStage===6/);
assert.match(app,/PIT_STUDENT_MISSION_SIX.evidence\(q.session\)/);
assert.ok(html.indexOf('student-mission-six.js')<html.indexOf('v3/app.js'));
assert.match(css,/:focus-visible/);
console.log('M06-04: asserções de isolamento, evidência, validação e integração aprovadas; navegador/API/GDevelop pendentes.');

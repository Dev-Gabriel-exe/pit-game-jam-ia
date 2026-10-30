'use strict';
// Regression for historical evidence saved before API preserved LF separators.
// Does not touch student data, a real database, or the network.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('v3/app.js','utf8');
const start=src.indexOf('function legacyEvidenceNotice('),end=src.indexOf('\nfunction renderMain()',start);
assert(start>=0&&end>start,'Read-only historical evidence notice must exist');
assert(src.includes("if(!TEACHER&&!visualPreview){const warning=legacyEvidenceNotice(e,m.n)"),'Notice must be mounted only for student, not projected teacher');
assert(src.includes("insertAdjacentHTML('afterbegin',warning)"),'Notice must be visible before mission form');
const code=src.slice(start,end);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const create=(TEACHER=false,visualPreview=false)=>{
 const sandbox={TEACHER,visualPreview,esc};
 vm.runInNewContext(code+';this.inspect=legacyEvidenceNotice;',sandbox,{timeout:2000});
 return sandbox.inspect;
};
const student=create(),teacher=create(true),preview=create(false,true);
let cases=0;
for(let stage=1;stage<=10;stage++){
 const code=String(stage).padStart(2,'0');
 const prefix=stage<=3?'MISSÃO '+code+' — ':'M'+code+' | ';
 const legacy=prefix+' Rota: <img src=x onerror=alert(1)> Ação: teste sem quebras de linha';
 const record={evidence:legacy,status:'approved'};
 const before=JSON.stringify(record);
 const html=student(record,stage);
 assert(html.includes('Registro histórico: recuperação parcial'),code);
 assert(html.includes('Ver texto original da entrega'),code);
 assert(html.includes('&lt;img')&&!html.includes('<img'),code+' XSS');
 assert(!html.includes('pit-private-teacher-notes'),code+' teacher notes');
 assert.equal(JSON.stringify(record),before,code+' must not mutate record');
 assert.equal(teacher(record,stage),'',code+' teacher');
 assert.equal(preview(record,stage),'',code+' preview');
 assert.equal(student(record,stage===10?9:stage+1),'',code+' other mission');
 assert.equal(student({evidence:legacy.replace(' Ação: ','\nAção: ')},stage),'',code+' structured LF');
 assert.equal(student({evidence:legacy.replace(' Ação: ','\r\nAção: ')},stage),'',code+' structured CRLF');
 cases+=10;
}
assert.equal(student({evidence:'registro livre de atividade sem estrutura'},1),'');
assert.equal(student({evidence:''},1),'');
assert.equal(student(null,1),'');
console.log('PASS: '+cases+' legacy-evidence checks across M01–M10; read-only, escaped, no false warnings for structured submissions.');

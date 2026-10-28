/* Execute: node qa/v3-m08-foundations.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const ctx={window:{},document:{}};vm.runInNewContext(read('v3/teacher-mission-eight-foundations.js'),ctx);
const m=ctx.window.PIT_TEACHER_MISSION_EIGHT_FOUNDATIONS;
assert.equal(m.concepts.length,6);
for(const name of ['AFFORDANCE','INSTRUÇÃO','HUD','CONTRASTE','RESPOSTA AO INPUT','ERRO RECUPERÁVEL'])assert.ok(m.concepts.some(x=>x[0]===name));
assert.equal(m.feedback('raw','door').status,'SEM FEEDBACK');
assert.match(m.feedback('polished','door').message,/chave/);
assert.match(m.feedback('polished','item').message,/HUD/);
assert.match(m.render(),/aria-live="polite"/);
const app=read('v3/app.js'),html=read('professor-v3.html'),css=read('v3/teacher-mission-eight-foundations.css');
new vm.Script(app);assert.match(app,/teacherMissionEightBriefing=TEACHER&&m.n===8&&activePhase==='briefing'/);
assert.ok(html.indexOf('teacher-mission-eight-foundations.js')<html.indexOf('v3/app.js'));
assert.match(css,/prefers-reduced-motion:reduce/);
console.log('M08-01: UX model and static integration passed; no real browser/GDevelop execution.');

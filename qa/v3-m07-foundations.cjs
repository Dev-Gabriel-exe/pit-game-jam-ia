/* Execute: node qa/v3-m07-foundations.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const context={window:{},document:{}};vm.runInNewContext(read('v3/teacher-mission-seven-foundations.js'),context);
const m=context.window.PIT_TEACHER_MISSION_SEVEN_FOUNDATIONS;
let s=m.initial();assert.equal(s.phase,'MENU');assert.equal(m.step(s,'door').phase,'MENU');
s=m.step(s,'start');assert.equal(s.phase,'JOGANDO');assert.equal(m.step(s,'door').phase,'JOGANDO');
s=m.step(s,'collect');assert.equal(s.key,true);
s=m.step(s,'door');assert.equal(s.phase,'VITÓRIA');assert.equal(m.step(s,'damage').lives,2);
let d=m.step(m.step(m.step(m.initial(),'start'),'damage'),'damage');
assert.equal(d.phase,'DERROTA');assert.equal(d.lives,0);assert.equal(m.step(d,'collect').key,false);
assert.equal(m.step(d,'reset').phase,'MENU');
assert.equal(m.cases.length,4);assert.match(m.render(),/aria-live="polite"/);
const app=read('v3/app.js'),html=read('professor-v3.html');
new vm.Script(app);
assert.match(app,/teacherMissionSevenBriefing=TEACHER&&m.n===7&&activePhase==='briefing'/);
assert.ok(html.indexOf('teacher-mission-seven-foundations.js')<html.indexOf('v3/app.js'));
console.log('M07-01: state machine and integration checks passed; GDevelop/browser E2E pending.');

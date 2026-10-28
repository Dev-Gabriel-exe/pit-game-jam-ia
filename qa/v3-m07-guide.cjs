/* Execute: node qa/v3-m07-guide.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const context={window:{},document:{}};vm.runInNewContext(read('v3/gdevelop-mission-seven-guide.js'),context);
const m=context.window.PIT_GDEVELOP_M07_GUIDE;
assert.equal(m.routes.length,2);assert.ok(m.routes.every(x=>x.steps.length===4));
assert.ok(m.routes.every(x=>x.steps[0].title.includes('inicial')));
assert.ok(m.routes[0].steps[2].where.includes('TemChave = 1'));
assert.ok(m.routes[1].steps[2].where.includes('Physics 3D'));
assert.ok(m.routes[1].steps[2].fix.includes('Collision 2D'));
assert.ok(m.routes.every(x=>x.steps.every(y=>y.source.startsWith('https://wiki.gdevelop.io/'))));
assert.match(m.render(),/role="tablist"/);
const app=read('v3/app.js'),html=read('professor-v3.html');
new vm.Script(app);assert.match(app,/teacherMissionSevenDemo=TEACHER&&m.n===7&&activePhase==='demo'/);
assert.ok(html.indexOf('gdevelop-mission-seven-guide.js')<html.indexOf('v3/app.js'));
const css=read('v3/gdevelop-mission-seven-guide.css');
assert.match(css,/@media\(max-width:700px\)/);assert.match(css,/prefers-reduced-motion:reduce/);
console.log('M07-02: tutorial route and integration checks passed; no real GDevelop execution.');

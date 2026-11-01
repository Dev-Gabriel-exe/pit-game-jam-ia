'use strict';
// M06 pedagogical regression: fictional drafts and simulated DOM only.
// Run: node qa/v3-m06-regression.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('v3/student-mission-six.js','utf8');
const teacherSource=fs.readFileSync('v3/teacher-mission-six-validation.js','utf8');
const cache=new Map(),window={};
const localStorage={getItem:k=>cache.has(k)?cache.get(k):null,setItem:(k,v)=>cache.set(k,String(v))};
vm.runInNewContext(source,{window,localStorage,document:{}},{filename:'student-mission-six.js',timeout:3000});
vm.runInNewContext(teacherSource,{window,document:{}},{filename:'teacher-mission-six-validation.js',timeout:3000});
const M=window.PIT_STUDENT_MISSION_SIX,T=window.PIT_TEACHER_MISSION_SIX_VALIDATION;
let assertions=0;
function check(value,message){assert.ok(value,message);assertions++}
const good={route:'image',checks:[0,1,2]};
for(const f of M.fields)good[f.id]='Registro demonstrável para '+f.id;
M.save('valid',good);
check(M.validate('valid').ok,'Valid evidence accepted');
check(M.evidence('valid').length<=750,'Valid evidence within API budget');
check(M.parseEvidence(M.evidence('valid'))?.need===good.need,'Structured evidence remains parseable');
for(const f of M.fields){
 const session='oversized-'+f.id,original='X'.repeat(f.max+1);
 M.save(session,{...good,[f.id]:original});
 check(M.load(session)[f.id]===original,'No silent truncation of '+f.id);
 const v=M.validate(session);
 check(!v.ok&&v.field===f.id&&v.label.includes(String(f.max)),'Field limit reported for '+f.id);
 check(M.render({session,phase:'review',status:'draft',canSubmit:true,preview:true,idea:{}}).includes('id="submitWork" disabled'),
  'Oversized '+f.id+' cannot submit');
}
const historical='L'.repeat(200);
cache.set('pit_v3_m06_legacy',JSON.stringify({...good,need:historical}));
const draft=M.load('legacy');
check(draft.need===historical,'Legacy text preserved on load');
check(M.selectRoute(draft,'model')&&draft.checks.length===0,'Changing route clears Preview declarations');
check(draft.need===historical,'Route switch retains authored text');
M.save('legacy',draft);
check(M.load('legacy').need===historical,'Route switch and save never truncate legacy text');
check(!M.validate('legacy').ok,'Oversized historical draft remains invalid');
draft.checks=[0,1,2];
check(!M.selectRoute(draft,'model')&&draft.checks.length===3,'Same route is idempotent');
check(!M.selectRoute(draft,'unknown')&&draft.checks.length===3,'Invalid route rejected');
const max={...good};
for(const f of M.fields)max[f.id]='X'.repeat(f.max);
M.save('max',max);
check(M.validate('max').ok,'At-limit fields remain valid');
check(M.evidence('max').length<=750&&M.parseEvidence(M.evidence('max'))!==null,
 'At-limit evidence is complete, not silently cut');
const checks=[0,1,2].map(()=>({checked:true,addEventListener(){}}));
const status={textContent:''},select={value:'model',listeners:{},addEventListener(n,fn){this.listeners[n]=fn}};
const guide={querySelector:s=>s==='#f6tRoute'?select:null};
const root={
 querySelector:s=>s==='#f6Tutorial'?guide:s==='#m6sSaveStatus'?status:null,
 querySelectorAll:s=>s==='[data-m6s-check]'?checks:[]
};
const document={querySelector:s=>s==='#m6sRoot'?root:null};
const uiWindow={PIT_ASSET_FORGE_TUTORIAL:{mount(){}}};
vm.runInNewContext(source,{window:uiWindow,localStorage,document},{timeout:3000});
const UI=uiWindow.PIT_STUDENT_MISSION_SIX;
UI.save('ui',good);
UI.mount({session:'ui',phase:'practice',status:'draft'});
select.listeners.change();
check(UI.load('ui').route==='model'&&UI.load('ui').checks.length===0,
 'UI persists new route and invalidates old checks');
check(checks.every(c=>!c.checked),'UI unchecks all visible declarations');
check(status.textContent.includes('repita os três testes')&&status.textContent.includes('Rascunho salvo'),
 'UI announces retest and draft persistence');
check(!UI.validate('ui').ok,'New route cannot submit without fresh Preview checks');
const denied={getItem(){throw Error('SecurityError')},setItem(){throw Error('QuotaExceededError')}};
const offlineWindow={};
vm.runInNewContext(source,{window:offlineWindow,localStorage:denied,document:{}},{timeout:3000});
const Offline=offlineWindow.PIT_STUDENT_MISSION_SIX;
check(Offline.save('offline',{...good,need:historical})===false,'Storage failure reported');
check(Offline.load('offline').need===historical,'Offline in-tab draft not truncated');
check(Offline.load('other').need==='','Offline drafts isolated by session');
check(Offline.draftNotice('offline').includes('apenas nesta aba'),'Offline warning visible');
const teacher=T.render();
check(teacher.includes('<details class="pit-private-teacher-notes">'),'Teacher notes are collapsed details');
check(!/<details class="pit-private-teacher-notes"[^>]*\sopen(?:\s|=|>)/.test(teacher),
 'Teacher notes never auto-open');
check(!M.render({session:'valid',phase:'practice',status:'draft',idea:{}}).includes('pit-private-teacher-notes'),
 'Student does not receive private teacher notes');
console.log('PASS M06 regression: '+assertions+' assertions; no real GDevelop/HDMI/human tests');

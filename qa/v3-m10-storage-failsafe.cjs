'use strict';
// M10 blocked-storage regression with fictional projects only. No GDevelop, HDMI or human testing.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('v3/student-mission-ten.js','utf8');
const ctx={window:{},document:{},localStorage:{
 getItem(){throw Error('SecurityError: storage disabled')},
 setItem(){throw Error('QuotaExceededError: storage disabled')}
}};
vm.runInNewContext(source,ctx,{filename:'v3/student-mission-ten.js'});
const m=ctx.window.PIT_STUDENT_MISSION_TEN;
assert(m&&typeof m.draftNotice==='function','draft warning must be exported');
const id='fictional-launch-a';
const draft=m.load(id);
draft.route='local';draft.checks=[0,1,2];
for(const f of m.fields)draft[f.id]='Projeto fictício testado apenas em simulação '+f.id;
assert.equal(m.save(id,draft),false,'blocked storage must report failure');
const recovered=m.load(id);
assert.equal(recovered.route,'local','route stays in current tab');
assert.equal(recovered.checks.length,3,'manual checks stay in current tab');
for(const f of m.fields)assert.equal(recovered[f.id],draft[f.id],'field survives navigation '+f.id);
assert.equal(m.validate(id).ok,true,'fictional complete record survives blocked storage');
assert(m.evidence(id).includes('Projeto: '),'report remains available to copy');
assert(m.draftNotice(id).includes('apenas nesta aba'),'must not claim permanent saving');
const practice=m.render({session:id,phase:'practice',status:'',idea:{}});
assert(practice.includes('apenas nesta aba'),'practice shows storage warning');
assert(practice.includes('data-m10s-field="pitch"'),'practice retains eight-field form');
assert(!practice.includes('pit-private-teacher-notes'),'student must not show private teacher notes');
const review=m.render({session:id,phase:'review',status:'',idea:{},canSubmit:true});
assert(review.includes('Copie a ficha de lançamento acima'),'review warns before leaving');
assert(review.includes('id="submitWork"'),'review still exposes normal submission');
assert.equal(m.load('fictional-launch-b').pitch,'','other session isolated');
assert.equal(m.validate('fictional-launch-b').ok,false,'other session cannot inherit launch claims');
const partial=m.load('fictional-partial');
partial.checks=[0,2];partial.route='web';
assert.equal(m.save('fictional-partial',partial),false,'partial save reports failure');
m.hydrate('fictional-partial',m.evidence(id),'approved');
assert.equal(m.load('fictional-partial').route,'web','remote hydration cannot overwrite partial route');
assert.equal(m.load('fictional-partial').checks.length,2,'remote hydration cannot overwrite partial checks');
assert.equal(m.load('fictional-partial').pitch,'','remote hydration cannot overwrite partial record');
m.hydrate('fictional-hydrated',m.evidence(id),'submitted');
assert.equal(m.load('fictional-hydrated').pitch,draft.pitch,'structured historical report may hydrate');
assert.equal(m.load('fictional-hydrated').checks.length,0,'historical report never fabricates manual checks');
const routeDraft=m.load(id);
assert.equal(m.switchRoute(routeDraft,'gd'),true,'route changes');
assert.equal(routeDraft.access,'','old access must be cleared');
assert.deepEqual(Array.from(routeDraft.checks),[0],'route change invalidates execution/access checks');
assert.equal(m.save(id,routeDraft),false,'changed route still stored in tab');
assert.equal(m.load(id).route,'gd','changed route persists in volatile memory');
assert.equal(m.validate(id).ok,false,'old delivery evidence cannot be submitted');
const status={textContent:''},listeners={};
const input={dataset:{m10sField:'pitch'},value:'Experiência fictícia após evento',addEventListener:(type,fn)=>{listeners.input=fn}};
const check={checked:true,dataset:{m10sCheck:'1'},addEventListener:(type,fn)=>{listeners.check=fn}};
const root={
 querySelectorAll(sel){if(sel==='[data-m10s-field]')return [input];if(sel==='[data-m10s-check]')return [check];return []},
 querySelector(sel){return sel==='#m10sStatus'?status:null}
};
ctx.document.querySelector=sel=>sel==='#m10sRoot'?root:null;
m.mount({session:'fictional-ui',status:'',phase:'practice',onPhase(){},onMessage(){}});
listeners.input();
assert(status.textContent.includes('apenas nesta aba'),'typing shows blocked-storage warning');
listeners.check();
assert(status.textContent.includes('apenas nesta aba'),'checkbox shows blocked-storage warning');
assert.equal(m.load('fictional-ui').pitch,input.value,'typed field preserved in tab');
assert.deepEqual(Array.from(m.load('fictional-ui').checks),[1],'checkbox preserved in tab');
// Changing a real launch artifact invalidates only the attestations affected by that change.
const changed=m.load('fictional-check-revision');
changed.checks=[0,1,2];
assert.deepEqual(Array.from(m.updateField(changed,'project','Outra cópia editável e assets')),[0,1,2],'new project requires all three rechecks');
assert.deepEqual(Array.from(changed.checks),[],'old project confirmations cleared');
changed.checks=[0,1,2];
assert.deepEqual(Array.from(m.updateField(changed,'access','Outro link ou pasta')),[1,2],'new access requires execution/privacy recheck');
assert.deepEqual(Array.from(changed.checks),[0],'project re-open confirmation remains valid');
changed.checks=[0,1,2];
assert.deepEqual(Array.from(m.updateField(changed,'demo','Outra sequência no Preview')),[1],'new demonstration requires execution recheck');
assert.deepEqual(Array.from(changed.checks),[0,2],'unrelated checks remain valid');
assert.deepEqual(Array.from(m.updateField(changed,'demo','Outra sequência no Preview')),[],'same value is idempotent');
assert.deepEqual(Array.from(m.updateField(changed,'pitch','Outro público autoral')),[],'pitch edit does not erase real checks');
assert.deepEqual(Array.from(m.updateField(changed,'invalid','texto')),[],'unknown field cannot mutate draft');
const revised=m.load('fictional-revision-ui');
revised.checks=[0,1,2];m.save('fictional-revision-ui',revised);
const listeners2={},checks2=[0,1,2].map(n=>({dataset:{m10sCheck:String(n)},checked:true,addEventListener(){}}));
const projectInput={dataset:{m10sField:'project'},value:'Nova pasta do projeto completo',addEventListener:(type,fn)=>{if(type==='input')listeners2.input=fn}};
const status2={textContent:''};
const root2={
 querySelectorAll(sel){if(sel==='[data-m10s-field]')return [projectInput];if(sel==='[data-m10s-check]')return checks2;return []},
 querySelector(sel){return sel==='#m10sStatus'?status2:null}
};
ctx.document.querySelector=sel=>sel==='#m10sRoot'?root2:null;
m.mount({session:'fictional-revision-ui',status:'',phase:'practice',onPhase(){},onMessage(){}});
listeners2.input();
assert.deepEqual(checks2.map(x=>x.checked),[false,false,false],'visible checkboxes reset with project change');
assert.equal(m.load('fictional-revision-ui').checks.length,0,'reset persisted even when localStorage denied');
assert(status2.textContent.includes('repita as conferências'),'student gets explicit retest warning');
assert(status2.textContent.includes('apenas nesta aba'),'storage failure remains visible');
console.log('PASS M10 blocked-storage: eight fields, delivery route, manual checks, session isolation, hydration, warning and simulated UI. Human/GDevelop/HDMI NOT_RUN.');

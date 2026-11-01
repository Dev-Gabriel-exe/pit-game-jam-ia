'use strict';
// M09 blocked-storage regression with fictional sessions; no real peer test or GDevelop execution.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('v3/student-mission-nine.js','utf8');
const ctx={window:{},document:{},localStorage:{
 getItem(){throw Error('SecurityError: storage disabled')},
 setItem(){throw Error('QuotaExceededError: storage disabled')}
}};
vm.runInNewContext(source,ctx,{filename:'v3/student-mission-nine.js'});
const m=ctx.window.PIT_STUDENT_MISSION_NINE;
assert(m&&typeof m.draftNotice==='function','draft warning must be exported');
const id='fictional-a';
const draft=m.load(id);
draft.outcome='issue';draft.resolution='backlog';draft.checks=[0,1,2];
for(const f of m.fields)draft[f.id]=f.id==='peer'?'Colega A fictício':'Observação real simulada apenas para teste '+f.id;
assert.equal(m.save(id,draft),false,'blocked storage must report failure');
const recovered=m.load(id);
assert.equal(recovered.outcome,'issue','outcome stays in current tab');
assert.equal(recovered.resolution,'backlog','decision stays in current tab');
assert.equal(recovered.checks.length,3,'manual checks stay in current tab');
for(const f of m.fields)assert.equal(recovered[f.id],draft[f.id],'field survives navigation '+f.id);
assert.equal(m.validate(id).ok,true,'valid fictional report survives storage failure');
assert(m.evidence(id).includes('Observado: '),'report remains available to copy');
assert(m.draftNotice(id).includes('apenas nesta aba'),'must not claim permanent saving');
const practice=m.render({session:id,phase:'practice',status:'',idea:{}});
assert(practice.includes('apenas nesta aba'),'practice shows storage warning');
assert(practice.includes('data-m9s-field="observed"'),'practice retains form');
assert(!practice.includes('pit-private-teacher-notes'),'student must not show private teacher notes');
const review=m.render({session:id,phase:'review',status:'',idea:{},canSubmit:true});
assert(review.includes('Copie o relatório acima'),'review must warn before leaving');
assert(review.includes('id="submitWork"'),'review still exposes normal submission action');
assert.equal(m.load('fictional-b').outcome,'','other session isolated');
assert.equal(m.validate('fictional-b').ok,false,'other session cannot inherit peer-test claims');
const partial=m.load('fictional-partial');
partial.checks=[0,2];partial.outcome='passed';
assert.equal(m.save('fictional-partial',partial),false,'partial save also reports failure');
m.hydrate('fictional-partial',m.evidence(id),'approved');
assert.equal(m.load('fictional-partial').outcome,'passed','remote hydration cannot overwrite partial choice');
assert.equal(m.load('fictional-partial').checks.length,2,'remote hydration cannot overwrite partial checks');
m.hydrate('fictional-hydrated',m.evidence(id),'submitted');
assert.equal(m.load('fictional-hydrated').outcome,'issue','structured historical report may hydrate');
assert.equal(m.load('fictional-hydrated').checks.length,0,'historical report never fabricates manual checks');
const report=m.evidence('fictional-hydrated');
assert.equal(m.parseEvidence(report).resolution,'backlog','structured report roundtrip');
assert.equal(m.parseEvidence(report.replace('M09 | issue | backlog','M09 | passed | backlog')),null,'contradictory report rejected');
const status={textContent:''};
const listeners={};
const input={dataset:{m9sField:'observed'},value:'Observação fictícia após evento',addEventListener:(type,fn)=>{listeners.input=fn}};
const outcome={checked:true,value:'passed',addEventListener:(type,fn)=>{listeners.outcome=fn}};
const resolution={checked:true,value:'nochange',addEventListener:(type,fn)=>{listeners.resolution=fn}};
const check={checked:true,dataset:{m9sCheck:'1'},addEventListener:(type,fn)=>{listeners.check=fn}};
const root={
 querySelectorAll(sel){if(sel==='[data-m9s-field]')return [input];if(sel==='input[name="m9Outcome"]')return [outcome];if(sel==='input[name="m9Resolution"]')return [resolution];if(sel==='[data-m9s-check]')return [check];return []},
 querySelector(sel){return sel==='#m9sStatus'?status:null}
};
ctx.document.querySelector=sel=>sel==='#m9sRoot'?root:null;
m.mount({session:'fictional-ui',status:'',phase:'practice',onPhase(){},onMessage(){}});
listeners.input();
assert(status.textContent.includes('apenas nesta aba'),'typing shows blocked-storage warning');
listeners.outcome();
assert(status.textContent.includes('apenas nesta aba'),'outcome radio shows blocked-storage warning');
// The outcome callback clears the old resolution radio; a real user must select it again.
resolution.checked=true;
listeners.resolution();
assert(status.textContent.includes('apenas nesta aba'),'decision radio shows blocked-storage warning');
listeners.check();
assert(status.textContent.includes('apenas nesta aba'),'checkbox shows blocked-storage warning');
assert.equal(m.load('fictional-ui').outcome,'passed','radio persisted in volatile tab');
assert.equal(m.load('fictional-ui').resolution,'nochange','decision persisted in volatile tab');
assert.equal(m.load('fictional-ui').checks.length,1,'checkbox persisted in volatile tab');
// A different playtest outcome or resolution must never reuse the old third attestation.
const decisionId='fictional-decision';
const decision=m.load(decisionId);
decision.outcome='passed';decision.resolution='nochange';decision.checks=[0,1,2];
for(const f of m.fields)decision[f.id]='Relato fictício suficiente para teste '+f.id;
m.save(decisionId,decision);
assert.equal(m.changeOutcome(decisionId,decision,'issue'),true,'outcome change recognized');
assert.equal(m.load(decisionId).resolution,'','old decision cleared after outcome change');
assert.equal(m.load(decisionId).checks.length,2,'third attestation cleared on outcome change');
assert.equal(m.validate(decisionId).ok,false,'new outcome requires a fresh decision');
assert.equal(m.changeOutcome(decisionId,decision,'issue'),false,'same outcome is idempotent');
assert.equal(m.load(decisionId).checks.length,2,'same outcome does not reset valid confirmations');
decision.resolution='fixed';decision.checks=[0,1,2];m.save(decisionId,decision);
assert.equal(m.changeResolution(decisionId,decision,'backlog'),true,'resolution change recognized');
assert.equal(m.load(decisionId).resolution,'backlog','new decision persisted in volatile tab');
assert.equal(m.load(decisionId).checks.length,2,'third attestation cleared on decision change');
assert.equal(m.changeResolution(decisionId,decision,'backlog'),false,'same decision is idempotent');
assert.equal(m.load(decisionId).checks.length,2,'same decision does not reset valid confirmations');
// Real event callback must also uncheck stale radio/checkbox UI, not just draft state.
const uiReset='fictional-ui-reset',uiDraft=m.load(uiReset);
uiDraft.outcome='passed';uiDraft.resolution='nochange';uiDraft.checks=[0,1,2];
m.save(uiReset,uiDraft);
let onOutcome;
const outcomeIssue={checked:true,value:'issue',addEventListener:(type,fn)=>{onOutcome=fn}};
const resolutionOld={checked:true,value:'nochange',addEventListener(){}};
const thirdCheck={checked:true,dataset:{m9sCheck:'2'},addEventListener(){}};
const resetStatus={textContent:''};
const resetRoot={querySelectorAll(sel){
 if(sel==='input[name="m9Outcome"]')return [outcomeIssue];
 if(sel==='input[name="m9Resolution"]')return [resolutionOld];
 if(sel==='[data-m9s-check]')return [thirdCheck];
 return [];
},querySelector(sel){return sel==='#m9sStatus'?resetStatus:null}};
ctx.document.querySelector=sel=>sel==='#m9sRoot'?resetRoot:null;
m.mount({session:uiReset,status:'',phase:'practice',onPhase(){},onMessage(){}});
onOutcome();
assert.equal(resolutionOld.checked,false,'old decision radio unselected in visible form');
assert.equal(thirdCheck.checked,false,'old third confirmation unchecked in visible form');
assert(resetStatus.textContent.includes('Selecione novamente a decisão'),'student gets actionable explanation');
assert.equal(m.load(uiReset).resolution,'','visible form and saved draft remain aligned');

// Legacy localStorage can contain pre-existing values longer than current textarea limits.
// Do not silently cut a peer's observed result or mark an invalid report complete.
const legacyStore=new Map();
const legacySession='fictional-legacy';
const legacyKey='pit_v3_m09_'+legacySession;
const legacyData={outcome:'issue',resolution:'backlog',checks:[0,1,2]};
for(const f of m.fields)legacyData[f.id]='X'.repeat(f.max+11);
legacyStore.set(legacyKey,JSON.stringify(legacyData));
const legacyWindow={};
const legacyContext={window:legacyWindow,document:{},localStorage:{
 getItem(k){return legacyStore.get(k)||null},
 setItem(k,v){legacyStore.set(k,v)}
}};
vm.runInNewContext(source,legacyContext,{filename:'v3/student-mission-nine.js'});
const legacyModule=legacyWindow.PIT_STUDENT_MISSION_NINE;
const legacyLoaded=legacyModule.load(legacySession);
for(const f of legacyModule.fields)assert.equal(legacyLoaded[f.id].length,f.max+11,'legacy load must preserve '+f.id);
assert.equal(legacyModule.validate(legacySession).ok,false,'oversized legacy report must not pass');
assert.equal(legacyModule.validate(legacySession).field,'peer','first overlong field identified');
assert(legacyModule.validate(legacySession).label.includes('25 caracteres'),'student receives precise limit');
const legacyPractice=legacyModule.render({session:legacySession,phase:'practice',status:'',idea:{}});
assert(legacyPractice.includes('Rascunho antigo preservado'),'student sees preservation warning');
assert(legacyPractice.includes('role="alert"'),'warning is announced accessibly');
assert.equal(legacyModule.save(legacySession,legacyLoaded),true,'valid browser storage still works');
for(const f of legacyModule.fields)assert.equal(legacyModule.load(legacySession)[f.id].length,f.max+11,'legacy save must preserve '+f.id);
assert.equal(legacyModule.parseEvidence(legacyModule.evidence(legacySession)),null,'invalid oversized evidence cannot roundtrip as valid');
for(const f of legacyModule.fields)legacyLoaded[f.id]='X'.repeat(f.min+2);
assert.equal(legacyModule.save(legacySession,legacyLoaded),true,'student may correct draft');
assert.equal(legacyModule.validate(legacySession).ok,true,'corrected report can be submitted');
assert(legacyModule.evidence(legacySession).length<=750,'corrected evidence fits transport budget');
assert(legacyModule.parseEvidence(legacyModule.evidence(legacySession)),'corrected report roundtrips');
assert(!legacyModule.render({session:legacySession,phase:'practice',status:'',idea:{}}).includes('Rascunho antigo preservado'),'warning clears after correction');

// Editing a playtest after manual attestation must invalidate only affected claims.
const editId='fictional-report-edits',editDraft=m.load(editId);
editDraft.outcome='issue';editDraft.resolution='backlog';editDraft.checks=[0,1,2];
for(const f of m.fields)editDraft[f.id]=f.id==='peer'?'Colega A':'Registro fictício '+f.id;
m.save(editId,editDraft);
assert.equal(m.changeField(editId,editDraft,'observed','Novo resultado observado').join(','),'1,2','new observation invalidates observation/reproduction');
assert.equal(m.load(editId).checks.join(','),'0','test participation remains attested');
editDraft.checks=[0,1,2];m.save(editId,editDraft);
assert.equal(m.changeField(editId,editDraft,'decision','Nova justificativa de backlog').join(','),'2','decision edit invalidates only decision attestation');
assert.equal(m.load(editId).checks.join(','),'0,1','participation and observation remain');
editDraft.checks=[0,1,2];m.save(editId,editDraft);
assert.equal(m.changeField(editId,editDraft,'task','Nova tarefa testada').join(','),'0,1,2','changed task requires new complete playtest');
assert.equal(m.load(editId).checks.length,0,'no stale manual check survives a changed task');
editDraft.checks=[0,1,2];m.save(editId,editDraft);
assert.equal(m.changeField(editId,editDraft,'saved','Novo caminho do mesmo projeto').length,0,'saved path is metadata only');
assert.equal(m.load(editId).checks.length,3,'metadata does not invalidate real test');
assert.equal(m.changeField(editId,editDraft,'saved',' Novo caminho do mesmo projeto ').length,0,'whitespace-only metadata edit is idempotent');
assert.equal(m.changeField(editId,editDraft,'unknown','arbitrary').length,0,'unknown field cannot mutate report');
const editUI='fictional-report-ui',editUIDraft=m.load(editUI);
editUIDraft.checks=[0,1,2];editUIDraft.observed='Resultado observado inicialmente';
m.save(editUI,editUIDraft);
let onFieldInput;
const observedInput={dataset:{m9sField:'observed'},value:'Resultado observado atualizado',addEventListener:(type,fn)=>{onFieldInput=fn}};
const checkBoxes=[0,1,2].map(n=>({dataset:{m9sCheck:String(n)},checked:true,addEventListener(){}}));
const editStatus={textContent:''};
const editRoot={querySelectorAll(sel){
 if(sel==='[data-m9s-field]')return [observedInput];
 if(sel==='[data-m9s-check]')return checkBoxes;
 return [];
},querySelector(sel){return sel==='#m9sStatus'?editStatus:null}};
ctx.document.querySelector=sel=>sel==='#m9sRoot'?editRoot:null;
m.mount({session:editUI,status:'',phase:'practice',onPhase(){},onMessage(){}});
onFieldInput();
assert.equal(checkBoxes[0].checked,true,'first checkbox remains visually checked');
assert.equal(checkBoxes[1].checked,false,'second checkbox visibly reset');
assert.equal(checkBoxes[2].checked,false,'third checkbox visibly reset');
assert.equal(m.load(editUI).checks.join(','),'0','visual and stored manual checks match');
assert(editStatus.textContent.includes('confirme novamente'),'student sees actionable retest guidance');

console.log('PASS M09 blocked-storage and legacy drafts: nine fields, over-limit preservation, rejection/recovery, session isolation, warnings, hydration and fictional UI events. Human playtest NOT_RUN.');

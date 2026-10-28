'use strict';
/* Deterministic evidence ledger: automation coverage is separate from human sign-off. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=JSON.parse(fs.readFileSync('v3/AGENTE-V3-ESTADO.json','utf8'));
assert.equal(s.tasks.length,59);
const required=['M06-05','M08-04','M09-03','REL-01','REL-03'];
const pending=s.tasks.filter(t=>t.status!=='done').map(t=>t.id);
assert(pending.every(id=>required.includes(id)),'unexpected acceptance gate outside documented manual list');
const human={
 'M06-05':['GDevelop GUI import PNG/GLB','audible WAV playback','GUI save/reopen','offline and physical mobile'],
 'M08-04':['real GDevelop Preview before/after','physical mobile performance'],
 'M09-03':['observed second-person peer playtest','human teacher review'],
 'REL-01':['manual sign-off and P0/P1 triage'],
 'REL-03':['final release decision after evidence']
};
for(const id of pending)assert(s.tasks.some(t=>t.id===id&&['blocked','in_progress'].includes(t.status)));
const ledger={
 generatedFrom:'v3/AGENTE-V3-ESTADO.json',automatedTasksComplete:s.completed_count,
 totalTasks:s.total_tasks,releaseReady:pending.length===0,automatedGate:'PASS',
 humanGate:pending.length?'PENDING':'CHECKPOINT_CLAIMS_COMPLETE_REQUIRES_HUMAN_SIGNOFF',manualProtocol:'v3/HOMOLOGACAO-PRESENCIAL.md',
 humanAcceptance:pending.map(id=>({id,status:'NOT_RUN',requirements:human[id]})),
 verifiedCI:{staticQA:'40661714996',browserQA:'40661631661',nativeGDevelop:'40660294582',backendM07:'40661334064'},
 noMainMerge:true,noProductionDeploy:true
};
const text=JSON.stringify(ledger,null,2)+'\n';
const out=process.argv[2];
if(out)fs.writeFileSync(out,text);
console.log('PASS REL automated ledger: '+s.completed_count+'/59; '+pending.length+' remaining acceptance gates explicitly NOT_RUN');

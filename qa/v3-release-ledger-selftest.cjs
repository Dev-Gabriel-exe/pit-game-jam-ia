'use strict';
// Exercise ledger generation with the current real checkpoint and a simulated
// future checkpoint to ensure legitimate human acceptance does not break CI.
const fs=require('node:fs'),cp=require('node:child_process'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),script=path.join(root,'qa/v3-release-evidence-ledger.cjs');
const state=JSON.parse(fs.readFileSync(path.join(root,'v3/AGENTE-V3-ESTADO.json'),'utf8'));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pit-ledger-'));
try{
 fs.mkdirSync(path.join(dir,'v3'));
 const run=s=>{fs.writeFileSync(path.join(dir,'v3/AGENTE-V3-ESTADO.json'),JSON.stringify(s));const output=path.join(dir,'ledger.json');const r=cp.spawnSync(process.execPath,[script,output],{cwd:dir,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(fs.readFileSync(output,'utf8'))};
 let ledger=run(state);
 assert.equal(ledger.automatedTasksComplete,54);
 assert.equal(ledger.humanAcceptance.length,5);
 assert.equal(ledger.releaseReady,false);
 assert(ledger.humanAcceptance.every(x=>x.status==='NOT_RUN'));
 const next=structuredClone(state),t=next.tasks.find(x=>x.id==='M06-05');
 t.status='done';t.blocker=null;next.completed_count=55;
 ledger=run(next);
 assert.equal(ledger.automatedTasksComplete,55);
 assert.equal(ledger.humanAcceptance.length,4);
 assert(!ledger.humanAcceptance.some(x=>x.id==='M06-05'));
 assert.equal(ledger.releaseReady,false);
 console.log('PASS REL ledger: actual 54/59 and simulated 55/59 transition');
}finally{fs.rmSync(dir,{recursive:true,force:true})}

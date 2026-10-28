'use strict';
// Validate unsigned, forged and documented signoffs without touching real student data.
const fs=require('node:fs'),cp=require('node:child_process'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),gate=path.join(root,'qa/v3-human-signoff-gate.cjs');
const source=JSON.parse(fs.readFileSync(path.join(root,'v3/HOMOLOGACAO-RESULTADOS.template.json'),'utf8'));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pit-signoff-'));
try{
 const run=(s,strict=false)=>{const p=path.join(dir,'signoff.json');fs.writeFileSync(p,JSON.stringify(s));return cp.spawnSync(process.execPath,[gate,p,...(strict?['--strict']:[])],{encoding:'utf8'})};
 assert.equal(run(source).status,0,'template is a valid pending document');
 assert.equal(run(source,true).status,1,'unsigned template cannot release');
 const forged=structuredClone(source);forged.checks[0].status='PASS';
 assert.notEqual(run(forged).status,0,'PASS without signer/date/evidence rejected');
 const partial=structuredClone(source);partial.executed_at='2026-10-28T18:00:00Z';partial.reviewer='QA Ficticio';
 partial.checks[0].status='PASS';partial.checks[0].evidence=['captura-ficticia.png'];
 assert.equal(run(partial,true).status,1,'one documented PASS is insufficient');
 const complete=structuredClone(partial);
 for(const check of complete.checks){check.status='PASS';check.evidence=['arquivo-ficticio-'+check.id+'.png']}
 assert.equal(run(complete,true).status,0,'fully documented synthetic example is schema-valid, not a real test');
 const failed=structuredClone(complete);failed.checks[2].status='FAIL';
 assert.equal(run(failed,true).status,1,'one failed manual acceptance blocks release');
 console.log('PASS human signoff negative cases: unsigned, forged, partial, documented synthetic, failed');
}finally{fs.rmSync(dir,{recursive:true,force:true})}

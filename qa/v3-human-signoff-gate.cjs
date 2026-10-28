'use strict';
// Fail closed on human acceptance records. A template is not a sign-off.
const fs=require('node:fs'),assert=require('node:assert/strict');
const file=process.argv[2]||'v3/HOMOLOGACAO-RESULTADOS.template.json';
const d=JSON.parse(fs.readFileSync(file,'utf8'));
assert.equal(d.schema_version,1);
assert.equal(d.environment,'isolated-test');
assert.equal(d.production_deploy_authorized,false);
assert.equal(d.main_merge_authorized,false);
const ids=['M06-05','M08-04','M09-03','REL-01','REL-03'];
assert.deepEqual(d.checks.map(c=>c.id),ids);
for(const c of d.checks){
 assert(['NOT_RUN','PASS','FAIL'].includes(c.status));
 assert(Array.isArray(c.evidence)&&Array.isArray(c.issues));
 if(c.status==='PASS'){
  assert(d.executed_at&&d.reviewer,'signed execution required for PASS');
  assert(c.evidence.length>0,'PASS requires evidence '+c.id);
 }
}
const approved=d.checks.every(c=>c.status==='PASS');
if(process.argv.includes('--strict')&&!approved)process.exitCode=1;
console.log('HUMAN ACCEPTANCE: '+(approved?'ALL DOCUMENTED':'PENDING')+' ('+d.checks.filter(c=>c.status==='PASS').length+'/5 documented PASS)');

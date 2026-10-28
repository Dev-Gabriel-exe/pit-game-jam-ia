'use strict';
/* REL-01: exercise the actual release gate with isolated synthetic checkpoints.
 * No credentials, network, production DB or student data. */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const original=JSON.parse(fs.readFileSync(path.join(root,'v3/AGENTE-V3-ESTADO.json'),'utf8'));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pit-gate-'));
try {
 fs.mkdirSync(path.join(dir,'v3'),{recursive:true});
 const gate=path.join(root,'qa/v3-release-gate.cjs');
 const run=(s,strict=false)=>{
  fs.writeFileSync(path.join(dir,'v3/AGENTE-V3-ESTADO.json'),JSON.stringify(s));
  return cp.spawnSync(process.execPath,[gate,...(strict?['--strict']:[])],{cwd:dir,encoding:'utf8'});
 };
 let x=run(original);
 assert.equal(x.status,0,'diagnostic mode exits zero');
 assert.match(x.stdout,/NOT READY/);
 x=run(original,true);
 assert.equal(x.status,1,'strict gate fails while blocked');
 const premature=structuredClone(original);premature.status='READY_FOR_FINAL_REVIEW';
 x=run(premature);
 assert.notEqual(x.status,0,'premature final-review state rejected');
 assert.match(x.stderr,/final-review state requires all 59 tasks done/);
 const invalid=structuredClone(original);
 invalid.tasks.find(t=>t.status==='done').tests=['NOT_RUN: pending'];
 x=run(invalid);
 assert.notEqual(x.status,0,'done task with only pending evidence rejected');
 assert.match(x.stderr,/non-pending verification/);
 console.log('PASS: REL-01 gate diagnostic, strict blocked, premature final, invalid evidence');
} finally {fs.rmSync(dir,{recursive:true,force:true})}

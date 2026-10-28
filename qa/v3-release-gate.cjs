'use strict';
/* REL-01: read-only release gate. No deploy or DB access.
 * Normal mode prints blockers and exits 0 for diagnostics.
 * --strict exits 1 if any of the 59 acceptance tasks is not done.
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=JSON.parse(fs.readFileSync('v3/AGENTE-V3-ESTADO.json','utf8'));
assert.equal(s.total_tasks,59,'roadmap has 59 tasks');
assert.equal(s.tasks.length,59,'checkpoint enumerates all 59 tasks');
assert.equal(new Set(s.tasks.map(t=>t.id)).size,59,'task IDs unique');
const done=s.tasks.filter(t=>t.status==='done'),remaining=s.tasks.filter(t=>t.status!=='done');
assert.equal(s.completed_count,done.length,'completed_count matches actual done tasks');
for(const t of done){
 assert.match(t.commit||'',/^[a-f0-9]{40}$/i,'done task has commit '+t.id);
 assert(Array.isArray(t.tests)&&t.tests.length>0,'done task has test evidence '+t.id);
}
for(const t of remaining)assert(['blocked','in_progress','todo'].includes(t.status),'known status '+t.id);
// A final-review state must never be accepted while a task remains blocked.
if(s.status==='READY_FOR_FINAL_REVIEW'||s.status==='READY_FOR_FINAL'){
 assert.equal(remaining.length,0,'final-review state requires all 59 tasks done');
}
// A task is not verifiable merely because it has a commit: evidence must
// contain at least one executed check, not only a NOT_RUN/pending claim.
for(const t of done){
 assert(t.tests.some(v=>!/(?:NOT_RUN|not executed|not run|pending|not yet confirmed)/i.test(String(v))),
  'done task must have at least one non-pending verification '+t.id);
}
const gate={ready:remaining.length===0,done:done.length,total:s.total_tasks,remaining:remaining.map(t=>({id:t.id,status:t.status,blocker:t.blocker||null}))};
console.log('REL-01 RELEASE GATE:',JSON.stringify(gate,null,2));
if(!gate.ready)console.log('NOT READY: keep branch isolated; do not merge main or publish.');
if(process.argv.includes('--strict')&&!gate.ready)process.exitCode=1;

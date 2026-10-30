'use strict';
// M10 student field guidance: isolated JS simulation, not a GDevelop/HDMI/human test.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const store=new Map(),ctx={window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{}};
for(const file of ['v3/student-mission-ten.js','v3/teacher-mission-ten-validation.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const student=ctx.window.PIT_STUDENT_MISSION_TEN,teacher=ctx.window.PIT_TEACHER_MISSION_TEN_VALIDATION;
assert.equal(student.fields.length,8);
const html=student.render({session:'student-a',phase:'practice',status:'',idea:{title:'Protótipo',genre:'puzzle'}});
for(const f of student.fields){
 const id=f.id==='access'?'m10sAccessHelp':'m10s-help-'+f.id;
 assert(html.includes('id="'+id+'"'),'field hint missing: '+f.id);
 assert(html.includes('aria-describedby="'+id+'"'),'accessible hint missing: '+f.id);
}
assert(!html.includes('pit-private-teacher-notes'),'private teacher notes must not appear for student');
assert(html.includes('Não registre senha')&&html.includes('Preview local'),'privacy and free fallback');
assert(fs.readFileSync('v3/student-mission-ten.css','utf8').includes('.m10s-field-hint'),'readable field hint style');
assert.equal(student.validate('student-a').ok,false,'empty evidence cannot be submitted');
const d=student.load('student-a');d.checks=[0,1,2];
for(const f of student.fields)d[f.id]='Registro real verificável do jogo e do teste '+f.id;
assert(student.save('student-a',d));
assert.equal(student.validate('student-a').ok,true,'client-side filled draft validation');
assert.equal(student.validate('student-b').ok,false,'session isolation');
const evidence=student.evidence('student-a');
assert.equal(student.parseEvidence(evidence).project,d.project,'structured evidence roundtrip');
student.hydrate('student-c',evidence,'submitted');
assert.equal(student.load('student-c').checks.length,0,'hydration cannot invent Preview checks');
for(const route of student.routes){
 assert(student.accessHelp(route).length>40,'route-specific access instruction '+route);
}
// A route switch invalidates stale access and the two checks that depend on the chosen build/link.
const routeDraft=student.load('route-switch');
routeDraft.route='gd';
routeDraft.access='https://gd.games/jogo-ficticio';
routeDraft.checks=[0,1,2];
assert.equal(student.switchRoute(routeDraft,'gd'),false,'same route keeps verified evidence');
assert.equal(routeDraft.checks.length,3,'same route must not clear checks');
assert.equal(student.switchRoute(routeDraft,'unknown'),false,'invalid route rejected');
assert.equal(routeDraft.route,'gd','invalid route must not mutate draft');
assert.equal(student.switchRoute(routeDraft,'web'),true,'different route selected');
assert.equal(routeDraft.route,'web','route must update');
assert.equal(routeDraft.access,'','old link must never be reused for a new route');
assert.deepEqual(Array.from(routeDraft.checks),[0],'project reopen persists, execution/access must be rechecked');
assert(student.save('route-switch',routeDraft),'route change persists');
assert.equal(student.validate('route-switch').ok,false,'changed route cannot be submitted with stale checks');
assert(student.mount.toString().includes('switchRoute(d,id)'),'route-switch invalidation must be wired to the guide callback');
assert(student.render({session:'route-switch',phase:'practice',status:'',idea:{}}).includes('refaça as conferências'),'student is told why checks reset');
// Legacy API versions flattened LF. Reject ambiguous, partial and altered records.
const malformed=[
 ['flattened',evidence.replace(/\n/g,' ')],
 ['missing',evidence.split('\n').slice(0,-1).join('\n')],
 ['duplicate label',evidence.replace('Mecânica: ','Experiência: ')],
 ['unknown route',evidence.replace('M10 | local','M10 | xyz')],
 ['short field',evidence.replace(/Experiência: [^\n]+/,'Experiência: x')],
 ['long field',evidence.replace(/Mecânica: [^\n]+/,'Mecânica: '+('X'.repeat(76)))],
 ['extra field',evidence+'\nOutro: valor'],
 ['extra blank line',evidence+'\n'],
 ['wrong label',evidence.replace('Acesso: ','Entrega: ')],
 ['reordered',evidence.split('\n').map((line,i,all)=>i===1?all[2]:i===2?all[1]:line).join('\n')],
 ['trailing whitespace',evidence.replace(/Projeto: [^\n]+/,line=>line+' ')]
];
for(const [name,raw] of malformed){
 assert.equal(student.parseEvidence(raw),null,'reject ambiguous M10 '+name);
 student.hydrate('legacy-'+name,raw,'submitted');
 assert.equal(student.load('legacy-'+name).pitch,'','do not hydrate '+name);
}
const checkOnly=student.load('check-only');checkOnly.checks=[1];student.save('check-only',checkOnly);
student.hydrate('check-only',evidence,'submitted');
assert.equal(student.load('check-only').pitch,'','preserve local check-only draft');
assert.deepEqual(Array.from(student.load('check-only').checks),[1]);
assert.equal(student.parseEvidence(evidence.replace(/\n/g,'\r\n')).pitch,d.pitch,'accept CRLF');
const gdDraft=student.load('gd-legacy');
for(const f of student.fields)gdDraft[f.id]='Registro real verificável do jogo e do teste '+f.id;
gdDraft.route='gd';gdDraft.access='https://gd.games/jogo-ficticio';
student.save('gd-legacy',gdDraft);
const gdEvidence=student.evidence('gd-legacy');
assert.equal(student.parseEvidence(gdEvidence).route,'gd','valid gd.games URL');
assert.equal(student.parseEvidence(gdEvidence.replace('https://gd.games/jogo-ficticio','link-invalido')),null,'invalid gd.games access rejected');
const maxDraft=student.load('max-legacy');
for(const f of student.fields)maxDraft[f.id]='X'.repeat(f.max);
student.save('max-legacy',maxDraft);
assert(student.evidence('max-legacy').length<=750,'max-size M10 record fits API');
const review=teacher.render('review');
assert(review.includes('<details class="pit-private-teacher-notes">'),'teacher private notes retained');
assert(!/<details class="pit-private-teacher-notes"[^>]*\bopen\b/.test(review),'private notes closed by default');
assert(review.includes('<summary')&&review.includes('▤'),'discreet keyboard-accessible control');
const app=fs.readFileSync('v3/app.js','utf8');
assert(app.includes('PIT_STUDENT_MISSION_TEN')&&app.includes('PIT_TEACHER_MISSION_TEN_VALIDATION'),'both profiles wired');
console.log('PASS M10 accessible student guidance, privacy, persistence, isolated draft, teacher private notes; human/GDevelop/HDMI NOT_RUN');

/* Execute: node qa/v3-m07-student.cjs — somente sessões fictícias */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const memory=new Map(),ctx={window:{},document:{},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}};
vm.runInNewContext(read('v3/student-mission-seven.js'),ctx);
const m=ctx.window.PIT_STUDENT_MISSION_SEVEN;
assert.equal(m.fields.length,7);assert.equal(m.validate('ficticioA').ok,false);
const d=m.load('ficticioA');for(const f of m.fields)d[f.id]='Resultado observado no Preview para '+f.id;d.route='3d';d.checks=[0,1,2];m.save('ficticioA',d);
assert.equal(m.validate('ficticioA').ok,true);
assert.equal(m.load('ficticioB').start,'');
const evidence=m.evidence('ficticioA');
assert.ok(evidence.includes('SE:')&&evidence.includes('ENTÃO:')&&evidence.includes('Negativo:'));
assert.equal(m.parseEvidence(evidence).route,'3d');
m.hydrate('ficticioC',evidence,'submitted');assert.equal(m.load('ficticioC').checks.length,0,'remote submission cannot prove manual Preview checks');assert.equal(m.load('ficticioC').condition,d.condition,'written evidence still restores');
m.hydrate('ficticioA','M07 | 2d\nInício: sobrescrito','submitted');assert.equal(m.load('ficticioA').route,'3d');
assert.equal(m.routeFor({rule:{route:2}},m.load('novo')),1);
assert.equal(m.routeFor({playable:{route:3}},m.load('novo')),1);

 // A student may deliberately switch the M07 GDevelop guide to 2D even when
 // the previous M04/M05 route was 3D. It must survive rerender and reload.
 const inherited3D={rule:{route:2},playable:{route:3}};
 const chosen2D=m.load('rota-2d-manual');
 chosen2D.route='2d';chosen2D.routeChosen=true;
 m.save('rota-2d-manual',chosen2D);
 assert.equal(m.routeFor(inherited3D,m.load('rota-2d-manual')),0,'explicit 2D overrides previous 3D');
 assert.equal(m.load('rota-2d-manual').routeChosen,true,'manual selection persists');
 const reloadCtx={window:{},document:{},localStorage:ctx.localStorage};
 vm.runInNewContext(read('v3/student-mission-seven.js'),reloadCtx);
 assert.equal(reloadCtx.window.PIT_STUDENT_MISSION_SEVEN.routeFor(inherited3D,
   reloadCtx.window.PIT_STUDENT_MISSION_SEVEN.load('rota-2d-manual')),0,'2D selection survives module reload');
 assert.equal(m.routeFor(inherited3D,m.load('novo')),1,'new student still inherits 3D suggestion');
 assert.equal(m.parseEvidence('M07 | 2d'+evidence.slice('M07 | 3d'.length)).routeChosen,true,
   'submitted 2D route is an explicit choice, not a fallback suggestion');
 assert.match(read('v3/student-mission-seven.js'),/selectRoute\(d,index\);save\(ctx\.session,d\)/,
   'guide route-change callback persists explicit selection and resets old checks');
 const withChecks=m.load('route-retest');
 withChecks.route='3d';withChecks.checks=[0,1,2];
 m.selectRoute(withChecks,0);
 assert.equal(withChecks.route,'2d','explicit route switches to 2D');
 assert.equal(withChecks.routeChosen,true,'explicit route is distinguished from inherited suggestion');
 assert.equal(withChecks.checks.length,0,'old 3D Preview checks are invalidated after switching to 2D');
 withChecks.checks=[0,1,2];
 m.selectRoute(withChecks,0);
 assert.equal(withChecks.checks.length,3,'reselecting same route does not erase legitimate checks');
 m.save('route-retest',withChecks);
 assert.equal(m.routeFor(inherited3D,m.load('route-retest')),0,'retested route stays 2D');

const max=m.load('ficticioA');for(const f of m.fields)max[f.id]='X'.repeat(f.max);m.save('max',max);
assert.ok(m.evidence('max').length<=750);assert.equal(m.parseEvidence(m.evidence('max')).saved.length,65);
// Regression: API legada pode achatar quebras de linha. Nunca reconstruir
// respostas, rota ou checks manuais a partir de texto parcial/ambíguo.
const corrupt=[
 ['achatado',evidence.replace(/\n/g,' ')],
 ['incompleto',evidence.split('\n').slice(0,-1).join('\n')],
 ['rótulo duplicado',evidence.replace('Desafio: ','Início: ')],
 ['rota desconhecida',evidence.replace('M07 | 3d','M07 | 4d')],
 ['SE vazio',evidence.replace(/SE: [^\n]+/,'SE: ')],
 ['campo longo',evidence.replace(/SE: [^\n]+/,'SE: '+'X'.repeat(91))],
 ['campo extra',evidence+'\nOutro: teste'],
 ['linha extra',evidence+'\n'],
 ['rótulo incorreto',evidence.replace('Projeto salvo: ','Projeto: ')],
 ['ordem trocada',evidence.split('\n').map((line,i,arr)=>i===1?arr[2]:i===2?arr[1]:line).join('\n')]
];
for(const [name,raw] of corrupt){
 assert.equal(m.parseEvidence(raw),null,'M07 must reject '+name);
 m.hydrate('legado-'+name,raw,'submitted');
 assert.equal(m.load('legado-'+name).start,'','invalid remote evidence cannot hydrate '+name);
}
const checksOnly=m.load('checksOnly');checksOnly.checks=[1];m.save('checksOnly',checksOnly);
m.hydrate('checksOnly',evidence,'submitted');
assert.equal(m.load('checksOnly').start,'','a local check-only draft must be preserved');
assert.equal(m.load('checksOnly').checks.length,1);
assert.equal(m.parseEvidence(evidence.replace(/\n/g,'\r\n')).route,'3d','CRLF remains supported');
const app=read('v3/app.js'),html=read('aluno-v3.html');new vm.Script(app);
assert.match(app,/const pilotSeven=!TEACHER&&activeStage===7/);
assert.match(app,/PIT_STUDENT_MISSION_SEVEN.validate\(q.session\)/);
assert.ok(html.indexOf('student-mission-seven.js')<html.indexOf('v3/app.js'));
// Storage denial: never claim a permanent save; preserve the complete in-tab draft.
const deniedStorage={getItem(){throw new Error('SecurityError')},setItem(){throw new Error('QuotaExceededError')}};
const deniedCtx={window:{},localStorage:deniedStorage,document:{}};
vm.runInNewContext(read('v3/student-mission-seven.js'),deniedCtx);
const denied=deniedCtx.window.PIT_STUDENT_MISSION_SEVEN;
const deniedDraft=denied.load('ficticio-bloqueado');
for(const f of denied.fields)deniedDraft[f.id]='Resultado observado no Preview para '+f.id;
deniedDraft.route='3d';deniedDraft.checks=[0,1,2];
assert.equal(denied.save('ficticio-bloqueado',deniedDraft),false);
assert.equal(denied.load('ficticio-bloqueado').route,'3d');
assert.equal(denied.load('ficticio-bloqueado').checks.length,3);
assert.equal(denied.load('ficticio-bloqueado').condition,deniedDraft.condition);
assert.equal(denied.validate('ficticio-bloqueado').ok,true);
assert.equal(denied.load('ficticio-outro').start,'');
 const denied2D=denied.load('manual2d-bloqueado');
 denied2D.route='2d';denied2D.routeChosen=true;
 assert.equal(denied.save('manual2d-bloqueado',denied2D),false);
 assert.equal(denied.routeFor({rule:{route:2}},denied.load('manual2d-bloqueado')),0,
   'blocked localStorage must not reset explicit 2D guide choice');

assert.match(denied.draftNotice('ficticio-bloqueado'),/apenas nesta aba/);
assert.doesNotMatch(denied.draftNotice('ficticio-bloqueado'),/Rascunho salvo neste navegador/);
const deniedRender={session:'ficticio-bloqueado',phase:'practice',status:'draft',idea:{}};
assert.match(denied.render(deniedRender),/copie sua ficha antes de sair/);
assert.match(denied.render({...deniedRender,phase:'review'}),/Copie a evidência acima/);
const deniedEvidence=denied.evidence('ficticio-bloqueado');
assert.equal(denied.parseEvidence(deniedEvidence).route,'3d');
denied.hydrate('ficticio-bloqueado',deniedEvidence,'approved');
assert.equal(denied.load('ficticio-bloqueado').checks.length,3);
const checkOnly=denied.load('ficticio-marcacoes');checkOnly.checks=[1];
denied.save('ficticio-marcacoes',checkOnly);
denied.hydrate('ficticio-marcacoes',deniedEvidence,'submitted');
assert.equal(denied.load('ficticio-marcacoes').checks.length,1);
assert.equal(denied.load('ficticio-marcacoes').start,'');
const routeOnly=denied.load('ficticio-rota');routeOnly.route='3d';
denied.save('ficticio-rota',routeOnly);
denied.hydrate('ficticio-rota',deniedEvidence,'approved');
assert.equal(denied.load('ficticio-rota').start,'');
assert.equal(denied.load('ficticio-rota').route,'3d');
console.log('M07: denied-storage, volatile draft, route/check isolation and honest warnings passed.');

// Pedagogical regression: never silently truncate historical student answers.
const completeM07=m.load('ficticioA');
for(const f of m.fields)completeM07[f.id]='Resultado observado no Preview para '+f.id;
completeM07.checks=[0,1,2];
for(const f of m.fields){
 const session='m07-overlimit-'+f.id,raw='X'.repeat(f.max+1);
 m.save(session,{...completeM07,[f.id]:raw});
 assert.equal(m.load(session)[f.id],raw,'M07 save/load must preserve oversized '+f.id);
 const v=m.validate(session);
 assert.equal(v.ok,false,'M07 oversized '+f.id+' must be invalid');
 assert.equal(v.field,f.id,'M07 must identify offending '+f.id);
 assert.match(v.label,new RegExp(String(f.max)),'M07 must explain max for '+f.id);
 const practice=m.render({session,phase:'practice',status:'draft',idea:{}});
 assert.match(practice,/Seu texto foi preservado/,'M07 warns on legacy '+f.id);
 const review=m.render({session,phase:'review',status:'draft',canSubmit:true,preview:true,idea:{}});
 assert.match(review,/id="submitWork" disabled/,'M07 cannot submit oversized '+f.id);
}
const legacyM07='X'.repeat(170);
memory.set('pit_v3_m07_m07-historical',JSON.stringify({...completeM07,condition:legacyM07}));
const historic=m.load('m07-historical');
assert.equal(historic.condition,legacyM07,'M07 legacy localStorage is preserved on load');
m.selectRoute(historic,0);
assert.equal(historic.checks.length,0,'M07 route switch invalidates old Preview checks');
m.save('m07-historical',historic);
assert.equal(m.load('m07-historical').condition,legacyM07,'M07 route switch does not cut historical text');
assert.equal(m.validate('m07-historical').ok,false,'M07 invalid legacy text cannot be submitted');
const deniedLegacy=denied.load('m07-historical-denied');
for(const f of denied.fields)deniedLegacy[f.id]='Resultado observado no Preview para '+f.id;
deniedLegacy.condition=legacyM07;
deniedLegacy.checks=[0,1,2];
assert.equal(denied.save('m07-historical-denied',deniedLegacy),false);
assert.equal(denied.load('m07-historical-denied').condition,legacyM07,'M07 in-tab storage failure preserves legacy answer');
assert.equal(denied.validate('m07-historical-denied').field,'condition','M07 storage failure cannot bypass condition max');
assert.doesNotMatch(m.render({session:'ficticioA',phase:'practice',status:'draft',idea:{}}),/pit-private-teacher-notes/,'Student view must not include teacher-only notes');
console.log('M07 legacy text and limit regression: seven fields, route switch and storage denial passed.');

console.log('M07-03: evidence, isolation, route and integration checks passed; no real Preview/API test.');

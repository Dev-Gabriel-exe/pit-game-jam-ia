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

console.log('M07-03: evidence, isolation, route and integration checks passed; no real Preview/API test.');

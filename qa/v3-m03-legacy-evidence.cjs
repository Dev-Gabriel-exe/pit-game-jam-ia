'use strict';
// M03 historical evidence: exact structured recovery, no guessed answers or Preview attestations.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const store=new Map(),window={};
const localStorage={
 getItem:k=>store.has(k)?store.get(k):null,
 setItem:(k,v)=>store.set(k,v),
 removeItem:k=>store.delete(k)
};
vm.runInNewContext(fs.readFileSync('v3/student-mission-three.js','utf8'),{window,localStorage,console},{timeout:3000});
const m=window.PIT_STUDENT_MISSION_THREE;
assert(m&&typeof m.parseEvidence==='function'&&typeof m.hydrate==='function');
const initial={project:'MeuJogo',scene:'CenaInicial',object:'Personagem',source:'Sprite original local',
 preview:'No Preview apareceu o personagem no centro da cena.',saved:'Pasta local Jogos/MeuJogo',
 fix:'',objectType:'3D Box/Modelo',checks:[0,1,2]};
m.save('source',initial);
const valid=m.evidence('source',{title:'Jogo de Teste',genre:'Puzzle'});
let count=0;
function check(condition,message){assert(condition,message);count++}
check(valid.split('\n').length===11,'M03 evidence has 11 exact lines');
check(m.parseEvidence(valid)?.objectType==='3D Box/Modelo','Valid 3D type is restored');
m.hydrate('fresh',valid,'approved');
const recovered=m.load('fresh');
check(recovered.project===initial.project&&recovered.scene===initial.scene,'Structured fields recovered');
check(recovered.checks.length===0,'Remote evidence never claims manual GDevelop checks');
check(recovered.fix==='','Default diagnosis maps to blank optional field');
const bad=[
 valid.replace(/\n/g,' '),
 valid.replace('Cena: CenaInicial\n',''),
 valid.replace('Cena: CenaInicial','Cena: CenaInicial\nCena: OutraCena'),
 valid.replace('Cena: CenaInicial','Cena: '),
 valid.replace('Objeto: Personagem','Objeto: X'),
 valid.replace('Tipo: 3D Box/Modelo','Tipo: 4D'),
 valid.replace('Recurso: Sprite original local','Recurso: '+('x'.repeat(70))),
 valid.replace('Preview: No Preview apareceu o personagem no centro da cena.','Preview: não'),
 valid.replace('Salvo em: Pasta local Jogos/MeuJogo','Salvo em: '),
 valid.replace('Cena: CenaInicial','Projeto: CenaInicial'),
 valid.replace('Projeto: MeuJogo','Projeto:  MeuJogo'),
 valid.replace('MISSÃO 03 — LIGAR O MOTOR','MISSÃO 03 — OUTRA'),
 valid+'\nCampo extra: indevido',
 valid.replace('Gênero: Puzzle\n','')
];
for(const [i,raw] of bad.entries()){
 check(m.parseEvidence(raw)===null,'Reject ambiguous or invalid evidence '+i);
 m.hydrate('bad-'+i,raw,'approved');
 check(m.load('bad-'+i).project==='','No guessed hydration '+i);
}
m.save('draft',{...initial,project:'Meu rascunho',checks:[]});
m.hydrate('draft',valid,'approved');
check(m.load('draft').project==='Meu rascunho','Existing draft wins even if approved');
m.save('check-only',{...m.load('empty'),checks:[0]});
m.hydrate('check-only',valid,'submitted');
check(m.load('check-only').project===''&&m.load('check-only').checks.includes(0),'Checkbox-only draft preserved');
m.save('route-only',{...m.load('empty'),objectType:'3D Box/Modelo'});
m.hydrate('route-only',valid,'submitted');
check(m.load('route-only').project===''&&m.load('route-only').objectType==='3D Box/Modelo','3D route-only draft preserved');
check(m.load('fresh').project==='MeuJogo','Other sessions remain isolated');
// Denied localStorage must not silently discard the student's technical report.
const blockedWindow={},blockedStorage={
 getItem:()=>{throw new Error('SecurityError')},
 setItem:()=>{throw new Error('QuotaExceededError')}
};
vm.runInNewContext(fs.readFileSync('v3/student-mission-three.js','utf8'),
 {window:blockedWindow,localStorage:blockedStorage,console},{timeout:3000});
const blocked=blockedWindow.PIT_STUDENT_MISSION_THREE;
check(blocked.save('offline',initial)===false,'Denied storage write reports failure');
check(blocked.load('offline').project===initial.project,'Denied storage preserves in-tab project');
check(blocked.load('another').project==='','Volatile fallback isolated by session');
check(blocked.load('offline').checks.length===3,'Manual checkboxes survive denied storage in tab');
check(blocked.load('offline').objectType==='3D Box/Modelo','3D route survives denied storage in tab');
const offlineContext={session:'offline',phase:'practice',status:'draft',preview:true,
 idea:{title:'Jogo de Teste',genre:'Puzzle'},canSubmit:true};
const offlinePractice=blocked.render(offlineContext);
check(offlinePractice.includes('Não foi possível salvar neste navegador'),'Practice warns of denied storage');
check(offlinePractice.includes('Copie sua ficha antes de sair'),'Practice offers a manual fallback');
check(!offlinePractice.includes('registros e verificações · rascunho salvo neste navegador'),
 'Practice never claims denied draft persisted');
check(offlinePractice.includes('Confira o aviso de salvamento'),'Practice explains save warning');
const offlineReview=blocked.render({...offlineContext,phase:'review'});
check(offlineReview.includes('O rascunho não foi salvo no navegador'),'Review warns of denied storage');
check(offlineReview.includes('Copie o texto da ficha'),'Review provides copyable evidence');
check(blocked.render({...offlineContext,session:'new'}).includes('comece a preencher para salvar'),
 'New unsaved project is not falsely marked saved');
blocked.hydrate('recovered',valid,'approved');
check(blocked.load('recovered').project===initial.project,'Recovery works with denied storage');
check(blocked.load('recovered').checks.length===0,'Recovery never attests manual Preview checks');
blocked.save('local-only',{...initial,project:'Projeto local'});
blocked.hydrate('local-only',valid,'approved');
check(blocked.load('local-only').project==='Projeto local','Approved remote evidence does not replace volatile draft');
check(m.save('persistent',initial)===true,'Writable storage reports success');
check(m.render({...offlineContext,session:'persistent'}).includes('rascunho salvo neste navegador'),
 'Persisted project still displays saved state');
console.log('PASS: '+count+' M03 legacy recovery assertions; no real student data, editor or browser used.');

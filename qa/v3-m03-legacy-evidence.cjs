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
console.log('PASS: '+count+' M03 legacy recovery assertions; no real student data, editor or browser used.');

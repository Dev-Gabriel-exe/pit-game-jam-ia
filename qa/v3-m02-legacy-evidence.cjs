'use strict';
// M02: historical evidence must not guess fields, overwrite local work or truncate structured lines.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const store=new Map(),window={};
const localStorage={
 getItem:k=>store.has(k)?store.get(k):null,
 setItem:(k,v)=>store.set(k,v),
 removeItem:k=>store.delete(k)
};
vm.runInNewContext(fs.readFileSync('v3/student-mission-two.js','utf8'),{window,localStorage,console},{timeout:3000});
const m=window.PIT_STUDENT_MISSION_TWO;
assert(m&&typeof m.parseEvidence==='function'&&typeof m.hydrate==='function');
const initial={scene:'Sala inicial',mechanic:'Coletar a chave',elements:'Jogador, Chave, Porta',
 test:'Dado que existe chave, quando tocar na porta, então ela abre.',later:'Mapa secundário'};
m.save('source',initial);
const valid=m.evidence('source',{title:'Meu jogo',genre:'Puzzle'});
let count=0;
function check(condition,message){assert(condition,message);count++}
check(valid.split('\n').length===8,'Eight ordered structured lines');
check(valid.length<=750,'Evidence within API limit');
check(m.parseEvidence(valid)?.elements===initial.elements,'Valid elements recovered');
check(m.parseEvidence(valid.replace(/\n/g,'\r\n'))?.scene===initial.scene,'CRLF normalized');
m.hydrate('fresh',valid,'approved');
check(m.load('fresh').mechanic===initial.mechanic,'Structured remote fields recovered');
const bad=[
 valid.replace(/\n/g,' '),
 valid.replace('Cena: Sala inicial\n',''),
 valid.replace('Cena: Sala inicial','Cena: Sala inicial\nCena: Outra sala'),
 valid.replace('Cena: Sala inicial','Cena: '),
 valid.replace('Elementos: Jogador, Chave, Porta','Elementos: Jogador, Porta'),
 valid.replace('Elementos: Jogador, Chave, Porta','Elementos: Jogador, Chave, Porta, Saída'),
 valid.replace('Teste: Dado que existe chave, quando tocar na porta, então ela abre.','Teste: curto'),
 valid.replace('Mecânica: Coletar a chave','Mecânica: '+('x'.repeat(106))),
 valid.replace('Jogo: Meu jogo','Jogo: '+('x'.repeat(51))),
 valid.replace('Gênero: Puzzle','Gênero: '+('x'.repeat(26))),
 valid.replace('Cena: Sala inicial','Cena:  Sala inicial'),
 valid.replace('Cena: Sala inicial','Projeto: Sala inicial'),
 valid.replace('MISSÃO 02 — MVP EM FOCO','MISSÃO 02 — OUTRA'),
 valid+'\nCampo extra: indevido',
 valid.replace('Gênero: Puzzle\n',''),
 valid.slice(0,valid.indexOf('Depois: ')+3)
];
for(const [i,raw] of bad.entries()){
 check(m.parseEvidence(raw)===null,'Reject ambiguous historical record '+i);
 m.hydrate('bad-'+i,raw,'approved');
 check(m.load('bad-'+i).scene==='','Never invent recovered fields '+i);
}
m.save('draft',{...initial,scene:'Minha cena editada'});
m.hydrate('draft',valid,'approved');
check(m.load('draft').scene==='Minha cena editada','Approved evidence must not overwrite local draft');
m.save('later-only',{scene:'',mechanic:'',elements:'',test:'',later:'Ideia pendente'});
m.hydrate('later-only',valid,'submitted');
check(m.load('later-only').scene===''&&m.load('later-only').later==='Ideia pendente','Optional-only draft preserved');
m.save('max',{scene:'a'.repeat(86),mechanic:'b'.repeat(105),elements:'c'.repeat(38)+', '+ 'd'.repeat(38)+', '+ 'e'.repeat(40),
 test:'f'.repeat(155),later:'g'.repeat(120)});
const maximum=m.evidence('max',{title:'T'.repeat(100),genre:'G'.repeat(100)});
check(maximum.length<=750,'Maximum legal fields do not truncate the final line');
check(maximum.split('\n').length===8,'Maximum evidence retains all labels');
check(m.parseEvidence(maximum)?.later==='g'.repeat(120),'Maximum record round trips');
check(m.load('fresh').scene===initial.scene,'Session isolation');
console.log('PASS: '+count+' M02 legacy evidence assertions; no real student data, browser or GDevelop used.');

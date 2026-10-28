'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const modules=[
['v3/gdevelop-first-run.js','PIT_GDEVELOP_FIRST_RUN',6,'steps'],
['v3/gdevelop-mission-four-guide.js','PIT_GDEVELOP_M04_GUIDE',4,'routes'],
['v3/gdevelop-mission-five-guide.js','PIT_GDEVELOP_M05_GUIDE',3,'routes'],
['v3/gdevelop-mission-seven-guide.js','PIT_GDEVELOP_M07_GUIDE',2,'routes'],
['v3/gdevelop-mission-eight-guide.js','PIT_GDEVELOP_M08_GUIDE',3,'routes'],
['v3/gdevelop-mission-ten-guide.js','PIT_GDEVELOP_M10_GUIDE',3,'routes'],
['v3/asset-forge-tutorial.js','PIT_ASSET_FORGE_TUTORIAL',5,'routes']
];
let checked=0;
for(const [file,name,count,field] of modules){
 const c={window:{}};vm.createContext(c);vm.runInContext(read(file),c,{timeout:3000});
 const m=c.window[name];assert(m,'module '+name);assert.equal(m[field].length,count,'route/step count '+name);
 assert.equal(typeof m.render,'function','render '+name);checked++;
 if(m.fallback||m.localFallback){
  const f=(m.fallback||m.localFallback).replace(/^\.\//,'');
  assert(fs.existsSync(path.join(root,f)),'offline diagram exists '+f);
 }
}
const teacher=read('v3/teacher-gdevelop-guide.js'),first=read('v3/gdevelop-first-run.js');
const four=read('v3/gdevelop-mission-four-guide.js'),eight=read('v3/gdevelop-mission-eight-guide.js');
const six=read('v3/asset-forge-tutorial.js'),ten=read('v3/gdevelop-mission-ten-guide.js');
assert(teacher.includes('DIAGRAMA AUTORAL · CAPTURA INDISPONÍVEL'),'teacher screenshot fallback labeled');
assert(first.includes('img.complete&&img.naturalWidth===0'),'cached image fallback');
assert(eight.includes("editor de cena"),'scene screenshot correct alt');
assert(!four.includes('platformer-defaultcontrols-box.png'),'broken image removed');
assert(six.includes('f6t-diagram')&&six.includes('NÃO É CAPTURA DO EDITOR'),'M06 diagram labeled');
assert(ten.includes('DIAGRAMA AUTORAL · NÃO É CAPTURA DO EDITOR'),'M10 diagram labeled');
for(const file of [four,eight,read('v3/gdevelop-mission-five-guide.js'),read('v3/gdevelop-mission-seven-guide.js')]){
 assert(file.includes('wiki.gdevelop.io'),'official documentation reference');
}
console.log('PASS AUD-03: '+checked+' guides; route counts; offline assets; accurate image captions; M06/M10 schematics.');

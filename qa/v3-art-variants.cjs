'use strict';
/* ART-03: status glyphs are decorative, status text remains authoritative. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const css=fs.readFileSync('v3/design-system.css','utf8');
const app=fs.readFileSync('v3/app.js','utf8');
const library=fs.readFileSync('biblioteca.js','utf8');
const portal=fs.readFileSync('index.html','utf8');
const state=fs.readFileSync('v3/assets/art/estados-missao.svg','utf8');
const types=fs.readFileSync('v3/assets/art/tipos-recurso.svg','utf8');
for(const [name,raw,expected] of [['mission',state,5],['asset',types,4]]){
 assert(raw.startsWith('<svg')&&raw.endsWith('</svg>'),name+' sprite XML boundary');
 assert.equal((raw.match(/<g transform="translate\(/g)||[]).length,expected,name+' sprite frames');
 assert(!/<script\b|<foreignObject\b|href="https?:/i.test(raw),name+' sprite external code');
}
for(const name of ['locked','active','submitted','revision','approved']){
 assert(css.includes('data-mission-state="'+name+'"'),name+' style variant');
 assert(app.includes("'"+name+"'"),name+' actual state mapping');
}
for(const name of ['png','glb','wav']){
 assert(css.includes('data-asset-format="'+name+'"'),name+' library style');
 assert(library.includes("'"+name+"'"),name+' library type');
}
assert(css.includes('estados-missao.svg')&&css.includes('tipos-recurso.svg'),'local sprite references');
assert(css.includes('[data-quick-kit]::before')&&portal.includes('data-quick-kit'),'ZIP asset type visible');
assert(app.includes('class="stage-state"')&&library.includes('<small>\'+tag+\'</small>'),'textual labels retained');
assert(!app.includes('localStorage.getItem(\'pit_art_status\')'),'no synthetic approval status');
console.log('PASS ART-03: five truthful mission states, four resource types, local sprites and text fallback');

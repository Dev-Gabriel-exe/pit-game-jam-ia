'use strict';
/* ART-04 — inspect actual WebP headers and exercise fallback transitions in VM. */
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const sizes=[];
for(let n=1;n<=10;n++){
 const file='v3/assets/missions/missao-'+String(n).padStart(2,'0')+'.webp';
 const buf=fs.readFileSync(file);
 assert.equal(buf.toString('ascii',0,4),'RIFF',file+' RIFF');
 assert.equal(buf.toString('ascii',8,12),'WEBP',file+' WEBP');
 assert(buf.length>1000&&buf.length<120000,file+' optimized poster size');
 sizes.push(buf.length);
}
const fallback=fs.readFileSync('v3/assets/art/poster-fallback.svg','utf8');
assert(fallback.startsWith('<svg')&&fallback.endsWith('</svg>'),'local SVG fallback');
const script=fs.readFileSync('v3/media-fallback.js','utf8');
const listeners={};const context={window:{},document:{readyState:'complete',addEventListener:(name,cb)=>{listeners[name]=cb},querySelectorAll:()=>[]}};
vm.runInNewContext(script,context,{timeout:1000});
assert.equal(typeof listeners.error,'function','capturing error handler installed');
const img={tagName:'IMG',dataset:{},src:'./v3/assets/missions/missao-01.webp',hidden:false,hasAttribute:k=>k==='data-pit-fallback'};
listeners.error({target:img});
assert.equal(img.dataset.pitFallbackState,'fallback');
assert.equal(img.src,'./v3/assets/art/poster-fallback.svg');
listeners.error({target:img});
assert.equal(img.dataset.pitFallbackState,'failed');
assert.equal(img.hidden,true,'second error hides image and leaves text/emoji');
listeners.error({target:img});
assert.equal(img.dataset.pitFallbackState,'failed','no fallback loop');
const other={tagName:'IMG',dataset:{},src:'keep',hasAttribute:()=>false};
listeners.error({target:other});assert.equal(other.src,'keep','non-opt-in images untouched');
const app=fs.readFileSync('v3/app.js','utf8');
assert.equal((app.match(/data-pit-fallback/g)||[]).length,2,'sidebar and gallery opt in');
for(const html of ['aluno-v3.html','professor-v3.html']){
 const text=fs.readFileSync(html,'utf8');
 assert(text.indexOf('v3/media-fallback.js')>=0&&text.indexOf('v3/media-fallback.js')<text.indexOf('v3/app.js'),html+' script order');
}
const css=fs.readFileSync('v3/design-system.css','utf8');
assert(css.includes('.arcade-mission-photo')&&css.includes('prefers-reduced-motion:reduce'),'poster reduced motion');
console.log('PASS ART-04: 10 real WebP headers, max '+Math.max(...sizes)+' bytes, safe fallback and no retry loop');

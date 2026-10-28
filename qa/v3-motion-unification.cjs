'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('aluno-v3.html','utf8');
const gallery=fs.readFileSync('v3/arcade-gallery.js','utf8');
const motion=fs.readFileSync('v3/mission-one-motion.js','utf8');
const manifest=fs.readFileSync('v3/motion-manifest.js','utf8');
assert(html.includes('v3/motion-manifest.js')&&html.includes('v3/mission-one-motion.js')&&html.includes('v3/mission-one-motion.css'));
assert(html.includes('v3/student-mission-ten.js'),'keep latest ten mission implementation');
assert(gallery.includes('arcade-mission-motion-video')&&gallery.includes('PIT_ONE_MOTION?.bind()')&&gallery.includes('PIT_ONE_MOTION?.sync()'));
assert(motion.includes('prefers-reduced-motion')&&motion.includes('saveData')&&motion.includes('document.hidden'));
assert(manifest.includes('[1,2,3,4,5,6,7,8,9,10]'));
for(let n=1;n<=10;n++){
 const p='v3/assets/missions/missao-'+String(n).padStart(2,'0')+'-motion.mp4';
 const data=fs.readFileSync(p);
 assert(data.length>10000,p+' must not be an empty placeholder');
 assert.equal(data.toString('ascii',4,8),'ftyp',p+' must be an MP4 container');
}
console.log('PASS unified V3: 10 real MP4 containers, latest M10, gallery wiring and motion safety');

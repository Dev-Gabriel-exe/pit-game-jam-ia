'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const c={window:{}};vm.createContext(c);
vm.runInContext(read('v3/teacher-mission-six-matrix.js'),c,{timeout:3000});
vm.runInContext(read('v3/asset-forge-tutorial.js'),c,{timeout:3000});
const tracks=c.window.PIT_TEACHER_MISSION_SIX_MATRIX.tracks;
const routes=c.window.PIT_ASSET_FORGE_TUTORIAL.routes;
assert.equal(tracks.length,5);assert.equal(routes.length,5);
assert.deepEqual([...tracks.map(x=>x.id)].sort(),['image','model','music','video','voice']);
for(const t of tracks){
 assert(t.source.startsWith('https://'),'official HTTPS source');
 assert(t.free.length>45&&t.license.length>25&&t.fallback.length>25,'full guidance '+t.id);
 assert(t.format.length>10&&t.caution.length>15,'export and warning '+t.id);
 assert(routes.some(r=>r.id===t.id&&r.gdevelop&&r.check),'import and Preview '+t.id);
}
const find=id=>tracks.find(x=>x.id===id);
assert(find('image').free.includes('1K'),'Gemini free image resolution');
assert(find('video').free.includes('50 créditos'),'Flow daily credits');
assert(find('music').free.includes('7 downloads'),'Suno lifetime trial download limit');
assert(find('music').license.includes('não comercial'),'Suno free license');
assert(find('voice').free.includes('10.000 créditos'),'ElevenLabs free shared credits');
assert(find('voice').source==='https://elevenlabs.io/pricing','official current price table');
assert(find('model').free.includes('10 downloads'),'Meshy free export');
assert(find('model').license.includes('CC BY 4.0'),'Meshy attribution');
assert(tracks.every(x=>!/(obrigatório pagar|precisa assinar)/i.test(x.fallback)),'free fallback');
console.log('PASS AUD-04: five tools; free quotas, licenses, sources, formats, fallbacks and import paths.');

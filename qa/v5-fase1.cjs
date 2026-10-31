'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const catalog=require('../v5/fase1-catalog.js'),assets=require('../v5/character-assets.js');
assert.equal(catalog.length,4,'Piloto deve mostrar quatro classes, sem ampliar conteúdo da oficina');
assert.deepEqual(catalog.map(c=>c.id),['warrior','mage','hunter','guardian']);
const unique=new Set();
for(const c of catalog){
 assert(c.name&&c.lore&&c.special&&c.weakness&&c.type,'Classe sem identidade: '+c.id);
 const a=assets[c.id];assert(a,'GLB ausente para '+c.id);
 assert.equal(a.license,'CC0-1.0');
 assert(/^https:\/\/raw\.githubusercontent\.com\/.+\/[0-9a-f]{40}\/.+\.glb$/.test(a.model),'URL GLB não fixada por commit: '+c.id);
 assert.equal(a.model.split('/').at(-1),c.modelName);
 assert(!unique.has(a.model),'Classes partilham GLB '+c.id);
 unique.add(a.model);
 assert(a.source.startsWith('https://github.com/'),'Proveniência ausente');
}
const base=path.resolve(__dirname,'../v5');
const html=fs.readFileSync(path.join(base,'seletor.html'),'utf8');
const js=fs.readFileSync(path.join(base,'seletor.js'),'utf8');
assert(html.includes('type="module"')&&html.includes('seletor.js')&&html.includes('fase1-catalog.js'));
assert(js.includes('GLTFLoader')&&js.includes('OrbitControls')&&js.includes('AnimationMixer')&&js.includes('cloneSkinned'));
assert(js.includes('setLoop')&&js.includes('clipsByRole'));
assert(!/localStorage|DATABASE_URL|pit_student_stages|pit_teacher/i.test(js),'O piloto não pode alterar turma/XP');
assert(!/new THREE\.(BoxGeometry|CylinderGeometry|SphereGeometry)\([^)]*\).*hero/i.test(js));
console.log('PASS: quatro classes com GLBs distintos e URLs fixas, provenance CC0, três módulos Three.js, piloto sem writes da turma');

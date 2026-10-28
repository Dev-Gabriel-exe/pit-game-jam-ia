'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('biblioteca.js','utf8'),html=fs.readFileSync('index.html','utf8');
const ctx={document:{querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null},window:{addEventListener:()=>{}},localStorage:{getItem:()=>null},console,Blob,TextEncoder,ArrayBuffer,DataView,Uint8Array,Float32Array,Uint16Array,Math,URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}}};
vm.createContext(ctx);vm.runInContext(source,ctx,{timeout:3000});
const data=vm.runInContext('({assets,genreExamples,assetMatches})',ctx);
const {assets,genreExamples,assetMatches}=data;
assert.equal(assets.length,44,'44 original resources');
assert.equal(new Set(assets.map(x=>x.id)).size,44,'unique resource IDs');
const formats={'2d':34,'3d':5,audio:5};
for(const [format,expected] of Object.entries(formats))assert.equal(assets.filter(a=>assetMatches(a,{format})).length,expected,format+' resources');
for(const [genre,ids] of Object.entries(genreExamples)){
 assert(ids.length>0,'nonempty genre '+genre);
 assert(ids.every(id=>assets.some(a=>a.id===id)),'genre '+genre+' has no dangling ID');
 assert(assets.some(a=>assetMatches(a,{genre,format:'3d'})),'genre '+genre+' offers 3D');
 assert(assets.some(a=>assetMatches(a,{genre,format:'2d'})),'genre '+genre+' offers 2D');
}
assert(assets.every(a=>Object.keys(genreExamples).some(genre=>assetMatches(a,{genre}))),'all assets have at least one suggested genre');
const additions=['feiticeira','golem','mapa-ruinas','mapa-pantano','lanterna','escudo','mapa-necropole','mapa-observatorio','espinhos','pedestal','sentinela','arqueiro','mapa-arquipelago','mapa-fortaleza','bussola','reliquia'];
assert(additions.every(id=>assets.some(a=>a.id===id)),'all sixteen original additions exist');
for(const id of additions){
 const a=assets.find(x=>x.id===id);
 const svg=vm.runInContext('svgAsset(assets.find(a=>a.id==='+JSON.stringify(id)+'))',ctx);
 assert(svg.startsWith('<svg')&&svg.endsWith('</svg>'),'valid SVG wrapper '+id);
 assert(svg.includes(a.tint),'unique tint '+id);
 assert(svg.includes('viewBox="0 0 '+(a.cat==='mapa'?'1024 576':'160 160')+'"'),'dimensions '+id);
 assert((svg.match(/<path|<rect|<circle|<ellipse/g)||[]).length>=4,'nonempty vector elements '+id);
 assert(assetMatches(a,{genre:'rpg'}),'new asset discoverable in RPG '+id);
}
assert(new Set(additions.map(id=>assets.find(a=>a.id===id).file)).size===16,'sixteen unique download filenames');

assert.equal(assets.filter(a=>assetMatches(a,{cat:'som',format:'2d'})).length,0,'audio is never 2D');
assert.equal(assets.filter(a=>assetMatches(a,{genre:'corrida',format:'3d'})).length,1,'racing has one 3D prop');
assert.equal(assets.filter(a=>assetMatches(a,{search:'coração'})).length,1,'search handles accents');
assert(html.includes('id="assetGenre"')&&html.includes('id="assetFormat"'),'filter controls are rendered');
assert(source.includes('Gerado localmente · uso didático'),'procedural origin shown in resource cards');
console.log('PASS UI-05: 44 assets, 4 genres, 3 formats, intersections, search, origin and no dangling IDs');

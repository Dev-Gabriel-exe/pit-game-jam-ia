'use strict';
/* UI-01: offline route/dependency audit. No requests to production or real students. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const pages=['index.html','fase1.html','aluno-v3.html','professor-v3.html','aluno-v2.html','professor-v2.html','aluno.html','professor.html'];
const report=[];let total=0;
for(const file of pages){
 const full=path.join(root,file),html=fs.readFileSync(full,'utf8');
 assert.match(html,/<html\b/i,file+' HTML root');
 const refs=[...html.matchAll(/\b(?:src|href)=["']([^"'<>]+)["']/g)].map(m=>m[1]);
 const missing=[];
 for(const ref of refs){
  if(/^(?:https?:|data:|mailto:|tel:|javascript:|#|\/\/)/i.test(ref))continue;
  const clean=decodeURIComponent(ref.split(/[?#]/)[0]);
  if(!clean)continue;
  const target=path.resolve(path.dirname(full),clean);
  assert(target.startsWith(root+path.sep),file+' attempted to escape root: '+ref);
  if(!fs.existsSync(target))missing.push(ref);
 }
 assert.deepEqual(missing,[],file+' missing local assets/links');
 total+=refs.length;report.push(file+': '+refs.length+' references verified');
}
for(let i=1;i<=10;i++)assert(fs.existsSync(path.join(root,'v3/assets/missions/missao-'+String(i).padStart(2,'0')+'.webp')),'missing poster '+i);
for(const file of ['aluno-v3.html','professor-v3.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 assert.match(html,/v3\/app\.js/,file+' V3 app');
 assert.match(html,/v2\/missions\.js/,file+' mission registry');
 assert.match(html,/v3\/arcade-gallery\.js/,file+' cinematic gallery');
 assert.match(html,/data-role=["'](?:student|teacher)["']/,file+' role');
}
assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/biblioteca\.js/,'public asset library');
console.log('PASS UI-01: '+pages.length+' HTML routes, '+total+' referenced links/assets and 10 mission posters');
report.forEach(line=>console.log('  '+line));

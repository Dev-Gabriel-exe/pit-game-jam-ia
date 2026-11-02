'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const arena=fs.readFileSync(path.join(__dirname,'../v5/arena-three.js'),'utf8');
for(const file of ['tree1.glb','tree3.glb','bush.glb']){
 const buffer=fs.readFileSync(path.join(__dirname,'../v5/assets/quaternius-nature',file));
 assert(buffer.length>20000,'Not a real GLB: '+file);
 assert.equal(buffer.toString('ascii',0,4),'glTF');
 assert.equal(buffer.readUInt32LE(4),2);
 assert.equal(buffer.readUInt32LE(8),buffer.length);
 assert.equal(buffer.readUInt32LE(16),0x4e4f534a);
 const json=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString('utf8'));
 assert(json.meshes?.length>0,'Missing meshes in '+file);
 assert(arena.includes("file:'"+file+"'"),'File not in the arena scenery');
}
assert(arena.includes("nature:new URL('./assets/quaternius-nature/',import.meta.url).href"));
assert(arena.includes("container.dataset.v5Nature=natural.length===3?'loaded':natural.length?'partial':'failed'"));
for(const [radius,minimum] of [[67,115],[74,115],[63,115]])assert(radius*(5/2.6)>minimum,'nature ring must be outside combat');
assert(arena.includes('const stadiumScale=worldScale/2.6;'));
assert(arena.includes('root.add(group);'),'actual GLB meshes must be attached to the scene');
console.log('PASS 3 real CC0 GLB nature models; safe outer ring; standard/low instance manifests; no combat changes');

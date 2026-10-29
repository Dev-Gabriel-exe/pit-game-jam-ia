'use strict';
const assert=require('node:assert/strict');
const assets=require('../v5/character-assets.js');
const keys=['warrior','mage','hunter','guardian'];
assert.deepEqual(Object.keys(assets).sort(),keys.slice().sort(),'Only the four original classes remain');
const base='https://raw.githubusercontent.com/sion-rgb/tactical-slash/8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727/assets/characters/player/';
const expected={warrior:'player_swordsman.glb',guardian:'player_swordsman.glb',
  mage:'player_priest.glb',hunter:'player_archer.glb'};
for(const klass of keys){
 assert.equal(assets[klass].model,base+expected[klass]);
 assert.equal(assets[klass].license,'CC0-1.0');
 assert.match(assets[klass].family,/Tactical Slash/);
}
assert.equal(new Set(keys.map(k=>assets[k].model)).size,3,'Only three actual human GLBs exist at source; swordsman is safely reused for guardian');
const fs=require('node:fs');
const arena=fs.readFileSync(require.resolve('../v5/arena-three.js'),'utf8');
const viewer=fs.readFileSync(require.resolve('../v5/personagens-lab.js'),'utf8');
const html=fs.readFileSync(require.resolve('../v5/personagens-lab.html').replace(/\.js$/,'.html'),'utf8');
assert.match(arena,/const factor=2\.55\/measure\.y/,'Arena requires identical visual heights');
assert.match(viewer,/const factor=2\.55\/height/,'Viewer requires identical visual heights');
assert(!/WARDROBE|Quaternius|SHOWCASE|armor\.root/.test(arena),'Arena must not add Quaternius art or fake armor');
assert(!/WARDROBE|Quaternius|legendary-wardrobe|avatar-catalog|reservar|Reserva exclusiva/i.test(viewer+html),'Viewer must not request disabled modular assets or reservations');
assert.match(viewer,/mixer\.clipAction\(idle\)/,'Original GLB idle animations must play');
console.log('PASS original Tactical Slash CC0 rig mapping: Archer, Priest, Swordsman shared with Guardian; equal 2.55 height; no layered armor');

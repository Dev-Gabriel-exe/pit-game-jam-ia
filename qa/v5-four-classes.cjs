'use strict';
const assert=require('node:assert/strict');
const assets=require('../v5/character-assets.js');
const classes=['warrior','mage','hunter','guardian'];
assert.deepEqual(Object.keys(assets).sort(),classes.slice().sort(),'Four classes retained');
const base='https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/672074b73ba276876a19e8816ecdc5241817ab47/addons/kaykit_character_pack_adventures/Characters/gltf/';
const expected={warrior:'Barbarian.glb',mage:'Mage.glb',hunter:'Rogue_Hooded.glb',guardian:'Knight.glb'};
for(const klass of classes){
 assert.equal(assets[klass].model,base+expected[klass],'Incorrect original model for '+klass);
 assert.equal(assets[klass].license,'CC0-1.0','CC0 rights from author');
 assert.match(assets[klass].family,/KayKit Adventurers/);
 assert(assets[klass].source.startsWith('https://github.com/KayKit-Game-Assets/'));
}
assert.equal(new Set(classes.map(k=>assets[k].model)).size,4,'Every class has its own complete 3D model');
const fs=require('node:fs');
const arena=fs.readFileSync(require.resolve('../v5/arena-three.js'),'utf8');
const viewer=fs.readFileSync(require.resolve('../v5/personagens-lab.js'),'utf8');
const html=fs.readFileSync(require.resolve('../v5/personagens-lab.js').replace(/\.js$/,'.html'),'utf8');
assert.match(arena,/const factor=2\.55\/measure\.y/,'Arena normalizes every class to same 2.55-unit height');
assert.match(viewer,/const factor=2\.55\/height/,'Viewer normalizes every class to same 2.55-unit height');
assert(!/WARDROBE|Quaternius|SHOWCASE|armor\.root/.test(arena),'No improvised armor on arena rigs');
assert(!/WARDROBE|Quaternius|legendary-wardrobe|avatar-catalog|reservar|Reserva exclusiva/i.test(viewer+html),
 'No modular armory or synthetic avatar reservation');
assert.match(viewer,/mixer\.clipAction\(idle\)/,'Native GLB idle animation plays');
console.log('PASS four unique official KayKit Adventurers 1.0 character GLBs (Barbarian/Mage/Rogue_Hooded/Knight), CC0, same size, native animation');

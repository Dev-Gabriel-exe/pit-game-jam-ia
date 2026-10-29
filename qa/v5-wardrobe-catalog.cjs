'use strict';
const assert=require('node:assert/strict');
const catalog=require('../v5/avatar-catalog.js');
const gear=require('../v5/legendary-wardrobe.js');
assert.equal(catalog.AVATARS.length,40);
const hashes=new Set(),sources=new Set(),weapons=new Map();
for(const a of catalog.AVATARS){
 const s=gear.spec(a);
 assert(s&&s.url.startsWith('https://raw.githubusercontent.com/agentkaerf/FreeModels/db3df04d'),'pinned CC0 source');
 assert(s.outfit.endsWith('.gltf'),'actual medieval mesh, not a decorative emoji');
 assert(s.weapon,'weapon for every actual 3D model');
 sources.add(s.outfit);
 const recipe=[a.klass,s.weapon,s.outfit,s.headgear,s.pauldrons,s.cape,s.cloth,s.metal].join(':');
 assert(!hashes.has(recipe),'each of 40 bodies must have a different geometric/material recipe');
 hashes.add(recipe);
 weapons.set(a.klass,(weapons.get(a.klass)||new Set()).add(s.weapon));
}
assert.equal(hashes.size,40);
assert.equal(sources.size,4,'all four free CC0 Standard outfits must be used');
for(const c of Object.keys(catalog.CLASSES)){
 assert(weapons.get(c).size>=3,'each class has at least three physically distinct weapons');
}
console.log('PASS 40 free 3D assembly recipes: 4 Quaternius medieval GLTF outfit bases, unique armor, cape, helmet and weapon combinations');

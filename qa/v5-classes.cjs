'use strict';
const assert=require('node:assert/strict');
const assets=require('../v5/character-assets.js');
const core=require('../v5/hero-core.js');
assert.deepEqual(Object.keys(assets).sort(),Object.keys(core.CLASS).sort(),'Every playable class needs one real GLB');
const urls=new Set();
for(const [klass,asset] of Object.entries(assets)){
 assert(/^https:\/\/raw\.githubusercontent\.com\/[^?]+\.glb$/i.test(asset.model),'Not an immutable GLB URL: '+klass);
 assert.equal(asset.license,'CC0-1.0');
 assert(asset.model.split('/').some(x=>/^[0-9a-f]{40}$/.test(x)),'Source model must pin a real Git commit: '+klass);
 assert(!urls.has(asset.model),'Two classes share the same GLB: '+klass);
 urls.add(asset.model);
 assert(asset.source.startsWith('https://github.com/'),'Missing provenance: '+klass);
 assert(asset.geometry.length>15,'Class model must have distinguishing appearance: '+klass);
 const build=core.canonical(core.seedBuild('Nome que veio do cadastro',klass),'Nome que veio do cadastro',500);
 assert.equal(build.klass,klass);
 assert.equal(build.name,'Nome que veio do cadastro');
 assert.equal(build.remainingAttributes,16);
 assert(core.TALENTS[klass].length>=6);
 assert(core.derived(build).hp>50);
}
const team=Object.keys(assets).map((klass,i)=>{
 const b=core.seedBuild('Herói de teste '+i,klass);
 return {id:'class-'+i,name:b.name,build:b,xp:500};
});
const battle=core.battle(team,{seed:7202,limit:120}).run(5000);
assert(battle.finished&&battle.winner,'Six classes must participate in the same automatic match');
assert.equal(battle.standings.length,6);
console.log('PASS: six distinct pinned CC0 GLBs, unique readable classes, 6 talents per class, trusted identity and 6-class auto-battle');
console.log(Object.entries(assets).map(([id,a])=>id+' = '+a.model.split('/').at(-1)).join('\n'));

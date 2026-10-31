'use strict';
const assert=require('node:assert/strict');
const E=require('../v5/phase2-combat.js'),V=require('../v5/talent-vfx.js'),I=require('../v5/build-identity.js');
const classes=['warrior','mage','hunter','guardian'],signatures=new Set();
for(const klass of classes){
 const identities=[];
 for(let variant=0;variant<11;variant++){
  const build=E.exampleBuild(klass,'Personagem de teste',5,variant);
  const a=I.describe(build,E,V);
  identities.push(a);
  assert.equal(a.klass,klass);assert.equal(a.mix.length,3);
  assert.equal(a.accentHex.length,7);assert.equal(a.detailHex.length,7);
  assert.equal(a.mix.reduce((n,x)=>n+x.count,0),5);
  assert.equal(a.primaryLabel,I.PATHS[klass][a.primaryPath][0]);
  assert(a.shards>=1&&a.shards<=3);assert(a.variant>=0&&a.variant<4);
  assert(a.focus);assert(Number.isInteger(a.hash));
  assert(I.collision(a,I.describe({...build,name:'Outro nome'},E,V)),'Names do not define identity');
  const reordered=E.canonical({...build,talents:[...build.talents].reverse()},5);
  assert(I.collision(a,I.describe(reordered,E,V)),'Talent order is cosmetic-invariant');
  assert(!a.signature.includes('Personagem de teste'),'No personal ID or name in key');
  assert(a.visualId.includes(klass+':'));
  signatures.add(a.visualId);
 }
 assert(new Set(identities.map(x=>x.visualId)).size>=8,klass+' needs visually diverse builds');
 assert(new Set(identities.map(x=>x.accentHex+':'+x.shape+':'+x.primaryPath)).size>=6,klass+' needs distinct visual accents');
 const initial=E.exampleBuild(klass,'A',5,0);
 const alt=E.exampleBuild(klass,'B',5,1);
 assert.notEqual(I.describe(initial,E,V).visualId,I.describe(alt,E,V).visualId);
 assert.throws(()=>I.describe({...initial,talents:[...initial.talents,'INEXISTENTE']},E,V));
 // H.3 M10 is now a valid opt-in canonical build: legacy rejection is obsolete.
 const final=E.exampleBuild(klass,'Final fictícia',10,0,{experimentalFinal:true});
 const finalIdentity=I.describe(final,E,V);
 assert.equal(finalIdentity.mix.reduce((n,x)=>n+x.count,0),10);
 assert.equal(Object.values(final.attributes).reduce((n,x)=>n+x,0),20);
 assert.notEqual(finalIdentity.visualId,I.describe(initial,E,V).visualId);
 assert(!finalIdentity.signature.includes('Final fictícia'),'No name in final visual key');
 assert.throws(()=>I.describe({...final,talents:[...final.talents,'INEXISTENTE']},E,V));
 assert.throws(()=>I.describe({...final,attributes:{...final.attributes,FOR:final.attributes.FOR+1}},E,V));
 assert.throws(()=>I.describe({...initial,schema:'legacy'},E,V),/canônica/);
}
assert(signatures.size>=32);
assert.equal(I.describe(E.exampleBuild('mage','a',5,7),E,V).primaryPath,'A');
assert.equal(I.describe(E.exampleBuild('hunter','a',5,7),E,V).primaryPath,'S');
assert.equal(I.describe(E.exampleBuild('guardian','a',5,7),E,V).primaryPath,'J');
assert.equal(I.describe(E.exampleBuild('warrior','a',5,7),E,V).primaryPath,'T');
console.log('PASS C.3: build-specific canonical visual profiles, all 4 classes x 11 builds, 3 distinct talent paths, palette, crests, deterministic identity & invalid-input guards');
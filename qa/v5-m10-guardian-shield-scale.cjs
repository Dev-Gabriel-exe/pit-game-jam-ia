'use strict';
const assert=require('node:assert/strict');
const P=require('../v5/phase2-combat.js');
const entries=['warrior','mage','hunter','guardian'].map((klass,i)=>({
 ...P.exampleBuild(klass,'trial-shield-'+i,10,i,{experimentalFinal:true}),id:'trial-shield-'+i
}));
const opts={arenaMission:10,seed:20261030};
function run(extra){return P.battle(entries,{...opts,...extra}).run();}
const baseline=run();
const neutral=run({experimentalGuardianShieldScale:{G01:1,G10:1}});
assert.deepEqual(neutral,baseline,'neutral scales must preserve exact replay');
const reduced=run({experimentalGuardianShieldScale:{G01:.8,G10:.8}});
assert.ok(reduced.events.length>0);
assert.throws(()=>P.battle(entries,{arenaMission:5,experimentalGuardianShieldScale:{G01:.8}}));
for(const bad of [-1,1.1,NaN,Infinity,'0.8'])assert.throws(()=>P.battle(entries,{...opts,experimentalGuardianShieldScale:{G01:bad}}));
assert.throws(()=>P.battle(entries,{...opts,experimentalGuardianShieldScale:{G05:.8}}));
assert.throws(()=>P.battle(entries,{...opts,experimentalGuardianShieldScale:{G01:.8},experimentalGuardianTalentAblation:'G01'}));
console.log('PASS M10 isolated G01/G10 shield-scale diagnostic; neutral replay and invalid input guards');

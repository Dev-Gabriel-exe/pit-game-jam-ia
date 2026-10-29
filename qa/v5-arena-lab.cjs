'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'v5/arena-lab.html'),'utf8');
const js=fs.readFileSync(path.join(root,'v5/arena-lab.js'),'utf8');
const stage=fs.readFileSync(path.join(root,'v5/arena-three.js'),'utf8');
const core=require('../v5/hero-core.js');
assert(html.includes('arena-three')===false,'Use the dedicated JS arena module rather than inline scripts');
for(const id of ['arenaStage','startBattle','pauseBattle','resetBattle','speedBattle','arenaStatus','fighters','battleLog','modelReport']){
 assert(html.includes('id="'+id+'"'),'Missing UI element '+id);
}
assert(html.includes('data-mission="5"')&&html.includes('data-mission="10"'));
assert(js.includes("import {createStage} from './arena-three.js'"));
assert(stage.includes('v5ModelsLoaded')&&stage.includes('v5ModelsFailed')&&stage.includes('v5ModelsExpected'));
assert(!/fetch\(|localStorage|sessionStorage|pit_chat_student_v09|\/api\/arena|fetch.*POST/i.test(js),'Live student data/XP integration forbidden from isolated demo');
const classes=['warrior','mage','hunter','guardian'];
assert.deepEqual(classes,require('../v5/fase1-catalog.js').map(x=>x.id));
const presets=[
 {power:6,agility:2,spirit:0,vitality:2},
 {power:0,agility:2,spirit:7,vitality:1},
 {power:2,agility:7,spirit:0,vitality:1},
 {power:1,agility:0,spirit:1,vitality:8}
];
for(const mission of [5,10]){
 const actors=classes.map((klass,i)=>{
  const b=core.seedBuild('Hero '+i,klass);
  Object.entries(presets[i]).forEach(([key,val])=>b.attributes[key]=val*(mission===10?2:1));
  const xp=mission*100;
  const final=core.canonical(b,b.name,xp);
  assert.equal(Object.values(final.attributes).reduce((a,n)=>a+n,0),mission*2,'Wrong milestone budget');
  return {...final,id:klass,name:b.name};
 });
 const sim=core.battle(actors,{seed:mission*123,limit:65});
 const result=sim.run(3000);
 assert(result.finished,'Simulacao deve terminar em M'+mission);
 assert(result.winner,'Arena deve encontrar vencedor M'+mission);
 assert.equal(result.standings.length,4);
 console.log('M'+mission+' passes: '+result.winner.name+' in '+result.time+' seconds of simulated combat.');
}
console.log('PASS isolated 3D arena demo: controls, four classes, deterministic 500/1000 XP fights, no student writes. Does NOT validate planned 120 effects.');

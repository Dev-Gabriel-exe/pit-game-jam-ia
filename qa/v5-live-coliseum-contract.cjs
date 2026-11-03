'use strict';
process.env.DATABASE_URL||='postgresql://not-connected.invalid/fixture';
process.env.PIT_TEACHER_PIN||='fictional-teacher-key-not-used';
const assert=require('node:assert/strict');
const engine=require('../chat-api/lib/v5-phase2-engine.js');
const {battleBuild,simulate}=require('../chat-api/api/coliseum.js');
const original=require('../v5/phase2-combat.js');
const students=Array.from({length:30},(_,i)=>({id:'10000000-0000-4000-8000-'+String(i+1).padStart(12,'0'),
 name:'Aluno fictício '+(i+1),
 klass:['warrior','mage','hunter','guardian'][i%4]}));
const base=(klass)=>({klass,attributes:{FOR:0,DES:0,INT:0,VIT:0,DEF:0},talents:[]});
function make(klass,approved,mission,name,id){
 const b=battleBuild(base(klass),approved,mission,name);
 return {id,name,approvedMissions:b.approvedMissions,finalTrial:mission===10,build:b};
}
assert.equal(engine.VERSION,original.VERSION);
assert.deepEqual(Object.keys(engine.CLASSES),Object.keys(original.CLASSES));
assert.deepEqual(Object.keys(engine.TALENTS).map(k=>engine.TALENTS[k].length),[30,30,30,30]);
assert.equal(battleBuild({klass:'warrior',attributes:{FOR:10,DES:4,INT:0,VIT:0,DEF:0},talents:[]},7,5,'Player').approvedMissions,5);
assert.deepEqual(battleBuild({klass:'warrior',attributes:{FOR:10,DES:4,INT:0,VIT:0,DEF:0},talents:[]},7,5,'Player').attributes,{FOR:10,DES:0,INT:0,VIT:0,DEF:0});
assert.throws(()=>battleBuild({...base('mage'),talents:['B01']},5,5,'Bad'),/Talento/);
assert.throws(()=>battleBuild(base('mage'),4,10,'Unapproved'),/Motor padrão|exige|inválido|opt-in/);
let entries=students.slice(0,2).map(x=>make(x.klass,4,5,x.name,x.id));
let now=Date.now();
let duel=simulate(entries,5);
assert.equal(duel.summary.standings.length,2);
assert.ok(duel.summary.winner?.id);
assert.match(duel.signature,/^[a-f0-9]{64}$/);
assert.equal(duel.options.arenaMission,5);
console.log('Duel simulated in '+(Date.now()-now)+'ms.');
entries=students.map(x=>make(x.klass,4,5,x.name,x.id));
now=Date.now();
let m5=simulate(entries,5);
assert.equal(m5.summary.standings.length,30);
assert.ok(m5.summary.winner.id);
console.log('30-person M5 simulated in '+(Date.now()-now)+'ms.');
entries=students.slice(0,4).map(x=>make(x.klass,10,10,x.name,x.id));
now=Date.now();
let m10=simulate(entries,10);
assert.equal(m10.summary.standings.length,4);
assert.ok(m10.summary.winner.id);
console.log('4-person M10 simulated in '+(Date.now()-now)+'ms.');
const h=Array.from({length:5},()=>simulate(students.slice(0,2).map(x=>make(x.klass,4,5,x.name,x.id)),5));
assert.equal(h.length,5);
console.log('PASS: duel and M5/M10 official simulations, 30 slots, earned budgets, 120 talents.');

'use strict';
// F.1: the cinematographic director is a read-only observer of the battle.
// No changes to damage, hero movement, winner, talents, class or XP.
const assert=require('node:assert/strict');
const {createDirector}=require('../v5/camera-director.js');
const E=require('../v5/phase2-combat.js');
const classes=['warrior','mage','hunter','guardian'];
const roster=Array.from({length:30},(_,j)=>({id:'f'+j,x:j%6*4,z:Math.floor(j/6)*4,
 alive:true,build:{klass:classes[j%4]},hp:90,stats:{hp:100}}));
{
 const d=createDirector();
 assert.equal(d.tick(0,roster),null,'Off by default');
 d.start();
 const first=d.tick(0,roster);
 assert.equal(first.mode,'overview');
 assert.equal(d.tick(1,roster),first,'Hold protects against rapid cuts');
 const h=roster[4],target=roster[5];
 d.observe({time:4.3,type:'talent',hero:h.id,target:target.id},roster);
 const duel=d.tick(4.3,roster);
 assert(duel.mode==='duel'||duel.mode==='highlight');
 assert(duel.ids.includes(h.id));
 assert.equal(d.tick(4.5,roster),duel,'Hysteresis protects shot for min hold');
 // Coverage should extend to multiple classes, not always highest damage.
 for(let t=10;t<80;t+=5){
  const actor=roster[(t*7)%30],victim=roster[((t*7)+1)%30];
  d.observe({time:t,type:'talent',hero:actor.id,target:victim.id},roster);
  d.tick(t,roster);
 }
 const coverage=d.snapshot().coverage;
 assert(new Set(Object.keys(coverage)).size>=4,'Camera must distribute screen time');
 assert(d.snapshot().cuts<20,'No rapid uncontrolled camera changes');
 // Lost target cannot remain the subject after hold; never select a dead actor.
 const last=d.snapshot().plan.ids[0];roster.find(f=>f.id===last).alive=false;
 d.tick(80,roster);
 const next=d.snapshot().plan;
 assert(!next.ids.includes(last),'Do not focus eliminated actor');
 const finalists=roster.filter(f=>f.alive).slice(0,2);
 const climax=d.tick(90,finalists);
 assert.equal(climax.mode,'climax');
 const champion=d.tick(90.15,[finalists[0]]);
 assert.equal(champion.mode,'victory','Winner shot has priority over hold timer');
 assert.equal(champion.ids[0],finalists[0].id);
 d.stop();assert.equal(d.tick(95,roster),null);
 d.reset();assert.equal(d.snapshot().cuts,0);
}
function run(seed,count,withCamera){
 const entries=Array.from({length:count},(_,j)=>{
  const klass=classes[j%4];
  return {id:'hero'+j,approvedMissions:5,build:E.exampleBuild(klass,klass+' '+j,5,Math.floor(j/4)%11)};
 });
 const battle=E.battle(entries,{
  seed,limit:145,arenaScale:5,damageScale:.5,mageDamageBonus:1.1,
  stormDelay:40,stormRateFactor:.55,engagementMode:'spaced',
  navigationMode:'steer',rangedCommitment:'recovery',balancePreset:'e-hp2'
 });
 const d=createDirector();if(withCamera)d.start();
 for(let i=0;i<3000&&!battle.finished;i++){
  const frame=battle.update(.05);
  if(withCamera){for(const event of frame.events)d.observe(event,battle.fighters);d.tick(frame.time,battle.fighters)}
 }
 const result=battle.result();
 assert(result.finished,'Battle must finish without camera ever changing its outcome');
 if(withCamera)assert(d.snapshot().cuts>=2,'Director must produce real distinct shots');
 return {result,camera:withCamera?d.snapshot():null};
}
for(const n of [4,30]){
 const first=run(4175863657,n,true),other=run(4175863657,n,false);
 assert.deepEqual(first.result,other.result,'Director may NEVER mutate the simulation');
 assert(first.camera.history.some(x=>x.mode==='victory'),'Winner receives a final shot');
 assert(first.camera.history.some(x=>x.mode==='climax'),'Last combatants receive a climax shot');
 console.log('PASS F.1 '+n+' combatants '+first.camera.cuts+' camera plans, unchanged winner '+first.result.winner.klass);
}

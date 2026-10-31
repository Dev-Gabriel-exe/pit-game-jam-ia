'use strict';
// F.3: local role transition; one director plan for teacher and every spectator.
// It does not claim network-connected student identities (reserved for H).
const assert=require('node:assert/strict');
const {createViewer}=require('../v5/camera-viewer.js');
const {createDirector}=require('../v5/camera-director.js');
const P=require('../v5/phase2-combat.js');
const list=Array.from({length:30},(_,i)=>({id:'p'+i,x:i%6*5,z:Math.floor(i/6)*5,alive:true}));
const v=createViewer({feedId:'same-local-director'});
assert.equal(v.state().mode,'teacher');
assert.equal(v.selectStudent('unknown',list),null);
assert.equal(v.state().studentId,null,'Unknown participant must never be followed');
const sel=v.selectStudent('p12',list);
assert.equal(sel.mode,'following');
assert.equal(v.update(list),null,'No false elimination');
const d=createDirector();d.start();
const shot=d.tick(0,list),feed0=v.publicFeed(shot);
assert.equal(feed0.feedId,'same-local-director');
assert.equal(feed0.schema,'pit-v5-camera-feed-v1');
assert.deepEqual(feed0.ids,[]);
assert.equal(v.state().mode,'following');
const next=list.map(f=>({...f}));next[12].alive=false;
const crossed=v.update(next);
assert.equal(crossed.mode,'spectating');
assert.equal(crossed.studentId,'p12');
assert.equal(v.update(next),null,'Elimination triggers exactly one camera transition');
const plan=d.tick(5,next),feed1=v.publicFeed(plan);
assert.equal(feed1.feedId,feed0.feedId,'Spectators use same director identity');
assert(feed1.revision>feed0.revision);
const frozen=JSON.stringify(feed1);
assert.deepEqual(JSON.parse(frozen),feed1,'Future H protocol can serialize feed without user data');
assert.equal(v.selectStudent('p12',next).mode,'spectating','Dead hero cannot return to own camera');
assert.equal(v.teacher().mode,'teacher');
assert.equal(v.state().studentId,null);
assert.equal(d.snapshot().revision,feed1.revision,'Role changes may not reset the global director');
v.reset();assert.equal(v.state().mode,'teacher');
assert.equal(v.state().revision,0);
assert.equal(v.history().length,0);
assert.equal(v.publicFeed(null),null);
const CLASSES=['warrior','mage','hunter','guardian'];
function fight(withViewer){
 const actors=Array.from({length:4},(_,i)=>{const k=CLASSES[i];return{id:'phase2-'+i+'-'+k,
 approvedMissions:5,build:P.exampleBuild(k,k,5,0)}});
 const game=P.battle(actors,{seed:4175863657,limit:145,arenaScale:5,damageScale:.5,mageDamageBonus:1.1,
 stormDelay:40,stormRateFactor:.55,engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'});
 const viewer=createViewer(),director=createDirector();
 if(withViewer){viewer.selectStudent(actors[0].id,game.fighters);director.start()}
 for(let i=0;i<3000&&!game.finished;i++){
  const batch=game.update(.05);
  if(withViewer){
   for(const ev of batch.events)director.observe(ev,game.fighters);
   viewer.update(game.fighters);director.tick(batch.time,game.fighters);
  }
 }
 if(withViewer){
  assert.equal(viewer.state().mode,'spectating');
  assert.equal(viewer.publicFeed(director.snapshot().plan).mode,'victory');
 }
 return game.result();
}
assert.deepEqual(fight(true),fight(false),'Student view cannot influence the winner/damage/talent casts');
console.log('PASS F.3: alive -> same spectator feed exactly once, role return, no fake IDs, deterministic battle unchanged.');

'use strict';
// E checkpoint: opt-in target-spreading is geometric, not forced outcomes.
// The older 'free' mode and all old callers remain deterministic and stable.
const assert=require('node:assert/strict');
const ENGINE=require('../v5/phase2-combat.js');
const CLASSES=['warrior','mage','hunter','guardian'];
const roster=(n)=>Array.from({length:n},(_,i)=>{
 const klass=CLASSES[i%4],name=klass+' E '+i;
 return {id:'e-'+i,name,build:ENGINE.exampleBuild(klass,name,5,Math.floor(i/4)%11),approvedMissions:5};
});
function run(n,seed,mode){
 const opt={seed,limit:145,arenaScale:5,damageScale:.5,mageDamageBonus:1.1,
  stormDelay:40,stormRateFactor:.55,engagementMode:mode};
 const sim=ENGINE.battle(roster(n),opt);
 let focus3=0,frames=0,maxAttackers=0,targetSamples=0;
 for(let i=0;i<2800&&!sim.finished;i++){
  const step=sim.update(.05);
  if(i%10===0){
   const active=sim.fighters.filter(f=>f.alive);
   const map=new Map();
   for(const f of active){
    if(!active.some(e=>e.id===f.lastTarget))continue;
    targetSamples++;
    map.set(f.lastTarget,(map.get(f.lastTarget)||0)+1);
   }
   const highest=Math.max(0,...map.values());maxAttackers=Math.max(maxAttackers,highest);
   if(highest>=3)focus3++;
   frames++;
  }
  if(step.finished)break;
 }
 const result=sim.result();
 return {time:result.time,focus3,frames,maxAttackers,targetSamples,
  hero:result.winner?.klass||'none',
  skills:result.events.filter(x=>x.type==='talent').length,
  knocks:result.events.filter(x=>x.type==='knockout').length,
  result};
}
for(const n of [4,30]){
 const seeds=n===30?10:16;
 const aggregate={free:{time:0,focus3:0,frames:0,skills:0,winners:{}},spaced:{time:0,focus3:0,frames:0,skills:0,winners:{}}};
 for(let i=0;i<seeds;i++){
  const seed=44041+i*2029;
  const original=run(n,seed,'free'),spread=run(n,seed,'spaced'),replay=run(n,seed,'spaced');
  assert.deepEqual(spread.result,replay.result,'same seed must replay exactly with optional E targeting');
  for(const [name,r] of [['free',original],['spaced',spread]]){
   assert(r.targetSamples>0&&r.maxAttackers<=n-1,'selection remains valid');
   const a=aggregate[name];
   a.time+=r.time;a.focus3+=r.focus3;a.frames+=r.frames;a.skills+=r.skills;
   a.winners[r.hero]=(a.winners[r.hero]||0)+1;
  }
 }
 const data=Object.fromEntries(Object.entries(aggregate).map(([k,v])=>[k,{
  avgSeconds:+(v.time/seeds).toFixed(1),
  crowdedFrameRate:+(100*v.focus3/v.frames).toFixed(1),
  avgSkills:+(v.skills/seeds).toFixed(1),winners:v.winners
 }]));
 console.log('E TARGET MATRIX '+n+' heroes '+seeds+' seeds '+JSON.stringify(data));
}
console.log('PASS E optional spaced aggro remains seeded and free mode preserves legacy targeting');

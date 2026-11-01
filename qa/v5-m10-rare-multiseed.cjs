'use strict';
// H.3/M10: an independent rare-proc seed for a second real WebGL camera pass.
// Purely fictional roster; never reads accounts, XP, classroom or database.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const P=require('../v5/phase2-combat.js');
const H=require('../v5/progression-contract-h0.js');
const R=require('../v5/m10-visual-roster.js');
const primary=JSON.parse(fs.readFileSync('qa/v5-m10-rare-equipped-seed.json','utf8'));
const variant=9;
const keys=['guardian:J08','hunter:P09','mage:A07'];
const roster=R.createRoster(P,H.createPolicy(P.TALENTS),{count:30,variant});
const owners=new Map(roster.map(h=>[h.id,h]));
assert.equal(roster.length,30);
for(const h of roster){
 assert.equal(h.build.talents.length,10);
 assert.equal(new Set(h.build.talents).size,10);
 assert.equal(Object.values(h.build.attributes).reduce((a,b)=>a+b,0),20);
}
const options={arenaMission:10,arenaScale:5,limit:145,damageScale:.5,
 mageDamageBonus:1.10,stormDelay:40,stormRateFactor:.55,
 engagementMode:'spaced',navigationMode:'steer',
 rangedCommitment:'recovery',balancePreset:'e-hp2'};
let selected=null,checked=0;
for(let i=0;i<80;i++){
 const seed=(i%2?4175863657+Math.floor(i/2):20261101+Math.floor(i/2)*17)>>>0;
 if(seed===primary.seed)continue;
 const battle=P.battle(roster,{...options,seed}).run(3000);
 assert(battle.finished&&battle.winner?.id&&battle.standings.length===30,
  'Alternate seed must complete with 30 fictional participants');
 const procs=Object.fromEntries(keys.map(k=>[k,0]));
 for(const event of battle.events){
  if(event.type!=='proc'||!event.talent)continue;
  const owner=owners.get(event.hero);
  assert(owner,'Proc from unknown participant');
  const key=owner.build.klass+':'+event.talent;
  if(Object.hasOwn(procs,key)){
   assert(owner.build.talents.includes(event.talent),'Proc from unequipped talent');
   procs[key]++;
  }
 }
 const score=Object.values(procs).filter(n=>n>0).length;
 checked++;
 if(score>0&&(!selected||score>selected.score||
  (score===selected.score&&Object.values(procs).reduce((a,b)=>a+b,0)>
   Object.values(selected.procs).reduce((a,b)=>a+b,0))))
  selected={seed,score,procs,winnerClass:battle.winner.klass,events:battle.events};
 if(score===3)break;
}
assert(selected&&selected.seed!==primary.seed,
 'No independent seed with a genuine rare proc was found');
const replay=P.battle(roster,{...options,seed:selected.seed}).run(3000);
assert.deepEqual(replay.events,selected.events,'Alternate seed replay must be deterministic');
assert.equal(replay.winner.klass,selected.winnerClass);
const fixture={schema:'m10-rare-equipped-alt-seed-v1',synthetic:true,variant,
 seed:selected.seed,procs:selected.procs,distinctRareProcs:selected.score,
 checkedSeeds:checked,primarySeed:primary.seed,m5Regression:'covered-by-primary-gate',
 physicalPCsValidated:false,humanVisualApproval:false,
 limitation:'A proc is not proof of a visible effect; second seed must pass real WebGL cue checks.'};
fs.writeFileSync('qa/v5-m10-rare-alt-seed.json',JSON.stringify(fixture,null,2)+'\n');
console.log('PASS independent M10 rare seed and deterministic replay: '+JSON.stringify(fixture));

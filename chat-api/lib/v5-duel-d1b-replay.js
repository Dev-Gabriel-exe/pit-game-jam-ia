'use strict';
/*
 * D.1b deterministic authoritative combat generator. Runs on the SERVER only.
 * Uses an exact pinned copy of the approved Phase2 combat engine; the browser
 * receives immutable poses/events, never runs a private winner calculation.
 */
const {createHash}=require('node:crypto');
const P=require('./v5-duel-phase2-engine.js');
const C=require('./v5-build-v2-contract.js');
const REPLAY_VERSION=1;
const PLAYBACK_RATE=1.7;
const TICK=.05,KEYFRAME_EVERY=4,MAX_STEPS=1500;
function validEntry(raw){
 if(!raw||!['left','right'].includes(raw.side))throw Error('D1b: lado inválido');
 if(!Number.isInteger(raw.approved)||raw.approved<0||raw.approved>10)
  throw Error('D1b: aprovações de servidor inválidas');
 const approved=C.normalizeBuild(raw.build,raw.approved);
 const name=String(raw.name||'Aventureiro').slice(0,40);
 return {side:raw.side,name,approved,
  build:{klass:approved.klass,attributes:{...approved.attributes},talents:[...approved.talents]}};
}
function snapshot(sim){
 return {t:+sim.time.toFixed(2),
  heroes:sim.fighters.map(f=>({
   side:f.id,x:+f.x.toFixed(3),z:+f.z.toFixed(3),
   face:+f.face.toFixed(3),hp:+Math.max(0,f.hp).toFixed(2),
   maxHp:+f.stats.hp.toFixed(2),shield:+Math.max(0,f.shield).toFixed(2),
   alive:!!f.alive,animation:String(f.animation||'idle').slice(0,20)
  }))
 };
}
function cleanEvent(ev){
 const output={t:ev.time,seq:ev.seq,type:ev.type};
 for(const prop of ['hero','target','talent','skill','kind']){
  if(typeof ev[prop]==='string'&&ev[prop].length<=60)
   output[prop]=ev[prop];
 }
 if(typeof ev.amount==='number'&&Number.isFinite(ev.amount))
  output.amount=Math.round(ev.amount*10)/10;
 return output;
}
function createReplay(participants,{seed,stage}={}){
 if(!Array.isArray(participants)||participants.length!==2)
  throw Error('D1b: exatamente dois heróis são necessários');
 if(!Number.isInteger(stage)||stage<1||stage>10||
    !Number.isInteger(seed)||seed<1||seed>2147483646)
  throw Error('D1b: missão ou seed inválida');
 const left=validEntry(participants[0]),right=validEntry(participants[1]);
 if(left.side!=='left'||right.side!=='right')throw Error('D1b: ordem dos lados inválida');
 // The engine has a five-mission path and an experimental M10 path, not a
 // native 6–9 mode. For those stages we use the opt-in M10 physics, but never
 // grant a single unapproved point or talent: both builds were server-validated.
 const experimental=left.approved>5||right.approved>5;
 const arenaMission=experimental?10:5;
 const entries=[left,right].map(a=>({
  id:a.side,name:a.name,
  approvedMissions:experimental?10:a.approved,
  finalTrial:experimental,
  build:{klass:a.build.klass,attributes:a.build.attributes,
   talents:a.build.talents,name:a.name}
 }));
 const sim=P.battle(entries,{
  seed,limit:65,arenaScale:1,
  engagementMode:'spaced',navigationMode:'steer',rangedCommitment:'recovery',
  balancePreset:experimental?'m10-classpass1':'baseline',
  arenaMission
 });
 const frames=[snapshot(sim)];
 for(let tick=0;tick<MAX_STEPS&&!sim.finished;tick++){
  sim.update(TICK);
  if((tick+1)%KEYFRAME_EVERY===0||sim.finished)frames.push(snapshot(sim));
 }
 if(!sim.finished||!sim.winner||frames.length<2)
  throw Error('D1b: combate não concluiu com vencedor autoritativo');
 const ending=sim.result();
 const last=frames.at(-1);
 const t=+ending.time.toFixed(2);
 if(last.t!==t)frames.push(snapshot(sim));
 const winnerSide=sim.winner.id;
 const payload={
  schema:'pit-v5-duel-replay-v1',stage,seed,
  engineVersion:P.VERSION,
  engineMode:experimental?'upper-mission-sandbox':'approved-m5-engine',
  playbackRate:PLAYBACK_RATE,duration:t,
  participants:[left,right].map(p=>({
   side:p.side,name:p.name,klass:p.build.klass,
   approvedMissions:p.approved,talents:[...p.build.talents]
  })),
  frames,
  events:sim.events.slice(0,2400).map(cleanEvent),
  winnerSide,
  standings:ending.standings.map(f=>({
   side:f.id,hp:+Math.max(0,f.hp).toFixed(1),
   damage:+f.damage.toFixed(1),kills:f.kills
  }))
 };
 if(sim.events.length>2400)throw Error('D1b: limite de eventos excedido; sem truncar combate');
 const serialized=JSON.stringify(payload);
 if(serialized.length>850000)throw Error('D1b: replay excede limite de armazenamento');
 return Object.freeze({
  payload,sha256:createHash('sha256').update(serialized).digest('hex'),
  winnerSide,realDurationSeconds:Math.max(1,Math.ceil(t/PLAYBACK_RATE))
 });
}
module.exports=Object.freeze({createReplay,REPLAY_VERSION,PLAYBACK_RATE});

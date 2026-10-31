'use strict';
/* Mock DB contract tests: token/name verification, XP anti-cheat, review anti-spam.
   Does NOT replace staging integration with a real Neon DB before live deployment. */
const assert=require('node:assert/strict'),Module=require('node:module');
const own='11111111-1111-4111-8111-111111111111',peer='22222222-2222-4222-8222-222222222222',other='33333333-3333-4333-8333-333333333333';
let stage=1,saved=null,score=null,review=null;
process.env.DATABASE_URL='postgresql://not-connected/test';
process.env.PIT_TEACHER_PIN='pit-v5-test-teacher-pin-1234';
const database={
 async query(sql,args=[]){
  if(sql.includes('token_hash'))return {rowCount:1,rows:[{id:own,display_name:'Nome do cadastro original'}]};
  if(sql.includes('SELECT COUNT(*)::int AS approved'))return {rowCount:1,rows:[{approved:3}]};
  if(sql.includes('round(avg(score))::int'))return {rowCount:score==null?0:1,rows:score==null?[]:[{target_id:peer,review_score:score}]};
  if(sql.includes('SELECT build,updated_at'))return {rowCount:saved?1:0,rows:saved?[{build:saved,updated_at:new Date().toISOString()}]:[]};
  if(sql.includes('SELECT current_stage'))return {rowCount:1,rows:[{current_stage:stage}]};
  if(sql.includes('SELECT target_id,score,created_at'))return {rowCount:review?1:0,rows:review?[review]:[]};
  if(sql.includes('INSERT INTO pit_hero_builds')){saved=JSON.parse(args[1]);return {rowCount:1,rows:[]}};
  if(sql.includes('SELECT id FROM pit_students WHERE id='))return {rowCount:args[0]===peer?1:0,rows:args[0]===peer?[{id:peer}]:[]};
  if(sql.includes('INSERT INTO pit_peer_reviews')){
   if(review)return {rowCount:0,rows:[]};
   review={target_id:args[1],score:args[2],comment:args[3]};
   score=args[2];return {rowCount:1,rows:[{score}]};
  }
  if(sql.includes('SELECT id,display_name,last_seen_at'))return {rowCount:2,rows:[{id:own,display_name:'Nome do cadastro original'},{id:peer,display_name:'Colega 02'}]};
  if(sql.includes('SELECT student_id,COUNT'))return {rowCount:1,rows:[{student_id:own,approved:3}]};
  if(sql.includes('SELECT student_id,build'))return {rowCount:saved?1:0,rows:saved?[{student_id:own,build:saved}]:[]};
  if(sql.includes('SELECT id,display_name FROM pit_students WHERE room_code=$1 AND id<>$2'))return {rowCount:1,rows:[{id:peer,display_name:'Colega 02'}]};
  if(sql.includes('DELETE FROM pit_peer_reviews')){review=null;score=null;return {rowCount:1,rows:[{evaluator_id:own}]}};
  throw Error('Unexpected SQL '+sql.slice(0,150));
 }
};
const old=Module._load;
Module._load=function(spec,...args){if(spec==='pg')return {Pool:class {query(...params){return database.query(...params)}}};return old.call(this,spec,...args)};
const handler=require('../chat-api/api/arena.js');
Module._load=old;
async function call(action,method='GET',body={},role='student'){
 const headers={'origin':'http://localhost:8899'};
 headers[role==='teacher'?'x-pit-teacher-pin':'x-pit-student-token']=role==='teacher'?process.env.PIT_TEACHER_PIN:'a'.repeat(64);
 let code=200,output;
 const res={setHeader(){return this},status(v){code=v;return this},json(v){output=v;return this},end(){return this}};
 await handler({headers,method,query:{action},body},res);
 return {code,data:output};
}
(async()=>{
 let r=await call('me');assert.equal(r.code,200);assert.equal(r.data.hero.name,'Nome do cadastro original');
 assert.equal(r.data.hero.progress.total,300);assert.equal(r.data.hero.build.level,4);
 const spoof={klass:'mage',name:'Falsifiquei o nome',xp:9999,attributes:{power:50,spirit:50,agility:50,vitality:50},talents:{}};
 r=await call('build','POST',{build:spoof});assert.equal(r.code,400,'Cannot buy attributes with client XP');
 const valid={klass:'mage',name:'Nome falsificado',xp:9999,attributes:{power:2,spirit:3,agility:0,vitality:4},talents:{rune:1}};
 r=await call('build','POST',{build:valid});assert.equal(r.code,200);
 assert.equal(r.data.hero.name,'Nome do cadastro original');
 assert.equal(r.data.hero.progress.total,300);
 assert.equal(r.data.hero.build.attributes.spirit,3);
 assert.equal(saved.name,undefined,'DB must not store a spoofed display name');
 assert.equal(saved.xp,undefined,'DB must not store spoofed XP');
 r=await call('roster');assert.equal(r.code,403,'Students cannot obtain entire class roster');
 r=await call('review','POST',{targetId:peer,score:10,comment:'O jogo funcionou durante nosso teste e mostrou a vitória.'});
 assert.equal(r.code,403,'Review is locked until mission 9');
 stage=9;
 r=await call('review','POST',{targetId:own,score:10,comment:'Tentei me avaliar de propósito.'});
 assert.equal(r.code,400,'Self-review denied');
 r=await call('review','POST',{targetId:peer,score:11,comment:'Nota maliciosa acima do permitido.'});
 assert.equal(r.code,400);
 r=await call('review','POST',{targetId:peer,score:10,comment:'O jogo funcionou durante nosso teste e mostrou a vitória.'});
 assert.equal(r.code,200);assert.equal(r.data.peerReviewXp,30);
 r=await call('review','POST',{targetId:peer,score:0,comment:'Outra tentativa de avaliação duplicada.'});
 assert.equal(r.code,409,'Prevent score farming by duplicate reviews');
 r=await call('roster','GET',{},'teacher');
 assert.equal(r.code,200);
 assert.equal(r.data.heroes.length,2);
 assert.equal(r.data.heroes[0].name,'Nome do cadastro original');
 assert.equal(r.data.heroes[0].progress.total,300);
 assert.equal(r.data.heroes[1].progress.reviewXp,30,'Review bonus is for target, not evaluator');
 r=await call('moderate','POST',{evaluatorId:own},'teacher');
 assert.equal(r.code,200);assert.equal(review,null,'Teacher should be able to cancel abusive review');
 console.log('PASS: V5 API token-gated student identity and teacher-only roster, XP injection rejected, locked review, no self-rating, one review each, 0-10 bounds, bonus target, teacher moderation');
})().catch(e=>{console.error(e);process.exitCode=1});

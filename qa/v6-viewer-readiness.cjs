'use strict';
// Exercise the real replay controller with deliberately delayed GPU assets.
// Only the browser/Three boundary is replaced; no production accounts or API.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const match={kind:'duel',mission:5,seed:123,sha256:'a'.repeat(64),options:{arenaMission:5},
 roster:[{id:'a',name:'A',build:{schema:'fixture'}},{id:'b',name:'B',build:{schema:'fixture'}}],result:{winner:{id:'a',name:'A'}}};
function element(){return {dataset:{},children:[],disabled:true,hidden:true,textContent:'',
 replaceChildren(){this.children=[]},appendChild(n){this.children.push(n)},addEventListener(){}}}
(async()=>{
 const nodes=new Map(),events={},timers=new Set();let resumes=0,disposals=0,attempts=0;const cameras=[];
 const get=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)};
 const stage={simulation:{fighters:[{id:'a',name:'A',alive:true,hp:20},{id:'b',name:'B',alive:true,hp:20}],time:0,finished:false,result(){return {winner:{id:'a'}}}},
  fighters(){attempts++;this.simulation.finished=false;get('arenaStage').dataset.v5ModelsLoaded='0';get('arenaStage').dataset.v5ModelsFailed='0'},
  enableAutoCamera(){cameras.push('director')},setStudentCamera(id){cameras.push(id);return true},resume(){resumes++},pause(){},dispose(){disposals++}};
 const win={parent:{},PIT_V5_PHASE2:{VERSION:'fixture'},addEventListener(k,fn){events[k]=fn}};
 const context=vm.createContext({window:win,document:{getElementById:get,createElement:element},location:{origin:'https://fixture.invalid'},
  setInterval(fn){timers.add(fn);return fn},clearInterval(fn){timers.delete(fn)},console});
 const module=new vm.SourceTextModule(fs.readFileSync('v5/coliseum-live.js','utf8'),{context});
 await module.link(()=>new vm.SyntheticModule(['createStage'],function(){this.setExport('createStage',()=>stage)},{context}));
 await module.evaluate();
 events.message({source:win.parent,origin:'https://fixture.invalid',data:{type:'PIT_COLISEUM_REPLAY',match,studentHeroId:process.env.PIT_CAMERA_TEST_ROLE==='teacher'?null:'b'}});
 const expectedCamera=process.env.PIT_CAMERA_TEST_ROLE==='teacher'?['director']:['director','b'];
 assert.deepEqual(cameras,expectedCamera);
 assert.equal(attempts,1);
 assert.equal(get('playReplay').disabled,true,'Replay must wait for both genuine GLBs, as the isolated V5 did');
 get('playReplay').onclick();assert.equal(resumes,0,'Click during loading cannot start invisible combat');
 get('arenaStage').dataset.v5ModelsLoaded='1';for(const tick of timers)tick();
 assert.equal(get('playReplay').disabled,true,'One loaded model is insufficient');
 get('arenaStage').dataset.v5ModelsLoaded='2';for(const tick of timers)tick();
 assert.equal(get('playReplay').disabled,false);
 get('playReplay').onclick();assert.equal(resumes,1,'Two real loaded models permit playback');
 stage.simulation.finished=true;for(const tick of timers)tick();
 assert.equal(get('resultPanel').hidden,false);
 get('playReplay').onclick();assert.equal(attempts,2);assert.deepEqual(cameras,[...expectedCamera,...expectedCamera]);
 assert.equal(resumes,1,'Replay restart must also wait for newly attached models');
 get('arenaStage').dataset.v5ModelsLoaded='2';for(const tick of timers)tick();
 assert.equal(resumes,2,'Completed battle can restart when cached real models are reattached');
 events.pagehide();assert.equal(disposals,1);assert.equal(timers.size,0);
 console.log('PASS V6 replay waits for both real models and releases its monitor and stage');
})().catch(e=>{console.error(e);process.exitCode=1});

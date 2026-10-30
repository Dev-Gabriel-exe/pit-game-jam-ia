'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('v5/arena-audio.js','utf8');
 const {createArenaAudio}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 let starts=0,closed=0,resumes=0;
 const chain={connect(){return this}};
 class AudioContextMock{
  constructor(){this.state='suspended';this.currentTime=1;this.sampleRate=44100;this.destination={};}
  resume(){this.state='running';resumes++;return Promise.resolve()}
  close(){closed++;return Promise.resolve()}
  createOscillator(){return {frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return chain},start(){starts++},stop(){},set type(v){}}}
  createGain(){return {gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return chain}}}
  createBuffer(ch,n){return {getChannelData(){return new Float32Array(n)}}}
  createBufferSource(){return {connect(){return chain},start(){starts++},set buffer(v){}}}
  createBiquadFilter(){return {frequency:{value:0},connect(){return chain},set type(v){}}}
 }
 const a=createArenaAudio({AudioContextClass:AudioContextMock});
 assert.equal(a.play('hit',1000),false,'No autoplay before user gesture');
 assert.equal(a.unlock(),true);await Promise.resolve();assert.equal(resumes,1);
 for(const kind of ['hit','shield','talent','knockout','victory'])assert.equal(a.play(kind,1000),true,kind);
 assert.equal(a.play('hit',1010),false,'Hit spam throttled');
 assert.equal(a.play('hit',1200),true,'Hit resumes after cooldown');
 assert.equal(a.play('talent',1500,{distance:60,pan:0}),false,'Distant combat inaudible');
 assert.equal(a.play('talent',1500,{distance:3,pan:.7}),true,'Nearby talent audible');
 assert.ok(starts>=10,'Synthesizer generated distinct events');
 a.dispose();assert.equal(closed,1);assert.equal(a.play('victory',10000),false);
 const noAudio=createArenaAudio({AudioContextClass:null});
 assert.equal(noAudio.unlock(),false);assert.equal(noAudio.play('hit'),false);
 console.log('PASS V5 audio: user gesture, cues, throttling, winner, disposal, unsupported browser');
})().catch(e=>{console.error(e);process.exitCode=1});

'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('v5/arena-audio.js','utf8');
 const {createArenaAudio}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 let starts=0,closed=0,resumes=0;
 const gains=[],pans=[];
 const chain={connect(){return this}};
 class AudioContextMock{
  constructor(){this.state='suspended';this.currentTime=1;this.sampleRate=8000;this.destination={};}
  resume(){this.state='running';resumes++;return Promise.resolve()}
  close(){closed++;return Promise.resolve()}
  createOscillator(){return {frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return chain},start(){starts++},stop(){},set type(v){}}}
  createGain(){const gain={value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}};gains.push(gain);return {gain,connect(){return chain}}}
  createStereoPanner(){const pan={value:0};pans.push(pan);return {pan,connect(){return chain}}}
  createBuffer(ch,n){return {getChannelData(){return new Float32Array(n)}}}
  createBufferSource(){return {connect(){return chain},start(){starts++},set buffer(v){}}}
  createBiquadFilter(){return {frequency:{value:0},connect(){return chain},set type(v){}}}
 }
 const a=createArenaAudio({AudioContextClass:AudioContextMock});
 assert.equal(a.play('hit',1000,{distance:2}),false,'No autoplay before user gesture');
 assert.equal(a.unlock(),true);await Promise.resolve();assert.equal(resumes,1);
 assert.equal(a.play('hit',1000,{distance:2,pan:-.8}),true);
 assert.equal(a.play('shield',1000,{distance:40,pan:.6}),true);
 assert.equal(a.play('talent',1000,{distance:2}),true);
 assert.equal(a.play('knockout',1000,{distance:2}),false,'Three-voice budget');
 assert.equal(a.play('victory',1000),true,'Global victory exempt from voice limit');
 assert.equal(a.play('hit',1010,{distance:2}),false,'Hit cooldown');
 assert.equal(a.play('hit',1200,{distance:2}),true,'Hit resumes after cooldown');
 assert.equal(a.play('talent',1500,{distance:151}),false,'Far sound inaudible');
 assert.equal(a.play('talent',1500,null),false,'Missing source never plays globally');
 assert.equal(a.play('talent',1500,{distance:3,pan:.7}),true,'Nearby talent audible');
 assert.ok(gains.some(g=>g.value>0&&g.value<.2),'Far channel attenuated');
 assert.ok(pans.some(p=>p.value<0)&&pans.some(p=>p.value>0),'Directional stereo');
 assert.ok(starts>=10,'Synthesizer generated distinct events');
 a.dispose();assert.equal(closed,1);assert.equal(a.play('victory',10000),false);
 class BrokenAudio extends AudioContextMock{createOscillator(){throw Error('device disconnected')}}
 const broken=createArenaAudio({AudioContextClass:BrokenAudio});
 assert.equal(broken.unlock(),true);await Promise.resolve();
 assert.equal(broken.play('hit',2000,{distance:1}),false,'Audio exception isolated');
 broken.dispose();
 const noAudio=createArenaAudio({AudioContextClass:null});
 assert.equal(noAudio.unlock(),false);assert.equal(noAudio.play('hit'),false);
 console.log('PASS V5 spatial audio: gesture, 3 voices, distance, pan, failure isolation');
})().catch(e=>{console.error(e);process.exitCode=1});

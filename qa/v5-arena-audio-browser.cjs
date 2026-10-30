'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.__arenaAudio={starts:0,oscillators:0,noise:0,resumes:0,closes:0};
   const track=window.__arenaAudio;
   const chain={connect(){return this}};
   class FakeAudioContext{
    constructor(){this.state='suspended';this.currentTime=0;this.sampleRate=8000;this.destination={};}
    resume(){track.resumes++;this.state='running';return Promise.resolve()}
    close(){track.closes++;this.state='closed';return Promise.resolve()}
    createOscillator(){track.oscillators++;return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){},set value(v){}},connect(){return chain},start(){track.starts++},stop(){},set type(v){}}}
    createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},set value(v){}},connect(){return chain}}}
    createBuffer(c,n){return {getChannelData(){return new Float32Array(n)}}}
    createBufferSource(){track.noise++;return {connect(){return chain},start(){track.starts++},set buffer(v){}}}
    createBiquadFilter(){return {frequency:{value:0},connect(){return chain},set type(v){}}}
   }
   window.AudioContext=FakeAudioContext;window.webkitAudioContext=FakeAudioContext;
  });
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?phase2=1&count=30&nav=steer&counterplay=1&balance=hp2&seed=4175863657',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:150000});
  assert.equal((await page.evaluate(()=>window.__arenaAudio.starts)),0,'No autoplay before start');
  await page.locator('#enableBattleAudio').click();
  await page.waitForFunction(()=>window.__arenaAudio.resumes>0,null,{timeout:10000});
  for(let i=0;i<4;i++)await page.locator('#speedBattle').click();
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>window.__arenaAudio.starts>10,null,{timeout:120000}).catch(async e=>{throw Error('No audio starts: '+JSON.stringify(await page.evaluate(()=>({audio:window.__arenaAudio,playing:window.PIT_V5_ARENA_LAB?.finished,stage:document.querySelector('#arenaStage')?.dataset.v5AudioState,status:document.querySelector('#arenaStatus')?.textContent}))))});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.finished,null,{timeout:180000});
  const result=await page.evaluate(()=>({audio:window.__arenaAudio,winner:window.PIT_V5_ARENA_LAB?.winner?.klass,finished:window.PIT_V5_ARENA_LAB?.finished,spectators:Number(document.querySelector('#arenaStage')?.dataset.v5Spectators)}));
  assert.equal(result.finished,true);assert.equal(result.spectators,29);
  assert(result.audio.resumes>=1);assert(result.audio.noise>0);assert(result.audio.oscillators>4);
  assert.deepEqual(errors,[],'Browser errors: '+errors.join(' | '));
  console.log('PASS V5 30 GLB browser audio: '+JSON.stringify(result));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

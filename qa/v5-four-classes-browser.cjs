'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  for(const width of [390,1200]){
   const page=await browser.newPage({viewport:{width,height:850}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/v5/personagens-lab.html',{waitUntil:'domcontentloaded',timeout:40000});
   await page.waitForFunction(()=>window.PIT_V5_SIMPLE_HERO_LAB?.glReady,null,{timeout:30000});
   assert.equal(await page.locator('.class-button').count(),4);
   assert.equal(await page.locator('#claimAvatar').count(),0,'Old 40-piece booking UI removed');
   const observations={};
   for(const [klass,file] of Object.entries({
    warrior:'player_swordsman.glb',hunter:'player_archer.glb',
    mage:'player_priest.glb',guardian:'player_swordsman.glb'
   })){
    await page.locator('.class-button[data-class="'+klass+'"]').click();
    await page.waitForFunction(k=>{
      const stage=document.querySelector('#avatarStage');
      return stage?.dataset.selectedClass===k&&stage?.dataset.loadState==='ready';
     },klass,{timeout:90000});
    assert.equal(await page.locator('#avatarStage').getAttribute('data-source-family'),'tactical-slash');
    assert.equal(await page.locator('#avatarStage').getAttribute('data-model-file'),file);
    const height=Number(await page.locator('#avatarStage').getAttribute('data-model-height'));
    assert(Math.abs(height-2.55)<.035,'All GLBs normalized to same height, got '+height+' '+klass);
    const clips=Number(await page.locator('#avatarStage').getAttribute('data-clips'));
    assert(clips>0,'Non-T-pose idle animation exists for '+klass);
    observations[klass]={file,height:+height.toFixed(3),clips};
   }
   assert.equal(observations.warrior.file,observations.guardian.file);
   assert.deepEqual(errors,[],'No JS exceptions: '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<15,'Mobile horizontal overflow at '+width);
   console.log('PASS '+width+'px four original free 3D models: '+JSON.stringify(observations));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

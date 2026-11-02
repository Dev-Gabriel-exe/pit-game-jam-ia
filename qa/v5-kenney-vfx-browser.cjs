'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1340,height:820}});
  page.on('pageerror',e=>errors.push(e.message));
  const origin='http://127.0.0.1:8899';
  const check=async mission=>{
   await page.goto(origin+'/v5/arena-lab.html?'+(mission===10?'m10preview=1':'phase2=1')+'&count=4&sprites=1&nav=steer',
    {waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5TalentArt==='loaded',null,{timeout:100000});
   const el=page.locator('#arenaStage');
   assert.equal(await el.getAttribute('data-v5-talent-art'),'loaded');
   assert.equal(Number(await el.getAttribute('data-v5-talent-art-sources')),10);
   assert.equal(Number(await el.getAttribute('data-v5-talent-art-styles')),13);
   assert.equal(Number(await el.getAttribute('data-v5-sprite-textures')),104,'No additional GPU textures');
   assert.equal(Number(await el.getAttribute('data-v5-sprite-frames')),8);
   assert.equal(Number(await el.getAttribute('data-v5-sprite-visual-events')),0,'No fake casts');
   await page.waitForFunction(count=>window.PIT_V5_ARENA_LAB?.modelState.loaded===count,4,{timeout:100000});
   if(mission===5){
    // Compare actual pixels painted into the existing real sprite canvas textures
    // with the original procedural-only frame (not just a telemetry counter).
    const proof=await page.evaluate(async()=>{
      const THREE=await import('three');
      const S=window.PIT_V5_TALENT_SPRITES;
      const enhanced=S.makeAtlas(THREE,{quality:'low',artPack:'kenney'});
      const base=S.makeAtlas(THREE,{quality:'low',artPack:'off'});
      await enhanced.artReady;
      const results=[];
      for(const style of S.STYLES){
        const real=enhanced.spawn({style});
        const old=base.spawn({style});
        const a=real.frames[1].image.getContext('2d').getImageData(0,0,80,80).data;
        const b=old.frames[1].image.getContext('2d').getImageData(0,0,80,80).data;
        let difference=0,alpha=0;
        for(let i=0;i<a.length;i+=4){difference+=Math.abs(a[i]-b[i])+Math.abs(a[i+3]-b[i+3]);alpha+=a[i+3]}
        results.push({style,difference,alpha});
        real.mesh.material.dispose();old.mesh.material.dispose();
      }
      const stats={loaded:enhanced.artFilesLoaded,styles:enhanced.artStylesPainted,
        status:enhanced.artStatus,base:base.artStatus,frames:enhanced.frameCount,results};
      enhanced.dispose();base.dispose();return stats;
    });
    assert.equal(proof.status,'loaded');
    assert.equal(proof.base,'off');
    assert.equal(proof.frames,3,'Low quality still uses 3 frames');
    assert(proof.results.every(x=>x.difference>5000&&x.alpha>1000),
      'Real Kenney images must visibly alter every style: '+JSON.stringify(proof));
   }
   await page.locator('#startBattle').click();
   await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5TalentFxEvents||0)>=2,
    null,{timeout:80000});
   const a=await el.evaluate(node=>({
    talents:+node.dataset.v5TalentFxEvents||0,
    active:+node.dataset.v5TalentFxActive||0,
    textures:+node.dataset.v5SpriteTextures||0,
    art:node.dataset.v5TalentArt,
    actorFailures:+node.dataset.v5ModelsFailed||0
   }));
   assert(a.talents>=2);assert(a.active<=18);assert.equal(a.textures,104);
   assert.equal(a.actorFailures,0);assert.equal(a.art,'loaded');
   await page.locator('#resetBattle').click();
   assert.equal(Number(await el.getAttribute('data-v5-talent-fx-active')),0,'no VFX leak across reset');
   console.log('PASS Kenney M'+mission+' real WebGL: 10 PNG, 13 styles, '+a.talents+' genuine talent cues, 18 FX cap, no leaks');
  };
  await check(5);await check(10);
  assert.deepEqual(errors,[],'JS errors: '+errors.join(' | '));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

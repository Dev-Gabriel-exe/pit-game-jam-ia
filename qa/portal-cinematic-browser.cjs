'use strict';
/* Public portal: video, cursor depth, pause, responsive, reduced motion, static fallback. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const report=[];
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,reducedMotion:'no-preference'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/index.html',{waitUntil:'domcontentloaded'});
   await page.locator('#pitPortalHeroVideo').waitFor({timeout:12000});
   const hero=page.locator('#inicio.hero');
   assert(await hero.isVisible(),'Hero not visible');
   assert(await page.locator('.pit-ambient-halo').count(),'Missing parallax ambient layer');
   assert(await page.locator('.pit-hero-mark').count(),'Missing fantasy hero visual');
   const videoResponse=await page.request.get('http://127.0.0.1:8899/v3/assets/missions/portal-planeswalker-307687.mp4',{timeout:16000});
   assert.equal(videoResponse.status(),200,'Missing self-hosted original LTX hero MP4');
   const videoType=videoResponse.headers()['content-type']||'';
   assert.match(videoType,/video\/mp4|application\/octet-stream/,'Invalid MP4 content-type: '+videoType);
   await page.waitForFunction(()=>{const v=document.getElementById('pitPortalHeroVideo');return v&&v.readyState>=2&&v.currentSrc.includes('portal-planeswalker-307687.mp4')},null,{timeout:15000});
   await page.waitForTimeout(300);
   const active=await page.locator('#pitPortalHeroVideo').evaluate(v=>({paused:v.paused,muted:v.muted,loop:v.loop,src:v.currentSrc}));
   assert(active.muted&&active.loop,'Hero must be silent and looped');
   const button=page.locator('#pitPortalMotion');
   await button.click();
   assert(await page.locator('body.pit-motion-paused').count(),'Pause should stop ambient motion');
   assert(await page.locator('#pitPortalHeroVideo').evaluate(v=>v.paused),'Pause must stop video');
   await button.click();
   assert(await page.locator('body.pit-motion-enabled').count(),'Resume should enable motion');
   let pointer='n/a';
   if(viewport.width>900){
    await page.mouse.move(1250,470);
    await page.waitForFunction(()=>getComputedStyle(document.documentElement).getPropertyValue('--pit-halo-x').trim()!=='0px');
    pointer=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--pit-halo-x').trim());
    assert(pointer!=='0px','Cursor parallax not responding');
   }
   const noOverflow=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,heroWidth:document.getElementById('inicio').scrollWidth}));
   assert(noOverflow.documentWidth<=viewport.width+9,'Horizontal overflow at '+viewport.width+': '+JSON.stringify(noOverflow));
   assert(await page.locator('#cadernos .gate-card').count()===3,'Portal entrances changed');
   assert(await page.locator('.mission-card').count()===10,'Mission list changed');
   assert.deepEqual(errors,[],'Browser script errors: '+errors.join(' | '));
   await page.screenshot({path:'qa/portal-cinematic-'+viewport.width+'.png',fullPage:true});
   report.push({width:viewport.width,videoReady:true,videoPausedOnToggle:true,pointer,overflow:noOverflow.documentWidth-viewport.width});
   await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  await reduced.goto('http://127.0.0.1:8899/index.html',{waitUntil:'domcontentloaded'});
  const state=await reduced.evaluate(()=>({hidden:document.getElementById('pitPortalMotion').hidden,src:document.getElementById('pitPortalHeroVideo').currentSrc,motion:document.body.classList.contains('pit-motion-enabled'),poster:!!getComputedStyle(document.querySelector('.pit-hero-media')).backgroundImage}));
  assert(state.hidden&&!state.motion&&!state.src&&state.poster,'Reduced motion fallback incomplete: '+JSON.stringify(state));
  await reduced.close();
  console.log('PASS: cinematic portal with original hero MP4, parallax, pause, responsive and reduced-motion fallback');
  console.log(JSON.stringify({report,reduced:state},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
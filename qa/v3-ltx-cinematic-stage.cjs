'use strict';
/* LTX-first cinematic projection: original MP4, no duplicate decode, keyboard & motion gate. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const report=[];
  for(const dims of [{width:1600,height:900},{width:1280,height:720}]){
   const page=await browser.newPage({viewport:dims,reducedMotion:'no-preference'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1',{waitUntil:'domcontentloaded'});
   await page.locator('#workspace:visible').waitFor({timeout:20000});
   if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
   for(const mission of [1,2,5,10]){
    await page.locator('.stage-btn[data-stage="'+mission+'"]').click();
    await page.locator('#pitProjectorLaunch').click();
    await page.locator('#pitProjector.pit-projector-m01').waitFor();
    const feature=page.locator(mission===1?'.pit-m01-hero-cinema':'.pit-u-cinema-panel');
    assert(await feature.count(),'LTX clip not featured within M'+mission+' first slide');
    const m=await page.locator('#pitProjector').evaluate((root,mission)=>{
     const content=root.querySelector('#pitProjectorContent'),video=content.querySelector('video');
     const art=content.querySelector('.pit-m01-hero-cinema,.pit-u-cinema-panel');
     const card=content.querySelector('.pit-projector-card'),box=card.getBoundingClientRect(),viewport=content.getBoundingClientRect(),artRect=art.getBoundingClientRect();
     return {
      count:content.querySelectorAll('video').length,
      src:video?.getAttribute('src'),poster:video?.getAttribute('poster'),
      image:art.querySelector('img')?.getAttribute('src'),
      hasFallback:!!art.querySelector('img'),
      firstTitle:content.querySelector('h2')?.textContent,
      overflowX:content.scrollWidth>content.clientWidth+8,
      cardHeight:Math.round(card.scrollHeight),viewportHeight:Math.round(content.clientHeight),
      artworkVisible:artRect.width>220&&artRect.height>180&&artRect.left>=viewport.left-8&&artRect.right<=viewport.right+8,
      headerEnabled:!root.querySelector('#pitProjectorMotionToggle').disabled,
      posterIsSame:video.getAttribute('poster')===art.querySelector('img')?.getAttribute('src')
     };
    },mission);
    assert.equal(m.count,1,'Only one LTX video should decode on a chapter cover, M'+mission);
    assert.match(m.src,new RegExp('missao-'+String(mission).padStart(2,'0')+'-motion.mp4$'));
    assert(m.hasFallback&&m.posterIsSame,'WebP poster missing M'+mission);
    assert(!m.overflowX,'Horizontal overflow M'+mission+' '+dims.width);
    assert(m.artworkVisible,'Artwork out of slide bounds M'+mission+' '+dims.width);
    assert(m.cardHeight<=m.viewportHeight+18,'Hero content clipped M'+mission+' '+dims.width+' '+m.cardHeight+' vs '+m.viewportHeight);
    assert(m.headerEnabled,'Motion toggle should be available');
    if(mission===1){
     await page.waitForFunction(()=>{const v=document.querySelector('#pitProjectorContent .pit-cinema-film');return v&&!v.paused&&v.currentTime>0.06&&v.readyState>=2;},null,{timeout:12000});
     await page.locator('#pitProjectorMotionToggle').click();
     const state=await page.locator('#pitProjector').evaluate(root=>({
      paused:[...root.querySelectorAll('#pitProjectorContent video')].every(v=>v.paused),
      off:root.classList.contains('pit-motion-off'),
      pressed:root.querySelector('#pitProjectorMotionToggle').getAttribute('aria-pressed'),
      posterVisible:getComputedStyle(root.querySelector('.pit-cinema-poster')).display!=='none'
     }));
     assert(state.paused&&state.off&&state.pressed==='false'&&state.posterVisible,'Motion control does not pause and retain poster');
     await page.locator('#pitProjectorMotionToggle').click();
     assert.equal(await page.locator('#pitProjectorMotionToggle').getAttribute('aria-pressed'),'true');
     await page.locator('#pitProjectorNext').click();
     assert.equal(await page.locator('#pitProjectorContent video').count(),0,'M01 non-cinematic slide should not keep a video decoding');
     const flow=page.locator('#pitProjectorContent .pit-m01-flow span');
     assert((await flow.count())>=4,'M01 action flow missing after hero');
     assert.match(await flow.first().evaluate(el=>getComputedStyle(el).animationName),/pitCinFlow/,'Flow should animate without blocking text');
    }
    await page.locator('#pitProjectorClose').click();
    report.push({viewport:dims.width,mission,...m});
   }
   assert.deepEqual(errors,[],'JS errors '+errors.join(' | '));
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1',{waitUntil:'domcontentloaded'});
  await page.locator('#workspace:visible').waitFor({timeout:15000});
  if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
  await page.locator('.stage-btn[data-stage="1"]').click();
  await page.locator('#pitProjectorLaunch').click();
  assert(await page.locator('#pitProjectorMotionToggle').isDisabled(),'Must honor prefers-reduced-motion');
  const reduced=await page.locator('#pitProjector').evaluate(root=>({
   poster:getComputedStyle(root.querySelector('.pit-cinema-poster')).display,
   video:getComputedStyle(root.querySelector('.pit-cinema-film')).display
  }));
  assert(reduced.poster!=='none'&&reduced.video==='none','Reduced motion must show image and hide video');
  await page.close();
  console.log('PASS: LTX-featured opening videos, one decoder, poster fallback, motion toggle and projection layout');
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
'use strict';
/* MISSION RELEASE + MOTION — preview-only Chrome regression. No real classroom. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const errors=[],stagePosts=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.url().includes('action=stage'))stagePosts.push(r.postData())});
  await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1&motion=off',{waitUntil:'domcontentloaded'});
  await page.locator('#workspace:visible').waitFor({timeout:15000});
  if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
  assert.equal(await page.locator('.pit-mission-cinema video').count(),1,'mission banner has a cinematic video');
  assert.match(await page.locator('.pit-mission-cinema video').getAttribute('src'),/missao-01-motion.mp4/);
  assert.equal(await page.locator('#navPrimary').isDisabled(),true,'M01 already released');
  for(const p of ['demo','review','briefing','practice']){
   await page.locator('#phasebar [data-phase="'+p+'"]').click();
   assert.equal(await page.locator('#navPrimary').isDisabled(),true,'quadrant does not need release');
  }
  assert.equal(stagePosts.length,0,'quadrant switching never sends a release');
  await page.locator('#navSecondary').click();
  assert.match(await page.locator('#missionTitle').innerText(),/MVP EM FOCO/,'teacher previews M02');
  assert.equal(stagePosts.length,0,'next preview never changes classroom state');
  assert.match(await page.locator('.pit-mission-cinema video').getAttribute('src'),/missao-02-motion.mp4/);
  assert.equal(await page.locator('#navPrimary').isDisabled(),false,'M02 may be released');
  await page.locator('#navPrimary').click();
  assert.match(await page.locator('#missionStatus').innerText(),/MISSÃO LIBERADA/);
  assert.match(await page.locator('#roomState').innerText(),/PRÉVIA VISUAL/,'preview does not impersonate a real class');
  assert.equal(await page.locator('#navPrimary').isDisabled(),true,'once released, M02 cannot be released twice');
  assert.equal(stagePosts.length,0,'preview mode cannot call real classroom API');
  await page.locator('#pitProjectorLaunch').click();
  const n=Number((await page.locator('#pitProjectorCount').innerText()).split('/')[1].trim());
  assert.equal(n,7,'M02 presents seven workshop screens; full lesson remains available with ?aula=detalhada');
  assert.equal(await page.locator('#pitProjectorContent .pit-projector-motion video, #pitProjectorContent .pit-u-cinema-panel video, #pitProjectorContent .pit-m01-hero-cinema video').count(),1,'opening slide has a cinematic video');
  assert.match(await page.locator('#pitProjectorContent .pit-projector-motion video, #pitProjectorContent .pit-u-cinema-panel video, #pitProjectorContent .pit-m01-hero-cinema video').getAttribute('src'),/missao-02-motion.mp4/);
  await page.locator('#pitProjectorNext').click();
  assert.equal(stagePosts.length,0,'projector navigation never releases classroom stage');
  await page.locator('#pitProjectorClose').click();
  await page.locator('.stage-btn[data-stage="8"]').click();
  assert.equal(await page.locator('#navPrimary').isDisabled(),true,'cannot skip M03–M07 by releasing M08');
  assert.match(await page.locator('.pit-mission-cinema video').getAttribute('src'),/missao-08-motion.mp4/);
  await page.locator('#pitProjectorLaunch').click();
  assert.equal(await page.locator('#pitProjectorContent .pit-projector-motion video, #pitProjectorContent .pit-u-cinema-panel video, #pitProjectorContent .pit-m01-hero-cinema video').count(),1,'M08 opening video exists');
  assert.deepEqual(errors,[],'browser page errors: '+errors.join(' | '));
  console.log('PASS: mission-only release preview, no phase APIs, M02/M08 cinematic video cover and safe mission progression');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

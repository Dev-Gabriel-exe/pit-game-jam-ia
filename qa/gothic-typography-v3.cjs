'use strict';
/* Screens, readability, and projector regression after font-style overrides. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const output=[];
 try{
  for(const cfg of [
    {width:1600,height:900,role:'teacher'},
    {width:1280,height:720,role:'teacher'},
    {width:390,height:844,role:'student'}
  ]){
   const page=await browser.newPage({viewport:{width:cfg.width,height:cfg.height},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const path=cfg.role==='teacher'?'professor-v3.html':'aluno-v3.html';
   await page.goto('http://127.0.0.1:8899/'+path+'?preview=1',{waitUntil:'domcontentloaded'});
   await page.locator('#workspace:visible').waitFor({timeout:15000});
   if(cfg.role==='teacher'&&await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
   const brand=await page.locator('.hero .brand-title').evaluate(el=>({
    family:getComputedStyle(el).fontFamily,
    size:parseFloat(getComputedStyle(el).fontSize),
    over:el.scrollWidth>el.clientWidth+8
   }));
   assert.match(brand.family,/Cinzel Decorative/i,'Brand is not using gothic display face');
   assert(!brand.over,'Brand text overflows at '+cfg.width);
   if(cfg.role==='teacher'){
    for(const mission of [1,5,10]){
     await page.locator('.stage-btn[data-stage="'+mission+'"]').click();
     const title=await page.locator('.mainhead h1').evaluate(el=>getComputedStyle(el).fontFamily);
     assert.match(title,/Cinzel Decorative/,'Teacher mission title must remain gothic');
     await page.locator('#pitProjectorLaunch').click();
     await page.locator('#pitProjector.pit-projector-m01').waitFor();
     const counter=await page.locator('#pitProjectorCount').innerText();
     assert(Number(counter.split('/')[1])>=20,'Projection lost mission slides');
     const top=await page.locator('#pitProjectorTitle').evaluate(el=>({
      font:getComputedStyle(el).fontFamily,
      overflow:el.scrollWidth>el.clientWidth+8
     }));
     assert.match(top.font,/Cinzel Decorative/);
     assert(!top.overflow,'Projector title overflow for mission '+mission);
     const core=await page.locator('#pitProjectorContent').evaluate(el=>({
      overflowX:el.scrollWidth>el.clientWidth+9,
      font:getComputedStyle(el.querySelector('p')||el).fontFamily
     }));
     assert(!core.overflowX,'Projector horizontal overflow mission '+mission);
     await page.locator('#pitProjectorNext').click();
     await page.locator('#pitProjectorClose').click();
     output.push({viewport:cfg.width,mission,slides:counter,titleFont:top.font,bodyFont:core.font});
    }
   }else{
    const title=await page.locator('.stage-btn .stage-main strong').first().evaluate(el=>getComputedStyle(el).fontFamily);
    assert.match(title,/Grenze Gotisch/,'Mission card labels missing gothic font');
    output.push({viewport:cfg.width,role:cfg.role,missionCardFont:title});
   }
   assert.deepEqual(errors,[],'JS errors: '+errors.join(' | '));
   await page.close();
  }
  console.log('PASS: Gothic typography legible in teacher, student and continuous projection');
  console.log(JSON.stringify(output,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
'use strict';
const assert=require('node:assert/strict');
const { chromium }=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const seen=[];
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,reducedMotion:'reduce'});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/previews/hero-comparativo.html',{waitUntil:'domcontentloaded'});
   assert(await page.locator('.option').count()===3,'Three options required');
   assert(await page.locator('#stage').isVisible(),'Hero comparison not rendered');
   for(let i=0;i<3;i++){
    await page.locator('.option').nth(i).click();
    const on=page.locator('.option[aria-pressed="true"]');
    assert.equal(await on.count(),1,'One active candidate required');
    assert.equal(await on.getAttribute('data-index'),String(i));
    const href=await page.locator('#originalVideo').getAttribute('href');
    assert(/^https:\/\/(pixabay\.com|www\.pexels\.com)\//.test(href),'Official source link expected');
    const image=await page.locator('#photo').evaluate(el=>getComputedStyle(el).backgroundImage);
    assert(image.includes('http'),'Poster should update for option '+i);
   }
   const dims=await page.evaluate(()=>({x:document.documentElement.scrollWidth,w:innerWidth,hero:document.querySelector('.stage').getBoundingClientRect().width}));
   assert(dims.x<=dims.w+7,'Horizontal overflow on '+viewport.width+': '+JSON.stringify(dims));
   assert.deepEqual(errors,[],'Browser errors');
   await page.screenshot({path:'qa/comparativo-hero-'+viewport.width+'.png',fullPage:true});
   seen.push({width:viewport.width,options:3,sourceLinks:true,overflow:dims.x-dims.w});
   await page.close();
  }
  console.log('PASS: three portal hero candidates, working tabs, source links, mobile/desktop');
  console.log(JSON.stringify(seen,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
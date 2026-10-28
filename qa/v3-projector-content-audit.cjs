'use strict';
/* Projection typography/content coverage audit with real Chromium in preview (no live students). */
const {chromium}=require('playwright'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const rows=[],errors=[],phaseNames=['briefing','demo','practice','review'];
 const page=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://fonts.googleapis.com/**',route=>route.abort());
 await page.route('https://fonts.gstatic.com/**',route=>route.abort());
 await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1',{waitUntil:'domcontentloaded'});
 await page.locator('#workspace:visible').waitFor({timeout:12000});
 if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
 for(let mission=1;mission<=10;mission++){
  await page.locator('.stage-btn[data-stage="'+mission+'"]').click();
  for(const phase of phaseNames){
   await page.locator('#phasebar [data-phase="'+phase+'"]').click();
   const before=await page.locator('#mainContent').evaluate(el=>({
    chars:el.textContent.trim().length,
    words:(el.textContent.match(/\S+/g)||[]).length,
    cards:el.querySelectorAll('article,[class*="-card"],.tm1-concept,.f6-card').length,
    controls:el.querySelectorAll('button,input,select,textarea').length
   }));
   const launcher=page.locator('#pitProjectorLaunch');
   if(!(await launcher.isVisible())){rows.push({mission,phase,...before,error:'BUTTON_HIDDEN'});continue}
   await launcher.click();
   if(!(await page.locator('#pitProjector').count())){rows.push({mission,phase,...before,error:'NO_SLIDES'});continue}
   const slideCount=await page.locator('#pitProjectorCount').innerText();
   const n=Number(slideCount.split('/')[1]?.trim())||1;
   const slides=[];
   for(let index=0;index<n&&index<65;index++){
    const metrics=await page.locator('#pitProjectorContent').evaluate(el=>{
     const card=el.querySelector('.pit-projector-card'),r=el.getBoundingClientRect();
     const texts=[...el.querySelectorAll('h2,h3,h4,p,li,small,span,dd,dt')].filter(x=>x.textContent.trim().length>2);
     const fonts=texts.map(x=>({tag:x.tagName,px:Math.round(parseFloat(getComputedStyle(x).fontSize)),text:x.textContent.trim().slice(0,38)}));
     const below18=fonts.filter(x=>x.px<18).slice(0,8);
     return {chars:card?.textContent.trim().length||0,words:(card?.textContent.match(/\S+/g)||[]).length,
       title:el.querySelector('h2,h3,h4')?.textContent?.trim().slice(0,55)||'',
       overflowY:el.scrollHeight>el.clientHeight+10,overflowX:el.scrollWidth>el.clientWidth+8,
       minFont:fonts.length?Math.min(...fonts.map(x=>x.px)):null,below18,
       buttons:el.querySelectorAll('button,input,select').length,brokenImages:[...el.querySelectorAll('img')].filter(x=>x.complete&&!x.naturalWidth).length,
       cardWidth:Math.round(card?.getBoundingClientRect().width||0),viewportHeight:Math.round(r.height)};
    });
    slides.push(metrics);
    if(index<n-1)await page.locator('#pitProjectorNext').click();
   }
   await page.locator('#pitProjectorClose').click();
   const projectedChars=slides.reduce((x,y)=>x+y.chars,0);
   const row={mission,phase,originalChars:before.chars,originalWords:before.words,sourceCards:before.cards,sourceControls:before.controls,slides:slides.length,projectedChars,retainedRatio:before.chars?Number((projectedChars/before.chars).toFixed(2)):null,slidesWithScroll:slides.filter(x=>x.overflowY).length,slidesWithOverflowX:slides.filter(x=>x.overflowX).length,smallFontSlides:slides.filter(x=>x.below18.length>0).length,slidesWithControls:slides.filter(x=>x.buttons).length,samples:slides.slice(0,2),lastSample:slides[slides.length-1]};
   rows.push(row);
   console.log('PROJECTOR_AUDIT '+JSON.stringify({mission,phase,sourceCards:row.sourceCards,sourceControls:row.sourceControls,slides:row.slides,retainedRatio:row.retainedRatio,scroll:row.slidesWithScroll,overflowX:row.slidesWithOverflowX,smallFonts:row.smallFontSlides,controls:row.slidesWithControls,first:slides[0]?.title,last:slides[slides.length-1]?.title}));
  }
 }
 fs.mkdirSync('qa/projector-audit-artifacts',{recursive:true});
 fs.writeFileSync('qa/projector-audit-artifacts/metrics.json',JSON.stringify({rows,errors},null,2));
 const fail=rows.filter(x=>x.error||!x.slides||x.retainedRatio<.4||x.slidesWithOverflowX).map(x=>({mission:x.mission,phase:x.phase,error:x.error||'coverage_or_overflow',ratio:x.retainedRatio}));
 console.log('PROJECTOR_SUMMARY '+JSON.stringify({phases:rows.length,errors,fail,smallText:rows.filter(x=>x.smallFontSlides>0).length,scroll:rows.filter(x=>x.slidesWithScroll>0).length}));
 await browser.close();
 if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});

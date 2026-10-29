'use strict';
/* Projection typography/content coverage audit with real Chromium in preview (no live students). */
const {chromium}=require('playwright'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const rows=[],errors=[],phaseNames=['briefing','demo','practice','review'];
 const width=Number(process.env.PIT_AUDIT_WIDTH||1600),height=Number(process.env.PIT_AUDIT_HEIGHT||900);
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
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
   const slides=[],guideSteps=[],m04Sections=[];
   let demoInteraction=null;
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
    if(phase==='demo'&&(mission===1||mission===3||mission===4)){
     const stepNode=page.locator('#pitProjectorContent [data-pit-projector-step]');
     const step=await stepNode.count()?await stepNode.getAttribute('data-pit-projector-step'):null;
     if(step)guideSteps.push(step);
     if(mission===4&&step){
      m04Sections.push(await page.locator('#pitProjectorContent').evaluate(el=>({
       where:el.querySelectorAll('.g4-instruction').length>=2,
       result:!!el.querySelector('.g4-result'),
       fix:!!el.querySelector('.pit-projector-diagnostic'),
       source:!!el.querySelector('.g4-source-link'),
       privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
      })));
     }
     if(mission===1&&await page.locator('#pitProjectorContent .tm-pro-demo-layout').count()){
      const simulator=page.locator('#pitProjectorContent');
      await simulator.locator('[data-tm1="collect"]').click();
      const first=await simulator.locator('#tm1Gems').innerText();
      await simulator.locator('[data-tm1="door"]').click();
      const locked=await simulator.locator('#tm1Door').innerText();
      for(let k=0;k<2;k++)await simulator.locator('[data-tm1="collect"]').click();
      await simulator.locator('[data-tm1="door"]').click();
      const opened=await simulator.locator('#tm1Door').innerText();
      demoInteraction={first,locked,opened,pass:first==='1/3'&&locked==='FECHADA'&&opened==='ABERTA'};
     }
    }
    if(index<n-1)await page.locator('#pitProjectorNext').click();
   }
   await page.locator('#pitProjectorClose').click();
   const projectedChars=slides.reduce((x,y)=>x+y.chars,0);
   const row={mission,phase,originalChars:before.chars,originalWords:before.words,sourceCards:before.cards,sourceControls:before.controls,slides:slides.length,guideSteps,m04Sections,demoInteraction,projectedChars,retainedRatio:before.chars?Number((projectedChars/before.chars).toFixed(2)):null,slidesWithScroll:slides.filter(x=>x.overflowY).length,slidesWithOverflowX:slides.filter(x=>x.overflowX).length,smallFontSlides:slides.filter(x=>x.below18.length>0).length,slidesWithControls:slides.filter(x=>x.buttons).length,samples:slides.slice(0,2),lastSample:slides[slides.length-1]};
   rows.push(row);
   console.log('PROJECTOR_AUDIT '+JSON.stringify({mission,phase,sourceCards:row.sourceCards,sourceControls:row.sourceControls,slides:row.slides,retainedRatio:row.retainedRatio,scroll:row.slidesWithScroll,overflowX:row.slidesWithOverflowX,smallFonts:row.smallFontSlides,controls:row.slidesWithControls,first:slides[0]?.title,last:slides[slides.length-1]?.title}));
  }
 }
 fs.mkdirSync('qa/projector-audit-artifacts',{recursive:true});
 fs.writeFileSync('qa/projector-audit-artifacts/metrics.json',JSON.stringify({rows,errors},null,2));
 const fail=rows.filter(x=>x.error||!x.slides||x.retainedRatio<.4||x.slidesWithOverflowX).map(x=>({mission:x.mission,phase:x.phase,error:x.error||'coverage_or_overflow',ratio:x.retainedRatio}));
 const m01=rows.find(x=>x.mission===1&&x.phase==='demo');
 const m03=rows.find(x=>x.mission===3&&x.phase==='demo');
 const m04=rows.find(x=>x.mission===4&&x.phase==='demo');
 const expected01=Array.from({length:5},(_,i)=>'M01:'+i),expected03=Array.from({length:6},(_,i)=>'M03:'+i),expected04=Array.from({length:4},(_,i)=>'M04:'+i);
 const projectorChecks=[
  {name:'M01 tutorial: all five steps are individually projected',pass:JSON.stringify(m01?.guideSteps)===JSON.stringify(expected01)},
  {name:'M03 tutorial: all six steps are individually projected',pass:JSON.stringify(m03?.guideSteps)===JSON.stringify(expected03)},
  {name:'M01 projected state simulator: collect, blocked door, then win',pass:m01?.demoInteraction?.pass===true},
  {name:'M01 demo contains substantial material',pass:(m01?.slides||0)>=10&&(m01?.retainedRatio||0)>.4},
  {name:'M03 demo contains substantial material',pass:(m03?.slides||0)>=8&&(m03?.retainedRatio||0)>.4},
  {name:'M04: all four steps of selected GDevelop route projected separately',pass:JSON.stringify(m04?.guideSteps)===JSON.stringify(expected04)},
  {name:'M04: each step includes action, result, recovery, and source without private notes',pass:m04?.m04Sections?.length===4&&m04.m04Sections.every(x=>x.where&&x.result&&x.fix&&x.source&&x.privateNotes===0)}
 ];
 console.log('PROJECTOR_REGRESSION '+JSON.stringify(projectorChecks));
 console.log('PROJECTOR_SUMMARY '+JSON.stringify({viewport:width+'x'+height,phases:rows.length,errors,fail,smallText:rows.filter(x=>x.smallFontSlides>0).length,scroll:rows.filter(x=>x.slidesWithScroll>0).length,totalScrollSlides:rows.reduce((n,x)=>n+x.slidesWithScroll,0)}));
 await browser.close();
 if(errors.length||projectorChecks.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});

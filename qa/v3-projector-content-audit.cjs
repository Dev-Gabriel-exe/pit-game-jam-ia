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
   const slides=[],guideSteps=[],m04Sections=[],m05Sections=[],m07Sections=[],m01PracticeFields=[];
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
    if(mission===1&&phase==='practice'){
     m01PracticeFields.push(...await page.locator('#pitProjectorContent .tm-pro-spec-row small, #pitProjectorContent .tm1-field > span').allTextContents());
    }
    if(phase==='demo'&&(mission===1||mission===3||mission===4||mission===5||mission===7)){
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
     if(mission===5&&step){
      m05Sections.push(await page.locator('#pitProjectorContent').evaluate(el=>({
       where:el.querySelectorAll('.m5g-instruction').length===2,
       result:!!el.querySelector('.m5g-expect'),
       fix:!!el.querySelector('.pit-projector-diagnostic'),
       source:!!el.querySelector('.m5g-photo-foot a'),
       privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
      })));
     }
     if(mission===7&&step){
      m07Sections.push(await page.locator('#pitProjectorContent').evaluate(el=>{
       const labels=[...el.querySelectorAll('.g7-card dt')].map(n=>n.textContent.trim());
       return {where:labels.includes('ONDE CLICAR'),action:labels.includes('O QUE CONFIGURAR'),
        result:labels.includes('RESULTADO ESPERADO'),fix:labels.includes('SE NÃO FUNCIONAR'),
        source:!!el.querySelector('.g7-card figcaption a[href^="https://wiki.gdevelop.io/"]'),
        image:!!el.querySelector('.g7-card [data-g7-shot]'),
        privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length};
      }));
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
   const row={mission,phase,m01PracticeFields,originalChars:before.chars,originalWords:before.words,sourceCards:before.cards,sourceControls:before.controls,slides:slides.length,guideSteps,m04Sections,m05Sections,m07Sections,demoInteraction,projectedChars,retainedRatio:before.chars?Number((projectedChars/before.chars).toFixed(2)):null,slidesWithScroll:slides.filter(x=>x.overflowY).length,slidesWithOverflowX:slides.filter(x=>x.overflowX).length,smallFontSlides:slides.filter(x=>x.below18.length>0).length,slidesWithControls:slides.filter(x=>x.buttons).length,samples:slides.slice(0,2),lastSample:slides[slides.length-1]};
   rows.push(row);
   console.log('PROJECTOR_AUDIT '+JSON.stringify({mission,phase,sourceCards:row.sourceCards,sourceControls:row.sourceControls,slides:row.slides,retainedRatio:row.retainedRatio,scroll:row.slidesWithScroll,overflowX:row.slidesWithOverflowX,smallFonts:row.smallFontSlides,controls:row.slidesWithControls,first:slides[0]?.title,last:slides[slides.length-1]?.title}));
  }
 }
 // Check alternate M04 paths, not only the default 2D top-down route.
 const m04RouteChecks=[];
 await page.locator('.stage-btn[data-stage="4"]').click();
 await page.locator('#phasebar [data-phase="demo"]').click();
 for(const routeIndex of [1,2,3]){
  await page.locator('#g4Tutorial [data-g4-route="'+routeIndex+'"]').click();
  const selected=await page.locator('#g4Tutorial [data-g4-route="'+routeIndex+'"]').getAttribute('aria-selected');
  await page.locator('#pitProjectorLaunch').click();
  const total=Number((await page.locator('#pitProjectorCount').innerText()).split('/')[1]?.trim())||0;
  const steps=[];
  for(let i=0;i<total;i++){
   const el=page.locator('#pitProjectorContent [data-pit-projector-step]');
   if(await el.count()){
    const id=await el.getAttribute('data-pit-projector-step');
    const complete=await el.evaluate(node=>node.querySelectorAll('.g4-instruction').length===2&&!!node.querySelector('.g4-result')&&!!node.querySelector('.pit-projector-diagnostic')&&!node.querySelector('.pit-private-teacher-notes'));
    steps.push({id,complete});
   }
   if(i<total-1)await page.locator('#pitProjectorNext').click();
  }
  await page.locator('#pitProjectorClose').click();
  m04RouteChecks.push({routeIndex,selected,total,steps,pass:selected==='true'&&steps.length===4&&steps.every((s,i)=>s.id==='M04:'+i&&s.complete)});
 }

 const m05RouteChecks=[];
 await page.locator('.stage-btn[data-stage="5"]').click();
 await page.locator('#phasebar [data-phase="demo"]').click();
 for(const routeIndex of [0,1,2]){
  await page.locator('#m5Guide [data-m5g-route="'+routeIndex+'"]').click();
  const selected=await page.locator('#m5Guide [data-m5g-route="'+routeIndex+'"]').getAttribute('aria-selected');
  await page.locator('#pitProjectorLaunch').click();
  const total=Number((await page.locator('#pitProjectorCount').innerText()).split('/')[1]?.trim())||0;
  const steps=[];
  for(let i=0;i<total;i++){
   const el=page.locator('#pitProjectorContent [data-pit-projector-step]');
   if(await el.count()){
    const id=await el.getAttribute('data-pit-projector-step');
    const complete=await el.evaluate(node=>node.querySelectorAll('.m5g-instruction').length===2&&!!node.querySelector('.m5g-expect')&&!!node.querySelector('.pit-projector-diagnostic')&&!!node.querySelector('.m5g-photo-foot a')&&!node.querySelector('.pit-private-teacher-notes'));
    steps.push({id,complete});
   }
   if(i<total-1)await page.locator('#pitProjectorNext').click();
  }
  await page.locator('#pitProjectorClose').click();
  m05RouteChecks.push({routeIndex,selected,total,steps,pass:selected==='true'&&steps.length===5&&steps.every((s,i)=>s.id==='M05:'+i&&s.complete)});
 }

 const m07RouteChecks=[];
 await page.locator('.stage-btn[data-stage="7"]').click();
 await page.locator('#phasebar [data-phase="demo"]').click();
 for(const routeIndex of [0,1]){
  await page.locator('#g7Guide [data-g7-route="'+routeIndex+'"]').click();
  const selected=await page.locator('#g7Guide [data-g7-route="'+routeIndex+'"]').getAttribute('aria-selected');
  await page.locator('#pitProjectorLaunch').click();
  const total=Number((await page.locator('#pitProjectorCount').innerText()).split('/')[1]?.trim())||0;
  const steps=[];
  for(let i=0;i<total;i++){
   const el=page.locator('#pitProjectorContent [data-pit-projector-step]');
   if(await el.count()){
    const id=await el.getAttribute('data-pit-projector-step');
    const complete=await el.evaluate(node=>{
     const labels=[...node.querySelectorAll('.g7-card dt')].map(x=>x.textContent.trim());
     return ['ONDE CLICAR','O QUE CONFIGURAR','RESULTADO ESPERADO','SE NÃO FUNCIONAR'].every(x=>labels.includes(x))&&!!node.querySelector('.g7-card figcaption a')&&!node.querySelector('.pit-private-teacher-notes');
    });
    steps.push({id,complete});
   }
   if(i<total-1)await page.locator('#pitProjectorNext').click();
  }
  await page.locator('#pitProjectorClose').click();
  m07RouteChecks.push({routeIndex,selected,total,steps,pass:selected==='true'&&steps.length===4&&steps.every((s,i)=>s.id==='M07:'+i&&s.complete)});
 }

 // A long projected tutorial must be readable with PageDown before changing slides.
 // Constrain the viewport locally to make the regression deterministic at all three CI resolutions.
 await page.locator('.stage-btn[data-stage="4"]').click();
 await page.locator('#phasebar [data-phase="demo"]').click();
 await page.locator('#pitProjectorLaunch').click();
 let targetFound=false;
 const navigationTotal=Number((await page.locator('#pitProjectorCount').innerText()).split('/')[1]?.trim())||0;
 for(let i=0;i<navigationTotal;i++){
  if(await page.locator('#pitProjectorContent [data-pit-projector-step="M04:0"]').count()){targetFound=true;break}
  await page.locator('#pitProjectorNext').click();
 }
 const navigationCheck={targetFound,overflow:false,firstPageScroll:false,keepsSlide:false,resetOnNext:false,atBottomAdvances:false,privateNotes:0};
 if(targetFound){
  const content=page.locator('#pitProjectorContent');
  await content.evaluate(el=>{el.style.height='180px';el.style.maxHeight='180px'});
  const beforeCount=await page.locator('#pitProjectorCount').innerText();
  navigationCheck.overflow=await content.evaluate(el=>el.scrollHeight>el.clientHeight+12);
  navigationCheck.topVisible=await content.evaluate(el=>el.querySelector('.pit-projector-card').getBoundingClientRect().top>=el.getBoundingClientRect().top-2);
  navigationCheck.hintVisible=await page.locator('#pitProjectorScrollHint').isVisible();
  navigationCheck.privateNotes=await content.locator('.pit-private-teacher-notes').count();
  await page.keyboard.press('PageDown');
  navigationCheck.firstPageScroll=await content.evaluate(el=>el.scrollTop>0);
  navigationCheck.keepsSlide=(await page.locator('#pitProjectorCount').innerText())===beforeCount;
  await page.keyboard.press('ArrowRight');
  navigationCheck.resetOnNext=await content.evaluate(el=>el.scrollTop===0);
  const nextCount=await page.locator('#pitProjectorCount').innerText();
  await content.evaluate(el=>{el.scrollTop=el.scrollHeight});
  await page.keyboard.press('PageDown');
  navigationCheck.atBottomAdvances=(await page.locator('#pitProjectorCount').innerText())!==nextCount;
 }
 await page.locator('#pitProjectorClose').click();
 fs.mkdirSync('qa/projector-audit-artifacts',{recursive:true});
 fs.writeFileSync('qa/projector-audit-artifacts/metrics.json',JSON.stringify({rows,errors,m04RouteChecks,m05RouteChecks,m07RouteChecks,navigationCheck},null,2));
 const fail=rows.filter(x=>x.error||!x.slides||x.retainedRatio<.4||x.slidesWithOverflowX).map(x=>({mission:x.mission,phase:x.phase,error:x.error||'coverage_or_overflow',ratio:x.retainedRatio}));
 const m01Practice=rows.find(x=>x.mission===1&&x.phase==='practice');
 const m01=rows.find(x=>x.mission===1&&x.phase==='demo');
 const m03=rows.find(x=>x.mission===3&&x.phase==='demo');
 const m04=rows.find(x=>x.mission===4&&x.phase==='demo');
 const m05=rows.find(x=>x.mission===5&&x.phase==='demo');
 const m07=rows.find(x=>x.mission===7&&x.phase==='demo');
 const expected01=Array.from({length:5},(_,i)=>'M01:'+i),expected03=Array.from({length:6},(_,i)=>'M03:'+i),expected04=Array.from({length:4},(_,i)=>'M04:'+i),expected05=Array.from({length:5},(_,i)=>'M05:'+i),expected07=Array.from({length:4},(_,i)=>'M07:'+i);
 const projectorChecks=[
  {name:'M01 practice: all seven planning fields projected with readable authorial examples',pass:m01Practice?.m01PracticeFields?.length===7&&['GÊNERO','TÍTULO','PROTAGONISTA','AÇÃO','OBJETIVO','CONDIÇÃO','FEEDBACK'].every(label=>m01Practice.m01PracticeFields.some(x=>x.includes(label)))&&(m01Practice?.retainedRatio||0)>.5},
  {name:'M01 tutorial: all five steps are individually projected',pass:JSON.stringify(m01?.guideSteps)===JSON.stringify(expected01)},
  {name:'M03 tutorial: all six steps are individually projected',pass:JSON.stringify(m03?.guideSteps)===JSON.stringify(expected03)},
  {name:'M01 projected state simulator: collect, blocked door, then win',pass:m01?.demoInteraction?.pass===true},
  {name:'M01 demo contains substantial material',pass:(m01?.slides||0)>=10&&(m01?.retainedRatio||0)>.4},
  {name:'M03 demo contains substantial material',pass:(m03?.slides||0)>=8&&(m03?.retainedRatio||0)>.4},
  {name:'M04: all four steps of selected GDevelop route projected separately',pass:JSON.stringify(m04?.guideSteps)===JSON.stringify(expected04)},
  {name:'M04: each step includes action, result, recovery, and source without private notes',pass:m04?.m04Sections?.length===4&&m04.m04Sections.every(x=>x.where&&x.result&&x.fix&&x.source&&x.privateNotes===0)},
  {name:'M04: platform, puzzle, and 3D routes each project all four complete steps',pass:m04RouteChecks.length===3&&m04RouteChecks.every(x=>x.pass)},
  {name:'M05: five GDevelop event steps projected separately',pass:JSON.stringify(m05?.guideSteps)===JSON.stringify(expected05)},
  {name:'M05: two actions, expected result, visible recovery, source and no private notes',pass:m05?.m05Sections?.length===5&&m05.m05Sections.every(x=>x.where&&x.result&&x.fix&&x.source&&x.privateNotes===0)},
  {name:'M05: RPG, puzzle and 3D routes each project five complete steps',pass:m05RouteChecks.length===3&&m05RouteChecks.every(x=>x.pass)},
  {name:'M07: four GDevelop completion steps projected individually',pass:JSON.stringify(m07?.guideSteps)===JSON.stringify(expected07)},
  {name:'M07: each step has where/action/result/recovery/source without private notes',pass:m07?.m07Sections?.length===4&&m07.m07Sections.every(x=>x.where&&x.action&&x.result&&x.fix&&x.source&&x.image&&x.privateNotes===0)},
  {name:'M07: 2D and 3D routes each project four complete steps',pass:m07RouteChecks.length===2&&m07RouteChecks.every(x=>x.pass)},
  {name:'720p long tutorials: PageDown scrolls before advancing; next slide starts at top; no private notes',pass:navigationCheck.targetFound&&navigationCheck.overflow&&navigationCheck.topVisible&&navigationCheck.hintVisible&&navigationCheck.firstPageScroll&&navigationCheck.keepsSlide&&navigationCheck.resetOnNext&&navigationCheck.atBottomAdvances&&navigationCheck.privateNotes===0}
 ];
 console.log('PROJECTOR_REGRESSION '+JSON.stringify(projectorChecks));
 console.log('PROJECTOR_SUMMARY '+JSON.stringify({viewport:width+'x'+height,phases:rows.length,errors,fail,smallText:rows.filter(x=>x.smallFontSlides>0).length,scroll:rows.filter(x=>x.slidesWithScroll>0).length,totalScrollSlides:rows.reduce((n,x)=>n+x.slidesWithScroll,0)}));
 await browser.close();
 if(errors.length||projectorChecks.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});

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
   const slides=[],guideSteps=[],m04Sections=[],m04Verifications=[],m05Sections=[],m05Verifications=[],m07Sections=[],m01PracticeFields=[],m03PracticeSteps=[],m04ReviewSteps=[],m05ReviewSteps=[],m08BriefingSteps=[],m09PracticeSteps=[];
   let demoInteraction=null,m08Interaction=null;
   const m09DemoSteps=[],m09ReviewSteps=[];
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
    if(mission===9&&phase==='demo'){
     const projected=page.locator('#pitProjectorContent [data-pit-projector-m09-demo]');
     if(await projected.count())m09DemoSteps.push(await projected.evaluate(el=>({
      id:el.dataset.pitProjectorM09Demo,
      text:el.textContent.trim(),
      hypothesis:!!el.querySelector('.pit-projector-m09-action .t9-steps'),
      comparison:el.querySelectorAll('.pit-projector-m09-observation dl dt').length===3,
      priority:!!el.querySelector('.pit-projector-m09-decision .t9-priority'),
      privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
     })));
    }
    if(mission===9&&phase==='review'){
     const step=page.locator('#pitProjectorContent [data-pit-projector-m09-review]');
     if(await step.count())m09ReviewSteps.push(await step.evaluate(el=>({
      id:el.dataset.pitProjectorM09Review,
      text:el.textContent.trim(),
      criterion:!!el.querySelector('.t9v-rubric article'),
      decision:!!el.querySelector('.t9v-decisions article'),
      privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
     })));
    }
    if(mission===9&&phase==='practice'){
     const step=page.locator('#pitProjectorContent [data-pit-projector-practice]');
     if(await step.count())m09PracticeSteps.push(await step.evaluate(el=>({
      id:el.dataset.pitProjectorPractice,
      text:el.textContent.trim(),
      privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
     })));
    }
    if(mission===8&&phase==='briefing'){
     const briefing=page.locator('#pitProjectorContent [data-pit-projector-briefing]');
     if(await briefing.count()){
      m08BriefingSteps.push(await briefing.evaluate(el=>({
       id:el.dataset.pitProjectorBriefing,
       text:el.textContent.trim(),
       privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
      })));
      if(await briefing.getAttribute('data-pit-projector-briefing')==='M08:simulation'){
       await page.locator('#pitProjectorContent [data-t8f-action="item"]').click();
       const before=await page.locator('#pitProjectorContent #t8fStatus').innerText();
       await page.locator('#pitProjectorContent .t8f-modes label').nth(1).click();
       await page.locator('#pitProjectorContent [data-t8f-action="item"]').click();
       const after=await page.locator('#pitProjectorContent #t8fStatus').innerText();
       await page.locator('#pitProjectorContent [data-t8f-action="door"]').click();
       const blocked=await page.locator('#pitProjectorContent #t8fStatus').innerText();
       const state=await page.locator('#pitProjectorContent [data-t8f-scene]').getAttribute('data-t8f-scene');
       m08Interaction={before,after,blocked,state,pass:before==='SEM FEEDBACK'&&after==='ITEM COLETADO'&&blocked==='PORTA BLOQUEADA'&&state==='polished'};
      }
     }
    }
    if(mission===4&&phase==='review'){
     const review=page.locator('#pitProjectorContent [data-pit-projector-review]');
     if(await review.count())m04ReviewSteps.push(await review.evaluate(el=>({
      id:el.dataset.pitProjectorReview,
      text:el.textContent.trim(),
      privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
     })));
    }
    if(mission===5&&phase==='review'){
     const review=page.locator('#pitProjectorContent [data-pit-projector-review]');
     if(await review.count())m05ReviewSteps.push(await review.evaluate(el=>({
      id:el.dataset.pitProjectorReview,
      text:el.textContent.trim(),
      privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
     })));
    }
    if(mission===3&&phase==='practice'){
     const lab=page.locator('#pitProjectorContent [data-pit-projector-lab]');
     if(await lab.count())m03PracticeSteps.push(await lab.evaluate(el=>({
      id:el.dataset.pitProjectorLab,
      action:/NO EDITOR/.test(el.textContent),
      result:/CONCLUÍDO QUANDO/.test(el.textContent),
      recovery:!!el.querySelector('.pit-projector-diagnostic')&&/Possível erro e recuperação/.test(el.textContent),
      privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
     })));
    }
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
       action:!!el.querySelector('.g4-step-guide'),
       image:!!el.querySelector('.g4-step-picture img'),
       source:!!el.querySelector('.g4-picture-source'),
       privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
      })));
     }
     if(mission===4&&phase==='demo'){
      const verify=page.locator('#pitProjectorContent [data-pit-projector-verify]');
      if(await verify.count())m04Verifications.push(await verify.evaluate(el=>({
       id:el.dataset.pitProjectorVerify,
       result:!!el.querySelector('.g4-result'),
       fix:!!el.querySelector('.pit-projector-diagnostic'),
       source:!!el.querySelector('.g4-source-link[href^="https://wiki.gdevelop.io/"]'),
       preview:el.textContent.includes('Preview'),
       privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
      })));
     }
     if(mission===5&&step){
      m05Sections.push(await page.locator('#pitProjectorContent').evaluate(el=>({
       where:el.querySelectorAll('.m5g-instruction').length===2,
       source:!!el.querySelector('.m5g-photo-foot a'),
       privateNotes:el.querySelectorAll('.pit-private-teacher-notes,[data-private-note],.teacher-private-note').length
      })));
     }
     if(mission===5&&phase==='demo'){
      const verification=page.locator('#pitProjectorContent [data-pit-projector-verify]');
      if(await verification.count())m05Verifications.push(await verification.evaluate(el=>({
       id:el.dataset.pitProjectorVerify,
       result:!!el.querySelector('.m5g-expect'),
       fix:!!el.querySelector('.pit-projector-diagnostic'),
       source:!!el.querySelector('.pit-projector-g5-verify-source a'),
       preview:el.textContent.includes('Preview'),
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
   const row={mission,phase,m01PracticeFields,m03PracticeSteps,m04ReviewSteps,m05ReviewSteps,m08BriefingSteps,m08Interaction,m09PracticeSteps,m09DemoSteps,m09ReviewSteps,originalChars:before.chars,originalWords:before.words,sourceCards:before.cards,sourceControls:before.controls,slides:slides.length,guideSteps,m04Sections,m04Verifications,m05Sections,m05Verifications,m07Sections,demoInteraction,projectedChars,retainedRatio:before.chars?Number((projectedChars/before.chars).toFixed(2)):null,slidesWithScroll:slides.filter(x=>x.overflowY).length,scrollSlideIndices:slides.flatMap((slide,i)=>slide.overflowY?[i+1]:[]),slidesWithOverflowX:slides.filter(x=>x.overflowX).length,smallFontSlides:slides.filter(x=>x.below18.length>0).length,slidesWithControls:slides.filter(x=>x.buttons).length,samples:slides.slice(0,2),lastSample:slides[slides.length-1]};
   rows.push(row);
   console.log('PROJECTOR_AUDIT '+JSON.stringify({mission,phase,sourceCards:row.sourceCards,sourceControls:row.sourceControls,slides:row.slides,retainedRatio:row.retainedRatio,scroll:row.slidesWithScroll,overflowX:row.slidesWithOverflowX,smallFonts:row.smallFontSlides,controls:row.slidesWithControls,first:slides[0]?.title,last:slides[slides.length-1]?.title,scrollSlideIndices:mission===4||mission===5?row.scrollSlideIndices:undefined}));
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
  const steps=[],verifications=[];
  for(let i=0;i<total;i++){
   const el=page.locator('#pitProjectorContent [data-pit-projector-step]');
   if(await el.count()){
    const id=await el.getAttribute('data-pit-projector-step');
    const complete=await el.evaluate(node=>node.querySelectorAll('.g4-instruction').length===2&&!!node.querySelector('.g4-step-picture img')&&!node.querySelector('.pit-private-teacher-notes'));
    steps.push({id,complete});
   }
   const verify=page.locator('#pitProjectorContent [data-pit-projector-verify]');
   if(await verify.count())verifications.push(await verify.evaluate(node=>({
    id:node.dataset.pitProjectorVerify,
    complete:!!node.querySelector('.g4-result')&&!!node.querySelector('.pit-projector-diagnostic')&&!!node.querySelector('.g4-source-link')&&node.textContent.includes('Preview')&&!node.querySelector('.pit-private-teacher-notes')
   })));
   if(i<total-1)await page.locator('#pitProjectorNext').click();
  }
  await page.locator('#pitProjectorClose').click();
  m04RouteChecks.push({routeIndex,selected,total,steps,verifications,pass:selected==='true'&&steps.length===4&&verifications.length===4&&steps.every((x,i)=>x.id==='M04:'+i&&x.complete)&&verifications.every((x,i)=>x.id==='M04:'+i&&x.complete)});
 }

 const m05RouteChecks=[];
 await page.locator('.stage-btn[data-stage="5"]').click();
 await page.locator('#phasebar [data-phase="demo"]').click();
 for(const routeIndex of [0,1,2]){
  await page.locator('#m5Guide [data-m5g-route="'+routeIndex+'"]').click();
  const selected=await page.locator('#m5Guide [data-m5g-route="'+routeIndex+'"]').getAttribute('aria-selected');
  await page.locator('#pitProjectorLaunch').click();
  const total=Number((await page.locator('#pitProjectorCount').innerText()).split('/')[1]?.trim())||0;
  const steps=[],verifications=[];
  for(let i=0;i<total;i++){
   const el=page.locator('#pitProjectorContent [data-pit-projector-step]');
   if(await el.count()){
    const id=await el.getAttribute('data-pit-projector-step');
    const complete=await el.evaluate(node=>node.querySelectorAll('.m5g-instruction').length===2&&!!node.querySelector('.m5g-photo-foot a')&&!node.querySelector('.m5g-expect')&&!node.querySelector('.pit-projector-diagnostic')&&!node.querySelector('.pit-private-teacher-notes'));
    steps.push({id,complete});
   }
   const verify=page.locator('#pitProjectorContent [data-pit-projector-verify]');
   if(await verify.count()){
    const id=await verify.getAttribute('data-pit-projector-verify');
    const complete=await verify.evaluate(node=>!!node.querySelector('.m5g-expect')&&!!node.querySelector('.pit-projector-diagnostic')&&!!node.querySelector('.pit-projector-g5-verify-source a')&&node.textContent.includes('Preview')&&!node.querySelector('.pit-private-teacher-notes'));
    verifications.push({id,complete});
   }
   if(i<total-1)await page.locator('#pitProjectorNext').click();
  }
  await page.locator('#pitProjectorClose').click();
  m05RouteChecks.push({routeIndex,selected,total,steps,verifications,pass:selected==='true'&&steps.length===5&&verifications.length===5&&steps.every((s,i)=>s.id==='M05:'+i&&s.complete)&&verifications.every((s,i)=>s.id==='M05:'+i&&s.complete)});
 }

 // M08: each genre must project four GDevelop actions and four public recovery slides.
 const m08RouteChecks=[];
 await page.locator('.stage-btn[data-stage="8"]').click();
 await page.locator('#phasebar [data-phase="demo"]').click();
 for(const routeIndex of [0,1,2]){
  await page.locator('#g8Guide [data-g8-route="'+routeIndex+'"]').click();
  const selected=await page.locator('#g8Guide [data-g8-route="'+routeIndex+'"]').getAttribute('aria-selected');
  await page.locator('#pitProjectorLaunch').click();
  const total=Number((await page.locator('#pitProjectorCount').innerText()).split('/')[1]?.trim())||0;
  const steps=[],verifications=[];
  for(let i=0;i<total;i++){
   const el=page.locator('#pitProjectorContent [data-pit-projector-step^="M08:"]');
   if(await el.count())steps.push(await el.evaluate(node=>({
    id:node.dataset.pitProjectorStep,
    complete:!!node.querySelector('[data-g8-shot]')&&[...node.querySelectorAll('dt')].some(x=>x.textContent==='ONDE CLICAR')&&[...node.querySelectorAll('dt')].some(x=>x.textContent==='O QUE FAZER')&&!node.querySelector('.pit-private-teacher-notes')
   })));
   const verify=page.locator('#pitProjectorContent [data-pit-projector-verify^="M08:"]');
   if(await verify.count())verifications.push(await verify.evaluate(node=>({
    id:node.dataset.pitProjectorVerify,
    complete:!!node.querySelector('.pit-projector-g8-expected')&&!!node.querySelector('.pit-projector-g8-recovery')&&!!node.querySelector('.pit-projector-g8-source a[href^="https://wiki.gdevelop.io/"]')&&node.textContent.includes('Preview')&&!node.querySelector('.pit-private-teacher-notes')
   })));
   if(i<total-1)await page.locator('#pitProjectorNext').click();
  }
  await page.locator('#pitProjectorClose').click();
  m08RouteChecks.push({routeIndex,selected,total,steps,verifications,pass:selected==='true'&&total===10&&steps.length===4&&verifications.length===4&&steps.every((x,i)=>x.id==='M08:'+i&&x.complete)&&verifications.every((x,i)=>x.id==='M08:'+i&&x.complete)});
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
 const navigationCheck={targetFound,overflow:false,firstPageScroll:false,keepsSlide:false,resetOnNext:false,atBottomAdvances:false,hintVisible:false,hintSyncedAfterRestore:false,privateNotes:0};
 if(targetFound){
  const content=page.locator('#pitProjectorContent');
  await content.evaluate(el=>{el.style.height='180px';el.style.maxHeight='180px'});
  const beforeCount=await page.locator('#pitProjectorCount').innerText();
  navigationCheck.overflow=await content.evaluate(el=>el.scrollHeight>el.clientHeight+12);
  navigationCheck.topVisible=await content.evaluate(el=>el.querySelector('.pit-projector-card').getBoundingClientRect().top>=el.getBoundingClientRect().top-2);
  // The forced 180px viewport is a resize, not a user scroll. Wait for the
  // production ResizeObserver to update the hint instead of racing image loads.
  await page.waitForFunction(()=>{
   const content=document.getElementById('pitProjectorContent');
   const hint=document.getElementById('pitProjectorScrollHint');
   return content&&hint&&content.scrollHeight>content.clientHeight+12&&!hint.hidden;
  },null,{timeout:2500}).catch(()=>{});
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
  // Releasing the temporary constraint must also update the hint (no stale
  // message when switching back to a full-height projected slide).
  await content.evaluate(el=>{el.style.height='';el.style.maxHeight=''});
  await page.waitForFunction(()=>{
   const content=document.getElementById('pitProjectorContent');
   const hint=document.getElementById('pitProjectorScrollHint');
   if(!content||!hint)return false;
   return hint.hidden===(content.scrollHeight<=content.clientHeight+12);
  },null,{timeout:2500}).catch(()=>{});
  navigationCheck.hintSyncedAfterRestore=await content.evaluate(el=>{
   const hint=document.getElementById('pitProjectorScrollHint');
   return hint.hidden===(el.scrollHeight<=el.clientHeight+12);
  });
 }
 await page.locator('#pitProjectorClose').click();
 fs.mkdirSync('qa/projector-audit-artifacts',{recursive:true});
 fs.writeFileSync('qa/projector-audit-artifacts/metrics.json',JSON.stringify({rows,errors,m04RouteChecks,m05RouteChecks,m07RouteChecks,navigationCheck},null,2));
 const fail=rows.filter(x=>x.error||!x.slides||x.retainedRatio<.4||x.slidesWithOverflowX).map(x=>({mission:x.mission,phase:x.phase,error:x.error||'coverage_or_overflow',ratio:x.retainedRatio}));
 const m01Practice=rows.find(x=>x.mission===1&&x.phase==='practice');
 const m03Practice=rows.find(x=>x.mission===3&&x.phase==='practice');
 const m01=rows.find(x=>x.mission===1&&x.phase==='demo');
 const m03=rows.find(x=>x.mission===3&&x.phase==='demo');
 const m04=rows.find(x=>x.mission===4&&x.phase==='demo');
 const m04Review=rows.find(x=>x.mission===4&&x.phase==='review');
 const m05=rows.find(x=>x.mission===5&&x.phase==='demo');
 const m05Review=rows.find(x=>x.mission===5&&x.phase==='review');
 const m08Briefing=rows.find(x=>x.mission===8&&x.phase==='briefing');
 const m07=rows.find(x=>x.mission===7&&x.phase==='demo');
 const m09Practice=rows.find(x=>x.mission===9&&x.phase==='practice');
 const m09Demo=rows.find(x=>x.mission===9&&x.phase==='demo');
 const m09Review=rows.find(x=>x.mission===9&&x.phase==='review');
 const expected01=Array.from({length:5},(_,i)=>'M01:'+i),expected03=Array.from({length:6},(_,i)=>'M03:'+i),expected04=Array.from({length:4},(_,i)=>'M04:'+i),expected05=Array.from({length:5},(_,i)=>'M05:'+i),expected07=Array.from({length:4},(_,i)=>'M07:'+i);
 const projectorChecks=[
  {name:'M01 practice: all seven planning fields projected with readable authorial examples',pass:m01Practice?.m01PracticeFields?.length===7&&['GÊNERO','TÍTULO','PROTAGONISTA','AÇÃO','OBJETIVO','CONDIÇÃO','FEEDBACK'].every(label=>m01Practice.m01PracticeFields.some(x=>x.includes(label)))&&(m01Practice?.retainedRatio||0)>.5},
  {name:'M03 practice: three GDevelop fragments include actions, acceptance and visible recovery without private notes',pass:(m03Practice?.slides||0)>=8&&m03Practice?.m03PracticeSteps?.length===3&&m03Practice.m03PracticeSteps.every((step,i)=>step.id==='M03:'+(i+1)&&step.action&&step.result&&step.recovery&&step.privateNotes===0)},
  {name:'M01 tutorial: all five steps are individually projected',pass:JSON.stringify(m01?.guideSteps)===JSON.stringify(expected01)},
  {name:'M03 tutorial: all six steps are individually projected',pass:JSON.stringify(m03?.guideSteps)===JSON.stringify(expected03)},
  {name:'M01 projected state simulator: collect, blocked door, then win',pass:m01?.demoInteraction?.pass===true},
  {name:'M01 demo contains substantial material',pass:(m01?.slides||0)>=10&&(m01?.retainedRatio||0)>.4},
  {name:'M03 demo contains substantial material',pass:(m03?.slides||0)>=8&&(m03?.retainedRatio||0)>.4},
  {name:'M04 review: introduction, four criteria, decision and evidence are separate slides without private notes',pass:m04Review?.m04ReviewSteps?.length===7&&JSON.stringify(m04Review.m04ReviewSteps.map(x=>x.id))===JSON.stringify(['M04:intro','M04:rubric-1','M04:rubric-2','M04:rubric-3','M04:rubric-4','M04:decision','M04:record'])&&m04Review.m04ReviewSteps.every(x=>x.privateNotes===0)&&(m04Review.retainedRatio||0)>.5},
  {name:'M04 review: public criteria and assessment limits remain projected',pass:!!m04Review?.m04ReviewSteps?.find(x=>x.id==='M04:intro'&&x.text.includes('evidência'))&&['ENTRADA','LIMITE','REPRODUTIBILIDADE','PERSISTÊNCIA'].every((label,i)=>m04Review?.m04ReviewSteps?.[i+1]?.text.includes(label))&&!!m04Review?.m04ReviewSteps?.find(x=>x.id==='M04:decision'&&x.text.includes('APROVAR')&&x.text.includes('SOLICITAR REVISÃO'))&&!!m04Review?.m04ReviewSteps?.find(x=>x.id==='M04:record'&&x.text.includes('painel de acompanhamento')&&x.text.includes('declaração do aluno'))},
  {name:'M04: all four steps of selected GDevelop route projected separately',pass:JSON.stringify(m04?.guideSteps)===JSON.stringify(expected04)},
  {name:'M04: four action and four verification screens preserve how/result/recovery/source without private notes',pass:m04?.m04Sections?.length===4&&m04?.m04Verifications?.length===4&&m04.m04Sections.every(x=>x.where&&x.action&&x.image&&x.source&&x.privateNotes===0)&&m04.m04Verifications.every((x,i)=>x.id==='M04:'+i&&x.result&&x.fix&&x.source&&x.preview&&x.privateNotes===0)},
  {name:'M04: platform, puzzle, and 3D routes each project four actions and four verifications',pass:m04RouteChecks.length===3&&m04RouteChecks.every(x=>x.pass)},
  {name:'M05 review: intro, four rubric criteria, decisions and evidence caveat on separate slides',pass:m05Review?.m05ReviewSteps?.length===7&&JSON.stringify(m05Review.m05ReviewSteps.map(x=>x.id))===JSON.stringify(['M05:intro','M05:rubric-1','M05:rubric-2','M05:rubric-3','M05:rubric-4','M05:decision','M05:record'])&&m05Review.m05ReviewSteps.every(x=>x.privateNotes===0)&&(m05Review.retainedRatio||0)>.5},
  {name:'M05 review: real Preview checks, approval/revision and no automatic GDevelop validation',pass:!!m05Review?.m05ReviewSteps?.find(x=>x.id==='M05:intro'&&x.text.includes('Preview'))&&['EVENTO','AÇÃO E ESTADO','ACEITE 3×','CONTINUIDADE'].every((label,i)=>m05Review?.m05ReviewSteps?.[i+1]?.text.includes(label))&&!!m05Review?.m05ReviewSteps?.find(x=>x.id==='M05:decision'&&x.text.includes('APROVAR')&&x.text.includes('SOLICITAR REVISÃO'))&&!!m05Review?.m05ReviewSteps?.find(x=>x.id==='M05:record'&&x.text.includes('não valida automaticamente')&&x.text.includes('evidência permanece autodeclaratória'))},
  {name:'M05: five GDevelop event steps projected separately',pass:JSON.stringify(m05?.guideSteps)===JSON.stringify(expected05)},
  {name:'M05: action and verification screens preserve instructions, result, recovery, source and no private notes',pass:m05?.m05Sections?.length===5&&m05.m05Verifications?.length===5&&m05.m05Sections.every(x=>x.where&&x.source&&x.privateNotes===0)&&m05.m05Verifications.every((x,i)=>x.id==='M05:'+i&&x.result&&x.fix&&x.source&&x.preview&&x.privateNotes===0)},
  {name:'M05: RPG, puzzle and 3D routes each project five actions and five verifications',pass:m05RouteChecks.length===3&&m05RouteChecks.every(x=>x.pass)},
  {name:'M08 demo: all three genres project four actions and four verifications without private notes',pass:m08RouteChecks.length===3&&m08RouteChecks.every(x=>x.pass)},
   {name:'M08 briefing: six concepts, simulator, acceptance and evidence on 11 slides without private notes',pass:m08Briefing?.m08BriefingSteps?.length===11&&JSON.stringify(m08Briefing.m08BriefingSteps.map(x=>x.id))===JSON.stringify(['M08:intro',...Array.from({length:6},(_,i)=>'M08:concept-'+(i+1)),'M08:simulation-intro','M08:simulation','M08:accept','M08:evidence'])&&m08Briefing.m08BriefingSteps.every(x=>x.privateNotes===0)&&(m08Briefing.retainedRatio||0)>.6},
  {name:'M08 briefing: all UX labels and Preview evidence caveat projected',pass:['AFFORDANCE','INSTRUÇÃO','HUD','CONTRASTE','RESPOSTA AO INPUT','ERRO RECUPERÁVEL'].every((label,i)=>m08Briefing?.m08BriefingSteps?.[i+1]?.text.includes(label))&&!!m08Briefing?.m08BriefingSteps?.find(x=>x.id==='M08:accept'&&x.text.includes('antes/depois'))&&!!m08Briefing?.m08BriefingSteps?.find(x=>x.id==='M08:evidence'&&x.text.includes('simulação'))},
  {name:'M08 briefing: cloned before/after simulator responds to radio and actions',pass:m08Briefing?.m08Interaction?.pass===true},
  {name:'M09 demo: all three fictitious cases projected as hypothesis, observation and decision',pass:m09Demo?.m09DemoSteps?.length===11&&JSON.stringify(m09Demo.m09DemoSteps.map(x=>x.id))===JSON.stringify(['M09:intro',...Array.from({length:3},(_,i)=>['M09:case-'+(i+1)+'-action','M09:case-'+(i+1)+'-observation','M09:case-'+(i+1)+'-decision']).flat(),'M09:footer'])&&m09Demo.m09DemoSteps.every(x=>x.privateNotes===0)&&m09Demo.m09DemoSteps.filter(x=>x.hypothesis).length===3&&m09Demo.m09DemoSteps.filter(x=>x.comparison).length===3&&m09Demo.m09DemoSteps.filter(x=>x.priority).length===3},
  {name:'M09 demo: readable without slide scrolling at 720p and 900p',pass:height>950||!!m09Demo&&(m09Demo.slidesWithScroll===0&&m09Demo.slidesWithOverflowX===0&&m09Demo.smallFontSlides===0)},
  {name:'M09 review: five criteria and two decisions are public, private teacher notes excluded',pass:m09Review?.m09ReviewSteps?.length===9&&JSON.stringify(m09Review.m09ReviewSteps.map(x=>x.id))===JSON.stringify(['M09:intro',...Array.from({length:5},(_,i)=>'M09:criterion-'+(i+1)),'M09:decision-1','M09:decision-2','M09:footer'])&&m09Review.m09ReviewSteps.every(x=>x.privateNotes===0)&&m09Review.m09ReviewSteps.filter(x=>x.criterion).length===5&&m09Review.m09ReviewSteps.filter(x=>x.decision).length===2&&m09Review.m09ReviewSteps[8].text.includes('Preview')},
  {name:'M09 review: projected typography and horizontal fit',pass:!!m09Review&&m09Review.smallFontSlides===0&&m09Review.slidesWithOverflowX===0},
  {name:'M09 practice: protocol, three steps and evidence projected separately',pass:m09Practice?.m09PracticeSteps?.length===5&&JSON.stringify(m09Practice.m09PracticeSteps.map(x=>x.id))===JSON.stringify(['M09:intro','M09:step-1','M09:step-2','M09:step-3','M09:evidence'])&&m09Practice.m09PracticeSteps.every(x=>x.privateNotes===0)&&(m09Practice.retainedRatio||0)>.4},
  {name:'M09 practice: roles, observations, backlog and no invented tests',pass:!!m09Practice?.m09PracticeSteps?.find(x=>x.id==='M09:intro'&&x.text.includes('16 MIN'))&&!!m09Practice?.m09PracticeSteps?.find(x=>x.id==='M09:step-1'&&x.text.includes('SAÍDA'))&&!!m09Practice?.m09PracticeSteps?.find(x=>x.id==='M09:step-2'&&x.text.toLowerCase().includes('papéis'))&&!!m09Practice?.m09PracticeSteps?.find(x=>x.id==='M09:step-3'&&x.text.includes('backlog'))&&!!m09Practice?.m09PracticeSteps?.find(x=>x.id==='M09:evidence'&&x.text.includes('Testador anônimo')&&x.text.includes('não substituem o Preview'))},
  {name:'M09 public practice: five slides keep readable typography and no horizontal overflow',pass:m09Practice?.m09PracticeSteps?.length===5&&m09Practice?.smallFontSlides===0&&m09Practice?.slidesWithOverflowX===0},
  {name:'M04/M05 tutorial action and verification slides fit the 720p and 900p projector viewport',pass:height>950||[m04,m05].every(row=>row?.slidesWithScroll===0&&row?.slidesWithOverflowX===0)},
  {name:'M07: four GDevelop completion steps projected individually',pass:JSON.stringify(m07?.guideSteps)===JSON.stringify(expected07)},
  {name:'M07: each step has where/action/result/recovery/source without private notes',pass:m07?.m07Sections?.length===4&&m07.m07Sections.every(x=>x.where&&x.action&&x.result&&x.fix&&x.source&&x.image&&x.privateNotes===0)},
  {name:'M07: 2D and 3D routes each project four complete steps',pass:m07RouteChecks.length===2&&m07RouteChecks.every(x=>x.pass)},
  {name:'720p long tutorials: PageDown scrolls before advancing; next slide starts at top; no private notes',pass:navigationCheck.targetFound&&navigationCheck.overflow&&navigationCheck.topVisible&&navigationCheck.hintVisible&&navigationCheck.firstPageScroll&&navigationCheck.keepsSlide&&navigationCheck.resetOnNext&&navigationCheck.atBottomAdvances&&navigationCheck.hintSyncedAfterRestore&&navigationCheck.privateNotes===0}
 ];
 console.log('PROJECTOR_REGRESSION '+JSON.stringify(projectorChecks));
 console.log('PROJECTOR_SUMMARY '+JSON.stringify({viewport:width+'x'+height,phases:rows.length,errors,fail,smallText:rows.filter(x=>x.smallFontSlides>0).length,scroll:rows.filter(x=>x.slidesWithScroll>0).length,totalScrollSlides:rows.reduce((n,x)=>n+x.slidesWithScroll,0)}));
 await browser.close();
 if(errors.length||projectorChecks.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});

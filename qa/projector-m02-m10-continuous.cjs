'use strict';
/* Regression: complete, independently presented classes M02-M10, preview only. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});
  const errors=[],report=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1&oficina=detalhado',{waitUntil:'domcontentloaded'});
  await page.locator('#workspace:visible').waitFor({timeout:20000});
  if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
  for(let mission=2;mission<=10;mission++){
   await page.locator('.stage-btn[data-stage="'+mission+'"]').click();
   await page.locator('#phasebar [data-phase="review"]').click();
   await page.locator('#pitProjectorLaunch').click();
   await page.locator('#pitProjector.pit-projector-m01').waitFor();
   const count=Number((await page.locator('#pitProjectorCount').innerText()).split('/')[1]);
   assert(count>=12,'Missão '+mission+' tem apenas '+count+' slides; aula incompleta');
   const sections=[],titles=[],interactives=[],clipped=[],realControls=[];let badOverflow=0;
   for(let i=0;i<count;i++){
    const title=await page.locator('#pitProjectorTitle').innerText(),text=await page.locator('#pitProjectorContent').innerText();
    titles.push(title);
    assert(!text.includes('ROTEIRO PRIVADO'),'Nota privada vazou na missão '+mission+' slide '+(i+1));
    const header=await page.locator('#pitProjectorMission').innerText();
    sections.push(header);
    assert(header.startsWith(String(mission).padStart(2,'0')+' · '),'Troca de missão inesperada no projetor');
    const pane=page.locator('#pitProjectorContent');
    if(mission===5 && await pane.locator('[data-tm5-action="touch"]').count() && await pane.locator('[data-tm5-score]').count()){
     await pane.locator('[data-tm5-action="touch"]').click();
     assert.equal((await pane.locator('[data-tm5-score]').innerText()).trim(),'1','M05 sim did not update Score');
     realControls.push('M05:score');
    }
    if(mission===6 && await pane.locator('[data-f6-answer]').count() && await pane.locator('#f6Answer').count()){
     const prior=(await pane.locator('#f6Answer').innerText()).trim();
     await pane.locator('[data-f6-answer]').first().click();
     assert.notEqual((await pane.locator('#f6Answer').innerText()).trim(),prior,'M06 format simulator did not respond');
     realControls.push('M06:format');
    }
    if(mission===7 && await pane.locator('[data-t7f-action="start"]').count() && await pane.locator('#t7fPhase').count()){
     await pane.locator('[data-t7f-action="start"]').click();
     assert.match(await pane.locator('#t7fPhase').innerText(),/JOGANDO/,'M07 state machine did not start');
     realControls.push('M07:state');
    }
    if(mission===8 && await pane.locator('[name="t8fMode"][value="polished"]').count() && await pane.locator('#t8fObjective').count()){
     await pane.locator('[name="t8fMode"][value="polished"]').check();
     assert.match(await pane.locator('#t8fObjective').innerText(),/coletar cristal/,'M08 before/after comparison did not update');
     realControls.push('M08:feedback');
    }
    if(await pane.locator('.pit-u-live').count()){
     const buttons=pane.locator('.pit-u-live button:visible');
     const n=await buttons.count();
     if(n){
      const b=buttons.first();
      if(await b.isEnabled())await b.click({timeout:3000});
      interactives.push({slide:i+1,buttons:n});
     }
    }
    const geometries=await pane.evaluate(el=>{const deck=el.querySelector('.pit-u-deck'),runtime=el.querySelector('.pit-u-component');return {overX:el.scrollWidth>el.clientWidth+9,overY:el.scrollHeight>el.clientHeight+10,clip:deck&&deck.scrollHeight>deck.clientHeight+12,clipPx:deck?deck.scrollHeight-deck.clientHeight:0,innerScroll:runtime?runtime.scrollHeight>runtime.clientHeight+12:false}});
    assert(!geometries.overX,'Overflow X M'+mission+' slide '+(i+1)+': '+title);
    if(geometries.overY)badOverflow++;
    if(geometries.clip||geometries.innerScroll)clipped.push({index:i+1,title,clipPx:geometries.clipPx,innerScroll:geometries.innerScroll});
    if(i<count-1)await page.locator('#pitProjectorNext').click();
   }
   for(const name of ['CONCEITOS','EXEMPLO EM AÇÃO','OFICINA LIBERADA','RESULTADOS']){
    assert(sections.some(s=>s.includes(name)), 'M'+mission+' lacks '+name);
   }
   assert(interactives.length>0,'M'+mission+' no interactive controls');
   if([5,6,7,8].includes(mission))assert(realControls.length>0,'M'+mission+' simulation has no observable state change');
   assert(/Missão concluída|Missão \d\d/.test(titles[count-1]),'M'+mission+' does not close with conclusion');
   await page.locator('#pitProjectorClose').click();
   const preserved=await page.locator('#phasebar [data-phase="review"]').getAttribute('aria-current');
   assert(preserved==='true','Phase changed after projection M'+mission);
   report.push({mission,slides:count,interactiveSlides:interactives.length,stateTests:realControls,contentScrollWarnings:badOverflow,clipped:clipped.slice(0,30),clippedTotal:clipped.length});
  }
  assert.deepEqual(errors,[],'Browser JS errors: '+errors.join(' / '));
  console.log('PASS: nine continuous complete presentations with working controls and unchanged classroom phases');
  console.log(JSON.stringify(report,null,2));
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

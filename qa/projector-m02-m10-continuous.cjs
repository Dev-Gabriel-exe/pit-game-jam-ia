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
  await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1',{waitUntil:'domcontentloaded'});
  await page.locator('#workspace:visible').waitFor({timeout:20000});
  if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
  for(let mission=2;mission<=10;mission++){
   await page.locator('.stage-btn[data-stage="'+mission+'"]').click();
   await page.locator('#phasebar [data-phase="review"]').click();
   await page.locator('#pitProjectorLaunch').click();
   await page.locator('#pitProjector.pit-projector-m01').waitFor();
   const count=Number((await page.locator('#pitProjectorCount').innerText()).split('/')[1]);
   assert(count>=12,'Missão '+mission+' tem apenas '+count+' slides; aula incompleta');
   const sections=[],titles=[],interactives=[];let badOverflow=0;
   for(let i=0;i<count;i++){
    const title=await page.locator('#pitProjectorTitle').innerText(),text=await page.locator('#pitProjectorContent').innerText();
    titles.push(title);
    assert(!text.includes('ROTEIRO PRIVADO'),'Nota privada vazou na missão '+mission+' slide '+(i+1));
    const header=await page.locator('#pitProjectorMission').innerText();
    sections.push(header);
    assert(header.startsWith(String(mission).padStart(2,'0')+' · '),'Troca de missão inesperada no projetor');
    const pane=page.locator('#pitProjectorContent');
    if(await pane.locator('.pit-u-live').count()){
     const buttons=pane.locator('.pit-u-live button:visible');
     const n=await buttons.count();
     if(n){
      const b=buttons.first();
      if(await b.isEnabled())await b.click({timeout:3000});
      interactives.push({slide:i+1,buttons:n});
     }
    }
    const geometries=await pane.evaluate(el=>({overX:el.scrollWidth>el.clientWidth+9,overY:el.scrollHeight>el.clientHeight+10}));
    assert(!geometries.overX,'Overflow X M'+mission+' slide '+(i+1)+': '+title);
    if(geometries.overY)badOverflow++;
    if(i<count-1)await page.locator('#pitProjectorNext').click();
   }
   for(const name of ['CONCEITOS','EXEMPLO EM AÇÃO','OFICINA LIBERADA','RESULTADOS']){
    assert(sections.some(s=>s.includes(name)), 'M'+mission+' lacks '+name);
   }
   assert(interactives.length>0,'M'+mission+' no working interactive controls');
   assert(/Missão concluída|Missão \d\d/.test(titles[count-1]),'M'+mission+' does not close with conclusion');
   await page.locator('#pitProjectorClose').click();
   const preserved=await page.locator('#phasebar [data-phase="review"]').getAttribute('aria-current');
   assert(preserved==='true','Phase changed after projection M'+mission);
   report.push({mission,slides:count,interactiveSlides:interactives.length,contentScrollWarnings:badOverflow});
  }
  assert.deepEqual(errors,[],'Browser JS errors: '+errors.join(' / '));
  console.log('PASS: nine continuous complete presentations with working controls and unchanged classroom phases');
  console.log(JSON.stringify(report,null,2));
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

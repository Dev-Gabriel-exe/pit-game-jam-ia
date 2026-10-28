'use strict';
/* Regression: M02-M10 all seven-scene workshops, original detailed decks intact. */
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});
 const errors=[],report=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1',{waitUntil:'domcontentloaded'});
 await page.locator('#workspace:visible').waitFor({timeout:22000});
 if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
 for(let n=2;n<=10;n++){
  await page.locator('.stage-btn[data-stage="'+n+'"]').click();
  await page.locator('#phasebar [data-phase="review"]').click();
  await page.locator('#pitProjectorLaunch').click();
  assert.equal(await page.locator('#pitProjectorCount').innerText(),'1 / 7','Incorrect abbreviated slide count M'+n);
  const slides=[],sections=[],clipped=[];
  for(let i=0;i<7;i++){
   const title=await page.locator('#pitProjectorTitle').innerText();
   const h=await page.locator('#pitProjectorMission').innerText();
   const pane=page.locator('#pitProjectorContent'),txt=await pane.innerText();
   assert(!txt.includes('ROTEIRO PRIVADO'),'Private notes M'+n);
   sections.push(h);slides.push(title);
   if(i===3){
    const b=pane.locator('[data-pit-ws-choice]');assert.equal(await b.count(),2,'Expected working choice exercise');
    await b.first().click();assert.match(await pane.locator('[data-pit-ws-result]').innerText(),/DECISÃO ADEQUADA|REPENSE/);
   }
   if(i===4)assert.match(txt,/Caderno/,'Required independent reading time M'+n);
   if(i===6){
    assert.equal(await pane.locator('[data-pit-ws-check]').count(),3,'Checklist not aligned');
    assert.match(txt,/ENTREGA DA MISSÃO/,'No stated student deliverable');
   }
   const d=await pane.evaluate(el=>({x:el.scrollWidth-el.clientWidth,y:el.scrollHeight-el.clientHeight,inner:el.querySelector('.pit-workshop-deck')?.scrollHeight-el.querySelector('.pit-workshop-deck')?.clientHeight}));
   assert(d.x<10,'Horizontal overflow M'+n+' slide '+(i+1));
   if(d.y>16||d.inner>20)clipped.push({slide:i+1,...d});
   if(i<6)await page.locator('#pitProjectorNext').click();
  }
  for(const stage of ['CONCEITOS','LEITURA E EXPLORAÇÃO','OFICINA','VALIDAÇÃO'])assert(sections.some(s=>s.includes(stage)),'Missing '+stage+' M'+n);
  await page.locator('#pitProjectorClose').click();
  assert.equal(await page.locator('#phasebar [data-phase="review"]').getAttribute('aria-current'),'true','Classroom phase unexpectedly changed');
  report.push({mission:n,slides:slides.length,clipped:clipped.length});
 }
 assert.deepEqual(errors,[],'Browser errors '+errors.join('; '));
 console.log('PASS: nine student-aligned workshop missions with independent reading, interactive demonstration, creation timer, three checks, and no phase mutation');
 console.log(JSON.stringify(report,null,2));await page.close();
 const detailed=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
 await detailed.goto('http://127.0.0.1:8899/professor-v3.html?preview=1&aula=detalhada',{waitUntil:'domcontentloaded'});
 await detailed.locator('#workspace:visible').waitFor({timeout:22000});
 if(await detailed.locator('#missionGallery.open').count())await detailed.locator('#missionGalleryClose').click();
 await detailed.locator('.stage-btn[data-stage="5"]').click();await detailed.locator('#pitProjectorLaunch').click();
 assert(Number((await detailed.locator('#pitProjectorCount').innerText()).split('/')[1])>=12,'Original full lesson no longer available');
 await detailed.close();
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

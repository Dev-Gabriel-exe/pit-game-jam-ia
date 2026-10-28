'use strict';
/* M01 workshop pilot: seven screens, optional conceptual depth, functional simulation,
   timer and checklist; 27-screen teacher reference remains available. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const report=[];
 try{
  for(const vp of [{width:1600,height:900},{width:1280,height:720}]){
   const page=await browser.newPage({viewport:vp,reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1',{waitUntil:'domcontentloaded'});
   await page.locator('#workspace:visible').waitFor({timeout:22000});
   if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
   await page.locator('.stage-btn[data-stage="1"]').click();
   await page.locator('#phasebar [data-phase="review"]').click();
   await page.locator('#pitProjectorLaunch').click();
   await page.locator('#pitProjector.pit-projector-m01').waitFor();
   let counter=await page.locator('#pitProjectorCount').innerText();
   assert.equal(counter,'1 / 7','M01 must contain seven core screens');
   assert(await page.locator('.pit-m01-hero-cinema video').count(),'Hero should use original cinematic scene');
   const observed=[],overflow=[];
   for(let i=0;i<7;i++){
    const text=await page.locator('#pitProjectorContent').innerText();
    const title=await page.locator('#pitProjectorTitle').innerText();
    assert(!text.includes('ROTEIRO PRIVADO'),'Private teacher notes were projected');
    observed.push({index:i+1,title,previewText:text.slice(0,85)});
    if([1,2,4,6].includes(i)){
      const trigger=page.locator('#pitProjectorContent [data-pit-depth]').first();
      assert(await trigger.count(),'Expected optional conceptual deepening button on slide '+(i+1));
      await trigger.click();
      await page.locator('.pit-ws-depth-modal[role="dialog"]').waitFor();
      const before=await page.locator('#pitProjectorCount').innerText();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.pit-ws-depth-modal').count(),0,'ESC should dismiss depth, not projector');
      assert.equal(await page.locator('#pitProjectorCount').innerText(),before,'Optional detail must not change slide count');
    }
    if(i===3){
      const pane=page.locator('#pitProjectorContent');
      assert(await pane.locator('[data-tm1="collect"]').count(),'Real simulator has no input buttons');
      await pane.locator('[data-tm1="door"]').click();
      assert.equal((await pane.locator('#tm1Door').innerText()).trim(),'FECHADA','Door must block at 0');
      for(let n=0;n<3;n++)await pane.locator('[data-tm1="collect"]').click();
      assert.equal((await pane.locator('#tm1Gems').innerText()).trim(),'3/3','Simulation state did not change');
      await pane.locator('[data-tm1="door"]').click();
      assert.match(await pane.locator('#tm1Door').innerText(),/ABERTA/,'Gate not opened at 3');
    }
    if(i===5){
      const toggle=page.locator('[data-pit-timer-action="toggle"]');
      assert.equal(await page.locator('[data-pit-timer]').innerText(),'11:00','Timer must initialize at eleven minutes');
      await toggle.click();
      await page.waitForTimeout(1200);
      assert.notEqual(await page.locator('[data-pit-timer]').innerText(),'11:00','Timer must actually count down');
      await toggle.click();
      await page.locator('[data-pit-task]').first().check();
      assert.match(await page.locator('.pit-ws-progress').innerText(),/1 de 3/);
      await page.locator('[data-pit-timer-action="reset"]').click();
      assert.equal(await page.locator('[data-pit-timer]').innerText(),'11:00','Reset should work');
    }
    const dims=await page.locator('#pitProjectorContent').evaluate(el=>{
      const deck=el.querySelector('.pit-workshop-deck');
      const rect=deck?.getBoundingClientRect(),par=deck?.parentElement?.getBoundingClientRect();
      return {x:el.scrollWidth-el.clientWidth,y:el.scrollHeight-el.clientHeight,
      clip:deck?deck.scrollHeight-deck.clientHeight:0,
      deckHeight:rect?.height,parentHeight:par?.height};
    });
    assert(dims.x<10,'Horizontal clipping in viewport '+vp.width+' screen '+(i+1)+': '+JSON.stringify(dims));
    if(dims.y>13||dims.clip>14)overflow.push({slide:i+1,...dims});
    if(i<6)await page.locator('#pitProjectorNext').click();
   }
   assert.equal(observed.length,7);
   await page.locator('#pitProjectorClose').click();
   assert.equal(await page.locator('#phasebar [data-phase="review"]').getAttribute('aria-current'),'true','Projection must not alter class phase');
   assert.deepEqual(errors,[],'Uncaught browser errors '+errors.join(';'));
   report.push({width:vp.width,slides:7,simulation:true,optionalDepth:true,timer:true,overflow});
   await page.close();
  }
  const ref=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  await ref.goto('http://127.0.0.1:8899/professor-v3.html?preview=1&m01=detalhado',{waitUntil:'domcontentloaded'});
  await ref.locator('#workspace:visible').waitFor();
  if(await ref.locator('#missionGallery.open').count())await ref.locator('#missionGalleryClose').click();
  await ref.locator('.stage-btn[data-stage="1"]').click();
  await ref.locator('#pitProjectorLaunch').click();
  assert(Number((await ref.locator('#pitProjectorCount').innerText()).split('/')[1])>=25,'Preserve full old professor presentation');
  await ref.locator('#pitProjectorClose').click();
  await ref.locator('.stage-btn[data-stage="2"]').click();
  await ref.locator('#pitProjectorLaunch').click();
  assert(Number((await ref.locator('#pitProjectorCount').innerText()).split('/')[1])>=12,'Other missions unchanged');
  await ref.close();
  console.log('PASS: M01 practical 7-slide lesson with concepts, original interactive simulation, depth, timer, old full deck and unchanged M02');
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
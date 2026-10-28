'use strict';
/* Acceptance: teacher slides reflect the real ten student assignments, not generic lectures.
   Browser preview never touches a live class or production API. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const reports=[];
try {
for(const vp of [{width:1600,height:900},{width:1280,height:720},{width:390,height:844}]){
 const page=await browser.newPage({viewport:vp,reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1',{waitUntil:'domcontentloaded'});
 await page.locator('#workspace:visible').waitFor({timeout:25000});
 if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
 for(let n=1;n<=10;n++){
  await page.locator('.stage-btn[data-stage="'+n+'"]').click();
  await page.locator('#pitProjectorLaunch').click();
  await page.locator('#pitProjector.pit-projector-m01').waitFor();
  const total=await page.locator('#pitProjectorCount').innerText();
  assert.equal(total,'1 / 7','Wrong slide count M'+n+' '+vp.width);
  const missionMinutes=await page.evaluate(m=>{
   const spec=window.PIT_MISSIONS[m-1];
   const data=window.PIT_PROJECTOR_UNIVERSAL.workshopMissions[m];
   return {expected:spec.minutes,actual:data?.time.reduce((a,b)=>a+b,0)};
  },n);
  if(n>1)assert.deepEqual(missionMinutes.actual,missionMinutes.expected,'Timetable mismatch in M'+n);
  let clipped=[];
  for(let index=0;index<7;index++){
   const pane=page.locator('#pitProjectorContent');
   const screen=await pane.innerText();
   const h=await page.locator('#pitProjectorMission').innerText();
   assert(h.startsWith(String(n).padStart(2,'0')+' · '),'Incorrect mission numbering');
   assert(!screen.includes('ROTEIRO PRIVADO'),'Leaked private teacher notes');
   if(index===0)assert(await pane.locator('video').count(),'Missing original LTX video for M'+n);
   if(index===3&&n>1){
    const opts=pane.locator('[data-pit-ws-choice]');
    assert.equal(await opts.count(),2,'Interactive alternatives missing M'+n);
    await opts.first().click();
    const status=await pane.locator('[data-pit-ws-result]').innerText();
    assert(!status.includes('Escolha uma alternativa'),'Simulation did not respond M'+n);
   }
   if(index===4&&n>1){
    assert(screen.includes('Caderno'),'Student reading time missing M'+n);
    const detail=pane.locator('[data-pit-ws-depth="tutorial"]');
    await detail.click();
    assert(await page.locator('.pit-ws-depth-modal[role="dialog"]').isVisible(),'Tutorial panel unavailable M'+n);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.pit-ws-depth-modal').count(),0,'Closing a tutorial must not close presentation');
   }
   if(index===5){
    const clock=n===1?'[data-pit-timer]':'[data-pit-ws-time]';
    const time=await pane.locator(clock).innerText();
    assert.match(time,/^\d\d:\d\d$/,'Timer missing M'+n);
    if(n===1)assert.equal(time,'08:00','M1 must reserve eight minutes for ideation');
    if(n>1){
      const budget=await page.evaluate(m=>window.PIT_PROJECTOR_UNIVERSAL.workshopMissions[m].time[5],n);
      assert.equal(time,String(budget).padStart(2,'0')+':00','Workshop clock wrong M'+n);
      const go=pane.locator('[data-pit-ws-clock="toggle"]');
      await go.click();await page.waitForTimeout(1050);
      assert.notEqual(await pane.locator(clock).innerText(),time,'Timer did not count down M'+n);
      await go.click();await pane.locator('[data-pit-ws-clock="reset"]').click();
      assert.equal(await pane.locator(clock).innerText(),time,'Timer reset failed M'+n);
    }
   }
   if(index===6&&n>1){
    assert.equal(await pane.locator('[data-pit-ws-check]').count(),3,'Final assessment must have 3 concrete student checks M'+n);
    assert(screen.includes('ENTREGA DA MISSÃO'),'Student submission must be explicit M'+n);
    await pane.locator('[data-pit-ws-check]').first().check();
    assert.match(await pane.locator('[data-pit-ws-complete]').innerText(),/1 de 3/,'Checklist interaction broken M'+n);
   }
   const geo=await pane.evaluate(el=>{
    const child=el.querySelector('.pit-workshop-deck');
    return {overX:el.scrollWidth>el.clientWidth+9,overY:el.scrollHeight>el.clientHeight+13,clip:child&&child.scrollHeight>child.clientHeight+14,diff:child?child.scrollHeight-child.clientHeight:0};
   });
   assert(!geo.overX,'Horizontal overflow mission '+n+' slide '+(index+1)+' at '+vp.width);
   if(geo.clip&&vp.width>=1280)clipped.push({slide:index+1,diff:geo.diff});
   if(index<6)await page.locator('#pitProjectorNext').click();
  }
  if(clipped.length)console.warn('Clipping warning',vp.width,n,clipped);
  await page.locator('#pitProjectorClose').click();
  reports.push({m:n,vp:vp.width,slides:7,warnings:clipped.length});
 }
 assert.deepEqual(errors,[],'Browser errors: '+errors.join(' | '));
 await page.close();
}
const detail=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
await detail.goto('http://127.0.0.1:8899/professor-v3.html?preview=1&aula=detalhada',{waitUntil:'domcontentloaded'});
await detail.locator('#workspace:visible').waitFor();
if(await detail.locator('#missionGallery.open').count())await detail.locator('#missionGalleryClose').click();
await detail.locator('.stage-btn[data-stage="5"]').click();
await detail.locator('#pitProjectorLaunch').click();
assert(Number((await detail.locator('#pitProjectorCount').innerText()).split('/')[1])>=12,'Lost the full existing in-depth deck of M05');
await detail.close();
console.log('PASS: all ten workshop decks, student reading time, evidence checklists, timers, responsive viewport, deep reference.');
console.log(JSON.stringify(reports,null,2));
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
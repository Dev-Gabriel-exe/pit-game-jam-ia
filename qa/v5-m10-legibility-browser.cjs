'use strict';
// H.3/M10: desktop/projector readability gates on fictional 30-KayKit WebGL.
// SwiftShader CI measures layout only; it cannot certify human readability or G.2 hardware.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const OUT='qa/v5-m10-legibility';
const SCREENS=[
 {width:1920,height:1080,label:'projector-1920'},
 {width:1366,height:768,label:'desktop-1366'}
];
function within(inner,outer,tolerance=3){
 return inner.left>=outer.left-tolerance&&inner.right<=outer.right+tolerance&&
  inner.top>=outer.top-tolerance&&inner.bottom<=outer.bottom+tolerance;
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'
 ]});
 const report={schema:'m10-legibility-v1',synthetic:true,softwareRenderer:true,
  physicalPCsValidated:false,seed:4175863657,screens:[]};
 try{
  const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v5/arena-lab.html?m10preview=1&count=30&phase2=1&nav=steer&counterplay=1&balance=hp2&seed=4175863657',
   {waitUntil:'domcontentloaded',timeout:55000});
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===30,null,{timeout:175000});
  const stage=page.locator('#arenaStage');
  assert.equal(await stage.getAttribute('data-v5-combat-engine'),'phase2-m10');
  assert.equal(Number(await stage.getAttribute('data-v5-approved-talent-slots')),10);
  assert.equal(await page.locator('[data-fighter]').count(),30);
  await page.locator('#actionCamera').click();
  for(let i=0;i<4;i++)await page.locator('#speedBattle').click();
  await page.locator('#startBattle').click();
  await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.talentEvents>=5,null,{timeout:150000});
  await page.locator('#pauseBattle').click();
  assert.match(await page.locator('#arenaStatus').textContent(),/PAUSAD/);
  await page.locator('#expandStage').click();
  assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('arena-immersive')),true);
  // A modal keyboard trap must also exclude background content from the
  // accessibility tree; CSS overlays and aria-modal alone do not do this.
  const background=()=>page.evaluate(()=>({
   header:document.querySelector('.topbar').inert,
   intro:document.querySelector('.intro').inert,
   side:document.querySelector('.side').inert,
   footer:document.querySelector('.footer-note').inert,
   dialog:document.querySelector('.theater').getAttribute('role'),
   dialogName:document.querySelector('.theater').getAttribute('aria-label')
  }));
  assert.deepEqual(await background(),{
   header:true,intro:true,side:true,footer:true,
   dialog:'dialog',dialogName:'Arena de combate ampliada'
  },'Immersive mode must make every background region inert');
  for(const screen of SCREENS){
   await page.setViewportSize({width:screen.width,height:screen.height});
   await page.waitForTimeout(350);
   const metric=await page.evaluate(()=>{
    const box=(selector)=>{
     const el=document.querySelector(selector);
     if(!el)return null;
     const r=el.getBoundingClientRect(),s=getComputedStyle(el);
     return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
      width:r.width,height:r.height,fontPx:parseFloat(s.fontSize),
      visible:s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0,
      text:(el.textContent||'').trim().slice(0,100)};
    };
    const t=document.querySelector('#talentLast');
    return {viewport:{width:innerWidth,height:innerHeight},
     pageWidth:document.documentElement.scrollWidth,
     stage:box('#arenaStage'),wrap:box('.stage-wrap'),
     title:box('#arenaTitle'),alive:box('#aliveCount'),spectators:box('#spectatorsCount'),
     status:box('#arenaStatus'),spotlight:box('#battleSpotlight'),
     spotlightText:box('#spotlightText'),legend:box('.battle-legend'),
     telemetry:box('#talentTelemetry'),talentText:box('#talentLast'),
     controls:box('.controls'),viewerControls:box('#studentViewControls'),canvas:box('#arenaStage canvas'),
     toolbarItems:[...document.querySelectorAll('.controls > button:not([hidden]), .controls > .camera-director-status')].map(el=>{
      const r=el.getBoundingClientRect(),s=getComputedStyle(el);
      return {id:el.id||'directorStatus',left:r.left,right:r.right,top:r.top,bottom:r.bottom,
       width:r.width,height:r.height,visible:s.display!=='none'&&s.visibility!=='hidden'};
     }),
     talentTruncated:!!t&&t.scrollWidth>t.clientWidth+2,
     nicknamesVisible:[...document.querySelectorAll('.arena-nickname')].filter(
      el=>getComputedStyle(el).display!=='none').length,
     combatants:document.querySelectorAll('[data-fighter]').length
    };
   });
   assert(metric.stage&&metric.wrap&&metric.canvas,'3D stage and canvas required');
   assert(metric.stage.width>=700&&metric.stage.height>=280,
    'Insufficient usable stage for 30 KayKits: '+JSON.stringify(metric.stage));
   assert(within(metric.canvas,metric.stage),'Canvas must fit its stage');
   // Prior 1366×768 immersive stage was only 342px; require a measurable gain.
   const minimumHeight=screen.width===1366?500:800;
   assert(metric.stage.height>=minimumHeight,
    'Compact immersive controls must preserve '+minimumHeight+'px stage height: '+JSON.stringify(metric.stage));
   assert(metric.controls.height<=150,
    'Desktop immersive toolbar and F3 viewer must fit three compact rows: '+JSON.stringify(metric.controls));
   assert(metric.viewerControls?.visible&&within(metric.viewerControls,metric.controls),
    'F3 student/teacher controls must remain visible within compact toolbar');
   assert(metric.toolbarItems.length===12,
    'All 11 commands and director status must remain available in immersive mode');
   for(const item of metric.toolbarItems){
    assert(item.visible&&item.height>=32&&item.width>=90,
     'Toolbar command inaccessible: '+JSON.stringify(item));
    assert(within(item,metric.controls),
     'Toolbar command outside compact controls: '+JSON.stringify(item));
   }
   for(const key of ['spotlight','legend','telemetry']){
    assert(metric[key]?.visible,key+' must be visible in projector mode');
    assert(within(metric[key],metric.wrap),key+' must remain inside the stage');
   }
   for(const key of ['title','alive','spectators','status']){
    assert(metric[key]?.visible,key+' must remain visible');
    assert(metric[key].left>=-3&&metric[key].right<=screen.width+3,
     key+' must fit horizontal projector viewport');
   }
   assert(metric.spotlightText.fontPx>=13,'Combat spotlight too small for desktop');
   assert(metric.talentText.fontPx>=12,'Talent telemetry too small for desktop');
   assert(metric.combatants===30,'All thirty fictitious fighters must remain in roster');
   assert(metric.pageWidth<=screen.width+3,'Horizontal overflow in immersive mode');
   const filename=OUT+'-'+screen.label+'.png';
   report.screens.push({label:screen.label,...metric,screenshot:filename});
   fs.writeFileSync(OUT+'.json',JSON.stringify(report,null,2)+'\n');
   // CDP avoids Playwright's animation-stability wait on a live WebGL canvas.
   const cdp=await page.context().newCDPSession(page);
   try{
    const capture=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
    fs.writeFileSync(filename,Buffer.from(capture.data,'base64'));
   }finally{await cdp.detach();}
  }
  // Immersive M10 must not send keyboard users to invisible page navigation.
  // Test both wrap directions, Escape, and focus restoration on the same WebGL run.
  const focusEnds=await page.evaluate(()=>{
   const theater=document.querySelector('.theater');
   const selector='button:not(:disabled):not([hidden]),select:not(:disabled):not([hidden]),a[href],input:not(:disabled):not([hidden]),[tabindex]:not([tabindex="-1"])';
   const stops=[...theater.querySelectorAll(selector)].filter(el=>
    !el.closest('[hidden]')&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden');
   return {first:stops[0]?.id,last:stops.at(-1)?.id,count:stops.length,
    modal:theater.getAttribute('aria-modal'),role:theater.getAttribute('role')};
  });
  assert(focusEnds.count>=8&&focusEnds.first&&focusEnds.last,
   'Expected usable keyboard controls in expanded arena: '+JSON.stringify(focusEnds));
  assert.equal(focusEnds.modal,'true','Expanded arena must expose modal semantics');
  assert.equal(focusEnds.role,'dialog','Expanded arena must expose dialog semantics');
  // Programmatic background focus must also be blocked, not just Tab keys.
  await page.locator('#expandStage').focus();
  await page.evaluate(()=>document.querySelector('.topbar a').focus());
  assert.equal(await page.evaluate(()=>document.activeElement.id),'expandStage',
   'Background navigation must not steal focus from immersive dialog');
  await page.locator('#'+focusEnds.last).focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.id),focusEnds.first,
   'Tab from last immersive control must wrap to first, not background page');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.id),focusEnds.last,
   'Shift+Tab from first immersive control must wrap to last');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('arena-immersive')),false,
   'Escape must close immersive arena');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'expandStage',
   'Closing immersive arena must restore focus to its toggle');
  assert.equal(await page.locator('.theater').getAttribute('aria-modal'),null,
   'Modal semantics must be removed after closing');
  const restored=await background();
  assert.equal(restored.header,false,'Header must be interactive after closing');
  assert.equal(restored.intro,false,'Intro must be interactive after closing');
  assert.equal(restored.side,false,'Sidebar must be interactive after closing');
  assert.equal(restored.footer,false,'Footer must be interactive after closing');
  await page.locator('#expandStage').press('Enter');
  assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('arena-immersive')),true,
   'Keyboard Enter must reopen immersive arena');
  assert.equal((await background()).side,true,'Background must become inert again on reopen');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'expandStage');
  report.keyboard={...focusEnds,tabWrap:true,shiftTabWrap:true,escapeRestoresFocus:true,enterReopens:true,
   backgroundInert:true,backgroundRestored:true,programmaticFocusBlocked:true};
  fs.writeFileSync(OUT+'.json',JSON.stringify(report,null,2)+'\n');
  assert.deepEqual(errors,[],'Chromium errors: '+errors.join(' | '));
  fs.writeFileSync(OUT+'.json',JSON.stringify(report,null,2)+'\n');
  console.log('PASS M10 projector/desktop readability gates: '+JSON.stringify(
   report.screens.map(x=>({screen:x.label,stage:[Math.round(x.stage.width),Math.round(x.stage.height)],
    spotlightPx:x.spotlightText.fontPx,talentPx:x.talentText.fontPx,
    visibleNicknames:x.nicknamesVisible,talentTruncated:x.talentTruncated}))));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

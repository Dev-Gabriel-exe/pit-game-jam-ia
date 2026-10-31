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
  // Inspect the role-based accessibility surface, not just DOM inert flags.
  // This checks Chromium's exposed roles/names; NVDA/VoiceOver still require
  // manual validation on the actual classroom hardware.
  // Playwright role locators can include DOM nodes that are inert; inspect
  // Chromium's actual accessibility tree and ignore its excluded nodes.
  const axClient=await page.context().newCDPSession(page);
  async function exposedRoles(){
   const {nodes}=await axClient.send('Accessibility.getFullAXTree');
   const count=(role,name)=>nodes.filter(n=>!n.ignored&&n.role?.value===role&&
    (name===undefined||n.name?.value===name)).length;
   return {dialog:count('dialog','Arena de combate ampliada'),
    backgroundNav:count('navigation','Simulação de marco da oficina'),
    backgroundLink:count('link','← Seleção de heróis'),
    closeButton:count('button','✕ Fechar arena')};
  }
  const a11yOpen=await exposedRoles();
  assert.deepEqual(a11yOpen,{dialog:1,backgroundNav:0,backgroundLink:0,closeButton:1},
   'Immersive dialog must expose itself but not background navigation to accessibility roles');
  const liveSnapshot=await page.locator('#battleAnnouncement').ariaSnapshot();
  assert.match(liveSnapshot,/status/,'Combat announcements must expose a status role');
  assert.match(liveSnapshot,/Confronto pausado/,'Paused combat must be available to assistive technology');
  report.accessibility={expanded:a11yOpen,announcementRole:true,
   announcementPaused:true,screenReaderHardwareValidated:false};
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
   // Automated AA contrast audit for controls with opaque, solid CSS backgrounds.
   // Excludes gradient CTAs, translucent HUD over moving WebGL, disabled buttons
   // and any text whose actual background requires pixel-level/human review.
   const contrast=await page.evaluate(()=>{
    const rgba=value=>{
     const m=value.match(/^rgba?\(([^)]+)\)$/);
     if(!m)return null;
     const n=m[1].match(/[\d.]+/g)?.map(Number);
     if(!n||n.length<3)return null;
     return {rgb:n.slice(0,3),alpha:n.length>3?n[3]:1};
    };
    const lum=rgb=>{
     const c=rgb.map(v=>{const s=v/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4});
     return .2126*c[0]+.7152*c[1]+.0722*c[2];
    };
    const selectors=['.controls > button:not(:disabled)','.controls > .camera-director-status'];
    return selectors.flatMap(selector=>[...document.querySelectorAll(selector)]).flatMap(el=>{
     const style=getComputedStyle(el),rect=el.getBoundingClientRect();
     if(style.display==='none'||style.visibility==='hidden'||rect.width<1||rect.height<1)return [];
     if(style.backgroundImage!=='none')return [];
     const fg=rgba(style.color),bg=rgba(style.backgroundColor);
     if(!fg||!bg||fg.alpha!==1||bg.alpha!==1)return [];
     const a=lum(fg.rgb),b=lum(bg.rgb),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
     return [{id:el.id||el.textContent.trim().slice(0,24),ratio:+ratio.toFixed(3),
      fontPx:parseFloat(style.fontSize),fontWeight:style.fontWeight}];
    });
   });
   assert(contrast.length>=5,'Expected at least five visible solid-background controls for AA audit');
   for(const item of contrast)assert(item.ratio>=4.5,
    'WCAG AA normal-text contrast below 4.5:1 on '+screen.label+': '+JSON.stringify(item));
   // H.3/M10: scene-facing HUD is translucent over animated WebGL. Audit
   // conservative black/grey/white backdrop samples under CSS overlays,
   // including gradient stops and midpoints. This is not pixel OCR, a claim
   // about every rendered frame, or a substitute for human projector review.
   const hudSceneContrast=await page.evaluate(()=>{
    const parseColor=value=>{
     const match=String(value).match(/rgba?\(([^)]+)\)/i);
     const nums=match?.[1].match(/[\d.]+/g)?.map(Number);
     if(!nums||nums.length<3||nums.some(n=>!Number.isFinite(n)))return null;
     return {rgb:nums.slice(0,3),alpha:nums.length>3?nums[3]:1};
    };
    const mix=(front,back,alpha)=>front.map((v,i)=>v*alpha+back[i]*(1-alpha));
    const luminance=rgb=>{
     const linear=rgb.map(v=>{const s=v/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4});
     return .2126*linear[0]+.7152*linear[1]+.0722*linear[2];
    };
    const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);
     return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
    };
    const audits=[
     ['spotlight-heading','.spotlight-heading','#battleSpotlight'],
     ['spotlight-event','#spotlightText','#battleSpotlight'],
     ['spotlight-detail','.spotlight-detail','#battleSpotlight'],
     ['legend-hit','.battle-legend span:nth-child(1)','.battle-legend'],
     ['legend-dodge','.battle-legend span:nth-child(2)','.battle-legend'],
     ['legend-special','.battle-legend span:nth-child(3)','.battle-legend'],
     ['legend-elimination','.battle-legend span:nth-child(4)','.battle-legend'],
     ['talent-label','#talentTelemetry span','#talentTelemetry'],
     ['talent-name','#talentLast','#talentTelemetry'],
     ['talent-count','#talentCount','#talentTelemetry'],
     ['nickname-style','.arena-nickname','.arena-nickname']
    ];
    return audits.map(([id,textSelector,panelSelector])=>{
     const label=document.querySelector(textSelector),panel=document.querySelector(panelSelector);
     if(!label||!panel)return {id,error:'missing HUD element'};
     const textStyle=getComputedStyle(label),panelStyle=getComputedStyle(panel);
     const foreground=parseColor(textStyle.color);
     const stops=[...panelStyle.backgroundImage.matchAll(/rgba?\([^)]+\)/gi)]
      .map(m=>parseColor(m[0])).filter(Boolean);
     if(!stops.length){
      const solid=parseColor(panelStyle.backgroundColor);
      if(solid)stops.push(solid);
     }
     if(!foreground||!stops.length)return {id,error:'unparseable foreground or background'};
     if(Number(textStyle.opacity)<.99||Number(panelStyle.opacity)<.99)
      return {id,error:'translucent element opacity needs pixel-level review'};
     const backdrops=[[0,0,0],[127,127,127],[255,255,255]];
     const samples=[];
     for(let k=0;k<stops.length-1;k++){
      for(const t of [0,.25,.5,.75]){
       const from=stops[k],to=stops[k+1];
       const stop={rgb:from.rgb.map((v,i)=>v*(1-t)+to.rgb[i]*t),
        alpha:from.alpha*(1-t)+to.alpha*t};
       for(const backdrop of backdrops){
        const bg=mix(stop.rgb,backdrop,stop.alpha);
        const fg=mix(foreground.rgb,bg,foreground.alpha);
        samples.push(ratio(fg,bg));
       }
      }
     }
     for(const backdrop of backdrops){
      const stop=stops.at(-1),bg=mix(stop.rgb,backdrop,stop.alpha);
      samples.push(ratio(mix(foreground.rgb,bg,foreground.alpha),bg));
     }
     return {id,minRatio:+Math.min(...samples).toFixed(3),sampleCount:samples.length,
      backdropExtremes:'black / gray / white',gradientStops:stops.length,
      proxyStyle:id==='nickname-style'};
    });
   });
   assert.equal(hudSceneContrast.length,11,'Expected eleven HUD text contrast probes');
   for(const item of hudSceneContrast){
    assert(!item.error,'Scene HUD contrast could not be audited: '+JSON.stringify(item));
    assert(item.minRatio>=4.5,'Scene HUD contrast below WCAG AA sampled 4.5:1 on '+
     screen.label+': '+JSON.stringify(item));
   }
   const filename=OUT+'-'+screen.label+'.png';
   report.screens.push({label:screen.label,...metric,contrast,hudSceneContrast,screenshot:filename});
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
  const a11yClosed=await exposedRoles();
  assert.deepEqual(a11yClosed,{dialog:0,backgroundNav:1,backgroundLink:1,closeButton:0},
   'Closing the immersive arena must restore background accessibility roles');
  report.accessibility.closed=a11yClosed;
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

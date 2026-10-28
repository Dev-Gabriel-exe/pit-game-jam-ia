'use strict';
/* UI-08 automated visual regression: geometry, keyboard, reduced motion and
 * 12 viewport/route combinations. Screenshots are diagnostic, not human review.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:8899/';
 const routes=[
  {name:'portal',url:'index.html'},
  {name:'selecao',url:'fase1.html'},
  {name:'aluno',url:'aluno-v3.html?preview=1'},
  {name:'professor',url:'professor-v3.html?preview=1'}
 ];
 const sizes=[390,768,1440],report=[],dir='qa/ui-08-artifacts';

 fs.mkdirSync(dir,{recursive:true});
 for(const width of sizes){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  for(const route of routes){
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   // Keep visual QA offline/deterministic; use local/system font fallback.
   await page.route('https://fonts.googleapis.com/**',request=>request.abort());
   await page.route('https://fonts.gstatic.com/**',request=>request.abort());
   await page.goto(base+route.url,{waitUntil:'domcontentloaded',timeout:20000});
   if(route.name==='aluno'||route.name==='professor'){
    await page.locator('#workspace:visible').waitFor({timeout:12000});
    if(await page.locator('#missionGallery.open').count()){
     await page.locator('#missionGalleryClose').click();
     await page.locator('#missionGallery.open').waitFor({state:'hidden'});
    }
   }
   const metrics=await page.evaluate(()=>{
    const html=document.documentElement;
    return {scroll:html.scrollWidth,viewport:innerWidth,behavior:getComputedStyle(html).scrollBehavior,
      missing:[...document.images].filter(i=>i.loading!=='lazy'&&i.complete&&i.naturalWidth===0&&i.currentSrc.startsWith(location.origin)).map(i=>i.currentSrc)};
   });
   assert(metrics.scroll<=metrics.viewport+4,route.name+' '+width+' horizontal overflow: '+JSON.stringify(metrics));
   assert.equal(metrics.behavior,'auto',route.name+' reduced-motion scroll behavior');
   assert.equal(metrics.missing.length,0,route.name+' missing local images');
   await page.keyboard.press('Tab');
   const focused=await page.evaluate(()=>({tag:document.activeElement?.tagName,outline:getComputedStyle(document.activeElement).outlineStyle}));
   assert(focused.tag&&focused.tag!=='BODY',route.name+' '+width+' has a keyboard focus target');
   assert.notEqual(focused.outline,'none',route.name+' '+width+' focus indicator visible');
   if(route.name==='aluno'&&width===390&&await page.locator('#chatButton').isVisible()){
    await page.locator('#chatButton').click();
    await page.locator('#chatWindow.open').waitFor();
    const rect=await page.locator('#chatWindow').evaluate(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,viewport:innerWidth}});
    assert(rect.left>=0&&rect.right<=rect.viewport+2,'mobile chat must fit viewport '+JSON.stringify(rect));
    await page.locator('#chatClose').click();
    assert.equal(await page.locator('#chatWindow').getAttribute('aria-hidden'),'true','mobile chat accessible close');
   }
   if(route.name==='aluno'&&width===390)console.log('Chat mobile viewport requires authenticated fixture; preview may hide chat controls.');
   assert.deepEqual(errors,[],route.name+' '+width+' JavaScript page errors');
   // Screenshots are intentionally deferred: this automated pass checks geometry and interaction only.
   report.push({route:route.name,width,scroll:metrics.scroll,focus:focused.tag,missingImages:metrics.missing.length});
   console.log('AUDIT UI-08 '+route.name+' '+width+'px: geometry, focus, reduced motion PASS');
   await page.close();
  }
  await context.close();
 }
 fs.writeFileSync(path.join(dir,'metrics.json'),JSON.stringify(report,null,2)+'\n');

 console.log('PASS UI-08: 12 Chrome route/viewport geometry, reduced motion, focus and no horizontal overflow (screenshots pending)');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

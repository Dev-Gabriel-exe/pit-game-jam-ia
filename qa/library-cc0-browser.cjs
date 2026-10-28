'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const outputs=[];
  for(const vp of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport:vp,reducedMotion:'reduce',acceptDownloads:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/index.html',{waitUntil:'domcontentloaded'});
   await page.locator('#pitOpenAssets [data-kind="glb"]').first().waitFor({timeout:20000});
   const tally=await page.locator('#pitOpenCount').textContent();
   assert.match(tally,/17 modelos GLB individuais/);
   assert.match(tally,/15 pacotes gratuitos/);
   assert.equal(await page.locator('#pitGlbGrid .pit-real-model').count(),17,'17 real GLBs');
   assert.equal(await page.locator('#pitPackGrid .pit-real-pack').count(),15,'15 CC0 source packs');
   assert.equal(await page.locator('#pitPackGrid a.pit-real-download[href$=".zip"]').count(),13,'13 ZIP direct');
   const modelUrl=await page.evaluate(()=>window.PIT_OPEN_ASSETS.models[0].url);
   assert(modelUrl.includes('raw.githubusercontent.com'),'Model must point to upstream binary');
   const media=await page.request.get(modelUrl,{timeout:20000});
   assert.equal(media.status(),200,'Actual 3D GLB not available');
   const binary=await media.body();
   assert.equal(binary.toString('ascii',0,4),'glTF','Upstream file is not a real GLB');
   assert(binary.length>10000,'Unexpectedly tiny GLB');
   await page.locator('[data-pit-tab="modelos"]').click();
   assert.equal(await page.locator('#pitGlbGrid .pit-real-card').count(),17);
   assert.equal(await page.locator('#pitPackGrid .pit-real-card').count(),0);
   await page.locator('[data-pit-tab="audio"]').click();
   assert.equal(await page.locator('#pitPackGrid .pit-real-card').count(),4);
   await page.locator('[data-pit-tab="2d"]').click();
   assert.equal(await page.locator('#pitPackGrid .pit-real-card').count(),2);
   await page.locator('[data-pit-tab="todos"]').click();
   await page.locator('#pitOpenSearch').fill('morcego');
   assert.equal(await page.locator('#pitGlbGrid .pit-real-card').count(),1);
   await page.locator('#pitOpenSearch').fill('');
   await page.locator('[data-view="g-bat"]').click();
   await page.locator('#pitRealModal:not([hidden])').waitFor();
   assert.match(await page.locator('#pitRealTitle').textContent(),/Morcego/);
   await page.keyboard.press('Escape');
   assert(await page.locator('#pitRealModal').isHidden());
   const dir=await page.locator('[data-download="g-bat"]');
   const event=page.waitForEvent('download',{timeout:30000});
   await dir.click();
   const download=await event;
   assert.equal(download.suggestedFilename(),'Bat.glb');
   const dim=await page.evaluate(()=>({width:document.documentElement.scrollWidth,screen:innerWidth}));
   assert(dim.width<=dim.screen+8,'Horizontal overflow: '+JSON.stringify(dim));
   assert.equal(await page.locator('#assetGrid .resource-card').count(),await page.evaluate(()=>window.PIT_LIBRARY_API.assets.length));
   assert.deepEqual(errors,[],'Browser uncaught errors: '+errors.join('; '));
   await page.screenshot({path:'qa/biblioteca-cc0-'+vp.width+'.png',fullPage:true});
   outputs.push({viewport:vp.width,realGLBs:17,sourcePacks:15,directZIP:13,download:download.suggestedFilename(),overflow:dim.width-dim.screen});
   await page.close();
  }
  console.log('PASS: verified CC0 individual downloads, 3D preview opening, 2D/audio/3D filters and unchanged local asset library');
  console.log(JSON.stringify(outputs,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

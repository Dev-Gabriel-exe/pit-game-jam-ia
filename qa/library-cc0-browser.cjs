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
   // Regression from user's mobile screenshot: the old geometric PNG grid must not be the main catalogue.
   const fallback=page.locator('#pitLocalFallback');
   assert.equal(await fallback.count(),1,'Emergency generator must have an expandable drawer');
   assert.notEqual(await fallback.getAttribute('open'),'','Emergency generator unexpectedly open');
   assert(!await page.locator('#assetGrid').isVisible(),'Old geometric sprites are still visible by default');
   assert(await page.locator('#pitPackSection').isVisible(),'Real CC0 catalogue not visible');
   const firstPack=await page.locator('#pitPackGrid .pit-real-pack').first().boundingBox();
   const firstModel=await page.locator('#pitGlbGrid .pit-real-model').first().boundingBox();
   assert(firstPack&&firstModel&&firstPack.y<firstModel.y,'Official illustrated asset packs should appear before procedural/emoji cards');
   const mainTitle=await page.locator('#recursos .section-head h2').textContent();
   assert.match(mainTitle,/Heróis, mapas e sons/,'Outdated library introduction');
   const tally=await page.locator('#pitOpenCount').textContent();
   assert.match(tally,/20 modelos GLB individuais/);
   assert.match(tally,/21 pacotes gratuitos/);
   assert.equal(await page.locator('#pitGlbGrid .pit-real-model').count(),20,'17 real GLBs');
   assert.equal(await page.locator('#pitPackGrid .pit-real-pack').count(),21,'21 source packs');
   assert.equal(await page.locator('#pitPackGrid a.pit-real-download[href$=".zip"]').count(),13,'13 ZIP direct');
   const modelUrl=await page.evaluate(()=>window.PIT_OPEN_ASSETS.models[0].url);
   assert(modelUrl.includes('raw.githubusercontent.com'),'Model must point to upstream binary');
   const media=await page.request.get(modelUrl,{timeout:20000});
   assert.equal(media.status(),200,'Actual 3D GLB not available');
   const binary=await media.body();
   assert.equal(binary.toString('ascii',0,4),'glTF','Upstream file is not a real GLB');
   assert(binary.length>10000,'Unexpectedly tiny GLB');
   await page.locator('[data-pit-tab="personagens"]').click();
   assert(await page.locator('#pitGlbGrid .pit-real-model').count()>3,'Character filter must include real GLBs');
   assert(await page.locator('#pitPackGrid .pit-real-pack').count()>0,'Character filter must include official packs');
   await page.locator('[data-pit-tab="mapas"]').click();
   assert(await page.locator('#pitPackGrid .pit-real-pack').count()>3,'Map filter must include world kits');
   await page.locator('[data-pit-tab="sons"]').click();
   assert.equal(await page.locator('#pitPackGrid .pit-real-pack').count(),4,'Sound packs missing');
   await page.locator('[data-pit-tab="efeitos"]').click();
   assert.equal(await page.locator('#pitPackGrid .pit-real-pack').count(),3,'Missing three CC0 visual effect packs');
   for(const id of ['vfx-kenney-particles','vfx-foozle-magic','vfx-pvfx-foundry']){
    const card=page.locator('#pitPackGrid [data-id="'+id+'"]');
    assert.equal(await card.count(),1,'Missing VFX pack '+id);
    assert(await card.locator('a.pit-real-source').getAttribute('href'),'Missing official URL');
    await card.locator('summary').click();
    assert.equal(await card.locator('details').getAttribute('open'),'','Instruction panel should be open');
    assert((await card.locator('ol li').count())>=4,'Per-pack GDevelop instructions missing');
   }
   await page.locator('[data-pit-tab="mapas"]').click();
   assert.equal(await page.locator('#pitPackGrid [data-id="q-nature-mega"]').count(),1,'Quaternius pack absent from resource maps');
   const nature=page.locator('#pitPackGrid [data-id="q-nature-mega"]');
   assert.match(await nature.locator('.pit-real-download').getAttribute('href'),/quaternius\.com\/packs\/stylizednaturemegakit/);
   await nature.locator('summary').click();
   assert.match(await nature.locator('ol').innerText(),/3D Model/);
   assert(await page.locator('#pitResourceGuide').isVisible(),'Student field guide must be visible');
   await page.locator('[data-pit-tab="modelos"]').click();
   assert.equal(await page.locator('#pitGlbGrid .pit-real-card').count(),20);
   assert.equal(await page.locator('#pitPackGrid .pit-real-card').count(),0);
   await page.locator('[data-pit-tab="sons"]').click();
   assert.equal(await page.locator('#pitPackGrid .pit-real-card').count(),4);
   await page.locator('[data-pit-tab="2d"]').click();
   assert.equal(await page.locator('#pitPackGrid .pit-real-card').count(),5);
   await page.locator('[data-pit-tab="todos"]').click();
   await page.locator('#pitOpenSearch').fill('morcego');
   assert.equal(await page.locator('#pitGlbGrid .pit-real-card').count(),1);
   await page.locator('#pitOpenSearch').fill('');
   assert(await page.evaluate(()=>Array.from(window.PIT_OPEN_ASSETS.models).every(Boolean) && Array.from(window.PIT_OPEN_ASSETS.packs).every(Boolean)),'Catalog must not contain empty entries');
   // All Quaternius GLBs are served by our project, with real downloadable bytes.
   for(const id of ['q-tree1','q-tree3','q-bush']){
    const entry=await page.evaluate(id=>window.PIT_OPEN_ASSETS.models.find(m=>m.id===id),id);
    assert(entry?.url.startsWith('./v5/assets/quaternius-nature/'),'Local GLB URL missing: '+id);
    const resource=await page.request.get(new URL(entry.url,page.url()).toString());
    assert.equal(resource.status(),200,'Local Quaternius GLB missing: '+id);
    const raw=await resource.body();assert.equal(raw.toString('ascii',0,4),'glTF');assert(raw.length>10000);
   }
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
   // Legacy fallback must still work when explicitly opened.
   await fallback.locator('summary').click();
   assert(await page.locator('#assetGrid').isVisible(),'Backup asset grid must open on request');
   assert.equal(await page.locator('#assetGrid .resource-card').count(),await page.evaluate(()=>window.PIT_LIBRARY_API.assets.length));
   await fallback.locator('summary').click();
   assert(!await page.locator('#assetGrid').isVisible(),'Backup generator must close cleanly');
   assert.deepEqual(errors,[],'Browser uncaught errors: '+errors.join('; '));
   await page.screenshot({path:'qa/biblioteca-cc0-'+vp.width+'.png',fullPage:true});
   outputs.push({viewport:vp.width,realGLBs:20,sourcePacks:21,directZIP:13,download:download.suggestedFilename(),overflow:dim.width-dim.screen});
   await page.close();
  }
  console.log('PASS: verified CC0 individual downloads, 3D preview opening, 2D/audio/3D filters and unchanged local asset library');
  console.log(JSON.stringify(outputs,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

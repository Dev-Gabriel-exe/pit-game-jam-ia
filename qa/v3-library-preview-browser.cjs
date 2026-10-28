'use strict';
/* Browser integration for the actual procedural asset previews, not placeholders. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/index.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>Boolean(window.PIT_LIBRARY_PREVIEW),{timeout:10000});
   const count=await page.locator('[data-preview]').count();
   assert.equal(count,46,'every current resource has a preview button');
   assert.equal(await page.locator('.statband span').filter({hasText:'recursos para download'}).innerText(),'46 recursos para download','portal count follows actual catalogue');
   assert.equal(await page.locator('.statband span').filter({hasText:'missões'}).innerText(),'10 missões','portal count follows mission cards');
   assert.match(await page.locator('#myProgress').innerText(),/Caderno do Aluno/,'no misleading legacy XP counter');
   async function open(id){
    const button=page.locator('[data-preview="'+id+'"]');
    await button.click();
    await page.locator('#pitAssetPreview:not([hidden])').waitFor();
    assert.equal(await page.locator('#pitPreviewTitle').innerText().then(Boolean),true,'title exists');
   }
   await open('explorador');
   await page.locator('#pitPreviewStage img').waitFor({state:'visible'});
   assert.equal(await page.locator('#pitPreviewStage img').count(),1,'sprite has real image');
   assert.equal(await page.locator('#pitPreviewStage img').evaluate(async img=>{await img.decode();return img.complete&&img.naturalWidth>0}),true,'sprite decoded');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#pitAssetPreview').isHidden(),true,'escape closes dialog');
   assert.equal(await page.evaluate(()=>document.activeElement?.dataset.preview),'explorador','focus restored to trigger');
   await open('mapa-floresta');
   assert.equal(await page.locator('#pitPreviewStage img').evaluate(async img=>{await img.decode();return img.complete&&img.naturalWidth===1024&&img.naturalHeight===576}),true,'actual 1024x576 map');
   await page.locator('.pit-preview-close').click();
   for(const id of ['sentinela','arqueiro','mapa-arquipelago','mapa-fortaleza','bussola','reliquia','grifo','druida','feiticeira','golem','mapa-ruinas','mapa-pantano','lanterna','escudo','mapa-necropole','mapa-observatorio','espinhos','pedestal']){
    await open(id);
    const actual=await page.locator('#pitPreviewStage img').evaluate(async img=>{
     await img.decode();return {width:img.naturalWidth,height:img.naturalHeight,complete:img.complete};
    });
    assert.equal(actual.complete,true,'new preview decoded '+id);
    assert.equal(actual.width,id.startsWith('mapa-')?1024:160,'new preview width '+id);
    assert.equal(actual.height,id.startsWith('mapa-')?576:160,'new preview height '+id);
    await page.locator('.pit-preview-close').click();
   }
   const newPng=await page.evaluate(async()=>{
    const api=window.PIT_LIBRARY_API,results=[];
    for(const id of ['feiticeira','golem','mapa-ruinas','mapa-pantano','lanterna','escudo','mapa-necropole','mapa-observatorio','espinhos','pedestal']){
     const blob=await api.assetBlob(api.assets.find(a=>a.id===id));
     const b=new Uint8Array(await blob.arrayBuffer());
     results.push({id,type:blob.type,size:blob.size,magic:Array.from(b.slice(0,8)).join(',')});
    }
    return results;
   });
   assert.equal(newPng.length,10,'all ten downloadable resources generated');
   for(const a of newPng){
    assert.equal(a.type,'image/png','real PNG '+a.id);
    assert(a.size>500,'nonempty PNG '+a.id);
    assert.equal(a.magic,'137,80,78,71,13,10,26,10','PNG signature '+a.id);
   }
   // A failed PNG decode must show an explicit fallback, never an apparently valid preview.
   await page.evaluate(()=>{
    const api=window.PIT_LIBRARY_API,original=api.assetBlob;
    api.assetBlob=async a=>a.id==='explorador'?new Blob(['not-a-png'],{type:'image/png'}):original(a);
   });
   await open('explorador');
   await page.locator('#pitPreviewStage .pit-preview-error').waitFor({state:'visible'});
   assert.match(await page.locator('#pitPreviewStage .pit-preview-error').innerText(),/Não foi possível gerar a prévia/,'invalid PNG shows explicit error');
   await page.locator('.pit-preview-close').click();
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>Boolean(window.PIT_LIBRARY_PREVIEW));
   await open('glb-cristal');
   await page.locator('#pitPreviewStage canvas').waitFor();
   const mesh=await page.evaluate(()=>{
    const canvas=document.querySelector('#pitPreviewStage canvas'),ctx=canvas.getContext('2d');
    const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const colors=new Set();
    for(let i=0;i<data.length;i+=800)colors.add(data[i]+','+data[i+1]+','+data[i+2]);
    return{width:canvas.width,colors:colors.size,buttons:document.querySelectorAll('#pitPreviewTools button').length};
   });
   assert(mesh.colors>5,'GLB geometry is drawn, not empty');
   assert.equal(mesh.buttons,3,'3D has pause and rotation controls');
   await page.getByRole('button',{name:'Girar ↷'}).click();
   await page.locator('.pit-preview-close').click();
   await open('wav-vitoria');
   await page.locator('#pitPreviewStage audio').waitFor({state:'visible'});
   const audio=await page.locator('#pitPreviewStage audio').evaluate(a=>({src:a.src,type:a.canPlayType('audio/wav'),paused:a.paused}));
   assert(audio.src.startsWith('blob:'),'real WAV is bound as blob URL');
   assert(audio.type,'browser can play WAV');
   assert.equal(audio.paused,true,'audio does not autoplay');
   await page.locator('.pit-preview-close').click();
   assert.deepEqual(errors,[],'no JS page errors at '+width);
   console.log('PASS LIBRARY PREVIEW '+width+'px: 46 buttons, ten verified PNG downloads, sprite/map decode, GLB mesh, WAV audio, focus and Escape');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

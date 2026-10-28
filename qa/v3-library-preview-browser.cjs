'use strict';
/* Browser integration for the actual procedural asset previews, not placeholders. */
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
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
   const catalogueSize=await page.evaluate(()=>window.PIT_LIBRARY_API.assets.length);
   assert(catalogueSize>=49,'expanded catalogue has at least 49 resources');
   assert.equal(count,catalogueSize,'every current resource has a preview button');
   const openAssetsCount=await page.locator('.statband span').filter({hasText:'pacotes CC0'}).innerText();
   assert.match(openAssetsCount,/17 pacotes CC0/,'portal correctly highlights real creator packs');
   assert.equal(await page.locator('.statband span').filter({hasText:'missões'}).innerText(),'10 missões','portal count follows mission cards');
   assert.match(await page.locator('#myProgress').innerText(),/Caderno do Aluno/,'no misleading legacy XP counter');
   async function ensureFallbackOpen(){
    if(await page.locator('#pitLocalFallback').getAttribute('open')===null)
      await page.locator('#pitLocalFallback summary').click();
   }
   async function open(id){
    await ensureFallbackOpen();
    const button=page.locator('[data-preview="'+id+'"]');
    await button.click();
    await page.locator('#pitAssetPreview:not([hidden])').waitFor();
    assert.equal(await page.locator('#pitPreviewTitle').innerText().then(Boolean),true,'title exists');
   }
   // Verify actual bytes in the explicitly opened procedural contingency drawer.
   if(width===390){
    await ensureFallbackOpen();
    for(const id of ['explorador','glb-cristal','wav-coleta']){
     const asset=await page.evaluate(id=>window.PIT_LIBRARY_API.assets.find(a=>a.id===id),id);
     assert(asset,'download smoke test asset exists '+id);
     const button=page.locator('[data-asset="'+id+'"]');
     const [download]=await Promise.all([page.waitForEvent('download',{timeout:30000}),button.click()]);
     assert.equal(download.suggestedFilename(),asset.file,'browser download filename '+id);
     assert.equal(await download.failure(),null,'browser download completed '+id);
     const downloaded=await fs.readFile(await download.path());
     assert(downloaded.length>100,'download contains actual bytes '+id);
     const expected=asset.cat==='modelo'?'glTF':asset.cat==='som'?'RIFF':'\x89PNG\r\n\x1a\n';
     assert.equal(downloaded.subarray(0,expected.length).toString('latin1'),expected,'download signature '+id);
     if(asset.cat==='modelo')assert.equal(downloaded.readUInt32LE(8),downloaded.length,'downloaded GLB size '+id);
     if(asset.cat==='som')assert.equal(downloaded.readUInt32LE(4)+8,downloaded.length,'downloaded WAV size '+id);
    }
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
   for(const id of ['coruja-mecanica','mapa-jardim-luz','ampulheta','sentinela','arqueiro','mapa-arquipelago','mapa-fortaleza','bussola','reliquia','grifo','druida','feiticeira','golem','mapa-ruinas','mapa-pantano','lanterna','escudo','mapa-necropole','mapa-observatorio','espinhos','pedestal']){
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
    // The API is frozen: simulate corruption at the actual browser blob URL boundary.
    const original=URL.createObjectURL.bind(URL);
    URL.createObjectURL=blob=>blob.type==='image/png'?original(new Blob(['not-a-png'],{type:'image/png'})):original(blob);
   });
   await open('explorador');
   await page.locator('#pitPreviewStage .pit-preview-error').waitFor({state:'visible'});
   assert.match(await page.locator('#pitPreviewStage .pit-preview-error').innerText(),/Não foi possível gerar a prévia/,'invalid PNG shows explicit error');
   await page.locator('.pit-preview-close').click();
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>Boolean(window.PIT_LIBRARY_PREVIEW));
   // A GLB with an invalid MIME type must not be presented as a working 3D model.
   await page.evaluate(()=>{
    const original=Blob.prototype.arrayBuffer;
    Blob.prototype.arrayBuffer=function(){return original.call(this);};
    const create=window.PIT_LIBRARY_PREVIEW.open;
    // Corrupt only the generated GLB MIME by wrapping the Blob constructor.
    const NativeBlob=window.Blob;
    window.Blob=function(parts,opts){
     const options=opts?.type==='model/gltf-binary'?{...opts,type:'text/plain'}:opts;
     return new NativeBlob(parts,options);
    };
    window.Blob.prototype=NativeBlob.prototype;
   });
   await open('glb-cristal');
   await page.locator('#pitPreviewStage .pit-preview-error').waitFor({state:'visible'});
   assert.match(await page.locator('#pitPreviewStage .pit-preview-error').innerText(),/Tipo de arquivo GLB inválido/,'wrong GLB MIME rejected');
   await page.locator('.pit-preview-close').click();
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>Boolean(window.PIT_LIBRARY_PREVIEW));
   // Exhaustive asset generation is viewport-independent: run once, not twice.
   if(width===390){
   // Verify the actual downloaded bytes, filenames and MIME for the entire catalogue.
   const downloads=await page.evaluate(async()=>{
    const api=window.PIT_LIBRARY_API,rows=[];
    for(const asset of api.assets){
     const blob=await api.assetBlob(asset);
     const bytes=new Uint8Array(await blob.slice(0,12).arrayBuffer());
     const signature=Array.from(bytes.slice(0,4));
     const expected=asset.cat==='modelo'?'glb':asset.cat==='som'?'wav':'png';
     rows.push({id:asset.id,file:asset.file,type:blob.type,size:blob.size,expected,signature,head8:Array.from(bytes.slice(0,8))});
    }
    return rows;
   });
   assert.equal(downloads.length,catalogueSize,'all catalogue entries yield downloadable bytes');
   for(const item of downloads){
    assert(item.file.endsWith('.'+item.expected),'correct filename extension '+item.id);
    assert(item.size>100,'nonempty download '+item.id);
    if(item.expected==='png'){
     assert.equal(item.type,'image/png','PNG MIME '+item.id);
     assert.deepEqual(item.head8,[137,80,78,71,13,10,26,10],'PNG magic '+item.id);
    }else if(item.expected==='glb'){
     assert.equal(item.type,'model/gltf-binary','GLB MIME '+item.id);
     assert.deepEqual(item.signature,[103,108,84,70],'GLB magic '+item.id);
    }else{
     assert.equal(item.type,'audio/wav','WAV MIME '+item.id);
     assert.deepEqual(item.signature,[82,73,70,70],'RIFF magic '+item.id);
    }
   }
   // Decode every PNG in Chrome and confirm its real pixel dimensions.
   const decoded=await page.evaluate(async()=>{
    const api=window.PIT_LIBRARY_API,results=[];
    for(const asset of api.assets.filter(a=>a.cat!=='modelo'&&a.cat!=='som')){
     const blob=await api.assetBlob(asset),url=URL.createObjectURL(blob);
     try{
      const img=new Image();img.src=url;await img.decode();
      const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
      const cornerAlpha=ctx.getImageData(0,0,1,1).data[3];
      const centerAlpha=ctx.getImageData(Math.floor(canvas.width/2),Math.floor(canvas.height/2),1,1).data[3];
      results.push({id:asset.id,kind:asset.cat,width:img.naturalWidth,height:img.naturalHeight,cornerAlpha,centerAlpha});
     }finally{URL.revokeObjectURL(url);}
    }
    return results;
   });
   assert.equal(decoded.length,catalogueSize-10,'all PNG resources decode');
   for(const asset of decoded){
    assert.equal(asset.width,asset.kind==='mapa'?1024:160,'decoded PNG width '+asset.id);
    assert.equal(asset.height,asset.kind==='mapa'?576:160,'decoded PNG height '+asset.id);
    if(asset.kind!=='mapa')assert.equal(asset.cornerAlpha,0,'sprite/object transparent corner '+asset.id);
    else assert.equal(asset.centerAlpha,255,'map center fully opaque '+asset.id);
   }
   for(const id of ['coruja-mecanica','ampulheta']){
    const sample=decoded.find(a=>a.id===id);
    assert(sample&&sample.centerAlpha>0,'new original sprite has visible center pixels '+id);
   }
   // Parse every GLB and WAV header, not only the file signatures.
   const internals=await page.evaluate(async()=>{
    const api=window.PIT_LIBRARY_API,rows=[];
    for(const asset of api.assets.filter(a=>a.cat==='modelo'||a.cat==='som')){
     const blob=await api.assetBlob(asset),buffer=await blob.arrayBuffer(),v=new DataView(buffer);
     if(asset.cat==='modelo'){
      const mesh=window.PIT_LIBRARY_PREVIEW.readGlb(buffer);
      rows.push({id:asset.id,kind:'glb',length:v.getUint32(8,true),bytes:buffer.byteLength,vertices:mesh.vertices.length,triangles:mesh.triangles.length});
     }else{
      rows.push({id:asset.id,kind:'wav',riffSize:v.getUint32(4,true),bytes:buffer.byteLength,channels:v.getUint16(22,true),sampleRate:v.getUint32(24,true),bits:v.getUint16(34,true),dataSize:v.getUint32(40,true)});
     }
    }
    return rows;
   });
   assert.equal(internals.length,10,'five GLB and five WAV assets inspected');
   for(const a of internals){
    if(a.kind==='glb'){
     assert.equal(a.length,a.bytes,'GLB declared length '+a.id);
     assert(a.vertices>=3&&a.triangles>=1,'GLB mesh has geometry '+a.id);
    }else{
     assert.equal(a.riffSize+8,a.bytes,'RIFF declared length '+a.id);
     assert.equal(a.dataSize+44,a.bytes,'WAV PCM data length '+a.id);
     assert.equal(a.channels,1,'WAV mono '+a.id);
     assert.equal(a.sampleRate,22050,'WAV sample rate '+a.id);
     assert.equal(a.bits,16,'WAV PCM depth '+a.id);
    }
   }
   }
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
   // A valid RIFF signature with a forged chunk length must fail before playback.
   await page.evaluate(()=>{
    const NativeBlob=window.Blob;
    window.Blob=function(parts,opts){
     if(opts?.type==='audio/wav'){
      const bytes=parts[0];
      if(bytes instanceof ArrayBuffer){
       const broken=bytes.slice(0);
       new DataView(broken).setUint32(4,0,true);
       return new NativeBlob([broken],opts);
      }
     }
     return new NativeBlob(parts,opts);
    };
    window.Blob.prototype=NativeBlob.prototype;
   });
   await open('wav-vitoria');
   await page.locator('#pitPreviewStage .pit-preview-error').waitFor({state:'visible'});
   assert.match(await page.locator('#pitPreviewStage .pit-preview-error').innerText(),/Tamanho RIFF incompatível/,'corrupted RIFF length rejected');
   await page.locator('.pit-preview-close').click();
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>Boolean(window.PIT_LIBRARY_PREVIEW));
   await open('wav-vitoria');
   await page.locator('#pitPreviewStage audio').waitFor({state:'visible'});
   const audio=await page.locator('#pitPreviewStage audio').evaluate(a=>({src:a.src,type:a.canPlayType('audio/wav'),paused:a.paused}));
   assert(audio.src.startsWith('blob:'),'real WAV is bound as blob URL');
   assert(audio.type,'browser can play WAV');
   assert.equal(audio.paused,true,'audio does not autoplay');
   await page.locator('.pit-preview-close').click();
   assert.deepEqual(errors,[],'no JS page errors at '+width);
   console.log('PASS LIBRARY PREVIEW '+width+'px: '+count+' preview buttons, full catalogue binary checks, PNG decode, GLB mesh, WAV audio, focus and Escape');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

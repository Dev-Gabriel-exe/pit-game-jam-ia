'use strict';
/* FUN-08: browser-native PNG image decoding and Web Audio WAV decoding.
 * This verifies actual media codecs, not merely file magic/MIME. It does NOT
 * prove GDevelop editor import, human audibility or mobile hardware playback.
 */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  await page.goto('http://127.0.0.1:8899/index.html',{waitUntil:'domcontentloaded',timeout:30000});
  const results=await page.evaluate(async()=>{
   const api=window.PIT_LIBRARY_API;
   if(!api||!Array.isArray(api.assets))throw Error('PIT library API absent');
   const pick=id=>{const a=api.assets.find(x=>x.id===id);if(!a)throw Error('Missing '+id);return a};
   const audio=new (window.AudioContext||window.webkitAudioContext)();
   const sound=[];
   try{
    for(const id of ['wav-coleta','wav-vitoria','wav-dano','wav-portal','wav-menu']){
     const blob=await api.assetBlob(pick(id));
     if(blob.type!=='audio/wav')throw Error('WAV MIME '+id);
     const bytes=await blob.arrayBuffer();
     const decoded=await audio.decodeAudioData(bytes.slice(0));
     if(decoded.sampleRate!==22050||decoded.numberOfChannels!==1||decoded.duration<=0.05)
      throw Error('WAV decoded format '+id);
     const samples=decoded.getChannelData(0);
     let energy=0;for(let i=0;i<samples.length;i++)energy+=samples[i]*samples[i];
     if(energy/samples.length<0.000001)throw Error('Silent WAV '+id);
     sound.push({id,duration:decoded.duration,sampleRate:decoded.sampleRate,channels:decoded.numberOfChannels,rms:Math.sqrt(energy/samples.length)});
    }
   }finally{await audio.close()}
   const images=[];
   for(const id of ['explorador','mapa-floresta','chave','mapa-corrida']){
    const blob=await api.assetBlob(pick(id));
    if(blob.type!=='image/png')throw Error('PNG MIME '+id);
    const url=URL.createObjectURL(blob);
    try{
     const img=await new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('PNG decode failed '+id));image.src=url;
     });
     if(img.naturalWidth<16||img.naturalHeight<16)throw Error('PNG dimensions '+id);
     const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
     const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
     const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
     let nonTransparent=0;for(let i=3;i<data.length;i+=4)if(data[i]>0)nonTransparent++;
     if(nonTransparent<10)throw Error('Blank PNG '+id);
     images.push({id,width:img.naturalWidth,height:img.naturalHeight,visiblePixels:nonTransparent});
    }finally{URL.revokeObjectURL(url)}
   }
   return{sound,images};
  });
  assert.equal(results.sound.length,5,'five actual Web Audio decodes');
  assert.equal(results.images.length,4,'four actual PNG decodes');
  console.log('PASS Chrome: '+results.sound.length+' WAV files decoded with Web Audio, nonzero RMS; '+results.images.length+' PNG files decoded and pixel-inspected');
  console.log(JSON.stringify(results,null,2));
  console.log('NOT CLAIMED: GDevelop editor import, mobile physical playback or listening test');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

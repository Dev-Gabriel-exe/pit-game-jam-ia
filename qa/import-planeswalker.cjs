'use strict';
/* Media provided by RuneSnow on Pixabay Content License, user-approved ID 307687. */
const {chromium}=require('playwright'),fs=require('fs');
const ID='307687',URL='https://pixabay.com/videos/fantasy-planeswalker-mage-myth-307687/';
const urls=new Set([
'https://cdn.pixabay.com/video/2025/10/03/307687_medium.mp4',
'https://cdn.pixabay.com/video/2025/10/03/307687_large.mp4',
'https://cdn.pixabay.com/video/2025/10/03/307687_small.mp4',
'https://cdn.pixabay.com/video/2025/10/03/307687_tiny.mp4',
'https://cdn.pixabay.com/video/2025/10/03/307687.mp4'
]);
function collect(str){
 const s=String(str||'').replace(/\\u002f/ig,'/').replace(/\\\//g,'/');
 for(const x of s.matchAll(/https?:\/\/[^\s"'<>\\]+?\.mp4(?:\?[^\s"'<>\\]*)?/ig))if(x[0].includes('307687')&&x[0].includes('pixabay.com/video/'))urls.add(x[0]);
 for(const x of s.matchAll(/\/video\/\d{4}\/\d{2}\/\d{2}\/307687[^"'\s<>\\]+?\.mp4/ig))urls.add('https://cdn.pixabay.com'+x[0]);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:1400,height:900}});
 const page=await context.newPage();
 page.on('request',r=>collect(r.url()));page.on('response',r=>collect(r.url()));
 const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:55000});
 console.log('Pixabay HTTP',response?.status());
 await page.waitForTimeout(5500);
 collect(await page.content());
 const extras=await page.evaluate(()=>[...document.querySelectorAll('video,source,[src*=".mp4"],[data-src*=".mp4"]')].flatMap(x=>[x.src,x.currentSrc,x.getAttribute('data-src')]).filter(Boolean));
 collect(JSON.stringify(extras));
 console.log('Found candidates',JSON.stringify([...urls]));
 if(!urls.size)throw Error('Could not extract a confirmed .mp4 for media id '+ID);
 const variants=[];
 for(const url of urls){for(const size of ['large','medium','small','tiny'])variants.push(url.replace(/_(large|medium|small|tiny)\.mp4/i,'_'+size+'.mp4'))}
 let best=null;
 for(const u of new Set(variants)){
  try{
   const res=await context.request.get(u,{timeout:40000,headers:{Referer:'https://pixabay.com/',Accept:'video/mp4,*/*'}});console.log('CDN candidate HTTP',res.status(),u);
   if(res.status()!==200&&res.status()!==206)continue;
   const b=await res.body(),type=res.headers()['content-type']||'';
   if(b.length<75000||(!type.includes('video')&&b.subarray(4,8).toString()!=='ftyp'))continue;
   const score=u.includes('_large.mp4')?4:u.includes('_medium.mp4')?3:u.includes('_small.mp4')?2:1;
   if(!best||score>best.score){best={u,b,score};console.log('Downloaded candidate',u,b.length)}
   if(score>=4)break;
  }catch(e){console.log('Candidate unavailable',u,e.message.slice(0,100))}
 }
 if(!best)throw Error('No playable MP4 media returned from the publisher');
 fs.mkdirSync('v3/assets/missions',{recursive:true});
 fs.writeFileSync('v3/assets/missions/portal-planeswalker-307687.mp4',best.b);
 console.log('MEDIA READY',best.u,best.b.length);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

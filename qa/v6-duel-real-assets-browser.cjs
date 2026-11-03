'use strict';
/* V6 forensic regression: two separate, simultaneous Chromium tabs,
 * REAL KayKit GLBs and retargeted animations, real V5 Three.js viewer.
 *
 * Unlike qa/v5-live-coliseum-browser.cjs, DO NOT mock raw.githubusercontent.com
 * as a 404: that made previous green runs exercise NO real character GLBs.
 *
 * No requests to production API; sessions and matches are wholly fictitious.
 */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.DATABASE_URL ||= 'postgresql://invalid.local/v6_test_never_connect';
const {battleBuild,simulate}=require('../chat-api/api/coliseum.js');
const root=process.cwd(),hostname='127.0.0.1',port=8878;
const origin='http://'+hostname+':'+port;
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css',
 '.glb':'model/gltf-binary','.gltf':'model/gltf+json','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'};
const names=['V6-Guardian-Test','V6-Mage-Test'],classes=['guardian','mage'];
const fighters=classes.map((klass,i)=>{
 const name=names[i];
 const attrs=i?{FOR:0,DES:0,INT:3,VIT:0,DEF:0}:{FOR:0,DES:0,INT:0,VIT:3,DEF:0};
 const talents=i?['E01','R10']:['P01','P02'];
 return {id:'10000000-0000-4000-8000-'+String(i+1).padStart(12,'0'),
   name,approvedMissions:3,finalTrial:false,
   build:battleBuild({klass,attributes:attrs,talents},3,5,name)};
});
const record=(()=>{const res=simulate(fighters,5);return {
 id:'90000000-0000-4000-8000-000000000006',kind:'duel',room:'PITGAME26',
 mission:5,seed:res.seed,roster:fighters,options:res.options,
 result:res.summary,sha256:res.signature
}})();
const server=http.createServer((req,res)=>{
 if(req.url==='/v6-fixture'){
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  return res.end('<!doctype html><title>V6 Two Tabs Real Assets</title><iframe id="viewer" src="/v5/coliseum-live.html" style="width:1180px;height:840px"></iframe>');
 }
 const decoded=decodeURIComponent(new URL(req.url,origin).pathname);
 const file=path.resolve(root,'.'+decoded);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
  res.writeHead(404);return res.end();
 }
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
const durationMs=Number(process.env.V6_WATCH_MS||26000),results=[];
(async()=>{
 await new Promise(resolve=>server.listen(port,hostname,resolve));
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
  '--disable-dev-shm-usage'
 ]});
 try{
  const context=await browser.newContext({viewport:{width:1320,height:940}});
  const pages=await Promise.all([context.newPage(),context.newPage()]);
  for(let idx=0;idx<pages.length;idx++){
   const page=pages[idx],log={tab:idx+1,jsErrors:[],consoleErrors:[],failedRequests:[],
    realGlbResponses:[],samples:[],crashes:0};
   results.push(log);
   page.on('pageerror',e=>log.jsErrors.push(e.stack||e.message));
   page.on('console',e=>{if(e.type()==='error')log.consoleErrors.push(e.text().slice(0,350))});
   page.on('crash',()=>log.crashes++);
   page.on('requestfailed',r=>log.failedRequests.push({url:r.url().slice(0,250),error:r.failure()?.errorText}));
   page.on('response',resp=>{
    if(resp.url().includes('raw.githubusercontent.com')&&resp.url().includes('.glb')){
     log.realGlbResponses.push({url:resp.url().split('/').pop(),status:resp.status(),
      bytes:resp.headers()['content-length']||null});
    }
   });
   // Keep Three.js pinned and local to remove CDN errors, but let KayKit
   // GLBs load normally from their REAL source, like a classroom PC.
   await page.route('https://cdn.jsdelivr.net/npm/three@0.186.1/**',route=>{
    const rel=new URL(route.request().url()).pathname.split('/three@0.186.1/')[1];
    const dir=path.resolve(root,'node_modules/three'),file=path.resolve(dir,rel||'');
    if(!file.startsWith(dir+path.sep)||!fs.existsSync(file))
     return route.fulfill({status:404,body:'missing local Three.js module'});
    return route.fulfill({status:200,headers:{'content-type':'text/javascript',
      'access-control-allow-origin':'*'},body:fs.readFileSync(file)});
   });
  }
  await Promise.all(pages.map(p=>p.goto(origin+'/v6-fixture',{waitUntil:'domcontentloaded',timeout:45000})));
  // Send identical server-pinned match to each browser iframe.
  await Promise.all(pages.map(page=>page.evaluate(match=>{
   document.querySelector('#viewer').contentWindow.postMessage({type:'PIT_COLISEUM_REPLAY',match},
    location.origin);
  },record)));
  await Promise.all(pages.map(p=>p.frameLocator('#viewer').locator('#playReplay:not([disabled])').waitFor({timeout:45000})));
  // This is the decisive missing assertion in V5 live tests.
  // No green test is allowed without both genuine KayKit rigs successfully loaded.
  await Promise.all(pages.map(p=>p.waitForFunction(()=>{
   const el=document.querySelector('#viewer')?.contentDocument?.querySelector('#arenaStage');
   return Number(el?.dataset.v5ModelsLoaded||0)===2||Number(el?.dataset.v5ModelsFailed||0)>0;
  },null,{timeout:115000})));
  for(let i=0;i<pages.length;i++){
   const stage=pages[i].frameLocator('#viewer').locator('#arenaStage');
   const status=await stage.evaluate(el=>({
    loaded:Number(el.dataset.v5ModelsLoaded||0),failed:Number(el.dataset.v5ModelsFailed||0),
    glbStatus:el.dataset.v5KaykitMotionStatus||null,modelsExpected:el.dataset.v5ModelsExpected
   }));
   results[i].loading=status;
   assert.equal(status.loaded,2,'V6 tab '+(i+1)+' must load both REAL KayKit GLBs: '+JSON.stringify(results[i]));
  }
  // Both separate browsers now run the real GLB rigs and added motion clips.
  await Promise.all(pages.map(p=>p.frameLocator('#viewer').locator('#playReplay').click()));
  const began=Date.now(),interval=3000;
  while(Date.now()-began<durationMs){
   await new Promise(resolve=>setTimeout(resolve,interval));
   for(let i=0;i<pages.length;i++){
    const page=pages[i],log=results[i];
    const sample=await page.frameLocator('#viewer').locator('#arenaStage').evaluate(el=>({
      fps:Number(el.dataset.v5FrameRate||0),
      context:el.dataset.v5GraphicsContext||null,
      loss:Number(el.dataset.v5GraphicsLosses||0),
      drawCalls:Number(el.dataset.v5DrawCalls||0),
      geometry:Number(el.dataset.v5GraphicsGeometries||0),
      textures:Number(el.dataset.v5GraphicsTextures||0),
      loaded:Number(el.dataset.v5ModelsLoaded||0),
      modelFailed:Number(el.dataset.v5ModelsFailed||0),
      animations:Number(el.dataset.v5ActiveMixerUpdates||0),
      spriteEvents:Number(el.dataset.v5SpriteVisualEvents||0)
    }));
    sample.seconds=+((Date.now()-began)/1000).toFixed(1);
    log.samples.push(sample);
   }
  }
  for(const [i,log] of results.entries()){
   const fps=log.samples.map(v=>v.fps);
   const losses=log.samples.map(v=>v.loss);
   console.log('TAB '+(i+1)+' summary: '+JSON.stringify({
    realGlbs:log.realGlbResponses,loading:log.loading,seconds:log.samples.length*3,
    fps,losses,crashes:log.crashes,errors:log.jsErrors,requestsFailed:log.failedRequests
   }));
   assert.equal(log.crashes,0,'Chromium tab '+(i+1)+' crashed under real assets');
   assert.equal(log.jsErrors.length,0,'JS error after real GLB load: '+JSON.stringify(log.jsErrors));
   assert.ok(log.samples.every(v=>v.context!=='lost'),'Lost WebGL context in tab '+(i+1));
   assert.ok(fps.slice(-3).every(n=>n>=5),'Persistent FPS collapse in tab '+(i+1)+' '+JSON.stringify(fps));
  }
  assert.equal(results[0].loading.loaded,2);assert.equal(results[1].loading.loaded,2);
  console.log('PASS V6: TWO simultaneous tabs, TWO real KayKit 3D rigs per tab, '+durationMs+'ms of rendered duel');
 }finally{
  console.log('V6_METRICS '+JSON.stringify(results).slice(0,24000));
  await browser.close();
 }
})().catch(e=>{console.error('V6_REAL_ASSET_FAILURE',e.stack||e);process.exitCode=1})
 .finally(()=>server.close());

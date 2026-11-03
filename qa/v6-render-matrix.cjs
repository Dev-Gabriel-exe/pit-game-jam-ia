'use strict';
// Same seeded official roster, genuine GLBs, same canvas size and same VM.
// V5 reference vs V6 standalone vs the actual V3 bridge. No production API.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto'),{chromium}=require('playwright');
const engine=require('../chat-api/lib/v5-phase2-engine.js');
const root=process.cwd(),ref=path.resolve(process.env.V6_REFERENCE_ROOT||'reference-v5');
const scenario=process.env.V6_SCENARIO||'duel',mission=scenario==='arena10'?10:5;
const count=scenario==='duel'?2:30,origin='https://dev-gabriel-exe.github.io';
const base=origin+'/pit-game-jam-ia/',seed=4175863657;
const roster=Array.from({length:count},(_,i)=>{
 const klass=['warrior','mage','hunter','guardian'][i%4],name='V6 ficticio '+(i+1);
 return {id:'10000000-0000-4000-8000-'+String(i+1).padStart(12,'0'),name,
  approvedMissions:mission,finalTrial:mission===10,
  build:engine.exampleBuild(klass,name,mission,Math.floor(i/4)%11,{experimentalFinal:mission===10})};
});
const options={arenaMission:mission,limit:95,arenaScale:5,damageScale:.5,stormDelay:35,
 stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',rangedCommitment:'recovery',balancePreset:'e-hp2'};
const expected=engine.battle(roster,{...options,seed}).run(2300);
assert(expected.finished,'Fixture must finish in the real server engine');
const summary={winner:expected.winner,time:expected.time,standings:expected.standings};
const match={id:'90000000-0000-4000-8000-000000000006',kind:count===2?'duel':'arena',mission,
 room:'PITGAME26',seed,roster,options,result:summary,
 sha256:createHash('sha256').update(JSON.stringify({seed,roster,options,summary})).digest('hex')};
const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css',
 '.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'};
const scripts=['hero-core.js','phase2-combat.js','talent-vfx.js','talent-sprites.js','talent-motion-cinematic.js',
 'talent-choreography.js','camera-director.js','camera-framing.js','camera-viewer.js','performance-monitor.js','build-identity.js','character-assets.js'];
fs.mkdirSync('qa/v6-evidence',{recursive:true});
const results=[],heroGates=new Map();
const embedded=arm=>['embedded','app'].includes(arm);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function referenceHTML(){
 return '<!doctype html><html><head><link rel="stylesheet" href="./v5/arena-lab.css">'+
 '<style>body{margin:0;background:#100d19}#arenaStage{position:relative;width:1000px;height:520px;overflow:hidden}</style>'+
 '<script type="importmap">'+JSON.stringify({imports:{three:'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js',
 'three/addons/':'https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/'}})+'</script>'+
 scripts.filter(s=>fs.existsSync(path.join(ref,'v5',s))).map(s=>'<script src="./v5/'+s+'"></script>').join('')+
 '</head><body><div id="arenaStage"></div></body></html>';
}
async function routePage(page,arm,index,log){
 page.on('pageerror',e=>log.jsErrors.push(e.stack||e.message));
 page.on('crash',()=>log.crashes++);
 page.on('response',r=>{if(r.url().includes('raw.githubusercontent.com')&&/\.glb/.test(r.url()))log.assets.push({name:r.url().split('/').pop(),status:r.status()})});
 page.on('requestfailed',r=>log.failed.push({url:r.url(),error:r.failure()?.errorText}));
 // Block ALL API calls, including unexpected endpoints. No credential exists.
 await page.route('https://pit-game-jam-chat.vercel.app/**',async route=>{
  const url=new URL(route.request().url()),action=url.searchParams.get('action');
  const cors={'access-control-allow-origin':origin,'access-control-allow-methods':'GET,POST,OPTIONS',
   'access-control-allow-headers':'Content-Type,X-PIT-Student-Token,X-PIT-Teacher-Pin,X-PIT-Room'};
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:cors});
  log.api.push({service:url.pathname,action,method:route.request().method()});
  if(!url.pathname.endsWith('/coliseum')){
   let body={ok:true,unread:0};
   if(url.pathname.endsWith('/hero')){
    log.lateHeroPending=true;
    await new Promise(resolve=>heroGates.set(page,resolve));
    log.lateHeroReleased=true;
    body={ok:true,exists:true,room:'PITGAME26',approved:mission,revision:1,profile:roster[index].build};
   }else if(url.pathname.endsWith('/classroom')&&action==='state'){
    body={ok:true,room:'PITGAME26',role:'student',state:{current_stage:mission,phase:'practice',updated_at:new Date().toISOString()},
     student:{id:roster[index].id,name:roster[index].name},
     progress:Array.from({length:mission},(_,i)=>({stage:i+1,status:'approved',evidence:'V6 isolated fixture'}))};
   }
   return route.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify(body)});
  }
  const record={id:match.id,matchId:match.id,mission,createdAt:new Date().toISOString(),status:'accepted',
   outgoing:index===0,peerName:'V6 ficticio',fighters:count};
  const state={ok:true,role:'student',room:'PITGAME26',stage:mission,duelsEnabled:true,eligible:true,
   heroSaved:true,optedIn:true,busy:false,peers:[],invites:count===2?[record]:[],arena:count===30?[record]:[]};
  const body=action==='state'?state:action==='match'?{ok:true,match}:{ok:false,error:'Blocked isolated test API'};
  return route.fulfill({status:body.ok?200:403,headers:cors,contentType:'application/json',body:JSON.stringify(body)});
 });
 await page.route('https://cdn.jsdelivr.net/npm/three@0.186.1/**',route=>{
  const rel=new URL(route.request().url()).pathname.split('/three@0.186.1/')[1];
  const dir=path.resolve(root,'node_modules/three'),file=path.resolve(dir,rel||'');
  return route.fulfill({status:fs.existsSync(file)?200:404,contentType:'text/javascript',
   headers:{'access-control-allow-origin':'*'},body:fs.existsSync(file)?fs.readFileSync(file):'missing Three module'});
 });
 await page.route(base+'**',route=>{
  const name=new URL(route.request().url()).pathname.slice('/pit-game-jam-ia/'.length);
  if(name==='v6-matrix.html')return route.fulfill({contentType:'text/html',body:arm==='v5'?referenceHTML():
   '<!doctype html><html><head><link rel="stylesheet" href="./v3/v5-h1e-bridge.css">'+
   '<link rel="stylesheet" href="./v3/v5-coliseum-live.css"></head><body data-role="student">'+
   '<button id="pitV5HubButton">Coliseu</button></body></html>'});
  const dir=arm==='v5'?ref:root,file=path.resolve(dir,name);
  if(!file.startsWith(dir+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())
   return route.fulfill({status:404,body:'Missing matrix file '+name});
  return route.fulfill({contentType:MIME[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
 });
}
async function sample(page,arm){
 return page.evaluate(arm=>{
  const f=['embedded','app'].includes(arm)?document.querySelector('iframe.pit-live-replay'):null;
  const doc=f?f.contentDocument:document,el=doc.querySelector('#arenaStage'),d=el?.dataset||{};
  const sim=window.__v6Stage?.simulation;
  return {fps:Number(d.v5FrameRate||0),loaded:Number(d.v5ModelsLoaded||0),failed:Number(d.v5ModelsFailed||0),
   calls:Number(d.v5DrawCalls||0),triangles:Number(d.v5Triangles||0),losses:Number(d.v5GraphicsLosses||0),
   context:d.v5GraphicsContext,geometries:Number(d.v5GraphicsGeometries||0),textures:Number(d.v5GraphicsTextures||0),
   canvas:[el?.querySelector('canvas')?.width,el?.querySelector('canvas')?.height],
   clock:sim?sim.time:doc.querySelector('#replayClock')?.textContent,
   done:sim?sim.finished:doc.querySelector('#resultPanel')?.hidden===false,
   result:sim?.finished?sim.result().winner?.id:doc.querySelector('#resultPanel')?.textContent,
   tab:window.PIT_V5_H1E?.snapshot.currentTab,attached:!['embedded','app'].includes(arm)||!!f?.isConnected};
 },arm);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle',
  '--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
 try{
  for(const arm of (process.env.V6_ARMS||'v5,direct,embedded').split(',')){
   const contexts=await Promise.all([browser.newContext({viewport:{width:1350,height:920}}),
    browser.newContext({viewport:{width:1350,height:920}})]);
   if(arm==='app')await Promise.all(contexts.map((c,i)=>c.addInitScript(data=>{
    localStorage.setItem('pit_chat_student_v09',JSON.stringify({studentId:data.id,name:data.name,token:'f'.repeat(64),room:'PITGAME26'}));
    sessionStorage.setItem('pit_v3_gallery_seen_PITGAME26_'+data.id,'1');
   },{id:roster[i].id,name:roster[i].name})));
   const pages=await Promise.all(contexts.map(c=>c.newPage()));
   const logs=pages.map((_,i)=>({arm,index:i,scenario,assets:[],failed:[],api:[],samples:[],jsErrors:[],crashes:0}));
   results.push(...logs);
   await Promise.all(pages.map((p,i)=>routePage(p,arm,i,logs[i])));
   await Promise.all(pages.map(p=>p.goto(base+(arm==='direct'?'v5/coliseum-live.html':arm==='app'?'aluno-v3.html':'v6-matrix.html'),{waitUntil:'load',timeout:60000})));
   await Promise.all(pages.map(async(p,i)=>{
    if(arm==='v5')await p.evaluate(async record=>{
     const {createStage}=await import('./v5/arena-three.js');
     const stage=window.__v6Stage=createStage(document.querySelector('#arenaStage'),{
      arenaScale:record.kind==='duel'?2.6:5,quality:'auto',spriteEffects:'on'});
     stage.fighters(record.roster,{seed:record.seed,...record.options});stage.enableAutoCamera(true);
    },match);
    else if(arm==='direct')await p.evaluate(record=>window.postMessage({type:'PIT_COLISEUM_REPLAY',match:record},location.origin),match);
    else if(arm==='app'){
     await p.locator('#workspace').waitFor({state:'visible',timeout:45000});
     const heroRequest=p.waitForRequest(r=>new URL(r.url()).pathname==='/api/hero');
     await p.locator('#pitV5HubButton').click();await heroRequest;
     await p.locator('#pitV5HubTabs [data-tab="'+(count===2?'duel':'arena')+'"]').click();
     await p.locator('iframe.pit-live-replay').waitFor({state:'attached',timeout:45000});
     await wait(1800);
     assert(heroGates.has(p),'Hero GET must have been deliberately held');
     heroGates.get(p)();heroGates.delete(p);
     await p.frameLocator('iframe.pit-live-replay').locator('#playReplay:not([disabled])').waitFor({timeout:150000});
    }else{
     await p.addScriptTag({url:base+'v3/v5-h1e-bridge.js'});await p.addScriptTag({url:base+'v3/v5-coliseum-live.js'});
     await p.evaluate(({id,mission,tab})=>{
      window.PIT_V5_H1E.update({role:'student',stage:mission,status:'submitted',approved:mission,authenticated:true,
       visualPreview:false,studentId:id,studentName:'V6 ficticio',room:'PITGAME26',tokenProvider:()=> 'f'.repeat(64)});
      window.PIT_V5_H1E.open(tab);
     },{id:roster[i].id,mission,tab:count===2?'duel':'arena'});
     await p.frameLocator('iframe.pit-live-replay').locator('#playReplay:not([disabled])').waitFor({timeout:60000});
    }
    await p.waitForFunction(({arm,count})=>{
     const doc=['embedded','app'].includes(arm)?document.querySelector('iframe.pit-live-replay')?.contentDocument:document;
     return Number(doc?.querySelector('#arenaStage')?.dataset.v5ModelsLoaded||0)===count;
    },{arm,count},{timeout:150000});
    const target=embedded(arm)?p.frames().find(f=>f.url().includes('/v5/coliseum-live.html')):p.mainFrame();
    // Equal CSS surface in all three experiments; report actual buffer dimensions.
    if(arm!=='app')await target.evaluate(()=>{
     const el=document.querySelector('#arenaStage');el.style.setProperty('width','1000px','important');
     el.style.setProperty('height','520px','important');el.style.setProperty('min-height','520px','important');
    });
   }));
   await wait(2500);
   await Promise.all(pages.map(async p=>{
    if(arm==='v5')return p.evaluate(()=>window.__v6Stage.resume());
    return (embedded(arm)?p.frameLocator('iframe.pit-live-replay'):p).locator('#playReplay').click();
   }));
   const began=Date.now();
   while(Date.now()-began<240000){
    await wait(4000);
    const samples=await Promise.all(pages.map(p=>sample(p,arm)));
    samples.forEach((s,i)=>{s.wallSeconds=(Date.now()-began)/1000;logs[i].samples.push(s)});
    if(arm==='embedded')await Promise.all(pages.map((p,i)=>p.evaluate(({id,mission})=>{
     window.PIT_V5_H1E.update({role:'student',stage:mission,status:'submitted',approved:mission,authenticated:true,
      visualPreview:false,studentId:id,studentName:'V6 ficticio',room:'PITGAME26',tokenProvider:()=> 'f'.repeat(64)});
    },{id:roster[i].id,mission})));
    if(samples.every(s=>s.done))break;
   }
   for(let i=0;i<pages.length;i++){
    const log=logs[i],last=log.samples.at(-1),fps=log.samples.map(s=>s.fps).sort((a,b)=>a-b);
    log.fps={min:fps[0],p10:fps[Math.floor(fps.length*.1)],median:fps[Math.floor(fps.length*.5)]};
    console.log('V6_MATRIX '+JSON.stringify({scenario,arm,index:i,fps:log.fps,last,errors:log.jsErrors,assets:log.assets}));
    assert.equal(log.crashes,0);assert.deepEqual(log.jsErrors,[]);
    assert(log.samples.every(s=>s.loaded===count&&s.failed===0&&s.context!=='lost'&&s.losses===0&&s.attached),'3D resource/lifecycle failure');
    assert(last.done,'Full battle failed to reach a result');
    if(arm==='v5'){
     const oldEngine=require(path.join(ref,'v5/phase2-combat.js'));
     const oldExpected=oldEngine.battle(roster,{...options,seed,arenaScale:count===2?2.6:5}).run(2300);
     assert.equal(last.result,oldExpected.winner?.id,'Reference viewer differs from its original combat configuration');
    }
    else assert.match(last.result,/CAMPEÃO:/,'Visual replay diverged from server result');
    assert(log.assets.length>0&&log.assets.every(x=>x.status===200),'Actual GLB downloads must succeed');
    if(arm==='app'){
     assert(log.lateHeroReleased,'Delayed hero request was not exercised');
     assert(log.api.filter(x=>x.service==='/api/classroom'&&x.action==='state').length>=2,'Real V3 polling must run during the battle');
     assert(log.samples.every(x=>x.tab===(count===2?'duel':'arena')),'Late hero callback changed the active V3 view');
     await pages[i].locator('#pitV5HubClose').click();
     assert.equal(await pages[i].locator('#pitV5Hub iframe.pit-live-replay').count(),0);
     await pages[i].locator('#pitV5HubButton').click();
     await pages[i].locator('#pitV5HubTabs [data-tab="'+(count===2?'duel':'arena')+'"]').click();
     if(await pages[i].locator('iframe.pit-live-replay').count()===0)
      await pages[i].locator('[data-view="'+match.id+'"]').click();
     try{
      await pages[i].frameLocator('iframe.pit-live-replay').locator('#playReplay:not([disabled])').waitFor({timeout:150000});
     }catch(error){
      const debug=await pages[i].evaluate(()=>({
       tab:window.PIT_V5_H1E.snapshot.currentTab,
       frames:[...document.querySelectorAll('iframe')].map(f=>({src:f.src,connected:f.isConnected})),
       status:document.querySelector('iframe.pit-live-replay')?.contentDocument?.querySelector('#replayStatus')?.textContent,
       dataset:{...document.querySelector('iframe.pit-live-replay')?.contentDocument?.querySelector('#arenaStage')?.dataset},
       text:document.querySelector('#pitV5TeacherPanel')?.textContent.slice(-800)
      })).catch(e=>({error:e.message}));
      console.error('V6_REOPEN_DEBUG '+JSON.stringify({scenario,index:i,debug,errors:log.jsErrors,failed:log.failed,assets:log.assets}));
      throw error;
     }
     await pages[i].frameLocator('iframe.pit-live-replay').locator('#playReplay').click();
     await wait(2500);
     await pages[i].frameLocator('iframe.pit-live-replay').locator('#pauseReplay').click();
     const reopened=await sample(pages[i],arm);assert.equal(reopened.loaded,count);assert.equal(reopened.losses,0);
     await pages[i].locator('#pitV5HubClose').click();
     log.reopenedAndDisposed=true;
    }
   }
   await Promise.all(contexts.map(c=>c.close()));
  }
  console.log('PASS V6 FUNCTIONAL full seeded render matrix '+scenario+'; FPS remains separately reported, not certified');
 }finally{
  fs.writeFileSync('qa/v6-evidence/matrix-'+scenario+'.json',JSON.stringify({scenario,seed,expected:summary,results},null,2));
  await browser.close();
 }
})().catch(e=>{console.error('V6_MATRIX_FAILURE',e.stack||e);process.exitCode=1});

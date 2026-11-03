'use strict';
/* V6 integrated lifecycle: production-origin V3 bridge + live Coliseum iframe
 * + genuine KayKit GLBs, two concurrent mock-authenticated student windows.
 * Every HTTP call to the production API is intercepted. NO real accounts.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
process.env.DATABASE_URL||='postgresql://invalid.local/v6_never_connect';
const {battleBuild,simulate}=require('../chat-api/api/coliseum.js');
const ROOT=process.cwd(),origin='https://dev-gabriel-exe.github.io',base=origin+'/pit-game-jam-ia/';
const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript',
 '.css':'text/css','.json':'application/json','.glb':'model/gltf-binary',
 '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'};
const ids=['10000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000012'];
const names=['V6-Uno','V6-Dos'],classes=['warrior','mage'];
const roster=classes.map((klass,i)=>({
 id:ids[i],name:names[i],approvedMissions:3,finalTrial:false,
 build:battleBuild({klass,attributes:{FOR:0,DES:0,INT:0,VIT:0,DEF:0},
 talents:i?['E01','R02']:['B01','B02']},3,5,names[i])
}));
const sim=simulate(roster,5),match={id:'90000000-0000-4000-8000-000000000006',
 kind:'duel',mission:5,room:'PITGAME26',seed:sim.seed,
 roster,options:sim.options,result:sim.summary,sha256:sim.signature};
const metrics=[];
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
  '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
 ]});
 try{
  const pages=await Promise.all([browser.newPage({viewport:{width:1350,height:920}}),
   browser.newPage({viewport:{width:1350,height:920}})]);
  for(let i=0;i<pages.length;i++){
   const page=pages[i],events={tab:i+1,jsErrors:[],requestsFailed:[],consoleErrors:[],gpuLosses:[],fps:[]};
   metrics.push(events);
   page.on('pageerror',e=>events.jsErrors.push(e.stack||e.message));
   page.on('console',e=>{if(e.type()==='error')events.consoleErrors.push(e.text().slice(0,250))});
   page.on('requestfailed',req=>events.requestsFailed.push({url:req.url().slice(0,150),
    error:req.failure()?.errorText}));
   page.on('crash',()=>events.crash=true);
   page.on('response',resp=>{
    if(/\.glb(?:\?|$)/.test(resp.url())&&resp.url().includes('raw.githubusercontent.com'))
     (events.realAssets??=[]).push({name:resp.url().split('/').pop(),status:resp.status()});
   });
   await page.route('https://pit-game-jam-chat.vercel.app/api/coliseum**',async route=>{
    if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{
     'access-control-allow-origin':origin,
     'access-control-allow-methods':'GET,POST,OPTIONS',
     'access-control-allow-headers':'Content-Type,X-PIT-Student-Token,X-PIT-Teacher-Pin,X-PIT-Room'}});
    const url=new URL(route.request().url()),action=url.searchParams.get('action');
    const json=action==='state'?{
     ok:true,role:'student',room:'PITGAME26',stage:3,duelsEnabled:true,
     eligible:true,heroSaved:true,optedIn:true,busy:false,peers:[],
     invites:[{id:'90000000-0000-4000-8000-000000000007',status:'accepted',
      matchId:match.id,outgoing:i===0,peerName:names[1-i],
      createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+60000).toISOString()}],
     arena:[]
    }:action==='match'?{ok:true,match}:{ok:false,error:'Action not mocked in isolated V6 test'};
    await route.fulfill({status:json.ok?200:400,contentType:'application/json',
     headers:{'access-control-allow-origin':origin},body:JSON.stringify(json)});
   });
   await page.route(origin+'/pit-game-jam-ia/**',route=>{
    const url=new URL(route.request().url()),name=url.pathname.replace('/pit-game-jam-ia/','');
    if(name==='v6-integration-fixture.html'){
     const html='<html><head><link rel="stylesheet" href="./v3/v5-h1e-bridge.css">'+
       '<link rel="stylesheet" href="./v3/v5-coliseum-live.css"></head>'+
       '<body data-role="student"><button id="pitV5HubButton">Abrir Coliseu</button></body></html>';
     return route.fulfill({status:200,contentType:'text/html',body:html});
    }
    const file=path.resolve(ROOT,name);
    if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())
     return route.fulfill({status:404,body:'Missing V6 test asset: '+name});
    return route.fulfill({status:200,contentType:MIME[path.extname(file)]||'application/octet-stream',
     body:fs.readFileSync(file)});
   });
   await page.route('https://cdn.jsdelivr.net/npm/three@0.186.1/**',route=>{
    const rel=new URL(route.request().url()).pathname.split('/three@0.186.1/')[1];
    const dir=path.resolve(ROOT,'node_modules/three'),file=path.resolve(dir,rel||'');
    if(!file.startsWith(dir+path.sep)||!fs.existsSync(file))return route.fulfill({status:404});
    return route.fulfill({status:200,contentType:'text/javascript',
     headers:{'access-control-allow-origin':'*'},body:fs.readFileSync(file)});
   });
  }
  await Promise.all(pages.map(p=>p.goto(base+'v6-integration-fixture.html',{waitUntil:'load',timeout:45000})));
  for(let i=0;i<pages.length;i++){
   const page=pages[i];
   await page.addScriptTag({url:base+'v3/v5-h1e-bridge.js'});
   await page.addScriptTag({url:base+'v3/v5-coliseum-live.js'});
   await page.evaluate(data=>{
    window.PIT_V5_H1E.update({...data,tokenProvider:()=> 'a'.repeat(64)});
    window.PIT_V5_H1E.open('duel');
   },{role:'student',stage:3,status:'submitted',approved:2,authenticated:true,
      visualPreview:false,studentId:ids[i],studentName:names[i],room:'PITGAME26'});
  }
  await Promise.all(pages.map(page=>page.frameLocator('iframe.pit-live-replay')
   .locator('#playReplay:not([disabled])').waitFor({timeout:75000})));
  await Promise.all(pages.map(page=>page.waitForFunction(()=>{
   const f=document.querySelector('iframe.pit-live-replay');
   return Number(f?.contentDocument?.querySelector('#arenaStage')?.dataset.v5ModelsLoaded||0)===2;
  },null,{timeout:115000})));
  await Promise.all(pages.map(page=>page.frameLocator('iframe.pit-live-replay')
   .locator('#playReplay').click()));
  await new Promise(resolve=>setTimeout(resolve,2800));
  // Reproduce the V3 state update that USED TO close the production duel panel.
  await Promise.all(pages.map((page,i)=>page.evaluate(data=>{
   window.PIT_V5_H1E.update({...data,tokenProvider:()=> 'a'.repeat(64)});
  },{role:'student',stage:3,status:'submitted',approved:2,authenticated:true,
    visualPreview:false,studentId:ids[i],studentName:names[i],room:'PITGAME26'})));
  for(let k=0;k<4;k++){
   await new Promise(resolve=>setTimeout(resolve,3000));
   for(let i=0;i<pages.length;i++){
    const page=pages[i],event=metrics[i];
    const state=await page.evaluate(()=>{
     const pane=document.querySelector('#pitV5TeacherPanel'),iframe=pane?.querySelector('iframe.pit-live-replay');
     const stage=iframe?.contentDocument?.querySelector('#arenaStage');
     return {tab:window.PIT_V5_H1E.snapshot.currentTab,iframeAttached:!!iframe?.isConnected,
      modelsLoaded:Number(stage?.dataset.v5ModelsLoaded||0),
      fps:Number(stage?.dataset.v5FrameRate||0),context:stage?.dataset.v5GraphicsContext||null,
      loss:Number(stage?.dataset.v5GraphicsLosses||0),
      clock:iframe?.contentDocument?.querySelector('#replayClock')?.textContent||null};
    });
    event.fps.push(state);
   }
  }
  for(const x of metrics){
   console.log('V6_INTEGRATED_TAB '+x.tab+' '+JSON.stringify(x).slice(0,6000));
   assert.notEqual(x.crash,true,'Browser tab crashed');
   assert.equal(x.jsErrors.length,0,'Integrated viewer JS exception');
   assert.ok(x.fps.length>=4,'Not enough state observations');
   assert.ok(x.fps.every(y=>y.tab==='duel'&&y.iframeAttached),'V3 update destroyed active duel');
   assert.ok(x.fps.every(y=>y.modelsLoaded===2),'KayKit rigs dropped during integrated replay');
   assert.ok(x.fps.every(y=>y.context!=='lost'),'Lost WebGL context');
   assert.ok(x.fps.slice(-3).every(y=>y.fps>=5),'Integrated replay FPS collapse');
   assert.ok(x.fps.some(y=>y.clock!=='00:00'),'Integrated combat did not advance');
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('V6_INTEGRATION_FAILURE',e.stack||e);process.exitCode=1});

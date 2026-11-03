'use strict';
/* Real Chromium + WebGL smoke; strictly fictional session, no network to Neon. */
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
process.env.DATABASE_URL='postgresql://ci.invalid/unused';
const {simulate,battleBuild}=require('../chat-api/api/coliseum.js');
const {chromium}=require('playwright');
const root=process.cwd(),rootURL='http://127.0.0.1:8877';
const roster=['warrior','mage'].map((klass,i)=>({
 id:'10000000-0000-4000-8000-'+String(i+1).padStart(12,'0'),name:'Herói Fictício '+(i+1),
 approvedMissions:5,finalTrial:false,
 build:battleBuild({klass,attributes:{FOR:0,DES:0,INT:0,VIT:0,DEF:0},talents:[]},5,5,'Herói Fictício '+(i+1))
}));
const sim=simulate(roster,5);
const match={id:'90000000-0000-4000-8000-000000000001',kind:'duel',room:'PITGAME26',
 mission:5,seed:sim.seed,roster,options:sim.options,result:sim.summary,sha256:sim.signature};
const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.glb':'model/gltf-binary'};
const server=http.createServer((req,res)=>{
 if(req.url==='/fixture'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end('<!doctype html><title>Fictional Coliseum QA</title><iframe id="viewer" src="/v5/coliseum-live.html" style="width:1200px;height:840px"></iframe>')}
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,rootURL).pathname));
 if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);return res.end()}
 res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});
 fs.createReadStream(target).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(8877,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1400,height:950}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdn.jsdelivr.net/npm/three@0.186.1/**',route=>{
   const u=new URL(route.request().url()),relative=u.pathname.split('/three@0.186.1/')[1];
   const file=path.resolve(root,'node_modules/three',relative||'');
   if(!file.startsWith(path.resolve(root,'node_modules/three')+path.sep)||!fs.existsSync(file))return route.fulfill({status:404});
   return route.fulfill({status:200,headers:{'content-type':'text/javascript','access-control-allow-origin':'*'},body:fs.readFileSync(file)});
  });
  await page.route('https://raw.githubusercontent.com/**',route=>route.fulfill({status:404}));
  await page.goto(rootURL+'/fixture');
  const frame=page.frameLocator('#viewer');
  await frame.locator('#replayStatus').waitFor();
  await page.evaluate(data=>{
   const f=document.querySelector('#viewer');
   f.contentWindow.postMessage({type:'PIT_COLISEUM_REPLAY',match:data},location.origin);
  },match);
  await frame.locator('#playReplay:not([disabled])').waitFor({timeout:25000});
  assert.equal(await frame.locator('#followHero option').count(),3);
  assert.equal(await frame.locator('#scoreboard>div').count(),2);
  await frame.locator('#playReplay').click();
  await page.waitForTimeout(1500);
  const clock=await frame.locator('#replayClock').innerText();
  assert.notEqual(clock,'00:00','simulation must advance after user starts replay');
  const canvas=await frame.locator('#arenaStage canvas').count();
  assert.ok(canvas>=1,'WebGL canvas must be initialized');
  assert.equal(errors.filter(x=>/Uncaught|TypeError|ReferenceError/.test(x)).length,0,JSON.stringify(errors));

  console.log('PASS fictional 3D duel replay: frame, two players, server-pinned match, live animation and WebGL.');
  // Exercise real teacher/student controls, without reaching the production server.
  const controls=await browser.newPage();
  let enabled=false,pending=false,peerAccepted=false,studentPolls=0;
  await controls.route('https://pit-game-jam-chat.vercel.app/api/coliseum**',async route=>{
   const req=route.request(),url=new URL(req.url()),action=url.searchParams.get('action');
   const teacher=!!req.headers()['x-pit-teacher-pin'];
   let data={ok:true};
   if(action==='state'&&teacher)data={
    ok:true,role:'teacher',room:'PITGAME26',stage:5,duelsEnabled:enabled,pendingInvites:0,
    students:[{id:roster[0].id,name:roster[0].name,heroSaved:true,approved:5},
      {id:roster[1].id,name:roster[1].name,heroSaved:true,approved:5}],arena:[]};
   if(action==='state'&&!teacher){
    if(pending&&studentPolls++>=1)peerAccepted=true;
    data={
    ok:true,role:'student',room:'PITGAME26',stage:5,duelsEnabled:true,heroSaved:true,eligible:true,
    optedIn:true,busy:pending,peers:pending?[]:[{id:roster[1].id,name:roster[1].name}],
    invites:pending?[{id:'90000000-0000-4000-8000-000000000002',
       status:peerAccepted?'accepted':'pending',matchId:peerAccepted?match.id:null,
       outgoing:true,peerName:roster[1].name,createdAt:new Date().toISOString(),
       expiresAt:new Date(Date.now()+50000).toISOString()}]:[],
    arena:[]};
   }
   if(action==='duels'){enabled=JSON.parse(req.postData()).enabled;data={ok:true,duelsEnabled:enabled}}
   if(action==='invite'){pending=true;studentPolls=0;data={ok:true,inviteId:'90000000-0000-4000-8000-000000000002'}}
   if(action==='match')data={ok:true,match};
   await route.fulfill({status:action==='invite'?201:200,contentType:'application/json',
     headers:{'access-control-allow-origin':'*'},body:JSON.stringify(data)});
  });
  await controls.goto(rootURL+'/fixture');
  await controls.evaluate(()=>{
   document.querySelector('#viewer')?.remove();
   const el=document.createElement('div');el.id='liveRoot';document.body.append(el);
  });
  await controls.addScriptTag({url:rootURL+'/v3/v5-coliseum-live.js'});
  await controls.evaluate(()=>window.PIT_V5_LIVE.mount(
   document.querySelector('#liveRoot'),{role:'teacher',authenticated:true,room:'PITGAME26',
    visualPreview:false,teacherPinProvider:()=> 'fixture_private_teacher_pin'},'teacher'));
  await controls.locator('[data-duels=true]').waitFor({timeout:10000});
  await controls.locator('[data-duels=true]').click();
  await controls.locator('.pit-live-state:has-text("LIBERADOS")').waitFor({timeout:10000});
  await controls.evaluate(()=>window.PIT_V5_LIVE.mount(
   document.querySelector('#liveRoot'),{role:'student',authenticated:true,room:'PITGAME26',
   visualPreview:false,studentId:'10000000-0000-4000-8000-000000000001',tokenProvider:()=>'a'.repeat(64)},'duel'));
  await controls.locator('button:has-text("Desafiar")').waitFor({timeout:10000});
  await controls.locator('button:has-text("Desafiar")').click();
  await controls.locator('button:has-text("Cancelar convite")').waitFor({timeout:10000});
  await controls.locator('[data-refresh]').click();
  await controls.locator('iframe.pit-live-replay').waitFor({timeout:15000});
  // The isolated HTML fixture lacks the production CSS, so trigger the same DOM click
  // directly without Playwright's scrolling/actionability check over active WebGL.
  await controls.evaluate(()=>document.querySelector('[data-back]')?.click());
  await controls.locator('iframe.pit-live-replay').waitFor({state:'detached',timeout:10000});
  await controls.evaluate(()=>window.PIT_V5_LIVE.unmount());
  await controls.close();
  console.log('PASS native teacher duel release, student availability and server-backed invitation button.');

 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());

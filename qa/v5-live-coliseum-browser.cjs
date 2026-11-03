'use strict';
/* Real Chromium + WebGL smoke; strictly fictional session, no network to Neon. */
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
process.env.DATABASE_URL='postgresql://ci.invalid/unused';
const {simulate,battleBuild}=require('../chat-api/api/coliseum.js');
const {chromium}=require('playwright');
const root=process.cwd(),rootURL='http://127.0.0.1:8877';
// Anonymized regression equivalent to the M5 accepted duel observed on Nov 3:
const roster=['warrior','mage'].map((klass,i)=>({
 id:'10000000-0000-4000-8000-'+String(i+1).padStart(12,'0'),name:'Herói Fictício '+(i+1),
 approvedMissions:3,finalTrial:false,
 build:battleBuild({klass,attributes:i?{FOR:0,DES:0,INT:3,VIT:0,DEF:0}:{FOR:3,DES:0,INT:0,VIT:0,DEF:1},
  talents:i?['E01','R10']:['B01','B04']},3,5,'Herói Fictício '+(i+1))
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
  // Official CC0 KayKit hero GLBs are hosted here; blocking this host makes every hero fail loading.
   // Browser smoke must load the real characters to validate an actual 3D duel.
  await page.goto(rootURL+'/fixture');
  const frame=page.frameLocator('#viewer');
  await frame.locator('#replayStatus').waitFor();
  await page.evaluate(data=>{
   const f=document.querySelector('#viewer');
   f.contentWindow.postMessage({type:'PIT_COLISEUM_REPLAY',match:data},location.origin);
  },match);
  try{await frame.locator('#replayStatus:has-text("Batalha em reprodução.")').waitFor({timeout:25000})}
   catch(e){
    const diagnostics=await frame.locator('body').evaluate(()=>({status:document.getElementById('replayStatus')?.textContent,
     heading:document.getElementById('coliseumHeading')?.textContent,
     modelsLoaded:document.getElementById('arenaStage')?.dataset.v5ModelsLoaded,
     modelsFailed:document.getElementById('arenaStage')?.dataset.v5ModelsFailed,
     engine:document.getElementById('arenaStage')?.dataset.v5CombatEngine,
     webgl:document.getElementById('arenaStage')?.dataset.v5GraphicsContext,
     playDisabled:document.getElementById('playReplay')?.disabled}));
    console.error('AUTO_START_DIAGNOSTICS',JSON.stringify({diagnostics,errors}));
    throw e;
   }
  assert.equal(await frame.locator('#followHero option').count(),3);
  assert.equal(await frame.locator('#scoreboard>div').count(),2);
  assert.equal(await frame.locator('#playReplay').isDisabled(),true,'Duelo deve iniciar automaticamente, sem precisar clicar em replay');
  // Previous test only watched 1.5s; reported crash happens after 2–3s.
  await page.waitForTimeout(9000);
  assert.equal(errors.length,0,'The replay JS must not throw after the initial seconds: '+JSON.stringify(errors));
  const diagnostics=await frame.locator('#arenaStage').evaluate(el=>({
   context:el.dataset.v5GraphicsContext,losses:el.dataset.v5GraphicsLosses,
   modelErrors:el.dataset.v5ModelsFailed,sim:el.dataset.v5CombatEngine,
   fps:el.dataset.v5FrameRate,talents:el.dataset.v5TalentFxEvents
  }));
  assert.notEqual(diagnostics.context,'lost','No permanent WebGL context loss on duel replay');
  assert.ok(Number(diagnostics.fps)>=5,'Duel renderer must deliver >=5 fps, observed '+diagnostics.fps+'.');
  console.log('Nine-second duel diagnostics',JSON.stringify(diagnostics));
  const clock=await frame.locator('#replayClock').innerText();
  assert.notEqual(clock,'00:00','simulation must advance automatically after accepting a duel, without any replay click');
  const canvas=await frame.locator('#arenaStage canvas').count();
  assert.ok(canvas>=1,'WebGL canvas must be initialized');
  assert.equal(errors.filter(x=>/Uncaught|TypeError|ReferenceError/.test(x)).length,0,JSON.stringify(errors));

  console.log('PASS fictional 3D duel replay: frame, two players, server-pinned match, live animation and WebGL.');
  // Exercise real teacher/student controls, without reaching the production server.
  const controls=await browser.newPage();
  let enabled=false,pending=false,peerAccepted=false,studentPolls=0,historyOutcome='win';
  let lobbyOpen=false,arenaStarted=false;const lobbyJoined=new Set();
  const fakeLobby=viewer=>lobbyOpen&&!arenaStarted?{
   mission:5,joinedCount:lobbyJoined.size,
   ...(viewer==='teacher'?{participants:[...lobbyJoined].map(id=>({id,name:roster.find(x=>x.id===id)?.name||'Herói'}))}:
      {joined:lobbyJoined.has(roster[0].id)})
  }:null;
  await controls.route('https://pit-game-jam-chat.vercel.app/api/coliseum**',async route=>{
   const req=route.request(),url=new URL(req.url()),action=url.searchParams.get('action');
   const teacher=!!req.headers()['x-pit-teacher-pin'];
   let data={ok:true};
   if(action==='state'&&teacher)data={
    ok:true,role:'teacher',room:'PITGAME26',stage:5,duelsEnabled:enabled,pendingInvites:0,
    lobby:fakeLobby('teacher'),students:[{id:roster[0].id,name:roster[0].name,heroSaved:true,approved:5},
      {id:roster[1].id,name:roster[1].name,heroSaved:true,approved:5}],arena:[]};
   if(action==='state'&&!teacher){
    if(pending&&studentPolls++>=1)peerAccepted=true;
    data={
    ok:true,role:'student',room:'PITGAME26',stage:5,duelsEnabled:true,heroSaved:true,approved:5,eligible:true,
    lobby:fakeLobby('student'),
    optedIn:true,busy:pending,peers:pending?[]:[{id:roster[1].id,name:roster[1].name}],
    invites:pending?[{id:'90000000-0000-4000-8000-000000000002',
       status:peerAccepted?'accepted':'pending',matchId:peerAccepted?match.id:null,
       outcome:peerAccepted?historyOutcome:null,
       outgoing:true,peerName:roster[1].name,createdAt:new Date().toISOString(),
       expiresAt:new Date(Date.now()+50000).toISOString()}]:[],
    arena:[]};
   }
   if(action==='duels'){enabled=JSON.parse(req.postData()).enabled;data={ok:true,duelsEnabled:enabled}}
   if(action==='invite'){pending=true;studentPolls=0;data={ok:true,inviteId:'90000000-0000-4000-8000-000000000002'}}
   if(action==='arena-open'){lobbyOpen=true;data={ok:true,lobby:'waiting'}}
   if(action==='arena-join'){lobbyJoined.add(roster[0].id);data={ok:true,joined:true}}
   if(action==='arena-leave'){lobbyJoined.delete(roster[0].id);data={ok:true,joined:false}}
   if(action==='arena-start'){arenaStarted=true;data={ok:true,matchId:match.id}}
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
  await controls.evaluate(()=>document.querySelector('[data-refresh]')?.click());
  await controls.locator('iframe.pit-live-replay').waitFor({timeout:15000});
  // The isolated HTML fixture lacks the production CSS, so trigger the same DOM click
  // directly without Playwright's scrolling/actionability check over active WebGL.
  await controls.evaluate(()=>document.querySelector('[data-back]')?.click());
  await controls.locator('iframe.pit-live-replay').waitFor({state:'detached',timeout:10000});
  await controls.locator('.pit-live-outcome:has-text("Vitória")').waitFor({timeout:10000});
  historyOutcome='loss';
  await controls.evaluate(()=>document.querySelector('[data-refresh]')?.click());
  await controls.locator('.pit-live-outcome:has-text("Derrota")').waitFor({timeout:10000});
  historyOutcome='draw';
  await controls.evaluate(()=>document.querySelector('[data-refresh]')?.click());
  await controls.locator('.pit-live-outcome:has-text("Empate")').waitFor({timeout:10000});
  // Teacher opens a waiting room. The student must explicitly join; the teacher
  // cannot start until the actual joined headcount reaches at least two.
  await controls.evaluate(()=>window.PIT_V5_LIVE.mount(
    document.querySelector('#liveRoot'),{role:'teacher',authenticated:true,room:'PITGAME26',
     visualPreview:false,teacherPinProvider:()=> 'fixture_private_teacher_pin'},'collective'));
  await controls.locator('[data-open="5"]').waitFor({timeout:10000});
  await controls.evaluate(()=>document.querySelector('[data-open="5"]')?.click());
  await controls.locator('[data-start="5"]').waitFor({timeout:10000});
  assert.equal(await controls.locator('[data-start="5"]').isDisabled(),true);
  await controls.evaluate(()=>window.PIT_V5_LIVE.mount(
    document.querySelector('#liveRoot'),{role:'student',authenticated:true,room:'PITGAME26',
    visualPreview:false,studentId:'10000000-0000-4000-8000-000000000001',tokenProvider:()=>'a'.repeat(64)},'arena'));
  await controls.locator('[data-join="5"]').waitFor({timeout:10000});
  await controls.evaluate(()=>document.querySelector('[data-join="5"]')?.click());
  await controls.locator('text=Você já está na sala de espera.').waitFor({timeout:10000});
  await controls.evaluate(()=>window.PIT_V5_LIVE.mount(
    document.querySelector('#liveRoot'),{role:'teacher',authenticated:true,room:'PITGAME26',
     visualPreview:false,teacherPinProvider:()=> 'fixture_private_teacher_pin'},'collective'));
  await controls.locator('[data-start="5"]').waitFor({timeout:10000});
  assert.equal(await controls.locator('[data-start="5"]').isDisabled(),true);
  lobbyJoined.add(roster[1].id);
  await controls.evaluate(()=>document.querySelector('[data-refresh]')?.click());
  await controls.locator('[data-start="5"]:not([disabled])').waitFor({timeout:10000});
  await controls.locator('.pit-live-count:has-text("2 / 30")').first().waitFor({timeout:10000});
  await controls.evaluate(()=>window.PIT_V5_LIVE.unmount());
  await controls.close();
  console.log('PASS native teacher duel release, student availability and server-backed invitation button.');

 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());

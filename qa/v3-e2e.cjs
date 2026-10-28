'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:8899/';
 const store={stage:1,phase:'briefing',progress:[],teacherMessages:[],studentMessages:[],messages:[],lastSeen:new Date().toISOString()};
 const id='11111111-1111-4111-8111-111111111111',token='a'.repeat(64);
 const error=[];
 const closeArcade=async page=>{
  const overlay=page.locator('#missionGallery');
  if(await overlay.count()&&await overlay.evaluate(el=>el.classList.contains('open'))){
   await page.locator('#missionGalleryClose').click();
   await page.locator('#missionGallery.open').waitFor({state:'hidden'});
  }
 };
 const fixture=async(route)=>{
  const req=route.request(),url=new URL(req.url()),action=url.searchParams.get('action'),service=url.pathname.endsWith('/chat')?'chat':'classroom';
  const headers=req.headers(),teacher=!!headers['x-pit-teacher-pin'],posted=req.postData()?JSON.parse(req.postData()):{};
  let body={ok:true},status=200;
  if(service==='chat'){
   if(action==='join')body={ok:true,studentId:id,name:posted.name,token,code:'PITGAME26'};
   if(action==='teacher-login')body={ok:true,room:'PITGAME26'};
   if(action==='unread')body={ok:true,unread:0};
   if(action==='threads')body={ok:true,threads:[{id,display_name:'Aluno QA',unread:0}]};
   if(action==='messages')body={ok:true,messages:store.messages};
   if(action==='read')body={ok:true};
   if(action==='send'){store.messages.push({id:store.messages.length+1,author:teacher?'teacher':'student',mission:posted.mission,body:posted.body,created_at:new Date().toISOString()});body={ok:true,id:store.messages.length}}
  }else{
   const state={current_stage:store.stage,phase:store.phase,updated_at:new Date().toISOString()};
   if(action==='state')body=teacher?{ok:true,state,role:'teacher'}:{ok:true,state,role:'student',progress:store.progress,student:{id,name:'Aluno QA'}};
   if(action==='stage'){store.stage=posted.stage;store.phase=posted.phase;body={ok:true,state:{current_stage:store.stage,phase:store.phase,updated_at:new Date().toISOString()}}}
   if(action==='progress'){const p={stage:posted.stage,status:posted.status,evidence:posted.evidence,route:posted.route,feedback:'',updated_at:new Date().toISOString()};store.progress=store.progress.filter(x=>x.stage!==p.stage).concat([p]);body={ok:true,progress:p}}
   if(action==='heartbeat'){store.lastSeen=new Date().toISOString();body={ok:true,stage:posted.stage}}
   if(action==='roster')body={ok:true,state,roster:[{id,display_name:'Aluno QA',joined_at:store.lastSeen,last_seen_at:store.lastSeen,unread_chat:0,approved:store.progress.filter(p=>p.status==='approved').length,stages:store.progress}]};
   if(action==='review'){const p=store.progress.find(x=>x.stage===posted.stage);if(p){p.status=posted.status;p.feedback=posted.feedback;body={ok:true,progress:p}}else{status=409;body={ok:false,error:'Sem entrega'}}}
  }
  await route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(body)});
 };
 const tc=await browser.newContext({viewport:{width:1440,height:980}}),sc=await browser.newContext({viewport:{width:1440,height:980}});
 const tp=await tc.newPage(),sp=await sc.newPage();
 for(const p of [tp,sp]){p.on('pageerror',e=>error.push(e.message));await p.route('https://pit-game-jam-chat.vercel.app/api/**',fixture)}
 const portal=await tc.newPage();
 await portal.goto(base+'index.html');
 assert.equal(await portal.locator('a.skip-link[href="#conteudo"]').count(),1,'portal skip link exists');
 await portal.keyboard.press('Tab');
 assert.equal(await portal.evaluate(()=>document.activeElement?.classList.contains('skip-link')),true,'keyboard first focus is skip link');
 assert.equal(await portal.locator('a[href="./aluno-v3.html"]').count()>0,true,'portal routes to student V3');
 assert.equal(await portal.locator('a[href="./professor-v3.html"]').count()>0,true,'portal routes to teacher V3');
 const portalHero=await portal.locator('.hero').evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
 assert(portalHero.includes('missao-01.webp'),'portal uses approved cinematic mission artwork');
 await portal.locator('#assetFormat').selectOption('3d');
 assert.equal(await portal.locator('#assetGrid .resource-card').count(),5,'library shows five 3D props');
 await portal.locator('#assetGenre').selectOption('corrida');
 assert.equal(await portal.locator('#assetGrid .resource-card').count(),1,'racing filter intersects 3D');
 await portal.locator('#assetFormat').selectOption('audio');
 assert.equal(await portal.locator('#assetGrid .resource-card').count(),3,'racing audio filter has three samples');
 await portal.locator('#assetGenre').selectOption('todos');
 await portal.locator('#assetFormat').selectOption('todos');
 for(const [id,file,magic] of [['explorador','explorador.png','PNG'],['glb-cristal','cristal_3d.glb','glTF'],['wav-coleta','coleta.wav','RIFF']]){
  const promise=portal.waitForEvent('download',{timeout:15000});
  await portal.locator('#assetGrid [data-asset="'+id+'"]').click();
  const download=await promise;
  assert.equal(download.suggestedFilename(),file,'download filename for '+id);
  const bytes=require('node:fs').readFileSync(await download.path());
  assert(bytes.length>100,'download contains real bytes: '+id);
  assert.equal(magic==='PNG'?bytes.toString('ascii',1,4):bytes.toString('ascii',0,4),magic,'valid file signature '+id);
 }
  console.log('PASS UI-05: 3 real browser downloads (PNG/GLB/WAV) and genre/format filters');
 for(const [id,file] of [['rpg','pit-kit-exploracao-2d.zip'],['plataforma','pit-kit-plataforma-2d.zip'],['puzzle3d','pit-kit-puzzle-3d.zip'],['corrida3d','pit-kit-corrida-3d.zip']]){
  const pending=portal.waitForEvent('download',{timeout:30000});
  await portal.locator('[data-quick-kit="'+id+'"]').click();
  const dl=await pending;
  assert.equal(dl.suggestedFilename(),file,'quick kit filename '+id);
  const zip=require('node:fs').readFileSync(await dl.path());
  const end=zip.length-22;
  assert.equal(zip.readUInt32LE(end),0x06054b50,'ZIP central directory '+id);
  const count=zip.readUInt16LE(end+10);
  assert(count>=6,'ZIP contains multiple assets and instructions '+id);
  let off=zip.readUInt32LE(end+16),png=0,glb=0,wav=0;
  for(let n=0;n<count;n++){
   assert.equal(zip.readUInt32LE(off),0x02014b50,'ZIP central record '+id);
   const nameLen=zip.readUInt16LE(off+28),extraLen=zip.readUInt16LE(off+30),commentLen=zip.readUInt16LE(off+32);
   const name=zip.toString('utf8',off+46,off+46+nameLen),local=zip.readUInt32LE(off+42);
   const dataStart=local+30+zip.readUInt16LE(local+26)+zip.readUInt16LE(local+28);
   const data=zip.subarray(dataStart,dataStart+zip.readUInt32LE(off+20));
   if(name.endsWith('.png')){assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a','actual browser PNG');assert(data.readUInt32BE(16)>=160,'real canvas dimensions');png++}
   if(name.endsWith('.glb')){assert.equal(data.toString('ascii',0,4),'glTF');glb++}
   if(name.endsWith('.wav')){assert.equal(data.toString('ascii',0,4),'RIFF');wav++}
   off+=46+nameLen+extraLen+commentLen;
  }
  assert(png+glb+wav>=4,'kit has real binary assets '+id);
  assert.match(await portal.locator('#quickKitStatus').innerText(),/preparado com/,'download status '+id);
 }
 console.log('PASS UI-06: four real Chrome ZIP downloads with PNG dimensions, GLB and WAV signatures');
 await portal.close();
 console.log('PASS UI-02: portal V3 routes, keyboard skip link and cinematic artwork in Chrome');
 await tp.goto(base+'professor-v3.html');
 await tp.locator('#authPin').fill('test-pin-1234567890');
 await tp.locator('#authSubmit').click();
 await tp.locator('#workspace:visible').waitFor();
 assert.equal(await tp.locator('.stage-btn').count(),10);
 assert.match(await tp.locator('#missionTitle').innerText(),/O CHAMADO/);
 assert.equal(await tp.locator('.tm-pro-card').count(),6,'instructor has six technical concept cards');
 assert.match(await tp.locator('.tm-pro-lead').first().innerText(),/jogo|experiência/i);
 await tp.locator('[data-phase="demo"]').click();
 await tp.locator('[data-tm-test="0"]').waitFor();
 await tp.locator('[data-tm-test="0"]').click();
 assert.match(await tp.locator('#tm1TestResult').innerText(),/TESTE APROVADO/,'state machine denies early victory');
 await tp.locator('[data-tm-test="3"]').click();
 assert.match(await tp.locator('#tm1TestResult').innerText(),/TESTE APROVADO/,'state machine opens with three items');
 await tp.locator('[data-phase="briefing"]').click();
 await tp.locator('#openGallery').click();
 await tp.locator('#missionGallery.open').waitFor();
 assert.equal(await tp.locator('.gallery-card').count(),10,'10 cinematic mission posters');
 await tp.locator('#missionGalleryClose').click();
 await sp.goto(base+'aluno-v3.html');
 await sp.locator('#authName').fill('Aluno QA');
 await sp.locator('#authCode').fill('PITGAME26');
 await sp.locator('#authSubmit').click();
 await sp.locator('#workspace:visible').waitFor();
 await closeArcade(sp);
 assert.equal(await sp.locator('.stage-btn').count(),10,'10 ordered stages for students');
 assert.equal(await sp.locator('.tm-pro-card').count(),0,'no professor technical cards in student');
 assert.equal(await sp.locator('[data-phase="demo"]').count(),0,'student only sees briefing, build and delivery');
 if(!(await sp.locator('#missionGallery').evaluate(el=>el.classList.contains('open'))))await sp.locator('#openGallery').click();
 await sp.locator('#missionGallery.open').waitFor();
 assert.equal(await sp.locator('.arcade-card').count(),10,'student cinematic carousel contains ten mission cards');
 await sp.locator('#missionGalleryClose').click();
 await sp.locator('#missionGallery.open').waitFor({state:'hidden'});
 assert.equal(await sp.locator('.stage-btn[data-stage="2"]').isDisabled(),true,'next stage locked by teacher');
 await sp.locator('[data-q-tab="review"]').click();
 assert.equal(await sp.locator('#submitWork').isDisabled(),true,'submission blocked until professor releases practice');
 await tp.locator('[data-phase="practice"]').click();
 const stageReply=tp.waitForResponse(response=>response.url().includes('action=stage')&&response.status()===200,{timeout:10000});
 await tp.locator('#navPrimary').click();
 await stageReply;
 assert.equal(store.phase,'practice','professor releases practice for the whole class');
 await sp.reload();
 await sp.locator('#workspace:visible').waitFor();
 await closeArcade(sp);
 if(await sp.locator('#missionGallery').evaluate(el=>el.classList.contains('open'))){await sp.locator('#missionGalleryClose').click();await sp.locator('#missionGallery.open').waitFor({state:'hidden'});}
 await sp.locator('[data-q-tab="practice"]').click();
 assert.equal(await sp.locator('#qo-genre').isEnabled(),true,'student can edit project idea after release');
 await sp.locator('#qo-genre').selectOption('Aventura');
 const answers={title:'Castelo de Cristais',hero:'Uma exploradora do castelo',action:'Coletar tres cristais',objective:'Abrir o portal no fim do corredor',victory:'Interagir com a porta apos obter tres cristais',feedback:'Contador 3 de 3 e mensagem de vitoria'};
 for(const [field,value] of Object.entries(answers))await sp.locator('#qo-'+field).fill(value);
 await sp.locator('[data-q-tab="review"]').click();
 assert.equal(await sp.locator('#submitWork').isDisabled(),false,'submission enabled only after valid authored project brief');
 assert.match(await sp.locator('#evidenceInput').inputValue(),/Castelo de Cristais/);
 await sp.locator('#submitWork').click();
 await sp.getByText('Aguardando validação').first().waitFor();
 await tp.locator('#rosterButton').click();
 await tp.locator('#rosterDrawer.open').waitFor();
 await tp.waitForFunction(()=>document.querySelector('#rosterStats')?.textContent?.includes('inscritos'),null,{timeout:6500});
 assert.match(await tp.locator('#rosterStats').innerText(),/1 inscritos/,'roster uses fake enrolled student');
 await tp.locator('#filterPending').click();
 assert.equal(await tp.locator('#filterPending').getAttribute('aria-pressed'),'true','pending filter announces selection');
 assert.equal(await tp.locator('tr[data-student]').count(),1,'submitted evidence appears in pending filter');
 await tp.locator('#filterHelp').click();
 assert.equal(await tp.locator('#filterHelp').getAttribute('aria-pressed'),'true','help filter announces selection');
 assert.equal(await tp.locator('tr[data-student]').count(),0,'no unread chat means empty help filter');
 await tp.locator('#filterAll').click();
 assert.equal(await tp.locator('#filterAll').getAttribute('aria-pressed'),'true','all filter restores selection');
 assert.equal(await tp.locator('tr[data-student]').count(),1,'all filter restores fake student');
 await tp.locator('tr[data-student]').click();
 await tp.locator('button[data-review="revision"]').click();
 assert.equal(store.progress[0].status,'submitted','revision without explanation must not reach API');
 assert.equal(await tp.locator('.review-comment').count()>0,true,'review form exposes feedback field');
 await tp.locator('button[data-review="approved"]').click();
 assert.equal(store.progress[0].status,'approved','teacher approves submitted work');
 await sp.reload();
 await sp.locator('#workspace:visible').waitFor();
 await closeArcade(sp);
 assert.match(await sp.locator('.stage-btn[data-stage="1"]').innerText(),/CONCLUÍDA/i);
 await sp.locator('#openGallery').click();
 await sp.locator('#missionGallery.open').waitFor();
 assert.equal(await sp.locator('#arcadeProgress').getAttribute('aria-valuenow'),'1','gallery counts only backend-approved missions');
 assert.match(await sp.locator('#arcadeProgressLabel').innerText(),/1 de 10 missões aprovadas/,'gallery approved count is synchronized');
 assert.equal(await sp.locator('#arcadeProgressLabel').getAttribute('aria-live'),'polite','progress is announced accessibly');
 assert.equal(await sp.locator('#arcadeEnter').isDisabled(),false,'approved mission remains revisitable');
 await sp.locator('#missionGalleryClose').click();
 await sp.locator('#missionGallery.open').waitFor({state:'hidden'});
 console.log('PASS UI-03: approved progress, aria value and gallery state reflect fake backend');

 await tp.locator('#rosterClose').click();
 await tp.locator('#navSecondary').click();
 assert.equal(store.stage,2,'teacher opens stage 2 for the group');
 assert.equal(store.phase,'briefing');
 await sp.reload();
 await sp.locator('#workspace:visible').waitFor();
 await closeArcade(sp);
 assert.match(await sp.locator('#missionTitle').innerText(),/MVP EM FOCO/);
 assert.equal(await sp.locator('.stage-btn[data-stage="2"]').isDisabled(),false);
 await sp.locator('.stage-btn[data-stage="1"]').click();
 assert.match(await sp.locator('#missionTitle').innerText(),/O CHAMADO/,'student may review prior stage');
 await tp.locator('#chatButton').click();
 await tp.locator('#chatWindow.open').waitFor();
 await tp.locator('#chatInput').fill('Bom trabalho na etapa 1.');
 await tp.locator('#chatForm button[type="submit"]').click();
 await tp.waitForFunction(()=>document.querySelector('#chatInput')?.value==='',null,{timeout:6500});
 assert.equal(store.messages.at(-1)?.author,'teacher','mock chat send completed before checking store');
 await sp.locator('#chatButton').click();
 await sp.locator('#chatWindow.open').waitFor();
 await sp.locator('#chatMessages .msg').filter({hasText:'Bom trabalho na etapa 1.'}).waitFor({timeout:6500});
 assert.match(await sp.locator('#chatMessages').innerText(),/Bom trabalho/);

 // AUD-05: traverse all ten real mission pages in both roles with isolated fixture data.
 // This is browser rendering coverage, not a claim of GDevelop execution or student approval.
 for(const p of [tp,sp]){if(await p.locator('#chatWindow.open').count()){await p.locator('#chatClose').click();await p.locator('#chatWindow.open').waitFor({state:'hidden'});}}
 const missionAudit=[];
 for(let stage=1;stage<=10;stage++){
  await tp.locator('.stage-btn[data-stage="'+stage+'"]').click();
  await closeArcade(tp);
  for(const phase of ['briefing','demo','practice','review']){
   await tp.locator('#phasebar [data-phase="'+phase+'"]').click();
   const content=await tp.locator('#mainContent').innerText();
   assert(content.trim().length>70,'Teacher M'+stage+' '+phase+' has meaningful visible content');
   assert.equal(await tp.locator('#missionNumber').innerText().then(x=>x.includes('MISSÃO '+String(stage).padStart(2,'0'))),true,'Teacher stage label '+stage);
   missionAudit.push('teacher:'+stage+':'+phase);
  }
 }
 // Raise only the fake backend stage in this Playwright fixture. No classroom API is changed.
 store.stage=10;store.phase='practice';
 await sp.reload();await sp.locator('#workspace:visible').waitFor();await closeArcade(sp);
 for(let stage=1;stage<=10;stage++){
  const button=sp.locator('.stage-btn[data-stage="'+stage+'"]');
  assert.equal(await button.isDisabled(),false,'Fixture-unlocked stage '+stage+' should be navigable');
  await button.click();await closeArcade(sp);
  for(const phase of ['briefing','practice','review']){
   await sp.locator(stage===1?'[data-q-tab="'+phase+'"]':'#phasebar [data-phase="'+phase+'"]').click();
   const content=await sp.locator('#mainContent').innerText();
   assert(content.trim().length>70,'Student M'+stage+' '+phase+' has meaningful visible content');
   missionAudit.push('student:'+stage+':'+phase);
  }
 }
 assert.equal(missionAudit.length,70,'All 10 teacher x4 and student x3 mission pages rendered');
 console.log('PASS AUD-05: 70 mission/role/phase browser page checks with fake API fixture');
 const geometry=await tp.evaluate(()=>{
   const b=document.querySelector('#mainPane').getBoundingClientRect();
   return {bottom:b.bottom,vh:window.innerHeight,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth};
 });
 assert(geometry.bottom>geometry.vh*.7,'main learning panel fills viewport rather than leaving a huge dead zone');
 assert(geometry.scrollWidth<=geometry.clientWidth+2,'no global horizontal overflow on desktop');
 const mctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
 const mobile=await mctx.newPage();
 mobile.on('pageerror',e=>error.push(e.message));
 await mobile.route('https://pit-game-jam-chat.vercel.app/api/**',fixture);
 await mobile.goto(base+'aluno-v3.html');
 await mobile.locator('#authName').fill('Aluno Mobile');
 await mobile.locator('#authCode').fill('PITGAME26');
 await mobile.locator('#authSubmit').click();
 await mobile.locator('#workspace:visible').waitFor();
 await closeArcade(mobile);
 assert.equal(await mobile.locator('.stage-btn').count(),10,'all missions accessible on mobile');
 const width=await mobile.evaluate(()=>({s:document.documentElement.scrollWidth,w:window.innerWidth}));
 assert(width.s<=width.w+4,'mobile has no sideways overflow: '+JSON.stringify(width));
 if(!(await mobile.locator('#missionGallery').evaluate(el=>el.classList.contains('open'))))await mobile.locator('#openGallery').click();
 await mobile.locator('#missionGallery.open').waitFor();
 assert.equal(await mobile.locator('.arcade-card').count(),10,'carousel works on mobile');
 await mobile.locator('#missionGalleryClose').click();
 await mobile.locator('#missionGallery.open').waitFor({state:'hidden'});
 const mobilePortal=await mctx.newPage();
 await mobilePortal.goto(base+'index.html');
 const portalWidth=await mobilePortal.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
 assert(portalWidth.scroll<=portalWidth.viewport+4,'portal must not overflow at 390px: '+JSON.stringify(portalWidth));
 assert.equal(await mobilePortal.locator('a.skip-link[href="#conteudo"]').count(),1,'mobile portal skip link present');
 await mobilePortal.close();
 console.log('PASS UI-02: mobile portal 390px no horizontal overflow');
 await mctx.close();
 console.log('PASS: viewport fills properly on desktop; no mobile overflow; gallery works at 390px');
 assert.equal(error.length,0,'No browser JS errors: '+error.join('|'));
 console.log('PASS: cinematic mission gallery, immersive layout, teacher theory and interactive demo');
 console.log('PASS: student briefing without theory; practice checklist controls same evidence');
 console.log('PASS: 10 stages in order, separate teacher and student sessions');
 console.log('PASS: teacher releases next stage; student follows and may review previous');
 console.log('PASS: student sends evidence; teacher approves in drawer; approval persists');
 console.log('PASS: chat from professor to student remains operational in V2 interface');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

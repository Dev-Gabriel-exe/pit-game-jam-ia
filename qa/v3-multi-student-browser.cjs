'use strict';
/* FUN-09: 1 teacher + 3 fictional students; fake HTTP backend only.
 * Exercises real V3 Chrome UI and simulated 2D/3D evidence workflow.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const pin='0123456789abcdef',ids=[1,2,3].map(n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'));
 const tokens=['a','b','c'].map(x=>x.repeat(64));
 const names=['QA Aventura 2D','QA Puzzle 3D','QA Mobile 2D'];
 const users=ids.map((id,i)=>({id,token:tokens[i],name:names[i],progress:[],lastSeen:new Date().toISOString()}));
 const room={stage:4,phase:'practice'},errors=[];let apiCalls=0,blockedCalls=0;
 const headers={'access-control-allow-origin':'*','access-control-allow-headers':'Content-Type,X-PIT-Student-Token,X-PIT-Teacher-Pin','access-control-allow-methods':'GET,POST,OPTIONS'};
 const fixture=async route=>{
  apiCalls++;const req=route.request(),url=new URL(req.url()),action=url.searchParams.get('action');
  const body=req.postData()?JSON.parse(req.postData()):{},h=req.headers(),teacher=h['x-pit-teacher-pin']===pin;
  const me=users.find(x=>x.token===h['x-pit-student-token']);
  const state={current_stage:room.stage,phase:room.phase,updated_at:new Date().toISOString()};
  let status=200,data={ok:true};
  if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers});return}
  if(action==='teacher-login'){if(!teacher){status=403;data={ok:false,error:'PIN inválido'}}else data={ok:true,room:'PITGAME26'}}
  else if(action==='state'){
   if(teacher)data={ok:true,state,role:'teacher'};
   else if(me)data={ok:true,state,role:'student',student:{id:me.id,name:me.name},progress:me.progress};
   else{status=401;data={ok:false,error:'Sessão inválida'}}
  }else if(action==='roster'){
   if(!teacher){status=403;data={ok:false,error:'Professor apenas'}}
   else data={ok:true,state,roster:users.map(x=>({id:x.id,display_name:x.name,joined_at:x.lastSeen,last_seen_at:x.lastSeen,active_stage:4,highest_stage:Math.max(0,...x.progress.map(p=>p.stage)),approved:x.progress.filter(p=>p.status==='approved').length,unread_chat:0,stages:x.progress}))};
  }else if(action==='stage'){
   if(!teacher){status=403;data={ok:false,error:'Professor apenas'}}
   else{room.stage=body.stage;room.phase=body.phase;data={ok:true,state:{current_stage:room.stage,phase:room.phase,updated_at:new Date().toISOString()}}}
  }else if(action==='progress'){
   if(!me){status=401;data={ok:false,error:'Sessão inválida'}}
   else if(body.stage>room.stage){status=403;data={ok:false,error:'Etapa bloqueada'}}
   else if(body.status==='submitted'&&String(body.evidence||'').length<8){status=400;data={ok:false,error:'Evidência curta'}}
   else{
    const prev=me.progress.find(p=>p.stage===body.stage);
    if(prev&&['submitted','approved'].includes(prev.status)){status=409;data={ok:false,error:'Entrega bloqueada'}}
    else{
     const p={stage:body.stage,route:body.route,status:body.status,evidence:body.evidence,feedback:prev?.feedback||'',updated_at:new Date().toISOString()};
     me.progress=me.progress.filter(x=>x.stage!==p.stage).concat([p]);data={ok:true,progress:p};
    }
   }
  }else if(action==='review'){
   const meReview=users.find(x=>x.id===body.studentId),p=meReview?.progress.find(x=>x.stage===body.stage);
   if(!teacher||!p||p.status!=='submitted'){status=409;data={ok:false,error:'Sem entrega pendente'}}
   else{p.status=body.status;p.feedback=body.feedback||'';data={ok:true,progress:p}}
  }else if(action==='heartbeat'){
   if(!me||body.stage>room.stage){status=403;data={ok:false,error:'Etapa bloqueada'}}
   else{me.lastSeen=new Date().toISOString();data={ok:true,stage:body.stage}}
  }else if(action==='unread')data={ok:true,unread:0};
  else if(action==='threads')data={ok:true,threads:[]};
  else if(action==='messages')data={ok:true,messages:[]};
  else if(action==='read')data={ok:true};
  else{status=404;data={ok:false,error:'Ação não simulada: '+action}}
  if(status>=400)blockedCalls++;
  await route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(data)});
 };
 const contexts=[],pages=[];
 for(let i=0;i<3;i++){
  const context=await browser.newContext({viewport:i===2?{width:390,height:844}:{width:1360,height:900},isMobile:i===2});
  await context.addInitScript(({id,name,token})=>localStorage.setItem('pit_chat_student_v09',JSON.stringify({studentId:id,name,token})),{id:ids[i],name:names[i],token:tokens[i]});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://pit-game-jam-chat.vercel.app/api/**',fixture);
  await page.goto('http://127.0.0.1:8899/aluno-v3.html',{waitUntil:'domcontentloaded'});
  await page.locator('#workspace:visible').waitFor({timeout:15000});
  if(await page.locator('#missionGallery.open').count()){await page.locator('#missionGalleryClose').click();await page.locator('#missionGallery.open').waitFor({state:'hidden'})}
  assert.equal(await page.locator('.stage-btn[data-stage="5"]').isDisabled(),true,'M05 locked for student '+i);
  contexts.push(context);pages.push(page);
 }
 const teacherContext=await browser.newContext({viewport:{width:1440,height:900}}),teacher=await teacherContext.newPage();
 teacher.on('pageerror',e=>errors.push(e.message));await teacher.route('https://pit-game-jam-chat.vercel.app/api/**',fixture);
 await teacher.goto('http://127.0.0.1:8899/professor-v3.html',{waitUntil:'domcontentloaded'});
 await teacher.locator('#authPin').fill(pin);await teacher.locator('#authSubmit').click();
 await teacher.locator('#workspace:visible').waitFor({timeout:15000});
 if(await teacher.locator('#missionGallery.open').count()){await teacher.locator('#missionGalleryClose').click()}
 async function submit(page,token,route,status,evidence){
  return page.evaluate(async({token,route,status,evidence})=>{
   const r=await fetch('https://pit-game-jam-chat.vercel.app/api/classroom?action=progress',{method:'POST',headers:{'Content-Type':'application/json','X-PIT-Student-Token':token},body:JSON.stringify({stage:4,route,status,evidence})});
   return {status:r.status,data:await r.json()};
  },{token,route,status,evidence});
 }
 assert.equal((await submit(pages[0],tokens[0],'2d','submitted','M04 aventura 2D: colisor, controle e teste negativo.')).status,200);
 assert.equal((await submit(pages[1],tokens[1],'3d','submitted','M04 puzzle 3D: objeto, movimento e limite verificados.')).status,200);
 assert.equal((await submit(pages[2],tokens[2],'2d','working','Rascunho mobile 2D')).status,200);
 await teacher.locator('#rosterButton').click();
 await teacher.locator('#rosterDrawer.open').waitFor();
 await teacher.locator('#rosterStats').filter({hasText:/3 inscritos/}).waitFor({timeout:10000});
 await teacher.locator('#filterPending').click();
 assert.equal(await teacher.locator('#rosterContent tr[data-student]').count(),2,'two pending evidence records');
 await teacher.locator('#rosterContent tr[data-student="'+ids[0]+'"]').click();
 await teacher.locator('[data-review="approved"][data-stage="4"]').click();
 await teacher.locator('#rosterContent .state-pill.approved').waitFor({timeout:10000});
 await teacher.locator('#rosterBack').click();
 await teacher.locator('#rosterContent tr[data-student="'+ids[1]+'"]').click();
 await teacher.locator('#rosterContent textarea[data-n="4"]').fill('Repita o teste negativo da colisão 3D e reenvie a evidência.');
 await teacher.locator('[data-review="revision"][data-stage="4"]').click();
 await teacher.locator('#rosterContent .state-pill.revision').waitFor({timeout:10000});
 assert.equal(await teacher.locator('#rosterContent [data-review]').count(),0,'revision awaits resubmission');
 assert.equal((await submit(pages[1],tokens[1],'3d','submitted','M04 puzzle 3D corrigido: limite e caso negativo reexecutados.')).status,200);
 await teacher.locator('#rosterBack').click();
 await teacher.locator('#rosterClose').click();
 await teacher.locator('#rosterButton').click();
 await teacher.locator('#rosterContent tr[data-student="'+ids[1]+'"]').waitFor({timeout:10000});
 await teacher.locator('#rosterContent tr[data-student="'+ids[1]+'"]').click();
 await teacher.locator('[data-review="approved"][data-stage="4"]').click();
 await teacher.locator('#rosterContent .state-pill.approved').waitFor({timeout:10000});
 assert.equal(users[0].progress[0].status,'approved');assert.equal(users[1].progress[0].status,'approved');
 assert.equal(users[2].progress[0].status,'working','third student remains independent');
 // Persist an authored M01 draft in the mobile student before releasing M05.
 await pages[2].locator('.stage-btn[data-stage="1"]').click();
 await pages[2].locator('[data-q-tab="practice"]').click();
 await pages[2].locator('#qo-genre').selectOption('Aventura');
 await pages[2].locator('#qo-title').fill('Projeto Mobile QA Persistente');
 await teacher.locator('#rosterClose').click();
 await teacher.locator('.stage-btn[data-stage="5"]').click();
 await teacher.locator('#navPrimary').click();
 await teacher.locator('#roomState').filter({hasText:/ETAPA 05/}).waitFor({timeout:10000});
 for(let i=0;i<3;i++){
  await pages[i].reload();await pages[i].locator('#workspace:visible').waitFor({timeout:12000});
  if(await pages[i].locator('#missionGallery.open').count()){await pages[i].locator('#missionGalleryClose').click()}
  assert.equal(await pages[i].locator('.stage-btn[data-stage="5"]').isDisabled(),false,'M05 released to student '+i);
 }
 await pages[2].locator('.stage-btn[data-stage="1"]').click();
 await pages[2].locator('[data-q-tab="practice"]').click();
 assert.equal(await pages[2].locator('#qo-title').inputValue(),'Projeto Mobile QA Persistente','mobile draft survives teacher stage release');
 const width=await pages[2].evaluate(()=>({page:document.documentElement.scrollWidth,screen:innerWidth}));
 assert(width.page<=width.screen+4,'mobile no horizontal overflow: '+JSON.stringify(width));
 const fail=async route=>{blockedCalls++;await route.fulfill({status:503,headers,contentType:'application/json',body:JSON.stringify({ok:false,error:'Falha de rede simulada'})})};
 const match=url=>url.pathname.endsWith('/api/classroom')&&url.searchParams.get('action')==='state';
 await pages[1].route(match,fail);
 const unavailable=await pages[1].evaluate(async token=>{const r=await fetch('https://pit-game-jam-chat.vercel.app/api/classroom?action=state',{headers:{'X-PIT-Student-Token':token}});return r.status},tokens[1]);
 assert.equal(unavailable,503,'network failure injected without real API');
 await pages[1].unroute(match,fail);
 const recovered=await pages[1].evaluate(async token=>{const r=await fetch('https://pit-game-jam-chat.vercel.app/api/classroom?action=state',{headers:{'X-PIT-Student-Token':token}});return r.status},tokens[1]);
 assert.equal(recovered,200,'state endpoint recovers after simulated outage');
 assert(apiCalls>20&&blockedCalls>0,'all backend interactions use fake HTTP fixture');
 assert.deepEqual(errors,[],'no JavaScript page errors');
 for(const c of contexts)await c.close();await teacherContext.close();await browser.close();
 console.log('PASS FUN-09 Chrome: 1 teacher, 3 fictional students, 2D/3D evidence, review/revision, mobile draft, release propagation and simulated 503 recovery');
})().catch(e=>{console.error(e);process.exit(1)});

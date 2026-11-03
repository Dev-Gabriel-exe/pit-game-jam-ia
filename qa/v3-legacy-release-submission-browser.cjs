'use strict';
// Final-classroom regression. ALL accounts, teacher credentials and HTTP state
// are fictional in memory; no calls to live Vercel or Neon.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const pin='0123456789abcdef',ids=[1,2,3].map(i=>'00000000-0000-4000-8000-'+String(i).padStart(12,'0'));
 const users=ids.map((id,i)=>({id,token:String.fromCharCode(97+i).repeat(64),
  name:'Aluno Fictício '+(i+1),progress:[],last_seen_at:new Date().toISOString()}));
 const room={current_stage:1,phase:'briefing',updated_at:new Date().toISOString()};
 const seen={stage:[],progress:[],review:[]},errors=[];
 const headers={'access-control-allow-origin':'*','access-control-allow-headers':'Content-Type,X-PIT-Student-Token,X-PIT-Teacher-Pin','access-control-allow-methods':'GET,POST,OPTIONS'};
 const fixture=async route=>{
  const req=route.request(),action=new URL(req.url()).searchParams.get('action'),
   body=req.postData()?JSON.parse(req.postData()):{},h=req.headers(),
   teacher=h['x-pit-teacher-pin']===pin,
   me=users.find(x=>x.token===h['x-pit-student-token']);
  let result={ok:true},status=200;
  if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers});return}
  if(action==='teacher-login'){if(!teacher){status=403;result={ok:false,error:'PIN do professor inválido'}}}
  else if(action==='state'){
   if(!teacher&&!me){status=401;result={ok:false,error:'Entre na oficina.'}}
   else result={ok:true,state:{...room},role:teacher?'teacher':'student',progress:me?.progress||[]};
  }else if(action==='stage'){
   seen.stage.push({...body});
   // Match the stale Vercel API exactly: phase is REQUIRED. This is the
   // regression that previously returned "Etapa ou fase inválida".
   if(!teacher){status=403;result={ok:false,error:'Apenas o professor controla a turma.'}}
   else if(!Number.isInteger(body.stage)||body.stage<1||body.stage>10||
    !['briefing','demo','practice','review'].includes(body.phase)){
    status=400;result={ok:false,error:'Etapa ou fase inválida.'};
   }else if(body.stage>room.current_stage+1){
    status=409;result={ok:false,error:'Uma missão por vez.'};
   }else{
    room.current_stage=Math.max(room.current_stage,body.stage);
    room.phase=body.phase;room.updated_at=new Date().toISOString();
    result={ok:true,state:{...room}};
   }
  }else if(action==='progress'){
   seen.progress.push({...body,token:me?.token||null});
   if(!me){status=401;result={ok:false,error:'Sessão inválida'}}
   else if(body.stage>room.current_stage||
    (body.stage===room.current_stage&&!['practice','review'].includes(room.phase))){
    status=403;result={ok:false,error:'A prática desta etapa ainda não foi liberada pelo professor.'}
   }else if(String(body.evidence||'').length<8||!['2d','3d'].includes(body.route)){
    status=400;result={ok:false,error:'Evidência inválida'}
   }else if(me.progress.some(p=>p.stage===body.stage&&['submitted','approved'].includes(p.status))){
    status=409;result={ok:false,error:'Já enviada'}
   }else{
    let p={stage:body.stage,route:body.route,status:body.status,
     evidence:body.evidence,updated_at:new Date().toISOString(),feedback:''};
    me.progress=me.progress.filter(x=>x.stage!==p.stage).concat([p]);
    result={ok:true,progress:p};
   }
  }else if(action==='roster'){
   if(!teacher){status=403;result={ok:false,error:'Acompanhamento exclusivo'}}
   else result={ok:true,state:{...room},roster:users.map(u=>({id:u.id,display_name:u.name,
    joined_at:u.last_seen_at,last_seen_at:u.last_seen_at,active_stage:1,
    unread_chat:0,approved:u.progress.filter(p=>p.status==='approved').length,
    stages:u.progress}))};
  }else if(action==='review'){
   seen.review.push({...body});const u=users.find(x=>x.id===body.studentId);
   const p=u?.progress.find(x=>x.stage===body.stage&&x.status==='submitted');
   if(!teacher||!p){status=409;result={ok:false,error:'Sem entrega pendente'}}
   else{p.status=body.status;p.feedback=body.feedback||'';result={ok:true,progress:p}}
  }else if(action==='heartbeat')result={ok:true,stage:body.stage};
  else if(action==='unread')result={ok:true,unread:0};
  else if(action==='messages')result={ok:true,messages:[]};
  else if(action==='threads')result={ok:true,threads:[]};
  else if(action==='read')result={ok:true};
  else{status=404;result={ok:false,error:'Ação inválida: '+action}}
  await route.fulfill({status,contentType:'application/json',headers,body:JSON.stringify(result)});
 };
 const contexts=[],students=[];
 const openStudent=async(i)=>{
  const user=users[i],context=await browser.newContext({viewport:{width:1300,height:940}});
  await context.addInitScript(({studentId,name,token})=>{
   localStorage.setItem('pit_chat_student_v09',JSON.stringify({studentId,name,token}));
  },{studentId:user.id,name:user.name,token:user.token});
  const page=await context.newPage();page.on('pageerror',err=>errors.push(err.message));
  await page.route('https://pit-game-jam-chat.vercel.app/api/**',fixture);
  await page.goto('http://127.0.0.1:8899/aluno-v3.html',{waitUntil:'domcontentloaded'});
  await page.locator('#workspace:visible').waitFor();
  await page.evaluate(()=>window.PIT_ARCADE?.close?.());
  if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
  contexts.push(context);students.push(page);return page;
 };
 const fill=async(page,number)=>{
  await page.locator('[data-q-tab="practice"]').click();
  await page.locator('#qo-genre').selectOption('Aventura');
  await page.locator('#qo-title').fill('Jogo de aventura '+number);
  await page.locator('#qo-hero').fill('Explorador do castelo');
  await page.locator('#qo-action').fill('Coletar três cristais');
  await page.locator('#qo-objective').fill('Destrancar a porta principal');
  await page.locator('#qo-victory').fill('Abrir a porta da torre');
  await page.locator('#qo-feedback').fill('Mostrar uma mensagem de vitória');
  await page.locator('[data-q-action="review"]').click();
  assert.match(await page.locator('#navPrimary').innerText(),/ENVIAR MISSÃO AO PROFESSOR/);
  assert.equal(await page.locator('#submitWork').isDisabled(),false);
 };
 try{
  const teacherContext=await browser.newContext({viewport:{width:1440,height:900}});
  const teacher=await teacherContext.newPage();teacher.on('pageerror',e=>errors.push(e.message));
  await teacher.route('https://pit-game-jam-chat.vercel.app/api/**',fixture);
  await teacher.goto('http://127.0.0.1:8899/professor-v3.html',{waitUntil:'domcontentloaded'});
  await teacher.locator('#authPin').fill(pin);await teacher.locator('#authSubmit').click();
  await teacher.locator('#workspace:visible').waitFor();
  if(await teacher.locator('#missionGallery.open').count())await teacher.locator('#missionGalleryClose').click();
  assert.match(await teacher.locator('#navPrimary').innerText(),/Habilitar entregas da missão 01/);
  const a=await openStudent(0);await fill(a,1);
  // No false "sent" confirmation while the teacher has not opened practice.
  await a.locator('#navPrimary').click();
  assert.equal(seen.progress.length,0);
  assert.match(await a.locator('#toast').innerText(),/precisa habilitar as entregas/);
  await teacher.locator('#navPrimary').click();
  assert.equal(room.phase,'practice');
  assert.deepEqual(seen.stage[0],{stage:1,phase:'practice'});
  await a.reload();await a.locator('#workspace:visible').waitFor();
  await a.evaluate(()=>window.PIT_ARCADE?.close?.());
  if(await a.locator('#missionGallery.open').count())await a.locator('#missionGalleryClose').click();
  await a.locator('[data-q-tab="review"]').click();
  assert.match(await a.locator('#evidenceInput').inputValue(),/Jogo de aventura 1/);
  await a.locator('#navPrimary').click();
  assert.equal(users[0].progress[0]?.status,'submitted');
  assert.equal(seen.progress.length,1);
  assert.equal(await a.locator('#navPrimary').isDisabled(),true);
  const b=await openStudent(1),c=await openStudent(2);
  for(const [page,i] of [[b,2],[c,3]]){await fill(page,i);await page.locator('#submitWork').click()}
  assert.equal(users.filter(x=>x.progress[0]?.status==='submitted').length,3);
  await teacher.locator('#rosterButton').click();
  await teacher.locator('#filterPending').click();
  assert.equal(await teacher.locator('#rosterContent tr[data-student]').count(),3);
  await teacher.locator('#rosterContent tr[data-student="'+ids[0]+'"]').click();
  await teacher.locator('[data-review="approved"]').click();
  assert.equal(users[0].progress[0].status,'approved');
  await teacher.locator('#rosterClose').click();
  await teacher.locator('.stage-btn[data-stage="2"]').click();
  await teacher.locator('#navPrimary').click();
  assert.equal(room.current_stage,2);
  assert.deepEqual(seen.stage[1],{stage:2,phase:'practice'});
  await a.reload();await a.locator('#workspace:visible').waitFor();
  await a.evaluate(()=>window.PIT_ARCADE?.close?.());
  if(await a.locator('#missionGallery.open').count())await a.locator('#missionGalleryClose').click();
  assert.equal(await a.locator('.stage-btn[data-stage="2"]').isDisabled(),false);
  assert.equal(await a.locator('.stage-btn[data-stage="3"]').isDisabled(),true);
  assert.deepEqual(errors,[]);
  assert.equal(seen.review.length,1);
  console.log('PASS real V3 UI against LEGACY classroom contract: teacher opens M01, 3 students submit M01, approval appears in roster, M02 release includes phase=practice, M03 remains locked; no live data modified');
  for(const context of contexts)await context.close();
  await teacherContext.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

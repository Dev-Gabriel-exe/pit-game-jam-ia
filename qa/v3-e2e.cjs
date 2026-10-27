'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:8899/';
 const store={stage:1,phase:'briefing',progress:[],teacherMessages:[],studentMessages:[],messages:[],lastSeen:new Date().toISOString()};
 const id='11111111-1111-4111-8111-111111111111',token='a'.repeat(64);
 const error=[];
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
 await tp.goto(base+'professor-v3.html');
 await tp.locator('#authPin').fill('test-pin-1234567890');
 await tp.locator('#authSubmit').click();
 await tp.locator('#workspace:visible').waitFor();
 assert.equal(await tp.locator('.stage-btn').count(),10);
 assert.match(await tp.locator('#missionTitle').innerText(),/O CHAMADO/);
 assert.equal(await tp.locator('.learning-card').count(),3,'instructor has substantial full-screen concept cards');
 assert.match(await tp.locator('.lesson-lead').first().innerText(),/jogo|experiência/i);
 await tp.locator('[data-phase="demo"]').click();
 await tp.locator('#simNext').waitFor();
 await tp.locator('#simNext').click();
 assert.equal(await tp.locator('.sim-cell.sim-on').count(),1,'interactive simulator has one active state');
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
 assert.equal(await sp.locator('.stage-btn').count(),10,'10 ordered stages for students');
 assert.equal(await sp.locator('.learning-card').count(),0,'no long theory in student');
 assert.equal(await sp.locator('[data-phase="demo"]').count(),0,'student only sees briefing, build and delivery');
 await sp.locator('#openGallery').click();
 assert.equal(await sp.locator('.gallery-card').count(),10,'student mission gallery available');
 await sp.locator('#missionGalleryClose').click();
 assert.equal(await sp.locator('.stage-btn[data-stage="2"]').isDisabled(),true,'next stage locked by teacher');
 await sp.locator('[data-phase="practice"]').click();
 assert.equal(await sp.locator('#startWork').isDisabled(),true,'practice blocked until professor releases it');
 await tp.locator('[data-phase="practice"]').click();
 await tp.locator('#navPrimary').click();
 assert.equal(store.phase,'practice','professor releases practice for the whole class');
 await sp.reload();
 await sp.locator('#workspace:visible').waitFor();
 await sp.locator('[data-phase="practice"]').click();
 assert.equal(await sp.locator('#startWork').isDisabled(),false,'student can work after release');
 assert.equal(await sp.locator('#submitWork').isDisabled(),true,'proof button locked until practical steps are completed');
 for(let i=0;i<3;i++)await sp.locator('[data-step-check="'+i+'"]').check();
 assert.equal(await sp.locator('#submitWork').isDisabled(),false,'proof unlocked for the same three practiced steps');
 await sp.locator('#evidenceInput').fill('Criei o conceito de um jogo de exploração com três objetos.');
 await sp.locator('#startWork').click();
 await sp.waitForFunction(()=>document.getElementById('missionStatus')?.textContent?.includes('Em atividade'));
 await sp.locator('#submitWork').click();
 await sp.getByText('Aguardando validação').first().waitFor();
 await tp.locator('#rosterButton').click();
 await tp.locator('#rosterDrawer.open').waitFor();
 await tp.locator('tr[data-student]').click();
 await tp.locator('button[data-review="approved"]').click();
 assert.equal(store.progress[0].status,'approved','teacher approves submitted work');
 await sp.reload();
 await sp.locator('#workspace:visible').waitFor();
 assert.match(await sp.locator('.stage-btn[data-stage="1"]').innerText(),/CONCLUÍDA/i);
 await tp.locator('#rosterClose').click();
 await tp.locator('#navSecondary').click();
 assert.equal(store.stage,2,'teacher opens stage 2 for the group');
 assert.equal(store.phase,'briefing');
 await sp.reload();
 await sp.locator('#workspace:visible').waitFor();
 assert.match(await sp.locator('#missionTitle').innerText(),/MVP EM FOCO/);
 assert.equal(await sp.locator('.stage-btn[data-stage="2"]').isDisabled(),false);
 await sp.locator('.stage-btn[data-stage="1"]').click();
 assert.match(await sp.locator('#missionTitle').innerText(),/O CHAMADO/,'student may review prior stage');
 await tp.locator('#chatButton').click();
 await tp.locator('#chatWindow.open').waitFor();
 await tp.locator('#chatInput').fill('Bom trabalho na etapa 1.');
 await tp.locator('#chatForm button[type="submit"]').click();
 assert.equal(store.messages.at(-1).author,'teacher');
 await sp.locator('#chatButton').click();
 await sp.locator('#chatWindow.open').waitFor();
 await sp.locator('#chatMessages .msg').filter({hasText:'Bom trabalho na etapa 1.'}).waitFor({timeout:6500});
 assert.match(await sp.locator('#chatMessages').innerText(),/Bom trabalho/);
 assert.equal(error.length,0,'No browser JS errors: '+error.join('|'));
 console.log('PASS: cinematic mission gallery, immersive layout, teacher theory and interactive demo');
 console.log('PASS: student briefing without theory; practice checklist controls same evidence');
 console.log('PASS: 10 stages in order, separate teacher and student sessions');
 console.log('PASS: teacher releases next stage; student follows and may review previous');
 console.log('PASS: student sends evidence; teacher approves in drawer; approval persists');
 console.log('PASS: chat from professor to student remains operational in V2 interface');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

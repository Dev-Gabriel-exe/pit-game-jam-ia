'use strict';
/* FUN-04 Chrome: teacher-controlled phase changes with local authored draft intact.
 * Uses one fictional student and fake HTTP API only.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1360,height:900}}),page=await context.newPage();
 const token='a'.repeat(64),id='00000000-0000-4000-8000-000000000001';
 const store={stage:1,phase:'practice'};let apiCalls=0;
 await page.addInitScript(({id,token})=>localStorage.setItem('pit_chat_student_v09',JSON.stringify({studentId:id,name:'Aluno QA Ficticio',token})),{id,token});
 await page.route('https://pit-game-jam-chat.vercel.app/api/**',async route=>{
  apiCalls++;const req=route.request(),action=new URL(req.url()).searchParams.get('action');
  const headers={'access-control-allow-origin':'*','access-control-allow-headers':'Content-Type,X-PIT-Student-Token,X-PIT-Teacher-Pin','access-control-allow-methods':'GET,POST,OPTIONS'};
  if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers});return}
  let body={ok:true};
  if(action==='state')body={ok:true,state:{current_stage:store.stage,phase:store.phase,updated_at:new Date().toISOString()},role:'student',student:{id,name:'Aluno QA Ficticio'},progress:[]};
  else if(action==='unread')body={ok:true,unread:0};
  else if(action==='messages')body={ok:true,messages:[]};
  else if(action==='heartbeat')body={ok:true,stage:1};
  else body={ok:false,error:'Ação fora da fixture'};
  await route.fulfill({status:body.ok?200:404,contentType:'application/json',headers,body:JSON.stringify(body)});
 });
 async function openWorkspace(){
  await page.locator('#workspace:visible').waitFor({timeout:12000});
  if(await page.locator('#missionGallery.open').count()){
   await page.locator('#missionGalleryClose').click();
   await page.locator('#missionGallery.open').waitFor({state:'hidden'});
  }
 }
 await page.goto('http://127.0.0.1:8899/aluno-v3.html',{waitUntil:'domcontentloaded',timeout:20000});
 await openWorkspace();
 assert.equal(await page.locator('.stage-btn[data-stage="2"]').isDisabled(),true,'M02 initially locked');
 await page.locator('[data-q-tab="practice"]').click();
 await page.locator('#qo-genre').selectOption('Aventura');
 await page.locator('#qo-title').fill('Rascunho Autoral Persistente');
 store.stage=2;store.phase='briefing';
 await page.reload();await openWorkspace();
 assert.equal(await page.locator('.stage-btn[data-stage="2"]').isDisabled(),false,'teacher released M02');
 assert.equal(await page.locator('.stage-btn[data-stage="3"]').isDisabled(),true,'M03 still locked');
 await page.locator('.stage-btn[data-stage="1"]').click();
 await page.locator('[data-q-tab="practice"]').click();
 assert.equal(await page.locator('#qo-title').inputValue(),'Rascunho Autoral Persistente','M01 draft survives teacher release');
 store.phase='practice';await page.reload();await openWorkspace();
 assert.equal(await page.locator('.stage-btn[data-stage="2"]').isDisabled(),false,'M02 remains unlocked in practice');
 await page.locator('.stage-btn[data-stage="1"]').click();
 await page.locator('[data-q-tab="practice"]').click();
 assert.equal(await page.locator('#qo-title').inputValue(),'Rascunho Autoral Persistente','draft survives phase transition');
 assert(apiCalls>2,'fixture handled student state requests');
 await context.close();await browser.close();
 console.log('PASS FUN-04 Chrome: teacher stage/phase propagation, locked future stage and preserved M01 draft');
})().catch(e=>{console.error(e);process.exit(1)});

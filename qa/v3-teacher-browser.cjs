'use strict';
/* FUN-03 Chrome teacher login: private test PIN and fake API, no real classroom. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const pin='0123456789abcdef',browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 let requests=0;
 await page.route('https://pit-game-jam-chat.vercel.app/api/**',async route=>{
  requests++;
  const req=route.request(),url=new URL(req.url()),action=url.searchParams.get('action');
  const headers={'access-control-allow-origin':'*','access-control-allow-headers':'Content-Type,X-PIT-Teacher-Pin,X-PIT-Student-Token','access-control-allow-methods':'GET,POST,OPTIONS'};
  if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers});return}
  const valid=req.headers()['x-pit-teacher-pin']===pin;
  let status=200,body={ok:true};
  if(action==='teacher-login')({status,body}=valid?{status:200,body:{ok:true,room:'PITGAME26'}}:{status:403,body:{ok:false,error:'PIN inválido'}});
  else if(!valid){status=401;body={ok:false,error:'Sem permissão'}}
  else if(action==='state')body={ok:true,state:{current_stage:1,phase:'briefing',updated_at:new Date().toISOString()},role:'teacher'};
  else if(action==='roster')body={ok:true,state:{current_stage:1,phase:'briefing'},roster:[{id:'00000000-0000-4000-8000-000000000001',display_name:'Aluno QA Isolado',approved:0,unread_chat:0,stages:[],joined_at:new Date().toISOString(),last_seen_at:new Date().toISOString()}]};
  else if(action==='unread')body={ok:true,unread:0};
  else if(action==='threads')body={ok:true,threads:[]};
  else if(action==='messages')body={ok:true,messages:[]};
  else if(action==='heartbeat')body={ok:true,stage:1};
  else{status=404;body={ok:false,error:'Ação não simulada'}}
  await route.fulfill({status,contentType:'application/json',headers,body:JSON.stringify(body)});
 });
 await page.goto('http://127.0.0.1:8899/professor-v3.html',{waitUntil:'domcontentloaded',timeout:20000});
 await page.locator('#authPin').fill('wrong-pin');
 await page.locator('#authSubmit').click();
 await page.locator('#authError').filter({hasText:/PIN inválido/}).waitFor({timeout:10000});
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('pit_teacher_pin')),null,'wrong PIN never persisted');
 assert.equal(await page.locator('#workspace').isVisible(),false,'wrong PIN cannot access workspace');
 await page.locator('#authPin').fill(pin);await page.locator('#authSubmit').click();
 await page.locator('#workspace:visible').waitFor({timeout:12000});
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('pit_teacher_pin')),pin,'correct PIN only in sessionStorage');
 assert.equal(await page.evaluate(()=>localStorage.getItem('pit_teacher_pin')),null,'PIN not in localStorage');
 await page.reload();await page.locator('#workspace:visible').waitFor({timeout:12000});
 await page.locator('#rosterButton').click();
 await page.locator('#rosterDrawer').waitFor({state:'visible',timeout:10000});
 await page.locator('#rosterDrawer').filter({hasText:/Aluno QA Isolado/}).waitFor({timeout:10000});
 assert.match(await page.locator('#rosterDrawer').innerText(),/Aluno QA Isolado/,'teacher sees fictional roster');
 assert(requests>4,'all requests handled by fake HTTP fixture');
 await context.close();await browser.close();
 console.log('PASS FUN-03 Chrome: invalid PIN rejected, sessionStorage only, reload and teacher-only roster');
})().catch(e=>{console.error(e);process.exit(1)});

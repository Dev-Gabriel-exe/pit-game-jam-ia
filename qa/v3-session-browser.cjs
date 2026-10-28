'use strict';
/* FUN-02 Chrome: isolated student sessions, real V3 UI, fake HTTP backend only. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const sessions=new Map();let next=0,calls=0;
 const fixture=async route=>{
  calls++;
  const req=route.request(),url=new URL(req.url()),action=url.searchParams.get('action');
  const headers={'access-control-allow-origin':'*','access-control-allow-headers':'Content-Type,X-PIT-Student-Token,X-PIT-Teacher-Pin','access-control-allow-methods':'GET,POST,OPTIONS'};
  if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers});return}
  const token=req.headers()['x-pit-student-token'],user=sessions.get(token);
  const data=req.postData()?JSON.parse(req.postData()):{};
  let status=200,body={ok:true};
  if(action==='join'){
   if(data.code!=='PITGAME26'){status=403;body={ok:false,error:'Código inválido'}}
   else{next++;const id='00000000-0000-4000-8000-'+String(next).padStart(12,'0');
    const t=String(next).repeat(64).slice(0,64);
    sessions.set(t,{id,name:data.name,progress:[]});
    status=201;body={ok:true,studentId:id,name:data.name,token:t,code:'PITGAME26'};
   }
  }else if(action==='state'){
   if(!user){status=401;body={ok:false,error:'Sessão inválida'}}
   else body={ok:true,state:{current_stage:1,phase:'practice',updated_at:new Date().toISOString()},role:'student',student:{id:user.id,name:user.name},progress:user.progress};
  }else if(action==='unread')body=user?{ok:true,unread:0}:{ok:false,error:'Sessão inválida'};
  else if(action==='messages')body={ok:true,messages:[]};
  else if(action==='heartbeat')body={ok:true,stage:1};
  else{status=404;body={ok:false,error:'Ação não prevista no teste'}}
  await route.fulfill({status,contentType:'application/json',headers,body:JSON.stringify(body)});
 };
 async function makePage(context){
  const page=await context.newPage();
  await page.route('https://pit-game-jam-chat.vercel.app/api/**',fixture);
  await page.goto('http://127.0.0.1:8899/aluno-v3.html',{waitUntil:'domcontentloaded',timeout:20000});
  return page;
 }
 const aCtx=await browser.newContext(),bCtx=await browser.newContext();
 const a=await makePage(aCtx);
 await a.locator('#authName').fill('Aluno Ficticio A');await a.locator('#authCode').fill('PITGAME26');await a.locator('#authSubmit').click();
 await a.locator('#workspace:visible').waitFor({timeout:12000});
 const sessionA=await a.evaluate(()=>JSON.parse(localStorage.getItem('pit_chat_student_v09')));
 assert.equal(sessionA.name,'Aluno Ficticio A');assert.equal(sessionA.token.length,64);
 const b=await makePage(bCtx);
 await b.locator('#authName').fill('Aluno Ficticio B');await b.locator('#authCode').fill('PITGAME26');await b.locator('#authSubmit').click();
 await b.locator('#workspace:visible').waitFor({timeout:12000});
 const sessionB=await b.evaluate(()=>JSON.parse(localStorage.getItem('pit_chat_student_v09')));
 assert.notEqual(sessionA.token,sessionB.token,'browser contexts isolate tokens');
 sessions.get(sessionA.token).progress=[{stage:1,route:'2d',status:'working',evidence:'Teste local',feedback:'',updated_at:new Date().toISOString()}];
 await a.reload();await a.locator('#workspace:visible').waitFor({timeout:12000});
 await b.reload();await b.locator('#workspace:visible').waitFor({timeout:12000});
 assert.match(await a.locator('.stage-btn[data-stage="1"] .stage-state').innerText(),/EM PRODUÇÃO/,'A restores own progress');
 assert.doesNotMatch(await b.locator('.stage-btn[data-stage="1"] .stage-state').innerText(),/EM PRODUÇÃO/,'B cannot see A progress');
 const cCtx=await browser.newContext(),c=await cCtx.newPage();
 await c.addInitScript(()=>localStorage.setItem('pit_chat_student_v09',JSON.stringify({studentId:'fake',name:'Forjado',token:'f'.repeat(64)})));
 await c.route('https://pit-game-jam-chat.vercel.app/api/**',fixture);
 await c.goto('http://127.0.0.1:8899/aluno-v3.html',{waitUntil:'domcontentloaded',timeout:20000});
 await c.locator('#auth:visible').waitFor({timeout:12000});
 assert.equal(await c.locator('#workspace').isVisible(),false,'forged session never enters workspace');
 assert(calls>5,'real UI made requests only to fake fixture');
 await aCtx.close();await bCtx.close();await cCtx.close();await browser.close();
 console.log('PASS FUN-02 Chrome: two fictional users, reload persistence, token isolation and forged token rejection');
})().catch(e=>{console.error(e);process.exit(1)});

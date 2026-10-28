'use strict';
/* UI-08: actual authenticated student chat layout in Chrome, using a fictional
 * session and an intercepted HTTP fixture. No live classroom traffic. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const token='c'.repeat(64),studentId='00000000-0000-4000-8000-000000000081';
 const headers={'access-control-allow-origin':'*','access-control-allow-headers':'Content-Type,X-PIT-Student-Token,X-PIT-Teacher-Pin','access-control-allow-methods':'GET,POST,OPTIONS'};
 let apiCalls=0;
 try{
  for(const width of [320,390,768]){
   const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
   await context.addInitScript(({studentId,token})=>{
    localStorage.setItem('pit_chat_student_v09',JSON.stringify({studentId,name:'Aluno QA Fictício',token}));
   },{studentId,token});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://pit-game-jam-chat.vercel.app/api/**',async route=>{
    apiCalls++;
    const request=route.request();
    if(request.method()==='OPTIONS'){
     await route.fulfill({status:204,headers});return;
    }
    const action=new URL(request.url()).searchParams.get('action');
    const authorized=request.headers()['x-pit-student-token']===token;
    const state={current_stage:1,phase:'practice',updated_at:'2026-10-28T12:00:00.000Z'};
    let status=authorized?200:401;
    let data={ok:false,error:'Sessão inválida'};
    if(authorized){
     if(action==='state')data={ok:true,state,role:'student',student:{id:studentId,name:'Aluno QA Fictício'},progress:[]};
     else if(action==='unread')data={ok:true,unread:0};
     else if(action==='messages')data={ok:true,messages:[]};
     else if(action==='heartbeat')data={ok:true,stage:1};
     else if(action==='read')data={ok:true};
     else{status=404;data={ok:false,error:'Ação não prevista na fixture UI-08: '+action};}
    }
    await route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(data)});
   });
   await page.goto('http://127.0.0.1:8899/aluno-v3.html',{waitUntil:'domcontentloaded',timeout:20000});
   await page.locator('#workspace:visible').waitFor({timeout:15000});
   if(await page.locator('#missionGallery.open').count()){
    await page.locator('#missionGalleryClose').click();
    await page.locator('#missionGallery.open').waitFor({state:'hidden'});
   }
   const chatButton=page.locator('#chatButton'),chat=page.locator('#chatWindow');
   assert.equal(await chatButton.isVisible(),true,'authenticated chat button visible at '+width+'px');
   assert.equal(await chat.getAttribute('aria-hidden'),'true','chat initially closed');
   await chatButton.click();
   await page.locator('#chatWindow.open').waitFor({timeout:5000});
   assert.equal(await chatButton.getAttribute('aria-expanded'),'true','chat button announces expanded state');
   assert.equal(await chat.getAttribute('aria-hidden'),'false','chat announces open state');
   const geometry=await chat.evaluate(el=>{
    const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,viewport:innerWidth,height:innerHeight};
   });
   assert(geometry.left>=-1&&geometry.right<=geometry.viewport+1,'chat fits horizontal viewport at '+width+'px: '+JSON.stringify(geometry));
   assert(geometry.top>=-1&&geometry.bottom<=geometry.height+1,'chat fits vertical viewport at '+width+'px: '+JSON.stringify(geometry));
   assert.equal(await page.evaluate(()=>document.activeElement?.id),'chatClose','keyboard focus enters chat');
   await page.keyboard.press('Escape');
   assert.equal(await chat.getAttribute('aria-hidden'),'true','Escape closes chat');
   assert.equal(await chatButton.getAttribute('aria-expanded'),'false','Escape collapses trigger');
   assert.equal(await page.evaluate(()=>document.activeElement?.id),'chatButton','Escape restores focus to trigger');
   await chatButton.press('Enter');
   await page.locator('#chatWindow.open').waitFor();
   await page.locator('#chatClose').click();
   assert.equal(await chat.getAttribute('aria-hidden'),'true','close button closes chat');
   assert.deepEqual(errors,[],'no page errors at '+width+'px');
   console.log('PASS UI-08 authenticated chat '+width+'px: geometry, focus, Escape, Enter, ARIA, fake API');
   await context.close();
  }
  assert(apiCalls>=3,'all test sessions exercised intercepted API');
  console.log('PASS UI-08 authenticated mobile chat: 3 widths and fictional HTTP fixture, no live API');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

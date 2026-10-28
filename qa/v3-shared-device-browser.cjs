'use strict';
/* REL-01 P1: shared-device privacy regression for the generic student fallback.
 * Two fictional students, one browser profile, intercepted HTTP and a deliberately
 * unavailable M05 module so the real fallback form is exercised. No production calls.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await context.newPage(),sessions=new Map();let count=0,apiCalls=0;
 const cors={'access-control-allow-origin':'*','access-control-allow-headers':'Content-Type,X-PIT-Student-Token,X-PIT-Teacher-Pin','access-control-allow-methods':'GET,POST,OPTIONS'};
 await page.route('**/v3/student-mission-five.js',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* force generic fallback in isolated QA */'}));
 await page.route('https://pit-game-jam-chat.vercel.app/api/**',async route=>{
  apiCalls++;
  const req=route.request(),action=new URL(req.url()).searchParams.get('action');
  if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers:cors});return}
  const data=req.postData()?JSON.parse(req.postData()):{},user=sessions.get(req.headers()['x-pit-student-token']);
  let status=200,body={ok:true};
  if(action==='join'){
   if(data.code!=='PITGAME26'){status=403;body={ok:false,error:'Código inválido'}}
   else{
    count++;
    const id='00000000-0000-4000-8000-'+String(count).padStart(12,'0'),token=String(count).repeat(64).slice(0,64);
    sessions.set(token,{id,name:data.name});
    status=201;body={ok:true,studentId:id,name:data.name,token,code:'PITGAME26'};
   }
  }else if(action==='state'){
   if(!user){status=401;body={ok:false,error:'Sessão inválida'}}
   else body={ok:true,state:{current_stage:5,phase:'practice',updated_at:new Date().toISOString()},role:'student',student:{id:user.id,name:user.name},progress:[]};
  }else if(action==='unread')body={ok:true,unread:0};
  else if(action==='messages')body={ok:true,messages:[]};
  else if(action==='heartbeat')body={ok:true,stage:5};
  else{status=404;body={ok:false,error:'Ação fora da fixture'}};
  await route.fulfill({status,headers:cors,contentType:'application/json',body:JSON.stringify(body)});
 });
 async function workspace(){
  await page.locator('#workspace:visible').waitFor({timeout:15000});
  if(await page.locator('#missionGallery.open').count()){
   await page.locator('#missionGalleryClose').click();
   await page.locator('#missionGallery.open').waitFor({state:'hidden'});
  }
 }
 async function missionFive(){
  await workspace();
  await page.locator('.stage-btn[data-stage="5"]').click();
  await page.locator('#phasebar [data-phase="practice"]').click();
  await page.locator('#evidenceInput').waitFor({timeout:10000});
  assert.equal(await page.locator('[data-step-check]').count(),3,'generic M05 checklist rendered');
 }
 async function join(name){
  await page.locator('#authName').fill(name);
  await page.locator('#authCode').fill('PITGAME26');
  await page.locator('#authSubmit').click();
  await workspace();
  return page.evaluate(()=>JSON.parse(localStorage.getItem('pit_chat_student_v09')));
 }
 try{
  await page.goto('http://127.0.0.1:8899/aluno-v3.html',{waitUntil:'domcontentloaded',timeout:25000});
  const a=await join('QA Aluno A');
  await missionFive();
  await page.locator('#evidenceInput').fill('Rascunho particular do aluno A');
  await page.locator('[data-step-check]').first().check({force:true});
  const keyA='pit_v3_draft_'+a.studentId+'_5',checkA='pit_v3_checks_'+a.studentId+'_5';
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),keyA),'Rascunho particular do aluno A');
  assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),checkA),[0]);
  await page.evaluate(()=>{
   localStorage.setItem('pit_v2_draft_5','LEGADO NAO ATRIBUIDO');
   localStorage.setItem('pit_v3_checks_5','[0,1,2]');
  });
  // The account-switch control may be hidden in compact layouts; model a shared-device sign-out explicitly.
  await page.evaluate(()=>localStorage.removeItem('pit_chat_student_v09'));
  await page.reload();
  await page.locator('#auth:visible').waitFor({timeout:12000});
  const b=await join('QA Aluno B');
  assert.notEqual(a.studentId,b.studentId,'two distinct fictional identities');
  await missionFive();
  assert.equal(await page.locator('#evidenceInput').inputValue(),'','B cannot read A or unscoped legacy draft');
  assert.equal(await page.locator('[data-step-check]:checked').count(),0,'B cannot inherit A or legacy checklist');
  await page.locator('#evidenceInput').fill('Rascunho particular do aluno B');
  await page.locator('[data-step-check]').nth(1).check({force:true});
  await page.evaluate(session=>localStorage.setItem('pit_chat_student_v09',JSON.stringify(session)),a);
  await page.reload();await missionFive();
  assert.equal(await page.locator('#evidenceInput').inputValue(),'Rascunho particular do aluno A','A draft restored after switching back');
  assert.equal(await page.locator('[data-step-check]:checked').count(),1,'A checklist restored');
  assert.equal(await page.locator('[data-step-check]').first().isChecked(),true);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),'pit_v3_draft_'+b.studentId+'_5'),'Rascunho particular do aluno B','B draft retained separately');
  assert(apiCalls>=6,'real UI requests intercepted by local fixture');
  console.log('PASS REL-01 Chrome: two fictional students on one browser, M05 fallback draft/checklist isolation, legacy keys ignored and both drafts preserved');
 }finally{await context.close();await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

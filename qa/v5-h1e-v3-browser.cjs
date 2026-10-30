'use strict';
/* V3↔V5 integration smoke using static previews only.
 * Tests V3 student AND teacher pages; no production credentials or API calls.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const BASE='http://127.0.0.1:8899';
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--enable-webgl','--use-angle=swiftshader',
  '--enable-unsafe-swiftshader']});
 const errors=[],urls=[];
 async function newPage(pathname){
  const context=await browser.newContext({viewport:{width:1366,height:900}});
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.origin===BASE)return route.continue();
   if(url.hostname==='cdn.jsdelivr.net'&&url.pathname.startsWith('/npm/three@0.186.1/')){
    const part=url.pathname.substring('/npm/three@0.186.1/'.length);
    const parent=path.resolve(ROOT,'node_modules/three');
    const file=path.resolve(parent,part);
    if(file.startsWith(parent+path.sep))try{
     return route.fulfill({body:await fs.readFile(file),
      contentType:'text/javascript; charset=utf-8',
      headers:{'Access-Control-Allow-Origin':'*'}});
    }catch{}
   }
   return route.abort();
  });
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(pathname+' :: '+e.message));
  page.on('request',req=>urls.push(req.url()));
  await page.goto(BASE+pathname,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>!!window.PIT_V5_H1E,{timeout:25000});
  return {page,context};
 }
 try{
  const student=await newPage('/aluno-v3.html?preview=1&v5lab=1');
  const S=student.page;
  await S.waitForFunction(()=>window.PIT_V5_H1E.snapshot.visualPreview,{timeout:35000});
  assert.equal((await S.locator('#journey button[data-stage]').count()),10,
   'Original V3 curriculum must have 10 mission cards');
  assert.equal((await S.evaluate(()=>window.PIT_V5_H1E.snapshot)).role,'student');
  assert.equal(await S.locator('#pitV5HubButton').isVisible(),true);
  await S.locator('#pitV5HubButton').click();
  assert.equal(await S.locator('#pitV5Hub').isVisible(),true);
  const src=await S.locator('#pitV5HubFrame').getAttribute('src');
  assert.equal(src,'./v5/hero-lab-h1c.html');
  await S.waitForFunction(()=>{
   const f=document.querySelector('#pitV5HubFrame')?.contentWindow;
   return !!f?.PIT_V5_H1C_LAB;
  },null,{timeout:35000});
  assert.equal(await S.evaluate(()=>document.querySelector('#pitV5HubFrame')
   .contentDocument.querySelectorAll('#classGrid .class-option').length),4);
  await S.locator('[data-tab=duel]').click();
  await S.waitForFunction(()=>document.querySelector('#pitV5HubFrame')
   ?.contentDocument?.querySelectorAll('.player-switch').length===4,
   null,{timeout:30000});
  assert.equal(await S.locator('#pitV5HubFrame').getAttribute('src'),'./v5/duel-lab-d1a.html');
  const F=S.frameLocator('#pitV5HubFrame');
  await F.locator('button[data-action=send][data-id=b]').click();
  await F.locator('button[data-action=actor][data-id=b]').click();
  await F.locator('button[data-action=accept]').click();
  assert.equal(await F.locator('#duelStage').isVisible(),true);
  assert.equal(await F.locator('a[href="./duel-replay-d1b.html?demo=1"]').count(),1);
  await S.locator('[data-tab=arena]').click();
  await S.waitForFunction(()=>document.querySelector('#pitV5HubFrame')
   ?.contentWindow?.PIT_V5_D1B_VIEW?.snapshot.ready,
   null,{timeout:70000});
  const demo=await S.evaluate(()=>document.querySelector('#pitV5HubFrame')
   .contentWindow.PIT_V5_D1B_VIEW.snapshot);
  assert.equal(demo.demo,true);
  assert.equal(demo.apiCalls,0);
  assert(demo.frameCount>10,'3D demo should generate animated combat');
  await S.locator('#pitV5HubClose').click();
  assert.equal(await S.locator('#pitV5Hub').isVisible(),false);
  assert.equal(await S.locator('#journey button[data-stage]').count(),10);
  await student.context.close();

  const teacher=await newPage('/professor-v3.html?preview=1&v5lab=1');
  const T=teacher.page;
  await T.waitForFunction(()=>window.PIT_V5_H1E.snapshot.visualPreview,{timeout:30000});
  assert.equal(await T.locator('#pitV5HubButton').isVisible(),true);
  await T.locator('#pitV5HubButton').click();
  assert.equal(await T.locator('#pitV5HubFrame').getAttribute('src'),
   './v5/duel-teacher-d1c.html?demo=1');
  const TF=T.frameLocator('#pitV5HubFrame');
  await TF.locator('#enableDuels').waitFor();
  await TF.locator('#enableDuels').click();
  assert.equal(await TF.locator('#teacherStatus').textContent(),'LIBERADOS');
  await TF.locator('#pauseDuels').click();
  assert.equal(await TF.locator('#teacherStatus').textContent(),'PAUSADOS');
  const teaching=await T.evaluate(()=>window.PIT_V5_H1E.snapshot);
  assert.equal(teaching.role,'teacher');
  assert.equal(teaching.tokenExposed,false);
  await T.locator('#pitV5HubClose').click();
  await teacher.context.close();

  const noPreview=await newPage('/aluno-v3.html');
  const N=noPreview.page;
  await N.evaluate(()=>window.PIT_V5_H1E.update({
   role:'student',stage:3,status:'working',approved:2,
   authenticated:true,visualPreview:false
  }));
  await N.locator('#pitV5HubButton').click();
  assert.equal(await N.locator('[data-tab=duel]').isDisabled(),true);
  await N.evaluate(()=>window.PIT_V5_H1E.update({
   role:'student',stage:3,status:'submitted',approved:2,
   authenticated:true,visualPreview:false
  }));
  assert.equal(await N.locator('[data-tab=duel]').isDisabled(),false);
  assert.equal((await N.evaluate(()=>window.PIT_V5_H1E.snapshot)).connectedToStaging,false);
  await noPreview.context.close();

  assert(!urls.some(x=>/\/api\/|neon\.tech|vercel\.app/.test(x)),
   'Static preview must make ZERO real API calls');
  assert.deepEqual(errors,[],'Unexpected JS errors: '+errors.join(' | '));
  console.log('PASS H1e V3 integration: 10 untouched missions, student hero + duel + 3D arena, fictitious teacher gate, submitted-only eligibility, no tokens or API.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

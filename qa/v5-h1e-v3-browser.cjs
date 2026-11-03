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
  // The V3 mission carousel intentionally opens first and intercepts clicks.
  if(await S.locator('#missionGallery').evaluate(el=>el.classList.contains('open')))
   await S.locator('#missionGalleryClose').click();
  await S.locator('#pitV5HubButton').click();
  assert.equal(await S.locator('#pitV5Hub').isVisible(),true);
  assert.equal(await S.locator('#pitV5HubFrame').isVisible(),false,
   'Student Hero must not load a fictional iframe');
  assert.equal(await S.locator('#pitV5HubFrame').getAttribute('src'),null);
  assert.match(await S.locator('#pitV5TeacherPanel').innerText(),
   /Entre como aluno para acessar seu próprio personagem/);
  assert.equal((await S.locator('#pitV5TeacherPanel').innerText()).includes('200 / 1.000'),false,
   'preview cannot display credit for fictional approval');
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
  // V5 newest 3D duel is available inside the V3 hub, not a separate login.
  await S.locator('[data-tab=duel3d]').click();
  assert.equal(await S.locator('#pitV5HubFrame').getAttribute('src'),'./v5/duel-window-lab.html');
  const D=S.frameLocator('#pitV5HubFrame');
  await D.locator('#invite').waitFor();
  assert.equal(await D.locator('#open').isDisabled(),true);
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
  if(await T.locator('#missionGallery').evaluate(el=>el.classList.contains('open')))
   await T.locator('#missionGalleryClose').click();
  await T.locator('#pitV5HubButton').click();
  // Production teacher hub must never show simulated release switches.
  assert.equal(await T.locator('#pitV5HubFrame').isVisible(),false);
  assert.equal(await T.locator('#pitV5HubFrame').getAttribute('src'),null);
  assert.equal(await T.locator('#pitV5TeacherPanel').isVisible(),true);
  assert.match(await T.locator('#pitV5TeacherPanel').innerText(),/Duelos online ainda indisponíveis/);
  assert.equal(await T.locator('#pitV5TeacherPanel button:has-text("Liberar duelos")').isDisabled(),true);
  assert.doesNotMatch(await T.locator('#pitV5TeacherPanel').innerText(),/fictíci|homologaç|laboratório/i);
  await T.locator('[data-tab=collective]').click();
  assert.match(await T.locator('#pitV5TeacherPanel').innerText(),/Arenas coletivas/);
  assert.equal(await T.locator('#pitV5TeacherPanel button:has-text("Liberar arena M5")').isDisabled(),true);
  assert.equal(await T.locator('#pitV5TeacherPanel button:has-text("Liberar arena M10")').isDisabled(),true);
  assert.equal(await T.locator('#pitV5HubFrame').getAttribute('src'),null,'teacher controls cannot load lab iframes');
  const teaching=await T.evaluate(()=>window.PIT_V5_H1E.snapshot);
  assert.equal(teaching.role,'teacher');
  assert.equal(teaching.tokenExposed,false);
  await T.locator('#pitV5TeacherPanel [data-open-roster]').click();
  await T.locator('#rosterDrawer.open').waitFor();
  await T.locator('#rosterClose').click();
  await teacher.context.close();

  const noPreview=await newPage('/aluno-v3.html');
  const N=noPreview.page;
  await N.evaluate(()=>window.PIT_V5_H1E.update({
   role:'student',stage:3,status:'working',approved:2,
   authenticated:true,visualPreview:false,
   studentId:'00000000-0000-4000-8000-000000000021',
   studentName:'Aventureiro Verificado',room:'PITGAME26'
  }));
  // Unauthenticated V3 correctly keeps its auth overlay active. This is a
  // state-contract test with an injected fictional context, not a user login.
  await N.locator('#pitV5HubButton').dispatchEvent('click');
  assert.equal(await N.locator('[data-tab=duel]').count(),0,'No misleading fake duel button');
  assert.equal(await N.locator('[data-tab=duel3d]').count(),0);
  assert.equal(await N.locator('[data-tab=arena]').count(),0,'No fake arena in real student session');
  assert.equal(await N.locator('[data-rhero-class]').count(),4,'All four canonical heroes');
  assert.equal(await N.locator('[data-rhero-talent]').count(),30,'Thirty talents per class');
  await N.evaluate(()=>window.PIT_V5_H1E.update({
   role:'student',stage:3,status:'submitted',approved:2,
   authenticated:true,visualPreview:false,
   studentId:'00000000-0000-4000-8000-000000000021',
   studentName:'Aventureiro Verificado',room:'PITGAME26'
  }));
  assert.equal(await N.locator('#pitV5HubFrame').getAttribute('src'),null);
  assert.match(await N.locator('.rhero-rewards').innerText(),/200/);
  assert.match(await N.locator('.rhero-rewards').innerText(),/4/);
  await N.locator('[data-rhero-class=mage]').click();
  await N.locator('[data-rhero-plus=INT]').click();
  await N.locator('[data-rhero-talent=E01]').click();
  await N.locator('#rheroSave').click();
  const localHero=await N.evaluate(()=>JSON.parse(localStorage.getItem(
   'pit_v5_real_hero_1_PITGAME26_00000000-0000-4000-8000-000000000021')));
  assert.equal(localHero.klass,'mage');
  assert.equal(localHero.attributes.INT,1);
  assert.deepEqual(localHero.talents,['E01']);
  assert.match(await N.locator('#rheroMessage').innerText(),/salvo NESTE navegador/);
  await N.evaluate(()=>window.PIT_V5_H1E.update({
   role:'student',stage:3,status:'submitted',approved:2,
   authenticated:true,visualPreview:false,
   studentId:'00000000-0000-4000-8000-000000000022',
   studentName:'Outra Aluna',room:'PITGAME26B'
  }));
  assert.equal(await N.locator('[data-rhero-class=warrior]').getAttribute('aria-pressed'),'true',
   'Another room and student never inherits the previous hero');
  assert.equal((await N.evaluate(()=>window.PIT_V5_H1E.snapshot)).connectedToStaging,false);
  await noPreview.context.close();

  assert(!urls.some(x=>/\/api\/|neon\.tech|vercel\.app/.test(x)),
   'Static preview must make ZERO real API calls');
  assert.deepEqual(errors,[],'Unexpected JS errors: '+errors.join(' | '));
  console.log('PASS V3+V5: original missions, isolated student visuals, native teacher without simulated release, roster shortcut, no exposed secrets.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});

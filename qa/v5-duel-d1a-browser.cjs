'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[],requests=[];
 try{
  const page=await browser.newPage({viewport:{width:1250,height:870}});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>requests.push(r.url()));
  await page.route('**/*',route=>{
   const u=new URL(route.request().url());
   return u.hostname==='127.0.0.1'?route.continue():route.abort();
  });
  await page.goto('http://127.0.0.1:8899/v5/duel-lab-d1a.html',
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.PIT_V5_DUEL_D1A_LAB);
  const state=()=>page.evaluate(()=>window.PIT_V5_DUEL_D1A_LAB.snapshot);
  assert.equal(await page.locator('.player-switch').count(),4);
  assert.equal(await page.locator('.peer').count(),2,'Only B and D; C still working');
  assert.equal(await page.locator('button[data-action=send][data-id=c]').count(),0);
  await page.locator('button[data-action=send][data-id=b]').click();
  assert.equal((await state()).invites[0].status,'pending');
  await page.locator('button[data-action=actor][data-id=b]').click();
  assert.match(await page.locator('#message').textContent(),/convite|desafio/i);
  await page.locator('button[data-action=accept]').click();
  assert.equal((await state()).invites[0].status,'accepted');
  assert.equal(await page.locator('#duelStage').isVisible(),true);
  await page.locator('button[data-action=actor][data-id=a]').click();
  assert.equal(await page.locator('#duelStage').isVisible(),true);
  await page.locator('button[data-action=cancel]').click();
  assert.equal((await state()).invites[0].status,'cancelled');
  assert.equal(await page.locator('#duelStage').isVisible(),false);
  await page.locator('button[data-action=send][data-id=d]').click();
  await page.locator('button[data-action=actor][data-id=d]').click();
  await page.locator('button[data-action=decline]').click();
  assert.equal((await state()).invites[0].status,'declined');
  await page.locator('button[data-action=actor][data-id=a]').click();
  assert.match(await page.locator('#message').textContent(),/recusado/i);
  await page.locator('button[data-action=send][data-id=d]').click();
  await page.locator('button[data-action=expire]').click();
  assert.equal((await state()).invites[0].status,'expired');
  await page.locator('#teacherToggle').uncheck();
  assert.equal((await state()).teacherEnabled,false);
  assert.equal(await page.locator('button[data-action=send]').count(),0);
  await page.locator('#teacherToggle').check();
  await page.locator('button[data-action=actor][data-id=c]').click();
  assert.equal(await page.locator('#availableToggle').isDisabled(),true);
  assert.match(await page.locator('#peerList').textContent(),/conclua/i);
  await page.locator('button[data-action=actor][data-id=a]').click();
  assert.equal(await page.locator('.peer').count(),2);
  assert.deepEqual(errors,[],'Uncaught UI errors '+errors.join(' | '));
  assert(!requests.some(u=>/\/api\/|neon\.tech|vercel\.app/.test(u)),'No real API called');
  console.log('PASS D1a browser: inviting, accepting, canceling, refusal, timeout, teacher gate, working restriction; offline preview.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[],requests=[];
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>requests.push(r.url()));
  // The lab is deliberately offline. Block all third-party HTTP requests,
  // including Google Fonts, to prove no backend/student data is needed.
  await page.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.hostname==='127.0.0.1')return route.continue();
   return route.abort();
  });
  await page.goto('http://127.0.0.1:8899/v5/hero-lab-h1c.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.PIT_V5_H1C_LAB);
  assert.equal(await page.locator('#talents button').count(),30);
  assert.equal(await page.locator('#classGrid button').count(),4);
  await page.locator('#classGrid button[data-id=guardian]').click();
  assert.equal(await page.locator('#classGrid button[data-id=guardian]').getAttribute('aria-pressed'),'true');
  const choose=async (n)=>{
   const snap=await page.evaluate(()=>window.PIT_V5_H1C_LAB.snapshot);
   const count=2*n-Object.values(snap.build.attributes).reduce((a,v)=>a+v,0);
   for(let i=0;i<count;i++)await page.locator('button[data-action=plus][data-id=FOR]').click();
   const selected=(await page.evaluate(()=>window.PIT_V5_H1C_LAB.snapshot)).build.talents.length;
   for(let i=selected;i<n;i++)await page.locator('#talents button').nth(i).click();
   assert.deepEqual(await page.evaluate(()=>window.PIT_V5_H1C_LAB.remaining),{points:0,talents:0});
   await page.locator('#saveBuild').click();
  };
  await choose(3);
  assert.equal(await page.locator('#revision').textContent(),'1');
  assert.equal(await page.locator('#classGrid button[data-id=warrior]').isDisabled(),true);
  for(let n=4;n<=10;n++){
   // M5 must be locked before advancing to 6.
   if(n===6){
    await page.locator('#advance').click();
    assert.match(await page.locator('#feedback').textContent(),/primeira entrada na Arena M5|Antes de avançar/);
    await page.locator('#freezeM5').click();
    assert.match(await page.locator('#progressInfo').textContent(),/TRAVADA/);
   }
   await page.locator('#advance').click();
   assert.equal((await page.evaluate(()=>window.PIT_V5_H1C_LAB.snapshot)).approved,n);
   await choose(n);
  }
  const before=await page.evaluate(()=>window.PIT_V5_H1C_LAB.snapshot);
  assert.equal(before.m5Frozen.talents.length,5);
  await page.locator('#lockM10').click();
  assert.equal((await page.evaluate(()=>window.PIT_V5_H1C_LAB.snapshot)).m10Frozen.talents.length,10);
  assert.equal(await page.locator('#saveBuild').isDisabled(),true);
  assert.equal(await page.locator('button[data-action=plus][data-id=FOR]').isDisabled(),true);
  await page.locator('#duelOptIn').check();
  assert.equal((await page.evaluate(()=>window.PIT_V5_H1C_LAB.snapshot)).duelOptIn,true);
  await page.locator('#reset').click();
  assert.equal((await page.evaluate(()=>window.PIT_V5_H1C_LAB.snapshot)).revision,0);
  assert.equal((await page.evaluate(()=>window.PIT_V5_H1C_LAB.snapshot)).m5Frozen,null);
  const final=await page.evaluate(()=>JSON.stringify(window.PIT_V5_H1C_LAB.snapshot));
  assert(!final.includes('token')&&!final.includes('studentId'));
  assert(!requests.some(u=>u.includes('/api/')||u.includes('vercel.app')),'No API or real pupil requests');
  assert.deepEqual(errors,[],'JS errors '+errors.join('; '));
  console.log('PASS H1c browser: 4 classes, 30 talents, M3→M10 approvals, M5/M10 locks, duel preview, zero API calls');
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});

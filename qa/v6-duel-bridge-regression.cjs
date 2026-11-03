'use strict';
// Regression for a real production-origin bug: V3 H1e bridge incorrectly
// re-applies fictional staging eligibility while the production duel is open.
// This creates the visible symptom "duel option disappeared" after V3 updates.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
  await page.route('https://dev-gabriel-exe.github.io/**',route=>route.fulfill({
   status:200,contentType:'text/html',body:
    '<!doctype html><html><body data-role="student"><button id="pitV5HubButton">Forja e Coliseu</button></body></html>'
  }));
  await page.goto('https://dev-gabriel-exe.github.io/v6-bridge-test',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
   window.v6Mounts=0;window.v6Unmounts=0;
   window.PIT_V5_REAL_HERO={mount(root){root.textContent='Fictional Hero (no real account)'}};
   window.PIT_V5_LIVE={
    mount(root,ctx,tab){window.v6Mounts++;root.textContent='Coliseu fictício '+tab;return true},
    unmount(){window.v6Unmounts++}
   };
  });
  const bridge=fs.readFileSync('v3/v5-h1e-bridge.js','utf8');
  await page.addScriptTag({content:bridge});
  const snapshot=()=>page.evaluate(()=>({state:window.PIT_V5_H1E.snapshot,
   disabled:document.querySelector('[data-tab="duel"]')?.disabled,
   mounts:window.v6Mounts,unmounts:window.v6Unmounts,
   content:document.querySelector('#pitV5TeacherPanel')?.textContent||''}));
  const identity={role:'student',stage:3,status:'submitted',approved:2,
   authenticated:true,visualPreview:false,studentId:'fictional-v6-01',
   studentName:'V6 Fixture',room:'PITGAME26',tokenProvider:()=> 'f'.repeat(64)};
  await page.evaluate(data=>{
   window.PIT_V5_H1E.update(data);window.PIT_V5_H1E.open('duel');
  },identity);
  const first=await snapshot();
  assert.equal(first.state.currentTab,'duel','Production must initially allow the duel tab');
  assert.equal(first.disabled,false,'Duel tab must be enabled in production');
  await page.evaluate(data=>window.PIT_V5_H1E.update(data),identity);
  const afterSameUpdate=await snapshot();
  // THIS ASSERTION FAILS on the V5 code inherited in main/V6.
  assert.equal(afterSameUpdate.state.currentTab,'duel',
   'A V3 state refresh must NOT auto-close the production duel tab');
  assert.equal(afterSameUpdate.disabled,false,
   'A V3 refresh must NOT disable a production duel based on staging-only eligibility');
  assert.equal(afterSameUpdate.unmounts,first.unmounts,
   'Production duel must not be unmounted by an unrelated classroom render');
  assert.match(afterSameUpdate.content,/Coliseu fictício duel/);
  await page.evaluate(data=>window.PIT_V5_H1E.update({...data,status:'working'}),identity);
  const afterWork=await snapshot();
  assert.equal(afterWork.state.currentTab,'duel',
   'Server owns duel eligibility; staging-only status may not override an active match');
  assert.deepEqual(errors,[]);
  console.log('PASS V6: Production duel tab survives V3 state refresh, server owns eligibility.');
 }finally{await browser.close()}
})().catch(err=>{console.error('V6_BRIDGE_REGRESSION',err.stack||err);process.exitCode=1});

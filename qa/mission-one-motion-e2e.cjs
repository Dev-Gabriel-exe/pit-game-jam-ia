/* Isolated E2E for the experiment branch. Keeps the normal teacher/student QA untouched. */
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const url="http://127.0.0.1:8899/aluno-v3.html?preview=1";
const selector='.arcade-card[data-index="0"] video.arcade-mission-motion-video';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:"/usr/bin/google-chrome",args:["--no-sandbox"]});
 try{
  const context=await browser.newContext();
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.locator("#missionGallery.open").waitFor({timeout:15000});
  assert.equal(await page.locator(".arcade-card video").count(),1,"only Mission 01 contains a video");
  await page.waitForFunction(sel=>{
    const v=document.querySelector(sel);
    return v && !v.paused && v.readyState>=2 && v.classList.contains("ready");
  },selector,{timeout:16000});
  const initial=await page.locator(selector).evaluate(v=>({duration:v.duration,muted:v.muted,loop:v.loop,paused:v.paused}));
  assert.ok(initial.duration>=4.9&&initial.duration<=5.1,"loop duration is 5 seconds");
  assert.ok(initial.muted&&initial.loop&&!initial.paused,"video must be a silent loop");
  await page.locator("#arcadeNext").click();
  await page.waitForFunction(sel=>document.querySelector(sel)?.paused,selector);
  await page.locator("#arcadePrev").click();
  await page.waitForFunction(sel=>!document.querySelector(sel)?.paused,selector);
  assert.equal(errors.length,0,"no uncaught JS errors: "+errors.join("; "));
  await context.close();
  const off=await browser.newContext();
  const offpage=await off.newPage();
  await offpage.goto(url+"&motion=off",{waitUntil:"domcontentloaded"});
  await offpage.locator("#missionGallery.open").waitFor();
  await sleep(350);
  assert.equal(await offpage.locator(selector).evaluate(v=>v.paused),true,"motion=off should stay paused");
  await off.close();
  const reduced=await browser.newContext({reducedMotion:"reduce"});
  const reducedPage=await reduced.newPage();
  await reducedPage.goto(url,{waitUntil:"domcontentloaded"});
  await reducedPage.locator("#missionGallery.open").waitFor();
  await sleep(350);
  assert.equal(await reducedPage.locator(selector).evaluate(v=>v.paused),true,"reduced-motion should stay paused");
  await reduced.close();
  console.log("PASS: 5s MP4 playback, one-card isolation, pause on deselect, motion=off, reduced motion");
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

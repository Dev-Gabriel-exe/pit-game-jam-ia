/* Browser QA: every LTX-ready card video plays only while selected. */
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const path=require("node:path");
const fs=require("node:fs");
const ROOT=path.resolve(__dirname,"..");
const manifest=fs.readFileSync(path.join(ROOT,"v3/motion-manifest.js"),"utf8");
const ready=JSON.parse(manifest.match(/PIT_MOTION_READY=(\[[0-9, ]*\])/)[1]);
const url="http://127.0.0.1:8899/aluno-v3.html?preview=1";
const sel=n=>'.arcade-card[data-index="'+(n-1)+'"] video.arcade-mission-motion-video';
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:"/usr/bin/google-chrome",args:["--no-sandbox"]});
  try{
    const context=await browser.newContext();
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(url,{waitUntil:"domcontentloaded"});
    await page.locator("#missionGallery.open").waitFor({timeout:20000});
    assert.equal(await page.locator(".arcade-mission-motion-video").count(),ready.length,"only ready missions get videos");
    for(const n of ready){
      assert.ok(fs.statSync(path.join(ROOT,"v3/assets/missions","missao-"+String(n).padStart(2,"0")+"-motion.mp4")).size>16000,"MP4 must exist");
      await page.locator('#arcadeChapters [data-step="'+(n-1)+'"]').click();
      await page.waitForFunction(n=>{
        const video=document.querySelector('.arcade-card[data-index="'+(n-1)+'"] video');
        return video&&!video.paused&&video.readyState>=2&&video.classList.contains("ready");
      },n,{timeout:20000});
      const v=await page.locator(sel(n)).evaluate(video=>({duration:video.duration,muted:video.muted,loop:video.loop,paused:video.paused}));
      assert.ok(v.duration>1&&v.duration<10,"real short video "+n);
      assert.ok(v.muted&&v.loop&&!v.paused,"video "+n+" should be a silent playing loop");
      assert.equal(await page.locator(".arcade-mission-motion-video:not([class*=ready])").count(),ready.length-1,"only current card visually ready");
      console.log("READY",n,v.duration);
    }
    await page.locator('#arcadeChapters [data-step="4"]').click();
    assert.equal(await page.locator('.arcade-card[data-index="4"] video').count(),ready.includes(5)?1:0);
    assert.equal(await page.locator(".arcade-mission-motion-video.ready").count(),0,"static poster card should stop other videos");
    assert.deepEqual(errors,[],"No uncaught JS errors");
    await context.close();
    const reduced=await browser.newContext({reducedMotion:"reduce"});
    const rp=await reduced.newPage();
    await rp.goto(url,{waitUntil:"domcontentloaded"});
    await rp.locator("#missionGallery.open").waitFor();
    await rp.waitForTimeout(300);
    assert.ok(await rp.locator(sel(1)).evaluate(v=>v.paused),"reduced motion disables playback");
    await reduced.close();
    console.log("PASS cinematic carousel mission videos:",ready.join(","));
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

'use strict';
/* FUN-01 Chrome test: emulate a third-party static mirror using only local files.
 * No production API, no students, no credentials, no writes.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 let apiCalls=0;const errors=[];
 for(const role of ['aluno','professor']){
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://pit-game-jam-chat.vercel.app/**',route=>{apiCalls++;return route.abort()});
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  await page.route('https://fonts.gstatic.com/**',route=>route.abort());
  await page.route('http://preview.invalid/**',async route=>{
   const u=new URL(route.request().url());
   const file=path.resolve('.'+decodeURIComponent(u.pathname));
   if(!file.startsWith(process.cwd()+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
    await route.fulfill({status:404,body:'Not found'});return;
   }
   const ext=path.extname(file).toLowerCase();
   const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream';
   await route.fulfill({status:200,contentType:mime,body:fs.readFileSync(file)});
  });
  await page.goto('http://preview.invalid/'+role+'-v3.html',{waitUntil:'domcontentloaded',timeout:20000});
  await page.locator('#authTitle').waitFor({timeout:12000});
  assert.match(await page.locator('#authTitle').innerText(),/PRÉVIA ESTÁTICA/,'static mirror guard '+role);
  assert.equal(await page.locator('#authForm').isVisible(),false,'no credential form on third-party mirror '+role);
  assert.equal(await page.locator('#authMessage a[href="?preview=1"]').count(),1,'safe preview link '+role);
  await page.goto('http://preview.invalid/'+role+'-v3.html?preview=1',{waitUntil:'domcontentloaded',timeout:20000});
  await page.locator('#workspace:visible').waitFor({timeout:12000});
  assert.equal(await page.evaluate(()=>window.PIT_HOSTING_POLICY.mode(location.origin,true)),'preview');
  await page.close();
 }
 assert.equal(apiCalls,0,'static preview never calls live Vercel API');
 assert.deepEqual(errors,[],'no page errors in mirror');
 await context.close();await browser.close();
 console.log('PASS FUN-01 Chrome: student/teacher static mirror blocks credentials, preview works and zero API calls');
})().catch(e=>{console.error(e);process.exit(1)});

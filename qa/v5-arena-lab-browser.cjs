'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:8899/v5/arena-lab.html',{waitUntil:'domcontentloaded',timeout:40000});
   assert.equal(await page.locator('.milestone').count(),2);
   assert.equal(await page.locator('[data-mission="5"]').getAttribute('aria-pressed'),'true');
   await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:90000});
   assert.equal(await page.locator('#arenaStage canvas').count(),1);
   assert.equal(await page.locator('[data-fighter]').count(),4);
   assert.equal(await page.locator('#startBattle').isDisabled(),false);
   await page.locator('#startBattle').click();
   await page.waitForFunction(()=>document.querySelector('#arenaStatus')?.dataset.status==='running',{timeout:15000});
   await page.waitForTimeout(700);
   await page.locator('#pauseBattle').click();
   assert.match(await page.locator('#pauseBattle').textContent(),/Continuar/);
   await page.locator('#resetBattle').click();
   await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:90000});
   await page.locator('[data-mission="10"]').click();
   await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.mission===10&&window.PIT_V5_ARENA_LAB?.modelState.loaded===4,null,{timeout:90000});
   assert.match(await page.locator('#arenaTitle').textContent(),/Missão 10/);
   assert.equal(await page.locator('[data-fighter]').count(),4);
   assert.deepEqual(errors,[],'Unexpected JS error: '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<15,'Horizontal overflow at '+width+'px: '+overflow);
   await page.screenshot({path:'qa/v5-arena-lab-'+width+'.png',fullPage:true});
   console.log('PASS arena browser '+width+'px: 4 real GLBs, M5/M10, start/pause/reset, no errors');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

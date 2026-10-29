'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/v5/seletor.html',{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(await page.locator('.class-button').count(),4,'Quatro classes devem aparecer');
   await page.waitForFunction(()=>document.querySelector('#stage')?.dataset.model==='loaded',null,{timeout:60000});
   assert(await page.locator('#stage canvas').isVisible(),'Canvas WebGL visível');
   assert(Number(await page.locator('#stage').getAttribute('data-clip-count'))>0,'GLB original sem animações');
   for(const klass of ['warrior','mage','hunter','guardian']){
    await page.locator('[data-class="'+klass+'"]').click();
    await page.waitForFunction(k=>document.querySelector('#stage')?.dataset.assetClass===k&&document.querySelector('#stage')?.dataset.model==='loaded',klass,{timeout:60000});
    assert(Number(await page.locator('#stage').getAttribute('data-clip-count'))>0,'Sem clipes: '+klass);
    assert(await page.locator('.animations button:not([disabled])').count()>0,'Sem controles de animação verdadeiros: '+klass);
    assert.equal(await page.locator('[data-class="'+klass+'"]').getAttribute('aria-pressed'),'true');
   }
   await page.locator('#resetCamera').click();
   await page.locator('#toggleTurn').click();
   assert.equal(await page.locator('#toggleTurn').getAttribute('aria-pressed'),'true');
   assert.deepEqual(errors,[],'Erros de browser: '+errors.join(' | '));
   const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(horizontal<12,'Overflow horizontal em '+width+'px: '+horizontal);
   await page.screenshot({path:'qa/v5-fase1-'+width+'.png',fullPage:true});
   console.log('PASS: '+width+'px: quatro GLBs reais carregados com clipes, orbit e interface responsiva');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

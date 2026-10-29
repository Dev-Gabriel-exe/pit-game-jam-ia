'use strict';
// Real browser controls, 30 talents per class and true build hand-off to 3D lab.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/v5/seletor.html',{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>window.PIT_V5_FORGE_DEBUG?.ready,null,{timeout:30000});
   assert.equal(await page.locator('#forgeTalentGrid [data-talent]').count(),30);
   assert.equal(await page.locator('.forge-tree').count(),3);
   assert.equal(await page.locator('#forgeSelectedSlots .forge-slot').count(),5);
   assert.equal(await page.evaluate(()=>window.PIT_V5_FORGE_DEBUG.options),30);
   assert.equal(await page.locator('#forgeTryM5').isDisabled(),true);
   for(const id of ['B01','D01','T01','B02','D02'])await page.locator('[data-talent="'+id+'"]').click();
   assert.equal(await page.locator('#forgeSelectedSlots .occupied').count(),5);
   assert.equal(await page.locator('#forgeTryM5').isDisabled(),true);
   assert.equal((await page.evaluate(()=>window.PIT_V5_FORGE_DEBUG.planned)).length,3);
   await page.locator('#forgeMissionRange').evaluate(el=>{el.value='3';el.dispatchEvent(new Event('input',{bubbles:true}))});
   assert.equal(await page.locator('#forgeSelectedSlots .occupied').count(),3);
   assert.equal(await page.locator('#forgeChosen').textContent(),'3 / 3');
   await page.locator('#forgeM10').click();
   assert.equal(await page.locator('#forgeSelectedSlots .forge-slot').count(),10);
   assert.equal(await page.locator('#forgePoints').textContent(),'0 / 20');
   assert.equal(await page.locator('#forgeTryM5').isDisabled(),true);
   await page.locator('#forgeM5').click();
   await page.locator('#forgeReset').click();
   for(const id of ['B01','B02','B03','B04','B05'])await page.locator('[data-talent="'+id+'"]').click();
   for(let i=0;i<5;i++)await page.locator('[data-stat="FOR"][data-change="1"]').click();
   for(let i=0;i<3;i++)await page.locator('[data-stat="DES"][data-change="1"]').click();
   for(let i=0;i<2;i++)await page.locator('[data-stat="DEF"][data-change="1"]').click();
   assert.equal(await page.locator('#forgePoints').textContent(),'10 / 10');
   assert.equal(await page.locator('[data-stat="FOR"][data-change="1"]').isDisabled(),true);
   assert.equal(await page.locator('#forgeTryM5').isEnabled(),true);
   const downloadPromise=page.waitForEvent('download');
   await page.locator('#forgeExport').click();
   const dl=await downloadPromise;
   assert(dl.suggestedFilename().endsWith('.json'));
   if(width===1440){
    await page.locator('#forgeTryM5').click();
    await page.waitForURL(/arena-lab\.html\?/, {timeout:20000});
    await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB?.customBuildLoaded&&window.PIT_V5_ARENA_LAB?.fighterCount===4,null,{timeout:30000});
    const selections=await page.evaluate(()=>window.PIT_V5_ARENA_LAB.selectedTalents);
    assert.equal(selections[0].klass,'warrior');
    assert.deepEqual(selections[0].ids,['B01','B02','B03','B04','B05']);
    await page.waitForFunction(()=>window.PIT_V5_ARENA_LAB.modelState.loaded===4,null,{timeout:100000});
    assert((await page.locator('[data-fighter="warrior"]').count())>0);
    assert.match(await page.locator('#engineModeInfo').textContent(),/SUA BUILD EXPERIMENTAL/);
    console.log('PASS Forge M5: chosen real build transferred to the actual 3D Arena Lab');
   }else{
    for(const [klass,first] of [['mage','E01'],['hunter','P01'],['guardian','G01']]){
     await page.locator('[data-class="'+klass+'"]').click();
     await page.waitForFunction(c=>window.PIT_V5_FORGE_DEBUG?.selectedClass===c,klass,{timeout:5000});
     assert.equal(await page.locator('#forgeTalentGrid [data-talent]').count(),30);
     assert.equal(await page.locator('.forge-tree').count(),3);
     await page.locator('[data-talent="'+first+'"]').click();
     assert.equal((await page.evaluate(()=>window.PIT_V5_FORGE_DEBUG.draft.talents)).length,1);
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert(overflow<15,'Forge mobile overflow: '+overflow);
    console.log('PASS Forge mobile: 4 classes x 30, three paths, M5/M10 limits, no overflow');
   }
   assert.deepEqual(errors,[],'Page errors: '+errors.join(' | '));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

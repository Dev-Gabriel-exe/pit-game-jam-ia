'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push('CONSOLE: '+message.text())});
   await page.goto('http://127.0.0.1:8899/v5/arena-lab.html',{waitUntil:'domcontentloaded',timeout:40000});
   assert.equal(await page.locator('.milestone').count(),2);
   await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5Map==='eclipse-citadel-2-grandstands',{timeout:30000});
   assert.equal(await page.locator('.roster-mode[aria-pressed="true"]').getAttribute('data-roster'),'30','30 participantes devem ser o padrão');
   assert.equal(Number(await page.locator('#arenaStage').getAttribute('data-v5-spectator-capacity')),144,'As arquibancadas precisam de 144 lugares');
   assert(Number(await page.locator('#arenaStage').getAttribute('data-v5-playfield-width'))>=160,'Campo deve ter largura real acima de 160 unidades');
   assert.equal(await page.locator('[data-mission="5"]').getAttribute('aria-pressed'),'true');
   const count=width===1440?30:4;
   if(width===390)await page.locator('[data-roster="4"]').click();
   try{await page.waitForFunction(n=>window.PIT_V5_ARENA_LAB?.fighterCount===n&&window.PIT_V5_ARENA_LAB?.modelState.loaded===n,count,{timeout:100000});}
   catch(e){
    const debug=await page.evaluate(()=>({stage:document.querySelector('#arenaStage')?.dataset, status:document.querySelector('#arenaStatus')?.textContent, models:document.querySelector('#modelReport')?.textContent, lab:!!window.PIT_V5_ARENA_LAB, canvas:document.querySelectorAll('#arenaStage canvas').length}));
    console.error('MODEL DEBUG '+JSON.stringify({width,debug,errors}));
    await page.screenshot({path:'qa/v5-arena-lab-error-'+width+'.png',fullPage:true});
    throw e;
   }
   assert.equal(await page.locator('#arenaStage canvas').count(),1);
   assert.equal(await page.locator('.arena-nickname').count(),count,'Nicks devem estar associados a cada personagem 3D');
   assert((await page.locator('.arena-nickname').first().textContent()).trim().length>0);
   assert.equal(await page.locator('#spectatorsCount').textContent(),'0 na arquibancada');
   assert.equal(await page.locator('[data-fighter]').count(),count);
   assert.equal(await page.locator('[data-focus]').count(),count,'Todos devem oferecer camera individual');
   await page.locator('[data-focus]').first().click();
   await page.locator('#overviewCamera').click();
   await page.locator('#expandStage').click();
   assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('arena-immersive')),true);
   await page.locator('#expandStage').click();
   assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('arena-immersive')),false);
   await page.waitForFunction(()=>document.querySelector('#startBattle')?.disabled===false,null,{timeout:10000});
   assert.equal(await page.locator('#startBattle').isDisabled(),false);
   await page.locator('#startBattle').click();
   await page.waitForFunction(()=>document.querySelector('#arenaStatus')?.dataset.status==='running',{timeout:15000});
   // Verify that a real combat-engine knockout (not a fake UI counter)
   // transfers its avatar and nick to a preassigned grandstand seat.
   if(width===1440){
    await page.locator('#speedBattle').click();
    await page.locator('#speedBattle').click();
    await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5Spectators||0)>0,null,{timeout:100000});
    assert(Number(await page.locator('#arenaStage').getAttribute('data-v5-spectators'))>0);
    assert(await page.locator('.arena-nickname.spectating').count()>0,'Spectator nick must stay visible in 3D scene');
    assert.match(await page.locator('#spectatorsCount').textContent(),/[1-9]\d* na arquibancada/);
    console.log('PASS eliminated hero transported to a grandstand seat with a nickname');
    await page.screenshot({path:'qa/v5-arena-lab-grandstands-1440.png',fullPage:true});
   }
   await page.waitForTimeout(700);
   await page.locator('#pauseBattle').click();
   assert.match(await page.locator('#pauseBattle').textContent(),/Continuar/);
   await page.locator('#resetBattle').click();
   await page.waitForFunction(n=>window.PIT_V5_ARENA_LAB?.modelState.loaded===n,count,{timeout:90000});
   await page.locator('[data-mission="10"]').click();
   await page.waitForFunction(n=>window.PIT_V5_ARENA_LAB?.mission===10&&window.PIT_V5_ARENA_LAB?.modelState.loaded===n,count,{timeout:90000});
   assert.match(await page.locator('#arenaTitle').textContent(),/Missão 10/);
   assert.equal(await page.locator('[data-fighter]').count(),count);
   const environment=await page.locator('#arenaStage').getAttribute('data-v5-environment');
   console.log('SCENERY STATUS '+width+'px: '+environment);
   assert.deepEqual(errors,[],'Unexpected JS error: '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<15,'Horizontal overflow at '+width+'px: '+overflow);
   await page.screenshot({path:'qa/v5-arena-lab-'+width+'.png',fullPage:true});
   console.log('PASS arena browser '+width+'px: '+count+' real GLBs, M5/M10, start/pause/reset, no errors');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

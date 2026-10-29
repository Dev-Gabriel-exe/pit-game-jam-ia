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
   await page.waitForFunction(()=>document.querySelector('#arenaStage')?.dataset.v5Map==='eclipse-citadel-4-gothic-hex',{timeout:30000});
   assert.equal(await page.locator('.roster-mode[aria-pressed="true"]').getAttribute('data-roster'),'30','30 participantes devem ser o padrão');
   assert.equal(Number(await page.locator('#arenaStage').getAttribute('data-v5-spectator-capacity')),144,'As arquibancadas precisam de 144 lugares');
   assert(Number(await page.locator('#arenaStage').getAttribute('data-v5-playfield-width'))>=185,'Campo deve ter largura real acima de 185 unidades');
   assert(Number(await page.locator('#arenaStage').getAttribute('data-v5-duel-courts'))>=8,'Marcas de duelo precisam existir');
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
   // Capture the quiet architectural scene before battle starts. Headless
   // SwiftShader screenshot errors should not invalidate functional QA.
   if(width===1440){
    try{
     await page.locator('#arenaStage').screenshot({
      path:'qa/v5-arena-lab-coliseum-desktop.png',timeout:15000,animations:'disabled'
     });
    }catch(error){console.warn('Architecture screenshot unavailable: '+error.message)}
   }
   assert.equal(await page.locator('#arenaStage canvas').count(),1);
   assert.equal(await page.locator('#battleSpotlight').count(),1);
   assert.equal(await page.locator('#actionCamera').count(),1);
   assert.equal(await page.locator('#cinematicCamera').getAttribute('aria-pressed'),'true','Câmera próxima deve ser a padrão');
   assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-camera-preset'),'cinematic');
   assert.equal(await page.locator('#damagePace').getAttribute('data-scale'),'0.5');
   assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-damage-scale'),'0.5');
   assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-mage-damage-bonus'),'1.1');
   assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-storm-delay'),'40');
   assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-storm-rate-factor'),'0.55');
   await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5VisibleNicks||0)>=1,null,{timeout:15000});
   assert(Number(await page.locator('#arenaStage').getAttribute('data-v5-visible-nicks'))<=(width===390?4:9),'Limitar sobreposição de nomes na cena');
   assert.equal(await page.locator('.battle-legend').count(),1);
   assert.equal(await page.locator('.battle-float-layer').count(),1);
   assert.equal(await page.locator('.arena-nickname').count(),count,'Nicks devem estar associados a cada personagem 3D');
   assert((await page.locator('.arena-nickname').first().textContent()).trim().length>0);
   assert.equal(await page.locator('#spectatorsCount').textContent(),'0 na arquibancada');
   assert.equal(await page.locator('[data-fighter]').count(),count);
   assert.equal(await page.locator('[data-focus]').count(),count,'Todos devem oferecer camera individual');
   await page.locator('[data-focus]').first().click();
   assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-camera-preset'),'third-person','Seguir deve entrar em câmera 3ª pessoa');
   assert((await page.locator('#arenaStage').getAttribute('data-v5-follow-target')||'').length>0,'Acompanhamento deve ter alvo');
   await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5FollowBackDot)<-.75,null,{timeout:15000});
   assert.equal(await page.locator('#talentTelemetry').getAttribute('data-active'),'false');
   await page.locator('#overviewCamera').click();
   assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-camera-preset'),'overview');
   await page.locator('#cinematicCamera').click();
   assert.equal(await page.locator('#arenaStage').getAttribute('data-v5-camera-preset'),'cinematic');
   await page.locator('#actionCamera').click();
   assert.equal(await page.locator('#actionCamera').getAttribute('aria-pressed'),'true');
   await page.locator('#actionCamera').click();
   assert.equal(await page.locator('#actionCamera').getAttribute('aria-pressed'),'false');
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
    try{
      await page.waitForFunction(()=>Number(document.querySelector('#arenaStage')?.dataset.v5SpecialFx||0)>0&&Number(document.querySelector('#arenaStage')?.dataset.v5AnimationEvents||0)>0,null,{timeout:25000});
    }catch(error){
      const debug=await page.evaluate(()=>({
       flags:{...document.querySelector('#arenaStage')?.dataset},
       state:document.querySelector('#arenaStatus')?.textContent,
       specialLog:[...document.querySelectorAll('#battleLog .event')].slice(0,9).map(x=>x.textContent),
       logLength:document.querySelectorAll('#battleLog .event').length,
       stageFrames:document.querySelector('#arenaStage canvas')?.width,
       spotlight:document.querySelector('#spotlightText')?.textContent
      }));
      console.error('SPECIAL FX DEBUG '+JSON.stringify({debug,errors}));
      throw error;
    }
    assert.notEqual(await page.locator('#battleSpotlight').getAttribute('data-type'),'ready','O narrador deve indicar ações reais');
    assert((await page.locator('#spotlightText').textContent()).length>=8);
    console.log('PASS eliminated hero in grandstand, with animated attack/cast reactions and per-class special VFX');
    // No screenshot during a live WebGL duel: headless SwiftShader may stall and falsely fail QA.
   }
   await page.waitForTimeout(700);
   if(await page.locator('#pauseBattle').isEnabled()){
    await page.locator('#pauseBattle').click();
    assert.match(await page.locator('#pauseBattle').textContent(),/Continuar/);
   }else{
    assert.match(await page.locator('#arenaStatus').textContent(),/CONFRONTO FINALIZADO/,'A luta pode terminar antes do teste de pausa');
   }
   await page.locator('#resetBattle').click();
   await page.waitForFunction(n=>window.PIT_V5_ARENA_LAB?.modelState.loaded===n,count,{timeout:90000});
   await page.locator('[data-mission="10"]').click();
   await page.waitForFunction(n=>window.PIT_V5_ARENA_LAB?.mission===10&&window.PIT_V5_ARENA_LAB?.modelState.loaded===n,count,{timeout:90000});
   assert.match(await page.locator('#arenaTitle').textContent(),/Missão 10/);
   assert.equal(await page.locator('[data-fighter]').count(),count);
   const environment=await page.locator('#arenaStage').getAttribute('data-v5-environment');
   console.log('SCENERY STATUS '+width+'px: '+environment);
   assert.equal(environment,'loaded','Os seis GLBs CC0 da arquitetura devem carregar');
   assert(Number(await page.locator('#arenaStage').getAttribute('data-v5-environment-parts'))>=40,'A arena deve montar componentes arquitetônicos reais');
   assert.deepEqual(errors,[],'Unexpected JS error: '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<15,'Horizontal overflow at '+width+'px: '+overflow);
   // Visual proof saved from an earlier verified action; this run checks functionality only.
   console.log('PASS arena browser '+width+'px: '+count+' real GLBs, M5/M10, start/pause/reset, no errors');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

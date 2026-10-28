'use strict';
/* M01-only visual regression: continuous deck + real interactive controls, preview mode only. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const warnings=[],errors=[],results=[];
 try{
  for(const size of [{width:1280,height:720},{width:1600,height:900}]){
   const page=await browser.newPage({viewport:size,reducedMotion:'reduce'});
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1',{waitUntil:'domcontentloaded'});
   await page.locator('#workspace:visible').waitFor({timeout:20000});
   if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
   await page.locator('.stage-btn[data-stage="1"]').click();
   for(const phase of ['briefing','demo','practice','review']){
    await page.locator('#phasebar [data-phase="'+phase+'"]').click();
    await page.locator('#pitProjectorLaunch').click();
    await page.locator('#pitProjector.pit-projector-m01').waitFor();
    const counter=await page.locator('#pitProjectorCount').innerText();
    const total=Number(counter.split('/')[1].trim());
    assert(total>=20,'Missão 01 exige a aula completa, não 6 slides: '+counter);
    await page.locator('#pitProjectorClose').click();
    results.push({viewport:size.width,phase,slides:total});
   }
   await page.locator('#phasebar [data-phase="review"]').click();
   await page.locator('#pitProjectorLaunch').click();
   const count=Number((await page.locator('#pitProjectorCount').innerText()).split('/')[1].trim());
   const titles=[],notes=[];
   let simDone=false,testDone=false,guide=0,practice=false,review=false;
   for(let i=0;i<count;i++){
    const title=await page.locator('#pitProjectorTitle').innerText();
    const body=await page.locator('#pitProjectorContent').innerText();
    titles.push(title);
    assert(!body.includes('ROTEIRO PRIVADO'),'Nota privada vazou no slide '+i);
    const geometry=await page.locator('#pitProjectorContent').evaluate(el=>{
     const card=el.querySelector('.pit-projector-card');
     return {horizontal:el.scrollWidth>el.clientWidth+8,vertical:card?card.scrollHeight>el.clientHeight+16:false};
    });
    if(geometry.horizontal)throw new Error('Overflow horizontal slide '+(i+1)+': '+title);
    if(geometry.vertical)warnings.push(size.width+'px slide '+(i+1)+' overflow vertical: '+title);
    if(body.includes('GDevelop:')||title.startsWith('GDevelop:'))guide++;
    if(title.includes('Como criar, conferir e entregar'))practice=true;
    if(title.includes('O que será avaliado'))review=true;
    if(title==='Simulador: o castelo dos cristais'){
     const collect=page.locator('#pitProjectorContent [data-tm1="collect"]');
     assert(await collect.count(),'Simulador não está na apresentação');
     await page.locator('#pitProjectorContent [data-tm1="door"]').click();
     assert.match(await page.locator('#pitProjectorContent #tm1Door').innerText(),/FECHADA/);
     for(let n=0;n<3;n++)await collect.click();
     await page.locator('#pitProjectorContent [data-tm1="door"]').click();
     assert.match(await page.locator('#pitProjectorContent #tm1Door').innerText(),/ABERTA/);
     assert(await page.locator('#pitProjectorContent #tm1Victory').isVisible());
     simDone=true;
    }
    if(title==='A regra resiste aos três casos de teste?'){
     for(const [v,expected] of [['0','FECHADA'],['2','FECHADA'],['3','ABERTA']]){
      await page.locator('#pitProjectorContent [data-tm-test="'+v+'"]').click();
      assert.match(await page.locator('#pitProjectorContent #tm1TestResult').innerText(),new RegExp(expected));
      assert.match(await page.locator('#pitProjectorContent #tm1TestResult').innerText(),/TESTE APROVADO/);
     }
     testDone=true;
    }
    if(i<count-1)await page.locator('#pitProjectorNext').click();
   }
   assert(simDone&&testDone,'Simulador e testes de aceitação ausentes');
   assert(guide===5,'Guia GDevelop incompleto: '+guide+' etapas');
   assert(practice&&review,'Faltam oficina ou avaliação na mesma sequência');
   assert.match(titles[titles.length-1],/Próxima missão/);
   await page.locator('#pitProjectorClose').click();
   await page.close();
   results.push({viewport:size.width,fullSequence:count,guide,simDone,testDone,practice,review});
  }
  assert.deepEqual(errors,[],'Erros JS: '+errors.join(' | '));
  console.log('PASS: M01 continuous projection, interactions, criteria, privacy and navigation');
  console.log(JSON.stringify({results,warnings},null,2));
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
'use strict';
/* Pedagogical QA — each teacher workshop matches the student artifact, allocates reading
 * and tutorial time, preserves simulation, and fits projector/mobile viewports. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const all=[];
 const expected={
  1:['Gênero','Título','Protagonista','Ação principal','Objetivo','Condição de vitória','Feedback'],
  2:['cena','mecânica','TRÊS','DADO'],
  3:['projeto','cena','objeto','Preview'],
  4:['controle','limite','Preview'],
  5:['SE','ENTÃO','variável','falso'],
  6:['asset','origem','licença','Preview'],
  7:['início','desafio','conclusão','reinício'],
  8:['usabilidade','antes','depois','Preview'],
  9:['colega','esperado','observado','reprodução'],
 10:['pitch','Preview','acesso','editável']
 };
 const label=['',"O Chamado","MVP","Ligar o Motor","Primeiro Jogável","Primeira Regra","Forja","Dar Vida","Polimento","Playtest","Lançamento"];
 try{
  for(const vp of [{width:1600,height:900},{width:1280,height:720},{width:390,height:844}]){
   const page=await browser.newPage({viewport:vp,reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1',{waitUntil:'domcontentloaded'});
   await page.locator('#workspace:visible').waitFor({timeout:20000});
   if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
   const cv=await page.evaluate(()=>window.PIT_WORKSHOP_CURRICULUM);
   assert(cv&&Object.keys(cv.lessons).length===9,'Nine student-grounded missions');
   assert.equal(Object.values(cv.TIME).reduce((a,t)=>a+t[0],20),360,'Full 6-hour pacing');
   const report=[];
   for(let m=1;m<=10;m++){
    await page.locator('.stage-btn[data-stage="'+m+'"]').click();
    await page.locator('#phasebar [data-phase="review"]').click();
    await page.locator('#pitProjectorLaunch').click();
    await page.locator('#pitProjector.pit-projector-m01').waitFor({timeout:12000});
    assert.equal((await page.locator('#pitProjectorCount').textContent()).trim(),'1 / 7','M'+m+' should have seven essential screens');
    const titles=[],cut=[],reads=[];
    for(let i=0;i<7;i++){
     const pane=page.locator('#pitProjectorContent'),txt=await pane.innerText();
     titles.push((await page.locator('#pitProjectorTitle').innerText()).trim());
     assert(!txt.includes('ROTEIRO PRIVADO'),'Private text leak M'+m+' slide '+(i+1));
     assert(!txt.includes('LIBERAR FASE'),'Wrong release mechanics M'+m);
     const geometry=await pane.evaluate(el=>{
      const dk=el.querySelector('.pit-workshop-deck'), first=dk?.querySelector('.pit-m01-kicker');
      return {x:el.scrollWidth-el.clientWidth,y:el.scrollHeight-el.clientHeight,
        clip:dk?dk.scrollHeight-dk.clientHeight:0,
        firstTop:first?.getBoundingClientRect().top,
        viewportHeight:innerHeight};
     });
     assert(geometry.x<=12,'M'+m+' horizontal overflow slide '+(i+1)+' '+vp.width+': '+JSON.stringify(geometry));
     if(vp.width===390&&i!==3)
       assert(geometry.firstTop<vp.height*.65,'Mobile slide M'+m+' '+(i+1)+' has excessive empty space above content: '+JSON.stringify(geometry));
     if(geometry.clip>16||geometry.y>25)cut.push({slide:i+1,...geometry});
     if(i===4&&m>1){
      assert.match(txt,/Caderno do Aluno/,'Student reading is missing M'+m);
      assert.match(txt,/tutorial/i,'Tutorial exploration missing M'+m);
      const b=pane.locator('[data-pit-ws-more="guide"]');assert(await b.count(),'Tutorial help modal missing M'+m);
      await b.click();
      assert(await page.locator('.pit-ws-depth-modal').isVisible(),'Tutorial modal not visible M'+m);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.pit-ws-depth-modal').count(),0,'Escape must dismiss optional guide without closing projector M'+m);
     }
     if(i===5){
      const goal=m===1?'11:00':(()=>{
       const t=cv.TIME[m];return String(t.slice(2).reduce((a,n)=>a+n,0)).padStart(2,'0')+':00';
      })();
      const timer=pane.locator(m===1?'[data-pit-timer]':'[data-ws-time]');
      assert.equal((await timer.innerText()).trim(),goal,'Insufficient workshop time M'+m);
      if(m>1){
       for(const term of ['LER','EXPLORAR','CRIAR','CONFERIR'])assert(txt.includes(term),'Missing step '+term+' M'+m);
       const btn=pane.locator('[data-ws-timer="start"]');await btn.click();
       if(m===4){
        await page.waitForTimeout(1250);
        assert.notEqual((await timer.innerText()).trim(),goal,'Clock never starts M04');
       }
       await pane.locator('[data-ws-timer="reset"]').click();
       assert.equal((await timer.innerText()).trim(),goal,'Clock reset failed M'+m);
      }
      reads.push(goal);
     }
     if(i===6){
      if(m===1){for(const word of expected[1])assert((txt+' '+(await page.locator('#pitProjectorContent').innerHTML())).toLowerCase().includes(word.toLowerCase()),'M01 field absent '+word)}
      else{
       const boxes=pane.locator('[data-ws-check]');
       assert.equal(await boxes.count(),4,'M'+m+' final checklist must have four real student deliverables');
       for(const word of expected[m])assert(txt.toLowerCase().includes(word.toLowerCase()),'Checklist M'+m+' misses student deliverable '+word);
       await boxes.first().check();
       assert.match(await pane.locator('[data-ws-check-progress]').innerText(),/1 \/ 4/,'Checklist does not update M'+m);
      }
     }
     if(i<6)await page.locator('#pitProjectorNext').click();
    }
    await page.locator('#pitProjectorClose').click();
    assert.equal(await page.locator('#phasebar [data-phase="review"]').getAttribute('aria-current'),'true','Projection should not modify classroom stage M'+m);
    report.push({mission:m,slides:7,practice:reads[0],clippingWarnings:cut});
   }
   assert.deepEqual(errors,[],'Uncaught browser errors: '+errors.join('; '));
   all.push({width:vp.width,report});
   await page.close();
  }
  const old=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  await old.goto('http://127.0.0.1:8899/professor-v3.html?preview=1&oficina=detalhado',{waitUntil:'domcontentloaded'});
  await old.locator('#workspace:visible').waitFor();
  if(await old.locator('#missionGallery.open').count())await old.locator('#missionGalleryClose').click();
  await old.locator('.stage-btn[data-stage="6"]').click();
  await old.locator('#pitProjectorLaunch').click();
  assert(Number((await old.locator('#pitProjectorCount').innerText()).split('/')[1])>=12,'Detailed original lecture lost');
  await old.close();
  console.log('PASS: ten mission student-grounded seven-slide presentations; 360min course; student checkpoints; tutorial; workshop timers; no mobile blank gap; detailed retained');
  console.log(JSON.stringify(all,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
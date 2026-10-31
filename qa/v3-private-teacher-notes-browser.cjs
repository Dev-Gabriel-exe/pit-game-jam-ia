'use strict';
/* V4 projection safety: real Chrome verifies that practice notes are closed until
 * the teacher deliberately opens the paper icon after disconnecting HDMI. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const modules=[
  ['teacher-mission-one-pro','PIT_TEACHER_MISSION_ONE'],
  ['teacher-mission-two','PIT_TEACHER_MISSION_TWO'],
  ['teacher-mission-three','PIT_TEACHER_MISSION_THREE'],
  ['teacher-mission-four-validation','PIT_TEACHER_MISSION_FOUR_VALIDATION','practice','Abrir roteiro privado da prática da Missão 04'],
  ['teacher-mission-four-validation','PIT_TEACHER_MISSION_FOUR_VALIDATION','review','Abrir roteiro privado da avaliação da Missão 04'],
   ['teacher-mission-five-validation','PIT_TEACHER_MISSION_FIVE_VALIDATION','practice','Abrir roteiro privado da Missão 05'],
   ['teacher-mission-five-validation','PIT_TEACHER_MISSION_FIVE_VALIDATION','review','Abrir roteiro privado da avaliação da Missão 05'],
   ['teacher-mission-six-foundations','PIT_TEACHER_MISSION_SIX_FOUNDATIONS','practice','Abrir roteiro privado da Missão 06'],
   ['teacher-mission-six-validation','PIT_TEACHER_MISSION_SIX_VALIDATION','review','Abrir roteiro privado da Missão 06'],
   ['teacher-mission-seven-validation','PIT_TEACHER_MISSION_SEVEN_VALIDATION','practice','Abrir roteiro privado da prática da Missão 07'],
   ['teacher-mission-seven-validation','PIT_TEACHER_MISSION_SEVEN_VALIDATION','review','Abrir roteiro privado da avaliação da Missão 07'],
   ['teacher-mission-eight-validation','PIT_TEACHER_MISSION_EIGHT_VALIDATION','practice','Abrir roteiro privado da Missão 08'],
   ['teacher-mission-eight-validation','PIT_TEACHER_MISSION_EIGHT_VALIDATION','review','Abrir roteiro privado da avaliação da Missão 08'],
   ['teacher-mission-nine-validation','PIT_TEACHER_MISSION_NINE_VALIDATION','practice','Abrir roteiro privado da Missão 09'],
   ['teacher-mission-nine-validation','PIT_TEACHER_MISSION_NINE_VALIDATION','review','Abrir roteiro privado da avaliação da Missão 09'],
   ['teacher-mission-ten-validation','PIT_TEACHER_MISSION_TEN_VALIDATION','practice','Abrir roteiro privado da Missão 10'],
   ['teacher-mission-ten-validation','PIT_TEACHER_MISSION_TEN_VALIDATION','review','Abrir roteiro privado da avaliação da Missão 10']
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/index.html');
  await page.setContent('<!doctype html><html lang="pt-BR"><head><link rel="stylesheet" href="/v3/teacher-private-notes.css"></head><body style="background:#10151c"><main id="mount"></main></body></html>');
  await page.addScriptTag({url:'http://127.0.0.1:8899/v3/teacher-private-notes-guard.js'});
  for(const [file,global,phase='practice',label='Abrir roteiro privado do professor'] of modules){
   await page.addScriptTag({url:'http://127.0.0.1:8899/v3/'+file+'.js'});
   await page.evaluate(({name,phase})=>{document.querySelector('#mount').innerHTML=window[name].render(phase)},{name:global,phase});
   const notes=page.locator('details.pit-private-teacher-notes');
   assert.equal(await notes.count(),1,file+' contains exactly one private practice note');
   assert.equal(await notes.evaluate(el=>el.open),false,file+' defaults closed');
   const summary=notes.locator('summary');
   assert.equal(await summary.getAttribute('aria-label'),label);
   const size=await summary.evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));
   assert(size.width<=30&&size.height<=30,file+' paper icon remains discreet '+JSON.stringify(size));
   assert.equal(await notes.locator('.pit-private-teacher-notes-body').isVisible(),false,file+' notes hidden during projection');
   await summary.focus();await page.keyboard.press('Enter');
   assert.equal(await notes.evaluate(el=>el.open),true,file+' keyboard Enter opens private notes');
   assert.equal(await notes.locator('.pit-private-teacher-notes-body').isVisible(),true,file+' content visible on demand');
   await page.keyboard.press('Enter');
   assert.equal(await notes.evaluate(el=>el.open),false,file+' keyboard Enter closes private notes');
  }
  // Actual projection guard: notes must close on Escape, stage navigation and page exit.
  await page.evaluate(()=>{
   document.querySelector('#mount').innerHTML=window.PIT_TEACHER_MISSION_TEN_VALIDATION.render('practice');
   document.body.insertAdjacentHTML('beforeend','<button id="qaStageNav" type="button" data-stage="9">Mudar missão</button>');
  });
  const guarded=page.locator('details.pit-private-teacher-notes');
  await guarded.locator('summary').click();
  assert.equal(await guarded.evaluate(el=>el.open),true,'private note opens only after explicit action');
  await page.keyboard.press('Escape');
  assert.equal(await guarded.evaluate(el=>el.open),false,'Escape closes exposed private note');
  await guarded.locator('summary').click();
  await page.locator('#qaStageNav').click();
  assert.equal(await guarded.evaluate(el=>el.open),false,'real data-stage navigation closes exposed note');
  await guarded.locator('summary').click();
  await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
  assert.equal(await guarded.evaluate(el=>el.open),false,'pagehide closes exposed note');
  await page.locator('#qaStageNav').evaluate(el=>el.remove());
  // Student M09 must not pretend a defect or correction before a peer playtest.
  await page.addScriptTag({url:'http://127.0.0.1:8899/v3/student-mission-nine.js'});
  const student=await page.evaluate(width=>{
   const ctx={session:'qa-v4-m09-'+width,phase:'practice',status:'draft',idea:{title:'Projeto fictício',genre:'Puzzle'}};
   document.querySelector('#mount').innerHTML=window.PIT_STUDENT_MISSION_NINE.render(ctx);
   return {
    selectedOutcomes:document.querySelectorAll('input[name="m9Outcome"]:checked').length,
    selectedResolutions:document.querySelectorAll('input[name="m9Resolution"]:checked').length,
    choices:document.querySelectorAll('input[name="m9Resolution"]').length,
    initialValidation:window.PIT_STUDENT_MISSION_NINE.validate(ctx.session),
    editor:!!document.querySelector('.m9s-editor-handoff a[href="https://editor.gdevelop.io/"]')
   };
  },width);
  assert.equal(student.selectedOutcomes,0,'M09 no fabricated issue selected at '+width+'px');
  assert.equal(student.selectedResolutions,0,'M09 no fabricated decision selected at '+width+'px');
  assert.equal(student.choices,3,'M09 supports no-change after a passed test');
  assert.equal(student.initialValidation.field,'outcome','M09 requires explicit real test result');
  assert.equal(student.editor,true,'M09 GDevelop handoff rendered');
  // M10 student must see the real editor handoff and an audience-neutral GDevelop guide.
  await page.addScriptTag({url:'http://127.0.0.1:8899/v3/gdevelop-mission-ten-guide.js'});
  await page.addScriptTag({url:'http://127.0.0.1:8899/v3/student-mission-ten.js'});
  const launch=await page.evaluate(width=>{
   const ctx={session:'qa-v4-m10-'+width,phase:'practice',status:'draft',idea:{title:'Projeto fictício',genre:'Plataforma'},preview:true};
   document.querySelector('#mount').innerHTML=window.PIT_STUDENT_MISSION_TEN.render(ctx);
   return {
    editor:!!document.querySelector('.m10s-editor-handoff a[href="https://editor.gdevelop.io/"]'),
    neutral:document.querySelector('#g10Guide')?.textContent.includes('TUTORIAL DE ENTREGA · 3 MIN'),
    noPrivate:document.querySelectorAll('.pit-private-teacher-notes').length===0,
    unchecked:document.querySelectorAll('[data-m10s-check]:checked').length===0,
    initialField:window.PIT_STUDENT_MISSION_TEN.validate(ctx.session).field
   };
  },width);
  assert.equal(launch.editor,true,'M10 GDevelop editor link at '+width+'px');
  assert.equal(launch.neutral,true,'M10 shared guide is student-safe at '+width+'px');
  assert.equal(launch.noPrivate,true,'M10 no teacher notes in student view');
  assert.equal(launch.unchecked,true,'M10 cannot predeclare successful tests');
  assert.equal(launch.initialField,'pitch','M10 requires real student evidence');
  // Regression: launching a projected lesson must close an already-open
  // teacher-only note, and closing the slides must not reveal it again.
  await page.goto('http://127.0.0.1:8899/professor-v3.html?preview=1',{waitUntil:'domcontentloaded'});
  await page.locator('#workspace:visible').waitFor({timeout:12000});
  if(await page.locator('#missionGallery.open').count())await page.locator('#missionGalleryClose').click();
  await page.locator('.stage-btn[data-stage="10"]').click();
  await page.locator('#phasebar [data-phase="practice"]').click();
  const projectedNote=page.locator('#mainContent details.pit-private-teacher-notes');
  assert.equal(await projectedNote.count(),1,'M10 practice contains a private teacher note');
  await projectedNote.locator('summary').click();
  assert.equal(await projectedNote.evaluate(el=>el.open),true,'private note explicitly opened before projection');
  await page.locator('#pitProjectorLaunch').click();
  assert.equal(await projectedNote.evaluate(el=>el.open),false,'projector launch closes previously open private note');
  assert.equal(await page.locator('#pitProjectorContent details.pit-private-teacher-notes').count(),0,'projector excludes private note markup');
  await page.locator('#pitProjectorClose').click();
  assert.equal(await projectedNote.evaluate(el=>el.open),false,'private note stays closed after returning to mirrored panel');

  // Defense-in-depth: tutorial cards generated directly without cleanCopy
  // must never display private teacher notes, even if supplied accidentally.
  await page.locator('.stage-btn[data-stage="7"]').click();
  await page.locator('#phasebar [data-phase="demo"]').click();
  const injected=await page.evaluate(()=>{
   const guide=window.PIT_GDEVELOP_M07_GUIDE;
   if(!guide||typeof guide.projectorCard!=='function')return false;
   const original=guide.projectorCard;
   guide.projectorCard=(route,step)=>original(route,step)+
    '<details class="pit-private-teacher-notes" open><summary>▤</summary><p>QA_PRIVATE_M07_DO_NOT_PROJECT</p></details>'+
    '<div data-private-note>QA_PRIVATE_ATTRIBUTE_DO_NOT_PROJECT</div>'+
    '<aside class="teacher-private-note">QA_PRIVATE_CLASS_DO_NOT_PROJECT</aside>';
   return true;
  });
  assert.equal(injected,true,'M07 dynamic projector tutorial available');
  await page.locator('#pitProjectorLaunch').click();
  await page.locator('#pitProjectorNext').click();
  await page.locator('#pitProjectorNext').click();
  assert.equal(await page.locator('#pitProjectorContent [data-pit-projector-step="M07:0"]').count(),1,'M07 raw generated tutorial slide rendered');
  assert.equal(await page.locator('#pitProjectorContent .pit-private-teacher-notes, #pitProjectorContent [data-private-note], #pitProjectorContent .teacher-private-note').count(),0,'all private note selectors stripped from raw projector HTML');
  assert.equal((await page.locator('#pitProjectorContent').textContent()).includes('QA_PRIVATE_'),false,'private synthetic text not projected');
  await page.locator('#pitProjectorClose').click();
  assert.deepEqual(errors,[],width+'px no JavaScript errors');
  await context.close();
 }
 await browser.close();
 console.log('PASS V4 private teacher notes: M01-M10 practice and M04-M10 review; M09 neutral form and M10 student editor handoff in Chrome 390/1280px, default closed, discreet icon, keyboard open/close, Escape/stage navigation/pagehide guard and raw M07 slide filtering');
})().catch(e=>{console.error(e);process.exit(1)});

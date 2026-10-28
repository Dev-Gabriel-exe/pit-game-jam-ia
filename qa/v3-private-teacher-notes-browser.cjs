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
   ['teacher-mission-nine-validation','PIT_TEACHER_MISSION_NINE_VALIDATION','review','Abrir roteiro privado da avaliação da Missão 09']
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/index.html');
  await page.setContent('<!doctype html><html lang="pt-BR"><head><link rel="stylesheet" href="/v3/teacher-private-notes.css"></head><body style="background:#10151c"><main id="mount"></main></body></html>');
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
  assert.deepEqual(errors,[],width+'px no JavaScript errors');
  await context.close();
 }
 await browser.close();
 console.log('PASS V4 private teacher notes: M01-M09 practice and M04-M09 review; M09 student neutral form in Chrome 390/1280px, default closed, discreet icon, keyboard open/close');
})().catch(e=>{console.error(e);process.exit(1)});

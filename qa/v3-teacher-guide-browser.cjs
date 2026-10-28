'use strict';
/* REL-02: actual Chrome guide navigation and responsive behavior. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const html=fs.readFileSync('v3/guia-professor.html','utf8');
 assert(html.includes('lang="pt-BR"')&&html.includes('prefers-reduced-motion'),'accessible Portuguese standalone guide');
 for(const id of ['preparar','liberar','acompanhar','avaliar','chat','recursos','problemas','fechar'])assert(html.includes('id="'+id+'"'),'guide section '+id);
 assert(fs.readFileSync('professor-v3.html','utf8').includes('./v3/guia-professor.html'),'teacher panel links guide');
 assert(!/diga aos alunos|fale para a turma|leia em voz alta/i.test(html),'operational guide is not a speaking script');
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 for(const width of [1280,390]){
  const context=await browser.newContext({viewport:{width,height:850},isMobile:width===390});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/v3/guia-professor.html');
  assert.equal(await page.locator('main section').count(),8,'eight operational sections');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement?.classList.contains('skip')),true,'skip link receives first keyboard focus');
  await page.locator('details summary').first().click();
  assert.equal(await page.locator('details').first().getAttribute('open'),'','FAQ opens without JavaScript');
  const box=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert(box.scroll<=box.viewport+3,'no horizontal overflow at '+width+': '+JSON.stringify(box));
  assert.deepEqual(errors,[],'no browser script errors');
  await context.close();
 }
 await browser.close();
 console.log('PASS REL-02 Chrome: teacher guide 8 sections, skip link, FAQ, 390/1280px, reduced motion and navigation');
})().catch(e=>{console.error(e);process.exit(1)});

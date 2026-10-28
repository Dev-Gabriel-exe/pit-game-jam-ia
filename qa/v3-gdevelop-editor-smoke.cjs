'use strict';
/* REL-01 / FUN-08: attempt a REAL GDevelop web-editor smoke test with a public,
 * free official template. No account, tokens, class data or paid services.
 * This does NOT test importing our generated assets; those remain NOT_RUN.
 * Fail closed if editor or Preview cannot be observed.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const cases=[
 {id:'2d',url:'https://editor.gdevelop.io/?create-from-example=starting-top-down'},
 {id:'3d',url:'https://editor.gdevelop.io/?create-from-example=starting-first-person'}
];
const dir='qa/gdevelop-editor-artifacts';
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const report={date:new Date().toISOString(),editor:'GDevelop web',cases:[],scope:'Official templates only; no PIT asset import, save/reopen, or real peer test'};
 try{
  for(const item of cases){
   const context=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:false});
   const page=await context.newPage(),entry={id:item.id,url:item.url,status:'NOT_RUN',observations:[]};
   report.cases.push(entry);
   try{
    const response=await page.goto(item.url,{waitUntil:'domcontentloaded',timeout:60000});
    entry.http=response?.status()||null;
    if(!response||response.status()>=400)throw Error('Editor HTTP '+entry.http);
    await page.waitForLoadState('networkidle',{timeout:25000}).catch(()=>{});
    const preview=page.getByRole('button',{name:/^(Preview|Prévia|Pré-visualizar|Launch a preview|Iniciar prévia)/i}).first();
    await preview.waitFor({state:'visible',timeout:90000});
    entry.observations.push('Visible GDevelop Preview control in loaded editor');
    await page.screenshot({path:path.join(dir,item.id+'-editor.png'),fullPage:false});
    const popupPromise=page.waitForEvent('popup',{timeout:30000}).catch(()=>null);
    await preview.click({timeout:10000});
    const popup=await popupPromise;
    const target=popup||page;
    await target.waitForLoadState('domcontentloaded',{timeout:45000}).catch(()=>{});
    await target.waitForTimeout(6000);
    const hasCanvas=await target.locator('canvas').count()>0;
    const previewUrl=target.url();
    entry.observations.push('Preview click completed; url='+previewUrl+'; canvas='+hasCanvas);
    if(!hasCanvas)throw Error('No canvas observed after clicking Preview; cannot claim game ran');
    await target.screenshot({path:path.join(dir,item.id+'-preview.png'),fullPage:false});
    entry.status='PASS';
   }catch(error){
    entry.status='FAIL';
    entry.error=String(error.message||error).slice(0,700);
    entry.visibleText=(await page.locator('body').innerText({timeout:5000}).catch(()=>'' )).slice(0,900);
    await page.screenshot({path:path.join(dir,item.id+'-diagnostic.png'),fullPage:false}).catch(()=>{});
   }finally{await context.close()}
  }
 }finally{
  await browser.close();
  fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
 }
 assert(report.cases.every(c=>c.status==='PASS'),'GDevelop editor/Preview must be observed in BOTH 2D and 3D templates; otherwise keep manual blockers');
 console.log('PASS: GDevelop editor and 2D/3D Preview observed; PIT asset imports remain NOT_RUN');
})().catch(e=>{console.error(e.message||e);process.exitCode=1});

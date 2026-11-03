'use strict';
// A late hero GET/save/clipboard callback may update its model, never the duel DOM.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const catalog=require('../v5/phase2-combat.js');
const id='10000000-0000-4000-8000-000000000001';
async function scenario(kind){
 const storage=new Map(),buttons=new Map();let markup='',root=null,release,requests=0;
 const pending=new Promise(resolve=>{release=resolve});
 const container={
  get innerHTML(){return markup},set innerHTML(s){markup=s;root=s.includes('rhero-root')?{
   dataset:{heroProfile:/data-hero-profile="([^"]+)"/.exec(s)?.[1]}}:null},
  querySelector(s){if(s==='.rhero-root')return root;if(!buttons.has(s))buttons.set(s,{});return buttons.get(s)},
  querySelectorAll(){return []}
 };
 const response={ok:true,json:async()=>({ok:true,exists:true,room:'PITGAME26',approved:3,revision:1,
  profile:{klass:'mage',attributes:{INT:2},talents:['E01']}})};
 const sandbox={console,structuredClone,AbortSignal,
  location:{hostname:'dev-gabriel-exe.github.io'},PIT_V5_PHASE2:catalog,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  fetch:async(_url,options)=>{requests++;return kind==='get'||kind==='save'&&options?.method==='POST'?pending:response},
  navigator:{clipboard:{writeText:()=>pending}},
  btoa:s=>Buffer.from(s).toString('base64'),unescape,encodeURIComponent
 };
 sandbox.window=sandbox;vm.runInNewContext(fs.readFileSync('v5/real-hero-profile.js','utf8'),sandbox);
 const ctx={studentId:id,studentName:'V6 fixture',room:'PITGAME26',approved:3,
  authenticated:true,visualPreview:false,tokenProvider:()=> 'f'.repeat(64)};
 sandbox.PIT_V5_REAL_HERO.mount(container,ctx);
 await new Promise(setImmediate);
 if(kind==='copy'||kind==='save'){
  await new Promise(setImmediate);
  const task=buttons.get(kind==='copy'?'#rheroExport':'#rheroSave').onclick();
  container.innerHTML='<iframe class="pit-live-replay">running duel</iframe>';
  release(response);await task;
 }else{
  assert.equal(requests,1);
  container.innerHTML='<iframe class="pit-live-replay">running duel</iframe>';
  release(response);await new Promise(setImmediate);
 }
 assert.match(container.innerHTML,/pit-live-replay/,'Late '+kind+' callback must not replace an active duel with the hero editor');
}
(async()=>{for(const kind of ['get','save','copy'])await scenario(kind);console.log('PASS V6 late hero GET/save/clipboard callbacks cannot overwrite the active duel')})()
 .catch(e=>{console.error(e);process.exitCode=1});

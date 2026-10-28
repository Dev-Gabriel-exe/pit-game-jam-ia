'use strict';
/* FUN-01 — static hosting contract; --live performs read-only GET/OPTIONS only.
 * Never enrolls students, sends messages, writes evidence or uses credentials.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const pages=fs.readFileSync('.github/workflows/deploy-pages.yml','utf8');
const app=fs.readFileSync('v3/app.js','utf8');
const chat=fs.readFileSync('chat-api/api/chat.js','utf8');
const classroom=fs.readFileSync('chat-api/api/classroom.js','utf8');
const config=JSON.parse(fs.readFileSync('chat-api/vercel.json','utf8'));
assert(pages.includes('branches: [main]'),'Pages deploy only main');
assert(!pages.includes('branches: [feature/'),'feature not deployed to Pages');
assert.equal(config.version,2,'Vercel config version');
assert(config.functions['api/chat.js'],'Vercel chat function present');
assert(app.includes("BASE='https://pit-game-jam-chat.vercel.app/api/'"),'V3 uses explicit Vercel API base');
assert(app.includes('if(visualPreview)throw Error('),'preview never calls backend');
assert(app.includes("mode(location.origin,false)==='static-only'"),'unsupported hosts blocked');
for(const src of [chat,classroom]){
 assert(src.includes('Access-Control-Allow-Origin')&&src.includes('Access-Control-Allow-Headers'),'CORS headers present');
 assert(src.includes('https://dev-gabriel-exe.github.io')&&src.includes('https://pit-game-jam-chat.vercel.app'),'trusted origins present');
 assert(!src.includes("'https://raw.githack.com'"),'raw.githack never allowed for API');
 assert(src.includes("if(origin&&!ORIGINS.has(origin))")||src.includes("if(origin && !ORIGINS.has(origin))"),'disallowed origins rejected');
}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('v3/hosting-policy.js','utf8'),ctx,{timeout:1000});
const mode=ctx.window.PIT_HOSTING_POLICY.mode;
assert.equal(mode('https://raw.githack.com'),'static-only');
assert.equal(mode('https://raw.githack.com',true),'preview');
assert.equal(mode('https://dev-gabriel-exe.github.io'),'live');
assert.equal(mode('https://pit-game-jam-chat.vercel.app'),'live');
assert.equal(mode('http://127.0.0.1:8899'),'development');
assert.equal(mode('https://attacker.example'),'static-only');
for(const html of ['aluno-v3.html','professor-v3.html']){
 const text=fs.readFileSync(html,'utf8');
 assert(text.indexOf('v3/hosting-policy.js')>=0&&text.indexOf('v3/hosting-policy.js')<text.indexOf('v3/app.js'),html+' host policy loaded first');
}
console.log('PASS FUN-01 static: Pages main-only, Vercel config, CORS allowlist, preview and origin guards');
if(process.argv.includes('--live')){
 (async()=>{
  const origin='https://dev-gabriel-exe.github.io';
  const base='https://pit-game-jam-chat.vercel.app/api/';
  for(const endpoint of ['chat','classroom']){
   const r=await fetch(base+endpoint+'?action=health',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'GET'},signal:AbortSignal.timeout(15000)});
   assert.equal(r.status,204,endpoint+' preflight HTTP status');
   assert.equal(r.headers.get('access-control-allow-origin'),origin,endpoint+' CORS allowed origin');
   assert((r.headers.get('access-control-allow-methods')||'').includes('GET'),endpoint+' GET allowed');
   console.log('PASS FUN-01 live read-only OPTIONS: '+endpoint+' '+r.status);
  }
  const r=await fetch(base+'chat?action=health',{headers:{Origin:origin,Accept:'application/json'},signal:AbortSignal.timeout(15000)});
  assert.equal(r.status,200,'chat health GET');
  assert.equal(r.headers.get('access-control-allow-origin'),origin,'health CORS');
  const data=await r.json();assert.equal(data.ok,true,'health response ok');
  console.log('PASS FUN-01 live read-only GET: chat health, no identities or writes');
  const site=await fetch('https://dev-gabriel-exe.github.io/pit-game-jam-ia/',{signal:AbortSignal.timeout(15000)});
  assert.equal(site.status,200,'GitHub Pages landing reachable');
  const html=await site.text();
  const v3Links=html.includes('aluno-v3.html')&&html.includes('professor-v3.html');
  console.log('PASS FUN-01 live read-only GET: GitHub Pages landing HTTP 200; V3 links '+(v3Links?'present':'absent (feature remains unpublished)'));
  if(!v3Links)console.log('NOTE FUN-01: live Pages is not proof that the feature V3 is deployed.');
 })().catch(err=>{console.error('FUN-01 LIVE READ-ONLY FAILED:',err.message);process.exitCode=1});
}

/* Execute: node qa/v3-m06-tutorial.cjs — sem serviços externos */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
const context={window:{},navigator:{clipboard:{writeText:async()=>{}}},document:{}};
vm.runInNewContext(read('v3/asset-forge-tutorial.js'),context);
const m=context.window.PIT_ASSET_FORGE_TUTORIAL;
assert.equal(m.routes.length,5);
assert.equal(new Set(m.routes.map(r=>r.id)).size,5);
assert.ok(m.routes.every(r=>r.tool&&r.where&&r.format&&r.gdevelop&&r.check));
const prompt=m.promptFor('image',{title:'A Torre',genre:'Terror',need:'chave',hero:'viajante'});
for(const word of ['A Torre','Terror','chave','viajante'])assert.ok(prompt.includes(word));
assert.ok(m.promptFor('music').includes('[nome do seu jogo]'));
assert.ok(!m.promptFor('voice',{title:'A\nB'}).includes('\n'));
assert.ok(m.render({title:'<script>'}).includes('&lt;script&gt;'));
assert.ok(m.render().includes('id="f6tCopy"'));
const app=read('v3/app.js'),html=read('professor-v3.html'),css=read('v3/asset-forge-tutorial.css');
new vm.Script(app);
assert.match(app,/teacherMissionSixPractice=TEACHER&&m.n===6&&activePhase==='practice'/);
assert.match(app,/if\(teacherMissionSixPractice\)window.PIT_ASSET_FORGE_TUTORIAL.mount\(\)/);
assert.ok(html.includes('asset-forge-tutorial.js')&&html.includes('asset-forge-tutorial.css'));
assert.match(css,/\.f6t-route\[hidden\]\{display:none\}/);
const events={},cards=m.routes.map(r=>({dataset:{f6tCard:r.id},hidden:true})),fields={};
for(const [id,value] of Object.entries({f6tTitle:'Castelo',f6tGenre:'RPG',f6tHero:'Maga',f6tNeed:'cristal',f6tRoute:'image',f6tPrompt:'',f6tStatus:'',f6tCopy:''})){
 fields[id]={value,textContent:'',addEventListener:(type,fn)=>events[id+':'+type]=fn,focus(){},select(){}};
}
m.mount({querySelector:q=>fields[q.slice(1)],querySelectorAll:()=>cards});
assert.equal(cards.filter(c=>!c.hidden).length,1);
assert.ok(fields.f6tPrompt.value.includes('Castelo'));
fields.f6tRoute.value='model';events['f6tRoute:change']();
assert.ok(fields.f6tPrompt.value.includes('low-poly')&&!cards[4].hidden);
fields.f6tTitle.value='Outro Jogo';events['f6tTitle:input']();
assert.ok(fields.f6tPrompt.value.includes('Outro Jogo'));
console.log('M06-03: testes de módulo, roteamento e DOM simulado aprovados; browser/GDevelop pendentes.');

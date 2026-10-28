/* M05-01 · Execute: node qa/v3-m05-foundations.cjs
   Testes isolados: não usam turma, backend, navegador ou GDevelop. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const moduleCode=fs.readFileSync(path.join(root,'v3/teacher-mission-five-foundations.js'),'utf8');
const app=fs.readFileSync(path.join(root,'v3/app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'professor-v3.html'),'utf8');
const context={window:{}};
vm.runInNewContext(moduleCode,context,{filename:'teacher-mission-five-foundations.js'});
const api=context.window.PIT_TEACHER_MISSION_FIVE_FOUNDATIONS;
let n=0;
function test(name,run){run();n++;process.stdout.write('✓ '+name+'\n')}
test('módulo expõe render/mount/transition',()=>assert.equal(typeof api.mount,'function'));
test('aula inclui conceitos, prevenção de repetição e feedback',()=>{
 const page=api.render();
 for(const word of ['variáveis','Trigger once','quadro','feedback'])assert.ok(page.toLowerCase().includes(word.toLowerCase()),word);
});
test('tempo total da missão é 40 minutos',()=>assert.equal(Array.from(api.minutes()).reduce((a,b)=>a+b,0),40));
test('colisão protegida consome o cristal uma vez',()=>{
 let s=api.transition(api.initialState(),'touch','guard');
 s=api.transition(s,'hold','guard');
 assert.equal(s.score,1);assert.equal(s.crystal,false);assert.equal(s.frames,6);
});
test('colisão sem proteção repete cinco vezes',()=>{
 const s=api.transition(api.initialState(),'hold','bug');
 assert.equal(s.score,5);assert.equal(s.frames,5);
});
test('soltar contato processa um quadro',()=>{
 const s=api.transition(api.initialState(),'release','guard');
 assert.equal(s.frames,1);assert.equal(s.contact,false);
});
test('porta não abre sem chave',()=>{
 const s=api.transition(api.initialState(),'door','guard');
 assert.equal(s.door,'FECHADA');assert.equal(s.frames,1);
});
test('chave habilita porta em quadros posteriores',()=>{
 let s=api.transition(api.initialState(),'key','guard');
 s=api.transition(s,'door','guard');
 assert.equal(s.hasKey,true);assert.equal(s.door,'ABERTA');assert.equal(s.frames,2);
});
test('reinício não preserva pontuação, chave ou quadros',()=>{
 let s=api.transition(api.initialState(),'key','guard');
 s=api.transition(s,'reset','guard');
 assert.equal(s.score,0);assert.equal(s.hasKey,false);assert.equal(s.frames,0);
});
test('conteúdo integrado só na fase de briefing do professor',()=>{
 assert.ok(app.includes("TEACHER&&m.n===5&&activePhase==='briefing'"));
 assert.ok(app.includes('teacherMissionFiveBriefing?window.PIT_TEACHER_MISSION_FIVE_FOUNDATIONS.render()'));
 assert.ok(app.includes('if(teacherMissionFiveBriefing)window.PIT_TEACHER_MISSION_FIVE_FOUNDATIONS.mount()'));
});
test('HTML carrega JS antes do app e CSS correspondente',()=>{
 assert.ok(html.includes('teacher-mission-five-foundations.css'));
 assert.ok(html.indexOf('teacher-mission-five-foundations.js')<html.indexOf('src="./v3/app.js"'));
});
test('módulo não lê credenciais nem acessa rede',()=>{
 assert.doesNotMatch(moduleCode,/fetch\s*\(|localStorage|sessionStorage|XMLHttpRequest/);
});
process.stdout.write('\n'+n+' verificações aprovadas (lógica local e integração estática).\n');

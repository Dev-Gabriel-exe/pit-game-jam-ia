'use strict';
// M05 regression: no real students, GDevelop GUI, or network. Run: node qa/v3-m05-regression.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('v3/student-mission-five.js','utf8');
const teacherSource=fs.readFileSync('v3/teacher-mission-five-validation.js','utf8');
const cache=new Map(),window={};
const localStorage={getItem:k=>cache.has(k)?cache.get(k):null,setItem:(k,v)=>cache.set(k,String(v))};
vm.runInNewContext(source,{window,localStorage,console},{filename:'student-mission-five.js',timeout:3000});
vm.runInNewContext(teacherSource,{window,console},{filename:'teacher-mission-five-validation.js',timeout:3000});
const M=window.PIT_STUDENT_MISSION_FIVE,T=window.PIT_TEACHER_MISSION_FIVE_VALIDATION;
let count=0;function check(x,msg){assert.ok(x,msg);count++}
const good={
 route:0,condition:'Quando o jogador toca no cristal',
 action:'Aumenta o contador e remove o cristal',
 variable:'Score=0 depois Score=1',
 positive:'O cristal desapareceu e o placar aumentou',
 negative:'Sem tocar, nada mudou e não duplicou pontos',
 feedback:'O placar mudou na tela do jogo',
 saved:'Pasta do projeto local',issue:'',checks:[0,1,2]
};
const ctx={session:'valid',phase:'review',preview:true,canSubmit:true,
 idea:{title:'Castelo',genre:'Puzzle'},previous:{project:'Castelo',scene:'Cena1'}};
M.save('valid',good);
check(M.validate('valid').ok,'Valid M05 evidence accepted');
check(M.evidence('valid',ctx).length<=750,'Valid evidence within API budget');
check(M.parseEvidence(M.evidence('valid',ctx))?.condition===good.condition,
 'Structured evidence parses without guessing');
check(T.routes.length===3,'Professor has three matching technical routes');
check(['POSITIVO','NEGATIVO','REPETIÇÃO'].every(x=>M.render({...ctx,phase:'practice'}).includes(x)),
 'Student explicitly describes three Preview checks');
const projected=T.render('practice')+T.render('review');
check((projected.match(/<details class="pit-private-teacher-notes">/g)||[]).length>=2,
 'Teacher private guidance uses collapsed details');
check(!/<details class="pit-private-teacher-notes"[^>]*\sopen(?:\s|=|>)/.test(projected),
 'Private teacher details never auto-open');
check(!M.render({...ctx,phase:'practice'}).includes('pit-private-teacher-notes'),
 'Student receives no teacher-only notes');
for(const f of M.fields){
 const id='oversized-'+f.key,original='X'.repeat(f.max+1);
 M.save(id,{...good,[f.key]:original});
 check(M.load(id)[f.key]===original,'M05 preserves overlong '+f.key);
 const result=M.validate(id);
 check(!result.ok&&result.field===f.key&&result.label.includes(String(f.max)),
  'M05 blocks overlong '+f.key+' and states exact limit');
 check(M.validity(M.load(id)).filter(Boolean).length<8,
  'M05 overlong '+f.key+' never counts as 8/8');
 check(M.render({...ctx,session:id}).includes('id="submitWork" disabled'),
  'M05 overlong '+f.key+' cannot submit');
}
const original='Z'.repeat(180);
cache.set('pit_v3_m05_legacy',JSON.stringify({...good,condition:original}));
check(M.load('legacy').condition===original,'Historical localStorage text not truncated');
const d=M.load('legacy');
check(M.selectRoute(d,2),'2D to 3D is a route change');
check(d.checks.length===0,'Route change invalidates all old Preview checks');
check(d.condition===original,'Route change preserves authored oversized text');
M.save('legacy',d);
check(M.load('legacy').condition===original,'Oversized text survives route change and save');
check(!M.validate('legacy').ok,'Historical oversized text remains blocked');
check(!M.selectRoute(d,2),'Same route is idempotent');
check(!M.selectRoute(d,-1),'Invalid route rejected');
M.save('legacy',{...good,route:2});
check(M.validate('legacy').ok,'Student can correct and submit');
const fresh={...good,route:0};
check(M.selectRoute(fresh,1)&&fresh.checks.length===0,'Puzzle route invalidates old checks');
fresh.checks=[0,1,2];
check(!M.selectRoute(fresh,1)&&fresh.checks.length===3,'Same route preserves valid checks');
const blockedWindow={},denied={getItem:()=>{throw Error('SecurityError')},
 setItem:()=>{throw Error('QuotaExceededError')}};
vm.runInNewContext(source,{window:blockedWindow,localStorage:denied,console},{timeout:3000});
const offline=blockedWindow.PIT_STUDENT_MISSION_FIVE;
check(offline.save('offline',good)===false,'Blocked storage reported');
check(offline.load('offline').condition===good.condition,'Blocked storage retains in-tab text');
check(offline.load('offline').checks.length===3,'Blocked storage retains manual checks');
check(offline.load('another').condition==='','Volatile draft remains isolated by session');
check(offline.render({...ctx,session:'offline',phase:'practice'}).includes('Não foi possível salvar'),
 'Storage denial visibly disclosed');
console.log('PASS M05 regression: '+count+' assertions; no human/GUI/HDMI tests');

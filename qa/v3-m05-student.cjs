'use strict';
/* Run: node qa/v3-m05-student.cjs
   M05-03 student module and frontend submission regression; no real browser/Neon. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let count=0;const ok=(x,m)=>{assert.ok(x,m);count++};
const guideCode=read('v3/gdevelop-mission-five-guide.js'),studentCode=read('v3/student-mission-five.js');
const app=read('v3/app.js'),html=read('aluno-v3.html'),teacher=read('professor-v3.html');
const styles=read('v3/student-mission-five.css');
const mem=new Map(),storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,String(v))};
const window={matchMedia:()=>({matches:false})};
vm.runInNewContext(guideCode,{window});vm.runInNewContext(studentCode,{window,localStorage:storage});
const m=window.PIT_STUDENT_MISSION_FIVE;
const ctx={session:'student-1',phase:'practice',status:'',preview:true,canSubmit:true,
 idea:{title:'Minha Torre',genre:'RPG'},mvp:{mechanic:'Abrir portão',scene:'Torre'},
 previous:{project:'TorreGame',scene:'Sala',object:'Heroi',objectType:'2D Sprite',saved:'Nuvem'},
 playable:{route:0,command:'Setas',boundary:'Parede bloqueou',saved:'TorreGame'}};
ok(m.fields.length===8,'Eight fields');
ok(m.routes.length===3,'Three routes');
ok(m.suggestedRoute(ctx)===0,'2D RPG maps collectible');
ok(m.suggestedRoute({...ctx,playable:{route:2}})===1,'Puzzle from M04');
ok(m.suggestedRoute({...ctx,playable:{route:3}})===2,'3D from M04');
ok(m.render(ctx).includes('Abrir portão')&&m.render(ctx).includes('TorreGame'),'Project continuity M01-M04');
ok(m.render(ctx).includes('m5g-root'),'Official GDevelop guide in practice');
ok(m.render(ctx).includes('24 MINUTOS')&&m.render(ctx).includes('8 min'),'Time budget');
ok((m.render(ctx).match(/data-m5s-check="/g)||[]).length===3,'Three preview tests');
ok(!m.validate('student-1').ok,'Blank is not valid');
const data={route:0,condition:'SE o personagem colidir com um cristal',action:'Somar um em Score e apagar o cristal coletado',variable:'Score=0 depois 1',
 positive:'O cristal desapareceu e o placar aumentou para um.',
 negative:'Fora do cristal não marcou pontos; repetindo não somou de novo.',
 feedback:'O placar passou de zero para um.',saved:'TorreGame GDevelop Cloud',issue:'',checks:[0,1,2]};
m.save('student-1',data);
ok(m.validate('student-1').ok,'Complete evidence valid');
ok(m.validity(m.load('student-1')).filter(Boolean).length===8,'Eight progress criteria');
const evid=m.evidence('student-1',ctx);
ok(evid.length<=750,'API evidence max 750');
ok(['Condição:','Ação:','Variável:','Positivo:','Negativo:','Feedback:','Salvo em:'].every(x=>evid.includes(x)),'All evidence fields included');
m.hydrate('student-2',evid,'submitted');
ok(m.fields.every(f=>m.load('student-2')[f.key]===data[f.key]),'Submitted fields restore from API');
ok(m.load('student-2').checks.length===3,'Submitted test attestations restored');
ok(m.load('student-3').condition==='','Session isolation');
m.save('student-2',{...data,action:'Minha versão corrigida preservada'});
m.hydrate('student-2',evid,'revision');
ok(m.load('student-2').action.startsWith('Minha versão corrigida'),'Revision retains local draft');
ok(m.render({...ctx,phase:'review',status:'approved'}).includes('id="submitWork" disabled'),'Approved cannot be resubmitted');
ok(m.render({...ctx,phase:'review',status:'submitted'}).includes('AGUARDANDO AVALIAÇÃO'),'Submitted waiting for real approval');
const max={route:2,checks:[0,1,2]};for(const f of m.fields)max[f.key]='X'.repeat(f.max);m.save('max',max);
const maxCtx={...ctx,session:'max',idea:{genre:'Narrativa interativa',title:'Z'.repeat(100)},
 previous:{project:'P'.repeat(120),scene:'S'.repeat(90)}};
const worst=m.evidence('max',maxCtx);
ok(worst.length<=750,'Worst-case evidence under 750');
ok(m.fields.every(f=>worst.includes(m.load('max')[f.key])),'Worst-case complete fields preserved');
ok(worst.endsWith('X'.repeat(38)),'Last field not truncated');
m.save('xss',{...data,condition:'<img src=x onerror=alert(1)>'});
ok(!m.render({...ctx,phase:'review',session:'xss'}).includes('<img src=x onerror=alert(1)>'),'Text escaped in HTML');
ok(html.includes('student-mission-five.js')&&html.includes('student-mission-five.css'),'Student loads M05 assets');
ok(html.indexOf('student-mission-five.js')<html.indexOf('v3/app.js'),'M05 module before app');
ok(!teacher.includes('student-mission-five.js'),'Teacher module isolated');
ok(app.includes('missionFive?window.PIT_STUDENT_MISSION_FIVE.render(missionFiveContext())'),'M05 render integrated');
ok(app.includes('else if(pilotFive)')&&app.includes('PIT_STUDENT_MISSION_FIVE.evidence(q.session,q)'),'M05 student submission integrated');
ok(app.includes('PIT_STUDENT_MISSION_FIVE.routeType('),'Route is transmitted as 2D/3D');
ok(app.includes("if(visualPreview)return setToast('Prévia: regra registrada"),'Preview cannot submit');
ok(styles.split('{').length===styles.split('}').length,'CSS braces balanced');
ok(styles.includes('prefers-reduced-motion'),'Reduced motion supported');
console.log('PASS '+count+' M05 student module regressions. Browser/GDevelop/API E2E not run.');

'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('v3/app.js'),teacher=read('professor-v3.html'),student=read('aluno-v3.html');
const files=['mission-one','student-mission-two','student-mission-three','student-mission-four','student-mission-five','student-mission-six','student-mission-seven','student-mission-eight','student-mission-nine','student-mission-ten'];
for(let n=1;n<=10;n++){
 const name=files[n-1];
 assert(student.includes('./v3/'+name+'.js'),'student loads '+n);
 assert(app.includes('mission'+['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'][n-1]+'?window.'),'student render '+n);
}
for(const [n,module] of [[1,'teacher-mission-one-pro'],[2,'teacher-mission-two'],[3,'teacher-mission-three'],[4,'teacher-mission-four-foundations'],[5,'teacher-mission-five-foundations'],[6,'teacher-mission-six-foundations'],[7,'teacher-mission-seven-foundations'],[8,'teacher-mission-eight-foundations'],[9,'teacher-mission-nine-foundations'],[10,'teacher-mission-ten-foundations']]){
 assert(teacher.includes('./v3/'+module+'.js'),'teacher loads '+n);
}
assert(app.includes('teacherMissionNineDemo?window.PIT_TEACHER_MISSION_NINE_FOUNDATIONS.renderDemo()'),'M09 demo not legacy speaking notes');
const expected=[
 ['v3/student-mission-three.js',['4 min</b> · projeto','7 min</b> · um asset','5 min</b> · Preview']],
 ['v3/student-mission-four.js',['36 MIN DE PRÁTICA']],
 ['v3/student-mission-five.js',['OFICINA · 24 MINUTOS']],
 ['v3/student-mission-six.js',['32 MINUTOS DE PRODUÇÃO']],
 ['v3/student-mission-seven.js',['OFICINA · 36 MINUTOS','14 min · feedback final','12 min · testes']],
 ['v3/teacher-mission-seven-validation.js',['OFICINA · 36 MINUTOS','14 MIN · RESULTADO','12 MIN · TESTES']],
 ['v3/student-mission-eight.js',['OFICINA · 28 MINUTOS','15 min · IMPLEMENTAR']],
 ['v3/teacher-mission-eight-validation.js',['OFICINA · 28 MIN','15 MIN · MELHORIA']],
 ['v3/student-mission-nine.js',['PLAYTEST · 16 MINUTOS']],
 ['v3/student-mission-ten.js',['18 minutos · demonstração']]
];
for(const [file,terms] of expected){const c=read(file);for(const term of terms)assert(c.includes(term),file+' missing '+term)}
for(const n of [4,5,6,7,8,9,10]){
 const word=['','','','', 'Four','Five','Six','Seven','Eight','Nine','Ten'][n];
 assert(app.includes('teacherMission'+word+'Briefing'),'teacher concepts '+n);
}
assert(app.includes('teacherMissionTenValidation?'),'M10 real review');
console.log('PASS AUD-02: student/teacher 10 missions wired; corrected M03/M07/M08 practice time; M09 custom demo; no fallback in audited routes.');

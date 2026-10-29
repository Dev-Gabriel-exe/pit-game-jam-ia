'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'..');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(root+'/v2/missions.js','utf8'),context,{timeout:3000});
vm.runInContext(fs.readFileSync(root+'/v3/teacher-mission-one-pro.js','utf8'),context,{timeout:3000});
const missions=context.window.PIT_MISSIONS,plan=context.window.PIT_TEACHER_MISSION_ONE.PLAN;
assert.equal(missions.length,10,'exactly ten missions');
assert.equal(new Set(missions.map(m=>m.n)).size,10,'unique mission numbers');
let cumulative=0,practical=0;
for(let n=1;n<=10;n++){
 const m=missions[n-1],phase=plan[n];
 assert.equal(m.n,n,'mission order');
 assert.equal(phase.length,4,'four phase durations');
 assert(phase.every(x=>Number.isInteger(x)&&x>0),'positive phase duration');
 assert.equal(phase.reduce((a,b)=>a+b,0),m.minutes,'teacher plan matches mission duration '+n);
 const time=m.time.match(/(\d{2}):(\d{2})\s*[—-]\s*(\d{2}):(\d{2})/);
 assert(time,'timeline present '+n);
 const start=Number(time[1])*60+Number(time[2]),end=Number(time[3])*60+Number(time[4]);
 assert.equal(start,cumulative,'continuous start '+n);
 assert.equal(end-start,m.minutes,'timeline length '+n);
 assert(m.goal?.length>20&&m.deliver?.length>12,'goal and deliverable '+n);
 assert.equal(m.checks?.length,3,'three student acceptance checks '+n);
 cumulative=end;practical+=phase[2];
}
// Cross-check the actual projected teacher schedules, not only the legacy PLAN table.
function displayedPhaseMinutes(file,pattern){
 const source=fs.readFileSync(root+'/'+file,'utf8');
 const match=source.match(pattern);
 assert(match,'projected schedule not found in '+file);
 return match[1].split(',').map(x=>Number(x.trim()));
}
assert.deepEqual(Array.from(plan[3]),displayedPhaseMinutes('v3/teacher-mission-three.js',/const minutes=\[([\d,\s]+)\]/),'M03 PLAN must match projected 5+5+18+2');
assert.deepEqual(Array.from(plan[7]),displayedPhaseMinutes('v3/teacher-mission-seven-foundations.js',/\+\[([\d,\s]+)\]\.map\(\(n,i\)=>/),'M07 PLAN must match projected 7+4+36+3');
// The M06 student and teacher accept a real imported asset without mandatory generative AI.
assert(/IA é opcional/i.test(missions[5].goal),'M06 must not require an AI account or credits');
assert(/origem\/licença/i.test(missions[5].checks[0]),'M06 acceptance must verify origin and license');
assert(/Preview/i.test(missions[5].deliver),'M06 delivery must mention a real Preview');
assert.equal(cumulative,360,'six-hour total');
assert(practical>=216,'at least 60% practical time');
assert.equal(missions[3].minutes,50,'M04 practice emphasis');
assert.equal(missions[9].minutes,30,'M10 final pitch');
console.log('PASS AUD-01: 10 missions; 360 minutes; '+practical+' practical minutes ('+(practical/360*100).toFixed(1)+'%); projected M03/M07 schedules aligned, M06 AI optional with license/Preview evidence.');

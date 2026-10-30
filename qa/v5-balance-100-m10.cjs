'use strict';
const P=require('../v5/phase2-combat.js');
const C=['warrior','mage','hunter','guardian'];
const A=P.ATTR;
const wins=Object.fromEntries(C.map(c=>[c,0]));
const exposure=Object.fromEntries(C.map(c=>[c,0]));
const samples=[];
function random(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function build(c,n,rand){
 const ids=P.TALENTS[c].map(t=>t.id);
 for(let i=ids.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
 const attrs=Object.fromEntries(A.map(a=>[a,0]));
 for(let i=0;i<20;i++)attrs[A[Math.floor(rand()*A.length)]]++;
 return {id:'trial-balance-'+n,finalTrial:true,approvedMissions:10,build:P.canonical({klass:c,name:'trial-balance-'+n,attributes:attrs,talents:ids.slice(0,10)},10,{experimentalFinal:true})};
}
for(let round=0;round<100;round++){
 const rand=random(20261030+round*104729);
 // 25 rounds of 4 and 75 rounds of 30; rotate class allocation and entry order.
 const count=round<25?4:30;
 const roster=Array.from({length:count},(_,i)=>C[(i+round)%4]);
 for(let i=roster.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[roster[i],roster[j]]=[roster[j],roster[i]]}
 const entries=roster.map((c,i)=>{exposure[c]++;return build(c,round+'-'+i,rand)});
 const result=P.battle(entries,{arenaMission:10,seed:20261030+round*17,arenaScale:5,damageScale:.5,stormDelay:35,stormRateFactor:.65,engagementMode:'spaced',navigationMode:'steer',rangedCommitment:'recovery',balancePreset:'e-hp2'}).run();
 if(!result.finished||!result.winner)throw Error('Incomplete round '+round);
 wins[result.winner.klass]++;
 samples.push({round:round+1,players:count,winner:result.winner.klass,duration:result.time});
}
const output={rounds:100,distribution:{four:25,thirty:75},wins,exposure,winRatePerAppearance:Object.fromEntries(C.map(c=>[c,+(wins[c]/exposure[c]*100).toFixed(2)])),samples};
console.log('BALANCE_100_JSON='+JSON.stringify(output));

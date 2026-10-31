'use strict';
// Pure M10/M5 display regression. No browser, students, server or combat writes.
const assert=require('node:assert/strict');
(async()=>{
 const {selectNicknameCandidates:select}=await import('../v5/nickname-layout.mjs');
 const overlaps=(a,b,gap=5)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
 const candidates=Array.from({length:30},(_,i)=>({
  u:{id:'trial-m10-'+i},sx:110+(i%10)*110,sy:150+Math.floor(i/10)*130,
  rank:i
 }));
 const frozen=JSON.stringify(candidates);
 const hud=[
  {left:850,right:1270,top:0,bottom:180},
  {left:910,right:1270,top:550,bottom:720},
  {left:10,right:520,top:670,bottom:720}
 ];
 const desktop=select(candidates,{stageWidth:1280,stageHeight:720,blockedRects:hud});
 assert(desktop.length>0&&desktop.length<=9,'Desktop should show up to nine non-overlapping names');
 for(let i=0;i<desktop.length;i++){
  assert(desktop[i].rect.left>=4&&desktop[i].rect.right<=1276);
  assert(hud.every(rect=>!overlaps(desktop[i].rect,rect)),'Nickname may not cover a combat HUD');
  for(let j=0;j<i;j++)assert(!overlaps(desktop[i].rect,desktop[j].rect),'Nickname collision');
 }
 assert.equal(JSON.stringify(candidates),frozen,'Selection must not mutate fighters or camera inputs');
 const priority=select([
  {u:{id:'other'},sx:240,sy:200,rank:10},
  {u:{id:'followed'},sx:245,sy:205,rank:-100000}
 ],{stageWidth:700,stageHeight:400});
 assert.equal(priority.length,1);
 assert.equal(priority[0].u.id,'followed','Following a fighter takes priority on collision');
 const narrow=select(Array.from({length:30},(_,i)=>({
  u:{id:'trial-m5-'+i},sx:80+(i%5)*65,sy:80+Math.floor(i/5)*62,rank:i
 })),{stageWidth:420,stageHeight:520,blockedRects:[{left:240,right:420,top:0,bottom:120}]});
 assert(narrow.length>0&&narrow.length<=4,'Narrow stage should limit labels');
 for(let i=0;i<narrow.length;i++)for(let j=0;j<i;j++)
  assert(!overlaps(narrow[i].rect,narrow[j].rect),'Mobile nickname collision');
 assert.deepEqual(select([{u:{id:'bad'},sx:NaN,sy:50,rank:0}],
  {stageWidth:420,stageHeight:520}),[],'Invalid projection is not renderable');
 assert.deepEqual(select(candidates,{stageWidth:0,stageHeight:720}),[]);
 console.log('PASS V5 M5/M10 nickname layout: 30 fictional candidates, HUD exclusion, overlap, mobile cap, focus priority, immutable inputs');
})().catch(e=>{console.error(e);process.exitCode=1});

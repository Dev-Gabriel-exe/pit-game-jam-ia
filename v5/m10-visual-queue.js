/* H.3/M10 experimental visual-only scheduler.
 * A queue entry describes an already confirmed engine proc; this module never
 * creates combat events, changes stats, or renders anything itself.
 * Integration with arena-three.js is intentionally NOT enabled yet.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PIT_V5_M10_VISUAL_QUEUE=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const KEY=/^(warrior|mage|hunter|guardian):[A-Z][0-9]{2}$/;
 function createQueue(capacity=18){
  if(!Number.isInteger(capacity)||capacity<1||capacity>18)
   throw new RangeError('Visual queue capacity must be an integer from 1 to 18');
  const lanes=new Map();
  const order=[];
  let size=0,cursor=0,lastFrame=-1,accepted=0,rejected=0,dispatched=0;
  function enqueue(entry){
   if(!entry||!KEY.test(entry.key)||!Number.isFinite(entry.x)||!Number.isFinite(entry.z))
    throw new TypeError('A confirmed talent cue requires canonical key and finite x/z');
   if(size===capacity){rejected++;return false}
   if(!lanes.has(entry.key)){lanes.set(entry.key,[]);order.push(entry.key)}
   // Never retain mutable combat objects, player IDs, names, or user data.
   lanes.get(entry.key).push(Object.freeze({key:entry.key,x:entry.x,z:entry.z}));
   size++;accepted++;return true;
  }
  function nextForFrame(frame){
   if(!Number.isSafeInteger(frame)||frame<0||frame<=lastFrame)
    throw new RangeError('Rendered frame must increase monotonically');
   lastFrame=frame;
   if(!size)return null;
   const key=order[cursor];
   const lane=lanes.get(key);
   const cue=lane.shift();
   size--;dispatched++;
   if(lane.length){cursor=(cursor+1)%order.length}
   else{
    lanes.delete(key);
    order.splice(cursor,1);
    if(order.length)cursor%=order.length;
    else cursor=0;
   }
   return cue;
  }
  function clear(){
   lanes.clear();order.length=0;
   size=0;cursor=0;lastFrame=-1;accepted=0;rejected=0;dispatched=0;
  }
  function snapshot(){
   return Object.freeze({capacity,size,queuedKeys:Object.freeze(order.slice()),
    accepted,rejected,dispatched,lastFrame});
  }
  return Object.freeze({enqueue,nextForFrame,clear,snapshot});
 }
 return Object.freeze({createQueue});
});

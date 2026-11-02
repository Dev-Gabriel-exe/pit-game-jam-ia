/* H.3/M10 experimental visual-only scheduler.
 * A queue entry describes an already confirmed engine proc; this module never
 * creates combat events, changes stats, or renders anything itself.
 * Opt-in laboratory integration is available only with ?m10visualqueue=1.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PIT_V5_M10_VISUAL_QUEUE=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const KEY=/^(warrior|mage|hunter|guardian):[A-Z][0-9]{2}$/;
 function createQueue(capacity=18,{traceLimit=0}={}){
  if(!Number.isInteger(capacity)||capacity<1||capacity>18)
   throw new RangeError('Visual queue capacity must be an integer from 1 to 18');
  if(!Number.isInteger(traceLimit)||traceLimit<0||traceLimit>256)throw new RangeError('traceLimit must be 0..256');
  const lanes=new Map();
  const order=[];
  let size=0,cursor=0,lastFrame=-1,accepted=0,rejected=0,dispatched=0,evicted=0,evictedSingleton=0;
  const acceptedByKey=new Map(),rejectedByKey=new Map(),dispatchedByKey=new Map();
  const seenByKey=new Map(),evictedByKey=new Map(),evictedSingletonByKey=new Map();
  function count(map,key){map.set(key,(map.get(key)||0)+1)}
  // Opt-in bounded trace: canonical talent keys only, no actors, builds or coordinates.
  const trace=[],rareTrace=[];let sequence=0;
  const rareKeys=new Set(['guardian:J08','hunter:P09','mage:A07']);
  function record(op,fields){
   if(!traceLimit)return;
   const event=Object.freeze({seq:++sequence,op,...fields});
   trace.push(event);if(trace.length>traceLimit)trace.shift();
   if(rareKeys.has(event.key)||rareKeys.has(event.victimKey)){
    rareTrace.push(event);if(rareTrace.length>96)rareTrace.shift();
   }
  }
  function enqueue(entry){
   if(!entry||!KEY.test(entry.key)||!Number.isFinite(entry.x)||!Number.isFinite(entry.z))
    throw new TypeError('A confirmed talent cue requires canonical key and finite x/z');
   count(seenByKey,entry.key);
   if(size===capacity){
    // Admit a first-display canonical talent only by reclaiming a redundant
    // pending cue from an overrepresented key. Never evict a one-off key.
    // This is visual scheduling only: engine events remain untouched.
    let victim=-1,score=0,fallback=-1,fallbackScore=0;
    if(!lanes.has(entry.key)&&!(dispatchedByKey.get(entry.key)||0)){
     for(let i=0;i<order.length;i++){
      const key=order[i],lane=lanes.get(key);
      const redundancy=(lane.length-1)*1000+(seenByKey.get(key)||0)-1;
      // Prefer reclaiming other redundant cues over a key that was
      // evicted once and is still waiting for its first rendered frame.
      // Soft priority: if no other victim exists, preserve original
      // admission behavior rather than rejecting J08/P09 under pressure.
      const protectedRetry=(evictedByKey.get(key)||0)>0&&!(dispatchedByKey.get(key)||0);
      if(protectedRetry){
       if(redundancy>fallbackScore){fallbackScore=redundancy;fallback=i}
      }else if(redundancy>score){score=redundancy;victim=i}
     }
     if(victim<0)victim=fallback;
    }
    if(victim<0){
     rejected++;count(rejectedByKey,entry.key);
     record('reject',{key:entry.key,size,reason:'capacity-no-redundant',firstDisplay:!dispatchedByKey.has(entry.key),queuedKeys:order.length});
     return false;
    }
    const victimKey=order[victim],lane=lanes.get(victimKey);
    record('evict',{key:entry.key,victimKey,size,victimLaneSize:lane.length,
     victimSeen:seenByKey.get(victimKey)||0,firstDisplay:!dispatchedByKey.has(entry.key),reason:'first-display-reclaim'});
    // Diagnostic only: track when the last pending visual of a key is
    // displaced by admission pressure. Do not change the proven WebGL policy.
    if(lane.length===1){evictedSingleton++;count(evictedSingletonByKey,victimKey)}
    lane.shift();size--;evicted++;count(evictedByKey,victimKey);
    if(!lane.length){
     lanes.delete(victimKey);order.splice(victim,1);
     if(victim<cursor)cursor--;
     if(cursor>=order.length)cursor=0;
    }
   }
   if(!lanes.has(entry.key)){lanes.set(entry.key,[]);order.push(entry.key)}
   // Never retain mutable combat objects, player IDs, names, or user data.
   lanes.get(entry.key).push(Object.freeze({key:entry.key,x:entry.x,z:entry.z}));
   size++;accepted++;count(acceptedByKey,entry.key);
   record('accept',{key:entry.key,size,laneSize:lanes.get(entry.key).length,
    firstDisplay:!dispatchedByKey.has(entry.key)});
   return true;
  }
  function nextForFrame(frame){
   if(!Number.isSafeInteger(frame)||frame<0||frame<=lastFrame)
    throw new RangeError('Rendered frame must increase monotonically');
   lastFrame=frame;
   if(!size)return null;
   const key=order[cursor];
   const lane=lanes.get(key);
   const cue=lane.shift();
   size--;dispatched++;count(dispatchedByKey,key);
   record('dispatch',{key,frame,size,laneRemaining:lane.length});
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
   size=0;cursor=0;lastFrame=-1;accepted=0;rejected=0;dispatched=0;evicted=0;evictedSingleton=0;
   acceptedByKey.clear();rejectedByKey.clear();dispatchedByKey.clear();
   seenByKey.clear();evictedByKey.clear();evictedSingletonByKey.clear();
   trace.length=0;rareTrace.length=0;sequence=0;
  }
  function snapshot(){
   return Object.freeze({capacity,size,queuedKeys:Object.freeze(order.slice()),
    accepted,rejected,dispatched,evicted,evictedSingleton,lastFrame,
    acceptedByKey:Object.freeze(Object.fromEntries(acceptedByKey)),
    rejectedByKey:Object.freeze(Object.fromEntries(rejectedByKey)),
    dispatchedByKey:Object.freeze(Object.fromEntries(dispatchedByKey)),
    evictedByKey:Object.freeze(Object.fromEntries(evictedByKey)),
    evictedSingletonByKey:Object.freeze(Object.fromEntries(evictedSingletonByKey)),
    ...(traceLimit?{trace:Object.freeze(trace.slice()),rareTrace:Object.freeze(rareTrace.slice()),traceLimit}:{})});
  }
  return Object.freeze({enqueue,nextForFrame,clear,snapshot});
 }
 return Object.freeze({createQueue});
});

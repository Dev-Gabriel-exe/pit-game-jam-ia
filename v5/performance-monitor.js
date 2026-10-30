/* PIT Game Jam V5 — G.1 passive frame and GPU-resource diagnostics.
 * No gameplay hooks or adaptive quality: observability for PC validation.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_PERFORMANCE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function createMonitor({windowSize=16}={}){
  const samples=[],max=clamp(Math.floor(windowSize)||16,4,120);
  let total=0,longFrames=0,peakFrameMs=0,last=null;
  function sample({fps,drawCalls,triangles,geometries,textures,frameMs,modelsLoaded,modelsExpected,active,contextLost=false}={}){
   const safe=x=>Number.isFinite(x)&&x>=0?x:0;
   const s=Object.freeze({
    fps:safe(fps),drawCalls:safe(drawCalls),triangles:safe(triangles),
    geometries:safe(geometries),textures:safe(textures),frameMs:safe(frameMs),
    modelsLoaded:safe(modelsLoaded),modelsExpected:safe(modelsExpected),
    active:safe(active),contextLost:!!contextLost
   });
   samples.push(s);if(samples.length>max)samples.shift();
   total++;
   if(s.frameMs>50)longFrames++;
   peakFrameMs=Math.max(peakFrameMs,s.frameMs);
   const fpsSamples=samples.filter(x=>x.fps>0).map(x=>x.fps).sort((a,b)=>a-b);
   const p10=fpsSamples.length?fpsSamples[Math.floor((fpsSamples.length-1)*.1)]:0;
   // Explicit labels: no claim to measured GPU utilization or native FPS.
   const status=s.contextLost?'context-lost':!fpsSamples.length?'measuring':
    s.fps<20?'critical':s.fps<30?'review':'measured';
   last=Object.freeze({...s,p10Fps:p10,peakFrameMs,
    longFrameWindows:longFrames,samples:total,status});
   return last;
  }
  function current(){return last}
  function reset(){samples.length=0;total=0;longFrames=0;peakFrameMs=0;last=null}
  function report(extra={}){
   return Object.freeze({
    kind:'pit-v5-perf-g1',scope:'local-browser',sample:last,
    context:extra.context||'WebGL real browser, verify GPU/driver on PCs',
    userAgent:String(extra.userAgent||'').slice(0,220),
    seed:extra.seed??null,players:extra.players??null,
    quality:extra.quality??null,
    // Never embed names, URLs, account identifiers, XP or student records.
    note:'FPS and resource statistics from this browser only; SwiftShader CI is not hardware FPS'
   });
  }
  return Object.freeze({sample,current,reset,report});
 }
 return Object.freeze({createMonitor});
});
/* Missão 01 — lazy silent looping video. Keeps the original poster visible until playback. */
(function(){
 "use strict";
 const root=document.getElementById("missionGallery");
 if(!root)return;
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
 const search=new URLSearchParams(window.location.search);
 const disabledByQuery=search.get("motion")==="off";
 function video(){return root.querySelector('.arcade-card[data-index="0"] .arcade-mission-motion-video');}
 function eligible(){
   const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
   return !disabledByQuery&&!reduce.matches&&!connection?.saveData&&!document.hidden;
 }
 function bind(){
   const v=video();
   if(!v||v.dataset.motionBound)return;
   v.dataset.motionBound="1";
   v.addEventListener("playing",()=>v.classList.add("ready"));
   v.addEventListener("error",()=>{v.dataset.motionFailed="1";v.classList.remove("ready");});
   const source=v.querySelector("source");
   if(source)source.addEventListener("error",()=>{v.dataset.motionFailed="1";v.classList.remove("ready");});
 }
 function sync(){
   const v=video();
   if(!v)return;
   const selected=v.closest(".arcade-card")?.classList.contains("current");
   const shouldPlay=selected&&!root.hidden&&root.classList.contains("open")&&eligible()&&!v.dataset.motionFailed;
   if(shouldPlay){
     if(v.paused)v.play().catch(()=>{v.classList.remove("ready");v.dataset.motionFailed="1";});
   }else{
     v.pause();
     v.classList.remove("ready");
   }
 }
 reduce.addEventListener?.("change",sync);
 document.addEventListener("visibilitychange",sync);
 window.addEventListener("pagehide",()=>{const v=video();if(v)v.pause();});
 window.PIT_ONE_MOTION={bind,sync};
})();

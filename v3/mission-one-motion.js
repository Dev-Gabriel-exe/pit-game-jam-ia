/* Experiment: cinematic LTX videos for up to 10 gallery cards.
   Only the currently selected video plays; use a static image as fallback.
   Respects reduced motion, saveData, visibility and ?motion=off.
*/
(function(){
"use strict";
const root=document.getElementById("missionGallery");
if(!root)return;
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
const disabled=new URLSearchParams(location.search).get("motion")==="off";
const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const videos=()=>Array.from(root.querySelectorAll(".arcade-mission-motion-video"));
const eligible=()=>!disabled&&!reduce.matches&&!connection?.saveData&&!document.hidden;
function bind(){
  for(const v of videos()){
    if(v.dataset.motionBound)continue;
    v.dataset.motionBound="1";
    v.addEventListener("playing",()=>{if(!v.paused)v.classList.add("ready");});
    v.addEventListener("error",()=>{v.dataset.motionFailed="1";v.classList.remove("ready");});
    v.querySelector("source")?.addEventListener("error",()=>{v.dataset.motionFailed="1";v.classList.remove("ready");});
  }
}
function sync(){
  const playAllowed=eligible()&&!root.hidden&&root.classList.contains("open");
  for(const v of videos()){
    const selected=v.closest(".arcade-card")?.classList.contains("current");
    if(playAllowed&&selected&&!v.dataset.motionFailed){
      if(v.paused)v.play().catch(()=>v.classList.remove("ready"));
    }else{
      v.pause();v.classList.remove("ready");
    }
  }
}
reduce.addEventListener?.("change",sync);
connection?.addEventListener?.("change",sync);
document.addEventListener("visibilitychange",sync);
window.addEventListener("pagehide",()=>videos().forEach(v=>v.pause()));
window.PIT_ONE_MOTION={bind,sync};
})();

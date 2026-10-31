/* ART-04 — Lightweight local fallback for optional WebP mission posters.
 * No network/API calls. Keeps textual mission labels and emojis if both assets fail.
 */
(function(){
'use strict';
const FALLBACK='./v3/assets/art/poster-fallback.svg';
function recover(img){
 if(!img||img.tagName!=='IMG'||typeof img.hasAttribute!=='function'||!img.hasAttribute('data-pit-fallback'))return false;
 if(img.dataset.pitFallbackState==='failed')return false;
 if(img.dataset.pitFallbackState==='fallback'){
  img.dataset.pitFallbackState='failed';img.hidden=true;return false;
 }
 img.dataset.pitFallbackState='fallback';
 img.src=FALLBACK;
 return true;
}
document.addEventListener('error',event=>recover(event.target),true);
function inspectCached(){
 document.querySelectorAll('img[data-pit-fallback]').forEach(img=>{
  if(img.complete&&img.naturalWidth===0)recover(img);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inspectCached);
else inspectCached();
window.PIT_MEDIA_FALLBACK=Object.freeze({recover,fallback:FALLBACK});
})();

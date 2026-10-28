/* PIT Game Jam IA V4 — teacher notes safety guard.
 * Visual privacy only; never substitutes for disconnecting HDMI mirroring.
 * No credentials, network calls or persistence.
 */
(function(){
 'use strict';
 const selector='details.pit-private-teacher-notes';
 function closeAll(except){
  document.querySelectorAll(selector+'[open]').forEach(note=>{
   if(note!==except)note.open=false;
  });
 }
 document.addEventListener('toggle',event=>{
  const note=event.target;
  if(note.matches?.(selector)&&note.open)closeAll(note);
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape')closeAll();
 });
 document.addEventListener('click',event=>{
  if(event.target.closest?.('[data-phase], [data-stage], [data-mission], [data-nav], #missionGallery, #missionGalleryGrid, .gallery-grid, .mission-nav, .phase-nav'))closeAll();
 },true);
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden)closeAll();
 });
 window.addEventListener('pagehide',()=>closeAll());
 window.PIT_PRIVATE_NOTES_GUARD={closeAll};
})();

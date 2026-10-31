/* PIT Game Jam V5 F.3 — isolated local viewer state.
 * One authoritative combat snapshot and one shared camera feed per stage.
 * No user account, server, XP, storage, or cross-device transmission.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_CAMERA_VIEWER=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const id=x=>String(x?.id??'');
 function createViewer({feedId='v5-local-stage-feed'}={}){
  let audience='teacher',studentId=null,mode='teacher',revision=0;
  const history=[];
  function state(){return Object.freeze({audience,studentId,mode,revision,feedId})}
  function remember(reason){
   revision++;
   history.push({...state(),reason});
   if(history.length>32)history.shift();
   return state();
  }
  function teacher(){if(audience==='teacher'&&studentId===null)return state();
   audience='teacher';studentId=null;mode='teacher';return remember('teacher-selected')}
  function selectStudent(heroId,roster){
   const hero=Array.isArray(roster)?roster.find(f=>id(f)===String(heroId)):null;
   if(!hero)return null; // Never invent or select a participant not in the match.
   audience='student';studentId=id(hero);mode=hero.alive?'following':'spectating';
   return remember(hero.alive?'student-selected':'student-already-eliminated');
  }
  function update(roster){
   if(audience!=='student'||mode!=='following')return null;
   const hero=Array.isArray(roster)?roster.find(f=>id(f)===studentId):null;
   if(!hero||hero.alive)return null;
   mode='spectating';
   return remember('student-eliminated');
  }
  // This is a serializable read-only *proposal* for Phase H. It is never sent
  // over a network, and does not imply devices are synchronized in F.3.
  function publicFeed(cameraPlan){
   if(!cameraPlan)return null;
   return Object.freeze({schema:'pit-v5-camera-feed-v1',feedId,
    revision:Number(cameraPlan.revision)||0,logicalTime:Number(cameraPlan.at)||0,
    mode:cameraPlan.mode||'overview',ids:[...(cameraPlan.ids||[])].map(String).slice(0,2)});
  }
  function reset(){audience='teacher';studentId=null;mode='teacher';revision=0;history.length=0;return state()}
  return Object.freeze({teacher,selectStudent,update,state,reset,publicFeed,
   history:()=>history.map(x=>({...x}))});
 }
 return Object.freeze({createViewer});
});
// Pure, read-only screen-space nickname selection for the fictional V5 arena.
// A label must never obscure the combat HUD or another fighter's label.
// This module does not read or mutate combat state, progression or cameras.
const intersects=(a,b,gap=5)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
export function selectNicknameCandidates(candidates,{stageWidth,stageHeight,blockedRects=[],maxLabels}={}){
 if(!Number.isFinite(stageWidth)||stageWidth<=0||!Number.isFinite(stageHeight)||stageHeight<=0)return [];
 const limit=maxLabels??(stageWidth<500?4:stageWidth<900?6:9);
 // Conservative CSS max-width envelope, including the build-signature badge.
 // Narrow layouts use the 115/125px mobile badges; desktop allows 180px.
 const width=stageWidth<500?125:180;
 const height=27;
 const placed=[];
 for(const candidate of [...candidates].sort((a,b)=>a.rank-b.rank||String(a.u?.id??'').localeCompare(String(b.u?.id??'')))){
  if(placed.length>=limit)break;
  if(!Number.isFinite(candidate.sx)||!Number.isFinite(candidate.sy))continue;
  const rect={left:candidate.sx-width/2,right:candidate.sx+width/2,
   top:candidate.sy-height,bottom:candidate.sy};
  if(rect.left<4||rect.right>stageWidth-4||rect.top<4||rect.bottom>stageHeight-4)continue;
  if(blockedRects.some(overlay=>intersects(rect,overlay)))continue;
  if(placed.some(other=>intersects(rect,other.rect)))continue;
  placed.push({...candidate,rect});
 }
 return placed;
}

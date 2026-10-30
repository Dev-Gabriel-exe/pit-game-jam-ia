/* PIT Game Jam V5 F.2 — camera composition, visibility and obstacle checks.
 * Deterministic geometry only. No Three.js, no gameplay writes, no network.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_CAMERA_FRAMING=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const TAU=Math.PI*2,HALF_FOV=Math.tan(25*Math.PI/180);
 const v=(p)=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z);
 const segmentDistance=(p,q,o)=>{
  const dx=q.x-p.x,dz=q.z-p.z,dd=dx*dx+dz*dz;
  const t=dd<1e-8?0:clamp(((o.x-p.x)*dx+(o.z-p.z)*dz)/dd,0,1);
  return {distance:Math.hypot(p.x+dx*t-o.x,p.z+dz*t-o.z),t};
 };
 function occlusions(camera,targets,obstacles,{clearance=.8,height=13}={}){
  let blocked=0;
  for(const target of targets)for(const obstacle of obstacles||[]){
   if(!v(target)||!v(obstacle)||!(obstacle.r>0))continue;
   const {distance,t}=segmentDistance(camera,target,obstacle);
   if(t<=.015||t>=.985||distance>=obstacle.r+clearance)continue;
   // An elevated camera can look OVER the existing 3D column.
   const sightY=camera.y+(target.y??2.3-camera.y)*t;
   if(sightY<=height){blocked++;break}
  }
  return blocked;
 }
 function resolveShot({shot,fighters=[],obstacles=[],previous=null,aspect=16/9,reducedMotion=false,elapsed=0}={}){
  if(!shot)return null;
  const alive=fighters.filter(f=>f.alive&&v(f));
  if(!alive.length)return null;
  const focus=shot.focus&&v(shot.focus)?shot.focus:null;
  const chosen=(shot.ids||[]).map(id=>alive.find(f=>String(f.id)===String(id))).filter(Boolean);
  const subjects=(shot.mode==='overview'||!chosen.length)?alive:chosen;
  const anchor=chosen[0]||subjects[0];
  const pts=subjects.map(f=>({x:f.x,y:2.5,z:f.z}));
  // Telegraph point is a TRUE engine-supplied x/z, not an invented attack.
  if(focus&&['duel','highlight'].includes(shot.mode))pts.push({x:focus.x,y:0,z:focus.z});
  const cx=pts.reduce((a,p)=>a+p.x,0)/pts.length;
  const cz=pts.reduce((a,p)=>a+p.z,0)/pts.length;
  const lookY=shot.mode==='overview'?1.4:shot.mode==='victory'?3.15:2.65;
  const look={x:cx,y:lookY,z:cz};
  let spread=0;
  for(const p of pts)spread=Math.max(spread,Math.hypot(p.x-cx,p.z-cz));
  const wide=shot.mode==='overview';
  // Fit the selected subjects within BOTH vertical and horizontal field of view.
  const ar=clamp(Number(aspect)||16/9,.65,2.4);
  const needed=spread/(HALF_FOV*Math.min(1,ar)) * 1.20;
  const minDistance=wide?43:shot.mode==='climax'?25:shot.mode==='victory'?19:23;
  let dist=clamp(Math.max(minDistance,needed),minDistance,wide?135:90);
  let angle=shot.mode==='victory'?.55:shot.mode==='climax'?.77:.9;
  // A tiny final orbit adds depth only during the completed victory; disabled
  // for reduced motion and bounded to ~12 degrees, never circles the field.
  if(shot.mode==='victory'&&!reducedMotion)
   angle+=clamp((elapsed-(shot.at||elapsed))*.025,0,.20);
  const prior=previous?.position;
  const candidates=[];
  for(let j=0;j<12;j++){
   const theta=angle+j*TAU/12;
   // Higher view for all-player overview, medium height for skills, low for winner.
   const elevation=wide?.96:shot.mode==='victory'?.50:shot.mode==='climax'?.61:.72;
   const pos={x:cx+Math.cos(theta)*dist,y:Math.max(12,dist*elevation),z:cz+Math.sin(theta)*dist};
   const blocked=occlusions(pos,pts,obstacles);
   // Prefer continuity: fewer camera flips. Predictable small azimuth changes.
   const deviation=prior?Math.hypot(pos.x-prior.x,pos.z-prior.z):0;
   const travel=prior?Math.min(45,deviation)*.042:j*.11;
   const outside=Math.max(0,Math.abs(pos.x)-46)+Math.max(0,Math.abs(pos.z)-46);
   const score=blocked*12+travel+outside*(wide?.12:.28)+j*.04;
   candidates.push({position:pos,blocked,score,angle:theta,look});
  }
  candidates.sort((a,b)=>a.score-b.score||a.blocked-b.blocked||a.angle-b.angle);
  const winner=candidates[0];
  return Object.freeze({
   mode:shot.mode,look:winner.look,position:winner.position,
   blocked:winner.blocked,distance:dist,subjectIds:subjects.map(f=>String(f.id)),
   fitRadius:spread,angle:winner.angle,focusedTelegraph:!!focus
  });
 }
 return Object.freeze({resolveShot,occlusions,segmentDistance});
});
// KayKit Character Animations 1.1, true CC0 skeletal clips. Pure visual overlay.
export const GROUP_FILES=Object.freeze({
 general:'Rig_Medium_General.glb',movement:'Rig_Medium_MovementBasic.glb',
 dodge:'Rig_Medium_MovementAdvanced.glb',melee:'Rig_Medium_CombatMelee.glb',
 ranged:'Rig_Medium_CombatRanged.glb'
});
export const SOURCE_URL='https://kaylousberg.itch.io/kaykit-character-animations';
const SOURCE_GROUPS=Object.freeze({
 warrior:['general','movement','dodge','melee'],
 guardian:['general','movement','dodge','melee'],
 mage:['general','movement','dodge','ranged'],
 hunter:['general','movement','dodge','ranged']
});
export const MOTION_NAMES=Object.freeze({
 idle:['Idle_A','Idle_B'],run:['Running_A','Running_B'],
 dodge:['Dodge_Forward','Dodge_Left','Dodge_Right'],
 hit:['Hit_A','Hit_B'],defeated:['Death_A','Death_B'],
 warrior:{attack:['Melee_2H_Attack_Chop','Melee_2H_Attack_Slice','Melee_1H_Attack_Slice_Diagonal'],cast:['Melee_2H_Attack_Spin','Melee_1H_Attack_Jump_Chop'],block:['Melee_Block','Melee_Block_Hit']},
 guardian:{attack:['Melee_1H_Attack_Slice_Horizontal','Melee_1H_Attack_Stab'],cast:['Melee_Block_Attack','Melee_2H_Attack_Spinning'],block:['Melee_Block','Melee_Blocking','Melee_Block_Hit']},
 mage:{attack:['Ranged_Magic_Shoot','Ranged_Magic_Spellcasting'],cast:['Ranged_Magic_Spellcasting','Ranged_Magic_Summon','Ranged_Magic_Raise'],block:['Ranged_Magic_Raise']},
 hunter:{attack:['Ranged_Bow_Release','Ranged_Bow_Release_Up','Ranged_Bow_Draw'],cast:['Ranged_Bow_Draw','Ranged_Bow_Release'],block:['Ranged_Bow_Aiming_Idle']}
});
const packCache=new Map(),normalize=name=>String(name||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function preferredClips(klass,motion){return [...(MOTION_NAMES[klass]?.[motion]||[]),...(MOTION_NAMES[motion]||[])]}
export function sourceGroups(klass){return SOURCE_GROUPS[klass]?[...SOURCE_GROUPS[klass]]:[]}
function loadGroup(group,loader){
 const filename=GROUP_FILES[group];if(!filename)return Promise.reject(Error('unknown animation group '+group));
 if(!packCache.has(group)){
  const url=new URL('./assets/animations/kaykit/'+filename,import.meta.url).href;
  const pending=loader.loadAsync(url).then(gltf=>{
   if(!gltf.animations?.length)throw Error('no animations: '+filename);
   return {filename,animations:gltf.animations};
  }).catch(err=>{if(packCache.get(group)===pending)packCache.delete(group);throw err});
  packCache.set(group,pending);
 }
 return packCache.get(group);
}
export async function loadForClass(klass,loader){
 const groupNames=sourceGroups(klass);
 if(!groupNames.length)return {filesLoaded:0,filesRequested:0,clips:new Map(),errors:[]};
 const results=await Promise.allSettled(groupNames.map(group=>loadGroup(group,loader)));
 const clips=new Map(),errors=[];let filesLoaded=0;
 for(let i=0;i<results.length;i++){
  const result=results[i];
  if(result.status==='rejected'){errors.push(groupNames[i]+': '+String(result.reason?.message||result.reason));continue}
  filesLoaded++;for(const clip of result.value.animations)clips.set(clip.name.toLowerCase(),clip);
 }
 return {filesLoaded,filesRequested:groupNames.length,clips,errors};
}
export function retargetClip(THREE,clip,model){
 // Keep original KayKit names and account for glTFLoader dot/underscore sanitization.
 const bones=new Map();
 model.traverse(node=>{
  if((node.isBone||node.name==='Rig_Medium')&&node.name){
   const key=normalize(node.name);if(!bones.has(key))bones.set(key,node.name);
  }
 });
 if(bones.size<18)return null;
 const tracks=[];
 for(const track of clip.tracks){
  const split=track.name.lastIndexOf('.');if(split<1)continue;
  const source=track.name.slice(0,split),property=track.name.slice(split+1);
  if(!['position','quaternion','scale'].includes(property))continue;
  const target=bones.get(normalize(source));if(!target)continue;
  // Root-motion must never move fighters independently from deterministic X/Z combat.
  if((normalize(source)==='root'||normalize(source)==='rigmedium')&&property==='position')continue;
  const copy=track.clone();copy.name=target+'.'+property;tracks.push(copy);
 }
 if(tracks.length<Math.max(36,Math.floor(clip.tracks.length*.65)))return null;
 return new THREE.AnimationClip(clip.name,clip.duration,tracks);
}
export function attachToHero(THREE,klass,model,mixer,actions,library){
 if(!mixer||!model||!actions||!library?.clips)return {added:0,requested:0};
 const names=[...new Set(['idle','run','dodge','hit','defeated','attack','cast','block'].flatMap(m=>preferredClips(klass,m)))];
 let added=0;
 for(const name of names){
  const key='kaykit:'+name.toLowerCase(),original=library.clips.get(name.toLowerCase());
  if(!original||actions.has(key))continue;
  const clip=retargetClip(THREE,original,model);if(!clip)continue;
  actions.set(key,mixer.clipAction(clip));added++;
 }
 return {added,requested:names.length};
}

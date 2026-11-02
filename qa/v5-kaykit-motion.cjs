'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dir=path.join(__dirname,'../v5/assets/animations/kaykit');
const files=['Rig_Medium_General.glb','Rig_Medium_MovementBasic.glb','Rig_Medium_MovementAdvanced.glb','Rig_Medium_CombatMelee.glb','Rig_Medium_CombatRanged.glb'];
const manifest={};let total=0;
for(const filename of files){
 const binary=fs.readFileSync(path.join(dir,filename));
 assert.equal(binary.toString('ascii',0,4),'glTF');
 assert.equal(binary.readUInt32LE(4),2);
 assert.equal(binary.readUInt32LE(8),binary.length);
 assert.equal(binary.readUInt32LE(16),0x4e4f534a);
 const l=binary.readUInt32LE(12),data=JSON.parse(binary.subarray(20,20+l).toString('utf8'));
 assert(data.animations?.length>=10,filename+' has no real animation tracks');
 assert(data.nodes?.some(n=>n.name==='Rig_Medium'),filename+' lacks medium humanoid rig');
 manifest[filename]=data.animations.map(x=>x.name);total+=data.animations.length;
}
for(const [file,name] of [['Rig_Medium_CombatMelee.glb','Melee_Block'],['Rig_Medium_CombatRanged.glb','Ranged_Bow_Release'],['Rig_Medium_CombatRanged.glb','Ranged_Magic_Spellcasting'],['Rig_Medium_MovementAdvanced.glb','Dodge_Forward'],['Rig_Medium_General.glb','Death_A']])assert(manifest[file].includes(name));
(async()=>{
 const motion=await import('../v5/kaykit-motion-pack.mjs');
 assert.equal(Object.keys(motion.GROUP_FILES).length,5);
 for(const klass of ['warrior','guardian','mage','hunter']){
  assert.equal(motion.sourceGroups(klass).length,4);
  for(const action of ['idle','run','hit','dodge','defeated','attack','cast','block']){
   const names=motion.preferredClips(klass,action);
   assert(names.some(name=>Object.values(manifest).some(list=>list.includes(name))),klass+' '+action+' lacks real clip');
  }
 }
 const names=['head','handslot.l','hand.l','wrist.l','lowerarm.l','upperarm.l','handslot.r','hand.r','wrist.r','lowerarm.r','upperarm.r','chest','spine','toes.l','foot.l','lowerleg.l','upperleg.l','toes.r','foot.r','lowerleg.r','upperleg.r','hips','root','Rig_Medium'];
 const tracks=names.flatMap(name=>['position','quaternion','scale'].map(prop=>({name:name+'.'+prop,clone(){return {...this}}})));
 const scene={traverse(fn){for(const name of names)fn({name,isBone:name!=='Rig_Medium'})}};
 class AnimationClip{constructor(name,duration,tracks){this.name=name;this.duration=duration;this.tracks=tracks}}
 const clip=motion.retargetClip({AnimationClip},{name:'Melee_Block',duration:1,tracks},scene);
 assert(clip&&clip.tracks.length>=60);
 assert(!clip.tracks.some(t=>t.name==='root.position'),'root movement forbidden');
 assert(!motion.retargetClip({AnimationClip},{name:'X',tracks},{traverse(fn){fn({name:'head',isBone:true})}}),'mismatched bones rejected');
 const arena=fs.readFileSync(path.join(__dirname,'../v5/arena-three.js'),'utf8');
 assert(arena.includes('KAYKIT_MOTION.loadForClass(klass,loader)'));
 assert(arena.includes("clipKey.startsWith('kaykit:')"));
 assert(arena.includes("get('kaykitmotion')!=='0'"));
 assert(arena.includes("const visualBudget=quality==='low'||reduce?9:18"));
 assert.match(fs.readFileSync(path.join(dir,'LICENSE.txt'),'utf8'),/CC0/);
 const library=fs.readFileSync(path.join(__dirname,'../v3/library-open-assets.js'),'utf8');
 for(const name of ['kaykit-animations-11','adobe-mixamo','não CC0'])assert(library.includes(name));
 console.log('PASS KayKit CC0: five genuine GLBs, '+total+' animation tracks, four class rigs, motion mapping, root lock, licensing and Mixamo guide');
})().catch(e=>{console.error(e);process.exitCode=1});

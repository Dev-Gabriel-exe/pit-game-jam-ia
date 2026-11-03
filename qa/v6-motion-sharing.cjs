'use strict';
// Share immutable animation data across identical rigs, never mixer state.
const assert=require('node:assert/strict');
(async()=>{
 const THREE=await import('three'),motion=await import('../v5/kaykit-motion-pack.mjs');
 const names=['head','handslot.l','hand.l','wrist.l','lowerarm.l','upperarm.l','handslot.r','hand.r',
  'wrist.r','lowerarm.r','upperarm.r','chest','spine','toes.l','foot.l','lowerleg.l','upperleg.l',
  'toes.r','foot.r','lowerleg.r','upperleg.r','hips','root','Rig_Medium'];
 let copies=0;
 const tracks=names.flatMap(name=>[
  new THREE.VectorKeyframeTrack(name+'.position',[0,1],[0,0,0,1,0,0]),
  new THREE.QuaternionKeyframeTrack(name+'.quaternion',[0,1],[0,0,0,1,0,0,0,1]),
  new THREE.VectorKeyframeTrack(name+'.scale',[0,1],[1,1,1,1,1,1])
 ]);
 for(const track of tracks){const clone=track.clone.bind(track);track.clone=()=>{copies++;return clone()}}
 const source=new THREE.AnimationClip('Idle_A',1,tracks),library={clips:new Map([['idle_a',source]])};
 function rig(rename=false){const group=new THREE.Group();for(const name of names){
  const bone=new THREE.Bone();bone.name=rename?name.replaceAll('.','_'):name;group.add(bone)}return group}
 const roots=[],mixers=[],clips=[];
 for(let i=0;i<30;i++){
  const root=rig(),mixer=new THREE.AnimationMixer(root),actions=new Map();
  const result=motion.attachToHero(THREE,'warrior',root,mixer,actions,library);
  assert.equal(result.added,1);const action=actions.get('kaykit:idle_a');action.play();
  roots.push(root);mixers.push(mixer);clips.push(action.getClip());
 }
 assert.equal(new Set(clips).size,1,'30 identical rigs must share one immutable retargeted clip');
 assert(copies<=tracks.length,'Animation buffers were cloned once per hero: '+copies);
 assert(!clips[0].tracks.some(t=>t.name==='root.position'||t.name==='Rig_Medium.position'));
 mixers[0].update(.5);mixers[1].update(.25);
 assert.equal(roots[0].getObjectByName('head').position.x,.5);
 assert.equal(roots[1].getObjectByName('head').position.x,.25,'Mixers must remain independent');
 assert.equal(roots[2].getObjectByName('head').position.x,0,'Other fighters may not inherit animation time');
 const different=rig(true),differentMixer=new THREE.AnimationMixer(different),differentActions=new Map();
 motion.attachToHero(THREE,'warrior',different,differentMixer,differentActions,library);
 const other=differentActions.get('kaykit:idle_a');
 assert.notEqual(other.getClip(),clips[0],'Different target bone names require a separate binding');
 other.play();differentMixer.update(.5);
 assert.equal(different.getObjectByName('hand_l').position.x,.5);
 console.log('PASS V6 motion: 30 independent mixers, one shared clip per skeleton, '+copies+' copied tracks including alternate skeleton');
})().catch(e=>{console.error(e);process.exitCode=1});

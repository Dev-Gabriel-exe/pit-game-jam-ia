/* PIT V5 H.3 — synthetic M10 spectator/teacher visual roster only.
 * Does not fetch or mutate student approvals, XP, names or saved builds.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_M10_VISUAL_ROSTER=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const CLASSES=Object.freeze(['warrior','mage','hunter','guardian']);
 const LABELS=Object.freeze({warrior:'Guerreiro',mage:'Arcanista',hunter:'Caçador',guardian:'Guardião'});
 const MISSIONS=Object.freeze(Array.from({length:10},(_,i)=>i+1));
 function createRoster(engine,policy,{count=30,variant=0}={}){
  if(!engine?.exampleBuild||!engine?.canonical||!policy?.m10ArenaAdapter)
   throw Error('M10 visual requer motor e contrato H0 válidos');
  if(![4,30].includes(count)||!Number.isInteger(variant)||variant<0||variant>10)
   throw Error('M10 visual: quantidade/variante inválida');
  return Object.freeze(Array.from({length:count},(_,i)=>{
   const klass=CLASSES[i%4],n=count===4?LABELS[klass]:LABELS[klass]+' '+String(i+1).padStart(2,'0');
   const choice=(Math.floor(i/4)+variant)%11;
   const base=engine.exampleBuild(klass,n,5,choice);
   const final=engine.exampleBuild(klass,n,10,choice,{experimentalFinal:true});
   const rosterKey='trial-m10-'+i+'-'+klass;
   const entry=policy.m10ArenaAdapter({
    rosterKey,klass,completedMissions:[...MISSIONS],
    build:{attributes:{...final.attributes},talents:[...final.talents]},
    m5Entered:true,m5Frozen:{attributes:{...base.attributes},talents:[...base.talents]},
    m10Locked:true
   });
   // This enforces the same 10-talent/20-point validation as the headless
   // engine. It does not simulate a real professor approving these missions.
   const build=engine.canonical({...entry.build,name:n},10,{experimentalFinal:true});
   return Object.freeze({id:rosterKey,name:n,build,
    approvedMissions:10,finalTrial:true});
  }));
 }
 return Object.freeze({createRoster});
});
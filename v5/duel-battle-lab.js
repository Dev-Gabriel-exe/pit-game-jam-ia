/* Fictional 1v1 arena adapter. No V3 integration, authentication, XP or writes. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_DUEL_BATTLE_LAB=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 function fail(reason){throw Error('DUEL-BATTLE-LAB: '+reason)}
 function createTrial(descriptor,combat,{seed=4252,mission=5,classes=['warrior','guardian']}={}){
  if(!descriptor||descriptor.kind!=='fictional-duel-window'||descriptor.readOnly!==true||
   !Array.isArray(descriptor.players)||descriptor.players.length!==2||
   descriptor.players[0]===descriptor.players[1]||
   descriptor.players.some(k=>!/^trial-[a-z0-9_-]{1,60}$/.test(k)))
   fail('descritor de convite aceito inválido');
  if(!combat||typeof combat.exampleBuild!=='function'||typeof combat.battle!=='function')fail('motor obrigatório');
  if(mission!==5&&mission!==10)fail('somente M5 e M10 fictícias');
  if(!Array.isArray(classes)||classes.length!==2||classes.some(k=>!['warrior','mage','hunter','guardian'].includes(k)))fail('classes inválidas');
  if(!Number.isSafeInteger(seed)||seed<0)fail('seed inválida');
  const entries=descriptor.players.map((alias,i)=>({
   id:alias,name:alias,build:combat.exampleBuild(classes[i],alias,mission,0,{experimentalFinal:mission===10}),
   ...(mission===10?{approvedMissions:10,finalTrial:true}:{})
  }));
  const arena=combat.battle(entries,{seed,arenaMission:mission,limit:95});
  return Object.freeze({kind:'fictional-1v1',mission,aliases:Object.freeze([...descriptor.players]),
   // Hand the *same validated fictional builds* to the existing Three.js stage.
   // Defensive snapshots: the renderer cannot mutate the source roster.
   get roster(){return entries.map(entry=>({id:entry.id,name:entry.name,
    approvedMissions:entry.build.approvedMissions,finalTrial:entry.finalTrial===true,
    build:{...entry.build,attributes:{...entry.build.attributes},
     talents:[...entry.build.talents],appearance:{...entry.build.appearance}}}))},
   run:(steps=3000)=>arena.run(steps),get finished(){return arena.finished},
   get result(){return arena.result()}});
 }
 return Object.freeze({createTrial});
});

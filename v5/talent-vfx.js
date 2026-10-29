/* C.1: VFX descriptors for 120 executable talents. Not dedicated GLB animations.
 * UMD pure data: exactly the same talent IDs and animation IDs used by Phase 2.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PIT_V5_TALENT_VFX=api})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const PATHS=Object.freeze({
 warrior:{B:['assault','attack',0xf29b61,'arc'],D:['duelist','attack',0xffcf83,'arc'],T:['bastion','block',0x88bed2,'barrier']},
 mage:{E:['elemental','cast',0xd47dff,'bolt'],R:['runic','cast',0xb2a0ef,'rune'],A:['astral','cast',0x82dbff,'orbit']},
 hunter:{P:['precision','attack',0x82dea5,'arrow'],E:['trapper','attack',0xb6d480,'trap'],S:['survival','dodge',0x6ad8ca,'dash']},
 guardian:{G:['defense','block',0x83c8ef,'barrier'],L:['light','cast',0xffe4a1,'radiance'],J:['judgment','attack',0xf5b767,'arc']}
});
const OVERRIDES=Object.freeze({
 warrior:{B03:'rune',B05:'radiance',B06:'heal',B10:'dash',D02:'dash',D06:'barrier',D08:'dash',D10:'arc',T01:'barrier',T03:'arc',T04:'barrier',T05:'radiance',T06:'barrier',T08:'arc',T10:'barrier'},
 mage:{E01:'fire',E02:'fire',E03:'frost',E04:'frost',E05:'fire',E06:'bolt',E08:'frost',E10:'fire',R01:'barrier',R03:'rune',R06:'barrier',R07:'rune',R09:'barrier',R10:'rune',A02:'dash',A03:'orbit',A04:'orbit',A05:'orbit',A06:'barrier',A08:'bolt',A09:'dash',A10:'orbit'},
 hunter:{P02:'radiance',P03:'arrow',P05:'rune',P10:'arrow',E01:'trap',E02:'dash',E03:'trap',E04:'trap',E05:'trap',E06:'dash',E08:'trap',E09:'trap',E10:'trap',S01:'dash',S02:'heal',S03:'arrow',S04:'barrier',S05:'arrow',S06:'arc',S07:'dash',S08:'dash',S09:'barrier',S10:'trap'},
 guardian:{G01:'barrier',G03:'arc',G04:'barrier',G05:'barrier',G09:'heal',G10:'barrier',L01:'heal',L02:'radiance',L03:'heal',L04:'radiance',L06:'heal',L07:'radiance',L09:'heal',L10:'rune',J01:'arc',J03:'dash',J04:'rune',J05:'radiance',J07:'radiance',J09:'barrier',J10:'radiance'}
});
const SHAPES=['arc','barrier','bolt','dash','fire','frost','heal','orbit','arrow','radiance','rune','trap'];
const MOTIONS=new Set(['attack','cast','block','dodge']);
function descriptor(klass,talent){
 if(!talent||typeof talent!=='object'||!PATHS[klass])return null;
 const id=talent.id,group=typeof id==='string'?PATHS[klass][id[0]]:null;
 if(!group||!/^[A-Z][0-9]{2}$/.test(id)||!['ativo','passivo','reativo'].includes(talent.type)||talent.animationId!==klass+'_'+id.toLowerCase())return null;
 const index=Number(id.slice(1)),seed=(index*37+klass.length*19+id.charCodeAt(0)*7)%101;
 const style=OVERRIDES[klass][id]||group[3];
 const motion=style==='dash'?'dodge':style==='barrier'?'block':group[1];
 return Object.freeze({key:klass+':'+id,id,name:talent.name,klass,path:group[0],type:talent.type,
  animationId:talent.animationId,motion:MOTIONS.has(motion)?motion:'cast',
  style:SHAPES.includes(style)?style:'arc',color:group[2],
  scale:+(.86+(seed%8)*.075).toFixed(3),duration:talent.type==='ativo'?.80:.52,
  spin:(seed%2?-1:1)*(1.6+(seed%4)*.42),variant:seed%4,
  signature:klass+':'+id+':'+style+':'+seed});
}
function manifest(all){
 if(!all||typeof all!=='object')throw Error('Catálogo do motor é obrigatório');
 const result={};
 for(const klass of Object.keys(PATHS)){
  const items=all[klass];if(!Array.isArray(items))throw Error('Catálogo incompleto: '+klass);
  result[klass]=items.map(t=>{const cue=descriptor(klass,t);if(!cue)throw Error('Talento inválido: '+klass+':'+t.id);return cue});
 }
 return result;
}
return Object.freeze({PATHS,SHAPES,MOTIONS,descriptor,manifest});
});
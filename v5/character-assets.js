/* V5 — one consistent free CC0 art family for four classes.
 * Tactical Slash has THREE human playable GLBs (swordsman, priest, archer).
 * Guardian intentionally reuses swordsman/knight; no invented fourth playable
 * asset, no Quaternius overlays, same source scaling and animations.
 * Source pinned to 8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727
 * Provenance: https://github.com/sion-rgb/tactical-slash/blob/main/THIRD_PARTY_ASSETS.md
 */
(function(root,factory){
 const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;
 root.PIT_V5_ASSETS=data;
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const BASE='https://raw.githubusercontent.com/sion-rgb/tactical-slash/8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727/assets/characters/player/';
const source='https://github.com/sion-rgb/tactical-slash/blob/8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727/THIRD_PARTY_ASSETS.md';
const family='Tactical Slash · KayKit CC0 normalized 1.85m';
const assets={
 warrior:{model:BASE+'player_swordsman.glb',label:'Espadachim',role:'Força • combate corpo a corpo',creator:'Kay Lousberg (KayKit) · adaptação sion-rgb',source,family,geometry:'Espadachim do Tactical Slash, sem equipamento sobreposto',weapon:'blade',sizeMB:.55},
 mage:{model:BASE+'player_priest.glb',label:'Sacerdote Arcano',role:'Magia • feitiços • runas',creator:'Kay Lousberg (KayKit) · adaptação sion-rgb',source,family,geometry:'Sacerdote jogável do Tactical Slash, mesma escala e animações',weapon:'staff',sizeMB:.54},
 hunter:{model:BASE+'player_archer.glb',label:'Arqueiro',role:'Distância • precisão • mobilidade',creator:'Kay Lousberg (KayKit) · adaptação sion-rgb',source,family,geometry:'Arqueiro original que o usuário aprovou, com arco e animações integradas',weapon:'bow',sizeMB:.70},
 guardian:{model:BASE+'player_swordsman.glb',label:'Cavaleiro Guardião',role:'Defesa • resistência • proteção',creator:'Kay Lousberg (KayKit) · adaptação sion-rgb',source,family,geometry:'Mesmo espadachim jogável usado para Guerreiro; a classe e os talentos diferenciam as funções',weapon:'blade',sizeMB:.55}
};
return Object.freeze(Object.fromEntries(Object.entries(assets).map(([k,v])=>[k,Object.freeze({...v,license:'CC0-1.0'})])));
});

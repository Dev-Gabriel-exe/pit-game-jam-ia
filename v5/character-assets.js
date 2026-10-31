/* V5 — FOUR DISTINCT complete rigged KayKit Adventurers models (CC0).
 * Same authored pack, no generated helmets, swords, limbs or overlays.
 * Full models are pinned to commit 672074b73ba276876a19e8816ecdc5241817ab47.
 * This visual map does NOT alter any combat mechanic, hitbox or student XP.
 */
(function(root,factory){
 const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;
 root.PIT_V5_ASSETS=data;
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const BASE='https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/672074b73ba276876a19e8816ecdc5241817ab47/addons/kaykit_character_pack_adventures/Characters/gltf/';
const source='https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0';
const family='KayKit Adventurers 1.0 · 4 distinct free CC0 rigged characters';
const assets={
 warrior:{model:BASE+'Barbarian.glb',label:'Bárbaro',role:'Força • combate corpo a corpo',creator:'Kay Lousberg (KayKit)',source,family,geometry:'Modelo Bárbaro completo do pacote gratuito, com animações originais',weapon:'blade',sizeMB:3.62},
 mage:{model:BASE+'Mage.glb',label:'Mago',role:'Magia • feitiços • runas',creator:'Kay Lousberg (KayKit)',source,family,geometry:'Modelo Mago completo do mesmo pacote gratuito, com animações originais',weapon:'staff',sizeMB:3.59},
 hunter:{model:BASE+'Rogue_Hooded.glb',label:'Ladino encapuzado',role:'Distância • precisão • mobilidade',creator:'Kay Lousberg (KayKit)',source,family,geometry:'Modelo Ladino Encapuzado completo do mesmo pacote gratuito, com animações originais',weapon:'bow',sizeMB:3.60},
 guardian:{model:BASE+'Knight.glb',label:'Cavaleiro',role:'Defesa • resistência • proteção',creator:'Kay Lousberg (KayKit)',source,family,geometry:'Modelo Cavaleiro completo do mesmo pacote gratuito, com animações originais',weapon:'blade',sizeMB:3.66}
};
return Object.freeze(Object.fromEntries(Object.entries(assets).map(([k,v])=>[k,Object.freeze({...v,license:'CC0-1.0'})])));
});

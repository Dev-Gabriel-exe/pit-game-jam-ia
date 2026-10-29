/* V5 • Coleção de personagens 3D verdadeiros, licenciados CC0.
 * Pinned to immutable upstream commits, one GLB per class.
 * No local copies of large models; loading is on demand with fallback procedural.
 */
(function(root,factory){
 const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;
 root.PIT_V5_ASSETS=data;
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const ADVENTURERS='https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/672074b73ba276876a19e8816ecdc5241817ab47/addons/kaykit_character_pack_adventures/Characters/gltf/';
const SKELETONS='https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0/15b62b9bad122f72926c10fb14d622c73819fa54/addons/kaykit_character_pack_skeletons/Characters/gltf/';
const TACTICAL='https://raw.githubusercontent.com/sion-rgb/tactical-slash/8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727/assets/characters/player/';
const assets={
 guardian:{model:ADVENTURERS+'Knight.glb',label:'Cavaleiro',role:'Defesa • escudo • resistência',creator:'Kay Lousberg · KayKit',source:'https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0',geometry:'Cavaleiro de armadura com equipamento de defesa',weapon:'blade',sizeMB:3.66},
 warrior:{model:ADVENTURERS+'Barbarian.glb',label:'Bárbaro',role:'Força • combate corpo a corpo',creator:'Kay Lousberg · KayKit',source:'https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0',geometry:'Guerreiro pesado e selvagem com equipamento próprio',weapon:'axe',sizeMB:3.61},
 mage:{model:ADVENTURERS+'Mage.glb',label:'Mago',role:'Feitiços • runas • explosão arcana',creator:'Kay Lousberg · KayKit',source:'https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0',geometry:'Arcanista equipado com cajado',weapon:'staff',sizeMB:3.59},
 rogue:{model:ADVENTURERS+'Rogue_Hooded.glb',label:'Ladino encapuzado',role:'Agilidade • ataques críticos • furtividade',creator:'Kay Lousberg · KayKit',source:'https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0',geometry:'Rogue com capuz e equipamento leve',weapon:'blade',sizeMB:3.60},
 hunter:{model:TACTICAL+'player_archer.glb',label:'Arqueiro',role:'Distância • precisão • mobilidade',creator:'KayKit · adaptação sion-rgb',source:'https://github.com/sion-rgb/tactical-slash/blob/main/THIRD_PARTY_ASSETS.md',geometry:'Personagem com arco integrado e animações de ataque a distância',weapon:'bow',sizeMB:.70},
 necromancer:{model:SKELETONS+'Skeleton_Mage.glb',label:'Mago esqueleto',role:'Magia sombria • drenagem • lacaios',creator:'Kay Lousberg · KayKit',source:'https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0',geometry:'Feiticeiro esqueleto, silhueta distinta do mago humano',weapon:'staff',sizeMB:4.76}
};
return Object.freeze(Object.fromEntries(Object.entries(assets).map(([k,v])=>[k,Object.freeze({...v,license:'CC0-1.0'})])));
});
/* V5 · Fase 1: apenas quatro classes-piloto. Metadados de apresentação;
 * URLs, licenças e proveniência permanecem em character-assets.js.
 * Não altera classes ou progressão persistidas das branches experimentais.
 */
(function(root,factory){
 const value=factory();
 if(typeof module==='object'&&module.exports)module.exports=value;
 root.PIT_V5_FASE1=value;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const catalog=[
  {id:'warrior',name:'Guerreiro',modelName:'Barbarian.glb',type:'Combate corpo a corpo',lore:'A lâmina da tempestade. Avança sem hesitar, abre caminho e resiste na linha de frente.',accent:'#d99365',glyph:'⚔',special:'Golpe sísmico',weakness:'Precisa se aproximar dos inimigos'},
  {id:'mage',name:'Arcanista',modelName:'Mage.glb',type:'Magia de longa distância',lore:'Domina runas antigas e descargas arcanas para controlar o campo de batalha.',accent:'#a28cda',glyph:'✧',special:'Explosão arcana',weakness:'Exige posicionamento para sobreviver'},
  {id:'hunter',name:'Caçador',modelName:'Rogue_Hooded.glb',type:'Precisão e mobilidade',lore:'Enxerga caminhos invisíveis, usa arco de longa distância e vence pela precisão.',accent:'#84bc99',glyph:'➶',special:'Flecha múltipla',weakness:'Menos resistente no combate próximo'},
  {id:'guardian',name:'Guardião',modelName:'Knight.glb',type:'Escudo e proteção',lore:'O último escudo da arena. Suporta impactos e protege os aliados.',accent:'#8bafc9',glyph:'⛨',special:'Fortaleza',weakness:'Mobilidade menor que outras classes'}
 ];
 return Object.freeze(catalog.map(e=>Object.freeze(e)));
});

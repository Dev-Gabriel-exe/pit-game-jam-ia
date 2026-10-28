'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const tokens=fs.readFileSync('v3/design-system.css','utf8');
const required=['abyss','iron','steel','bronze','gold','gold-muted','chat-gold','ember','paper','chat-paper','focus','success','danger','font-display','font-ui','motion-fast','motion-reveal','radius-sm','radius-md','radius-lg'];
for(const key of required)assert(new RegExp('--pit-'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+':').test(tokens),'missing token '+key);
const definitions=[...tokens.matchAll(/--pit-([a-z0-9-]+):/g)].map(x=>x[1]);
assert.equal(new Set(definitions).size,definitions.length,'tokens must be unique');
for(const path of ['index.html','fase1.html','aluno-v3.html','professor-v3.html']){
 const html=fs.readFileSync(path,'utf8');
 assert(html.includes('v3/design-system.css')&&html.includes('v3/accessibility-v3.css'),'design tokens loaded '+path);
}
const used={
 'v3/diablo-theme.css':['--pit-abyss','--pit-iron','--pit-gold','--pit-paper'],
 'v3/professor-gothic.css':['--pit-gold-muted'],
 'v3/chat-gothic.css':['--pit-chat-gold','--pit-chat-paper'],
 'v3/accessibility-v3.css':['--pit-focus']
};
for(const [file,names] of Object.entries(used)){const css=fs.readFileSync(file,'utf8');for(const token of names)assert(css.includes('var('+token),'missing semantic reference '+token+' in '+file)}
assert(fs.readFileSync('v3/accessibility-v3.css','utf8').includes('prefers-reduced-motion:reduce'),'reduced motion remains supported');
console.log('PASS ART-01: '+definitions.length+' unique semantic tokens, four HTML routes, component references and reduced motion');

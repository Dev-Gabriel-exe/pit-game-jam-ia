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
const docs=fs.readFileSync('v3/DESIGN-SYSTEM.md','utf8');
for(const term of ['--pit-paper','--pit-success','prefers-reduced-motion','localStorage','ART-02'])assert(docs.includes(term),'missing design rule '+term);
for(const token of ['surface','surface-raised','text-muted','divider','motion-ease','motion-slow','shadow-card'])assert(tokens.includes('--pit-'+token+':'),'missing semantic token '+token);
for(const rule of ['.pit-art-panel','.pit-art-state','.pit-art-reveal','prefers-contrast:more'])assert(tokens.includes(rule),'missing reusable component '+rule);
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)}
function luminance(hex){return rgb(hex).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)}
function contrast(a,b){const [hi,lo]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (hi+.05)/(lo+.05)}
function color(name){const match=tokens.match(new RegExp('--pit-'+name+':(#[0-9a-f]{6})','i'));assert(match,'missing hex token '+name);return match[1]}
for(const [fg,bg,min] of [['paper','abyss',7],['gold','abyss',7],['text-muted','surface',4.5],['success','abyss',4.5],['danger','abyss',4.5],['bronze','abyss',4.5]])assert(contrast(color(fg),color(bg))>=min,'contrast too low: '+fg+'/'+bg);
console.log('PASS ART-01: verified six WCAG opaque-color pairs, documentation, reusable components');
console.log('PASS ART-01: '+definitions.length+' unique semantic tokens, four HTML routes, component references and reduced motion');

/* PIT Game Jam IA V5 C.3 — visual identity is determined by approved-design M5 build,
 * never by player name, randomness, damage output, grades, XP or server state.
 * Demo-only until an authenticated, server-verified build snapshot exists.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PIT_V5_BUILD_IDENTITY=api})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const PATHS=Object.freeze({
 warrior:{B:['Brutalidade','BRU'],D:['Duelista','DUE'],T:['Bastião','BAS']},
 mage:{E:['Elemental','ELE'],R:['Rúnico','RUN'],A:['Astral','AST']},
 hunter:{P:['Precisão','PRE'],E:['Emboscada','EMB'],S:['Sobrevivência','SOB']},
 guardian:{G:['Defesa','DEF'],L:['Luz Sagrada','LUZ'],J:['Julgamento','JUL']}
});
const ATTR=['FOR','DES','INT','VIT','DEF'];
function hash(input){let n=2166136261;for(const c of input){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0}
function hex(n){return '#'+Math.max(0,Math.min(0xffffff,n)).toString(16).padStart(6,'0')}
function blend(a,b,k){
 const channel=(n,shift)=>(n>>>shift)&255,lerp=(a,b,k)=>Math.round(a*(1-k)+b*k);
 return (lerp(channel(a,16),channel(b,16),k)<<16)|(lerp(channel(a,8),channel(b,8),k)<<8)|lerp(channel(a,0),channel(b,0),k);
}
function describe(input,engine,vfx){
 if(!engine||!vfx?.PATHS||!input||input.schema!==engine.VERSION)throw Error('Build M5 canônica do motor experimental é obrigatória');
 const b=engine.canonical(input,input.approvedMissions??5);
 const id=b.klass;if(!PATHS[id]||!Array.isArray(b.talents))throw Error('Classe ou talentos inválidos');
 const valid=new Map(engine.TALENTS[id].map(t=>[t.id,t]));
 const counts=Object.fromEntries(Object.keys(PATHS[id]).map(k=>[k,0]));
 for(const skill of b.talents){
  if(!valid.has(skill)||!counts.hasOwnProperty(skill[0]))throw Error('Talento desconhecido');
  counts[skill[0]]++;
 }
 const ranked=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]||a.localeCompare(b));
 // The dominant tree is chosen by majority; tie breaks are deterministic.
 const dominant=ranked[0],secondary=ranked[1],families=ranked.filter(k=>counts[k]>0).length;
 const first=Number(vfx.PATHS[id][dominant]?.[2]),second=Number(vfx.PATHS[id][secondary]?.[2]);
 if(!Number.isFinite(first)||!Number.isFinite(second))throw Error('Paleta ausente');
 const normalized=[id,[...b.talents].sort().join(','),...ATTR.map(a=>b.attributes[a])].join('|');
 const fingerprint=hash(normalized),variant=fingerprint%4;
 const base=blend(first,second,counts[secondary]>0?.20:.07);
 const detail=blend(second,first,.24);
 const accent=blend(base,(variant%2?0xf3e5c7:0xa5ddec),.08+(variant%3)*.035);
 const shape=['diamond','crown','trident','orb'][variant];
 const mix=ranked.map(k=>Object.freeze({path:k,label:PATHS[id][k][0],count:counts[k]}));
 return Object.freeze({
  klass:id,signature:normalized,hash:fingerprint,
  primaryPath:dominant,primaryLabel:PATHS[id][dominant][0],
  primaryAbbr:PATHS[id][dominant][1],secondaryPath:secondary,
  accent,detail,accentHex:hex(accent),detailHex:hex(detail),
  shape,variant,shards:Math.min(3,Math.max(1,families)),families,
  focus:ATTR.slice().sort((left,right)=>b.attributes[right]-b.attributes[left]||left.localeCompare(right))[0],
  counts:Object.freeze({...counts}),mix:Object.freeze(mix),
  visualId:id+':'+[...b.talents].sort().join('-')+':'+ATTR.map(k=>b.attributes[k]).join('-')
 });
}
function collision(a,b){return !!a&&!!b&&a.visualId===b.visualId}
return Object.freeze({PATHS,ATTR,hash,describe,collision});
});
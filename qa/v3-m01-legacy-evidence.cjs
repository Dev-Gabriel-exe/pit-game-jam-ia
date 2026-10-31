'use strict';
// M01: never reconstruct flattened/incomplete historical evidence or replace local work.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const store=new Map(),window={};
const localStorage={
 getItem:key=>store.has(key)?store.get(key):null,
 setItem:(key,value)=>store.set(key,value),
 removeItem:key=>store.delete(key)
};
vm.runInNewContext(fs.readFileSync('v3/mission-one.js','utf8'),{window,localStorage,console},{timeout:3000});
const m=window.PIT_MISSION_ONE;
assert(m&&typeof m.parseEvidence==='function'&&typeof m.hydrate==='function');
const data={genre:'Puzzle',title:'Porta de Cristal',hero:'Uma exploradora',
 action:'Coletar cristais',objective:'Abrir a porta do castelo',
 victory:'Quando tres cristais forem coletados',feedback:'Mostrar tela de vitoria'};
store.set('pit_v3_missao01_rascunho_source',JSON.stringify(data));
const valid=m.evidence('source'),count={n:0};
function check(condition,message){assert(condition,message);count.n++}
check(valid.split('\n').length===7,'Seven ordered lines');
check(valid.length<=750,'API evidence limit');
check(m.parseEvidence(valid)?.title===data.title,'Valid title roundtrip');
check(m.parseEvidence(valid)?.hero===data.hero,'Valid hero roundtrip');
check(m.parseEvidence(valid)?.genre===data.genre,'Valid genre roundtrip');
check(m.parseEvidence(valid.replace(/\n/g,'\r\n'))?.action===data.action,'CRLF roundtrip');
m.hydrate('fresh',valid,'approved');
check(m.load('fresh').title===data.title,'Fresh draft hydrates');
check(m.load('fresh').victory===data.victory,'Fresh draft keeps condition');
for(const status of ['approved','submitted','revision','']){
 const id='local_'+(status||'empty');
 store.set('pit_v3_missao01_rascunho_'+id,JSON.stringify({title:'Meu rascunho'}));
 m.hydrate(id,valid,status);
 check(m.load(id).title==='Meu rascunho','Local draft wins '+status);
}
store.set('pit_v3_missao01_rascunho_genreonly',JSON.stringify({genre:'RPG'}));
m.hydrate('genreonly',valid,'approved');
check(m.load('genreonly').genre==='RPG','Even partial local draft preserved');
const invalid=[
 valid.replace(/\n/g,' '),
 valid.replace('Jogo: Porta de Cristal\n',''),
 valid.replace('Ação principal: Coletar cristais','Ação principal: '),
 valid.replace('Gênero: Puzzle','Gênero: Inexistente'),
 valid.replace('Jogo: Porta de Cristal','Jogo: '+('A'.repeat(56))),
 valid.replace('Objetivo do jogador: Abrir a porta do castelo','Objetivo do jogador: A'),
 valid.replace('Gênero: Puzzle; Protagonista: Uma exploradora','Gênero: Puzzle; Protagonista: X'),
 valid.replace('Gênero: Puzzle; Protagonista: Uma exploradora','Gênero: Puzzle; Protagonista: Uma exploradora; Protagonista: Outra'),
 valid.replace('Objetivo do jogador:','Objetivo desconhecido:'),
 valid.replace('Feedback da conquista: Mostrar tela de vitoria','Feedback da conquista: Mostrar tela de vitoria '),
 valid.replace('MISSÃO 01 — O CHAMADO','MISSÃO 02 — MVP EM FOCO'),
 valid+'\nJogo: Duplicado',
 valid.replace('Condição de conclusão: Quando tres cristais forem coletados\n',''),
 valid.replace('Jogo: Porta de Cristal','Jogo: '),
 null,{},''
];
invalid.forEach((raw,i)=>{
 check(m.parseEvidence(raw)===null,'Reject invalid evidence '+i);
 const id='invalid'+i;
 m.hydrate(id,raw,'approved');
 check(!m.load(id).title,'Invalid evidence must not hydrate '+i);
});
check(m.validate('fresh').ok,'Recovered complete evidence validates');
check(m.evidence('fresh')===valid,'Recovered evidence is lossless');
// Storage may be unavailable (private mode/quota/security policy). Never claim
// the draft was saved; preserve it in this tab and warn before the student leaves.
const blockedWindow={};
const blockedStorage={
 getItem:()=>null,
 setItem:()=>{throw new Error('QuotaExceededError')}
};
vm.runInNewContext(fs.readFileSync('v3/mission-one.js','utf8'),
 {window:blockedWindow,localStorage:blockedStorage,console},{timeout:3000});
const blocked=blockedWindow.PIT_MISSION_ONE;
blocked.hydrate('offline',valid,'approved');
check(blocked.load('offline').title===data.title,'Storage failure keeps the draft in memory');
check(blocked.load('offline').hero===data.hero,'Storage failure preserves all fields');
check(!blocked.load('another').title,'Volatile fallback remains isolated by session');
const offlineHtml=blocked.render({session:'offline',phase:'practice',status:'draft',preview:true});
check(offlineHtml.includes('Não foi possível salvar neste navegador'),'Student sees explicit storage failure');
check(offlineHtml.includes('Copie sua ficha antes de sair'),'Student sees safe fallback action');
check(!offlineHtml.includes('rascunho salvo neste navegador'),'Student is not falsely told draft persisted');
check(offlineHtml.includes('confira o aviso de salvamento'),'Instructions direct student to real save indicator');
const offlineReview=blocked.render({session:'offline',phase:'review',status:'draft',preview:true,canSubmit:true});
check(offlineReview.includes('O rascunho não foi salvo no navegador'),'Review warns before student exits');
check(offlineReview.includes('Copie o texto da ficha'),'Review offers manual recovery');
const emptyHtml=blocked.render({session:'new',phase:'practice',status:'draft',preview:true});
check(emptyHtml.includes('comece a preencher para salvar'),'New draft is not falsely marked as saved');
const savedHtml=m.render({session:'source',phase:'practice',status:'draft',preview:true});
check(savedHtml.includes('rascunho salvo neste navegador'),'Persisted draft still shows correct saved status');
console.log('PASS: M01 legacy evidence '+count.n+' checks');

/* PIT V5 — Browser UI. All persistent progress and names come from classroom auth.
 * Demo is intentionally separate from live class data and NEVER writes to server.
 */
(function(){
'use strict';
const C=window.PIT_V5_CORE;const $=id=>document.getElementById(id);
const url=new URLSearchParams(location.search),preview=url.has('preview'),teacher=url.get('mode')==='teacher';
const BASE='https://pit-game-jam-chat.vercel.app/api/arena';
const state={preview,teacher,session:null,authenticated:false,hero:null,build:null,progress:{missions:0,total:0,approvedXp:0,reviewXp:0},stage:null,arena:false,roster:[],tournament:null,sound:false,audio:null,battle:null,heartbeat:null,loaded:false};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const notice=(message,isError=false)=>{const n=$('v5Notice');n.hidden=false;n.textContent=message;n.style.borderLeftColor=isError?'#e27677':'#ddb077'};
const status=message=>{$('v5Connection').textContent=message};
function session(){
 try{const data=JSON.parse(localStorage.getItem('pit_chat_student_v09')||'null');return data&&/^[a-f\d]{64}$/i.test(String(data.token))?data:null}catch{return null}
}
async function api(action,method='GET',data=null){
 const headers={'Content-Type':'application/json'};
 if(state.teacher){
  const pin=sessionStorage.getItem('pit_teacher_pin');
  if(!pin)throw Error('Abra o Mission Control e entre com o PIN do professor antes de acessar a arena.');
  headers['X-PIT-Teacher-Pin']=pin;
 }else{
  if(!state.session?.token)throw Error('É necessário entrar no Caderno do Aluno para salvar seu herói.');
  headers['X-PIT-Student-Token']=state.session.token;
 }
 const response=await fetch(BASE+'?action='+encodeURIComponent(action),{method,headers,body:method==='POST'?JSON.stringify(data):undefined,signal:AbortSignal.timeout(15000),cache:'no-store'});
 let result;try{result=await response.json()}catch{throw Error('Não foi possível ler a resposta do servidor.')}
 if(!response.ok||result.ok===false)throw Error(result.error||'Ação indisponível.');
 return result;
}
function demoHero(name,klass,xp,id){
 const source=C.seedBuild(name,klass);const b=C.budgets(xp);
 source.appearance.palette=({warrior:'ember',mage:'amethyst',hunter:'jade',guardian:'azure'})[klass];
 source.appearance.weapon=({warrior:'blade',mage:'staff',hunter:'bow',guardian:'axe'})[klass];
 source.attributes.power=Math.min(5,b.attributes);
 source.attributes.vitality=Math.min(4,b.attributes-5);
 source.attributes.agility=Math.min(3,b.attributes-9);
 source.talents={};
 return {id,name,build:C.canonical(source,name,xp),progress:{total:xp,approvedXp:Math.floor(xp/100)*100,reviewXp:xp%100,missions:Math.floor(xp/100)}};
}
function demoRoster(){
 return [
  demoHero('Aventureiro de teste','warrior',510,'demo-1'),
  demoHero('Arcanista de teste','mage',630,'demo-2'),
  demoHero('Caçador de teste','hunter',580,'demo-3'),
  demoHero('Guardião de teste','guardian',600,'demo-4'),
  demoHero('Sentinela de teste','warrior',460,'demo-5'),
  demoHero('Feiticeiro de teste','mage',550,'demo-6'),
  demoHero('Explorador de teste','hunter',520,'demo-7'),
  demoHero('Protetor de teste','guardian',480,'demo-8')
 ];
}
function current(){
 try{return C.canonical(state.build,state.hero.name,state.progress.total)}
 catch(e){throw new Error('Os pontos ultrapassam o nível atual. Reorganize a build. '+e.message)}
}
function draft(){
 const b=state.build;return {klass:b.klass,attributes:{...b.attributes},talents:{...b.talents},appearance:{...b.appearance}}
}
function update(what){
 if(!state.hero)return;
 try{const copy=draft();what(copy);const normalized=C.canonical(copy,state.hero.name,state.progress.total);
  state.build=normalized;render();previewHero();
 }catch(e){notice(e.message,true)}
}
function render(){
 if(!state.hero)return;
 const b=current(),cls=C.CLASS[b.klass],stats=C.derived(b);
 $('v5HeroName').textContent=state.hero.name;
 $('v5HeroSubtitle').textContent=cls.label+' · '+stats.special;
 $('v5Level').textContent='NÍVEL '+b.level;
 $('v5Xp').textContent=state.progress.total+' XP';
 $('v5XpFill').style.width=Math.min(100,((state.progress.total%100)/100)*100)+'%';
 $('v5XpBreakdown').textContent=state.progress.approvedXp+' XP das missões'+(state.progress.reviewXp?' + '+state.progress.reviewXp+' XP do playtest':'');
 $('v5Classes').innerHTML=Object.entries(C.CLASS).map(([k,c])=>
  '<button type="button" class="v5-class" data-class="'+k+'" aria-pressed="'+(k===b.klass)+'"><b>'+c.icon+'</b><span>'+esc(c.label)+'</span></button>').join('');
 $('v5Palette').value=b.appearance.palette;$('v5Helmet').value=String(b.appearance.helmet);
 $('v5Weapon').value=b.appearance.weapon;$('v5Cape').checked=b.appearance.cape;
 $('v5Points').textContent=b.remainingAttributes+' / '+C.budgets(b.xp).attributes+' livres';
 $('v5Stats').innerHTML=Object.entries(C.STATS).map(([k,t])=>'<div class="v5-stat"><span>'+t+'</span><div class="v5-stepper">'+
 '<button type="button" data-stat="'+k+'" data-delta="-1" aria-label="Diminuir '+t+'" '+(b.attributes[k]===0?'disabled':'')+'>−</button>'+
 '<b>'+b.attributes[k]+'</b><button type="button" data-stat="'+k+'" data-delta="1" aria-label="Aumentar '+t+'" '+(b.remainingAttributes===0?'disabled':'')+'>+</button></div></div>').join('');
 $('v5Derived').innerHTML=[['♥ Vida',stats.hp],['⚔ Ataque',stats.attack.toFixed(1)],['◈ Defesa',stats.defense.toFixed(1)],['➶ Velocidade',stats.speed.toFixed(1)],['✧ Crítico',Math.round(stats.crit*100)+'%'],['⌛ Especial',stats.cooldown.toFixed(1)+'s']].map(([a,z])=>'<div><span>'+a+'</span><br><strong>'+z+'</strong></div>').join('');
 $('v5TalentPoints').textContent=b.remainingTalents+' pontos disponíveis';
 const t=C.TALENTS[b.klass];
 $('v5Talents').innerHTML=t.map((n,i)=>{
  const rank=b.talents[n.id]||0,can=rank<n.max&&b.remainingTalents>0&&n.requires.every(x=>b.talents[x]>0);
  const req=n.requires.length&&!n.requires.every(x=>b.talents[x]>0);
  return '<button type="button" class="v5-talent" data-talent="'+n.id+'" aria-pressed="'+(rank>0)+'" '+(can?'':'disabled')+' title="'+esc(req?'Requer: '+n.requires.join(', '):n.desc)+'">'+
   '<span class="v5-talent-icon">'+['✦','✧','◈','⛨','◆','⚔'][i]+'</span><span><strong>'+esc(n.name)+'</strong><small>'+esc(n.desc)+(req?' · Bloqueado por pré-requisito':'')+'</small></span>'+
   '<span class="v5-talent-rank">'+rank+' / '+n.max+'</span></button>';
 }).join('');
 $('v5Save').textContent=state.preview?'✦ Salvar build de demonstração (neste navegador)':'✦ Salvar meu herói na turma';
 $('v5Save').disabled=state.teacher;
}
function showHero(){
 state.arena=false;$('v5Main').hidden=false;$('v5Battle').hidden=true;$('v5Back').hidden=true;
 $('v5Practice').hidden=false;
 if(state.stage){state.stage.pause();previewHero()}
 status(state.preview?'MODO DEMONSTRAÇÃO · SEM DADOS DA TURMA':state.teacher?'ARENA DO PROFESSOR':'HERÓI VINCULADO AO CADASTRO');
}
async function setup3D(){
 $('v5Practice').disabled=true;
 try{
  const module=await import('./arena-three.js?v=5a');
  const quality=(navigator.deviceMemory||4)<4?'low':'auto';
  state.stage=module.createStage($('v5Stage'),{quality,onEvent});
  $('v5Practice').disabled=false;
  previewHero();
  status(state.preview?'DEMONSTRAÇÃO · SIMULAÇÃO SEM NOTAS':'3D PRONTO · THREE.JS');
 }catch(e){
  $('v5Stage').innerHTML='<div class="v5-loader" style="font-size:23px;text-align:center;padding:25px">VISUALIZAÇÃO 3D INDISPONÍVEL<br><span>'+esc(e.message)+'</span></div>';
  notice('A renderização 3D não pôde iniciar. Você ainda pode montar a build; a batalha gráfica requer WebGL 2 e conexão para carregar Three.js.',true);
 }
}
function previewHero(){if(state.stage&&!state.arena&&state.hero){try{state.stage.preview(current())}catch(e){notice('Problema ao mostrar herói: '+e.message,true)}}}
function fakeReviewer(){if(!state.preview)return;const f=$('v5ReviewForm');$('v5Reviews').hidden=false;const peers=demoRoster().filter(x=>x.id!=='demo-1');$('v5Peer').innerHTML='<option value="">Escolha um colega de demonstração</option>'+peers.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join('');$('v5ReviewStatus').textContent='Avaliações em demonstração não dão XP real.'}
async function loadPeers(){
 if(state.teacher||state.preview)return;
 try{const r=await api('peers');$('v5Reviews').hidden=false;
  $('v5Peer').innerHTML='<option value="">Selecione o colega testado</option>'+r.peers.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join('')
 }catch(e){/* locked until stage 9, expected */}
}
function sound(type){
 if(!state.sound)return;
 try{
  const ctx=state.audio||new (window.AudioContext||window.webkitAudioContext)();
  state.audio=ctx;
  if(ctx.state==='suspended')ctx.resume();
  const osc=ctx.createOscillator(),gain=ctx.createGain(),freq=type==='special'?180:type==='end'?420:type==='knockout'?125:270;
  osc.type=type==='special'?'sawtooth':'triangle';osc.frequency.setValueAtTime(freq,ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(type==='special'?650:Math.max(40,freq*.6),ctx.currentTime+.18);
  gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.028,ctx.currentTime+.016);
  gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.24);
  osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.27)
 }catch{}
}
function onEvent(e){
 if(!state.arena)return;
 const log=$('v5BattleLog'),names=new Map(state.roster.map(x=>[String(x.id),x.name]));
 let message='';
 if(e.type==='special')message='✦ '+(names.get(String(e.hero))||'Herói')+' lançou '+(e.ability||'habilidade');
 if(e.type==='knockout')message='⚔ '+(names.get(String(e.target))||'Herói')+' foi eliminado por '+(e.by||'outro herói');
 if(e.type==='storm')message='☄ '+(names.get(String(e.target))||'Herói')+' caiu na tempestade';
 if(e.type==='end'){
  message='✶ A arena tem um campeão!';
  const win=state.stage?.simulation?.result().winner;
  $('v5Winner').hidden=false;
  const t=state.tournament;
  if(t?.phase==='heat'&&win&&!t.winners.some(x=>x.id===win.id)){
   const finalist=state.roster.find(x=>String(x.id)===String(win.id));
   if(finalist)t.winners.push(finalist);
  }
  const pending=Boolean(t?.phase==='heat');
  $('v5Winner').textContent=pending
    ?'⚔ CLASSIFICADO PARA A FINAL ⚔ · '+(win?.name||'Herói')+' · '+t.winners.length+' de '+t.heats.length+' chaves'
    :win?'✶ CAMPEÃO DA ARENA ✶ · '+win.name:'✦ FINAL DA BATALHA';
  $('v5StartBattle').textContent=pending?'▶ Próxima chave / final':'▶ Repetir batalha';
  $('v5StartBattle').disabled=false;
  $('v5PauseBattle').disabled=true;
 }
 if(message){const item=document.createElement('div');item.textContent=message;log.prepend(item);while(log.children.length>50)log.lastChild.remove()}
 if(['special','knockout','end'].includes(e.type))sound(e.type);
}
function paintBattle(){
 if(!state.arena||!state.stage?.simulation)return;
 const sim=state.stage.simulation;
 const rows=sim.fighters;const holder=$('v5Fighters');
 holder.innerHTML=rows.map(f=>'<div class="v5-fighter '+(!f.alive?'defeated':'')+'"><div><strong>'+esc(f.name)+'</strong><span>'+C.CLASS[f.build.klass].icon+' '+Math.ceil(f.hp)+' HP</span></div><div class="life"><span style="width:'+Math.max(0,100*f.hp/f.stats.hp).toFixed(1)+'%"></span></div></div>').join('');
 if(sim.finished&& !$('v5Winner').hidden===false){/* winner rendered in onEvent */ }
}
function arenaHeroes(){
 if(state.teacher)return state.roster;
 if(state.preview)return demoRoster();
 // Training enemies are fictional, not students. Current student's build is included.
 return [{id:state.hero.id,name:state.hero.name,build:current(),progress:state.progress},
  ...demoRoster().slice(1,7)];
}
function runRound(group,title){
 const seed=C.hash(group.map(x=>x.id).join('|')+'-v5');
 state.battle=state.stage.fighters(group,{seed});
 $('v5BattleTitle').textContent=title;
 $('v5Winner').hidden=true;$('v5BattleLog').replaceChildren();
 $('v5StartBattle').disabled=false;$('v5StartBattle').textContent='▶ Começar batalha';
 $('v5PauseBattle').disabled=false;$('v5PauseBattle').textContent='Ⅱ Pausar';
 paintBattle();
}
function openBattle(){
 if(!state.stage){notice('A arena Three.js ainda não está disponível neste dispositivo.',true);return}
 const members=arenaHeroes();
 if(members.length<2){notice('São necessários pelo menos dois heróis para a batalha final.',true);return}
 state.arena=true;state.roster=members;
 $('v5Main').hidden=false;$('v5Battle').hidden=false;$('v5Back').hidden=false;$('v5Practice').hidden=true;
 $('v5TheaterLabel').textContent='⚔ ARENA DOS CRIADORES · BATALHA AUTOMÁTICA';
 $('v5StageNote').textContent='Combate automático · câmera rotacionável · mapa com colisões';
 if(members.length>20){
  const heats=[];
  for(let i=0;i<members.length;i+=16)heats.push(members.slice(i,i+16));
  state.tournament={heats,winners:[],phase:'heat',index:0};
  runRound(heats[0],'Classificatória 1 / '+heats.length+' · '+heats[0].length+' heróis');
 }else{
  state.tournament=null;
  runRound(members,state.teacher?'Grande final · '+members.length+' alunos':'Treino · '+members.length+' personagens');
 }
 $('v5Battle').scrollIntoView({behavior:'smooth',block:'nearest'});
 if(state.heartbeat)clearInterval(state.heartbeat);
 state.heartbeat=setInterval(paintBattle,350);
}
function nextRound(){
 const t=state.tournament;
 if(!t||t.phase!=='heat'){openBattle();return}
 if(t.index<t.heats.length-1){
  t.index++;
  runRound(t.heats[t.index],'Classificatória '+(t.index+1)+' / '+t.heats.length+' · '+t.heats[t.index].length+' heróis');
  return;
 }
 t.phase='final';
 if(t.winners.length<=1){
  $('v5Winner').textContent='✶ CAMPEÃO DA ARENA ✶ · '+(t.winners[0]?.name||'Sem vencedor');
  $('v5StartBattle').textContent='▶ Repetir torneio';
  return;
 }
 runRound(t.winners,'GRANDE FINAL · '+t.winners.length+' vencedores das chaves');
}
function createTeacherView(roster){
 state.roster=roster;const first=roster[0];
 state.hero=first?{id:first.id,name:first.name}:{id:'none',name:'Nenhum aluno inscrito'};
 state.progress=first?.progress||C.exp();
 state.build=first?.build||C.canonical(C.seedBuild('Nenhum aluno inscrito'), 'Nenhum aluno inscrito',0);
 $('v5Main').hidden=false;
 document.querySelectorAll('.v5-identity, .v5-build').forEach(x=>x.hidden=true);
 $('v5Main').classList.add('v5-teacher');
 $('v5Save').disabled=true;$('v5Practice').textContent='⚔ Abrir batalha final da turma';
 render();setup3D();
 notice(roster.length+' heróis autenticados carregados. O professor apenas projeta; XP e builds pertencem aos alunos.');
}
async function init(){
 $('v5DemoLink').href='./index.html?preview=1';
 if(state.preview){
  state.authenticated=false;
  state.roster=demoRoster();
  state.hero={id:'demo-1',name:'Aventureiro de demonstração'};
  state.progress=state.roster[0].progress;
  const saved=(()=>{try{return JSON.parse(localStorage.getItem('pit_v5_demo_build')||'null')}catch{return null}})();
  try{state.build=C.canonical(saved||state.roster[0].build,state.hero.name,state.progress.total)}
  catch{state.build=C.canonical(C.seedBuild(state.hero.name),state.hero.name,state.progress.total)}
  $('v5Auth').hidden=true;$('v5Main').hidden=false;
  status('PRÉVIA V5 · PERSONAGENS FICTÍCIOS');render();setup3D();
  fakeReviewer();
  if(state.teacher){document.querySelectorAll('.v5-identity,.v5-build').forEach(x=>x.hidden=true);$('v5Main').classList.add('v5-teacher');$('v5Practice').textContent='⚔ Abrir batalha final demonstrativa'}
  return;
 }
 if(state.teacher){
  try{
   const r=await api('roster');$('v5Auth').hidden=true;createTeacherView(r.heroes||[]);
   status('PROFESSOR AUTENTICADO · '+r.heroes.length+' AVENTUREIROS');
  }catch(e){$('v5Auth').innerHTML='<strong>O Mission Control precisa estar autenticado.</strong><p>'+esc(e.message)+'</p><a class="v5-link-button" href="../professor-v3.html">Abrir Mission Control</a><a class="v5-ghost-link" href="./index.html?preview=1&mode=teacher">Testar arena com personagens fictícios</a>';status('PROFESSOR · ACESSO RESTRITO')}
  return;
 }
 state.session=session();
 if(!state.session){$('v5Auth').innerHTML='<strong>Entre no Caderno do Aluno primeiro.</strong><p>Seu herói receberá exatamente o nome cadastrado na turma e XP das missões aprovadas.</p><a href="../aluno-v3.html" class="v5-link-button">Entrar na turma</a><a class="v5-ghost-link" href="./index.html?preview=1">Testar V5 com personagem fictício</a>';status('CADASTRO NECESSÁRIO');return}
 try{
  const r=await api('me');
  state.hero=r.hero;state.progress=r.hero.progress;state.build=r.hero.build;state.authenticated=true;
  $('v5Auth').hidden=true;$('v5Main').hidden=false;render();setup3D();
  status('HERÓI AUTENTICADO · '+state.hero.name);
  if(r.review){$('v5Reviews').hidden=false;$('v5ReviewForm').hidden=true;$('v5ReviewStatus').textContent='Avaliação já enviada. Obrigado pelo playtest.'}
  else if(r.reviewUnlocked)loadPeers();
 }catch(e){$('v5Auth').innerHTML='<strong>Seu cadastro não pôde ser validado.</strong><p>'+esc(e.message)+'</p><a href="../aluno-v3.html" class="v5-link-button">Voltar ao Caderno do Aluno</a><a class="v5-ghost-link" href="./index.html?preview=1">Explorar modo de demonstração</a>';status('V5 AINDA NÃO DISPONÍVEL NA TURMA')}
}
document.addEventListener('click',async e=>{
 const klass=e.target.closest('[data-class]');if(klass){update(b=>{b.klass=klass.dataset.class;b.talents={};b.appearance.weapon={warrior:'blade',mage:'staff',hunter:'bow',guardian:'axe'}[b.klass]});return}
 const step=e.target.closest('[data-stat]');if(step){update(b=>{const k=step.dataset.stat;b.attributes[k]=Math.max(0,(b.attributes[k]||0)+Number(step.dataset.delta))});return}
 const talent=e.target.closest('[data-talent]');if(talent){update(b=>{b.talents[talent.dataset.talent]=(b.talents[talent.dataset.talent]||0)+1});return}
});
for(const [id,key] of [['v5Palette','palette'],['v5Weapon','weapon'],['v5Helmet','helmet'],['v5Cape','cape']]){
 $(id).addEventListener('change',e=>update(b=>{b.appearance[key]=id==='v5Helmet'?Number(e.target.value):id==='v5Cape'?e.target.checked:e.target.value}));
}
$('v5Reset').onclick=()=>update(b=>{b.attributes={power:0,agility:0,spirit:0,vitality:0};b.talents={}});
$('v5Save').onclick=async()=>{
 if(!state.hero||state.teacher)return;
 const btn=$('v5Save');btn.disabled=true;
 try{
  const b=current();
  if(state.preview){localStorage.setItem('pit_v5_demo_build',JSON.stringify(draft()));notice('Build de demonstração guardada apenas neste navegador. Não altera XP da turma.')}
  else{const r=await api('build','POST',{build:draft()});state.hero=r.hero;state.progress=r.hero.progress;state.build=r.hero.build;render();notice('Herói salvo na turma! XP e nome continuam validados no servidor.')}
 }catch(e){notice(e.message,true)}finally{btn.disabled=false}
};
$('v5Practice').onclick=()=>openBattle();
$('v5Back').onclick=()=>{
 if(state.heartbeat){clearInterval(state.heartbeat);state.heartbeat=null}
 if(state.stage)state.stage.pause();
 state.arena=false;
 $('v5TheaterLabel').textContent='✦ FORJA / CÂMARA DO HERÓI';
 $('v5StageNote').textContent='Arraste para girar a câmera · role para aproximar';
 showHero();
};
$('v5StartBattle').onclick=()=>{if(!state.stage?.simulation)return;
 if(state.stage.simulation.finished){nextRound();if(state.stage?.simulation?.finished)return}
 state.stage.resume();$('v5StartBattle').disabled=true;$('v5PauseBattle').disabled=false};
$('v5PauseBattle').onclick=()=>{
 if(!state.stage)return;if(state.stage.playing){state.stage.pause();$('v5PauseBattle').textContent='▶ Continuar';$('v5StartBattle').disabled=false}
 else {state.stage.resume();$('v5PauseBattle').textContent='Ⅱ Pausar';$('v5StartBattle').disabled=true}
};
let rate=1;$('v5Speed').onclick=()=>{rate=rate===1?1.5:rate===1.5?2:rate===2?3:1;if(state.stage)state.stage.setSpeed(rate);$('v5Speed').textContent='Velocidade ×'+rate};
$('v5Sound').onclick=()=>{state.sound=!state.sound;$('v5Sound').setAttribute('aria-pressed',String(state.sound));$('v5Sound').textContent=state.sound?'♫ Som ativado':'♫ Ativar efeitos sonoros';if(state.sound)sound('special');else state.audio?.suspend()};
$('v5ReviewForm').onsubmit=async e=>{
 e.preventDefault();const targetId=$('v5Peer').value,score=Number($('v5ReviewScore').value),comment=$('v5ReviewComment').value.trim();
 if(!targetId||!Number.isInteger(score)||score<0||score>10||comment.length<15){notice('Selecione o colega, dê nota inteira de 0 a 10 e escreva uma observação com pelo menos 15 caracteres.',true);return}
 if(state.preview){$('v5ReviewStatus').textContent='Nota fictícia registrada na demonstração. Nenhum XP real foi concedido.';$('v5ReviewForm').hidden=true;return}
 try{await api('review','POST',{targetId,score,comment});$('v5ReviewStatus').textContent='Playtest enviado. O colega pode receber até 30 XP bônus; o professor pode moderar.';$('v5ReviewForm').hidden=true;notice('Sua avaliação foi registrada.');
 }catch(err){notice(err.message,true)}
};
window.addEventListener('pagehide',()=>{state.stage?.dispose();if(state.heartbeat)clearInterval(state.heartbeat);state.audio?.close()},{once:true});
window.PIT_V5_APP={state,init,render,openBattle,demoRoster};
init();
})();
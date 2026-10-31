/* H.1c | Standalone, in-memory educational mock.
 * NO fetch, credentials, localStorage, production stage updates, XP writes
 * or real invitations. All mechanics here are demonstrations, not authority.
 */
(()=>{
 'use strict';
 const catalog=window.PIT_V5_PHASE2?.TALENTS;
 const classes=[
  {id:'warrior',name:'Guerreiro',icon:'⚔',hint:'Coragem e dano direto'},
  {id:'mage',name:'Arcanista',icon:'✦',hint:'Magias e controle'},
  {id:'hunter',name:'Caçador',icon:'➶',hint:'Precisão a distância'},
  {id:'guardian',name:'Guardião',icon:'◆',hint:'Defesa e proteção'}
 ];
 const attributes=[
  {id:'FOR',name:'Força',hint:'Impacto e ataque'},
  {id:'DES',name:'Destreza',hint:'Movimento e precisão'},
  {id:'INT',name:'Intelecto',hint:'Poder de habilidades'},
  {id:'VIT',name:'Vitalidade',hint:'Sobrevivência'},
  {id:'DEF',name:'Defesa',hint:'Proteção e resistência'}
 ];
 if(!catalog||classes.some(c=>catalog[c.id]?.length!==30)){
  document.querySelector('#feedback').textContent='Catálogo de 120 talentos indisponível. Recarregue a prévia.';
  return;
 }
 const get=id=>document.getElementById(id);
 const empty=()=>Object.fromEntries(attributes.map(a=>[a.id,0]));
 function init(){
  return {approved:3,klass:'warrior',revision:0,build:{attributes:empty(),talents:[]},
   saved:null,m5Frozen:null,m10Frozen:null,duelOptIn:false};
 }
 let state=init();
 const clone=o=>structuredClone(o);
 function budget(){return {points:state.approved*2,talents:state.approved}}
 function used(){return Object.values(state.build.attributes).reduce((sum,n)=>sum+n,0)}
 function remains(){const b=budget();return {points:b.points-used(),talents:b.talents-state.build.talents.length}}
 function message(text,kind='info'){const node=get('feedback');node.textContent=text;node.dataset.kind=kind}
 function exact(a,b){return JSON.stringify(a)===JSON.stringify(b)}
 function valid(){
  const left=remains();
  if(left.points<0||left.talents<0)throw Error('Pontos ou talentos excederam o limite.');
  if(state.build.talents.some(id=>!catalog[state.klass].some(x=>x.id===id)))
   throw Error('Habilidade de classe incorreta.');
  if(state.m5Frozen){
   for(const attr of attributes){
    if(state.build.attributes[attr.id]<state.m5Frozen.attributes[attr.id])
     throw Error('Atributos congelados da missão 5 não podem ser removidos.');
   }
   if(state.m5Frozen.talents.some(t=>!state.build.talents.includes(t)))
    throw Error('Talentos da missão 5 não podem ser removidos.');
  }
  if(state.m10Frozen&&!exact(state.build,state.m10Frozen))
   throw Error('Build final bloqueada depois da missão 10.');
 }
 function savedMatches(){return state.saved&&exact(state.saved,state.build)}
 function save(){
  try{
   valid();
   if(state.m10Frozen)throw Error('A build final já está bloqueada.');
   if(savedMatches()){message('Esta build já está salva na demonstração.','success');return}
   state.revision++;state.saved=clone(state.build);
   message('Build salva apenas na memória desta prévia. Revisão fictícia '+state.revision+'.','success');
   render();
  }catch(e){message(e.message,'error')}
 }
 function advance(){
  if(state.approved===10){message('Você já chegou à missão 10 na simulação.','info');return}
  if(state.approved===5&&!state.m5Frozen){
   message('Antes de avançar, distribua todos os pontos e registre a primeira entrada na Arena M5.','error');return;
  }
  if(!savedMatches()){
   message('Salve suas escolhas antes de simular a aprovação da próxima missão.','error');return
  }
  state.approved++;
  message('O professor aprovou a missão '+state.approved+' na simulação. Você recebeu mais 2 pontos e 1 talento.','success');
  render();
 }
 function freezeM5(){
  if(state.approved!==5){message('A Arena M5 exige cinco missões aprovadas.','error');return}
  if(state.m5Frozen){message('Entrada M5 já registrada.','success');return}
  if(!savedMatches()||remains().points!==0||remains().talents!==0){
   message('Salve a build completa (10 pontos e 5 talentos) antes da M5.','error');return
  }
  state.m5Frozen=clone(state.build);state.revision++;
  message('Primeira entrada M5 registrada nesta simulação. As escolhas atuais estão congeladas.','success');
  render();
 }
 function freezeM10(){
  if(state.approved!==10||!state.m5Frozen){message('A final exige dez aprovações e entrada anterior na M5.','error');return}
  if(state.m10Frozen){message('Final M10 já travada.','success');return}
  if(!savedMatches()||remains().points!==0||remains().talents!==0){
   message('Salve a build completa (20 pontos e 10 talentos) antes da M10.','error');return
  }
  state.m10Frozen=clone(state.build);state.revision++;
  message('Build da M10 travada definitivamente nesta simulação.','success');
  render();
 }
 function changeClass(id){
  if(state.saved||state.m5Frozen){message('A classe fica fixa depois do primeiro salvamento. Reinicie para experimentar outra.','error');return}
  if(!catalog[id])return;
  state.klass=id;state.build={attributes:empty(),talents:[]};
  message('Classe alterada. Escolha atributos e talentos da nova classe.');
  render();
 }
 function changeAttr(id,delta){
  if(!attributes.some(x=>x.id===id)||state.m10Frozen)return;
  const curr=state.build.attributes[id];
  if(delta>0&&remains().points<=0)return;
  if(delta<0&&(curr<=0||curr<=(state.m5Frozen?.attributes[id]||0)))return;
  state.build.attributes[id]=curr+delta;
  render();
 }
 function toggleTalent(id){
  if(state.m10Frozen||!catalog[state.klass].some(t=>t.id===id))return;
  const idx=state.build.talents.indexOf(id);
  if(idx>=0){
   if(state.m5Frozen?.talents.includes(id))return;
   state.build.talents.splice(idx,1);
  }else{
   if(remains().talents<=0)return;
   state.build.talents.push(id);
  }
  render();
 }
 function render(){
  const remaining=remains(),current=classes.find(c=>c.id===state.klass);
  get('missionNumber').textContent=state.approved+' de 10';
  get('pointsLeft').textContent=remaining.points;
  get('talentsLeft').textContent=remaining.talents;
  get('revision').textContent=state.revision;
  get('classGrid').innerHTML=classes.map(c=>
   '<button class="class-option" data-action="class" data-id="'+c.id+'" type="button" aria-pressed="'+(c.id===state.klass)+'" '+(state.saved&&c.id!==state.klass?'disabled':'')+'>'+
   '<span class="class-icon" aria-hidden="true">'+c.icon+'</span><span><strong>'+c.name+'</strong><small>'+c.hint+'</small></span></button>'
  ).join('');
  get('attributes').innerHTML=attributes.map(a=>{
   const locked=state.m5Frozen?.attributes[a.id]||0;
   return '<div class="attribute"><div class="attr-name">'+a.name+'<small>'+a.hint+(locked?' · M5: '+locked+' fixos':'')+'</small></div>'+
    '<div class="attribute-controls"><button type="button" class="square-button" data-action="minus" data-id="'+a.id+'" aria-label="Diminuir '+a.name+'" '+(state.m10Frozen||state.build.attributes[a.id]<=locked?'disabled':'')+'>−</button>'+
    '<strong>'+state.build.attributes[a.id]+'</strong><button type="button" class="square-button" data-action="plus" data-id="'+a.id+'" aria-label="Aumentar '+a.name+'" '+(state.m10Frozen||remaining.points<=0?'disabled':'')+'>+</button></div></div>';
  }).join('');
  get('talents').innerHTML=catalog[state.klass].map(t=>{
   const active=state.build.talents.includes(t.id);
   const locked=state.m5Frozen?.talents.includes(t.id);
   const disabled=state.m10Frozen||(!active&&remaining.talents<=0)||(locked&&active);
   return '<button type="button" class="talent" data-action="talent" data-id="'+t.id+'" aria-pressed="'+active+'" '+(disabled?'disabled':'')+'><strong>'+t.name+'</strong><small>'+t.id+' · '+t.type+(locked?' · M5':'')+'</small></button>';
  }).join('');
  get('progressInfo').innerHTML=
   '<div class="progress-line"><span>Classe</span><strong>'+current.name+'</strong></div>'+
   '<div class="progress-line"><span>XP-base demonstrativo</span><strong>'+state.approved*100+'</strong></div>'+
   '<div class="progress-line"><span>Missão 5</span><strong>'+(state.m5Frozen?'TRAVADA':'AGUARDANDO')+'</strong></div>'+
   '<div class="progress-line"><span>Missão 10</span><strong>'+(state.m10Frozen?'TRAVADA':'AGUARDANDO')+'</strong></div>'+
   '<div class="progress-line"><span>Alterações pendentes</span><strong>'+(!savedMatches()?'SIM':'NÃO')+'</strong></div>';
  get('saveBuild').disabled=!!state.m10Frozen;
  get('advance').disabled=state.approved===10;
  get('freezeM5').disabled=state.approved!==5||!!state.m5Frozen;
  get('lockM10').disabled=state.approved!==10||!!state.m10Frozen;
  get('duelOptIn').checked=state.duelOptIn;
  get('duelStatus').textContent=state.duelOptIn
   ? 'Disponível apenas na simulação. Convites reais serão implementados em outra fase.'
   : 'Ative para simular a disponibilidade. Nenhum convite é enviado.';
 }
 document.body.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');if(!button)return;
  const id=button.dataset.id,action=button.dataset.action;
  if(action==='class')changeClass(id);
  if(action==='plus')changeAttr(id,1);
  if(action==='minus')changeAttr(id,-1);
  if(action==='talent')toggleTalent(id);
 });
 get('saveBuild').addEventListener('click',save);
 get('advance').addEventListener('click',advance);
 get('freezeM5').addEventListener('click',freezeM5);
 get('lockM10').addEventListener('click',freezeM10);
 get('reset').addEventListener('click',()=>{state=init();message('Demonstração reiniciada. Nenhum dado foi enviado ou persistido.');render()});
 get('duelOptIn').addEventListener('change',event=>{
  state.duelOptIn=event.target.checked;render();
 });
 // Immutable snapshot exposed to browser QA; never contains student identities.
 Object.defineProperty(window,'PIT_V5_H1C_LAB',{
  value:Object.freeze({get snapshot(){return clone(state)},get remaining(){return remains()}}),
  configurable:false,writable:false
 });
 render();
})();

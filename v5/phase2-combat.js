/* V5 Phase B.6 — executable M5 sandbox, all 120 approved talents.
 * Isolated from legacy V5 and student/server state. No XP or grading writes.
 * UMD: Node test runner and same browser GLB rendering pipeline.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PIT_V5_PHASE2=api})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const VERSION='phase2-m5-trial-v1'; // Preserve demo save schema; B.3 expands catalog selections.
const ATTR=['FOR','DES','INT','VIT','DEF'];
const CLASSES={
 warrior:{name:'Guerreiro',hp:137,atk:16.5,def:6.5,speed:4.5,range:2.6,palette:'ember'},
 mage:{name:'Arcanista',hp:78,atk:13.4,def:2.5,speed:3.7,range:8.5,palette:'amethyst'},
 hunter:{name:'Caçador',hp:93,atk:13,def:3.5,speed:4.4,range:9.3,palette:'jade'},
 guardian:{name:'Guardião',hp:140,atk:13.1,def:9,speed:3.9,range:2.6,palette:'azure'}
};
const TALENTS={
 warrior:[['B01','Golpe do Carrasco','ativo','FOR','DES',8],['B02','Sangue Quente','passivo','FOR','VIT',10],['B03','Fenda Sísmica','ativo','FOR','DEF',14],['B04','Ímpeto Predador','passivo','DES','FOR',12],['B05','Rugido da Ruína','ativo','VIT','FOR',18],['B06','Sede de Batalha','reativo','VIT','FOR',5],['B07','Golpe de Exaustão','ativo','FOR','DES',12],['B08','Ira Contida','passivo','VIT','INT',0],['B09','Ruptura Brutal','ativo','FOR','DEF',20],['B10','Última Investida','reativo','FOR','VIT',0],['D01','Corte Relâmpago','ativo','DES','FOR',6],['D02','Passo Lateral','reativo','DES','DEF',14],['D03','Lâmina Reversa','ativo','DES','INT',9],['D04','Cadência da Guerra','passivo','DES','FOR',8],['D05','Ponta Precisa','ativo','DES','FOR',12],['D06','Reflexo Treinado','passivo','DES','DEF',11],['D07','Finta do Escorpião','ativo','DES','INT',16],['D08','Jogo de Pés','passivo','DES','VIT',0],['D09','Contra-Medida','reativo','DES','DEF',15],['D10','Dança das Lâminas','ativo','DES','FOR',23],['T01','Guarda Alta','ativo','DEF','VIT',12],['T02','Pele de Ferro','passivo','DEF','VIT',0],['T03','Rebote de Aço','reativo','DEF','FOR',14],['T04','Postura de Muralha','ativo','DEF','VIT',18],['T05','Brado Protetor','ativo','VIT','INT',20],['T06','Vontade Inabalável','reativo','VIT','DEF',15],['T07','Arma Blindada','passivo','DEF','FOR',10],['T08','Retaliação Precisa','ativo','DEF','DES',13],['T09','Sangue Frio','passivo','INT','VIT',15],['T10','Juramento de Ferro','ativo','DEF','VIT',28]],
 mage:[['E01','Lança de Cinzas','ativo','INT','DES',9],['E02','Combustão Residual','passivo','INT','VIT',10],['E03','Prisão de Gelo','ativo','INT','DEF',17],['E04','Estilhaço Polar','ativo','INT','DES',11],['E05','Pele Vulcânica','reativo','VIT','INT',18],['E06','Tempestade Estática','ativo','INT','DES',21],['E07','Olho da Tormenta','passivo','DES','INT',12],['E08','Névoa de Inverno','reativo','DEF','INT',19],['E09','Núcleo Incandescente','passivo','VIT','INT',0],['E10','Cometa Carmesim','ativo','INT','VIT',25],['R01','Selo de Proteção','ativo','DEF','INT',13],['R02','Inscrição Dolorosa','passivo','INT','DEF',10],['R03','Runa da Repulsão','ativo','INT','DES',18],['R04','Mente Blindada','passivo','DEF','VIT',12],['R05','Corte de Mana','ativo','INT','FOR',15],['R06','Reflexo Prismático','reativo','DEF','INT',20],['R07','Tecelagem de Runas','passivo','INT','VIT',15],['R08','Marca Desarmônica','ativo','INT','DEF',22],['R09','Última Equação','reativo','VIT','DEF',0],['R10','Grande Mandala','ativo','INT','DEF',27],['A01','Pulso Estelar','ativo','INT','DES',8],['A02','Passagem Etérea','ativo','DES','INT',19],['A03','Órbita Protetora','passivo','DEF','INT',14],['A04','Gravidade Menor','ativo','INT','DEF',17],['A05','Eco Astral','passivo','INT','DES',13],['A06','Escudo de Fase','reativo','DES','DEF',21],['A07','Foco Celeste','passivo','INT','VIT',11],['A08','Arco de Horizonte','ativo','INT','DES',16],['A09','Véu de Retirada','reativo','VIT','DES',0],['A10','Supernova Silenciosa','ativo','INT','VIT',30]],
 hunter:[['P01','Flecha Perfurante','ativo','DES','FOR',10],['P02','Mira Firme','passivo','DES','INT',10],['P03','Tiro Duplo','ativo','DES','FOR',8],['P04','Olhar Predador','passivo','DES','INT',12],['P05','Flecha Marcadora','ativo','DES','INT',15],['P06','Disparo de Ruptura','ativo','FOR','DES',19],['P07','Pulsação da Corda','passivo','DES','FOR',10],['P08','Olho do Caçador','reativo','DES','DEF',18],['P09','Tiro de Interrupção','reativo','DES','INT',21],['P10','Chuva de Setas','ativo','DES','VIT',25],['E01','Armadilha de Espinhos','ativo','INT','DES',17],['E02','Passo de Sombra','ativo','DES','VIT',18],['E03','Venenos de Caça','passivo','INT','DES',12],['E04','Isca do Deserto','ativo','INT','VIT',20],['E05','Corda de Aprisionamento','ativo','DES','INT',15],['E06','Camuflagem das Folhas','reativo','DES','DEF',19],['E07','Predador Invisível','passivo','DES','INT',14],['E08','Armadilha Reflexa','reativo','DEF','INT',0],['E09','Rede Preparada','passivo','INT','DEF',0],['E10','Mina de Estilhaços','ativo','INT','FOR',25],['S01','Rolamento Tático','ativo','DES','VIT',16],['S02','Respiração do Bosque','passivo','VIT','DEF',15],['S03','Flecha de Retirada','ativo','DES','FOR',12],['S04','Vigilância da Floresta','passivo','DEF','INT',14],['S05','Tiro Enfraquecedor','ativo','DES','INT',18],['S06','Garra do Sobrevivente','reativo','VIT','DEF',0],['S07','Instinto de Fuga','passivo','DES','VIT',0],['S08','Salto da Corça','ativo','DES','DEF',20],['S09','Guarda de Último Fôlego','reativo','DEF','VIT',22],['S10','Trilha de Armadilhas','ativo','INT','DEF',28]],
 guardian:[['G01','Escudo da Alvorada','ativo','DEF','VIT',14],['G02','Armadura Consagrada','passivo','DEF','VIT',12],['G03','Retorno da Égide','reativo','DEF','FOR',18],['G04','Postura da Cidadela','ativo','DEF','VIT',20],['G05','Aço Resiliente','passivo','VIT','DEF',16],['G06','Rota de Guarda','ativo','DEF','DES',17],['G07','Reflexo da Sentinela','reativo','DES','DEF',15],['G08','Peso da Armadura','passivo','DEF','FOR',10],['G09','Vigília de Pedra','ativo','VIT','DEF',24],['G10','Bastião Solar','ativo','DEF','INT',28],['L01','Bênção da Aurora','ativo','INT','VIT',19],['L02','Luz Persistente','passivo','INT','VIT',12],['L03','Fagulha Reparadora','passivo','VIT','INT',15],['L04','Clarão Purificador','ativo','INT','DEF',16],['L05','Voto da Luz','ativo','INT','DEF',15],['L06','Resplendor de Esperança','reativo','VIT','INT',0],['L07','Sopro da Graça','passivo','INT','DES',13],['L08','Julgamento Luminoso','ativo','INT','FOR',18],['L09','Orvalho de Misericórdia','reativo','INT','VIT',22],['L10','Círculo de Santuário','ativo','INT','DEF',26],['J01','Golpe do Veredito','ativo','FOR','INT',11],['J02','Vontade do Justo','passivo','FOR','VIT',10],['J03','Investida do Tribunal','ativo','FOR','DES',18],['J04','Marca do Veredito','ativo','INT','FOR',15],['J05','Coração Corajoso','passivo','VIT','FOR',0],['J06','Resposta Implacável','reativo','DEF','FOR',18],['J07','Justiça Cintilante','ativo','INT','DES',20],['J08','Inspiração da Lâmina','passivo','FOR','INT',14],['J09','Fé Inflexível','reativo','VIT','DEF',0],['J10','Martelo do Amanhecer','ativo','FOR','INT',27]]
};
const ALL=Object.fromEntries(Object.entries(TALENTS).map(([klass,items])=>[klass,items.map(([id,name,type,primary,secondary,cooldown])=>Object.freeze({id,name,type,primary,secondary,cooldown,animationId:klass.toLowerCase()+'_'+id.toLowerCase()}))]));
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const rng=seed=>{let s=(seed>>>0)||1;return ()=>{s+=0x6d2b79f5;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}};
function canonical(input,approvedMissions=5){
 if(!input||typeof input!=='object')throw Error('Build obrigatória');
 const klass=input.klass;if(!CLASSES[klass])throw Error('Classe inválida');
 if(!Number.isInteger(approvedMissions)||approvedMissions<0||approvedMissions>5)throw Error('Fase B.1 executa no máximo cinco missões aprovadas');
 const attributes={};let spent=0;
 for(const k of ATTR){
  const val=input.attributes?.[k]??0;
  if(!Number.isInteger(val)||val<0||val>12)throw Error('Investimento inválido em '+k);
  attributes[k]=val;spent+=val;
 }
 if(spent>approvedMissions*2)throw Error('Atributos acima do orçamento autorizado');
 if(input.attributes&&Object.keys(input.attributes).some(k=>!ATTR.includes(k)))throw Error('Atributo desconhecido');
 const picks=input.talents??[];
 if(!Array.isArray(picks)||picks.length>approvedMissions)throw Error('Excesso de talentos selecionados');
 if(new Set(picks).size!==picks.length)throw Error('Talento duplicado');
 const valid=new Set(ALL[klass].map(t=>t.id));
 if(picks.some(p=>!valid.has(p)))throw Error('Talento ainda não implementado ou de outra classe');
 return {schema:VERSION,klass,attributes,talents:[...picks],approvedMissions,
  name:String(input.name||'Aventureiro').slice(0,56),
  appearance:{palette:CLASSES[klass].palette,weapon:{warrior:'axe',mage:'staff',hunter:'bow',guardian:'blade'}[klass],helmet:1,cape:true}};
}
function exampleBuild(klass,name,mission=5,variant=0){
 const selections={warrior:{FOR:5,DES:3,VIT:2},mage:{INT:6,DES:2,DEF:2},hunter:{DES:6,FOR:2,INT:2},guardian:{DEF:6,VIT:3,FOR:1}};
 const pointPool=mission*2, attributes=Object.fromEntries(ATTR.map(k=>[k,0]));
 let left=pointPool;
 for(const [k,v]of Object.entries(selections[klass]||{})){const n=Math.min(left,v);attributes[k]=n;left-=n}
 const variants=[[0,1,2,3,4],[5,6,7,8,9],[0,2,5,7,9],[10,11,12,13,14],[0,6,10,12,14],[15,16,17,18,19],[0,6,11,16,19],[20,21,22,23,24],[0,11,20,22,24],[25,26,27,28,29],[0,12,21,25,29]];
 const picks=variants[((variant%variants.length)+variants.length)%variants.length].slice(0,mission).map(i=>ALL[klass][i].id);
 return canonical({klass,name,attributes,talents:picks},mission);
}
function effectiveness(f,id){
 const t=ALL[f.build.klass].find(t=>t.id===id);
 return Math.min(1.2,.75+.025*f.build.attributes[t.primary]+.0125*f.build.attributes[t.secondary]);
}
function battle(entries,{seed=4252,limit=95,arenaScale=1,damageScale=1,mageDamageBonus=1,stormDelay=18,stormRateFactor=1,engagementMode='free',navigationMode='direct',rangedCommitment='none'}={}){
 const spreadAggro=engagementMode==='spaced';
 // Experimental E navigation: legacy direct movement remains the default.
 const obstacleSteering=navigationMode==='steer';
 // Experimental Fase E: ranged attacks trade continuous kiting for a recoverable firing window.
 const rangedRecovery=rangedCommitment==='recovery';
 const pace=Math.max(.45,Math.min(1,Number(damageScale)||1));
 const mageBonus=Math.max(1,Math.min(1.20,Number(mageDamageBonus)||1));
 const stormStart=clamp(Number(stormDelay)||18,18,50);
 const shrinkFactor=clamp(Number(stormRateFactor)||1,.4,1);
 if(!Array.isArray(entries)||entries.length<2||entries.length>30)throw Error('Arena experimental aceita 2 a 30 heróis');
 const r=rng(seed),scale=clamp(arenaScale,1,5),used=new Set(),events=[],projectiles=[];
 let time=0,sequence=0,finished=false,winner=null,pid=0;
 const pending=[],zones=[];
 const emit=(type,f,extra={})=>{const e={type,hero:f?.id||null,time:+time.toFixed(2),seq:++sequence,...extra};events.push(e);return e};
 const obstacles=[{x:0,z:0,r:1.7},{x:5.5,z:-5.5,r:1.5},{x:-5.5,z:5.5,r:1.5},{x:5.7,z:5.7,r:1.2},{x:-5.7,z:-5.7,r:1.2}].map(o=>({x:o.x*scale,z:o.z*scale,r:o.r*scale}));
 const fighters=entries.map((entry,i)=>{
  const build=canonical(entry.build||entry,entry.approvedMissions??entry.build?.approvedMissions??5);
  const id=String(entry.id||'trial-'+i);
  if(used.has(id))throw Error('IDs duplicados');used.add(id);
  const base=CLASSES[build.klass],a=build.attributes;
  const hp=base.hp+a.VIT*6+a.DEF*1.5;
  const theta=i*2.399963+r()*Math.PI*.13;
  const spawnFactor=entries.length<=4?Math.min(scale,2.2):scale;
  const rad=(5+Math.sqrt(i)*1.4)*spawnFactor;
  return {id,name:build.name,build,stats:{hp,attack:base.atk+(build.klass==='mage'?a.INT*.8:build.klass==='guardian'?a.FOR*.38+a.INT*.20:a.FOR*.60+a.DES*.22),defense:base.def+a.DEF*.70,speed:base.speed+a.DES*.10,range:base.range,crit:Math.min(.2,.03+a.DES*.006)},
   x:Math.cos(theta)*rad,z:Math.sin(theta)*rad,y:0,vx:0,vz:0,face:theta,animation:'idle',
   hp,shield:0,shieldUntil:0,alive:true,kills:0,damage:0,attacks:0,
   basic:r()*.45,gcd:0,cooldowns:{},usage:{},passives:{},slow:0,slowPower:0,
   weak:0,weakPower:0,fortress:0,markBy:null,markUntil:0,offenseDelay:0,rage:0,solarUntil:0,
   regenUntil:0,regenPower:0,s02Until:0,s02Power:0,lightRegenUntil:0,lightRegenPower:0,runicRegenUntil:0,runicRegenPower:0,hopeRegenUntil:0,hopeRegenPower:0,mercyRegenUntil:0,mercyRegenPower:0,
   guardUntil:0,t09Until:0,t09Power:0,t10Until:0,a09Until:0,healWindow:[],poisonUntil:0,poisonPower:0,poisonOwner:null,
   reverseUntil:0,t04Until:0,s01Until:0,a03Travel:0,a03LastX:null,a03LastZ:null,a02BoostUntil:0,r04Until:0,d04Charge:0,speedUntil:0,d06Until:0,d07WeakUntil:0,d07WeakPower:0,r08Until:0,r08Power:0,
   burning:0,burnPower:0,burnOwner:null,movingTime:0,stationaryTime:0,lastTarget:null,
   navObstacle:-1,navSide:0,navActive:false,navTurns:0,shotRecovery:0,
   lastHitAt:-999,hitWindow:[],prevX:null,prevZ:null,eliminatedAt:null};
 });
 const byId=new Map(fighters.map(f=>[f.id,f]));
 // Fase E: deterministic tangential navigation reuses collider footprints.
 // Only changes the route while pursuing; never changes HP, abilities, or targeting.
 function firstBlockingObstacle(x,z,tx,tz){
  const dx=tx-x,dz=tz-z,l2=dx*dx+dz*dz;
  if(l2<1e-8)return null;
  let nearest=null;
  for(let index=0;index<obstacles.length;index++){
   const o=obstacles[index],t=clamp(((o.x-x)*dx+(o.z-z)*dz)/l2,0,1);
   const sx=x+dx*t-o.x,sz=z+dz*t-o.z;
   if(sx*sx+sz*sz<(o.r+.74)**2&&(!nearest||t<nearest.t))nearest={o,index,t};
  }
  return nearest;
 }
 function steeringDirection(f,target){
  const blocker=firstBlockingObstacle(f.x,f.z,target.x,target.z);
  if(!blocker){f.navObstacle=-1;f.navSide=0;f.navActive=false;return null}
  const {o,index}=blocker,rx=f.x-o.x,rz=f.z-o.z;
  const distance=Math.max(.0001,Math.hypot(rx,rz)),radius=o.r+.56;
  if(f.navObstacle!==index){
   const cross=rx*(target.z-o.z)-rz*(target.x-o.x);
   // A fixed hero/seed parity breaks symmetrical head-on approaches.
   const parity=([...f.id].reduce((v,c)=>v+c.charCodeAt(0),seed^index))&1;
   f.navSide=Math.abs(cross)>.15?(cross>0?1:-1):(parity?1:-1);
   f.navObstacle=index;f.navActive=false;f.navTurns++;
  }
  if(distance<radius+2.8)f.navActive=true;
  if(distance>radius+8)f.navActive=false;
  if(!f.navActive)return null;
  const ux=rx/distance,uz=rz/distance;
  const radial=clamp((radius+1.05-distance)*.80,-.16,1.2);
  const nx=f.navSide*(-uz)+radial*ux,nz=f.navSide*ux+radial*uz;
  const length=Math.max(.0001,Math.hypot(nx,nz));
  return {x:nx/length,z:nz/length};
 }
 const has=(f,id)=>f.build.talents.includes(id);
 function use(f,id,target=null){
  f.cooldowns[id]=ALL[f.build.klass].find(t=>t.id===id).cooldown;
  f.gcd=.7;f.usage[id]=(f.usage[id]||0)+1;f.animation='cast';
  emit('talent',f,{talent:id,animationId:f.build.klass+'_'+id.toLowerCase(),name:ALL[f.build.klass].find(t=>t.id===id).name,target:target?.id||null});
  // E07 charges after two offensive spells and boosts the next one.
  if(f.build.klass==='mage'&&['E01','E03','E04','E06','E10'].includes(id)&&has(f,'E07')&&
    (f.cooldowns.E07||0)<=0&&!f.passives.e07Ready){
   f.passives.e07Count=(f.passives.e07Count||0)+1;
   if(f.passives.e07Count>=2){
    f.passives.e07Count=0;f.passives.e07Ready=true;emit('charge',f,{talent:'E07'});
   }
  }
 }
 function ready(f,id){return has(f,id)&&(f.cooldowns[id]||0)<=0&&f.gcd<=0}
 function shield(f,amount,seconds){
  if(has(f,'L07')&&f.passives.l07Ready){
   amount*=1+.10*effectiveness(f,'L07');f.passives.l07Ready=false;f.cooldowns.L07=13;
   emit('proc',f,{talent:'L07',kind:'shield'});
  }
  if(has(f,'R07')&&(f.cooldowns.R07||0)<=0&&f.runicRegenUntil<=time){
   f.cooldowns.R07=15;f.runicRegenUntil=time+5;
   f.runicRegenPower=f.stats.hp*.015*effectiveness(f,'R07')/5;
   emit('proc',f,{talent:'R07'});
  }
  if(amount>0&&has(f,'T09')&&(f.cooldowns.T09||0)<=0){
   f.cooldowns.T09=15;f.t09Until=time+6;
   f.t09Power=f.stats.hp*.02*effectiveness(f,'T09')/6;
   emit('proc',f,{talent:'T09',kind:'regen-after-shield'});
  }
  f.shield=Math.min(f.stats.hp*.30,Math.max(0,f.shield)+amount);
  f.shieldUntil=Math.max(f.shieldUntil,time+seconds);
  emit('shield',f,{amount:+amount.toFixed(2),total:+f.shield.toFixed(2)});
 }
 function clearPosition(f,dx,dz,step){
  const goal={x:f.x+dx*step,z:f.z+dz*step};
  const blocked=obstacles.some(o=>Math.hypot(goal.x-o.x,goal.z-o.z)<o.r+.6);
  if(!blocked){f.x=goal.x;f.z=goal.z;return true}
  return false;
 }
 function heal(f,amount,talent){
  if(has(f,'L07')&&f.passives.l07Ready&&amount>0){
   amount*=1+.10*effectiveness(f,'L07');f.passives.l07Ready=false;f.cooldowns.L07=13;
   emit('proc',f,{talent:'L07',kind:'heal'});
  }
  // 10% HP per rolling 15s, shared by regenerative talents, never over-heal.
  f.healWindow=f.healWindow.filter(x=>time-x.time<15);
  const spent=f.healWindow.reduce((a,b)=>a+b.amount,0);
  const allowed=Math.max(0,Math.min(amount,f.stats.hp*.10-spent,f.stats.hp-f.hp));
  if(allowed>1e-8){
   f.hp+=allowed;f.healWindow.push({time,amount:allowed});emit('heal',f,{amount:+allowed.toFixed(2),talent});
   if(has(f,'L02')&&(f.cooldowns.L02||0)<=0&&!f.passives.l02Ready){
    f.passives.l02Ready=true;emit('charge',f,{talent:'L02'});
   }
  }
  return allowed;
 }
 function reactAilment(f){
  if(!f.alive||!has(f,'L09')||(f.cooldowns.L09||0)>0)return;
  f.cooldowns.L09=22;
  if(f.burning>0)f.burning*=.5;
  if(f.poisonUntil>time)f.poisonUntil=time+(f.poisonUntil-time)*.5;
  f.mercyRegenUntil=time+3;
  f.mercyRegenPower=f.stats.hp*.02*effectiveness(f,'L09')/3;
  emit('proc',f,{talent:'L09'});
 }
 function applySlow(f,fraction,duration,owner,talent=null){
  if(!f.alive)return;
  if(owner&&f.build.klass==='mage'&&has(f,'E08')&&(f.cooldowns.E08||0)<=0){
   f.cooldowns.E08=19;
   duration*=1-.5*effectiveness(f,'E08');
   const dx=f.x-owner.x,dz=f.z-owner.z,d=Math.max(.001,Math.hypot(dx,dz));
   clearPosition(f,dx/d,dz/d,1*effectiveness(f,'E08'));
   emit('proc',f,{talent:'E08',target:owner.id});
  }
  if(owner&&f.build.klass==='warrior'&&has(f,'T06')&&(f.cooldowns.T06||0)<=0){
   f.cooldowns.T06=15;duration*=1-.60*effectiveness(f,'T06');
   shield(f,6*effectiveness(f,'T06'),2);
   emit('proc',f,{talent:'T06',target:owner.id});
  }
  if(f.slowPower<fraction||f.slow<=0)f.slowPower=fraction;
  f.slow=Math.max(f.slow,duration);
  emit('debuff',owner,{target:f.id,kind:'slow',fraction,duration,talent});
 }
 function staggeredSideStep(f,owner,meters){
  const dx=owner.x-f.x,dz=owner.z-f.z,dd=Math.max(.001,Math.hypot(dx,dz));
  // Try either perpendicular; never jump into a pillar.
  return clearPosition(f,-dz/dd,dx/dd,meters)||clearPosition(f,dz/dd,-dx/dd,meters);
 }
 function endHero(f,killer){
  if(!f.alive||f.hp>0)return;
  f.hp=0;f.alive=false;f.animation='defeated';f.eliminatedAt=time;
  if(killer&&killer!==f){killer.kills++;emit('knockout',killer,{target:f.id,by:killer.name})}
  else emit('storm',f,{target:f.id});
 }
 function applyHit(attacker,target,raw,{kind='basic',skill=null,ignoreDefense=0,fire=false,reflect=false,shieldBonus=0}={}){
  if(!target?.alive||!attacker||(!attacker.alive&&!reflect))return 0;
  let amount=Math.max(0,raw);
  const heavy=!reflect&&raw>=attacker.stats.attack*1.30;
  if(!reflect&&kind==='melee'&&target.build.klass==='hunter'&&has(target,'E06')&&(target.cooldowns.E06||0)<=0){
   amount*=1-.25*effectiveness(target,'E06');target.cooldowns.E06=19;
   const dx=target.x-attacker.x,dz=target.z-attacker.z,dd=Math.max(.001,Math.hypot(dx,dz));
   clearPosition(target,dx/dd,dz/dd,1);
   emit('proc',target,{talent:'E06',target:attacker.id});
  }
  // Warrior Duelist D02 works only against directed attacks, never AoE or
  // reflection. The side step is collision-checked.
  if(!reflect&&['melee','ranged'].includes(kind)&&has(target,'D02')&&(target.cooldowns.D02||0)<=0){
   amount*=1-.30*effectiveness(target,'D02');target.cooldowns.D02=14;
   staggeredSideStep(target,attacker,1);emit('proc',target,{talent:'D02',target:attacker.id});
  }
  if(!reflect&&target.t04Until>time)amount*=1-.15*effectiveness(target,'T04');
  if(!reflect&&has(target,'T02')&&target.passives.t02Ready){
   amount*=1-.18*effectiveness(target,'T02');target.passives.t02Ready=false;emit('proc',target,{talent:'T02'});
  }
  if(!reflect&&target.s01Until>time)amount*=1-.18*effectiveness(target,'S01');
  if(!reflect&&has(target,'A03')&&target.passives.a03Ready){
   amount*=1-.10*effectiveness(target,'A03');target.passives.a03Ready=false;
   target.cooldowns.A03=14;target.a03Travel=0;emit('proc',target,{talent:'A03'});
  }
  if(!reflect&&skill&&has(target,'S04')&&target.passives.s04Ready&&target.passives.s04Until>time){
   amount*=1-.10*effectiveness(target,'S04');target.passives.s04Ready=false;emit('proc',target,{talent:'S04'});
  }
  // Heavy-hit reactions work on actual potential HP damage; shield cannot
  // prematurely trigger emergency phase defenses from harmless pokes.
  if(!reflect&&amount>=target.stats.hp*.20&&has(target,'A06')&&(target.cooldowns.A06||0)<=0){
   target.cooldowns.A06=21;amount*=1-.20*effectiveness(target,'A06');
   emit('proc',target,{talent:'A06',target:attacker.id});
  }
  if(!reflect&&amount>=target.stats.hp*.20&&has(target,'S09')&&(target.cooldowns.S09||0)<=0){
   target.cooldowns.S09=22;amount*=1-.18*effectiveness(target,'S09');
   emit('proc',target,{talent:'S09',target:attacker.id});
  }
  if(!reflect&&attacker.t10Until>time&&attacker.shield>0)amount*=.85;
  if(!reflect&&skill&&has(attacker,'J08')&&attacker.passives.j08Ready){
   amount*=1+.10*effectiveness(attacker,'J08');
   attacker.passives.j08Ready=false;attacker.cooldowns.J08=14;
   emit('proc',attacker,{talent:'J08',target:target.id});
  }
  const defenseFactor=Math.max(.35,1-(target.stats.defense*(1-ignoreDefense))*.025);
  amount*=defenseFactor;
  if(!reflect&&target.d06Until>time)amount*=1-.08*effectiveness(target,'D06');
  if(!reflect&&skill&&attacker.r08Until>time)amount*=1-attacker.r08Power;
  if(!reflect&&attacker.build.klass==='mage'&&has(target,'L10')&&
    zones.some(z=>z.talent==='L10'&&z.owner===target.id&&z.until>time&&dist(z,target)<=z.r))
   amount*=1-.12*effectiveness(target,'L10');
  if(target.fortress>0)amount*=.82;
  if(!reflect&&target.guardUntil>time&&target.passives.g06GuardReady){
   amount*=1-.12*effectiveness(target,'G06');target.passives.g06GuardReady=false;target.guardUntil=0;
   emit('proc',target,{talent:'G06',target:attacker.id});
  }
  if(!reflect&&kind==='melee'&&has(target,'G07')&&(target.cooldowns.G07||0)<=0){
   amount*=1-.20*effectiveness(target,'G07');target.cooldowns.G07=15;
   emit('proc',target,{talent:'G07',target:attacker.id});
  }
  if(!reflect&&has(target,'G08')&&target.passives.g08Until>time)amount*=1-.08*effectiveness(target,'G08');
  if(!reflect&&skill&&target.r04Until>time&&has(target,'R04')){
   amount*=1-.12*effectiveness(target,'R04');target.r04Until=0;
   emit('proc',target,{talent:'R04',target:attacker.id});
  }
  if(!reflect&&kind==='ranged'&&dist(attacker,target)>6&&has(target,'P08')&&(target.cooldowns.P08||0)<=0){
   amount*=1-.15*effectiveness(target,'P08');target.cooldowns.P08=18;target.passives.p08RangeReady=true;
   emit('proc',target,{talent:'P08',target:attacker.id});
  }
  if(target.passives.g02Ready&&has(target,'G02')&&!reflect){
   amount*=1-.12*effectiveness(target,'G02');
   target.passives.g02Ready=false;target.cooldowns.G02=12;
   emit('proc',target,{talent:'G02',target:attacker.id});
  }
  if(attacker.weak>0)amount*=1-attacker.weakPower;
  if(!reflect&&attacker.d07WeakUntil>time){
   amount*=1-attacker.d07WeakPower;attacker.d07WeakUntil=0;
   emit('proc',attacker,{talent:'D07',kind:'weakened'});
  }
  if(attacker.solarUntil>time&&attacker.shield>0)amount*=.88;
  if(attacker.rage>0)amount*=1+.10*effectiveness(attacker,'B08');
  if(!reflect&&kind==='melee'&&has(attacker,'L02')&&attacker.passives.l02Ready){
   amount*=1+.09*effectiveness(attacker,'L02');
   attacker.passives.l02Ready=false;attacker.cooldowns.L02=12;
   emit('proc',attacker,{talent:'L02',target:target.id});
  }
  if(!reflect&&r()<attacker.stats.crit)amount*=1.5;
  if(!reflect&&attacker.build.klass==='hunter'&&has(attacker,'E07')&&attacker.passives.e07Ready){
   amount*=1+.10*effectiveness(attacker,'E07');attacker.passives.e07Ready=false;attacker.cooldowns.E07=14;
   attacker.passives.e07Anchor={x:attacker.x,z:attacker.z};
   emit('proc',attacker,{talent:'E07',target:target.id});
  }
  if(!reflect&&attacker.build.klass==='hunter'&&skill&&has(attacker,'E09')&&attacker.passives.e09NetReady){
   amount*=1+.12*effectiveness(attacker,'E09');attacker.passives.e09NetReady=false;
   emit('proc',attacker,{talent:'E09',target:target.id});
  }
  if(!reflect&&skill&&has(attacker,'A07')&&attacker.passives.a07Ready){
   amount*=1+.10*effectiveness(attacker,'A07');
   attacker.passives.a07Ready=false;attacker.cooldowns.A07=11;
   emit('proc',attacker,{talent:'A07',target:target.id});
  }
  // P04 and P05 are one-charge, scoped to the hero that owns the effect.
  if(!reflect&&kind==='basic'&&has(attacker,'P04')&&attacker.passives.p04Ready){
   amount*=1+.08*effectiveness(attacker,'P04');attacker.passives.p04Ready=false;
   attacker.cooldowns.P04=12;emit('proc',attacker,{talent:'P04',target:target.id});
  }
  if(!reflect&&target.markBy===attacker.id&&target.markUntil>time){
   amount*=1+.12*effectiveness(attacker,'P05');target.markBy=null;target.markUntil=0;
   emit('proc',attacker,{talent:'P05',target:target.id});
  }
  // Reversible V5 LAB pacing, applied once after mitigation/crit and before
  // barrier absorption. Defaults are neutral for every production caller.
  amount*=pace*(attacker.build.klass==='mage'?mageBonus:1);
  // E05 creates protection after being hit: the current impact remains real.
  // Extra anti-shield damage never spills into HP: calculate normal HP
  // penetration separately, independent of the added barrier-only portion.
  const originalShield=target.shield;
  const normalAbsorption=Math.min(originalShield,amount);
  const shieldTaken=Math.min(originalShield,amount*(1+shieldBonus));
  target.shield-=shieldTaken;
  const inflicted=Math.max(0,amount-normalAbsorption);
  target.hp=Math.max(0,target.hp-inflicted);
  if(!reflect&&shieldTaken>0&&has(target,'J08')&&!target.passives.j08Ready&&
    (target.cooldowns.J08||0)<=0){
   target.passives.j08Blocks=(target.passives.j08Blocks||0)+1;
   if(target.passives.j08Blocks>=2){
    target.passives.j08Blocks=0;target.passives.j08Ready=true;
    emit('charge',target,{talent:'J08'});
   }
  }
  // Delayed non-recursive echo of actual single-target active magic damage.
  if(!reflect&&inflicted>0&&attacker.build.klass==='mage'&&has(attacker,'A05')&&
   (attacker.cooldowns.A05||0)<=0&&['A01','E01','E03','E04','E06','R05','R08'].includes(skill)){
   attacker.cooldowns.A05=13;pending.push({kind:'echo',owner:attacker.id,targetId:target.id,
    damage:inflicted*.25*effectiveness(attacker,'A05'),talent:'A05',impactAt:time+.30});
   emit('proc',attacker,{talent:'A05',target:target.id});
  }
  // D04 builds on *successful own impacts*, including both D01 hits.
  if(!reflect&&inflicted>0&&has(attacker,'D04')&&!attacker.passives.d04Ready&&(attacker.cooldowns.D04||0)<=0&&skill!=='poison'){
   attacker.passives.d04Hits=(attacker.passives.d04Hits||0)+1;
   if(attacker.passives.d04Hits>=3){
    attacker.passives.d04Hits=0;attacker.passives.d04Ready=true;emit('charge',attacker,{talent:'D04'});
   }
  }
  // R02 must connect two *different* offensive spells to the same enemy.
  if(!reflect&&inflicted>0&&has(attacker,'R02')&&attacker.build.klass==='mage'&&
    ['E01','E03','E04','E06','E10','R03','R05','A01','A04'].includes(skill)&&
    (attacker.cooldowns.R02||0)<=0&&!attacker.passives.r02Ready){
   if(attacker.passives.r02Target!==target.id){
    attacker.passives.r02Target=target.id;attacker.passives.r02Last=skill;
   }else if(attacker.passives.r02Last!==skill){
    attacker.passives.r02Ready=true;emit('charge',attacker,{talent:'R02',target:target.id});
   }
  }
  attacker.damage+=inflicted;attacker.attacks++;
  if(inflicted>0){target.lastHitAt=time;target.s02Until=0;target.passives.t02Ready=false;}
  if(inflicted>0&&target.build.klass==='hunter'&&has(target,'E07')){
   target.passives.e07Ready=false;target.passives.e07Anchor={x:target.x,z:target.z};
  }
  target.hitWindow.push({time,value:inflicted});
  target.hitWindow=target.hitWindow.filter(h=>time-h.time<=3);
  emit('hit',attacker,{target:target.id,amount:+inflicted.toFixed(2),absorbed:+shieldTaken.toFixed(2),kind,skill});
  if(!reflect&&inflicted>0&&skill&&has(target,'J06')&&
   (target.cooldowns.J06||0)<=0&&dist(attacker,target)<=3&&attacker.alive){
   target.cooldowns.J06=18;emit('proc',target,{talent:'J06',target:attacker.id});
   applyHit(target,attacker,target.stats.attack*.55*effectiveness(target,'J06'),{kind:'retaliation',skill:'J06',reflect:true});
  }
  if(!reflect&&skill&&inflicted>0&&has(target,'S04')&&
   !target.passives.s04Ready&&(target.cooldowns.S04||0)<=0){
   target.passives.s04Ready=true;target.passives.s04Until=time+4;target.cooldowns.S04=14;
   emit('charge',target,{talent:'S04',target:attacker.id});
  }
  // B06: 6% effective damage converted into healing, with an additional
  // per-five-second 4% HP cap (and the shared global healing cap).
  if(!reflect&&has(attacker,'B06')&&inflicted>0){
   if(!attacker.passives.b06Window||time-attacker.passives.b06Window>=5){
    attacker.passives.b06Window=time;attacker.passives.b06Spent=0;
   }
   const healCap=Math.max(0,attacker.stats.hp*.04-(attacker.passives.b06Spent||0));
   const gained=heal(attacker,Math.min(healCap,inflicted*.06*effectiveness(attacker,'B06')),'B06');
   attacker.passives.b06Spent=(attacker.passives.b06Spent||0)+gained;
   if(gained>0)emit('proc',attacker,{talent:'B06',target:target.id});
  }
  if(!reflect&&shieldTaken>0&&target.build.klass==='warrior'&&has(target,'T03')&&
   (target.cooldowns.T03||0)<=0&&dist(attacker,target)<=target.stats.range+.3){
   target.cooldowns.T03=14;emit('proc',target,{talent:'T03',target:attacker.id});
   if(attacker.alive)applyHit(target,attacker,target.stats.attack*.45*effectiveness(target,'T03'),
    {kind:'retaliation',skill:'T03',reflect:true});
  }
  if(!reflect&&shieldTaken>0&&has(target,'L03')&&(target.cooldowns.L03||0)<=0){
   target.cooldowns.L03=15;heal(target,target.stats.hp*.015*effectiveness(target,'L03'),'L03');
   emit('proc',target,{talent:'L03',target:attacker.id});
  }
  if(!reflect&&target.reverseUntil>time&&attacker.alive){
   target.reverseUntil=0;emit('proc',target,{talent:'D03',target:attacker.id});
   applyHit(target,attacker,target.stats.attack*.65*effectiveness(target,'D03'),{kind:'retaliation',skill:'D03',reflect:true});
  }
  if(!reflect&&has(target,'D06')&&(target.cooldowns.D06||0)<=0&&(defenseFactor<1||shieldTaken>0)){
   target.cooldowns.D06=11;target.d06Until=time+3;emit('proc',target,{talent:'D06',target:attacker.id});
  }
  if(!reflect&&target.hp>0&&heavy&&has(target,'D09')&&(target.cooldowns.D09||0)<=0&&dist(target,attacker)<=3.1){
   target.cooldowns.D09=15;emit('proc',target,{talent:'D09',target:attacker.id});
   if(attacker.alive)applyHit(target,attacker,target.stats.attack*.70*effectiveness(target,'D09'),{kind:'retaliation',skill:'D09',reflect:true});
  }
  if(target.hp<=0){endHero(target,attacker);return inflicted}
  if(has(target,'A09')&&!target.passives.a09Used&&target.hp/target.stats.hp<.35){
   target.passives.a09Used=true;target.a09Until=time+3;
   const dx=target.x-attacker.x,dz=target.z-attacker.z,d=Math.max(.001,Math.hypot(dx,dz));
   clearPosition(target,dx/d,dz/d,2);
   emit('proc',target,{talent:'A09',target:attacker.id});
  }
  if(has(target,'S06')&&!target.passives.s06Used&&target.hp/target.stats.hp<.30){
   target.passives.s06Used=true;shield(target,target.stats.hp*.10*effectiveness(target,'S06'),3);
   emit('proc',target,{talent:'S06'});
  }
  if(has(target,'J09')&&!target.passives.j09Used&&target.hp/target.stats.hp<.30){
   target.passives.j09Used=true;shield(target,target.stats.hp*.10*effectiveness(target,'J09'),3);
   emit('proc',target,{talent:'J09'});
  }
  if(has(target,'R09')&&!target.passives.r09Used&&target.hp/target.stats.hp<.30){
   target.passives.r09Used=true;shield(target,target.stats.hp*.12*effectiveness(target,'R09'),3);
   emit('proc',target,{talent:'R09'});
  }
  if(target.build.klass==='hunter'&&has(target,'E08')&&!target.passives.e08Used&&target.hp/target.stats.hp<.40){
   target.passives.e08Used=true;
   zones.push({owner:target.id,talent:'E08',x:target.x,z:target.z,r:1.5,until:time+5,triggered:false});
   emit('proc',target,{talent:'E08'});emit('zone',target,{talent:'E08',x:target.x,z:target.z,radius:1.5,duration:5});
  }
  if(has(target,'L06')&&!target.passives.l06Used&&target.hp/target.stats.hp<.35){
   target.passives.l06Used=true;target.hopeRegenUntil=time+3;
   target.hopeRegenPower=target.stats.hp*.05*effectiveness(target,'L06')/3;
   emit('proc',target,{talent:'L06'});
  }
  if(!reflect&&skill&&has(target,'R04')&&(target.cooldowns.R04||0)<=0&&target.r04Until<=time){
   target.r04Until=time+4;target.cooldowns.R04=12;
   emit('charge',target,{talent:'R04',target:attacker.id});
  }
  if(has(target,'B08')&&!target.passives.b08Used&&target.hp/target.stats.hp<.45){
   target.passives.b08Used=true;target.rage=6;emit('proc',target,{talent:'B08',target:attacker.id});
  }
  if(target.build.klass==='mage'&&has(target,'E09')&&!target.passives.e09Used&&target.hp/target.stats.hp<.4){
   target.passives.e09Used=true;target.passives.e09Ready=true;emit('charge',target,{talent:'E09'});
  }
  if(!reflect&&has(target,'B10')&&!target.passives.b10Used&&target.hp/target.stats.hp<.25){
   target.passives.b10Used=true;
   const dx=attacker.x-target.x,dz=attacker.z-target.z,d=Math.max(.001,Math.hypot(dx,dz));
   clearPosition(target,dx/d,dz/d,Math.min(3,Math.max(0,d-1.4)));
   emit('proc',target,{talent:'B10',target:attacker.id});
   if(attacker.alive&&dist(target,attacker)<=3.2)applyHit(target,attacker,target.stats.attack*1.2*effectiveness(target,'B10'),{kind:'special',skill:'B10',reflect:true});
  }
  if(has(target,'G02')&&!target.passives.g02Start)target.passives.g02Start=time;
  if(has(target,'G05')&&(target.cooldowns.G05||0)<=0&&target.hitWindow.reduce((s,h)=>s+h.value,0)>.15*target.stats.hp){
   target.cooldowns.G05=16;shield(target,7*effectiveness(target,'G05'),3);
   emit('proc',target,{talent:'G05',target:attacker.id});
  }
  if(!reflect&&target.build.klass==='mage'&&has(target,'E05')&&(target.cooldowns.E05||0)<=0&&dist(attacker,target)<=3.1){
   target.cooldowns.E05=18;shield(target,10*effectiveness(target,'E05'),2);
   emit('proc',target,{talent:'E05',target:attacker.id});
   applyHit(target,attacker,target.stats.attack*.35*effectiveness(target,'E05'),{kind:'retaliation',skill:'E05',reflect:true});
  }
  if(!reflect&&shieldTaken>0&&has(target,'R06')&&(target.cooldowns.R06||0)<=0&&dist(attacker,target)<=7){
   target.cooldowns.R06=20;emit('proc',target,{talent:'R06',target:attacker.id});
   if(attacker.alive)applyHit(target,attacker,target.stats.attack*.35*effectiveness(target,'R06'),{kind:'reflect',skill:'R06',reflect:true});
  }
  if(!reflect&&shieldTaken>0&&has(target,'G03')&&(target.cooldowns.G03||0)<=0&&dist(attacker,target)<=3){
   target.cooldowns.G03=18;emit('proc',target,{talent:'G03',target:attacker.id});
   applyHit(target,attacker,target.stats.attack*.35*effectiveness(target,'G03'),{kind:'reflect',skill:'G03',reflect:true});
  }
  if(!reflect&&fire&&has(attacker,'E02')&&(attacker.cooldowns.E02||0)<=0){
   attacker.cooldowns.E02=10;target.burning=3;
   target.burnPower=attacker.stats.attack*.03*effectiveness(attacker,'E02');
   target.burnOwner=attacker.id;
   reactAilment(target);
   emit('proc',attacker,{talent:'E02',target:target.id});
  }
  return inflicted;
 }
 function commitRanged(f,seconds){
  if(!rangedRecovery||!['hunter','mage'].includes(f.build.klass))return;
  if(f.shotRecovery<seconds){
   f.shotRecovery=seconds;
   emit('aim-recovery',f,{duration:seconds});
  }
 }
 function projectile(f,target,damage,skill,options={}){
  commitRanged(f,skill?.62:.72);
  if(has(f,'P08')&&f.passives.p08RangeReady){
   f.passives.p08RangeReady=false;emit('proc',f,{talent:'P08',target:target.id,kind:'range'});
  }
  const dx=target.x-f.x,dz=target.z-f.z,d=Math.max(.001,Math.hypot(dx,dz));
  projectiles.push({id:++pid,x:f.x,z:f.z,y:1.6,from:f.id,to:target.id,vx:dx/d*20,vz:dz/d*20,
   kind:'talent',damage,skill,options,age:0});
  emit('launch',f,{target:target.id,talent:skill});
 }
 function basicAttack(f,target){
  const klass=f.build.klass;let amount=f.stats.attack,kind=klass==='mage'||klass==='hunter'?'ranged':'melee';
  if(has(f,'B02')&&f.passives.b02Ready){
   amount*=1+.12*effectiveness(f,'B02');f.passives.b02Ready=false;f.cooldowns.B02=10;
   emit('proc',f,{talent:'B02',target:target.id});
  }
  if(has(f,'B04')&&f.passives.b04Ready){
   amount*=1+.16*effectiveness(f,'B04');f.passives.b04Ready=false;f.cooldowns.B04=12;
   emit('proc',f,{talent:'B04',target:target.id});
  }
  if(has(f,'P02')&&f.passives.p02Ready){
   amount*=1+.12*effectiveness(f,'P02');f.passives.p02Ready=false;f.cooldowns.P02=10;
   emit('proc',f,{talent:'P02',target:target.id});
  }
  if(klass==='guardian'){
   if(has(f,'J05')&&f.hp>f.stats.hp*.70){
    amount*=1+.07*effectiveness(f,'J05');
    if(!f.passives.j05Seen){f.passives.j05Seen=true;emit('proc',f,{talent:'J05'})}
   }
   if(has(f,'J02')&&f.passives.j02Ready){
    amount*=1+.10*effectiveness(f,'J02');f.passives.j02Ready=false;
    f.cooldowns.J02=10;emit('proc',f,{talent:'J02',target:target.id});
   }
   if(target.j04MarkBy===f.id&&target.j04Until>time){
    amount*=1+.12*effectiveness(f,'J04');target.j04MarkBy=null;target.j04Until=0;
    emit('proc',f,{talent:'J04',target:target.id});
   }
  }
  if(klass==='warrior'&&has(f,'T07')&&(f.cooldowns.T07||0)<=0){
   f.passives.t07Count=(f.passives.t07Count||0)+1;
   if(f.passives.t07Count>=3&&!f.passives.t07Active){
    f.passives.t07Count=0;f.passives.t07Active=true;
    f.passives.t07Until=time+3;f.cooldowns.T07=10;
    shield(f,6*effectiveness(f,'T07'),3);emit('proc',f,{talent:'T07'});
   }
  }
  f.basic=klass==='hunter'?1.23:klass==='mage'?1.16:1.02;
  if(has(f,'D04')&&f.passives.d04Ready){
   f.basic*=1-.15*effectiveness(f,'D04');f.passives.d04Ready=false;f.cooldowns.D04=8;
   emit('proc',f,{talent:'D04',target:target.id});
  }
  if(has(f,'P07')&&f.passives.p07Ready){
   f.basic*=1-.10*effectiveness(f,'P07');
   f.passives.p07Ready=false;f.cooldowns.P07=10;
   emit('proc',f,{talent:'P07',target:target.id});
  }
  f.animation='attack';
  if(kind==='ranged')projectile(f,target,amount,null,{kind:'basic'});
  else{applyHit(f,target,amount,{kind:'melee'});
   if(klass==='guardian'&&has(f,'J02')&&!f.passives.j02Ready&&(f.cooldowns.J02||0)<=0){
    f.passives.j02Count=(f.passives.j02Count||0)+1;
    if(f.passives.j02Count>=2){f.passives.j02Count=0;f.passives.j02Ready=true;emit('charge',f,{talent:'J02'})}
   }
   if(has(f,'G08')&&(f.cooldowns.G08||0)<=0){
    f.passives.g08Count=(f.passives.g08Count||0)+1;
    if(f.passives.g08Count>=3){
     f.passives.g08Count=0;f.passives.g08Until=time+3;f.cooldowns.G08=10;emit('proc',f,{talent:'G08'});
    }
   }
   if(has(f,'B02')&&(f.cooldowns.B02||0)<=0){
    f.passives.b02Count=(f.passives.b02Count||0)+1;
    if(f.passives.b02Count>=2){f.passives.b02Count=0;f.passives.b02Ready=true;emit('charge',f,{talent:'B02'})}
   }
  }
 }
 function spellBonus(f){
  let bonus=1;
  if(f.build.klass==='mage'&&has(f,'A07')&&f.passives.a07Ready){
   bonus+=.10*effectiveness(f,'A07');f.passives.a07Ready=false;
   f.cooldowns.A07=11;emit('proc',f,{talent:'A07'});
  }
  if(f.build.klass==='mage'&&f.a02BoostUntil>time){
   bonus+=.07*effectiveness(f,'A02');f.a02BoostUntil=0;emit('proc',f,{talent:'A02'});
  }
  if(has(f,'E07')&&f.passives.e07Ready){
   bonus+=.08*effectiveness(f,'E07');f.passives.e07Ready=false;f.cooldowns.E07=12;
   emit('proc',f,{talent:'E07'});
  }
  if(has(f,'R02')&&f.passives.r02Ready){
   bonus+=.09*effectiveness(f,'R02');f.passives.r02Ready=false;f.passives.r02Target=null;
   f.passives.r02Last=null;f.cooldowns.R02=10;emit('proc',f,{talent:'R02'});
  }
  if(has(f,'E09')&&f.passives.e09Ready){
   bonus+=.12*effectiveness(f,'E09');f.passives.e09Ready=false;
   emit('proc',f,{talent:'E09'});
  }
  return bonus;
 }
 function prepareAoE(f,target,id,damage,delay,impacts,radius){
  commitRanged(f,.72);
  const center={x:target.x,z:target.z};
  emit('prepare',f,{ability:ALL[f.build.klass].find(t=>t.id===id).name,target:target.id,x:center.x,z:center.z,duration:delay});
  for(let i=0;i<impacts;i++)pending.push({owner:f.id,talent:id,x:center.x,z:center.z,
    damage,impactAt:time+delay+i*.15,radius});
  // P09 interrupts only telegraphed casts, never instant abilities.
  for(const watcher of fighters){
   if(!watcher.alive||watcher===f||!has(watcher,'P09')||(watcher.cooldowns.P09||0)>0||dist(watcher,f)>8)continue;
   watcher.cooldowns.P09=21;emit('proc',watcher,{talent:'P09',target:f.id});
   projectile(watcher,f,watcher.stats.attack*.55*effectiveness(watcher,'P09'),'P09',{interrupt:true});
  }
 }
 function act(f,target,d){
  if(f.gcd>0)return false;
  const atk=f.stats.attack,scaleSkill=id=>effectiveness(f,id);
  const klass=f.build.klass;
  // Contextual priority; each cast is a *real* ability with its own CD.
  if(klass==='guardian'){
   if(ready(f,'J10')&&d<=3){
    use(f,'J10',target);prepareAoE(f,f,'J10',atk*1.55*scaleSkill('J10'),.55,1,2);return true;
   }
   if(ready(f,'J07')&&d<=2.7){
    use(f,'J07',target);
    for(const e of fighters)if(e.alive&&e!==f&&dist(f,e)<=2.5){
     const angle=Math.atan2(e.x-f.x,e.z-f.z),delta=Math.atan2(Math.sin(angle-f.face),Math.cos(angle-f.face));
     if(Math.abs(delta)<=.95){
      applyHit(f,e,atk*scaleSkill('J07'),{kind:'special',skill:'J07'});
      if(e.alive)applySlow(e,.15,1.5,f,'J07');
     }
    }
    return true;
   }
   if(ready(f,'J03')&&d>f.stats.range&&d<=f.stats.range+3.3){
    use(f,'J03',target);const dx=(target.x-f.x)/d,dz=(target.z-f.z)/d;
    clearPosition(f,dx,dz,Math.min(3,Math.max(0,d-1.5)));
    if(target.alive&&dist(f,target)<=f.stats.range)applyHit(f,target,atk*1.05*scaleSkill('J03'),{kind:'melee',skill:'J03'});
    return true;
   }
   if(ready(f,'J04')&&d<=f.stats.range){
    use(f,'J04',target);
    const dealt=applyHit(f,target,atk*.85*scaleSkill('J04'),{kind:'special',skill:'J04'});
    if(dealt>0&&target.alive){target.j04MarkBy=f.id;target.j04Until=time+4;emit('mark',f,{talent:'J04',target:target.id})}
    return true;
   }
   if(ready(f,'J01')&&d<=f.stats.range){
    use(f,'J01',target);applyHit(f,target,atk*1.40*scaleSkill('J01'),{kind:'melee',skill:'J01'});return true;
   }
   if(ready(f,'L10')&&d<=8){
    use(f,'L10');zones.push({owner:f.id,talent:'L10',x:f.x,z:f.z,r:3,until:time+4});
    emit('zone',f,{talent:'L10',x:f.x,z:f.z,radius:3,duration:4});return true;
   }
   if(ready(f,'L08')&&d<=7){
    use(f,'L08',target);
    emit('prepare',f,{ability:'Julgamento Luminoso',target:target.id,x:target.x,z:target.z,duration:.45});
    pending.push({owner:f.id,talent:'L08',targetId:target.id,damage:atk*1.2*scaleSkill('L08'),impactAt:time+.45,kind:'beam'});return true;
   }
   if(ready(f,'L01')&&f.hp<f.stats.hp*.87&&f.lightRegenUntil<=time){
    use(f,'L01');f.lightRegenUntil=time+3;f.lightRegenPower=f.stats.hp*.06*scaleSkill('L01')/3;return true;
   }
   if(ready(f,'L04')&&d<3){
    use(f,'L04',target);applyHit(f,target,atk*.70*scaleSkill('L04'),{kind:'special',skill:'L04'});
    f.slow*=.5;return true;
   }
   if(ready(f,'L05')&&d<f.stats.range){
    use(f,'L05',target);applyHit(f,target,atk*.90*scaleSkill('L05'),{kind:'special',skill:'L05'});
    shield(f,8*scaleSkill('L05'),3);return true;
   }
   if(ready(f,'G01')&&(f.shield<4||f.hp<f.stats.hp*.7)){use(f,'G01');const a=f.build.attributes;shield(f,20+1.5*a.DEF+.5*a.VIT,4);return true}
   if(ready(f,'G10')&&f.shield<3&&(f.hp<f.stats.hp*.82||d<7)){
    use(f,'G10');const a=f.build.attributes;shield(f,35+1.7*a.DEF+.6*a.INT,4);f.solarUntil=time+4;return true;
   }
   if(ready(f,'G09')&&f.hp<f.stats.hp*.8&&f.regenUntil<=time){
    use(f,'G09');f.regenUntil=time+4;f.regenPower=f.stats.hp*.04*scaleSkill('G09')/4;return true;
   }
   if(ready(f,'G06')&&d>2&&d<8){
    use(f,'G06',target);const dx=target.x-f.x,dz=target.z-f.z;
    clearPosition(f,dx/d,dz/d,Math.min(2,d-1.4));
    f.guardUntil=time+3;f.passives.g06GuardReady=true;return true;
   }
   if(ready(f,'G04')&&d<7&&f.fortress<=0){use(f,'G04');f.fortress=4;return true}
  }
  if(klass==='warrior'){
   if(ready(f,'T10')&&f.shield<2){
    use(f,'T10');shield(f,38+2*f.build.attributes.DEF+.8*f.build.attributes.VIT,4);
    f.t10Until=time+4;return true;
   }
   if(ready(f,'T08')&&d<=f.stats.range){
    use(f,'T08',target);const recentlyHit=time-f.lastHitAt<=3;
    applyHit(f,target,atk*(recentlyHit?1.35:.90)*scaleSkill('T08'),
     {kind:'special',skill:'T08'});return true;
   }
   if(ready(f,'T01')&&f.shield<2){use(f,'T01');
    shield(f,20+1.5*f.build.attributes.DEF+.6*f.build.attributes.VIT,4);return true}
   if(ready(f,'T04')&&d<6&&f.t04Until<=time){use(f,'T04');f.t04Until=time+5;return true}
   if(f.offenseDelay>0)return false;
   if(ready(f,'T05')&&d<2.7){
    use(f,'T05',target);
    for(const e of fighters)if(e.alive&&e!==f&&dist(e,f)<=2){
     applyHit(f,e,atk*.75*scaleSkill('T05'),{kind:'special',skill:'T05'});
     e.weak=Math.max(e.weak,3);e.weakPower=Math.max(e.weakPower,.10*scaleSkill('T05'));
     emit('debuff',f,{target:e.id,kind:'weak',talent:'T05'})}
    return true;
   }

   if(ready(f,'D10')&&d<f.stats.range){
    use(f,'D10',target);
    for(let n=0;n<3;n++)pending.push({owner:f.id,talent:'D10',targetId:target.id,damage:atk*.55*scaleSkill('D10'),impactAt:time+.10+n*.22,kind:'combo',comboId:f.id+':'+time});
    return true;
   }
   if(ready(f,'D07')&&d<f.stats.range){
    use(f,'D07',target);applyHit(f,target,atk*.85*scaleSkill('D07'),{kind:'melee',skill:'D07'});
    if(target.alive){target.d07WeakUntil=time+3;target.d07WeakPower=.12*scaleSkill('D07');emit('debuff',f,{target:target.id,kind:'next-hit-weaken',seconds:3})}
    return true;
   }
   if(ready(f,'D03')&&d<f.stats.range){
    use(f,'D03',target);
    applyHit(f,target,atk*.75*scaleSkill('D03'),{kind:'special',skill:'D03'});
    f.reverseUntil=time+2;return true;
   }
   if(ready(f,'D05')&&d<f.stats.range){
    use(f,'D05',target);
    applyHit(f,target,atk*1.25*scaleSkill('D05'),{kind:'special',skill:'D05',ignoreDefense:.12});return true;
   }
   if(ready(f,'D01')&&d<f.stats.range){
    use(f,'D01',target);
    for(let n=0;n<2;n++)if(target.alive)applyHit(f,target,atk*.48*scaleSkill('D01'),{kind:'melee',skill:'D01'});
    return true;
   }
   if(ready(f,'B09')&&d<=f.stats.range){
    use(f,'B09',target);
    applyHit(f,target,atk*1.40*scaleSkill('B09'),{kind:'special',skill:'B09',shieldBonus:.75});
    return true;
   }
   if(ready(f,'B07')&&d<=f.stats.range){
    use(f,'B07',target);
    applyHit(f,target,atk*1.15*scaleSkill('B07'),{kind:'special',skill:'B07'});
    if(target.alive){target.offenseDelay=Math.max(target.offenseDelay,1);emit('debuff',f,{target:target.id,kind:'offense-delay',seconds:1})}
    return true;
   }
   if(ready(f,'B03')&&d<3.3){
    use(f,'B03',target);
    for(const e of fighters)if(e.alive&&e!==f&&dist(f,e)<3){
     const angle=Math.atan2(e.x-f.x,e.z-f.z),delta=Math.atan2(Math.sin(angle-f.face),Math.cos(angle-f.face));
     if(Math.abs(delta)<.85){applyHit(f,e,atk*1.2*scaleSkill('B03'),{kind:'special',skill:'B03'});applySlow(e,.2,1.2,f)}
    }
    return true;
   }
   if(ready(f,'B05')&&d<2.9){use(f,'B05',target);for(const e of fighters)if(e.alive&&e!==f&&dist(f,e)<2.5){
    applyHit(f,e,atk*.75*scaleSkill('B05'),{kind:'special',skill:'B05'});
    e.weak=Math.max(e.weak,3);e.weakPower=Math.max(e.weakPower,.10*scaleSkill('B05'));emit('debuff',f,{target:e.id,kind:'weak'});
   }return true}
   if(ready(f,'B01')&&d<f.stats.range){use(f,'B01',target);applyHit(f,target,atk*1.55*scaleSkill('B01'),{kind:'special',skill:'B01'});return true}
  }
  if(klass==='mage'){
   if(ready(f,'A10')&&d<=4.5){
    const bonus=spellBonus(f);use(f,'A10',target);
    prepareAoE(f,f,'A10',atk*1.35*scaleSkill('A10')*bonus,.6,1,2.5);
    pending[pending.length-1].shieldAfter=10*scaleSkill('A10');return true;
   }
   if(ready(f,'A08')&&d<=8){
    const bonus=spellBonus(f);use(f,'A08',target);
    emit('prepare',f,{ability:'Arco de Horizonte',target:target.id,x:target.x,z:target.z,duration:.45});
    pending.push({owner:f.id,talent:'A08',targetId:target.id,
     damage:atk*1.30*scaleSkill('A08')*bonus,impactAt:time+.45,kind:'beam'});return true;
   }
   if(ready(f,'A02')&&d<=12&&d>=2){
    use(f,'A02');const ax=target.x-f.x,az=target.z-f.z,mag=Math.max(.001,Math.hypot(ax,az));
    if(staggeredSideStep(f,target,3)||clearPosition(f,-ax/mag,-az/mag,3)){
     f.a02BoostUntil=time+2;emit('teleport',f,{talent:'A02',x:f.x,z:f.z})}
    return true;
   }
   if(ready(f,'A04')&&d<=8.5){
    const bonus=spellBonus(f);use(f,'A04',target);
    emit('zone',f,{talent:'A04',x:target.x,z:target.z,radius:2,duration:2});
    for(const e of fighters)if(e.alive&&e!==f&&dist(e,target)<=2){
     applyHit(f,e,atk*.50*scaleSkill('A04')*bonus,{kind:'special',skill:'A04'});
     if(e.alive)applySlow(e,.20,2,f)}
    return true;
   }
   if(ready(f,'A01')&&d<=10){
    const bonus=spellBonus(f);use(f,'A01',target);
    projectile(f,target,atk*1.15*scaleSkill('A01')*bonus,'A01');return true;
   }
   if(ready(f,'R10')&&d<=8.5){
    const buff=spellBonus(f);use(f,'R10',target);
    prepareAoE(f,target,'R10',atk*.90*scaleSkill('R10')*buff,.5,1,3);
    pending[pending.length-1].shieldAfter=8*scaleSkill('R10');return true;
   }
   if(ready(f,'R01')&&f.shield<2){
    use(f,'R01');const a=f.build.attributes;shield(f,18+1.4*a.DEF+.6*a.INT,4);return true;
   }
   if(f.offenseDelay>0)return false;
   if(ready(f,'R08')&&d<=8.5){
    const buff=spellBonus(f);use(f,'R08',target);
    projectile(f,target,atk*.85*scaleSkill('R08')*buff,'R08',{r08Weak:.10*scaleSkill('R08')});return true;
   }
   if(ready(f,'R03')&&d<=2.5){
    const buff=spellBonus(f);use(f,'R03',target);
    for(const e of fighters)if(e.alive&&e!==f&&dist(f,e)<=2.5){
     applyHit(f,e,atk*.65*scaleSkill('R03')*buff,{kind:'special',skill:'R03'});
     const dx=e.x-f.x,dz=e.z-f.z,dd=Math.max(.001,Math.hypot(dx,dz));
     if(e.alive)clearPosition(e,dx/dd,dz/dd,1.5);
    }
    return true;
   }
   if(ready(f,'R05')&&d<=4){
    const buff=spellBonus(f);use(f,'R05',target);
    applyHit(f,target,atk*scaleSkill('R05')*buff,{kind:'special',skill:'R05'});
    if(target.alive){target.offenseDelay=Math.max(target.offenseDelay,.8);emit('debuff',f,{target:target.id,kind:'offense-delay',seconds:.8})}
    return true;
   }
   if(ready(f,'E10')&&d<=9){
    const buff=spellBonus(f);use(f,'E10',target);prepareAoE(f,target,'E10',atk*1.55*scaleSkill('E10')*buff,.7,1,2);return true;
   }
   if(ready(f,'E06')&&d<=8.5){
    const buff=spellBonus(f);use(f,'E06',target);
    projectile(f,target,atk*.85*scaleSkill('E06')*buff,'E06',{chain:atk*.55*scaleSkill('E06')*buff});return true;
   }
   if(ready(f,'E03')&&d<=8.5&&target.slow<=0){const buff=spellBonus(f);use(f,'E03',target);projectile(f,target,atk*.8*scaleSkill('E03')*buff,'E03',{slow:.25,duration:2});return true}
   if(ready(f,'E04')&&d<=8.5&&target.slow>0){const buff=spellBonus(f);use(f,'E04',target);projectile(f,target,atk*1.25*scaleSkill('E04')*(target.slow>0?1.15:1)*buff,'E04');return true}
   if(ready(f,'E01')&&d<=9){const buff=spellBonus(f);use(f,'E01',target);projectile(f,target,atk*1.45*scaleSkill('E01')*buff,'E01',{fire:true});return true}
  }
  if(klass==='hunter'){
   if(ready(f,'S10')&&d<=9){
    use(f,'S10',target);
    const sharedHits=new Set(),marks=[
      {x:f.x,z:f.z},
      {x:f.prevX??f.x,z:f.prevZ??f.z}
    ];
    // Second mark follows a recent world-space location. Two marks from the
    // same cast can never hit the same opponent twice.
    for(const m of marks){
     zones.push({owner:f.id,talent:'S10',x:m.x,z:m.z,r:1.8,until:time+5,
      sharedHits,castId:f.id+':'+time});
     emit('zone',f,{talent:'S10',x:m.x,z:m.z,radius:1.8,duration:5});
    }
    return true;
   }
   if(ready(f,'S08')&&d<=10){
    use(f,'S08',target);const dx=f.x-target.x,dz=f.z-target.z,dd=Math.max(.001,Math.hypot(dx,dz));
    if(!clearPosition(f,dx/dd,dz/dd,3))staggeredSideStep(f,target,3);
    projectile(f,target,atk*.65*scaleSkill('S08'),'S08');
    return true;
   }
   if(ready(f,'S01')&&d<=9){
    use(f,'S01');const ax=f.x-target.x,az=f.z-target.z,dd=Math.max(.001,Math.hypot(ax,az));
    if(!clearPosition(f,ax/dd,az/dd,2.5))staggeredSideStep(f,target,2.5);
    f.s01Until=time+1.5;return true;
   }
   if(f.offenseDelay>0)return false;
   if(ready(f,'S03')&&d<=9.3){
    use(f,'S03',target);projectile(f,target,atk*.90*scaleSkill('S03'),'S03');
    const ax=f.x-target.x,az=f.z-target.z,dd=Math.max(.001,Math.hypot(ax,az));
    clearPosition(f,ax/dd,az/dd,1.5);return true;
   }
   if(ready(f,'S05')&&d<=9.3){
    use(f,'S05',target);projectile(f,target,atk*.95*scaleSkill('S05'),'S05',{weakening:.10*scaleSkill('S05')});return true;
   }

   if(ready(f,'E10')&&d<=9){
    use(f,'E10',target);zones.push({owner:f.id,talent:'E10',x:target.x,z:target.z,r:1.5,until:time+8,triggered:false});
    emit('zone',f,{talent:'E10',x:target.x,z:target.z,radius:1.5,duration:8});return true;
   }
   if(ready(f,'E02')&&d<=12){
    use(f,'E02');staggeredSideStep(f,target,3);
    f.speedUntil=time+2;return true;
   }
   if(ready(f,'E01')&&d<=8){
    use(f,'E01',target);
    zones.push({owner:f.id,talent:'E01',x:target.x,z:target.z,r:1.5,until:time+8,triggered:false});
    emit('zone',f,{talent:'E01',x:target.x,z:target.z,radius:1.5,duration:8});return true;
   }
   if(ready(f,'E04')&&d<=9){
    use(f,'E04',target);
    zones.push({owner:f.id,talent:'E04',x:target.x,z:target.z,r:2,until:time+7,last:{}});
    emit('zone',f,{talent:'E04',x:target.x,z:target.z,radius:2,duration:7});return true;
   }
   if(ready(f,'E05')&&d<=7){
    use(f,'E05',target);
    projectile(f,target,atk*.75*scaleSkill('E05'),'E05',{slow:.25,duration:1.5});
    return true;
   }
   const shotRange=f.stats.range*(f.passives.p08RangeReady?1+.08*scaleSkill('P08'):1);
   if(ready(f,'P10')&&d<=shotRange){
    use(f,'P10',target);prepareAoE(f,target,'P10',atk*.48*scaleSkill('P10'),.7,3,2);return true;
   }
   if(ready(f,'P06')&&d<=shotRange){
    use(f,'P06',target);projectile(f,target,atk*1.25*scaleSkill('P06'),'P06',{shieldBonus:.60});return true;
   }
   if(ready(f,'P05')&&d<=shotRange&&!target.markBy){use(f,'P05',target);projectile(f,target,atk*scaleSkill('P05'),'P05',{mark:true});return true}
   if(ready(f,'P01')&&d<=shotRange){use(f,'P01',target);projectile(f,target,atk*1.4*scaleSkill('P01'),'P01',{ignoreDefense:.10});return true}
   if(ready(f,'P03')&&d<=shotRange){use(f,'P03',target);for(let n=0;n<2;n++)projectile(f,target,atk*.58*scaleSkill('P03'),'P03');return true}
  }
  return false;
 }
 function update(rawStep=.05){
  if(finished)return {finished,winner,events:[],time,radius:0};
  const step=clamp(Number(rawStep)||.05,.001,.09),start=events.length;
  time+=step;
  const alive=()=>fighters.filter(f=>f.alive);
  // Per-frame soft reservations: reduce 3-on-1 dogpiles when comparably
  // close rivals are available. Not a forced duel or protected 1x1 arena.
  const aggroReservations=new Map();
  const radius=Math.max(3.2*scale,18*scale-Math.max(0,time-stormStart)*(.35*scale*shrinkFactor));
  for(const f of fighters){
   if(!f.alive)continue;
   f.gcd=Math.max(0,f.gcd-step);f.basic=Math.max(0,f.basic-step);
   f.slow=Math.max(0,f.slow-step);f.weak=Math.max(0,f.weak-step);f.fortress=Math.max(0,f.fortress-step);
   f.offenseDelay=Math.max(0,f.offenseDelay-step);
   if(rangedRecovery)f.shotRecovery=Math.max(0,f.shotRecovery-step);
   f.rage=Math.max(0,f.rage-step);
   if(f.t09Until>time)heal(f,f.t09Power*step,'T09');
   if(f.passives.t07Active&&(f.passives.t07Until<=time||f.shield<=0))f.passives.t07Active=false;
   if(has(f,'A07')&&!f.passives.a07Ready&&
     time-Math.max(0,f.lastHitAt)>=4&&(f.cooldowns.A07||0)<=0){
    f.passives.a07Ready=true;emit('charge',f,{talent:'A07'});
   }
   if(f.s02Until>time)heal(f,f.s02Power*step,'S02');
   if(f.s02Until>0&&f.s02Until<=time)f.s02Until=0;
   if(has(f,'S02')&&f.s02Until<=time&&f.hp<f.stats.hp-.1&&
     time-Math.max(0,f.lastHitAt)>=5&&(f.cooldowns.S02||0)<=0){
    f.cooldowns.S02=15;f.s02Until=time+4;f.s02Power=f.stats.hp*.02*effectiveness(f,'S02')/4;
    emit('proc',f,{talent:'S02'});
   }
   if(has(f,'T02')&&!f.passives.t02Ready&&time-Math.max(0,f.lastHitAt)>=5){
    f.passives.t02Ready=true;emit('charge',f,{talent:'T02'});
   }
   if(f.regenUntil>time){heal(f,f.regenPower*step,'G09')}
   if(f.runicRegenUntil>time)heal(f,f.runicRegenPower*step,'R07');
   if(f.hopeRegenUntil>time)heal(f,f.hopeRegenPower*step,'L06');
   if(f.mercyRegenUntil>time)heal(f,f.mercyRegenPower*step,'L09');
   if(f.lightRegenUntil>time){heal(f,f.lightRegenPower*step,'L01')}
   if(f.poisonUntil>time){
    const poisonOwner=byId.get(f.poisonOwner);
    if(poisonOwner&&poisonOwner.alive)applyHit(poisonOwner,f,f.poisonPower*step,{kind:'poison',skill:'E03',reflect:true});
   }
   if(f.solarUntil<=time)f.solarUntil=0;
   for(const id of Object.keys(f.cooldowns))f.cooldowns[id]=Math.max(0,f.cooldowns[id]-step);
   if(f.shieldUntil<=time){f.shield=0;f.shieldUntil=0}
   if(f.slow<=0)f.slowPower=0;if(f.weak<=0)f.weakPower=0;
   if(f.burning>0){const owner=byId.get(f.burnOwner);const burn=Math.min(f.burning,step);
    if(owner&&f.alive)applyHit(owner,f,f.burnPower*burn,{kind:'burn',skill:'E02',reflect:true});
    f.burning=Math.max(0,f.burning-step);
   }
   if(!f.alive)continue;
   // Mature G02 only if the wearer survives for four seconds after being hit.
   if(has(f,'L07')&&!f.passives.l07Ready&&(f.cooldowns.L07||0)<=0&&time-Math.max(0,f.lastHitAt)>=4){
    f.passives.l07Ready=true;emit('charge',f,{talent:'L07'});
   }
   if(has(f,'G02')&&f.passives.g02Start!==undefined&&!f.passives.g02Ready&&(f.cooldowns.G02||0)<=0&&time-f.passives.g02Start>=4){
    f.passives.g02Ready=true;emit('charge',f,{talent:'G02'});
   }
   const enemies=alive().filter(e=>e!==f);
   if(!enemies.length)continue;
   let target=enemies[0];
   if(spreadAggro){
    let best=Infinity;
    for(const rival of enemies){
     const distance=dist(f,rival);
     // Never redirect a fighter across half the map merely to avoid a duel.
     // Reciprocal engagement and recent target continuity reduce oscillation.
     const load=aggroReservations.get(rival.id)||0;
     const crowdPenalty=Math.min(2,load)*Math.min(4.0,Math.max(1.7,f.stats.range*.42));
     const continuity=f.lastTarget===rival.id?1.15:0;
     const reciprocal=rival.lastTarget===f.id?1.25:0;
     const score=distance+crowdPenalty-continuity-reciprocal;
     if(score<best-1e-7){best=score;target=rival}
    }
    aggroReservations.set(target.id,(aggroReservations.get(target.id)||0)+1);
    f.lastTarget=target.id;
   }else for(const rival of enemies)if(dist(f,rival)<dist(f,target))target=rival;
   // Expose the selected opponent in both modes for deterministic crowding QA.
   f.lastTarget=target.id;
   const dx=target.x-f.x,dz=target.z-f.z,d=Math.max(.001,Math.hypot(dx,dz));
   f.face=Math.atan2(dx,dz);
   const preferred=f.stats.range>3?Math.min(f.stats.range*.65,6.0):1.65;
   // Hunter can deliberately hold a clear firing lane to charge P02.
   // This is a genuine tactical cost: no strafing or retreat while aiming.
   const holdForAim=has(f,'P02')&&!f.passives.p02Ready&&(f.cooldowns.P02||0)<=0
    &&d>4&&d<=f.stats.range+.5;
   const chase=holdForAim?0:d>preferred+1?1:d<preferred-.7?-.6:0;
   const strafe=holdForAim?0:(d<preferred+5?.21:0)*((f.id.length+seed)%2?-1:1);
   if(has(f,'D08')&&f.hp/f.stats.hp>.60&&!f.passives.d08Observed){f.passives.d08Observed=true;emit('proc',f,{talent:'D08'})}
   const penalty=(f.fortress>0?.85:1)*(f.t04Until>time?.90:1)*(f.slow>0?1-f.slowPower:1)*(f.regenUntil>time?.88:1)*
     (f.speedUntil>time?1+.10*effectiveness(f,'E02'):1)*
     (f.a09Until>time?1+.12*effectiveness(f,'A09'):1)*
     (has(f,'S07')&&f.hp/f.stats.hp<.50?1+.10*effectiveness(f,'S07'):1)*
     (has(f,'D08')&&f.hp/f.stats.hp>.60?1+.08*effectiveness(f,'D08'):1)*
     (rangedRecovery&&f.shotRecovery>0?.24:1);
   const route=obstacleSteering&&chase>0?steeringDirection(f,target):null;
   const ux=route?.x??dx/d,uz=route?.z??dz/d;
   const goalVX=(ux*chase-uz*strafe)*f.stats.speed*penalty;
   const goalVZ=(uz*chase+ux*strafe)*f.stats.speed*penalty;
   const smoothing=1-Math.exp(-8*step);
   f.vx+=(goalVX-f.vx)*smoothing;f.vz+=(goalVZ-f.vz)*smoothing;
   if(has(f,'S07')&&f.hp/f.stats.hp<.50&&!f.passives.s07Seen){
    f.passives.s07Seen=true;emit('proc',f,{talent:'S07'});
   }
   // Last world position for genuine retreat-path trap placement.
   f.prevX=f.x;f.prevZ=f.z;
   const oldX=f.x,oldZ=f.z;
   const oldDist=d;
   f.x+=f.vx*step;f.z+=f.vz*step;
   // Slide around the inflated collider instead of allowing pillar clipping.
   for(const ob of obstacles){
    const x=f.x-ob.x,z=f.z-ob.z,rad=ob.r+.56,dd=Math.hypot(x,z);
    if(dd<rad){f.x=ob.x+x/Math.max(dd,.00001)*rad;f.z=ob.z+z/Math.max(dd,.00001)*rad}
   }
   if(has(f,'A03')&&!f.passives.a03Ready&&(f.cooldowns.A03||0)<=0){
    f.a03Travel+=Math.hypot(f.x-(f.a03LastX??oldX),f.z-(f.a03LastZ??oldZ));
    if(f.a03Travel>=4){f.passives.a03Ready=true;emit('charge',f,{talent:'A03'})}
   }
   f.a03LastX=f.x;f.a03LastZ=f.z;
   const speed=Math.hypot(f.vx,f.vz);
   f.animation=speed>.25?'run':'idle';
   if(f.build.klass==='hunter'&&has(f,'E07')){
    const a=f.passives.e07Anchor||(f.passives.e07Anchor={x:f.x,z:f.z});
    if(!f.passives.e07Ready&&(f.cooldowns.E07||0)<=0&&Math.hypot(f.x-a.x,f.z-a.z)>=3){
     f.passives.e07Ready=true;emit('charge',f,{talent:'E07'});
    }
   }
   if(speed<.32)f.stationaryTime+=step;else f.stationaryTime=0;
   if(has(f,'P02')&&f.stationaryTime>=3&&(f.cooldowns.P02||0)<=0&&!f.passives.p02Ready){
    f.passives.p02Ready=true;emit('charge',f,{talent:'P02'});
   }
   if(has(f,'B04')&&(f.cooldowns.B04||0)<=0&&oldDist-dist(f,target)>.018)f.movingTime+=step;
   else f.movingTime=Math.max(0,f.movingTime-step);
   if(has(f,'B04')&&f.movingTime>=2&&!f.passives.b04Ready){
    f.passives.b04Ready=true;f.movingTime=0;emit('charge',f,{talent:'B04'});
   }
   if(Math.hypot(f.x,f.z)>radius){const excess=Math.hypot(f.x,f.z)-radius;f.hp=Math.max(0,f.hp-step*(4+excess*4));endHero(f,null);if(!f.alive)continue}
   const basicRange=f.stats.range*(has(f,'P08')&&f.passives.p08RangeReady?1+.08*effectiveness(f,'P08'):1);
   if(!act(f,target,d)&&d<=basicRange&&f.basic<=0)basicAttack(f,target);
  }
  // Fixed-position traps and lures operate in the same world as the heroes.
  for(let i=zones.length-1;i>=0;i--){
   const zone=zones[i],owner=byId.get(zone.owner);
   if(!owner||!owner.alive||zone.until<=time){zones.splice(i,1);continue}
   for(const victim of fighters){
    if(!victim.alive||victim===owner||dist(zone,victim)>zone.r)continue;
    if(zone.talent==='S10'&&!zone.sharedHits.has(victim.id)){
     zone.sharedHits.add(victim.id);
     const hit=applyHit(owner,victim,owner.stats.attack*.55*effectiveness(owner,'S10'),
      {kind:'special',skill:'S10'});
     if(hit>0&&victim.alive)applySlow(victim,.12,1,owner,'S10');
     emit('trap',owner,{talent:'S10',target:victim.id,castId:zone.castId});
     continue;
    }
    if(['E01','E08','E10'].includes(zone.talent)&&!zone.triggered){
     if(zone.talent==='E08'){
      zone.triggered=true;
      applyHit(owner,victim,owner.stats.attack*.70*effectiveness(owner,'E08'),{kind:'special',skill:'E08'});
      emit('trap',owner,{talent:'E08',target:victim.id});
     }
     if(zone.talent==='E10'){
      zone.triggered=true;
      for(const hit of fighters)if(hit.alive&&hit!==owner&&dist(zone,hit)<=2)
       applyHit(owner,hit,owner.stats.attack*1.15*effectiveness(owner,'E10'),{kind:'special',skill:'E10'});
      emit('trap',owner,{talent:'E10',target:victim.id});
     }
     if(zone.talent==='E01'){
     zone.triggered=true;
     const inflicted=applyHit(owner,victim,owner.stats.attack*.90*effectiveness(owner,'E01'),{kind:'special',skill:'E01'});
     if(inflicted>0&&victim.alive)applySlow(victim,.20,2,owner);
     emit('trap',owner,{talent:'E01',target:victim.id});
     if(inflicted>0&&victim.alive&&has(owner,'E03')&&(owner.cooldowns.E03||0)<=0){
      owner.cooldowns.E03=12;victim.poisonUntil=time+3;victim.poisonPower=owner.stats.attack*.025*effectiveness(owner,'E03');
      victim.poisonOwner=owner.id;reactAilment(victim);emit('proc',owner,{talent:'E03',target:victim.id});
     }
     }
     if(has(owner,'E09')&&!owner.passives.e09NetUsed){
      owner.passives.e09NetUsed=true;owner.passives.e09NetReady=true;
      emit('charge',owner,{talent:'E09',target:victim.id});
     }
     break;
    }
    if(zone.talent==='E04'&&(!zone.last[victim.id]||time-zone.last[victim.id]>=1.4)){
     zone.last[victim.id]=time;applySlow(victim,.12,2,owner);
     emit('zone-effect',owner,{talent:'E04',target:victim.id});
    }
   }
   if(zone.triggered)zones.splice(i,1);
  }
  // A warning gives time to leave the marked area. Damage is applied only
  // at impact time, against the fighters physically inside its radius.
  for(let i=pending.length-1;i>=0;i--){
   const p=pending[i];if(time+1e-8<p.impactAt)continue;
   pending.splice(i,1);
   const caster=byId.get(p.owner);
   if(!caster||p.cancelled)continue;
   if(p.kind==='echo'){
    const victim=byId.get(p.targetId);
    if(caster.alive&&victim?.alive){emit('talent-impact',caster,{talent:'A05',target:victim.id});
     applyHit(caster,victim,p.damage,{kind:'echo',skill:'A05',ignoreDefense:1,reflect:true})}
    continue;
   }
   if(p.kind==='combo'||p.kind==='beam'){
    const victim=byId.get(p.targetId);
    const maxRange=p.kind==='beam'?(p.talent==='A08'?8:7):caster.stats.range;
    if(caster.alive&&victim?.alive&&dist(caster,victim)<=maxRange){
     emit('talent-impact',caster,{talent:p.talent,target:victim.id});
     applyHit(caster,victim,p.damage,{kind:p.kind==='combo'?'melee':'special',skill:p.talent});
    }else{emit('interrupted',caster,{talent:p.talent,target:p.targetId});if(p.kind==='combo')for(const q of pending)if(q.comboId===p.comboId)q.cancelled=true;}
    continue;
   }
   // B6 telegraphed skills do not hit post-mortem.
   if(['A10','J10'].includes(p.talent)&&!caster.alive)continue;
   if(p.shieldAfter&&caster.alive)shield(caster,p.shieldAfter,3);
   emit('talent-impact',caster,{talent:p.talent,x:p.x,z:p.z});
   for(const victim of fighters)if(victim.alive&&victim!==caster&&Math.hypot(victim.x-p.x,victim.z-p.z)<=p.radius){
    applyHit(caster,victim,p.damage,{kind:'special',skill:p.talent,reflect:!caster.alive});
   }
  }
  // Physical projectile segments, pillars first, interception by any unit.
  for(let i=projectiles.length-1;i>=0;i--){
   const p=projectiles[i],dx=p.vx*step,dz=p.vz*step,sx=p.x,sz=p.z;
   p.x+=dx;p.z+=dz;p.age+=step;
   const hitFraction=(o,rad)=>{
    const ux=sx-o.x,uz=sz-o.z,bb=ux*dx+uz*dz,aa=dx*dx+dz*dz,cc=ux*ux+uz*uz-rad*rad;
    if(cc<=0)return 0;if(bb>=0||aa<1e-10)return null;
    const det=bb*bb-aa*cc;if(det<0)return null;
    const t=(-bb-Math.sqrt(det))/aa;return t>=0&&t<=1?t:null;
   };
   let earliest=Infinity,victim=null,stone=false;
   for(const o of obstacles){const t=hitFraction(o,o.r+.2);if(t!==null&&t<earliest){earliest=t;stone=true;victim=null}}
   for(const f of fighters)if(f.alive&&f.id!==p.from){
    const t=hitFraction(f,.65);
    if(t!==null&&t<earliest){earliest=t;stone=false;victim=f}
   }
   if(earliest!==Infinity||p.age>4.5){
    projectiles.splice(i,1);
    if(stone)emit('blocked',byId.get(p.from),{talent:p.skill,kind:'pillar'});
    if(victim){
     const source=byId.get(p.from),effect=p.options;
     const amount=applyHit(source,victim,p.damage,{kind:effect.kind||'ranged',skill:p.skill,ignoreDefense:effect.ignoreDefense||0,fire:effect.fire||false,reflect:!source?.alive,shieldBonus:effect.shieldBonus||0});
     if(amount>0&&effect.chain&&source){
      let secondary=null;
      for(const candidate of fighters)if(candidate.alive&&candidate!==victim&&candidate!==source&&dist(candidate,victim)<=4){
       if(!secondary||dist(candidate,victim)<dist(secondary,victim))secondary=candidate;
      }
      if(secondary){applyHit(source,secondary,effect.chain,{kind:'special',skill:'E06',reflect:!source.alive});
       emit('chain',source,{target:secondary.id,from:victim.id,talent:'E06'})}
     }
     if(effect.interrupt&&source&&victim.alive){
      for(const pnd of pending)if(pnd.owner===victim.id&&pnd.impactAt>time)pnd.impactAt+=.5;
      emit('interrupt',source,{target:victim.id,talent:'P09'});
     }
     if(amount>0&&source&&has(source,'P07')&&(source.cooldowns.P07||0)<=0&&source.build.klass==='hunter'){
      source.passives.p07Hits=(source.passives.p07Hits||0)+1;
      if(source.passives.p07Hits>=3&&!source.passives.p07Ready){
       source.passives.p07Hits=0;source.passives.p07Ready=true;emit('charge',source,{talent:'P07'});
      }
     }
     if(amount>0&&effect.r08Weak&&source&&victim.alive){
      victim.r08Power=victim.r08Until>time?Math.max(victim.r08Power,effect.r08Weak):effect.r08Weak;victim.r08Until=time+3;
      emit('debuff',source,{target:victim.id,kind:'skill-weak',seconds:3,talent:'R08'});
     }
     if(amount>0&&effect.weakening&&source&&victim.alive){
      victim.weak=Math.max(victim.weak,3);victim.weakPower=Math.max(victim.weakPower,effect.weakening);
      emit('debuff',source,{talent:'S05',target:victim.id,kind:'weak',seconds:3});
     }
     if(amount>0&&effect.slow)applySlow(victim,effect.slow,effect.duration,source);
     if(amount>0&&effect.mark){victim.markBy=source.id;victim.markUntil=time+4;emit('mark',source,{target:victim.id,talent:'P05'})}
     if(amount>0&&source&&has(source,'P04')&&(source.cooldowns.P04||0)<=0){
      if(source.passives.p04Target===victim.id)source.passives.p04Hits=(source.passives.p04Hits||0)+1;
      else{source.passives.p04Target=victim.id;source.passives.p04Hits=1}
      if(source.passives.p04Hits>=2){source.passives.p04Ready=true;source.passives.p04Hits=0;emit('charge',source,{talent:'P04'})}
     }
    }
   }
  }
  const remaining=alive();
  if(remaining.length<=1||time>=limit){
   finished=true;winner=remaining.length===1?remaining[0]:[...fighters].sort((a,b)=>b.hp-a.hp||b.kills-a.kills||b.damage-a.damage||a.id.localeCompare(b.id))[0];
   emit('end',winner,{target:winner?.id||null,reason:remaining.length===1?'last-hero':'time-limit'});
  }
  return {finished,winner,time,radius,events:events.slice(start)};
 }
 function result(){return {finished,time:+time.toFixed(2),winner:winner?{id:winner.id,name:winner.name,klass:winner.build.klass}:null,
  events,standings:fighters.map(f=>({id:f.id,name:f.name,klass:f.build.klass,hp:f.hp,damage:f.damage,kills:f.kills,usage:{...f.usage},passives:{...f.passives}}))}}
 function run(steps=3000){for(let i=0;i<steps&&!finished;i++)update(.05);return result()}
 return {fighters,projectiles,obstacles,events,update,run,result,get time(){return time},get finished(){return finished},get winner(){return winner}};
}
return Object.freeze({VERSION,ATTR,CLASSES,TALENTS:ALL,canonical,exampleBuild,battle});
});
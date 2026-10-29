/* V5 Phase B.1 — executable M5 sandbox, 20 distinct talents.
 * Isolated from legacy V5 and student/server state. No XP or grading writes.
 * UMD: Node test runner and same browser GLB rendering pipeline.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PIT_V5_PHASE2=api})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const VERSION='phase2-m5-trial-v1';
const ATTR=['FOR','DES','INT','VIT','DEF'];
const CLASSES={
 warrior:{name:'Guerreiro',hp:137,atk:16.5,def:6.5,speed:4.5,range:2.6,palette:'ember'},
 mage:{name:'Arcanista',hp:78,atk:13.4,def:2.5,speed:3.7,range:8.5,palette:'amethyst'},
 hunter:{name:'Caçador',hp:93,atk:13,def:3.5,speed:4.4,range:9.3,palette:'jade'},
 guardian:{name:'Guardião',hp:140,atk:13.1,def:9,speed:3.9,range:2.6,palette:'azure'}
};
const TALENTS={
 warrior:[['B01','Golpe do Carrasco','ativo','FOR','DES',8],['B02','Sangue Quente','passivo','FOR','VIT',10],['B03','Fenda Sísmica','ativo','FOR','DEF',14],['B04','Ímpeto Predador','passivo','DES','FOR',12],['B05','Rugido da Ruína','ativo','VIT','FOR',18]],
 mage:[['E01','Lança de Cinzas','ativo','INT','DES',9],['E02','Combustão Residual','passivo','INT','VIT',10],['E03','Prisão de Gelo','ativo','INT','DEF',17],['E04','Estilhaço Polar','ativo','INT','DES',11],['E05','Pele Vulcânica','reativo','VIT','INT',18]],
 hunter:[['P01','Flecha Perfurante','ativo','DES','FOR',10],['P02','Mira Firme','passivo','DES','INT',10],['P03','Tiro Duplo','ativo','DES','FOR',8],['P04','Olhar Predador','passivo','DES','INT',12],['P05','Flecha Marcadora','ativo','DES','INT',15]],
 guardian:[['G01','Escudo da Alvorada','ativo','DEF','VIT',14],['G02','Armadura Consagrada','passivo','DEF','VIT',12],['G03','Retorno da Égide','reativo','DEF','FOR',18],['G04','Postura da Cidadela','ativo','DEF','VIT',20],['G05','Aço Resiliente','passivo','VIT','DEF',16]]
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
function exampleBuild(klass,name,mission=5){
 const selections={warrior:{FOR:5,DES:3,VIT:2},mage:{INT:6,DES:2,DEF:2},hunter:{DES:6,FOR:2,INT:2},guardian:{DEF:6,VIT:3,FOR:1}};
 const pointPool=mission*2, attributes=Object.fromEntries(ATTR.map(k=>[k,0]));
 let left=pointPool;
 for(const [k,v]of Object.entries(selections[klass]||{})){const n=Math.min(left,v);attributes[k]=n;left-=n}
 return canonical({klass,name,attributes,talents:ALL[klass].slice(0,mission).map(t=>t.id)},mission);
}
function effectiveness(f,id){
 const t=ALL[f.build.klass].find(t=>t.id===id);
 return Math.min(1.2,.75+.025*f.build.attributes[t.primary]+.0125*f.build.attributes[t.secondary]);
}
function battle(entries,{seed=4252,limit=95,arenaScale=1}={}){
 if(!Array.isArray(entries)||entries.length<2||entries.length>30)throw Error('Arena experimental aceita 2 a 30 heróis');
 const r=rng(seed),scale=clamp(arenaScale,1,5),used=new Set(),events=[],projectiles=[];
 let time=0,sequence=0,finished=false,winner=null,pid=0;
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
   weak:0,weakPower:0,fortress:0,markBy:null,markUntil:0,
   burning:0,burnPower:0,burnOwner:null,movingTime:0,stationaryTime:0,lastTarget:null,
   lastHitAt:-999,hitWindow:[],eliminatedAt:null};
 });
 const byId=new Map(fighters.map(f=>[f.id,f]));
 const has=(f,id)=>f.build.talents.includes(id);
 function use(f,id,target=null){
  f.cooldowns[id]=ALL[f.build.klass].find(t=>t.id===id).cooldown;
  f.gcd=.7;f.usage[id]=(f.usage[id]||0)+1;f.animation='cast';
  emit('talent',f,{talent:id,animationId:f.build.klass+'_'+id.toLowerCase(),name:ALL[f.build.klass].find(t=>t.id===id).name,target:target?.id||null});
 }
 function ready(f,id){return has(f,id)&&(f.cooldowns[id]||0)<=0&&f.gcd<=0}
 function shield(f,amount,seconds){
  f.shield=Math.min(f.stats.hp*.30,Math.max(0,f.shield)+amount);
  f.shieldUntil=Math.max(f.shieldUntil,time+seconds);
  emit('shield',f,{amount:+amount.toFixed(2),total:+f.shield.toFixed(2)});
 }
 function applySlow(f,fraction,duration,owner){
  if(!f.alive)return;
  if(f.slowPower<fraction||f.slow<=0)f.slowPower=fraction;
  f.slow=Math.max(f.slow,duration);
  emit('debuff',owner,{target:f.id,kind:'slow',fraction,duration});
 }
 function endHero(f,killer){
  if(!f.alive||f.hp>0)return;
  f.hp=0;f.alive=false;f.animation='defeated';f.eliminatedAt=time;
  if(killer&&killer!==f){killer.kills++;emit('knockout',killer,{target:f.id,by:killer.name})}
  else emit('storm',f,{target:f.id});
 }
 function applyHit(attacker,target,raw,{kind='basic',skill=null,ignoreDefense=0,fire=false,reflect=false}={}){
  if(!target?.alive||!attacker||(!attacker.alive&&!reflect))return 0;
  let amount=Math.max(0,raw);
  const defenseFactor=Math.max(.35,1-(target.stats.defense*(1-ignoreDefense))*.025);
  amount*=defenseFactor;
  if(target.fortress>0)amount*=.82;
  if(target.passives.g02Ready&&has(target,'G02')&&!reflect){
   amount*=1-.12*effectiveness(target,'G02');
   target.passives.g02Ready=false;target.cooldowns.G02=12;
   emit('proc',target,{talent:'G02',target:attacker.id});
  }
  if(attacker.weak>0)amount*=1-attacker.weakPower;
  if(!reflect&&r()<attacker.stats.crit)amount*=1.5;
  // P04 and P05 are one-charge, scoped to the hero that owns the effect.
  if(!reflect&&kind==='basic'&&has(attacker,'P04')&&attacker.passives.p04Ready){
   amount*=1+.08*effectiveness(attacker,'P04');attacker.passives.p04Ready=false;
   attacker.cooldowns.P04=12;emit('proc',attacker,{talent:'P04',target:target.id});
  }
  if(!reflect&&target.markBy===attacker.id&&target.markUntil>time){
   amount*=1+.12*effectiveness(attacker,'P05');target.markBy=null;target.markUntil=0;
   emit('proc',attacker,{talent:'P05',target:target.id});
  }
  // E05 creates protection after being hit: the current impact remains real.
  const shieldTaken=Math.min(target.shield,amount);target.shield-=shieldTaken;
  const inflicted=Math.max(0,amount-shieldTaken);
  target.hp=Math.max(0,target.hp-inflicted);
  attacker.damage+=inflicted;attacker.attacks++;
  target.lastHitAt=time;
  target.hitWindow.push({time,value:inflicted});
  target.hitWindow=target.hitWindow.filter(h=>time-h.time<=3);
  emit('hit',attacker,{target:target.id,amount:+inflicted.toFixed(2),absorbed:+shieldTaken.toFixed(2),kind,skill});
  if(target.hp<=0){endHero(target,attacker);return inflicted}
  if(has(target,'G02')&&!target.passives.g02Start)target.passives.g02Start=time;
  if(has(target,'G05')&&(target.cooldowns.G05||0)<=0&&target.hitWindow.reduce((s,h)=>s+h.value,0)>.15*target.stats.hp){
   target.cooldowns.G05=16;shield(target,7*effectiveness(target,'G05'),3);
   emit('proc',target,{talent:'G05',target:attacker.id});
  }
  if(!reflect&&has(target,'E05')&&(target.cooldowns.E05||0)<=0&&dist(attacker,target)<=3.1){
   target.cooldowns.E05=18;shield(target,10*effectiveness(target,'E05'),2);
   emit('proc',target,{talent:'E05',target:attacker.id});
   applyHit(target,attacker,target.stats.attack*.35*effectiveness(target,'E05'),{kind:'retaliation',skill:'E05',reflect:true});
  }
  if(!reflect&&shieldTaken>0&&has(target,'G03')&&(target.cooldowns.G03||0)<=0&&dist(attacker,target)<=3){
   target.cooldowns.G03=18;emit('proc',target,{talent:'G03',target:attacker.id});
   applyHit(target,attacker,target.stats.attack*.35*effectiveness(target,'G03'),{kind:'reflect',skill:'G03',reflect:true});
  }
  if(!reflect&&fire&&has(attacker,'E02')&&(attacker.cooldowns.E02||0)<=0){
   attacker.cooldowns.E02=10;target.burning=3;
   target.burnPower=attacker.stats.attack*.03*effectiveness(attacker,'E02');
   target.burnOwner=attacker.id;
   emit('proc',attacker,{talent:'E02',target:target.id});
  }
  return inflicted;
 }
 function projectile(f,target,damage,skill,options={}){
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
  f.basic=klass==='hunter'?1.23:klass==='mage'?1.16:1.02;
  f.animation='attack';
  if(kind==='ranged')projectile(f,target,amount,null,{kind:'basic'});
  else{applyHit(f,target,amount,{kind:'basic'});
   if(has(f,'B02')&&(f.cooldowns.B02||0)<=0){
    f.passives.b02Count=(f.passives.b02Count||0)+1;
    if(f.passives.b02Count>=2){f.passives.b02Count=0;f.passives.b02Ready=true;emit('charge',f,{talent:'B02'})}
   }
  }
 }
 function act(f,target,d){
  if(f.gcd>0)return false;
  const atk=f.stats.attack,scaleSkill=id=>effectiveness(f,id);
  const klass=f.build.klass;
  // Contextual priority; each cast is a *real* ability with its own CD.
  if(klass==='guardian'){
   if(ready(f,'G01')&&(f.shield<4||f.hp<f.stats.hp*.7)){use(f,'G01');const a=f.build.attributes;shield(f,20+1.5*a.DEF+.5*a.VIT,4);return true}
   if(ready(f,'G04')&&d<7&&f.fortress<=0){use(f,'G04');f.fortress=4;return true}
  }
  if(klass==='warrior'){
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
   if(ready(f,'E03')&&d<=8.5&&target.slow<=0){use(f,'E03',target);projectile(f,target,atk*.8*scaleSkill('E03'),'E03',{slow:.25,duration:2});return true}
   if(ready(f,'E04')&&d<=8.5&&target.slow>0){use(f,'E04',target);projectile(f,target,atk*1.25*scaleSkill('E04')*(target.slow>0?1.15:1),'E04');return true}
   if(ready(f,'E01')&&d<=9){use(f,'E01',target);projectile(f,target,atk*1.45*scaleSkill('E01'),'E01',{fire:true});return true}
  }
  if(klass==='hunter'){
   if(ready(f,'P05')&&d<=f.stats.range&&!target.markBy){use(f,'P05',target);projectile(f,target,atk*scaleSkill('P05'),'P05',{mark:true});return true}
   if(ready(f,'P01')&&d<=f.stats.range){use(f,'P01',target);projectile(f,target,atk*1.4*scaleSkill('P01'),'P01',{ignoreDefense:.10});return true}
   if(ready(f,'P03')&&d<=f.stats.range){use(f,'P03',target);for(let n=0;n<2;n++)projectile(f,target,atk*.58*scaleSkill('P03'),'P03');return true}
  }
  return false;
 }
 function update(rawStep=.05){
  if(finished)return {finished,winner,events:[],time,radius:0};
  const step=clamp(Number(rawStep)||.05,.001,.09),start=events.length;
  time+=step;
  const alive=()=>fighters.filter(f=>f.alive);
  const radius=Math.max(3.2*scale,18*scale-Math.max(0,time-18)*(.35*scale));
  for(const f of fighters){
   if(!f.alive)continue;
   f.gcd=Math.max(0,f.gcd-step);f.basic=Math.max(0,f.basic-step);
   f.slow=Math.max(0,f.slow-step);f.weak=Math.max(0,f.weak-step);f.fortress=Math.max(0,f.fortress-step);
   for(const id of Object.keys(f.cooldowns))f.cooldowns[id]=Math.max(0,f.cooldowns[id]-step);
   if(f.shieldUntil<=time){f.shield=0;f.shieldUntil=0}
   if(f.slow<=0)f.slowPower=0;if(f.weak<=0)f.weakPower=0;
   if(f.burning>0){const owner=byId.get(f.burnOwner);const burn=Math.min(f.burning,step);
    if(owner&&f.alive)applyHit(owner,f,f.burnPower*burn,{kind:'burn',skill:'E02',reflect:true});
    f.burning=Math.max(0,f.burning-step);
   }
   if(!f.alive)continue;
   // Mature G02 only if the wearer survives for four seconds after being hit.
   if(has(f,'G02')&&f.passives.g02Start!==undefined&&!f.passives.g02Ready&&(f.cooldowns.G02||0)<=0&&time-f.passives.g02Start>=4){
    f.passives.g02Ready=true;emit('charge',f,{talent:'G02'});
   }
   const enemies=alive().filter(e=>e!==f);
   if(!enemies.length)continue;
   let target=enemies[0];
   for(const e of enemies)if(dist(f,e)<dist(f,target))target=e;
   const dx=target.x-f.x,dz=target.z-f.z,d=Math.max(.001,Math.hypot(dx,dz));
   f.face=Math.atan2(dx,dz);
   const preferred=f.stats.range>3?Math.min(f.stats.range*.65,6.0):1.65;
   const chase=d>preferred+1?1:d<preferred-.7?-.6:0;
   const strafe=(d<preferred+5?.21:0)*((f.id.length+seed)%2?-1:1);
   const penalty=(f.fortress>0?.85:1)*(f.slow>0?1-f.slowPower:1);
   const goalVX=(dx/d*chase-dz/d*strafe)*f.stats.speed*penalty;
   const goalVZ=(dz/d*chase+dx/d*strafe)*f.stats.speed*penalty;
   const smoothing=1-Math.exp(-8*step);
   f.vx+=(goalVX-f.vx)*smoothing;f.vz+=(goalVZ-f.vz)*smoothing;
   const oldDist=d;
   f.x+=f.vx*step;f.z+=f.vz*step;
   // Slide around the inflated collider instead of allowing pillar clipping.
   for(const ob of obstacles){
    const x=f.x-ob.x,z=f.z-ob.z,rad=ob.r+.56,dd=Math.hypot(x,z);
    if(dd<rad){f.x=ob.x+x/Math.max(dd,.00001)*rad;f.z=ob.z+z/Math.max(dd,.00001)*rad}
   }
   const speed=Math.hypot(f.vx,f.vz);
   f.animation=speed>.25?'run':'idle';
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
   if(!act(f,target,d)&&d<=f.stats.range&&f.basic<=0)basicAttack(f,target);
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
     const amount=applyHit(source,victim,p.damage,{kind:effect.kind||'ranged',skill:p.skill,ignoreDefense:effect.ignoreDefense||0,fire:effect.fire||false,reflect:!source?.alive});
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
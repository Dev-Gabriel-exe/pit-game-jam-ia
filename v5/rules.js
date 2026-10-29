/* PIT GAME JAM IA V5 · deterministic browser auto-battler rules.
   No grades, accounts or room data are mutated by the arena. */
(function(root,factory){const rules=factory();if(typeof module==='object'&&module.exports)module.exports=rules;root.PIT_V5_RULES=rules;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const CLASSES=Object.freeze({
 warrior:{label:'Guerreiro',icon:'⚔',color:0xc47d59,hp:165,attack:16,speed:3.5,reach:2.5,defense:8,trait:'Golpe Sísmico'},
 arcanist:{label:'Arcanista',icon:'✦',color:0x8874df,hp:118,attack:19,speed:3.9,reach:7.3,defense:2,trait:'Nova Arcana'},
 hunter:{label:'Caçador',icon:'➶',color:0x82a984,hp:123,attack:17,speed:4.7,reach:7,defense:3,trait:'Disparo Duplo'},
 guardian:{label:'Guardião',icon:'⬡',color:0xd6ac6c,hp:186,attack:13,speed:3.2,reach:2.7,defense:10,trait:'Escudo Ancestral'}
});
const ATTRS=['forca','agilidade','vitalidade','arcano'];
const TALENTS=Object.freeze({
 fury:{label:'Fúria',desc:'+12% de dano por ponto (máx. 2)',max:2},
 steel:{label:'Armadura',desc:'+4 de defesa por ponto (máx. 2)',max:2},
 speed:{label:'Passos Sombrios',desc:'+8% de velocidade por ponto (máx. 2)',max:2},
 mana:{label:'Ressonância',desc:'+10% de poder especial por ponto (máx. 2)',max:2},
 life:{label:'Sangue Antigo',desc:'+20 de vida por ponto (máx. 2)',max:2},
 luck:{label:'Precisão',desc:'+6% de crítico por ponto (máx. 2)',max:2}
});
const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,Number(n)||0));
const clean=s=>String(s??'').replace(/[\x00-\x1f<>]/g,'').trim().slice(0,56)||'Aventureiro';
function xpFor(approved){return clamp(Math.floor(approved),0,10)*100}
function budget(xp){const level=Math.floor(clamp(xp,0,1000)/200);return {points:4+level*2,talents:level,level:1+Math.floor(clamp(xp,0,1000)/100)}}
function normalize(input,xp){
 const budgeted=budget(xp),cl=(input&&CLASSES[input.classId])?input.classId:'warrior',out={classId:cl,attrs:{},talents:{},appearance:{},name:clean(input?.name)};
 let spent=0;
 for(const a of ATTRS){const add=clamp(Math.floor(input?.attrs?.[a]),0,8);out.attrs[a]=Math.min(add,Math.max(0,budgeted.points-spent));spent+=out.attrs[a]}
 let points=0;
 for(const [key,t] of Object.entries(TALENTS)){const v=clamp(Math.floor(input?.talents?.[key]),0,t.max);out.talents[key]=Math.min(v,Math.max(0,budgeted.talents-points));points+=out.talents[key]}
 out.appearance={tone:clamp(Math.floor(input?.appearance?.tone),0,5),head:clamp(Math.floor(input?.appearance?.head),0,2),crest:clamp(Math.floor(input?.appearance?.crest),0,2)};
 return out;
}
function stats(build,xp){
 const b=normalize(build,xp),k=CLASSES[b.classId],a=b.attrs,t=b.talents;
 return {hp:Math.round(k.hp+a.vitalidade*11+t.life*20),
  attack:Math.round((k.attack+a.forca*2+a.arcano*(b.classId==='arcanist'?1.8:.45))*(1+.12*t.fury)),
  speed:(k.speed+a.agilidade*.12)*(1+.08*t.speed),reach:k.reach,defense:k.defense+a.vitalidade*.6+t.steel*4,
  special:1+a.arcano*.075+t.mana*.1,crit:.06+a.agilidade*.012+t.luck*.06};
}
function seeded(seed){let n=(seed>>>0)||123456789;return()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return ((n>>>0)%1000000)/1000000}}
function fighter(profile,i,total){
 const b=normalize(profile.build,profile.xp),s=stats(b,profile.xp),angle=i/Math.max(1,total)*Math.PI*2;
 return {id:String(profile.id??i),name:clean(profile.name),xp:clamp(profile.xp,0,1000),
  build:b,stats:s,hp:s.hp,maxHp:s.hp,x:Math.cos(angle)*8.8,z:Math.sin(angle)*8.8,
  cooldown:.5+i*.07,specialCooldown:3+i*.1,stun:0,shield:0,alive:true,kills:0,damage:0,
  attackPhase:0,flash:0,angle:0,walk:0};
}
function begin(roster,seed=8101){
 if(!Array.isArray(roster)||roster.length<2)throw Error('A arena precisa de pelo menos dois heróis.');
 if(roster.length>24)throw Error('Máximo de 24 heróis por batalha.');
 const fighters=roster.map((p,i)=>fighter(p,i,roster.length));
 return {fighters,elapsed:0,over:false,winner:null,events:[],rand:seeded(seed),seed,sequence:0,limits:13};
}
function damage(from,target,amount,world,kind){
 if(!target.alive||!from.alive)return;
 const critical=world.rand()<from.stats.crit;
 const armor=Math.max(0,target.stats.defense);
 let actual=Math.max(2,Math.round(amount*(critical?1.65:1)*100/(100+armor*5)));
 if(target.shield>0){const absorbed=Math.min(target.shield,actual);target.shield-=absorbed;actual-=absorbed}
 target.hp=Math.max(0,target.hp-actual);from.damage+=actual;target.flash=.25;
 const event={type:'hit',from:from.id,to:target.id,value:actual,critical,kind,x:target.x,z:target.z};
 world.events.push(event);
 if(target.hp<=0){target.alive=false;from.kills++;world.events.push({type:'elimination',from:from.id,to:target.id,name:target.name})}
}
function performSpecial(hero,target,world){
 const classId=hero.build.classId,power=hero.stats.special;
 if(classId==='warrior'){
  for(const other of world.fighters){if(other.alive&&other!==hero&&Math.hypot(other.x-hero.x,other.z-hero.z)<3.5){
   damage(hero,other,hero.stats.attack*1.45*power,world,'shock');
   const d=Math.hypot(other.x-hero.x,other.z-hero.z)||1;
   other.x+=(other.x-hero.x)/d*.75;other.z+=(other.z-hero.z)/d*.75;
  }}
  world.events.push({type:'special',kind:'shock',x:hero.x,z:hero.z,from:hero.id});
 }else if(classId==='arcanist'){
  for(const other of world.fighters){if(other.alive&&other!==hero&&Math.hypot(other.x-target.x,other.z-target.z)<2.9)
   damage(hero,other,hero.stats.attack*1.25*power,world,'arcane')}
  world.events.push({type:'special',kind:'arcane',x:target.x,z:target.z,from:hero.id});
 }else if(classId==='hunter'){
  damage(hero,target,hero.stats.attack*.88*power,world,'arrow');
  if(target.alive)damage(hero,target,hero.stats.attack*.88*power,world,'arrow');
  world.events.push({type:'special',kind:'arrow',x:hero.x,z:hero.z,from:hero.id,to:target.id});
 }else{
  hero.shield=Math.min(80,hero.shield+30*power);
  hero.hp=Math.min(hero.maxHp,hero.hp+12*power);
  world.events.push({type:'special',kind:'shield',x:hero.x,z:hero.z,from:hero.id});
 }
 hero.specialCooldown=6.7+world.rand()*1.5;
}
function step(world,dt){
 if(world.over)return world;
 dt=clamp(dt,0,.08);world.elapsed+=dt;world.events=[];
 const f=world.fighters,alive=f.filter(x=>x.alive);
 if(alive.length<=1||world.elapsed>240){world.over=true;world.winner=(alive.sort((a,b)=>b.hp-a.hp)[0]||null);world.events.push({type:'victory',name:world.winner?.name||'Ninguém'});return world}
 for(const h of f){
  if(!h.alive)continue;
  h.cooldown-=dt;h.specialCooldown-=dt;h.flash=Math.max(0,h.flash-dt);h.attackPhase=Math.max(0,h.attackPhase-dt*3);
  if(h.stun>0){h.stun-=dt;continue}
  let target=null,nearest=Infinity;
  for(const rival of f){if(rival===h||!rival.alive)continue;
   const d=Math.hypot(rival.x-h.x,rival.z-h.z);if(d<nearest){target=rival;nearest=d}
  }
  if(!target)continue;
  const dx=target.x-h.x,dz=target.z-h.z,d=Math.max(.0001,Math.hypot(dx,dz));
  h.angle=Math.atan2(dx,dz);
  const ideal=h.stats.reach*.76;
  let move=d>ideal?1:(d<ideal*.6?-0.58:0);
  if(h.build.classId==='arcanist'||h.build.classId==='hunter')move=d>h.stats.reach*.8?1:(d<h.stats.reach*.48?-.8:0);
  const nx=h.x+dx/d*move*h.stats.speed*dt,nz=h.z+dz/d*move*h.stats.speed*dt;
  // Repel close neighbours to avoid a single stack of character meshes.
  let repelX=0,repelZ=0;
  for(const other of f){if(other===h||!other.alive)continue;const vx=h.x-other.x,vz=h.z-other.z,dist=Math.hypot(vx,vz);if(dist>.01&&dist<1.25){repelX+=vx/dist*(1.25-dist);repelZ+=vz/dist*(1.25-dist)}}
  const x=nx+repelX*dt*3,z=nz+repelZ*dt*3,rr=Math.hypot(x,z);
  h.x=rr>world.limits?x*world.limits/rr:x;h.z=rr>world.limits?z*world.limits/rr:z;
  h.walk+=Math.abs(move)*dt*9;
  if(d<h.stats.reach&&h.cooldown<=0){damage(h,target,h.stats.attack,world,h.build.classId==='arcanist'?'arcane':h.build.classId==='hunter'?'arrow':'slash');h.cooldown=1.05*(4/h.stats.speed)+world.rand()*.15;h.attackPhase=1}
  if(d<Math.max(3,h.stats.reach)&&h.specialCooldown<=0)performSpecial(h,target,world);
 }
 return world;
}
return Object.freeze({CLASSES,ATTRS,TALENTS,xpFor,budget,normalize,stats,begin,step,clean});
});
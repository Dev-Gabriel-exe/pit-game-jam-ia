/* PIT GAME JAM V5 — game rules (UMD for browsers and Node CI).
 * No database, canvas, DOM or API dependencies: deterministic and testable.
 * All awarded XP must be provided by trusted server data in production.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PIT_V5_CORE=api})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const VERSION=5;
const CLASS={
 warrior:{label:'Bárbaro',icon:'⚒',color:'#e4a266',hp:145,speed:4.65,range:2.5,attack:16.5,defense:7,magic:0,ability:'Golpe sísmico'},
 mage:{label:'Arcanista',icon:'✦',color:'#b79afa',hp:75,speed:3.3,range:7.4,attack:11.4,defense:2,magic:7,ability:'Explosão arcana'},
 hunter:{label:'Patrulheiro',icon:'➶',color:'#98d4a1',hp:94,speed:4.15,range:9.1,attack:11.4,defense:3,magic:1,ability:'Flecha dupla'},
 guardian:{label:'Guardião',icon:'◆',color:'#86baca',hp:130,speed:3.8,range:2.25,attack:12.6,defense:9,magic:2,ability:'Fortaleza'},
 rogue:{label:'Ladino',icon:'⟡',color:'#c79dcc',hp:87,speed:5.0,range:1.9,attack:13.7,defense:3.5,magic:1,ability:'Emboscada'},
 necromancer:{label:'Necromante',icon:'☠',color:'#a79bbf',hp:83,speed:3.5,range:8.3,attack:13,defense:2.5,magic:6,ability:'Chamado das Sombras'}
};
const STATS={power:'Força',agility:'Agilidade',spirit:'Espírito',vitality:'Vitalidade'};
const TALENTS={
 warrior:[
  {id:'fury',name:'Fúria',desc:'+12% de ataque por ponto',max:3,requires:[]},
  {id:'guardbreak',name:'Quebra-escudo',desc:'Ignores 2 de armadura por ponto',max:3,requires:['fury']},
  {id:'leech',name:'Sede de batalha',desc:'Recupera vida ao acertar',max:2,requires:['fury']},
  {id:'shout',name:'Grito de guerra',desc:'Golpe especial mais frequente',max:2,requires:['guardbreak']},
  {id:'stamina',name:'Resistência',desc:'Vida máxima ampliada',max:3,requires:[]},
  {id:'berserk',name:'Berserker',desc:'Ataque acelera quando ferido',max:2,requires:['leech']}
 ],
 mage:[
  {id:'rune',name:'Runas',desc:'+12% de dano mágico',max:3,requires:[]},
  {id:'chain',name:'Corrente arcana',desc:'Projéteis ricocheteiam em alvos',max:2,requires:['rune']},
  {id:'nova',name:'Nova',desc:'Área do especial aumentada',max:2,requires:['rune']},
  {id:'ward',name:'Barreira',desc:'Escudo temporário após golpe especial',max:3,requires:[]},
  {id:'focus',name:'Concentração',desc:'Especial recarrega mais rápido',max:2,requires:['ward']},
  {id:'meteor',name:'Meteoro',desc:'Explosão adicional',max:1,requires:['chain','nova']}
 ],
 hunter:[
  {id:'precision',name:'Precisão',desc:'Aumenta a chance de crítico',max:3,requires:[]},
  {id:'dash',name:'Passo fantasma',desc:'Movimento acelerado',max:3,requires:[]},
  {id:'multishot',name:'Rajada',desc:'Mais projéteis no especial',max:2,requires:['precision']},
  {id:'trap',name:'Armadilha',desc:'Reduz movimento dos inimigos',max:2,requires:['dash']},
  {id:'vamp',name:'Sobrevivente',desc:'Vida recuperada em acertos',max:2,requires:['trap']},
  {id:'eagle',name:'Olho de águia',desc:'Alcance extra',max:2,requires:['multishot']}
 ],
 guardian:[
  {id:'bulwark',name:'Bastião',desc:'Aumenta a armadura',max:3,requires:[]},
  {id:'heal',name:'Regeneração',desc:'Recupera vida a cada segundo',max:3,requires:[]},
  {id:'taunt',name:'Provocação',desc:'Ataque especial em área',max:2,requires:['bulwark']},
  {id:'thorn',name:'Espinhos',desc:'Reflete parte do dano',max:2,requires:['bulwark']},
  {id:'aegis',name:'Égide',desc:'Escudo adicional',max:2,requires:['heal']},
  {id:'last',name:'Último bastião',desc:'Defesa cresce com vida baixa',max:2,requires:['aegis']}
 ],
 rogue:[
  {id:'shadow',name:'Passos sombrios',desc:'Aumenta a velocidade',max:3,requires:[]},
  {id:'backstab',name:'Punhal certeiro',desc:'Aumenta a chance de crítico',max:3,requires:[]},
  {id:'poison',name:'Lâmina venenosa',desc:'Aumenta o dano das habilidades',max:3,requires:['backstab']},
  {id:'dodge',name:'Esquiva',desc:'Melhora a defesa',max:2,requires:['shadow']},
  {id:'ambush',name:'Emboscada',desc:'Reduz a recarga do especial',max:2,requires:['shadow']},
  {id:'execute',name:'Executor',desc:'Aumenta o ataque',max:2,requires:['poison']}
 ],
 necromancer:[
  {id:'hex',name:'Maldição',desc:'Aumenta o dano sombrio',max:3,requires:[]},
  {id:'drain',name:'Dreno vital',desc:'Restaura vida ao usar o especial',max:3,requires:[]},
  {id:'bones',name:'Armadura óssea',desc:'Aumenta a defesa',max:3,requires:['hex']},
  {id:'grave',name:'Ritual das sombras',desc:'Expande a área do especial',max:2,requires:['hex']},
  {id:'wraith',name:'Espectro',desc:'Reduz o intervalo entre especiais',max:2,requires:['drain']},
  {id:'harvest',name:'Ceifa',desc:'Aumenta o dano dos rituais',max:2,requires:['grave']}
 ]
};
const COLORS=['ember','amethyst','jade','azure','ashen','golden'];
const WEAPONS=['blade','staff','bow','axe'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
function int(v,a,b){return Math.trunc(clamp(v,a,b))}
function exp(approved=0,reviewScore=null){
 const done=int(approved,0,10);
 const review=reviewScore==null?null:int(reviewScore,0,10);
 return {missions:done,approvedXp:done*100,reviewXp:review==null?0:review*3,total:done*100+(review==null?0:review*3),review};
}
function level(xp){return Math.min(11,1+Math.floor(clamp(xp,0,1030)/100))}
function budgets(xp){const lvl=level(xp);return {level:lvl,attributes:6+2*(lvl-1),talents:Math.floor((lvl-1)/2),xp:int(xp,0,1030)}}
function seedBuild(name='Aventureiro',klass='warrior'){return {
 name:String(name||'Aventureiro').trim().slice(0,56),klass:CLASS[klass]?klass:'warrior',
 appearance:{palette:'ember',helmet:1,cape:true,weapon:({warrior:'axe',mage:'staff',hunter:'bow',guardian:'blade',rogue:'blade',necromancer:'staff'}[klass]||'blade')},
 attributes:{power:0,agility:0,spirit:0,vitality:0},talents:{}
}}
function canonical(input,serverName,awardedXp){
 const p=input&&typeof input==='object'?input:{},c=CLASS[p.klass]?p.klass:'warrior';
 const b=seedBuild(serverName,c);
 const src=p.appearance||{};b.appearance={
  palette:COLORS.includes(src.palette)?src.palette:'ember',
  helmet:int(src.helmet,0,3),cape:src.cape!==false,
  weapon:WEAPONS.includes(src.weapon)?src.weapon:({warrior:'axe',mage:'staff',hunter:'bow',guardian:'blade',rogue:'blade',necromancer:'staff'}[c]||'blade')
 };
 const available=budgets(awardedXp);
 for(const k of Object.keys(STATS))b.attributes[k]=int(p.attributes?.[k],0,available.attributes);
 const spent=Object.values(b.attributes).reduce((a,x)=>a+x,0);
 if(spent>available.attributes)throw Error('Atributos excedem os pontos disponíveis.');
 const parsed={};for(const t of TALENTS[c])parsed[t.id]=int(p.talents?.[t.id],0,t.max);
 let n=0;
 for(const t of TALENTS[c]){const v=parsed[t.id];n+=v;if(v&&t.requires.some(x=>!parsed[x]))throw Error('Talento requer habilidade anterior: '+t.name);}
 if(n>available.talents)throw Error('Talentos excedem o nível atual.');
 b.talents=parsed;
 return {...b,spentAttributes:spent,spentTalents:n,xp:available.xp,level:available.level,
  remainingAttributes:available.attributes-spent,remainingTalents:available.talents-n};
}
function derived(b){
 const c=CLASS[b.klass]||CLASS.warrior,a=b.attributes||{},t=b.talents||{};
 const s=k=>int(a[k],0,30),r=k=>int(t[k],0,3);
 let hp=c.hp+s('vitality')*11+(r('stamina')*15)+(r('aegis')*11)+r('bones')*8;
 let speed=c.speed+s('agility')*.09+r('dash')*.22+r('shadow')*.18;
 // Previously magic*spirit*.22 inflated Arcanista damage far above melee.
 // Strength must improve every build, but ranged sustained DPS pays for
 // range/safety. Melee frontliners receive a slightly better power coefficient.
 const powerScaling=b.klass==='hunter'?1.08:b.klass==='mage'?1.25:b.klass==='warrior'?1.55:1.4;
 // Mage's basic bolt must not multiply Spirit twice. High Spirit builds
 // remain stronger, but sacrifice HP and must time area spells to win.
 const spiritScaling=b.klass==='mage'?.65:(.55+c.magic*.08);
 let atk=c.attack+s('power')*powerScaling+s('spirit')*spiritScaling+(b.klass==='hunter'?s('agility')*.18:0);
 atk*=1+r('fury')*.12+r('rune')*.12+r('hex')*.10+r('execute')*.07;
 const defense=c.defense+s('vitality')*.6+r('bulwark')*2.5+r('dodge')*1.5+r('bones')*1.3;
 const range=c.range+r('eagle')*.8;
 const crit=clamp(.06+s('agility')*.011+r('precision')*.06+r('backstab')*.055,0,.42);
 const cooldown=Math.max(3.2,8-r('focus')*.8-r('shout')*.8-r('ambush')*.7-r('wraith')*.7);
 return {hp:Math.round(hp),speed,attack:atk,defense,range,crit,cooldown,special:c.ability};
}
function mulberry(seed){let v=(seed|0)>>>0;return ()=>{v+=0x6D2B79F5;let t=v;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
function hash(s){let h=2166136261;for(const char of String(s)){h^=char.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function battle(source,{seed=486,dt=.05,limit=180,arenaScale=1}={}){
 // Optional geometric scaling for a 30-participant spectator arena; legacy callers retain 1.
 const scale=clamp(arenaScale,1,5);
 const rnd=mulberry(seed),heroes=(Array.isArray(source)?source:[]).slice(0,48),used=new Set();
 const spawnPhase=rnd()*Math.PI*2;
 const fighters=heroes.map((input,i)=>{
  const name=String(input.name||'Aventureiro').slice(0,56),id=String(input.id||('hero-'+i)).slice(0,80);
  if(used.has(id))throw Error('Personagem duplicado.');used.add(id);
  // Trusted caller must canonicalize player build using server-awarded XP.
  const b=canonical(input,name,clamp(input.xp,0,1030)),stats=derived(b);
  const theta=i*2.3999632297+spawnPhase+(rnd()-.5)*.32;
  const rad=(5.2+Math.sqrt(i)*(scale>3?1.65:1.03)+(rnd()-.5)*1.25)*scale;
  return {id,name,build:b,stats,x:Math.cos(theta)*rad,z:Math.sin(theta)*rad,y:0,
   vx:0,vz:0,vy:0,face:theta,hp:stats.hp,shield:0,alive:true,attacks:0,kills:0,damage:0,
   basic:rnd()*.7,special:1.8+rnd()*3.8,slow:0,animation:'idle',sidestep:rnd()*6,stagger:0,rush:0,rushCooldown:rnd()*2,telegraph:false,aim:0,eliminatedAt:null};
 });
 let time=0,seq=0,winner=null,finished=false;
 const initialCount=fighters.length;
 const events=[];
 const log=(type,f,payload={})=>{const e={seq:++seq,time:+time.toFixed(2),type,hero:f?.id||null,...payload};events.push(e);return e};
 const obstacles=[{x:0,z:0,r:1.7},{x:5.5,z:-5.5,r:1.5},{x:-5.5,z:5.5,r:1.5},{x:5.7,z:5.7,r:1.2},{x:-5.7,z:-5.7,r:1.2}].map(o=>({...o,x:o.x*scale,z:o.z*scale,r:o.r*scale}));
 const projectiles=[];let projectileSeq=0;
 const areaHit=(f,radius,damage,except=null)=>{
  for(const o of fighters)if(o.alive&&o!==f&&o!==except&&Math.hypot(o.x-f.x,o.z-f.z)<radius)hit(f,o,damage,'special');
 };
 function hit(f,o,dmg,kind){
  if(!o.alive||!f.alive)return;
  let amount=Math.max(1,dmg-o.stats.defense*.43);
  // Class-intrinsic resistance while closing: being a frontline hero
  // must be a meaningful strategic option in a 30-player ranged FFA.
  if((o.build.klass==='warrior'||o.build.klass==='guardian')&&(kind==='ranged'||kind==='multishot'))amount*=.77;
  if(rnd()<f.stats.crit){amount*=1.6;log('critical',f,{target:o.id})}
  if(o.build.talents.last&&o.hp<o.stats.hp*.3)amount*=Math.max(.4,1-o.build.talents.last*.15);
  // A small agility-driven evasion window introduces reactive defensive play.
  // Keep it capped; otherwise ranged classes can become untouchable.
  if(rnd()<Math.min(.13,.025+o.stats.speed*.012)){log('dodge',o,{attacker:f.id});o.stagger=.18;return}
  const shieldAbsorbed=Math.min(o.shield,amount);o.shield-=shieldAbsorbed;amount-=shieldAbsorbed;
  o.hp=Math.max(0,o.hp-amount);f.damage+=amount;f.attacks++;o.stagger=Math.min(.32,.1+amount*.008);
  log('hit',f,{target:o.id,amount:+amount.toFixed(1),kind,x:o.x,z:o.z});
  // Limited frontline sustain to counter constant ranged focus in FFA.
  // Intrinsic provisional rule, NOT one of the 120 designed talent effects.
  if(f.build.klass==='warrior'&&kind==='melee')f.hp=Math.min(f.stats.hp,f.hp+Math.min(4.4,amount*.15));
  if(f.build.talents.leech||f.build.talents.vamp)f.hp=Math.min(f.stats.hp,f.hp+amount*(f.build.talents.leech||f.build.talents.vamp)*.028);
  if(o.build.talents.thorn)f.hp=Math.max(0,f.hp-amount*o.build.talents.thorn*.075);
  if(o.hp<=0){o.alive=false;o.eliminatedAt=time;f.kills++;o.animation='defeated';log('knockout',f,{target:o.id,by:f.name})}
  if(f.hp<=0){f.alive=false;f.eliminatedAt=time;f.animation='defeated';log('knockout',o,{target:f.id,by:o.name})}
 }
 function blocked(f,x,z){
  for(const o of obstacles){const dx=x-o.x,dz=z-o.z,d=Math.hypot(dx,dz),min=o.r+.56;
   if(d<min){const angle=Math.atan2(dz,dx);return {x:o.x+Math.cos(angle)*min,z:o.z+Math.sin(angle)*min}}}
  return {x,z};
 }
 function update(rawDt=dt){
  if(finished)return {finished,winner,events:[]};
  const step=Math.min(.09,Math.max(.001,Number(rawDt)||dt));
  time+=step;const start=events.length;
  const radius=Math.max(3.2*scale,18*scale-Math.max(0,time-18)*(scale===1?.13:.37*scale));
  // Rotate action order deterministically; the first fighter in the input
  // must not always enjoy first strike advantage.
  const startIndex=Math.floor(rnd()*Math.max(1,fighters.length));
  for(let order=0;order<fighters.length;order++){
   const f=fighters[(startIndex+order)%fighters.length];
   if(!f.alive)continue;
   f.basic=Math.max(0,f.basic-step);f.special=Math.max(0,f.special-step);
   f.slow=Math.max(0,f.slow-step);
   f.stagger=Math.max(0,f.stagger-step);
   f.sidestep=Math.max(0,f.sidestep-step);
   f.rush=Math.max(0,f.rush-step);
   f.rushCooldown=Math.max(0,f.rushCooldown-step);
   f.aim=Math.max(0,f.aim-step);
   if(f.build.talents.heal)f.hp=Math.min(f.stats.hp,f.hp+step*f.build.talents.heal*.45);
   const enemies=fighters.filter(e=>e.alive&&e!==f);if(!enemies.length)continue;
   enemies.sort((a,b)=>Math.hypot(a.x-f.x,a.z-f.z)-Math.hypot(b.x-f.x,b.z-f.z));
   const target=enemies[0],dx=target.x-f.x,dz=target.z-f.z,d=Math.max(.001,Math.hypot(dx,dz));
   f.face=Math.atan2(dx,dz);
   // Steering, acceleration, sidesteps and body avoidance replace the old
   // instant translation straight through another player's position.
   const ranged=f.stats.range>3;
   const preferred=ranged?Math.min(f.stats.range*.67,6.6):Math.max(1.25,f.stats.range*.79);
   const chase=d>preferred+1.2?1:d<preferred-.9?-0.65:0;
   const strafeSign=(hash(f.id)^seed)&1?1:-1;
   const strafe=(d<preferred+5&&d>1.5?0.27:0)*strafeSign;
   // Melee fighters need a readable, timed dash to close the gap against
   // permanent kiting. This is movement, not a teleport or hidden talent.
   if(!ranged&&d>5.2&&f.rushCooldown<=0){
    f.rush=1.35;
    f.rushCooldown=5.5+rnd()*1.2;
    if(f.build.klass==='warrior')f.shield=Math.min(f.stats.hp*.24,f.shield+20);
    log('dash',f,{target:target.id,x:f.x,z:f.z});
   }
   // A bow/staff cannot fire accurately while sprinting at full velocity.
   // A short, visible aiming commitment gives melee a real closing window.
   const slowFactor=(f.slow?0.58:1)*(f.rush>0?2.75:1)*(f.aim>0?.22:1);
   const desiredX=(dx/d*chase-dz/d*strafe)*f.stats.speed*slowFactor;
   const desiredZ=(dz/d*chase+dx/d*strafe)*f.stats.speed*slowFactor;
   const easing=1-Math.exp(-9*step);
   f.vx+=(desiredX-f.vx)*easing;
   f.vz+=(desiredZ-f.vz)*easing;
   const move=blocked(f,f.x+f.vx*step,f.z+f.vz*step);
   f.x=move.x;f.z=move.z;
   f.animation=(Math.hypot(f.vx,f.vz)>.3)?'run':'idle';
   // Arena ring is a soft physical boundary, followed by damage outside the storm.
   const cd=Math.hypot(f.x,f.z);
   if(cd>radius){const dist=cd-radius;f.hp=Math.max(0,f.hp-step*(4+dist*4));if(!f.hp){f.alive=false;f.eliminatedAt=time;log('storm',f,{target:f.id});continue}f.x*=Math.max(.94,1-step*.4);f.z*=Math.max(.94,1-step*.4)}
   if(d<=f.stats.range&&f.basic<=0){
    // Archery costs time to draw and aim; no free +50% DPS from range.
    f.basic=(f.build.klass==='hunter'?1.27:f.build.klass==='mage'?1.18:1.0)+(.18*rnd())-(f.build.talents.berserk&&f.hp<f.stats.hp*.5?.16:0);
    f.animation='attack';
    if(f.stats.range>3){
     f.aim=f.build.klass==='hunter'?.46:.32;
     projectiles.push({id:++projectileSeq,x:f.x,y:1.6,z:f.z,from:f.id,to:target.id,speed:16,damage:f.stats.attack*(f.build.klass==='hunter'?.87:1),kind:'ranged',age:0});
     log('launch',f,{target:target.id});
    }else hit(f,target,f.stats.attack,'melee');
   }
   // Do not cast offensive skills into empty space at 60+ units away.
   // The legacy special is still class-generic, not one of the 120 talents.
   // Do not consume a Warrior's seismic strike when the opponent is
   // outside its actual splash radius; this previously wasted most casts.
   const readyForSpecial=f.build.klass==='guardian'||
    (f.build.klass==='warrior'?d<=3.05:d<=Math.max(f.stats.range+1.3,4.2));
   if(f.special<=.55&&f.special>0&&readyForSpecial&&!f.telegraph){
    // Advance notice: observers can see where a dangerous ability comes from.
    // Does not secretly change damage/targeting rules.
    f.telegraph=true;log('prepare',f,{ability:f.stats.special,target:target.id,x:f.x,z:f.z});
   }
   if(f.special<=0&&readyForSpecial){
    f.telegraph=false;
    f.special=f.stats.cooldown+1.4*rnd();f.animation='cast';
    log('special',f,{ability:f.stats.special,x:f.x,z:f.z});
    if(f.build.klass==='mage'){
      areaHit(f,3.5+f.build.talents.nova*.75,f.stats.attack*1.18);
      if(f.build.talents.ward)f.shield+=8*f.build.talents.ward;
      if(f.build.talents.meteor)areaHit(f,5.5,f.stats.attack*.5);
    }else if(f.build.klass==='warrior')areaHit(f,3,f.stats.attack*1.8);
    else if(f.build.klass==='rogue'){
      areaHit(f,2.8,f.stats.attack*(1.55+f.build.talents.poison*.12));
      f.shield+=5+f.build.talents.dodge*4;
    }else if(f.build.klass==='necromancer'){
      areaHit(f,4.0+f.build.talents.grave*.65,f.stats.attack*(1.15+f.build.talents.harvest*.14));
      f.hp=Math.min(f.stats.hp,f.hp+7+f.build.talents.drain*5);
    }else if(f.build.klass==='guardian'){
      // The Guardian's close-range pulse needs an actual control effect
      // to compete with mobile ranged units. Shield remains capped.
      f.shield=Math.min(f.stats.hp*.35,f.shield+16+f.build.talents.aegis*10);
      const impactRadius=3.35+f.build.talents.taunt*.6;
      areaHit(f,impactRadius,f.stats.attack*1.03);
      for(const other of fighters){
       if(other.alive&&other!==f&&Math.hypot(other.x-f.x,other.z-f.z)<impactRadius){
        other.slow=Math.max(other.slow,1.5);
        log('slow',f,{target:other.id,seconds:1.5});
       }
      }
    }else{
      // Flecha dupla is a multi-target zoning tool, not two 115%-damage
      // missiles into the same victim every 8 s. No bonus on lone target.
      const targets=enemies.filter(e=>e.alive&&Math.hypot(e.x-f.x,e.z-f.z)<f.stats.range+1);
      const count=Math.min(targets.length,2+f.build.talents.multishot);
      for(let n=0;n<count;n++){
       const chosen=targets[n];
       projectiles.push({id:++projectileSeq,x:f.x,y:1.65,z:f.z,from:f.id,to:chosen.id,speed:18,damage:f.stats.attack*(n===0?.88:.61),kind:'multishot',age:0});
      }
      if(f.build.talents.trap)target.slow=2+f.build.talents.trap;
    }
   }
  }
  // Pairwise collision resolution. O(n²), but 30 players cost only 435
  // pairs per fixed step and prevents avatars walking through one another.
  for(let i=0;i<fighters.length;i++){
   const a=fighters[i];if(!a.alive)continue;
   for(let j=i+1;j<fighters.length;j++){
    const b=fighters[j];if(!b.alive)continue;
    const x=b.x-a.x,z=b.z-a.z,dist=Math.hypot(x,z);
    const minDistance=1.25;
    if(dist>=minDistance)continue;
    const nx=dist>.0001?x/dist:Math.cos((i+j)*2.4),nz=dist>.0001?z/dist:Math.sin((i+j)*2.4);
    const correction=(minDistance-Math.max(.0001,dist))*.51;
    a.x-=nx*correction;a.z-=nz*correction;
    b.x+=nx*correction;b.z+=nz*correction;
    const ca=blocked(a,a.x,a.z),cb=blocked(b,b.x,b.z);
    a.x=ca.x;a.z=ca.z;b.x=cb.x;b.z=cb.z;
   }
  }
  for(let i=projectiles.length-1;i>=0;i--){
   const p=projectiles[i],target=fighters.find(x=>x.id===p.to);
   if(!target?.alive){projectiles.splice(i,1);continue}
   const dx=target.x-p.x,dz=target.z-p.z,d=Math.max(.00001,Math.hypot(dx,dz));
   const v=p.speed*step,prevX=p.x,prevZ=p.z;
   p.x+=dx/d*v;p.z+=dz/d*v;p.age+=step;
   // The same collision radii used by walking actors now block arrows/spells.
   // Deterministic segment-vs-circle checks prevent shooting through pillars.
   let obstructed=false;
   for(const obstacle of obstacles){
    const segX=p.x-prevX,segZ=p.z-prevZ,len2=Math.max(.00001,segX*segX+segZ*segZ);
    const t=clamp(((obstacle.x-prevX)*segX+(obstacle.z-prevZ)*segZ)/len2,0,1);
    const qx=prevX+segX*t,qz=prevZ+segZ*t;
    if(Math.hypot(qx-obstacle.x,qz-obstacle.z)<obstacle.r+.2){obstructed=true;break}
   }
   if(obstructed){projectiles.splice(i,1);continue}
   if(d<=v+.7){const from=fighters.find(x=>x.id===p.from);if(from?.alive)hit(from,target,p.damage,p.kind);projectiles.splice(i,1)}
   else if(p.age>3)projectiles.splice(i,1);
  }
  const left=fighters.filter(x=>x.alive);
  if(left.length<=1||time>=limit){
   finished=true;
   // A timeout must not automatically crown the guardian merely because it
   // started with the largest *absolute* HP pool. Compare survival fraction,
   // then combat contribution.
   winner=(left.length===1?left[0]:left.length===0?
    fighters.slice().sort((a,b)=>(b.eliminatedAt??-1)-(a.eliminatedAt??-1)||b.kills-a.kills||b.damage-a.damage||a.id.localeCompare(b.id))[0]:
    left.slice().sort((a,b)=>
     (b.hp/b.stats.hp-a.hp/a.stats.hp)||b.kills-a.kills||b.damage-a.damage||a.id.localeCompare(b.id))[0])||null;
   // A rare simultaneous last storm KO is decided by survival time and
   // contribution, never by fabricated random victory.
   log('end',winner,{winner:winner?.id||null,reason:left.length===1?'last-hero':left.length===0?'last-fallen':'time-limit'});
  }
  return {finished,winner,events:events.slice(start),time,radius,fighters,projectiles};
 }
 function run(maxSteps=8000){for(let k=0;k<maxSteps&&!finished;k++)update();return result()}
 function result(){return {seed,time:+time.toFixed(1),winner:winner&&{id:winner.id,name:winner.name,klass:winner.build.klass},finished,
   standings:fighters.slice().sort((a,b)=>Number(b.alive)-Number(a.alive)||b.kills-a.kills||b.damage-a.damage).map(f=>({id:f.id,name:f.name,klass:f.build.klass,hp:+f.hp.toFixed(1),kills:f.kills,damage:+f.damage.toFixed(1),alive:f.alive})),
   events};}
 return {fighters,obstacles,projectiles,events,update,run,result,get time(){return time},get finished(){return finished},get winner(){return winner}};
}
return Object.freeze({VERSION,CLASS,STATS,TALENTS,COLORS,WEAPONS,exp,level,budgets,seedBuild,canonical,derived,battle,mulberry,hash});
});
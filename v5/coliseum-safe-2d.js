/* PIT Game Jam IA: emergency classroom-safe 2D battle viewer.
 * Uses the very same authoritative Phase2 engine/seed, without WebGL, GLB or CDNs.
 * No student progress, grades, XP or data can be changed by this viewer.
 */
(function(root){
 'use strict';
 const PALETTE={warrior:'#e8a468',mage:'#af9df8',hunter:'#92d3a0',guardian:'#98d7e9'};
 const W=960,H=540,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function createStage(container){
  if(!root.PIT_V5_PHASE2?.battle)throw Error('O motor da batalha ainda não carregou.');
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  canvas.className='pit-safe-canvas';canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label','Arena animada leve com os personagens da turma');
  const c=canvas.getContext('2d',{alpha:false});
  if(!c)throw Error('Canvas 2D indisponível');
  container.replaceChildren(canvas);
  container.dataset.v5QualityMode='safe-2d';
  container.dataset.v5GraphicsContext='2d';
  container.dataset.v5GraphicsLosses='0';
  container.dataset.v5FrameRate='20';
  let simulation=null,playing=false,disposed=false,focus=null,timer=null,animation=0;
  const sparks=[];
  function fighters(entries,options){
   if(!Array.isArray(entries)||entries.length<2||entries.length>30)throw Error('Participantes inválidos.');
   pause();simulation=root.PIT_V5_PHASE2.battle(entries,options);sparks.length=0;animation=0;focus=null;draw();
   return simulation;
  }
  function draw(){
   if(disposed)return;
   const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#1b192c');g.addColorStop(1,'#0a101c');
   c.fillStyle=g;c.fillRect(0,0,W,H);
   c.save();c.translate(W/2,H/2);
   const radius=204;
   for(let i=7;i>=1;i--){
    c.beginPath();c.arc(0,0,radius+6+i*2,0,2*Math.PI);
    c.strokeStyle=i%2?'rgba(194,143,82,.08)':'rgba(143,110,214,.06)';c.lineWidth=2;c.stroke();
   }
   const disc=c.createRadialGradient(0,0,24,0,0,radius);
   disc.addColorStop(0,'#393448');disc.addColorStop(.9,'#282536');disc.addColorStop(1,'#795942');
   c.fillStyle=disc;c.beginPath();c.arc(0,0,radius,0,Math.PI*2);c.fill();
   c.strokeStyle='#c39b62';c.lineWidth=5;c.stroke();
   c.strokeStyle='rgba(205,168,112,.17)';c.lineWidth=1;
   for(let r of [50,105,155]){c.beginPath();c.arc(0,0,r,0,2*Math.PI);c.stroke()}
   for(let j=0;j<12;j++){const theta=j*Math.PI/6;c.beginPath();c.moveTo(Math.cos(theta)*45,Math.sin(theta)*45);
    c.lineTo(Math.cos(theta)*radius,Math.sin(theta)*radius);c.stroke()}
   c.restore();
   if(!simulation){c.fillStyle='#eed2aa';c.font='bold 22px Georgia';c.textAlign='center';c.fillText('Aguardando o desafio...',W/2,H/2);return}
   const xs=simulation.fighters;
   const maxWorld=90;
   let knocked=0;
   for(let i=0;i<xs.length;i++){
    const f=xs[i],klass=f.build?.klass||'warrior',color=PALETTE[klass]||'#ffdd99';
    if(!f.alive)knocked++;
    if(!f.alive)continue;
    const x=W/2+clamp(f.x,-maxWorld,maxWorld)*2.18,z=H/2+clamp(f.z,-maxWorld,maxWorld)*2.18;
    const size=xs.length>12?9:14,selected=focus===f.id;
    c.beginPath();c.ellipse(x+1,z+size*.9,size+6,size*.58,0,0,Math.PI*2);
    c.fillStyle='rgba(0,0,0,.4)';c.fill();
    if(selected){c.beginPath();c.arc(x,z,size+9,0,Math.PI*2);c.strokeStyle='#f2e8a0';c.lineWidth=3;c.stroke()}
    const aura=c.createRadialGradient(x,z,2,x,z,size*2.8);aura.addColorStop(0,color+'cc');aura.addColorStop(1,color+'00');
    c.fillStyle=aura;c.beginPath();c.arc(x,z,size*2.8,0,2*Math.PI);c.fill();
    c.fillStyle=color;c.beginPath();c.arc(x,z,size,0,2*Math.PI);c.fill();
    c.strokeStyle='#241a26';c.lineWidth=2;c.stroke();
    c.fillStyle='#f7f0e2';c.font=(xs.length>12?'11px':'bold 13px')+' system-ui';
    c.textAlign='center';c.shadowColor='#090612';c.shadowBlur=5;
    const label=String(f.name||'Herói').slice(0,xs.length>12?13:18);
    c.fillText(label,x,z-size-10);c.shadowBlur=0;
    const bar=xs.length>12?28:43,hp=clamp(f.hp/Math.max(1,f.stats?.hp||1),0,1);
    c.fillStyle='#241c25';c.fillRect(x-bar/2,z+size+5,bar,4);
    c.fillStyle=hp>.5?'#8ee1a1':hp>.25?'#f6ca7e':'#ee7c83';
    c.fillRect(x-bar/2,z+size+5,bar*hp,4);
   }
   c.textAlign='left';c.shadowBlur=0;c.fillStyle='#eee0ce';c.font='bold 15px system-ui';
   c.fillText('⚔   '+(xs.length-knocked)+' em combate   ·   '+knocked+' na arquibancada',20,32);
   c.textAlign='right';c.fillStyle='#d4a76f';c.font='bold 14px system-ui';
   c.fillText('MODO SEGURO 2D · '+(playing?'AO VIVO':'PAUSADO'),W-22,32);
   c.fillStyle='#c5afc3';c.font='13px system-ui';c.textAlign='center';
   c.fillText('Combate calculado com os atributos e talentos oficiais da turma',W/2,H-19);
  }
  function frame(){
   if(disposed)return;
   if(playing&&simulation&&!simulation.finished){
    // Advance battle at up to 3x; rendering stays cheap and independent from server load.
    const iterations=simulation.fighters.length>12?2:3;
    try{for(let k=0;k<iterations&&!simulation.finished;k++)simulation.update(.05)}
    catch(e){playing=false;container.dataset.v5SafeError=e.message;console.error('safe arena',e)}
   }
   if(simulation?.finished)playing=false;
   draw();
  }
  timer=setInterval(frame,50);
  function pause(){playing=false}
  function resume(){if(simulation)playing=true}
  function dispose(){disposed=true;pause();clearInterval(timer);container.replaceChildren()}
  return Object.freeze({fighters,pause,resume,dispose,
   enableAutoCamera(){},overview(){},focusFighter(id){focus=String(id)},
   get simulation(){return simulation},get kind(){return 'safe-2d'}});
 }
 root.PIT_V5_SAFE_ARENA=Object.freeze({createStage});
})(window);

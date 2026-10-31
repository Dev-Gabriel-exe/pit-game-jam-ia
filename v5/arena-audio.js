/* V5 laboratory audio: event-driven positional mix. No remote audio, autoplay or student data.
 * This module must NEVER stop a WebGL frame if WebAudio is blocked or malfunctions.
 */
export function createArenaAudio({AudioContextClass=globalThis.AudioContext||globalThis.webkitAudioContext}={}){
 let ctx=null,master=null,disposed=false;
 const last=new Map(),active=[];
 const supported=!!AudioContextClass;
 function unlock(){
  if(disposed||!supported)return false;
  try{
   if(!ctx){ctx=new AudioContextClass();master=ctx.createGain();master.gain.value=.7;master.connect(ctx.destination)}
   if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   return true;
  }catch{return false}
 }
 function tone(freq,duration,volume,type,endFreq,output){
  const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);
  o.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),t+duration);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(g).connect(output);o.start(t);o.stop(t+duration+.015);
 }
 function noise(duration,volume,highpass,output){
  const n=Math.max(32,Math.floor(ctx.sampleRate*duration)),b=ctx.createBuffer(1,n,ctx.sampleRate);
  const data=b.getChannelData(0);
  for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.4);
  const s=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=b;filter.type='highpass';filter.frequency.value=highpass;g.gain.value=volume;
  s.connect(filter).connect(g).connect(output);s.start();
 }
 function play(kind,now=Date.now(),spatial=null){
  if(disposed||!ctx||ctx.state!=='running')return false;
  const cooldown={hit:190,shield:330,talent:340,knockout:550,victory:5000}[kind];
  if(cooldown===undefined)return false;
  if(now-(last.get(kind)??-Infinity)<cooldown)return false;
  const global=kind==='victory';
  const distance=Number(spatial?.distance);
  // Missing positional metadata stays quiet; it must not become a full-volume global blast.
  if(!global&&(!spatial||!Number.isFinite(distance)||distance>150))return false;
  const gain=global?1:Math.min(1,1/(1+Math.pow(Math.max(0,distance-5)/10,2)));
  if(!global&&gain<.006)return false;
  for(let i=active.length-1;i>=0;i--)if(active[i]<=now)active.splice(i,1);
  if(!global&&active.length>=3)return false;
  try{
   const channel=ctx.createGain();channel.gain.value=gain;
   if(!global&&ctx.createStereoPanner){
    const p=ctx.createStereoPanner();
    p.pan.value=Math.max(-.85,Math.min(.85,Number(spatial.pan)||0));
    channel.connect(p).connect(master);
   }else channel.connect(master);
   if(kind==='hit'){noise(.10,.11,700,channel);tone(400,.11,.055,'triangle',250,channel)}
   else if(kind==='shield'){noise(.14,.09,1050,channel);tone(940,.19,.07,'sine',640,channel)}
   else if(kind==='talent'){noise(.18,.10,900,channel);tone(580,.23,.07,'triangle',1020,channel)}
   else if(kind==='knockout'){noise(.23,.12,500,channel);tone(350,.28,.07,'triangle',160,channel)}
   else if(global){
    for(const [i,f] of [523,659,784,1046].entries()){
     const t=ctx.currentTime+i*.14,o=ctx.createOscillator(),g=ctx.createGain();
     o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);
     g.gain.linearRampToValueAtTime(.07,t+.025);
     g.gain.exponentialRampToValueAtTime(.0001,t+.42);
     o.connect(g).connect(channel);o.start(t);o.stop(t+.44);
    }
   }
   last.set(kind,now);
   if(!global)active.push(now+Math.min(330,{hit:125,shield:220,talent:260,knockout:300}[kind]));
   return true;
  }catch{
   // A broken/unsupported AudioContext must not break animation, physics or rendering.
   return false;
  }
 }
 function dispose(){
  disposed=true;last.clear();active.length=0;
  try{ctx?.close()?.catch(()=>{})}catch{}
  ctx=null;master=null;
 }
 return {unlock,play,dispose,get supported(){return supported},get unlocked(){return ctx?.state==='running'}};
}

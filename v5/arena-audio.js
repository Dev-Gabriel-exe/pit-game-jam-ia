/* V5 isolated arena audio: short high-passed impacts, metallic shield and victory chime.
 * No external files, no student data, no autoplay before a user gesture.
 */
export function createArenaAudio({AudioContextClass=globalThis.AudioContext||globalThis.webkitAudioContext}={}){
 let ctx=null, last=new Map(), disposed=false, master=null, active=[];
 const supported=!!AudioContextClass;
 function unlock(){
  if(disposed||!supported)return false;
  try{if(!ctx){ctx=new AudioContextClass();master=ctx.createGain();master.gain.value=.8;master.connect(ctx.destination)}if(ctx.state==='suspended')ctx.resume().catch(()=>{});return true}catch{return false}
 }
 function tone(freq,duration,volume,type='triangle',endFreq=freq,output=master){
  const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),t+duration);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(g).connect(output);o.start(t);o.stop(t+duration+.015);
 }
 function noise(duration,volume,highpass=700,output=master){
  const n=Math.max(32,Math.floor(ctx.sampleRate*duration)),b=ctx.createBuffer(1,n,ctx.sampleRate),data=b.getChannelData(0);
  // Perceptually crisp broadband attack, never low-pitched bass modulation.
  for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.4);
  const s=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=b;filter.type='highpass';filter.frequency.value=highpass;g.gain.value=volume;
  s.connect(filter).connect(g).connect(output);s.start();
 }
 function play(kind,now=Date.now(),spatial=null){
  if(disposed||!ctx||ctx.state!=='running')return false;
  const cooldown={hit:170,shield:330,talent:360,knockout:500,victory:5000}[kind]??200;
  const distance=spatial?.distance;
  if(kind!=='victory'&&Number.isFinite(distance)&&distance>25)return false;
  const falloff=kind==='victory'?1:!Number.isFinite(distance)?0.2:Math.min(1,Math.pow(Math.max(0,(25-distance)/25),2.3));
  if(kind!=='victory'&&falloff<.015)return false;
  active=active.filter(t=>t>now);
  if(kind!=='victory'&&active.length>=3)return false;
  if(kind!=='victory')active.push(now+Math.min(380,{hit:145,shield:260,talent:300,knockout:350}[kind]||180));
  const channel=ctx.createGain();channel.gain.value=falloff;
  const pan=Number.isFinite(spatial?.pan)?Math.max(-.85,Math.min(.85,spatial.pan)):0;
  if(ctx.createStereoPanner&&kind!=='victory'){const p=ctx.createStereoPanner();p.pan.value=pan;channel.connect(p).connect(master)}else channel.connect(master);
  if(now-(last.get(kind)??-Infinity)<cooldown)return false;
  last.set(kind,now);
  if(kind==='hit'){noise(.13,.14,430,channel);tone(470,.14,.08,'triangle',260,channel)}
  else if(kind==='shield'){noise(.19,.13,650,channel);tone(1050,.24,.08,'sine',670,channel);tone(1500,.16,.035,'triangle',1130,channel)}
  else if(kind==='talent'){noise(.25,.13,480,channel);tone(600,.32,.09,'sawtooth',1250,channel)}
  else if(kind==='knockout'){noise(.31,.15,350,channel);tone(390,.38,.09,'triangle',155,channel)}
  else if(kind==='victory'){[523,659,784,1046].forEach((f,i)=>{const delay=i*.14;const t=ctx.currentTime+delay;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.12,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.52);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.54)})}
  else return false;
  return true;
 }
 function dispose(){disposed=true;last.clear();if(ctx){ctx.close().catch(()=>{});ctx=null}}
 return {unlock,play,dispose,get supported(){return supported},get unlocked(){return ctx?.state==='running'}};
}

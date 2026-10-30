/* V5 isolated arena audio: short high-passed impacts, metallic shield and victory chime.
 * No external files, no student data, no autoplay before a user gesture.
 */
export function createArenaAudio({AudioContextClass=globalThis.AudioContext||globalThis.webkitAudioContext}={}){
 let ctx=null, last=new Map(), disposed=false, master=null;
 const supported=!!AudioContextClass;
 function unlock(){
  if(disposed||!supported)return false;
  try{if(!ctx){ctx=new AudioContextClass();master=ctx.createGain();master.gain.value=.8;master.connect(ctx.destination)}if(ctx.state==='suspended')ctx.resume().catch(()=>{});return true}catch{return false}
 }
 function tone(freq,duration,volume,type='triangle',endFreq=freq){
  const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),t+duration);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),t+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(g).connect(master);o.start(t);o.stop(t+duration+.015);
 }
 function noise(duration,volume,highpass=700){
  const n=Math.max(32,Math.floor(ctx.sampleRate*duration)),b=ctx.createBuffer(1,n,ctx.sampleRate),data=b.getChannelData(0);
  // Perceptually crisp broadband attack, never low-pitched bass modulation.
  for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.4);
  const s=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=b;filter.type='highpass';filter.frequency.value=highpass;g.gain.value=volume;
  s.connect(filter).connect(g).connect(master);s.start();
 }
 function play(kind,now=Date.now()){
  if(disposed||!ctx||ctx.state!=='running')return false;
  const cooldown={hit:90,shield:220,talent:180,knockout:350,victory:5000}[kind]??200;
  if(now-(last.get(kind)??-Infinity)<cooldown)return false;
  last.set(kind,now);
  if(kind==='hit'){noise(.13,.27,430);tone(470,.14,.13,'triangle',260)}
  else if(kind==='shield'){noise(.19,.24,650);tone(1050,.24,.14,'sine',670);tone(1500,.16,.07,'triangle',1130)}
  else if(kind==='talent'){noise(.25,.22,480);tone(600,.32,.17,'sawtooth',1250)}
  else if(kind==='knockout'){noise(.31,.24,350);tone(390,.38,.16,'triangle',155)}
  else if(kind==='victory'){[523,659,784,1046].forEach((f,i)=>{const delay=i*.14;const t=ctx.currentTime+delay;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.12,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.52);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.54)})}
  else return false;
  return true;
 }
 function dispose(){disposed=true;last.clear();if(ctx){ctx.close().catch(()=>{});ctx=null}}
 return {unlock,play,dispose,get supported(){return supported},get unlocked(){return ctx?.state==='running'}};
}

/* PIT Game Jam V5 — F.1 director: deterministic, spectator-only plan selection.
 * Decisions read combat snapshots/events and NEVER mutate fighters or rules.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_CAMERA_DIRECTOR=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MIN_HOLD=4.2,MAX_HOLD=9.5;
 const interesting=Object.freeze({
  knockout:110,storm:105,end:150,prepare:65,talent:49,
  'talent-impact':55,dodge:36,hit:20
 });
 const live=(roster)=>roster.filter(f=>f.alive&&Number.isFinite(f.x)&&Number.isFinite(f.z));
 const id=f=>String(f.id);
 function createDirector({minHold=MIN_HOLD,maxHold=MAX_HOLD}={}){
  let active=false,plan=null,lastSwitch=-Infinity,revision=0,cuts=0,events=[];
  const coverage=new Map(),history=[],MAX_EVENTS=48;
  function reset(){
   active=false;plan=null;lastSwitch=-Infinity;revision=0;cuts=0;events=[];
   coverage.clear();history.length=0;
  }
  function start(){active=true;plan=null;lastSwitch=-Infinity;events=[]}
  function stop(){active=false;plan=null;events=[]}
  function observe(event,roster){
   if(!active||!event||!(event.type in interesting))return;
   const t=Number(event.time),alive=live(roster||[]);
   if(!Number.isFinite(t)||!alive.length)return;
   const a=alive.find(f=>id(f)===String(event.hero));
   const b=alive.find(f=>id(f)===String(event.target));
   const chosen=a||b;
   if(!chosen)return;
   const weight=interesting[event.type];
   // A genuine knockout targets the surviving victor, never the eliminated.
   events.push({time:t,hero:id(chosen),target:b? id(b):null,weight,
    type:event.type,highImpact:event.type==='prepare'||event.type==='talent-impact'});
   if(events.length>MAX_EVENTS)events.shift();
  }
  function tick(time,roster){
   if(!active||!Array.isArray(roster))return null;
   const now=Number(time),alive=live(roster);
   if(!Number.isFinite(now)||!alive.length)return plan;
   const count=alive.length,aliveIDs=new Set(alive.map(id));
   if(plan?.ids?.some(v=>!aliveIDs.has(v))&&plan.mode!=='victory'&&plan.mode!=='overview'){
    // A killed highlight is never held until its normal expiry.
    lastSwitch=-Infinity;
   }
   // Last survivor must immediately switch to the winner, even mid-hold.
   if(plan&&now-lastSwitch<minHold&&count>1)return plan;
   const high=events.filter(e=>now-e.time>=0&&now-e.time<=5&&aliveIDs.has(e.hero));
   // Prevent hero lock-in: screen time is credited only when a plan changes.
   const least=(f)=>coverage.get(id(f))||0;
   const candidates=high.map(e=>{
    const anchor=alive.find(f=>id(f)===e.hero);
    const partner=e.target?alive.find(f=>id(f)===e.target):null;
    return {event:e,anchor,partner,score:e.weight-Math.min(80,least(anchor)*13)-
     (plan?.ids?.includes(id(anchor))?16:0)-(now-e.time)*3};
   }).sort((a,b)=>b.score-a.score||a.event.time-b.event.time||id(a.anchor).localeCompare(id(b.anchor)));
   let proposal;
   if(count===1){
    proposal={mode:'victory',ids:[id(alive[0])],reason:'winner',priority:150};
   }else if(count<=3){
    const sorted=[...alive].sort((a,b)=>least(a)-least(b)||id(a).localeCompare(id(b)));
    const first=sorted[0],second=[...alive].filter(x=>x!==first)
      .sort((a,b)=>Math.hypot(a.x-first.x,a.z-first.z)-Math.hypot(b.x-first.x,b.z-first.z))[0];
    proposal={mode:'climax',ids:[id(first),id(second)],reason:'final-survivors',priority:120};
   }else if(candidates.length&&candidates[0].score>=20){
    const best=candidates[0],anchor=best.anchor;
    // Natural 2-person framing if a target exists and remains alive, else pick
    // the nearest surviving fighter for contextual rather than empty close-ups.
    const partner=best.partner||alive.filter(f=>f!==anchor).sort((a,b)=>
     Math.hypot(a.x-anchor.x,a.z-anchor.z)-Math.hypot(b.x-anchor.x,b.z-anchor.z))[0];
    const two=partner&&Math.hypot(anchor.x-partner.x,anchor.z-partner.z)<=23;
    proposal={mode:two?'duel':'highlight',ids:two?[id(anchor),id(partner)]:[id(anchor)],
     reason:best.event.type,priority:best.event.weight};
   }else if(!plan||now-lastSwitch>=maxHold||plan.mode==='overview'){
    const byFairness=[...alive].sort((a,b)=>least(a)-least(b)||id(a).localeCompare(id(b)));
    // Every other idle cut returns to an inclusive overview, not perpetual
    // close-ups of the most damaging class.
    const wide=cuts%3===0||count>12&&cuts%3===1;
    if(wide)proposal={mode:'overview',ids:[],reason:'coverage',priority:8};
    else{
     const a=byFairness[0],b=[...alive].filter(f=>f!==a).sort((x,y)=>
      Math.hypot(x.x-a.x,x.z-a.z)-Math.hypot(y.x-a.x,y.z-a.z))[0];
     proposal={mode:'duel',ids:[id(a),id(b)],reason:'rotation',priority:16};
    }
   }else return plan;
   if(plan&&now-lastSwitch<maxHold&&proposal.priority<=plan.priority&&
      proposal.mode!=='climax'&&proposal.mode!=='victory')return plan;
   if(plan&&plan.mode===proposal.mode&&plan.ids.join('|')===proposal.ids.join('|')){
    // Same framing updates only after maxHold, avoiding jitter.
    return plan;
   }
   const next=Object.freeze({...proposal,at:now,revision:++revision});
   plan=next;lastSwitch=now;cuts++;
   for(const actor of proposal.ids)coverage.set(actor,(coverage.get(actor)||0)+1);
   history.push(next);if(history.length>40)history.shift();
   events=events.filter(e=>e.time>=now-2);
   return next;
  }
  function snapshot(){return {active,plan,revision,cuts,coverage:Object.fromEntries(coverage),history:[...history]}}
  return Object.freeze({start,stop,reset,observe,tick,snapshot});
 }
 return Object.freeze({MIN_HOLD,MAX_HOLD,createDirector});
});
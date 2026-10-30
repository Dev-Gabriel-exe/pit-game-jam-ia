'use strict';
/* H.3 M10 — cluster-aware diagnostics on the EXISTING factorial experiment.
 * One independent unit is a seed, NOT each correlated rotation or build.
 * Synthetic analysis only; no combat engine, XP, student or production writes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ARMS=['baseline','geometry','order','combined'];
const KINDS=['offensive','defensive','random'];
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const round=x=>Number(x.toFixed(4));
function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function bootstrap(xs,seed=0x91a5c71d,iterations=2000){
 assert(xs.length>=2&&xs.every(Number.isFinite));
 const random=rng(seed),samples=[];
 for(let i=0;i<iterations;i++){
  let total=0;
  for(let j=0;j<xs.length;j++)total+=xs[Math.floor(random()*xs.length)];
  samples.push(total/xs.length);
 }
 samples.sort((a,b)=>a-b);
 return {estimate:round(mean(xs)),
  low95:round(samples[Math.floor(.025*(iterations-1))]),
  high95:round(samples[Math.ceil(.975*(iterations-1))]),
  seedCount:xs.length,bootstrapDraws:iterations};
}
function seedMetrics(seedRow,expectedShifts){
 assert.equal(seedRow.shifts.length,expectedShifts);
 const rows=seedRow.shifts;
 assert.equal(new Set(rows.map(r=>r.shift)).size,expectedShifts);
 const scores=Object.fromEntries(ARMS.map(arm=>[arm,mean(rows.map(r=>{
  assert(typeof r.winners[arm]==='string'&&r.winners[arm].length>0);
  assert(['warrior','mage','hunter','guardian'].includes(r.winnerClasses[arm]));
  return Number(r.winnerClasses[arm]==='guardian');
 }))]));
 for(const row of rows){
  for(const arm of ARMS.slice(1)){
   assert.equal(row.changedVsBaseline[arm],row.winners[arm]!==row.winners.baseline);
  }
 }
 const changed=Object.fromEntries(ARMS.slice(1).map(arm=>[
  arm,mean(rows.map(r=>Number(r.changedVsBaseline[arm])))
 ]));
 return {seed:seedRow.seed,guardian:scores,changed,
  geometryEffect:scores.geometry-scores.baseline,
  orderEffect:scores.order-scores.baseline,
  interaction:scores.combined-scores.geometry-scores.order+scores.baseline};
}
function leaveOneSeedOut(rows,key){
 assert(rows.length>=3);
 const values=rows.map(key);
 assert(values.every(Number.isFinite));
 const full=mean(values);
 const leaveOut=values.map((_,i)=>mean(values.filter((__,j)=>i!==j)));
 const changes=leaveOut.map(x=>x-full);
 return {full:round(full),minWithoutOne:round(Math.min(...leaveOut)),
  maxWithoutOne:round(Math.max(...leaveOut)),
  maxAbsoluteShift:round(Math.max(...changes.map(Math.abs))),
  seedCount:rows.length,leaveOutBySeed:rows.map((r,i)=>({
   seed:r.seed,without:round(leaveOut[i]),shift:round(changes[i])}))};
}
function summarize(rows,seed){
 const metric=key=>bootstrap(rows.map(key),seed);
 return {
  guardianWinRate:Object.fromEntries(ARMS.map(a=>[a,metric(r=>r.guardian[a])])),
  winnerIdentityChange:Object.fromEntries(ARMS.slice(1).map(a=>[a,metric(r=>r.changed[a])])),
  geometryEffect:metric(r=>r.geometryEffect),
  orderEffect:metric(r=>r.orderEffect),
  geometryOrderInteraction:metric(r=>r.interaction),
  leaveOneSeedOut:{
   guardianBaseline:leaveOneSeedOut(rows,r=>r.guardian.baseline),
   geometryEffect:leaveOneSeedOut(rows,r=>r.geometryEffect),
   orderEffect:leaveOneSeedOut(rows,r=>r.orderEffect),
   interaction:leaveOneSeedOut(rows,r=>r.interaction),
   geometryWinnerChange:leaveOneSeedOut(rows,r=>r.changed.geometry)
  },
  seedValues:rows.map(r=>({seed:r.seed,geometryEffect:round(r.geometryEffect),
   orderEffect:round(r.orderEffect),interaction:round(r.interaction)}))
 };
}
// Regression fixtures for seed clustering, 2x2 sign, and deterministic bootstrap.
assert.deepEqual(bootstrap([0,0,0]),{estimate:0,low95:0,high95:0,seedCount:3,bootstrapDraws:2000});
assert.deepEqual(bootstrap([1,1,1]),{estimate:1,low95:1,high95:1,seedCount:3,bootstrapDraws:2000});
assert.deepEqual(bootstrap([0,1,0,1]),bootstrap([0,1,0,1]));
const synthetic={seed:17,shifts:[{shift:1,
 winners:{baseline:'a',geometry:'b',order:'c',combined:'d'},
 winnerClasses:{baseline:'warrior',geometry:'guardian',order:'guardian',combined:'warrior'},
 changedVsBaseline:{geometry:true,order:true,combined:true}}]};
const fixture=seedMetrics(synthetic,1);
assert.equal(fixture.geometryEffect,1);assert.equal(fixture.orderEffect,1);
assert.equal(fixture.interaction,-2);
const influenceFixture=leaveOneSeedOut([
 {seed:1,x:0},{seed:2,x:1},{seed:3,x:1},{seed:4,x:1}
],r=>r.x);
assert.equal(influenceFixture.full,.75);
assert.equal(influenceFixture.minWithoutOne,.6667);
assert.equal(influenceFixture.maxWithoutOne,1);
assert.equal(influenceFixture.maxAbsoluteShift,.25);
assert.deepEqual(leaveOneSeedOut([
 {seed:1,x:0},{seed:2,x:1},{seed:3,x:1},{seed:4,x:1}
],r=>r.x),influenceFixture);
const source=process.argv[2]||'qa/out/m10-factorial-seed-crossover.json';
const input=JSON.parse(fs.readFileSync(source,'utf8'));
assert.equal(input.schema,'pit-v5-m10-factorial-seed-crossover-v1');
assert.equal(input.totals.games,384);
assert.equal(input.totals.comparisons,324);
assert.equal(input.totals.m5Unchanged,true);
assert.equal(input.scenarios.length,3);
const output={schema:'pit-v5-m10-factorial-seed-analysis-v1',
 sourceHash:input.hash,unitOfInference:'independent seed (rotations clustered)',
 methods:'2000 deterministic cluster bootstrap draws resampling whole seeds; descriptive 95% percentile intervals',
 scenarios:[],limitations:[
  'Rotations within a seed and archetypes using the same seed are correlated; no rotation is an independent trial.',
  'Eight independent seeds in each 30-player composition (four in 4-player); bootstrap intervals are exploratory and unstable at this sample size.',
  'Leave-one-seed-out ranges diagnose sensitivity to one independent seed, not statistical significance or a fairness certificate.',
  'The interaction is a difference-in-differences of Guardian win indicators, not an attribution of combat mechanism.',
  'Actor-order intervention changes the actor loop only, not every update array; subsequent target/RNG paths may diverge.',
  'Selected builds are not representative of all 120 talents; no canonical balance changes or claims of fairness.',
  'G.2 physical PCs, H.1/H.2 real students and main integration remain blocked.'
 ]};
for(let si=0;si<input.scenarios.length;si++){
 const sc=input.scenarios[si],perKind={},raw={};
 assert([4,8].includes(sc.independentSeeds));
 for(let ki=0;ki<KINDS.length;ki++){
  const kind=KINDS[ki],item=sc.archetypes[kind];
  assert(item&&item.perSeed.length===sc.independentSeeds);
  const ids=item.perSeed.map(r=>r.seed);
  assert.equal(new Set(ids).size,ids.length);
  const metrics=item.perSeed.map(r=>seedMetrics(r,sc.shifts.length));
  assert.equal(item.games.baseline,sc.independentSeeds*sc.shifts.length);
  for(const arm of ARMS){
   const observed=metrics.reduce((sum,r)=>sum+r.guardian[arm]*sc.shifts.length,0);
   assert(Math.abs(observed-item.guardianWins[arm])<1e-8);
  }
  raw[kind]=metrics;
  perKind[kind]=summarize(metrics,(0x5c72f3a9^Math.imul(si+1,23)^ki)>>>0);
 }
 for(const kind of KINDS.slice(1)){
  assert.deepEqual(raw[kind].map(r=>r.seed),raw.offensive.map(r=>r.seed));
 }
 const paired=raw.defensive.map((r,i)=>r.guardian.baseline-raw.offensive[i].guardian.baseline);
 output.scenarios.push({name:sc.name,players:sc.players,guardianShare:sc.guardianShare,
  independentSeeds:sc.independentSeeds,correlatedShiftsPerSeed:sc.shifts.length,
  archetypes:perKind,pairedDefensiveMinusOffensiveBaseline:
   bootstrap(paired,(0x7a95ce01^si)>>>0),
  pairedDefensiveMinusOffensiveLeaveOneSeedOut:
   leaveOneSeedOut(raw.defensive.map((r,i)=>({
    seed:r.seed,difference:r.guardian.baseline-raw.offensive[i].guardian.baseline
   })),r=>r.difference)});
}
output.hash=crypto.createHash('sha256').update(JSON.stringify(output.scenarios)).digest('hex').slice(0,20);
const target=process.env.M10_FACTORIAL_ANALYSIS_FILE;
if(target){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(output,null,2)+'\n');}
console.log('M10 SEED ANALYSIS '+JSON.stringify(output.scenarios.map(s=>({
 scenario:s.name,seeds:s.independentSeeds,shifts:s.correlatedShiftsPerSeed,
 defensiveMinusOffensive:s.pairedDefensiveMinusOffensiveBaseline,
 defensiveSeedInfluence:s.pairedDefensiveMinusOffensiveLeaveOneSeedOut.maxAbsoluteShift,
 interaction:Object.fromEntries(KINDS.map(k=>[k,s.archetypes[k].geometryOrderInteraction])),
 interactionSeedInfluence:Object.fromEntries(KINDS.map(k=>[k,s.archetypes[k].leaveOneSeedOut.interaction.maxAbsoluteShift]))
}))));
console.log('PASS M10 seed-cluster analysis: 3 scenarios, 9 archetype cells, 4/8 independent seeds, fixture checks, M5 preserved; hash '+output.hash);

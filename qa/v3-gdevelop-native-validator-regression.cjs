'use strict';
// Disposable synthetic validator tests; NOT GDevelop gameplay evidence.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'pit-native-validator-'));
const validator=path.join(__dirname,'v3-gdevelop-native-results.cjs');
const projects=['examples/pit-qa-top-down/starting-top-down.json','examples/pit-qa-first-person/starting-first-person.json'];
const png=Buffer.alloc(80);Buffer.from([137,80,78,71,13,10,26,10]).copy(png);png.write('IHDR',12,'ascii');png.writeUInt32BE(640,16);png.writeUInt32BE(360,20);
const report={status:'FIXTURE_ONLY_NOT_NATIVE_PASS',projects,assets:['a.png','b.wav','c.glb'].map(name=>({name,bytes:100,sha256:'a'.repeat(64)}))};
function folder(project){return path.join(root,project.replace(/\\/g,'__').replace(/\\.json$/,''))}
function write(project,opts={}){
 const dir=folder(project);fs.mkdirSync(dir,{recursive:true});
 const shots=['pit-victory-before-earned.png','pit-victory-after-earned.png','pit-asset.png'];
 for(const file of shots)fs.writeFileSync(path.join(dir,file),opts.empty&&file==='pit-asset.png'?Buffer.alloc(0):png);
 const results=[{testName:'Official movement',status:'passed'},{testName:'Official collision',status:'passed'}];
 if(!opts.missing){
  results.push({testName:'PIT QA — asset',status:opts.failed?'failed':'passed',screenshots:[{file:'pit-asset.png'}]});
  results.push({testName:'PIT WIN — conditional',status:'passed',assertions:[{passed:true},{passed:true},{passed:true}],screenshots:[{file:shots[0]},{file:shots[1]}]});
 }
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results));
}
function run(){return cp.spawnSync(process.execPath,[validator,root],{encoding:'utf8',timeout:10000})}
try{
 fs.writeFileSync(path.join(root,'fixture-report.json'),JSON.stringify(report));
 for(const p of projects)write(p);
 let result=run();assert.equal(result.status,0,result.stderr);
 write(projects[0],{missing:true});assert.notEqual(run().status,0,'missing PIT test must fail');
 write(projects[0],{empty:true});assert.notEqual(run().status,0,'empty PNG must fail');
 write(projects[0],{failed:true});assert.notEqual(run().status,0,'failed test must fail');
 write(projects[0]);report.assets[0].sha256='invalid';fs.writeFileSync(path.join(root,'fixture-report.json'),JSON.stringify(report));
 assert.notEqual(run().status,0,'invalid asset SHA must fail');
 console.log('PASS: 5 isolated validator cases; synthetic data, not real gameplay');
}finally{fs.rmSync(root,{recursive:true,force:true})}

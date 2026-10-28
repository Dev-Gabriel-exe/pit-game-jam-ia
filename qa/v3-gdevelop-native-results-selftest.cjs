'use strict';
/* Isolated unit tests of the native evidence validator. The synthetic results
 * below are NOT real GDevelop execution and must never be cited as such.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const validator=path.resolve(__dirname,'v3-gdevelop-native-results.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pit-native-evidence-unit-'));
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/2XcAAAAASUVORK5CYII=','base64');
const projects=['examples/pit-qa-top-down/starting-top-down.json','examples/pit-qa-first-person/starting-first-person.json'];
const assetNames=['pit_explorador.png','pit_coleta.wav','pit_cristal.glb'];
const report={status:'FIXTURE_ONLY_NOT_NATIVE_PASS',projects,assets:assetNames.map(name=>({name,bytes:100,sha256:'a'.repeat(64)}))};
function resultDir(project){return path.join(dir,project.replace(/\//g,'__').replace(/\.json$/,''))}
function writeResults(project,{status='passed',pit=true,screenshot=true}={}){
 const dest=resultDir(project);
 fs.mkdirSync(path.join(dest,'gameplay-test-screenshots'),{recursive:true});
 const results=[{testName:'Official movement',status:'passed'},{testName:'Official collision',status:'passed'}];
 if(pit){
  results.push({testName:'PIT QA — generated asset',status,screenshots:[{file:'gameplay-test-screenshots/evidence.png'}]});
  results.push({testName:'PIT WIN — conditional event',status:'passed',assertions:[
   {message:'negative',passed:true},{message:'positive',passed:true},{message:'persistence',passed:true}
  ]});
 }
 fs.writeFileSync(path.join(dest,'results.json'),JSON.stringify(results));
 fs.writeFileSync(path.join(dest,'gameplay-test-screenshots','evidence.png'),screenshot?png:Buffer.alloc(0));
}
function run(){return cp.spawnSync(process.execPath,[validator,dir],{encoding:'utf8',timeout:10000})}
try{
 fs.writeFileSync(path.join(dir,'fixture-report.json'),JSON.stringify(report));
 for(const project of projects)writeResults(project);
 let r=run();assert.equal(r.status,0,'synthetic valid evidence must pass: '+r.stderr);
 console.log('PASS synthetic validator baseline');
 writeResults(projects[0],{pit:false});
 r=run();assert.notEqual(r.status,0,'missing PIT gameplay result rejected');
 console.log('PASS missing PIT result rejected');
 writeResults(projects[0],{screenshot:false});
 r=run();assert.notEqual(r.status,0,'empty screenshot rejected');
 console.log('PASS empty PNG screenshot rejected');
 writeResults(projects[0],{status:'failed'});
 r=run();assert.notEqual(r.status,0,'failed GDevelop gameplay assertion rejected');
 console.log('PASS failed gameplay assertion rejected');
 writeResults(projects[0]);
 report.assets[0].sha256='not-a-hash';
 fs.writeFileSync(path.join(dir,'fixture-report.json'),JSON.stringify(report));
 r=run();assert.notEqual(r.status,0,'invalid asset provenance rejected');
 console.log('PASS invalid asset hash rejected');
 console.log('PASS: 5 synthetic evidence-gate scenarios; NO actual GDevelop runtime claimed');
}finally{fs.rmSync(dir,{recursive:true,force:true})}

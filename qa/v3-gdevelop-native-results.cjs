'use strict';
/* REL-01: fail closed unless the OFFICIAL native GDevelop runner actually
 * executed the PIT 2D and 3D fixture gameplay tests and wrote screenshots.
 * Asset presence, JS mocks or a successful workflow exit are not enough.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||'qa/gdevelop-native-artifacts');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'fixture-report.json'),'utf8'));
assert.equal(manifest.status,'FIXTURE_ONLY_NOT_NATIVE_PASS');
assert.equal(manifest.projects.length,2);
for(const ext of ['.png','.wav','.glb']){
 const a=manifest.assets.find(x=>x.name.endsWith(ext));
 assert(a&&a.bytes>30&&/^[a-f0-9]{64}$/.test(a.sha256),'real PIT '+ext+' bytes and SHA256');
}
let count=0;
for(const project of manifest.projects){
 const id=project.replace(/\//g,'__').replace(/\.json$/,'');
 const resultFile=path.join(root,id,'results.json');
 assert(fs.existsSync(resultFile),'GDevelop results absent for '+project);
 const results=JSON.parse(fs.readFileSync(resultFile,'utf8'));
 assert(Array.isArray(results)&&results.length>=3,'official and PIT tests executed: '+project);
 for(const t of results)assert.equal(t.status,'passed','GDevelop gameplay test '+t.testName+' failed');
 const pit=results.filter(t=>String(t.testName||'').startsWith('PIT QA'));
 assert.equal(pit.length,1,'exactly one PIT test in '+project);
 const screenshots=pit[0].screenshots||[];
 assert(screenshots.length>=1,'GDevelop screenshot missing for '+project);
 for(const shot of screenshots){
  assert(shot.file,'native screenshot path missing');
  const screenshotRoot=path.join(root,id);
  const screenshotPath=path.resolve(screenshotRoot,shot.file);
  assert(screenshotPath.startsWith(screenshotRoot+path.sep),'screenshot must remain inside artifact folder');
  assert(fs.existsSync(screenshotPath),'native screenshot file '+shot.file);
  const image=fs.readFileSync(screenshotPath);
  const ext=path.extname(screenshotPath).toLowerCase();
  const png=ext==='.png'&&image.subarray(0,8).toString('hex')==='89504e470d0a1a0a';
  const jpeg=['.jpg','.jpeg'].includes(ext)&&image.length>4&&image[0]===255&&image[1]===216&&image[2]===255;
  assert(image.length>50&&(png||jpeg),
   'GDevelop screenshot must be nonempty PNG or JPEG with matching extension: '+shot.file);
 }
 count++;
 console.log('PASS real native GDevelop',project,results.length,'gameplay tests',screenshots.length,'PIT screenshot(s)');
}
assert.equal(count,2);
console.log('PASS: real GDevelop native runtime loaded PIT PNG (2D) and GLB (3D). WAV resource registered, not audibly tested.');
console.log('NOT CLAIMED: GUI drag-and-drop import, human-visible quality, real device, peer playtest or publication.');

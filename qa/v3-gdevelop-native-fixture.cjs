'use strict';
/* REL-01/FUN-08: prepare disposable REAL GDevelop projects with PIT-generated
 * PNG/GLB/WAV. GDevelop's upstream native gameplay runner opens the projects.
 * This fixture step alone does NOT establish editor import or Preview success.
 * Usage: node qa/v3-gdevelop-native-fixture.cjs /path/to/GDevelop-examples
 * Requires sharp (installed only in the isolated CI job).
 */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const sharp=require('sharp');

const sourceRoot=process.argv[2]&&path.resolve(process.argv[2]);
assert(sourceRoot&&fs.existsSync(path.join(sourceRoot,'examples','starting-top-down','starting-top-down.json')),
 'Supply a checked-out official GDevelop-examples repository');
assert(fs.existsSync(path.join(sourceRoot,'examples','starting-first-person','starting-first-person.json')));
assert(fs.existsSync(path.join(sourceRoot,'examples','starting-3d-tile-placement','starting-3d-tile-placement.json')));

const context={
 document:{querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null},
 window:{addEventListener:()=>{}},localStorage:{getItem:()=>null},
 console,Blob,TextEncoder,ArrayBuffer,DataView,Uint8Array,Float32Array,Uint16Array,Math,
 URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}},setTimeout:()=>{}
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('biblioteca.js','utf8'),context,{timeout:3000});
const api=context.window.PIT_LIBRARY_API;
assert(api&&api.assets&&api.assetBlob,'PIT library available');
const pick=id=>{const a=api.assets.find(a=>a.id===id);assert(a,'PIT asset '+id);return a};
const clone=x=>JSON.parse(JSON.stringify(x));
const newId=()=>crypto.randomUUID();
const assertMagic=(buffer,magic,offset=0)=>assert.equal(buffer.toString('ascii',offset,offset+magic.length),magic);

async function build(){
 const pngSource=vm.runInContext("svgAsset(assets.find(a=>a.id==='explorador'))",context,{timeout:3000});
 assert(pngSource.startsWith('<svg'),'PIT original SVG exists');
 const png=await sharp(Buffer.from(pngSource)).png().toBuffer();
 const glb=Buffer.from(await (await api.assetBlob(pick('glb-cristal'))).arrayBuffer());
 const wav=Buffer.from(await (await api.assetBlob(pick('wav-coleta'))).arrayBuffer());
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','real PNG signature');
 assertMagic(glb,'glTF');assert.equal(glb.readUInt32LE(8),glb.length,'GLB byte count');
 assertMagic(wav,'RIFF');assertMagic(wav,'WAVE',8);
 const resources=[
  {file:'assets/pit_explorador.png',name:'assets\\pit_explorador.png',kind:'image',metadata:'',smoothed:true,userAdded:true,bytes:png},
  {file:'assets/pit_coleta.wav',name:'assets\\pit_coleta.wav',kind:'audio',metadata:'',preloadAsMusic:false,preloadAsSound:true,preloadInCache:false,userAdded:true,bytes:wav},
  {file:'assets/pit_cristal.glb',name:'assets\\pit_cristal.glb',kind:'model3D',metadata:'',userAdded:true,bytes:glb}
 ];
 const modelTemplate=JSON.parse(fs.readFileSync(path.join(sourceRoot,'examples','starting-3d-tile-placement','starting-3d-tile-placement.json'),'utf8'));
 const modelObject=modelTemplate.layouts.flatMap(l=>l.objects).find(o=>o.type==='Scene3D::Model3DObject');
 assert(modelObject,'official GDevelop 3D Model object schema');

 const cases=[
  {slug:'starting-top-down',target:'pit-qa-top-down',objectName:'PIT_QA_PNG',type:'2D',resource:resources[0]},
  {slug:'starting-first-person',target:'pit-qa-first-person',objectName:'PIT_QA_GLB',type:'3D',resource:resources[2]}
 ];
 const paths=[];
 for(const item of cases){
  const src=path.join(sourceRoot,'examples',item.slug),dst=path.join(sourceRoot,'examples',item.target);
  assert(!fs.existsSync(dst),'Disposable target must not exist: '+dst);
  fs.cpSync(src,dst,{recursive:true});
  const jsonPath=path.join(dst,item.slug+'.json');
  const project=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  assert(project.layouts?.length&&Array.isArray(project.tests),'official project format');
  for(const resource of resources){
   fs.writeFileSync(path.join(dst,resource.file),resource.bytes);
   const {bytes,...metadata}=resource;
   assert(!project.resources.resources.some(x=>x.name===metadata.name),'resource collision');
   project.resources.resources.push(metadata);
  }
  const scene=project.layouts.find(x=>x.name==='Game Scene');
  assert(scene&&Array.isArray(scene.instances)&&Array.isArray(scene.objects),'scene exists');
  let obj,instance;
  if(item.type==='2D'){
   obj=clone(scene.objects.find(o=>o.type==='Sprite'));
   instance=clone(scene.instances.find(x=>x.name===obj.name));
   obj.behaviors=[];obj.effects=[];obj.variables=[];
   for(const anim of obj.animations)for(const dir of anim.directions)for(const sprite of dir.sprites){
    sprite.image=item.resource.name;
    sprite.hasCustomCollisionMask=false;
    sprite.customCollisionMask=[];
   }
   instance.x=840;instance.y=360;instance.zOrder=999;
  }else{
   obj=clone(modelObject);
   obj.content.modelResourceName=item.resource.name;
   obj.content.width=80;obj.content.height=80;obj.content.depth=80;
   instance=clone(scene.instances.find(x=>x.name==='Ground'));
   // Starter player faces north from (615,768); place the prop ahead,
   // inside the corridor rather than behind a wall, for visual inspection.
   instance.x=620;instance.y=540;instance.z=15;
   instance.width=80;instance.height=80;instance.depth=80;
   instance.customSize=true;instance.locked=false;instance.zOrder=999;
  }
  assert(obj&&instance,'object and instance templates');
  obj.name=item.objectName;obj.persistentUuid=newId();
  instance.name=item.objectName;instance.persistentUuid=newId();
  scene.objects.push(obj);scene.instances.push(instance);
  // A genuine GDevelop event, not a JS-only simulation: the win flag may
  // change only after the readiness condition becomes true in the scene.
  for(const name of ['PIT_Ready','PIT_Victory']){
   assert(!scene.variables.some(v=>v.name===name),'QA variable name collision');
   scene.variables.push({name,persistentUuid:newId(),type:'boolean',value:false});
  }
  scene.events.push({
   type:'BuiltinCommonInstructions::Standard',
   conditions:[{type:{value:'BooleanVariable'},parameters:['PIT_Ready','True','']}],
   actions:[{type:{value:'SetBooleanVariable'},parameters:['PIT_Victory','True','']}]
  });
  project.tests.push({
   name:'PIT WIN — victory gated by a real GDevelop event',
   description:'Negative, positive and persistence cases for a conditional scene victory variable.',
   type:'gameplay',
   source:[
    "await harness.goToScene('Game Scene');",
    "await harness.stepFrames(6);",
    "const won=()=>harness.getSceneVariable('PIT_Victory').value;",
    "harness.assert(won()===false,'No premature victory before the condition');",
    "harness.setSceneVariable('PIT_Ready',true);",
    "await harness.stepFrames(3);",
    "harness.assert(won()===true,'Victory activates after the condition is satisfied');",
    "harness.setSceneVariable('PIT_Ready',false);",
    "await harness.stepFrames(3);",
    "harness.assert(won()===true,'Earned victory persists after readiness resets');"
   ]
  });
  project.tests.push({
   name:'PIT QA — '+item.type+' generated asset in GDevelop',
   description:'Disposable fixture: the real GDevelop runtime loads the PIT-generated '+item.resource.file+'.',
   type:'gameplay',
   source:[
    "await harness.goToScene('Game Scene');",
    "harness.watch('"+item.objectName+"');",
    "await harness.stepFrames(12);",
    "const imported=harness.getObjects('"+item.objectName+"');",
    "harness.assert(imported.length===1,'PIT generated "+item.type+" object is instantiated in GDevelop');",
    "harness.assert(imported[0].width>0&&imported[0].height>0,'Imported object has visible dimensions');",
    "await harness.takeScreenshot('pit-"+item.type.toLowerCase()+"-import');"
   ]
  });
  fs.writeFileSync(jsonPath,JSON.stringify(project,null,2)+'\n');
  const saved=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  assert(saved.resources.resources.some(r=>r.name===item.resource.name));
  assert(saved.layouts.find(x=>x.name==='Game Scene').objects.some(o=>o.name===item.objectName));
  assert(saved.tests.some(t=>t.name.startsWith('PIT QA')));
  paths.push('examples/'+item.target+'/'+item.slug+'.json');
  console.log('FIXTURE OK',item.type,item.objectName,'tests='+saved.tests.length);
 }
 const report={status:'FIXTURE_ONLY_NOT_NATIVE_PASS',generatedAt:new Date().toISOString(),
  projects:paths,source:'PIT biblioteca.js procedural generators',
  assets:resources.map(r=>({name:r.file,kind:r.kind,bytes:r.bytes.length,sha256:crypto.createHash('sha256').update(r.bytes).digest('hex')})),
  note:'Only GDevelop CLI test results can establish actual runtime loading; no manual editor import or sound audibility is claimed.'};
 const out=path.join(sourceRoot,'pit-qa-fixture-report.json');
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
}
build().catch(e=>{console.error(e);process.exitCode=1});

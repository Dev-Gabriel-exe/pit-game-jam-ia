'use strict';
/* FUN-08 / REL-01 — Validate the ACTUAL procedural GLBs with Khronos' glTF 2.0 validator.
 * This tests semantic mesh/buffer validity, not GDevelop import or 3D Preview.
 * Runs offline after the open-source validator dependency is installed in CI.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const validator=require('gltf-validator');
const ctx={
 document:{readyState:'loading',querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener:()=>{}},
 window:{addEventListener:()=>{}},localStorage:{getItem:()=>null},console,
 Blob,TextEncoder,ArrayBuffer,DataView,Uint8Array,Float32Array,Uint16Array,Math,
 URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}},setTimeout:()=>{}
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('biblioteca.js','utf8'),ctx,{timeout:5000});
const api=ctx.window.PIT_LIBRARY_API;
assert(api&&Array.isArray(api.assets),'procedural library API available');
(async()=>{
 const models=api.assets.filter(a=>a.cat==='modelo');
 assert(models.length>=4,'at least four procedural 3D models');
 const reports=[];
 for(const asset of models){
  const blob=await api.assetBlob(asset),bytes=new Uint8Array(await blob.arrayBuffer());
  const report=await validator.validateBytes(bytes,{uri:asset.file,format:'glb',maxIssues:0,writeTimestamp:false});
  const item={id:asset.id,file:asset.file,bytes:bytes.length,errors:report.issues.numErrors,warnings:report.issues.numWarnings,infos:report.issues.numInfos,messages:report.issues.messages};
  reports.push(item);
  console.log('GLB '+asset.id+': '+bytes.length+' bytes; '+item.errors+' errors; '+item.warnings+' warnings');
 }
 fs.mkdirSync('qa/gltf-validator-artifacts',{recursive:true});
 fs.writeFileSync('qa/gltf-validator-artifacts/report.json',JSON.stringify({validatorVersion:validator.version(),reports},null,2)+'\n');
 const invalid=reports.filter(r=>r.errors>0);
 if(invalid.length){console.error(JSON.stringify(invalid,null,2));throw Error(invalid.length+' procedural GLB(s) invalid under glTF 2.0 specification');}
 console.log('PASS: '+reports.length+' generated GLB models validated by Khronos glTF 2.0 validator. GDevelop import remains NOT_RUN.');
})().catch(e=>{console.error(e);process.exitCode=1});

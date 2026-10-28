'use strict';
/* UI-06: validates ZIP central directory, CRC, filenames and real GLB/WAV generators.
 * PNG uses a 1x1 stub here; full browser PNG generation is checked in Playwright.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/2XcAAAAASUVORK5CYII=','base64');
const ctx={
 document:{readyState:'loading',querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener:()=>{},
  createElement:()=>({width:0,height:0,getContext:()=>({drawImage:()=>{}}),toBlob:cb=>cb(new Blob([png],{type:'image/png'}))})},
 window:{addEventListener:()=>{}},localStorage:{getItem:()=>null},console,Blob,TextEncoder,ArrayBuffer,DataView,Uint8Array,Float32Array,Uint16Array,Math,
 URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}},setTimeout:()=>{},
 Image:class{naturalWidth=1;naturalHeight=1;set src(v){if(this.onload)this.onload()}}
};
vm.createContext(ctx);
for(const file of ['biblioteca.js','v3/quick-kits.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{timeout:3000});
const api=ctx.window.PIT_LIBRARY_API,lib=ctx.window.PIT_QUICK_KITS;
assert(api&&lib,'library and kits APIs');
assert.equal(lib.kits.length,4);
assert.equal(new Set(lib.kits.map(x=>x.id)).size,4);
function unpackStored(bytes){
 const buf=Buffer.from(bytes);
 const end=buf.length-22;assert.equal(buf.readUInt32LE(end),0x06054b50,'end of central directory');
 const count=buf.readUInt16LE(end+10),size=buf.readUInt32LE(end+12),start=buf.readUInt32LE(end+16);
 assert.equal(start+size,end,'central directory boundaries');
 const result=new Map();let p=start;
 for(let i=0;i<count;i++){
  assert.equal(buf.readUInt32LE(p),0x02014b50,'central entry');
  const crc=buf.readUInt32LE(p+16),length=buf.readUInt32LE(p+20),nameLength=buf.readUInt16LE(p+28),extra=buf.readUInt16LE(p+30),comment=buf.readUInt16LE(p+32),off=buf.readUInt32LE(p+42);
  const name=buf.toString('utf8',p+46,p+46+nameLength);
  assert(!result.has(name),'duplicate entry '+name);
  assert.equal(buf.readUInt32LE(off),0x04034b50,'local header');
  assert.equal(buf.readUInt16LE(off+8),0,'ZIP store method');
  const pos=off+30+buf.readUInt16LE(off+26)+buf.readUInt16LE(off+28);
  const data=buf.subarray(pos,pos+length);
  assert.equal(data.length,length,'entry bytes');
  assert.equal(lib.crc32(data),crc,'CRC32 '+name);
  result.set(name,data);p+=46+nameLength+extra+comment;
 }
 assert.equal(p,end,'central directory exact');
 return result;
}
(async()=>{
 let all=new Set();
 for(const kit of lib.kits){
  const packed=await lib.buildKit(kit.id,api);
  assert.equal(packed.file,kit.file);
  const files=unpackStored(packed.bytes);
  assert.equal(files.size,kit.assets.length+2,'asset count + metadata');
  assert.equal(files.size,packed.files.length,'manifest of entries');
  const meta=JSON.parse(files.get('manifest.json').toString('utf8'));
  assert.equal(meta.starter,kit.starter);
  assert.equal(meta.files.length,kit.assets.length);
  assert(files.get('LEIA-ME.txt').toString('utf8').includes(kit.starter),'starter URL included');
  for(const asset of meta.files){
   const data=files.get(asset.name);assert(data?.length>30,'nonempty '+asset.name);
   if(asset.name.endsWith('.png'))assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
   if(asset.name.endsWith('.glb')){assert.equal(data.toString('ascii',0,4),'glTF','GLB signature');assert.equal(data.readUInt32LE(8),data.length,'GLB length')}
   if(asset.name.endsWith('.wav')){assert.equal(data.toString('ascii',0,4),'RIFF','WAV signature');assert.equal(data.toString('ascii',8,12),'WAVE')}
   all.add(asset.name.slice(-3));
  }
  console.log('PASS UI-06 '+kit.id+': '+files.size+' ZIP entries, valid CRC and file signatures');
 }
 assert(all.has('png')&&all.has('glb')&&all.has('wav'),'all three formats packaged');

 // FUN-08: all 28 generated assets, declared MIME and binary structure.
 for(const asset of api.assets){
  const blob=await api.assetBlob(asset),data=Buffer.from(await blob.arrayBuffer());
  const expected=asset.cat==='modelo'?'model/gltf-binary':asset.cat==='som'?'audio/wav':'image/png';
  assert.equal(blob.type,expected,'MIME '+asset.id);
  assert(data.length>30,'asset has bytes '+asset.id);
  if(expected==='model/gltf-binary'){
   assert.equal(data.toString('ascii',0,4),'glTF','GLB magic '+asset.id);
   assert.equal(data.readUInt32LE(4),2,'GLB v2 '+asset.id);
   assert.equal(data.readUInt32LE(8),data.length,'GLB total length '+asset.id);
   const jsonLen=data.readUInt32LE(12);
   assert.equal(data.toString('ascii',16,20),'JSON','GLB JSON chunk '+asset.id);
   const gltf=JSON.parse(data.toString('utf8',20,20+jsonLen).trim());
   assert.equal(gltf.asset.version,'2.0','GLB schema '+asset.id);
   assert(gltf.meshes?.length>=1&&gltf.bufferViews?.length>=1,'GLB has mesh and buffer views '+asset.id);
   const binAt=20+jsonLen;
   assert.equal(data.toString('ascii',binAt+4,binAt+7),'BIN','GLB binary chunk '+asset.id);
   assert.equal(binAt+8+data.readUInt32LE(binAt),data.length,'GLB binary bounds '+asset.id);
  }else if(expected==='audio/wav'){
   assert.equal(data.toString('ascii',0,4),'RIFF');
   assert.equal(data.toString('ascii',8,12),'WAVE');
   assert.equal(data.readUInt32LE(4)+8,data.length,'RIFF byte length '+asset.id);
   assert.equal(data.readUInt16LE(20),1,'PCM '+asset.id);
   assert.equal(data.readUInt16LE(22),1,'mono '+asset.id);
   assert.equal(data.readUInt32LE(24),22050,'sample rate '+asset.id);
   assert.equal(data.readUInt32LE(40)+44,data.length,'WAV data length '+asset.id);
  }else assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature '+asset.id);
 }
 console.log('PASS FUN-08: all '+api.assets.length+' asset MIME types and GLB/WAV structure; PNG uses fixture stub here, real browser PNG verified separately');

 const html=fs.readFileSync('index.html','utf8');
 assert(html.includes('id="quickKits"')&&html.includes('v3/quick-kits.js'),'portal integrates kits');
 for(const kit of lib.kits)assert(html.includes('data-quick-kit="'+kit.id+'"'),'button '+kit.id);
 console.log('PASS UI-06: four kits, genuine GLB/WAV, PNG stub, ZIP CRC and portal integration');
})().catch(e=>{console.error(e);process.exitCode=1});

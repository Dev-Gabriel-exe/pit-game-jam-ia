/* PIT V3: previews use the exact procedural PNG/GLB/WAV generators.
   No external CDN, network dependency, or sample media masquerading as a real asset. */
(function(){
'use strict';
const grid=document.getElementById('assetGrid'),api=window.PIT_LIBRARY_API;
if(!grid||!api)return;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const modal=document.createElement('div');
modal.id='pitAssetPreview';
modal.className='pit-preview-overlay';
modal.hidden=true;
modal.setAttribute('role','dialog');
modal.setAttribute('aria-modal','true');
modal.setAttribute('aria-labelledby','pitPreviewTitle');
modal.innerHTML='<section class="pit-preview-dialog" aria-describedby="pitPreviewHelp">'+
 '<header><span>✦ BIBLIOTECA ARCANA · PRÉVIA REAL</span><button type="button" class="pit-preview-close" aria-label="Fechar prévia">✕</button></header>'+
 '<h2 id="pitPreviewTitle"></h2><p id="pitPreviewHelp"></p>'+
 '<div class="pit-preview-stage" id="pitPreviewStage" aria-live="polite"></div>'+
 '<div class="pit-preview-tools" id="pitPreviewTools"></div>'+
 '<footer><span id="pitPreviewFormat"></span><button type="button" class="pit-preview-download">↓ Baixar este recurso</button></footer></section>';
document.body.appendChild(modal);
const title=modal.querySelector('#pitPreviewTitle'),help=modal.querySelector('#pitPreviewHelp');
const stage=modal.querySelector('#pitPreviewStage'),tools=modal.querySelector('#pitPreviewTools');
const fmt=modal.querySelector('#pitPreviewFormat');
let previousFocus=null,current=null,objectUrl=null,frame=0,rotation=0,runId=0,playing=false;
const closeButton=modal.querySelector('.pit-preview-close');
function cleanup(){
 cancelAnimationFrame(frame);frame=0;
 const audio=stage.querySelector('audio');if(audio){audio.pause();audio.removeAttribute('src');audio.load();}
 if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}
}
function close(){
 if(modal.hidden)return;
 runId++;cleanup();modal.hidden=true;document.body.classList.remove('pit-preview-open');
 if(previousFocus&&previousFocus.isConnected)previousFocus.focus();
 previousFocus=null;current=null;
}
function format(a){return a.cat==='modelo'?'GLB · modelo 3D':a.cat==='som'?'WAV · áudio':a.cat==='mapa'?'PNG · mapa 1024 × 576':'PNG · sprite 160 × 160';}
function makeButton(label,action){
 const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);tools.appendChild(b);return b;
}
function readGlb(buffer){
 if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<28)throw Error('Arquivo GLB incompleto');
 const v=new DataView(buffer),u=new Uint8Array(buffer);
 if(v.getUint32(0,true)!==0x46546c67||v.getUint32(4,true)!==2||v.getUint32(8,true)!==buffer.byteLength)throw Error('Arquivo GLB inválido');
 const length=v.getUint32(12,true);
 if(length<2||length%4||20+length+8>buffer.byteLength)throw Error('Tamanho do JSON GLB inválido');
 if(v.getUint32(16,true)!==0x4e4f534a)throw Error('GLB sem JSON');
 const gltf=JSON.parse(new TextDecoder().decode(u.subarray(20,20+length)).trim());
 const binary=20+length;
 const binaryLength=v.getUint32(binary,true);
 if(binaryLength%4||binary+8+binaryLength>buffer.byteLength)throw Error('Dados binários GLB incompletos');
 if(v.getUint32(binary+4,true)!==0x004e4942)throw Error('GLB sem geometria');
 const prim=gltf.meshes?.[0]?.primitives?.[0],binStart=binary+8;
 if(!prim)throw Error('GLB sem malha');
 function accessor(index,component){
  const a=gltf.accessors[index],view=gltf.bufferViews[a.bufferView];
  if(a.componentType!==component||view.byteStride)throw Error('Formato GLB não suportado na prévia');
  const offset=binStart+(view.byteOffset||0)+(a.byteOffset||0);
  const bytes=component===5126?12:2;
  if(!Number.isInteger(a.count)||a.count<1||offset<binStart||offset+a.count*bytes>binStart+binaryLength||offset+a.count*bytes>binStart+(view.byteOffset||0)+view.byteLength)throw Error('Acessor GLB fora dos limites');
  return {offset,count:a.count};
 }
 const p=accessor(prim.attributes.POSITION,5126),i=accessor(prim.indices,5123);
 if(i.count%3!==0||p.count>100000||i.count>300000)throw Error('Geometria GLB inválida ou excessiva');
 const vertices=[],triangles=[];
 for(let n=0;n<p.count;n++)vertices.push([v.getFloat32(p.offset+n*12,true),v.getFloat32(p.offset+n*12+4,true),v.getFloat32(p.offset+n*12+8,true)]);
 for(let n=0;n<i.count;n+=3){
  const tri=[v.getUint16(i.offset+n*2,true),v.getUint16(i.offset+(n+1)*2,true),v.getUint16(i.offset+(n+2)*2,true)];
  if(tri.some(index=>index>=p.count))throw Error('Índice GLB fora da malha');
  triangles.push(tri);
 }
 if(!vertices.length||!triangles.length)throw Error('GLB vazio');
 return {vertices,triangles};
}
function drawMesh(canvas,mesh,tint,angle){
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);
 const bg=ctx.createRadialGradient(w*.5,h*.42,15,w*.5,h*.5,w*.8);
 bg.addColorStop(0,'#30364e');bg.addColorStop(1,'#0b0c15');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#e9b97a22';ctx.lineWidth=1;
 for(let k=0;k<12;k++){const x=k*w/11;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
 const sin=Math.sin(angle),cos=Math.cos(angle),tilt=.25;
 const points=mesh.vertices.map(([x,y,z])=>{
  const xx=x*cos+z*sin,zz=z*cos-x*sin,yy=y*Math.cos(tilt)-zz*Math.sin(tilt),depth=y*Math.sin(tilt)+zz*Math.cos(tilt);
  const scale=3.8/(4.8-depth);
  return {x:w/2+xx*scale*w*.16,y:h/2-yy*scale*h*.29,z:depth};
 });
 const faces=mesh.triangles.map(tri=>({p:tri.map(i=>points[i]),z:tri.reduce((s,i)=>s+points[i].z,0)/3})).sort((a,b)=>a.z-b.z);
 faces.forEach((f,j)=>{
  ctx.beginPath();ctx.moveTo(f.p[0].x,f.p[0].y);ctx.lineTo(f.p[1].x,f.p[1].y);ctx.lineTo(f.p[2].x,f.p[2].y);ctx.closePath();
  ctx.fillStyle=tint;ctx.globalAlpha=.5+Math.min(.45,Math.max(0,(f.z+2)/6));ctx.fill();
  ctx.globalAlpha=.8;ctx.strokeStyle='#f8e9d7';ctx.lineWidth=1.3;ctx.stroke();
 });
 ctx.globalAlpha=1;
}
async function open(id,trigger){
 const a=api.assets.find(x=>x.id===id);if(!a)return;
 close();current=a;previousFocus=trigger||document.activeElement;
 modal.hidden=false;document.body.classList.add('pit-preview-open');
 title.textContent=a.name;help.textContent=a.desc;fmt.textContent=format(a);
 stage.replaceChildren();tools.replaceChildren();closeButton.focus();
 const token=++runId;
 try{
  if(a.cat==='som'){
   help.textContent=a.desc+' Reproduza o WAV original gerado localmente; o som só começa após sua ação.';
   const blob=await api.assetBlob(a);if(token!==runId)return;
   if(!blob.size||!['audio/wav','audio/wave','audio/x-wav'].includes(blob.type))throw Error('Áudio WAV inválido');
   const header=new Uint8Array(await blob.slice(0,12).arrayBuffer());if(token!==runId)return;
   const ascii=(start,end)=>String.fromCharCode(...header.slice(start,end));
   if(header.length!==12||ascii(0,4)!=='RIFF'||ascii(8,12)!=='WAVE')throw Error('Arquivo WAV sem cabeçalho RIFF/WAVE');
   const wavSize=new DataView(header.buffer,header.byteOffset,header.byteLength).getUint32(4,true);
   if(wavSize+8!==blob.size)throw Error('Tamanho RIFF incompatível com o WAV');
   objectUrl=URL.createObjectURL(blob);
   const audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.src=objectUrl;audio.setAttribute('aria-label','Ouvir '+a.name);
   const error=document.createElement('p');error.className='pit-preview-error';error.setAttribute('role','alert');error.hidden=true;
   error.textContent='O navegador não conseguiu reproduzir este WAV. Você ainda pode baixar o arquivo e testá-lo no GDevelop.';
   audio.addEventListener('error',()=>{if(token===runId)error.hidden=false;});
   stage.append(audio,error);
  }else if(a.cat==='modelo'){
   const blob=await api.assetBlob(a);if(token!==runId)return;
   if(blob.type!=='model/gltf-binary'&&blob.type!=='application/octet-stream')throw Error('Tipo de arquivo GLB inválido');
   const mesh=readGlb(await blob.arrayBuffer());if(token!==runId)return;
   const canvas=document.createElement('canvas');canvas.width=560;canvas.height=340;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Modelo 3D real '+a.name+' em visualização rotativa');
   stage.appendChild(canvas);
   const render=()=>drawMesh(canvas,mesh,a.tint,rotation);
   render();
   const pause=makeButton('⏸ Pausar rotação',()=>{playing=!playing;pause.textContent=playing?'⏸ Pausar rotação':'▶ Animar rotação';if(playing)tick();});
   makeButton('↶ Girar',()=>{rotation-=.3;render();});
   makeButton('Girar ↷',()=>{rotation+=.3;render();});
   function tick(){if(!playing||token!==runId||modal.hidden)return;rotation+=.008;render();frame=requestAnimationFrame(tick);}
   playing=!reduced.matches;
   pause.textContent=playing?'⏸ Pausar rotação':'▶ Animar rotação';
   if(playing)tick();
   help.textContent=a.desc+' A visualização é calculada a partir dos vértices e triângulos do próprio GLB, sem modelo substituto.';
  }else{
   // Display the exact PNG bytes produced by the download generator, not a separate SVG stand-in.
   const blob=await api.assetBlob(a);if(token!==runId)return;
   if(blob.type!=='image/png'||!blob.size)throw Error('PNG inválido para prévia');
   objectUrl=URL.createObjectURL(blob);
   const large=document.createElement('img');large.src=objectUrl;large.alt='PNG original ampliado de '+a.name;large.decoding='async';
   stage.appendChild(large);
   await large.decode();if(token!==runId)return;
   const expectedWidth=a.cat==='mapa'?1024:160,expectedHeight=a.cat==='mapa'?576:160;
   if(large.naturalWidth!==expectedWidth||large.naturalHeight!==expectedHeight)throw Error('Dimensões PNG inesperadas');
   help.textContent=a.desc+' Prévia ampliada gerada dos mesmos bytes PNG disponibilizados para download.';
  }
 }catch(error){
  if(token!==runId)return;
  const p=document.createElement('p');p.className='pit-preview-error';p.textContent='Não foi possível gerar a prévia: '+error.message;stage.replaceChildren(p);
 }
}
modal.querySelector('.pit-preview-download').addEventListener('click',()=>{
 if(!current)return;
 const b=grid.querySelector('[data-asset="'+current.id+'"]');if(b){close();b.click();}
});
closeButton.addEventListener('click',close);
modal.addEventListener('click',e=>{if(e.target===modal)close();});
modal.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();close();return;}
 if(e.key!=='Tab')return;
 const nodes=[...modal.querySelectorAll('button:not(:disabled),audio[controls]')].filter(el=>el.getClientRects().length);
 if(!nodes.length)return;
 const first=nodes[0],last=nodes[nodes.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
grid.addEventListener('click',e=>{
 const b=e.target.closest('[data-preview]');if(b&&grid.contains(b))open(b.dataset.preview,b);
});
window.PIT_LIBRARY_PREVIEW={open,close,readGlb};
})();
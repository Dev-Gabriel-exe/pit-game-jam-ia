/* PIT Game Jam IA — CC0 assets reais, catalogados na origem.
   Este módulo NÃO altera a API da biblioteca procedural nem inventa formatos.
   Pacotes: links diretos do editor Kenney (retêm licença original).
   Modelos: arquivos GLB individuais no GitHub, publicados por terceiros sob CC0.
   Visualização: model-viewer carregado apenas sob demanda.
*/
(function(){
'use strict';
const host=document.getElementById('pitOpenAssets');
if(!host)return;
const K='https://kenney.nl/assets/';
const A='https://raw.githubusercontent.com/Ariescar/gobkit-free-assets/main/';
const E='https://raw.githubusercontent.com/syuhei176/ai-game-assets/main/models/environment/';
const packs=[
 {id:'k-mini-chars',name:'Mini Characters 3D',cat:'personagem',type:'3d',genre:'rpg plataforma puzzle',count:25,tag:'Personagens animados',desc:'Personagens 3D leves, com animações. Pacote para criar protagonistas e NPCs.',page:K+'mini-characters',zip:'https://kenney.nl/media/pages/assets/mini-characters/bfc7e272b4-1774770718/kenney_mini-characters.zip',img:'https://kenney.nl/media/pages/assets/mini-characters/357d1a9452-1721210569/preview.png'},
 {id:'k-blocky',name:'Blocky Characters',cat:'personagem',type:'3d',genre:'rpg plataforma puzzle',count:20,tag:'Personagens 3D',desc:'Avatares estilizados para jogo 3D; inclui animações.',page:K+'blocky-characters',zip:'https://kenney.nl/media/pages/assets/blocky-characters/8369c0cf30-1749547469/kenney_blocky-characters_20.zip',img:'https://kenney.nl/media/pages/assets/blocky-characters/4ace046751-1749547441/preview.png'},
 {id:'k-mini-dungeon',name:'Mini Dungeon',cat:'modelo',type:'3d',genre:'rpg puzzle',count:30,tag:'Dungeon 3D',desc:'Peças medievais, armas, escudos e personagens para uma aventura sombria.',page:K+'mini-dungeon',zip:'https://kenney.nl/media/pages/assets/mini-dungeon/6cd72dc849-1785314274/kenney_mini-dungeon.zip',img:'https://kenney.nl/media/pages/assets/mini-dungeon/5b23e91c6e-1785314288/sample.png'},
 {id:'k-fantasy-town',name:'Vila medieval 3D',cat:'mapa',type:'3d',genre:'rpg puzzle',count:160,tag:'Cenário medieval',desc:'Casas, muralhas e construções para montar um vilarejo de fantasia.',page:K+'fantasy-town-kit',zip:'https://kenney.nl/media/pages/assets/fantasy-town-kit/efe948d309-1754222374/kenney_fantasy-town-kit_2.0.zip',img:'https://kenney.nl/media/pages/assets/fantasy-town-kit/c13eafebab-1754222363/sample.png'},
 {id:'k-mod-dungeon',name:'Masmorra modular',cat:'mapa',type:'3d',genre:'rpg puzzle',count:40,tag:'Dungeon modular',desc:'Construa corredores, salas e passagens para exploração 3D.',page:K+'modular-dungeon-kit',zip:'https://kenney.nl/media/pages/assets/modular-dungeon-kit/7bed87605b-1771926065/kenney_modular-dungeon-kit_1.0.zip',img:'https://kenney.nl/media/pages/assets/modular-dungeon-kit/fe4b7d1cba-1771926047/sample.png'},
 {id:'k-mini-forest',name:'Floresta 3D',cat:'mapa',type:'3d',genre:'rpg plataforma',count:20,tag:'Ambiente 3D',desc:'Árvores e elementos naturais, com recursos animados.',page:K+'mini-forest',zip:'https://kenney.nl/media/pages/assets/mini-forest/44a89aed7f-1784024079/kenney_mini-forest_1.0.zip',img:'https://kenney.nl/media/pages/assets/mini-forest/cb98284e11-1784024076/sample.png'},
 {id:'k-platformer-kit',name:'Plataforma 3D completa',cat:'mapa',type:'3d',genre:'plataforma corrida',count:150,tag:'Cenário e personagem',desc:'Plataformas, peças de nível e personagens animados para prototipar rapidamente.',page:K+'platformer-kit',zip:'https://kenney.nl/media/pages/assets/platformer-kit/1585cf62b4-1775122253/kenney_platformer-kit.zip',img:'https://kenney.nl/media/pages/assets/platformer-kit/12fa6cafde-1775122247/sample.png'},
 {id:'k-cave',name:'Cavernas modulares 3D',cat:'mapa',type:'3d',genre:'rpg puzzle',count:40,tag:'Caverna modular',desc:'Blocos de cavernas e passagens para mapas de exploração.',page:K+'modular-cave-kit',zip:'https://kenney.nl/media/pages/assets/modular-cave-kit/37ec3cb12d-1783667097/kenney_modular-cave-kit_1.0.zip',img:'https://kenney.nl/media/pages/assets/modular-cave-kit/ced1b74dc1-1783667089/sample.png'},
 {id:'k-retro',name:'Cidadela retro 3D',cat:'mapa',type:'3d',genre:'rpg puzzle',count:100,tag:'Castelos low-poly',desc:'Kit de construções e fortalezas medievais estilizadas.',page:K+'retro-fantasy-kit',zip:'https://kenney.nl/media/pages/assets/retro-fantasy-kit/cf3f41b752-1774770658/kenney_retro-fantasy-kit.zip',img:'https://kenney.nl/media/pages/assets/retro-fantasy-kit/624944f6df-1739977943/sample.png'},
 {id:'k-rpg-urban',name:'Mapa RPG de cidade',cat:'mapa',type:'2d',genre:'rpg puzzle',count:480,tag:'Tileset 2D · 16 px',desc:'Tiles, ruas e personagens para criar mapa de RPG urbano top-down.',page:K+'rpg-urban-pack',zip:'https://kenney.nl/media/pages/assets/rpg-urban-pack/0a097d1dc7-1677578575/kenney_rpg-urban-pack.zip',img:'https://kenney.nl/media/pages/assets/rpg-urban-pack/ddc38bb8e5-1677578571/sample.png'},
 {id:'k-new-platformer',name:'Tiles de plataforma',cat:'mapa',type:'2d',genre:'plataforma',count:440,tag:'Tileset 2D',desc:'Peças de cenário, terreno e personagens para mapas de plataforma.',page:K+'new-platformer-pack',img:'https://kenney.nl/media/pages/assets/new-platformer-pack/85e6d78737-1746559490/sample-a.png'},
 {id:'k-interface-audio',name:'100 sons de interface',cat:'som',type:'audio',genre:'rpg plataforma puzzle corrida',count:100,tag:'Sons OGG',desc:'Cliques, confirmações, menus e HUD. Arquivos reais e separados.',page:K+'interface-sounds',zip:'https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip',img:'https://kenney.nl/media/pages/assets/interface-sounds/428fc5f14c-1677589445/preview_interface.png'},
 {id:'k-impact-audio',name:'130 impactos e golpes',cat:'som',type:'audio',genre:'rpg plataforma puzzle corrida',count:130,tag:'Efeitos OGG',desc:'Colisões, golpes, passos e ruídos de ação para feedback do jogador.',page:K+'impact-sounds',zip:'https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip',img:'https://kenney.nl/media/pages/assets/impact-sounds/37d145475f-1677589720/audio_impact.png'},
 {id:'k-scifi-audio',name:'70 sons futuristas',cat:'som',type:'audio',genre:'plataforma corrida puzzle',count:70,tag:'Sons OGG',desc:'Motores, lasers e efeitos de tecnologia para jogos futuristas.',page:K+'sci-fi-sounds',zip:'https://kenney.nl/media/pages/assets/sci-fi-sounds/6b296f9ecf-1677589334/kenney_sci-fi-sounds.zip',img:'https://kenney.nl/media/pages/assets/sci-fi-sounds/112ea5fed7-1677589328/audiopreview_scifi.png'},
 {id:'k-rpg-audio',name:'50 sons de RPG',cat:'som',type:'audio',genre:'rpg puzzle',count:50,tag:'Efeitos de aventura',desc:'Passos, armas e ações de RPG, disponíveis gratuitamente no catálogo original.',page:K+'rpg-audio',img:'https://kenney.nl/media/pages/assets/rpg-audio/ce8569f2f8-1677590326/preview-4.png'},
,
 {id:'v-blocky-glb',name:'8 heróis 3D com animações',source:'Vuena',cat:'personagem',type:'3d',genre:'rpg plataforma puzzle',count:8,tag:'Knight · Wizard · Robot · Zombie',desc:'Herói, cavaleiro, mago, pirata, robô, zumbi e princesa. O pacote inclui GLBs com 6 animações cada.',page:'https://vuena.itch.io/blocky-characters-free-sample',img:'https://img.itch.zone/aW1nLzMxMjcwMTk1LnBuZw==/original/OJm0OP.png'},
 {id:'q-platformer',name:'100+ modelos 3D de plataforma',source:'Quaternius',cat:'mapa',type:'3d',genre:'plataforma rpg',count:100,tag:'Personagem · inimigos · plataformas',desc:'Personagem animado, 4 inimigos, plataformas, mecanismos e natureza. Formatos glTF/FBX/OBJ; converta em GLB para GDevelop.',page:'https://quaternius.itch.io/ultimate-platformer-pack',img:'https://img.itch.zone/aW1nLzc3MjUwOTMuanBn/original/CZF2e6.jpg'}
];
const models=[
 {id:'g-guard-a',name:'Guardião arcano A',cat:'personagem',genre:'rpg puzzle',icon:'⚔️',info:'Inimigo 3D animado, formato GLB.',size:'167 KB',url:A+'minion/minion-a01.glb',source:'Gobkit'},
 {id:'g-guard-b',name:'Guardião arcano B',cat:'personagem',genre:'rpg puzzle',icon:'🛡️',info:'Personagem inimigo em GLB com rig.',size:'170 KB',url:A+'minion/minion-b01.glb',source:'Gobkit'},
 {id:'g-guard-c',name:'Guardião arcano C',cat:'personagem',genre:'rpg puzzle',icon:'👹',info:'Inimigo 3D para aventura ou masmorra.',size:'148 KB',url:A+'minion/minion-c01.glb',source:'Gobkit'},
 {id:'g-guard-d',name:'Guardião arcano D',cat:'personagem',genre:'rpg puzzle',icon:'💀',info:'Criatura 3D para fases avançadas.',size:'185 KB',url:A+'minion/minion-d01.glb',source:'Gobkit'},
 {id:'g-bat',name:'Morcego 3D',cat:'personagem',genre:'rpg puzzle plataforma',icon:'🦇',info:'Criatura animada para caverna ou castelo.',size:'62 KB',url:A+'animal/Bat.glb',source:'Gobkit'},
 {id:'g-shark',name:'Tubarão 3D',cat:'personagem',genre:'rpg puzzle',icon:'🦈',info:'Animal 3D animado para ambientes aquáticos.',size:'61 KB',url:A+'animal/Shark.glb',source:'Gobkit'},
 {id:'g-rhino',name:'Rinoceronte 3D',cat:'personagem',genre:'rpg plataforma',icon:'🦏',info:'Criatura animada para NPC ou desafio.',size:'69 KB',url:A+'animal/Rhino.glb',source:'Gobkit'},
 {id:'g-corgi',name:'Cachorro 3D',cat:'personagem',genre:'rpg puzzle plataforma',icon:'🐕',info:'Companheiro ou NPC 3D animado.',size:'72 KB',url:A+'animal/Corgi.glb',source:'Gobkit'},
 {id:'g-duck',name:'Pato 3D',cat:'personagem',genre:'rpg plataforma puzzle',icon:'🦆',info:'Animal 3D animado para minigames.',size:'69 KB',url:A+'animal/Duck.glb',source:'Gobkit'},
 {id:'g-angler',name:'Peixe abissal 3D',cat:'personagem',genre:'rpg puzzle',icon:'🐟',info:'Criatura animada para cenas de terror aquático.',size:'57 KB',url:A+'animal/Anglerfish.glb',source:'Gobkit'},
 {id:'g-tree',name:'Árvore 3D',cat:'mapa',genre:'rpg plataforma puzzle',icon:'🌲',info:'Vegetação low-poly para cenário GLB.',size:'16 KB',url:A+'nature/TreeHigh001.glb',source:'Gobkit'},
 {id:'g-rock',name:'Rochas 3D',cat:'mapa',genre:'rpg plataforma puzzle corrida',icon:'🪨',info:'Obstáculo ou cenário 3D em GLB.',size:'15 KB',url:A+'nature/Rock001.glb',source:'Gobkit'},
 {id:'g-mountain',name:'Montanha 3D',cat:'mapa',genre:'rpg puzzle',icon:'⛰️',info:'Prop low-poly para construir mapas 3D.',size:'15 KB',url:A+'nature/Mountain001.glb',source:'Gobkit'},
 {id:'g-scene',name:'Cenário natural 3D',cat:'mapa',genre:'rpg plataforma puzzle',icon:'🏞️',info:'Cena 3D montada com itens de natureza.',size:'117 KB',url:A+'nature/nature-kit-scene.glb',source:'Gobkit'},
 {id:'g-house',name:'Casa 3D',cat:'mapa',genre:'rpg puzzle',icon:'🏠',info:'Casa suburban low-poly para mapas.',size:'96 KB',url:E+'building_house.glb',source:'Kenney · espelho CC0'},
 {id:'g-tower',name:'Torre 3D',cat:'mapa',genre:'rpg puzzle',icon:'🏰',info:'Torre para proteger ou explorar.',size:'49 KB',url:E+'building_tower.glb',source:'Kenney · espelho CC0'},
 {id:'g-pine',name:'Pinheiro 3D',cat:'mapa',genre:'rpg plataforma puzzle',icon:'🌳',info:'Árvore low-poly em GLB pronto para importar.',size:'17 KB',url:E+'tree_pine.glb',source:'Kenney · espelho CC0'},
];
const official={Gobkit:'https://github.com/Ariescar/gobkit-free-assets','Kenney · espelho CC0':'https://github.com/syuhei176/ai-game-assets'};
const state={tab:'todos',genre:'todos',query:''};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function matches(x){
 const type=state.tab,hasFile=Boolean(x.url);
 if(type==='personagens'&&x.cat!=='personagem')return false;
 if(type==='mapas'&&x.cat!=='mapa')return false;
 if(type==='sons'&&x.cat!=='som')return false;
 if(type==='modelos'&&!hasFile)return false;
 if(type==='3d'&&(hasFile||x.type!=='3d'))return false;
 if(type==='2d'&&x.type!=='2d')return false;
 if(type==='audio'&&x.type!=='audio')return false;
 if(state.genre!=='todos'&&!x.genre.split(' ').includes(state.genre))return false;
 const q=state.query.trim().toLocaleLowerCase('pt-BR');
 return !q||[x.name,x.desc||'',x.info||'',x.tag||'',x.source||''].some(s=>s.toLocaleLowerCase('pt-BR').includes(q));
}
const typeLabel=x=>x.type==='3d'?'3D':x.type==='audio'?'ÁUDIO':'2D';
function render(){
 const curated=packs.filter(matches),individual=models.filter(matches);
 const modelGrid=host.querySelector('#pitGlbGrid'),packGrid=host.querySelector('#pitPackGrid');
 const counts=host.querySelector('#pitOpenCount');
 counts.textContent=individual.length+' modelos GLB individuais · '+curated.length+' pacotes gratuitos';
 const stat=[...document.querySelectorAll('.statband span')].find(x=>/recursos para download|arquivos individuais|pacotes CC0/i.test(x.textContent));
 if(stat){const locals=window.PIT_LIBRARY_API?.assets?.length||0;stat.textContent=(locals+models.length)+' arquivos individuais · '+packs.length+' pacotes CC0';}
 modelGrid.innerHTML=individual.map(a=>'<article class="pit-real-card pit-real-model" data-kind="glb" data-id="'+a.id+'">'+
  '<div class="pit-real-model-art"><span class="pit-real-emblem" aria-hidden="true">'+a.icon+'</span><span class="pit-real-format">GLB REAL · '+a.size+'</span></div>'+
  '<div class="pit-real-card-body"><small>'+esc(a.source)+' · CC0</small><h3>'+esc(a.name)+'</h3><p>'+esc(a.info)+'</p>'+
  '<div class="pit-real-actions"><button type="button" data-view="'+a.id+'">◉ Visualizar 3D</button><button type="button" data-download="'+a.id+'">↓ Baixar GLB</button></div></div></article>').join('');
 packGrid.innerHTML=curated.map(a=>'<article class="pit-real-card pit-real-pack" data-kind="pack" data-id="'+a.id+'">'+
  '<div class="pit-real-pack-art"><img src="'+esc(a.img)+'" alt="Prévia oficial do pacote '+esc(a.name)+'" loading="lazy" referrerpolicy="no-referrer">'+
  '<span class="pit-real-format">'+esc(typeLabel(a))+' · '+a.count+' RECURSOS</span></div>'+
  '<div class="pit-real-card-body"><small>KENNEY · CC0 · '+esc(a.tag)+'</small><h3>'+esc(a.name)+'</h3><p>'+esc(a.desc)+'</p>'+
  '<div class="pit-real-actions"><a href="'+esc(a.zip||a.page+'#inline-download')+'" target="_blank" rel="noopener noreferrer" class="pit-real-download">'+(a.zip?'↓ Baixar ZIP gratuito':'↓ Abrir download')+'</a>'+
  '<a href="'+esc(a.page)+'" target="_blank" rel="noopener noreferrer" class="pit-real-source">Origem e licença</a></div></div></article>').join('');
 host.querySelector('#pitModelSection').hidden=!individual.length;
 host.querySelector('#pitPackSection').hidden=!curated.length;
 host.querySelector('#pitOpenEmpty').hidden=Boolean(individual.length||curated.length);
 host.querySelectorAll('[data-pit-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pitTab===state.tab)));
}
host.innerHTML='<div class="pit-open-head"><div><span class="pit-open-eyebrow">✦ NOVA BIBLIOTECA ARCANA · ACERVO REAL CC0</span><h3>Escolha o mundo do seu jogo.</h3><p><strong>Agora com personagens 3D, mapas e centenas de sons reais.</strong> Veja as imagens oficiais dos pacotes, escolha um gênero e baixe o que precisar. A antiga forja geométrica fica recolhida no final.</p></div><div class="pit-open-count" id="pitOpenCount" aria-live="polite"></div></div>'+
 '<div class="pit-open-filters"><div class="pit-open-tabs" role="group" aria-label="Tipo de recurso">'+
 ['todos','personagens','mapas','sons','modelos','3d','2d'].map((t,i)=>'<button type="button" data-pit-tab="'+t+'" aria-pressed="'+(i===0?'true':'false')+'">'+({todos:'✦ Todos',personagens:'⚔ Personagens 3D',mapas:'🗺 Mapas e cenários',sons:'♫ Efeitos sonoros',modelos:'◈ GLB individuais', '3d':'Pacotes 3D', '2d':'Mapas 2D'}[t])+'</button>').join('')+'</div>'+
 '<label>Buscar<input type="search" id="pitOpenSearch" placeholder="Ex.: castelo, inimigo, floresta, som..." aria-label="Buscar recursos externos gratuitos"></label>'+
 '<label>Gênero<select id="pitOpenGenre"><option value="todos">Todos os gêneros</option><option value="rpg">RPG / aventura</option><option value="plataforma">Plataforma</option><option value="puzzle">Puzzle / terror</option><option value="corrida">Corrida</option></select></label></div>'+
 '<section id="pitPackSection"><div class="pit-open-subhead"><h4>Acervo de fantasia, mapas e sons · prévias reais</h4><p>As imagens vêm dos criadores. Clique em <strong>Baixar ZIP</strong> para obter o pacote oficial, ou confira a licença no site de origem. Selecione “Personagens 3D”, “Mapas” ou “Sons” acima.</p></div><div id="pitPackGrid" class="pit-real-grid"></div></section>'+
 '<section id="pitModelSection"><div class="pit-open-subhead"><h4>Modelos GLB prontos para importar individualmente</h4><p>Criaturas, personagens e elementos de cenário. Clique em <strong>Visualizar 3D</strong> para examinar o modelo real antes do download. No GDevelop, adicione um objeto 3D Model.</p></div><div id="pitGlbGrid" class="pit-real-grid"></div></section>'+
 '<p id="pitOpenEmpty" hidden>Nenhum recurso encontrado. Tente outro gênero ou pesquisa.</p>'+
 '<div class="pit-open-disclaimer"><strong>Licenças e formatos verificados:</strong> Kenney, Gobkit, Vuena e Quaternius disponibilizam os recursos selecionados em CC0. Arquivos ZIP podem incluir FBX, OBJ, glTF e formatos variados; <strong>o GDevelop exige GLB para objetos 3D</strong>. Os modelos individuais acima já são GLB. Links de ZIP levam diretamente aos arquivos oficiais quando disponíveis. <a href="https://wiki.gdevelop.io/gdevelop5/objects/3d-model/" target="_blank" rel="noopener noreferrer">Como importar no GDevelop</a>.</div>';
const modal=document.createElement('div');
modal.className='pit-real-modal';modal.id='pitRealModal';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Prévia 3D do recurso');
modal.innerHTML='<section class="pit-real-modal-body"><div class="pit-real-modal-top"><span>✦ VISUALIZADOR 3D · GLB REAL</span><button type="button" id="pitRealClose" aria-label="Fechar visualizador 3D">✕ Fechar</button></div>'+
 '<h3 id="pitRealTitle"></h3><p id="pitRealInfo"></p><div id="pitRealStage" class="pit-real-stage"><p>Carregando modelo...</p></div><div class="pit-real-modal-footer"><span>Arraste para girar · use a roda do mouse para ampliar</span><button id="pitRealDownload" type="button">↓ Baixar este GLB</button></div></section>';
document.body.appendChild(modal);
let previous=null,current=null,moduleLoading=null;
const viewerUrl='https://cdnjs.cloudflare.com/ajax/libs/model-viewer/4.4.0/model-viewer.min.js';
function ensureViewer(){
 if(customElements.get('model-viewer'))return Promise.resolve();
 if(moduleLoading)return moduleLoading;
 moduleLoading=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.type='module';script.src=viewerUrl;script.crossOrigin='anonymous';
  const fail=setTimeout(()=>reject(Error('Visualizador demorou para carregar')),12000);
  script.addEventListener('load',()=>customElements.whenDefined('model-viewer').then(()=>{clearTimeout(fail);resolve();},reject));
  script.addEventListener('error',()=>{clearTimeout(fail);reject(Error('Biblioteca de visualização 3D indisponível'))});
  document.head.appendChild(script);
 }).catch(error=>{moduleLoading=null;throw error});
 return moduleLoading;
}
function close(){
 if(modal.hidden)return;
 modal.hidden=true;modal.querySelector('#pitRealStage').replaceChildren();
 document.body.classList.remove('pit-real-modal-open');current=null;
 previous?.focus?.();previous=null;
}
async function preview(id,trigger){
 const a=models.find(m=>m.id===id);if(!a)return;
 previous=trigger;current=a;modal.hidden=false;
 document.body.classList.add('pit-real-modal-open');
 modal.querySelector('#pitRealTitle').textContent=a.name;
 modal.querySelector('#pitRealInfo').textContent=a.info+' Criador: '+a.source+' · CC0.';
 const stage=modal.querySelector('#pitRealStage');stage.textContent='Carregando visualizador 3D...';
 modal.querySelector('#pitRealClose').focus();
 if(!window.WebGLRenderingContext){
  stage.textContent='Este dispositivo não tem WebGL. O download do modelo GLB continua disponível.';return;
 }
 try{
  await ensureViewer();if(current!==a||modal.hidden)return;
  const model=document.createElement('model-viewer');
  model.setAttribute('src',a.url);model.setAttribute('camera-controls','');
  model.setAttribute('touch-action','pan-y');model.setAttribute('shadow-intensity','0.8');
  model.setAttribute('environment-image','neutral');
  model.setAttribute('alt','Modelo 3D original '+a.name);
  model.setAttribute('loading','eager');
  model.style.width='100%';model.style.height='min(55vh,470px)';
  const msg=document.createElement('p');msg.textContent='Carregando geometria...';msg.setAttribute('role','status');
  model.addEventListener('load',()=>{msg.textContent='Modelo carregado. Arraste para girar.';});
  model.addEventListener('error',()=>{msg.textContent='Não foi possível carregar a prévia. Você pode baixar o GLB pelo botão abaixo.';});
  stage.replaceChildren(model,msg);
 }catch(e){if(current===a)stage.textContent='Visualização indisponível: '+e.message+'. O download GLB permanece disponível.';}
}
function save(blob,name){
 const link=document.createElement('a'),href=URL.createObjectURL(blob);
 link.href=href;link.download=name;document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(href),2000);
}
async function download(id,button){
 const a=models.find(m=>m.id===id);if(!a)return;
 const old=button.textContent;button.disabled=true;button.textContent='Baixando GLB...';
 try{
  const resp=await fetch(a.url,{mode:'cors'});
  if(!resp.ok)throw Error('HTTP '+resp.status);
  const buffer=await resp.arrayBuffer();
  const view=new DataView(buffer);
  if(buffer.byteLength<1000||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)throw Error('Resposta não é GLB válido');
  const filename=a.url.split('/').pop();
  save(new Blob([buffer],{type:'model/gltf-binary'}),filename);
  button.textContent='✓ GLB baixado';
 }catch(e){
  button.textContent='Abrir original para baixar';
  const aLink=document.createElement('a');aLink.href=a.url;aLink.target='_blank';aLink.rel='noopener noreferrer';
  aLink.click();
  console.warn('Download GLB remoto indisponível: ',e);
 }finally{button.disabled=false;setTimeout(()=>{if(button.isConnected)button.textContent=old},1800)}
}
host.addEventListener('click',e=>{
 const tab=e.target.closest('[data-pit-tab]');if(tab){state.tab=tab.dataset.pitTab;render();return;}
 const b=e.target.closest('[data-view]');if(b)preview(b.dataset.view,b);
 const d=e.target.closest('[data-download]');if(d)download(d.dataset.download,d);
});
host.querySelector('#pitOpenSearch').addEventListener('input',e=>{state.query=e.target.value;render()});
host.querySelector('#pitOpenGenre').addEventListener('change',e=>{state.genre=e.target.value;render()});
modal.querySelector('#pitRealClose').addEventListener('click',close);
modal.querySelector('#pitRealDownload').addEventListener('click',e=>{if(current)download(current.id,e.currentTarget)});
modal.addEventListener('click',e=>{if(e.target===modal)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
render();
window.addEventListener('pageshow',render);
window.PIT_OPEN_ASSETS=Object.freeze({packs,models,render});
})();
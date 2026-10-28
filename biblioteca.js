'use strict';
/* PIT Game Jam IA — biblioteca local no navegador, sem APIs pagas */
const assets=[
{id:'explorador',cat:'personagem',name:'Explorador futurista',desc:'Sprite geométrico 2D com fundo transparente.',file:'explorador.png',shape:'hero',tint:'#53dfff'},
{id:'heroina',cat:'personagem',name:'Heroína da floresta',desc:'Personagem 2D em tons verdes.',file:'heroina.png',shape:'hero',tint:'#79ed91'},
{id:'robo',cat:'personagem',name:'Robô amigável',desc:'NPC robótico para conversa ou missão.',file:'robo.png',shape:'robot',tint:'#a988ff'},
{id:'monstro',cat:'personagem',name:'Monstro da estação',desc:'Inimigo simples, para terror ou aventura.',file:'monstro.png',shape:'monster',tint:'#f887b4'},
{id:'piloto',cat:'personagem',name:'Piloto de corrida',desc:'Avatar para carros e corridas.',file:'piloto.png',shape:'hero',tint:'#ffce72'},
{id:'fantasma',cat:'personagem',name:'Fantasma da mansão',desc:'Inimigo para puzzle ou terror 2D.',file:'fantasma.png',shape:'ghost',tint:'#cad9ff'},
{id:'feiticeira',cat:'personagem',name:'Feiticeira das runas',desc:'Sprite original 160×160 com capa, cajado e runas. Use como NPC ou personagem jogável.',file:'feiticeira_runas.png',shape:'mage',tint:'#bf8cff'},
{id:'golem',cat:'personagem',name:'Guardião de pedra',desc:'Sprite original de inimigo ou guardião com armadura de rocha e núcleo luminoso.',file:'guardiao_pedra.png',shape:'golem',tint:'#f4b66b'},
{id:'sentinela',cat:'personagem',name:'Sentinela das estrelas',desc:'Sprite 2D original 160×160 para jogos espaciais. Importe como Sprite no GDevelop.',file:'sentinela_estrelas.png',shape:'sentinel',tint:'#76e8ff'},
{id:'arqueiro',cat:'personagem',name:'Arqueiro das montanhas',desc:'Sprite 2D original 160×160 para aventura. Disparos exigem eventos no GDevelop.',file:'arqueiro_montanhas.png',shape:'archer',tint:'#a7ec8d'},
{id:'raposa-automata',cat:'personagem',name:'Raposa autômata',desc:'Companheira mecânica original 160×160 para aventura e puzzle; patrulha e diálogo exigem eventos no GDevelop.',file:'raposa_automata.png',shape:'fox',tint:'#f3b77d'},
{id:'coruja-mecanica',cat:'personagem',name:'Coruja mecânica',desc:'Companheira steampunk 160×160 com asas, visor e núcleo luminoso; movimento exige eventos no GDevelop.',file:'coruja_mecanica.png',shape:'owl',tint:'#f8c778'},
{id:'mapa-floresta',cat:'mapa',name:'Mapa — Floresta top-down',desc:'Fundo 2D 1024×576. Adicione colisores no GDevelop.',file:'mapa_floresta.png',shape:'forest',tint:'#79ed91'},
{id:'mapa-cidade',cat:'mapa',name:'Mapa — Cidade neon',desc:'Cenário visto de cima para RPG ou perseguição.',file:'mapa_cidade.png',shape:'city',tint:'#66e0fa'},
{id:'mapa-plataforma',cat:'mapa',name:'Mapa — Plataforma espacial',desc:'Imagem de cenário; o chão jogável requer Platform behavior.',file:'mapa_plataforma.png',shape:'platform',tint:'#9d96ff'},
{id:'mapa-caverna',cat:'mapa',name:'Mapa — Caverna e labirinto',desc:'Cenário escuro para exploração/puzzle.',file:'mapa_caverna.png',shape:'cave',tint:'#c7abff'},
{id:'mapa-corrida',cat:'mapa',name:'Mapa — Pista futurista',desc:'Arte 2D de pista; física/controles usam starter.',file:'mapa_corrida.png',shape:'track',tint:'#ffe58a'},
{id:'mapa-ruinas',cat:'mapa',name:'Mapa — Ruínas do santuário',desc:'Cenário top-down 1024×576 com pátio, colunas e altar. Colisores devem ser adicionados no GDevelop.',file:'mapa_ruinas.png',shape:'ruins',tint:'#efc487'},
{id:'mapa-pantano',cat:'mapa',name:'Mapa — Pântano das lanternas',desc:'Cenário top-down 1024×576 com trilha e poças. Defina limites e colisões no editor.',file:'mapa_pantano.png',shape:'swamp',tint:'#91dfbb'},
{id:'mapa-necropole',cat:'mapa',name:'Mapa — Necrópole das sombras',desc:'Cenário top-down 1024×576 com criptas e lápides. Adicione colisores no GDevelop.',file:'mapa_necropole.png',shape:'necropolis',tint:'#b7a6ff'},
{id:'mapa-observatorio',cat:'mapa',name:'Mapa — Observatório celeste',desc:'Cenário top-down 1024×576 com plataforma e telescópio. Adicione eventos e colisões no GDevelop.',file:'mapa_observatorio.png',shape:'observatory',tint:'#83e2ff'},
{id:'mapa-arquipelago',cat:'mapa',name:'Mapa — Arquipélago flutuante',desc:'Cenário original top-down 1024×576 com ilhas e pontes. Colisões e movimento precisam ser configurados no GDevelop.',file:'mapa_arquipelago.png',shape:'archipelago',tint:'#8be9e2'},
{id:'mapa-fortaleza',cat:'mapa',name:'Mapa — Fortaleza do eclipse',desc:'Cenário original top-down 1024×576 com muralhas, torres e portão. Configure colisores e eventos no editor.',file:'mapa_fortaleza.png',shape:'fortress',tint:'#e2b4ff'},
{id:'mapa-laboratorio',cat:'mapa',name:'Mapa — Laboratório das máquinas',desc:'Cenário top-down original 1024×576 com engrenagens, esteiras e consoles; colisões e mecânicas devem ser criadas no GDevelop.',file:'mapa_laboratorio_maquinas.png',shape:'machinelab',tint:'#91e3fa'},
{id:'mapa-jardim-luz',cat:'mapa',name:'Mapa — Jardim bioluminescente',desc:'Cenário original 1024×576 com lagoas, cogumelos e trilha; configure colisões no GDevelop.',file:'mapa_jardim_luz.png',shape:'glowgarden',tint:'#91f4d3'},
{id:'chave',cat:'item',name:'Chave dourada',desc:'Item para liberar porta através de variável.',file:'chave.png',shape:'key',tint:'#ffd56b'},
{id:'moeda',cat:'item',name:'Moeda XP',desc:'Coletável para Score e feedback.',file:'moeda.png',shape:'coin',tint:'#ffd56b'},
{id:'cristal',cat:'item',name:'Cristal de energia',desc:'Recurso para puzzle, coleta ou missão.',file:'cristal.png',shape:'crystal',tint:'#6bfbf2'},
{id:'porta',cat:'item',name:'Porta de saída',desc:'Objeto de objetivo para encontro de condição.',file:'porta.png',shape:'door',tint:'#89d7ff'},
{id:'coracao',cat:'item',name:'Coração / vida',desc:'Ícone para HUD da vida.',file:'coracao.png',shape:'heart',tint:'#ff6c99'},
{id:'pocao',cat:'item',name:'Poção de vida',desc:'Item coletável de recuperação.',file:'pocao.png',shape:'potion',tint:'#8cf3b6'},
{id:'checkpoint',cat:'item',name:'Bandeira checkpoint',desc:'Ponto para salvar estágio da missão.',file:'checkpoint.png',shape:'flag',tint:'#e5dc76'},
{id:'lanterna',cat:'item',name:'Lanterna arcana',desc:'Sprite 160×160 para iluminação ou objetivo de coleta; a luz exige eventos no GDevelop.',file:'lanterna_arcana.png',shape:'lantern',tint:'#ffcd77'},
{id:'escudo',cat:'item',name:'Escudo de proteção',desc:'Sprite 160×160 para item defensivo ou HUD; o efeito de defesa exige lógica de eventos.',file:'escudo_protecao.png',shape:'shield',tint:'#8fd5f8'},
{id:'espinhos',cat:'item',name:'Armadilha de espinhos',desc:'Sprite 160×160 de obstáculo. A colisão e o dano precisam ser configurados nos eventos.',file:'armadilha_espinhos.png',shape:'spikes',tint:'#f1a3a5'},
{id:'pedestal',cat:'item',name:'Pedestal rúnico',desc:'Sprite 160×160 para enigmas e checkpoints. A interação precisa de eventos no GDevelop.',file:'pedestal_runico.png',shape:'pedestal',tint:'#b5a4ff'},
{id:'bussola',cat:'item',name:'Bússola astral',desc:'Sprite original 160×160 de bússola mágica para navegação ou puzzle. Configure orientação nos eventos do GDevelop.',file:'bussola_astral.png',shape:'compass',tint:'#8be6f5'},
{id:'reliquia',cat:'item',name:'Relíquia do eclipse',desc:'Sprite original 160×160 de artefato místico para objetivos e coleta. A lógica de interação depende de eventos.',file:'reliquia_eclipse.png',shape:'relic',tint:'#e9b2ff'},
{id:'grifo',cat:'personagem',name:'Grifo das nuvens',desc:'Sprite original 160×160 de criatura alada para aventuras. Animação e colisão exigem eventos no GDevelop.',file:'grifo_nuvens.png',shape:'griffin',tint:'#ffdc94'},
{id:'druida',cat:'personagem',name:'Druida das raízes',desc:'Sprite original 160×160 de guardião da natureza para RPG ou puzzle. Habilidades dependem de eventos.',file:'druida_raizes.png',shape:'druid',tint:'#8ee4b1'},
{id:'ampulheta',cat:'item',name:'Ampulheta do tempo',desc:'Sprite 160×160 para puzzles de tempo ou objetivos; temporizador depende de eventos no GDevelop.',file:'ampulheta_tempo.png',shape:'hourglass',tint:'#ffce89'},
{id:'glb-cristal',cat:'modelo',name:'Cristal 3D low-poly',desc:'GLB leve de contingência. GDevelop → 3D Model.',file:'cristal_3d.glb',shape:'crystal',tint:'#58f6df'},
{id:'glb-totem',cat:'modelo',name:'Totem 3D low-poly',desc:'Prop para puzzle, monumento ou objetivo.',file:'totem_3d.glb',shape:'totem',tint:'#98d8ff'},
{id:'glb-bau',cat:'modelo',name:'Baú 3D low-poly',desc:'Prop de recompensa, loot ou missão.',file:'bau_3d.glb',shape:'box',tint:'#dca66f'},
{id:'glb-obstaculo',cat:'modelo',name:'Obstáculo 3D',desc:'Objeto para pista ou plataforma 3D.',file:'obstaculo_3d.glb',shape:'box',tint:'#8b93fe'},
{id:'glb-portal',cat:'modelo',name:'Portal 3D low-poly',desc:'Marco visual para chegada ou teleporte.',file:'portal_3d.glb',shape:'totem',tint:'#cd92ff'},
{id:'wav-coleta',cat:'som',name:'Coleta de item',desc:'WAV curto gerado matematicamente.',file:'coleta.wav',shape:'coin',tint:'#ffd56b'},
{id:'wav-vitoria',cat:'som',name:'Vitória / conquista',desc:'WAV original para fim da fase.',file:'vitoria.wav',shape:'flag',tint:'#abf88a'},
{id:'wav-dano',cat:'som',name:'Dano / perigo',desc:'WAV original para colisão com inimigo.',file:'dano.wav',shape:'monster',tint:'#f88a9d'},
{id:'wav-portal',cat:'som',name:'Portal / energia',desc:'WAV original para evento 3D.',file:'portal.wav',shape:'crystal',tint:'#a68bff'},
{id:'wav-menu',cat:'som',name:'Menu / escolha',desc:'WAV original de interface.',file:'menu.wav',shape:'robot',tint:'#82e6ff'}
];
function svgAsset(a){
 const t=a.tint, id=a.id.replace(/[^a-z0-9]/g,'');
 const map=a.cat==='mapa', w=map?1024:160,h=map?576:160;
 const style='<defs><linearGradient id="g" x2="0.8" y2="1"><stop stop-color="'+t+'"/><stop offset="1" stop-color="#30427c"/></linearGradient><filter id="gl"><feGaussianBlur stdDeviation="5"/></filter></defs>';
 let art='';
 if(map){
   let p=''; for(let y=0;y<h;y+=64)for(let x=0;x<w;x+=64){const n=(x/64*13+y/64*17)%11;p+='<rect x="'+x+'" y="'+y+'" width="64" height="64" fill="'+(n%2?'#1b3451':'#203c55')+'" stroke="#395e66" stroke-opacity=".18"/>';}
   if(a.shape==='forest'){for(let i=0;i<48;i++){let x=70+(i*163)%920,y=60+(i*117)%470;p+='<circle cx="'+x+'" cy="'+y+'" r="'+(16+i%4*3)+'" fill="#246857" stroke="#6fe0a2" stroke-width="4"/>';}}
   if(a.shape==='city'){p+='<rect x="110" y="0" width="120" height="576" fill="#314355"/><rect x="0" y="170" width="1024" height="120" fill="#314355"/>';for(let i=0;i<30;i++){let x=(i*173)%1000,y=(i*83)%550;p+='<rect x="'+x+'" y="'+y+'" width="50" height="34" rx="4" fill="#33466a" stroke="#42ddfa" stroke-opacity=".6"/>';}}
   if(a.shape==='platform'){p='<rect width="1024" height="576" fill="#142044"/><circle cx="820" cy="100" r="65" fill="#a5afff" opacity=".65"/>';for(let i=0;i<13;i++){let x=i*82,y=480-(i%5)*74;p+='<rect x="'+x+'" y="'+y+'" width="125" height="34" rx="4" fill="#4b5e9b" stroke="#8de4ff" stroke-width="3"/>';}}
   if(a.shape==='cave'){p='<rect width="1024" height="576" fill="#12152a"/>';for(let i=0;i<20;i++){let x=(i*157)%1000,y=(i*103)%530;p+='<path d="M'+x+' '+(y+60)+'l40 -90 90 110Z" fill="#3b3a5c" stroke="#816eaf" stroke-width="5"/>';}}
   if(a.shape==='track'){p='<rect width="1024" height="576" fill="#13263c"/><path d="M150 100 H790 Q950 130 890 310 Q880 470 620 445 H220 Q90 390 150 100" stroke="#424958" stroke-width="115" fill="none"/><path d="M150 100 H790 Q950 130 890 310 Q880 470 620 445 H220 Q90 390 150 100" stroke="#e2cf88" stroke-width="4" stroke-dasharray="16 17" fill="none"/>';}
   if(a.shape==='ruins'){
    p='<rect width="1024" height="576" fill="#252334"/><path d="M0 0H1024V576H0Z" fill="#413b45" opacity=".4"/><path d="M90 80H934V496H90Z" fill="#766c63" stroke="#c0a782" stroke-width="18"/><path d="M125 110H899V466H125Z" fill="#544b4c" stroke="#a38c73" stroke-width="5"/><path d="M512 88V480M110 288H914" stroke="#d3b58b" stroke-opacity=".24" stroke-width="13" stroke-dasharray="25 14"/><circle cx="512" cy="288" r="115" fill="#373544" stroke="#c2a67e" stroke-width="16"/><circle cx="512" cy="288" r="85" fill="none" stroke="#d9b98c" stroke-width="4" stroke-dasharray="12 10"/><path d="M512 213L579 288L512 363L445 288Z" fill="#6e6476" stroke="#f0d19e" stroke-width="8"/><circle cx="512" cy="288" r="22" fill="#f3c984"/>';
    for(let i=0;i<12;i++){const x=174+(i%6)*135,y=i<6?140:435;p+='<rect x="'+(x-25)+'" y="'+(y-22)+'" width="50" height="44" rx="7" fill="#b6a18a" stroke="#3b353b" stroke-width="7"/><rect x="'+(x-13)+'" y="'+(y-11)+'" width="26" height="22" fill="#6a6064"/>';}
    for(let i=0;i<30;i++){const x=45+(i*137)%930,y=38+(i*193)%502;p+='<path d="M'+x+' '+y+'l17 5 -7 12 -16 -3Z" fill="#c5b397" opacity=".55"/>';}
   }
   if(a.shape==='swamp'){
    p='<rect width="1024" height="576" fill="#152c32"/><path d="M0 70Q160 -20 310 110T640 80T1024 95V576H0Z" fill="#1b4445"/><path d="M0 380Q170 280 300 410T620 370T1024 405V576H0Z" fill="#1b3839"/><path d="M-50 325Q170 170 365 288T720 280T1080 225" stroke="#8b8062" stroke-width="90" fill="none" stroke-linecap="round"/><path d="M-50 325Q170 170 365 288T720 280T1080 225" stroke="#d0b78a" stroke-width="59" fill="none" stroke-linecap="round" stroke-dasharray="12 9"/>';
    for(let i=0;i<34;i++){const x=30+(i*173)%975,y=30+(i*139)%520,r=18+i%4*6;p+='<ellipse cx="'+x+'" cy="'+y+'" rx="'+(r*1.8)+'" ry="'+r+'" fill="#235b60" stroke="#55a9a2" stroke-width="3"/><path d="M'+(x-r)+' '+y+'q'+r+' -15 '+(r*2)+' 0" fill="none" stroke="#b4e6bf" stroke-opacity=".3" stroke-width="3"/>';}
    for(let i=0;i<30;i++){const x=22+(i*211)%980,y=25+(i*127)%526;p+='<path d="M'+x+' '+(y+15)+'l-7 -31m7 31l9 -36m-9 36l2 -42" fill="none" stroke="#80b28b" stroke-width="4" stroke-linecap="round"/>';}
    for(let i=0;i<8;i++){const x=75+i*121,y=150+(i%3)*107;p+='<circle cx="'+x+'" cy="'+y+'" r="7" fill="#f3d68c"/><circle cx="'+x+'" cy="'+y+'" r="22" fill="#f3d68c" opacity=".13"/>';}
   }

   if(a.shape==='necropolis'){
    p='<rect width="1024" height="576" fill="#1b2037"/><path d="M0 250H1024M490 0V576" stroke="#5b536a" stroke-width="110"/><path d="M0 250H1024M490 0V576" stroke="#a08f9d" stroke-width="5" stroke-dasharray="14 22" opacity=".55"/>';
    for(let i=0;i<18;i++){const x=72+(i%9)*109,y=i<9?65:420;p+='<rect x="'+x+'" y="'+y+'" width="68" height="92" rx="7" fill="#343349" stroke="#9a8fae" stroke-width="6"/><path d="M'+(x+10)+' '+(y+16)+'h48v50h-48Z" fill="#24263b" stroke="#625c83" stroke-width="3"/><path d="M'+(x+34)+' '+(y+24)+'v34m-14 -17h28" stroke="#c4b5e8" stroke-width="4"/>';}
    for(let i=0;i<12;i++){const x=58+(i*181)%930,y=28+(i*139)%500;p+='<ellipse cx="'+x+'" cy="'+y+'" rx="22" ry="12" fill="#15192c" opacity=".65"/><path d="M'+(x-15)+' '+y+'q15 -39 30 0v22h-30Z" fill="#69657a" stroke="#c1b3cc" stroke-width="4"/>';}
    for(let i=0;i<6;i++){const x=120+i*153;p+='<circle cx="'+x+'" cy="285" r="11" fill="#b6b7ff"/><circle cx="'+x+'" cy="285" r="35" fill="#b6b7ff" opacity=".1"/>';}
   }
   if(a.shape==='observatory'){
    p='<rect width="1024" height="576" fill="#0d1a39"/><circle cx="512" cy="288" r="248" fill="#263a5c" stroke="#a5d9e7" stroke-width="16"/><circle cx="512" cy="288" r="201" fill="#1b2b4b" stroke="#5688aa" stroke-width="6"/><circle cx="512" cy="288" r="158" fill="none" stroke="#85b9d6" stroke-width="5" stroke-dasharray="14 18"/><path d="M512 42V534M270 288H754" stroke="#7b9bb8" stroke-width="5" opacity=".6"/><circle cx="512" cy="288" r="72" fill="#26344b" stroke="#c2dff2" stroke-width="9"/><path d="M488 338l-34 -91 46 -21 49 93 42 12 -12 22 -56 -16Z" fill="#829bb7" stroke="#f3d7a4" stroke-width="6"/><circle cx="478" cy="247" r="21" fill="#273a56" stroke="#a5e6ff" stroke-width="7"/><path d="M500 331l-27 42m27 -42l37 44" stroke="#e1d0ae" stroke-width="10" stroke-linecap="round"/>';
    for(let i=0;i<28;i++){const x=25+(i*173)%975,y=22+(i*131)%528;p+='<path d="M'+x+' '+(y-6)+'v12m-6 -6h12" stroke="#c3eaff" stroke-width="3" opacity=".7"/>';}
    for(let i=0;i<8;i++){const angle=i*Math.PI/4,x=Math.round(512+220*Math.cos(angle)),y=Math.round(288+220*Math.sin(angle));p+='<circle cx="'+x+'" cy="'+y+'" r="13" fill="#ffd998" stroke="#fff2ca" stroke-width="4"/>';}
   }
   if(a.shape==='archipelago'){
    p='<rect width="1024" height="576" fill="#112d4d"/><path d="M0 0H1024V576H0Z" fill="#17466a" opacity=".55"/>';
    for(let i=0;i<6;i++){const x=170+(i%3)*335,y=140+Math.floor(i/3)*290,r=82+i%3*11;p+='<ellipse cx="'+x+'" cy="'+y+'" rx="'+(r+22)+'" ry="'+(r*.68+15)+'" fill="#2a7b89" stroke="#8be9e2" stroke-width="8"/><ellipse cx="'+x+'" cy="'+y+'" rx="'+r+'" ry="'+(r*.68)+'" fill="#426b58" stroke="#c6e5b1" stroke-width="6"/><path d="M'+(x-28)+' '+(y+18)+'l28 -56 28 56Z" fill="#86c4a4" stroke="#e2f8d1" stroke-width="5"/>';}
    for(let i=0;i<4;i++){const x=170+(i%2)*335,y=140+Math.floor(i/2)*290;p+='<path d="M'+(x+90)+' '+y+'h155" stroke="#b58b60" stroke-width="26" stroke-dasharray="28 8"/>';}
    for(let i=0;i<20;i++){const x=(i*193+27)%1024,y=(i*107+31)%576;p+='<circle cx="'+x+'" cy="'+y+'" r="5" fill="#c7fbff" opacity=".65"/>';}
   }
   if(a.shape==='fortress'){
    p='<rect width="1024" height="576" fill="#211e37"/><rect x="125" y="72" width="774" height="432" rx="16" fill="#55516b" stroke="#aa91c7" stroke-width="25"/><rect x="176" y="122" width="672" height="333" fill="#36354e" stroke="#c1add4" stroke-width="7"/><path d="M512 76V506M176 288H848" stroke="#d1bddc" stroke-width="10" stroke-dasharray="20 15"/><circle cx="512" cy="288" r="115" fill="#26233e" stroke="#c4a5e8" stroke-width="12"/><circle cx="512" cy="288" r="73" fill="#443454" stroke="#e3baff" stroke-width="6"/><path d="M512 220L576 288L512 356L448 288Z" fill="#9d76bd" stroke="#f3d4ff" stroke-width="7"/>';
    for(let i=0;i<8;i++){const x=i<4?128:896,y=100+(i%4)*124;p+='<rect x="'+(x-32)+'" y="'+(y-32)+'" width="64" height="64" fill="#777087" stroke="#d4bfe0" stroke-width="9"/><rect x="'+(x-16)+'" y="'+(y-16)+'" width="32" height="32" fill="#343049"/>';}
    p+='<rect x="455" y="464" width="114" height="56" fill="#16162c" stroke="#e2c4ff" stroke-width="8"/>';
   }
   if(a.shape==='machinelab'){
    p='<rect width="1024" height="576" fill="#101e33"/><rect x="32" y="34" width="960" height="508" rx="24" fill="#20364b" stroke="#71c8d9" stroke-width="12"/><path d="M80 288H944M512 75V500" stroke="#425d73" stroke-width="58"/><path d="M80 288H944M512 75V500" stroke="#b7d7d8" stroke-width="5" stroke-dasharray="16 18"/>';
    for(let i=0;i<12;i++){const x=124+(i%4)*250,y=105+Math.floor(i/4)*174,r=34+(i%3)*4;p+='<circle cx="'+x+'" cy="'+y+'" r="'+(r+10)+'" fill="#0d243b" stroke="#70b6d5" stroke-width="6"/><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#3d5875" stroke="#c4e8f1" stroke-width="5" stroke-dasharray="12 9"/><circle cx="'+x+'" cy="'+y+'" r="13" fill="#f8d18b" stroke="#fff0c2" stroke-width="4"/>';}
    p+='<rect x="400" y="228" width="224" height="122" rx="15" fill="#192b44" stroke="#7cdbf5" stroke-width="9"/><rect x="430" y="250" width="164" height="66" rx="9" fill="#0d5267" stroke="#c5f8ec" stroke-width="5"/><path d="M449 287L478 264L509 293L537 273L571 290" fill="none" stroke="#a8ffcd" stroke-width="6"/><circle cx="480" cy="331" r="6" fill="#ffd88b"/><circle cx="543" cy="331" r="6" fill="#ffd88b"/>';
   }
   if(a.shape==='glowgarden'){
    p='<rect width="1024" height="576" fill="#122e39"/><path d="M0 70Q260 -10 480 95T1024 68V576H0Z" fill="#194b51"/><path d="M-20 420Q180 320 360 382T730 330T1050 420" stroke="#3a7666" stroke-width="126" fill="none"/><path d="M-20 420Q180 320 360 382T730 330T1050 420" stroke="#c0d89a" stroke-width="20" stroke-dasharray="16 25" fill="none" opacity=".65"/><ellipse cx="220" cy="165" rx="150" ry="82" fill="#1c7284" stroke="#78dce5" stroke-width="10"/><ellipse cx="810" cy="160" rx="134" ry="80" fill="#1c7284" stroke="#78dce5" stroke-width="10"/><ellipse cx="520" cy="500" rx="170" ry="68" fill="#1a6179" stroke="#78dce5" stroke-width="8"/>';
    for(let i=0;i<26;i++){const x=45+(i*157)%940,y=38+(i*113)%505,r=13+i%4*3;p+='<ellipse cx="'+x+'" cy="'+(y+12)+'" rx="'+(r+10)+'" ry="9" fill="#071f30" opacity=".55"/><path d="M'+(x-5)+' '+(y+9)+'v-'+(r+7)+'h10v'+(r+7)+'Z" fill="#d5dfbb"/><path d="M'+(x-r)+' '+(y-r+8)+'q'+r+' -'+(r+24)+' '+(r*2)+' 0q-'+r+' 14 -'+(r*2)+' 0Z" fill="'+(i%2?'#bf83ed':'#6be1ba')+'" stroke="#d8f9df" stroke-width="3"/><circle cx="'+x+'" cy="'+(y-r+2)+'" r="4" fill="#f9efb7"/>';}
    for(let i=0;i<32;i++){const x=25+(i*223)%990,y=20+(i*149)%530;p+='<circle cx="'+x+'" cy="'+y+'" r="'+(3+i%3)+'" fill="#dcffb0" opacity=".85"/><circle cx="'+x+'" cy="'+y+'" r="11" fill="#a6ffb0" opacity=".12"/>';}
    p+='<circle cx="515" cy="290" r="58" fill="#2b676b" stroke="#b5eab4" stroke-width="10"/><path d="M515 242l32 48 -32 48 -32 -48Z" fill="#a6f8cf" stroke="#edffcd" stroke-width="6"/>';
   }
   art=p+'<rect x="15" y="15" width="994" height="546" fill="none" rx="18" stroke="'+t+'" stroke-opacity=".45" stroke-width="4"/>';
 }else{
  let core='';
  if(a.shape==='hero'){core='<rect x="56" y="57" width="48" height="57" rx="15" fill="url(#g)"/><rect x="39" y="67" width="18" height="49" rx="8" fill="'+t+'"/><rect x="103" y="67" width="18" height="49" rx="8" fill="'+t+'"/><rect x="61" y="107" width="14" height="34" rx="5" fill="#657cc6"/><rect x="86" y="107" width="14" height="34" rx="5" fill="#657cc6"/><circle cx="80" cy="39" r="26" fill="#a5a9d6" stroke="'+t+'" stroke-width="5"/><rect x="57" y="34" width="46" height="13" rx="7" fill="#173459"/><circle cx="69" cy="40" r="4" fill="'+t+'"/><circle cx="91" cy="40" r="4" fill="'+t+'"/>';}
  if(a.shape==='robot'){core='<rect x="38" y="24" width="84" height="75" rx="20" fill="#7586be" stroke="'+t+'" stroke-width="6"/><rect x="49" y="43" width="62" height="30" rx="9" fill="#162a50"/><circle cx="67" cy="58" r="7" fill="'+t+'"/><circle cx="94" cy="58" r="7" fill="'+t+'"/><rect x="55" y="102" width="50" height="42" rx="13" fill="url(#g)"/><path d="M80 24V12" stroke="'+t+'" stroke-width="5"/><circle cx="80" cy="8" r="6" fill="'+t+'"/>';}
  if(a.shape==='monster'){core='<path d="M35 133 V62Q42 15 80 21Q120 18 127 62V133L109 115 94 136 79 115 65 136 48 113Z" fill="url(#g)" stroke="#3e2460" stroke-width="7"/><ellipse cx="62" cy="68" rx="12" ry="14" fill="#10142a"/><ellipse cx="100" cy="68" rx="12" ry="14" fill="#10142a"/><path d="M56 99L68 111L80 99L93 111L105 99" fill="none" stroke="#fce0ff" stroke-width="6"/>';}
  if(a.shape==='ghost'){core='<path d="M39 131V69Q42 20 80 20Q124 25 122 76V133L107 121L94 138L81 124L65 138L52 121Z" fill="url(#g)" stroke="#a5c4ff" stroke-width="5"/><ellipse cx="61" cy="74" rx="9" ry="15" fill="#1a245a"/><ellipse cx="99" cy="74" rx="9" ry="15" fill="#1a245a"/>';}
  if(a.shape==='key'){core='<circle cx="55" cy="60" r="25" fill="none" stroke="url(#g)" stroke-width="15"/><path d="M75 79L128 133M103 108L116 95M113 121L127 108" stroke="'+t+'" stroke-width="13" stroke-linecap="round"/>';}
  if(a.shape==='coin'){core='<circle cx="80" cy="80" r="55" fill="#886a23" stroke="'+t+'" stroke-width="10"/><circle cx="80" cy="80" r="42" fill="#f9c755" stroke="#fff0a2" stroke-width="5"/><text x="80" y="99" font-size="56" text-anchor="middle" font-weight="900" fill="#8c6918">★</text>';}
  if(a.shape==='crystal'){core='<path d="M80 10L132 65L80 148L28 65Z" fill="url(#g)" stroke="#d4faff" stroke-width="6"/><path d="M80 10V148M28 65H132" fill="none" stroke="#e8ffff" stroke-width="5" opacity=".6"/>';}
  if(a.shape==='door'){core='<rect x="34" y="11" width="92" height="140" rx="8" fill="#38405f" stroke="'+t+'" stroke-width="10"/><rect x="46" y="23" width="68" height="112" fill="url(#g)" opacity=".75"/><circle cx="100" cy="85" r="6" fill="#ffe7a0"/>';}
  if(a.shape==='heart'){core='<path d="M80 139L21 78Q5 37 40 25Q64 17 80 44Q104 9 132 28Q162 68 125 100Z" fill="url(#g)" stroke="#ffb8dd" stroke-width="7"/>';}
  if(a.shape==='potion'){core='<rect x="65" y="18" width="30" height="38" rx="5" fill="#abdef1"/><rect x="50" y="48" width="60" height="91" rx="22" fill="url(#g)" stroke="#d2fff1" stroke-width="7"/><path d="M56 100Q82 74 105 94" stroke="#efffff" stroke-width="7" fill="none"/>';}
  if(a.shape==='flag'){core='<path d="M55 143V24" stroke="#d2f5ff" stroke-width="9"/><path d="M61 23L130 42L66 79Z" fill="url(#g)" stroke="#f4fdff" stroke-width="5"/>';}
  if(a.shape==='box' || a.shape==='totem'){core='<rect x="30" y="30" width="100" height="100" fill="url(#g)" stroke="#c4f3ff" stroke-width="8"/><path d="M30 30L80 8L130 30M130 130L80 153L30 130" fill="none" stroke="'+t+'" stroke-width="7"/>';}
  if(a.shape==='sentinel'){core='<path d="M30 143L45 78L80 63L115 78L130 143Z" fill="#243d69" stroke="'+t+'" stroke-width="6"/><path d="M50 44L60 18H100L110 44L99 69H61Z" fill="#5874a1" stroke="#c8f6ff" stroke-width="6"/><path d="M57 45H103L94 57H66Z" fill="#162a4b" stroke="'+t+'" stroke-width="4"/><path d="M80 81L103 110L80 136L57 110Z" fill="url(#g)" stroke="#e8ffff" stroke-width="6"/><path d="M24 88L44 75L56 113L35 128Z M136 88L116 75L104 113L125 128Z" fill="#4a7aa2" stroke="#bdeaff" stroke-width="5"/>';}
  if(a.shape==='archer'){core='<path d="M30 144L45 80L80 65L115 80L130 144Z" fill="#315344" stroke="'+t+'" stroke-width="6"/><path d="M48 55Q45 16 80 15Q115 16 112 55L100 71H60Z" fill="#294c35" stroke="#d1f5a7" stroke-width="6"/><ellipse cx="80" cy="56" rx="20" ry="21" fill="#d8b89d"/><path d="M63 54H70M90 54H97" stroke="#30402f" stroke-width="5"/><path d="M123 20Q155 80 123 140" fill="none" stroke="#edc889" stroke-width="7"/><path d="M123 20V140" stroke="#f9f3da" stroke-width="3"/><path d="M25 89L130 72" stroke="#e8c68a" stroke-width="5"/><path d="M25 89L44 76V101Z" fill="#d9f4ac"/>';}
  if(a.shape==='compass'){core='<circle cx="80" cy="80" r="64" fill="#253d58" stroke="#d4e8cc" stroke-width="8"/><circle cx="80" cy="80" r="50" fill="#162b47" stroke="'+t+'" stroke-width="5"/><path d="M80 23L98 80L80 137L62 80Z" fill="url(#g)" stroke="#e5faff" stroke-width="5"/><path d="M80 23L98 80H62Z" fill="#f4c98e"/><circle cx="80" cy="80" r="11" fill="#f8e3b6" stroke="#ffffff" stroke-width="4"/><path d="M80 7V19M80 141V153M7 80H19M141 80H153" stroke="#d9f7ff" stroke-width="5"/>';}
  if(a.shape==='hourglass'){core='<path d="M40 20H120V34Q115 58 92 77Q115 97 120 127V141H40V127Q45 98 68 77Q45 58 40 34Z" fill="#3b3456" stroke="#f4d9a8" stroke-width="7"/><path d="M56 38H104Q99 58 80 72Q61 58 56 38Z" fill="#b1e9e7"/><path d="M57 124H103Q98 103 80 91Q62 103 57 124Z" fill="url(#g)"/><path d="M80 72V92" stroke="#fff1b5" stroke-width="5" stroke-dasharray="3 5"/><rect x="32" y="12" width="96" height="15" rx="5" fill="#af7f56" stroke="#ffe5aa" stroke-width="4"/><rect x="32" y="135" width="96" height="15" rx="5" fill="#af7f56" stroke="#ffe5aa" stroke-width="4"/><circle cx="80" cy="78" r="7" fill="#fff3bd"/><path d="M18 80H31M129 80H142M80 1V9" stroke="'+t+'" stroke-width="4"/>';}
  if(a.shape==='relic'){core='<path d="M80 9L129 54L113 123L80 153L47 123L31 54Z" fill="#332b56" stroke="'+t+'" stroke-width="7"/><path d="M80 23L114 60L102 114L80 135L58 114L46 60Z" fill="url(#g)" stroke="#f8e5ff" stroke-width="5"/><circle cx="80" cy="80" r="29" fill="#201e42" stroke="#f3c6ff" stroke-width="6"/><path d="M80 53A27 27 0 1 0 80 107A18 18 0 1 1 80 53Z" fill="#ffe1a3"/><path d="M80 13V38M80 122V147M35 80H53M107 80H125" stroke="#ffffff" stroke-width="4"/>';}
  if(a.shape==='griffin'){core='<path d="M40 101L8 36L65 68L80 102L94 66L151 35L120 109Z" fill="#b18d69" stroke="#f7dfaa" stroke-width="6"/><path d="M49 99Q40 57 78 45Q114 51 113 99L125 143H35Z" fill="url(#g)" stroke="#fbe4a7" stroke-width="6"/><path d="M57 53L77 18L105 38L108 65L88 78L65 72Z" fill="#e7cf9e" stroke="#fff2d0" stroke-width="5"/><path d="M105 47L138 57L106 70Z" fill="#e8aa6b" stroke="#ffdfae" stroke-width="4"/><circle cx="85" cy="49" r="5" fill="#253448"/><path d="M51 139L45 155M106 139L113 155" stroke="#8e735b" stroke-width="11"/>';}
  if(a.shape==='druid'){core='<path d="M28 144L44 78L68 65H96L118 81L133 144Z" fill="#2c5444" stroke="'+t+'" stroke-width="6"/><path d="M51 90L80 73L108 90L98 142H62Z" fill="url(#g)"/><path d="M40 54Q40 22 80 16Q120 22 120 54L104 72H56Z" fill="#37533b" stroke="#b9edac" stroke-width="6"/><ellipse cx="80" cy="58" rx="20" ry="22" fill="#c7a986"/><path d="M57 43L42 23M103 43L118 23" stroke="#c6e9b2" stroke-width="7"/><path d="M124 144L131 26" stroke="#9e784e" stroke-width="7"/><path d="M131 14L147 36L131 54L115 36Z" fill="#a8f4ce" stroke="#e8fff1" stroke-width="4"/><circle cx="73" cy="60" r="3" fill="#284b32"/><circle cx="89" cy="60" r="3" fill="#284b32"/>';}
  if(a.shape==='fox'){core='<path d="M34 54L28 12L67 34L93 34L132 12L126 54" fill="#ad7658" stroke="#ffe4b6" stroke-width="6"/><path d="M35 51Q80 11 125 51L133 100Q108 139 80 148Q52 139 27 100Z" fill="url(#g)" stroke="#fce5c3" stroke-width="6"/><path d="M45 83Q80 110 115 83L107 122L80 139L53 122Z" fill="#f8e3c5"/><rect x="41" y="58" width="78" height="26" rx="12" fill="#26374d" stroke="#c9f8e8" stroke-width="5"/><circle cx="59" cy="71" r="8" fill="#a6ffdc"/><circle cx="101" cy="71" r="8" fill="#a6ffdc"/><path d="M69 109L80 119L91 109Z" fill="#323d54"/><circle cx="80" cy="42" r="10" fill="#2c5160" stroke="#e5d59d" stroke-width="4"/><path d="M80 33V51M71 42H89" stroke="#8cf8f0" stroke-width="3"/><path d="M39 126L23 145M121 126L137 145" stroke="#c5a177" stroke-width="7"/>';}
  if(a.shape==='owl'){core='<path d="M50 105L12 72L23 118L53 136Z" fill="#977052" stroke="#ffe1a5" stroke-width="5"/><path d="M110 105L148 72L137 118L107 136Z" fill="#977052" stroke="#ffe1a5" stroke-width="5"/><ellipse cx="80" cy="96" rx="43" ry="48" fill="url(#g)" stroke="#e8d0a4" stroke-width="6"/><path d="M39 63L46 19L70 39M121 63L114 19L90 39" fill="#a78564" stroke="#ffe0a3" stroke-width="6"/><circle cx="80" cy="62" r="44" fill="#51435c" stroke="#d5b989" stroke-width="6"/><circle cx="62" cy="63" r="19" fill="#b5f4e8" stroke="#2d5267" stroke-width="7"/><circle cx="98" cy="63" r="19" fill="#b5f4e8" stroke="#2d5267" stroke-width="7"/><circle cx="64" cy="64" r="6" fill="#15263a"/><circle cx="96" cy="64" r="6" fill="#15263a"/><path d="M73 82L80 96L87 82Z" fill="#f6c274"/><circle cx="80" cy="117" r="17" fill="#23374e" stroke="#d4f8e7" stroke-width="5"/><path d="M80 106V128M69 117H91" stroke="#8ef1d2" stroke-width="4"/><path d="M63 138L56 152M97 138L104 152" stroke="#c6a67e" stroke-width="7"/>';}
  if(a.shape==='mage'){core='<path d="M31 145L43 73Q50 45 80 46Q112 45 118 75L133 145Z" fill="#45315e" stroke="'+t+'" stroke-width="5"/><path d="M55 89L80 63L106 89L98 142H62Z" fill="url(#g)"/><path d="M50 44Q80 -5 110 44L126 60H34Z" fill="#292342" stroke="'+t+'" stroke-width="5"/><ellipse cx="80" cy="57" rx="20" ry="22" fill="#d7b4a4"/><path d="M62 53Q80 35 98 53" stroke="#392b55" stroke-width="11" fill="none"/><circle cx="73" cy="59" r="3" fill="#281e35"/><circle cx="88" cy="59" r="3" fill="#281e35"/><path d="M127 140L135 25" stroke="#d7b789" stroke-width="6"/><path d="M135 12l13 15 -13 17 -12 -17Z" fill="#a6e6ff" stroke="#f6d7ff" stroke-width="3"/><path d="M70 106l10 -13 10 13 -10 14Z" fill="#f3d9ff"/><path d="M45 125l-13 -9m85 9l13 -9" stroke="#c3a5ff" stroke-width="5"/>';}
  if(a.shape==='golem'){core='<path d="M47 43L59 19H104L117 45L106 80H55Z" fill="#78767a" stroke="'+t+'" stroke-width="6"/><path d="M44 83L20 69L9 105L28 126L52 108M115 83L140 69L153 106L132 126L109 108" fill="#77716f" stroke="#d4b897" stroke-width="6"/><path d="M47 81H113L124 133L95 147H65L36 133Z" fill="#4b505c" stroke="'+t+'" stroke-width="6"/><path d="M52 134L47 156M108 134L114 156" stroke="#8d8682" stroke-width="18"/><path d="M60 57h17m8 0h17" stroke="#ffdd9b" stroke-width="7"/><path d="M80 90L99 109L80 130L61 109Z" fill="#ffd486" stroke="#fff3bf" stroke-width="4"/><path d="M40 96l-9 13M117 96l10 13" stroke="#302c35" stroke-width="5"/>';}
  if(a.shape==='lantern'){core='<path d="M62 26V15H99V26M80 14V5" fill="none" stroke="#e8d7a9" stroke-width="7"/><path d="M48 50L64 30H96L113 50L104 126H57Z" fill="#4c4550" stroke="#ffe0a2" stroke-width="7"/><path d="M63 56H98L94 112H67Z" fill="#ffe29b" stroke="#fff7d3" stroke-width="4"/><path d="M80 65Q96 82 80 104Q65 91 80 65Z" fill="#ff9b45"/><path d="M43 130H117V145H43Z" fill="#8a7360" stroke="#ffe0a2" stroke-width="5"/><path d="M50 50H110M53 120H107" stroke="#e6d0a2" stroke-width="6"/><circle cx="80" cy="84" r="61" fill="#ffce70" opacity=".08"/>';}
  if(a.shape==='shield'){core='<path d="M80 11L135 33V83Q131 123 80 151Q29 123 25 83V33Z" fill="#273d57" stroke="#c2e6ff" stroke-width="8"/><path d="M80 25L119 41V84Q114 111 80 134Q46 111 41 84V41Z" fill="url(#g)" stroke="#f7dcad" stroke-width="4"/><path d="M80 39V121M52 78H108" stroke="#eafaff" stroke-width="11"/><circle cx="80" cy="78" r="13" fill="#ffe4a1" stroke="#fff8d6" stroke-width="4"/><path d="M35 43L49 49M111 49L125 43" stroke="#ffffff" stroke-opacity=".7" stroke-width="4"/>';}

  if(a.shape==='spikes'){core='<path d="M16 130H144V148H16Z" fill="#4b465c" stroke="#f5c0bd" stroke-width="5"/><path d="M18 128L37 34L57 128L78 18L100 128L124 40L143 128Z" fill="url(#g)" stroke="#ffe4da" stroke-width="6" stroke-linejoin="round"/><path d="M25 132H135" stroke="#251f34" stroke-width="7"/><circle cx="80" cy="74" r="13" fill="#fff0d8" opacity=".3"/>';}
  if(a.shape==='pedestal'){core='<path d="M35 130H125L137 151H23Z" fill="#55506f" stroke="#b6a9e5" stroke-width="6"/><path d="M53 69H107L114 131H46Z" fill="#403b61" stroke="#c9b6ed" stroke-width="6"/><ellipse cx="80" cy="68" rx="49" ry="17" fill="#73608c" stroke="#e7d2ff" stroke-width="6"/><path d="M80 13L107 42L80 72L53 42Z" fill="url(#g)" stroke="#f1e3ff" stroke-width="5"/><path d="M80 13V72M53 42H107" stroke="#fff3df" stroke-width="3"/><path d="M67 103L80 89L93 103L80 118Z" fill="#d6b8ff"/><circle cx="80" cy="42" r="61" fill="#c3a6ff" opacity=".09"/>';}
  art='<circle cx="80" cy="80" r="70" fill="'+t+'" opacity=".10" filter="url(#gl)"/>'+core;
 }
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+style+art+'</svg>';
}
function downloadBlob(blob,file){const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=file;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},3000);}
function pngBlob(a){return new Promise(function(resolve,reject){const svg=svgAsset(a);const img=new Image();img.onload=function(){try{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);c.toBlob(function(blob){if(blob){resolve(blob)}else reject(Error('PNG indisponível'))},'image/png');}catch(e){reject(e)}};img.onerror=reject;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);})}
async function pngDownload(a){downloadBlob(await pngBlob(a),a.file);return true;}
function modelBlob(a){
 const crystal=a.shape==='crystal';let verts=crystal?[0,1.55,0,-.9,0,0,0,0,-.9,.9,0,0,0,0,.9,0,-1.35,0]:[-1,-1,-1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,1,1];
 let faces=crystal?[0,1,2,0,2,3,0,3,4,0,4,1,5,2,1,5,3,2,5,4,3,5,1,4]:[0,1,2,0,2,3,4,7,6,4,6,5,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0];
 if(a.shape==='totem'){for(let i=0;i<verts.length;i+=3){verts[i]*=.55;verts[i+1]*=1.85;verts[i+2]*=.55;}}
 const pos=new Float32Array(verts),idx=new Uint16Array(faces);
 const indicesByte=idx.byteLength,pad=(4-indicesByte%4)%4,buf=new Uint8Array(pos.byteLength+indicesByte+pad);
 buf.set(new Uint8Array(pos.buffer),0);buf.set(new Uint8Array(idx.buffer),pos.byteLength);
 const color=a.tint.replace('#',''),rgba=[0,2,4].map(i=>parseInt(color.slice(i,i+2),16)/255).concat([1]);
 const xs=[],ys=[],zs=[];for(let i=0;i<verts.length;i+=3){xs.push(verts[i]);ys.push(verts[i+1]);zs.push(verts[i+2]);}
 const gltf={asset:{version:'2.0',generator:'PIT Creator Mode procedural lowpoly'},extensionsUsed:['KHR_materials_unlit'],buffers:[{byteLength:buf.byteLength}],bufferViews:[{buffer:0,byteOffset:0,byteLength:pos.byteLength,target:34962},{buffer:0,byteOffset:pos.byteLength,byteLength:indicesByte,target:34963}],accessors:[{bufferView:0,componentType:5126,count:pos.length/3,type:'VEC3',min:[Math.min(...xs),Math.min(...ys),Math.min(...zs)],max:[Math.max(...xs),Math.max(...ys),Math.max(...zs)]},{bufferView:1,componentType:5123,count:idx.length,type:'SCALAR'}],materials:[{name:'PIT material',doubleSided:true,pbrMetallicRoughness:{baseColorFactor:rgba,metallicFactor:0,roughnessFactor:1},extensions:{KHR_materials_unlit:{}}}],meshes:[{primitives:[{attributes:{POSITION:0},indices:1,material:0}]}],nodes:[{mesh:0,name:a.name}],scenes:[{nodes:[0]}],scene:0};
 const json=new TextEncoder().encode(JSON.stringify(gltf));const jsonPad=(4-json.length%4)%4;const all=12+8+json.length+jsonPad+8+buf.length;const buffer=new ArrayBuffer(all),v=new DataView(buffer),u=new Uint8Array(buffer);
 v.setUint32(0,0x46546c67,true);v.setUint32(4,2,true);v.setUint32(8,all,true);v.setUint32(12,json.length+jsonPad,true);v.setUint32(16,0x4e4f534a,true);u.set(json,20);u.fill(32,20+json.length,20+json.length+jsonPad);
 let start=20+json.length+jsonPad;v.setUint32(start,buf.length,true);v.setUint32(start+4,0x004e4942,true);u.set(buf,start+8);return new Blob([buffer],{type:'model/gltf-binary'});
}
function modelDownload(a){downloadBlob(modelBlob(a),a.file);}
function audioBlob(a){
 const sr=22050,seconds=a.id==='wav-vitoria'?1.3:.7,n=Math.floor(sr*seconds);const buffer=new ArrayBuffer(44+n*2),v=new DataView(buffer);
 function label(p,s){for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i));}
 label(0,'RIFF');v.setUint32(4,36+n*2,true);label(8,'WAVE');label(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);label(36,'data');v.setUint32(40,n*2,true);
 for(let i=0;i<n;i++){const t=i/sr,u=i/n;let hz=260;
 if(a.id==='wav-vitoria')hz=392+u*400+Math.sin(u*30)*50;
 if(a.id==='wav-coleta')hz=570+u*700;
 if(a.id==='wav-dano')hz=240-u*130;
 if(a.id==='wav-portal')hz=160+u*600;
 if(a.id==='wav-menu')hz=490+u*120;
 const env=Math.pow(1-u,2.3)*Math.min(1,u*45);const sample=(Math.sin(2*Math.PI*hz*t)+.18*Math.sin(2*Math.PI*hz*2.01*t))*env*.30;v.setInt16(44+i*2,Math.max(-32767,Math.min(32767,Math.round(sample*32767))),true);}
 return new Blob([buffer],{type:'audio/wav'});
}
function audioDownload(a){downloadBlob(audioBlob(a),a.file);}
/* Suggested genres are discovery aids, not technical compatibility or licenses. */
const genreExamples={
 rpg:['raposa-automata','mapa-laboratorio','coruja-mecanica','mapa-jardim-luz','ampulheta','sentinela','arqueiro','grifo','druida','explorador','heroina','feiticeira','golem','mapa-ruinas','mapa-pantano','mapa-necropole','mapa-observatorio','mapa-arquipelago','mapa-fortaleza','bussola','reliquia','lanterna','escudo','espinhos','pedestal','robo','monstro','mapa-floresta','mapa-cidade','mapa-caverna','chave','moeda','cristal','porta','coracao','pocao','checkpoint','glb-cristal','glb-totem','glb-bau','glb-portal','wav-coleta','wav-vitoria','wav-dano','wav-portal','wav-menu'],
 plataforma:['grifo','explorador','heroina','golem','escudo','espinhos','robo','monstro','fantasma','mapa-plataforma','mapa-caverna','moeda','cristal','coracao','pocao','checkpoint','glb-obstaculo','wav-coleta','wav-vitoria','wav-dano'],
 puzzle:['raposa-automata','mapa-laboratorio','coruja-mecanica','mapa-jardim-luz','ampulheta','druida','heroina','feiticeira','golem','mapa-ruinas','mapa-pantano','mapa-necropole','mapa-observatorio','mapa-arquipelago','mapa-fortaleza','bussola','reliquia','lanterna','escudo','espinhos','pedestal','robo','monstro','fantasma','mapa-floresta','mapa-caverna','chave','cristal','porta','pocao','glb-cristal','glb-totem','glb-bau','glb-portal','wav-portal','wav-menu','wav-vitoria'],
 corrida:['piloto','mapa-corrida','glb-obstaculo','wav-menu','wav-dano','wav-vitoria']
};
function assetMatches(a,{cat='todos',search='',genre='todos',format='todos'}={}){
 const type=a.cat==='modelo'?'3d':a.cat==='som'?'audio':'2d';
 const q=String(search).trim().toLocaleLowerCase('pt-BR');
 return (cat==='todos'||a.cat===cat)
  &&(format==='todos'||type===format)
  &&(genre==='todos'||(genreExamples[genre]||[]).includes(a.id))
  &&(!q||[a.name,a.desc,a.file].some(x=>x.toLocaleLowerCase('pt-BR').includes(q)));
}
function assetIcon(a){return ({personagem:'🎮',mapa:'🗺️',item:'🗝️',modelo:'🧊',som:'🔊'})[a.cat]}
function renderAssets(){
 const cat=document.querySelector('[data-filter].active')?.dataset.filter||'todos';
 const search=document.getElementById('assetSearch')?.value||'';
 const genre=document.getElementById('assetGenre')?.value||'todos';
 const format=document.getElementById('assetFormat')?.value||'todos';
 const filtered=assets.filter(a=>assetMatches(a,{cat,search,genre,format}));
 const box=document.getElementById('assetGrid');if(!box)return;
 box.innerHTML=filtered.map(function(a){
 const image='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgAsset(a));
 const tag={personagem:'PNG · SPRITE',mapa:'PNG · CENÁRIO',item:'PNG · OBJETO',modelo:'GLB · MODELO 3D',som:'WAV · ÁUDIO'}[a.cat];
 const format=a.cat==='modelo'?'glb':a.cat==='som'?'wav':'png';
 return '<article class="resource-card" data-asset-format="'+format+'"><div class="asset-picture"><img src="'+image+'" loading="lazy" alt="Prévia de '+a.name+'"></div><div class="res-inner"><small>'+tag+'</small><h3>'+a.name+'</h3><p>'+a.desc+'</p><small title="Recurso procedural original do projeto, não extraído de jogo comercial">Gerado localmente · uso didático</small><button type="button" class="preview-asset" data-preview="'+a.id+'" aria-label="Visualizar '+a.name+' em tamanho maior">◉ VER PRÉVIA</button><button type="button" class="download" data-asset="'+a.id+'">↓ Baixar '+a.file+'</button></div></article>';
 }).join('')||'<p>Sem resultados. Experimente outra categoria.</p>';
 box.querySelectorAll('[data-asset]').forEach(b=>b.addEventListener('click',async function(){const a=assets.find(x=>x.id===b.dataset.asset);b.disabled=true;const old=b.textContent;b.textContent='Preparando arquivo…';try{if(a.cat==='modelo')modelDownload(a);else if(a.cat==='som')audioDownload(a);else await pngDownload(a);}catch(e){alert('Não foi possível baixar. Tente Chrome/Edge atualizado. '+e.message)}finally{b.disabled=false;b.textContent=old}}));
 const n=document.getElementById('resultCount');if(n)n.textContent=filtered.length+' recursos nesta seleção';
}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',function(){document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.remove('active')});b.classList.add('active');renderAssets();}));
document.getElementById('assetSearch')?.addEventListener('input',renderAssets);
for(const id of ['assetGenre','assetFormat'])document.getElementById(id)?.addEventListener('change',renderAssets);
function refreshStatus(){
 const meter=document.getElementById('myProgress');
 if(meter)meter.textContent='Progresso e conquistas no Caderno do Aluno';
 const stats=[...document.querySelectorAll('.statband span')];
 const resourceCount=stats.find(el=>/recursos para download/i.test(el.textContent));
 if(resourceCount)resourceCount.textContent=assets.length+' recursos para download';
 const missionCount=stats.find(el=>/\d+ missões/i.test(el.textContent));
 const cards=document.querySelectorAll('#missoes .mission-card').length;
 if(missionCount&&cards)missionCount.textContent=cards+' missões';
}
window.PIT_LIBRARY_API=Object.freeze({assets,assetBlob:async function(a){if(!a||!assets.some(x=>x.id===a.id))throw Error('Asset desconhecido');return a.cat==='modelo'?modelBlob(a):a.cat==='som'?audioBlob(a):pngBlob(a)},downloadBlob});
renderAssets();refreshStatus();window.addEventListener('pageshow',refreshStatus);
/* Load the independent preview layer after the local asset API is ready. */
if(document.getElementById('assetGrid')){
 const css=document.createElement('link');css.rel='stylesheet';css.href='./v3/library-preview.css';document.head.appendChild(css);
 const js=document.createElement('script');js.src='./v3/library-preview.js';js.async=true;document.body.appendChild(js);
}


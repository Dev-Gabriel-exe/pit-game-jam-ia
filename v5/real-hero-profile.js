/* Forja do herói — perfil REAL vinculado ao aluno, sem personagens de demonstração.
 * Recompensas vêm EXCLUSIVAMENTE do total de fichas aprovado no servidor V3.
 * Build local temporário, escopado por (turma, UUID); nunca é fingido como salvo no Neon.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_REAL_HERO=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const ATTR=['FOR','DES','INT','VIT','DEF'];
 const ATTR_LABEL={FOR:'Força',DES:'Destreza',INT:'Intelecto',VIT:'Vitalidade',DEF:'Defesa'};
 const ICON={warrior:'⚔',mage:'✦',hunter:'➶',guardian:'◆'};
 const COPY_VERSION='pit-v5-personagem-local-1';
 const clamp=(x,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(x))?Number(x):min));
 const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const storageKey=(room,id)=>'pit_v5_real_hero_1_'+String(room||'PITGAME26').toUpperCase()+'_'+String(id||'');
 const create=()=>({schema:COPY_VERSION,klass:'warrior',attributes:Object.fromEntries(ATTR.map(k=>[k,0])),talents:[]});
 const categories={B:'FORÇA',D:'DESTREZA',T:'DEFESA / MAGIA',E:'MAGIA',F:'MAGIA',G:'GUARDA'};
 function clean(raw,approved,catalog){
  const classes=catalog?.CLASSES||{},source=raw&&typeof raw==='object'?raw:{};
  const klass=Object.hasOwn(classes,source.klass)?source.klass:'warrior';
  const attrs={};let remaining=clamp(approved,0,10)*2;
  for(const a of ATTR){const val=Math.max(0,Math.min(20,Math.trunc(Number(source.attributes?.[a])||0)));
   attrs[a]=Math.min(remaining,val);remaining-=attrs[a]}
  const allowed=new Set((catalog?.TALENTS?.[klass]||[]).map(x=>x.id));
  const talents=[...new Set(Array.isArray(source.talents)?source.talents:[])].filter(x=>allowed.has(x))
   .slice(0,clamp(approved,0,10));
  return {schema:COPY_VERSION,klass,attributes:attrs,talents};
 }
 function validate(raw,approved,catalog){
  const verified=clean(raw,approved,catalog);
  if(JSON.stringify({...verified,schema:raw?.schema||COPY_VERSION})!==
    JSON.stringify({...raw,schema:raw?.schema||COPY_VERSION}))return false;
  return Object.keys(catalog?.CLASSES||{}).includes(verified.klass);
 }
 function exportCode(profile){return btoa(unescape(encodeURIComponent(JSON.stringify({
   version:COPY_VERSION,klass:profile.klass,attributes:profile.attributes,talents:profile.talents
  }))));}
 function importCode(code,approved,catalog){
  if(!/^[A-Za-z0-9+/=]{20,12000}$/.test(String(code||'')))throw Error('Código de ficha inválido');
  let v;try{v=JSON.parse(decodeURIComponent(escape(atob(code))))}catch{throw Error('Não foi possível ler esse código de personagem')}
  if(v.version!==COPY_VERSION||!Object.hasOwn(catalog.CLASSES,v.klass))throw Error('Ficha de personagem incompatível');
  const profile=clean(v,approved,catalog);
  if(!Array.isArray(v.talents)||profile.talents.length!==v.talents.length||
    ATTR.some(k=>profile.attributes[k]!==v.attributes?.[k]))throw Error('A ficha excede as recompensas aprovadas deste aluno');
  return profile;
 }
 let model={key:null,draft:null,saved:null,approved:0,room:'',id:'',name:'',flash:'',warning:''};
 function load(room,id,approved,catalog){
  const key=storageKey(room,id);
  if(key===model.key){
   model.approved=approved;
   const cleaned=clean(model.draft,approved,catalog);
   if(JSON.stringify(cleaned)!==JSON.stringify(model.draft)){
    model.warning='O orçamento mudou: as escolhas acima do limite foram retiradas.';
    model.draft=cleaned;
   }
   return;
  }
  let raw=null;try{raw=JSON.parse(localStorage.getItem(key)||'null')}catch{}
  model={key,room,id,approved,name:'',draft:clean(raw||create(),approved,catalog),
   saved:raw,flash:'',warning:''};
  if(raw&&JSON.stringify(clean(raw,approved,catalog))!==JSON.stringify(raw))
   model.warning='A ficha guardada foi ajustada ao total atual de missões aprovadas.';
 }
 function mount(container,context){
  if(!container||!context)return;
  const catalog=window.PIT_V5_PHASE2;
  if(!catalog?.TALENTS||!catalog?.CLASSES){
   container.innerHTML='<p role="alert">A Forja não carregou o catálogo de talentos. Atualize a página.</p>';return;
  }
  const id=String(context.studentId||'');
  if(!/^[0-9a-f-]{36}$/i.test(id)||!context.authenticated||context.visualPreview){
   container.innerHTML='<div class="rhero-empty">Entre como aluno para acessar seu próprio personagem. Nenhum personagem fictício será carregado.</div>';return;
  }
  const approved=clamp(context.approved,0,10);
  load(context.room||'PITGAME26',id,approved,catalog);
  model.name=String(context.studentName||'Aventureiro').slice(0,56);
  const m=model.draft,pts=approved*2-ATTR.reduce((n,k)=>n+m.attributes[k],0);
  const talentsLeft=approved-m.talents.length;
  const classes=Object.entries(catalog.CLASSES);
  const list=catalog.TALENTS[m.klass]||[];
  const chosen=catalog.CLASSES[m.klass];
  const dirty=JSON.stringify(m)!==JSON.stringify(model.saved?clean(model.saved,approved,catalog):create());
  container.innerHTML='<section class="rhero-root" aria-label="Meu herói real">'+
   '<div class="rhero-head"><div><span>✦ FORJA DO AVENTUREIRO · '+esc(model.room)+'</span><h3>'+esc(model.name)+'</h3>'+
   '<p>Seu personagem usa apenas recompensas das fichas aprovadas pelo professor.</p></div>'+
   '<div class="rhero-rewards"><div><strong>'+(approved*100)+'</strong><small>XP confirmados</small></div>'+
   '<div><strong>'+pts+'</strong><small>Pontos disponíveis</small></div>'+
   '<div><strong>'+talentsLeft+'</strong><small>Talentos disponíveis</small></div></div></div>'+
   '<div class="rhero-layout"><aside class="rhero-visual"><div class="rhero-preview">'+
   '<iframe id="rheroPortrait" title="Personagem 3D '+esc(chosen.name)+'" loading="lazy" src="./v5/hero-portrait-real.html?classe='+encodeURIComponent(m.klass)+'"></iframe>'+
   '<div class="rhero-portrait-fallback">'+ICON[m.klass]+'</div></div>'+
   '<strong>'+esc(chosen.name)+'</strong><small>Modelo KayKit original · 3D</small>'+
   '<p>A personagem e os talentos escolhidos ficam vinculados a esta ficha do aluno.</p></aside>'+
   '<div class="rhero-settings"><h4>1. Escolha sua classe</h4>'+
   '<div class="rhero-classes">'+classes.map(([k,v])=>
    '<button type="button" data-rhero-class="'+k+'" aria-pressed="'+(k===m.klass)+'" class="'+(k===m.klass?'selected':'')+'"><span>'+ICON[k]+'</span><strong>'+esc(v.name)+'</strong></button>').join('')+'</div>'+
   '<h4>2. Distribua os atributos <small>2 por missão aprovada</small></h4>'+
   '<div class="rhero-attrs">'+ATTR.map(a=>'<div class="rhero-attr"><span>'+ATTR_LABEL[a]+'</span>'+
    '<button type="button" data-rhero-minus="'+a+'" '+(m.attributes[a]===0?'disabled':'')+' aria-label="Reduzir '+ATTR_LABEL[a]+'">−</button>'+
    '<strong>'+m.attributes[a]+'</strong>'+
    '<button type="button" data-rhero-plus="'+a+'" '+(pts===0?'disabled':'')+' aria-label="Aumentar '+ATTR_LABEL[a]+'">+</button></div>').join('')+'</div>'+
   '<h4>3. Escolha os talentos <small>'+m.talents.length+' / '+approved+' selecionados</small></h4>'+
   '<div class="rhero-talents" role="group" aria-label="Trinta talentos da classe">'+list.map((t,i)=>'<button type="button" data-rhero-talent="'+esc(t.id)+'" aria-pressed="'+m.talents.includes(t.id)+'" '+(!m.talents.includes(t.id)&&talentsLeft===0?'disabled':'')+' class="'+(m.talents.includes(t.id)?'selected':'')+'">'+
    '<span>'+esc(t.id)+' · '+esc(t.type)+'</span><strong>'+esc(t.name)+'</strong>'+
    '<small>'+esc(t.primary)+' / '+esc(t.secondary)+'</small></button>').join('')+'</div>'+
   '</div></div>'+
   '<div class="rhero-footer"><p><strong>Salvamento local:</strong> a ficha fica neste navegador, separada por aluno e turma. O XP vem do servidor; as escolhas da Forja ainda não sincronizam entre computadores. Guarde seu código para usar outro PC.</p>'+
   '<div class="rhero-actions"><button type="button" id="rheroSave">💾 Salvar personagem neste navegador</button>'+
   '<button type="button" id="rheroExport">📋 Copiar ficha para a próxima aula</button>'+
   '<button type="button" id="rheroImport">↥ Importar ficha</button></div>'+
   '<div role="status" id="rheroMessage">'+esc(model.warning||model.flash||(dirty?'Há alterações ainda não salvas.':'Pronto para configurar seu herói.'))+'</div></div>'+
   '</section>';
  const mutate=(change)=>{change();model.warning='';model.flash='Alterações ainda não salvas.';mount(container,context)};
  for(const btn of container.querySelectorAll('[data-rhero-class]'))btn.onclick=()=>{
   const klass=btn.dataset.rheroClass;if(klass===m.klass)return;
   mutate(()=>{m.klass=klass;m.talents=[];});
  };
  for(const btn of container.querySelectorAll('[data-rhero-plus]'))btn.onclick=()=>{
   const a=btn.dataset.rheroPlus;if(pts<=0)return;mutate(()=>m.attributes[a]++);
  };
  for(const btn of container.querySelectorAll('[data-rhero-minus]'))btn.onclick=()=>{
   const a=btn.dataset.rheroMinus;if(m.attributes[a]===0)return;mutate(()=>m.attributes[a]--);
  };
  for(const btn of container.querySelectorAll('[data-rhero-talent]'))btn.onclick=()=>{
   const id=btn.dataset.rheroTalent;
   mutate(()=>{
    if(m.talents.includes(id))m.talents=m.talents.filter(x=>x!==id);
    else if(m.talents.length<approved)m.talents.push(id);
   });
  };
  container.querySelector('#rheroSave').onclick=()=>{
   try{
    const cleanProfile=clean(model.draft,approved,catalog);
    if(JSON.stringify(cleanProfile)!==JSON.stringify(model.draft))throw Error('Seu personagem excede os pontos aprovados');
    localStorage.setItem(model.key,JSON.stringify(cleanProfile));
    model.saved=structuredClone(cleanProfile);model.flash='✓ Personagem salvo NESTE navegador, para esta turma e este aluno.';
   }catch(e){model.flash='Falha ao salvar: '+e.message}
   mount(container,context);
  };
  container.querySelector('#rheroExport').onclick=async()=>{
   try{
    const code=exportCode(clean(model.draft,approved,catalog));
    await navigator.clipboard.writeText(code);
    model.flash='Código de ficha copiado. Leve para a próxima aula; ele não é uma senha de acesso.';
   }catch(e){model.flash='Não foi possível copiar. Use HTTPS ou as permissões de transferência do navegador.'}
   mount(container,context);
  };
  container.querySelector('#rheroImport').onclick=()=>{
   const code=window.prompt('Cole o código da sua ficha da aula anterior (não o código da turma):');
   if(code==null)return;
   try{model.draft=importCode(code.trim(),approved,catalog);
    model.flash='Ficha importada. Clique em Salvar personagem para manter as escolhas.'}
   catch(e){model.flash=e.message}
   mount(container,context);
  };
 }
 return Object.freeze({ATTR,create,clean,validate,storageKey,importCode,mount});
});

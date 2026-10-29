# HISTÓRICO ARQUIVADO — EXPERIMENTO DE 40 PERSONAGENS CANCELADO

**29/10/2026 — decisão posterior do usuário:** voltar aos quatro personagens originais. O experimento de montagem Quaternius mostrou corpos sobrepostos e T-pose, e foi retirado do código executado. `avatar-catalog.js`, `legendary-wardrobe.js` e respectivos testes foram excluídos da branch, preservados somente no histórico Git. **Não aplicar o plano abaixo.**

A nova origem é o mesmo repositório do arqueiro aprovado: https://github.com/sion-rgb/tactical-slash. Classes: Guerreiro e Guardião = `player_swordsman.glb`, Arcanista = `player_priest.glb`, Caçador = `player_archer.glb`. Todos usam altura 2,55; cada GLB possui sete animações. Os testes 390px/1200px passaram: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40965145406.

---

# V5 — Arsenal gratuito: 40 opções, 10 por classe

Estado: **protótipo isolado**, sem turma real e sem modelos pagos. Data: 29/10/2026.
Branch: `feature/v5-arena-dos-criadores`. Não integrar `main` antes da revisão.

## Decisão do usuário
- Turma padrão: **30 alunos**.
- Disponibilizar **40 avatares selecionáveis**, **10 por classe** (Guerreiro, Arcanista, Caçador, Guardião), com dez reservas excedentes.
- O professor organiza as classes para que todas sejam representadas. Distribuição inicial no laboratório: Guerreiro 8, Arcanista 8, Caçador 7, Guardião 7. **Atribuição docente editável pelo servidor só na Fase H.**
- Dentro da classe atribuída, o aluno escolhe a aparência. Personagem reservado na mesma turma fica indisponível aos demais.
- Nenhuma vantagem de dano/vida por aparência; classe, talentos, atributos e progressão permanecem separadas.
- **Zero compras:** não usar tiers extras, Source kits pagos, modelos do Tripo sem direitos ou assets extraídos de jogos.

## Fontes pesquisadas, gratuitas e licenciadas

### Prioridade A — mais próxima do estilo que o usuário quer
1. **Quaternius — Modular Character Outfits · Fantasy**:
   https://quaternius.com/packs/modularcharacteroutfitsfantasy.html
   https://quaternius.itch.io/modular-character-outfits-fantasy
   - Pack global: 12 roupas, 62 partes modulares e 3 texturas por roupa; malhas humanoides preparadas para rig. **Standard gratuito é apenas uma parte do conjunto (a página estima 60–70% grátis)**; confirmar nomes e peças incluídas no ZIP Standard antes de atribuir 40 combinações de fato. O Standard divulgado é de 280 MB (sem pagar).
   - Licença exibida na página do pack: CC0; formato glTF; sem necessidade de usar versão Source paga. **Candidato principal** para 10 visualizações realmente distintas por classe, após otimização.
2. **Quaternius — Universal Base Characters**:
   https://quaternius.com/packs/universalbasecharacters.html
   - Seis corpos-base humanoides, vinte penteados, esqueleto humanoide, glTF, media ~13 mil triângulos. Kit Standard gratuito parcial, CC0 conforme página. Combinar com roupa/armadura para romper aparência infantil.
3. **Quaternius — Universal Animation Library**:
   https://quaternius.com/packs/universalanimationlibrary.html
   - Mais de 120 animações (esqueleto humanoide compatível; Standard gratuito parcial, pacote CC0 exibido). Retarget necessário; não supor que cada animação já funciona com cada roupa.

### Prioridade B — modelos de classes diferentes, já animados
4. **Quaternius — RPG Character Pack**: https://quaternius.com/packs/rpgcharacters.html
   - Seis personagens de fantasia distintos com rig, animação e textura, CC0; não garante 10 exemplares por classe. Conferir arquivos e converter/normalizar para GLB conforme o formato disponível.
5. **Quaternius — Ultimate Animated Character Pack**: https://quaternius.com/packs/ultimatedanimatedcharacter
   - Cinquenta e dois personagens animados CC0; FBX/OBJ/Blend. Nem todos são fantasia medieval; importar subconjunto relevante, converter FBX a GLB com pipeline documentado. Não afirmar 52 fantasias.
6. **Polygonal Mind — 100 Avatars**: https://github.com/PolygonalMind/100Avatars/releases
   - Muitas malhas humanoides CC0 em FBX/VRM; estilo heterogêneo. Reservar como fonte opcional se as peças medievais gratuitas do Quaternius forem insuficientes.
7. **KayKit Adventurers — Free**: https://kaylousberg.itch.io/kaykit-adventurers
   - Cinco modelos gratuitos + armas e animações; CC0, glTF. **Quatro GLBs base já carregam no V5**. Visual infantil/low-poly e longe do resultado semirrealista desejado; apenas fallback operacional por enquanto.

## Prévia isolada publicada
- https://pit-v5-arsenal-demo.vercel.app/v5/personagens-lab.html
- Projeto Vercel independente `pit-v5-arsenal-demo` (`prj_C3ptPz0cJmEvyfqDxaP53t8eI0hL`). Deployment `dpl_4uMiq3LHdziVwTiT57wwMp5gpy3i` READY, página acessível publicamente.
- Teste automatizado de catálogo `qa/v5-avatar-catalog.cjs` aprovado. Teste de navegador `qa/v5-avatar-gallery-browser.cjs` e teste de catálogo `qa/v5-avatar-catalog.cjs` **aprovados** no workflow https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40958407755 (`catalog` e `interface` em `success`). A prova inclui 40 opções, distribuição de classes, exclusividade, liberação e tela de 390px.
- `v5/arena-three.js` também corrigido para eliminar `Math.min(3,...)` na altura; agora os GLBs são normalizados pela altura física real. Essa correção depende dos testes de arena/visual para homologação.
- O projeto `pit-v5-coliseu-demo` mantém seu próprio domínio e não foi substituído. `main` continua sem merge.

## Trabalho realizado na V5 neste checkpoint
- `v5/avatar-catalog.js`: **40 IDs** exclusivos, dez por classe, nomes, cores, emblemas e aparência. **Não são 40 malhas 3D distintas**; ainda são quatro GLBs reais gratuitos com variações de tonalidade e emblemas. Evitar apresentar como 40 personagens realistas concluídos.
- `v5/personagens-lab.html`, `.css` e `.js`: showroom independente com GLB em 3D, classes atribuídas, cartões e reservas de demonstração.
- `qa/v5-avatar-catalog.cjs`, `qa/v5-avatar-gallery-browser.cjs`: validam 40 opções, atribuição 8/8/7/7, recusa de classe incorreta, recusa de duplicação, liberação e responsividade.
- **Não há locking remoto**: `localStorage` é apenas uma maquete entre abas do mesmo navegador, suscetível a corrida em dispositivos diferentes; a Fase H exigirá autenticação e transação única no banco (`UNIQUE(turma_id, avatar_id)`) com validação do servidor.
- `seletor.html` na branch de testes liga à prévia. A sequência pedagógica e as dez missões permanecem intactas.

## Próximo ciclo visual: trazer 40 modelos/combinações 3D de verdade sem pagar
1. Baixar **somente** o Standard gratuito Quaternius, registrar lista real de roupas/armas/corpos e sua licença com hash dos arquivos.
2. Gerar 10 looks por classe com roupas, cabeça, acessórios e armas reais, salvando GLB leve (<15 mil–25 mil triângulos por personagem para medir performance, não promessa de FPS).
3. Padronizar altura de 2,55–2,60 unidades da origem de cada rig; demonstrar Guerreiro, Arcanista, Caçador e Guardião com mesma estatura aparente.
4. Mapear e verificar `Idle`, `Walk`, `Run`, `Attack`, `Cast`, `Hit`, `Death`; retargetar clipes só quando rig suportar. Talentos específicos continuam dependentes de integração C.2.
5. Limitar custo de download e draw calls por câmera/LOD, mantendo apenas os personagens visíveis e os 30 combatentes reais durante a aula.
6. Fotografar screenshots reais e demonstrar no celular antes de consolidar 40 no projeto. Nenhum arquivo de terceiro não licenciado.

## Fases
Esse trabalho é uma **subfase visual retroativa D** aprovada para seguir na mesma branch, em paralelo ao E, sem pular F câmera, G QA nem H integração servidor. Ativar bloqueio entre alunos verdadeiros **somente** em H, depois que E/F/G forem validados.


## Implementação posterior — 40 personagens 3D modulares concluídos na prévia

**Data:** 29/10/2026. **Branch:** `feature/v5-arena-dos-criadores`. Não fazer merge na `main`.

- `v5/legendary-wardrobe.js`: geração determinística de **40 montagens 3D completas**, dez por classe. Armaduras de torso e pernas, ombreiras de quatro formatos, capacetes/capuzes de cinco formatos, mantos, emblemas, cristais e armas físicas (espadas simples/duplas/pesadas, machados, martelos, lanças, arcos, bestas, escudos, cajados, orbes, livros). Cada combinação tem posição e malha própria; não se limita a recolorir o GLB.
- Fonte das quatro roupas-base: **Quaternius Modular Character Outfits – Fantasy [Standard]**, preservado no repositório público `agentkaerf/FreeModels`, commit `db3df04d1e4714298a09510b26fb6de6645138a2`, diretório `Exports/glTF (Godot-Unreal)/Outfits/`. Roupas reais disponibilizadas na edição grátis: `Male_Ranger.gltf`, `Female_Ranger.gltf`, `Male_Peasant.gltf`, `Female_Peasant.gltf`. Imagens e buffers são carregados junto com os glTFs. Licença das roupas-base: **CC0** conforme autora e README do arquivo de distribuição.
- `v5/personagens-lab.js`: troca do modelo real por variação; geometria e materiais do traje reconstruídos para cada avatar; altura normalizada a 2,6; carregamento glTF sob demanda com cache e fallback KayKit CC0 se o host externo ficar indisponível.
- `v5/arena-three.js`: **modo opcional** `?phase2=1&avatars=1&count=4&avatar=mage-04` mostra o traje selecionado no Coliseu 4 jogadores, sem alterar HP, IA, talentos ou progressão. As 30 peças simultâneas **não foram aprovadas para performance**; não afirmar FPS em celulares ou implantação multiusuário.
- Não são 40 corpos/rigs distintos baixados: são **40 personagens 3D montados com quatro bases de roupa licenciadas e dezenas de peças geométricas de equipamento diferentes**, como autorizado pelo conceito de modelos modulares gratuitos.
- `qa/v5-wardrobe-catalog.cjs` e `qa/v5-wardrobe-browser.cjs`: garantem 40 receitas não idênticas, ao menos 35 objetos reais de equipamentos por avatar e carregamento WebGL no mobile. `qa/v5-avatar-combat-browser.cjs`: regressão do modo arena 4, com prazo maior por conta do download e Shader Software.
- **Homologação do protótipo:** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40960601905 com `catalog` e `interface` em **success**: confirma 40 receitas, exclusividade local, WebGL mobile 390px, quatro bases medievais e **quatro personagens equipados no combate**. A homologação de FPS com 30 visuais simultâneos permanece pendente.
- Resultado anterior confirmado: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40960192884 — catálogo e navegador aprovaram os **40 personagens construídos**. A bateria nova com a integração de arena deve ser conferida na execução de https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions.
- URLs do demonstrador (Vercel READY, domínio público): 
  - Arsenal: https://pit-v5-arsenal-demo.vercel.app/v5/personagens-lab.html
  - Coliseu com modelos opcionais: https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1&avatars=1&count=4&avatar=mage-04
- **Próxima etapa estética:** artes das cartas e otimização de renderização de 30 personagens, animações sincronizadas e VFX artísticos por talento; só sincronizar reservas entre diferentes celulares na Fase H via banco/autoridade única.

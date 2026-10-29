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
- Teste automatizado de catálogo `qa/v5-avatar-catalog.cjs` aprovado. A execução do navegador `qa/v5-avatar-gallery-browser.cjs` foi iniciada no workflow https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40958407755; **não declarar aprovação de navegador antes do job interface concluir**.
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

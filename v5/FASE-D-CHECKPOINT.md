# PIT Game Jam V5 — Fase D, checkpoint Coliseu

Data: 2026-10-29. Branch exclusiva: `feature/v5-arena-dos-criadores`. **Não aprovado; não integrar V3/main.**

## O que foi implementado neste ciclo
- `v5/arena-citadel.js`: versão `eclipse-citadel-3-duel-courts`, 12 cortes decorativas de duelo (8 no modo de menor qualidade), marcação de limites, eclipse artístico e brasas periféricas. Não são colisores.
- `v5/arena-three.js`: arquitetura de palco agora carrega GLBs CC0 da KayKit Dungeon e do Tactical Slash com commit pinado, reutilização dos GLBs, contagem de peças e degradação sem bloquear a geometria original.
- `v5/arena-lab.js`: escala da arena elevada de 4,4 para 5 (máximo suportado no motor atual).
- `qa/v5-coliseum-scale.cjs`: teste do elenco de 30, geometria decorativa e simulação determinística em escala 5, integrado ao workflow `v5-arena-lab-qa.yml`.
- `qa/v5-arena-lab-browser.cjs`: asserções atualizadas para mapa v3, largura >=185 e setores de duelo.
- `v5/ROADMAP-D-A-I.md`: critérios de Fase D/E (espaço, confrontos menos caóticos, tempo de batalha) e F/H (câmera individual e espectador compartilhado).

## Assets pesquisados
1. KayKit Dungeon Remastered: https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0 — CC0, GLBs de arcos, pilares ornamentados, tochas e pedras. Commit: b0ca9bd96a8072ab36a3a5464f00ed1e06a16d07.
2. Tactical Slash: https://github.com/sion-rgb/tactical-slash — documentação de arte em THIRD_PARTY_ASSETS.md e GLBs originais já utilizados no V5. Commit: 8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727.
3. Kenney Castle Kit: https://kenney.nl/assets/castle-kit — CC0; 75 peças, ainda não integrado.
4. Quaternius Medieval Village: https://github.com/Quaternius/quaternius.github.io/blob/main/packs/medievalvillagemegakit.html — CC0 na descrição do pacote; ainda não integrado.

## Atenção: limites e próximos passos
- O campo quadrado mede aproximadamente **190 unidades úteis** segundo `99 × 5 / 2,6`, mas é preciso inspeção de enquadramento desktop/mobile para validar escala percebida.
- **Um campo maior não garante combate 1×1.** A IA de aquisição de alvos, aproximação e convergência da tempestade precisa ser balanceada na Fase E, com medição de duração e frequência de confrontos 2×1/3×1. Os cortes decorativas não fazem pareamento real.
- A carga dos GLBs externos é assíncrona. Verificar `data-v5-environment`, `data-v5-environment-parts`, status da rede e FPS em navegador real. A geometria existente continua como fallback visual.
- Testes estáticos e de simulação são apenas parte da homologação. A execução do browser QA deve ser conferida na aba Actions após cada commit e pode apontar falhas de performance.
- Tentativa de prévia no projeto Vercel `pit-game-jam-preview` retornou `git_info_fail` ao usar Git source da branch; **não considerar o deploy disponível**.
- O próximo desenvolvimento permanece em D: avaliar arte/escala real por screenshot e browser, ajustar recursos, otimizar draw calls e legibilidade; só após aprovação passar à E. Não reescrever as classes, talentos ou missões.
- O objetivo do usuário é Coliseu gótico **maior e visualmente rico**, com espaço e tempo para observar movimentação, cenas legíveis para cerca de 30 alunos e menor chance de ataques simultâneos injustos. Fase F: professor acompanha global, aluno vivo em terceira pessoa, aluno morto vê o mesmo feed de câmera do professor.

## Primeira prévia navegável e verificação
- Ambiente **separado do site principal**: https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1
- Deploy da versão visual em commit `9b6708d86149ba2aa7d9569225aa1a3e09fc5aab`. Deploy Vercel `dpl_6B9B3Lt4evpgpkaCxyoXLtKDLoTc` com estado READY e URL pública confirmada por fetch HTML. Não é merge na main.
- Workflow https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40939963268 passou nas regras e navegador. A interface carregou 30 heróis em desktop (1440 px), 4 em mobile (390 px), arquibancadas e recursos GLB adicionais (`SCENERY STATUS: loaded`). Screenshot WebGL em SwiftShader expirou, **portanto não equivale a inspeção visual humana**.
- Observabilidade acrescentada após a prévia inicial (`v5FrameRate`, `v5DrawCalls`, `v5Triangles`, `v5QualityMode`). Deve ser confirmada por workflow posterior e medição em GPU real.
- **Aguardando validação estética do usuário**, antes de declarar Fase D encerrada.

## Fase D — segunda iteração (feedback visual do usuário, 29/10/2026)
Capturas reais do usuário apontaram: cenário simples demais, câmera alta/afastada, 29 nicks sobrepostos na arquibancada e painel de destaque grande demais na tela do celular. Referências enviadas incluíram Coliseu medieval em 3D, arena com degraus e imagens de ARPG gótico com hexágonos, paredes e efeitos luminosos.

**Implementado na branch, sem main:**
- `arena-three.js`: preset `cinematic()` (câmera mais baixa e próxima) como padrão da arena; `overview()` preservado; ajuste de campo de visão/exposição/fog e limite de nicks sobrepostos de 4/6/9 conforme largura de tela. O nick do jogador focado tem prioridade; mortos continuam representados fisicamente nas arquibancadas.
- `arena-lab.js`, `arena-lab.html`, `arena-lab.css`: corrige uma posição obrigatória antiga da câmera (128,190) que tornava a arena uma miniatura; botão **Cena cinematográfica** ao lado de **Visão geral** e novo HUD compacto no celular.
- `arena-citadel.js`: palco `eclipse-citadel-4-gothic-hex`, piso hexagonal instanciado, arco de vitrais pontiagudos em quatro fachadas, rift luminoso no perímetro, alvenaria mais legível e marcações arcanas contrastadas. Preserva as 12 áreas ilustrativas de duelo e os assentos.
- `qa/v5-coliseum-scale.cjs` e `qa/v5-arena-lab-browser.cjs`: verificam versão do mapa, câmera e orçamento de nomes, sem alterar o resultado de combate.
- Demonstrador atualizado no Vercel (projeto **isolado** `pit-v5-coliseu-demo`, não é `main`): **https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1**. Deploy alvo `dpl_ARmMRynQTh7XyqHAPZCQdGbeDXpV` confirmado READY, a URL principal respondeu publicamente.

**O que NÃO está concluído:** inspeção humana dos materiais e iluminação; medição real de FPS no celular do usuário; ajustes de IA/justiça 1×1 (Fase E); diretor de câmera automático e câmera individual por aluno (Fase F); merge.
**Nota sobre QA:** commits intermediários falharam no browser devido ao teste antigo esperar nome de mapa v3; o teste foi atualizado para v4. Verificar o último workflow antes de declarar homologado.

## Continuidade e evidências
- Workflow: `.github/workflows/v5-arena-lab-qa.yml`.
- Stage: `v5/arena-lab.html?phase2=1` (em ambiente da branch que de fato esteja publicado).
- Acompanhar commits e CI em https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions.
- Não declarar revisão visual, screenshots, FPS nem Vercel pronto sem verificação.

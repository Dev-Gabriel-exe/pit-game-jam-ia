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
**QA atualizado:** workflow da Arena V5 em `e47b15b0644abcc77038b74be42c8559d12b55c8` passou nos jobs `rules` e `browser` (https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40945083194). Carregamento CC0 `loaded`, 30 heróis desktop, 4 heróis mobile, arquibancadas, B.6 120 talentos e C.1/C.2/C.3 aprovados em automação. **Screenshot no SwiftShader falhou por timeout**: aprovação humana da estética e medição FPS continuam pendentes.

## Continuidade e evidências
- Workflow: `.github/workflows/v5-arena-lab-qa.yml`.
- Stage: `v5/arena-lab.html?phase2=1` (em ambiente da branch que de fato esteja publicado).
- Acompanhar commits e CI em https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions.
- Não declarar revisão visual, screenshots, FPS nem Vercel pronto sem verificação.

## Fase D — terceiro incremento: câmera atrás do personagem e habilidades (29/10/2026)
Feedback do usuário: câmera cinematográfica melhorou; "Seguir" ainda ficava na frente do personagem; os talentos pareciam apenas golpes básicos/escudo; caçador venceu repetidamente e Guerreiro/Guardião aparentavam pouca vida. **Pedido explícito:** resolver primeiro câmera 3ª pessoa e comunicação visual dos talentos; deixar equilíbrio de PV/dano para Fase E.

**Implementado:**
- `arena-three.js`: `focusFighter` agora posiciona atrás da direção autoritativa `f.face` do personagem, mantém distância, acompanha giros via interpolação e mantém o jogador em destaque. A câmera livre retorna quando se seleciona a visão geral ou a cinematográfica; após KO há retorno à câmera global da prévia. Não confundir com replicação multiusuário da Fase F/H.
- `arena-three.js`: visualização C.1/C.2 mais legível; efeitos ativos emitidos por eventos reais `talent` com motivos específicos, anel de energia auxiliar, cor da classe, camada adicional no desktop e maior duração (respeitando `prefers-reduced-motion`). Tela mostra nome real da habilidade acima do personagem. VFX são apresentações das 120 habilidades catalogadas, **não 120 animações GLB únicas**. O budget de efeitos permanece 9 no baixo e 18 no normal; descartar os efeitos remove os meshes acessórios.
- `arena-lab.html`, `arena-lab.js`, `arena-lab.css`: botão `Seguir em 3ª pessoa`, telemetria de **último talento realmente ativado**, contador, reset correto, prioridade maior de leitura das habilidades.
- `qa/v5-arena-lab-browser.cjs`, `qa/v5-talent-vfx-browser.cjs`, `qa/v5-coliseum-scale.cjs`: cobertura de câmera atrás, UI de talento real, reset e persistência da lógica. Não alterar o motor de classes/HP antes da Fase E.
- **Prévia isolada atualizada:** https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1 ; deployment `dpl_GCh7KUfC9qvgPyNm6EpzKRdsexKi`, com estado READY. HTML com painel `✦ TALENTOS ATIVADOS` confirmado via fetch.

**Para avaliar manualmente:** abrir M5 `phase2=1`, clicar `4 HERÓIS` para reduzir poluição, `Iniciar confronto`, selecionar o personagem em `Os Combatentes` ou `Seguir em 3ª pessoa` no destaque, ativar `Velocidade ×0,5`. Os golpes especiais aparecem por eventos verdadeiros no painel de talentos. Repetir 30 jogadores para checar performance e volume.
**Ainda pendente:** aprovação visual humana e FPS em celular; a Fase E analisará PV do Guerreiro/Guardião, dominância do Caçador, alvo/timing do combate e a IA em cenários com 30 pessoas.
**CI:** verificar o último run `V5 Arena Lab` do commit `d503f3bc3d2eb27368d63df9f4d5f68abacadb0f` antes de chamar o incremento de homologado. O GitHub Actions estava enfileirado no momento deste checkpoint.

### Patch adicional da terceira iteração
- O VFX reforçado agora prioriza um talento **ativo** sobre um decalque passivo quando o orçamento de efeitos fica cheio em arena com 30 pessoas; não muda a ordem do combate nem o dano (`v5/arena-three.js`, commit `cfb1d10e`).
- Uma asserção de QA incluída incorretamente que acessava `window` no processo Node da automação foi removida em `qa/v5-talent-vfx-browser.cjs` (commit `dca0855b`). O teste deve ser validado no GitHub Actions após o conserto; falhas intermediárias não devem ser tratadas como falhas do jogo.
- Link estável do demonstrador isolado, atualizado com o efeito ativo prioritário: https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1
- Deploy da última versão de código da arena `cfb1d10eda35542aafa16c28959c790c1c9aba02`: Vercel `dpl_3wVvYrbFwfBieqf1VFTWg4hrRAwG`, READY e alias `pit-v5-coliseu-demo.vercel.app`.
- A configuração atual B.6 de HP é Guerreiro 137, Guardião 140, Caçador 93 e Arcanista 78, **antes** de alocação individual de VIT/DEF. A maior vida base já existe, mas não assegura sobrevivência equilibrada ante ataque à distância; analisar medindo win rates e tempo até primeira eliminação na Fase E.

### Prévia V5 de habilidades e terceira pessoa — build de apresentação
- Última revisão de animações de habilidade: commit `a56871672dc897ced44653a0e7c175b61d0ad52c`, com pose de ator mais pronunciada e brilho sincronizado com eventos C.2 reais. Mudança somente de renderização, sem mudar física/dano/cooldowns.
- Deploy isolado estável: `dpl_8P72npQWgVG9fk8KXQBnDUjmFoWB`, Vercel `READY`, alias público `https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1`. Não é a `main`.
- Regressões: `PIT Game Jam QA` estático aprovou a build. Os testes longos com Playwright/Chromium foram iniciados para a última revisão; não classificar como concluídos antes dos resultados dos jobs `V5 Arena Lab`.

## Laboratório de ritmo — redução reversível de dano (29/10/2026)
Feedback do usuário: Arcanista parece muito fraco; os confrontos terminam rápido demais; testar reduzir o dano de todos para dar tempo de visualizar talentos, movimento e defesa. **Decisão:** experimento controlado em D (transição para balanceamento E), não alterar classes oficiais ou jogo principal.

- Ambos os motores (`v5/phase2-combat.js` M5 com 120 talentos; `v5/hero-core.js` legado M10) receberam parâmetros opcionais `damageScale` e `mageDamageBonus`, com valores neutros `1` para *todas as chamadas antigas*.
- Três presets selecionáveis pelo professor na arena de testes, com reinicialização usando a **mesma seed** para comparação honesta: `Dano 100% · original`, `Dano 75% · prolongado`, `Dano 60% · épico` **padrão depois da avaliação multi-seed**. Os multiplicadores são aplicados após mitigação, antes dos escudos. O dano da tempestade é mantido (cuidado: não é a mesma escala).
- Os modos 75% e 60% incluem **hipótese experimental** de 10% de compensação ofensiva somente para o Arcanista; neste modo o dano ofensivo total dele equivale respectivamente a 82,5% e 66% da referência (ainda inferior ao original). Não afirmar que isto corrige classe fraca sem distribuição de vencedores, duração e duração até eliminação. Reverter ou alterar após análise na Fase E.
- Duração máxima interna da simulação: 95s (100%), 110s (75%), 125s (60%). Isso não altera XP, unlocks, frontend da oficina, HP base, velocidade de animação ou outras fontes de dados.
- `qa/v5-arena-pacing.cjs`: regressão determinística e comparação de dano nos dois motores, além de relatório estatístico multi-seed 4/30 personagens. **Importante:** escudos temporários no legado podem gerar uma relação *não linear* do dano efetivo no primeiro HP hit; isso é comportamento legítimo do motor, não motivo para esconder defeito.
- `qa/v5-arena-lab-browser.cjs` verifica o preset padrão e `qa/v5-phase2-browser.cjs` verifica mudança reversível dos três presets.
- Nova prévia pública isolada: https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1 ; deploy `dpl_FfAKDy1uWsFnXRRGQQiCztxk4w7h`, READY. `main` inalterada.
- **Próximo:** analisar CI completo (rules + browser) e relatório multi-seed; pedir avaliação do usuário com 4 e 30 personagens. Só declarar resultado de balanceamento depois de análise da distribuição entre classes; nenhuma alteração obrigatória no roadmap de integração.

### Verificação empírica e ajuste do padrão (29/10/2026)
- Um teste original reduzia apenas o dano e não conseguia aumentar a duração média do grupo de 30; a tempestade permanecia fechando a partir de 18s e ainda produzia eliminacões prematuras.
- Os modos experimentais agora também atrasam a tempestade sem alterar seu dano por segundo: 100%/18s/fator 1; 75%/28s/fator 0,70; 60%/34s/fator 0,60. `battleLimit` 95/110/125 respectivamente. Defaults neutros `stormDelay=18` e `stormRateFactor=1` preservam o motor original.
- Comparação com **12 sementes de quatro heróis**: duração média original `15,7s`; 75% `18,1s`; 60% `20,7s`. Vitórias no modo 60%: Caçador 11, Arcanista 1, Guerreiro 0, Guardião 0 (os tanques continuam problemáticos).
- Comparação com **6 sementes de 30 heróis**: duração média original `48,6s`, 75% `46,8s`, 60% `52,6s`; talentos ativados por combate original `112,3`, 75% `131,5`, 60% `151,2`. Vitórias no modo 60%: Caçador 3, Arcanista 3, Guerreiro 0, Guardião 0.
- Os intervalos são amostras pequenas e não certificam equilíbrio. **O 60% foi escolhido como padrão de laboratório** por ampliar a observação dos talentos e a duração nos dois formatos. 100% e 75% continuam disponíveis.
- O comparador preserva a mesma semente e os mesmos builds ao trocar o botão de dano; somente o botão `Reiniciar` ou outras alterações de elenco geram uma nova semente.
- CI (regras e amostra): https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40951720755 concluiu `rules` com sucesso nos dados acima. Não confundir isso com teste de navegador concluído.
- A câmera, animações, elencos e `main` permanecem inalterados pelo experimento. Próxima Fase E: investigar especificamente o baixo índice de vitórias do Guerreiro e Guardião, dano contínuo do Caçador, frequência de ataques e resistência real do Arcanista.

# Fase VFX — Talentos cinematográficos da PIT Game Jam IA V5

**Data:** 31/10/2026. **Escopo:** estética e animação, sem alterar dano, física, cooldowns, XP, progressão ou o catálogo de 120 talentos.

## Melhorias implementadas

1. `v5/talent-motion-cinematic.js`: planejamento **determinístico** em três fases — preparação, execução e dissipação. Flechas, fogo, gelo, bolt e dash seguem uma trajetória com altura característica **somente quando o evento real do motor traz alvo**. Cura, runas, proteção, armadilhas e auras permanecem ancoradas no personagem/solo. Nenhuma habilidade fictícia é disparada para compor cenas.
2. `v5/talent-sprites.js`: 13 famílias gráficas originais com **8 quadros** na qualidade normal, reforço de silhuetas de lâmina/fogo/gelo/flecha e glints determinísticos. Modo reduzido usa **2 quadros**, qualidade baixa usa **3 quadros**.
3. `v5/arena-three.js`: interpola posição/altura/escala/transparência/rotação dos efeitos em WebGL. Efeitos principais dispõem de brilho secundário quando a GPU permite; a qualidade baixa, os efeitos passivos discretos e a preferência de movimento reduzido suprimem a segunda camada. O brilho acompanha o projétil sem afetar colisão ou alcance; todas as instâncias e materiais são descartados no reset/encerramento.
4. `v5/arena-lab.js`: sprites de habilidades **ligados por padrão** no motor experimental Phase2 das arenas. `?sprites=0` desliga os efeitos aprimorados para diagnóstico/performance.
5. `v5/duel-3d-lab.js` e `v5/teacher-arena-lab.js`: efeitos animados habilitados nas arenas experimentais **M5 e M10**. Todos os três HTML de palco carregam o módulo cinematográfico.

**Os 120 talentos continuam tendo 120 descritores/assinaturas distintas, mas isso NÃO significa 120 clips 3D desenhados manualmente.** O sistema reaproveita 13 famílias de sprites com parâmetros individuais de classe, cor, variante, direção, intensidade, duração e trajetória; as animações nativas disponíveis dos quatro GLBs KayKit continuam sendo utilizadas.

## Como verificar (GitHub Pages)

- `/v5/arena-lab.html?phase2=1&count=4&sprites=1`: rodada rápida M5 com FX cinematográfico;
- `/v5/arena-lab.html?m10preview=1&count=4&sprites=1`: rodada M10 (opt-in experimental) com dez talentos;
- `/v5/arena-lab.html?phase2=1&count=30&sprites=1`: teste de estresse com até 30 combatentes;
- `/v5/arena-lab.html?phase2=1&count=4&sprites=0`: comparação sem atlas para medir o impacto gráfico;
- `/v5/duel-window-lab.html`: convite e duelo 1×1 com FX atualizado;
- `/v5/teacher-arena-lab.html`: controle docente **fictício** dos torneios M5/M10.

## Evidências de testes

- `qa/v5-talent-cinematic.cjs`: 120 talentos, famílias de movimento, começo/meio/fim e movimento reduzido, 32 descritores capazes de mirar e **45 eventos de talento direcionado registrados em 105 ativações reais** do motor, somados em quatro seeds determinísticas.
- `qa/v5-talent-cinematic-browser.cjs`: Chromium WebGL com quatro personagens KayKit reais, eventos de habilidades, animação em oito quadros, efeitos secundários limitados e descarte no reset — **M5 e M10**.
- `qa/v5-talent-sprites-browser.cjs`: prova pixels reais/diferença entre quadros, M5 com **30 modelos**, limites de FX e limpeza de texturas/meshes.
- `qa/v5-talent-vfx-browser.cjs`: verifica que FX e HUD só aparecem após habilidades reais, não antes da batalha.
- `qa/v5-progressao-completa-10-missoes.cjs`: recompensas unchanged (100 XP-base, +2 pontos e +1 talento por aprovação, não concedidos pela arena).
- **Workflow:** `.github/workflows/v5-talentos-cinematograficos-qa.yml`.

## Limites e próximos testes visuais

O resultado visual das animações ainda deve ser avaliado em um PC real, especialmente em 30v30, com camera isométrica e automática. A CI WebGL/SwiftShader demonstra funcionamento e limites de objetos, **não o FPS nos computadores da escola**. Caso um talento específico esteja pouco legível, sua família de sprite e a coreografia podem ser refinadas sem mexer no motor de combate. Recomenda-se confirmar contraste, velocidade de leitura, zoom e posicionamento em M5 e M10.

**Sem integração de alunos reais, sem alterar o estado de sala, notas, XP ou dados persistentes.**

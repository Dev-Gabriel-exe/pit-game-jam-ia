# PIT Game Jam IA V5 · Fase 1 — comparação verificável

**Escopo deste commit:** somente curadoria de quatro classes e um visualizador independente. Não altera `main`, XP, API, banco, notas ou o conteúdo das dez missões. A página é `v5/seletor.html`, sem login e sem persistência de dados.

## Arquitetura inspecionada

- `main` utiliza arquivos HTML/CSS/JS estáticos, com experiência V3 em `v3/`, `aluno-v3.html`, `professor-v3.html` e GitHub Pages.
- Autenticação da sala, nome do aluno e progresso estão em `chat-api/api/classroom.js`, com token e banco PostgreSQL. O navegador não é fonte confiável de XP.
- Já existiam `feature/pit-gamejam-v5-arena`, `feature/pit-gamejam-v5-arena-rpg` e `feature/pit-gamejam-v5-classes-3d-real`. Esta branch foi criada a partir da última e **não publica nem integra nada na main**.
- `v5/character-assets.js` já centraliza modelos GLB CC0 com URLs fixadas em commits. O laboratório usa essa mesma lista e seleciona somente quatro classes: `warrior`, `mage`, `hunter` e `guardian`.
- A V5 herdada contém funcionalidades posteriores experimentais; esta fase **não as ativa nem as declara homologadas**.

## Classes provisórias selecionadas para avaliação visual

| Classe pública | Modelo real | Licença | Formato | Animações | Integração |
| --- | --- | --- | --- | --- | --- |
| **Guerreiro** | KayKit Adventurers `Barbarian.glb` · 3,61 MB | CC0-1.0 | GLB com rig | O pacote oferece animações de combate, locomoção e outras; nomes/quantidade por arquivo são apurados pelo visualizador | `GLTFLoader`, `AnimationMixer` |
| **Arcanista** | KayKit Adventurers `Mage.glb` · 3,59 MB | CC0-1.0 | GLB com rig | Mesmo conjunto publicado do pacote; clipes reais são detectados na execução | `GLTFLoader`, `AnimationMixer` |
| **Caçador** | `tactical-slash/assets/characters/player/player_archer.glb` · 0,70 MB (derivado KayKit + arco CC0) | CC0-1.0 (origem registrada) | GLB com rig | Projeto de origem documenta retenção de sete ações (idle, walking, melee, ranged, spellcast, hit, death); validar por arquivo | `GLTFLoader`, `AnimationMixer` |
| **Guardião** | KayKit Adventurers `Knight.glb` · 3,66 MB | CC0-1.0 | GLB com rig | Mesmo conjunto publicado do pacote; clipes reais são detectados na execução | `GLTFLoader`, `AnimationMixer` |

Fontes primárias e licença:
- KayKit Adventurers, versão fixada `672074b73ba276876a19e8816ecdc5241817ab47`: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 ; licença: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/blob/main/LICENSE.txt ; página do criador: https://kaylousberg.itch.io/kaykit-adventurers
- Arqueiro derivado, commit fixado `8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727`: https://github.com/sion-rgb/tactical-slash ; cadeia de licenças detalhada: https://github.com/sion-rgb/tactical-slash/blob/main/THIRD_PARTY_ASSETS.md
- URLs individuais são construídas em `v5/character-assets.js`, usando commits fixos e arquivos cuja existência/tamanho foi inspecionada na árvore GitHub.

**Nota:** confirmação do formato e existência na árvore GitHub **não prova** que a animação será reproduzida corretamente em todos os navegadores. O laboratório exibe o total real de clipes da cena retornada pelo loader. Testes de browser são a segunda validação.

## Alternativas pesquisadas antes da aprovação final

| Origem | Licença e formatos | Avaliação |
| --- | --- | --- |
| **Quaternius — RPG Character Pack** https://quaternius.com/packs/rpgcharacters.html | CC0, FBX/OBJ/Blend/glTF informados; seis personagens rigados e animados | Candidato visual alternativo. Sem inventário comprovado de `Idle/Attack/Hit/Death` por arquivo nesta pesquisa. Requer checagem de conversão/exportação para GLB. |
| **OpenGameArt — LowPoly Animated Knight** https://opengameart.org/content/lowpoly-animated-knight | CC0; ZIP com .blend, .fbx, .obj; autor lista idle, walk, run, roll e death entre outras | Bom Guardião alternativo, mas exige conversão para GLB e padronização do rig para a arena. |
| **Kenney — Mini Arena** https://kenney.nl/assets/mini-arena | CC0; 3D com animação, formato por modelo precisa inspeção no download | Útil cenário ou personagens de arena, mas não foi verificado um quarteto com visual de arcanista, caçador, guerreiro e guardião. |
| **Kenney — Animated Characters Protagonists** https://kenney.nl/assets/animated-characters-protagonists | CC0, oito arquivos | Estilo/tema não corresponde às quatro classes de fantasia sombria; descartado na seleção principal. |
| **itch.io — KayKit Adventurers** https://kaylousberg.itch.io/kaykit-adventurers | CC0; Free 2.0, GLTF/FBX | Fonte original dos modelos prioritários; o **Druida** consta na edição paga EXTRA, portanto não entra como opção gratuita verificada. |
| **itch.io — Dungeon Starter** https://1camou.itch.io/dungeon-starter-blockimagine | CC0 declarada, GLB/Blockbench, 25 modelos animados segundo autor | Silhuetas temáticas, porém estética fortemente blocky; não atende qualidade visual almejada. |
| **GitHub — KayKit Skeletons** https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0 | CC0; GLB; rig e 90+ animações no pacote | Bom para inimigos e necromante futuro, mas necromante **não substitui automaticamente o Druida** pedido. |

## Decisão de engenharia nesta fase

**Quatro classes como piloto, não como seleção artística definitiva.** Todas têm armas/funções distinguíveis. O Ladino permanece um candidato forte (há `Rogue_Hooded.glb` CC0 no repositório). O Druida precisa de modelo **gratuito** com licença comprovada e animações adequadas; a versão EXTRA paga não será usada.

Three.js é importado por import map na mesma versão que já existia na V5 (`0.186.1`). A página implementa `GLTFLoader`, `SkeletonUtils.clone`, `AnimationMixer`, controles de órbita e zoom, câmera com luzes e sombras, quatro cartões, animações extraídas por nome, feedback de carregamento, WebGL e limitação de movimento. Se um GLB falhar, aparece erro: **não substituímos o herói por um corpo de cubos ou cilindros**.

## Limitações que impedem homologação automática

1. Os GLBs são carregados de `raw.githubusercontent.com`. Laboratórios com internet restrita precisam baixar e servir os modelos localmente, preservando a licença.
2. Quatro modelos em carga sequencial representam aproximadamente 11,6 MB, sem considerar o JavaScript de Three.js e outros recursos. No celular, deve-se medir memória, FPS e tempo real.
3. KayKit é estilizado low-poly, **não realista/fotorrealista** como Diablo IV; a proximidade visual vem do palco, atmosfera, iluminação e efeitos. Avaliar isso com o professor antes de avançar.
4. Cor, armadura, armas e capa do piloto ainda não são personalizáveis. Esta fase não grava personagem nem nome; isso pertence à Fase 2.
5. Os nomes reais dos clipes e sua qualidade de transição precisam de testes no navegador; o visualizador desabilita controles quando não encontra clipes.
6. A integração com o caderno e o sistema de XP existente será tratada depois, sem duplicar XP e sem migração de banco nesta etapa.

## Testar

```bash
python3 -m http.server 8899
# http://localhost:8899/v5/seletor.html
node qa/v5-fase1.cjs
# npm install --no-save playwright@1.58.2
# npx playwright install chromium
node qa/v5-fase1-browser.cjs
```

Também existe GitHub Actions `.github/workflows/v5-fase1-qa.yml` na branch V5, para validação de scripts e teste visual automático. O estado da `main` permanece intacto e o rollback é simplesmente continuar usando a `main` sem divulgar a URL V5.

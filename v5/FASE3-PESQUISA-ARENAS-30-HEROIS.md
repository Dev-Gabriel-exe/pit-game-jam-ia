# Fase 3 · Arenas CC0, 30 alunos e lacuna dos talentos

Pesquisa verificada em 29/10/2026. Status: levantamento técnico, não são integrações finalizadas. Branch experimental; a main permanece protegida.

## Repositórios e pacotes

| Fonte | Licença/uso | Aplicação | Limitação |
|---|---|---|---|
| [KayKit Dungeon Remastered](https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0) | CC0 no LICENSE.txt | 200+ peças de dungeon modular: paredes, pisos, pilares, portas, cenários | Kit de peças; não arena completa |
| [KayKit Dungeon Pack 1.1](https://kaylousberg.itch.io/kaykit-dungeon-pack) | CC0 segundo autor | Versão 1.1 com GLTF/FBX, 200+ peças | Download e montagem necessários |
| [Kenney Castle Kit](https://kenney.nl/assets/castle-kit) | CC0 oficial | 75 modelos medievais para muralhas e portões | Kit de peças |
| [Kenney Mini Arena](https://kenney.nl/assets/mini-arena) | CC0 oficial | 20 arquivos de arena para referência | Mini escala; insuficiente isoladamente para 30 |
| [Tactical Slash](https://github.com/sion-rgb/tactical-slash) | MIT para código original, CC0 para arte documentada no THIRD_PARTY_ASSETS.md | RPG real em Godot e assets dungeon_wall.glb, dungeon_pillar.glb, dungeon_crate.glb | Cenas Godot não executam diretamente no Three.js; GLBs reutilizáveis |
| [WoW Arena Sandbox](https://github.com/kmangutov/threejs-arena) | licença não confirmada (nenhum LICENSE na raiz) | Referência de UX Three.js para efeitos, câmera e combate | NÃO reutilizar código/arte sem licença |
| [KayKit Character Animations](https://kaylousberg.itch.io/kaykit-character-animations) | CC0 oficial | 161 movimentos de melee, bloqueio, esquiva e conjuração | Clipes-base, não 120 talentos animados prontos |

## Decisão proposta

Preservar os 4 heróis já aprovados. Compor a arena medieval a partir de peças GLB CC0, ao invés de depender exclusivamente de chão, blocos e colunas geométricas. Arena circular de raio lógico na faixa de 45 a 55 unidades, escala ajustada após testes. Apoiar 30 personagens, posições em anéis, câmera panorâmica e zoom/foco em combate, HUD com LOD e seleção por personagem.

Para eficiência: cache de 4 GLBs, cópias com esqueletos individuais, geometria instanciada para pisos e peças repetidas, sombras limitadas, partículas limitadas, controle de FPS e testes desktop/mobile. Se for visualmente ilegível um free-for-all de 30, avaliar 3 chaves de 10 com final, apenas mediante aprovação do formato.

## Atenção: talentos NÃO implementados

O protótipo anterior usa v5/hero-core.js com 4 atributos antigos e 6 talentos por classe, distribuídos por ranks. Os bots da arena demo entravam sem talentos selecionados. Só executavam ataques básicos e especiais genéricos. Os 120 novos talentos são **planejamento**, não execução em jogo.

Arquitetura da fase posterior: eventos de talento com fonte, gatilho, tipo de efeito, alvo, atributo principal e secundário, recarga, ID de animação e VFX, execução determinística no motor e logging real por talento. Implementar todos em dados estruturados e testes e sincronizar movimentos 3D. Cada build tem até 5 habilidades no teste da missão 5 e até 10 na final da missão 10, com realocação livre depois do teste e bloqueio apenas na primeira entrada final.

Nenhum conteúdo deste documento altera cadastro, XP pedagógico, notas, V3 ou main.

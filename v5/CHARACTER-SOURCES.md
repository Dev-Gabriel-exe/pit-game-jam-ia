# V5 · Personagens reais e classes (CC0)

## Seleção de classes

A V5 agora usa **seis classes**, cada uma ligada a um GLB real de um repositório aberto. Os modelos **não são a geometria procedural** criada pelo Three.js. O visualizador usa `GLTFLoader` e `SkeletonUtils.clone`, mantém as animações do arquivo e faz cache por classe.

| ID estável | Classe para o aluno | GLB escolhido | Tamanho aproximado | Especial |
| --- | --- | --- | --- | --- |
| `guardian` | Guardião | `Knight.glb` | 3,66 MB | Fortaleza |
| `warrior` | Bárbaro | `Barbarian.glb` | 3,61 MB | Golpe sísmico |
| `mage` | Arcanista | `Mage.glb` | 3,59 MB | Explosão arcana |
| `rogue` | Ladino | `Rogue_Hooded.glb` | 3,60 MB | Emboscada |
| `hunter` | Patrulheiro | `player_archer.glb` | 0,70 MB | Flecha múltipla |
| `necromancer` | Necromante | `Skeleton_Mage.glb` | 4,76 MB | Chamado das Sombras |

Os IDs das quatro classes existentes são preservados. **`warrior` passa a aparecer como “Bárbaro” e `hunter` como “Patrulheiro”, sem perder builds antigas.** As duas classes novas recebem seis talentos cada e regras de combate próprias.

## Fontes e licenças

1. **KayKit / Adventurers** — autor Kay Lousberg, [repositório e modelos GLB](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0), commit fixado `672074b73ba276876a19e8816ecdc5241817ab47`. Licença: [CC0-1.0](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/blob/main/LICENSE.txt). Inclui cavaleiro, bárbaro, mago e ladino encapuzado; modelos rigados e animações.
2. **KayKit / Skeletons** — Kay Lousberg, [repositório](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0), commit `15b62b9bad122f72926c10fb14d622c73819fa54`. Licença [CC0-1.0](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0/blob/main/LICENSE.txt). Modelo `Skeleton_Mage.glb`.
3. **tactical-slash** — [repositório](https://github.com/sion-rgb/tactical-slash), commit `8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727`. Modelo derivado `assets/characters/player/player_archer.glb`. **Proveniência documentada:** [THIRD_PARTY_ASSETS.md](https://github.com/sion-rgb/tactical-slash/blob/main/THIRD_PARTY_ASSETS.md). Origem KayKit Adventurers e Fantasy Weapons Bits versão gratuita, ambos CC0; adaptado com arco e animações.

A URL de cada modelo é fixada por commit em `v5/character-assets.js`, impedindo que um novo commit no upstream altere os personagens silenciosamente. Os GLBs são baixados do GitHub sob demanda, somente ao selecionar a classe ou exibir participantes na arena.

## Desempenho e integridade

- Um `GLTFLoader` por página, com cache por classe e clonagem de ossos para animações independentes.
- Apenas um GLB é baixado por classe (não uma cópia para cada aluno da mesma classe).
- Materiais clonados para cores individuais; geometrias/texturas compartilhadas não são descartadas até a página ser fechada.
- Quando CDN, navegador ou WebGL falham, o personagem procedural original permanece visível e a build continua editável.
- A mudança de classe não altera nome nem XP. Ambos continuam vindo da API autenticada do aluno. Avaliação por colega não deve ser aceita pelo navegador como XP confiável.
- **Aparência:** cores do anel e um leve tingimento são aplicados ao GLB. Elmo, capa e arma são parâmetros do personagem procedural; acessórios alternativos sobre o esqueleto GLB exigem adaptações futuras. Não afirmar que a roupa inteira já é editável.
- Fisicamente os corpos usam a simulação 2D no plano XZ da arena; modelos 3D e animações são visuais, não simulação ragdoll.

## Estado

Desenvolvimento apenas na branch `feature/pit-gamejam-v5-classes-3d-real` derivada de `feature/pit-gamejam-v5-arena-rpg`. **Não integrado à main**, não aplicado migração Neon e não exposto aos alunos reais. Verificar em `/v5/index.html?preview=1` no ambiente de testes.

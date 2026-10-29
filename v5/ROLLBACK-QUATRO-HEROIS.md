# V5 — quatro personagens da mesma família visual (decisão aprovada em 29/10/2026)

## Por que voltamos
O usuário mostrou uma captura com malha base em **T-pose, armaduras sobrepostas e uma arma desconectada**. Pediu abandonar 40 montagens 3D e manter **quatro classes com um GLB padrão cada**, equivalentes na altura, diferenciadas por atributos e talentos.

## Origem verificada
O Arqueiro que o usuário aprovou veio de `sion-rgb/tactical-slash`, arquivo
`assets/characters/player/player_archer.glb`, commit `8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727`.

- https://github.com/sion-rgb/tactical-slash
- https://github.com/sion-rgb/tactical-slash/blob/8bf8d835cb7afa7cb3f4d893b0966c6b4e9b7727/THIRD_PARTY_ASSETS.md

O projeto tem **três** personagens humanos jogáveis, todos KayKit CC0, preparados com as mesmas sete categorias de animações e normalizados à altura de origem **1,85m**. Não inventar um quarto GLB que não existe nesse repositório.

| Classe Game Jam | GLB | Motivo |
|---|---|---|
| Guerreiro | `player_swordsman.glb` | Espadachim jogável |
| Arcanista | `player_priest.glb` | Sacerdote jogável que possui habilidades mágicas |
| Caçador | `player_archer.glb` | O Arqueiro original já aprovado |
| Guardião | `player_swordsman.glb` | Reutiliza Espadachim; função de defesa determinada pelos atributos/talentos |

**Nenhum personagem ganha vantagem por GLB.** O motor de combate continua sendo `hero-core.js` (M10) e `phase2-combat.js` (M5); a aparência não altera alcance, velocidade, dano, HP, cooldown ou colisão. Usuários da mesma classe compartilham o mesmo arquivo.

## Código alterado
- `v5/character-assets.js` aponta SOMENTE para os três GLBs originais do Tactical Slash (4 mapeamentos).
- `v5/arena-three.js` normaliza cada GLB para **2,55 unidades** com `2.55 / height`; removido sistema opcional de montagem 40 rigs; cache indexado por URL para compartilhar o Espadachim entre classes e reduzir download.
- `v5/personagens-lab.html/.js/.css`: quatro botões de classe, visor WebGL com animação Idle original, sem sobrepor roupas, peças falsas, armas ou reservas de avatares.
- `v5/arena-lab.html` e `v5/seletor.html`: remover publicidade e imports de 40 personagens; reestabelecer referências às quatro classes.
- Eliminados da branch `v5/avatar-catalog.js`, `v5/legendary-wardrobe.js`, `qa/v5-avatar-*.cjs` e `qa/v5-wardrobe-*.cjs`. O Git mantém o histórico caso alguém precise revisar, mas **NÃO REATIVAR**.
- `v5/PERSONAGENS-GRATUITOS-40-PLANO.md` possui aviso de plano cancelado.

## Verificação automatizada
O workflow novo `.github/workflows/v5-avatar-qa.yml` valida as quatro origens, a altura do visualizador, animações, ausência de 40 variantes e renderização em 390px e 1200px.
- **PASS** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40965145406
- Browser de 390px/1200px carregou os 4 mapeamentos sem erro, com altura 2,55 e **sete clipes por GLB**.
- CI de arena completo é independente; inclui M5, M10, efeitos e personagens na arquibancada. Checar conclusão mais recente antes de chamar o conjunto todo de homologado.

## Prévias publicadas em projetos Vercel isolados
- Quatro personagens: https://pit-v5-arsenal-demo.vercel.app/v5/personagens-lab.html
- Coliseu: https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1&count=4

Os domínios foram publicados nos **projetos de demonstração**, não na app principal da oficina. **Branch `feature/v5-arena-dos-criadores` somente; `main` não alterada.**

## Próximas fases
Manter a simplicidade dos personagens. Melhorar os **talentos e efeitos artísticos** sem reintroduzir equipamentos sobrepostos; concluir balanceamento E, automatização da câmera de professor F, QA mobile com 30 G, integração dos alunos H, merge só aprovado em I.

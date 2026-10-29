# V5 — quatro personagens diferentes, animados, do mesmo KayKit Adventurers

**Estado:** aplicado à branch `feature/v5-arena-dos-criadores`; **NÃO** publicar nem alterar a `main` sem autorização explícita do usuário.

## Decisão do usuário
Após rejeitar a montagem de 40 avatares e a solução que repetia o mesmo Espadachim em Guerreiro/Guardião, o usuário exigiu **quatro modelos de personagens realmente distintos**, com animações próprias, coerentes com o estilo do arqueiro e sem preços, montagem de malhas ou acessórios improvisados.

**Escolha aprovada:** KayKit Adventurers 1.0, pacote oficial gratuito, licença CC0, com GLBs completos e animações incorporadas.

## Fonte — commit imutável
- https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0
- commit `672074b73ba276876a19e8816ecdc5241817ab47`
- arquivos em `addons/kaykit_character_pack_adventures/Characters/gltf/`
- licença `LICENSE.txt` é CC0 1.0 e explicitamente permite uso pessoal, educacional e comercial sem comprar.

| Classe Game Jam | GLB oficial | Tamanho baixado aproximado |
|---|---|---|
| Guerreiro | `Barbarian.glb` | 3,61 MB |
| Arcanista | `Mage.glb` | 3,59 MB |
| Caçador | `Rogue_Hooded.glb` | 3,60 MB |
| Guardião | `Knight.glb` | 3,66 MB |

Quatro GLBs diferentes (não 3 GLBs para 4 classes). A aparência do Ladino Encapuzado é usada para a classe Caçador; sua jogabilidade de alcance vem do motor, não de novos equipamentos visuais. Sem modelos montados ou arma artificial.

## Alterações técnicas reais
- `v5/character-assets.js`: 4 URLs oficiais de origem única, pinadas por commit.
- `v5/personagens-lab.js`, `v5/personagens-lab.html`: 4 classes, 4 modelos animados, equivalência de tamanho `2.55 / alturaOriginal` e Orbital Controls.
- `v5/arena-three.js`: carga dos modelos originais, câmera e motor preservados, multiplicador visual 2,55, animações incorporadas com limite de ações instanciadas por herói (grupo de locomação, combate, magia, reação, defesa e queda) para reduzir custo de até 30 jogadores.
- `qa/v5-four-classes.cjs` e `qa/v5-four-classes-browser.cjs`: origem, 4 URLs diferentes, altura, presença de clipes e funcionamento em 390/1200px.
- No commit `47e5785ebf8f34d6bfba84f0baa90166c61565fe`, CI passou; browser registrou **76 animações por cada um dos quatro GLBs**, altura 2,55 (ambos 390 e 1200px): https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40969610400.
- A aplicação com otimização de ações de animação em 30 personagens está no commit `88c2dd6bd5469fd869dbf6681074632a15aa67d1`.
- **PASS completo no GitHub Actions:** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40969675495 — jobs `rules` e `browser` em SUCCESS. Navegador de 1440px validou 30 personagens GLB reais, cenas carregadas, M5/M10, animações, arquibancadas e 120 talentos. Navegador de 390px validou 4 personagens GLB, reset/pause, M5/M10, sem erros. Isso prova funcionamento automatizado no navegador, NÃO comprova FPS de 30 no aparelho físico do aluno.

## Prévia isolada
- Quatro modelos: https://pit-v5-arsenal-demo.vercel.app/v5/personagens-lab.html
- Coliseu: https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1&count=4
- Vercel READY com URLs estáveis em produção *dos dois projetos demonstrativos isolados*. **Não** é deploy da oficina principal.

## Restrições para próximos passos
- Não repetir um modelo entre classes.
- Não misturar fontes que criem alturas diferentes.
- Não adicionar armaduras/quimeras/partes 3D procedurais sobre os GLBs.
- 4 classes continuam com seus atributos, 30 talentos por classe, combate, progressão e câmeras existentes.
- Não mexer na `main`. Próximo passo legítimo da fase E continua balanceamento, VFX artísticos, simulação das 30 entidades. F diretor automático, G QA real mobile, H integração de alunos, I merge com autorização.

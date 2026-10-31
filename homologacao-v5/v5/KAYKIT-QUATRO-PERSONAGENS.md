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

## Revisão visual após retorno do usuário (29/10/2026, ~20h)
- O usuário enviou captura do combate em 3ª pessoa e disse que a troca de personagens **não era perceptível**. A captura mantém o cenário original, mas ele queria validar claramente os modelos.
- Confirmado por extração do **arquivo servido pela URL pública** `pit-v5-coliseu-demo.vercel.app/v5/character-assets.js` que o servidor já usava `Barbarian.glb`, `Mage.glb`, `Rogue_Hooded.glb` e `Knight.glb`; a substituição dos GLBs estava de fato publicada.
- Problema visual concreto encontrado em `arena-three.js`: **a cor original dos modelos era misturada a 28% com a cor do build**; ainda havia uma coroa flutuante a 2,94 unidades, mini-anel e cristais a 1,85 unidade cobrindo as silhuetas. Corrigido preservando os materiais originais (clone sem lerp) e ocultando os ornamentos flutuantes; **os círculos no solo e os VFX dos talentos são mantidos**.
- Criada galeria lado a lado com **quatro miniaturas reais renderizadas diretamente dos quatro GLBs** na página `personagens-lab.html` (`generateRealModelGallery()` gera PNG por WebGL e exibe botões interativos). Clicar em cada miniatura abre a prévia maior 3D girável.
- Arena ganhou o quadro `#realModelProof`: mostra nomes exatos dos quatro modelos e se todos os arquivos GLB da partida carregaram. Link para galeria.
- QA de catálogo e navegador da galeria **PASS** (390 e 1200px), 4 miniaturas reais e 4 alturas 2,55: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40972215442. Screenshot gerado como artefato `v5-four-hero-model-comparison` ID `12940173998`, link https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40972215442/artifacts/12940173998.
- Projetos isolados publicados e disponíveis SEM LOGIN via **aliases de produção estáveis**, que DEVEM ser os links enviados ao usuário: https://pit-v5-arsenal-demo.vercel.app/v5/personagens-lab.html e https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1&count=4.
- IMPORTANTE: **URLs imutáveis** dos deploys com host `pit-v5-...-<hash>.vercel.app` estão protegidas por autenticação do Vercel e podem retornar `login_required`, inclusive depois de `target=production`; não enviar essas URLs para o usuário. Usar **somente alias estável de produção**, verificado pelo navegador externo.
- A bateria completa da arena iniciada no commit `f3fe86c2` ainda executava na última verificação; não declarar homologação integral nessa revisão sem conferir.
- A semelhança de estilo do KayKit continuará, porque é **low-poly cartunesco por definição**. Não prometer personagens realistas. Próxima validação deve priorizar comparação lado a lado antes de mexer no cenário/meshes ou atributos.

# H.3/M10 — rótulo de talentos na prévia final (31/10/2026)

**Missão técnica em andamento:** impedir que a interface da arena final da Missão 10 anuncie falsamente "Missão 5" no destaque de um talento real. Trabalho exclusivamente experimental na branch `feature/v5-arena-dos-criadores`.

## Diagnóstico e alteração

- `v5/arena-lab.js`: o evento `talent` gerava `Talento <id> · Missão 5` de forma fixa, inclusive no modo `?m10preview=1`. Agora usa `state.mission`, preservando o texto da M5 e mostrando "Missão 10" na final.
- `qa/v5-m10-visual-browser.cjs`: adicionada observação das mutações reais do texto `#spotlightSource` durante a luta WebGL de quatro KayKits. O teste exige pelo menos um destaque de talento e rejeita qualquer indicação diferente de "Missão 10". Os testes existentes de 30 KayKits, 10 talentos, vitória, arquibancadas e retorno à M5 permanecem.
- Commits: interface `27a7471e4bfef616caadd1296a92c340f2d3414f`; teste `21d0e177eaf2d088a08896ed07722bb1e9ffa1ee`.

## Verificação

- Workflow específico: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41201800288
- **Status na criação do checkpoint:** CI em andamento, não aprovado. Confirmar os quatro jobs antes de fechar esta missão. Se o teste falhar, investigar se o rótulo é exibido ou se a observação do DOM é insuficiente; não ocultar falha nem remover o critério sem evidência.
- Não houve modificação de atributos, talentos canônicos, simulação, resultados, câmera, personagens KayKit, conteúdo/ordem das dez missões, XP, notas, usuários, turmas, V3, `main` ou deploy.

## Próximo passo

Verificar CI do SHA `21d0e177eaf2d088a08896ed07722bb1e9ffa1ee`, corrigir eventual regressão e encerrar apenas com evidência do browser. A **G.2 nos PCs físicos não foi executada**. H.1/H.2 com alunos reais e homologação final seguem bloqueadas até autorização explícita.

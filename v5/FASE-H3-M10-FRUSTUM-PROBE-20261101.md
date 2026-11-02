# H.3 / Missão 10 — diagnóstico de projeção dos efeitos em quadros WebGL

**Rodada:** 01/11/2026, branch exclusiva `feature/v5-arena-dos-criadores`.
**Status:** incremento implementado; **CI NOVO PENDENTE**. Não afirmar legibilidade humana nem aprovação de G.2.

## Contexto verificado antes da alteração

HEAD inicial `2c7f0faf5b08d09cb0911c7bd0dff353d0c0d93f`.
Lidos `v5/ROADMAP-D-A-I.md`, `v5/FASE-E-CHECKPOINT.md`,
`v5/FASE-F-CHECKPOINT.md`, `v5/FASE-G-CHECKPOINT.md` e
`v5/FASE-H0-CONTRATO.md`; consultados commits e GitHub Actions recentes.
Gate anterior de legibilidade 1920×1080/1366×768 em `low`:
[run 41363113278](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41363113278),
5/5 jobs SUCCESS. As capturas estáticas não provam que o efeito estava
na tela no instante de sua execução; não duplicar aquele teste.

## Incremento experimental único

1. `v5/arena-three.js` — commit `525ad1802e52ed4b2794c9069a793d110a812b20`:
   somente com `?m10fxprobe=1`, após `renderer.render`, observa os meshes
   de talentos **ainda vivos no frame**, projeta seu centro na câmera real e
   registra contagens acumuladas de frames dentro/fora do frustum (NDC).
   Desligado por padrão; não escolhe câmera, dano, vencedor ou build. A coleta
   é limitada aos efeitos existentes; não lê contas ou dados reais.
2. `qa/v5-m10-rare-equipped-browser.cjs` — commit
   `2f2145086742db6039b097d9dc2cb1050c9a2d2a`:
   flag `M10_FX_PROBE=1` para observar contagens reais, verificar
   pertencimento ao catálogo equipado, exigir pelo menos um centro projetado,
   documentar J08/P09/A07 sem inventar visibilidade individual e conferir
   limpeza da telemetria ao retornar à M5.
3. `.github/workflows/v5-m10-rare-equipped-qa.yml` — commit
   `1885c91e2173d4a7a68c559099f3176203e4e116`:
   job independente `fx-projection-webgl` em Chromium/SwiftShader, com
   relatório JSON e capturas, além dos gates já existentes.

## CI e próximo passo

Novo run: [41368295427](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41368295427).
**Estado ao registrar: queued; nenhum sucesso reivindicado.**
Também em fila: [QA geral 41368295455](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41368295455)
e [Browser QA 41368295397](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41368295397).
Próxima rodada deve inspecionar jobs e logs; corrigir falhas na mesma Missão 10.
Se passar, comparar os contadores de J08/P09/A07 e as capturas, e
investigar efeitos projetados fora da tela, sem alterar balanceamento sem evidência.

**Limites:** projeção do centro do mesh não detecta oclusão por pilares,
opacidade, contraste, duração percebida ou pixels efetivamente legíveis.
SwiftShader não valida FPS dos PCs da escola. A avaliação humana do projetor,
G.2 físico, H.1/H.2 com alunos reais, fase I, `main`, merge e produção
permanecem bloqueados. M5 (5 talentos/10 pontos), M10 (10/20),
4 classes KayKit, 120 talentos, XP e dez roteiros pedagógicos não foram alterados.

## Rodada seguinte — captura no instante do efeito (02/11/2026)

**Missão única mantida:** H.3 / arena final M10, sem alterar a mecânica.
HEAD de partida: `64e88a750e6efdbfc5355418c25254a575bd291b`.
Conferidos os cinco roadmaps/checkpoints obrigatórios, os commits e o CI.
O run anterior [41368295427](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41368295427) terminou com os jobs `rare-equipped-webgl` e `fx-projection-webgl` aprovados; o relatório foi anexado como artefato `m10-fx-frustum-projection`. Isso só valida projeção global, não legibilidade por talento.

**Incremento verificável:** `qa/v5-m10-rare-equipped-browser.cjs` passou a observar as chaves dos meshes *ativos dentro do frustum no frame*, capturar uma imagem adicional no primeiro registro de cada J08/P09/A07 e relatar, separadamente por talento, quadros projetados, fora da câmera e se houve captura ao vivo. A captura ainda pode sofrer atraso entre leitura do frame e screenshot: não confundir com prova de contraste/oclusão/pixels. Nenhum teste presume que os três foram capturados; ausências são explicitadas no JSON. Corrigida a avaliação Playwright para não depender de variável Node dentro de `page.evaluate`.

**Commits desta rodada:** `c1c8e86fcfdeadd9b810e3e4769b8176c67b5927` e `886250943e56ea2aef16d9989f50b99c604f8e19`.
**CI do SHA corrigido:** [WebGL 41373193453](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41373193453), [QA geral 41373193440](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41373193440), [Browser QA 41373193553](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41373193553).
**Estado ao escrever:** aguardando conclusão dos jobs do SHA corrigido; não declarar aprovado antecipadamente.

**Próxima ação:** verificar a distribuição por J08/P09/A07 e capturas no artefato do run corrigido; investigar qualquer talento sem quadro projetado antes de alterar câmera/efeitos. G.2 em PCs reais e avaliação humana no projetor permanecem pendentes; H.1/H.2 e produção bloqueadas. M5, quatro KayKit, 120 talentos, dez roteiros, XP, aprovações e `main` intactos.

### Resultado do diagnóstico por talento (02/11/2026)

O job `fx-projection-webgl` do [run 41373193453](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41373193453) concluiu com **success**; a instrumentação e a regressão M5 passaram. No log do teste, **64 amostras de frame de efeitos gerais estavam dentro do frustum e 63 fora**. Porém os três talentos-alvo registraram:

| Talento | Frames dentro | Frames fora | Captura ao vivo |
|---|---:|---:|---|
| Guardião J08 | 0 | 0 | não |
| Caçador P09 | 0 | 0 | não |
| Arcanista A07 | 0 | 0 | não |

**Conclusão limitada, mas relevante:** a auditoria anterior de `rendered-cue-recorded` conta criação de efeito, não sua presença num frame WebGL. O teste atual **não comprovou um único quadro com J08/P09/A07 ainda vivos no array de efeitos**. Isso não prova que o efeito seja invisível em toda execução, nem que o frustum seja o culpado. Hipóteses a investigar: expulsão precoce da única faixa `rareProcLane` por outros procs entre ticks de física e frames, duração dos efeitos, ausência de correspondência temporal entre evento e render. A câmera não deve ser alterada sem isolar a causa.

**Status de homologação:** diagnóstico CI aprovado, **gate de visibilidade dos três talentos NÃO aprovado**. O job restante `rare-equipped-webgl` estava em andamento quando este registro foi escrito. Próximo incremento da MESMA missão: instrumentar descarte/tempo de vida de efeitos antes de render, reproduzir J08/P09/A07 com seed fixa e somente depois corrigir a política visual sem alterar o motor de combate, M5 ou qualidade padrão. G.2 e avaliação humana seguem pendentes.


## Rodada de 02/11/2026 — diagnóstico do ciclo de vida dos VFX (incremento H.3)

**Missão única:** M10, sem mudança de combate, progressão, câmera ou conteúdo pedagógico.

- **SHA inicial:** `b0f1e32e11f9e866352db599d98aee7de1741423`.
- **Commit técnico:** [`50c369f`](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/commit/50c369f225a7952e70abf02f5230a27b3e45e093).
- **Arquivos:** `v5/arena-three.js` e `qa/v5-m10-rare-equipped-browser.cjs`.
- **Teste local comprovado:** parser JavaScript aceitou os dois arquivos modificados (imports/exports de módulo retirados apenas da cópia temporária usada para verificação sintática). **O CI WebGL deste SHA ainda não foi confirmado neste checkpoint.**
- **Telemetria opcional `?m10fxprobe=1`:** por chave canônica de talento, contabiliza efeitos criados, que chegaram a pelo menos um frame renderizado, expulsos antes/depois do primeiro frame e expirados antes/depois do primeiro frame. Não coleta nomes/identidades; sem a flag, não há coleta.
- **Teste automatizado:** exige que os três talentos raros J08/P09/A07 tenham efeitos rastreáveis quando seus procs ocorrerem, que contagens de remoção sejam coerentes e que a telemetria seja limpa no retorno à M5. Não aprova legibilidade só por ter registrado criação ou primeiro frame.
- **Hipótese a verificar no CI:** a faixa `rareProcLane` pode substituir um proc sutil por outro antes de `renderer.render`. Diferenciar `evictedBeforeFrame`, `expiredBeforeFrame` e `renderedOnce` por talento; só corrigir a política visual após dados observados.

**Próximo passo na MESMA Missão 10:** consultar o workflow `v5-m10-rare-equipped-qa.yml` no SHA `50c369f`, inspecionar o log `M10 FX lifecycle diagnostic` e os artefatos JSON. Se J08/P09/A07 forem expulsos antes do primeiro frame, testar uma política limitada de retenção por ao menos um render; se forem renderizados fora do enquadramento, investigar enquadramento/oclusão. Em qualquer caso, repetir M5 e CI completo antes de homologar.

**Bloqueios preservados:** G.2 em PCs físicos não executado; avaliação humana no projetor não realizada; H.1/H.2 com estudantes reais, aprovação I, `main`, merge, produção, XP e turmas não autorizados.

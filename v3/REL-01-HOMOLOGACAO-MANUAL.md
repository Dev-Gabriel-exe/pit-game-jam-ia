# REL-01 — Protocolo de homologação GDevelop e revisão por pares

**Situação:** roteiro preparado, **NÃO EXECUTADO** no editor GDevelop. Não autoriza publicação. Branch de teste: `feature/pit-gamejam-v3-arcade`. Não usar contas, turmas ou dados reais; não conectar a API de produção.

## Ambiente descartável

1. Anotar data, versão exata do GDevelop, sistema operacional, navegador e resolução de tela. Criar um projeto **novo** com nome `PIT-QA-DESCARTAVEL`, fora de pastas de clientes/alunos.
2. Abrir [biblioteca de assets da branch](https://raw.githack.com/Dev-Gabriel-exe/pit-game-jam-ia/feature/pit-gamejam-v3-arcade/index.html#recursos) em modo estático; baixar PNG, WAV, GLB e pelo menos um ZIP de kit. Não conectar conta real, não usar APIs pagas.
3. Registrar os nomes e tamanhos reais dos arquivos; conservar cópia original e hash SHA-256. Não usar arquivos de uma turma.
4. Antes de concluir cada caso, registrar captura do editor **e** vídeo curto do Preview, com data e nome do projeto. Não marcar PASS só porque o arquivo foi baixado ou o evento apareceu no editor.

## Matriz de aceite (um resultado por linha)

| ID | Procedimento real | PASS apenas se | Evidência mínima |
| --- | --- | --- | --- |
| FUN-08 PNG | Criar Sprite, importar PNG do kit, colocar instância na cena, executar Preview | Sprite aparece com dimensões/alpha corretos, sem erro de importação | `fun08-png-editor.png`, `fun08-png-preview.png` |
| FUN-08 WAV | Em Events, adicionar ação Play a sound e selecionar WAV; executar Preview | Som audível em interação, sem falha de decode e sem reprodução involuntária em loop | `fun08-wav-evento.png`, `fun08-wav-preview.mp4` |
| FUN-08 GLB | Criar objeto 3D Model, importar GLB, adicionar à cena e configurar câmera 3D; Preview | Modelo renderiza com escala e orientação ajustáveis, sem erro de geometria | `fun08-glb-editor.png`, `fun08-glb-preview.png` |
| FUN-08 starter | Abrir um starter oficial do kit, fazer cópia, importar um asset e salvar/reabrir | Projeto editável preserva objetos/eventos/asset após reabrir | `fun08-starter-antes.png`, `fun08-starter-depois.png` |
| M06-05 | Inserir um asset no projeto 2D e um no 3D; consultar fallback offline | Asset utilizável em Preview, créditos e licença identificados; fallback acessível sem rede | `m06-importacao-2d-3d.md` + capturas |
| M07-04 | Criar regra de vitória com variável e condição; testar caso falso, verdadeiro e repetição | Vitória não aparece prematuramente e aparece exatamente quando condição é satisfeita | `m07-casos-positivo-negativo.mp4` |
| M08-04 | Registrar antes/depois de feedback/HUD no Preview, medir FPS aproximado no mesmo dispositivo | Melhoria observável, legibilidade e foco; sem queda perceptível que inviabilize jogar | `m08-antes-depois.mp4`, resolução e FPS |
| M09-03 | Testador voluntário em ambiente de QA isolado tenta concluir uma tarefa sem instrução; registrar apenas apelido fictício | Observação reproduzível, decisão corrigir/backlog, reteste quando aplicável; não inventar fala de colega | `m09-observacao-anonima.md` e gravação autorizada se houver |
| Mobile físico | Abrir cadernos em aparelho físico de teste, verificar foco, leitura, rolagem, envio em ambiente falso | Sem bloqueio de toque ou perda de rascunho; registrar modelo e navegador | `mobile-fisico.md` + capturas |

**Regras de evidência:** registrar `PASS`, `FAIL` ou `NOT_RUN` para cada caso, com data, versão, arquivo, SHA e referência de captura. Se não houver editor/dispositivo/testador disponível, manter `NOT_RUN` e tarefa bloqueada. Não adicionar evidência de aluno real ao repositório público.

## Encerramento

Após executar os testes, corrigir bugs reais com commit e regressão, atualizar `v3/AGENTE-V3-ESTADO.json` por ID, rodar Static QA, Browser QA, Postgres QA descartável e `node qa/v3-release-gate.cjs --strict`. Somente quando 59/59 critérios estiverem demonstrados, preparar relatório final e `READY_FOR_FINAL_REVIEW`. **Nunca fazer merge/deploy sem aprovação explícita.**

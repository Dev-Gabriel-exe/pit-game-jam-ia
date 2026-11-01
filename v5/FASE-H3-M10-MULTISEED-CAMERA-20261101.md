# PIT Game Jam IA V5 — H.3 / Missão 10: diversidade de seeds e câmera WebGL (01/11/2026)

**Estado: CI em andamento; NÃO homologado.** Somente a branch `feature/v5-arena-dos-criadores`. Sem merge, deploy, banco, XP, notas, usuários, aprovações ou turmas reais.

## Estado inicial consultado

HEAD anterior: `8f12a3403650604e4948314a8a059da99631bb69`. Foram lidos os cinco documentos obrigatórios (`ROADMAP-D-A-I`, `FASE-E`, `FASE-F`, `FASE-G`, `FASE-H0`), commits recentes e GitHub Actions. No HEAD anterior, QA geral, Browser QA e quatro heróis estavam verdes (runs `41348789770`, `41348789769`, `41348789795`). A rodada anterior verificou três cues raros em **uma** seed `20261101`, não legibilidade humana.

## Incremento único da mesma M10

- `qa/v5-m10-rare-multiseed.cjs` — commit `c5c993632ec25f29217604492d8d89c0ee94e702`: encontra segunda seed diferente da primeira com proc raro genuíno em 30 personagens fictícios, mantém 10 talentos/20 pontos, valida proprietário e equipamento de cada proc, replay determinístico e emite fixture JSON sem dados pessoais.
- `qa/v5-m10-rare-equipped-browser.cjs` — commit `2f27bb59825447dc11eed5e0b9c04ea7922809d3`: recebe fixture e prefixo de artefatos opcionais; mantém verificações originais de 30 KayKits, renderização de cada talento raro com proc, câmera, arquibancada e retorno à M5. Padrão anterior intacto.
- `.github/workflows/v5-m10-rare-equipped-qa.yml` — commit `0ca42b67a1ff1e3edd17644dc26866893828c353`: duas execuções WebGL reais, seeds independentes, relatórios e capturas separados. O job deve falhar caso uma ativação rara real não produza cue renderizado.

## Evidência em andamento

- [CI específico no SHA `0ca42b67`](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41353182444) — iniciado; **não declarar sucesso antes do término**.
- [QA geral](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41353182653) e [Browser QA](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41353182429) — iniciados; status a confirmar.
- Limite: os dados do renderer comprovam criação de cues; screenshot após detecção cumulativa não garante enquadramento no instante do efeito, legibilidade humana nem FPS físico.

## Próximo passo

Acompanhar os jobs; se falharem, corrigir e repetir. Comparar os dois relatórios de câmera/cues e imagens. A M10 continua aberta até revisão humana e G.2 nos PCs reais. H.1/H.2, V3, produção e main seguem bloqueadas.

## Fechamento desta rodada — CI específico aprovado

- **SUCCESS** no [run 41353182444](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41353182444), SHA de código `0ca42b67a1ff1e3edd17644dc26866893828c353`: etapa Node, contrato H.0, regressão M5, duas partidas completas no Chromium/SwiftShader com **30 GLBs KayKit cada**, câmera automática, 29 espectadores e retorno a 5 talentos M5.
- Seed primária `20261101`: procs reais J08/P09/A07 = **1/1/4**; os três cues **renderizados**, nenhum descartado. Planos de câmera observados: `duel`, `climax`, `victory`.
- Seed independente `4175863657`: procs reais J08/P09/A07 = **1/3/1**; os três cues **renderizados**, nenhum descartado. Planos observados: `highlight`, `victory`. Replay de eventos determinístico no Node.
- **SUCCESS**: [QA geral 41353182653](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41353182653) e [Browser QA 41353182429](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41353182429) no mesmo SHA.
- Artefatos do CI: dois relatórios WebGL JSON, duas fixtures, screenshots dos três talentos por seed. **Ressalva:** cue renderizado na GPU não comprova percepção do efeito por um aluno no projetor; capturas ocorrem após observação cumulativa. Não há medição G.2 em PC físico.

**Próximo passo H.3/M10:** revisar as imagens/legibilidade de cada cue com a câmera em movimento e repetir em modo de qualidade reduzida, sem alterar combate ou M5. **G.2 físico, homologação humana, H.1/H.2 reais e merge em main continuam bloqueados.**

# H.3 / Missão 10 — cobertura das onze variantes de builds fictícias (01/11/2026)

**Estado:** incremento de testes de laboratório concluído no job Node `final-roster`; workflow WebGL completo ainda em execução no momento deste checkpoint. Branch exclusiva `feature/v5-arena-dos-criadores`. Sem merge, deploy, autenticação, banco, XP, aprovações ou usuários reais.

## Missão técnica executada

- Criado `qa/v5-m10-visual-variant-matrix.cjs`: percorre as **11 variantes** do gerador visual, com **30 personagens fictícios por variante**, totalizando **330 builds verificadas**. Cada build é validada com 10 talentos distintos, 20 pontos de atributo, classe KayKit canônica e cinco talentos/atributos da M5 preservados.
- Confere cobertura **120/120 talentos canônicos selecionáveis** no conjunto das variantes (chave classe + ID). Isto **não** significa 120 efeitos disparados em combate nem balanceamento homologado.
- Executa pares de replays determinísticos para as variantes 0, 5 e 10, sempre com 30 personagens; rejeita builds M10 no motor M5 e compara o resultado da M5 legada com a opção explícita `arenaMission:5` byte a byte.
- Atualizado `.github/workflows/v5-m10-visual-qa.yml` para executar o teste no job `final-roster`. O teste não altera o motor, as quatro classes, os 120 talentos, os dados pedagógicos ou o comportamento da M5.

## Evidências verificadas

- Commit do teste: `19d91d3eab505ac9e83379f387f288dac3ff6a45`.
- Commit do CI: `fed21d9801c6a70dcda94dd19f63d4265730d4c0`.
- Workflow: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41322000259
- **Job `final-roster`: SUCCESS** (job 124893999241). Log: `PASS M10 11 variants, 330 fictitious builds, 120/120 canonical talents selectable, 3 deterministic 30-KayKit replay pairs; frozen M5 and legacy result preserved`.
- Vencedores por variante no motor isolado: 0 = Caçador (103,65s); 5 = Guardião (65,35s); 10 = Guardião (73,95s). Não são comparações causais, pois mudam múltiplos talentos e as seeds; não ajustar balanceamento com esses números.
- Os jobs `final-webgl`, `spectator-camera-webgl` e `projector-legibility-webgl` ainda estavam **em execução** na última consulta; não declarar workflow inteiro aprovado antes da conclusão.

## Pendências / próximo passo da mesma Missão 10

1. Conferir a conclusão dos três jobs WebGL do run 41322000259 e corrigir falhas, se houver.
2. Ampliar o ensaio de legibilidade da câmera/arquibancada para diferentes builds e proporções de tela; validar com um humano.
3. **G.2 nos PCs físicos não realizado**; CI usa SwiftShader. **H.1/H.2 com alunos reais bloqueadas** até G.2 e autorização explícita. Balanceamento definitivo, homologação e qualquer integração com `main` permanecem pendentes.

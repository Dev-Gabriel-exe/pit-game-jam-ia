# FUN-09 — E2E isolado de professor e três alunos fictícios

## Execução confirmada

[GitHub Actions Browser QA 40637186741](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637186741) — **success**. O passo `Verify FUN-09 three fictional students and teacher in Chrome` executou `qa/v3-multi-student-browser.cjs`.

Cenário: um professor e três alunos fictícios em contextos Chrome separados, dois em desktop e um em 390×844 móvel. Toda chamada a `https://pit-game-jam-chat.vercel.app/api/**` foi interceptada por uma fixture HTTP local, sem acesso à API real.

- Missão 04: envio 2D do aluno A, envio 3D do aluno B, rascunho do aluno C.
- Painel do professor: três alunos, filtro de pendências, aprovação A, revisão B com feedback, reenvio B e aprovação posterior.
- Independência dos três registros e dos status; revisão sem reenvio não pode ser aprovada.
- Liberação da Missão 05 pelo botão do professor; três alunos recebem a nova missão após atualizar a página.
- Rascunho autoral da Missão 01 preservado no navegador móvel após a liberação.
- Layout móvel sem rolagem horizontal e simulação de erro HTTP 503 com recuperação em nova tentativa.

## Limitações

A fixture simula o banco e as respostas da API. Os envios 2D/3D foram feitos por chamadas `fetch` da página para a fixture; **não** significam que jogos GDevelop foram criados ou executados. O teste não realizou transações em Postgres real nem provou sincronização em tempo real sem recarregar a página. O teste de erro 503 verificou o transporte e recuperação da requisição; o fluxo visual de erro/retry do chat é coberto separadamente por `qa/v3-e2e.cjs`.

Nenhum aluno real, credencial real, serviço pago ou produção foi utilizado.

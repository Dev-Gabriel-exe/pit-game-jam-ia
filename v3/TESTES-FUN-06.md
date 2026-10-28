# FUN-06 — Acompanhamento individual, roster e atividade

## Contrato e testes

A API real de sala `chat-api/api/classroom.js` consulta as etapas de cada aluno e agrega `highest_stage`, `approved`, `unread_chat` e `last_seen_at`. O teste `qa/v3-isolated-backend.cjs` executa o handler com três alunos fictícios e um pool SQL descartável, verificando dez aprovações, a etapa ativa e o isolamento entre os alunos.

Correção de integridade: `POST /api/classroom?action=heartbeat` agora rejeita (403) uma etapa superior à última liberada pelo professor. Antes, um aluno podia declarar atividade em uma missão futura e distorcer o painel.

O teste Chrome `qa/v3-teacher-browser.cjs` usa **API simulada**, três perfis fictícios e verifica filtros Todos, Pendentes, Online, Dúvidas, estatísticas e detalhes individuais.

## Limitações

O banco real não foi consultado nem alterado. A atualização de `last_seen_at` e a contagem do roster foram verificadas contra o contrato SQL em memória; o teste do navegador não confirma sincronização com Postgres de produção. O teste de múltiplos usuários e falhas de rede fica em FUN-09.

Execuções CI: Static QA [40636760085](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636760085) concluiu com sucesso. O teste Chrome terá sua execução registrada no checkpoint somente após a conclusão.

# FUN-05 — Ciclo de evidências 01–10 (ambiente isolado)

## Evidência executada

GitHub Actions **PIT Game Jam QA** execução [40636673696](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636673696): **success** no commit `41ca4c4624e6e22344f5a7b0a5559828dbcd47c2`. O passo "Verify FUN-02 isolated registration, token and student progress handlers" executa `node qa/v3-isolated-backend.cjs`, que agora inclui os cenários FUN-05.

O script carrega os **handlers reais** `chat-api/api/chat.js` e `chat-api/api/classroom.js` por VM, com pool SQL descartável em memória. Não usa banco Neon, token real ou dados de turma.

- Três estudantes fictícios, com isolamento de progresso por token.
- Dez etapas: criação de rascunho, mudança de fase para revisão, envio e aprovação.
- Rotas alternadas 2D/3D, rejeição de etapa 11, rota inválida e evidência curta.
- Em cinco etapas pares: revisão com feedback, consulta do estado revisado, edição da evidência e reenvio antes da aprovação.
- Proteção contra sobrescrita de envio pendente/aprovado; limite de 750 caracteres aplicado no servidor.
- Correção: aprovação de uma evidência em estado `revision` sem novo envio agora é rejeitada (409). Revisão só aceita status `submitted`.

## Limitações transparentes

O resultado comprova a lógica dos handlers sob SQL simulado, **não** uma transação em Postgres real. Não confirma anexos de vídeo/imagem, importação GDevelop, a experiência de todos os formulários em navegador ou a disponibilidade de produção. A auditoria E2E com múltiplos estudantes, falhas de rede e dispositivos está prevista para FUN-09.

Nenhuma alteração foi publicada na branch `main` ou em produção.

# FUN-07 — Chat bidirecional e isolamento

## Verificações executadas

[Static QA 40636877700](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636877700) concluiu com sucesso executando `qa/v3-isolated-backend.cjs` sobre os handlers **reais** `chat-api/api/chat.js` e `chat-api/api/classroom.js`, com SQL descartável em memória.

Foram verificados: duas mensagens do aluno C e uma do aluno B; threads do professor ordenadas por não lidas; mensagem individual do professor para C; histórico cronológico; contadores independentes; confirmação de leitura de ambos os lados; isolamento de mensagens; token inválido; destinatário inválido; truncamento em 1.200 caracteres; limite de 12 mensagens/minuto por aluno.

O teste Chrome já existente `qa/v3-e2e.cjs` cobre envio do professor ao aluno, estado vazio, erro HTTP 503 simulado, botão de tentar novamente, foco, acessibilidade e preservação do rascunho no chat. O fluxo de envio do aluno ao professor foi exercitado no handler, não no navegador.

## Limites

Não foi conectado ao banco de produção nem a turma real. O erro de rede no Chrome é simulado e não equivale a uma indisponibilidade real da hospedagem. Não houve envio externo de mensagens nem alterações em produção.

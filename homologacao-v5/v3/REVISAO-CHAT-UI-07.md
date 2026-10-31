# UI-07 — Chat e notificações acessíveis

Data: 2026-10-28. Branch `feature/pit-gamejam-v3-arcade`.

## Mudanças de código

- `aluno-v3.html` e `professor-v3.html`: título acessível, estados de carregamento/erro, botão de tentar novamente, rótulo explícito para digitação e área de mensagens com `role="log"`.
- `v3/chat-gothic.css`: paleta dark fantasy, estados vazios, foco visível, altura móvel e movimento reduzido.
- `v3/app.js`: carregamento com proteção contra respostas antigas, seleção de thread válida, estado vazio para professor/aluno, erro recuperável, rascunho preservado após falha, bloqueio de envios duplicados e restauração de foco ao fechar.
- `qa/v3-e2e.cjs`: fixture de API fictícia testa estado vazio, mensagem professor→aluno, falha HTTP 503 simulada, retry, preservação de texto, acessibilidade de `role=log`, `aria-hidden` e foco.

## Testes efetivamente executados

- GitHub Actions Static QA **40631670509**: sucesso.
- GitHub Actions Browser QA **40631670537**: sucesso. Chrome com API simulada, sem turma real, verificou as interações de chat, falha/retry e regressão das dez missões.
- Chrome também verificou viewport móvel do portal e do carrossel existente; **a janela de chat em 390 px não foi isoladamente testada** nesta rodada.

## Limites

- Não foi executado teste com leitor de tela nem backend real.
- Não foi medido contraste por ferramenta WCAG automática, nem testada a janela de chat isoladamente em tablet/celular.
- A melhoria CSS para mobile está implementada, mas precisa da revisão global UI-08.
- O envio em produção e a autorização de mensagens continuam reservados à fase FUN.

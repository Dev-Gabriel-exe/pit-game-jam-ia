# Ensaio aluno/professor V3-V5 — 31/10/2026

Escopo: auditoria de contrato fictício, **não homologação operacional**. Branch experimental somente. Nenhuma conta, XP ou turma real.

| Cenário | Evidência/resultado |
|---|---|
| XP 100 por aprovação | H1a `progressOf`: `approvedBaseXp=approved*100`; `submitted` não libera XP. Valor de leitura, não crédito persistido. |
| 2 atributos + 1 talento | H0/H1a valida orçamento por aprovações e catálogo da classe. Não comprova liberação visual nem persistência. |
| Elegibilidade ao duelo | H1a exige opt-in e `submitted` ou `approved` na missão corrente; checagem de mesma turma/presença/habilitação do professor ainda não implementada. |
| Convite, notificação SIM/NÃO | **NÃO IMPLEMENTADOS** na ponte H1a; aceite, recusa, expiração, cancelamento e notificações ainda exigem contrato/serviço isolado. |
| Aceite abre arena em janela | **NÃO VALIDADO**; não há fluxo end-to-end na ponte H1a. |
| Professor libera arena M5 | H1a exige 5 aprovações e lock M5; controle operacional professor/partida compartilhada não validado. |
| Professor libera arena M10 | H1a exige 10 aprovações e lock M10; controle operacional professor/partida compartilhada não validado. |
| Novo layout de duelo | Arena WebGL de laboratório não comprova layout de duelo 1x1 integrado na V3. |

**Bloqueios:** G.2 hardware físico não realizado; H.1/H.2 com dados reais não autorizados. API V5 legada possui schema incompatível (6 classes e atributos antigos), não conectá-la ao motor KayKit de 4 classes.

**Próximo incremento técnico:** criar contrato puro de convites com estados pendente/aceito/recusado/expirado/cancelado e testes de autorização fictícia, sem WebSocket ou banco; depois ensaiar a janela 1x1 isolada. Nenhum resultado deste documento representa execução de interface de aluno/professor.


## Incremento D.1 — contrato de convites fictícios (31/10/2026)

**Estado:** módulo e teste de unidade publicados somente na branch experimental; **não há interface de duelo, WebSocket, janela aberta, contas reais ou crédito de XP**.

- `v5/duel-invitations-lab.js`: estados `pending → accepted/declined/expired/cancelled` e `accepted → closed`; convites imutáveis com revisão otimista e relógio lógico injetado. Exige visão H1 elegível de dois aliases `trial-...` online, mesma sala fictícia, missão liberada e duelos habilitados pelo professor. Impede autoconvite, respostas por terceiros, segundo convite ativo, aceite tardio e replays por revisão antiga.
- `notificationsFor`: projeções distintas para remetente (cancelar) e destinatário (aceitar/recusar), sem dados reais. `arenaWindowFor`: **somente descritor fictício** após aceite; não abre navegador nem autoriza uma batalha.
- `qa/v5-duel-invitations-lab.cjs`: dez cenários incluindo aceite, recusa, expiração, cancelamento, autorização do professor, mesma turma, concorrência, privacidade, fechamento e preservação do XP. Teste local Node 22: **10/10 PASS** em 31/10/2026. A execução local usa visões H1 artificiais, não uma sessão real V3.
- `.github/workflows/v5-duel-invitations-lab-qa.yml`: job específico de CI criado. **Consultar execução e conclusão antes de marcar CI aprovado.**

**Commits:** `f4bb446a` (contrato), `ef5d712f` (QA), `9700720b` (workflow). Checkpoint criado após essas alterações.

**Pendente para esta solicitação:** CI específico, integrar simulação com `student-bridge-h1.js` real, interface de notificações SIM/NÃO e janela 1×1 no navegador, controle docente de arenas coletivas M5/M10, teste end-to-end aluno/professor e revisão do layout de duelos. G.2 físico e H.1/H.2 operacional seguem bloqueados. A prioridade da arena final M10 permanece; este incremento prepara apenas o contrato isolado solicitado, sem alterar M5/M10 ou os 120 talentos.


### Verificação do CI (31/10/2026)

- **PASS**: [V5 Duel Invitations Fictional Contract QA — run 41197655128](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41197655128), SHA `9700720bc12bb6a20b9f6d4a748dc77380a013b1`; executou análise sintática do módulo e QA com dez cenários.
- **PASS**: [PIT Game Jam QA — run 41197655157](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41197655157), mesmo SHA.
- Browser QA de commits próximos estava em andamento na última consulta. Não confundir com validação da interface de duelos (não implementada).
- **Checkpoint anterior:** `aa5206c863fd1b0048599d6fa625097331c4026c`. Este adendo atualiza a evidência de CI; o próximo passo continua sendo um ensaio fictício da janela 1×1 e notificações no navegador, sem dados reais.

## Incremento seguinte — janela fictícia de duelo (31/10/2026)

- `v5/duel-window-lab.html`: maquete isolada, sem API ou XP, com aluno A convidando, aluno B aceitando/recusando, bloqueio de convite pelo professor e janela modal após aceite. Não é arena WebGL nem integração com V3.
- `qa/v5-duel-window-lab.cjs`: verificação estática de IDs, contratos, acessibilidade e mensagens; **não é teste browser ponta a ponta**.
- `.github/workflows/v5-duel-invitations-lab-qa.yml`: gatilho atualizado para os novos arquivos e execução do QA estático.
- HEAD da implementação: `9b28751d`; CI do novo commit pendente de verificação no momento do checkpoint. Link de acompanhamento: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-duel-invitations-lab-qa.yml
- Próximo passo: Playwright real para aceitar/recusar, abrir/fechar modal e bloquear com professor; em seguida conectar somente um combate fictício 1×1 WebGL e testar liberações M5/M10 em laboratório. G.2 e H operacional seguem bloqueadas.

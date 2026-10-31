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

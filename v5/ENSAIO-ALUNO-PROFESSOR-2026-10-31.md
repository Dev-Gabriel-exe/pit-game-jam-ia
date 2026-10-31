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

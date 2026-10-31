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

## Rodada seguinte — automação Chromium de notificações e janela

- Novo teste `qa/v5-duel-window-browser.cjs`: recusa não abre janela, aceite abre, bloqueio do professor, Esc e foco restaurado, reset e ausência de erros JS.
- Workflow `.github/workflows/v5-duel-invitations-lab-qa.yml` atualizado com job Playwright Chromium.
- SHA do código: `b099d81d`. **CI ainda em fila na consulta; não afirmar que o navegador passou.**
- Escopo: somente maquete fictícia. Ainda falta arena 1×1 WebGL real, autorização professor M5/M10 e teste ponta a ponta V3; H.1/H.2 reais bloqueadas por G.2.

## Rodada: isolamento acessível da janela de duelo

- CI anterior `41198761906`: jobs de contrato e navegador aprovados.
- `v5/duel-window-lab.html`: ao abrir janela, irmãos de `#arena` tornam-se `inert`, preservando o estado anterior; ao fechar por Esc/botão, restaura estado, rolagem e foco. Não altera lógica do convite.
- `qa/v5-duel-window-browser.cjs`: valida fundo inerte, diálogo ativo, reversão do isolamento e foco.
- Código: `1c49b1df`; testes: `ddf9464b`. CI do novo teste pendente na consulta, **não homologado**.
- Próximo passo: revisar CI; depois arena WebGL fictícia 1x1 e controle professor M5/M10. G.2 não realizado; H.1/H.2 reais bloqueados.

## Incremento: adaptador fictício de combate 1×1

- CI anterior do isolamento modal: `41199302756` aprovado, incluindo navegador Chromium.
- `v5/duel-battle-lab.js`: adaptador isolado de descritor de convite aceito para `phase2-combat.battle` com exatamente 2 aliases `trial-*`, M5 ou M10, classes canônicas KayKit, sem persistência ou XP.
- `qa/v5-duel-battle-lab.cjs`: cobre convite recusado, descritor inválido, execução M5/M10 e replays determinísticos.
- `.github/workflows/v5-duel-invitations-lab-qa.yml`: adiciona execução do novo teste Node.
- Commits: `78c6bcbf`, `fa496621`, `3bc1fea4`. **CI novo ainda não confirmado; não declarar motor 1×1 validado.**
- Próxima ação: inspecionar o CI, corrigir eventuais falhas e ligar visualmente o motor à janela experimental; controles de professor M5/M10 coletivos ainda pendentes. G.2 físico e H operacional bloqueados.

## Incremento — resultado do motor M5/M10 na janela fictícia

- CI anterior `41199881150` aprovado (adaptador 1×1 e testes de contrato).
- `v5/duel-window-lab.html`: carrega `phase2-combat.js` e `duel-battle-lab.js`; após aceite fictício permite selecionar M5/M10 e exibe vencedor/tempo. Ainda **não renderiza GLB/WebGL**.
- `qa/v5-duel-window-browser.cjs`: após aceite verifica execução M5 e M10 na janela e resultado textual.
- Commits: `e13fa8e1`, `3f78f092`, `77902c91`. CI desta nova ligação ainda pendente na consulta; não homologar antes de resultado.
- Próximo: confirmar CI, resolver falhas e criar visualização animada WebGL na janela, preservando a separação de dados e gates G.2/H.

## Correção de regressão no CI do duelo (rodada atual)

- Identificada falha concreta em `V5 Duel Invitations Fictional Contract QA` run `41200058396`: `qa/v5-duel-window-lab.cjs` ainda exigia texto antigo `Sem dano, talentos, XP`, removido legitimamente ao conectar o motor.
- Corrigida asserção estática para exigir a declaração de isolamento sem contas/XP e presença real dos scripts do motor e controles M5/M10; commit `b99a6548`.
- O job Chromium anterior reportou sucesso, mas **a suíte completa falhou**; não considerar o conjunto homologado até novo run verde.
- Pendente: verificar novo CI e validar renderização 3D WebGL 1×1; a janela atual ainda mostra somente resultado textual.

## Incremento — visualização 3D de duelo fictício KayKit (31/10)

**Validação de base:** `V5 Duel Invitations Fictional Contract QA` run `41200951226` concluído com sucesso. Log Chromium confirma carregamento de **dois GLBs KayKit reais**, canvas Three.js e descarte da cena no fechamento, em M5.

**Implementações isoladas (branch experimental):**
- `v5/duel-battle-lab.js`: expõe cópias defensivas da mesma dupla de builds fictícias usadas pelo motor (M5/M10).
- `v5/duel-3d-lab.js`: instancia `createStage` de `arena-three.js` (não renderizador paralelo), entra com exatamente dois aliases fictícios, mantém câmera cinematográfica, atualiza PV e reporta vencedor/tempo. **Só inicia o motor quando `v5ModelsLoaded === 2`;** se houver falha ou timeout, informa e preserva opção textual. Libera GPU, mixers e listeners ao fechar.
- `v5/duel-window-lab.html`: modal real com palco WebGL 3D, HUD de PV, início, pausa, retomada, seleção M5/M10, preservação da opção textual e isolamento `inert`. Controle professor bloqueia abertura de convite aceito quando desabilitado.
- `qa/v5-duel-3d-browser.cjs`: smoke Chromium que verifica modelo KayKit, motor e limpeza em M5 **e M10**; testes de contrato conferem roster, consentimento e ausência de operações com alunos.

**Commits:** `1d2d7b02` adapter, `bfabf163` renderer, `5f70fce0` modal, `8225aefe` gate de GLBs, `509c90f1` HUD, `78e82c0c` CI 3D, `cccbc988` bloqueio professor, `a749f215` smoke M10, `b0c46a88` fallback coerente.

**Gates:** CI da rodada final com M10/fallback ainda não confirmado na consulta; não homologar até verde. G.2 nos PCs reais e H com estudantes reais continuam bloqueados. Não houve merge na main, deploy, integração nem alteração de XP/nota/conta.

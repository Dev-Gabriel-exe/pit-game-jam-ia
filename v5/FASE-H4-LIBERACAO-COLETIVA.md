# Fase H.4 (laboratório) — Liberação coletiva do Coliseu pelo professor

**Data:** 31/10/2026. **Branch:** `feature/v5-arena-dos-criadores`.
**Resultado:** contrato e interface experimental implementados, com CI Node e Chromium aprovado. **NÃO é o controle do professor real.** Nenhuma integração à V3, autenticação, banco, API, XP ou `main`.

## Como visualizar

Na árvore da branch experimental, servir o repositório via HTTP e abrir:

- `/v5/teacher-arena-lab.html` — novo painel de liberação coletiva.
- `/v5/arena-lab.html` — prévia existente do Coliseu, agora com link para o painel fictício.
- `/v5/duel-window-lab.html` — modo de convites entre dois participantes, independente do controle coletivo.

**Passo a passo (alunos fictícios):**
1. Escolher **M5** ou **M10**, selecionar **30** participantes ou **4** para teste rápido.
2. Observar as métricas *no grupo / elegíveis / bloqueados*. Desmarcar “Pronto” ou “Online” de alguns personagens e confirmar que não entram na lista de combate.
3. Marcar *Professor fictício habilita esta arena* e clicar **Liberar participantes elegíveis**. Depois da liberação não é permitido alterar missão, quantidade ou prontidão daquela partida.
4. Clicar **Preparar modelos 3D**. O motor usa a cena `arena-three.js`, os GLBs KayKit oficiais e o diretor cinematográfico. **Iniciar** permanece desabilitado até todos os GLBs dos elegíveis carregarem. Falhas e timeout impedem uma batalha invisível.
5. Clicar **Iniciar confronto coletivo**. O resultado é calculado pelo motor M5 ou M10, com talentos e câmera da V5; **Pausar** e **Interromper teste** são ações exclusivas deste navegador.
6. Usar **Nova simulação** para voltar ao painel de preparação. Reiniciar não cria XP nem remove/aprova missões.

## Contrato da política

`v5/teacher-arena-release-lab.js` é puro, sem DOM, sem rede e sem persistência:
- `createRoster(engine, {mission,count})` cria 2–30 aliases `trial-*` com 4 classes KayKit e builds simuladas. O painel oferece 4 e 30.
- `createState` rejeita aliases repetidos, inválidos e grupos fora de 2–30.
- `eligible(state,policy)` reutiliza **H.0**: exige M5 com cinco missões aprovadas e `m5Entered/m5Frozen` ou M10 com dez aprovações e `m10Locked`. Aplica a mesma regra de turma fictícia, presença e prontidão; exclui, com motivo, cada participante não elegível.
- `alter`, `release`, `start`, `finish`, `abort` e `reset` exigem alias `trial-teacher`, revisão correta e fase apropriada. O alias não autentica ninguém: **somente um futuro backend terá autoridade real**.
- `release` congela os participantes aprovados e constrói um roster imutável, com `approvedMissions` e `finalTrial` da M10. Nunca reatribui pontos, XP ou talentos.
- O motor determinístico `phase2-combat.js` e seu adaptador `m5ArenaAdapter/m10ArenaAdapter` continuam sendo a fonte mecânica. Nenhuma classe, talento ou atributo foi rebalanceado nesta fase.

## Testes e evidência

- `qa/v5-teacher-arena-release-lab.cjs`: 30 participantes em M5/M10, 4 exclusões (online, prontidão, turma, build inválida), congelamento de payloads, seeds iguais com resultados idênticos, travas de início, lock M5/M10, aborto e recomeço; 2–30 permitido, 1 rejeitado.
- `qa/v5-teacher-arena-static.cjs`: contratos visuais e ausência de chamadas a API/armazenamento de alunos.
- `qa/v5-teacher-arena-browser.cjs`: Chromium com painel; 30-person preflight, M5 com 3 elegíveis e 1 offline, clique docente de início, GLBs reais de M5, interrupção e limpeza GPU, M10 com quatro heróis KayKit e dez talentos autorizados, sem iniciar indevidamente.
- Workflow: `.github/workflows/v5-teacher-arena-lab-qa.yml`
- **Run aprovado:** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41203636976 — dois jobs `teacher-contract` e `teacher-chromium` com `success`. Houve uma falha de timing inicial no teste M10 (asserção anterior à atualização do polling); corrigida em `86d29289`, CI verde.

## Escopo que NÃO está pronto

Esta página simula o painel em um único navegador e gera a turma localmente. **Não** comunica estudantes em dispositivos distintos; **não** autentica um professor, bloqueia aluno em servidor, registra lock atomizado, transmite combate/câmera, verifica participação de turma real ou autoriza a entrega de 100 XP. Não substitui G.2: hardware do laboratório e 30 modelos simultâneos precisam de teste físico, FPS, memória, espectadores e replay.

**Próximos gates:** G.2 nos PCs reais; depois H.1b (schema V5 e locks/versionamento no backend), H.2 (uma partida autoritativa/stream com reconexão), integração V3 + homologação I **somente com aprovação explícita do usuário**. Não realizar merge na `main`.

## Revalidação ampliada: 30 heróis inteiros no motor (31/10/2026)

O teste foi ampliado para **liberar e executar trinta entradas reais do motor** — separadamente em M5 e M10 — com build canonizada, H0 verificado, sem exceções de elegibilidade. Em paralelo, continua verificando 4 exclusões e 26 elegíveis com replay idêntico.

**CI verde:** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41203797984 — `teacher-contract` e `teacher-chromium` concluídos em `success`. Logs Node: `M5 / 30 eligible released + full engine` e `M10 / 30 eligible released + full engine`; Chromium: `30-person preflight, 3 eligible M5 / 1 excluded, explicit teacher start, 4 KayKit M10 GLBs, abort cleanup and reset`.

**Limite da evidência:** o cenário de 30 foi executado no motor sem interface 3D nesta suíte; a UI WebGL desta suíte foi verificada com 3–4 personagens KayKit. Os demais testes da arena cobrem cenários 3D com 30, mas isso **não** substitui G.2 no PC da escola. Não declarar que um professor real ou 30 alunos já estão sincronizados.

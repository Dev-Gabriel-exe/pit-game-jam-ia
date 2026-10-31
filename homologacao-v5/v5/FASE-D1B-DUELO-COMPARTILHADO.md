# PIT Game Jam IA — Fase D.1b: confronto 1×1 compartilhado (30/10/2026)

**Branch experimental:** `feature/v5-duelos-d1b` (baseada em `feature/v5-duelos-d1a`).  
**Status:** motor autoritativo + replay 3D de dois espectadores em homologação descartável. **Não ligado a V3 ou alunos reais, sem Neon real, sem alteração da `main` ou das dez missões.** A validação G.2 em computadores físicos ainda é necessária.

## O que mudou

- O sistema D.1a continua responsável por descobrir colegas que **entregaram** ou tiveram **aprovação** da missão liberada e que optaram por duelar. Envio, recusa, aceite, expiração e exclusividade de convites permanecem preservados.
- Após **aceitar** um convite, um dos dois alunos solicita `POST /api/duel-match-v2-lab?action=start`. O servidor bloqueia o convite `FOR UPDATE` e cria **uma única gravação imutável de batalha** em `pit_duel_matches`. Pedidos simultâneos reutilizam o mesmo replay.
- O servidor obtém a identidade exclusivamente pelo hash do token autenticado, confere turma, missão docente, duas reservas exclusivas, status da entrega e build V2 salva no banco. Ele não aceita seed, nome, classe, talentos, atributos, XP ou vencedor definidos pelo navegador.
- A simulação é feita **uma vez no backend** com cópia byte a byte do motor aprovado `v5/phase2-combat.js` em `chat-api/lib/v5-duel-phase2-engine.js` (o backend Vercel isolado não vê a pasta V5 externa). CI bloqueia diferenças entre os arquivos.
- O servidor registra keyframes temporais de posição, direção, vida, escudo e animação, além dos eventos de impacto/talentos e vencedor, em `pit_duel_matches.replay` (JSONB). O resumo possui SHA-256. Somente **os dois participantes** podem ler a sequência, ao entrar na mesma URL de partida autenticada.
- Cada navegador calcula o ponto de reprodução a partir de `startedAt`, `serverNow` e `playbackRate`, com correção aproximada de latência. Mudanças de câmera e áudio são **locais**, mas ambos assistem ao **mesmo replay e vencedor**. Quem recarrega a página volta à mesma gravação, não gera outra partida.
- Ao completar a duração, o banco marca o convite como `finished`, preserva seed/replay/resultado e libera **automaticamente os dois slots de duelo** ao próximo pedido. Nenhum XP, nota, pontuação ou talento é creditado.
- O participante não pode cancelar um confronto após o servidor ter gerado sua gravação; ficar indisponível durante uma partida iniciada não apaga o resultado. Antes do início, o fluxo de cancelamento D.1a permanece válido.

## Arquivos e componentes

- `v5/migration-d1b-duel-matches.sql`: extensão isolada do status D.1a com `finished` e tabela de replay/horários/SHA.
- `chat-api/lib/v5-duel-d1b-replay.js`: gerador puro de replay determinístico a partir de builds previamente validadas.
- `chat-api/lib/v5-duel-d1b-service.js`: transação, controle de primeira gravação, restrições, servidor como relógio autoritativo, leitura restrita aos participantes e encerramento.
- `chat-api/lib/v5-duel-d1b-handler.js`: `GET action=replay&inviteId=...` / `POST action=start`; autenticação de aluno e CORS autorizados; sem geração de batalha no navegador.
- `chat-api/api/duel-match-v2-lab.js`: nova rota desativada por padrão; proibição explícita em `VERCEL_ENV=production`. Não altera nenhuma API de produção.
- `chat-api/lib/v5-duel-d1a-service.js`: limpeza idempotente de partidas encerradas e proteção contra cancelamento malicioso do replay; segue compatível com D.1a sem a tabela nova.
- `v5/duel-replay-d1b.html`, `.css` e `.js`: visualizador 3D independente, câmera diretor ou seguir um dos dois, efeitos espaciais do mesmo `arena-audio.js`, HUD de vida, narrativa de golpes/talentos e overlay de vitória. Tenta carregar os **dois modelos riggados KayKit CC0** da mesma família aprovada; em rede bloqueada usa uma representação 3D simplificada sem afetar a partida autoritativa.
- `?demo=1`: **prévia pública fictícia** para explorar a interface sem conta e sem API. Ao contrário do modo autenticado, gera uma demonstração local de combate exclusivamente com personagens simulados e **não** deve ser confundida com multiplayer real.
- `qa/v5-duel-d1b-postgres.cjs`: PostgreSQL 16 descartável, determina dois inícios concorrentes, mesmo SHA, salvamento único, autorização, budgets diferentes por missão, replay após reconexão, término e liberação de jogadores.
- `qa/v5-duel-d1b-server.cjs` + `qa/v5-duel-d1b-browser.cjs`: fixture local de dois alunos fictícios, navegador Chromium em duas sessões autenticadas, sincronização de tempo/replay, escolhas de câmera independentes e mesmo resultado final. Nada é enviado aos sistemas reais.
- `.github/workflows/v5-duel-d1b-qa.yml`: pipeline sem credenciais pessoais, migration + CI de replay e navegador.

## Limitações honestas

1. **Ainda não há duelo entre alunos reais.** O sistema de convites e o replay autorizados operam em PostgreSQL descartável e apenas na branch; a V3 e a página principal permanecem intactas.
2. No modo real, os navegadores **reproduzem uma luta que o servidor simulou antecipadamente**. Não há comandos de movimento/ataque enviados em tempo real nem PvP manual. Isso é intencional: os alunos criam e equipam personagens e assistem ao confronto entre builds.
3. Missões 1–5 usam o motor aprovado M5 com o orçamento real validado. Para missões 6–10, enquanto um modo de duelos intermediário definitivo não existir, a simulação usa **experimentalmente** a física do motor M10 mas conserva as escolhas/limites validados **de cada aluno**. Não concede progressão fictícia.
4. O visual do duelo é **um palco 3D isolado de homologação**, com dois GLBs da mesma família da V5; não reimplementa o Coliseu coletivo inteiro e não altera seus elementos, câmera ou arte.
5. O professor ainda precisa de uma tela operacional de controle de duelos no painel V3. O controle de sala está preparado no banco, mas **não** é vinculado às turmas reais.
6. O endpoint devolve o replay completo após aceitar; um participante tecnicamente pode inspecionar o JSON e saber o resultado antes da animação terminar. Para uma estreia competitiva sem spoiler, no futuro o backend terá de liberar o feed de forma progressiva, com validação adicional.
7. Antes de implantação: **G.2** com computadores e rede reais, regressão com 30 alunos, segurança/autenticação/isolamento por turma, retenção/exclusão de replays e liberação explícita de integração/deploy.

## Próximo roadmap

**D.1c**: integrar o lobby real de convites D.1a à reprodução D.1b num único fluxo de duas sessões, com controle docente, alerta de convite sem polling excessivo, sala e notificações/reconexão. Simular 15 pares de 30 alunos e medir concorrência. **H.2**: coordenação de espectadores/câmera com a arena coletiva e professor. **G.2/I**: PCs reais, homologação, merge/publicação apenas com autorização.

**QA:** primeira passagem completa de PostgreSQL e duas sessões Chromium em https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41075905328 (**aprovada**). Uma execução posterior também verifica explicitamente a inicialização WebGL de ambas as telas.

**Prévia pública fictícia (sem senha, sem aluno real):**
https://raw.githack.com/Dev-Gabriel-exe/pit-game-jam-ia/feature/v5-duelos-d1b/v5/duel-replay-d1b.html?demo=1

**Workflow:** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-duel-d1b-qa.yml

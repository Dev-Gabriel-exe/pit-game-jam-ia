# PIT Game Jam IA V5 — Fase D.1c: fluxo completo de duelos em homologação

**Data:** 30/10/2026  
**Branch experimental:** `feature/v5-duelos-d1c` derivada de `feature/v5-duelos-d1b`  
**Não há merge na `main`, conexão com turmas reais, banco Neon de produção ou mudança das dez missões.**

## Resultados implementados

1. **Entrada pela sala de espera.** `v5/duel-lobby-d1c.html`, `.js`, `.css` oferecem uma tela única da missão concluída ao desafio 1×1. Exibem missão liberada pelo professor, condição `submitted` ou `approved`, disponibilidade, colegas da mesma sala, notificações e histórico. O aluno pode convidar, aceitar, recusar, cancelar e voltar ao salão depois do duelo.
2. **Notificações e presença temporária.** O lobby consulta a API D.1a em intervalo de **4 segundos** somente quando visível e envia um heartbeat de disponibilidade a cada **25 segundos**. O servidor mantém prazo de presença de 60 segundos e convite de 45 segundos; expirados são removidos da reserva automaticamente. Não usa WebSockets nem simula entrega push com aba fechada.
3. **Entrada automática no mesmo combate.** Ao encontrar convite com status `accepted`, cada aluno abre `duel-replay-d1b.html` dentro da própria interface. A transição transfere apenas o **ID não secreto do convite na URL**. Uma ponte temporária de homologação, estritamente same-origin em localhost, fornece `tokenProvider` **em memória** ao iframe. Sem tokens em URL, storage, cookie ou log.
4. **Combate autoritativo único.** O motor D.1b calcula **uma vez** no servidor, usando duas builds v2 validadas e um seed persistido, registra keyframes, eventos e resultado e devolve o mesmo replay SHA-256 aos dois participantes. Cada um pode usar câmera diretor ou seguir seu personagem, sem alterar a luta do outro. Ao reconectar, o mesmo replay é recuperado. A partida é automática entre as builds; **não há controle PvP em tempo real**.
5. **Controle docente isolado.** `v5/duel-teacher-d1c.html/.js`, `chat-api/lib/v5-duel-d1c-teacher.js` e `chat-api/api/duel-teacher-v2-lab.js` oferecem liberar/pausar novos desafios. Exigem segredo aleatório de teste de **256 bits** definido no **servidor de homologação**, sem reutilizar PIN do professor ou token de aluno. A ação sincroniza com a criação de convites/partidas por lock da linha de turma. **Pausar não cancela replays já iniciados**; um convite pendente não pode ser aceito até reativação.
6. **Regras e privacidade.** A listagem só contém colegas opt-in da turma e da missão atual. Não são aceitos IDs de outras turmas, mais de um convite ativo por aluno, builds inventadas pelo navegador, XP, notas, mudanças pedagógicas ou vencedor definido no cliente. A API continua bloqueada em `VERCEL_ENV=production` e desativada por padrão.
7. **Ambiente de testes separado.** `qa/v5-duel-d1c-30students.cjs` cria **30 alunos fictícios** e realiza **15 convites/pareamentos simultâneos** num PostgreSQL 16 descartável; valida segredo docente, habilitar/pausar, isolamento da turma, replays com budgets reais por missão, 30 slots exclusivos, nenhum 16º desafio, consulta de replay somente para participantes, encerramento e nova rodada. Não grava no Neon real.
8. **Testes de navegador.** `qa/v5-duel-d1c-server.cjs` + `qa/v5-duel-d1c-browser.cjs` percorrem, em Chromium, três sessões de alunos fictícios e uma de professor: pausa inicial, liberação, um aluno ainda trabalhando (inapto), opt-in, convite, recusa, nova tentativa, aceite, iframe 3D com replay compartilhado, pausa docente sem invalidar luta iniciada, encerramento e retorno ao salão. Simula módulos Three.js localmente e bloqueia chamadas externas de alunos. O teste requer a CI aprovada antes de considerarmos a interface validada ponta a ponta.

## O que ainda NÃO está implantado

- O lobby operacional ainda **não está incorporado ao Caderno do Aluno V3** nem ao painel docente real; ambos continuam inalterados. O backend de convites e a UI só funcionam com sessões fictícias injetadas no servidor local de CI. A prévia D.1a continua sem autenticação e permite experimentar visualmente convites, e a D.1b `?demo=1` a batalha 3D.
- O usuário pode fechar a aba; não existe push no aparelho com a página fechada, nem persistência de sessão docente para produção. O polling exige aba visível.
- Uma batalha já calculada pelo servidor gera replay integral; o participante pode inspecionar o JSON e conhecer o resultado antes da apresentação cinematográfica terminar. Para um campeonato com surpresa até o final, será preciso servir a sequência aos poucos.
- A arena individual 3D da D.1b não é a mesma cena do Coliseu coletivo de 30 jogadores. O mapa/arte definitivos permanecem como etapa posterior, sem modificar a arena aprovada.
- **G.2 obrigatório:** testar em computadores da instituição (GPU, carregamento de modelos GLB, desempenho de 15 pares simultâneos, áudio e rede Wi‑Fi).
- **H.1e / H.2:** conexão autorizada à sessão real da V3, controle docente na turma, política de duração/retenção dos replays e teste real de múltiplos dispositivos, antes de qualquer deploy/merge.
- **I:** regressão final, plano de rollback e publicação somente com aprovação explícita.

## Referências

- Fluxo do aluno em homologação: `v5/duel-lobby-d1c.html`
- Painel docente em homologação: `v5/duel-teacher-d1c.html`
- Prévia fictícia dos convites: `v5/duel-lab-d1a.html`
- Prévia fictícia da arena 3D: `v5/duel-replay-d1b.html?demo=1`
- CI: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-duel-d1c-qa.yml

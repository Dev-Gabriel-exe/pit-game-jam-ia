# PIT Game Jam IA V5 — D.1a: convite para duelos 1×1 (30/10/2026)

**Branch:** `feature/v5-duelos-d1a` (derivada de `feature/v5-h1b-integration-safe`).  
**Status:** fluxo de convites com PostgreSQL e tela demonstrativa, restrito a testes e homologação. **Não há integração com alunos reais, Neon, V3 ou produção; nenhuma alteração na `main`.**

## O que foi feito

### Servidor / dados
- `v5/migration-d1a-duelos.sql`: schema aditivo e separado para configuração do professor, presença/disponibilidade, convites e **duas reservas exclusivas de participantes**. A tabela de notas/XP é intocada.
- `chat-api/lib/v5-duel-d1a-service.js`: transações PostgreSQL com verificação de identidade e sala, missão **atualmente liberada pelo professor**, status `submitted` ou `approved` e opt-in/heartbeat recente. Rejeita alunos que ainda estejam trabalhando, colegas de outra turma e IDs falsificados.
- `chat-api/lib/v5-duel-d1a-handler.js`: API autenticada pelo hash SHA-256 do token de aluno, com CORS de origens autorizadas, GET `state`, POST `available`, `invite`, `accept`, `decline`, `cancel`. Retorna estados de notificação a **cada participante**, sem expor o roster inteiro da sala.
- `chat-api/api/duel-v2-lab.js`: nova rota de laboratório **desabilitada por padrão** e bloqueada em `VERCEL_ENV=production`, mesmo que uma flag seja configurada.
- `qa/v5-duel-d1a-postgres.cjs`: integração real com PostgreSQL 16 **descartável**, cobrindo professor desabilitado, quem entregou versus quem trabalha, duas classes de presença, convite/recusa/aceite, expiração, cancelamento, isolamento por turma, convite repetido e corrida de dois convites simultâneos.
- `.github/workflows/v5-duel-d1a-qa.yml`: QA sem banco nem credenciais reais, mais Chromium da prévia.

### Fluxo do aluno
1. Aluno entrega/conclui a missão liberada; o professor habilita os duelos.
2. Aluno opta por ficar disponível. O servidor verifica presença (heartbeat recente, máximo 60s), status da missão e turma. Apenas colegas opt-in e elegíveis são listados.
3. Aluno envia convite 1×1. O banco **reserva ambos** com chaves únicas, de modo que não seja possível receber ou enviar dois desafios ao mesmo tempo.
4. Aluno convidado recebe uma notificação no próximo polling e pode **Aceitar** ou **Recusar**. O convite expira em **45 segundos** ou pode ser cancelado. O remetente consulta o estado para ver “recusado”, “expirado”, “cancelado” ou “aceito”.
5. Ao aceitar, o banco registra o **pareamento** e uma seed de partida gerada no servidor. As duas reservas permanecem bloqueadas até cancelamento ou até a futura integração do motor compartilhado. Neste estágio **não há batalha autoritativa, transmissão/câmera, vitória ou XP**.
6. Se o aluno ficar indisponível, o serviço cancela o pareamento/convite e libera ambos para outros desafios. O professor consegue controlar a habilitação por sala em `pit_duel_room_settings` (ainda sem botão de controle conectado à V3).

### Demonstração visual
- `v5/duel-lab-d1a.html`, `.css`, `.js`: lobby gótico fictício com quatro alunos simulados (um ainda trabalhando), alternância de personagem, convites, aceite/recusa, simulação de expiração, cancelamento e liberação pelo professor.
- A tela demonstrativa usa apenas estado **em memória**, não faz chamadas de API, não armazena token nem envia dados; destina-se a testar o layout e o fluxo com o professor antes da ligação com contas reais.
- `qa/v5-duel-d1a-browser.cjs`: Playwright valida a simulação, sem fazer rede externa.

## Segurança e limites

- A migração foi executada **somente no PostgreSQL do GitHub Actions**. Não aplicar ao Neon de alunos sem aprovação específica.
- A V3, as dez missões, os modelos de personagens e a arena coletiva continuam intactos.
- Nenhum convite altera pontuação, ranking, XP, build, avaliação ou atributos.
- `submitted` é suficiente para **disponibilidade ao duelo**, mas **não** libera pontos/talentos/XP. Apenas `approved` tem esse efeito.
- Presença do aluno é temporária; convites expiram, e o remetente não pode enviar múltiplos convites ativos. Tudo é revalidado pelo servidor ao aceitar.
- A prévia visual **não é multiplayer real**. Ela serve para testar os estados enquanto a API real fica exclusivamente no laboratório.

## Próxima fase — D.1b
- Integrar autenticação e notificações de **dois dispositivos fictícios** com polling sobre o serviço PostgreSQL, sem expor a V3.
- Produzir uma única simulação de duelo 1×1 **no servidor**, determinística e verificável por seed, com snapshots de build v2 e estado compartilhado. Não simular vencedores separados em cada navegador.
- Apresentar a luta com duas câmeras sincronizadas, áudio espacial e tela de vitória; liberar vagas automaticamente ao finalizar.
- Criar controle docente e testes de 30 jogadores com convites concorrentes.
- **G.2** permanece obrigatório: testar WebGL/GLBs e áudio em computadores físicos da instituição antes de ligar a usuários reais.

**CI:** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-duel-d1a-qa.yml

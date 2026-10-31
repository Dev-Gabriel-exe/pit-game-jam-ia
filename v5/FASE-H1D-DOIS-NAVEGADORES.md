# PIT Game Jam IA — H.1d: interface ↔ API V2 em homologação descartável

**Data:** 30/10/2026  
**Branch de trabalho:** `feature/v5-h1b-integration-safe`  
**Situação:** integração **somente em laboratório local/CI**, sem contas reais, Neon, publicação de API V2 ou modificações na V3 / `main`.

## Entregas
- **`v5/hero-lab-h1d.html`**: tela nova da Forja, separada da prévia H.1c. Mantém quatro classes e 30 talentos por classe; lê aprovação/XP-base **do servidor** e não possui botão de conceder missões pelo cliente. O texto informa claramente que está em homologação.
- **`v5/hero-lab-h1d.js`**: controlador de UI que chama o cliente da API V2, lê `profile`, salva build com `expectedRevision`, solicita a primeira entrada M5 e trava M10. Em HTTP 409 **preserva o rascunho** e exige atualização explícita, evitando perda silenciosa de alterações. Desabilita edição após M10 e bloqueia no cliente a remoção de talentos/atributos congelados na M5. Recarrega perfil após retorno do navegador quando não há rascunho.
- **`v5/hero-v2-client-h1c.js`**: cliente de rede já preparado na H.1c, com `X-PIT-Student-Token` em cabeçalho; sem cookies, armazenamento de tokens ou parâmetros de URL contendo credenciais.
- **`chat-api/lib/v5-build-v2-contract.js`**: a resposta autenticada agora apresenta **apenas ao próprio aluno** a cópia dos atributos e talentos que foram congelados na M5, para permitir uma UI segura e compreensível.
- **`qa/v5-h1d-staging-schema.sql`**: somente tabelas fictícias de turma/aluno/aprovação no PostgreSQL 16 temporário da CI.
- **`qa/v5-hero-h1d-server.cjs`**: servidor HTTP que usa **o handler real H.1c** e o repositório PostgreSQL H.1b, mas autentica **dois estudantes inventados**, com tokens determinísticos de teste; nenhuma dependência de API real, Neon ou Vercel.
- **`qa/v5-hero-h1d-two-browser.cjs`**: Playwright com duas sessões independentes **da mesma identidade fictícia**, além de um terceiro navegador de outro aluno. Valida salvamento, conflito real HTTP 409 com revisão divergente, rascunho preservado, recarga, isolamento entre estudantes, aprovações feitas diretamente na base de testes, freeze M5, lock M10, recarga após fechamento/abertura e nenhuma chamada à API da V3.
- **`.github/workflows/v5-hero-h1d-staging-qa.yml`**: pipeline com PostgreSQL 16 **descartável** e Chromium, sem credenciais de produção.

## Segurança / limites explícitos
1. O editor da H.1d **não pesquisa token da V3**, `localStorage`, PIN, nomes, matrícula ou dados privados. Para habilitar a API ele exige **`window.__PIT_V5_H1D_STAGING` injetado pelo test runner** e que a tela esteja em `localhost` / `127.0.0.1`. Quando aberto sem isso, **não faz chamadas** de API.
2. O endpoint real `chat-api/api/hero-v2-lab.js` continua desativado por padrão e proibido em `VERCEL_ENV=production` mesmo com flag; o CI instancia diretamente seu handler com banco descartável.
3. O botão de duelo fica **desabilitado**: elegibilidade fictícia pode ser exibida, mas não há convites ou combate 1×1 entre dispositivos neste estágio.
4. A prévia H.1c continua **100% offline**, sem chamadas de rede. A V3 continua intacta.
5. A migração `pit_hero_builds_v2` foi aplicada **apenas à instância descartável do GitHub Actions**; não há migração aplicada no banco Neon.
6. Não é uma implantação acessível publicamente para alunos. O link de arquivo da H.1d exibe "aguardando homologação local" e não exige ou coleta credenciais reais.

## Critérios de aceite
- Dois navegadores autenticados como o mesmo aluno não podem sobrescrever alterações sem revisão válida; salvar em um deve causar **409 no outro** sem perder rascunho.
- Outro aluno fictício mantém um personagem e revisões independentes.
- O backend consulta turma, progresso e status de aprovações em PostgreSQL, e nunca aceita XP ou missão aprovada declarados no navegador.
- A M5 congela 5 talentos e 10 pontos; a M10 congela 10 talentos e 20 pontos, respeitando M5.
- Atualizar a página recupera o personagem; transição M5/M10 é preservada em banco descartável.
- Sem rede externa da turma e sem autorização de `main`.

## Próximos gates
- **G.2:** homologação de 30 PCs reais da instituição (GPU/WebGL, cache/GLB, desempenho, áudio local).
- **H.1e:** após autorização de integração real, fornecer uma passagem autenticada de sessão da V3, migração auditada em ambiente de homologação separado e testes reais em dois dispositivos — não antecipar produção.
- **D.1:** convites de duelo 1×1 e presença em tempo real, com isolamento por turma, opt-in, aceitar/recusar/expirar e autoridade do professor. Duelo sem XP/nota nem mudança de missões.
- **H.2:** transmissão de uma única simulação/câmera para aluno, professor e espectadores; testes de reconexão.
- **I:** revisão final, merge e publicação somente com autorização explícita.

**Workflow:** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-hero-h1d-staging-qa.yml

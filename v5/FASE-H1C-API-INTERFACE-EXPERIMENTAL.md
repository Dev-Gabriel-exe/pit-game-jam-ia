# PIT Game Jam IA — H.1c: API V2 autenticada e prévia de interface (30/10/2026)

**Branch experimental:** `feature/v5-h1b-integration-safe`

**Status:** contrato de API, cliente e interface **isolados**, com testes automatizados. **Não publicados em produção, não ativados, sem Neon real e sem mudanças na `main` ou nas dez missões.** A validação física G.2 ainda não foi feita. H.1c não equivale à integração real com alunos.

## Implementado

- `chat-api/api/hero-v2-lab.js`: rota Vercel **nova e independente** da API V3/legada. Retorna indisponibilidade sem `PIT_V5_H1C_ENABLED=true`; **nunca habilita se `VERCEL_ENV=production`**, mesmo com flag ativa. A flag só poderá ser ligada futuramente em homologação autorizada.
- `chat-api/lib/v5-hero-v2-handler.js`: interpreta `GET ?action=profile` e `POST ?action=save|enter-m5|lock-m10`. Requer `X-PIT-Student-Token` de 64 caracteres hexadecimais; busca **hash SHA-256** do token na tabela de alunos da sala fixa `PITGAME26`; limita origens, métodos, corpo JSON e headers; todas as operações usam o repositório transacional H.1b. Ignora identidade, sala, XP e aprovações declaradas pelo navegador. Conflito de revisão responde HTTP 409; build inválida 422; autenticação inválida 401; origem não autorizada 403. Erro de banco nunca devolve SQL, URI ou credenciais.
- `v5/hero-v2-client-h1c.js`: adaptador opcional, **não invocado automaticamente**, com GET/POST e dados de sessão obtidos **exclusivamente de uma função fornecida pelo integrador**. Token só no cabeçalho HTTPS, não na URL, não em cookies nem em localStorage. Não reutiliza sessão da V3 sem autorização futura.
- `v5/hero-lab-h1c.html`, `hero-lab-h1c.css` e `hero-lab-h1c.js`: tela standalone, em português, temática medieval/fantasia sombria. Permite selecionar as quatro classes, testar os 30 talentos de cada uma, distribuir 2 pontos e 1 talento a cada aprovação simulada, salvar localmente por revisão, congelar M5, travar M10 e marcar a intenção de duelo. Não acessa nem API nem dados reais. **Todos os estados da tela são fictícios e descartados ao fechar/recarregar.**
- `qa/v5-hero-v2-handler-h1c.cjs`: testes HTTP com banco simulado: flag, bloqueio em produção, token, origem, métodos, limites, 120 talentos, revisão e locks M5/M10, sem credenciais reais.
- `qa/v5-hero-v2-client-h1c.cjs`: verifica token só no header, URL limpa, conflitos, erro de rede, nenhuma chamada quando sessão é inválida.
- `qa/v5-hero-h1c-browser.cjs`: Playwright Chromium percorre o visual da missão 3 até 10, testa o congelamento M5, lock final M10 e disponibilidade fictícia de duelo. **Bloqueia recursos externos** e exige zero chamadas para API.

## Contrato futuro da interface autenticada (NÃO LIBERADO)

Ambiente de homologação devidamente isolado, somente após aprovação:
- Backend de homologação com tabelas de alunos fictícios, aprovações fictícias e migração aditiva `v5/migration-h1b-builds-v2.sql` revisada/aplicada nele, nunca na produção.
- Variáveis exclusivas de homologação: `DATABASE_URL` do banco fictício e `PIT_V5_H1C_ENABLED=true`. **Nunca configurar essa flag na produção**; também há bloqueio explícito pelo ambiente `VERCEL_ENV=production`.
- Autenticador do backend confere a sala associada ao token e as aprovações do professor a cada operação; o cliente só envia `build` e `expectedRevision`.
- A interface da V3 precisará receber um acionador `Forjar meu herói V2` **somente após** resolver a passagem autenticada de sessão, conflitos, G.2 e aprovação para integração. Não editar a V3 antes disso.
- Antes de expor dados reais ou restaurar após reconexão, testar em dois navegadores simultâneos e garantir que somente um processo autoritativo calcule cada resultado da arena coletiva.

## Critérios já automatizados

1. H.1c desligada sem variável, inclusive na rota Vercel. Mesmo com a flag ativa, ambiente `production` não libera a rota.
2. Somente token de aluno, não PIN docente nem ID fornecido pelo browser. Alunos de outra sala não podem ler/salvar.
3. Salvamentos concorrentes com revisão antiga retornam 409. Retry do lock M5/M10 já confirmado não cria novos pontos nem novos snapshots.
4. Não aceitar build antiga de seis classes, talentos de outra classe, atributos indevidos ou XP do cliente.
5. UI funciona offline, com 4 classes x 30 talentos, 2 pontos + 1 talento a cada missão simulada; sem vazar token/nome.

## Etapas ainda pendentes

- **G.2:** PCs reais da escola, GPU, rede, carregamento de GLBs, áudio espacial.
- **H.1d:** integração autenticada da interface com a turma V3 e o backend em staging; requer aprovação antes de atingir qualquer aluno real. H.2 sincroniza arena entre telas.
- **D.1 duelos:** presença por turma, opt-in, convites 1×1, aceitar/recusar/expirar, partida compartilhada, sem XP nem nota, docente habilita/desabilita. Nenhum duelo funcional foi implantado agora.
- **I:** homologação com 30 participantes, rollback e merge na `main` somente quando autorizado.

**CI H.1c:** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-hero-h1c-qa.yml

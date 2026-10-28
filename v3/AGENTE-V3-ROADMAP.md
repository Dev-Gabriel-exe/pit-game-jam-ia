# PIT Game Jam IA — ROADMAP EXECUTÁVEL DO AGENTE V3

> Criado em 27/10/2026. Escopo autorizado: desenvolver a **branch `feature/pit-gamejam-v3-arcade`** do repositório [Dev-Gabriel-exe/pit-game-jam-ia](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia). **Não publicar em `main` nem alterar a turma real sem autorização.**

## Objetivo

Concluir as Missões **04 a 10** nos dois cadernos; auditar **as dez**; reconstruir **todas as telas** (incluindo painel de professor, biblioteca e downloads); reforçar **estética e imagens originais**; finalmente homologar **todas as funcionalidades** (login, chat, acompanhamento, liberação, entrega, revisão, aprovação). Produzir uma experiência gótica/cinematográfica, intuitiva, memorável e **pedagogicamente rigorosa** para o ensino superior em TI.

## Agendamento real e unidade de execução

O usuário solicitou um ciclo **a cada 30 minutos**. O agendador nativo de tarefas do ChatGPT atualmente permite **no máximo 1 execução por hora**. Portanto, **ainda não há execução automática configurada**. Este arquivo define **microtarefas para blocos de trabalho de aproximadamente 30 minutos**; caso seja autorizado um agendamento horário, cada rodada fará um objetivo real, validará, registrará e terminará. Não fingir que existe cron a cada 30 minutos; não iniciar serviço/assinatura paga.

## Fonte de verdade e regras de continuidade

- **Estado persistente:** [AGENTE-V3-ESTADO.json](./AGENTE-V3-ESTADO.json). Ao iniciar qualquer ciclo, ler esse JSON, o estado atual do GitHub e a última documentação. Escolher a **primeira tarefa `todo` elegível**, respeitando a ordem abaixo. Não reiniciar do começo.
- **Manter um único objetivo por ciclo** (uma fatia pequena que deixa resultado demonstrável). Se a tarefa ficar grande, implementar uma parte compilável/testável, marcar `in_progress` e retomar na próxima rodada; jamais marcar `done` apenas por ter produzido um plano.
- **Progresso transacional:** após executar, atualizar o JSON com `status` (`todo`, `in_progress`, `done`, `blocked`), `commit`, `updated_at`, `tests`, `blocker`; atualizar `last_task` e `priority`. Relatar commit, arquivo, teste executado, pendências e próximo objetivo.
- **Trabalho real:** consultar arquivos atuais, editar o código, verificar sintaxe/casos, salvar no GitHub. Nunca dizer "testado" para testes não executados. Se bloqueado por permissão, credencial, recurso ou navegador, informar com precisão e continuar em outra tarefa segura.
- **Modo prévia `?preview=1`:** não faz ações reais em turma nem no backend. Testes de API exigem ambiente/sessões de teste autorizados. Credenciais não devem aparecer em git, HTML, console ou relatório.
- **Base aprovada:** Missões 01–03 estão aprovadas pelo responsável em conteúdo e aparência; NÃO reescrever sem correção concreta. O teste real de navegador/API ainda está pendente.
- **Não confundir automação com aprovação:** progressos, XP e conquistas devem refletir estados reais, evidências e avaliação efetiva do professor.
- **Custo zero:** preferir HTML/JS/CSS, GitHub Pages, stack já existente, ferramentas com acesso gratuito verificável; imagens e assets originais, sem fan art imitativa. Não contratar, publicar, alterar contas ou consumir créditos pagos automaticamente.
- **Matrícula e privacidade:** não acessar dados de alunos reais para teste sem permissão. Não publicar nomes, chat, evidências ou tokens reais.

## Padrão pedagógico inegociável

1. **Professor leigo em criação de jogos, alunos de TI de ensino superior.** A própria tela do professor contém os conceitos técnicos corretos e completos, exemplos, simulações, sequência de ações, imagens e resultados; nada de notas de apresentação como "diga aos alunos".
2. **Densidade proporcional à oficina:** menos teoria nas missões de construção longa; mais exposição técnica nas missões conceituais curtas. Os 360 minutos totais são um limite de aula, não de duração do desenvolvimento do agente.
3. **GDevelop real:** imagens atuais verificadas da interface, onde clicar, o que digitar, o que deve aparecer, erros comuns, tradução para português e fallback offline; distinguir screenshot real de arte esquemática. Rotas 2D e 3D apenas quando tecnicamente executáveis.
4. **Aluno criador, não copiador:** exemplos e prompts personalizados por gênero, nome e decisões das Missões 01–03; rascunhos por aluno; comprovações reais do jogo no GDevelop, não respostas fornecidas pela IA.
5. **Caminho de menor atrito:** no máximo as ferramentas necessárias em cada missão. A Missão 06 oferecerá **trilhas alternativas**, não obrigações de dominar todas. Flow, Suno, ElevenLabs e Meshy exigem conferência atualizada de acesso, limites, exportação, licença e fallback.
6. **Identidade:** estética original dark fantasy/arcade gótico/Netflix, cards artísticos com entradas animadas, HUD claro, navegabilidade móvel/teclado, modo de movimento reduzido e respeito a performance.

## Ordem rígida de fases

A execução é **M04 → M05 → M06 → M07 → M08 → M09 → M10 → auditoria didática das dez → todas as telas e biblioteca → arte/imagens e polimento → funcionalidades/end-to-end → homologação final**. Manter smoke tests de regressão a cada incremento: eles protegem o sistema, mas não substituem a fase final de auditoria funcional. Se um bug P0 ameaçar perda de dados ou autenticação, corrigi-lo antes de seguir, registrar e então retornar à ordem.

### Missões e critérios de aceite

| Missão | Tempo de oficina | Entrega do aluno | Característica da aula do professor |
|---|---:|---|---|
| 04 — Primeiro Jogável | 50 min | Movimento/interação e limite ou colisão visíveis no Preview | Entradas, comportamentos, colisão, controles 2D/3D; prints testados |
| 05 — A Primeira Regra | 40 min | Condição SE/ENTÃO, estado ou variável e feedback testados | Eventos, condições, ações, variáveis, simulações com casos |
| 06 — Forja de IA | 45 min | **Um** asset adicional original, importado e testado; origem registrada | Rotas opcionais por necessidade: visual, vídeo, som, voz ou 3D; planos B, licenças |
| 07 — Dar Vida ao Universo | 50 min | Início → desafio → condição de conclusão real | Lógica de vitória/derrota, estado, GDevelop |
| 08 — Polimento | 40 min | Uma melhoria de UX comprovada antes/depois | Affordances, feedback, acessibilidade, estabilidade |
| 09 — Playtest Cruzado | 25 min | Teste de colega observado e correção | Teste de usabilidade, defeitos, priorização |
| 10 — O Lançamento | 30 min | Demonstração funcional, projeto salvo e pitch | Apresentação técnica, compartilhamento e avaliação |

### Lista de metas incrementais (próxima `todo` = próxima meta)


#### 04 — Primeiro Jogável — 50 min na aula

**Objetivo:** Controle e limites/colisão em GDevelop, distinguindo rotas 2D/3D

- [ ] **M04-01** — Professor: conceitos essenciais de entrada, comportamento, atualização por frame, colisão e câmera; exemplos 2D/3D, conteúdo autossuficiente. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M04-02** — Tutorial ilustrado real de GDevelop para adicionar controles e limites; botões em português, screenshots verificados e fallback. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M04-03** — Aluno: prática autoral com rascunho, checklist de teste no Preview, personalização por gênero e continuidade do projeto da Missão 03. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M04-04** — Integração aluno/professor, evidência observável sem inventar resultado, status/revisão e testes de regressão do fluxo. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### 05 — A Primeira Regra — 40 min na aula

**Objetivo:** SE/ENTÃO, evento, condição, ação, variável e feedback

- [ ] **M05-01** — Professor: conteúdo técnico de eventos, event loop, condições, ações, variáveis e erros de repetição por frame; simulador de estado. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M05-02** — Tutorial ilustrado GDevelop: criar evento de interação, variável/contador e feedback; versão clique 2D/3D sem exigir cópia de jogo. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M05-03** — Aluno: implementar a regra do próprio jogo, testar antes/depois e registrar evidência verificável e diagnóstico. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M05-04** — Teste professor/aluno, três casos de aceitação da regra, persistência e qualidade visual. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### 06 — Forja de IA — 45 min na aula

**Objetivo:** Criar um asset autoral adicional útil e integrá-lo ao jogo, sem exigir todas as ferramentas

- [ ] **M06-01** — Professor: pipeline de assets, formatos PNG/GLB/WAV/MP4, importação, autoria, licenças e limites de planos gratuitos. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M06-02** — Matriz de escolhas: imagem (Gemini e fallback local), vídeo curto/cutscene (Google Flow quando viável), música (Suno), voz/efeitos (ElevenLabs), 3D (Meshy); verificar limites reais e termos atuais. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M06-03** — Tutoriais segmentados por NECESSIDADE do jogo, com prompts personalizados pelo gênero, botões copiar, exportação/compatibilidade e fallback. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M06-04** — Aluno escolhe somente UMA trilha de criação, importa asset no GDevelop, testa no Preview e registra procedência/licença; não exigir créditos pagos. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M06-05** — Professor/aluno integração, tutoriais comprováveis, contingência offline, teste de importação e de interface mobile. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### 07 — Dar Vida ao Universo — 50 min na aula

**Objetivo:** Conectar início, desafio e condição de vitória/derrota

- [ ] **M07-01** — Professor: fluxo de estados, condições de conclusão, game loop, cena inicial/final e feedback claro. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M07-02** — Tutorial 2D e 3D com demonstração progressiva de GDevelop de início → interação → resultado. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M07-03** — Aluno: criar condição autoral de conclusão e tela/feedback, mantendo a ideia original das Missões 01–02. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M07-04** — Testes de vitória prematura, condição não cumprida, tela final, rascunho e envio. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### 08 — Polimento — 40 min na aula

**Objetivo:** Melhorar clareza, controles e estabilidade

- [ ] **M08-01** — Professor: UX de jogos, affordance, instruções, HUD, contraste, resposta ao input e feedback de erro. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M08-02** — Tutorial do GDevelop para uma melhoria pequena e verificável, com prints e alternativa por gênero. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M08-03** — Aluno: implementar ao menos uma melhoria real de usabilidade, comparando antes/depois no Preview. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M08-04** — Integração da evidência e testes de acessibilidade, desempenho e mobile. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### 09 — Playtest Cruzado — 25 min na aula

**Objetivo:** Teste de colega, observação e correção

- [ ] **M09-01** — Professor: hipóteses, roteiro de teste, observação, defeitos reprodutíveis e prioridade de correção. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M09-02** — Aluno: roteiro rápido sem inventar resultado; colega testa jogo, registra observação e falha/sucesso. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M09-03** — Alunos aplicam uma correção pequena ou justificam backlog; professor acompanha e revisa sem avaliações falsas. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### 10 — O Lançamento — 30 min na aula

**Objetivo:** Salvar, demonstrar e apresentar jogo executável

- [ ] **M10-01** — Professor: distribuição segura, projeto editável, link/Preview, apresentação técnica e breve pitch. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M10-02** — Tutorial GDevelop atualizado sobre salvar projeto, exportar/compartilhar quando disponível, opções e plano B. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M10-03** — Aluno: mini-pitch autoral, demonstração, entrega de evidência/URL ou arquivo acessível, sem obrigar publicação paga. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **M10-04** — Tela de conquista final baseada em aprovações reais, testes dos critérios e preservação do projeto. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### Auditoria conjunta das dez missões

**Objetivo:** Concluir o conjunto de verificações e produtos deste bloco.

- [ ] **AUD-01** — Conferir matriz 01–10: objetivos, duração total de 360 min, conceitos por densidade prática, sequência cumulativa. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **AUD-02** — Comparar literalmente professor/aluno em cada missão; eliminar notas de fala, atividades desencontradas e conceitos sem explicação. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **AUD-03** — Checar TODOS os tutoriais GDevelop: imagens reais versus ilustrações, ordem dos cliques, nomes do editor, links, resultados e fallback. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **AUD-04** — Checar TODAS as ferramentas IA, limites gratuitos, licenças/uso, links e formas de exportar/importar; atualizar somente com fontes verificadas. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **AUD-05** — Executar verificações de páginas e evidências por missão; corrigir defeitos P0/P1 antes de avançar. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### Unificar e reconstruir todas as telas

**Objetivo:** Concluir o conjunto de verificações e produtos deste bloco.

- [ ] **UI-01** — Inventariar todas as telas/rotas reais e dependências: index.html, fase1.html, aluno-v3.html, professor-v3.html, biblioteca.js, galeria e HUD. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **UI-02** — Portal público/cadastro/entrada: integrar identidade RPG, acessibilidade, navegação fluida e coerência com a turma. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **UI-03** — Caderno do aluno: header, jornada/carrossel, mapa de missões, páginas auxiliares e progresso real. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **UI-04** — Caderno do professor: painel de turma e progresso por aluno/missão, filtros, liberação, feedback e revisão. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **UI-05** — Biblioteca de assets: catálogo filtrável por gênero/tipo 2D/3D, arquivos de verdade para baixar, instruções de GDevelop e licença. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **UI-06** — Kits rápidos: starters e downloads efetivos de PNG/GLB/WAV e exemplos de projetos reutilizáveis; conferir conteúdo/validade do arquivo. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **UI-07** — Chat interno e telas de notificação: identidade visual, estado vazio/erro, responsividade, acessibilidade. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **UI-08** — Revisão visual global: todas as páginas desktop/tablet/celular, contraste, foco, teclado, movimento reduzido, carregamento. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### Arte original e experiência inesquecível

**Objetivo:** Concluir o conjunto de verificações e produtos deste bloco.

- [ ] **ART-01** — Definir design system único: paleta gótica, tipografia, texturas, hierarquia, estados e regras de motion. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **ART-02** — Criar imagens originais adicionais para portal, professor, biblioteca e momentos de conquista; usar ferramenta de geração somente se disponível. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **ART-03** — Criar variantes originais para estados de missão e tipos de asset, sem usar franquias ou marcas protegidas. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **ART-04** — Integrar WebP/AVIF otimizados com lazy loading, alternativas leves e respeito a movimento reduzido. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **ART-05** — Polir transições cinematográficas, feedbacks e conquistas baseadas em dados reais; verificar performance e redução de estímulo. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### Testes e correções de funcionalidade

**Objetivo:** Concluir o conjunto de verificações e produtos deste bloco.

- [ ] **FUN-01** — Verificar versão final de hospedagem, GitHub Pages, Vercel e CORS; nunca presumir que raw.githack possui API. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **FUN-02** — Teste de portal/cadastro e sessão autenticada de aluno; rejeição de token inválido e persistência por usuário. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **FUN-03** — Teste de login professor, proteção por PIN, permissões e isolamento de dados. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **FUN-04** — Teste de liberar/bloquear missões e fases, com propagação confiável para aluno sem perder rascunho. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **FUN-05** — Teste real de evidências 01–10, rascunhos, limite, envio, revisão solicitada, edição e aprovação. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **FUN-06** — Teste do acompanhamento/roster por aluno, atividade, status, progresso e atualizações. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **FUN-07** — Teste do chat bidirecional, mensagens não lidas, ordenação, isolação por aluno e erro de rede. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **FUN-08** — Teste de downloads PNG/GLB/WAV/starters, MIME, integridade e importação no GDevelop. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **FUN-09** — Testes E2E com professor e pelo menos três alunos fictícios; 2D/3D, desktop/móvel e falhas de conexão. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **FUN-10** — Auditoria de segurança, acessibilidade, regressões, desempenho, direitos de uso e backup/rollback. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

#### Homologação e entrega

**Objetivo:** Concluir o conjunto de verificações e produtos deste bloco.

- [ ] **REL-01** — Consolidar bugs P0/P1/P2 e corrigir os impeditivos; executar novamente o conjunto completo de testes. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **REL-02** — Produzir guia operacional em português para professor leigo: entrar, liberar, acompanhar, revisar, contingências, sem notas de fala nos materiais de aula. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.
- [ ] **REL-03** — Gerar relatório final com commits, URLs testadas, status da API, recursos que realmente funcionaram, pendências e decisão de publicação sem efetuar merge em main sem aprovação. **Aceite:** mudança verificável, commit no GitHub, teste(s) executado(s), estado persistente atualizado.

## Inventário técnico existente

- `aluno-v3.html`, `professor-v3.html`, `v3/app.js`: cadernos e fluxo de fases.
- `v3/student-mission-three.js`, `v3/teacher-mission-three.js`, `v3/gdevelop-first-run.js`, `v3/asset-studio.js`: piloto de qualidade pedagógica das primeiras três missões.
- `v2/missions.js`, `v3/teacher-content.js`: fonte existente das dez missões e material base; não descartar conteúdo útil.
- `index.html`, `fase1.html`, `biblioteca.js`, `v3/arcade-gallery.js`: portal, arte da missão, catálogo gerador de PNG/GLB/WAV e fluxos auxiliares.
- `chat-api/api/classroom.js`, `chat-api/api/chat.js`: API de sala, liberações, evidências, chat, acompanhamento e revisão.
- `qa/v3-e2e.cjs`, `qa/live-api-smoke.cjs`: pontos de partida para testes Playwright/API; só afirmar execução real quando rodados.
- URL de prévia isolada: `https://raw.githack.com/Dev-Gabriel-exe/pit-game-jam-ia/feature/pit-gamejam-v3-arcade/aluno-v3.html?preview=1` (não conectada à API real).
- O GitHub Pages/Vercel exige verificação do ambiente; `raw.githack` não substitui a produção.

## Formato do relatório de cada rodada

```text
PIT GAME JAM IA — CICLO <data/hora>
Tarefa: <ID> — <meta>
Estado anterior: <todo/in_progress>
Mudança executada: <arquivos + resultado observável>
Commit/branch: <SHA ou motivo exato de impedimento>
Testes: <quais foram efetivamente executados e resultados>
Riscos/pendências: <itens ainda não confirmados>
Estado gravado: <done/in_progress/blocked>
Próxima meta: <ID>
```

## Encerramento

Ao concluir, confirmar **TODOS os IDs como `done` com evidências rastreáveis**. Não parar só porque os cards ficaram bonitos ou porque o código passou em `new Function`. É preciso um teste E2E de turma fictícia, conferência de downloads, tutorial, chat, acompanhamento e liberação. Quando completo, declarar `READY_FOR_FINAL_REVIEW`, entregar relatório de homologação e **aguardar aprovação explícita para merge/publicação**. O agendamento poderá ser pausado/desativado após a conclusão; não continuar alterando o projeto sem necessidade.

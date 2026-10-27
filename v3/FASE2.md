# Fase 2 — Missão 01: O Chamado

Implementação piloto na branch `feature/pit-gamejam-v3-arcade`, em 27/10/2026.

## O que foi implementado

- Interior do **caderno do aluno** reformulado na linguagem gótica aprovada no carrossel: cabeçalho cinematográfico, arte autoral da Missão 01, molduras de RPG, navegação dedicada e layout responsivo.
- O restante do **caderno do aluno** recebeu um shell visual de fantasia gótica (topo, menu, cabeçalho, listagem de capítulos, botões, rodapé).
- Navegação interativa pelo **Briefing → Construir → Entregar**, com transição já existente do card para o conteúdo.
- **Briefing** contextualiza a criação e apresenta o desafio, sem teoria escolar extensa.
- **Construir** tem três fragmentos com campos reais: gênero, título, protagonista, ação do jogador, objetivo, condição de conclusão e feedback da conquista.
- Ficha de jogo com prévia **ao vivo** (atualiza enquanto o aluno escreve); texto de ação e objetivo atualizado, sem texto gerado por IA.
- Os campos são salvos automaticamente no navegador, com armazenamento individualizado pela ID do aluno; a prévia sem cadastro usa armazenamento isolado.
- **Entregar** produz uma evidência concisa e estruturada (no máximo 750 caracteres), enviada pela **API já existente**. Não se alterou banco de dados nem API do professor.
- Estados reais de `submitted`, `revision` e `approved`: revisão orienta o aluno, envio aguarda validação, medalha somente aparece como conquista real após aprovação.
- Recuperação da ficha a partir do texto persistido no servidor, quando o aluno abre a entrega em outro navegador ou após aprovação.
- A prévia `?preview=1` permite testar o fluxo completo visualmente sem login e **não envia dados** ao servidor; simulação é claramente identificada.
- As dez miniaturas da jornada lateral agora usam as dez artes WebP originais aprovadas.
- Movimento reduzido respeita a preferência do sistema; formulários têm labels e foco visível.

## Arquivos alterados

- Novo `v3/mission-one.js`: lógica da Missão 01.
- Novo `v3/mission-interior.css`: identidade gótica e telas da missão.
- `v3/app.js`: faz a integração com navegação, login, evidência real e progresso, preservando as outras missões e o professor.
- `aluno-v3.html`: carrega o CSS e o JS da Fase 2.
- `v3/ROADMAP-V3.md` e este documento: registro das decisões.

## Testes executados

Verificações automatizadas estáticas executadas durante a implementação:
- Sintaxe do JavaScript da Missão 01, app e galeria.
- Geração de todas as três telas e seus elementos obrigatórios.
- Formulário vazio inválido, dados completos válidos e três fragmentos cumpridos.
- Isolamento de rascunhos por aluno.
- Evidência compatível com limite de 750 caracteres da API.
- Escaping de strings para evitar injeção de HTML por campo do aluno.
- Restauração da evidência persistida e prevalência da entrega aprovada sobre o rascunho local.
- Preservação das edições locais após solicitação de revisão.
- Bloqueio visual de envio após aprovação ou envio.
- Fluxo de prévia sem chamadas à API real.

## Ainda pendente (não declarar homologada)

- **Teste visual em navegador real** desktop, celular e laboratório.
- **Teste ponta a ponta com API** em domínio autorizado e turma fictícia: criar conta, editar, enviar, solicitar revisão, reenviar e aprovar.
- Confirmar se o texto da evidência gerado é adequado à visualização de avaliações do professor.
- Testar navegação por teclado, foco, uso offline e desempenho em máquinas do laboratório.
- Ajustar detalhes estéticos depois da avaliação do responsável.
- As missões 02–10 ainda usam seu conteúdo interno anterior; expansão planejada na Fase 3.
- O caderno do professor receberá reformulação visual/pedagógica própria na Fase 4.

**Nota:** o rascunho antes de ser enviado é armazenado localmente no navegador utilizado. A versão enviada é persistida no servidor existente.

## Link de prévia

`https://raw.githack.com/Dev-Gabriel-exe/pit-game-jam-ia/feature/pit-gamejam-v3-arcade/aluno-v3.html?preview=1`

Fluxo: selecionar o card 01 → clicar "Entrar" → ver Briefing → Construir → Entregar → simular entrega sem API.

## Correção de navegação móvel — 27/10/2026

- Corrigido o posicionamento ao alternar Briefing → Construir → Entregar, voltar uma etapa, usar as abas internas e entrar pelo card do carrossel.
- Causa: no computador o conteúdo rola em `#mainContent`, mas em celular (até 700 px) quem rola é a página. Ajustar apenas `mainContent.scrollTop=0` não mudava o ponto de leitura na tela.
- Implementado `scrollMissionToStart()`: reposiciona o conteúdo interno e, no celular, alinha o topo de `#mainPane` à janela respeitando a altura da navegação fixa.
- Testes unitários de comportamento da função: mobile com navegação fixa/normal, desktop e professor, além de verificação dos pontos de chamada; **12/12 aprovados**.
- **Ainda pendente:** confirmar visualmente a rolagem em Chrome/Android e Safari/iOS reais.

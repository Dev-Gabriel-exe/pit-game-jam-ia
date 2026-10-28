# Missão 05 — A Primeira Regra · implantação progressiva

**Branch:** `feature/pit-gamejam-v3-arcade`  
**Duração da aula:** 40 minutos: 8 conceitos, 5 demonstração, 24 prática, 3 resultados.  
**Situação:** M05-01 concluída e registrada no checkpoint do agente. As próximas M05-02, M05-03 e M05-04 ainda não foram homologadas.

## M05-01 — Professor: fundamentos + simulação

Arquivos:
- `v3/teacher-mission-five-foundations.js`: conteúdo acadêmico próprio da Missão 05, quatro blocos técnicos e simulador com estados.
- `v3/teacher-mission-five-foundations.css`: estética gótica, responsividade e preferência por movimento reduzido.
- `professor-v3.html`, `v3/app.js`: módulo aparece **somente na fase briefing da Missão 05**.
- `qa/v3-m05-foundations.cjs`: regressão local repetível, `node qa/v3-m05-foundations.cjs`.

### Recorte de oito minutos
- **2 min:** conceito de evento condicional, ações e memória/escopo das variáveis.
- **3 min:** simulador da colisão, erro de pontuação repetida por quadro, e correção por consumo do item.
- **3 min:** diferenças de uma regra aplicável a RPG, plataforma, puzzle/narrativa e terror/3D, mantendo a ideia autoral.

Os quatro cartões técnicos são material de consulta para o professor. Não é necessário ministrar cada texto integralmente durante os oito minutos.

### O que a simulação demonstra
- `SE colidir com Cristal → Score +1` **sem proteção** acumula pontos a cada quadro, enquanto a colisão continua verdadeira.
- `SE colidir com Cristal E Cristal existir → Score +1; remover Cristal` coleta uma vez por instância, mesmo com contato prolongado.
- `TemChave=0` mantém a porta fechada; `TemChave=1` permite abri-la.
- O simulador possui reinício, registro de eventos e escolhas de gênero, **sem ler dados dos alunos, sem enviar requisições nem marcar entregas automaticamente**.
- O recurso é uma analogia didática, não um editor ou Preview real do GDevelop. O tutorial com capturas oficiais do editor foi incorporado à **M05-02**; ainda falta ensaio no editor real.

### Testes
- 34 verificações estáticas e lógicas foram executadas durante o desenvolvimento.
- A regressão versionada `qa/v3-m05-foundations.cjs` foi executada sobre o código atual obtido do GitHub em runtime JavaScript com módulos de Node simulados: **12/12 verificações passaram**. No checkout local, execute-a com Node para confirmar em ambiente convencional.
- Ainda faltam inspeção visual no navegador, teste do editor GDevelop, autenticação real e revisão da turma.

### Fontes técnicas conferidas
- [Events editor](https://wiki.gdevelop.io/gdevelop5/interface/events-editor/)
- [Event loop e Trigger once](https://wiki.gdevelop.io/gdevelop5/tutorials/how-to-debug-poor-performance/)
- [Tipos de variável e pontuação](https://wiki.gdevelop.io/gdevelop5/tutorials/platform-game/5-add-coins-and-number-of-collected-coins/)

**A meta M05-02 está concluída no código.** A próxima meta é `M05-03`, oficina autoral do aluno.

## M05-02 — Tutorial ilustrado de eventos — CONCLUÍDO NA BRANCH

O rascunho esquemático inicial foi substituído pelo módulo `v3/gdevelop-mission-five-guide.js`, com estilos `v3/gdevelop-mission-five-guide.css`. As capturas foram extraídas das URLs publicadas na documentação oficial do GDevelop e possuem identificação e link de atribuição na interface; **não** foram capturadas de uma execução da engine nos computadores da turma.

**Fluxo da demonstração (5 minutos, 1 minuto por tela):**
1. Abrir a aba **Events** do mesmo projeto criado nas Missões 03 e 04.
2. Criar **Add event**, com áreas Add condition e Add action.
3. Definir uma **condição** observável.
4. Alterar uma **variável de cena** e executar uma ação.
5. Fornecer **feedback visual**, executar Preview e testar o caso verdadeiro e falso.

**Apenas uma rota por aluno:** (a) RPG/plataforma 2D: coletar um cristal e aumentar `Score` uma vez; (b) puzzle/narrativa: clicar em uma resposta válida, marcar `Acertou` e atualizar texto; (c) terror/3D: porta física condicionada a `TemChave=1` e `PortaAberta=0`. O guia identifica explicitamente que screenshots de ações/variáveis vêm de projetos-exemplo 2D mesmo quando a rota selecionada é 3D. Eventos de colisão 3D usam Physics 3D, e a condição comum de distância considera X/Y, não Z.

**Pedagogia e usabilidade:** três abas acessíveis ao teclado com ARIA, telas Próxima/Anterior, rótulos exatos de onde clicar, resultado esperado, diagnóstico e caso negativo. Fotos externas têm fallback para `v3/assets/guide/gdevelop-eventos-pt.svg`, marcado como **diagrama autoral** e nunca como captura literal. A apresentação continua com seu briefing técnico M05-01 (8 min) e as fases práticas/resultados existentes; módulos 01–04 não foram alterados.

**Verificações nesta rodada:** 38/38 checagens sintáticas, de conteúdo, integração e interações simuladas; o arquivo de regressão persistente `qa/v3-m05-guide.cjs` executou **25/25 asserções** num runtime JavaScript com módulos Node simulados. A execução local em Node, o navegador real, a renderização efetiva de cada imagem, o editor GDevelop e o fluxo com API/Neon **ainda precisam de ensaio separado**. Links oficiais foram verificados como referências na documentação; isso não comprova que a interface esteja idêntica em todas as versões.

**Próxima meta M05-03:** o aluno implementa uma regra original no jogo que já estava criando, faz um teste positivo e um negativo, registra feedback e diagnóstico, e mantém a evidência por sessão sem recorrer a respostas prontas.

## M05-03 — Caderno do aluno — IMPLEMENTADO

**Arquivos:** `v3/student-mission-five.js`, `v3/student-mission-five.css`, inclusão do tutorial `v3/gdevelop-mission-five-guide.js` e CSS, integração em `aluno-v3.html` e `v3/app.js`. A oficina prática preserva o briefing existente do professor e não altera as Missões 01–04.

### Jornada do aluno

- **Briefing:** reaproveita título e gênero da Missão 01, mecânica da 02, projeto/cena/objeto da 03 e comando/limite testados na 04. Não cria um novo projeto.
- **Prática:** 24 minutos (8 condição+evento, 8 variável+feedback, 8 casos de teste+salvar). Mostra o tutorial oficial da Missão 05 com uma única rota sugerida: coleta/pontuação, clique/narrativa ou porta 3D. A escolha pode mudar, com rascunho preservado e placeholders adaptados ao caminho.
- **Prova de autoria:** campo de condição SE, ação ENTÃO, variável de estado, resultados observados em testes positivo e negativo, feedback no Preview e destino do projeto editável; diagnóstico opcional. Confirma separadamente teste positivo, negativo e repetição.
- **Revisão:** monta evidência textual estruturada (máximo 750 caracteres) e permite envio apenas quando liberado pelo professor, obedecendo a API existente. Estados enviado/aprovado bloqueiam edição; revisão solicitada preserva novas correções locais. O status de aprovação não é criado localmente.
- **Segurança:** `?preview=1` simula a entrega e não usa o backend. Campos escapam HTML de respostas; rascunhos são armazenados por ID de aluno no navegador. O caderno não tem como verificar uma execução real do GDevelop: os três checkboxes registram declaração e podem ser auditados pelo professor.

### Evidências dos testes de desenvolvimento

- **48/48** verificações de sintaxe, CSS, estrutura de três fases, personalização, restauração de campos, limite de API, preservação dos materiais anteriores e submissão.
- **19/19** cenários simulados de interface: seleção de rota, ajuda 3D dinâmica, troca de placeholders, salvamento de respostas, preview textual, validação, bloqueio de revisão incompleta e navegação prática/revisão.
- **33/33** asserções executadas com `qa/v3-m05-student.cjs` sobre código real recuperado do GitHub e módulos Node simulados. Com o repositório local, executar `node qa/v3-m05-student.cjs` para repetir os testes no Node. Evidência com todos os campos no tamanho máximo: **728 caracteres**, sem corte silencioso.
- **Não realizados:** QA visual em navegador, integração com banco Neon real, autenticação e submissão de turma real/fictícia, execução de todas as rotas no editor GDevelop. Esses itens permanecem pendentes para M05-04 e homologação final.

### Próxima meta

**M05-04 — Auditoria de alinhamento:** comparar professor/aluno, critérios da regra, proteção contra duplicação, três testes de aceitação, persistência e revisão. Não declarar a oficina homologada sem ensaios reais.

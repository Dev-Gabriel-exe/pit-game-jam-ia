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
- O recurso é uma analogia didática, não um editor ou Preview real do GDevelop. O tutorial com prints reais do editor será construído na **M05-02**.

### Testes
- 34 verificações estáticas e lógicas foram executadas durante o desenvolvimento.
- A regressão versionada `qa/v3-m05-foundations.cjs` foi executada sobre o código atual obtido do GitHub em runtime JavaScript com módulos de Node simulados: **12/12 verificações passaram**. No checkout local, execute-a com Node para confirmar em ambiente convencional.
- Ainda faltam inspeção visual no navegador, teste do editor GDevelop, autenticação real e revisão da turma.

### Fontes técnicas conferidas
- [Events editor](https://wiki.gdevelop.io/gdevelop5/interface/events-editor/)
- [Event loop e Trigger once](https://wiki.gdevelop.io/gdevelop5/tutorials/how-to-debug-poor-performance/)
- [Tipos de variável e pontuação](https://wiki.gdevelop.io/gdevelop5/tutorials/platform-game/5-add-coins-and-number-of-collected-coins/)

**Próxima meta do agente:** `M05-02`, tutorial ilustrado de Events no GDevelop com condição, ação, variável e feedback, incluindo alternativas para jogos 2D e 3D.

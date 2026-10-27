# PIT Game Jam IA — Fase 2.5 / Caderno do Professor

**Atualização:** 27/10/2026  
**Branch:** `feature/pit-gamejam-v3-arcade`

## Perfil e princípio didático

Público: estudantes de ensino superior na área de TI/desenvolvimento. O professor pode não ter experiência prévia com jogos ou com o GDevelop.

O Caderno do Professor deve ser **material de aprendizagem completo e projetável**, não um documento com notas de fala, dicas de condução ou slides telegráficos. A própria tela contém definições suficientes, exemplos ligados ao software e compreensão do que o aluno realmente produzirá. O aluno não deve apenas preencher formulários; cada prática verifica o que acabou de aprender.

O projeto possui seis horas e dez missões. A proporção entre conceitos e oficina depende da complexidade da prática: quando a atividade é rápida, a explicação pode ser mais longa; quando há implementação técnica, reservar a maior parte para construir, testar e corrigir.

## Distribuição temporal padrão

| Missão | Conceitos | Exemplo funcional | Oficina | Resultados | Total |
|---|---:|---:|---:|---:|---:|
| 01 O Chamado | 9 | 4 | 6 | 1 | 20 |
| 02 MVP em Foco | 9 | 5 | 14 | 2 | 30 |
| 03 Ligar o Motor | 7 | 5 | 16 | 2 | 30 |
| 04 Primeiro Jogável | 6 | 5 | 36 | 3 | 50 |
| 05 A Primeira Regra | 8 | 5 | 24 | 3 | 40 |
| 06 Forja de IA | 5 | 5 | 32 | 3 | 45 |
| 07 Dar Vida ao Universo | 5 | 6 | 36 | 3 | 50 |
| 08 Polimento | 5 | 4 | 28 | 3 | 40 |
| 09 Playtest Cruzado | 3 | 3 | 16 | 3 | 25 |
| 10 O Lançamento | 4 | 3 | 18 | 5 | 30 |
| **TOTAL** | **61** | **45** | **226** | **28** | **360** |

Os minutos são **pesos didáticos**, não um cronômetro obrigatório ou falas de professor. As abas do professor exibem o tempo de cada parte.

## Missão 01 — aula completa já implementada

Novo módulo `v3/teacher-mission-one.js`, estilizado pelo novo `v3/professor-gothic.css` e conectado ao `v3/app.js` / `professor-v3.html`.

### 1. Conceitos — 9 minutos
- O que define um jogo: interatividade, regra, ação e consequência;
- Game design versus implementação: o design decide a regra e o desenvolvimento a transforma em software;
- Mecânica, dinâmica e experiência no sentido do modelo MDA: não confundir uma regra com o comportamento que ela provoca no jogador;
- Core gameplay loop: desafio → ação → feedback → próxima decisão. Distinguir do laço técnico de atualização da engine;
- Objetivo, condição de vitória e feedback, com exemplo de um castelo, coleta de cristais e saída.

Cada tópico oferece definição, exemplo de jogo e interpretação técnica apropriada para estudantes de TI.

### 2. Exemplo em ação — 4 minutos
Simulador interativo local, com três ações e estado observável:
1. Coletar cristal: o contador aumenta até 3;
2. Tentar a porta: antes de 3 permanece fechada;
3. Com 3, a porta é liberada e abre após interação;
4. Reiniciar: volta ao estado inicial.

Exibe pseudocódigo de condições/ações, ciclo desafio/ação/feedback/decisão, exemplos de quatro gêneros e mapeamento `Scene`/`Objects`/`Events`/`Preview` para o GDevelop. **O simulador é um modelo didático, não o GDevelop real.**

### 3. Oficina — 6 minutos
Uma ficha completa de exemplo, alinhada aos **mesmos sete campos do aluno**: gênero, título, protagonista, ação, objetivo, condição de conclusão e feedback. Três fragmentos correspondem às telas do Caderno do Aluno. Não é necessário abrir GDevelop nesta missão: é planejamento autoral.

### 4. Resultados — 1 minuto
Critérios de avaliação concretos: identidade, interação e conclusão. Contraste entre exemplo verificável e descrição imprecisa; conclusão baseada em aprovação persistida pelo professor, nunca em XP inventado.

## Identidade visual e integração

- O Caderno do Professor usa a mesma estética gótica original de toda a V3, sem copiar as telas do aluno.
- Dez imagens da jornada no painel lateral e nas opções de seleção de missão.
- Conteúdo mais largo e legível, incluindo mobile.
- Mantida a API e os controles já existentes para autenticação, liberação real, chat, aprovação e acompanhamento.
- Criada **prévia sem autenticação para o professor** com `?preview=1`. Este modo não lê dados reais, não autentica professor, não manipula turma e identifica explicitamente simulações. A URL definitiva precisará de testes com PIN e API habilitada.
- Escopo do módulo rico novo: **Missão 01**. As demais nove continuam exibindo o material de professor anterior e agora mostram sua divisão de tempo. Ainda deverão passar pela revisão de profundidade e execução prática das fases seguintes.

## Verificações automatizadas

25 verificações unitárias/estáticas realizadas durante esta implementação:
- todos os quatro painéis são renderizados;
- soma de tempos por missão confere com o catálogo de 360 minutos;
- peso conceitual maior na Missão 01 e peso de prática maior na Missão 04;
- conceitos de game design, game loop, mecânica e dinâmica incluídos;
- ausência de roteiros ou notas de fala;
- campos do professor sincronizados com os do aluno;
- critérios de verificação objetivos;
- professor e aluno com arquivos e estilos separados;
- modo prévia bloqueia operações com API e não altera turma;
- JS válido e CSS balanceado;
- funcionamento do simulador: porta trancada, coleta 2/3, liberação 3/3, conclusão e reinício.

**Pendente:** inspeção em navegador real, teste de usabilidade/projeção e autenticação/envio com uma turma de teste em domínio autorizado.

## Próximas prioridades

1. Homologar visual e didaticamente a Missão 01 do professor.
2. Criar as missões 02–10 **simultaneamente para professor e aluno**: conceitos essenciais com precisão técnica + tutorial completo do GDevelop + construção verificável + evidência com feedback real.
3. Na execução de GDevelop, incluir passos concretos que funcionem na versão atual do editor, imagens ou simuladores interativos e contingências quando exemplos/recursos não carregarem.
4. Ensaiar o curso inteiro, inclusive suas conexões e procedimentos de backup.

## Referências técnicas para conferência

- [GDevelop — conceitos essenciais](https://wiki.gdevelop.io/gdevelop5/tutorials/basic-game-making-concepts/)
- [GDevelop — interface do editor](https://wiki.gdevelop.io/gdevelop5/interface/)
- [GDevelop — editor de eventos](https://wiki.gdevelop.io/gdevelop5/interface/events-editor/)
- [Unity — Core game loop](https://unity.com/blog/find-your-core-game-loop)
- [Hunicke, LeBlanc & Zubek — MDA](https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/)

## Revisão universitária / edição 2 — 27/10/2026

### Feedback incorporado

A primeira edição recebeu críticas por conteúdo pouco técnico, passagens parecidas com notas de professor e apresentações estáticas. A edição 2 **substitui a implementação ativa da Missão 01** por um módulo novo com conteúdo acadêmico verificável e animação.

### Entregue

- **Novo módulo ativo:** `v3/teacher-mission-one-pro.js`. O arquivo anterior `teacher-mission-one.js` fica preservado como versão histórica, sem carregamento na página atual.
- **Nova folha visual:** `v3/teacher-depth.css`, carregada após `professor-gothic.css`. A identidade gótica permanece, mas os cards têm entrada progressiva por `IntersectionObserver`, atraso escalonado, iluminação, hover e transição entre painéis. Na ausência do observador ou com movimento reduzido, o conteúdo fica visível normalmente.
- **Conceitos:** modelagem `S(t+1) = T(S(t), ação)`, distinção entre requisitos e implementação, modelo MDA de Hunicke/LeBlanc/Zubek, loop de gameplay versus loop técnico da engine, variáveis de estado, condições booleanas, feedback e mapeamento para Scene/Objects/Behaviors/Events/Variables/Preview do GDevelop.
- **Comparação interativa:** RPG, Puzzle e Terror; texto de ações, condições, feedback e pseudocódigo se altera a cada seleção.
- **Laboratório com execução:** coletar cristal, tentar porta e reiniciar; depurador didático com regra atual destacada, log de eventos, barra do contador, representação da máquina de estados e cenários A/B/C de caixa-preta.
- **Oficina:** ficha de game design com sete campos sincronizados com o caderno do aluno, explicação técnica dos dados e critérios de aceitação do exemplo.
- **Resultados:** três critérios observáveis e contraste entre descrição vaga e requisito verificável.
- **Missões 02–10:** receberam animação escalonada também nos cards anteriores, sem alteração ainda do conteúdo pedagógico; aprofundamento planejado para Fase 3.
- **Preservado:** autenticação, APIs, dados da turma, liberação das fases, chat, avaliação e formulários do aluno.

### Verificações realizadas

- 24 verificações de estrutura, conteúdo, integração, acessibilidade, tempo, sintaxe e segurança da prévia.
- 12 verificações de interação: entrada dos cards, alteração entre gêneros, coleta, bloqueio de porta, abertura com três cristais, reinício, rastro limitado e testes A/B/C.
- **Não equivale a teste visual em navegador.** Permanecem pendentes inspeção em Chrome/Android e desktop, projeção em sala e teste com usuário real.

### Fontes conceituais

- Hunicke, LeBlanc e Zubek (2004). *MDA: A Formal Approach to Game Design and Game Research*. AAAI.
- GDevelop Documentation. *Basic game making concepts*; *Events editor*; *Objects*.

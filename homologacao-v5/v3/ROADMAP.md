# PIT Game Jam IA — Roadmap V3
**Data-base:** 27/10/2026  
**Branch de trabalho:** `feature/pit-gamejam-v3-arcade`  
**Prazo pedagógico:** oficina prevista para a semana de 02 a 08/11/2026.  
**Identidade:** dark fantasy / RPG cinematográfico, com artes originais e referência de ambientação mágica; visual consistente nas telas de aluno e professor.

## Regras para todas as fases

1. O projeto possui dois ambientes conectados: aluno (jornada, criação, evidências) e professor (conteúdo completo, exemplos e acompanhamento da turma).
2. As duas experiências são criadas e verificadas **em conjunto, missão por missão**, a partir de uma única especificação pedagógica; nenhuma pergunta de evidência pode estar desconectada da prática.
3. Material do aluno: instruções executáveis, exemplos de resultado, recursos e comprovantes reais. Não adicionar blocos de teoria ou respostas prontas.
4. Material do professor: explicações desenvolvidas e visuais demonstrativos, animações e exemplos interativos; **não** utilizar notas de fala, scripts "diga ao aluno" ou condução artificial.
5. Toda missão precisa indicar: objetivo, pré-requisitos, local/ferramenta em que trabalhar, ações passo a passo, teste no Preview, o que entregar, critério observável de aprovação e plano B gratuito.
6. Preservar autenticação, API, chat, acompanhamento, progresso e liberação existentes até que testes mostrem a necessidade de mudanças. Não usar progresso fictício fora do modo demonstração.
7. Acessibilidade e uso em projetor e computador de laboratório; animações leves e `prefers-reduced-motion`, evitando custos de vídeo e assinaturas.

## Fase 1 — Seleção cinematográfica [VISUAL APROVADO]

**Entregas:** portal para aluno, carrossel de dez missões, WebPs originais, estados visuais, transição de capítulo, navegação, prévia sem cadastro.

**Status:** estética aprovada pelo responsável; integração básica no GitHub realizada. **Testes de ponta a ponta com API real não concluídos** — integrar à Fase 6.

## Fase 2 — Missão modelo completa [PRÓXIMA]

**Objetivo:** finalizar a experiência da **Missão 01 — O Chamado**, da escolha no carrossel até a devolutiva do professor.

**Tela do aluno:** entrada cinematográfica -> briefing curto -> atividade de conceber o jogo -> registro prático da proposta (nome, gênero, ação do jogador, condição de conclusão) -> envio para avaliação -> retorno, preservando o rascunho e o caminho de volta ao carrossel.

**Tela do professor:** título e objetivos -> conteúdo explicativo desenvolvido sobre interação, game loop e escopo inicial -> animação/simulador ação→regra→resposta -> exemplo de ideia ampla versus MVP -> visualização e avaliação das propostas dos estudantes. Não adicionar notas de condução.

**Estética:** estender o gótico da seleção para as telas internas por meio de molduras, hierarquia tipográfica, indicadores de etapa e transições discretas, sem atrapalhar a leitura.

**Critérios de aceite:** um aluno novo consegue realizar a missão só com o caderno; professor encontra toda a explicação necessária; evidência é resultado da atividade (não de uma pergunta desconexa); a missão é acessível no celular, no desktop e em projetor; estado salvo; feedback e retorno coerentes.

**Regra de progressão:** não começar a produção em massa das nove missões até revisar a experiência completa da Missão 01.

## Fase 3 — Conteúdo e práticas das dez missões [POR PARES]

Cada missão tem uma ficha única com objetivo, duração, resultado observável, 2D/3D quando aplicável, recursos grátis, prática, comprovação, critério de avaliação, demonstração e conceito do professor. Produzir os dois ambientes simultaneamente.

| Nº | Missão | Min | Evidência principal |
|---|---|---:|---|
| 01 | O Chamado | 20 | Nome, gênero, objetivo e ação do jogador |
| 02 | MVP em Foco | 30 | Recorte viável: cenário, mecânica, condição final |
| 03 | Ligar o Motor | 30 | GDevelop: projeto criado, cena e Preview |
| 04 | Primeiro Jogável | 50 | Movimento e obstáculo funcionais |
| 05 | A Primeira Regra | 40 | Condição + ação testadas em dois estados |
| 06 | Forja de IA | 45 | Asset gerado/obtido e importado/testado |
| 07 | Dar Vida ao Universo | 50 | Início, desafio e conclusão funcionando |
| 08 | Polimento | 40 | Instruções claras e melhoria de feedback |
| 09 | Playtest Cruzado | 25 | Teste de colega, observação e ajuste |
| 10 | O Lançamento | 30 | Projeto salvo ou publicado + demonstração e pitch |

**Risco de cronograma:** o plano atual soma **360 minutos exatos**, sem reserva para atrasos ou intervalo. Na revisão, criar uma margem operacional de 15 a 30 minutos (ou definir intervalo adicional fora das 6 horas) sem retirar o ciclo completo de criação, teste e apresentação.

**Critério de aceite:** cada missão possui exercício prático real, evidência específica e demonstração correspondente no professor. Testar o percurso completo de 2D e pelo menos um exemplo inicial 3D, com alternativa simples gratuita.

## Fase 4 — Sala e funcionalidades reais [HOMOLOGAÇÃO E CORREÇÕES]

- Validar o fluxo portal → identificação/código de turma → seleção → missão.
- Confirmar liberação por professor por missão/fase, bloqueio no front e validação no servidor.
- Exibir no professor qual missão e etapa cada aluno está fazendo, entregas pendentes, aprovações, revisões e pedidos de ajuda.
- Testar persistência de trabalhos, feedback por aluno, chat e atualização automática sem perda de rascunho.
- Ajustar cadastro e monitoramento apenas se o fluxo real exigir; não redesenhar API sem evidência.
- Prever modo demonstração isolado de dados reais.

**Critério de aceite:** com duas sessões distintas (aluno e professor), uma liberação, uma entrega, uma revisão e uma aprovação atualizam os painéis corretamente. Nenhuma missão bloqueada é enviada pela API.

## Fase 5 — Gamificação real e polimento visual [SEM COMPROMETER O P0]

- Aplicar o tema gótico ao restante do caderno do aluno e ao ambiente do professor, priorizando leitura e projeção.
- Estados reais: bloqueada, disponível, em criação, enviada, em revisão, aprovada.
- Conquistas e estrelas com critério explícito, nunca atribuídas só por clicar ou navegar.
- Movimento suave, hover, transições e efeitos de recompensa; áudio opcional com controle mudo; não depender de Google Flow.
- Visual de progressão fiel às aprovações. Não criar pontos falsos ou rankings inventados.
- Consistência entre desktop e mobile, inclusive carrossel e telas internas.

**Critério de aceite:** identidade visual contínua, ausência de confusão visual, progresso fiel à API e opção de reduzir movimento. Google Flow/vídeos são extras, não bloqueiam o lançamento.

## Fase 6 — Ensaio geral e prontidão de oficina [OBRIGATÓRIA]

- Testar com navegador real desktop e celular, projetor e conexão semelhante à da sala.
- Simular professor e dois alunos: cadastro, liberação, troca de missão, prática, evidência, revisão e aprovação.
- Verificar persistência após atualizar a página, fechamento de modal, queda/reconexão, teclado/touch e estados de erro.
- Ensaiar fluxo de 6 horas, detectar missão longa, texto difícil ou instrução sem indicação clara da ferramenta.
- Preparar kit de contingência com assets locais/alternativos, starters 2D e 3D, instruções de recuperação e forma de entrega se a publicação falhar.
- Congelar versão de oficina; preservar branch V3, não publicar na `main` sem testes.

**Critério de aceite:** a oficina funciona do primeiro acesso à apresentação final sem operações manuais de bastidor; os dois ambientes permanecem coerentes e os principais erros têm alternativa.

## Priorização por prazo

**P0 — indispensável antes da oficina:** Fase 2, núcleo das 10 práticas e explicações em pares (Fase 3), liberações/entregas e acompanhamento (Fase 4), ensaio e contingências (Fase 6).

**P1 — melhora a experiência:** acabamento gótico das telas internas, microinterações e recompensas fundamentadas (Fase 5).

**P2 — pós-oficina, se faltar tempo:** vinhetas em vídeo pelo Google Flow, trilha sonora elaborada, rankings públicos, efeitos gráficos pesados, sistemas complexos de XP.

**Próxima tarefa concreta:** produzir uma Missão 01 completa em duas telas sincronizadas, inspecionar no navegador e só então consolidar o padrão das demais.

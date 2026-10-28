# PIT Game Jam IA V3 — ROADMAP V4 · Pedagogia primeiro, encantamento depois

**Data:** 28/10/2026 · **Janela-alvo de revisão:** 21h–22h, America/Fortaleza. **Natureza:** plano de trabalho incremental, não certificado de conclusão. **Branch:** `feature/pit-gamejam-v3-arcade`. Não alterar `main` nem dados de alunos sem autorização específica; preservar o deploy existente. O roadmap V3 de 54/59 permanece independente, sem marcar itens antigos como concluídos.

## Critério central

O professor chega **sem estudar antes**, não conhece GDevelop e não tem tempo para preparar a aula. O material projetado deve ensinar o conteúdo e guiar a prática por si só, **sem notas de fala visíveis durante a projeção**. O aluno deve encontrar na própria tela: **o que fazer, por que fazer, onde clicar, como executar, como verificar e o que entregar**. Não presumir familiaridade com ferramentas. Sem gabarito no caderno do aluno. Evitar poluição textual: usar progressão visual, exemplos curtos, capturas reais verificadas, demonstrações e blocos expansíveis quando necessário.

## Regra de projeção e roteiro privado (correção do responsável, 28/10/2026)

A apresentação do professor permanece espelhada por HDMI para os alunos durante a explicação. **Não colocar roteiro de condução ou instruções reservadas visíveis no material projetado.** Conceitos, analogias, exemplos, simulações, tutoriais didáticos e critérios de avaliação continuam visíveis, pois são parte da aula. O professor pode consultar orientações de acompanhamento **somente depois de retirar o espelhamento**: usar ícone de papel ▤ pequeno e discreto em `<details class="pit-private-teacher-notes">` fechado por padrão, com `<summary>` acessível por teclado e estilo `v3/teacher-private-notes.css`. Não abrir automaticamente, não criar notas privadas no caderno do aluno e fechar antes de retomar a projeção. O recolhimento visual não protege o texto contra inspeção ou compartilhamento; não inserir segredos ou dados pessoais. 

## Fase P0 — Inventário e auditoria (prioridade máxima)

- [ ] **P0-01** Mapear as 10 missões, em ambos os perfis: arquivos JS/CSS, telas/rotas, conteúdo, objetivos, tempo, pré-requisitos, atividades, evidências, ferramentas e links. Gerar `v3/AUDITORIA-V4-MISSOES.md` com matriz de 20 faces (M01–M10 × professor/aluno).
- [ ] **P0-02** Revisar coerência entre os dois materiais, tempos totais (360 min), vocabulário, progressão, dependências, caminhos de navegação e critérios de aprovação. Distinguir falha real de sugestão.
- [ ] **P0-03** Auditar links externos, imagens e vídeos existentes, licenças, alternativas gratuitas e estados de erro/offline. Não chamar captura esquemática de screenshot real.

## Fase P1 — Professor pronto para ensinar, sem preparação prévia

**Para cada missão M01→M10, em ordem, só avançar depois de auditar as duas faces.**

- [ ] **P1-01 M01** Contexto, termos, analogias, objetivo visível, demonstração reproduzível, resultado esperado, solução de dificuldades.
- [ ] **P1-02 M02** Mesmo padrão, com conexão explícita à missão anterior.
- [ ] **P1-03 M03** Mesmo padrão, incluindo recursos e ferramentas.
- [ ] **P1-04 M04** Mesmo padrão, incluindo sequência operacional GDevelop.
- [ ] **P1-05 M05** Mesmo padrão, incluindo construção, prévia e depuração.
- [ ] **P1-06 M06** Mesmo padrão, incluindo geração/importação de assets e limites de cada formato.
- [ ] **P1-07 M07** Mesmo padrão, incluindo eventos, regras e teste observável.
- [ ] **P1-08 M08** Mesmo padrão, incluindo iteração e comparação antes/depois.
- [ ] **P1-09 M09** Mesmo padrão, incluindo revisão, feedback e melhoria.
- [ ] **P1-10 M10** Mesmo padrão, incluindo apresentação, evidências e encerramento.

**Aceite por missão — professor:** conceitos definidos na própria tela; analogia e exemplo concreto; tutorial passo a passo com indicação de onde clicar e resultado esperado; erros comuns e recuperação; tempos e transição para a prática; avaliação clara; sem anotações privadas de fala, sem exigir pesquisa ou preparo anterior.

## Fase P2 — Aluno autônomo e entrega verificável

- [ ] **P2-01–10** Revisar M01–M10 individualmente com roteiro em 6 passos: **objetivo → ferramenta/local → ação numerada → exemplo mínimo → como testar → evidência a enviar**. Dizer exatamente o que preencher e onde, com instruções que não dependam de fala do professor. Oferecer caminho alternativo gratuito se ferramenta externa falhar.
- [ ] **P2-11** Conferir sincronização professor/aluno e critérios de aprovação sem revelar gabaritos.
- [ ] **P2-12** Executar testes automáticos de navegação, fluxo de evidências, chat e acompanhamento com dados fictícios. Registrar separadamente os testes humanos não executados.

## Fase E1 — Sistema visual e tipografia (somente após P1/P2)

- [ ] **E1-01** Auditar fontes efetivamente aplicadas (CSS cascade, overrides, telas professor/aluno, modal, chat, drawer, mobile). Definir dupla tipográfica: **títulos com personalidade gótica legível** (serifada de alto contraste, preferencialmente local/licença compatível) + **texto de interface altamente legível**; não aplicar blackletter em parágrafos ou campos.
- [ ] **E1-02** Consolidar tokens, escalas, pesos, line-height, contrastes, espaçamentos, estados hover/focus/disabled e consistência visual sem quebrar os cards cinematográficos aprovados.
- [ ] **E1-03** Reprojetar painel geral do professor como **HUD de jornada**: indicadores reais de progresso, próximos passos, alertas acionáveis, estado vazio bem explicado, cartões com hierarquia e feedback; não inventar métricas.
- [ ] **E1-04** Harmonizar acompanhamento, chat, biblioteca, formulários, cadastro e estados de carregamento/erro com a mesma direção de arte. Não perder legibilidade em projeção.

## Fase E2 — Movimento, audiovisual e sensação de jogo

- [ ] **E2-01** Inventariar os 10 vídeos/cartões existentes e identificar onde a tela permanece excessivamente estática.
- [ ] **E2-02** Introduzir microinterações **úteis**: progresso real, transição de missão, resposta de conclusão, desbloqueio, prévia de asset, sem animações incessantes ou falsas recompensas.
- [ ] **E2-03** Acrescentar vídeo ou demonstração curta **somente onde ensina uma ação concreta** (especialmente GDevelop), com alternativa textual e poster estático. Não depender de geração paga nem contornar cotas.
- [ ] **E2-04** Validar performance, teclado, foco, reduced-motion, contraste, mobile e projeção; testar em 390px, 768px e desktop. Não afirmar teste físico se não executado.

## Fase H — Validação e entrega para revisão às 21h–22h

- [ ] **H-01** Rodar QA estática, Browser QA e verificar resultados no commit correto; corrigir falhas.
- [ ] **H-02** Entregar resumo por missão (professor/aluno), capturas/links das telas alteradas, mudanças visuais, riscos e pendências reais.
- [ ] **H-03** Criar roteiro de homologação de 20–30 min para o usuário testar à noite: entrada aluno/professor, M01/M04/M06/M10, chat cruzado, evidência, aprovação, acompanhamento, biblioteca, celular.
- [ ] **H-04** Manter testes manuais GDevelop GUI, aparelho físico e playtest humano como **NOT_RUN** até evidência observável. Publicação em `main` somente após nova autorização.

## Protocolo de execução autônoma

1. Antes de cada rodada ler `AGENTE-V3-ROADMAP.md`, `AGENTE-V3-ESTADO.json`, `AGENTE-V3-PROMPT.md` e este documento.
2. Avançar na ordem **P0 → P1 → P2 → E1 → E2 → H**, exceto correção bloqueadora comprovada. Priorizar trabalho concreto, não só documentos.
3. Para cada missão, comparar conteúdo real das duas faces, apontar lacunas com arquivo/trecho, corrigir em código, acrescentar testes de regressão, registrar commit e estado. Não marcar uma missão aprovada só por existir JS/CSS.
4. Preservar a arquitetura, 10 missões, vídeos, cadastro, chat, acompanhamento, permissões e dados. Não adicionar métricas fictícias, notas de professor, custos ou dependências pagas.
5. Em toda rodada: resultado real, CI verificada, próximo item, pendências. Se não houver tempo para terminar tudo até 21h, informar claramente o que ficou pendente. **Não prometer conclusão sem evidência.**

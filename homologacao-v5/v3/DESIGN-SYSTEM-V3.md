# PIT Game Jam IA V3 — Design System (ART-01)

Data: 2026-10-28. Branch experimental de desenvolvimento pedagógico: `feature/pit-gamejam-v3-arcade`.

## Identidade

Dark fantasy gótico com linguagem de jogo arcade, sem reutilizar personagens, marcas ou elementos de franquias. A arte de fundo existente é autoral. O objetivo é ter imersão sem sacrificar a legibilidade da projeção ou do celular.

## Tokens semânticos

Fonte única: `v3/design-system.css`. Variáveis `--pit-*` definem cores, tipografia, espaçamento, raios, motion e sombra. A paleta base é:
- **Abyss** `#090b0e`: fundo profundo.
- **Iron** `#25282b` e **steel** `#72716d`: superfícies e bordas.
- **Bronze** `#ac7050`, **gold** `#f6c781`, **ember** `#ff662b`: progressão, ação e destaque.
- **Paper** `#f1e4cf`: texto principal sobre fundo escuro.
- **Focus** `#d7ffa7`: indicador de teclado; não é um badge de status.
- **Success** `#9de3c4` e **danger** `#f2a0aa`: mensagens com texto explicativo, nunca apenas cor.

## Tipografia e hierarquia

- Display: Georgia / Times New Roman para títulos cinematográficos e capítulos.
- Interface: Segoe UI / Arial para comandos, checklists, instruções e evidências.
- Títulos de capítulo não devem competir com o passo prático; a sequência de ação e o resultado esperado ficam na mesma tela.
- Evitar texto com baixo contraste sobre arte; usar gradiente escuro atrás de qualquer instrução essencial.

## Estados e componentes

- Cards: estado padrão, hover/foco, selecionado, bloqueado, concluído **apenas quando confirmado**.
- Botões: ações de turma não devem ser confundidas com prévia local; o professor libera explicitamente.
- Chat: vazio, carregando, erro recuperável, sucesso e rascunho preservado.
- Galeria: progresso derivado de aprovações reais; arte cinematográfica não substitui feedback.
- Assets: origem procedural identificada, formatos reais e instruções de importação.

## Motion e acessibilidade

- `--pit-motion-fast` 150 ms para resposta imediata; `--pit-motion-reveal` 380 ms para entradas pontuais.
- `prefers-reduced-motion:reduce` remove animações/transições prolongadas e rolagem suave.
- Foco visível de 3 px, navegação por teclado e alvo de toque suficientemente grande.
- Não transformar efeito visual em bloqueio de conteúdo, nem depender de som ou cor como único sinal.

## Integração implementada

As quatro superfícies atuais carregam `v3/design-system.css`. O carrossel, professor, chat e regras de foco referenciam tokens semânticos, preservando os valores visuais já usados nas Missões 01–03. O teste `qa/v3-design-tokens.cjs` verifica unicidade, presença nas rotas, uso real e movimento reduzido.

## Critérios pendentes para fases seguintes

- ART-02/03: ampliar arte original e variantes de estados sem imitar franquias.
- ART-04/05: otimização e avaliação de performance das imagens/transições.
- FUN-10: medição sistemática de contraste WCAG, leitor de tela e regressão de acessibilidade.

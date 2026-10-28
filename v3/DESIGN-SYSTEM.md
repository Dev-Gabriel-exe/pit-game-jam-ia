# Direção visual V3 — ART-01

Sistema de design **original**, reutilizado por portal, fase, caderno do aluno e professor. Não reutilizar personagens, logotipos ou imagens de franquias comerciais. A estética combina pedra escura, bronze, pergaminho, brasas e detalhes arcade, sem exigir fontes pagas.

## Tokens em produção

Arquivo-fonte: `v3/design-system.css`. As quatro rotas HTML carregam o arquivo **antes** de `v3/accessibility-v3.css`. Componentes de missões 01–03 não tiveram conteúdo alterado.

| Papel | Token | Cor | Uso |
|---|---|---|---|
| Fundo principal | `--pit-abyss` | `#090b0e` | Fundo imersivo |
| Painel | `--pit-surface` | `#14171b` | Camadas de leitura |
| Painel elevado | `--pit-surface-raised` | `#202126` | Cards de destaque |
| Texto principal | `--pit-paper` | `#f1e4cf` | Conteúdo e títulos |
| Texto secundário | `--pit-text-muted` | `#c5b8a8` | Metadados |
| Ação e foco temático | `--pit-gold` | `#f6c781` | CTAs, rótulos |
| Borda e ornamento | `--pit-bronze` | `#ac7050` | Divisórias, não texto pequeno |
| Sucesso validado | `--pit-success` | `#9de3c4` | Somente após confirmação real |
| Revisão necessária | `--pit-gold` | `#f6c781` | Feedback sem punição visual |
| Falha/bloqueio | `--pit-danger` | `#f2a0aa` | Mensagens e status |
| Foco de teclado | `--pit-focus` | `#d7ffa7` | Foco sempre visível |

## Hierarquia e layout

Títulos principais usam `--pit-font-display` (Georgia com fallback), conteúdo e controles usam `--pit-font-ui` (Segoe UI com fallback). Corpo legível, com no mínimo 16px nas telas didáticas; legenda pode ser menor quando não carregar instruções críticas. Espaçamento em múltiplos de 4px, raio 6/10/15px, borda temática e sombra curta. Para novos cards usar `.pit-art-panel`, `.pit-art-eyebrow`, `.pit-art-title` e `.pit-art-muted`; não reestilizar missões aprovadas sem evidência de defeito.

## Estados verdadeiros

Usar `.pit-art-state[data-status=approved|revision|blocked]` somente com status retornado do fluxo autorizado. Nunca derivar aprovação de clique, vídeo assistido, XP, animação ou `localStorage` isolado. Exibir texto e não depender só de cor.

## Movimento e acessibilidade

`--pit-motion-fast` 150ms para feedback, `--pit-motion-reveal` 380ms para entrada e `--pit-motion-slow` 620ms apenas para momentos opcionais. `.pit-art-reveal` respeita `prefers-reduced-motion`; o CSS transversal desativa transições não essenciais. Não animar números de nota/aprovação como se fossem resultados. `prefers-contrast:more` reforça bordas e texto.

**Contraste calculado para pares opacos:** `paper/abyss` ~15.70:1; `gold/abyss` ~12.58:1; `muted/surface` ~9:1; `bronze/abyss` ~4.87:1. Gradientes, transparências e imagens exigem aferição visual específica; estes valores não provam WCAG de todas as telas.

## QA e próximos passos

`node qa/v3-design-tokens.cjs` valida nomes, cores, contraste dos pares opacos, inclusão nas quatro rotas, referências de componentes e preferências de movimento. A auditoria em navegador, a leitura por tecnologias assistivas e o contraste sobre imagens reais continuam necessários nas fases de QA. A arte nova de ART-02 deve usar os mesmos tokens e legendas acessíveis.

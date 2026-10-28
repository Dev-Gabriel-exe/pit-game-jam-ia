# UI-08 — Auditoria responsiva e de acessibilidade das telas V3

Data: 2026-10-28. Branch `feature/pit-gamejam-v3-arcade`.

## Escopo executado

- Quatro superfícies atuais: `index.html` (portal/biblioteca/kits), `fase1.html` (carrossel), `aluno-v3.html?preview=1` e `professor-v3.html?preview=1`.
- Três viewports: 390 px (celular), 768 px (tablet) e 1440 px (desktop), totalizando **12 combinações**.
- Chrome em modo de movimento reduzido: verificação de `scroll-behavior:auto`, foco por teclado, ausência de overflow horizontal global, ausência de imagens locais quebradas e erros JavaScript.
- 12 capturas de tela geradas e arquivadas no GitHub Actions **40633153958**, artefato `ui-08-visual-audit` (ID 12792411418, retenção temporária).
- Inspeção visual das 12 capturas em contato e das telas de aluno/professor de 390 px. A hierarquia, legibilidade e alinhamento principais foram revisados, sem reivindicar aprovação do usuário.

## Defeito real identificado e corrigido

O primeiro teste detectou **overflow horizontal de 183 px** no caderno do aluno a 768 px (`scrollWidth=951`, `viewport=768`). A navegação V3 mantinha links e identificação em uma única linha com largura excessiva. Foi adicionada uma regra específica para 701–1024 px em `v3/accessibility-v3.css`: ocultar apenas a marca duplicada, compactar botões e limitar a identificação com reticências, mantendo todos os controles acessíveis.

## Evidências de execução

- Static QA **40633154088**: sucesso.
- Browser QA **40633153958**: sucesso; 70 combinações de páginas/missões da regressão anterior e 12 combinações adicionais de viewport, foco, movimento reduzido e capturas.
- Não houve uso de API/turma real; as prévias V3 não alteram dados da turma.

## Limites e riscos residuais

- A auditoria cobriu as quatro superfícies V3 principais, não todos os HTML legados V2.
- Não houve medição automática de razão WCAG para todos os textos, nem teste de leitor de tela; reservar para FUN-10.
- A janela de chat não é exibida na prévia visual isolada: viewport de chat autenticado e comportamento de backend real continuam na fase funcional.
- Capturas são diagnósticas, não equivalem à homologação do responsável nem à validação de projeto GDevelop.

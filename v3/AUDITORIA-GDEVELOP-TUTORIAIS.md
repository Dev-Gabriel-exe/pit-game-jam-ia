# AUD-03 — Tutoriais, referências e imagens GDevelop

Auditoria em 2026-10-28. Foram inspecionados os guias de entrada (Missões 01/03), movimento (04), eventos (05), importação (06), conclusão (07), UX (08) e distribuição (10).

| Guia | Percursos / etapas | Imagens e documentação | Contingência |
|---|---:|---|---|
| Primeira execução GDevelop | 6 etapas | Capturas oficiais da interface | SVG local `gdevelop-inicio-pt.svg` |
| Movimento M04 | 4 rotas (2D superior, plataforma, 3D e alternativa) | Capturas oficiais de comportamentos | SVG local de movimento/limites |
| Eventos M05 | 3 rotas | Editor, variável e pontuação | SVG local de eventos |
| Forja M06 | 5 rotas por modalidade | Diagrama autoral de criação/importação/Preview | Recursos locais, prompts e plano B |
| Conclusão M07 | 2 rotas (2D/3D) | Eventos e variável; documentação oficial | SVG local de eventos |
| UX M08 | 3 rotas (HUD, puzzle, 3D) | Capturas oficiais de cena e eventos | SVG local de eventos |
| Publicação M10 | 3 rotas (local, web, gd.games) | Diagrama esquemático autoral; docs oficiais | Preview local sem publicação |
| Guia de eventos do professor | 5 etapas | Capturas reais + ilustração | SVG local identificado corretamente |

## Evidência e correções

- Os 21 URLs de imagens oficiais originalmente referenciados foram examinados na documentação pública. **20 responderam com imagem**; a captura de controles de plataforma `platformer-defaultcontrols-box.png` não pôde ser acessada e foi substituída por outra captura oficial verificável do mesmo painel.
- M03: corrigido o caso de imagem já quebrada no cache antes da instalação do listener de erro.
- Guia do professor: ao substituir captura externa por SVG, o rótulo passa a dizer **DIAGRAMA AUTORAL**.
- M08: o texto alternativo diferencia captura do editor de cena e captura do editor de eventos.
- M06: incluído diagrama original e explicitamente esquemático para o fluxo criar → exportar → importar → Preview.
- M10: preservada a distinção entre projeto editável, build e link opcional, sem exigir serviço pago. Documentação oficial de publicação e colaboração revisada.

## Limites

As imagens são referências de interface, inclusive algumas capturas antigas, e não garantem posição idêntica de botões na versão atual. Os tutoriais ainda precisam de execução manual dentro do GDevelop e testes em navegador/dispositivo. Nenhuma geração paga, exportação real ou turma real foi usada.

Teste reproduzível: `node qa/v3-audit-guides.cjs`.

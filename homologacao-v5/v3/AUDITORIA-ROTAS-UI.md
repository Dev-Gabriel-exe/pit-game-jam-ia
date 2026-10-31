# UI-01 — Inventário verificável de rotas e dependências

Revisão em 2026-10-28, apenas na branch de desenvolvimento. Não houve publicação em produção.

| Entrada | Papel atual | Dependências centrais | Situação |
|---|---|---|---|
| `index.html` | Portal público, recursos, starters, biblioteca | `biblioteca.js`, links de cadernos | Portal contém links mistos para V2 e V3; revisar em UI-02 |
| `fase1.html` | Protótipo isolado de seleção de missões | `v3/phase1.js`, `v3/phase1.css` | Não substituir cadernos reais |
| `aluno-v3.html` | Caderno do aluno, carrossel e entrega | `v2/missions.js`, `v3/app.js`, `v3/arcade-gallery.js`, módulos M01–M10 | Rota principal de desenvolvimento |
| `professor-v3.html` | Caderno do professor, turma, liberação e revisão | `v2/missions.js`, `v3/app.js`, módulos professor M01–M10 | Rota principal de desenvolvimento |
| `aluno-v2.html` / `professor-v2.html` | Entradas legadas V2 | CSS e scripts V2 | Preservar compatibilidade |
| `aluno.html` / `professor.html` | Entradas legadas usadas em parte do portal | CSS e scripts V2 | Não confundir com V3 |

## Inventário funcional

- **Carrossel/HUD:** `v3/arcade-gallery.js` no aluno e `#missionGallery` em ambos os cadernos; dez posters WebP versionados em `v3/assets/missions/`.
- **Estado e turma:** `v3/app.js` conecta os cadernos à API de sala/chat. O teste de navegador usa *fixture* fictícia interceptada, nunca uma turma real.
- **Biblioteca:** `biblioteca.js` contém geradores locais PNG/GLB/WAV/SVG. O portal possui links de acesso a recursos e starters externos.
- **Ferramentas:** links externos ao editor GDevelop e documentação; requerem verificação de disponibilidade/versão na auditoria específica.
- **Fluxos críticos seguintes:** UI-02 (links legados do portal), UI-03 (jornada aluno), UI-04 (painel docente), UI-05/06 (arquivos e downloads), UI-07 (chat).

## Teste reproduzível

`node qa/v3-ui-route-inventory.cjs` percorre oito arquivos HTML, verifica cada referência local `src`/`href`, bloqueia escapes de diretório, exige os dez posters e verifica dependências de entrada dos cadernos. Integrado ao GitHub Actions `static-qa.yml`. Isso **não** valida a navegação visual nem a rede externa; essas verificações pertencem à QA de navegador e às próximas metas.

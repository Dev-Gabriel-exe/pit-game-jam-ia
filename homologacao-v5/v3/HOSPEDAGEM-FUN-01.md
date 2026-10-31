# FUN-01 — Hospedagem, CORS e separação de ambientes

**Escopo:** branch `feature/pit-gamejam-v3-arcade`, sem merge e sem publicação. Verificação em 28/10/2026.

## Arquitetura efetiva

| Camada | Origem | Estado comprovado |
|---|---|---|
| Arquivos estáticos | GitHub Pages (`https://dev-gabriel-exe.github.io/pit-game-jam-ia/`) | GET HTTP 200 no probe somente leitura; workflow `deploy-pages.yml` publica apenas `main` |
| Cadernos V3 nesta branch | GitHub / prévia estática | Testes locais em Chrome e URL de prévia; **não** afirmar que V3 está implantada no Pages |
| API de sala e chat | `https://pit-game-jam-chat.vercel.app/api/` | GET de saúde e preflights OPTIONS sem credenciais passaram no GitHub Actions |
| Banco | Neon/Postgres por `DATABASE_URL` no Vercel | Não acessar dados reais nem usar credenciais no repositório |

O workflow de Pages só publica automaticamente em `main` e não foi acionado por esta branch. O `workflow_dispatch` existente exige atenção operacional: **não usar para publicar esta branch** sem autorização.

## CORS e segurança de prévia

As APIs aceitam `https://dev-gabriel-exe.github.io` e `https://pit-game-jam-chat.vercel.app` como origens. `raw.githack.com` não integra a lista de origens permitidas. `v3/hosting-policy.js` bloqueia o formulário de credenciais quando a página é aberta em espelho estático não confiável e oferece `?preview=1` para exploração sem servidor. O próprio `v3/app.js` também impede chamadas de API nesse modo.

O localhost da suíte Chrome é considerado ambiente de desenvolvimento para fixtures, **não** autorização para acessar a API real. A política CORS do chat de produção não permite localhost.

## Testes realmente executados

- <https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40635076936> — GitHub Actions **success**: contrato estático, preflight OPTIONS da API de chat e de sala, GET de saúde sem credenciais, GET da landing do Pages.
- <https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40635164103> — segundo probe **success**, acrescentando verificação de presença de links V3 na landing (resultado textual no log da execução; não inferir publicação V3 a partir de HTTP 200).
- `qa/v3-hosting-audit.cjs` — verificações offline de workflows, origens, cabeçalhos CORS e separação entre prévia e acesso real.
- `qa/v3-hosting-browser.cjs` — Chrome com espelho `preview.invalid` servido por arquivos locais; verifica que aluno/professor não exibem formulário de credenciais, oferecem prévia e não fazem requisições à API real.

## Pendências

A versão V3 **não foi publicada** na `main`; o resultado HTTP 200 do Pages não comprova que a versão em desenvolvimento está online. A homologação final ainda precisa conferir a URL de implantação aprovada, o domínio definitivo, a API com usuários **fictícios em ambiente isolado**, permissões, mensagens, evidências e rollback. O teste `qa/live-api-smoke.cjs` cria conta no backend real e **não foi executado nesta rodada**.

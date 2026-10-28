# UI-02 — Portal público V3

Data: 2026-10-28. Alterações isoladas na branch `feature/pit-gamejam-v3-arcade`, sem deploy.

## Correções

- Os seis links principais que ainda levavam aos cadernos legados (`aluno.html`/`professor.html`) foram substituídos por `aluno-v3.html`/`professor-v3.html`. Os arquivos V2 continuam disponíveis, mas o portal direciona à experiência atual.
- A navegação principal recebeu nome acessível; foi adicionado link de pular para `main#conteudo` como primeiro foco do teclado.
- Paleta do portal harmonizada com o estilo gótico/cinematográfico dos cadernos: cobre, pergaminho e preto, com o poster autoral da Missão 01 no hero. Grades e breakpoints existentes foram preservados.
- Foco visível e preferência de movimento reduzido existentes foram mantidos.

## Testes

- `node qa/v3-ui-route-inventory.cjs` integrado ao workflow estático: referências locais, links V3, dez posters, skip link e landmark.
- `qa/v3-e2e.cjs`: navegação com Tab, links dos dois cadernos e imagem do hero verificados no Chrome. O teste de largura 390 px do portal também foi adicionado.
- **Limite:** a aprovação visual humana, leitores de tela e links externos não foram testados. Nenhuma turma real foi acessada.

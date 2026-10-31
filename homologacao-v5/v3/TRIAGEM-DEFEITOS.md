# Registro de defeitos — PIT Game Jam V3

Este quadro serve para triagem **após execução** dos testes presenciais. Não há bugs novos confirmados nesta etapa. As pendências abaixo são **lacunas de verificação**, não defeitos observados.

| Código | Área | Tipo | Gravidade provisória | Evidência necessária | Situação |
|---|---|---|---|---|---|
| QA-01 | GDevelop editor | Teste pendente | Não atribuída | Captura de importação PNG/GLB na interface | NÃO EXECUTADO |
| QA-02 | Áudio | Teste pendente | Não atribuída | Escuta humana do WAV no Preview | NÃO EXECUTADO |
| QA-03 | Persistência | Teste pendente | Não atribuída | Projeto salvo, fechado e reaberto no editor | NÃO EXECUTADO |
| QA-04 | Mobile | Teste pendente | Não atribuída | Dispositivo físico, viewport, toque, desempenho | NÃO EXECUTADO |
| QA-05 | Polimento | Teste pendente | Não atribuída | Capturas antes/depois do mesmo percurso | NÃO EXECUTADO |
| QA-06 | Playtest | Teste pendente | Não atribuída | Observação de colega e reteste da correção | NÃO EXECUTADO |

## Regras de severidade
- **P0:** perda de dados, exposição indevida de informações, autenticação quebrada ou impossibilidade geral de executar o jogo.
- **P1:** etapa principal bloqueada, entrega/revisão impossível, recurso essencial não funciona sem alternativa viável.
- **P2:** problema localizado de usabilidade, visual ou documentação com alternativa utilizável.
- **Sem defeito confirmado:** manter como lacuna de verificação, não classificar artificialmente como P0/P1/P2.

## Fluxo de correção
1. Reproduzir e registrar versão, passos, esperado e observado; remover dados pessoais.
2. Classificar gravidade e alcance; vincular evidência.
3. Corrigir na branch `feature/pit-gamejam-v3-arcade`.
4. Rodar QA estática, navegador e nativa pertinente.
5. Repetir o teste que falhou e registrar resultado.
6. Atualizar checkpoint somente quando o critério de aceite estiver comprovado.

A lista de tarefas de homologação está em [HOMOLOGACAO-PRESENCIAL.md](./HOMOLOGACAO-PRESENCIAL.md). Não há autorização para merge em `main` ou deploy.

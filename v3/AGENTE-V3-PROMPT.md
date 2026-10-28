# Agente de desenvolvimento — instrução reutilizável

**Projeto:** PIT Game Jam IA V3  
**Repositório:** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia  
**Branch de trabalho:** `feature/pit-gamejam-v3-arcade`  
**Plano e critérios:** `v3/AGENTE-V3-ROADMAP.md`  
**Estado único persistente:** `v3/AGENTE-V3-ESTADO.json`

## Prompt de execução de uma rodada

Você é o agente executor do projeto PIT Game Jam IA V3. Continue o desenvolvimento **real** na branch de trabalho, usando o conector GitHub. Leia os dois arquivos acima antes de decidir qualquer ação. A ordem obrigatória é Missões 04–10 nos cadernos de professor/aluno → auditoria de todas as dez missões → todas as outras telas, painel e biblioteca de assets → novos visuais e gamificação → teste/correção das funcionalidades (chat, liberação, acompanhamento, evidências) → homologação final. Faça **um objetivo pequeno e concreto** do JSON por rodada de trabalho, com atenção especial à qualidade pedagógica (superior de TI; professor leigo; conceitos na própria tela; sem notas de fala), tutorial real GDevelop em português, personalização por gênero, prova de criação verdadeira, visuais dark fantasy originais e custo zero. Execute edição e teste possíveis AGORA; registre commit, resultado e pendências no JSON, e reporte a próxima meta. Continue um item `in_progress` antes de iniciar outro e jamais marque `done` sem artefato verificável. Preserve conteúdo e estética aprovados nas Missões 01–03. Nunca use APIs pagas, assine serviços, compartilhe segredos, invoque dados de alunos reais, publique em produção ou faça merge em main sem aprovação. Se um navegador, arquivo ou credencial não estiver acessível, não invente teste: registre bloqueio e faça uma melhoria segura alternativa. Ao encerrar as 59 tarefas, entregue um relatório com provas e altere a condição para `READY_FOR_FINAL_REVIEW`; não continue mudanças desnecessárias. Se a tarefa estiver impedida por autorizações ausentes, explique exatamente o necessário.

## Checkpoint mínimo obrigatório

1. Ler branch + `AGENTE-V3-ROADMAP.md` + `AGENTE-V3-ESTADO.json`.
2. Selecionar o ID `in_progress` ou o primeiro `todo` elegível.
3. Inspecionar código e arquivos reais relacionados; evitar refazer trabalhos já presentes.
4. Implementar uma modificação testável, com teste sintático e funcional quando possível, mantendo prévias offline.
5. Commitar no GitHub na branch definida.
6. Atualizar estado (ID, SHA, provas, status, próxima meta).
7. Resumir o que mudou, links/commit, testes feitos/não feitos e o próximo ID.
8. Se tudo estiver pronto: emitir relatório final; aguardar aprovação para publicar.

## Observação sobre agenda

O usuário autorizou e ativou o agendamento nativo **a cada 1 hora** (Agente Game Jam V3). A primeira rodada foi iniciada manualmente em 27/10/2026. Não criar nova automação, não reiniciar o roadmap nem assumir que a execução do agendador já produziu commits: conferir o checkpoint a cada rodada. Os objetivos são incrementais e seus resultados só podem ser declarados quando efetivamente executados e testados.

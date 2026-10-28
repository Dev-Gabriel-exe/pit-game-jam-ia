# Cinema LTX gratuito — PIT Game Jam (EXPERIMENTO)

Branch isolada: experiment/ltx-missions-01-10. Não publica na produção e não altera conteúdo pedagógico.

Missão 01 já possui MP4 real. Missões 02 a 10: o gerador usa cada arte original (WebP) e um prompt de ação específico da missão. Ele tenta TODAS as que estiverem faltando numa execução, sequencialmente, até a fila gratuita do provedor ficar indisponível. Não há limite artificial de uma missão por rodada.

O arquivo ops/ltx-status.json informa último progresso ou bloqueio. O arquivo v3/motion-manifest.js inclui exclusivamente MP4s de verdade presentes no Git. A interface usa as imagens estáticas quando o vídeo não existe, está bloqueado, o usuário escolhe movimento reduzido ou economia de dados.

O endpoint público é oferecido por terceiros: acesso sem login e livre de cobrança NÃO significa GPU garantida. Respeitar limites publicados, sem sessões falsas, IPs rotativos, chaves de terceiros ou evasão de cotas. Nenhuma repetição agressiva em caso de indisponibilidade.

Para disparar uma nova rodada: atualização/commit de ops/ltx-hourly-trigger.txt na branch de experimento ativa o workflow .github/workflows/ltx-missions-queue.yml. A automação horária externa pode realizar esse commit depois de verificar estado e se não há execução em andamento.

Links de prévia:
https://raw.githack.com/Dev-Gabriel-exe/pit-game-jam-ia/experiment/ltx-missions-01-10/aluno-v3.html?preview=1

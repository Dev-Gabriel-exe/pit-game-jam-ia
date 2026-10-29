# Fase C.3 — Identidade visual das builds (laboratório V5)

**Alcance:** apenas a branch `feature/v5-arena-dos-criadores` e o motor de testes da missão 5 (Phase2). Nenhuma alteração em notas, XP, aprovação docente, persistência, missão 10 ou branch `main`.

## Funcionamento
- A identidade decorre da **build canônica**: classe, lista dos cinco talentos escolhidos e distribuição dos até dez pontos de atributos.
- Cada uma das quatro classes tem três árvores. As contagens de escolhas definem a árvore dominante; empates seguem ordem determinística.
- Combinações distintas produzem identidade estável: paleta de cor, forma do emblema, quantidade de cristais e assinatura. Trocar o nome não altera a build; trocar atributos ou talentos pode alterar o visual.
- Camada 3D de baixo custo anexada ao personagem real: dois círculos luminosos nos pés, emblema rotativo, anel do emblema e um a três cristais. Leve tintura do material clonado do GLB, preservando o recurso CC0 original.
- Etiquetas sobre os personagens agora identificam a árvore predominante com abreviação (por exemplo, BAS, AST, SOB, JUL), com borda na cor da build.
- Ao morrer, o personagem continua identificado na arquibancada. Ao trocar roster/reiniciar, a geometria é descartada com o personagem.
- A missão 10 legada **não recebe** uma aparência de aprovação falsa. Não existe troca de equipamentos, inventário, animação exclusiva por talento nem gravação remota neste estágio.

## Evidência e verificações
- `qa/v5-build-identity.cjs`: builds mistas, mesmas builds/nome diferente, ID inválido, 120 talentos e árvores em quatro classes.
- `qa/v5-build-identity-browser.cjs`: 30 participantes, diferenciação da mesma classe, carregamento GLB, combate M5, reconstrução da cena e M10 isolada.
- Verificações manuais: `v5/arena-lab.html?phase2=1`, alternância `4/30 participantes`, combinações de talentos e entrada de build personalizada pela Forja.

## Próxima etapa
Antes de integrar ao fluxo oficial da oficina, validar persistência servidor/autenticação, aprovação do professor para desbloquear 1 talento e 2 pontos por missão, respec permitido até o primeiro ingresso na M5 e trava atômica definitiva na M10.

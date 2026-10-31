# Fase G.2 — Roteiro de validação nos PCs da oficina

**Objetivo:** obter evidência real de fluidez e estabilidade para a Arena V5 com 30 personagens, sprites e câmera cinematográfica. **Este checklist não está aprovado até ser executado em computadores da escola.**

## Preparar

- Abrir a prévia isolada `v5/arena-lab.html?phase2=1&count=30&nav=steer&counterplay=1&balance=hp2&sprites=1&perf=1` na branch experimental, em Chrome ou Edge atualizado.
- Confirmar que aparecem **30/30 modelos KayKit**, o painel G.1 e os nomes e classes corretos.
- Verificar qualidade: a tela deve mostrar `auto` em `data-v5-quality-mode` se a máquina permitir; não baixar resolução ou remover talentos automaticamente. Evitar modo de economia de energia do notebook durante a medição.

## Execução manual (na mesma máquina)

1. Deixar o cenário e todos os GLBs carregarem. Medir FPS atual, P10, draw calls, triângulos e geometria/texturas **após alguns segundos de aquecimento**.
2. Ativar **Diretor automático** e **Iniciar confronto** com 30. Registrar as métricas de FPS e P10 em três momentos: 30 vivos, 15 vivos, 2 vivos.
3. Confirmar que os eliminados aparecem nas arquibancadas, as habilidades têm sprites correspondentes a eventos reais, os nomes permanecem legíveis e a câmera não atravessa os pilares.
4. Deixar a partida finalizar com vencedor; voltar a iniciar a cena duas vezes e conferir se a memória de geometrias/texturas **não cresce continuamente após o primeiro carregamento GPU**.
5. Exercitar arrasto manual, retorno ao diretor, seguir um aluno, alternância aluno vivo → espectador após eliminação real, pausa e reinício. Abrir no segundo navegador disponível se houver.
6. Em `?perf=1`, clicar **Copiar diagnóstico** e registrar a máquina, navegador, estado dos gráficos, números de FPS e eventuais erros. **Não coletar nomes/dados pessoais de alunos**.
7. Se a GPU reiniciar e aparecer `GPU REINICIANDO`, confirmar que o combate não continua invisível. Só retomar após exibir `GPU RESTAURADA` e clicar **Continuar**.

## Critérios de aceite propostos, não comprovados

- **Obrigatório:** não travar, todos os 30 modelos visíveis, vencedor correto, câmera e talentos legíveis, reinício funcional e ausência de erro WebGL fatal.
- **Meta inicial de fluidez:** pelo menos **30 FPS na maior parte do confronto** e P10 próximo de 24 FPS ou maior no hardware disponível. Se não atingir, guardar métricas, investigar gargalo e corrigir na branch; **não esconder FPS baixo no painel**.
- Testar ao menos uma máquina representativa do laboratório onde o professor projetará a partida. O FPS observado no GitHub Actions usa renderização por software e **não valida o hardware dos alunos**.

## Próximos gates

G.3 falhas de rede/GLB e eventos de restauração de GPU; H sincronização real entre dispositivos, autorização de professor e progresso dos alunos; I homologação e merge somente após aprovação do usuário.

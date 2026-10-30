# V5 H.3 — Missão 10, motor experimental (checkpoint 30/10/2026)

**Estado:** primeiro incremento técnico da Missão 10 concluído e testado em Node/CI. **Não é a arena final visual, não está ligado à V3, a turmas reais, XP ou autenticação e não foi enviado à main.** A Fase G.2 nos PCs reais continua pendente. Manter o desenvolvimento isolado até validação e aprovação.

## Incremento entregue nesta rodada

- `v5/phase2-combat.js`: mesmo motor determinístico da M5 passa a aceitar **arenaMission:10** apenas por opção explícita. Sem esse parâmetro, a M5 continua limitada a cinco missões, cinco talentos e dez pontos de atributo. O modo final exige `approvedMissions:10` e `finalTrial:true` em cada entrada fictícia; não trata essa flag como autorização de servidor.
- `canonical(build,10,{experimentalFinal:true})`: aceita exatamente a capacidade máxima de **dez talentos distintos do catálogo da classe** e **vinte pontos de atributo**. A validação rejeita classes e talentos inválidos, duplicados e excesso de pontos; o modo padrão segue limitado a M5.
- `exampleBuild(klass,nome,10,variante,{experimentalFinal:true})`: monta exemplos com dez talentos e vinte pontos, **preservando as cinco escolhas iniciais e os dez pontos da build M5**. As onze variantes anteriores de M5 não mudam.
- `v5/progression-contract-h0.js`: `m10ArenaAdapter` verifica a sequência de dez aprovações, a primeira entrada M5 congelada e o lock M10 antes de criar entrada fictícia. `checkTransition` agora também rejeita alterar atributos ou talentos depois do lock final; no futuro o backend deverá garantir isso com persistência transacional e controle de versão.
- `qa/v5-m10-engine.cjs`: cobre as quatro classes, 120 talentos disponíveis, 11 variantes por classe, 4 e 30 personagens, builds de dez talentos e vinte pontos, guardas contra entrada irregular, encerramento, eventos reais e replays determinísticos; compara a batalha M5 padrão com `arenaMission:5` para detectar alteração.
- `qa/v5-progression-contract-h0.cjs`: adiciona rejeição de alterações de atributos/talentos após travamento da build final.
- `.github/workflows/v5-m10-engine-qa.yml`: testes Node no GitHub Actions, incluindo H.0 e regressão do final da M5.

## Evidências

- [Primeiro teste M10 aprovado, run 41004049659](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41004049659): **4 heróis** — Caçador venceu em 52,1s, 20 talentos distintos disparados, 635 eventos; **30 heróis** — Guerreiro venceu em 75,3s, 52 talentos distintos disparados, 3.825 eventos. Ambos os cenários repetiram exatamente o mesmo resultado com seed fixa. Os 120 talentos estão no catálogo, mas **não foram todos disparados nesse conjunto de partidas**. Testes H.0 e E.7 também passaram.
- [Reexecução após reforçar lock final, run 41004088844](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41004088844). Consultar resultado do job antes de afirmar homologação da última revisão.
- `main` não alterada. A UI `v5/arena-lab.js` mantém M10 em modo legado; **não existe prévia 3D da M10 com esse novo motor ainda**.

## Próxima missão técnica — ainda na H.3

1. Rodar **matriz de balanceamento M10** com várias seeds, 4/30 combatentes, 11 variantes e distribuições desiguais de classes; identificar dominância, sobrevivência, tempo e diversidade de talentos sem escolher vencedores artificialmente. Revisar os 120 talentos com casos focais (ativação passiva/reativa/ativa), não apenas presença no catálogo.
2. Criar **modo de visualização M10 opt-in** no laboratório, com as quatro classes KayKit, sprites de talentos, 30 combatentes, câmera automática e arquibancada, sem modificar a interface M5 existente ou V3.
3. Verificar câmera, FPS e estabilidade da M10 no Chromium real, incluindo morte, espectador, pausa, reinício e fim do torneio. G.2 exige ainda os PCs reais da escola.
4. Somente depois das validações e autorização do usuário, conectar H.1/H.2 com backend autenticado, progresso real e uma única partida autoritativa compartilhada. Não fazer merge na `main` antes da Fase I.

**Importante:** a M10 de laboratório ainda não está homologada visualmente nem estatisticamente. A aprovação de replays determinísticos prova a execução da mecânica, não o balanceamento universal ou desempenho físico.

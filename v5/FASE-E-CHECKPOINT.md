# PIT Game Jam IA V5 — Fase E: mecânicas e balanceamento

**Data de abertura:** 29/10/2026. **Branch exclusiva:** `feature/v5-arena-dos-criadores`. **Não fazer merge em main.**

## Decisão pedagógica e visual
O usuário avaliou a Cidadela do Eclipse e aprovou a direção da câmera em terceira pessoa. Pediu efeitos dos talentos mais distintos e o combate mais lento antes de entrar na próxima fase. Considerar **Fase D aprovada visualmente para prosseguir**, sem confundir com homologação técnica/GPU da Fase G. A **Fase E está em execução**. A fase F futura continua responsável pelo diretor automático, cobertura de telão e visão compartilhada professor/espectadores; a aprovação da câmera manual **não** conclui esses itens.

## Experimentos implementados
1. **Ritmo lendário 50%:** valor padrão apenas no laboratório M5 e prévia M10 (o motor padrão mantém 100%). O arco do combate tem `damageScale=.50`, bônus ofensivo **experimental** de 1.10 para Arcanista, tempestade iniciando contração aos 40s com fator 0.55 e limite de simulação de 145s. Configurações 100/75/60 continuam disponíveis; trocar modo preserva a seed. Dano da tempestade permanece original.
2. **Efeitos dos talentos C.1/C.2:** estilos fogo, gelo, raio, barreira, flecha, corte, runa e órbita exibem geometrias 3D diferentes com subida/crescimento e decaimento; os efeitos ativos substituem efeitos passivos quando o teto de objetos é atingido, sem adicionar efeitos falsos. No modo low/reduced motion, menor número de detalhes. **Os 120 talentos têm cues, NÃO animações GLB exclusivas.**
3. **Duelos preferenciais sem chaves forçadas:** novo `engagementMode:'spaced'` **somente no M5 experimental**. O motor considera sobrecarga momentânea do alvo e favorece alvos mais próximos e confrontos recíprocos, mantendo possibilidade de combate em grupo e AoE. O modo `free` permanece padrão de chamadas antigas. A M10 legacy não muda escolha de alvos. `lastTarget` permite medir seleção efetiva sem inventar telemetria.

## Evidências GitHub Actions
Regras passaram em https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40953453867 (rules), com `qa/v5-arena-pacing.cjs` e `qa/v5-engagement-spread.cjs`. **Browser QA do commit ainda estava em andamento na consulta; não declarar aprovado até revisar.**

### Duração (motor M5 sem "spaced" neste teste; 12 seeds de 4, 6 de 30)
| Preset | 4 heróis: duração média | 30 heróis: duração média | 30 heróis: talentos ativos |
|---|---:|---:|---:|
| Original 100% | 15,7s | 48,6s | 112,3 |
| 75% | 18,1s | 46,8s | 131,5 |
| 60% | 20,7s | 52,6s | 151,2 |
| **50%** | **25,8s** | **71,4s** | **175,2** |

Cuidado: há **zero vitórias de Guerreiro/Guardião** nas seis seeds de 30 no modo de 50% sem o modo de agrupamento. O Caçador venceu cinco; a sexta foi por limite sem vencedor identificado. Não afirmar que existe equilíbrio.

### Distribuição de alvos (motor M5 50%, mesmo conjunto de seeds: 16 para 4 e 10 para 30)
| Elenco | Alvos livres: quadros com 3+ atacantes em mesmo alvo | Direcionamento "spaced" |
|---|---:|---:|
| 4 | 14,3% | **6,8%** |
| 30 | 15,8% | **3,0%** |

Com 30 personagens, os vencedores foram Caçador/Arcanista/Guerreiro = 6/3/1 no modo livre, e 6/4/0 no modo "spaced". O direcionamento melhora aglomerações **sem demonstrar equilíbrio entre classes**. Nenhuma regra de desempate forçou um vencedor.

## Próximos passos desta fase (sem pular)
- Benchmark separado de **tank survivability** e **alcance/tempo de aproximação** de Caçador x Guerreiro/Guardião; não aplicar bônus de HP/ataque sem evidência de simulação.
- Reavaliar frequência real de habilidades por build, projéteis interrompidos, dano ao escudo, dano AoE e distribuição de vitórias em amostras maiores e múltiplos cenários; as seeds são uma amostra pequena.
- Medir tempo até primeiro combate/eliminações e FPS em dispositivos reais. A Fase G terá homologação mobile, WebGL low, perdas de conexão/GLB e consumo de memória.
- Só concluir E com critérios reproduzíveis de fairness, partidas estáveis em 4/30 e aprovação. Passar então para **F diretor cinematográfico global**, sem alterar a câmera atual aprovada.
- Testar integralmente o browser workflow do SHA mais recente, e confirmar prévia visual com usuário.

## Prévia Vercel isolada
- Página: https://pit-v5-coliseu-demo.vercel.app/v5/arena-lab.html?phase2=1
- Deployment: `dpl_2oAwe3RgismFCV3ruygiRRroGpBE`, READY, alias público verificado.
- O modo 50% é um **ajuste reversível do laboratório**, não regra definitiva da missão 5/10 nem alteração no progresso dos alunos.

## Fase E — diagnóstico de sobrevivência e perseguição (29/10/2026, segundo incremento)

**Atenção:** este bloco é posterior aos dados iniciais do checkpoint. A branch continua experimental, sem merge em `main` e sem conexão à turma real.

### Banco de testes reproduzível

- `qa/v5-tank-survivability.cjs`: duelos Guerreiro/Guardião × Caçador/Arcanista, 4 e 30 atores, seeds variadas, ordem de spawn e variantes de talentos rotacionadas. Registra primeiro KO, primeiro contato corpo a corpo, dano HP, absorção em escudos, talentos e vitórias. O log da CI documenta todas as amostras; os resultados de duelos não são probabilidades populacionais.
- `qa/v5-phase2-navigation.cjs`: regressão de pilar central por 4 classes, comparação explícita do modo antigo `direct` versus `navigationMode:'steer'`, replay completo sob a mesma seed e ausência de penetração do colisor.
- `v5/phase2-combat.js`: navegação tangencial determinística reaproveitando a geometria dos pilares, **desligada por padrão**. O campo `navTurns` mostra mudanças de direção; atributos, dano, talentos e seletor de alvos foram preservados.
- `v5/arena-three.js` e `v5/arena-lab.js`: o modo opcional chega ao laboratório só com `phase2=1&nav=steer`. Sem `nav=steer` a regra de movimentação antiga permanece. O motor M10 legado não recebeu a nova navegação.

### Resultados mecânicos, modo principal de laboratório (dano 50%, engajamento spaced)

| Amostra | Resultado |
| --- | --- |
| Guerreiro × Caçador, 12 seeds, direct | Guerreiro 12, Caçador 0 |
| Guardião × Caçador, 12 seeds, direct | Guardião 0, Caçador 12 |
| Guerreiro × Arcanista, 12 seeds, direct | Guerreiro 10, Arcanista 2 |
| Guardião × Arcanista, 12 seeds, direct | Guardião 0, Arcanista 12 |
| Quatro heróis, 20 seeds, direct | Caçador 11, Guerreiro 4, Arcanista 5, Guardião 0 |
| Trinta heróis, 16 seeds, direct | Caçador 10, Guerreiro 4, Arcanista 2, Guardião 0 |

Em corredor propositalmente bloqueado por pilar, **todos os quatro** conseguiram contornar a coluna em `steer` sem atravessá-la, enquanto `direct` ficou a 13,26 unidades do alvo. Distância mínima em `steer`: Guerreiro 1,98, Arcanista 6,02, Caçador 5,72 e Guardião 2,19 unidades.

**Conclusão cautelosa:** o novo desvio resolve o caso geométrico isolado, mas o efeito sobre o equilíbrio das partidas é diferente e precisa de correção. Nos mesmos 12 duelos Guerreiro × Caçador com `steer`, o resultado inverteu para 2 Guerreiro / 10 Caçador. Guardião permaneceu 0/12 frente a Caçador e 0/12 frente a Arcanista. Com 30 heróis em 12 seeds, `steer` registrou Caçador 8 / Arcanista 2 / Guerreiro 2 / Guardião 0. **NÃO habilitar `steer` por padrão** nem declarar as classes equilibradas apenas porque os testes de regressão passaram.

Investigação seguinte: (1) medir dano quando perseguidores ficam sem alcance e cooldowns consumidos fora de contato; (2) observar se `G06`, `J03` e as builds defensivas de Guardião produzem aproximação utilizável, sem bônus arbitrário de HP; (3) implementar contrajogo real de long-range com leitura clara de animações e janelas de vulnerabilidade; (4) repetir com 4 e 30 em várias composições antes de qualquer mudança do preset.

## Fase E — contrajogo a ataques à distância (terceiro incremento, 29/10/2026)

**Implementação exclusiva do laboratório M5, reversível e DESLIGADA por padrão:** o parâmetro `rangedCommitment:'recovery'` ativa uma pequena janela de recuperação de movimento quando Caçador/Arcanista **realmente** lança um projétil ou prepara uma área ofensiva. O mecanismo registra `aim-recovery` para telemetria, sem adicionar golpe falso, alterar dano, atributos, cooldown, XP ou forçar vencedor. Estender `rangedCommitment` ao M10 está proibido até unificação posterior das arenas.

- `v5/phase2-combat.js`: recuperação após disparo básico de 0,48 s, após projétil de talento de 0,35 s e ao preparar magia ofensiva de área de 0,45 s. Durante a recuperação, velocidade-alvo é 60% da padrão. Sem opt-in, as trajetórias, eventos, sementes e resultados continuam iguais.
- `v5/arena-three.js` e `v5/arena-lab.js`: parâmetro `?counterplay=1` para M5, combinado opcionalmente com `?nav=steer`. Identificação visível de modo experimental no painel da partida. Teste de navegador `qa/v5-phase2-browser.cjs` assegura que esse modo é realmente passado ao motor e NÃO alcança o M10.
- `qa/v5-ranged-counterplay.cjs`: matriz pareada e reprodutível com 12 sementes em cada duelo, 16 partidas de 4 heróis e 12 de 30, com navegação `direct` e `steer`, além de replay exato. CI rules do SHA `935c8fe3` passou. Isso é uma amostra diagnóstica, não validação definitiva de justiça.

### Resultados da calibração reduzida (0,48/0,35/0,45 s; velocidade 60%)

| Cenário | Antes | Experimental |
| --- | --- | --- |
| Guardião × Caçador, 12 duelos direct | Guardião 0 / Caçador 12 | Guardião 1 / Caçador 11 |
| Guardião × Arcanista, 12 duelos direct | Guardião 0 / Arcanista 12 | Guardião 6 / Arcanista 6 |
| Guardião × Caçador, 12 duelos steer | Guardião 0 / Caçador 12 | Guardião 0 / Caçador 12 |
| Guardião × Arcanista, 12 duelos steer | Guardião 0 / Arcanista 12 | Guardião 3 / Arcanista 9 |
| 30 heróis, 12 sementes direct | Caçador 10 / Arcanista 2 | Caçador 6 / Arcanista 3 / Guardião 2 / Guerreiro 1 |
| 30 heróis, 12 sementes steer | Caçador 8 / Arcanista 3 / Guardião 1 | Caçador 7 / Arcanista 3 / Guerreiro 2 / Guardião 0 |

**Importante:** a primeira tentativa foi excessiva: durações 0,72/0,62 s e velocidade 24%, revertidas pois inverteram 12/12 dos duelos Guardião × Caçador direct. A penalidade reduzida mantém espaço real para contra-ataque, mas **não resolve** a dominância do Caçador com navegação steer. Não adotar como padrão competitivo, não reduzir dano arbitrariamente e não alterar personagem GLB.

### Prévia visual isolada

Foi publicada prévia `dpl_8BgFsrMHcToYrJbYnS8ypy63DsFk`, estado Vercel READY, projeto separado `pit-v5-coliseu-demo` (sem alias para o site oficial):
- Teste de 4 personagens, navegação steer + recuperação: https://pit-v5-coliseu-demo-5zwtzt30z.vercel.app/v5/arena-lab.html?phase2=1&count=4&nav=steer&counterplay=1
- Comparação no MESMO build de visualização sem contrajogo: https://pit-v5-coliseu-demo-5zwtzt30z.vercel.app/v5/arena-lab.html?phase2=1&count=4&nav=steer

Observação: a UI de Vercel está READY, mas não corresponde por si só a aprovação humana, FPS real, nem validação visual final. GitHub Actions de browser pode estar em execução em SHA posterior.

**Próxima investigação dentro da E:** por que Guardião continua sem alcance útil contra Caçador sob steer, apesar das janelas de recuperação; analisar uso real de `J03`, `G06` e builds que não os possuem, e checar colisores/arcos/pilares antes de qualquer habilidade passiva ou bonificação. Só depois da homologação E, avançar para F (câmera cinematográfica automática).

## Fase E — quarta rodada: vida de Guerreiro e Guardião, equilíbrio 4/30 (30/10/2026)

**Pedido do usuário:** aumentar a vida das duas classes corpo a corpo e testar até aproximar a distribuição de vitórias, preservando as quatro classes e o motor de talentos.

### Preset `e-hp2` — opt-in exclusivamente no laboratório M5

O aumento de vida é de **HP-base de 137 → 154** para Guerreiro (+17; +12,4%) e de **140 → 150** para Guardião (+10; +7,1%). Os pontos investidos em VIT/DEF seguem a mesma regra anterior; os incrementos se somam ao cálculo de HP da partida. O Caçador recebe redução experimental de alcance de 9,3 → 8,1 unidades; isso não modifica os 30 talentos nem o dano de flechas. Guardião mantém bônus de aproximação de 16% **apenas ao perseguir um inimigo de longa distância** (não é bônus global de velocidade, dano nem teleporte).

- `v5/phase2-combat.js`: novo `balancePreset:'e-hp2'`; sem parâmetro, tudo permanece com os valores antigos. A recuperação de disparo `rangedCommitment:'recovery'` e o desvio de obstáculos `navigationMode:'steer'` são opções separadas.
- `v5/arena-three.js`, `v5/arena-lab.js`: parâmetro `balance=hp2` ativa o preset somente no laboratório M5. Para reprodução da versão testada, usar `phase2=1&nav=steer&counterplay=1&balance=hp2`. O M10 continua no motor anterior.
- `qa/v5-hp-balance.cjs`: compara HP/alcance/dano/DEF/velocidade, verifica regressão do modo padrão, mesma seed reexecutável, talentos efetivamente utilizados, resultados finitos, quatro classes representadas e 120 partidas para cada formato. Foi vinculado ao workflow de regras e ao teste de navegador.

### Seleção do candidato e amostra independente

Testados incrementos progressivos (137/140 inicial; 150/155; 160/170; além de 154/150 e outros), combinações com vantagem de aproximação e ajustes graduais no alcance efetivo. Aumentar só a vida fez Guardião subir em partidas de 30 sem necessariamente melhorar Guerreiro. O candidato selecionado foi `Guerreiro HP 154 / Guardião HP 150 / Caçador alcance 8,1 / Guardião aproximação 1,16` em conjunto com recuperação de disparo moderada.

**Seleção:** 56 partidas de 4 + 56 de 30 no seed `391711+i*2663`: 4 jogadores, Guardião 13, Caçador 15, Guerreiro 17, Arcanista 11; 30 jogadores, Guardião 13, Caçador 16, Guerreiro 13, Arcanista 14.

**Holdout separado:** 120 partidas de 4 e 120 de 30, seed `8123003+i*2089`, variação de talentos por combatente `(i+j*3+7)%11`:

| Formato | Guerreiro | Arcanista | Caçador | Guardião | Média de duração | Média de talentos |
|---|---:|---:|---:|---:|---:|---:|
| 4 jogadores, 120 partidas | 33 (27,5%) | 24 (20,0%) | 36 (30,0%) | 27 (22,5%) | 31,6s | 21,5 |
| 30 jogadores, 120 partidas | 24 (20,0%) | 30 (25,0%) | 30 (25,0%) | 36 (30,0%) | 64,7s | 175,1 |

Sem aumento artificial de dano; total de 1 encerramento por tempo nos 120 torneios de 30 e nenhum nos 120 de quatro. Os números são do motor determinístico, não comprovam FPS/dispositivo real, nem equidade estatística universal para toda composição possível de builds ou distribuição de classes. O resultado atende a um **critério prático provisório de não-dominação (10–40% por classe)**, sem exigir 25% exatos nem manipular o vencedor.

### Publicação isolada

Deployment de prévia Vercel `dpl_Rany9RFYJ7XjF4rZynsYUHAN7NfA`, READY, domínio temporário `pit-v5-coliseu-demo-cp5fhmd5m.vercel.app`, sem alteração da produção, sem merge em `main`. Link de comparação experimental: https://pit-v5-coliseu-demo-cp5fhmd5m.vercel.app/v5/arena-lab.html?phase2=1&count=4&nav=steer&counterplay=1&balance=hp2.

**Próxima etapa antes de concluir Fase E:** confirmar a CI atual (inclusive browser), revisar visualmente o comportamento no celular, testar FPS/latência com 30 modelos e fazer revisão de fairness com composições de turma diferentes. Só após essa etapa iniciar a Fase F da câmera cinematográfica, conforme roadmap.

### Validação adicional: composição desigual (não é critério de 25% exatos)

Além da matriz uniforme de 4/30, foram feitas quatro rodadas com **32 partidas de 30 jogadores**, elencos aleatoriamente embaralhados contendo 12 heróis de uma classe e 6 das outras três (rotação determinística; seed `3900007+i*1907`, builds `(7*j+i*3)%11`):

| Classe que ocupa 12 das 30 posições | Guerreiro | Arcanista | Caçador | Guardião |
|---|---:|---:|---:|---:|
| Guerreiro (12) | 12 | 9 | 6 | 5 |
| Arcanista (12) | 3 | 12 | 4 | 13 |
| Caçador (12) | 5 | 6 | 8 | 13 |
| Guardião (12) | 5 | 4 | 6 | 17 |

Um jogador da classe dominante ocupa 40% do elenco; as demais classes, 20% cada. O Guardião se destacou especialmente quando há muitos Caçadores/Arcanistas, e ter 12 Caçadores não se traduziu em vitórias proporcionais. Essa é uma **ressalva real**: não afirmar equilíbrio universal ou que cada classe possui chance idêntica de vencer independentemente da composição. Testes complementares em torneios com os 30 alunos reais, distribuições variadas e builds próprias são necessários; os bônus não devem virar produção automática por conta deste experimento.

**Decisão:** o preset permanece apenas opt-in na V5 de laboratório. A meta de ausência de dominância foi atingida na matriz com classes igualmente distribuídas; o roadmap E segue aberto para composições não uniformes e inspeção visual/GPU, preservando valores de produção.

## Fase E.6 — sprites animados de talentos (30/10/2026)

**Primeira entrega implementada na branch de laboratório; sem merge em main.** O objetivo é mostrar os talentos que o motor realmente dispara, sem mudar cálculo de dano, defesa, cooldown, XP, física, atributos ou os quatro modelos GLB.

- `v5/talent-sprites.js`: 13 famílias gráficas autorais, geradas localmente em Canvas 2D: corte, barreira, raio, esquiva, fogo, gelo, cura, órbita, flecha, luz, runa, armadilha e impacto. São sequências de quadros/telas reaproveitáveis por talento, com tintas e escalas de cada classe. Não se afirma ter 120 sprites *exclusivos*: os 120 talentos do catálogo são mapeados a 12 famílias; o 13º estilo é acionado por contato real.
- `v5/arena-three.js`: cenas M5 em modo `spriteEffects:'on'` substituem o antigo VFX geométrico do talento por sprites animados a partir dos MESMOS eventos reais. Impactos reais produzem sprites adicionais sem simular dano. Máximo de 18 efeitos ativos de habilidade (9 no modo low/reduced motion) e 18 impactos; efeitos passivos discretos cedem lugar às habilidades ativas. Texturas são geradas uma vez por palco e descartadas no dispose; a geometria compartilhada dos sprites é preservada durante reset.
- `v5/arena-lab.js` e `v5/arena-lab.html`: habilitação opt-in por `?sprites=1`, apenas motor M5; sem flag, efeitos anteriores seguem disponíveis. Compatível com `?nav=steer&counterplay=1&balance=hp2`, sem alterações em M10.
- `qa/v5-talent-sprites.cjs`: verificação das 120 habilidades, 13 silhuetas e quadros adaptativos (6 normal, 3 low, 2 reduced). Passou no GitHub Actions run `40981905277` no job `rules`.
- `qa/v5-talent-sprites-browser.cjs`: verificação real de WebGL com 4 e 30 GLBs, orçamento de FX, ativação associada ao combate, reset e isolamento de M10. Salva imagem de evidência `qa/v5-arena-lab-sprites-e6.png`; aguardar resultado do job browser antes de declarar desempenho/FPS homologados.
- `qa/v5-coliseum-scale.cjs` ajustado para aceitar parâmetro apenas visual, preservando verificação do callback do motor. Em `discardEffect`, não descartar geometria global compartilhada por instâncias de THREE.Sprite.

**Dependência externa para visualização live:** Vercel está sem autorização para o projeto/time histórico nesta sessão (403 no time; autorização solicitada retornou 404). Não houve novo deployment E.6 confirmado; não reutilizar URL antiga como se incluísse sprites. Código no branch `feature/v5-arena-dos-criadores` continua verificável no GitHub.

**Etapa seguinte:** revisar screenshot / dispositivos reais, granularidade dos efeitos mais frequentes, telegraph sem criar ataques falsos, escudos/status persistentes; câmera cinematográfica somente após revisão E.5/E.6.

## E.7 — diagnóstico de travamento no fim do torneio de 30 (30/10/2026)

**Relato real do usuário:** S24, RawGitHack em Android, 30/30 GLBs carregados, aos 00:59 havia 2 vivos / 28 na arquibancada e a página parou de progredir. Usuário esclareceu que o evento é **no final**, e que os alunos usarão PCs. **Não ativar qualidade baixa globalmente nem alterar balanceamento por causa deste relato.**

**Investigação determinística ancorada no print:** seed exata `4175863657` (partida 4, M5, 30 jogadores, `nav=steer&counterplay=1&balance=hp2&sprites=1`, ritmo de dano 50%). Usando os mesmos 30 builds e parâmetros, o motor tinha exatamente dois Guardiões aos 59s, e encerrou aos **63,3s** com Guardião vencedor e 29 eliminações; `qa/v5-endgame-replay.cjs` reproduz duas vezes e verifica a finalização. Logo o motor não apresenta loop infinito nesse seed. O problema apontado é na transição gráfica/atualização da interface, não na regra de vitória.

**Fatos observáveis no código antes da correção:**
- `v5/arena-three.js` chamava `u.mixer.update(dt)` para **todos** os heróis em cada frame, inclusive 28 eliminados já sentados nas arquibancadas. Mantinha também as sombras GLB e as rotinas de animação procedural/emblemas dos espectadores ativos, embora não voltassem ao combate.
- Quando o navegador disparava `visibilitychange` com `document.hidden`, o palco chamava `pause()` silenciosamente, mas `v5/arena-lab.js` deixava o HUD como **"BATALHA EM ANDAMENTO"** e o botão como "Pausar"; ao retornar à aba parecia travado e não havia orientação de como continuar.

**Correções isoladas:**
- `v5/arena-three.js`: após eliminação, fixa uma pose GLB idle e desativa sombra e atualizações de AnimationMixer para o personagem espectador, mas mantém seu **modelo 3D visível na arquibancada**, com nome e identidade. Evita recalcular emblemas/poses e animação procedural de eliminados. Deixa a animação dos heróis vivos intacta. Expõe `data-v5-active-mixer-updates` e `data-v5-idle-spectator-mixers` para auditoria a cada segundo. Reusa `Color.setHex()` no material existente em vez de alocar `new THREE.Color` continuamente.
- Ao entrar em segundo plano, a arena emite `v5-stage-autopaused` e o painel agora sinaliza `PAUSADO — VOLTE À ABA E TOQUE EM CONTINUAR`, com o botão `▶ Continuar`. Não autorretoma em segundo plano.
- `v5/arena-lab.js`: parâmetro diagnóstico `?seed=4175863657` permite reabrir exatamente a partida reportada, sem tocar em progresso de aluno.
- `qa/v5-endgame-browser.cjs`: teste Playwright com 30 GLBs, seed do print, suspensão/retomada explícita da aba, 28 espectadores sem mixers ativos, vitória, resultado na interface e reinício. Foi adicionado também o workflow focal `.github/workflows/v5-endgame-qa.yml` para validar a falha sem depender da longa bateria de outros navegadores.

**Limite da conclusão:** estas correções eliminam dois defeitos de ciclo de vida concretos e reduzem trabalho no trecho crítico. O teste determinístico já comprovou que o motor não bloqueia aos 59s; ainda é preciso verificar encerramento completo no navegador e testar em dispositivo Android/PC reais antes de afirmar que o travamento relatado foi 100% resolvido. Visual de heróis e equilíbrio seguem iguais, e nenhuma mudança foi para `main`.

### E.7 — homologação automatizada do fim da mesma partida + redução de draw calls

**Regressão reproduzível:** `qa/v5-endgame-replay.cjs` e `qa/v5-endgame-browser.cjs`, com 30 GLBs, seed `4175863657`, M5, `nav=steer&counterplay=1&balance=hp2&sprites=1`.

Resultados GitHub Actions:
- Run [40985099967](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40985099967): browser do seed exato **PASS**, 28 espectadores e 2 mixers vivos no fim; vitória, status final e botão reiniciar; a tab pode ir para segundo plano, exibir pausa e retomar.
- Run [40985911585](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40985911585): com instâncias CC0 e geometria estática mesclada, mesmo teste **PASS**, 30 modelos carregados, 28 espectadores com 2 mixers, 29 espectadores com 1 mixer após vitória, `environment=loaded`, 136 exemplares de GLB repetido agrupados em 6 lotes; **649 meshes estáticos da cidadela mesclados em 17 lotes**, mantendo malhas e materiais originais.
- Draw calls na mesma janela automatizada de 30 personagens: **1.109 → 426** com 28 na arquibancada; final da partida **1.122 → 410**. Redução final calculada de **63,46%**. `arena-citadel.js` usa `BufferGeometryUtils.mergeGeometries` em coordenadas locais e agrupa por material, topologia e sombras; vidros translúcidos continuam separados para não alterar ordenação. `arena-three.js` usa `THREE.InstancedMesh` para GLBs repetidos das paredes e pilares, mantendo forma/textura original.
- **Limitação:** FPS observado no CI não é proxy de S24 ou PC real: Playwright usa SwiftShader/software rendering e a medição foi ~1 FPS. A otimização comprova queda de draw calls e finalização da partida, mas NÃO comprova ausência total de travamentos em hardware real ou que FPS 60 será obtido.

**Não foi ativado low global, não houve alterações de vida, dano, balanceamento, GLBs dos quatro protagonistas ou `main`.** O teste nativo de browser de seed exata e a captura do usuário permanecem evidências; pode-se comparar a mesma partida adicionando `seed=4175863657` à URL RawGitHack do SHA da branch.

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

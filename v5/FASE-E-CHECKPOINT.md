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

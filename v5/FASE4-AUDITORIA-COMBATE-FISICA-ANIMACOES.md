# V5 — Incidente de qualidade do combate (29/10/2026)

**Status:** auditoria técnica da arena isolada, sem deploy na main e sem alteração nos dados dos alunos.

## Sintomas reportados pelo professor
- Movimentos sem inércia, personagens se atravessando, projéteis passando por pilares e golpes pouco convincentes.
- Animações sempre iguais e frequentemente substituídas pela corrida logo no frame seguinte.
- O mesmo personagem vence repetidamente; escolhas não parecem influenciar a estratégia.
- Os 120 talentos projetados ainda não estão vinculados ao motor.

## Causas verificadas no código
1. O laboratório usava um **seed fixo** por missão: 10929 em M5 e 20929 em M10. Reiniciar era reproduzir condições virtualmente idênticas, inclusive a distribuição de personagens e recargas.
2. Personagens eram transladados diretamente por `f.x += direction * speed * dt`, sem suavização de velocidades ou solução de colisão entre heróis. O motor contemplava apenas obstáculos estáticos simplificados.
3. `animateModel` selecionava apenas o **primeiro** clipe de ataque compatível; `sync` retornava à animação `run` no próximo update e abortava visualmente muitos golpes.
4. Projéteis não possuíam ID estável nem checavam interseção do segmento contra pilares.
5. O `derived()` da classe Arcanista tinha escalonamento de Inteligência/Magia alto; o sobrevivente por limite de tempo era escolhido inicialmente por HP **absoluto**.
6. O motor usa somente talentos antigos de rank; os **120 talentos V5 são planejamento ainda não implementado**.

## Alterações executadas na branch isolada
- Spawn com rotação variável por seed, recargas iniciais variáveis e ação em ordem rotativa para reduzir vantagem de índice.
- Novo seed por partida; identificador visível para auditoria. **O mesmo seed continua reproduzível** no core para testes.
- Direção com aceleração e desaceleração (steering); strafe; separação entre jogadores por pares; investida temporizada para classes corpo a corpo.
- Projéteis com IDs estáveis e colisão contra os obstáculos do campo.
- Posição exibida interpolada a cada frame para suavizar o movimento sobre a simulação fixa de 20Hz.
- Ataques/lançamentos/conjurações/reações/esquivas agora ativam movimentos pelos eventos do motor, com janela de conclusão, escolha alternada de clipes GLB e VFX originais por classe.
- Reequilíbrio provisório de dano mágico, atributos de classe e resistência/recuperação dos frontliners no modo livre para 30 jogadores.

## Evidência quantitativa: benchmark de 72 partidas simuladas com 30 heróis fictícios

Amostra inicial antes do rebalanceamento (seed reproduzível):
- Arcanista 47/72; Caçador 24/72; Guardião 1/72; Guerreiro **0/72**.
- Vencedores distintos: 15. Problema sério de equilíbrio para combate corpo a corpo.

Amostra após ajustes iniciais, SHA `00877f8351679e8c46a089337c4c298392793a15`:
- Arcanista **23/72**, Caçador **36/72**, Guardião **7/72**, Guerreiro **6/72**.
- Vencedores distintos: **19**, as quatro classes conseguiram vitórias.
- Teste executado no GitHub Actions: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40867700562 .

**Limitação:** essas são 72 sementes de referência de bots com estratégias predefinidas, **não** um estudo estatístico definitivo de equilíbrio. O Caçador ainda venceu 50% das partidas nessa amostra. Este teste verifica ausência de uma classe sem vitórias e repetição excessiva, não certifica os 120 talentos.

## Passo crítico antes de promover para o jogo dos alunos

Recomendação de arquitetura: se a percepção de física continuar ruim, **substituir o resolvedor caseiro de colisões pela integração oficial RapierPhysics do Three.js** (https://threejs.org/docs/pages/RapierPhysics.html) ou Rapier JS diretamente (https://rapier.rs/docs/user_guides/javascript/getting_started_js/), em branch de migração separada. Precisamos preservar simulação determinística no servidor, 30 personagens e travamento de builds da missão 10; não trocar o motor sem testes de compatibilidade.

Aditivos visuais que ainda faltam: blend tree por classe para caminhar/golpear, root motion calibrado, impactos sincronizados no esqueleto, animações próprias para 120 talentos, câmera automática de combate e particulados adaptativos para mobile. A situação atual é **protótipo**, não jogo 3D final.

## Decisão de produto
Evitar novos cenários, classes ou cosméticos enquanto combate e experiência do espectador não tiverem sido aprovados em teste visual. A arena grande, nicks e arquibancadas são preservados na branch. Não alterar a main sem autorização explícita.

# PIT Game Jam IA V5 — A Forja dos Heróis

> **Roadmap de conclusão atualizado:** [ROADMAP-D-A-I.md](./ROADMAP-D-A-I.md). Ordem: Coliseu e arte → mecânica/física/balanceamento → **câmera cinematográfica automática** → QA final → integração com alunos → revisão e merge na `main`. As funcionalidades legadas abaixo são histórico; não indicam conclusão das fases D–I.

## Estado: branch experimental; não trocar a V3 sem validação

Branch base: `feature/pit-gamejam-v5-arena-rpg`; expansão de personagens: `feature/pit-gamejam-v5-classes-3d-real`. O caderno e as dez missões da V3 continuam funcionando; a V5 adiciona uma experiência opcional, isolada em \`/v5/index.html\`.

### O que já funciona nesta branch

- **Personagens 3D:** seis modelos GLB distintos e animados, licenciados CC0, de fontes públicas KayKit e tactical-slash. Câmera orbit, iluminação, sombras, cenário gótico, cores e fallback procedural com Three.js. Detalhes em `v5/CHARACTER-SOURCES.md`.
- **Seis classes:** Guardião (cavaleiro), Bárbaro, Arcanista, Ladino, Patrulheiro e Necromante; seis modelos GLB diferentes, seis árvores de talentos e ataques especiais por classe.
- **Build:** quatro atributos (Força, Agilidade, Espírito, Vitalidade), 6 pontos iniciais + 2 por nível, talentos com pré-requisitos. O aluno pode redistribuir pontos gratuitamente.
- **XP de confiança:** 100 XP por missão **aprovada** no banco; nota do playtest 0–10 rende 3 XP por ponto, até 30 XP bônus. O cliente não pode enviar XP nem nome. Nível máximo 11.
- **Avaliação cruzada:** disponível quando o professor libera a Missão 9. Uma avaliação (0–10 + observação) por avaliador autenticado; não permite avaliar a si mesmo; professor pode anular avaliação indevida.
- **Batalha 3D automática:** batalha entre heróis com física no plano X/Z, evasão, obstáculos, círculo de tempestade que encolhe, cooldowns, projéteis, efeitos de golpe, escudo e cura. Three.js usa um loop visual; simulação numérica usa tempo fixo para resultados previsíveis. Sem influência em notas escolares.
- **Áudio:** sintetizador Web Audio de impactos e magias, ativado apenas por gesto do usuário. Não reproduz músicas comerciais.
- **Modo demonstração:** \`v5/index.html?preview=1\` usa apenas dados fictícios, sem acesso ao servidor nem à turma.
- **Arena demonstrativa do professor:** \`v5/index.html?preview=1&mode=teacher\` com oito personagens fictícios.

### Para testar localmente (sem alterar o banco)

No terminal da raiz do repositório:

\`\`\`bash
python3 -m http.server 8899
# Abrir http://localhost:8899/v5/index.html?preview=1
# Abrir http://localhost:8899/v5/index.html?preview=1&mode=teacher
node qa/v5-core.cjs
\`\`\`

A visualização WebGL requer WebGL 2, navegador atualizado e acesso à CDN da biblioteca Three.js (`0.186.1`, MIT) e aos modelos GLB CC0 hospedados em repositórios GitHub fixados por commit. Os modelos são carregados sob demanda; no celular há limites de resolução.

### Conectar à turma real (NÃO habilitado automaticamente nesta branch)

1. **Revisar** e aplicar manualmente \`v5/migration-001.sql\` na instância Neon que contém \`pit_students\`, \`pit_student_stages\`.
2. Implantar a API \`chat-api/api/arena.js\` no projeto Vercel \`pit-game-jam-chat\`, com \`DATABASE_URL\` e \`PIT_TEACHER_PIN\` existentes. **Mudar o GitHub Pages sozinho não implanta essa API.**
3. Aluno entra normalmente em \`aluno-v3.html\` e acessa **Forjar Meu Herói**. A V5 reutiliza o token autenticado que está no navegador; não solicita nome novamente.
4. Professor entra em \`professor-v3.html\` e acessa **Arena V5**. O roster é consultado apenas com PIN válido.
5. Na Missão 9, os alunos podem avaliar um colega; o professor pode excluir avaliações indevidas pela API (moderação). As notas não alteram a nota escolar.
6. Rodar QA end-to-end do ambiente com a migração aplicada antes de apresentar à turma.

### Segurança e limites

- As builds persistidas NÃO contêm nome nem XP; são calculados novamente no servidor a cada leitura, usando \`display_name\` e status \`approved\`.
- O arquivo GLB individual no catálogo é separado da personagem da V5. A versão de seleção de classes agora carrega modelos humanoides rigados externos reais, incluindo animações, deixando as geometrias procedurais anteriores como fallback offline. Equipamentos/elmos/capas procedurais não são ainda acessórios removíveis nos GLBs reais.
- A arena cria **chaves classificatórias de até 16 heróis quando a turma ultrapassa 20 alunos**. Cada chave dura até 28 segundos simulados; os vencedores disputam uma final de até 65 segundos. O professor pode aumentar a velocidade de reprodução. Isso evita carregar 180 modelos 3D simultaneamente.
- A escolha de arma é visual; habilidades e valores de combate derivam principalmente da classe, atributos e talentos.
- Não há multiplayer competitivo real-time: o professor executa o combate automático a partir de uma lista de builds previamente sincronizadas.
- Não registrar PINs, tokens de aluno ou avaliações pessoais nos logs da interface.
- Esta migração não deve ser executada antes dos testes e da autorização do usuário.

### Próximos testes antes de considerar a V5 pronta para segunda-feira

- Browser QA real com vídeo/aceleração WebGL desktop e Android.
- Integração da API com banco de testes (nome, XP, permissões, review).
- Teste de uma turma de 20–40 heróis com chaves classificatórias e conferência dos vencedores.
- Planejamento de chaves para >48 alunos, visualização de nomes legíveis no telão e edição de notas pelo professor se necessário.
- Revisão de consumo de GPU, memória e desempenho no celular.

A versão está separada para não comprometer a oficina V3 existente.

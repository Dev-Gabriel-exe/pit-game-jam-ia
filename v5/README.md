# PIT Game Jam IA V5 — Arena dos Criadores

**Estado:** protótipo funcional isolado na branch `feature/pit-gamejam-v5-arena`. **Não fazer merge na main nem atribuir notas oficiais enquanto a validação não for concluída.**

## O que já existe

- [x] `v5/index.html`: central gótica com painel do herói e mapa da arena.
- [x] `v5/rules.js`: quatro classes, XP de missão, quatro atributos, seis talentos, progressão validada e combate automático determinístico.
- [x] `v5/arena.js`: Three.js (WebGL), cenário 3D das Ruínas da Ascensão, iluminação, névoa, câmera orbital, arena com limites e colisão simplificada, knockback, ataques especiais e efeitos visuais.
- [x] Sons sintetizados via Web Audio, sob controle expresso de ligar/desligar.
- [x] Prévia com personagens geométricos detalhados e tentativa de carregamento opcional de GLB rigged/animados de Gobkit CC0; placeholder 3D se a conexão falhar.
- [x] Personalização: classe, paleta, elmo, insígnia, pontos de força/agilidade/vitalidade/arcano e até 5 talentos (cada ramo evolui até 2 pontos).
- [x] Lê o nome do cadastro pré-existente em `pit_chat_student_v09`, mantendo a mesma grafia.
- [x] Lê via API autenticada `GET /api/classroom?action=state` somente as missões **aprovadas**. Cada aprovação vale 100 XP, até 1.000.
- [x] Salva a build **apenas no navegador** do aluno (chave associada a studentId). XP de demonstração é explicitamente fictício.
- [x] Arena com treinamento 1×1 e battle royale com adversários fictícios; painel de vida, eliminações e resultado.
- [x] Consulta **somente leitura** ao roster de alunos pelo PIN do professor. Usa nomes/XP aprovados; classes/builds dos demais ainda são **neutras provisórias**, pois as builds não ficam no servidor.

## Limitações que ainda precisamos resolver antes da oficina real

- [ ] Persistir build, classe e aparência no backend com autenticação, validação de orçamento de atributos/talentos e proteção contra alteração de XP no navegador.
- [ ] Implementar avaliação entre colegas de 0–10 **com acesso controlado**, um voto por par de alunos, impedimento de autoavaliação, possibilidade de revisão do professor, rubrica objetiva e XP bônus limitado.
- [ ] Sincronizar os perfis 3D de todos os estudantes e os seus talentos reais com a arena do professor (sem expor PIN nem tokens ao navegador de terceiros).
- [ ] Definir uma política clara para o tamanho de turmas acima de 24, como chaves eliminatórias por rodadas.
- [ ] Auditar animações/modelos GLB, LOD e desempenho em celulares modestos, inclusive modo sem WebGL e movimento reduzido.
- [ ] Conectar o botão de entrada da V5 aos menus oficiais após aprovação do professor.
- [ ] Executar ensaio com turma demonstrativa, com pelo menos 12 heróis e tempo total da batalha compatível com as seis horas da oficina.

**Importante:** o resultado do battle royale é recreativo; nunca substitui a avaliação pedagógica do jogo criado pelo aluno, nem concede XP automaticamente por posição na arena. 

## Licenças

- Three.js: MIT — https://github.com/mrdoob/three.js/blob/master/LICENSE
- Modelos opcionais GLB: Gobkit Free 3D Assets, CC0 1.0 — https://github.com/Ariescar/gobkit-free-assets/blob/main/LICENSE
- Efeitos sonoros: gerados pelo próprio código via Web Audio; sem áudio de terceiros.
- Ambientação, HUD e heróis de reserva: formas originais desenhadas com Three.js.

## Execução

A partir da raiz do repositório:

```bash
python3 -m http.server 8899
```

Abrir `http://localhost:8899/v5/index.html`. Para testar sem dados pessoais, use o modo de demonstração. Não é preciso instalar Node nem pagar por API.

## Validação

- `node qa/v5-arena-browser.cjs` (após instalar Playwright/Chromium) valida orçamento, classes, talentos, batalha e responsividade.
- CI: `.github/workflows/v5-arena-qa.yml`.

### Sequência sugerida

1. **V5.1:** aprovar estética, jogabilidade automática e duração da batalha com turma fictícia.
2. **V5.2:** persistência segura de heróis, build e XP por missão.
3. **V5.3:** playtest com avaliações 0–10, bônus XP moderado e regras de justiça.
4. **V5.4:** arena final ligada à turma real, observabilidade e performance.

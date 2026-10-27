# PIT GAME JAM IA — Roadmap V3

Atualizado em 27/10/2026. Oficina de **6 horas**, prevista para a semana de 02 a 08/11/2026 (dia exato não definido). Branch de trabalho: `feature/pit-gamejam-v3-arcade`.

## Princípios de produto

- Identidade visual oficial: fantasia gótica/medieval original, inspirada em RPGs sombrios; **não** usar artes, marcas, personagens ou trilhas licenciadas de outras franquias.
- O aluno precisa **criar** um jogo testável, não apenas responder questões sobre desenvolvimento.
- O caderno do professor precisa explicar conteúdo e mostrar exemplos vivos e completos; **sem notas de fala ou metainstruções de condução**.
- Professor e aluno seguem a mesma missão, com entrega real baseada no que foi construído; versões separadas, mas semanticamente sincronizadas.
- Fluxo visual claro: **Portal → seleção cinematográfica → missão → construir → comprovar → voltar à jornada**.
- Preferir recursos gratuitos e leves, sem exigir criação de vídeos por Google Flow ou assinatura.
- Não atribuir XP/conquistas fictícios: usar somente estados persistidos e aprovação real.
- A abordagem funcional é em **fatias verticais**: validar uma missão completa antes de propagar telas por dez missões.
- Projetos 2D e 3D são bem-vindos; para iniciantes, 2D/starter funcional é a rota mais segura; a rota 3D exige template previamente testado.

## Marcos

| Fase | Situação | Escopo | Critério de aceite |
|---|---|---|---|
| 1. Seleção de missões | **Visual aprovado**; homologação final pendente | Carrossel RPG, 10 artes WebP, molduras, transição, prévia sem login | Aceite visual obtido; não alterar indiscriminadamente o design |
| **2. Missão interna do aluno** | **Implementada; homologação pendente** | Missão 01 gótica, briefing, construção estruturada, ficha viva, rascunho individual, evidência integrada à API, prévia offline | Testes estáticos aprovados; ainda validar visual, login, envio e revisão em navegador real |
| 3. Conteúdo das dez missões | Planejada | Calibrar objetivo, conceito, ferramenta, tutorial 2D/3D, desafio autoral, evidência e fallback por missão | Todas as dez missões acionáveis, sincronizadas com as aulas e com resultados verificáveis |
| 4. Professor — visual + material | Planejada | Caderno do professor na mesma identidade; conceitos ricos, simuladores, exemplos reais do GDevelop, fase/etapa, resultados | Um professor sem preparação adicional entende cada conceito, demonstra a técnica e sabe avaliar |
| 5. Funcionalidades reais da oficina | Planejada | Login/código, PIN docente, liberação de etapas, status, rascunhos, evidências, aprovações, chat, acompanhamento, persistência | Cenários professor + 3 alunos testados sem inconsistências, vazamentos ou perda de registros |
| 6. Imersão e gamificação final | Planejada, secundária ao funcionamento | Recompensas por aprovação real, animação de conquista, sons opcionais, HUD gótico no restante do produto, otimização e acessibilidade | Experiência coerente e rápida; efeitos não atrapalham leitor de tela, usuário sensível a movimento ou laboratório |
| 7. Homologação + implantação | Planejada, crítica | URL de produção autorizada na API, ambiente de testes, testes ponta a ponta, 2D/3D, aparelhos/laboratório, backup de assets, plano B offline | Ensaio completo e checklist de prontidão; ninguém precisa instalar infraestrutura na hora da aula |

## Fase 2 — especificação concreta

**Modelo-piloto: Missão 01, O Chamado (20 min).**

1. **Abre a missão** a partir do card com uma transição original rápida e possível pular, sem bloquear teclados ou dispositivos móveis.
2. **Briefing**: objetivo claro — definir gênero, nome provisório, ação principal e condição de conclusão. Sem aula teórica no caderno do aluno.
3. **Construir**: experiência em três ações, com campos conectados ao que o aluno realmente faz:
   - Escolher gênero/protagonista;
   - Escrever “Meu jogador precisa [ação] para [objetivo]”;
   - Definir condição de vitória e feedback visível.
4. **Entregar**: gerar um registro único (nome/gênero/frase/condição), confirmar a autoria do aluno e enviar ao professor. Não pedir novas perguntas desconexas.
5. **Feedback**: estado correto (em andamento, enviado, aprovado, revisar), com retorno visível; ao voltar ao carrossel o rascunho permanece.
6. **Responsividade**: desktop, tablet e celular; controles de teclado e toque.
7. **Aparelhos reais**: teste de navegação sem cadastro na prévia e teste com API real em domínio autorizado. Não ligar a prévia pública à turma sem autenticação.
8. **Arquitetura**: preferir views/estados dedicados ao longo da mesma aplicação em vez de duplicar lógica de missão em muitos arquivos independentes.

O piloto aprova o **template**, não apenas a aparência. Só então expandir para as missões 02–10.

## Grade de seis horas — fonte de conteúdo existente

| Missão | Tempo | Produção |
|---|---:|---|
| 01 — O Chamado | 20 min | Gênero, ideia, ação, objetivo, condição final |
| 02 — MVP em Foco | 30 min | Escopo mínimo e regra principal |
| 03 — Ligar o Motor | 30 min | Projeto e Preview do GDevelop |
| 04 — Primeiro Jogável | 50 min | Movimento e limites/colisão |
| 05 — A Primeira Regra | 40 min | Condição, ação, variável e feedback |
| 06 — Forja de IA | 45 min | Um asset autoral importado e testado |
| 07 — Dar Vida ao Universo | 50 min | Começo, desafio e conclusão |
| 08 — Polimento | 40 min | Instruções, feedback e estabilidade |
| 09 — Playtest Cruzado | 25 min | Teste por colega e melhoria |
| 10 — O Lançamento | 30 min | Projeto salvo, Preview/link e apresentação |

**Total: 360 minutos**. O cronograma atual não inclui margem para atrasos; o ensaio deve identificar adaptações e contingências sem prometer produção 3D completa a todos.

## Auditoria de base existente (antes de reimplementar)

- `v2/missions.js`: já contém as 10 missões, metas, teoria, passos, critérios e entregas, incluindo os 360 minutos.
- `v3/teacher-content.js`: já contém explicações por missão e roteiros de demos, mas a riqueza didática e exemplos precisam ser homologados.
- `v3/app.js`: já contém UI de aluno/professor, chat, turma, status e evidências. Refatorar com cuidado; não duplicar API.
- `professor-v3.html`: ainda possui uma galeria anterior, visualmente diferente da do aluno.
- `aluno-v3.html`: a seleção V3 usa o tema gótico, enquanto o interior do caderno ainda conserva elementos de cor/layout anteriores.
- A prévia em `raw.githack.com` funciona apenas como **demonstração sem login**; as APIs atuais validam origem. Para aula real, confirmar hospedagem de domínio permitido e autorização do endpoint.

## Prioridades antes da oficina

**P0 (obrigatório):** Fase 2 com missão real; completar as 10 missões e seu conteúdo; professor operacional; autenticação/progresso/liberação/registro/chat na URL correta; testes ponta a ponta; kits e plano B.

**P1 (importante):** uniformizar estética do interior e professor; tutoriais visuais passo a passo; feedback das conquistas baseado em aprovação real.

**P2 (opcional, não bloquear a aula):** vídeos por Flow, efeitos sonoros elaborados, ranking público, sistema complexo de XP, avatares ou recursos que exijam créditos.

## Checklist de ensaio de produção

- [ ] Abrir o portal e ingressar como aluno a partir da URL final, sem CORS/fetch error.
- [ ] Professor autentica e libera Missão 01, depois Missão 02; aluno vê bloqueio/liberação corretos.
- [ ] 3 alunos simulados usam rotas 2D/3D e rascunhos independentes.
- [ ] Aluno realiza uma atividade, envia, recebe revisão, corrige e obtém aprovação; status e conquista refletem o banco.
- [ ] Chat individual não mistura alunos; professor vê estado e pendências.
- [ ] Rascunho resiste ao fechamento/retorno e a troca de tela sem perder dados.
- [ ] Testar no navegador de laboratório e no celular.
- [ ] Verificar fontes, assets, tempo de carregamento, responsividade e modo reduzir movimento.
- [ ] Realizar simulação da rota padrão GDevelop e versão de contingência quando ferramentas externas falham.
- [ ] Preservar branch experimental e só publicar versão de produção após aceite.

## Decisão de próxima implementação

Implementar **Fase 2 — Missão 01 ponta a ponta** antes de multiplicar telas ou investir em animações secundárias. Ao terminar, registrar no roadmap o que foi validado, o que não foi e a evidência dos testes.


## Atualização da Fase 2 — 27/10/2026

Missão 01 — O Chamado implementada na branch V3 com interface de fantasia gótica e campos de planejamento vinculados à entrega real da oficina. O carrossel Fase 1 segue intacto. Documentação detalhada em [FASE2.md](./FASE2.md). Antes de começar a expansão das 9 missões, validar o piloto no navegador real e fazer pelo menos um teste completo de cadastro, envio, revisão e aprovação. O código do professor e a API não foram modificados nesta fase.

## Consolidação do Caderno do Professor — Fase 2.5 (27/10/2026)

**Perfil didático confirmado:** professor sem experiência prévia com jogos, lecionando para estudantes de ensino superior de TI. **Sem notas de fala, sem texto de condução ao professor e sem slides superficiais.** A própria apresentação contém conceito, explicação técnica, exemplo executável e relação com a prática do aluno.

- Implementada a **Missão 01 do Professor**, com conceitos completos de game design, mecânica/dinâmica/experiência, core game loop, objetivo, regras e feedback.
- Incluído simulador de coleta de cristais e porta com lógica que pode ser testada e reiniciada, para compreender condições/ações antes de abrir o GDevelop.
- Conceitos, exemplo, criação e resultados correspondem exatamente ao registro da Missão 01 do aluno.
- **Distribuição temporal das dez missões** ajustada: maior proporção de explicação nas missões conceituais e maior peso de oficina nas missões técnicas, totalizando 360 minutos. Tempo mostrado nas abas do professor.
- Identidade gótica aplicada ao Caderno do Professor, com dez ilustrações e prévia isolada de banco de dados/`?preview=1`.
- Piloto Fase 2.5 implementado, mas **não homologado em navegador real**. As missões 02–10 do professor ainda usam o conteúdo anterior e precisam ser revistas junto com o aluno na Fase 3.
- Detalhes, matriz de horários e testes: [FASE2-5-PROFESSOR.md](./FASE2-5-PROFESSOR.md).

### Revisão de qualidade pedagógica — Caderno do Professor (27/10/2026)

A versão inicial da Missão 01 do professor foi reprovada por superficialidade técnica, estilo de texto semelhante a notas e ausência de animações. Foi substituída por `teacher-mission-one-pro.js` e `teacher-depth.css`, incluindo teoria mais precisa, código e condições verificáveis, animação de entrada de cards, comparação de gêneros, simulador com log de eventos e três casos de teste. O novo padrão é o mínimo exigido para as missões 02–10. Ainda falta homologação visual no navegador e teste presencial; **a Fase 3 continua pendente**.

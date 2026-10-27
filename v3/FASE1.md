# PIT Game Jam IA — V3 / Fase 1

**Branch:** `feature/pit-gamejam-v3-arcade`  
**Escopo:** experiência de telas e seleção das 10 missões; sem reformular os conteúdos didáticos nesta fase.

## Fluxo de navegação

1. `index.html`: portal e acesso ao caderno do aluno ou do professor.
2. `aluno-v3.html`: identificação/código de turma existentes.
3. Após autenticação e sincronização, a tela do **carrossel** abre automaticamente.
4. O aluno navega pelos 10 cards ilustrados. Os cards mostram disponibilidade/bloqueio, andamento, revisão, validação ou conclusão conforme os dados reais da turma.
5. Ao entrar na missão liberada, uma transição cinematográfica em CSS apresenta o capítulo e conduz ao caderno da missão escolhida.
6. Dentro do caderno, o botão "Escolher missão" reabre o carrossel.
7. O caderno do professor e os serviços de API/banco de dados permanecem no fluxo existente.

## Arquivos envolvidos

- `index.html`: entrada da V3 e resumo das 10 missões;
- `aluno-v3.html`: estrutura da tela separada de seleção;
- `v3/arcade-gallery.css`: cards, carrossel, transições e responsividade;
- `v3/arcade-gallery.js`: artes originais SVG, navegação e estado visual;
- `v3/app.js`: integração com liberação, progresso e abertura real da missão;
- `v2/missions.js`: fonte original das 10 missões, preservada;
- `fase1.html`: protótipo independente anterior (não é o carrossel real da sala).

## Requisitos e limites

- Navegação por botões, números 01–10, teclado e gesto horizontal.
- Cards de missões futuras devem ser visíveis como prévia, mas não acessíveis antes da liberação docente.
- Um aluno pode retornar às missões já liberadas.
- Conquistas só são mostradas como concluídas após aprovação real da entrega.
- `prefers-reduced-motion` simplifica as animações.
- O filtro de disponibilidade é apresentado na interface; a proteção real da entrega permanece sob responsabilidade da API existente.
- A transição cinematográfica usa CSS/animação original, **sem depender de vídeo externo**. Um vídeo opcional poderá ser inserido depois.
- Não inventar pontuação ou alterar automaticamente XP, status, evidências, cadastro ou chat.

## Homologação necessária antes de considerar Fase 1 concluída

- [ ] Conferir a interface em navegador real desktop e celular.
- [ ] Abrir a V3 a partir do portal e autenticar com aluno de teste.
- [ ] Confirmar a abertura automática do carrossel.
- [ ] Navegar por todas as dez missões com setas, teclado e swipe.
- [ ] Confirmar bloqueios com professor na missão 1 e aluno tentando a 2.
- [ ] Liberar a missão 2 pelo professor e verificar o estado atualizado.
- [ ] Abrir missão permitida e verificar transição → conteúdo correto.
- [ ] Voltar ao carrossel sem perder edição de trabalho/evidência.
- [ ] Validar que aprovações reais aparecem como conclusão.
- [ ] Conferir contraste, foco, leitores de tela e modo reduzir animações.
- [ ] Conferir professor, acompanhamento e chat sem regressões.

**Critério de encerramento:** todos os testes em navegador real aprovados e visual do carrossel validado pelo responsável. Somente então começar a fase pedagógica seguinte.

## Iteração dark fantasy — 27/10/2026

Referência aprovada pelo responsável: seleção visual de missões inspirada em dark-fantasy/RPG, com identidade autoral PIT Game Jam e sem usar assets proprietários de Diablo.

### Entregue nesta iteração (branch V3, sem alterar main)

- Tela de seleção reformulada em formato de trilha/carrossel horizontal responsivo, com dez missões ilustradas.
- Cenário gótico vetorial original (`v3/abyss-bg.svg`), molduras de ferro e bronze, luz de brasas e painel de abertura cinematográfica.
- Dez ilustrações vetoriais originais (`v3/mission-art.js`) inseridas nos cards com o tema visual (`v3/diablo-theme.css`).
- Cabeçalho de RPG, progresso **real** calculado apenas por missões aprovadas, nome autenticado do aluno e etapas liberadas.
- Mantidas as restrições de missão bloqueada, o registro de evidência, o caderno e a lógica existente de integração.
- Navegação por card, setas, teclas e toque, com modo de movimento reduzido.
- Verificações estáticas aprovadas: sintaxe dos 3 JS, geração das 10 ilustrações, presença dos IDs de integração, CSS balanceado, scripts incluídos e bloqueio de missão pela lógica existente.

### Pendente

- Homologação visual no navegador real e testes manuais desktop/celular.
- Testar autenticação, progressão, aprovações, bloqueio docente e abertura cinematográfica com uma turma de teste.
- Rever a qualidade gráfica com o responsável. O visual implementado usa arte vetorial, não reprodução fotográfica pixel a pixel do conceito gerado.
- Não avançar para Fase 2 até validação do responsável.

## Artes cinematográficas (fase 1: biblioteca de 10 imagens)

- Produzidas 10 artes verticais originais em WebP, com tema de fantasia gótica e cenas distintas por missão.
- Arquivos organizados em `v3/assets/missions/missao-01.webp` ... `missao-10.webp`.
- Integração de código já realizada em `arcade-gallery.js`: imagem real sobre a ilustração SVG anterior, que segue como fallback caso o arquivo esteja ausente.
- Efeitos no tema `diablo-theme.css`: movimento lento da imagem, brilho cinematográfico, hover e respeito a `prefers-reduced-motion`.
- A biblioteca de imagens está num ZIP de entrega da conversa, **ainda não publicada no GitHub**. Até o upload dos 10 WebPs para os caminhos indicados, a interface continuará mostrando as artes SVG anteriores.
- A montagem com 10 imagens também foi salva no Canva para referência de identidade visual.
- Não foram gerados vídeos. Google Flow é uma possibilidade futura para abertura de capítulo, mas não é requisito para os cards.

**Pendente desta etapa:** publicar os 10 arquivos WebP no repositório, abrir a prévia de browser e validar visualmente cada card antes de concluir a fase.

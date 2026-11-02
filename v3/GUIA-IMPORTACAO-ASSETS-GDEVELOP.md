# Guia prático — importar a biblioteca V3 no GDevelop

**Status:** instruções preparadas; importação manual no GDevelop ainda **NOT_RUN**. A aprovação dos testes de formato não equivale à homologação dentro da engine.

## Preparação

1. Na Biblioteca PIT, visualize e baixe apenas o recurso necessário. Confira a extensão .png, .wav ou .glb.
2. Abra uma **cópia** do projeto no GDevelop e salve antes de importar.
3. Registre o nome, formato e origem: “Biblioteca PIT Game Jam IA V3 — recurso procedural autoral”.

## PNG — personagem, item ou mapa

A biblioteca também inclui a **Coruja mecânica** (personagem), o **Jardim bioluminescente** (mapa) e a **Ampulheta do tempo** (item). São imagens originais geradas localmente; o mapa não possui colisões e a ampulheta não implementa temporizador por si só.

1. Na cena, crie um objeto **Sprite** para personagem/item e selecione o PNG baixado como imagem.
2. Para mapas, use o PNG como imagem de cenário (1024 × 576); ele **não** contém colisões ou tilemap configurado. Acrescente colisões separadamente.
3. Execute **Preview** e verifique escala, posição e transparência do Sprite.
4. Salve e reabra o projeto; confira se a imagem permanece associada ao objeto.

## WAV — efeito sonoro

1. Abra os eventos da cena e adicione uma ação de reproduzir som quando ocorrer uma ação concreta (coleta, dano ou vitória).
2. Selecione o WAV baixado como recurso. Não dependa de autoplay.
3. Execute **Preview**, acione o evento e confirme que o áudio é audível e não repete indevidamente.
4. Salve e reabra o projeto para verificar a referência ao recurso.

## GLB — modelo 3D

1. Use cena e objeto **3D Model** compatíveis com a versão instalada do GDevelop; GLB **não** é Sprite 2D.
2. Selecione o GLB baixado como recurso do modelo e ajuste posição, escala e orientação.
3. Execute **Preview** e confira geometria e material. Os cinco modelos da biblioteca são **estáticos low-poly**, sem animações de esqueleto.
4. Salve e reabra o projeto. Se a importação não funcionar, registre o erro e utilize PNG como alternativa, sem declarar que o GLB foi homologado.

## Procedência e direitos de uso

Os PNGs, GLBs e WAVs desta biblioteca são **gerados proceduralmente pelo próprio projeto**, sem incorporar arquivos de jogos comerciais. A indicação “uso didático” na interface descreve a finalidade, **não é uma licença pública de redistribuição**. Como o repositório ainda não apresenta um arquivo `LICENSE` na raiz, a distribuição externa de pacotes de assets deve aguardar uma licença definida pelo responsável. Registre a origem no projeto do aluno e não atribua licenças de terceiros.

## Evidência da Missão 06

Preencha: **recurso**, **formato**, **origem**, **objeto/cena**, **resultado do Preview** e **erro ou ajuste necessário**. Anexe uma captura real do GDevelop mostrando o recurso no jogo. A prévia no portal e o download isolado **não comprovam importação**.

## Checklist de homologação pendente

- [ ] Importar PNG transparente, salvar e reabrir.
- [ ] Importar PNG de mapa e testar cena/colisões.
- [ ] Reproduzir WAV por evento e salvar/reabrir.
- [ ] Importar GLB em objeto 3D, testar material/escala e salvar/reabrir.
- [ ] Conferir interface mobile/dispositivo físico e registrar limitações.

**Limites:** 39 PNG, 5 WAV, 5 GLB; os testes automatizados cobrem geração, decodificação e estrutura, não a execução dentro do GDevelop. Nenhum serviço pago é necessário para este roteiro. A interface pode mudar conforme a versão do editor.


## Biblioteca Arcana — natureza Quaternius e efeitos para talentos (02/11/2026)

**No portal:** abra \`index.html#recursos\`. O botão “🗂️ Recursos” do Caderno do Aluno encaminha para essa biblioteca. Os modelos e kits abaixo são **opcionais**, e não modificam as dez missões, a aprovação, os talentos da arena V5 ou o XP. Não é necessário baixar todos.

### Caminho A — natureza estilizada em 3D

1. Na Biblioteca Arcana, abra a categoria **Mapas e cenários** e localize **Natureza Estilizada · Quaternius**. A página oficial exibe o catálogo completo e uma seleção gratuita (a licença da edição escolhida deve ser conferida).
2. Para começar sem converter arquivos, procure os três cards individuais **Árvore estilizada · modelo 1**, **Árvore estilizada · modelo 2** e **Arbusto estilizado 3D** e clique em **Baixar GLB**. São cópias otimizadas e reais, já usadas na arena experimental.
3. No GDevelop, abra a cena → **Objetos** → **+** → **3D Model** → selecione o GLB baixado. Coloque o objeto na cena e ajuste escala, posição e orientação.
4. Clique em **Preview**. Os objetos são apenas visuais: vegetação não bloqueia o jogador até você adicionar a colisão ou o comportamento adequado.
5. Para usar outros itens da edição gratuita original com formato glTF/OBJ/FBX, converta no Blender para formato **glTF Binary (.glb)** antes da importação.

### Caminho B — magia, defesa, fogo e impactos 2D

Três pacotes de efeitos CC0 estão na aba **Magias e talentos** do portal:

| Pacote | Conteúdo | Site oficial |
|---|---|---|
| Kenney Particle Pack | 80 imagens para fogo, fumaça, partículas e impactos | https://kenney.nl/assets/particle-pack |
| Foozle Pixel Magic Effects | 10 animações 32×32 de fogo, terra, vento, água, explosão e portal | https://foozlecc.itch.io/pixel-magic-sprite-effects |
| PVFX Foundry | Efeitos animados de combate, proteção, status e suporte, 96×96 | https://nerijs.itch.io/pvfx-foundry |

1. Escolha um pacote na aba **Magias e talentos**, abra o site do autor e faça o download gratuito. Extraia o ZIP.
2. Para uma sequência de PNGs, GDevelop → **Objetos** → **+** → **Sprite** → **Adicionar animação** → **Adicionar Sprite**. Selecione os quadros na ordem.
3. Para uma imagem com vários quadros (spritesheet), no editor de Sprite escolha **Editar com Piskel → Importar → Importar como sprite sheet** e informe as dimensões dos quadros. Salve os quadros na animação.
4. Marque **sem loop** para explosões, golpes e impactos únicos; use loop apenas em auras ou efeitos contínuos. Ajuste o tempo entre quadros.
5. Em **Eventos**, crie o Sprite do impacto no momento da colisão/ação. Remova a instância após a animação terminar, evitando acumular dezenas de objetos.
6. Teste no **Preview**. Uma animação visual não aumenta dano, cura ou protege automaticamente; essas regras são programadas separadamente.

### Caminho C — partículas 2D ou 3D

1. Abra o **Kenney Particle Pack** e selecione uma textura adequada (faísca, explosão, fumaça).
2. No GDevelop, adicione um objeto **2D Particle Emitter** ou, para um projeto tridimensional, **3D Particle Emitter**.
3. Configure emissão por **Imagem**, escolha a textura, ajuste duração, fluxo, velocidade, escala e cores.
4. Crie o emissor em um evento real (por exemplo, quando o jogador coleta um item). Limite a quantidade para evitar travamentos.
5. No Preview, verifique se o efeito acontece no lugar e momento corretos.

**Tutoriais oficiais:** [Objeto 3D](https://wiki.gdevelop.io/gdevelop5/objects/3d-model/), [Sprites animados](https://wiki.gdevelop.io/gdevelop5/objects/sprite/), [Importar spritesheet](https://wiki.gdevelop.io/gdevelop5/tutorials/piskel-sprite-sheets/) e [Partículas](https://wiki.gdevelop.io/gdevelop5/objects/particles_emitter/).

**Licenças e cuidados:** Kenney, Foozle e PVFX Foundry indicam CC0 nos pacotes listados. A página de 2024 do Stylized Nature MegaKit indica CC0, enquanto a Quaternius também publica termos mais recentes para outras distribuições; consulte a licença do arquivo baixado antes de redistribuir. Não republique pacotes de terceiros como se fossem próprios. Os VFX 2D apresentados são inspirações para os alunos e possíveis candidatos a adaptação futura em sprites/billboards na arena Three.js, **não são efeitos 3D implementados nem teste de compatibilidade com os 120 talentos da V5**.

**Evidência recomendada na oficina:** escreva nome do recurso, criador, formato e licença; execute o Preview e registre uma captura real do asset no seu jogo. A presença de uma miniatura no portal, sozinha, não prova importação no editor.


## KayKit Character Animations e Adobe Mixamo — 02/11/2026

**Para iniciar:** Biblioteca Arcana → Personagens 3D → KayKit · Animações de Personagens 1.1 ou Adobe Mixamo. Os links levam aos autores.

### KayKit (principal — CC0)
1. Abra https://kaylousberg.itch.io/kaykit-character-animations e obtenha a versão FREE 1.1. Separe Rig_Medium para KayKit Adventurer padrão; Rig_Large é para personagens maiores.
2. Arquivos Rig_Medium_*.glb contêm apenas animações de esqueleto. Sozinhos, não apresentam personagem visível. No Blender, reúna o personagem e a animação no mesmo rig, exportando um GLB com malha, ossos e animações. O GDevelop não une dois GLBs separadamente por retarget automático.
3. GDevelop → Objetos → + → 3D Model → importe o GLB completo. Em Animations, registre Idle/Running/Attack/Block conforme as animações do arquivo.
4. Na aba Eventos, troque a animação conforme a jogabilidade. Idle/Running repetem; Attack/Hit terminam sem loop. Teste Preview, posicionamento e colisão. Movimentos não mudam dano nem hitbox automaticamente.
5. Nossa arena Three.js usa os GLBs CC0 do KayKit 1.1 com compatibilidade de ossos e fallback dos clipes originais.

### Adobe Mixamo (opcional — licença Adobe, não CC0)
1. Acesse https://www.mixamo.com/ com Adobe ID gratuita. Escolha um personagem ou envie humanoide em pose neutra. O auto-rig atende bípedes.
2. Selecione a animação, ajuste a velocidade e baixe FBX.
3. Para usar com KayKit, faça retarget do esqueleto no Blender, pois o rig Mixamo difere do Rig_Medium. Exporte um GLB completo com malha e animação.
4. Importe GLB no objeto 3D Model do GDevelop, controle a animação nos eventos e valide Preview.
5. **Licença:** a Adobe permite uso em jogos comerciais e pessoais, mas impede redistribuir arquivos de personagens/animações brutos como pacotes públicos. Não coloque FBX/GLB bruto do Mixamo em bibliotecas públicas, ZIPs ou no GitHub. Aqui disponibilizamos somente link e instruções.

Fontes: https://wiki.gdevelop.io/gdevelop5/objects/3d-model/ ; https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html ; https://community.adobe.com/questions-696/mixamo-faq-licensing-royalties-ownership-eula-and-tos-589400

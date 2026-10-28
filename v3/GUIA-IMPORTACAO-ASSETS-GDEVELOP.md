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

# Kenney Particle Pack 1.1 — visual FX art for PIT Game Jam IA V5

The 10 PNGs in this directory are unmodified, real transparent textures from **Kenney Particle Pack 1.1** by **Kenney Vleugels**, CC0-1.0. The same textures are credited by the creator and mirrored by the Godot community. They are used **only in visual layers**, composited locally into the existing animated CanvasTextures for the arena's 120 canonical talent cues.

- Original asset page: https://kenney.nl/assets/particle-pack
- License: see [LICENSE.txt](./LICENSE.txt) — Creative Commons Zero (CC0 1.0), no attribution required.
- Pinned upstream mirror: https://github.com/Calinou/kenney-particle-pack/tree/ab7086639ee73be31abd87feb21bf1402d4e8144/addons/kenney_particle_pack
- Files retained unchanged: slash_02.png, circle_05.png, magic_03.png, trace_04.png, flame_04.png, twirl_02.png, light_03.png, star_07.png, scorch_01.png, spark_04.png

## Visual mapping

Arc/blade = slash_02; shield/ward = circle_05; bolt and rune = magic_03; dash and arrow = trace_04; fire = flame_04; frost/orbit = twirl_02; healing = light_03; radiance = star_07; trap = scorch_01; hit impact = spark_04.

The 13 existing procedural shapes and eight animation frames remain the main timeline; these genuine images add a visually rich silhouette. Normal and low quality reuse the *same* frame texture budget (104 / 39; reduced motion 26). No additional sprite objects are created, and this never changes damage, HP, cooldown, talent IDs, progress, student accounts or gameplay balance. If a PNG fails, the procedural fallback remains. Use `?kenneyfx=0` on a lab URL to compare with the original visuals; sprites can also be disabled with `?sprites=0` as before.

# KayKit Character Animations Free 1.1 (CC0)

These five GLBs contain real skeletal animation tracks authored by **Kay Lousberg (KayKit)** for Rig_Medium humanoids. They are not rendered character meshes and should not be imported alone as a GDevelop 3D Model. They augment the four existing Adventurer models in the Three.js arena (no new player model or gameplay changes).

- Original pack: https://kaylousberg.itch.io/kaykit-character-animations
- Mirror with pinned commit: https://github.com/NoLimitNexus/game-models/tree/d188ebf93ceb3c4b95ba9bc6b1856cd1fd34915d/library/animations
- Licence: CC0 1.0 Universal; see LICENSE.txt, mirrored from the author.
- Files: Rig_Medium_General.glb (idle/hit/death), Rig_Medium_MovementBasic.glb (run/walk), Rig_Medium_MovementAdvanced.glb (dodge), Rig_Medium_CombatMelee.glb (attack/block), Rig_Medium_CombatRanged.glb (bow/magic).

GLTFLoader fetches a group only once, then each hero binds a small set of motion clips to **its own clone of the KayKit skeleton**. Tracks must match sufficient local bones to be accepted; clip root translation is stripped to prevent visual motion breaking the battle coordinates. The original embedded KayKit animations remain the fallback if an external group fails or bones do not match. This never changes combat, talent IDs, XP, statistics or multiplayer state.

**Adobe Mixamo:** documentation/link only at https://www.mixamo.com/. Unlike this CC0 pack, Mixamo's raw animation files are NOT included in this repository nor downloadable through the student resource library. See Adobe's official FAQ and terms.

# Pokémon War

A Fire Emblem–style tactics game with Pokémon Mystery Dungeon sprites. Combat happens on the map; moves work like weapons.

**Play:** https://ngtrooper.github.io/pokemon-war/

## What's in it
- Two armies: **Red Army** (Kanto) vs **Green Army** (Johto), 4 chapters each with rising difficulty
- Moves as weapons: Power, Hit, Crit, Range, PP; equip from the Items menu
- Physical/special damage split; type matchups shift Hit (+20 / −20) and damage (+10% / −10%)
- Same-type moves get +15 Hit; FE-style two-roll hit chance (the forecast shows the true %)
- 71 Kanto and 48 Johto basic Pokémon to recruit (stats generated from official base stats via `@pkmn/dex`)
- Recruit gacha: ₽300 a pull; legendary 1% (pseudo-legendaries), rare 9%, uncommon 35%, common 55%; 5% shiny; 3-repeat shiny meter; rare guaranteed every 10 pulls; extra copies become TM tokens
- TM shop to teach moves (up to 4 per Pokémon)
- No permadeath; progress saves in your browser
- **Tester tools** on the chapter screen: money, tokens, levels, unlock chapters, add Pokémon

## Feedback for testers
Note which route/starter you used, the chapter, and anything that felt unfair, too easy, or confusing.

## Development
- `src/index.src.html` is the source; `python3 tools/build.py` writes `index.html`.
- `tools/gen.js` + `tools/mk.js` (needs `npm i @pkmn/dex`) regenerate the basic-Pokémon roster into `AUTO_SPECIES`.
- `tools/build_atlas.py <SpriteCollab checkout> atlas` rebuilds sprite atlases (one per Pokémon, loaded on demand) and the shared portrait sheet.

## Credits
Sprites and portraits: *Pokémon Mystery Dungeon* (Spike Chunsoft), via the [PMDCollab SpriteCollab](https://github.com/PMDCollab/SpriteCollab) project.
Pokémon © Nintendo / Game Freak / The Pokémon Company. Non-commercial fan project, not affiliated with or endorsed by them.

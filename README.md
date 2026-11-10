# Embervale

An original browser action RPG in the style of classic 2D MMORPGs, built as a single file: `index.html`. It needs no build step or dependencies. Open it in a browser and play.

## Features
- Click-to-move with A* pathfinding, click-to-attack auto combat, WASD movement
- Six stats (STR / AGI / VIT / INT / DEX / LUK) with rising point costs
- Separate base and job levels. Reach Job Lv 10 as a Novice, then choose a calling:
  - **Warden**: melee tank (Cleave, Whirlwind, Iron Will)
  - **Arcanist**: spellcaster (Ember Bolt, Frost Nova, Arc Storm)
  - **Ranger**: archer (Twin Shot, Arrow Rain, Hawk Eye)
  - **Cleric**: battle healer (Smite, Mend, Blessing)
- 11 monster types across 4 regions, plus the Ashen Warlord world boss, who telegraphs a ground slam
- Rare **sigils**: every monster can drop one. Socket it into gear with a free slot for a permanent bonus.
- The town of Hearthvale has a shop (buy and sell), a guild hall (class change), a chapel (free heal) and a waystation (fast travel)
- Minimap, hotbar, sitting to regenerate, death penalty, and autosave to localStorage

## Controls
| Input | Action |
|---|---|
| Click ground / monster / NPC | Walk / attack / talk |
| WASD or arrow keys | Move |
| 1–4 | Skills |
| 5–8 | Red, Amber and Blue Tonic, Hearth Scroll |
| Tab | Target the nearest monster |
| C / I / K / H | Stats / Items / Skills / Help |
| X | Sit and rest |
| Esc | Close the window and clear the target |

## Regions
Hearthvale (town) → Greenmoss Meadow (Lv 1–10) → Whispering Woods (10–20) → Ashen Dunes (20–32) → Cinder Crypt (32+, boss)

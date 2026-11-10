# Embervale

An original browser action RPG in the style of classic 2.5D MMORPGs (isometric camera, upright sprites), built as a single file: `index.html`. It needs no build step or dependencies. Open it in a browser and play.

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
- **Original soundtrack**: a theme for each region plus a boss battle theme, synthesised live with the Web Audio API (no audio files)
- **Sound effects** for hits, misses, magic, arrows, level-ups, loot and rare sigil drops, plus a ringing critical hit with screen shake
- **Play together**: everyone who has the shared page open sees each other walk around, with chat bubbles over their heads and in the log. This uses the claude.ai artifact live room; the standalone file runs solo.
- **Emotes**: 12 hand-drawn emotes (heart, GG, sweat drop, and more), shown over your head to everyone nearby. Use the Emote button, the E key, or /heart, /gg and so on in chat.
- **Party bonus**: hunting near another player gives you both +25% EXP, and you can see each other's HP bars
- **World announcements**: everyone online hears about level milestones, class changes, rare sigils, finished contracts and boss kills
- **Hunting contracts** from Guildmaster Corvin, matched to your level, for bonus EXP and gold
- **Hats**: 8 cosmetic headgear items with small stat bonuses. Two are sold in town and the rest are rare drops (the Ember Crown comes from the boss). Other players see your hat.
- **Frostpeak Pass**: a sixth region (Lv 42+) with snowy pines, three new monsters and its own theme music
- **Ambient weather**: fireflies, drifting sand, rising embers, snowfall and petals, different in each region
- **Auto-hunt**: fights the nearest monster and drinks tonics when HP runs low, which helps on phones
- **Phone-friendly**: tap to walk, attack and talk, plus big round Attack / Sit / Chat / sound buttons

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
| Enter | Chat |
| E | Emotes |
| Esc | Close the window and clear the target |

## Regions
Hearthvale (town) → Greenmoss Meadow (Lv 1–10) → Whispering Woods (10–20) → Ashen Dunes (20–32) → Cinder Crypt (32–45, boss) → Frostpeak Pass (42+)

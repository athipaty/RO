# Embervale

An original browser action RPG in the style of classic 2.5D MMORPGs (isometric camera, upright sprites). It needs no build step: open `index.html` in a browser and play.

Play online: https://ro-six-bay.vercel.app/ (add `?room=yourname` to the link for a private room with friends). See [ROADMAP.md](ROADMAP.md) for what is coming next.

## Project layout
| Path | What is in it |
|---|---|
| `index.html` | Page markup (HUD, panels, title screen and character creator) |
| `css/style.css` | All styles |
| `js/data.js` | Classes, items, monsters, regions, skills, small utilities |
| `js/audio.js` | Synthesised soundtrack and sound effects |
| `js/net.js` | Multiplayer (presence, chat, emotes, online list) |
| `js/world.js` | Player state, region generation, pathfinding, stats |
| `js/combat.js` | Combat, loot, items, skills, shared monsters, the update loop |
| `js/render.js` | Drawing the world, characters, monsters and effects |
| `js/ui.js` | HUD, panels, input, save/load, character creator, main loop |
| `tools/export-world.js` | Exports maps, monsters and drops to `tools/embervale-world.json` for the game server (copy it to center-kitchen-backend `routes/embervale/world.json` whenever regions, monsters or drops change) |
| `tests/` | Browser tests: `cd tests && npm install && npm test` (needs Chrome or Edge) |

## Features
- **Character creator**: choose a hairstyle, hair colour, eyes and skin with a live preview. Other players see your look.
- Click-to-move with A* pathfinding, click-to-attack auto combat, WASD movement
- Six stats (STR / AGI / VIT / INT / DEX / LUK) with rising point costs
- Separate base and job levels. Reach Job Lv 10 as a Novice, then choose a calling:
  - **Warden**: melee tank (Cleave, Whirlwind, Iron Will)
  - **Arcanist**: spellcaster (Ember Bolt, Frost Nova, Arc Storm)
  - **Ranger**: archer (Twin Shot, Arrow Rain, Hawk Eye)
  - **Cleric**: battle healer (Smite, Mend, Blessing)
- At Job Lv 40, take Corvin's trial to become one of two **advanced callings** per class, each with 3 new skills: Bulwark or Ravager (Warden), Stormcaller or Hexweaver (Arcanist), Sharpshooter or Wildstalker (Ranger), Templar or Oracle (Cleric). You keep every first-job skill, and you pick which skills sit on hotbar keys 1–4 from the skill tree.
- **Quests**: a 10-chapter story, *The Ember Below*, that starts with Elder Hollis by the fountain and leads through every region to the Ashen Warlord, plus daily quests from Warden Pell, Ilsa and Scout Kade. NPCs talk in a dialogue window, a gold **!** marks a new quest and **?** one to hand in. Press J for the quest log; the pinned quest shows in your status box.
- 11 monster types across 4 regions, plus the Ashen Warlord world boss, who telegraphs a ground slam
- **Party support**: Mend, Blessing, Sanctuary, Divine Grace, Holy Aegis, War Cry and Swift Step also reach party members standing nearby.
- **Dungeon**: stairs in Whispering Woods lead down into the Mossdeep Caverns, three dark floors (Lv 18–37) with six new monsters and the Gloomcap King at the bottom.
- **Guilds** (accounts, saved on the game server): found one for 10,000 gold with a name and emblem, invite from the online list, leader/officer/member ranks, a guild notice, and guild chat (/g or the Guild tab) across every channel. The guild name and emblem show under each member's name.
- **Follow**: press Follow next to a party member (or /follow Name) to walk behind them, through gates into other regions too.
- **Day and night, weather**: a 24-minute day with dark nights; rain, fog, sandstorms, snow and blizzards by region, the same for everyone. /time tells the time; weather effects can be turned off.
- **Duels**: challenge a player in the same region (online list or /duel Name); after a countdown, fight until one falls to 1 HP. Nobody dies or loses EXP, and the winner is announced.
- **Mini-bosses**: the Hopper Chieftain (meadow), Greymane Alpha (woods), Scarab Queen (dunes) and Frost Matron (Frostpeak) each lead an escort pack, call fallen escorts back below 60% and 30% HP, and drop their own accessory.
- **World bosses** (run by the game server): the Thornmother, Dune Tyrant or Rimeheart Colossus appears in its region about every 30 minutes and everyone online is told where. The top damage dealer is the MVP and wins a rare hat.
- **Ground loot**: monsters drop items and gold on the ground with a set chance (shown when you target them); click to pick it up, auto-hunt collects it too
- Rare **sigils**: every monster can drop one. Socket it into gear with a free slot for a permanent bonus.
- The town of Hearthvale has a shop (buy and sell), a guild hall (class change), a chapel (free heal) and a waystation (fast travel)
- Minimap, hotbar, sitting to regenerate, death penalty, and autosave (to the server when logged in, otherwise to this device)
- **Builds**: every first job has about 10 skills (passives plus attacks that grow with one stat) but earns only 49 skill points, so heroes of the same job play differently: a STR axe Warden, an AGI crit duelist or a VIT wall; an INT nuker, a DEX quick-caster or a Mana Shield battle mage; a DEX double-shot archer, a LUK crit sniper or an AGI skirmisher; a mace battle priest, a guardian or a healer. Advanced callings add a build passive and a stat-scaled attack each (Rampage, Chain Lightning, Curse of Frailty, Rapid Fire, Exorcism…), master callings a mastery passive and a signature move (Execution, Tempest, Unmaking, Killing Shot, Stampede…). Gear, forged pieces, brews and about 40 monster sigils add attack speed, cast speed, crit damage, double attack, damage reduction and healing power to push a build further.
- **Gemcutter Sela (Aurelmark)**: awaken gear for a random build line (Faint, Bright or Radiant) you can keep or throw back and re-roll, and fuse three spare sigils into a new one, sometimes a stronger Radiant sigil only fusion makes.
- **Build guide** (Skills window or /build): three builds per job with the route to master calling, stat ratio, skills in order, gear, sigils and awaken lines. Follow one and the Skills and Status windows mark your next skill and stat.
- **Pushcart** (rent from the storage keepers, /cart) and a **Sigil album** (/album): fill a region's page of sigils for a permanent bonus, all six for +1 every stat.
- **Three advanced callings per job**: Warden → Bulwark, Ravager or **Runeguard** (rune knight); Arcanist → Stormcaller, Hexweaver or **Chronomancer** (time magic); Ranger → Sharpshooter, Wildstalker or **Falconer** (falcon companion); Cleric → Templar, Oracle or **Ascetic** (fighting monk). Each new one rises into its own master calling: Runelord, Timeweaver, Skywarden, Lotus Sage.
- **Three character slots** per account (or per device for guests), all sharing one storage at the Warehouse and the Royal Bank. Switch characters from Settings.
- **Original soundtrack**: a theme for each region plus a boss battle theme, synthesised live with the Web Audio API (no audio files)
- **Sound effects** for hits, misses, magic, arrows, level-ups, loot and rare sigil drops, plus a ringing critical hit with screen shake
- **Play together**: everyone who has the shared page open sees each other walk around, with chat bubbles over their heads and in the log. On claude.ai this uses the artifact live room; anywhere else (e.g. Vercel) players meet through a free public MQTT broker, so anyone with the link can join. Chat over the public broker is not private.
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
| X | Sit and rest (while sitting, WASD / arrows or a click turn you in place) |
| Enter | Chat |
| E | Emotes |
| Esc | Close the window and clear the target |
| F1–F8 | Hotbar slots (same as 1–8) |
| Insert | Sit / stand |
| Alt+E / Alt+S / Alt+A | Items / Skills / Stats |
| Alt+L | Emotes |
| Alt+V / F12 | Hide the status box / hotbar |
| Click dropped loot | Walk over and pick it up |

## Regions
Hearthvale (town) → Greenmoss Meadow (Lv 1–10) → Whispering Woods (10–20) → Ashen Dunes (20–32) → Cinder Crypt (32–45, boss) → Frostpeak Pass (42+)

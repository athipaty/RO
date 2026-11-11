# Embervale roadmap

We build the game stage by stage. Each stage ends with `npm test` passing (see `tests/`) and a push, which deploys to Vercel.
Everything stays original: a classic 2.5D MMO feel, but no names, art, maps or music from other games.

## Stage 1: Foundation and character creator ✅ (v0.7.0)
- [x] Split `index.html` into `css/style.css` and `js/*.js` (no build step)
- [x] Browser tests in the repo: `cd tests && npm install && npm test`
- [x] Character creator: hairstyle, hair colour, eyes, skin, with a live turning preview
- [x] Chosen look is saved and shown to other players
- [x] Version shown on the title screen
- [x] Private rooms: add `?room=yourname` to the link to play only with friends who use the same link

## Stage 2: Own game server and accounts
Server code lives in center-kitchen-backend (`routes/embervale/`, `models/embervale/`), Socket.IO namespace `/embervale`.
- [x] 2a. Live play through our own server (public broker kept only as a fallback)
- [x] 2a. Sign up / log in; characters saved in MongoDB (play from any device), move a guest character into an account
- [x] 2a. Channels: busy rooms split into channels of 40
- [x] 2b. Server runs monsters, drops and damage checks (player-hosted monsters only as a backup)

## Stage 3: Social
- [x] Player shops: sit with a sign, others click to buy
- [x] Parties: invite, shared EXP, party chat, party members on the minimap
- [x] Two-sided trade window (both players confirm)
- [x] Whispers, friends list, chat tabs (all / party / whisper)
- [x] Party loot rules: each their own or take turns (v0.35.0, server)

## Stage 4: Items and progression
- [x] Equipped gear visible on the character (body armour v0.36.0; weapons and hats earlier), item details, equipment window
- [x] Gear upgrading +1 to +10 with failure chance at high levels (smith)
- [x] Storage NPC, weight limit, item rarity colours
- [x] Second-tier jobs (2 per class) and a skill tree screen (v0.15.0)

## Stage 5: World and content
- [x] New regions and multi-floor dungeons (Mossdeep Caverns, v0.19.0)
- [x] Story quests with NPC dialogue, daily quests (v0.16.0)
- [x] World bosses on timers with an MVP reward for top damage (v0.17.0)
- [x] Timed events: EXP Weekend, Golden Hour, seasonal Hearthvale (v0.39.0)

## Stage 6: Guilds and PvP
- [x] Guilds: create, emblem, ranks, guild chat (v0.20.0)
- [x] Arena: 1v1 and team duels with rankings (v0.43.0: Ember Arena, ranked 1v1 and 2v2, top 20)
- [x] Guild-versus-guild territory event (v0.44.0: Emberkeep guild war, nightly 20:00)

## Stage 7: Polish and launch
- [x] Phone performance, settings menu, key remapping (v0.40.0: Settings window with volumes, interface size, performance mode and key remapping)
- [x] Moderation: report, mute, admin panel (mute v0.41.0; reports and admin window v0.42.0, server PR needed)
- [x] Error logging, backups, hosting cost review (v0.45.0: Admin → Errors, backup download, docs/OPERATIONS.md)
- [x] Public landing page (v0.46.0: welcome.html)

---

# Feature backlog (classic 2.5D MMO feel, all original content)
Size: S small · M medium · L big · (server) needs Stage 2b. Ticked items are live.

### Characters and look
- [ ] 1. M Male/female body choice in the creator
- [ ] 2. M Equipped gear visible on the body (armour colour, cape, shield, weapon on back)
- [ ] 3. S Lower/middle headgear slots (glasses, masks, mouth items)
- [x] 4. M Hair dye / stylist NPC (v0.49.0: Lune the Stylist in Hearthvale)
- [x] 5. M More animations: casting pose, hurt frame, death pose, per-weapon attacks (melee swing v0.43.0; casting, flinch and falling v0.50.0)
- [x] 6. S Status icons over heads (buffs, poison, stun)

### Combat feel
- [x] 7. S Attack speed you can see (swing speed follows ASPD, Attacks/sec in Stats)
- [x] 8. S Cast bars for spells, cancelled by moving, interrupted by being hit
- [x] 9. S "Dodge" and "Lucky!" dodge text (LUK)
- [x] 10. M Elements and an element damage chart
- [ ] 11. M Monster size and race bonuses
- [x] 12. M Status ailments (poison, stun, freeze, sleep, silence, blind)
- [x] 13. S Weight penalties: 50%+ no regen, 90%+ cannot fight
- [ ] 14. S Potion cooldowns tuned for melee play
- [ ] 15. M Monster skills (heal, summon, ranged spells, teleport)
- [ ] 16. M Looter monsters and monsters that call friends

### Items and economy
- [x] 17. S Item weight and carry limit (STR raises it)
- [x] 18. M Refining +1 to +10 with failure chance
- [ ] 19. M Slotted gear variants (0-4 sigil slots)
- [x] 20. S Rarity colours and world announcements for rare drops
- [x] 21. M Storage NPC (cart still to do)
- [x] 22. M Crafting and brewing (v0.48.0: 9 brews and 9 forged pieces from monster materials, /craft)
- [x] 23. L (server) Player shops while sitting
- [x] 24. L (server) Trade window
- [x] 25. S Gold sinks: inn with a Well rested EXP bonus, stat and skill resets (v0.28.0; travel fares already existed, no repairs)

### Classes and skills
- [x] 26. M Skill tree screen with prerequisites
- [x] 27. L Second jobs (2 per class) with a job quest (v0.15.0)
- [ ] 28. L Rebirth / third tier
- [x] 29. M Support skills on other players (needs parties) (v0.18.0)
- [ ] 30. M Ground-target skills (walls, traps, safe zones)
- [x] 31. S Choose which skill level to cast (v0.27.0)

### World and exploration
- [ ] 32. M A capital city with districts, themed towns
- [ ] 33. M Named warp portals and a teleport NPC network
- [x] 34. M Multi-floor dungeons (v0.19.0)
- [x] 35. S More teleport items: Waystone Shard, Kinship Charm (v0.30.0)
- [x] 36. M Day/night and weather per map (v0.26.0)
- [x] 37. S Bigger minimap and a world map (v0.29.0)
- [x] 38. S Region name banner on entry
- [ ] 39. M 40+ monsters with elements, sizes, races

### Monsters and bosses
- [x] 40. L (server) Timed world bosses with an MVP reward (v0.17.0)
- [x] 41. M Mini-bosses with minions (v0.22.0)
- [x] 42. S Monster info window (right-click or the Info button)
- [x] 43. M Pets (v0.47.0: tame with a Taming Charm, Pet Snacks, bonuses, /pet)
- [ ] 44. M Mounts

### Social
- [x] 45. M (server) Parties
- [x] 46. M (server) Whispers and friends (block list still to do)
- [x] 47. S Chat commands: /help /where /who /sit /stand /exp /roll /emotes /clear
- [ ] 48. M (server) Chat rooms
- [x] 49. L (server) Guilds with emblems (v0.20.0)
- [ ] 50. L (server) Guild war
- [ ] 51. M (server) PvP arenas and duels (duels done in v0.21.0; arena and rankings still to do)
- [x] 52. S More emotes and an emote bar (v0.51.0: 24 emotes, quick bar of favourites on E)
- [ ] 53. S Partner system

### Quests and events
- [x] 54. M NPC dialog windows with portraits and choices (v0.16.0)
- [x] 55. M Quest log with tracking (v0.16.0)
- [x] 56. M Daily hunting board (covered by Guildmaster Corvin's hunting contracts and the daily quests)
- [ ] 57. M Seasonal events
- [x] 58. S Achievements and titles (v0.47.0: 23 achievements, titles under names, /ach)

### Interface
- [ ] 59. M Classic basic-info window
- [x] 60. M Equipment window with a paper doll
- [x] 61. S Draggable windows that remember their place (v0.34.0)
- [ ] 62. S Several hotbar rows with drag and drop
- [x] 63. S Floating "+EXP / +Job" gains, EXP per hour (/exp)
- [x] 64. S Name colours (players, nearby allies, guests, calm/aggressive monsters, bosses)
- [x] 65. S Shift-click to attack in place (v0.32.0)
- [x] 66. S Screenshot key (v0.52.0: P, or Photo in the phone menu)

### Sound and atmosphere
- [ ] 67. S Footsteps that change with the ground
- [ ] 68. S Ambient sounds per map
- [ ] 69. M More original music themes
- [x] 70. S Level-up light pillar, also seen on other players (v0.32.0)

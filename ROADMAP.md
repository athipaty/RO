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
- [ ] 2b. Server runs monsters, drops and damage checks (no cheating, no "host player")

## Stage 3: Social
- [ ] Parties: invite, shared EXP, party chat, party members on the minimap
- [ ] Two-sided trade window (both players confirm)
- [ ] Whispers, friends list, chat tabs (all / party / whisper)
- [ ] Party loot rules (free-for-all or round-robin)

## Stage 4: Items and progression
- [ ] Equipped gear visible on the character, item tooltips, equipment window
- [ ] Gear upgrading +1 to +10 with failure chance at high levels
- [ ] Storage NPC, weight limit, item rarity colours
- [ ] Second-tier jobs (2 per class) and a skill tree screen

## Stage 5: World and content
- [ ] New regions and multi-floor dungeons
- [ ] Story quests with NPC dialogue, daily quests
- [ ] World bosses on timers with an MVP reward for top damage
- [ ] Timed events (EXP weekends, seasonal map)

## Stage 6: Guilds and PvP
- [ ] Guilds: create, emblem, ranks, guild chat
- [ ] Arena: 1v1 and team duels with rankings
- [ ] Guild-versus-guild territory event

## Stage 7: Polish and launch
- [ ] Phone performance, settings menu, key remapping
- [ ] Moderation: report, mute, admin panel
- [ ] Error logging, backups, hosting cost review
- [ ] Public landing page

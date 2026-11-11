# Running Embervale

How to keep an eye on the game, back it up, and what it costs to host. Last reviewed 2026-11-11 (v0.45.0).

## Where things run

| Part | Where | Notes |
|---|---|---|
| The game (HTML/JS) | Vercel, https://ro-six-bay.vercel.app | Pushing the game repo's branch deploys it. Static files only. |
| Game server | Render web service `center-kitchen-backend` (Singapore, Standard plan: 1 CPU, 2 GB) | Shared with the Center Kitchen app. Auto-deploy is off: merge, then deploy. |
| Database | MongoDB from `MONGO_URI` | Embervale uses its own collections: `ember_accounts`, `ember_guilds`, `ember_reports`, `ember_keeps`, `ember_errors`. |
| Backup chat | broker.emqx.io (public MQTT) | Only used when the game server can't be reached. |

Settings on Render that matter to Embervale: `EMBERVALE_JWT_SECRET` (logins) and `EMBERVALE_ADMINS` (comma-separated account names that get the Admin window).

## Error log

Every player's game reports script errors to the server (`js/errlog.js`). Errors are grouped by message and place, counted, and kept to the most recent 300. Errors from browser extensions are ignored, and each visit sends each error once (at most 10).

**To check:** log in with an admin account, open **Admin → Errors**. Each row shows the message, the file and line, how many times it happened, the game version, and who hit it last. **Details** shows the browser and the stack. **Clear** removes a row after it's fixed.

A good habit: look after each release and once a week.

## Backups

**Admin → Errors → Download a backup** saves one JSON file with every account (character, arena record, mutes and bans, but never password hashes), every guild, all reports and the Emberkeep owner. The server route is `GET /api/embervale/admin/backup` (admin login required).

- Download one **before every server release** and **once a week**. Keep the last few.
- The file holds players' characters and account names, so store it somewhere private.
- If the database is MongoDB Atlas on the free tier, Atlas does not take automatic backups, so these files are the backup. A paid Atlas tier adds automatic snapshots.
- To restore a character, copy its `character` object from the file back onto the account in the database (ask Claude to write a small restore script when needed).

## Hosting cost review (2026-11-11)

Measured on Render for the last 7 days (the whole service, including Center Kitchen):

| | Used | Limit |
|---|---|---|
| CPU | about 0.2% average | 1 CPU |
| Memory | 230–295 MB | 2 GB |
| Bandwidth, quiet hours | 0.5–1.5 MB per hour | |
| Bandwidth, play sessions (Nov 10–11) | up to about 140 MB per hour; about 0.7 GB over the 12 busiest hours | |

**What this means**

- The server is far from busy. Even play sessions barely move CPU and memory, so **no upgrade is needed**.
- Bandwidth is the cost to watch. It grows with players **in the same region** (each one's updates go to everyone else there). A rough guide: a session with a handful of friends uses 0.1–0.15 GB per hour, so playing every evening would come to roughly 5–15 GB a month. Check the bandwidth included with your Render workspace in **Billing**; at this level it should stay within the allowance.
- Moving down to a smaller Render plan would save money but is risky: the Center Kitchen app runs in the same service and memory already sits around 250–300 MB.

**Watch for**

- Memory climbing past about 1.2 GB, or CPU above 50% during play: time for a bigger plan, or to move Embervale to its own service.
- Bandwidth jumping without more players: ask Claude to look at what the server is sending.

**Other Render services in the workspace** (not used by Embervale): `gear-fight` and `gear-fight-ghosts` (free), `direkair` (static, free), `milk-backend` (suspended).

## Release checklist

1. `cd tests && npm test` passes.
2. For server changes: run the server tests against a local copy (see the notes at the top of each `*.test.js` that needs `EMBER_SERVER`), open a PR on center-kitchen-backend, **download a backup**, merge, deploy, check the live server.
3. Push the game; check that Vercel serves the new `VERSION`.
4. Look at Admin → Errors after people have played.

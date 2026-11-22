// Play-test bots: a few heroes that play Embervale on the live site for a while, so testers find the world busy.
// Each bot is its own browser session: it makes a hero, hunts with auto-hunt in a region that suits its level,
// spends stat points, levels First Aid, gets back up after dying, rests when it runs out of tonics, and now and
// then sends an emote. It never chats, trades, or accepts invites. Everything stops after HOURS.
//
//   node tools/bots.js                      4 bots for 3 hours on https://ro-six-bay.vercel.app/
//   BOTS=Mira,Kade HOURS=1 node tools/bots.js
//   GAME_URL=... LOG=bots.log node tools/bots.js
// Needs Playwright with a Chromium (or set BROWSER to a Chrome/Chromium path).
const { chromium } = require('playwright');
const fs = require('fs');
const URL = process.env.GAME_URL || 'https://ro-six-bay.vercel.app/';
const NAMES = (process.env.BOTS || 'Mira,Kade,Pim,Toby').split(',').map(s => s.trim()).filter(Boolean);
const HOURS = +process.env.HOURS || 3;
const LOG = process.env.LOG || '';
const END = Date.now() + HOURS * 3600 * 1000;
// how each bot spends stat points: a rough build so they don't all look the same
const BUILDS = [['str', 'agi', 'vit'], ['agi', 'dex', 'luk'], ['vit', 'str', 'dex'], ['dex', 'agi', 'vit'], ['str', 'vit', 'luk']];
const log = m => { const line = `${new Date().toISOString().slice(11, 19)} ${m}`; console.log(line); if (LOG) fs.appendFileSync(LOG, line + '\n'); };
const wait = ms => new Promise(r => setTimeout(r, ms));

// runs inside the game page every 20 s
const tick = build => {
  const out = { ok: true };
  if (typeof P === 'undefined' || !P || !running) return { ok: false };
  // back on our feet
  if (P.dead) { const r = document.getElementById('reviveBtn'); if (r) r.click(); out.revived = true; return out; }
  // close any window that opened (level-up notes, NPCs)
  try { if (!panel.hidden) closePanel(); } catch (e) {}
  // stat points: keep a 2:1:1 mix of the build's stats
  try { let guard = 50; while (P.statPts > 0 && guard--) { const want = [build[0], build[0], build[1], build[2]][guard % 4]; const c = statCost(P.st[want]); if (P.statPts < c || P.st[want] >= 99) break; P.st[want]++; P.statPts -= c; } S = computeStats(); } catch (e) {}
  // First Aid up to 5 (a Novice's job story needs it), then anything learnable on the bar
  try { if (P.skillPts > 0 && SKILLS.firstaid && (P.skills.firstaid || 0) < 5) { P.skills.firstaid = (P.skills.firstaid || 0) + 1; P.skillPts--; } } catch (e) {}
  // pick the region that suits the level (open fields only, no dungeons or boss maps)
  const fields = Object.keys(ZONES).filter(id => { const D = ZONES[id]; return D.mobs && D.mobs.length && !D.safe && /^Lv \d+/.test(D.lvl || '') && !/dungeon|boss|PvP|war/i.test(D.lvl); })
    .map(id => { const m = /Lv (\d+)\D+(\d+)/.exec(ZONES[id].lvl); return { id, lo: +m[1], hi: +m[2] }; });
  const fit = fields.filter(f => P.lv >= f.lo && P.lv < f.hi).sort((a, b) => b.lo - a.lo)[0] || fields.filter(f => P.lv >= f.lo).sort((a, b) => b.lo - a.lo)[0] || fields[0];
  if (fit && zoneId !== fit.id) { enterZone(fit.id); out.moved = fit.id; }
  // tonics: buy a few when in town money allows (no shop trip: straight from the general store's list)
  try { const red = invFind('red'); if ((!red || red.n < 3) && P.gold >= 150) { for (let i = 0; i < 8 && P.gold >= ITEMS.red.price; i++) { P.gold -= ITEMS.red.price; giveItem('red', 1); } } } catch (e) {}
  // too heavy: drop the cheapest loot so auto-hunt keeps going
  try { if (P.heavy) { const etc = P.inv.filter(e => ITEMS[e.id].type === 'etc').sort((a, b) => ITEMS[a.id].price - ITEMS[b.id].price)[0]; if (etc) { P.gold += sellValue(etc.id) * (etc.n || 1); P.inv.splice(P.inv.indexOf(etc), 1); } } } catch (e) {}
  // hunting: auto on, picking up only valuable things; if it paused (no tonics, low HP) sit until healthy
  if (!P.auto) { if (P.hp < S.maxhp * .6) { P.sitting = true; } else { P.sitting = false; try { setAutoLoot(false, true); } catch (e) {} P.auto = true; const a = document.getElementById('autoBtn'); if (a) a.classList.add('on'); } }
  // now and then, a friendly emote
  if (Math.random() < .03 && typeof doEmote === 'function') { try { doEmote(['smile', 'note', 'gg', 'star', 'heart'][Math.floor(Math.random() * 5)]); } catch (e) {} }
  try { save(); } catch (e) {}
  Object.assign(out, { lv: P.lv, jl: P.jl, hp: Math.round(P.hp), zone: zoneId, gold: P.gold, online: NET.status, others: NET.others.size });
  return out;
};

async function runBot(browser, name, i) {
  const ctx = await browser.newContext({ viewport: { width: 640, height: 360 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => log(`${name}: page error ${e.message}`));
  const start = async () => {
    await page.goto(URL, { waitUntil: 'load', timeout: 90000 }); await wait(3000);
    // continue the saved hero (same browser session) or make a new one
    await page.evaluate(n => { const c = document.getElementById('contBtn'); if (c && !c.hidden) c.click(); else { document.getElementById('nameIn').value = n; document.getElementById('newBtn').click(); } }, name);
    await wait(4000);
    // play a little quieter: Performance mode, no sound
    await page.evaluate(() => { try { SETS.lite = true; saveSets(); applySets(); } catch (e) {} try { setAudio(false, false); } catch (e) {} });
  };
  await start(); log(`${name}: in the game`);
  let last = '', fails = 0;
  while (Date.now() < END) {
    await wait(20000 + i * 1500);
    try {
      const r = await page.evaluate(tick, BUILDS[i % BUILDS.length]);
      if (!r.ok) { if (++fails >= 6) { log(`${name}: not responding, reloading`); await start(); fails = 0; } continue; }
      fails = 0; const s = `Lv ${r.lv} job ${r.jl} ${r.zone} ${r.online}`;
      if (s !== last || r.moved || r.revived) { log(`${name}: ${s}${r.moved ? ' (moved)' : ''}${r.revived ? ' (revived)' : ''} · gold ${r.gold} · ${r.others} others online`); last = s; }
    } catch (e) { log(`${name}: ${e.message.split('\n')[0]}, reloading`); try { await start(); } catch (e2) {} }
  }
  try { await page.evaluate(() => { try { P.auto = false; save(); } catch (e) {} }); } catch (e) {}
  await ctx.close(); log(`${name}: done`);
}

(async () => {
  const browser = await chromium.launch(process.env.BROWSER ? { executablePath: process.env.BROWSER, args: ['--no-sandbox'] } : {});
  log(`starting ${NAMES.length} bots for ${HOURS} h on ${URL}`);
  await Promise.all(NAMES.map((n, i) => wait(i * 8000).then(() => runBot(browser, n, i).catch(e => log(`${n}: stopped (${e.message})`)))));
  await browser.close(); log('all bots finished');
})();

// Monsters walk around trees and rocks (v1.45.3): a chasing monster or boss reaches you even with an obstacle between,
// and one walking home does not get stuck on a wall.
const pptr = require('puppeteer-core');
const { BROWSER, wait } = require('./helpers');
const GAME = process.env.GAME_URL || ('file://' + require('path').resolve(__dirname, '../index.html').split(String.fromCharCode(92)).join('/'));
module.exports = async t => {
  const browser = await pptr.launch({ executablePath: BROWSER, headless: true });
  try {
    const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(GAME + '?room=mp' + Date.now() + '&server=http://127.0.0.1:9');
    await page.evaluate(() => { localStorage.clear(); document.getElementById('nameIn').value = 'Bait'; document.getElementById('newBtn').click(); }); await wait(2500);
    const r = await page.evaluate(() => { running = false; P.hp = 1e9; const res = {};
      const chase = (m, x, y) => { const others = mobs.filter(o => o !== m), was = others.map(o => o.dead); others.forEach(o => o.dead = true);
        P.x = x; P.y = y; const d = m.d, x0 = m.x, y0 = m.y; m.state = 'chase'; m.aggroed = true; m.sx = x0; m.sy = y0; const reach = (d.range || 0) + d.size + PR + 4; let got = false;
        for (let s = 0; s < 360 && !got; s++) { now += 1 / 30; updateMob(m, 1 / 30, mobTargets()); m.atkT = 99; m.slamT = now + 99; got = Math.hypot(P.x - m.x, P.y - m.y) <= reach + 2; }
        others.forEach((o, j) => o.dead = was[j]); m.x = x0; m.y = y0; m.state = 'idle'; return got; };
      for (const id of ['woods', 'deep2', 'deep3', 'molten2']) { enterZone(id); let n = 0, ok = 0, blocked = 0, bok = 0;
        for (const m of mobs) { if (m.dead) continue;
          for (let k = 0; k < 40; k++) { const a = k * 2.4, R = 150 + (k % 3) * 20, x = m.x + Math.cos(a) * R, y = m.y + Math.sin(a) * R, i = Math.floor(y / TILE) * Z.w + Math.floor(x / TILE);
            if (x > 0 && y > 0 && canStand(x, y, PR) && Z.reach[i]) { const behind = !mobClear(m.x, m.y, x, y, Math.min(m.d.size * .6, 11)); const got = chase(m, x, y); n++; if (got) ok++; if (behind) { blocked++; if (got) bok++; } break; } } }
        res[id] = { n, ok, blocked, bok }; }
      // walking home around a wall: start the monster far off on the other side and let it return
      enterZone('woods'); let m = null, home = null;
      for (const o of mobs.filter(o => !o.dead)) { if (home) break; m = o;
      for (let k = 0; k < 400 && !home; k++) { const i = Z.spawnTiles[(k * 37) % Z.spawnTiles.length], x = (i % Z.w + .5) * TILE, y = (((i / Z.w) | 0) + .5) * TILE;
        if (Math.hypot(x - m.sx, y - m.sy) > 200 && Math.hypot(x - m.sx, y - m.sy) < 360 && !mobClear(x, y, m.sx, m.sy, 9)) home = { x, y }; } }
      let back = null; if (home) { m.x = home.x; m.y = home.y; m.state = 'return'; m.retT = 0; P.x = -9999; for (let s = 0; s < 300 && m.state === 'return'; s++) { now += 1 / 30; updateMob(m, 1 / 30, []); } back = m.state === 'idle' && Math.hypot(m.x - m.sx, m.y - m.sy) < 10; }
      res.home = { found: !!home, back }; return res; });
    for (const id of ['woods', 'deep2', 'deep3', 'molten2']) { const z = r[id];
      t.ok(z.n > 10 && z.ok / z.n >= .93, `${id}: monsters reach a player 150-190px away (${z.ok}/${z.n})`);
      if (z.blocked) t.ok(z.bok / z.blocked >= .85, `${id}: also when a tree or rock is in the way (${z.bok}/${z.blocked})`); }
    t.ok(r.home.found && r.home.back, 'a monster walking home goes around the wall and gets there ' + JSON.stringify(r.home));
    t.ok(!errors.length, 'no script errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  } finally { await browser.close(); }
};

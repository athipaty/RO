// (v1.60.2) Play-testing the land: in every region with its own land, walk between random places the way the game
// follows a path. Nobody gets stuck against a bank or a tree, nobody stops short, every place you can reach can be tapped
// to, and long walks round (more than 2.2x the straight line) stay rare.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Walker', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(() => { running = false; const out = {};
      for (const id of Object.keys(LV_DESIGNS)) { enterZone(id); P.hp = 1e9; mobs.length = 0; const L = Z.lvd, W = Z.w, T = TILE;
        const reach = lvReachable(Z, L), cells = []; for (let i = 0; i < reach.length; i++) if (reach[i]) cells.push(i);
        let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        const o = { stuck: 0, short: 0, nopath: 0, detour: 0, trips: 0 };
        for (let k = 0; k < 70; k++) { const a = cells[Math.floor(rnd() * cells.length)], b = cells[Math.floor(rnd() * cells.length)]; if (a === b) continue; o.trips++;
          const ax = (a % W + .5) * T, ay = (((a / W) | 0) + .5) * T, bx = (b % W + .5) * T, by = (((b / W) | 0) + .5) * T;
          P.x = ax; P.y = ay; P.path = []; P.target = null; P.sitting = false; P.blockN = 0; P.reTries = 0;
          if (!pathTo(bx, by, true)) { o.nopath++; continue; }
          let len = 0, px = P.x, py = P.y; for (const q of P.path) { len += Math.hypot(q.x - px, q.y - py); px = q.x; py = q.y; }
          const straight = Math.hypot(bx - ax, by - ay); if (straight > 200 && len / straight > 2.2) o.detour++;
          // the game's own way of following a path (js/combat.js), 60 steps a second
          let still = 0, lx = P.x, ly = P.y, steps = 0;
          while (P.path.length && steps < 6000) { steps++; const w = P.path[0], dx = w.x - P.x, dy = w.y - P.y, d = Math.hypot(dx, dy), st = S.speed / 60;
            const ok = d <= st ? moveEnt(P, dx, dy, PR) : moveEnt(P, dx / d * st, dy / d * st, PR); if (ok && d <= st) P.path.shift();
            if (ok) P.blockN = 0; else if ((P.blockN = (P.blockN || 0) + 1) > (d <= st ? 1 : 6)) { P.blockN = 0; const goal = P.path[P.path.length - 1]; P.path = []; if (goal && (P.reTries = (P.reTries || 0) + 1) <= 2) pathTo(goal.x, goal.y, true); }
            if (!P.path.length) P.reTries = 0;
            if (Math.abs(P.x - lx) < .01 && Math.abs(P.y - ly) < .01) { if (++still > 30) break; } else still = 0; lx = P.x; ly = P.y; }
          if (P.path.length && still > 30) o.stuck++; else if (Math.hypot(P.x - bx, P.y - by) > 40) o.short++; }
        out[id] = o; }
      running = true; return out; });
    const bad = Object.entries(r).filter(([, o]) => o.stuck || o.short || o.nopath).map(([id, o]) => `${id}: stuck ${o.stuck}, short ${o.short}, no path ${o.nopath}`);
    const trips = Object.values(r).reduce((a, o) => a + o.trips, 0);
    t.ok(!bad.length, `walking ${trips} trips across ${Object.keys(r).length} regions: never stuck, never stopped short, never without a path ${bad.join('; ')}`);
    const long = Object.entries(r).filter(([, o]) => o.detour > o.trips * .08).map(([id, o]) => `${id} ${o.detour}/${o.trips}`);
    t.ok(!long.length, 'long walks round (over 2.2x the straight line) stay rare in every region ' + long.join(', '));
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

// (v1.55.0) Raised ground (js/heights.js): wild regions get plateaus with cliff walls and stairs. Cliffs block walking
// both ways, the stairs join the levels, paths go round to them, things on top are drawn raised, a tap on the top
// lands there, and melee does not reach across a cliff.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Climber', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('meadow'); const L = Z.lvd; out.has = !!L && L.plats.length > 0;
      out.towns = ['town', 'capital'].every(id => { const z = getZone(id); if (z.lvd === undefined) lvGen(z); return !z.lvd; });
      const p = L.plats[0], rp = p.ramp, cx = (p.x + p.w / 2) * TILE, cy = (p.y + p.h / 2) * TILE;
      out.raised = Math.round(proj(cx, cy).y) === Math.round((cx + cy) * ISO / 2 - L.H);
      const sp = proj(cx, cy), back = unproj(sp.x, sp.y); out.tap = Math.hypot(back.x - cx, back.y - cy) < 2;
      // the wall: standing just in front of the plateau's front-left side, a step "into" it is refused
      const wx = (p.x + 0.5) * TILE, wy = (p.y + p.h) * TILE + PR + 2;
      P.x = wx; P.y = wy; P.path = []; P.target = null;
      const y0 = P.y; for (let k = 0; k < 20; k++) moveEnt(P, 0, -3, PR); out.wall = P.y >= (p.y + p.h) * TILE + PR - 1 && P.y <= y0;
      // from the ground, a path to the top goes up the stairs
      const ok = pathTo(cx, cy, true); const stairs = P.path.some(q => { const i = lvTile(L, q.x, q.y); return i >= 0 && L.c[i] >= 2; });
      const raw = findPath(Math.floor(P.x / TILE), Math.floor(P.y / TILE), Math.floor(cx / TILE), Math.floor(cy / TILE)) || [];
      out.path = ok && raw.some(q => L.c[lvTile(L, q.x, q.y)] >= 2);
      // walk it for real
      for (let k = 0; k < 80 && P.path.length; k++) await sleep(100);
      out.top = lvH(L, P.x, P.y) === L.H; out.where = [Math.round(P.x), Math.round(P.y), Math.round(cx), Math.round(cy)].join(',');
      // from the top you cannot step off the edge
      const ex = (p.x + p.w) * TILE - PR - 1, ey = (p.y + 0.5) * TILE; P.path = []; P.x = ex; P.y = ey;
      for (let k = 0; k < 20; k++) moveEnt(P, 3, 0, PR); out.edge = P.x <= (p.x + p.w) * TILE - PR + 1;
      // melee across a cliff: no; on the same level: yes
      out.melee = !lvReach({ x: cx, y: cy }, { x: cx, y: (p.y + p.h) * TILE + 20 }) && lvReach({ x: cx, y: cy }, { x: cx + 20, y: cy });
      // nothing you could reach before is cut off (every region)
      let cut = 0; for (const id of Object.keys(ZONES)) { const z = getZone(id); if (z.lvd === undefined) lvGen(z); if (!z.lvd) continue;
        const a = lvReachable(z, null), b = (z._lvR = z.lvd.ramps, lvReachable(z, z.lvd.c)); delete z._lvR; for (let i = 0; i < a.length; i++) if (a[i] && !b[i]) { cut++; break; } }
      out.cut = cut;
      return out;
    });
    t.ok(r.has && r.towns, 'wild regions get plateaus; Hearthvale and Aurelmark stay flat');
    t.ok(r.raised && r.tap, 'a point on a plateau is drawn higher, and a tap there lands on the top');
    t.ok(r.wall, 'you cannot walk into a cliff wall from below');
    t.ok(r.path, 'a path from the ground to the top goes up the stairs');
    t.ok(r.top, `walking it brings you onto the top (${r.where})`);
    t.ok(r.edge, 'you cannot step off the edge from the top');
    t.ok(r.melee, 'melee does not reach across a cliff, but does on the same level');
    t.ok(r.cut === 0, `no region has a place cut off by its plateaus (${r.cut})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

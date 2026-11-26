// v1.60.5: one drawing error used to stop the game loop for good (the game froze until a reload); now the frame is
// skipped, the game keeps running, and the error is still reported (once) so tests and the console see it.
// Also: the city wall sections are cached pictures whose "was it wiped" check spot is painted.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Guard', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => { const R = render; let n = 0; render = function () { if (n++ < 3) throw new Error('frame-guard-test'); return R.apply(this, arguments); };
      const t0 = now; await new Promise(r => setTimeout(r, 1000)); render = R; return { advanced: now - t0 > .5, calls: n }; });
    t.ok(r.advanced && r.calls > 10, `the game keeps running after drawing errors (${r.calls} frames drawn)`);
    const told = g.page.errors.filter(e => /frame-guard-test/.test(e)).length;
    t.ok(told === 1, `the drawing error is reported once (${told})`);
    const w = await g.ev(async () => { enterZone('capital'); await new Promise(r => setTimeout(r, 300)); running = false;
      for (const b of Z.buildings.filter(b => b.kind === 'wall')) { P.x = (b.x + b.w / 2) * TILE; P.y = (b.y + b.h / 2) * TILE; render(); } running = true;
      const walls = Z.buildings.filter(b => b.kind === 'wall').map(b => BLD_CACHE.map.get(b.x + ',' + b.y + ',' + b.name)).filter(Boolean);
      let cleared = 0; const C = bldCacheClear; bldCacheClear = function () { cleared++; return C.apply(this, arguments); };
      for (let i = 0; i < BLD_CACHE.map.size; i++) bldCacheCheck(true); bldCacheClear = C;
      return { walls: walls.length, all: Z.buildings.filter(b => b.kind === 'wall').length, cleared }; });
    t.ok(w.walls === w.all && w.all > 0, `each city wall section is a cached picture (${w.walls}/${w.all})`);
    t.ok(w.cleared === 0, 'the wiped-picture check passes on every cached picture (no needless redraw every 10 s)');
    t.ok(g.page.errors.filter(e => !/frame-guard-test/.test(e)).length === 0, 'no other script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

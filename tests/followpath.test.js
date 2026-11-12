// following around obstacles: when the spot behind the leader is blocked, the follower still gets there
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Walker', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => { enterZone('meadow');
      // find a tree (blocked tile) with walkable ground next to it, put the "leader" right beside it
      let leader = null, blocked = null;
      for (let y = 3; y < Z.h - 3 && !leader; y++) for (let x = 3; x < Z.w - 3 && !leader; x++) { const i = y * Z.w + x; if (!BLOCK[Z.t[i]]) continue;
        for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) { const j = (y + dy) * Z.w + (x + dx); if (!BLOCK[Z.t[j]] && Math.hypot(Z.spawn.x - (x + dx + .5) * TILE, Z.spawn.y - (y + dy + .5) * TILE) < 900) { leader = { x: (x + dx + .5) * TILE, y: (y + dy + .5) * TILE }; blocked = { x: (x + .5) * TILE, y: (y + .5) * TILE }; break; } } }
      if (!leader) return { skip: true };
      // stand on the far side of the tree so the "one step behind" point lands on the tree
      const dx = leader.x - blocked.x, dy = leader.y - blocked.y; P.x = blocked.x - dx * 3; P.y = blocked.y - dy * 3; if (!canStand(P.x, P.y, PR)) { P.x = Z.spawn.x; P.y = Z.spawn.y; }
      P.path = []; const d = Math.hypot(leader.x - P.x, leader.y - P.y); const ok = followGo(leader.x, leader.y, d); const end = P.path[P.path.length - 1];
      return { ok, near: end ? Math.hypot(end.x - leader.x, end.y - leader.y) < 100 : false }; });
    t.ok(r.skip || (r.ok && r.near), 'the follower finds a way to the leader even when the spot behind them is blocked');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

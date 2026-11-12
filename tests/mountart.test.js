// mount artwork (gallop that follows movement, dust, sparkles) and buildings dressed for their trade
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Rider', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.lv = 30; P.mounts = ['hopper', 'greylupe']; enterZone('capital', 'town'); P.x = 40 * TILE; P.y = 21 * TILE;
      let art = 0; const o = drawMountArt; drawMountArt = (...a) => { art++; return o(...a); }; mountUp('greylupe'); const sparks = MART.spark.length; await w(300);
      const ph0 = MART.phase.get('me'); pathTo(P.x - 400, P.y, true); await w(700); const ph1 = MART.phase.get('me'), dust = MART.dust.length; P.path = []; await w(500); const ph2 = MART.phase.get('me'); await w(300); const ph3 = MART.phase.get('me');
      drawMountArt = o; const icon = mountIconURL('hopper').length;
      return { art, sparks, stride: ph1 - ph0, still: Math.abs(ph3 - ph2), dust, icon }; });
    t.ok(r.art > 5, 'mounts are drawn with their own artwork');
    t.ok(r.sparks >= 10, 'mounting up throws a burst of sparkles');
    t.ok(r.stride > 3 && r.still < .5, `the stride follows real movement and settles when you stop (${r.stride.toFixed(1)} vs ${r.still.toFixed(2)})`);
    t.ok(r.dust > 0, 'running kicks up dust');
    t.ok(r.icon > 1000, 'the stable shows the new artwork');
    const b = await A.ev(async () => { enterZone('town'); let n = 0; const roles = new Set(); const o = dressBuilding; dressBuilding = bb => { n++; roles.add(bb.npc && bb.npc.role); return o(bb); }; await new Promise(r => setTimeout(r, 400)); dressBuilding = o; return { n, roles: [...roles].sort().join() }; });
    t.ok(b.n > 3 && ['shop', 'smith', 'heal', 'warp', 'storage', 'job'].every(x => b.roles.includes(x)), 'every town building is dressed for its trade: ' + b.roles);
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

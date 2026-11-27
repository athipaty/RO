// mount artwork (gallop that follows movement, dust, sparkles) and buildings dressed for their trade
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Rider', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.lv = 30; P.mounts = ['hopper', 'greylupe']; enterZone('capital', 'town'); P.x = 40 * TILE; P.y = 21 * TILE;
      let art = 0; const o = drawMountArt; drawMountArt = (...a) => { art++; return o(...a); }; mountUp('greylupe'); const sparks = MART.spark.length; await w(300);
      const ph0 = MART.phase.get('me'), x0 = P.x; pathTo(P.x - 400, P.y, true); for (let k = 0; k < 30 && Math.abs(P.x - x0) < 160; k++) await w(100); /* until it has really walked a way (slow machines take longer) */ const ph1 = MART.phase.get('me'), dust = MART.dust.length; P.path = []; await w(500); const ph2 = MART.phase.get('me'); await w(300); const ph3 = MART.phase.get('me');
      drawMountArt = o; const icon = mountIconURL('hopper').length;
      return { art, sparks, stride: ph1 - ph0, still: Math.abs(ph3 - ph2), dust, icon }; });
    t.ok(r.art > 5, 'mounts are drawn with their own artwork');
    t.ok(r.sparks >= 10, 'mounting up throws a burst of sparkles');
    t.ok(r.stride > 3 && r.still < .5, `the stride follows real movement and settles when you stop (${r.stride.toFixed(1)} vs ${r.still.toFixed(2)})`);
    t.ok(r.dust > 0, 'running kicks up dust');
    t.ok(r.icon > 1000, 'the stable shows the new artwork');
    const b = await A.ev(() => { const Zc = getZone('capital'); return Zc.buildings.map(bb => bb.kind || (bb.npc && bb.npc.role)).filter(r => !CAP_BLD[r]); });
    t.ok(b.length === 0, 'every Aurelmark building has a design of its own (js/capbldg.js)' + (b.length ? ': missing ' + b.join() : ''));
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

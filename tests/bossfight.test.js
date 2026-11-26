// v1.60.6 smoother boss fights:
// 1. when the fight quality steps down (battlesmooth.js), the buildings, land shapes, signs and names keep their
//    pictures (made at full quality) instead of all being redrawn at once mid-fight
// 2. buff pictures are made ahead of time while calm, so a buff landing in a fight never makes one
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Bossy', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await g.page.setViewport({ width: 800, height: 600, deviceScaleFactor: 2 }); await wait(600);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      enterZone('capital'); await w(600); running = false; for (let i = 0; i < 3; i++) render();
      let clears = 0, lv = 0; const C = BLD_CACHE.map.clear.bind(BLD_CACHE.map); BLD_CACHE.map.clear = () => { clears++; C(); };
      const n0 = BLD_CACHE.map.size, labels0 = LABELS.size;
      for (const l of [1, 2, 3, 0]) { window.__bsForce = l; bsSet(l); render(); }
      const kept = BLD_CACHE.map.size >= n0 && clears === 0, labelsKept = LABELS.size >= labels0;
      enterZone('ridge'); await w(600); for (let i = 0; i < 3; i++) render();
      const L = lvPaint; lvPaint = function () { lv++; return L.apply(this, arguments); };
      for (const l of [2, 0]) { window.__bsForce = l; bsSet(l); render(); }
      lvPaint = L; delete window.__bsForce; BLD_CACHE.map.clear = C; running = true;
      return { kept, n0, labelsKept, lv, pd: picDPR(), dpr: DPR }; });
    t.ok(r.kept && r.n0 > 5, `stepping the fight quality down and up keeps the building pictures (${r.n0}, none redrawn)`);
    t.ok(r.labelsKept, 'names keep their pictures too');
    t.ok(r.lv === 0, `the land shapes are not repainted (${r.lv})`);
    const b = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      enterZone('meadow'); const t0 = performance.now(); while (BUFF_WARM.on && performance.now() - t0 < 25000) await w(100);
      const left = buffWarmList().length, have = ['ironwill', 'bless'].filter(id => SKILLS[id]).every(id => BUFF_ICON[id]);
      let made = 0; const T = HTMLCanvasElement.prototype.toDataURL; HTMLCanvasElement.prototype.toDataURL = function () { made++; return T.apply(this, arguments); };
      P.buffs.ironwill = { name: 'Iron Will', until: now + 30, b: {} }; buffT = 0; buffSig = ''; renderBuffs();
      HTMLCanvasElement.prototype.toDataURL = T; delete P.buffs.ironwill;
      return { left, have, made, ms: Math.round(performance.now() - t0) }; });
    t.ok(b.left === 0 && b.have, `buff pictures are made while calm after entering a region (${b.ms} ms, ${b.left} left)`);
    t.ok(b.made === 0, 'a buff landing makes no new picture');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

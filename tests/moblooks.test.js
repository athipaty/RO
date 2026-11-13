// every monster its own look: no more than two monsters may share a body that differs only in colour
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Looker', newRoom());
  try {
    const r = await g.ev(() => {
      const shared = {}; for (const [id, d] of Object.entries(MOBS)) if (!MOB_LOOKS[id]) (shared[d.shape] = shared[d.shape] || []).push(id);
      const crowded = Object.entries(shared).filter(([, ids]) => ids.length > 2);
      // every custom look draws without errors, still and moving, facing both ways
      const bad = []; const c = document.createElement('canvas'); c.width = c.height = 200; const main = ctx; ctx = c.getContext('2d');
      try { for (const id of Object.keys(MOB_LOOKS)) for (const face of [1, -1]) for (const moving of [false, true]) {
        try { drawMob({ d: MOBS[id], x: 100, y: 160, face, ph: 0, hp: 1, dead: false, hitF: -9, lunge: 0, kbT: 0, state: 'idle', moving, slowUntil: 0 }); } catch (e) { bad.push(id + ': ' + e.message); } } }
      finally { ctx = main; }
      // the pictures of two monsters that used to share a body are now different
      const a = mobPicURL('cavebat'), b = mobPicURL('hopper'), cr = mobPicURL('stonecrab'), mb = mobPicURL('mossbug');
      return { crowded, shared, bad, n: Object.keys(MOB_LOOKS).length, differ: a !== b && cr !== mb, unknown: Object.keys(MOB_LOOKS).filter(id => !MOBS[id]) };
    });
    t.ok(r.crowded.length === 0, 'no shared body is used by more than two monsters ' + JSON.stringify(r.shared));
    t.ok(r.bad.length === 0, `all ${r.n} custom looks draw without errors` + r.bad.map(e => ': ' + e).join(''));
    t.ok(r.unknown.length === 0, 'every custom look belongs to a real monster' + (r.unknown.length ? ': ' + r.unknown : ''));
    t.ok(r.differ, 'a cave bat no longer looks like a hopper, nor a stone crab like a mossbug');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

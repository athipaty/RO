// Every job looks different, and other players' names say their job
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Looks', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => {
      const ids = Object.keys(CLASSES).filter(k => k !== 'novice'), seen = new Map(), dup = [];
      for (const id of ids) { const c = document.createElement('canvas'); c.width = 90; c.height = 110; const g2 = c.getContext('2d'); const main = ctx; ctx = g2;
        try { drawPlayer({ name: 'Looks', look: P.look, cls: id, eq: {}, x: 45, y: 92, face: 1, back: false, moving: false, sitting: false, held: true }, null); } finally { ctx = main; }
        const u = c.toDataURL(); if (seen.has(u)) dup.push(id + '=' + seen.get(u)); else seen.set(u, id); }
      const missing = ids.filter(id => CLASSES[id].tier >= 2 && !JOB_LOOK[id]);
      // a party member who is a Bulwark
      ingest({ peer: 'jl1', presence: { v: 1, n: 'Mira', c: 'bulwark', z: zoneId, x: P.x + 40, y: P.y, f: 1, ts: Date.now(), lv: 44, hp: 90 } });
      const L = []; const _l = label; label = function (txt) { L.push(String(txt)); return _l.apply(this, arguments); }; render(); label = _l;
      return { n: ids.length, dup, missing, name: L.find(s => s.startsWith('Mira')) };
    });
    t.ok(r.dup.length === 0, `all ${r.n} jobs are drawn differently` + (r.dup.length ? ': ' + r.dup.join(', ') : ''));
    t.ok(r.missing.length === 0, 'every advanced and master job has its own look ' + JSON.stringify(r.missing));
    t.ok(r.name === 'Mira · Lv44 · Bulwark', 'another player\'s name shows their job (' + r.name + ')');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

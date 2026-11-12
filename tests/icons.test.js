// every item has a drawn picture, including items added by later modules (face gear, charms, festival prizes)
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Pictures', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => { const bad = [], blank = [];
      for (const id in ITEMS) { const h = icon(ITEMS[id]); if (!/<img/.test(h)) bad.push(id);
        const c = itemIconCanvas(id), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let ink = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) ink++; if (ink < 60) blank.push(id); }
      // face/mouth icons must show more than the bare face
      const face = id => { const c = itemIconCanvas(id), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const cols = new Set(); for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 200) cols.add(d[i] >> 4 << 8 | d[i + 1] >> 4 << 4 | d[i + 2] >> 4); return cols.size; };
      return { n: Object.keys(ITEMS).length, bad, blank, specs: face('roundspecs'), scarf: face('trailscarf') }; });
    t.ok(!r.bad.length, `all ${r.n} items show a picture in shops and bags` + (r.bad.length ? ': missing ' + r.bad.join(', ') : ''));
    t.ok(!r.blank.length, 'no picture is blank' + (r.blank.length ? ': ' + r.blank.join(', ') : ''));
    t.ok(r.specs > 6 && r.scarf > 6, 'face and mouth items show the gear on the face, not just a bare face');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

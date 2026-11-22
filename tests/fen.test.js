// v1.7.0 Mirelight Fen (Lv 55-70) east of Frostpeak Pass: new monsters, Mire Matriarch with escort, album page, travel;
// and the guild war bar is a small chip outside Emberkeep
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Fenwalker', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('jungle'); out.gate = Z.portals.some(p => p.to === 'fen');
      enterZone('fen', 'jungle'); await sleep(300);
      out.back = Z.portals.some(p => p.to === 'jungle'); out.name = Z.D.name; out.safe = !!Z.D.safe;
      const kinds = new Set(mobs.map(m => m.d.id || m.id || m.kind));
      out.kinds = [...kinds].join(','); out.n = mobs.length;
      out.newKinds = ['bogling', 'fenlurker', 'marshwisp', 'rotcap', 'miregolem', 'bogmantis', 'mirematriarch'].every(id => MOBS[id] && ITEMS[id + '_sig']);
      out.lantern = ITEMS.fenlantern && ITEMS.fenlantern.type === 'accessory';
      out.album = ALBUM.some(pg => pg.id === 'fen' && albumMobs(pg).length === 7);
      out.order = ZONE_ORDER.includes('fen') && WORLD_ROAD.includes('fen');
      P.visited = [...new Set([...P.visited, 'fen'])]; enterZone('town'); openPanel('warp'); out.warp = /Mirelight Fen/.test(panel.textContent); closePanel();
      openPanel('worldmap'); out.map = /Mirelight Fen/.test(panel.textContent); closePanel();
      // guild war chip: small outside the keep
      const keepWar = GW.war; GW.war = { holder: null, contested: false, capture: null, top: [{ name: 'Reds', pts: 5 }], end: Date.now() + 600000, left: 600 };
      try { gwBar(); const b = document.getElementById('gwBar'); out.chip = !b.hidden && b.classList.contains('gwMini') && /Guild war/.test(b.textContent) && !/holds the crystal/.test(b.textContent);
        out.chipH = Math.round(b.getBoundingClientRect().height); } catch (e) { out.chipErr = String(e); }
      GW.war = keepWar; gwBar();
      return out; });
    t.ok(r.gate && r.back, 'Thornveil Jungle has an east exit to Mirelight Fen, and a way back (v1.47.0)');
    t.ok(r.name === 'Mirelight Fen' && !r.safe && r.n > 30, `the Fen is a hunting region full of monsters (${r.n})`);
    t.ok(r.newKinds && r.lantern, 'seven new monsters with sigils, and the Fenlight Lantern');
    t.ok(r.album, 'the sigil album has a Mirelight Fen page with all seven monsters');
    t.ok(r.order && r.warp && r.map, `it is on the road, the waystation and the world map (warp ${r.warp}, map ${r.map})`);
    t.ok(r.chip && r.chipH < 34, `outside Emberkeep the guild war bar is a small timer chip (${r.chipH}px${r.chipErr ? ', ' + r.chipErr : ''})`);
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

// v1.41.2 the Molten Depths: stairs down from Cinderpeak Caldera, three floors, eight new monsters, Ignarok the Molten King
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Deep', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), ids = ['emberbat', 'lavaslug', 'basaltcrawler', 'magmaelemental', 'moltenknight', 'ashrevenant', 'hellimp', 'ignarok'];
      enterZone('caldera'); await w(300); const stairs = Z.portals.find(p => p.to === 'molten1' && p.side === 'down');
      const floors = []; for (const [z, from] of [['molten1', 'caldera'], ['molten2', 'molten1'], ['molten3', 'molten2']]) { enterZone(z, from); await w(400); floors.push({ z, dark: !!THEMES[Z.D.theme].dark, lava: !!THEMES[Z.D.theme].lava, kinds: [...new Set(mobs.map(m => m.d.id))].sort().join() }); }
      return { stairs: !!stairs, floors, up: !!ZONES.molten1.links.west, looks: ids.every(id => typeof MOB_LOOKS[id] === 'function'), sigils: ids.every(id => ITEMS[id + '_sig'] && ITEMS[radId(id + '_sig')]),
        boss: MOBS.ignarok.boss && MOBS.ignarok.lv === 99 && MOBS.ignarok.drops.some(([d]) => d === 'moltencrown'), album: ALBUM.some(p => p.id === 'molten'), map: (WORLD_BRANCH.caldera || []).length === 3 }; });
    t.ok(r.stairs && r.up, 'stairs in Cinderpeak Caldera lead down into the Molten Depths, and back up');
    t.ok(r.floors.length === 3 && r.floors.every(f => f.dark && f.lava && f.kinds), 'three dark floors with rivers of lava: ' + r.floors.map(f => f.z + ':' + f.kinds).join(' | '));
    t.ok(r.floors[2].kinds.includes('ignarok'), 'Ignarok the Molten King waits on the third floor');
    t.ok(r.looks && r.sigils, 'all eight new monsters have their own artwork and sigil cards');
    t.ok(r.boss, 'Ignarok is a Lv 99 boss and can drop the Molten Crown');
    t.ok(r.album && r.map, 'a sigil album page, and the three floors on the world map under the Caldera');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

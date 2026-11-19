// v1.41.1 Cinderpeak Caldera (Lv 78-90): east of Saltspray Coast, seven new monsters with their own looks and sigils
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Ember', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), ids = ['cinderling', 'magmahound', 'obsidiangolem', 'flamewraith', 'salamander', 'pyretitan', 'cinderwyrm'];
      enterZone('coast'); await w(300); const gate = Z.portals.find(p => p.to === 'caldera');
      enterZone('caldera', 'coast'); await w(500); const back = Z.portals.find(p => p.to === 'coast');
      return { gate: !!gate, back: !!back, theme: Z.D.theme, kinds: [...new Set(mobs.map(m => m.d.id))].sort().join(), want: ids.slice().sort().join(),
        looks: ids.every(id => typeof MOB_LOOKS[id] === 'function'), sigils: ids.every(id => ITEMS[id + '_sig'] && ITEMS[radId(id + '_sig')]),
        boss: MOBS.cinderwyrm.boss && MOBS.cinderwyrm.drops.some(([d]) => d === 'wyrmheart'), order: ZONE_ORDER.includes('caldera') && WORLD_ROAD.includes('caldera'),
        song: !!SONGS.caldera, album: ALBUM.some(p => p.id === 'caldera') }; });
    t.ok(r.gate && r.back, 'Saltspray Coast has an east gate to Cinderpeak Caldera, and back');
    t.ok(r.theme === 'caldera' && r.kinds === r.want, 'all seven monsters live there: ' + r.kinds);
    t.ok(r.looks, 'each has its own artwork');
    t.ok(r.sigils, 'each has a sigil card (and a Radiant one for fusion)');
    t.ok(r.boss, 'the Cinder Wyrm is a boss and can drop the Wyrmheart');
    t.ok(r.order && r.song && r.album, 'it is on the world map, the travel list, has its own song and a sigil album page');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

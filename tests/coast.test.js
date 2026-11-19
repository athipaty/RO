// v1.41.0 Saltspray Coast (Lv 68-80): east of Mirelight Fen, seven new monsters with their own looks and sigils
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Shore', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), ids = ['tidecrab', 'saltwing', 'driftgolem', 'coralsiren', 'reefstalker', 'barnaclebrute', 'krakenmatron'];
      enterZone('fen'); await w(300); const gate = Z.portals.find(p => p.to === 'coast');
      enterZone('coast', 'fen'); await w(500); const back = Z.portals.find(p => p.to === 'fen');
      return { gate: !!gate, back: !!back, theme: Z.D.theme, kinds: [...new Set(mobs.map(m => m.d.id))].sort().join(), want: ids.slice().sort().join(),
        looks: ids.every(id => typeof MOB_LOOKS[id] === 'function'), sigils: ids.every(id => ITEMS[id + '_sig'] && ITEMS[radId(id + '_sig')]),
        boss: MOBS.krakenmatron.boss && MOBS.krakenmatron.drops.some(([d]) => d === 'krakeneye'), order: ZONE_ORDER.includes('coast') && WORLD_ROAD.includes('coast'),
        song: !!SONGS.coast, album: ALBUM.some(p => p.id === 'coast') }; });
    t.ok(r.gate && r.back, 'Mirelight Fen has an east gate to Saltspray Coast, and back');
    t.ok(r.theme === 'coast' && r.kinds === r.want, 'all seven monsters live there: ' + r.kinds);
    t.ok(r.looks, 'each has its own artwork');
    t.ok(r.sigils, 'each has a sigil card (and a Radiant one for fusion)');
    t.ok(r.boss, 'the Kraken Matron is a boss and can drop the Kraken Eye');
    t.ok(r.order && r.song && r.album, 'it is on the world map, the travel list, has its own song and a sigil album page');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

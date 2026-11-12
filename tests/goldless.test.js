// monsters drop items, not gold; materials sell for 2.5x; bosses still drop a gold pouch
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Merchant', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => { enterZone('meadow'); P.ach = { got: { kill1: 1 } }; if (typeof festNow === 'function') festNow = () => null;
      const kill = id => { const m = mobs.find(x => x.d.id === id && !x.dead); m.x = P.x + 30; m.y = P.y; const n0 = loot.length; hurtMob(m, 999999, false, 'phys'); return loot.slice(n0); };
      const normal = kill('hopper'), boss = kill('hopperchief');
      return { normalGold: normal.some(l => l.gold > 0), bossGold: boss.some(l => l.gold > 0), pelt: sellValue('pelt'), tuft: sellValue('tuft'), tuftPrice: ITEMS.tuft.price, potion: sellValue('red'), redPrice: ITEMS.red.price }; });
    t.ok(!r.normalGold, 'normal monsters drop no gold');
    t.ok(r.bossGold, 'bosses still drop a gold pouch');
    t.ok(r.tuft === Math.round(r.tuftPrice * 2.5), `monster materials sell for 2.5x (Hopper Tuft ${r.tuftPrice} → ${r.tuft} gold)`);
    t.ok(r.potion === Math.floor(r.redPrice / 2), 'other items sell as before');
    const srv = await A.ev(() => { const m = mobs.find(x => !x.dead && !x.d.boss); const n0 = loot.length; serverLoot(m, { l: ['tuft'], g: 40 }); const a = loot.slice(n0);
      const b = mobs.find(x => x.d.boss); const n1 = loot.length; serverLoot(b, { l: [], g: 40 }); const c = loot.slice(n1); return { normal: a.some(l => l.gold > 0), item: a.some(l => l.id === 'tuft'), boss: c.some(l => l.gold > 0) }; });
    t.ok(!srv.normal && srv.item && srv.boss, "the server's gold is ignored for normal monsters and kept for bosses");
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

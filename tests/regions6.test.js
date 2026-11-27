// v1.74.0: Rustvein Quarry, Hollowmoor, the Barrow Deeps (two floors) and the Starfall Expanse (js/regions6.js, js/regions6fx.js).
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Explorer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    const d = await A.ev(() => { const ids = R7_MOBS, bad = [];
      for (const id of ids) { const m = MOBS[id]; if (!MOB_LOOKS[id]) bad.push(id + ' look'); if (!ITEMS[id + '_sig']) bad.push(id + ' sigil'); if ((m.boss || m.world) && !BOSS_SIG[id]) bad.push(id + ' boss skill'); for (const [it] of m.drops || []) if (!ITEMS[it]) bad.push(id + ' drop ' + it); }
      const L = z => ZONES[z].links || {};
      return { n: ids.length, bad, bosses: ids.filter(id => MOBS[id].boss).length, big: !!(MOBS.paleregent.boss && !MOBS.paleregent.mini),
        gates: { canyon: L('canyon').west, quarry: L('quarry').east, marsh: Object.values(L('marsh')).includes('quarry'), fen: L('fen').north, moor: L('moor').south, woods: Object.values(L('woods')).includes('moor'), caldera: L('caldera').east, star: L('starfall').west },
        stairs: ZONES.moor.stairs, b1: L('barrow1'), album: ['quarry', 'moor', 'barrow', 'starfall'].every(id => ALBUM.some(a => a.id === id)), branch: WORLD_BRANCH.moor,
        lv: ids.map(id => MOBS[id].lv), order: ['quarry', 'moor', 'starfall', 'barrow1', 'barrow2'].every(z => ZONE_ORDER.includes(z)) }; });
    t.ok(d.n === 22 && !d.bad.length, `22 new monsters, each with its own look, sigil and drops; every boss has its own skill ${d.bad.join(', ')}`);
    t.ok(d.bosses === 4 && d.big, 'four bosses: three mini-bosses and the Pale Regent, a full boss');
    t.ok(d.gates.canyon === 'quarry' && d.gates.quarry === 'canyon' && !d.gates.marsh, 'Rustvein Quarry joins Redrock Canyon (and not the low Reedwater Marsh)');
    t.ok(d.gates.fen === 'moor' && d.gates.moor === 'fen' && !d.gates.woods, 'Hollowmoor joins Mirelight Fen (and not Whispering Woods)');
    t.ok(d.gates.caldera === 'starfall' && d.gates.star === 'caldera', 'the Starfall Expanse joins Cinderpeak Caldera');
    t.ok(d.stairs === 'barrow1' && d.b1.west === 'moor' && d.b1.east === 'barrow2' && JSON.stringify(d.branch) === '["barrow1","barrow2"]', 'stairs in Hollowmoor lead down to the Barrow Deeps B1 and B2');
    t.ok(d.album && d.order && Math.max(...d.lv) === 99 && Math.min(...d.lv) === 37, 'album pages, the travel list, levels 37 to 99');
    // each new place builds, its monsters spawn and are drawn without an error
    const z = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const out = {};
      for (const id of ['quarry', 'moor', 'barrow1', 'barrow2', 'starfall']) { enterZone(id); await w(600); const kinds = new Set(mobs.map(m => m.d.id)); out[id] = { n: mobs.length, kinds: kinds.size, portals: Z.portals.map(p => p.to), boss: mobs.some(m => m.d.boss) }; }
      enterZone('town'); return out; });
    for (const id in z) t.ok(z[id].n > 10 && z[id].kinds >= 3, `${id}: ${z[id].n} monsters of ${z[id].kinds} kinds, gates to ${z[id].portals.join(', ')}`);
    t.ok(z.moor.portals.includes('barrow1') && z.barrow2.boss, 'the moor has the stairs down, and the Pale Regent is on the bottom floor');
    t.ok(!A.page.errors.length, 'no script errors ' + A.page.errors.slice(0, 3).join(' | '));
  } finally { await A.close(); }
};

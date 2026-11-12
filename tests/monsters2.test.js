// #39 41 monsters: the twelve new ones spawn at the end of their regions, have elements/sizes/races, sigils;
// a game facing a newer server (more monsters) keeps syncing the ones it knows and asks for a reload.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Bestiary', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const NEW = ['puffcap', 'dewdrop', 'barkling', 'webspinner', 'shriekcap', 'crystalmite', 'dunejackal', 'miragewisp', 'gravehound', 'ashgolem', 'iceimp', 'glacierbeetle'];
    const r = await A.ev(NEW => ({ total: Object.keys(MOBS).length, ok: NEW.every(id => MOBS[id] && ELEM[MOBS[id].el] && ITEMS[id + '_sig'] && MOBS[id].drops.every(([d]) => ITEMS[d])),
      lastInZones: Object.values(ZONES).filter(z => z.mobs).every(z => { const ids = z.mobs.map(m => m[0]); const firstNew = ids.findIndex(id => NEW.includes(id)); return firstNew < 0 || ids.slice(firstNew).every(id => NEW.includes(id)); }) }), NEW);
    t.ok(r.total >= 40, `${r.total} monsters in the world`);
    t.ok(r.ok, 'each new monster has an element, drops and a sigil');
    t.ok(r.lastInZones, 'new monsters are at the end of each region\'s list (server and game stay in step)');
    const spawn = await A.ev(() => { enterZone('meadow'); return mobs.filter(m => m.d.id === 'puffcap').length; });
    t.ok(spawn === 4, 'Puffcaps roam Greenmoss Meadow');
    const newer = await A.ev(() => { enterZone('meadow'); const base = mobs.length; const mb = mobs.map(m => [Math.round(m.x) + 5, Math.round(m.y), 1000, 0]); mb.push([10, 10, 1000, 0]);
      const m0 = mobs[0], x0 = m0.x; NET.newerSaid = false; syncMobs({ mb, ev: [], id: 'srvtest' }, .5); return { moved: m0.x !== x0, said: /new version of Embervale/.test(document.getElementById('log').textContent), same: mobs.length === base }; });
    t.ok(newer.moved && newer.same, 'facing a newer server, the game keeps syncing the monsters it knows');
    t.ok(newer.said, 'and tells the player to reload for the new ones');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

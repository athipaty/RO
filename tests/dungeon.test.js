// #34 Mossdeep Caverns: stairs in the woods, three floors that get harder, a floor boss, dim lighting.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Delver', newRoom(), { zone: 'woods', server: 'http://127.0.0.1:9' });
  try {
    await wait(1200);
    const st = await g.ev(() => { const p = Z.portals.find(p => p.to === 'deep1'); if (!p) return null;
      const reach = Z.reach[Math.floor(p.y / TILE) * Z.w + Math.floor(p.x / TILE)]; return { side: p.side, reach: !!reach, road: Z.portals.filter(p => p.side !== 'down').map(p => p.to).sort().join() }; });
    t.ok(st && st.side === 'down' && st.reach, 'Whispering Woods has stairs down to the caverns, reachable on foot');
    t.ok(st && st.road === 'dunes,meadow', 'the woods keep their east and west exits');

    const down = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const p = Z.portals.find(p => p.to === 'deep1');
      P.portalLock = 0; P.x = p.x; P.y = p.y; await w(400); return { z: zoneId, name: Z.D.name, banner: document.getElementById('zoneBanner').textContent }; });
    t.ok(down.z === 'deep1' && /B1/.test(down.banner), 'walking onto the stairs takes you to Mossdeep Caverns B1');

    const up = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const p = Z.portals.find(p => p.to === 'woods');
      P.portalLock = 0; P.x = p.x; P.y = p.y; await w(400); const s = Z.portals.find(p => p.to === 'deep1'); return { z: zoneId, near: Math.hypot(P.x - s.x, P.y - s.y) }; });
    t.ok(up.z === 'woods' && up.near > 40 && up.near < 120, 'going back up puts you beside the stairs, not on them');

    const floors = await g.ev(() => ['deep1', 'deep2', 'deep3'].map(id => { const z = getZone(id); const lv = ZONES[id].mobs.filter(([m]) => !MOBS[m].boss).map(([m]) => MOBS[m].lv);
      return { id, avg: lv.reduce((a, b) => a + b, 0) / lv.length, tiles: z.spawnTiles.length, links: z.portals.map(p => p.to).join() }; }));
    t.ok(floors[0].avg < floors[1].avg && floors[1].avg < floors[2].avg, `monsters get stronger floor by floor (${floors.map(f => f.avg.toFixed(0)).join(' → ')})`);
    t.ok(floors.every(f => f.tiles > 300), 'every floor has room for its monsters');
    t.ok(floors[0].links === 'woods,deep2' && floors[1].links === 'deep1,deep3' && floors[2].links === 'deep2', 'floors connect in order and B3 is the bottom');

    const b3 = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('deep3'); await w(500);
      const k = mobs.find(m => m.d.id === 'gloomking'); return { king: !!k, boss: k && k.d.boss, log: document.getElementById('log').textContent, dark: !!THEMES[Z.D.theme].dark, warp: ZONE_ORDER.includes('deep3') }; });
    t.ok(b3.king && b3.boss && /Gloomcap King is here/.test(b3.log), 'the Gloomcap King waits on B3 and the log warns you');
    t.ok(b3.dark && !b3.warp, 'the caverns are dark, and the Waystation cannot skip you down');

    const kill = await g.ev(() => { const k = mobs.find(m => m.d.id === 'gloomking'); k.myDmg = 1; killMob(k); return { log: document.getElementById('log').textContent, respawn: k.respawnAt - now }; });
    t.ok(/rise again in 2.5 minutes/.test(kill.log) && kill.respawn > 140, 'defeating it says when it comes back');
    t.ok(await g.ev(() => !!QUESTS.d_deep && QUESTS.d_deep.from === 'ysolde'), 'Ysolde has a daily quest for the Gloomcap King');
    t.ok(await g.ev(() => { const s = document.createElement('canvas').getContext('2d'); const main = ctx; ctx = s; try { drawHat('gloomhat', 20, 20, 1); } finally { ctx = main; } return true; }), 'the Gloomcap Hat can be drawn');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

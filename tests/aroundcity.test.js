// v1.47.0 a world around the city: Hearthvale and Aurelmark in the middle, four roads out, stronger the farther you go;
// eight new regions (40 monsters) fill the gaps, the capital has a west gate, and the world map is a grid
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Roamer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), NEW = ['downs', 'ridge', 'ruins', 'jungle', 'steppe', 'glacier', 'dusk', 'peaks'];
      // every pair of neighbours on the grid shares a gate, and walking through it lands you by the gate back
      const gates = [], DIR = { east: [1, 0], west: [-1, 0], north: [0, -1], south: [0, 1] };
      for (const a in WORLD_GRID) for (const b in WORLD_GRID) { const [ax, ay] = WORLD_GRID[a], [bx, by] = WORLD_GRID[b]; if (Math.abs(ax - bx) + Math.abs(ay - by) !== 1) continue; if ((CITY_GATES[a] && !CITY_GATES[a].includes(b)) || (CITY_GATES[b] && !CITY_GATES[b].includes(a))) continue; // (v1.61.1) the cities keep their own gates
        if (WORLD_WALLS.some(([p, q]) => (p === a && q === b) || (p === b && q === a))) continue; // (v1.62.0) closed borders
        const za = getZone(a); if (!za.portals.some(p => p.to === b)) gates.push(a + '->' + b); }
      enterZone('capital', 'town'); const wg = Z.portals.find(p => p.to === 'downs'); enterZone('downs', 'capital'); await w(200);
      const back = Z.portals.find(p => p.to === 'capital'), landed = back && Math.hypot(P.x - back.x, P.y - back.y) < 4 * TILE;
      enterZone('capital', 'downs'); const home = Math.hypot(P.x - wg.x, P.y - wg.y) < 4 * TILE;
      // along each road the monsters get stronger the farther you walk
      const low = id => Math.min(...ZONES[id].mobs.map(([m]) => MOBS[m]).filter(m => !m.boss).map(m => m.lv)), roads = {};
      for (const dir of ['north', 'east', 'south', 'west']) roads[dir] = worldArm(dir).map(id => [id, low(id)]);
      const climbs = Object.values(roads).every(a => a.length >= 4 && a.every(([, l], i) => !i || l > a[i - 1][1]));
      const rings = [1, 2, 3, 4].map(k => Object.keys(WORLD_GRID).filter(id => worldRing(id) === k).map(low));
      const ringsUp = rings.every((l, i) => !i || Math.max(...l) > Math.max(...rings[i - 1]));
      // the new regions: their monsters live there, each with its own look, sigils, a boss with a prize
      const kinds = {}; for (const id of NEW) { enterZone(id); await w(60); kinds[id] = [...new Set(mobs.map(m => m.d.id))].length; }
      const ids = Object.keys(R4_MOBS), looks = ids.filter(id => typeof MOB_LOOKS[id] !== 'function'), sig = ids.filter(id => !ITEMS[id + '_sig'] || !ITEMS[radId(id + '_sig')]);
      const bosses = ids.filter(id => MOBS[id].boss), prizes = bosses.every(id => MOBS[id].drops.some(([d]) => ITEMS[d] && ITEMS[d].type !== 'etc'));
      const extras = NEW.every(id => ALBUM.some(p => p.zones.includes(id)) && SONGS[ZONES[id].music] && ZONE_BLURB[id] && ZONE_ORDER.includes(id));
      // the world map: the grid, and tapping a square points at that region's card
      openPanel('worldmap'); await w(100); const cell = panel.querySelector('.wc[data-arg="glacier"]'); cell.click(); await w(100);
      const picked = panel.querySelector('.wnode.pick')?.dataset.zone;
      return { gates, wg: !!wg, landed, home, roads, climbs, ringsUp, kinds, looks, sig, nb: bosses.length, prizes, extras, picked, n: ids.length }; });
    t.ok(r.gates.length === 0, 'every two regions next to each other on the grid share a gate' + (r.gates.length ? ': missing ' + r.gates : ''));
    t.ok(r.wg && r.landed && r.home, 'Aurelmark has a west gate to Goldleaf Downs, and you arrive by the gate both ways');
    t.ok(r.climbs, 'down every road the monsters get stronger the farther you go: ' + Object.entries(r.roads).map(([d, a]) => d + ' ' + a.map(([id, l]) => id + ' ' + l).join(' > ')).join(' | '));
    t.ok(r.ringsUp, 'each ring around the city is stronger than the one inside it');
    t.ok(Object.values(r.kinds).every(n => n >= 5), 'monsters live in all eight new regions ' + JSON.stringify(r.kinds));
    t.ok(r.n === 40 && r.looks.length === 0 && r.sig.length === 0, `all ${r.n} new monsters have their own artwork and sigil cards` + (r.looks.length ? ' (no art: ' + r.looks + ')' : '') + (r.sig.length ? ' (no sigil: ' + r.sig + ')' : ''));
    t.ok(r.nb === 8 && r.prizes, 'each new region has a boss that can drop a piece of gear');
    t.ok(r.extras, 'each has a sigil album page, a song, a blurb and a place on the travel list');
    t.ok(r.picked === 'glacier', 'tapping a square on the world map points at that region\'s card');
    if (process.env.SHOTS) await g.page.screenshot({ path: process.env.SHOTS + '/worldgrid.png' });
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

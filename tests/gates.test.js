// Hearthvale's north and south gates (v1.17.0): Windwhistle Heights and Willowmere Farms, their monsters,
// mini-bosses, people, gathering spots and decorations; walking in and back out lands you beside the gate
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Gatewalker', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await g.ev(() => {
      const out = {}, T = TILE, town = getZone('town');
      out.gates = ['heights', 'farms'].every(z => town.portals.some(p => p.to === z));
      for (const z of ['heights', 'farms']) {
        enterZone(z, 'town'); const back = Z.portals.find(p => p.to === 'town');
        out[z] = { arrive: !!back && Math.hypot(P.x - back.x, P.y - back.y) < 4 * T, mobs: new Set(mobs.map(m => m.d.id)).size, boss: mobs.some(m => m.d.mini),
          npcs: Z.npcs.map(n => n.name), gather: Z.objs.some(o => o.kind === 'gather'), deco: [...new Set(Z.objs.map(o => o.kind))], reach: Z.spawnTiles.length };
        enterZone('town', z); const gate = Z.portals.find(p => p.to === z); out[z].home = Math.hypot(P.x - gate.x, P.y - gate.y) < 4 * T;
      }
      out.order = ZONE_ORDER.indexOf('heights') === ZONE_ORDER.indexOf('meadow') + 1 && ZONE_ORDER.includes('farms');
      out.sigils = ['pebblet', 'hornback', 'turnipsprite', 'grandscarecrow'].every(id => ITEMS[id + '_sig'] && MOBS[id].hit > 0);
      out.drops = Object.keys(MOBS).filter(id => ['heights', 'farms'].some(z => ZONES[z].mobs.some(m => m[0] === id))).every(id => MOBS[id].drops.every(([i]) => ITEMS[i]));
      openPanel('worldmap'); out.worldmap = ['Windwhistle Heights', 'Willowmere Farms'].every(n => panel.textContent.includes(n)); closePanel();
      return out;
    });
    t.ok(r.gates, 'Hearthvale has a north gate (Windwhistle Heights) and a south gate (Willowmere Farms)');
    t.ok(r.heights.arrive && r.heights.home && r.farms.arrive && r.farms.home, 'walking through a gate lands you beside the gate on the other side, both ways');
    t.ok(r.heights.mobs >= 5 && r.heights.boss, `Windwhistle Heights has its monsters and Old Hornback (${r.heights.mobs} kinds)`);
    t.ok(r.farms.mobs >= 5 && r.farms.boss, `Willowmere Farms has its monsters and the Grand Scarecrow (${r.farms.mobs} kinds)`);
    t.ok(r.heights.npcs.includes('Shepherd Alda') && r.farms.npcs.includes('Farmer Tamsin') && r.farms.npcs.includes('Odo the Ferryman'), 'Shepherd Alda, Farmer Tamsin and Odo the Ferryman are there');
    t.ok(r.heights.gather && r.farms.gather, 'both have gathering spots');
    t.ok(r.heights.deco.includes('crag') && r.farms.deco.includes('hay'), 'crags on the heights, haystacks on the farms');
    t.ok(r.heights.reach > 500 && r.farms.reach > 500, 'most of each map can be walked');
    t.ok(r.order && r.sigils && r.drops, 'the regions are in the travel order, the new monsters have sigils and real drops');
    t.ok(r.worldmap, 'the world map lists both regions');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

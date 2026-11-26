// v1.64.0: the Tidewater Isle: far out at sea, joined to no region, reached by boat from Willowmere Farms (Lv 38+);
// every monster is water; wind weapons (the Gale line, or a socketed Wind Sigil) hit them for 1.5x
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Sailor', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
      const ids = ['isles', 'grotto1', 'grotto2', 'grotto3'];
      out.offGrid = ids.every(id => !WORLD_GRID[id]) && Object.keys(ZONES.isles.links).length === 0;
      out.noGate = Object.keys(ZONES).filter(id => id !== 'isles' && !ids.includes(id) && Object.values(ZONES[id].links || {}).some(v => ids.includes(v)));
      const mobsAll = [...new Set(ids.flatMap(id => ZONES[id].mobs.map(m => m[0])))];
      out.water = mobsAll.length >= 15 && mobsAll.every(id => MOBS[id].el === 'water');
      out.looks = mobsAll.filter(id => typeof MOB_LOOKS[id] !== 'function');
      out.levels = [Math.min(...ZONES.isles.mobs.map(([m]) => MOBS[m]).filter(m => !m.boss).map(m => m.lv)), MOBS.leviathan.lv];
      // the boat: a pier in the Farms, refused below Lv 38, then the island and back
      enterZone('farms'); const pier = Z.portals.find(p => p.to === 'isles'); out.pier = !!pier;
      P.lv = 20; P.x = pier.x; P.y = pier.y; P.portalLock = 0; await w(400); out.refused = zoneId === 'farms';
      P.lv = 45; P.portalLock = 0; P.x = pier.x; P.y = pier.y; await w(400); out.sailed = zoneId === 'isles';
      out.landing = !!Z.portals.find(p => p.to === 'farms') && !!Z.portals.find(p => p.to === 'grotto1');
      out.visited = P.visited.includes('isles');
      // the grotto: three floors, the Leviathan at the bottom
      enterZone('grotto3', 'grotto2'); await w(200); out.boss = mobs.some(m => m.d.id === 'leviathan');
      // wind against water: a plain hit with a Gale weapon, a Wind Sigil in any weapon, and none
      enterZone('isles'); await w(200); P.cls = 'warden'; P.lv = 60; S = computeStats();
      const m = mobs.find(x => !x.dead && !x.d.boss); const hit = id => { P.eq.weapon = id ? { id, uid: 901, s: id === 'sword' ? ['windsigil'] : [null] } : null; S = computeStats(); return weaponEl(); };
      out.gale = hit('galesword'); out.sigil = hit('sword'); out.none = (P.eq.weapon = { id: 'sword', uid: 902, s: [null] }, S = computeStats(), weaponEl());
      out.mult = elemMult(out.gale, m.d.el); out.fireMult = elemMult('fire', m.d.el);
      out.desc = itemDesc({ id: 'galesword', s: [null] });
      out.forge = GALE.every(([id]) => FORGES.some(f => f[0] === id));
      openPanel('worldmap'); out.onMap = !!panel.querySelector('.wnode[data-zone="isles"]'); closePanel();
      running = false; const bad = []; for (const id of mobsAll) { m.d = MOBS[id]; m.x = P.x + 60; m.y = P.y; try { render(); } catch (e) { bad.push(id + ': ' + e.message); } } running = true; out.drawBad = bad;
      return out; });
    t.ok(r.offGrid && !r.noGate.length, 'the island is joined to no region' + (r.noGate.length ? ': ' + r.noGate.join(',') : ''));
    t.ok(r.pier && r.refused && r.sailed && r.landing && r.visited, `the boat from the Farms refuses heroes under Lv 38 and sails the rest (pier ${r.pier}, refused ${r.refused}, sailed ${r.sailed}, landing ${r.landing})`);
    t.ok(r.water, 'every monster on the island and in the grotto is water element');
    t.ok(r.levels[0] >= 38 && r.levels[0] <= 45 && r.levels[1] >= 70 && r.levels[1] <= 75, `levels start around Lv 40 and end with the Lv ${r.levels[1]} Leviathan (${r.levels.join('-')})`);
    t.ok(r.boss, 'the Tide Leviathan waits on the bottom floor');
    t.ok(r.gale === 'wind' && r.sigil === 'wind' && r.none === null, `a Gale weapon and a Wind Sigil make plain attacks wind (${r.gale}, ${r.sigil}, ${r.none})`);
    t.ok(r.mult === 1.5 && r.fireMult === .5, `wind hits the island's monsters for 1.5x, fire for 0.5x (${r.mult}, ${r.fireMult})`);
    t.ok(/^Wind · ATK 150/.test(r.desc), 'a wind weapon says so first: ' + r.desc);
    t.ok(r.forge, 'the Gale weapons are forged at the smithy');
    t.ok(r.onMap, 'the world map lists the island, across the sea');
    t.ok(!r.looks.length && !r.drawBad.length, 'every island monster has its own drawing, drawn without errors' + (r.looks.length ? ' missing ' + r.looks : '') + (r.drawBad.length ? ' ' + r.drawBad.join('; ') : ''));
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

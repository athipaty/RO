// #32 the capital Aurelmark: west gate from Hearthvale, districts, the Gemcutter (no slot cutting since v1.76.0), Library bestiary, travel.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Citizen', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const gate = await A.ev(() => { enterZone('town'); const pt = Z.portals.find(p => p.to === 'capital'); enterZone('capital', 'town'); const back = Z.portals.find(p => p.to === 'town');
      return { gate: !!pt, safe: Z.D.safe, mobs: mobs.length, back: !!back, roles: Z.npcs.map(n => n.role).sort().join(',') }; });
    t.ok(gate.gate && gate.back, 'Hearthvale has a west gate to Aurelmark, and a way back');
    t.ok(gate.safe && gate.mobs === 0, 'the capital is a safe city with no monsters');
    t.ok(['shop', 'gemcut', 'library', 'smith', 'rebirth'].every(r => gate.roles.includes(r)) && !['job', 'storage', 'heal', 'warp'].some(r => gate.roles.includes(r)), 'it has the royal market, the Gemcutter, the Library, the Forge Royal and the Seer, and none of the copies of Hearthvale (bank, chapel, guild, waystation): ' + gate.roles);
    const banner = await A.ev(async () => { P.x = 14 * TILE; P.y = 12 * TILE; await new Promise(r => setTimeout(r, 900)); return document.getElementById('zoneBanner').textContent; });
    t.ok(/Market Row/.test(banner), 'walking into a district shows its name');
    const gem = await A.ev(() => { P.gold = 100000; P.inv = []; giveItem('glintstone', 10); giveItem('robe'); const e = P.inv.find(x => x.id === 'robe'); const n0 = e.s.length;
      openPanel('gemcut'); const txt = panel.textContent, cut = !!panel.querySelector('[data-act="gemcut"]'); PANEL_ACTS.gemcut(e.uid); closePanel();
      return { n0, after: e.s.length, gold: P.gold, gl: invFind('glintstone').n, cut, way: /Dye & Wardrobe/.test(txt) && /Costume hat/.test(txt) }; });
    t.ok(!gem.cut && gem.after === gem.n0 && gem.gold === 100000 && gem.gl === 10 && gem.way, 'no more slot cutting (v1.76.0): her shop is the Dye & Wardrobe now (v1.77.0), and nothing is spent by the old cut action');
    const lib = await A.ev(() => { const a = achData(); a.kk = { sproutling: 12, hopper: 3 }; openPanel('library'); const tx = panel.textContent; const notes = !!panel.querySelector('[data-act="libinfo"][data-arg="sproutling"]'); closePanel(); return { tx, notes }; });
    t.ok(/2 of \d+ monsters recorded/.test(lib.tx) && /7 more for full notes/.test(lib.tx) && lib.notes, 'the Library bestiary records what you defeated, with full notes after 10');
    const travel = await A.ev(() => { P.visited = [...new Set([...P.visited, 'capital'])]; enterZone('town'); openPanel('warp'); const has = /Aurelmark/.test(panel.textContent); closePanel(); openPanel('worldmap'); const wm = /Aurelmark/.test(panel.textContent); closePanel(); return has && wm; });
    t.ok(travel, 'Tobin can send you there, and it is on the world map');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

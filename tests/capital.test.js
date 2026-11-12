// #32 the capital Aurelmark: west gate from Hearthvale, districts, Gemcutter slots, Library bestiary, travel.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Citizen', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const gate = await A.ev(() => { enterZone('town'); const pt = Z.portals.find(p => p.to === 'capital'); enterZone('capital', 'town'); const back = Z.portals.find(p => p.to === 'town');
      return { gate: !!pt, safe: Z.D.safe, mobs: mobs.length, back: !!back, roles: Z.npcs.map(n => n.role).sort().join(',') }; });
    t.ok(gate.gate && gate.back, 'Hearthvale has a west gate to Aurelmark, and a way back');
    t.ok(gate.safe && gate.mobs === 0, 'the capital is a safe city with no monsters');
    t.ok(['shop', 'gemcut', 'library', 'job', 'storage', 'heal', 'warp', 'smith'].every(r => gate.roles.includes(r)), 'it has shops, the Gemcutter, the Library, bank, chapel, travel and a smith: ' + gate.roles);
    const banner = await A.ev(async () => { P.x = 14 * TILE; P.y = 12 * TILE; await new Promise(r => setTimeout(r, 900)); return document.getElementById('zoneBanner').textContent; });
    t.ok(/Market Row/.test(banner), 'walking into a district shows its name');
    const gem = await A.ev(() => { P.gold = 100000; P.inv = []; giveItem('glintstone', 10); giveItem('robe'); const e = P.inv.find(x => x.id === 'robe'); const n0 = e.s.length;
      openPanel('gemcut'); const r = Math.random; Math.random = () => .01; PANEL_ACTS.gemcut(e.uid); const ok1 = e.s.length; Math.random = () => .99; PANEL_ACTS.gemcut(e.uid); Math.random = r; closePanel();
      return { n0, ok1, after: e.s.length, gold: P.gold, name: itemName(e), gl: invFind('glintstone').n }; });
    t.ok(gem.ok1 === gem.n0 + 1, `Gemcutter Sela cuts a new sigil slot (${gem.name})`);
    t.ok(gem.after === gem.ok1 && gem.gl === 10 - (gem.n0 + 1) - (gem.n0 + 2), 'a failed cut costs the fee but leaves the gear unharmed');
    const lib = await A.ev(() => { const a = achData(); a.kk = { sproutling: 12, hopper: 3 }; openPanel('library'); const tx = panel.textContent; const notes = !!panel.querySelector('[data-act="libinfo"][data-arg="sproutling"]'); closePanel(); return { tx, notes }; });
    t.ok(/2 of \d+ monsters recorded/.test(lib.tx) && /7 more for full notes/.test(lib.tx) && lib.notes, 'the Library bestiary records what you defeated, with full notes after 10');
    const travel = await A.ev(() => { P.visited = [...new Set([...P.visited, 'capital'])]; enterZone('town'); openPanel('warp'); const has = /Aurelmark/.test(panel.textContent); closePanel(); openPanel('worldmap'); const wm = /Aurelmark/.test(panel.textContent); closePanel(); return has && wm; });
    t.ok(travel, 'Tobin can send you there, and it is on the world map');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

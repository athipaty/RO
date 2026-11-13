// Town buildings each have their own shape (js/archi.js), and roof shading is a real colour (not black).
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Builder', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const out = {};
      for (const z of ['town', 'capital']) { enterZone(z); await w(200); out[z] = Z.buildings.map(b => (archiOf(b) ? Object.keys(ARCHI).find(k => ARCHI[k] === archiOf(b)) : 'none')); for (const b of Z.buildings) drawBuilding(b); }
      return { out, roofs: new Set(Object.values(ARCHI).map(a => a.roof)).size, dark: shade('#8e3b2e', -40), frac: shade('#8e3b2e', -.5) }; });
    t.ok(!r.out.town.includes('none') && !r.out.capital.includes('none'), 'every building in Hearthvale and Aurelmark has a style: ' + r.out.town.join(',') + ' | ' + r.out.capital.join(','));
    t.ok(new Set(r.out.town).size === r.out.town.length, 'no two Hearthvale buildings share a style');
    t.ok(r.roofs >= 6, `${r.roofs} different roof shapes`);
    t.ok(r.dark === 'rgb(102,19,6)' && r.frac === 'rgb(71,30,23)', `shading works both ways: an amount (${r.dark}) and a fraction for icons (${r.frac})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

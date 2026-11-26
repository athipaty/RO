// v1.65.0: Brannoc sells each hero only 3 Ember Ore and 3 Glintstone a day; Glintstone can be smelted from iron too
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Smithy', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('town'); P.gold = 100000; const n0 = (invFind('emberore') || {}).n || 0;
      for (let i = 0; i < 5; i++) PANEL_ACTS.buyore('emberore');
      out.bought = ((invFind('emberore') || {}).n || 0) - n0; out.left = oreLeft('emberore'); out.glintLeft = oreLeft('glintstone');
      // the smith's window says so and the button reads Sold out
      const smith = Z.npcs.find(n => n.role === 'smith'); openPanel('smith', smith); await w(100);
      const btn = panel.querySelector('[data-act="buyore"][data-arg="emberore"]'); out.sold = !!btn && btn.disabled && /Sold out/.test(btn.textContent);
      out.note = /running low/.test(panel.textContent); closePanel();
      // a new day: the stock is back
      P.oreBuy.day = '2000-1-1'; out.reset = oreLeft('emberore') === 3;
      out.smelt = BREWS.some(r => r[0] === 'glintstone' && r[2].ironchunk === 6);
      out.saved = SAVE_EXTRA.includes('oreBuy');
      // (v1.65.1) Re-smelt at the smithy: 3 Ember Ore into 2 Glintstone
      const e0 = (invFind('emberore') || {}).n || 0, g0 = (invFind('glintstone') || {}).n || 0, gold0 = P.gold; giveItem('emberore', 3);
      openPanel('smith', smith); await w(100); out.resmeltRow = !!panel.querySelector('[data-act="resmelt"][data-arg="glintstone"]'); panel.querySelector('[data-act="resmelt"][data-arg="glintstone"]').click(); await w(100); closePanel();
      out.resmelt = ((invFind('emberore') || {}).n || 0) === e0 && ((invFind('glintstone') || {}).n || 0) === g0 + 2 && P.gold === gold0 - 200;
      out.labKeeps = LAB.trans.some(r => r[0] === 'glintstone');
      return out; });
    t.ok(r.bought === 3 && r.left === 0 && r.glintLeft === 3, `three Ember Ore a day, then no more (bought ${r.bought}); Glintstone has its own three`);
    t.ok(r.sold && r.note, "the smith's window says the mines are running low and the button reads Sold out");
    t.ok(r.reset, 'the next day the stock is back');
    t.ok(r.smelt && r.saved, 'Glintstone smelts from 6 Iron Chunks, and the daily count is saved with the hero');
    t.ok(r.resmeltRow && r.resmelt && r.labKeeps, 'Brannoc re-smelts 3 Ember Ore into 2 Glintstone for 200 gold; the alchemist keeps hers too');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

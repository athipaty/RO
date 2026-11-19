// v1.40.1 the Alchemist's Laboratory: grand elixirs, elemental oils (weapon attacks take the oil's element), transmutation
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Alch', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(600);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), o = {};
      P.tut = 'done'; P.gold = 50000; enterZone('capital'); await w(300);
      for (const [id, n] of [['core', 10], ['thorn', 10], ['trollhide', 10], ['emberore', 10]]) giveItem(id, n);
      const v = Z.npcs.find(n => n.role === 'alchemy'); o.npc = !!v; P.x = v.x + 40; P.y = v.y + 40; openNpc(v); await w(100); o.open = panelKind === 'alchemy';
      PANEL_ACTS.labmake('elixir:0'); o.titan = labHave('titanbrew'); PANEL_ACTS.labtab('oil'); PANEL_ACTS.labmake('oil:0'); o.oil = labHave('fireoil');
      PANEL_ACTS.labtab('trans'); PANEL_ACTS.labmake('trans:0'); o.glint = labHave('glintstone');
      P.x = 5 * TILE; P.y = 30 * TILE; const g0 = labHave('glintstone'); PANEL_ACTS.labmake('trans:0'); o.farAway = labHave('glintstone') === g0;
      closePanel(); enterZone('meadow'); await w(300); const m = mobs.find(m => !m.dead); m.d = { ...m.d, el: 'earth', hp: 1e9, def: 0 }; m.hp = 1e9; const rr = Math.random; Math.random = () => .99;
      let h0 = m.hp; dealPhys(m, 1, { sure: true }); const plain = h0 - m.hp; useItem('fireoil'); h0 = m.hp; dealPhys(m, 1, { sure: true }); const oiled = h0 - m.hp; Math.random = rr;
      o.dmg = { plain, oiled }; o.buff = !!labOilNow(); return o; });
    t.ok(r.npc && r.open, "Alchemist Verena's laboratory opens in Aurelmark");
    t.ok(r.titan === 2 && r.oil === 2 && r.glint === 2, 'she makes grand elixirs, elemental oils and transmutes materials');
    t.ok(r.farAway, 'recipes are made only in the laboratory');
    t.ok(r.buff && r.dmg.oiled > r.dmg.plain * 1.3, `Fire Oil makes weapon hits strike with fire (earth monster: ${r.dmg.plain} → ${r.dmg.oiled})`);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

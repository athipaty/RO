// v1.77.0: the Dye & Wardrobe in Aurelmark (js/wardrobe.js): dye the job outfit, costume hats and a costume cape, for gold,
// looks only, and other players see it.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const room = newRoom(), OFF = 'http://127.0.0.1:9';
  const A = await player('Fashion', room, { zone: 'meadow', server: OFF }); await wait(2000);
  const B = await player('Watcher', room, { zone: 'meadow', server: OFF });
  try {
    await wait(5000);
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.cls = 'cleric'; P.lv = 40; P.gold = 200000; S = computeStats(); const st0 = JSON.stringify(computeStats());
      const npc = getZone('capital').npcs.find(n => n.role === 'gemcut');
      openPanel('gemcut'); const txt = panel.textContent; PANEL_ACTS.wardpick('jade'); const g0 = P.gold; PANEL_ACTS.wardbuy('dye'); const dyeCost = g0 - P.gold;
      PANEL_ACTS.wardtab('cape'); PANEL_ACTS.wardcape('crimson'); const g1 = P.gold; PANEL_ACTS.wardbuy('cape'); const capeCost = g1 - P.gold;
      PANEL_ACTS.wardtab('hat'); const hat = wardHats()[2]; PANEL_ACTS.wardhat(hat); const g2 = P.gold; PANEL_ACTS.wardbuy('hat'); const hatCost = g2 - P.gold;
      PANEL_ACTS.wardhat(''); PANEL_ACTS.wardbuy('hat'); PANEL_ACTS.wardhat(hat); const g3 = P.gold; PANEL_ACTS.wardbuy('hat'); const again = g3 - P.gold; closePanel();
      // the outfit really changes colour while drawn, and goes back after
      const K0 = JSON.stringify(OUTFITS.cleric.cleric), dy = wardDyed(OUTFITS.cleric.cleric, 'jade', 'test'), changed = dy.robe !== OUTFITS.cleric.cleric.robe || dy.sleeve !== OUTFITS.cleric.cleric.sleeve;
      const c = document.createElement('canvas'); c.width = c.height = 120; const main = ctx; ctx = c.getContext('2d'); try { drawPlayer(P, null); } finally { ctx = main; }
      await w(1500);
      return { npc: npc && npc.name, txt: /Dye & Wardrobe/.test(txt) && /Costume cape/.test(txt), dyeCost, capeCost, hatCost, again, ward: JSON.stringify(P.ward), statsSame: JSON.stringify(computeStats()) === st0, restored: JSON.stringify(OUTFITS.cleric.cleric) === K0, changed, code: wardCode(P.ward) }; });
    t.ok(r.npc === 'Dyer Celestine' && r.txt, 'Dyer Celestine keeps the Dye & Wardrobe in Aurelmark (Sela\'s old shop)');
    t.ok(r.dyeCost === 2000 + 40 * 150 && r.capeCost === 25000 && r.hatCost > 0 && r.again === 0, `dye ${r.dyeCost}, cape ${r.capeCost}, a hat ${r.hatCost} once (wearing it again is free)`);
    t.ok(r.changed && r.restored && r.statsSame, 'the outfit is recoloured only while drawn, and nothing about the hero\'s stats changes');
    const seen = await B.ev(() => { const o = [...NET.others.values()][0]; return o && o.wd ? wardCode(o.wd) : null; });
    t.ok(seen === r.code, `the other player sees the dye, cape and hat (${seen})`);
    t.ok(!A.page.errors.length && !B.page.errors.length, 'no script errors ' + A.page.errors.concat(B.page.errors).slice(0, 3).join(' | '));
  } finally { await A.close(); await B.close(); }
};

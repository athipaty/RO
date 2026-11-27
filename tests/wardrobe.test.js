// v1.77.0 / v1.78.0: the Dye & Wardrobe in Aurelmark (js/wardrobe.js): dye, costume hats, a costume cape and an aura,
// for gold and looks only; try on, one Buy & wear for all of it, owned colours free to switch back to, saved looks;
// other players see it, and the stylist's preview shows it.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const room = newRoom(), OFF = 'http://127.0.0.1:9';
  const A = await player('Fashion', room, { zone: 'meadow', server: OFF }); await wait(2000);
  const B = await player('Watcher', room, { zone: 'meadow', server: OFF });
  try {
    await wait(5000);
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); P.cls = 'cleric'; P.lv = 40; P.gold = 300000; S = computeStats(); const st0 = JSON.stringify(computeStats());
      const npc = getZone('capital').npcs.find(n => n.role === 'gemcut'); openPanel('gemcut'); const txt = panel.textContent;
      const hat = wardHats()[2];
      // try on four things, one bill, one button
      PANEL_ACTS.wardset('dye:jade'); PANEL_ACTS.wardset('cape:crimson'); PANEL_ACTS.wardset('aura:sky'); PANEL_ACTS.wardset('hat:' + hat);
      const bill = wardBill(); const tried = !!document.querySelector('.wbar') && P.ward.dye === ''; const g0 = P.gold; PANEL_ACTS.wardbuy(); const paid = g0 - P.gold;
      // a new dye costs, going back to an owned one is free
      PANEL_ACTS.wardset('dye:rose'); const g1 = P.gold; PANEL_ACTS.wardbuy(); const rose = g1 - P.gold; PANEL_ACTS.wardset('dye:jade'); const g2 = P.gold; PANEL_ACTS.wardbuy(); const back = g2 - P.gold;
      // saved looks
      PANEL_ACTS.wardlook('save:0'); PANEL_ACTS.wardset('dye:'); PANEL_ACTS.wardset('cape:'); PANEL_ACTS.wardbuy(); const plain = wardCode(P.ward); const g3 = P.gold; PANEL_ACTS.wardlook('wear:0'); const wore = wardCode(P.ward) === 'jade|crimson|' + hat + '|sky' && P.gold === g3;
      closePanel();
      // the outfit is recoloured only while drawn
      const K0 = JSON.stringify(OUTFITS.cleric.cleric), c = document.createElement('canvas'); c.width = c.height = 120; const main = ctx; ctx = c.getContext('2d'); try { drawPlayer(P, null); } finally { ctx = main; }
      // the stylist's preview wears it too
      let styDyed = false; const _dh = drawHuman; drawHuman = function (x, y, b, h, f, wk, opt) { if (OUTFITS.cleric.cleric.robe !== JSON.parse(K0).robe || OUTFITS.cleric.cleric.sleeve !== JSON.parse(K0).sleeve) styDyed = true; return _dh.apply(this, arguments); };
      STY.lk = { ...lookFor(P.name) }; const cv = document.createElement('canvas'); cv.id = 'styCv'; cv.width = cv.height = 200; document.body.appendChild(cv); try { styDraw(); } finally { drawHuman = _dh; cv.remove(); STY.lk = null; }
      await w(1500);
      return { npc: npc && npc.name, txt: /Dye & Wardrobe/.test(txt) && /Saved looks/.test(txt), bill: bill.total, paid, rose, back, tried, plain, wore, statsSame: JSON.stringify(computeStats()) === st0, restored: JSON.stringify(OUTFITS.cleric.cleric) === K0, styDyed, code: wardCode(P.ward) }; });
    t.ok(r.npc === 'Dyer Celestine' && r.txt, 'Dyer Celestine keeps the Dye & Wardrobe in Aurelmark, with a Saved looks tab');
    t.ok(r.tried && r.bill > 0 && r.paid === r.bill, `trying things on costs nothing; one Buy & wear pays for all of it (${r.paid} gold for dye, cape, aura and a hat)`);
    t.ok(r.rose === 2000 + 40 * 150 && r.back === 0, `a new dye costs ${r.rose}; going back to one you own is free`);
    t.ok(r.wore, 'a saved look is worn again in one tap, for free');
    t.ok(r.restored && r.statsSame, 'the outfit is recoloured only while drawn; the hero\'s stats do not change');
    t.ok(r.styDyed, 'the stylist\'s preview shows the dyed outfit');
    const seen = await B.ev(() => { const o = [...NET.others.values()][0]; return o && o.wd ? wardCode(o.wd) : null; });
    t.ok(seen === r.code, `the other player sees the whole look (${seen})`);
    t.ok(!A.page.errors.length && !B.page.errors.length, 'no script errors ' + A.page.errors.concat(B.page.errors).slice(0, 3).join(' | '));
  } finally { await A.close(); await B.close(); }
};

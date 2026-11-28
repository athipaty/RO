// v1.89.0: the Items window's Equip tab badges each spare piece (▲ BETTER / ▼ WORSE / ⇅ MIXED) against what you wear (js/gearcompare.js)
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Cmp', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(800);
    const r = await g.ev(() => {
      const wid = P.eq.weapon && P.eq.weapon.id, wt = wid && ITEMS[wid].wt;
      const strong = 'tmpcmp'; ITEMS.tmpcmp = { ...ITEMS[wid], name: 'Test Bigclub', atk: (ITEMS[wid].atk || 0) + 40, lv: 1, price: 1 }; const ids = [wid];
      S = computeStats();
      const atk0 = S.atk, eq0 = JSON.stringify(P.eq);
      P.inv.push({ id: strong, uid: uid++, s: [] });
      P.inv.push({ id: ids[ids.length - 1], uid: uid++, s: [] });
      invTab = 'equip'; openPanel('items');
      const rows = [...panel.querySelectorAll('.row')].map(x => ({ cls: x.className, txt: x.textContent }));
      const out = { rows, atkSame: S.atk === atk0 && computeStats().atk === atk0, eqSame: JSON.stringify(P.eq) === eq0, strong: ITEMS[strong].name };
      invTab = 'use'; openPanel('items'); out.useTab = panel.querySelectorAll('.gcbadge').length; closePanel(); P.inv = P.inv.filter(e => e.id !== 'tmpcmp'); delete ITEMS.tmpcmp; return out; });
    const better = r.rows.find(x => x.txt.includes(r.strong));
    t.ok(better && /gcr-better/.test(better.cls) && /BETTER/.test(better.txt) && /ATK \+\d+/.test(better.txt), 'a stronger weapon shows ▲ BETTER with the ATK gain');
    t.ok(r.rows.some(x => /SAME/.test(x.txt) && /no stat change/.test(x.txt)), 'a copy of what you wear shows = SAME');
    t.ok(r.atkSame && r.eqSame, 'comparing leaves your gear and stats as they were');
    t.ok(r.useTab === 0, 'other tabs show no badges');
  } finally { await g.close(); }
};

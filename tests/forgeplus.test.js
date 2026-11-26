// v1.61.0: every weapon type can be forged at four stages; forged weapons sit between the shop and the boss relics
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Smith', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(600);
    const r = await g.ev(() => { const types = ['sword', 'axe', 'wand', 'bow', 'mace', 'dagger'], out = { stages: {}, badMat: [], order: true, weak: [], strong: [] };
      const forged = FORGES.map(f => f[0]).filter(id => ITEMS[id] && ITEMS[id].type === 'weapon');
      for (const wt of types) { const lv = forged.filter(id => ITEMS[id].wt === wt).map(id => ITEMS[id].lv);
        out.stages[wt] = [[25, 38], [44, 52], [64, 70], [84, 90]].map(([a, b]) => lv.some(l => l >= a && l <= b)).every(Boolean); }
      for (const f of FORGES) for (const m in f[2]) if (!ITEMS[m]) out.badMat.push(f[0] + ':' + m);
      for (let i = 1; i < FORGES.length; i++) if ((ITEMS[FORGES[i][0]].lv || 0) < (ITEMS[FORGES[i - 1][0]].lv || 0)) out.order = false;
      // each new forged weapon beats the best shop weapon of its type at or below its level, and no boss relic of a higher level is beaten
      const shop = [...SHOP, ...(typeof ROYAL_SHOP !== 'undefined' ? ROYAL_SHOP : [])].filter(id => ITEMS[id] && ITEMS[id].type === 'weapon');
      const pow = it => Math.max(it.atk || 0, it.matk || 0);
      for (const [id] of FORGE_PLUS) { const it = ITEMS[id], best = shop.filter(s => ITEMS[s].wt === it.wt && ITEMS[s].lv <= it.lv).map(s => pow(ITEMS[s]));
        if (best.length && pow(it) <= Math.max(...best)) out.weak.push(id);
        const relics = Object.keys(ITEMS).filter(k => ITEMS[k].boss && ITEMS[k].type === 'weapon' && ITEMS[k].wt === it.wt && ITEMS[k].lv >= it.lv);
        if (relics.some(k => pow(ITEMS[k]) < pow(it))) out.strong.push(id); }
      // a Shade can wear the dagger, a Forgehand the axe (the old forged guns are axes now)
      P.lv = 99; P.cls = 'shade'; out.shade = canEquip(ITEMS.salafang) === null; P.cls = 'forgehand'; out.gun = canEquip(ITEMS.pyrecannon) === null && ITEMS.pyrecannon.wt === 'axe';
      out.desc = itemDesc({ id: 'pyrecannon', s: [null, null] });
      openPanel('craft', 'forge'); out.listed = FORGE_PLUS.every(([id]) => document.querySelector('#panel').textContent.includes(ITEMS[id].name)) || null; closePanel();
      return out; });
    t.ok(Object.values(r.stages).every(Boolean), 'every weapon type can be forged at four stages ' + JSON.stringify(r.stages));
    t.ok(!r.badMat.length, 'every forge material exists' + (r.badMat.length ? ': ' + r.badMat.join(', ') : ''));
    t.ok(r.order, 'the forge lists its recipes by level');
    t.ok(!r.weak.length, 'each new forged weapon beats the shop weapons of its type up to its level' + (r.weak.length ? ': ' + r.weak.join(', ') : ''));
    t.ok(!r.strong.length, 'no forged weapon beats a boss relic of its type at the same or a higher level' + (r.strong.length ? ': ' + r.strong.join(', ') : ''));
    t.ok(r.shade && r.gun, 'Shades and Forgehands can forge weapons for themselves');
    t.ok(/^ATK 338 .*STR \+5/.test(r.desc), 'a forged weapon shows its stats (the old guns are axes, STR instead of DEX): ' + r.desc);
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

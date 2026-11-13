// the Sigil Codex at the Grand Library: every sigil with filters by equipment and ability, and sorting
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Reader', newRoom());
  try {
    const r = await g.ev(() => {
      giveItem('thornling_sig'); giveItem('vest'); const v = P.inv.find(e => e.id === 'vest'); P.inv.splice(P.inv.indexOf(v), 1); P.eq.armor = v; v.s = ['mossbug_sig'];
      enterZone('capital'); openNpc(Z.npcs.find(n => n.role === 'library'));
      const tabs = !!panel.querySelector('[data-act=cxtab][data-arg=sig]'); PANEL_ACTS.cxtab('sig');
      const cards = () => [...panel.querySelectorAll('.cxcard')];
      const total = cards().length, expect = Object.values(MOBS).filter(m => m.sig && !m.world).length;
      PANEL_ACTS.cxslot('weapon'); const weaponsOnly = cards().every(c => c.querySelector('.cxslot').textContent === 'Weapon');
      PANEL_ACTS.cxab('atk'); const atk = cards().map(c => +c.querySelector('.cxon').textContent.match(/\d+/)[0]);
      const best = atk.length > 1 && atk.every((v, i) => !i || atk[i - 1] >= v);
      PANEL_ACTS.cxslot('all'); PANEL_ACTS.cxab('all'); PANEL_ACTS.cxsort('own');
      const first = cards().slice(0, 2).map(c => c.querySelector('.nm').textContent).sort().join(',');
      PANEL_ACTS.cxsort('name'); const names = cards().map(c => c.querySelector('.nm').textContent); const abc = names.every((n, i) => !i || names[i - 1].localeCompare(n) <= 0);
      const kept = JSON.parse(localStorage.getItem('embervale.codex')).sort === 'name';
      const pics = cards().every(c => c.querySelector('.cxmob img'));
      cards()[0].click(); cards()[0].querySelector('img').click(); const card = document.getElementById('itemCard'); const quiet = !card || card.hidden;
      PANEL_ACTS.cxtab('gear'); PANEL_ACTS.gxsrc('drop'); PANEL_ACTS.gxslot('all'); PANEL_ACTS.gxab('all');
      const gcards = [...panel.querySelectorAll('.gxcard')], expectDrop = Object.keys(ITEMS).filter(id => GEAR.includes(ITEMS[id].type) && Object.values(MOBS).some(m => !m.world && (m.drops || []).some(([d]) => d === id))).length;
      const gearOk = gcards.length === expectDrop && gcards.every(c => c.querySelector('.gxsrc img') && /%/.test(c.querySelector('.gxpct').textContent));
      PANEL_ACTS.gxsort('chance'); const pcts = [...panel.querySelectorAll('.gxcard')].map(c => parseFloat(c.querySelector('.gxpct').textContent)); const byChance = pcts.every((v, i) => !i || pcts[i - 1] >= v);
      PANEL_ACTS.gxsrc('shop'); const shop = [...panel.querySelectorAll('.gxcard')].every(c => /Store ·/.test(c.textContent));
      PANEL_ACTS.gxsrc('all'); PANEL_ACTS.gxslot('head'); const heads = [...panel.querySelectorAll('.gxcard .cxslot')].every(x => x.textContent === 'Head');
      PANEL_ACTS.gxslot('all'); PANEL_ACTS.gxsort('slots'); const sc = [...panel.querySelectorAll('.gxcard')].map(c => c.querySelectorAll('.gxslots .pip.on').length);
      const slotsShown = sc.length > 0 && sc.every((v, i) => !i || sc[i - 1] >= v) && [...panel.querySelectorAll('.gxcard .ds')].every(d => !/Slots:/.test(d.textContent));
      PANEL_ACTS.gxsrc('drop'); const rollNote = [...panel.querySelectorAll('.gxcard')].every(c => c.querySelector('.gxroll'));
      PANEL_ACTS.gxsort('lv');
      PANEL_ACTS.cxtab('beast'); const back = /Bestiary:/.test(panel.textContent);
      return { tabs, total, expect, weaponsOnly, best, atk, first, abc, kept, back, pics, quiet, gearOk, n: gcards.length, expectDrop, byChance, shop, heads, slotsShown, rollNote };
    });
    t.ok(r.tabs && r.total === r.expect, `the library has a Sigil Codex tab listing every sigil (${r.total} of ${r.expect}; world-boss ones hidden until defeated)`);
    t.ok(r.weaponsOnly, 'the Weapon filter shows only weapon sigils');
    t.ok(r.best, `choosing ATK sorts by the biggest ATK bonus (${r.atk.join(', ')})`);
    t.ok(r.first === 'Mossbug Sigil,Thornling Sigil', 'Owned first puts sigils in the bag or socketed in gear at the top');
    t.ok(r.abc && r.kept, 'sorting by name works and the choice is remembered');
    t.ok(r.pics, 'every sigil card shows the monster that drops it');
    t.ok(r.quiet, 'tapping a card or its picture opens nothing extra: everything is already on the card');
    t.ok(r.gearOk, `the Equipment tab lists every piece monsters drop (${r.n} of ${r.expectDrop}) with the monster's picture and drop chance`);
    t.ok(r.byChance, 'sorting by best drop chance puts the likeliest drops first');
    t.ok(r.shop && r.heads, 'the Store source shows store prices, and the Head slot shows only headgear');
    t.ok(r.slotsShown, 'every piece shows its sigil slots, and Most slots sorts by them');
    t.ok(r.rollNote, 'monster drops say how many slots they can roll');
    t.ok(r.back, 'the Bestiary tab still shows the monster records');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

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
      cards()[0].querySelector('.cxb').click(); const card = document.getElementById('itemCard'); const big = !card.hidden && !!card.querySelector('.icbig img'); hideItemCard();
      PANEL_ACTS.cxtab('beast'); const back = /Bestiary:/.test(panel.textContent);
      return { tabs, total, expect, weaponsOnly, best, atk, first, abc, kept, back, pics, big };
    });
    t.ok(r.tabs && r.total === r.expect, `the library has a Sigil Codex tab listing every sigil (${r.total} of ${r.expect}; world-boss ones hidden until defeated)`);
    t.ok(r.weaponsOnly, 'the Weapon filter shows only weapon sigils');
    t.ok(r.best, `choosing ATK sorts by the biggest ATK bonus (${r.atk.join(', ')})`);
    t.ok(r.first === 'Mossbug Sigil,Thornling Sigil', 'Owned first puts sigils in the bag or socketed in gear at the top');
    t.ok(r.abc && r.kept, 'sorting by name works and the choice is remembered');
    t.ok(r.pics, 'every sigil card shows the monster that drops it');
    t.ok(r.big, 'tapping a card opens its details with a large picture of the monster');
    t.ok(r.back, 'the Bestiary tab still shows the monster records');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

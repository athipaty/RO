// General Store, Equip: tabs by gear type (like the forge), sections in All, a dot where you can buy and wear something
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Buyer', newRoom());
  try {
    const r = await g.ev(() => { P.gold = 900; openNpc(Z.npcs.find(n => n.role === 'shop')); PANEL_ACTS.shopcat('equip'); PANEL_ACTS.shopgear('all');
      const tabs = [...panel.querySelectorAll('.ftabs [data-act=shopgear]')].map(b => b.dataset.arg), secs = panel.querySelectorAll('.fsec').length;
      const dotW = !!panel.querySelector('.ftabs [data-arg=weapon] .fdot'), dotH = !!panel.querySelector('.ftabs [data-arg=head] .fdot');
      PANEL_ACTS.shopgear('head'); const heads = [...panel.querySelectorAll('[data-act=buy]')], onlyHeads = heads.length > 0 && heads.every(b => ITEMS[b.dataset.arg].type === 'head');
      const keep = localStorage.getItem('embervale.shopGear') === 'head';
      PANEL_ACTS.shopcat('use'); const useClean = !panel.querySelector('.ftabs') && panel.querySelectorAll('[data-act=buy]').length > 0;
      PANEL_ACTS.shopcat('equip'); PANEL_ACTS.shopgear('all'); closePanel(); return { tabs, secs, dotW, dotH, onlyHeads, keep, useClean }; });
    t.ok(r.tabs[0] === 'all' && ['weapon', 'armor', 'head', 'accessory'].every(k => r.tabs.includes(k)) && r.secs === r.tabs.length - 1, `Equip has gear-type tabs (${r.tabs.join(', ')}) and All is split into sections`);
    t.ok(r.onlyHeads && r.keep, 'the Head tab lists only headgear, and the choice is remembered');
    t.ok(!r.dotW && r.dotH, 'a dot marks tabs with something a Novice can afford and wear (headgear yes, weapons no)');
    t.ok(r.useClean, 'the Use tab is unchanged');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

// #57 seasonal events: five festivals, tokens from kills during a festival, Pim trades prizes, town decorations.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Festive', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const cal = await A.ev(() => { const at = (y, m, d) => Date.UTC(y, m, d, 5) ; return [festNow(at(2027, 1, 14)), festNow(at(2027, 3, 12)), festNow(at(2027, 3, 25)), festNow(at(2026, 9, 31)), festNow(at(2026, 10, 5)), festNow(at(2026, 11, 24)), festNow(at(2027, 6, 1))].join(); });
    t.ok(cal === 'blossom,splash,,harvest,lanterns,snow,', 'the calendar: Feb blossom, Apr 10-20 splash, Oct harvest, Nov lanterns, Dec snow: ' + cal);
    const drop = await A.ev(() => { enterZone('meadow'); const real = festNow; const kill = () => { const m = mobs.find(x => !x.dead); m.myDmg = 5; const n0 = loot.filter(l => l.id === 'gourdtok').length; const r = Math.random; Math.random = () => .05; killMob(m); Math.random = r; return loot.filter(l => l.id === 'gourdtok').length - n0; };
      festNow = () => 'harvest'; const got = kill(); festNow = () => null; const after = kill(); festNow = real; return { got, after, bag: !!invFind('gourdtok') }; });
    t.ok(drop.got === 1 && drop.after === 0 && !drop.bag, 'during a festival its token drops on the ground; outside festivals it does not');
    const trade = await A.ev(() => { const real = festNow; festNow = () => 'harvest'; P.inv = []; giveItem('gourdtok', 35); enterZone('town'); const pim = Z.npcs.find(n => n.role === 'festival'); openNpc(pim);
      const txt = panel.textContent; panel.querySelector('[data-act="festbuy"][data-arg="prize"]').click(); const hat = !!P.inv.find(e => e.id === 'gourdhat'), left = invFind('gourdtok').n; closePanel(); festNow = real; return { pim: !!pim, txt: /Harvest Moon/.test(txt) && /calendar/i.test(txt), hat, left }; });
    t.ok(trade.pim && trade.txt, 'Festival Keeper Pim stands in Hearthvale with the calendar');
    t.ok(trade.hat && trade.left === 5, '30 tokens buy the festival hat');
    const sold = await A.ev(() => { P.inv = []; giveItem('gourdtok', 4); giveItem('pelt', 3); enterZone('town'); const shop = Z.npcs.find(n => n.role === 'shop'); openNpc(shop); shopTab = 'sell'; shopCat = 'etc'; refreshPanel(); const b = panel.querySelector('[data-act="sellall"]'); if (b) b.click(); closePanel(); return { tok: (invFind('gourdtok') || {}).n || 0, pelt: (invFind('pelt') || {}).n || 0 }; });
    t.ok(sold.tok === 4 && sold.pelt === 0, '"Sell all loot" keeps festival tokens');
    const look = await A.ev(async () => { const real = festNow; festNow = () => 'blossom'; P.inv = []; giveItem('blossomcrown'); useInv(0); enterZone('town'); let n = 0; const o = drawHat; drawHat = (id, ...a) => { if (id === 'blossomcrown') n++; return o(id, ...a); };
      await new Promise(r => setTimeout(r, 400)); drawHat = o; festNow = real; return n; });
    t.ok(look > 2, 'festival hats are drawn on your hero');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

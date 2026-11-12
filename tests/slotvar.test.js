// #19 slotted gear variants: picked-up gear rolls 0-4 slots, shop gear does not, name/sell/trade keep it.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Slots', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const dist = await A.ev(() => { const c = {}; for (let i = 0; i < 2000; i++) { const n = rollSlots(1); c[n] = (c[n] || 0) + 1; } return c; });
    t.ok(dist[0] > 250 && dist[1] > 950 && dist[2] > 250 && dist[3] > 60 && !dist[4], 'rolls spread around the usual count: ' + JSON.stringify(dist));
    t.ok(await A.ev(() => rollSlots(4, .99) === 4 && rollSlots(0, .01) === 0), 'never below 0 or above 4');
    const pick = await A.ev(() => { P.inv = []; const r0 = Math.random; Math.random = () => .95; const l = { id: 'robe', x: P.x, y: P.y, t0: 0 }; loot.push(l); pickUp(l); Math.random = r0;
      const e = P.inv.find(x => x.id === 'robe'); return { n: e && e.s.length, name: e && itemName(e), log: /fine find/.test(document.getElementById('log').textContent) }; });
    t.ok(pick.n === 3 && pick.name === 'Sage Robe [3]' && pick.log, `a lucky pick-up has extra slots and says so (${pick.name})`);
    const shop = await A.ev(() => { P.inv = []; const r0 = Math.random; Math.random = () => .95; giveItem('robe'); Math.random = r0; const e = P.inv[0]; return { n: e.s.length, name: itemName(e) }; });
    t.ok(shop.n === 1 && shop.name === 'Sage Robe', 'bought or given gear keeps the usual count and name');
    const sell = await A.ev(() => ({ normal: sellValueOf({ id: 'robe', s: [null] }), extra: sellValueOf({ id: 'robe', s: [null, null, null] }), fewer: sellValueOf({ id: 'robe', s: [] }) }));
    t.ok(sell.extra > sell.normal && sell.fewer < sell.normal, `extra slots sell for more (${sell.fewer} / ${sell.normal} / ${sell.extra})`);
    const trade = await A.ev(() => { const v = validEntry({ id: 'robe', s: ['sproutling_sig', null, null], r: 2 }, true); return v && v.s.length === 3 && v.s[0] === 'sproutling_sig'; });
    t.ok(trade, 'trades keep the slot count and socketed sigils');
    const sock = await A.ev(() => { P.lv = 30; P.inv = [{ id: 'robe', uid: 999, s: [null, null, null] }]; useInv(0); giveItem('sproutling_sig', 2); useInv(P.inv.findIndex(e => e.id === 'sproutling_sig')); useInv(P.inv.findIndex(e => e.id === 'sproutling_sig')); return P.eq.armor.s.filter(Boolean).length; });
    t.ok(sock === 2, 'the extra slots take sigils');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

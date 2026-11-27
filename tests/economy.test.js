// v1.75.0: money that keeps up with the hunt (js/economy.js): late loot worth more, the Grand Tonic, smoother late gear
// prices, a little less quest gold from Lv 40.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Merchant', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    const r = await A.ev(() => { const mat = (mob) => (MOBS[mob].drops || []).find(([id, p]) => ITEMS[id] && ITEMS[id].type === 'etc' && p >= .3)[0];
      const early = mat('hopper'), late = mat('astralserpent');
      const g = ITEMS.grandtonic, c = ITEMS.crimson, ph = ITEMS.phoenix;
      P.lv = 75; P.inv = [{ id: 'grandtonic', n: 3 }, { id: 'crimson', n: 3 }]; S = computeStats(); P.hp = Math.round(S.maxhp * .3); P.cd = {}; P.auto = true; P.target = null; enterZone('meadow');
      const before = P.hp; autoHunt(); const drank = before < P.hp ? (P.inv.find(i => i.id === 'grandtonic') || { n: 0 }).n : -1;
      P.lv = 70; const dq = (() => { dqEnsure(); const q = P.qs.dq; const id = Object.keys(q.list)[0]; const x = q.list[id]; return { lv: MOBS[x.mob].lv, gold: QUESTS[id].reward.gold }; })();
      return { early: [early, sellValue(early), !!ITEMS[early]._econ], late: [late, sellValue(late), ITEMS[late]._econ], perHp: [g.price / g.heal, c.price / c.heal, ph.price / ph.heal], royal: ROYAL_SHOP.includes('grandtonic'),
        storm: ITEMS.stormaxe.price, sun: ITEMS.sunplate.price, star: ITEMS.staraxe.price, drank, dq, k: [ECON_QK(30), ECON_QK(45), ECON_QK(70)] }; });
    t.ok(r.late[2] === 1 && !r.early[2], `late materials sell for more (${r.late[0]} ${r.late[1]} gold), early ones are unchanged (${r.early[0]} ${r.early[1]})`);
    t.ok(r.royal && r.perHp[0] < r.perHp[1] && r.perHp[0] < r.perHp[2], 'the Grand Tonic in the royal shop is the cheapest healing per HP');
    t.ok(r.drank === 2, 'auto-hunt drinks it when it covers what is missing');
    t.ok(r.storm === 44200 && r.sun === 110900 && r.star === 90000, 'the Lv 60 Storm and Lv 90 Sun gear cost 15% less; the Star gear stays');
    t.ok(r.k[0] === 1 && Math.abs(r.k[1] - .85) < 1e-9 && r.k[2] === .7, 'quest gold: full below Lv 40, x0.85 at 45, x0.7 from 50');
    t.ok(!A.page.errors.length, 'no script errors ' + A.page.errors.slice(0, 3).join(' | '));
  } finally { await A.close(); }
};

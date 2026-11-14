// Bounty board: 3 daily + 1 weekly for your level, kills count, claim pays and adds points, chest at 10; daily login gift
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Hunter', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      P.lv = 15; P.bounty = null; const b = bState(); out.n = b.d.length; out.weekly = !!b.w; out.near = b.d.every(x => Math.abs(MOBS[x.mob].lv - 15) <= 8);
      out.same = JSON.stringify(bMake(b.day)) === JSON.stringify(b.d.map(x => ({ ...x })));
      enterZone('town'); await sleep(200); const n = Z.npcs.find(n => n.role === 'job'); P.x = n.x + 30; P.y = n.y + 30; openNpc(n); await sleep(50);
      out.board = !!panel.querySelector('.bpts') && panel.querySelectorAll('.bty').length === 4;
      // finish the first kill bounty
      const x = b.d.find(x => x.k === 'kill'); for (let i = 0; i < x.n; i++) { const m = { d: MOBS[x.mob], dead: false, myDmg: 5, x: P.x, y: P.y, hp: 1 }; mobs.push(m); m.idx = mobs.length - 1; killMob(m); }
      out.done = bDone(x); refreshPanel(); const i = b.d.indexOf(x), lv0 = P.lv, g0 = P.gold;
      panel.querySelector(`[data-act="bclaim"][data-arg="${i}"]`).click(); out.claimed = x.claimed === 1 && P.gold > g0 && b.pts === 1;
      // a bring bounty takes the items
      const y = b.d.find(z => z.k === 'bring'); if (y) { giveItem(y.item, y.n); refreshPanel(); panel.querySelector(`[data-act="bclaim"][data-arg="${b.d.indexOf(y)}"]`).click(); out.bring = y.claimed === 1 && !invFind(y.item); } else out.bring = true;
      // chest at 10 points
      b.pts = 10; refreshPanel(); const inv0 = P.inv.length, g1 = P.gold; panel.querySelector('[data-act="bchest"]').click(); out.chest = b.chest === 1 && P.gold > g1;
      closePanel();
      // login gift
      P.login = null; const red0 = (invFind('red') || {}).n || 0; giftPill(); out.pill = !document.getElementById('giftPill').hidden; document.getElementById('giftPill').click(); out.card = document.getElementById('loginCard').classList.contains('show') && /day 1 of 7/.test(document.getElementById('loginCard').textContent);
      document.querySelector('#loginCard [data-lg="claim"]').click(); out.gift = ((invFind('red') || {}).n || 0) === red0 + 5 && loginNext() === null;
      // next day continues the streak, a missed day restarts it
      const yd = new Date(Date.now() + 7 * 3600e3 - 864e5).toISOString().slice(0, 10); P.login = { last: yd, day: 3 }; out.streak = loginNext() === 4;
      P.login = { last: '2020-01-01', day: 5 }; out.reset = loginNext() === 1;
      out.saved = SAVE_EXTRA.includes('bounty') && SAVE_EXTRA.includes('login') && snapshot().p.bounty.day === b.day;
      return out; });
    t.ok(r.n === 3 && r.weekly && r.near, '3 daily bounties near your level and a weekly one');
    t.ok(r.same, 'the picks stay the same all day');
    t.ok(r.board, 'the Guild Hall shows the board');
    t.ok(r.done && r.claimed, 'kills count by themselves and claiming pays and adds a point');
    t.ok(r.bring, 'a bring bounty takes the items when claimed');
    t.ok(r.chest, '10 points open the weekly chest');
    t.ok(r.pill && r.card && r.gift, 'a gift pill shows; tapping it opens the calendar, which gives day 1: 5 Red Tonics');
    t.ok(r.streak && r.reset, 'coming back the next day continues the streak; a missed day restarts it');
    t.ok(r.saved, 'bounties and the gift streak are saved with the character');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

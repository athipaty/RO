// Danger colours on monster names, the combo counter, loot flying into the bag
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Feel', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = {};
      P.lv = 20; const d = lv => ({ ...MOBS.sproutling, lv, boss: false });
      out.cols = [monCol(d(5)), monCol(d(15)), monCol(d(21)), monCol(d(25)), monCol(d(28)), monCol(d(32)), monCol({ ...MOBS.sproutling, boss: true })].join(' ');
      out.skull = /^☠ /.test(monLabel(d(32))) && !/☠/.test(monLabel(d(21)));
      out.aggro = /⚔$/.test(monLabel({ ...MOBS.sproutling, lv: 20, aggro: true }));
      // combo: three of our kills in a row
      enterZone('meadow'); await sleep(200); const ms = mobs.filter(m => !m.dead).slice(0, 3);
      for (const m of ms) { m.myDmg = 5; killMob(m); await sleep(50); } const c = document.getElementById('combo'); out.combo = c && c.classList.contains('show') && c.textContent.startsWith('3');
      // loot fly: pick up an item next to the hero
      loot.push({ id: 'sap', gold: 0, x: P.x + 10, y: P.y, fx: P.x + 10, fy: P.y, t0: now - 1, exp: now + 60, uid: ++lootId });
      const before = new Set(document.querySelectorAll('.lootfly')); pickUp(loot[loot.length - 1]); const mine = [...document.querySelectorAll('.lootfly')].find(e => !before.has(e)); out.fly = !!mine;
      for (let k = 0; k < 30 && mine && mine.isConnected; k++) await sleep(100); /* this picture (other drops may be flying too), up to 3 s on a busy machine */ out.flyGone = !!mine && !mine.isConnected;
      return out; });
    t.ok(r.cols === '#9aa3ad #8fe0a0 #ffffff #ffe27a #ffaa5a #ff6a5a #ffcf5a', 'names go grey, green, white, yellow, orange, red by level, gold for bosses (' + r.cols + ')');
    t.ok(r.skull && r.aggro, 'deadly monsters get a skull, aggressive ones a ⚔');
    t.ok(r.combo, 'three quick kills show a combo of 3');
    t.ok(r.fly && r.flyGone, 'a picked-up item flies to the bag and disappears' + (r.fly && r.flyGone ? '' : ` (fly ${r.fly}, gone ${r.flyGone})`));
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

// v1.83.0: leaderboards and seasons (js/ranks.js; the server side is routes/embervale/leaderboard.js in the server repo).
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Ranker', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(300);
      // counting this season: monsters and bosses you hurt
      P.ls = null; const m = mobs.find(o => !o.dead && !o.d.boss), b = mobs.find(o => !o.dead && o.d.boss); m.myDmg = 5; killMob(m); b.myDmg = 5; killMob(b);
      const s = rkSeason(Date.now()), counted = P.ls.s === s && P.ls.k === 1 && P.ls.b === 1;
      // a new month moves the count to last season
      P.ls = { s: '2000-01', k: 7, b: 2 }; rkMine(); const rolled = P.lsPrev.s === '2000-01' && P.lsPrev.k === 7 && P.ls.s === s && P.ls.k === 0;
      const saved = ['ls', 'lsPrev', 'lsClaim'].every(k => SAVE_EXTRA.includes(k));
      // no server: a clear message
      openPanel('ranks'); await w(400); const offline = /not reachable/.test(panel.textContent); closePanel();
      // a pretend server answer
      const prev = '2026-10'; RANK.err = ''; const _api = api;
      api = async () => ({ season: s, prev, lists: { level: [{ rank: 1, name: 'Bo', cls: 'warbringer', lv: 90, reborn: 1, v: 90 }, { rank: 2, name: 'Ranker', cls: 'novice', lv: 1, reborn: 0, v: 1, me: true }], kills: [{ rank: 1, name: 'Cy', cls: 'warden', lv: 40, v: 800 }], bosses: [], gold: [] },
        hall: { kills: [{ rank: 1, name: 'Ranker', cls: 'novice', lv: 1, v: 999, me: true }], bosses: [{ rank: 2, name: 'Ranker', cls: 'novice', lv: 1, v: 9, me: true }] }, me: { level: { rank: 2, v: 1, of: 2 } } });
      RANK.data = null; P.lsClaim = null; openPanel('ranks'); await w(400); const txt = panel.textContent, meRow = !!panel.querySelector('.rkrow.me'), tabs = panel.querySelectorAll('.rktab').length;
      const prize = rkPrize(); const g0 = P.gold; PANEL_ACTS.rkclaim(); const paid = P.gold - g0; PANEL_ACTS.rkclaim(); const once = P.gold - g0 === paid;
      PANEL_ACTS.rkcat('bosses'); const empty = /Nobody on this list/.test(panel.textContent); closePanel(); api = _api;
      return { counted, rolled, saved, offline, list: /Bo/.test(txt) && /Your place: 2 of 2/.test(txt) && /Hall of Fame/.test(txt), meRow, tabs, prize, paid, once, empty, menu: !!document.getElementById('mRanks') }; });
    t.ok(r.counted && r.saved, 'each hero counts the monsters and bosses it defeats this season (saved with the hero)');
    t.ok(r.rolled, 'a new month moves the count to last season');
    t.ok(r.offline, 'without the game server the window says so');
    t.ok(r.menu && r.tabs === 4 && r.list && r.meRow, '☰ → Ranks: four lists, your own row marked, your place, and last season\'s Hall of Fame');
    t.ok(r.prize === 50000 + 30000 && r.paid === r.prize && r.once, `a Hall of Fame hero claims the prize once (${r.paid} gold for 1st in monsters and 2nd in bosses)`);
    t.ok(r.empty, 'an empty list says so');
    t.ok(!A.page.errors.length, 'no script errors ' + A.page.errors.slice(0, 3).join(' | '));
  } finally { await A.close(); }
};

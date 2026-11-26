// v1.66.0: the first ten minutes: a quiet first screen, the story quest first, a Recommended button for stat points
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Newcomer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(1200);
    const r = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), out = {};
      enterZone('town'); await w(500);
      out.newbie = document.body.classList.contains('newbie');
      const gift = document.getElementById('giftPill'); out.giftHidden = !gift || getComputedStyle(gift).display === 'none';
      out.badgeHidden = getComputedStyle(document.getElementById('onlineBadge')).display === 'none';
      const logText = document.getElementById('log').textContent; out.noOre = !/mines are running low/.test(logText); out.noFest = !/is on! Monsters drop/.test(logText);
      // Elder Hollis: the story quest first and marked, the dailies folded
      const n = Z.npcs.find(n => /Hollis/.test(n.name)); P.x = n.x + 30; P.y = n.y + 30; openNpc(n); await w(200);
      const main = panel.querySelector('.tq.tqmain'), fold = panel.querySelector('details.tqd');
      out.story = !!main && !QUESTS[main.dataset.arg.split(':')[1]].daily; out.folded = !!fold && !fold.open && fold.querySelectorAll('.tq').length >= 2; closePanel();
      // Recommended spends the points
      openPanel('status'); await w(100); const b = panel.querySelector('[data-act="statauto"]'); const pts = P.statPts, atk = S.atk; if (b) b.click(); await w(100);
      out.auto = !!b && P.statPts < 3 && P.statPts < pts && S.atk > atk; closePanel();
      // a seasoned hero sees it all again
      P.tut = 'done'; P.lv = 20; await w(600); out.after = !document.body.classList.contains('newbie');
      return out; });
    t.ok(r.newbie && r.giftHidden && r.badgeHidden, 'a new hero first sees a quiet screen: no gift chip, no online badge');
    t.ok(r.noOre && r.noFest, 'no news meant for later (ore shortage, festival) on the first screen');
    t.ok(r.story && r.folded, 'Elder Hollis lists the story quest first and marked, the daily tasks folded under one heading');
    t.ok(r.auto, '✨ Recommended spends the stat points on a sound build');
    t.ok(r.after, 'once the first steps are done the full screen comes back');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

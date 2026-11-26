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
      // (v1.66.1) the stat box goes when nothing can be bought; skill points have their own Recommended
      P.statPts = 1; openPanel('status'); await w(100); out.statBoxGone = !panel.querySelector('.statauto'); closePanel();
      P.skillPts = 3; openPanel('skills'); await w(100); const sb = panel.querySelector('[data-act="skillauto"]'); if (sb) sb.click(); await w(100); out.skillAuto = !!sb && (P.skills.firstaid || 0) === 3 && P.skillPts === 0; closePanel();
      // the tip waits while the story quest points at someone in town
      enterZone('town'); P.tut = TUT_STEPS.findIndex(s => s.k === 'meadow'); GOAL.t = { npc: 'Brannoc the Smith', zone: 'town' }; out.tipWaits = /Finish your quest first/.test(TUT_STEPS[P.tut].t());
      // the first time HP runs low in the wild, a word on tonics and sitting
      enterZone('meadow'); P.lowTip = 0; P.hp = Math.floor(S.maxhp * .2); await w(800); out.lowTip = P.lowTip === 1 && /Low on HP/.test(document.getElementById('log').textContent); P.hp = S.maxhp;
      // (v1.66.2) the help page speaks of taps, not keys
      openPanel('help'); await w(150); const ht = panel.textContent; out.helpKeys = ['WASD', 'Tab targets', 'press X', '(C)', '(K)', 'Press J', 'right-click', '(G)', '(E)', 'Enter or'].filter(k => ht.includes(k)); out.helpNew = /Drag anywhere/.test(ht) && /Tidewater Isle/.test(ht) && /✨ Recommended/.test(ht); closePanel();
      // (v1.66.3) no blank goal chip when the next story quest needs a higher level; Corvin's First Aid note opens Skills
      P.tut = 'done'; for (const id of ['letter', 'sprouts', 'watch']) { delete QS().active[id]; if (!QS().done.includes(id)) QS().done.push(id); } P.lv = 4; P.track = null;
      const gw = goalWhat(); out.gap = gw && /Reach Lv \d+ for the next story: hunt in /.test(gw.text) ? gw.text : (gw && gw.text) || 'none';
      P.jl = 10; P.skills.firstaid = 0; enterZone('town'); await w(200); const c = Z.npcs.find(n => /Corvin/.test(n.name)); P.x = c.x + 30; P.y = c.y + 30; openNpc(c); await w(250);
      const ob = panel.querySelector('.aidnote [data-act="openskills"]'); out.aidKey = /with K/.test(panel.textContent); if (ob) ob.click(); await w(150); out.aidBtn = !!ob && panelKind === 'skills'; closePanel(); P.jl = 1;
      // a seasoned hero sees it all again
      P.tut = 'done'; P.lv = 20; await w(600); out.after = !document.body.classList.contains('newbie');
      return out; });
    t.ok(r.newbie && r.giftHidden && r.badgeHidden, 'a new hero first sees a quiet screen: no gift chip, no online badge');
    t.ok(r.noOre && r.noFest, 'no news meant for later (ore shortage, festival) on the first screen');
    t.ok(r.story && r.folded, 'Elder Hollis lists the story quest first and marked, the daily tasks folded under one heading');
    t.ok(r.auto, '✨ Recommended spends the stat points on a sound build');
    t.ok(r.statBoxGone && r.skillAuto, 'the stat box hides when nothing can be bought; skill points have their own Recommended (a Novice learns First Aid)');
    t.ok(r.tipWaits, 'the first-steps tip waits while the story quest points at someone in town');
    t.ok(r.lowTip, 'the first time HP runs low in the wild, a word on tonics and sitting');
    t.ok(!r.helpKeys.length && r.helpNew, 'the help page is written for phones and covers the world as it is now' + (r.helpKeys.length ? ': still mentions ' + r.helpKeys.join(', ') : ''));
    t.ok(/Reach Lv/.test(r.gap), 'when the next story quest needs a higher level, the goal chip says so and where to hunt: ' + r.gap);
    t.ok(r.aidBtn && !r.aidKey, "Corvin's First Aid note has a button that opens Skills (no keyboard key)");
    t.ok(r.after, 'once the first steps are done the full screen comes back');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

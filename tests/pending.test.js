// Stat and skill points are planned first (js/pending.js): a bar offers Save and Undo; closing without saving gives
// the points back; a level-up meanwhile is kept; saves store the hero as it was before the plan.
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Planner', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const r = await g.ev(() => {
      const out = {}, pts = P.statPts, str = P.st.str;
      openPanel('status'); panel.querySelector('[data-act="stat"][data-arg="str"]').click(); panel.querySelector('[data-act="stat"][data-arg="str"]').click();
      out.bar = !!panel.querySelector('.pendbar') && /STR \+2/.test(panel.querySelector('.pendbar').textContent); out.shown = P.st.str === str + 2;
      out.saved = snapshot().p.st.str === str; // a save meanwhile keeps the old value
      P.statPts += 5; // a level-up while planning
      closePanel(); out.back = P.st.str === str && P.statPts === pts + 5 && !PEND;
      openPanel('status'); panel.querySelector('[data-act="stat"][data-arg="agi"]').click(); panel.querySelector('[data-act="pendundo"]').click(); out.undo = P.st.agi === 1 && P.statPts === pts + 5;
      panel.querySelector('[data-act="stat"][data-arg="dex"]').click(); panel.querySelector('[data-act="pendsave"]').click(); closePanel(); out.keep = P.st.dex === 2;
      // skills: Learn plans, Save keeps
      P.skillPts = 3; P.jl = 10; openPanel('skills'); PANEL_ACTS.sksel('firstaid'); const b = panel.querySelector('[data-act="learn"][data-arg="firstaid"]'); if (b) b.click();
      out.skBar = !!panel.querySelector('.pendbar'); openPanel('status'); out.skBack = !P.skills.firstaid && P.skillPts === 3;
      openPanel('skills'); PANEL_ACTS.sksel('firstaid'); panel.querySelector('[data-act="learn"][data-arg="firstaid"]').click(); panel.querySelector('[data-act="pendsave"]').click(); closePanel(); out.skKeep = P.skills.firstaid === 1 && P.skillPts === 2;
      return out;
    });
    t.ok(r.bar && r.shown, 'tapping + shows the new value and a "Not saved yet" bar');
    t.ok(r.saved, 'a save while planning stores the hero as it was');
    t.ok(r.back, 'closing without saving gives the points back, and a level-up meanwhile is kept');
    t.ok(r.undo, 'Undo gives them back at once');
    t.ok(r.keep, 'Save keeps them');
    t.ok(r.skBar && r.skBack && r.skKeep, 'skills work the same: Learn plans, leaving undoes, Save keeps');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

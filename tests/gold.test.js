// #25 gold sinks: the Waystation bunk (Well rested EXP bonus) and Guild Hall stat/skill resets.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Goldsink', newRoom(), { zone: 'town', server: 'http://127.0.0.1:9' });
  try {
    await wait(1500);
    const inn = await g.ev(() => { activeEvents = () => []; // no EXP Weekend or Golden Hour while measuring
      P.lv = 20; P.gold = 5000; P.hp = 1; P.sp = 0; openPanel('warp');
      const btn = panel.querySelector('[data-act="inn"]'); const has = !!btn; btn.click();
      const paid = 5000 - P.gold; const full = P.hp === S.maxhp && P.sp === S.maxsp; const rest = isRested(); const txt = panel.textContent;
      const e0 = P.exp; gainExp(100, 0); const got = P.exp - e0; closePanel();
      const saved = snapshot().p.rested > Date.now(); P.rested = Date.now() - 1; const e1 = P.exp; gainExp(100, 0); const after = P.exp - e1;
      return { has, paid, cost: 50 + 20 * 10, full, rest, left: /Well rested 15m left/.test(txt), got, after, saved, line: document.getElementById('gold').textContent }; });
    t.ok(inn.has && inn.paid === inn.cost && inn.full, `renting a bunk at the Waystation costs ${inn.cost} gold at Lv 20 and refills HP and SP`);
    t.ok(inn.rest && inn.left && inn.saved, 'you wake Well rested for 15 minutes, and that is saved');
    t.ok(inn.got === 110 && inn.after === 100, `Well rested gives +10% EXP (${inn.got} instead of 100), and stops when it runs out`);
    const rs = await g.ev(() => { P.st = { str: 15, agi: 1, vit: 5, int: 1, dex: 1, luk: 1 }; P.statPts = 3; P.gold = 100000; P.lv = 20; P.jl = 12; P.cls = 'warden';
      P.skills = { cleave: 3, firstaid: 1 }; P.skillPts = 2; P.hot = ['cleave', null, null, null]; rebuildHotbar(); S = computeStats();
      const want = statSpent(15) + statSpent(5) + 3; openPanel('job');
      const b = () => panel.querySelector('[data-act="respec"][data-arg="stats"]'); const has = !!b() && !!panel.querySelector('[data-act="respec"][data-arg="skills"]');
      const g0 = P.gold; b().click(); const asked = /Confirm/.test(b().textContent) && P.st.str === 15 && P.gold === g0;
      b().click(); const stats = { str: P.st.str, vit: P.st.vit, pts: P.statPts, paid: g0 - P.gold };
      const s = () => panel.querySelector('[data-act="respec"][data-arg="skills"]'); const g1 = P.gold; s().click(); s().click();
      const skills = { pts: P.skillPts, none: !Object.keys(P.skills).length, paid: g1 - P.gold }; const gone = !panel.querySelector('[data-act="respec"]'); closePanel();
      return { has, asked, want, stats, skills, gone, free: FREE_RESETS, sc: FREE_RESETS ? 0 : 500 + 20 * 100, kc: FREE_RESETS ? 0 : 300 + 12 * 50 }; });
    t.ok(rs.has && rs.asked, 'the Guild Hall offers resets, and asks for a second click first');
    t.ok(rs.stats.str === 1 && rs.stats.vit === 1 && rs.stats.pts === rs.want && rs.stats.paid === rs.sc, `a stat reset gives back every point (${rs.stats.pts}) for ${rs.sc} gold`);
    t.ok(rs.skills.none && rs.skills.pts === 6 && rs.skills.paid === rs.kc, `a skill reset gives back every skill point (6) for ${rs.kc} gold`);
    t.ok(rs.gone, 'with nothing left to reset, the offers disappear');
    const poor = await g.ev(() => { P.gold = 10; openPanel('warp'); const d = panel.querySelector('[data-act="inn"]').disabled; closePanel(); return d; });
    t.ok(poor, 'you cannot rest without enough gold');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

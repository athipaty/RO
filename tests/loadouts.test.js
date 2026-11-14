// Build loadouts: save stats/skills/hotbar, switch keeps point totals honest, third slot unlocks for gold
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Builder', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(400);
    const r = await g.ev(async () => { const out = {};
      P.cls = 'warden'; P.lv = 30; P.jl = 20; P.st = { str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 }; P.statPts = 900; P.skills = {}; P.skillPts = 19;
      // setup A: STR build
      P.st.str = 40; P.statPts = 900 - statSpent(40); P.skills = { cleave: 10 }; P.skillPts = 9; S = computeStats();
      const st0 = lStatTotal(), sk0 = lSkillTotal();
      enterZone('town'); const n = Z.npcs.find(n => n.role === 'job'); P.x = n.x + 30; P.y = n.y + 30; openNpc(n);
      out.section = !!panel.querySelector('.lrow');
      panel.querySelector('[data-act="lsave"][data-arg="0"]').click(); out.after0 = JSON.stringify(P.loadouts && P.loadouts.slots.map(s => s && s.cls));
      // setup B: VIT build
      P.st = { str: 1, agi: 1, vit: 30, int: 1, dex: 1, luk: 1 }; P.statPts = st0 - statSpent(30); P.skills = { ironwill: 5, firstaid: 3 }; P.skillPts = sk0 - 8;
      refreshPanel(); out.btn1 = !!panel.querySelector('[data-act="lsave"][data-arg="1"]'); panel.querySelector('[data-act="lsave"][data-arg="1"]').click(); out.cur1 = P.loadouts.cur;
      // switch back to A
      refreshPanel(); panel.querySelector('[data-act="luse"][data-arg="0"]').click();
      out.dbg = JSON.stringify({ after0: out.after0, btn1: out.btn1, cur1: out.cur1, kind: panelKind, slots: P.loadouts.slots.map(s => !!s), st: P.st, sk: P.skills, stT: lStatTotal(), st0, skT: lSkillTotal(), sk0 });
      out.a = P.st.str === 40 && P.st.vit === 1 && P.skills.cleave === 10 && !P.skills.ironwill && lStatTotal() === st0 && lSkillTotal() === sk0;
      // more points later: switching keeps the extra as free points
      P.statPts += 10; P.skillPts += 2; refreshPanel(); panel.querySelector('[data-act="luse"][data-arg="1"]').click();
      out.b = P.st.vit === 30 && P.skills.ironwill === 5 && lStatTotal() === st0 + 10 && lSkillTotal() === sk0 + 2;
      // slot 3 costs gold
      P.gold = 25000; refreshPanel(); panel.querySelector('[data-act="lopen"]').click(); out.open = P.loadouts.open3 && P.gold === 5000;
      // another job clears the old setups
      P.cls = 'bulwark'; out.cleared = lState().slots.every(s => !s);
      out.saved = SAVE_EXTRA.includes('loadouts');
      closePanel(); return out; });
    t.ok(r.section, 'the Guild Hall shows the loadouts');
    t.ok(r.a, 'switching restores the saved stats and skills with the same totals ' + r.dbg);
    t.ok(r.b, 'points earned since are kept as free points');
    t.ok(r.open, 'the third slot unlocks for 20,000 gold');
    t.ok(r.cleared && r.saved, 'setups from another job are cleared; loadouts are saved with the character');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

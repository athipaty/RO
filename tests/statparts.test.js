// v1.93.0: the Equipment window splits every stat into base, skills, gear, sigils and buffs (js/statparts.js)
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Parts', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1200);
    const r = await g.ev(() => { P.eq.weapon = { id: 'pyreblade', uid: 991, s: ['cinderwyrm_sig', null] }; P.skills.bladecraft = 5; P.buffs.zz = { name: 'Test', until: now + 60, b: { atk: 25 } }; S = computeStats();
      const p = statParts(), keep = JSON.stringify(P.eq) + S.atk; openPanel('equip'); const txt = panel.textContent; closePanel(); delete P.buffs.zz; S = computeStats();
      return { p, sum: Object.values(p).every(x => Math.abs(x.base + x.skills + x.gear + x.sigils + x.buffs - x.total) < .02), same: keep === JSON.stringify(P.eq) + (S.atk + 25 * 0) || true, txt, atk: S.atk }; });
    t.ok(r.sum, 'the parts of every stat add up to its total');
    t.ok(r.p.atk.gear > 300 && r.p.atk.sigils > 60 && r.p.atk.buffs > 20, `ATK split: gear +${Math.round(r.p.atk.gear)}, sigils +${Math.round(r.p.atk.sigils)}, buffs +${Math.round(r.p.atk.buffs)}`);
    t.ok(/ATK\s*\(\d+ \+ \d+[^)]*\)\s*\d+/.test(r.txt), 'the Equipment window shows the parts as numbers in front of the total');
    t.ok(!g.page.errors.length, 'no script errors');
  } finally { await g.close(); }
};

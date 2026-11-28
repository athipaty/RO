// v1.91.0: master jobs that hit with a weapon are evened out by one damage multiplier each (js/jobtune.js)
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const g = await player('Tune', newRoom(), { zone: 'meadow', server: 'http://127.0.0.1:9' });
  try {
    await wait(1200);
    const r = await g.ev(() => {
      const m = mobs.find(x => !x.dead); const cls0 = P.cls, out = {};
      for (const c of ['novice', 'forgemaster', 'soulreaper', 'tempestsage']) { P.cls = c; m.hp = 1e6; m.dead = false; hurtMob(m, 1000, false, 'phys'); out[c] = 1e6 - m.hp; }
      P.cls = cls0; m.hp = m.d.hp; return { out, table: JOB_DMG }; });
    t.ok(r.out.novice === 1000 && r.out.tempestsage === 1000, 'jobs not in the table deal their damage unchanged');
    t.ok(r.out.forgemaster === Math.round(1000 * r.table.forgemaster) && r.out.forgemaster < 1000, `Forgemaster hits for less (${r.out.forgemaster} of 1000)`);
    t.ok(r.out.soulreaper === Math.round(1000 * r.table.soulreaper) && r.out.soulreaper > 1000, `Soulreaper hits for more (${r.out.soulreaper} of 1000)`);
    const st = await g.ev(() => { const c0 = P.cls, out = {}; for (const c of ['soulreaper', 'forgemaster', 'novice']) { P.cls = c; openPanel('status'); out[c] = panel.textContent; } P.cls = c0; closePanel(); return out; });
    const pc = k => { const p = Math.round((r.table[k] - 1) * 100); return 'Job damage' + (p > 0 ? '+' : '−') + Math.abs(p) + '%'; };
    t.ok(st.soulreaper.includes(pc('soulreaper')) && st.forgemaster.includes(pc('forgemaster')) && !/Job damage/.test(st.novice), `the Status window shows the job damage (${pc('soulreaper')}, ${pc('forgemaster')}, nothing for others)`);
    t.ok(!g.page.errors.length, 'no script errors');
  } finally { await g.close(); }
};

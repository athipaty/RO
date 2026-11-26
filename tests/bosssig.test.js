// v1.51.3: every boss has its own signature skill; boss curses cannot be cured by a Remedy Draught.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const A = await player('Bosslore', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    await A.ev(() => { enterZone('meadow'); });
    await wait(1500);
    const all = await A.ev(() => { const ids = Object.values(MOBS).filter(m => m.boss || m.world).map(m => m.id); return { ids, missing: ids.filter(id => !BOSS_SIG[id]), names: new Set(ids.map(id => BOSS_SIG[id] && BOSS_SIG[id].name)).size }; });
    t.ok(all.missing.length === 0 && all.names === all.ids.length, `all ${all.ids.length} bosses have a signature skill of their own ` + all.missing.join(','));

    // each skill does something to a hero standing where it is aimed (the boss stands right beside them)
    const res = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      const boss = mobs.find(m => m.d.boss), keepD = boss.d, out = {}, hp = hurtPlayer; let hits = 0; hurtPlayer = () => { hits++; };
      // (v1.63.0) with 50+ bosses this runs for minutes, and the region may tidy the borrowed boss away: put it back
      for (const id of Object.keys(BOSS_SIG)) { if (!mobs.includes(boss)) mobs.push(boss); boss.d = { ...MOBS[id], id }; boss.x = P.x + 50; boss.y = P.y; boss.dead = false;
        P.ail = {}; P.curse = {}; P.slowUntil = 0; hits = 0; const x0 = P.x, y0 = P.y;
        bossSigCast(boss, P.x, P.y, 12345); const t0 = now; while (now - t0 < 3.6) await w(100); // game time (it runs slower than the clock when frames are slow)
        out[id] = hits > 0 || Object.keys(P.ail).some(ailOn) || P.slowUntil > now - 3 || Math.hypot(P.x - x0, P.y - y0) > 20;
        P.x = x0; P.y = y0; HZ.length = 0; }
      hurtPlayer = hp; boss.d = keepD; if (!mobs.includes(boss)) mobs.push(boss); P.ail = {}; P.curse = {}; return out; });
    const none = Object.entries(res).filter(([, v]) => !v).map(([k]) => k);
    t.ok(none.length === 0, 'every signature skill reaches a hero standing in it ' + none.join(','));

    // the same seed puts the circles in the same places (every game sees the same thing)
    const same = await A.ev(() => { const boss = mobs.find(m => m.d.boss), keep = boss.d; boss.d = { ...MOBS.rimeheart, id: 'rimeheart' };
      bossSigCast(boss, P.x, P.y, 777); const a = HZ.map(h => [Math.round(h.x), Math.round(h.y)]); HZ.length = 0;
      bossSigCast(boss, P.x, P.y, 777); const b = HZ.map(h => [Math.round(h.x), Math.round(h.y)]); HZ.length = 0; boss.d = keep;
      return a.length > 1 && JSON.stringify(a) === JSON.stringify(b); });
    t.ok(same, 'the same seed puts the circles in the same places');

    // boss curses: a Remedy Draught leaves them, a healer's cure lifts them; an ordinary ailment is still cured
    const cure = await A.ev(() => { P.ail = {}; P.curse = {}; P.inv = P.inv.filter(e => e.id !== 'remedy'); giveItem('remedy', 3); P.cd = {};
      bsCurse('silence', 30); useItem('remedy'); const afterDraught = ailOn('silence');
      cureAll(true); const afterHealer = ailOn('silence');
      P.cd = {}; tryAilment(['blind', 1, 30]); const blind0 = ailOn('blind'); useItem('remedy'); const afterPlain = ailOn('blind');
      return { afterDraught, afterHealer, blind0, afterPlain, told: /cannot cure a boss curse/.test(document.getElementById('log').textContent) }; });
    t.ok(cure.afterDraught && cure.told, 'a Remedy Draught cannot cure a boss curse, and says so');
    t.ok(!cure.afterHealer, "a healer's cure lifts a boss curse");
    t.ok(cure.blind0 && !cure.afterPlain, 'an ordinary monster ailment is still cured by a Remedy Draught');

    // the bestiary lists the boss's skills
    t.ok(await A.ev(() => { openPanel('mob', 'frostmatron'); const ok = /Boss skills/.test(panel.textContent) && /Ice Field/.test(panel.textContent); closePanel(); return ok; }), 'the bestiary lists a boss\'s skills');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

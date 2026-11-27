// v1.73.0: bosses look like bosses (bigger, glowing eyes, a dark aura) and show a cast bar naming the skill that is coming
// (js/bossmenace.js).
const { player, wait, newRoom } = require('./helpers'); const fs = require('fs');
module.exports = async t => {
  const A = await player('Watcher', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    await A.ev(() => enterZone('meadow')); await wait(1500);
    // every boss draws with its menace and nothing else changes size
    const d = await A.ev(() => { const errs = []; const list = Object.values(MOBS).filter(m => m && (m.boss || m.world));
      for (const b of list) { const m = { d: b, x: 0, y: 0, face: 1, ph: 0, hitF: -9 }; try { drawMob(m); } catch (e) { errs.push(b.id + ': ' + e.message); } }
      const plain = mobs.find(m => !m.d.boss); const col0 = MOBS.hopperchief.col; drawMob({ d: MOBS.hopperchief, x: 0, y: 0, face: 1, ph: 0, hitF: -9 });
      return { errs, n: list.length, sizeKept: MOBS.hopperchief.size === 20, colKept: MOBS.hopperchief.col === col0, scale: BM_SCALE(MOBS.hopperchief), plainOk: !!plain }; });
    t.ok(!d.errs.length, `all ${d.n} bosses draw with their menace ${d.errs.join(' | ')}`);
    t.ok(d.sizeKept && d.colKept && d.scale > 1, 'they are drawn bigger and darker, but their size and colour data stay the same (hit box, bestiary)');
    // the cast bar: signature skill, Ground Slam, Ground Mark
    const c = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const boss = mobs.find(m => m.d.boss && !m.dead); boss.x = P.x + 120; boss.y = P.y;
      bossSigCast(boss, P.x, P.y, 99); const sig = boss.cast && { ...boss.cast };
      boss.cast = null; bossZone(boss, P.x, P.y, 80); const mark = boss.cast && boss.cast.name;
      boss.cast = null; bossCastBar(boss, 'Ground Slam', 1.1); const slam = boss.cast && boss.cast.name;
      bossSigCast(boss, P.x, P.y, 7); await w(300); P.x = boss.x - 90; return { sig, mark, slam, name: BOSS_SIG[boss.d.id].name }; });
    t.ok(c.sig && c.sig.name === c.name && c.sig.dur >= .5, `a signature skill shows a cast bar named "${c.name}" for ${c.sig && c.sig.dur.toFixed(1)}s`);
    t.ok(c.mark === 'Ground Mark' && c.slam === 'Ground Slam', 'Ground Mark and Ground Slam show their bars too');
    await wait(400);
    await A.page.screenshot({ path: 'C:/Users/loret/AppData/Local/Temp/claude/21c9610cd7b69764/6128e17c-9757-4d08-bbc0-52a781c0e61a/scratchpad/look/castbar.png' });
    await wait(2500);
    t.ok(await A.ev(() => { const boss = mobs.find(m => m.d.boss && !m.dead); return !boss.cast; }), 'the bar goes when the blow lands');
    t.ok(!A.page.errors.length, 'no script errors ' + A.page.errors.slice(0, 3).join(' | '));
  } finally { await A.close(); }
};

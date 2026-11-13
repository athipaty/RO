// Logging back in keeps where you stood and the buffs still running (with the time they had left).
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const g = await player('Stayer', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(500);
    const before = await g.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); enterZone('meadow'); await w(300);
      // a free spot away from the entrance
      let x = 0, y = 0; for (let ty = 5; ty < Z.h - 5 && !x; ty++) for (let tx = 8; tx < Z.w - 5; tx++) if (!blockedT(tx, ty) && Math.hypot(tx * TILE - Z.spawn.x, ty * TILE - Z.spawn.y) > 200) { x = tx * TILE + 16; y = ty * TILE + 16; break; }
      P.x = x; P.y = y; P.path = []; P.inv.push({ id: 'quickdraught', n: 1 }); useItem('quickdraught'); buff('furybrew', 'Fury Brew', 90, { atk: 20 });
      await w(1200); S = computeStats(); save(true); return { x, y, atk: S.atk, left: Math.round(P.buffs.furybrew.until - now), q: !!P.buffs.quickdraught }; });
    await g.page.reload(); await wait(900);
    await g.ev(() => document.getElementById('contBtn').click()); await wait(800);
    const after = await g.ev(() => ({ zone: zoneId, x: P.x, y: P.y, atk: S.atk, fury: P.buffs.furybrew ? Math.round(P.buffs.furybrew.until - now) : 0, q: !!P.buffs.quickdraught, rows: document.querySelectorAll('#buffs > *').length }));
    t.ok(after.zone === 'meadow' && Math.abs(after.x - before.x) < 2 && Math.abs(after.y - before.y) < 2, `you come back where you stood (${before.x},${before.y} → ${Math.round(after.x)},${Math.round(after.y)})`);
    t.ok(before.q && after.q && after.fury > 80 && after.fury <= before.left, `buffs survive a reload with their time left (Fury Brew ${before.left}s → ${after.fury}s)`);
    t.ok(after.atk === before.atk, `and still count in your stats (ATK ${before.atk} → ${after.atk})`);
    // a spot that is no longer open falls back to the region entrance
    await g.ev(() => { const s = JSON.parse(localStorage.getItem('embervale.save.v1')); s.p.pos = { x: -500, y: -500 }; localStorage.setItem('embervale.save.v1', JSON.stringify(s)); });
    await g.page.reload(); await wait(900); await g.ev(() => document.getElementById('contBtn').click()); await wait(800);
    t.ok(await g.ev(() => P.x > 0 && P.y > 0 && !blockedT(Math.floor(P.x / TILE), Math.floor(P.y / TILE))), 'a saved spot that is not open ground puts you at the entrance instead');
    t.ok(await g.ev(() => !('pos' in P) && !('savedBuffs' in P)), 'the saved spot and buffs do not linger on the character');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

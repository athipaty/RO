// Seeing other players' drops: A's loot shows (faded, with A's name) on B's screen, B cannot pick it up,
// and it disappears for B when A picks it up. (Public-broker backup path.)
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Dropper', room, { zone: 'meadow', server: OFFLINE });
  await wait(2000);
  const B = await player('Watcher', room, { zone: 'meadow', server: OFFLINE });
  try {
    await wait(5000);
    t.ok(await A.ev(() => NET.others.size === 1) && await B.ev(() => NET.others.size === 1), 'the two players see each other');
    const spot = await A.ev(() => { const c = mobs.find(m => !m.dead); P.x = c.x - 50; P.y = c.y; const m = { x: P.x + 70, y: P.y + 20 };
      for (const o of mobs) if (Math.hypot(o.x - m.x, o.y - m.y) < 120) { o.x += 300; o.sx = o.x; }
      dropLoot(m, 'pelt'); dropLoot(m, null, { gold: 35 }); dropLoot(m, 'hopper_sig', { rare: true }); return { x: P.x, y: P.y, n: loot.length }; });
    await B.ev(s => { P.x = s.x; P.y = s.y + 60; }, spot);
    await wait(2500);
    const seen = await B.ev(() => { const o = [...NET.others.values()][0]; const g = typeof ghostLoot === 'function' ? ghostLoot(o) : [];
      return { n: g.length, ids: g.map(l => l.id || 'gold').sort(), owner: g[0] && g[0].owner, ghost: g.every(l => l.ghost), mine: loot.length }; });
    t.ok(seen.n === 3 && seen.ids.join() === 'gold,hopper_sig,pelt', `B sees the 3 items that dropped for A (${seen.ids.join(', ')})`);
    t.ok(seen.owner === 'Dropper' && seen.ghost && seen.mine === 0, 'they are marked as A\'s and are not in B\'s own loot');
    const click = await B.ev(async () => { const o = [...NET.others.values()][0], l = [...o.glMap.values()].find(l => l.id === 'pelt');
      const cv = document.getElementById('cv'), r = cv.getBoundingClientRect(), q = proj(l.x, l.y), inv0 = P.inv.length;
      cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + q.x - camX, clientY: r.top + q.y - 6 - camY, bubbles: true }));
      await new Promise(r => setTimeout(r, 300)); return { same: P.inv.length === inv0, hint: texts.some(x => /Dropper's loot/.test(x.txt)) }; });
    t.ok(click.same && click.hint, 'clicking it does not take it, and says whose it is');
    if (process.env.SHOTS) await B.page.screenshot({ path: process.env.SHOTS + '/sharedloot.png' });
    await A.ev(() => { const l = loot.find(l => l.id === 'pelt'); pickUp(l); });
    await wait(2500);
    const after = await B.ev(() => { const o = [...NET.others.values()][0]; return ghostLoot(o).map(l => l.id || 'gold').sort(); });
    t.ok(after.join() === 'gold,hopper_sig', 'when A picks one up it disappears for B too');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};

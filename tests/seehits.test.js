// Seeing other players attack: their swing and the damage number show on your screen,
// whether you or they run the region's monsters. (Public-broker backup path; A arrives first so A hosts.)
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Hoster', room, { zone: 'meadow', server: OFFLINE });
  await wait(2000);
  const B = await player('Visitor', room, { zone: 'meadow', server: OFFLINE });
  try {
    await wait(5000);
    t.ok(await A.ev(() => NET.others.size === 1) && await B.ev(() => NET.others.size === 1), 'the two players see each other');
    // stand together next to a monster
    const spot = await A.ev(() => { const m = mobs.find(m => !m.dead && !m.d.boss); P.x = m.x - 40; P.y = m.y; P.st.str = 60; S = computeStats(); return { x: P.x, y: P.y, i: m.idx }; });
    await B.ev(s => { P.x = s.x; P.y = s.y + 50; P.st.str = 60; S = computeStats(); }, spot);
    await wait(1500);
    const watch = g => g.ev(i => { window.__seen = { nums: 0, swing: 0 }; const m = mobs[i];
      const ft = window.floatT; window.floatT = (x, y, txt, col, ...r) => { if (col === '#cfe0ff' && /^[\d,]+$/.test(String(txt))) window.__seen.nums++; return ft(x, y, txt, col, ...r); };
      window.__iv = setInterval(() => { for (const o of NET.others.values()) if (o.swingT && now - o.swingT < .1) window.__seen.swing++; }, 30); return !!m; }, spot.i);
    const seen = g => g.ev(() => { clearInterval(window.__iv); return window.__seen; });
    const hit = (g, i) => g.ev(i => { const m = mobs[i]; for (let k = 0; k < 3; k++) { P.atkT = 0; if (!m.dead) hurtMob(m, 2, false); } return true; }, i);

    // B (not the host) hits: A sees it
    await watch(A); await hit(B, spot.i); await wait(2500); const a = await seen(A);
    t.ok(a.nums >= 1, `the host sees the visitor's damage numbers (${a.nums})`);
    t.ok(a.swing >= 1, 'and sees the visitor swing');
    // A (the host) hits: B sees it — this used to show nothing
    await watch(B); await hit(A, spot.i); await wait(2500); const b = await seen(B);
    t.ok(b.nums >= 1, `the visitor sees the host's damage numbers (${b.nums})`);
    t.ok(b.swing >= 1, 'and sees the host swing');
    const hp = await B.ev(i => mobs[i].hp / mobs[i].d.hp, spot.i);
    t.ok(hp < 1, 'the monster really lost HP on the visitor\'s screen');
    // the live-server case: the server runs the monsters, so nobody applies hits, but everyone shows them
    const srv = await B.ev(() => { let n = 0; const ft = window.floatT; window.floatT = (x, y, txt, col, ...r) => { if (col === '#cfe0ff') n++; return ft(x, y, txt, col, ...r); };
      const m = mobs.find(m => !m.dead), hp0 = m.hp;
      const o = { peer: 'srvpal', n: 'Pal', cls: 'warden', lv: 10, z: zoneId, x: m.x - 30, y: m.y, rx: m.x - 30, ry: m.y, hx: [{ i: 1, m: m.idx, d: 7 }] };
      NET.others.set('srvpal', o); applyHits(false); const old = n;          // an old hit from before we met: not replayed
      o.hx.push({ i: 2, m: m.idx, d: 9 }); applyHits(false); const fresh = n - old;
      const r = { old, fresh, swing: now - o.swingT < .5, same: m.hp === hp0 }; NET.others.delete('srvpal'); window.floatT = ft; return r; });
    t.ok(srv.old === 0 && srv.fresh === 1 && srv.swing && srv.same, 'when the server runs the monsters, other players’ new hits show (old ones are not replayed) and are not applied twice');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};

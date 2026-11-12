// While following a party member, skills go at the leader's target, following keeps going, and the walk
// never interrupts a cast. (Public-broker backup path.)
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Leader', room, { zone: 'meadow', server: OFFLINE });
  await wait(2000);
  const B = await player('Caster', room, { zone: 'meadow', server: OFFLINE });
  try {
    await wait(5000);
    const party = g => g.ev(() => { const [peer] = [...NET.others.keys()]; SOC.party = { id: 'p1', leader: peer, mode: 'share', members: [{ peer, name: 'x' }, { peer: 'me', name: 'me' }] }; renderParty(); return peer; });
    await party(A); await party(B);
    // one calm monster left, standing still; the leader stands next to it and targets it
    const spot = await A.ev(() => { const keep = mobs.find(m => !m.d.boss && !m.d.aggro); for (const m of mobs) if (m !== keep) { m.dead = true; m.respawnAt = now + 1e9; }
      keep.d = { ...keep.d, spd: 0, hp: 99999 }; keep.hp = 99999; keep.state = 'idle'; keep.tx = null; P.st.vit = 99; S = computeStats(); P.hp = S.maxhp;
      P.x = keep.x - 60; P.y = keep.y; P.target = keep; P.holdPos = true; return { x: P.x, y: P.y, i: keep.idx }; });
    await B.ev(s => { for (const m of mobs) if (m.idx !== s.i) { m.dead = true; m.respawnAt = now + 1e9; }
      P.x = s.x - 70; P.y = s.y + 20; P.cls = 'arcanist'; P.skills = { emberbolt: 5 }; P.st.dex = 1; P.st.int = 30; P.st.vit = 99; S = computeStats(); P.hp = S.maxhp; P.sp = S.maxsp;
      followStart([...NET.others.keys()][0]); }, spot);
    await wait(2500);
    // on a busy machine the follower can still be walking into range: keep trying for a few seconds
    const cast = await B.ev(async i => { const w = ms => new Promise(r => setTimeout(r, ms)); let r = {};
      for (let k = 0; k < 30; k++) { P.cd = {}; P.sp = S.maxsp; if (!P.casting) useSkill('emberbolt'); r = { fol: !!FOL, assist: !!P.assist, same: P.target && P.target.idx === i, casting: !!P.casting }; if (r.casting) break; await w(200); }
      return r; }, spot.i);
    t.ok(cast.same && cast.assist, 'while following, a skill with no target of your own goes at the leader\'s target');
    t.ok(cast.fol && cast.casting, 'following keeps going, and the cast starts');
    // the leader walks away during the cast: the follower must not move (that would cancel the cast)
    await A.ev(() => { P.target = null; pathTo(P.x + 200, P.y, true); });
    const mid = await B.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const x0 = P.x, y0 = P.y; let cancelled = false;
      const ft = window.floatT; window.floatT = (x, y, txt, ...r) => { if (/Cast cancelled/.test(txt)) cancelled = true; return ft(x, y, txt, ...r); };
      for (let i = 0; i < 60 && P.casting; i++) await w(100); const still = Math.hypot(P.x - x0, P.y - y0) < 3;
      await w(1200); window.floatT = ft; return { cancelled, still }; });
    t.ok(!mid.cancelled && mid.still, 'the follower stands still while casting, so the cast is not interrupted');
    // poll until the follower has caught up (up to 10 s on a slow machine)
    let after = {};
    for (let k = 0; k < 20; k++) { await wait(500); after = await B.ev(() => { const o = [...NET.others.values()][0]; return { fol: !!FOL, target: !!P.target, assist: !!P.assist, d: Math.round(Math.hypot(o.x - P.x, o.y - P.y)) }; }); if (k >= 5 && after.d < 120) break; }
    t.ok(after.fol && !after.target && !after.assist, 'after the skill fires you are just following again (no auto-attacking)');
    t.ok(after.d < 120, `and you caught up with the leader (${after.d}px away)`);
    const hp = await A.ev(i => mobs[i].hp < 99999, spot.i);
    t.ok(hp, 'the skill really hit the leader\'s target');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};

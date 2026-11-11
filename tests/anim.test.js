// #5 more animations: casting pose with a rune circle, a hurt flinch, and falling over when defeated,
// seen by other players too.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, arg, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn, arg)) return true; await wait(200); } return false; };

module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Caster', room, { zone: 'meadow', server: OFFLINE });
  await wait(1500);
  const B = await player('Witness', room, { zone: 'meadow', server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'two players see each other');
    await A.ev(() => { for (const m of mobs) { m.x = 20; m.y = 20; m.d.aggro = false; } });
    // casting
    const circle = await A.ev(async () => { let drawn = 0; const orig = castCircle; castCircle = p => { drawn++; return orig(p); };
      P.casting = { id: 'firstaid', l: 1, cost: 0, fn: () => {}, t0: now, dur: 30 }; await new Promise(r => setTimeout(r, 1000)); castCircle = orig; return drawn; });
    t.ok(circle >= 2, 'while casting, a rune circle is drawn under you');
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o.cs === 'firstaid'; }), 'other players see you casting');
    await A.ev(() => { P.casting = null; });
    t.ok(await poll(B, () => !([...NET.others.values()][0].cs)), 'and see it stop');
    // hurt
    await A.ev(() => { S = computeStats(); P.hp = S.maxhp; });
    await wait(800);
    await A.ev(() => { P.hp = Math.round(S.maxhp * .5); P.hurtT = now; });
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o.hurtT && now - o.hurtT < 2; }), 'other players see you flinch when your health drops');
    // defeated: still drawn, lying down
    await A.ev(() => die('a test'));
    const self = await A.ev(async () => { let down = 0; const orig = drawDown; drawDown = (p, w) => { down++; return orig(p, w); }; await new Promise(r => setTimeout(r, 1000)); drawDown = orig; return { down, dead: P.dead, deadT: P.deadT > 0 }; });
    t.ok(self.dead && self.deadT && self.down >= 2, 'when defeated you fall over and stay on the ground');
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o.dead && o.deadT > 0; }), 'other players see you fall');
    const other = await B.ev(async () => { let down = 0; const orig = drawDown; drawDown = (p, w) => { down++; return orig(p, w); }; await new Promise(r => setTimeout(r, 1000)); drawDown = orig; return down; });
    t.ok(other >= 2, 'and see you lying there');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};

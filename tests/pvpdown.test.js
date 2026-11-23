// v1.49.1: losing a player fight knocks you down like a fall to a monster (but it is not a death), and damage you
// take looks different from damage you deal.
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const A = await player('Fallo', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    await A.ev(() => { enterZone('meadow'); });
    await wait(1500);
    const down = await A.ev(() => {
      const x = P.x, y = P.y, exp = P.exp; pvpDown(4);
      P.path = [{ x: x + 200, y }]; useSkill(Object.keys(P.skills || {})[0] || 'bash');
      return { downed: pvpDowned(), dead: P.dead, x, y, exp };
    });
    await wait(1200);
    const mid = await A.ev(s => ({ downed: pvpDowned(), still: Math.hypot(P.x - s.x, P.y - s.y) < 2, casting: !!P.casting, dead: P.dead }), down);
    t.ok(down.downed && !down.dead && mid.downed && mid.still && !mid.casting && !mid.dead, 'knocked down: lying where you fell, no moving or casting, and not dead');
    t.ok(/kd:1/.test(require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'net.js'), 'utf8')), 'others are told you are down (kd)');
    await wait(3500);
    t.ok(await A.ev(e => !pvpDowned() && !P.dead && P.exp === e, down.exp), 'you stand up after 4 s with no EXP lost');

    // guild war: down 3 s where you fell, then back at the gate
    const gw = await A.ev(() => { if (typeof gwKnockout !== 'function') return { skip: true }; const sx = Z.spawn.x, sy = Z.spawn.y; P.x = sx + 300; P.y = sy; gwKnockout('Rival');
      return { downed: pvpDowned(), far: Math.hypot(P.x - sx, P.y - sy) > 100, sx, sy }; });
    await wait(3600);
    const gw2 = await A.ev(s => ({ downed: pvpDowned(), atGate: Math.hypot(P.x - s.sx, P.y - s.sy) < 5 }), gw);
    t.ok(gw.skip || (gw.downed && gw.far && !gw2.downed && gw2.atGate), 'a guild war knockout lies down first, then goes back to the gate');

    // damage taken: minus sign and its own red, crits deep crimson; damage dealt stays white/gold
    const num = await A.ev(() => { texts.length = 0; hurtNum(P.x, P.y, 42, false); hurtNum(P.x, P.y, 99, true); return { t: texts.map(x => [x.txt, x.col]), c: HURT_COL, k: HURT_CRIT }; });
    t.ok(num.t[0][0] === '-42' && num.t[0][1] === num.c && num.t[1][0] === '-99' && num.t[1][1] === num.k && num.c !== num.k && !/^#fff/i.test(num.c), 'damage taken shows "-N" in rose red, crits in crimson ' + JSON.stringify(num));
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

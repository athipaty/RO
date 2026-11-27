// v1.71.3: every boss (mini-bosses and field bosses too) switches to battle music while it chases you close by;
// (v1.71.6) a world boss plays the world boss song; (v1.71.5) a mini-boss plays the lighter mini-boss song, a big boss the boss song.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Bossmusic', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    await A.ev(() => { enterZone('meadow'); });
    await wait(1500);
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      hurtPlayer = () => {}; // the hero must live through the whole check
      let boss = mobs.find(m => m.d.boss && !m.d.world && !m.dead);
      boss.x = boss.sx; boss.y = boss.sy; const hx = boss.sx, hy = boss.sy; boss.state = 'idle'; boss.aggroed = false;
      P.x = hx + 1200; P.y = hy; P.path = []; await w(1500);
      const before = AU.want;
      P.x = hx + 150; P.y = hy; for (let i = 0; i < 15; i++) { provoke(boss); await w(100); }
      const during = AU.want;
      const m0 = boss.d.mini; boss.d.mini = false; for (let i = 0; i < 15; i++) { provoke(boss); await w(100); } const big = AU.want;
      const w0 = boss.d.world; boss.d.world = 'meadow'; for (let i = 0; i < 15; i++) { provoke(boss); await w(100); } const world = AU.want; boss.d.world = w0; boss.d.mini = m0;
      P.x = hx + 2500; P.y = hy; boss.state = 'return'; boss.aggroed = false; await w(1500);
      return { before, during, big, world, after: AU.want, name: boss.d.name };
    });
    t.ok(r.before !== 'boss' && r.before !== 'miniboss', `no boss music while the ${r.name} is far and calm (${r.before})`);
    t.ok(r.during === 'miniboss', `the mini-boss song while the ${r.name} chases you (${r.during})`);
    t.ok(r.big === 'boss', `a big boss plays the full boss song (${r.big})`);
    t.ok(r.world === 'worldboss', `a world boss plays its own song (${r.world})`);
    t.ok(r.after !== 'boss' && r.after !== 'miniboss' && r.after !== 'worldboss', `map music comes back when it stops (${r.after})`);
    t.ok(!A.page.errors.length, 'no script errors');
  } finally { await A.close(); }
};

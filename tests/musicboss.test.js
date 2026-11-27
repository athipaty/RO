// v1.71.3: every boss (mini-bosses and field bosses too) switches to the boss music while it chases you close by.
const { player, wait, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Bossmusic', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    await wait(2000);
    await A.ev(() => { enterZone('meadow'); });
    await wait(1500);
    const r = await A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms));
      let boss = mobs.find(m => m.d.boss && !m.d.world && !m.dead);
      boss.x = boss.sx; boss.y = boss.sy; const hx = boss.sx, hy = boss.sy; boss.state = 'idle'; boss.aggroed = false;
      P.x = hx + 1200; P.y = hy; P.path = []; await w(1500);
      const before = AU.want;
      P.x = hx + 150; P.y = hy; for (let i = 0; i < 15; i++) { provoke(boss); await w(100); }
      const during = AU.want;
      P.x = hx + 2500; P.y = hy; boss.state = 'return'; boss.aggroed = false; await w(1500);
      return { before, during, after: AU.want, name: boss.d.name };
    });
    t.ok(r.before !== 'boss', `no boss music while the ${r.name} is far and calm (${r.before})`);
    t.ok(r.during === 'boss', `boss music while the ${r.name} chases you (${r.during})`);
    t.ok(r.after !== 'boss', `map music comes back when it stops (${r.after})`);
    t.ok(!A.page.errors.length, 'no script errors');
  } finally { await A.close(); }
};

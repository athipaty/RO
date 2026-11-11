// Other players glide smoothly: while one walks at a steady pace, the other sees even steps each frame (no stalls or jumps).
const { player, wait, newRoom } = require('./helpers');

module.exports = async t => {
  const room = newRoom();
  const A = await player('Walker', room, { zone: 'meadow', server: process.env.EMBER_SERVER ? undefined : 'http://127.0.0.1:9' });
  await wait(2000);
  const B = await player('Watcher', room, { zone: 'meadow', server: process.env.EMBER_SERVER ? undefined : 'http://127.0.0.1:9' });
  try {
    await wait(5000);
    t.ok(await B.ev(() => [...NET.others.values()].some(o => o.n === 'Walker')), 'the watcher sees the walker');
    // A walks east at a steady 140 px/s for 4 seconds; B records what it draws each frame
    const walk = A.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); for (const m of mobs) m.dead = true;
      const x0 = P.x, t0 = performance.now(); P.path = []; while (performance.now() - t0 < 4000) { P.x = x0 + (performance.now() - t0) / 1000 * 140; P.moving = true; await w(16); } P.moving = false; });
    const seen = await B.ev(async () => { const o = [...NET.others.values()].find(o => o.n === 'Walker'); const xs = [];
      await new Promise(res => { const t0 = performance.now(); const f = () => { xs.push([performance.now(), o.rx]); if (performance.now() - t0 < 4200) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
      return xs; });
    await walk;
    // look at the middle of the walk, per frame: speed should stay near 140 px/s
    const mid = seen.filter(([tm]) => tm - seen[0][0] > 1200 && tm - seen[0][0] < 3600);
    const speeds = []; for (let i = 1; i < mid.length; i++) { const dt = (mid[i][0] - mid[i - 1][0]) / 1000; if (dt > 0) speeds.push((mid[i][1] - mid[i - 1][1]) / dt); }
    const stalls = speeds.filter(v => v < 20).length / speeds.length, spikes = speeds.filter(v => v > 420).length / speeds.length;
    const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const sd = Math.sqrt(speeds.reduce((a, v) => a + (v - avg) ** 2, 0) / speeds.length), cv = sd / avg;
    console.log(`   smooth: frames=${speeds.length} avg=${avg.toFixed(0)}px/s variation=${(cv * 100).toFixed(0)}% stalls=${(stalls * 100).toFixed(1)}% spikes=${(spikes * 100).toFixed(1)}%`);
    t.ok(speeds.length > 30 && avg > 90 && avg < 190, `the walker is seen moving at about their real speed (${avg.toFixed(0)} px/s, real 140)`);
    t.ok(stalls < .08 && spikes < .05 && cv < .35, `movement is even: speed varies ${(cv * 100).toFixed(0)}% frame to frame, ${(stalls * 100).toFixed(1)}% stalled frames, ${(spikes * 100).toFixed(1)}% jumps`);
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors');
  } finally { await A.close(); await B.close(); }
};

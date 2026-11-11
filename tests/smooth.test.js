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
      const x0 = P.x, t0 = Date.now(); P.path = []; while (Date.now() - t0 < 4000) { P.x = x0 + (Date.now() - t0) / 1000 * 140; P.moving = true; await w(16); } P.moving = false; });
    const seen = await B.ev(async () => { const o = [...NET.others.values()].find(o => o.n === 'Walker'); const xs = [];
      // sample exactly what the game would draw at that moment (same clock the game uses)
      await new Promise(res => { const t0 = Date.now(); const f = () => { const tm = Date.now(); xs.push([tm, netPos(o)[0]]); if (tm - t0 < 4200) setTimeout(f, 20); else res(); }; f(); });
      return xs; });
    await walk;
    if (process.env.SMOOTH_DEBUG) console.log('   timeline', JSON.stringify(await B.ev(() => { const o = [...NET.others.values()].find(o => o.n === 'Walker'); return { off: Math.round(o.off), offMin: Math.round(o.offMin), gaps: o.buf.slice(-20).map((b, i, a) => i ? Math.round(b.t - a[i - 1].t) : 0).join(' ') }; })));
    // look at the middle of the walk, per frame: speed should stay near 140 px/s
    const mid = seen.filter(([tm]) => tm - seen[0][0] > 1300 && tm - seen[0][0] < 3700);
    const speeds = []; for (let i = 3; i < mid.length; i += 3) { const dt = (mid[i][0] - mid[i - 3][0]) / 1000; if (dt > 0) speeds.push((mid[i][1] - mid[i - 3][1]) / dt); } // ~60 ms steps
    const stalls = speeds.filter(v => v < 20).length / speeds.length, spikes = speeds.filter(v => v > 420).length / speeds.length;
    const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const sd = Math.sqrt(speeds.reduce((a, v) => a + (v - avg) ** 2, 0) / speeds.length), cv = sd / avg;
    console.log(`   smooth: frames=${speeds.length} avg=${avg.toFixed(0)}px/s variation=${(cv * 100).toFixed(0)}% stalls=${(stalls * 100).toFixed(1)}% spikes=${(spikes * 100).toFixed(1)}%`);
    t.ok(speeds.length > 20 && avg > 90 && avg < 190, `the walker is seen moving at about their real speed (${avg.toFixed(0)} px/s, real 140)`);
    t.ok(stalls < .08 && spikes < .05 && cv < .35, `movement is even: speed varies ${(cv * 100).toFixed(0)}% frame to frame, ${(stalls * 100).toFixed(1)}% stalled frames, ${(spikes * 100).toFixed(1)}% jumps`);
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors');
  } finally { await A.close(); await B.close(); }
};

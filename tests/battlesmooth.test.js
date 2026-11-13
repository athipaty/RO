// smooth fights: live quality steps down when frames run slow and back up after; boss fights skip small hit-freezes;
// damage numbers and effects are capped; the shake is a smooth wobble; the camera eases and snaps on big jumps
const { player, newRoom, wait } = require('./helpers');
module.exports = async t => {
  const g = await player('Smooth', newRoom());
  try {
    await g.page.setViewport({ width: 1000, height: 600, deviceScaleFactor: 2 }); await wait(800);
    await g.ev(() => { window.__bsForce = 0; }); await wait(200); await g.ev(() => { delete window.__bsForce; BS.lastChange = performance.now() - 1000; });
    const d0 = await g.ev(() => ({ level: BS.level, dpr: DPR }));
    await g.ev(() => { const _r = render; window.__slowR = true; render = function () { const t = performance.now(); while (window.__slowR && performance.now() - t < 28); return _r.apply(this, arguments); }; });
    await wait(2500);
    const low = await g.ev(() => ({ level: BS.level, dpr: DPR, w: cv.width, lite: window.LITE }));
    t.ok(d0.level === 0 && low.level >= 2 && low.dpr < d0.dpr && low.lite, `slow frames lower the drawing resolution within seconds (level ${low.level}, ${d0.dpr}x -> ${low.dpr}x) and lighten weather`);
    await g.ev(() => { window.__slowR = false; }); await wait(7500);
    const back = await g.ev(() => ({ level: BS.level, dpr: DPR }));
    t.ok(back.level < low.level, `when frames are quick again it steps back up (level ${low.level} -> ${back.level})`);
    const r = await g.ev(() => { enterZone('crypt'); P.lv = 90; P.hp = 1e9; S = computeStats(); const boss = mobs.find(m => m.d.boss && !m.dead); P.x = boss.x - 100; P.y = boss.y; boss.state = 'chase'; P.target = boss;
      // check while the boss is on us (poll a few frames; a boss pulled far from home soon walks back)
      return new Promise(res => { const t0 = performance.now(); const go = () => { if (!BS.bossOn && performance.now() - t0 < 1500) return requestAnimationFrame(go); const b0 = hitStopUntil; hitStop(.09); const skipped = hitStopUntil === b0; hitStop(.12); const bossKill = hitStopUntil > b0;
        for (let i = 0; i < 300; i++) { floatT(P.x, P.y, '9', '#fff'); fx.push({ k: 'spark', x: P.x, y: P.y, t0: now, dur: 9, r: 0 }); }
        const bossOn = BS.bossOn; setTimeout(() => res({ bossOn, skipped, bossKill, texts: texts.length, fx: fx.length }), 200); }; go(); }); });
    t.ok(r.bossOn && r.skipped && r.bossKill, 'in a boss fight crit freezes are skipped, the boss death still freezes ' + JSON.stringify(r));
    t.ok(r.texts <= 30 && r.fx <= 150, `damage numbers and effects are capped (${r.texts}, ${r.fx})`);
    const cam = await g.ev(() => new Promise(res => { P.x -= 1500; setTimeout(() => { const tp = proj(P.x, P.y); res(Math.abs(camX - (tp.x - VW / 2)) < 3); }, 120); }));
    t.ok(cam, 'the camera snaps straight to the hero after a long jump');
    t.ok(g.page.errors.length === 0, 'no script errors' + g.page.errors.map(e => ': ' + e).join(''));
  } finally { await g.close(); }
};

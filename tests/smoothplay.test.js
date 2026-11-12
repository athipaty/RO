// Smooth play: off-screen culling, label cache, fast numbers, auto performance mode, freeze guard.
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Smooth', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    t.ok(await A.ev(() => fmt(1234567) === '1,234,567' && fmt(999) === '999' && fmt(-4500) === '-4,500' && fmt(12.6) === '13'), 'numbers still read 1,234,567');
    const cull = await A.ev(async () => { enterZone('meadow'); let n = 0; const o = drawMob; drawMob = m => { n++; return o(m); }; await new Promise(r => setTimeout(r, 1000)); drawMob = o;
      const frames = 60; const vis = mobs.filter(m => { if (m.dead) return false; const p = proj(m.x, m.y); return p.x > camX - 140 && p.x < camX + VW + 140 && p.y > camY - 40 && p.y < camY + VH + 190; }).length; return { perFrame: n / frames, all: mobs.filter(m => !m.dead).length, vis }; });
    t.ok(cull.perFrame < cull.all, `only monsters on screen are drawn (~${cull.perFrame.toFixed(0)} a frame of ${cull.all})`);
    t.ok(await A.ev(() => { LABELS.clear(); label('Hello', 100, 100, '#fff', 12); label('Hello', 120, 100, '#fff', 12); return LABELS.size === 1; }), 'name labels are drawn once and reused');
    const guard = await A.ev(() => { P.hp = 40; S = computeStats(); const m = mobs.find(x => !x.dead); SMOOTH.guardUntil = now + 2; SMOOTH.saved = false; const r = Math.random; Math.random = () => .5;
      const big = { ...m, d: { ...m.d, atk: 5000, hit: 999 } }; mobAttack(big); Math.random = r; return { hp: P.hp, dead: P.dead, log: /froze/.test(document.getElementById('log').textContent) }; });
    t.ok(guard.hp === 1 && !guard.dead && guard.log, 'right after a freeze, a backlog hit cannot knock you out (left at 1 HP)');
    const normal = await A.ev(() => { SMOOTH.guardUntil = 0; P.hp = 40; const m = mobs.find(x => !x.dead); const r = Math.random; Math.random = () => .5; mobAttack({ ...m, d: { ...m.d, atk: 5000, hit: 999 } }); Math.random = r; const d = P.dead; if (d) { P.dead = false; P.hp = 50; } return d; });
    t.ok(normal, 'without a freeze, hits work as before');
    const freeze = await A.ev(async () => { SMOOTH.guardUntil = 0; const t0 = performance.now(); while (performance.now() - t0 < 700) {} await new Promise(r => setTimeout(r, 100)); return SMOOTH.guardUntil > now; });
    t.ok(freeze, 'a 0.7 s freeze turns the guard on');
    const auto = await A.ev(() => { SETS.lite = false; SETS.liteUser = false; applySets(); SMOOTH.samples = Array(240).fill(45); return new Promise(r => setTimeout(() => r({ lite: !!window.LITE, log: /Performance mode is now on/.test(document.getElementById('log').textContent) }), 200)); });
    t.ok(auto.lite && auto.log, 'a slow game switches Performance mode on by itself and says so');
    const manual = await A.ev(() => { PANEL_ACTS.setlite(); const off = !window.LITE; SMOOTH.samples = Array(240).fill(45); return new Promise(r => setTimeout(() => r(off && !window.LITE), 200)); });
    t.ok(manual, 'turning it off by hand is respected');
    const danger = await A.ev(async () => { enterZone('meadow'); S = computeStats(); P.hp = Math.round(S.maxhp * .1); await new Promise(r => setTimeout(r, 300)); const on = document.getElementById('danger').classList.contains('on');
      P.hp = S.maxhp; await new Promise(r => setTimeout(r, 300)); return on && !document.getElementById('danger').classList.contains('on'); });
    t.ok(danger, 'below 25% HP the screen edge glows red, and it goes away when healed');
    const lite = await A.ev(() => { const full = skyParts('rain').length; window.LITE = true; const few = skyParts('rain').length; window.LITE = false; return few < full; });
    t.ok(lite, 'Performance mode draws fewer rain and snow particles');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

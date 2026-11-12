// #28 rebirth: Seer Valen in Aurelmark, requirements, reset, bonuses, aura seen by others, saved.
const { player, wait, newRoom } = require('./helpers');
const poll = async (g, fn, ms = 8000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await g.ev(fn)) return true; await wait(200); } return false; };
module.exports = async t => {
  const room = newRoom(), OFFLINE = 'http://127.0.0.1:9';
  const A = await player('Phoenix', room, { server: OFFLINE });
  await wait(1500);
  const B = await player('Witness', room, { server: OFFLINE });
  try {
    t.ok(await poll(A, () => NET.others.size === 1), 'two players see each other');
    const locked = await A.ev(() => { enterZone('capital', 'town'); const v = Z.npcs.find(n => n.role === 'rebirth'); openNpc(v); const b = panel.querySelector('[data-act="rebirth"]'); const r = { valen: !!v, locked: b && b.disabled && /level 70/.test(b.textContent) }; closePanel(); return r; });
    t.ok(locked.valen && locked.locked, 'Seer Valen stands in Aurelmark and asks for base level 70 first');
    const done = await A.ev(() => { const job = Object.keys(CLASSES).find(c => baseOf(c) === 'warden' && c !== 'warden'); P.cls = job; P.lv = 75; P.jl = 50; P.gold = 60000; P.st.str = 60; P.skills = { cleave: 5 };
      S = computeStats(); const hp0 = S.maxhp; openPanel('rebirth'); panel.querySelector('[data-act="rebirth"]').click(); closePanel();
      const plain = (() => { const r = P.reborn; P.reborn = 0; const s = computeStats().maxhp; P.reborn = r; return s; })();
      return { lv: P.lv, pts: P.statPts, str: P.st.str, gold: P.gold, reborn: P.reborn, cls: P.cls === job, skills: P.skills.cleave, jl: P.jl, hp: S.maxhp, plain, hud: document.getElementById('hCls').textContent }; });
    t.ok(done.reborn === 1 && done.lv === 1 && done.str === 1 && done.pts === 100 && done.gold === 10000, 'the rite: back to level 1, stats reset, 100 stat points, 50,000 gold');
    t.ok(done.cls && done.skills === 5 && done.jl === 50, 'calling, skills and job level are kept');
    t.ok(done.hp === Math.round(done.plain * 1.25), `Reborn heroes have 25% more HP (${done.plain} → ${done.hp})`);
    await A.ev(() => updateHud());
    t.ok(await A.ev(() => /^Reborn /.test(document.getElementById('hCls').textContent)), 'the status box says Reborn');
    const pts = await A.ev(() => { const p0 = P.statPts; gainExp(expNeed(1) + 1, 0); return P.statPts - p0; });
    t.ok(pts === Math.floor(2 / 5) + 3 + 1, `one extra stat point per level (+${pts} at level 2)`);
    t.ok(await poll(B, () => { const o = [...NET.others.values()][0]; return o && o.rb === 1; }), 'others know you are reborn');
    const aura = await B.ev(async () => { const o = [...NET.others.values()][0]; enterZone(o.z); P.x = o.rx + 30; P.y = o.ry; let n = 0; const f = drawRebornAura; drawRebornAura = (...a) => { n++; return f(...a); }; await new Promise(r => setTimeout(r, 700)); drawRebornAura = f; return n; });
    t.ok(aura > 2, 'and see the golden aura');
    t.ok(await A.ev(() => { save(); return JSON.parse(localStorage.getItem(SAVE_KEY)).p.reborn === 1; }), 'rebirth is saved');
    t.ok(A.page.errors.length === 0 && B.page.errors.length === 0, 'no script errors' + [...A.page.errors, ...B.page.errors].map(e => ': ' + e).join(''));
  } finally { await A.close(); await B.close(); }
};

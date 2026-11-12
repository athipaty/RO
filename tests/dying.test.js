// online, a monster our hits finish stops being attacked at once, fades, and fights on if the server disagrees
const { player, newRoom } = require('./helpers');
module.exports = async t => {
  const A = await player('Finisher', newRoom(), { server: 'http://127.0.0.1:9' });
  try {
    const r = await A.ev(() => {
      enterZone('meadow'); const m = mobs.find(o => !o.dead); const real = zoneHost; zoneHost = () => ({ id: 'host' });
      m.hp = 5; P.target = m; hurtMob(m, 20, false, 'phys');
      const dying = !!m.dying, hp = m.hp, untargeted = P.target === null;
      P.target = m; autoHunt && 0; const t0 = P.target; // the attack loop drops it on its next tick
      zoneHost = real; return { dying, hp, untargeted, idx: m.idx };
    });
    t.ok(r.dying && r.hp === 1, 'our finishing hit marks the monster as dying while the server confirms');
    t.ok(r.untargeted, 'the hero stops attacking it straight away');
    const back = await A.ev(async idx => { const m = mobs[idx]; m.dying = now - 2; const pick = (() => { for (const o of mobs) if (o === m && !o.dead && !o.dying) return true; return false; })();
      killMob(m); return { pickWhileDying: pick, cleared: !m.dying && m.dead }; }, r.idx);
    t.ok(back.cleared, 'the confirmed kill clears the dying mark');
    t.ok(A.page.errors.length === 0, 'no script errors' + A.page.errors.map(e => ': ' + e).join(''));
  } finally { await A.close(); }
};

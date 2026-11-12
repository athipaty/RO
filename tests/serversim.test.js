// Server-run monsters (Stage 2b). Runs only against a local copy of the game server:
//   EMBER_SERVER=http://localhost:5055 GAME_URL=http://localhost:8080/index.html npm test -- serversim
const { player, wait, newRoom } = require('./helpers');
const world = require('../tools/embervale-world.json');

module.exports = async t => {
  if (!process.env.EMBER_SERVER) { t.ok(true, 'skipped (set EMBER_SERVER to run against a local game server)'); return; }
  const room = newRoom();
  const A = await player('SimA', room, { zone: 'meadow' });
  try {
    // the exported map the server uses must match what the browser builds
    const same = await A.ev(w => { const z = getZone('meadow'); const want = atob(w.t);
      if (want.length !== z.t.length) return false; for (let i = 0; i < z.t.length; i++) if (want.charCodeAt(i) !== z.t[i]) return false; return true; }, world.zones.meadow);
    t.ok(same, "the server's copy of the map matches the game's map exactly");

    await wait(2500);
    t.ok(await A.ev(() => serverSim() && zoneHost() === NET.srv), 'with the server running monsters, no player hosts them');
    const B = await player('SimB', room, { zone: 'meadow' });
    try {
      await wait(3000);
      t.ok(await B.ev(() => serverSim()), 'a second player also gets monsters from the server');
      const pa = await A.ev(() => mobs.map(m => [m.x, m.y])), pb = await B.ev(() => mobs.map(m => [m.x, m.y]));
      const off = Math.max(...pa.map((q, i) => Math.hypot(q[0] - pb[i][0], q[1] - pb[i][1])));
      t.ok(off < 40, `both players see the monsters in the same places (largest gap ${Math.round(off)}px)`);

      // a hit from far away is refused by the server
      const far = await B.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs[3];
        P.x = Z.spawn.x; P.y = Z.spawn.y; const away = dist(P, m); if (away < 600) { P.x = m.x + 900; P.y = m.y; }
        NET.lastSent = ''; netTick(0); await w(300); hurtMob(m, 99999, false, 'phys'); await w(1500); return { dead: m.dead, away: Math.round(dist(P, m)) }; });
      t.ok(!far.dead, `a hit reported from ${far.away}px away is refused`);

      // B kills a monster: it dies for both, B gets EXP, and the server's drops land for B only
      const kill = await B.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs[0];
        m.d.drops = m.d.drops; P.x = m.x - 25; P.y = m.y; NET.lastSent = ''; netTick(0); await w(400);
        const exp0 = P.exp + P.lv * 1e6, loot0 = loot.length; hurtMob(m, 99999, false, 'phys'); await w(2000);
        return { dead: m.dead, exp: P.exp + P.lv * 1e6 > exp0, gold: !loot.slice(loot0).some(l => l.gold > 0) }; });
      t.ok(kill.dead && await A.ev(() => mobs[0].dead), "B's kill removes the monster for both players");
      t.ok(kill.exp, 'B gets the EXP');
      t.ok(kill.gold, 'a normal monster drops no gold (loot is sold instead)');
      t.ok(await A.ev(() => loot.length === 0 && P.exp === 0), 'A, who did not hit it, gets no drops and no EXP');

      // a provoked monster chases and hits the nearest player
      await A.ev(() => { P.x = Z.spawn.x; P.y = Z.spawn.y; NET.lastSent = ''; });
      const hp0 = await B.ev(() => { const m = mobs[1]; P.x = m.x + 20; P.y = m.y; S = computeStats(); P.hp = S.maxhp; NET.lastSent = ''; netTick(0); hurtMob(m, 1, false, 'phys'); return P.hp; });
      await wait(6000);
      t.ok((await B.ev(() => P.hp)) < hp0, 'a provoked server monster chases and hits the player');

      // freezing a server-run monster holds it still for everyone, then it thaws
      const frz = await B.ev(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const m = mobs.find(x => !x.dead && x.idx > 4);
        P.x = m.x - 30; P.y = m.y; NET.lastSent = ''; netTick(0); await w(400);
        ailMob(m, 'freeze', 2); await w(600); const p0 = [m.x, m.y], seen = m.ail === 'freeze' && m.ailUntil > now; await w(1000);
        return { seen, still: Math.hypot(m.x - p0[0], m.y - p0[1]) < 1, idx: m.idx }; });
      t.ok(frz.seen && frz.still, 'a monster frozen by a skill is frozen by the server and stays still');
      t.ok(await A.ev(i => mobs[i].ail === 'freeze' || mobs[i].ailUntil > now - 3, frz.idx), 'the other player sees it frozen too');
      // the monsters keep running when the first player leaves (no host hand-over needed)
      await A.close(); await wait(2500);
      const s0 = await B.ev(() => mobs.map(m => m.x + m.y).join()); await wait(2500);
      t.ok(await B.ev(() => serverSim()) && s0 !== await B.ev(() => mobs.map(m => m.x + m.y).join()), 'monsters keep moving after the other player leaves');
      t.ok(B.page.errors.length === 0, 'no script errors' + (B.page.errors.length ? ': ' + B.page.errors.join(' | ') : ''));
    } finally { await B.close(); }
  } finally { await A.close().catch(() => {}); }
};
